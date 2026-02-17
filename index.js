import express from 'express';
import cors from 'cors';
import { registerRoutes } from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register all routes
registerRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize Investment Batch Job Scheduler
import InvestmentScheduler from './src/jobs/investmentScheduler.js';
const investmentScheduler = new InvestmentScheduler();

// Start scheduler with custom schedule from environment variable
// Default: '0 2 * * *' (2:00 AM daily)
const INVESTMENT_JOB_SCHEDULE = process.env.INVESTMENT_JOB_SCHEDULE || '0 2 * * *';

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Start the investment batch job scheduler
  try {
    investmentScheduler.start(INVESTMENT_JOB_SCHEDULE);
  } catch (error) {
    console.error('Failed to start investment scheduler:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  investmentScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  investmentScheduler.stop();
  process.exit(0);
});
