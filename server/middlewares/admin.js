import User from '../models/user.model.js';
import ActivityLog from '../models/activityLog.model.js';

/**
 * Middleware to check if user is an admin
 * Must be used after the auth middleware
 */
export const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user role is admin
    if (req.user.role !== 'admin') {
      // Log unauthorized admin access attempt
      await ActivityLog.createLog({
        action: 'ADMIN_ACCESS',
        performedBy: req.user.id,
        status: 'failed',
        errorMessage: 'Unauthorized admin access attempt',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Fetch full user details to verify account status
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if account is active
    if (!user.isActive || user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.',
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked due to security reasons.',
      });
    }

    // Log successful admin access
    await ActivityLog.createLog({
      action: 'ADMIN_ACCESS',
      performedBy: req.user.id,
      details: `Admin accessed: ${req.method} ${req.originalUrl}`,
      status: 'success',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin access',
    });
  }
};

/**
 * Middleware to check specific permissions
 * @param {Array} allowedRoles - Array of roles that can access the route
 */
export const hasPermission = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to access this resource',
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};

/**
 * Middleware to check if user can modify a resource
 * Used for ensuring users can only modify their own resources
 * @param {String} resourceKey - The key in req.params that contains the resource ID
 * @param {String} userField - The field in the resource that contains the user ID
 */
export const canModifyResource = (resourceKey = 'id', userField = 'userId') => {
  return (req, res, next) => {
    try {
      // Admins can modify any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Get resource ID from params
      const resourceUserId = req[userField];
      
      // Check if user owns the resource
      if (resourceUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to modify this resource',
        });
      }

      next();
    } catch (error) {
      console.error('Resource modification check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking resource permissions',
      });
    }
  };
};

/**
 * Middleware to prevent users from escalating their own privileges
 */
export const preventSelfRoleChange = (req, res, next) => {
  try {
    // Check if attempting to change own role
    if (req.params.id === req.user.id || req.body.userId === req.user.id) {
      if (req.body.role && req.body.role !== req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'Cannot change your own role. Please contact another administrator.',
        });
      }
    }

    next();
  } catch (error) {
    console.error('Self role change prevention error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating role change',
    });
  }
};

/**
 * Rate limiting middleware for sensitive admin operations
 * Simple in-memory rate limiter (for production, use Redis)
 */
const requestCounts = new Map();

export const rateLimitAdmin = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const key = `${req.user.id}-${req.originalUrl}`;
    const now = Date.now();
    
    const userRequests = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window has passed
    if (now > userRequests.resetTime) {
      userRequests.count = 0;
      userRequests.resetTime = now + windowMs;
    }
    
    userRequests.count++;
    requestCounts.set(key, userRequests);
    
    if (userRequests.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
    }
    
    next();
  };
};

export default {
  isAdmin,
  hasPermission,
  canModifyResource,
  preventSelfRoleChange,
  rateLimitAdmin,
};
