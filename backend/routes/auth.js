const express = require('express');
const { login, logout, getProfile } = require('../controllers/authController');
const { getUserProfile, updateUserProfile, getUserDocuments } = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// Public routes
router.post('/login', auditLog('USER_LOGIN'), login);
router.post('/logout', auditLog('USER_LOGOUT'), logout);

// Protected routes
router.get('/profile', authenticateToken, auditLog('GET_PROFILE'), getProfile);
router.get('/profile/detailed', authenticateToken, auditLog('GET_USER_PROFILE'), getUserProfile);
router.patch('/profile', authenticateToken, auditLog('UPDATE_USER_PROFILE'), updateUserProfile);
router.get('/profile/documents', authenticateToken, auditLog('GET_USER_DOCUMENTS'), getUserDocuments);

module.exports = router;
