import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks,
  getTeamProductivity,
  reassignTask,
  getUsersForAssignment,
  getTeamsForAssignment,
} from '../controllers/task.controller.js';
import { protect, isManagerOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Manager-only routes
router.get('/team/productivity', isManagerOrAdmin, getTeamProductivity);
router.get('/users', isManagerOrAdmin, getUsersForAssignment);
router.get('/teams', isManagerOrAdmin, getTeamsForAssignment);
router.patch('/:id/reassign', isManagerOrAdmin, reassignTask);

// Search route (must be before /:id to avoid conflicts)
router.get('/search', searchTasks);

router.route('/')
  .get(getAllTasks)
  .post(createTask); // Users can create own tasks, managers can assign

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask); // Only managers can delete - enforced in controller

router.patch('/:id/status', updateTaskStatus);

export default router;
