import cron from 'node-cron';
import PensionReleaseService from '../services/PensionReleaseService.js';

/**
 * Pension Release Scheduler
 * Configures and manages scheduled execution of pension release batch jobs
 */
class PensionReleaseScheduler {
  constructor() {
    this.releaseService = new PensionReleaseService();
    this.scheduledTask = null;
  }

  /**
   * Start the scheduled job
   * Default: Runs every day at 4:00 AM (server time)
   * Cron format: 'minute hour day month weekday'
   * 
   * @param {string} schedule - Cron expression (default: '0 4 * * *' for 4 AM daily)
   */
  start(schedule = '0 4 * * *') {
    if (this.scheduledTask) {
      console.log('Pension release scheduler is already running');
      return;
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      console.error(`Invalid cron expression: ${schedule}`);
      throw new Error('Invalid cron schedule expression');
    }

    console.log('========================================');
    console.log('Pension Release Scheduler Started');
    console.log(`Schedule: ${schedule} (${this.describeCronSchedule(schedule)})`);
    console.log('========================================\n');

    // Schedule the job
    this.scheduledTask = cron.schedule(schedule, async () => {
      try {
        await this.releaseService.execute();
      } catch (error) {
        console.error('Pension release job execution failed:', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.SCHEDULER_TIMEZONE || 'America/New_York' // Default timezone
    });

    console.log('Pension release scheduler is now active\n');
  }

  /**
   * Stop the scheduled job
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Pension release scheduler stopped');
    }
  }

  /**
   * Run the job immediately (for testing or on-demand execution)
   */
  async runNow() {
    console.log('Running pension release job immediately...\n');
    try {
      const result = await this.releaseService.execute();
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
      '0 4 * * *': 'Daily at 4:00 AM',
      '0 0 * * *': 'Daily at midnight',
      '0 2 * * *': 'Daily at 2:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '0 12 * * *': 'Daily at noon',
      '0 8 * * 1': 'Every Monday at 8:00 AM',
      '0 0 1 * *': 'First day of every month at midnight'
    };

    return commonSchedules[schedule] || 'Custom schedule';
  }
}

export default PensionReleaseScheduler;
