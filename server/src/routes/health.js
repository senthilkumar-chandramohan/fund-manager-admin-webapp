import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

export default router;
