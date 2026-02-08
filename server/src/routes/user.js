import express from 'express';
import PensionFundService from '../services/PensionFundService.js';
import TransactionService from '../services/TransactionService.js';
import WithdrawalService from '../services/WithdrawalService.js';
import NotificationService from '../services/NotificationService.js';
import UserPreferencesService from '../services/UserPreferencesService.js';

const router = express.Router();

// GET /api/user/:id/pension-funds - Get user's pension funds (as contributor, beneficiary, governor)
router.get('/:userId/pension-funds', async (req, res) => {
  try {
    const { userId } = req.params;
    const funds = await PensionFundService.getUserPensionFunds(userId);
    res.json({ success: true, data: funds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/pension-funds/:id - Get detailed pension fund information
router.get('/pension-funds/:fundId', async (req, res) => {
  try {
    const { fundId } = req.params;
    const fund = await PensionFundService.getPensionFundDetails(fundId);

    if (!fund) {
      return res.status(404).json({ error: 'Pension fund not found' });
    }

    res.json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/pension-funds/:id/transactions - Get transaction history
router.get('/pension-funds/:fundId/transactions', async (req, res) => {
  try {
    const { fundId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await TransactionService.getTransactionHistory(
      fundId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/user/pension-funds/:id/emergency-withdrawal - Request emergency withdrawal
router.post('/pension-funds/:fundId/emergency-withdrawal', async (req, res) => {
  try {
    const { fundId } = req.params;
    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const request = await WithdrawalService.requestEmergencyWithdrawal({
      fundId,
      userId,
      amount,
      reason,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/pension-funds/:id/emergency-withdrawals - Get emergency withdrawal history
router.get('/pension-funds/:fundId/emergency-withdrawals', async (req, res) => {
  try {
    const { fundId } = req.params;
    const requests = await WithdrawalService.getEmergencyWithdrawalHistory(fundId);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/user/pension-funds/:id/risk-appetite - Update risk appetite
router.post('/pension-funds/:fundId/risk-appetite', async (req, res) => {
  try {
    const { fundId } = req.params;
    const { riskAppetite } = req.body;

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(riskAppetite)) {
      return res.status(400).json({ error: 'Invalid risk appetite. Must be LOW, MEDIUM, or HIGH' });
    }

    const fund = await PensionFundService.updateRiskAppetite(fundId, riskAppetite);
    res.json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/notifications - Get admin notifications
router.get('/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const result = await NotificationService.getUserNotifications(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/user/notifications/:id/read - Mark notification as read
router.patch('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await NotificationService.markAsRead(notificationId);
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/preferences - Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const preferences = await UserPreferencesService.getUserPreferences(userId);
    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const { userId, emailNotifications, pushNotifications, theme, language } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const preferences = await UserPreferencesService.updateUserPreferences(userId, {
      emailNotifications,
      pushNotifications,
      theme,
      language,
    });

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
