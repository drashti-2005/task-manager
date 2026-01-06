import mongoose from 'mongoose';

/**
 * Activity Log Schema
 * Tracks all system activities for audit trail and security monitoring
 */
const activityLogSchema = new mongoose.Schema({
  // Action type performed
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication events
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTER',
      'LOGIN_FAILED',
      'PASSWORD_RESET',
      'PASSWORD_CHANGE',
      
      // Task events
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_DELETED',
      'TASK_STATUS_CHANGED',
      'TASK_ASSIGNED',
      'TASK_BULK_DELETE',
      'TASK_BULK_UPDATE',
      
      // User management events
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_ROLE_CHANGED',
      'USER_ACTIVATED',
      'USER_DEACTIVATED',
      'USER_SUSPENDED',
      
      // Admin events
      'ADMIN_ACCESS',
      'SYSTEM_SETTINGS_CHANGED',
    ],
    index: true,
  },
  
  // User who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Target entity affected by the action
  targetEntity: {
    entityType: {
      type: String,
      enum: ['User', 'Task', 'System', 'None'],
      default: 'None',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetEntity.entityType',
    },
  },
  
  // Additional details about the action
  details: {
    type: String,
    trim: true,
  },
  
  // Changes made (for update operations)
  changes: {
    type: mongoose.Schema.Types.Mixed,
  },
  
  // IP address of the user
  ipAddress: {
    type: String,
    trim: true,
  },
  
  // User agent (browser/device info)
  userAgent: {
    type: String,
    trim: true,
  },
  
  // Status of the action
  status: {
    type: String,
    enum: ['success', 'failed', 'warning'],
    default: 'success',
  },
  
  // Error message if action failed
  errorMessage: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
activityLogSchema.index({ createdAt: -1 }); // Sort by most recent
activityLogSchema.index({ performedBy: 1, createdAt: -1 }); // User activity history
activityLogSchema.index({ action: 1, createdAt: -1 }); // Filter by action type
activityLogSchema.index({ 'targetEntity.entityType': 1, 'targetEntity.entityId': 1 }); // Entity audit trail

// Auto-delete logs older than 90 days (optional - for production systems)
// Uncomment if you want automatic log cleanup
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

/**
 * Static method to create a log entry
 * @param {Object} logData - The log data
 * @returns {Promise<ActivityLog>}
 */
activityLogSchema.statics.createLog = async function(logData) {
  try {
    const log = await this.create(logData);
    return log;
  } catch (error) {
    // Log creation should never break the main operation
    console.error('Failed to create activity log:', error.message);
    return null;
  }
};

/**
 * Static method to get user activity history
 * @param {String} userId - The user ID
 * @param {Number} limit - Number of records to fetch
 * @returns {Promise<Array>}
 */
activityLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ performedBy: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('performedBy', 'name email')
    .lean();
};

/**
 * Static method to get entity audit trail
 * @param {String} entityType - Type of entity (User, Task, etc.)
 * @param {String} entityId - The entity ID
 * @returns {Promise<Array>}
 */
activityLogSchema.statics.getEntityAuditTrail = async function(entityType, entityId) {
  return await this.find({
    'targetEntity.entityType': entityType,
    'targetEntity.entityId': entityId,
  })
    .sort({ createdAt: -1 })
    .populate('performedBy', 'name email')
    .lean();
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
