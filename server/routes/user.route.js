import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;
