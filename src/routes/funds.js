import express from 'express';
import axios from 'axios';
import { DEPLOY_API_ENDPOINT } from '../utils/constants.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all funds
router.get('/funds', (req, res) => {
  res.json({ 
    data: [
      { id: 1, name: 'Fund A', value: 10000 },
      { id: 2, name: 'Fund B', value: 25000 }
    ] 
  });
});

// Get fund by ID
router.get('/funds/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    data: { id, name: `Fund ${id}`, value: 10000 + (id * 5000) } 
  });
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

export default router;
