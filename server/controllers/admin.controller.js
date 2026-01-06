import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import ActivityLog from '../models/activityLog.model.js';

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);

    // Parallel aggregation queries for better performance
    const [
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      activeUsers,
      tasksCreatedToday,
      tasksCreatedThisWeek,
      recentActivity,
    ] = await Promise.all([
      // Total users count
      User.countDocuments(),
      
      // Total tasks count
      Task.countDocuments(),
      
      // Completed tasks count
      Task.countDocuments({ status: 'completed' }),
      
      // Pending tasks count
      Task.countDocuments({ status: 'pending' }),
      
      // In-progress tasks count
      Task.countDocuments({ status: 'in-progress' }),
      
      // Overdue tasks count (pending/in-progress with past due date)
      Task.countDocuments({
        status: { $in: ['pending', 'in-progress'] },
        dueDate: { $lt: now },
      }),
      
      // Active users in last 24 hours
      User.countDocuments({ lastLogin: { $gte: dayAgo } }),
      
      // Tasks created today
      Task.countDocuments({ createdAt: { $gte: today } }),
      
      // Tasks created this week
      Task.countDocuments({ createdAt: { $gte: weekAgo } }),
      
      // Recent activity (last 10 actions)
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'name email')
        .select('action performedBy createdAt status')
        .lean(),
    ]);

    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(2) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active24h: activeUsers,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
          createdToday: tasksCreatedToday,
          createdThisWeek: tasksCreatedThisWeek,
          completionRate: parseFloat(completionRate),
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get task analytics (for charts)
 * @route   GET /api/admin/analytics/tasks
 * @access  Private/Admin
 */
export const getTaskAnalytics = async (req, res) => {
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
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Task creation trend
    const taskTrend = await Task.aggregate([
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

    // Task completion trend
    const completionTrend = await Task.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Task status distribution
    const statusDistribution = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Task priority distribution
    const priorityDistribution = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        taskTrend,
        completionTrend,
        statusDistribution,
        priorityDistribution,
      },
    });
  } catch (error) {
    console.error('Get task analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task analytics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user activity analytics
 * @route   GET /api/admin/analytics/users
 * @access  Private/Admin
 */
export const getUserAnalytics = async (req, res) => {
  try {
    // Most active users (by task count)
    const mostActiveUsers = await Task.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          taskCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
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
          name: '$user.name',
          email: '$user.email',
          taskCount: 1,
          completedCount: 1,
          completionRate: {
            $cond: [
              { $eq: ['$taskCount', 0] },
              0,
              { $multiply: [{ $divide: ['$completedCount', '$taskCount'] }, 100] },
            ],
          },
        },
      },
      {
        $sort: { taskCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
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

    // User role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Active vs inactive users
    const accountStatusDistribution = await User.aggregate([
      {
        $group: {
          _id: '$accountStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        mostActiveUsers,
        registrationTrend,
        roleDistribution,
        accountStatusDistribution,
      },
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get productivity report
 * @route   GET /api/admin/reports/productivity
 * @access  Private/Admin
 */
export const getProductivityReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const matchStage = {};
    
    // Date filter
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    // User filter
    if (userId) {
      matchStage.assignedTo = userId;
    }

    const productivityData = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
          },
          averageCompletionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $subtract: ['$completedAt', '$createdAt'] },
                null,
              ],
            },
          },
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
          name: '$user.name',
          email: '$user.email',
          totalTasks: 1,
          completedTasks: 1,
          pendingTasks: 1,
          inProgressTasks: 1,
          highPriorityTasks: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalTasks', 0] },
              0,
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
            ],
          },
          averageCompletionTime: {
            $divide: ['$averageCompletionTime', 86400000], // Convert to days
          },
        },
      },
      {
        $sort: { completionRate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: productivityData,
    });
  } catch (error) {
    console.error('Get productivity report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating productivity report',
      error: error.message,
    });
  }
};

/**
 * @desc    Get system health metrics
 * @route   GET /api/admin/system/health
 * @access  Private/Admin
 */
export const getSystemHealth = async (req, res) => {
  try {
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);

    const [
      totalLogins24h,
      failedLogins24h,
      totalActivities24h,
      lockedAccounts,
      suspendedAccounts,
    ] = await Promise.all([
      ActivityLog.countDocuments({
        action: 'USER_LOGIN',
        createdAt: { $gte: dayAgo },
      }),
      ActivityLog.countDocuments({
        action: 'LOGIN_FAILED',
        createdAt: { $gte: dayAgo },
      }),
      ActivityLog.countDocuments({
        createdAt: { $gte: dayAgo },
      }),
      User.countDocuments({
        lockoutUntil: { $gt: new Date() },
      }),
      User.countDocuments({
        accountStatus: 'suspended',
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        loginActivity: {
          total: totalLogins24h,
          failed: failedLogins24h,
          successRate: totalLogins24h > 0 
            ? ((totalLogins24h - failedLogins24h) / totalLogins24h * 100).toFixed(2)
            : 100,
        },
        systemActivity: {
          totalActivities24h,
        },
        accountSecurity: {
          lockedAccounts,
          suspendedAccounts,
        },
      },
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system health metrics',
      error: error.message,
    });
  }
};

export default {
  getDashboardStats,
  getTaskAnalytics,
  getUserAnalytics,
  getProductivityReport,
  getSystemHealth,
};
