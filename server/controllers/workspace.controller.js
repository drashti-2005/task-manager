
import Workspace from '../models/workspace.model.js';
import User from '../models/user.model.js';

// Create a new workspace
export const createWorkspace = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const owner = req.user._id;
    const workspace = new Workspace({ name, description, owner, members: members || [owner] });
    await workspace.save();
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all workspaces for the user
export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user._id;
    const workspaces = await Workspace.find({ $or: [ { owner: userId }, { members: userId } ] });
    res.json({ success: true, data: workspaces });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update workspace
export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;
    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { name, description, members },
      { new: true }
    );
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete workspace
export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findByIdAndDelete(id);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    res.json({ success: true, message: 'Workspace deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
