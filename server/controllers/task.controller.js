import Task from '../models/task.model.js';

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;
    
    // Build query
    const query = { assignedTo: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    // Build sort
    let sort = {};
    if (sortBy === 'dueDate') {
      sort.dueDate = 1;
    } else if (sortBy === 'priority') {
      sort.priority = -1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }
    
    const tasks = await Task.find(query)
      .sort(sort)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if user has access to this task
    if (task.assignedTo._id.toString() !== req.user.id && 
        task.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, tags } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      tags,
      assignedTo: req.user.id, // Assign to self by default
      createdBy: req.user.id,
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if user has access to update this task
    if (task.assignedTo.toString() !== req.user.id && 
        task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }
    
    // Update task fields
    Object.assign(task, req.body);
    
    // Set completedAt timestamp if status is being changed to completed
    if (req.body.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    }
    
    // Clear completedAt if status is changed from completed to something else
    if (req.body.status && req.body.status !== 'completed' && task.completedAt) {
      task.completedAt = null;
    }
    
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if user has access to update this task
    if (task.assignedTo.toString() !== req.user.id && 
        task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }
    
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if user has access to delete this task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Advanced search and filter tasks
// @route   GET /api/tasks/search
// @access  Private
export const searchTasks = async (req, res) => {
  try {
    const {
      q,           // Search query (text search)
      priority,    // Filter by priority
      status,      // Filter by status
      startDate,   // Date range start
      endDate,     // Date range end
      page = 1,    // Pagination
      limit = 20,  // Results per page
      sortBy = 'createdAt', // Sort field
      sortOrder = 'desc'    // Sort order
    } = req.query;

    // Build base query - user can only search their own tasks
    // Admin can search all tasks (check if user role is admin)
    let baseQuery = {};
    
    if (req.user.role !== 'admin') {
      baseQuery.assignedTo = req.user.id;
    }

    // Text search using MongoDB text index
    if (q && q.trim()) {
      baseQuery.$text = { $search: q.trim() };
    }

    // Priority filter
    if (priority) {
      const priorities = priority.split(',').map(p => p.toLowerCase());
      if (priorities.length === 1) {
        baseQuery.priority = priorities[0];
      } else {
        baseQuery.priority = { $in: priorities };
      }
    }

    // Status filter
    if (status) {
      const statuses = status.split(',').map(s => s.toLowerCase());
      if (statuses.length === 1) {
        baseQuery.status = statuses[0];
      } else {
        baseQuery.status = { $in: statuses };
      }
    }

    // Date range filter (dueDate)
    if (startDate || endDate) {
      baseQuery.dueDate = {};
      if (startDate) {
        baseQuery.dueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        baseQuery.dueDate.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sortObj = {};
    
    // If text search, include textScore for relevance sorting
    if (q && q.trim()) {
      sortObj.score = { $meta: 'textScore' };
    }
    
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Projection - return only necessary fields for performance
    const projection = q && q.trim() 
      ? { score: { $meta: 'textScore' } } 
      : {};

    // Execute query with pagination
    const tasks = await Task.find(baseQuery, projection)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Task.countDocuments(baseQuery);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        q: q || null,
        priority: priority || null,
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
