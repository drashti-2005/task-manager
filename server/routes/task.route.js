import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

export default router;
