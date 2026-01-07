import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMembers,
  removeTeamMember,
} from '../controllers/team.controller.js';
import { protect, isManagerOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes can be accessed by all authenticated users
router.get('/', getAllTeams);
router.get('/:id', getTeamById);

// Modify/Delete routes require manager/admin role
router.use(isManagerOrAdmin);

router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

router.post('/:id/members', addTeamMembers);
router.delete('/:id/members/:userId', removeTeamMember);

export default router;
