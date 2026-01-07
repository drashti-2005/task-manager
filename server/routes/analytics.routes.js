import express from 'express';
import {
  getOverview,
  getCompletionTrends,
  getProductivity,
  getTimeAnalysis,
  getBestDays
} from '../controllers/analytics.controller.js';
import { protect, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * All analytics routes require authentication
 * Admin users can query analytics for any user via ?userId=<id>
 * Managers can see team-wide analytics
 * Regular users can only see their own analytics
 */

// @route   GET /api/analytics/overview
// @desc    Get overview analytics (total, completed, pending, overdue, completion rate)
// @access  Private (Admin can view all, Managers see team, Users see own)
router.get('/overview', protect, getOverview);

// @route   GET /api/analytics/completion-trends
// @desc    Get completion trends over time (daily/weekly)
// @access  Private (Admin can view all, Managers see team, Users see own)
// @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day|week
router.get('/completion-trends', protect, getCompletionTrends);

// @route   GET /api/analytics/productivity
// @desc    Get productivity metrics (created vs completed)
// @access  Private (Admin can view all, Managers see team, Users see own)
// @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day|week
router.get('/productivity', protect, getProductivity);

// @route   GET /api/analytics/time-analysis
// @desc    Get time to complete tasks analysis
// @access  Private (Admin can view all, Managers see team, Users see own)
// @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/time-analysis', protect, getTimeAnalysis);

// @route   GET /api/analytics/best-days
// @desc    Get best performing days
// @access  Private (Admin can view all, Managers see team, Users see own)
// @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=7
router.get('/best-days', protect, getBestDays);

export default router;
