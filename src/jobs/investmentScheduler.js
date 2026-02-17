import cron from 'node-cron';
import InvestmentBatchJobService from '../services/InvestmentBatchJobService.js';

/**
 * Investment Scheduler
 * Configures and manages scheduled execution of investment batch jobs
 */
class InvestmentScheduler {
  constructor() {
    this.batchJobService = new InvestmentBatchJobService();
    this.scheduledTask = null;
  }

  /**
   * Start the scheduled job
   * Default: Runs every day at 2:00 AM (server time)
   * Cron format: 'minute hour day month weekday'
   * 
   * @param {string} schedule - Cron expression (default: '0 2 * * *' for 2 AM daily)
   */
  start(schedule = '0 2 * * *') {
    if (this.scheduledTask) {
      console.log('Investment scheduler is already running');
      return;
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      console.error(`Invalid cron expression: ${schedule}`);
      throw new Error('Invalid cron schedule expression');
    }

    console.log('========================================');
    console.log('Investment Batch Job Scheduler Started');
    console.log(`Schedule: ${schedule} (${this.describeCronSchedule(schedule)})`);
    console.log('========================================\n');

    // Schedule the job
    this.scheduledTask = cron.schedule(schedule, async () => {
      try {
        await this.batchJobService.execute();
      } catch (error) {
        console.error('Investment batch job execution failed:', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.SCHEDULER_TIMEZONE || 'America/New_York' // Default timezone
    });

    console.log('Investment batch job scheduler is now active\n');
  }

  /**
   * Stop the scheduled job
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Investment batch job scheduler stopped');
    }
  }

  /**
   * Run the job immediately (for testing purposes)
   */
  async runNow() {
    console.log('Running investment batch job immediately...\n');
    try {
      const result = await this.batchJobService.execute();
      return result;
    } catch (error) {
      console.error('Manual job execution failed:', error);
      throw error;
    }
  }

  /**
   * Get human-readable description of cron schedule
   */
  describeCronSchedule(schedule) {
    const commonSchedules = {
      '0 2 * * *': 'Daily at 2:00 AM',
      '0 0 * * *': 'Daily at midnight',
      '0 */6 * * *': 'Every 6 hours',
      '0 12 * * *': 'Daily at noon',
      '0 8 * * 1': 'Every Monday at 8:00 AM',
      '0 0 1 * *': 'First day of every month at midnight'
    };

    return commonSchedules[schedule] || 'Custom schedule';
  }
}

export default InvestmentScheduler;
