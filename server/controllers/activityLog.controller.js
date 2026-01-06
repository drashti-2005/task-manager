import ActivityLog from '../models/activityLog.model.js';

/**
 * @desc    Get all activity logs with filtering
 * @route   GET /api/admin/activity-logs
 * @access  Private/Admin
 */
export const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      performedBy,
      entityType,
      status,
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = {};
    
    if (action) {
      query.action = action;
    }
    
    if (performedBy) {
      query.performedBy = performedBy;
    }
    
    if (entityType) {
      query['targetEntity.entityType'] = entityType;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate skip
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user activity history
 * @route   GET /api/admin/activity-logs/user/:userId
 * @access  Private/Admin
 */
export const getUserActivityHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await ActivityLog.getUserActivity(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get user activity history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity history',
      error: error.message,
    });
  }
};

/**
 * @desc    Get entity audit trail
 * @route   GET /api/admin/activity-logs/entity/:entityType/:entityId
 * @access  Private/Admin
 */
export const getEntityAuditTrail = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await ActivityLog.getEntityAuditTrail(entityType, entityId);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get entity audit trail error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entity audit trail',
      error: error.message,
    });
  }
};

/**
 * @desc    Get activity log statistics
 * @route   GET /api/admin/activity-logs/stats
 * @access  Private/Admin
 */
export const getActivityLogStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch(period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Activity by action type
    const activityByAction = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Activity by user (most active users)
    const activityByUser = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$performedBy',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          activityCount: '$count',
        },
      },
      {
        $sort: { activityCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Activity timeline
    const activityTimeline = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Failed actions
    const failedActions = await ActivityLog.countDocuments({
      status: 'failed',
      createdAt: { $gte: startDate },
    });

    res.status(200).json({
      success: true,
      data: {
        activityByAction,
        activityByUser,
        activityTimeline,
        failedActions,
      },
    });
  } catch (error) {
    console.error('Get activity log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity log statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get recent failed login attempts
 * @route   GET /api/admin/activity-logs/failed-logins
 * @access  Private/Admin
 */
export const getFailedLogins = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const failedLogins = await ActivityLog.find({
      action: 'LOGIN_FAILED',
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('performedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      data: failedLogins,
    });
  } catch (error) {
    console.error('Get failed logins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching failed login attempts',
      error: error.message,
    });
  }
};

export default {
  getActivityLogs,
  getUserActivityHistory,
  getEntityAuditTrail,
  getActivityLogStats,
  getFailedLogins,
};
