import Task from '../models/task.model.js';
import { logTaskOperation } from '../utils/logger.utils.js';

/**
 * @desc    Get all tasks (admin view) with advanced filtering
 * @route   GET /api/admin/tasks
 * @access  Private/Admin
 */
export const getAllTasksAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate skip
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all tasks admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

/**
 * @desc    Update any task (admin)
 * @route   PUT /api/admin/tasks/:id
 * @access  Private/Admin
 */
export const updateTaskAdmin = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;
    
    // Track changes for audit log
    const changes = {};
    
    if (title && title !== task.title) {
      changes.title = { from: task.title, to: title };
      task.title = title;
    }
    
    if (description && description !== task.description) {
      changes.description = { from: task.description, to: description };
      task.description = description;
    }
    
    if (status && status !== task.status) {
      changes.status = { from: task.status, to: status };
      task.status = status;
    }
    
    if (priority && priority !== task.priority) {
      changes.priority = { from: task.priority, to: priority };
      task.priority = priority;
    }
    
    if (dueDate && dueDate !== task.dueDate) {
      changes.dueDate = { from: task.dueDate, to: dueDate };
      task.dueDate = dueDate;
    }
    
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      changes.assignedTo = { from: task.assignedTo, to: assignedTo };
      task.assignedTo = assignedTo;
      
      // Log task reassignment
      await logTaskOperation('TASK_ASSIGNED', req.user.id, task._id, changes, req);
    }
    
    if (tags) {
      changes.tags = { from: task.tags, to: tags };
      task.tags = tags;
    }

    await task.save();

    // Log task update
    await logTaskOperation('TASK_UPDATED', req.user.id, task._id, changes, req);

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete any task (admin)
 * @route   DELETE /api/admin/tasks/:id
 * @access  Private/Admin
 */
export const deleteTaskAdmin = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    // Log task deletion
    await logTaskOperation('TASK_DELETED', req.user.id, task._id, null, req);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

/**
 * @desc    Reassign task to different user
 * @route   PATCH /api/admin/tasks/:id/reassign
 * @access  Private/Admin
 */
export const reassignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID to assign task',
      });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const oldAssignee = task.assignedTo;
    task.assignedTo = assignedTo;
    await task.save();

    // Log task reassignment
    await logTaskOperation(
      'TASK_ASSIGNED',
      req.user.id,
      task._id,
      { assignedTo: { from: oldAssignee, to: assignedTo } },
      req
    );

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task reassigned successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Reassign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reassigning task',
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk delete tasks
 * @route   POST /api/admin/tasks/bulk-delete
 * @access  Private/Admin
 */
export const bulkDeleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of task IDs',
      });
    }

    const result = await Task.deleteMany({ _id: { $in: taskIds } });

    // Log bulk delete
    await logTaskOperation(
      'TASK_BULK_DELETE',
      req.user.id,
      null,
      { deletedCount: result.deletedCount, taskIds },
      req
    );

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} tasks deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error('Bulk delete tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tasks',
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk update tasks
 * @route   POST /api/admin/tasks/bulk-update
 * @access  Private/Admin
 */
export const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of task IDs',
      });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide updates to apply',
      });
    }

    // Allowed fields for bulk update
    const allowedFields = ['status', 'priority', 'assignedTo'];
    const updateData = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: updateData }
    );

    // Log bulk update
    await logTaskOperation(
      'TASK_BULK_UPDATE',
      req.user.id,
      null,
      { modifiedCount: result.modifiedCount, taskIds, updates: updateData },
      req
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Bulk update tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tasks',
      error: error.message,
    });
  }
};

/**
 * @desc    Get task statistics by user
 * @route   GET /api/admin/tasks/stats/by-user
 * @access  Private/Admin
 */
export const getTaskStatsByUser = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
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
          userName: '$user.name',
          userEmail: '$user.email',
          totalTasks: 1,
          completed: 1,
          pending: 1,
          inProgress: 1,
          highPriority: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalTasks', 0] },
              0,
              { $multiply: [{ $divide: ['$completed', '$totalTasks'] }, 100] },
            ],
          },
        },
      },
      {
        $sort: { totalTasks: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get task stats by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics',
      error: error.message,
    });
  }
};

export default {
  getAllTasksAdmin,
  updateTaskAdmin,
  deleteTaskAdmin,
  reassignTask,
  bulkDeleteTasks,
  bulkUpdateTasks,
  getTaskStatsByUser,
};
