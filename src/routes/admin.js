import express from 'express';
import PensionFundService from '../services/PensionFundService.js';
import InvestmentProposalService from '../services/InvestmentProposalService.js';
import InvestmentService from '../services/InvestmentService.js';
import WorkflowService from '../services/WorkflowService.js';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { contributeToPensionFund } from '../utils/blockchain.js';

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/admin/pension-funds - Create new pension fund with smart contract
router.post('/pension-funds', async (req, res) => {
  try {
    const { name, description, corpus, maturity, stablecoin, riskAppetite, contractAddress, contractDeployed, creatorId } = req.body;

    if (!name || !corpus || !maturity || !stablecoin || !contractAddress || !creatorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fund = await PensionFundService.createPensionFund({
      name,
      description,
      corpus,
      maturity,
      stablecoin,
      riskAppetite,
      contractAddress,
      contractDeployed,
      creatorId,
    });

    res.status(201).json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/pension-funds - List all pension funds
router.get('/pension-funds', async (req, res) => {
  try {
    const { status, stablecoin } = req.query;
    const funds = await PensionFundService.getAllPensionFunds({ status, stablecoin });
    res.json({ success: true, data: funds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/workflows - Create n8n workflow for pension fund
router.post('/workflows', async (req, res) => {
  try {
    const { fundId, type, n8nWorkflowId, nextRun } = req.body;

    if (!fundId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const workflow = await WorkflowService.createWorkflow({
      fundId,
      type,
      n8nWorkflowId,
      nextRun,
    });

    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/investment-proposals - List investment proposals with filters
router.get('/investment-proposals', async (req, res) => {
  try {
    const { fundId, riskLevel, status } = req.query;
    const proposals = await InvestmentProposalService.getAllProposals({ fundId, riskLevel, status });
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/investment-proposals/:id - Get single investment proposal
router.get('/investment-proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await InvestmentProposalService.getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/investments - List all investments with filters
router.get('/investments', async (req, res) => {
  try {
    const { fundId, status } = req.query;
    const investments = await InvestmentService.getAllInvestments({ fundId, status });
    res.json({ success: true, data: investments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/investments/:id - Get single investment
router.get('/investments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await InvestmentService.getInvestmentById(id);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json({ success: true, data: investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/investment-proposals/{id}/approve - Approve investment proposal
router.post('/investment-proposals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const proposal = await InvestmentProposalService.approveProposal(id, approvedBy);
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/investment-proposals/{id}/reject - Reject investment proposal
router.post('/investment-proposals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const proposal = await InvestmentProposalService.rejectProposal(id, approvedBy);
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/investment-batch - Manually trigger investment batch job
router.get('/jobs/investment-batch', async (req, res) => {
  try {
    // Import dynamically to avoid circular dependencies
    const { default: InvestmentBatchJobService } = await import('../services/InvestmentBatchJobService.js');
    const batchJobService = new InvestmentBatchJobService();
    
    console.log('Manual investment batch job triggered via API');
    const result = await batchJobService.execute();
    
    res.json({ 
      success: true, 
      message: 'Investment batch job completed successfully',
      data: result 
    });
  } catch (error) {
    console.error('Manual investment batch job failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Investment batch job failed'
    });
  }
});

// POST /api/admin/jobs/investment-divestment - Manually trigger investment divestment job
router.get('/jobs/investment-divestment', async (req, res) => {
  try {
    // Import dynamically to avoid circular dependencies
    const { default: InvestmentDivestmentService } = await import('../services/InvestmentDivestmentService.js');
    const divestmentService = new InvestmentDivestmentService();
    
    console.log('Manual investment divestment job triggered via API');
    const result = await divestmentService.execute();
    
    res.json({ 
      success: true, 
      message: 'Investment divestment job completed successfully',
      data: result 
    });
  } catch (error) {
    console.error('Manual investment divestment job failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Investment divestment job failed'
    });
  }
});

// GET /api/admin/governors - Get all governors
router.get('/governors', async (req, res) => {
  try {
    const governors = await prisma.user.findMany({
      where: { role: 'governor' },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: governors });
  } catch (error) {
    console.error('Error fetching governors:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/governors - Create a new governor
router.post('/governors', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create a new wallet for the governor
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const privateKey = wallet.privateKey;

    // Create governor user in database
    const governor = await prisma.user.create({
      data: {
        name,
        email,
        wallet: walletAddress,
        privateKey: privateKey,
        role: 'governor'
      }
    });

    res.status(201).json({ 
      success: true, 
      data: {
        id: governor.id,
        name: governor.name,
        email: governor.email,
        wallet: governor.wallet,
        role: governor.role
      }
    });
  } catch (error) {
    console.error('Error creating governor:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/pension-funds/:id/add-funds - Add funds to pension contract
router.post('/pension-funds/:id/add-funds', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get the pension fund
    const fund = await prisma.pensionFund.findUnique({
      where: { id }
    });

    if (!fund) {
      return res.status(404).json({ error: 'Pension fund not found' });
    }

    if (!fund.contractAddress) {
      return res.status(400).json({ error: 'Pension fund does not have a contract address' });
    }

    if (!fund.stablecoin) {
      return res.status(400).json({ error: 'Pension fund does not have a stablecoin configured' });
    }

    // Stablecoin address mapping
    const STABLECOIN_ADDRESSES = {
      'PYUSD': '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
      'USDC': '0xf08a50178dfcde18524640ea6618a1f965821715',
      'USDT': '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
    };

    const tokenAddress = STABLECOIN_ADDRESSES[fund.stablecoin];
    if (!tokenAddress) {
      return res.status(400).json({ error: 'Invalid stablecoin in fund configuration' });
    }

    // Initiate blockchain contribution
    console.log(`Initiating contribution of ${amount} ${fund.stablecoin} to contract ${fund.contractAddress}`);
    
    try {
      const contributionResult = await contributeToPensionFund(
        tokenAddress,
        fund.contractAddress,
        amount,
        `Admin contribution to ${fund.name}`
      );

      // Record transaction in database
      await prisma.transaction.create({
        data: {
          fundId: fund.id,
          txHash: contributionResult.contributeTxHash,
          type: 'Deposit',
          amount: amount.toString(),
          status: contributionResult.success ? 'Completed' : 'Failed'
        }
      });

      res.json({ 
        success: true, 
        message: `Successfully contributed ${amount} ${fund.stablecoin} to pension fund contract`,
        data: {
          fundId: fund.id,
          fundName: fund.name,
          contractAddress: fund.contractAddress,
          amount: amount,
          stablecoin: fund.stablecoin,
          approveTxHash: contributionResult.approveTxHash,
          contributeTxHash: contributionResult.contributeTxHash,
          blockNumber: contributionResult.blockNumber
        }
      });
    } catch (blockchainError) {
      console.error('Blockchain contribution failed:', blockchainError);
      
      // Record failed transaction
      await prisma.transaction.create({
        data: {
          fundId: fund.id,
          type: 'Deposit',
          amount: amount.toString(),
          status: 'Failed'
        }
      });

      return res.status(500).json({ 
        error: 'Blockchain contribution failed',
        details: blockchainError.message 
      });
    }
  } catch (error) {
    console.error('Error adding funds to pension contract:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
