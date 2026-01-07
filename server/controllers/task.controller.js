import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import Team from '../models/team.model.js';

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;
    
    // Build query based on user role
    let query = {};
    
    // User: can see tasks assigned to them OR tasks in teams they're part of OR tasks they created themselves
    // Manager: can see all tasks (team tasks)
    // Admin: can see all tasks
    if (req.user.role === 'user') {
      // Find teams the user is a member of
      const userTeams = await Team.find({ members: req.user.id, isActive: true }).select('_id');
      const teamIds = userTeams.map(team => team._id);
      
      query.$or = [
        { assignedTo: req.user.id }, // Tasks assigned to user
        { assignedToTeam: { $in: teamIds } }, // Tasks assigned to user's teams
        { createdBy: req.user.id, assignmentType: 'self' }, // Tasks user created for themselves
      ];
    } else if (req.user.role === 'manager') {
      // Managers can see all tasks
    } else if (req.user.role === 'admin') {
      // Admins can see all tasks
    }
    
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
      .populate('assignedTo', 'name email role')
      .populate('assignedToTeam', 'name')
      .populate('createdBy', 'name email role');
    
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
      .populate('assignedTo', 'name email role')
      .populate('assignedToTeam', 'name members')
      .populate('createdBy', 'name email role');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Role-based access control
    // User: can view tasks assigned to them or their team or created by them
    // Manager: can view all tasks
    // Admin: can view all tasks
    if (req.user.role === 'user') {
      let hasAccess = false;
      
      // Check if assigned to user
      if (task.assignedTo && task.assignedTo._id.toString() === req.user.id) {
        hasAccess = true;
      }
      
      // Check if assigned to user's team
      if (task.assignedToTeam) {
        const team = await Team.findOne({ 
          _id: task.assignedToTeam._id, 
          members: req.user.id 
        });
        if (team) hasAccess = true;
      }
      
      // Check if created by user
      if (task.createdBy._id.toString() === req.user.id) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this task',
        });
      }
    }
    // Managers and admins can view any task
    
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
// @access  Private (Users can create own tasks, Managers can assign to others/teams)
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, tags, assignedTo, assignedToTeam } = req.body;
    
    let taskData = {
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      tags,
      createdBy: req.user.id,
    };

    // Determine assignment type
    if (req.user.role === 'user') {
      // Users can only create tasks for themselves
      taskData.assignedTo = req.user.id;
      taskData.assignmentType = 'self';
    } else if (req.user.role === 'manager' || req.user.role === 'admin') {
      // Managers can assign to individuals or teams
      if (assignedToTeam) {
        // Verify team exists
        const team = await Team.findById(assignedToTeam);
        if (!team) {
          return res.status(404).json({
            success: false,
            message: 'Team not found',
          });
        }
        taskData.assignedToTeam = assignedToTeam;
        taskData.assignmentType = 'team';
      } else if (assignedTo) {
        // Verify user exists
        const user = await User.findById(assignedTo);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }
        taskData.assignedTo = assignedTo;
        taskData.assignmentType = 'individual';
      } else {
        // Assign to self
        taskData.assignedTo = req.user.id;
        taskData.assignmentType = 'self';
      }
    }
    
    const task = await Task.create(taskData);
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('assignedToTeam', 'name members')
      .populate('createdBy', 'name email role');
    
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
    
    // Role-based access control for updates
    // Users: can only update status and add comments on their assigned tasks
    // Managers: can update any task field including reassignment
    if (req.user.role === 'user') {
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task',
        });
      }
      // Users can only update status, not reassign or change other critical fields
      const allowedFields = ['status', 'description'];
      const updateFields = Object.keys(req.body);
      const hasUnauthorizedField = updateFields.some(field => !allowedFields.includes(field));
      
      if (hasUnauthorizedField) {
        return res.status(403).json({
          success: false,
          message: 'Users can only update task status and description',
        });
      }
    }
    // Managers and admins can update any field
    
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
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');
    
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
    
    // Users can update status of their assigned tasks
    // Managers can update status of any task
    if (req.user.role === 'user') {
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task',
        });
      }
    }
    // Managers and admins can update any task status
    
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }
    
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');
    
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
// @access  Private (Manager only)
export const deleteTask = async (req, res) => {
  try {
    // Only managers can delete tasks
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can delete tasks',
      });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
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
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
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

// @desc    Get team productivity stats (Manager only)
// @route   GET /api/tasks/team/productivity
// @access  Private (Manager, Admin)
export const getTeamProductivity = async (req, res) => {
  try {
    // Only managers and admins can access
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager privileges required.',
      });
    }

    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          userName: '$user.name',
          userEmail: '$user.email',
          userRole: '$user.role',
          totalTasks: 1,
          completedTasks: 1,
          inProgressTasks: 1,
          pendingTasks: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalTasks', 0] },
              0,
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { completionRate: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reassign task to another user (Manager only)
// @route   PATCH /api/tasks/:id/reassign
// @access  Private (Manager, Admin)
export const reassignTask = async (req, res) => {
  try {
    // Only managers and admins can reassign
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can reassign tasks',
      });
    }

    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'assignedTo field is required',
      });
    }

    // Verify the user exists
    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.assignedTo = assignedTo;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users for task assignment (Manager only)
// @route   GET /api/tasks/users
// @access  Private (Manager, Admin)
export const getUsersForAssignment = async (req, res) => {
  try {
    // Only managers and admins can access
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager privileges required.',
      });
    }

    // Get all users with role 'user' only (exclude managers and admins)
    const users = await User.find({
      role: 'user'
    })
    .select('name email role isActive accountStatus')
    .sort('name');

    console.log('Found users:', users.length);
    console.log('Users data:', users);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all teams for task assignment (Manager only)
// @route   GET /api/tasks/teams
// @access  Private (Manager, Admin)
export const getTeamsForAssignment = async (req, res) => {
  try {
    // Only managers and admins can access
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager privileges required.',
      });
    }

    // Get all active teams
    const teams = await Team.find({ isActive: true })
      .select('name members')
      .populate('members', 'name email')
      .sort('name');

    res.status(200).json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
