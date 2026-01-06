import Task from '../models/task.model.js';

/**
 * Analytics Service
 * Handles all analytics-related database queries using MongoDB aggregation pipelines
 */

class AnalyticsService {
  /**
   * Get overview analytics (total tasks, completion rate, status breakdown)
   * @param {Object} options - Filter options
   * @param {String} options.userId - User ID to filter by (required for non-admin)
   * @param {Date} options.startDate - Start date for filtering
   * @param {Date} options.endDate - End date for filtering
   * @returns {Object} Overview analytics data
   */
  static async getOverviewAnalytics({ userId, startDate, endDate }) {
    const matchStage = {};
    
    // Filter by user only if userId is provided
    // If not provided (admin viewing all), don't add this filter
    if (userId) {
      matchStage.assignedTo = userId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    console.log('📊 Analytics Overview - Match Stage:', JSON.stringify(matchStage, null, 2));

    const [overview] = await Task.aggregate([
      { $match: matchStage },
      {
        $facet: {
          // Total tasks count
          totalTasks: [
            { $count: 'count' }
          ],
          // Status breakdown
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          // Priority breakdown
          priorityBreakdown: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          // Overdue tasks
          overdueTasks: [
            {
              $match: {
                dueDate: { $lt: new Date() },
                status: { $ne: 'completed' }
              }
            },
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          totalTasks: { $arrayElemAt: ['$totalTasks.count', 0] },
          completedTasks: {
            $let: {
              vars: {
                completed: {
                  $filter: {
                    input: '$statusBreakdown',
                    cond: { $eq: ['$$this._id', 'completed'] }
                  }
                }
              },
              in: { $arrayElemAt: ['$$completed.count', 0] }
            }
          },
          pendingTasks: {
            $let: {
              vars: {
                pending: {
                  $filter: {
                    input: '$statusBreakdown',
                    cond: { $eq: ['$$this._id', 'pending'] }
                  }
                }
              },
              in: { $arrayElemAt: ['$$pending.count', 0] }
            }
          },
          inProgressTasks: {
            $let: {
              vars: {
                inProgress: {
                  $filter: {
                    input: '$statusBreakdown',
                    cond: { $eq: ['$$this._id', 'in-progress'] }
                  }
                }
              },
              in: { $arrayElemAt: ['$$inProgress.count', 0] }
            }
          },
          overdueTasks: { $arrayElemAt: ['$overdueTasks.count', 0] },
          statusBreakdown: 1,
          priorityBreakdown: 1
        }
      },
      {
        $addFields: {
          // Default to 0 if undefined
          totalTasks: { $ifNull: ['$totalTasks', 0] },
          completedTasks: { $ifNull: ['$completedTasks', 0] },
          pendingTasks: { $ifNull: ['$pendingTasks', 0] },
          inProgressTasks: { $ifNull: ['$inProgressTasks', 0] },
          overdueTasks: { $ifNull: ['$overdueTasks', 0] },
          // Calculate completion rate
          completionRate: {
            $cond: {
              if: { $gt: ['$totalTasks', 0] },
              then: {
                $multiply: [
                  { $divide: ['$completedTasks', '$totalTasks'] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    console.log('✅ Analytics Overview - Raw Result:', JSON.stringify(overview, null, 2));

    return overview || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      statusBreakdown: [],
      priorityBreakdown: []
    };
  }

  /**
   * Get completion trends over time (daily/weekly)
   * @param {Object} options - Filter options
   * @param {String} options.userId - User ID to filter by
   * @param {Date} options.startDate - Start date
   * @param {Date} options.endDate - End date
   * @param {String} options.groupBy - 'day' or 'week' (default: 'day')
   * @returns {Array} Completion trends data
   */
  static async getCompletionTrends({ userId, startDate, endDate, groupBy = 'day' }) {
    const matchStage = {
      completedAt: { $exists: true, $ne: null }
    };
    
    if (userId) {
      matchStage.assignedTo = userId;
    }
    
    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) matchStage.completedAt.$gte = new Date(startDate);
      if (endDate) matchStage.completedAt.$lte = new Date(endDate);
    }

    // Determine date grouping format
    const dateFormat = groupBy === 'week' 
      ? { $dateToString: { format: '%Y-W%V', date: '$completedAt' } }
      : { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } };

    const trends = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateFormat,
          completedCount: { $sum: 1 },
          // Group by priority as well
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          mediumPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
          },
          lowPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          completed: '$completedCount',
          highPriority: 1,
          mediumPriority: 1,
          lowPriority: 1,
          _id: 0
        }
      }
    ]);

    return trends;
  }

  /**
   * Get productivity metrics (tasks created vs completed per day/week)
   * @param {Object} options - Filter options
   * @param {String} options.userId - User ID to filter by
   * @param {Date} options.startDate - Start date
   * @param {Date} options.endDate - End date
   * @param {String} options.groupBy - 'day' or 'week'
   * @returns {Array} Productivity data
   */
  static async getProductivityMetrics({ userId, startDate, endDate, groupBy = 'day' }) {
    const matchStage = {};
    
    if (userId) {
      matchStage.assignedTo = userId;
    }
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const dateFormat = groupBy === 'week'
      ? '%Y-W%V'
      : '%Y-%m-%d';

    const productivity = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          created: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                1,
                0
              ]
            }
          },
          pending: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'pending'] },
                1,
                0
              ]
            }
          },
          inProgress: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'in-progress'] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          created: 1,
          completed: 1,
          pending: 1,
          inProgress: 1,
          completionRate: {
            $cond: {
              if: { $gt: ['$created', 0] },
              then: {
                $multiply: [
                  { $divide: ['$completed', '$created'] },
                  100
                ]
              },
              else: 0
            }
          },
          _id: 0
        }
      }
    ]);

    return productivity;
  }

  /**
   * Get time analysis (average time to complete tasks)
   * @param {Object} options - Filter options
   * @param {String} options.userId - User ID to filter by
   * @param {Date} options.startDate - Start date
   * @param {Date} options.endDate - End date
   * @returns {Object} Time analysis data
   */
  static async getTimeAnalysis({ userId, startDate, endDate }) {
    const matchStage = {
      completedAt: { $exists: true, $ne: null }
    };
    
    if (userId) {
      matchStage.assignedTo = userId;
    }
    
    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) matchStage.completedAt.$gte = new Date(startDate);
      if (endDate) matchStage.completedAt.$lte = new Date(endDate);
    }

    const [timeAnalysis] = await Task.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          // Calculate completion time in hours
          completionTimeHours: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert milliseconds to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgCompletionTime: { $avg: '$completionTimeHours' },
          minCompletionTime: { $min: '$completionTimeHours' },
          maxCompletionTime: { $max: '$completionTimeHours' },
          totalCompleted: { $sum: 1 },
          // By priority
          avgHighPriority: {
            $avg: {
              $cond: [
                { $eq: ['$priority', 'high'] },
                '$completionTimeHours',
                null
              ]
            }
          },
          avgMediumPriority: {
            $avg: {
              $cond: [
                { $eq: ['$priority', 'medium'] },
                '$completionTimeHours',
                null
              ]
            }
          },
          avgLowPriority: {
            $avg: {
              $cond: [
                { $eq: ['$priority', 'low'] },
                '$completionTimeHours',
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          avgCompletionTimeHours: { $round: ['$avgCompletionTime', 2] },
          minCompletionTimeHours: { $round: ['$minCompletionTime', 2] },
          maxCompletionTimeHours: { $round: ['$maxCompletionTime', 2] },
          totalCompleted: 1,
          avgCompletionTimeDays: { $round: [{ $divide: ['$avgCompletionTime', 24] }, 2] },
          byPriority: {
            high: { $round: ['$avgHighPriority', 2] },
            medium: { $round: ['$avgMediumPriority', 2] },
            low: { $round: ['$avgLowPriority', 2] }
          }
        }
      }
    ]);

    return timeAnalysis || {
      avgCompletionTimeHours: 0,
      minCompletionTimeHours: 0,
      maxCompletionTimeHours: 0,
      avgCompletionTimeDays: 0,
      totalCompleted: 0,
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }

  /**
   * Get best performing days (days with most completions)
   * @param {Object} options - Filter options
   * @param {String} options.userId - User ID to filter by
   * @param {Date} options.startDate - Start date
   * @param {Date} options.endDate - End date
   * @param {Number} options.limit - Number of top days to return (default: 7)
   * @returns {Array} Best performing days
   */
  static async getBestPerformingDays({ userId, startDate, endDate, limit = 7 }) {
    const matchStage = {
      completedAt: { $exists: true, $ne: null }
    };
    
    if (userId) {
      matchStage.assignedTo = userId;
    }
    
    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) matchStage.completedAt.$gte = new Date(startDate);
      if (endDate) matchStage.completedAt.$lte = new Date(endDate);
    }

    const bestDays = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
            dayOfWeek: { $dayOfWeek: '$completedAt' }
          },
          completedCount: { $sum: 1 }
        }
      },
      { $sort: { completedCount: -1 } },
      { $limit: limit },
      {
        $project: {
          date: '$_id.date',
          dayOfWeek: '$_id.dayOfWeek',
          completedCount: 1,
          _id: 0
        }
      }
    ]);

    return bestDays;
  }
}

export default AnalyticsService;
