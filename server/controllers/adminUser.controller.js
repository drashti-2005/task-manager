import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import { logUserManagement } from '../utils/logger.utils.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      accountStatus,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (accountStatus) {
      query.accountStatus = accountStatus;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    // Get task counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ assignedTo: user._id });
        const completedTaskCount = await Task.countDocuments({
          assignedTo: user._id,
          status: 'completed',
        });
        
        return {
          ...user,
          taskCount,
          completedTaskCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user statistics
    const [taskCount, completedTaskCount, pendingTaskCount] = await Promise.all([
      Task.countDocuments({ assignedTo: user._id }),
      Task.countDocuments({ assignedTo: user._id, status: 'completed' }),
      Task.countDocuments({ assignedTo: user._id, status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          taskCount,
          completedTaskCount,
          pendingTaskCount,
        },
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, accountStatus, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Track changes for audit log
    const changes = {};
    
    if (name && name !== user.name) {
      changes.name = { from: user.name, to: name };
      user.name = name;
    }
    
    if (email && email !== user.email) {
      // Check if email already exists
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      changes.email = { from: user.email, to: email };
      user.email = email;
    }
    
    if (role && role !== user.role) {
      changes.role = { from: user.role, to: role };
      user.role = role;
      
      // Log role change
      await logUserManagement(
        'USER_ROLE_CHANGED',
        req.user.id,
        user._id,
        changes,
        req
      );
    }
    
    if (accountStatus && accountStatus !== user.accountStatus) {
      changes.accountStatus = { from: user.accountStatus, to: accountStatus };
      user.accountStatus = accountStatus;
      
      // Log account status change
      const action = accountStatus === 'suspended' ? 'USER_SUSPENDED' : 
                     accountStatus === 'active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
      await logUserManagement(action, req.user.id, user._id, changes, req);
    }
    
    if (typeof isActive !== 'undefined' && isActive !== user.isActive) {
      changes.isActive = { from: user.isActive, to: isActive };
      user.isActive = isActive;
    }

    await user.save();

    // Log user update
    await logUserManagement('USER_UPDATED', req.user.id, user._id, changes, req);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    // Delete or reassign user's tasks (optional - depends on business logic)
    // Option 1: Delete all tasks
    await Task.deleteMany({ assignedTo: user._id });
    
    // Option 2: Reassign to admin (uncomment if preferred)
    // await Task.updateMany(
    //   { assignedTo: user._id },
    //   { assignedTo: req.user.id }
    // );

    await user.deleteOne();

    // Log user deletion
    await logUserManagement('USER_DELETED', req.user.id, user._id, null, req);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

/**
 * @desc    Reset user password
 * @route   POST /api/admin/users/:id/reset-password
 * @access  Private/Admin
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastPasswordChange = new Date();
    
    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;

    await user.save();

    // Log password reset
    await logUserManagement('PASSWORD_RESET', req.user.id, user._id, null, req);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

/**
 * @desc    Unlock user account
 * @route   POST /api/admin/users/:id/unlock
 * @access  Private/Admin
 */
export const unlockUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    
    await user.save();

    // Log unlock
    await logUserManagement('USER_ACTIVATED', req.user.id, user._id, null, req);

    res.status(200).json({
      success: true,
      message: 'User account unlocked successfully',
    });
  } catch (error) {
    console.error('Unlock account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unlocking user account',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new user (Admin)
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Log user creation
    await logUserManagement('USER_CREATED', req.user.id, user._id, null, req);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  unlockUserAccount,
  createUser,
};
