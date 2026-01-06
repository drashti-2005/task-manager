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
    
    // Admin can view all users' analytics (don't pass userId to get all), regular users see only their own
    const filters = {
      startDate,
      endDate
    };
    
    // Only add userId filter for non-admin users
    if (req.user.role !== 'admin') {
      filters.userId = req.user._id;
    } else if (req.query.userId) {
      // Admin can optionally filter by specific userId
      filters.userId = req.query.userId;
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
    
    // Only add userId filter for non-admin users
    if (req.user.role !== 'admin') {
      filters.userId = req.user._id;
    } else if (req.query.userId) {
      // Admin can optionally filter by specific userId
      filters.userId = req.query.userId;
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
    
    // Only add userId filter for non-admin users
    if (req.user.role !== 'admin') {
      filters.userId = req.user._id;
    } else if (req.query.userId) {
      // Admin can optionally filter by specific userId
      filters.userId = req.query.userId;
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
    
    // Only add userId filter for non-admin users
    if (req.user.role !== 'admin') {
      filters.userId = req.user._id;
    } else if (req.query.userId) {
      // Admin can optionally filter by specific userId
      filters.userId = req.query.userId;
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
    
    // Only add userId filter for non-admin users
    if (req.user.role !== 'admin') {
      filters.userId = req.user._id;
    } else if (req.query.userId) {
      // Admin can optionally filter by specific userId
      filters.userId = req.query.userId;
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
