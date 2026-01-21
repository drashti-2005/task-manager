import express from 'express';
import { protect } from '../middlewares/auth.js';
import { isAdmin, preventSelfRoleChange, rateLimitAdmin } from '../middlewares/admin.js';

// Import controllers
import {
  getDashboardStats,
  getTaskAnalytics,
  getUserAnalytics,
  getProductivityReport,
  getSystemHealth,
} from '../controllers/admin.controller.js';

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  unlockUserAccount,
  deactivateUser,
  activateUser,
} from '../controllers/adminUser.controller.js';

import {
  getAllTasksAdmin,
  updateTaskAdmin,
  deleteTaskAdmin,
  reassignTask,
  bulkDeleteTasks,
  bulkUpdateTasks,
  getTaskStatsByUser,
} from '../controllers/adminTask.controller.js';

import {
  getActivityLogs,
  getUserActivityHistory,
  getEntityAuditTrail,
  getActivityLogStats,
  getFailedLogins,
} from '../controllers/activityLog.controller.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// ======================
// DASHBOARD ROUTES
// ======================
router.get('/dashboard/stats', getDashboardStats);
router.get('/system/health', getSystemHealth);

// ======================
// ANALYTICS ROUTES
// ======================
router.get('/analytics/tasks', getTaskAnalytics);
router.get('/analytics/users', getUserAnalytics);
router.get('/reports/productivity', getProductivityReport);

// ======================
// USER MANAGEMENT ROUTES
// ======================
router.get('/users', getAllUsers);
router.post('/users', rateLimitAdmin(5, 60000), createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', preventSelfRoleChange, updateUser);
router.delete('/users/:id', rateLimitAdmin(5, 60000), deleteUser);
router.post('/users/:id/reset-password', rateLimitAdmin(10, 60000), resetUserPassword);
router.post('/users/:id/unlock', unlockUserAccount);
router.post('/users/:id/deactivate', deactivateUser);
router.post('/users/:id/activate', activateUser);

// ======================
// TASK MANAGEMENT ROUTES
// ======================
router.get('/tasks', getAllTasksAdmin);
router.put('/tasks/:id', updateTaskAdmin);
router.delete('/tasks/:id', deleteTaskAdmin);
router.patch('/tasks/:id/reassign', reassignTask);
router.post('/tasks/bulk-delete', rateLimitAdmin(5, 60000), bulkDeleteTasks);
router.post('/tasks/bulk-update', rateLimitAdmin(10, 60000), bulkUpdateTasks);
router.get('/tasks/stats/by-user', getTaskStatsByUser);

// ======================
// ACTIVITY LOG ROUTES
// ======================
router.get('/activity-logs', getActivityLogs);
router.get('/activity-logs/user/:userId', getUserActivityHistory);
router.get('/activity-logs/entity/:entityType/:entityId', getEntityAuditTrail);
router.get('/activity-logs/stats', getActivityLogStats);
router.get('/activity-logs/failed-logins', getFailedLogins);

export default router;
