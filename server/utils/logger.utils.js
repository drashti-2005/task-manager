import ActivityLog from '../models/activityLog.model.js';

/**
 * Helper function to create activity logs
 * @param {Object} logData - The log data
 * @returns {Promise}
 */
export const createActivityLog = async (logData) => {
  try {
    return await ActivityLog.createLog(logData);
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

/**
 * Middleware to automatically log API requests
 * Only logs authenticated requests
 */
export const logAPIRequest = async (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function to capture response
  res.send = function(data) {
    // Restore original send
    res.send = originalSend;
    
    // Log the request if user is authenticated
    if (req.user) {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      
      // Only log important operations (POST, PUT, DELETE, PATCH)
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        createActivityLog({
          action: determineActionType(req),
          performedBy: req.user.id,
          details: `${req.method} ${req.originalUrl}`,
          status: isSuccess ? 'success' : 'failed',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        }).catch(err => console.error('Failed to log API request:', err));
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Determine action type based on request
 * @param {Object} req - Express request object
 * @returns {String} - Action type
 */
const determineActionType = (req) => {
  const method = req.method;
  const path = req.path.toLowerCase();
  
  // Authentication routes
  if (path.includes('/login')) return 'USER_LOGIN';
  if (path.includes('/logout')) return 'USER_LOGOUT';
  if (path.includes('/register')) return 'USER_REGISTER';
  
  // Task routes
  if (path.includes('/task')) {
    if (method === 'POST') return 'TASK_CREATED';
    if (method === 'PUT' || method === 'PATCH') return 'TASK_UPDATED';
    if (method === 'DELETE') return 'TASK_DELETED';
  }
  
  // User routes
  if (path.includes('/user')) {
    if (method === 'POST') return 'USER_CREATED';
    if (method === 'PUT' || method === 'PATCH') return 'USER_UPDATED';
    if (method === 'DELETE') return 'USER_DELETED';
  }
  
  return 'SYSTEM_SETTINGS_CHANGED';
};

/**
 * Log user login
 * @param {String} userId - User ID
 * @param {Object} req - Request object
 * @param {Boolean} success - Whether login was successful
 */
export const logLogin = async (userId, req, success = true, errorMessage = null) => {
  try {
    return await createActivityLog({
      action: success ? 'USER_LOGIN' : 'LOGIN_FAILED',
      performedBy: userId,
      status: success ? 'success' : 'failed',
      errorMessage,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Error logging login activity:', error);
    return null;
  }
};

/**
 * Log user logout
 * @param {String} userId - User ID
 * @param {Object} req - Request object
 */
export const logLogout = async (userId, req) => {
  try {
    return await createActivityLog({
      action: 'USER_LOGOUT',
      performedBy: userId,
      status: 'success',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Error logging logout activity:', error);
    return null;
  }
};

/**
 * Log task operations
 * @param {String} action - Action type
 * @param {String} userId - User ID
 * @param {String} taskId - Task ID
 * @param {Object} changes - Changes made
 * @param {Object} req - Request object
 */
export const logTaskOperation = async (action, userId, taskId, changes = null, req) => {
  return await createActivityLog({
    action,
    performedBy: userId,
    targetEntity: {
      entityType: 'Task',
      entityId: taskId,
    },
    changes,
    status: 'success',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });
};

/**
 * Log user management operations
 * @param {String} action - Action type
 * @param {String} adminId - Admin user ID
 * @param {String} targetUserId - Target user ID
 * @param {Object} changes - Changes made
 * @param {Object} req - Request object
 */
export const logUserManagement = async (action, adminId, targetUserId, changes = null, req) => {
  return await createActivityLog({
    action,
    performedBy: adminId,
    targetEntity: {
      entityType: 'User',
      entityId: targetUserId,
    },
    changes,
    status: 'success',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });
};

export default {
  createActivityLog,
  logAPIRequest,
  logLogin,
  logLogout,
  logTaskOperation,
  logUserManagement,
};
