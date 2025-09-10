const express = require('express');
const { getTasks, updateTaskProgress, escalateTask, getTaskUpdates } = require('../controllers/taskController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// Task routes
router.get('/', auditLog('GET_TASKS'), getTasks);
router.post('/:id/progress', auditLog('UPDATE_TASK_PROGRESS'), updateTaskProgress);
router.post('/:id/escalate', auditLog('ESCALATE_TASK'), escalateTask);
router.get('/:id/updates', auditLog('GET_TASK_UPDATES'), getTaskUpdates);

module.exports = router;
