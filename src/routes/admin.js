import express from 'express';
import PensionFundService from '../services/PensionFundService.js';
import InvestmentProposalService from '../services/InvestmentProposalService.js';
import WorkflowService from '../services/WorkflowService.js';

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

// GET /api/admin/investment-proposals - List pending investment proposals
router.get('/investment-proposals', async (req, res) => {
  try {
    const { fundId, riskLevel } = req.query;
    const proposals = await InvestmentProposalService.getPendingProposals({ fundId, riskLevel });
    res.json({ success: true, data: proposals });
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

export default router;
