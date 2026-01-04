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
    const { title, description, status, priority, dueDate, tags } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status,
      priority,
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
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(200).json(task);
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
