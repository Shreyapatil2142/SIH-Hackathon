const express = require('express');
const { getOverview, getTaskReport, getUserActivity } = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All report routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Report routes
router.get('/overview', auditLog('GET_OVERVIEW_REPORT'), getOverview);
router.get('/tasks', auditLog('GET_TASK_REPORT'), getTaskReport);
router.get('/user-activity', auditLog('GET_USER_ACTIVITY_REPORT'), getUserActivity);

module.exports = router;
