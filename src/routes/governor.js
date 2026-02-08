import express from 'express';
import WithdrawalService from '../services/WithdrawalService.js';
import TerminationService from '../services/TerminationService.js';

const router = express.Router();

// GET /api/governor/pending-approvals - Get pending approval requests
router.get('/pending-approvals', async (req, res) => {
  try {
    // Get both emergency withdrawals and terminations
    const withdrawals = await WithdrawalService.getPendingEmergencyRequests();
    const terminations = await TerminationService.getPendingTerminations();

    const approvals = [
      ...withdrawals.map(w => ({
        id: w.id,
        type: 'emergency_withdrawal',
        data: w,
      })),
      ...terminations.map(t => ({
        id: t.id,
        type: 'termination',
        data: t,
      })),
    ];

    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/governor/emergency-withdrawals/:id/approve - Approve emergency withdrawal
router.post('/emergency-withdrawals/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const request = await WithdrawalService.approveEmergencyWithdrawal(id, approvedBy);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/governor/emergency-withdrawals/:id/reject - Reject emergency withdrawal
router.post('/emergency-withdrawals/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const request = await WithdrawalService.rejectEmergencyWithdrawal(id, approvedBy);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/governor/terminations/:id/approve - Approve termination request
router.post('/terminations/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const request = await TerminationService.approveTermination(id, approvedBy);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/governor/terminations/:id/reject - Reject termination request
router.post('/terminations/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const request = await TerminationService.rejectTermination(id, approvedBy);
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
