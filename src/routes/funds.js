import express from 'express';
import axios from 'axios';
import { DEPLOY_API_ENDPOINT } from '../utils/constants.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all funds
router.get('/funds', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    // Build where clause
    const where = {};
    
    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Filter by maturity status
    if (status && status !== 'All') {
      const now = new Date();
      if (status === 'Active') {
        where.maturity = {
          gt: now
        };
      } else if (status === 'Matured') {
        where.maturity = {
          lte: now
        };
      }
    }
    
    const funds = await prisma.pensionFund.findMany({
      where,
      include: {
        beneficiaries: true,
        _count: {
          select: { beneficiaries: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the response with computed fields
    const formattedFunds = funds.map(fund => ({
      id: fund.id,
      name: fund.name,
      description: fund.description,
      contractAddress: fund.contractAddress,
      maturity: fund.maturity,
      riskAppetite: fund.riskAppetite,
      reserveAmount: fund.reserveAmount,
      investmentDuration: fund.investmentDuration,
      status: new Date(fund.maturity) > new Date() ? 'Active' : 'Matured',
      beneficiaries: fund._count.beneficiaries,
      createdAt: fund.createdAt,
      updatedAt: fund.updatedAt
    }));
    
    res.json({ data: formattedFunds });
  } catch (error) {
    console.error('Error fetching funds:', error);
    res.status(500).json({ message: 'An error occurred while fetching funds', error: error.message });
  }
});

// Get fund by ID
router.get('/funds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const fund = await prisma.pensionFund.findUnique({
      where: { id },
      include: {
        beneficiaries: true,
        investmentProposals: true,
        workflows: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { beneficiaries: true }
        }
      }
    });
    
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }
    
    // Format the response
    const formattedFund = {
      id: fund.id,
      name: fund.name,
      description: fund.description,
      contractAddress: fund.contractAddress,
      maturity: fund.maturity,
      riskAppetite: fund.riskAppetite,
      reserveAmount: fund.reserveAmount,
      investmentDuration: fund.investmentDuration,
      status: new Date(fund.maturity) > new Date() ? 'Active' : 'Matured',
      beneficiaries: fund.beneficiaries,
      beneficiaryCount: fund._count.beneficiaries,
      investmentProposals: fund.investmentProposals,
      workflows: fund.workflows,
      transactions: fund.transactions,
      createdAt: fund.createdAt,
      updatedAt: fund.updatedAt
    };
    
    res.json({ data: formattedFund });
  } catch (error) {
    console.error('Error fetching fund:', error);
    res.status(500).json({ message: 'An error occurred while fetching fund', error: error.message });
  }
});

// Create new fund
router.post('/funds', async (req, res) => {
  try {
    const { contract, other } = req.body;

    console.log(contract);
    console.log(other);

    // Call the /deploy API endpoint
    const deployResponse = await axios.post(DEPLOY_API_ENDPOINT, contract);

    console.log(deployResponse.status);
    console.log(deployResponse.data.contractAddress);

    if (deployResponse.status === 201 && deployResponse.data.contractAddress) {
      const contractAddress = deployResponse.data.contractAddress;
      console.log(contractAddress);

      console.log(contract.fundMaturityDate);
      // Persist fund details in the database
      const maturityDate = new Date(parseInt(contract.fundMaturityDate+"000"));
      if (Number.isNaN(maturityDate.getTime())) {
        return res.status(400).json({ message: 'Invalid maturityDate provided' });
      }

      const fund = await prisma.pensionFund.create({
        data: {
          name: contract.causeName,
          description: contract.causeDescription,
          maturity: maturityDate,
          contractAddress,
          riskAppetite: other.riskAppetite,
          reserveAmount: other.reserveAmount,
          investmentDuration: other.investmentDuration,
        },
      });
      console.log(fund);

      // Persist beneficiaries in the database
      const beneficiaryPromises = other.beneficiaries.map((beneficiary) =>
        prisma.beneficiary.create({
          data: {
            name: beneficiary.name,
            email: beneficiary.email,
            relationship: beneficiary.relationship,
            share: beneficiary.share,
            fundId: fund.id,
            walletAddress: beneficiary.address,
            walletPrivateKey: beneficiary.privateKey,
          },
        })
      );

      await Promise.all(beneficiaryPromises);

      res.status(201).json({ message: 'Fund and beneficiaries created successfully', fund });
    } else {
      res.status(500).json({ message: 'Failed to deploy contract', error: deployResponse.data });
    }
  } catch (error) {
    console.error('Error creating fund:', error);
    res.status(500).json({ message: 'An error occurred while creating the fund', error: error.message });
  }
});

// Update fund
router.put('/funds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, riskAppetite, investmentDuration, reserveAmount } = req.body;

    console.log(req.body);

    // Check if fund exists
    const existingFund = await prisma.pensionFund.findUnique({
      where: { id }
    });

    console.log(existingFund);

    if (!existingFund) {
      return res.status(404).json({ message: 'Fund not found' });
    }

    // Build update data object (only include fields that are provided)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (riskAppetite !== undefined) updateData.riskAppetite = riskAppetite;
    if (investmentDuration !== undefined) updateData.investmentDuration = investmentDuration;
    if (reserveAmount !== undefined) updateData.reserveAmount = reserveAmount;
    console.log("Updating...");
    // Update the fund
    const updatedFund = await prisma.pensionFund.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Fund updated successfully', fund: updatedFund });
  } catch (error) {
    console.error('Error updating fund:', error);
    res.status(500).json({ message: 'An error occurred while updating the fund', error: error.message });
  }
});

export default router;
