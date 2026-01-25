import express from 'express';
import { createWorkspace, getUserWorkspaces, updateWorkspace, deleteWorkspace } from '../controllers/workspace.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
// router.use(protect);
// app.use('/api/workspaces', workspaceRoutes);

// Create workspace
router.post('/', protect,createWorkspace);
// Get all workspaces for user
router.get('/', protect,getUserWorkspaces);
// Update workspace
router.put('/:id',protect, updateWorkspace);
// Delete workspace
router.delete('/:id',protect, deleteWorkspace);

export default router;
