import healthRoutes from './health.js';
import fundsRoutes from './funds.js';
import adminRoutes from './admin.js';
import userRoutes from './user.js';
import governorRoutes from './governor.js';
import emergencyWithdrawalsRoutes from './emergencyWithdrawals.js';

export const registerRoutes = (app) => {
  // Health check
  app.use('/api', healthRoutes);
  
  // Legacy funds endpoint
  app.use('/api', fundsRoutes);
  
  // Admin endpoints
  app.use('/api/admin', adminRoutes);
  
  // User endpoints
  app.use('/api/user', userRoutes);
  
  // Governor endpoints
  app.use('/api/governor', governorRoutes);
  
  // Emergency withdrawals endpoints
  app.use('/api/admin', emergencyWithdrawalsRoutes);
};
