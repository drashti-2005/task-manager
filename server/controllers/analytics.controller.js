import AnalyticsService from '../utils/analyticsService.js';

/**
 * Analytics Controller
 * Handles analytics-related HTTP requests
 */

/**
 * @desc    Get overview analytics (total tasks, completion rate, status breakdown)
 * @route   GET /api/analytics/overview
 * @access  Private
 */
export const getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Role-based filtering:
    // Admin: can view all users' analytics
    // Manager: can view team-wide analytics
    // User: can only view their own analytics
    const filters = {
      startDate,
      endDate
    };
    
    if (req.user.role === 'user') {
      // Users can only see their own data
      filters.userId = req.user._id;
    } else if (req.user.role === 'manager') {
      // Managers see all tasks (team-wide) unless they specify a userId
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
      // Otherwise, no userId filter - shows all tasks
    } else if (req.user.role === 'admin') {
      // Admins see all tasks unless they specify a userId
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    }

    const analytics = await AnalyticsService.getOverviewAnalytics(filters);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting overview analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get completion trends (daily/weekly task completions)
 * @route   GET /api/analytics/completion-trends
 * @access  Private
 */
export const getCompletionTrends = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Validate groupBy parameter
    if (!['day', 'week'].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid groupBy parameter. Must be "day" or "week"'
      });
    }

    const filters = {
      startDate,
      endDate,
      groupBy
    };
    
    // Role-based filtering
    if (req.user.role === 'user') {
      filters.userId = req.user._id;
    } else if (req.user.role === 'manager') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    } else if (req.user.role === 'admin') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    }

    const trends = await AnalyticsService.getCompletionTrends(filters);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error getting completion trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completion trends',
      error: error.message
    });
  }
};

/**
 * @desc    Get productivity metrics (created vs completed tasks)
 * @route   GET /api/analytics/productivity
 * @access  Private
 */
export const getProductivity = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Validate groupBy parameter
    if (!['day', 'week'].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid groupBy parameter. Must be "day" or "week"'
      });
    }

    const filters = {
      startDate,
      endDate,
      groupBy
    };
    
    // Role-based filtering
    if (req.user.role === 'user') {
      filters.userId = req.user._id;
    } else if (req.user.role === 'manager') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    } else if (req.user.role === 'admin') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    }

    const productivity = await AnalyticsService.getProductivityMetrics(filters);

    res.status(200).json({
      success: true,
      data: productivity
    });
  } catch (error) {
    console.error('Error getting productivity metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch productivity metrics',
      error: error.message
    });
  }
};

/**
 * @desc    Get time analysis (average time to complete tasks)
 * @route   GET /api/analytics/time-analysis
 * @access  Private
 */
export const getTimeAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = {
      startDate,
      endDate
    };
    
    // Role-based filtering
    if (req.user.role === 'user') {
      filters.userId = req.user._id;
    } else if (req.user.role === 'manager') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    } else if (req.user.role === 'admin') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    }

    const timeAnalysis = await AnalyticsService.getTimeAnalysis(filters);

    res.status(200).json({
      success: true,
      data: timeAnalysis
    });
  } catch (error) {
    console.error('Error getting time analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get best performing days
 * @route   GET /api/analytics/best-days
 * @access  Private
 */
export const getBestDays = async (req, res) => {
  try {
    const { startDate, endDate, limit = 7 } = req.query;
    
    const filters = {
      startDate,
      endDate,
      limit: parseInt(limit)
    };
    
    // Role-based filtering
    if (req.user.role === 'user') {
      filters.userId = req.user._id;
    } else if (req.user.role === 'manager') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    } else if (req.user.role === 'admin') {
      if (req.query.userId) {
        filters.userId = req.query.userId;
      }
    }

    const bestDays = await AnalyticsService.getBestPerformingDays(filters);

    res.status(200).json({
      success: true,
      data: bestDays
    });
  } catch (error) {
    console.error('Error getting best performing days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best performing days',
      error: error.message
    });
  }
};
