import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private (Manager, Admin)
export const getAllTeams = async (req, res) => {
  try {
    console.log('=== GET ALL TEAMS START ===');
    
    const teams = await Team.find()
      .populate('members', 'name email role')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    console.log('Teams found:', teams.length);
    console.log('Teams data:', JSON.stringify(teams, null, 2));

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error('Error in getAllTeams:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private (Manager, Admin)
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Manager, Admin)
export const createTeam = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    console.log('=== CREATE TEAM START ===');
    console.log('Request body:', req.body);
    console.log('Members received:', members);
    console.log('Members type:', typeof members, 'Is array:', Array.isArray(members));
    console.log('Members length:', members?.length);

    // Convert member IDs to ObjectIds if they're strings
    const memberIds = members && members.length > 0 
      ? members.map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id)
      : [];

    console.log('Converted member IDs:', memberIds);
    console.log('Member IDs type:', memberIds.map(id => typeof id));

    const teamData = {
      name,
      description,
      members: memberIds,
      createdBy: req.user.id,
    };

    console.log('Creating team with data:', teamData);

    const team = await Team.create(teamData);

    console.log('Team created successfully!');
    console.log('Team ID:', team._id);
    console.log('Team members field:', team.members);
    console.log('Team members length:', team.members?.length);

    console.log('Team created successfully!');
    console.log('Team ID:', team._id);
    console.log('Team members field:', team.members);
    console.log('Team members length:', team.members?.length);

    console.log('Fetching team data...');
    const createdTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    console.log('Final team data:', JSON.stringify(createdTeam, null, 2));
    console.log('=== CREATE TEAM END ===');

    res.status(201).json({
      success: true,
      data: createdTeam,
    });
  } catch (error) {
    console.error('Error creating team:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists. Please choose a different name.',
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating team',
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Manager, Admin)
export const updateTeam = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Verify all members exist if updating members
    if (members && members.length > 0) {
      console.log('Updating team with members:', members);
      console.log('Members count:', members.length);
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (members) team.members = members;

    console.log('Team before save:', { name: team.name, members: team.members });

    await team.save();

    console.log('Team saved successfully');

    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    console.log('Updated team data:', updatedTeam);

    res.status(200).json({
      success: true,
      data: updatedTeam,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete team (soft delete)
// @route   DELETE /api/teams/:id
// @access  Private (Manager, Admin)
export const deleteTeam = async (req, res) => {
  try {
    console.log('Deleting team with ID:', req.params.id);
    
    const team = await Team.findById(req.params.id);

    if (!team) {
      console.log('Team not found');
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    console.log('Team found, deleting:', team.name);
    await Team.findByIdAndDelete(req.params.id);
    console.log('Team deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add members to team
// @route   POST /api/teams/:id/members
// @access  Private (Manager, Admin)
export const addTeamMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required',
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Verify users exist
    const users = await User.find({ 
      _id: { $in: userIds }
    });

    console.log('addTeamMembers - Requested users:', userIds);
    console.log('addTeamMembers - Found users:', users.length);

    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: `Only found ${users.length} out of ${userIds.length} users`,
      });
    }

    // Add only new members
    userIds.forEach(userId => {
      if (!team.members.includes(userId)) {
        team.members.push(userId);
      }
    });

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Manager, Admin)
export const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    team.members = team.members.filter(memberId => memberId.toString() !== userId);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
