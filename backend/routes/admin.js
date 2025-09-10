const express = require('express');
const { createUser, getUsers, updateUser, resetPassword, deleteUser, getUserProfile, updateUserProfile, getUserDocuments } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// User management routes
router.post('/users', auditLog('CREATE_USER'), createUser);
router.get('/users', auditLog('GET_USERS'), getUsers);
router.get('/users/:id/profile', auditLog('GET_USER_PROFILE'), getUserProfile);
router.patch('/users/:id', auditLog('UPDATE_USER'), updateUser);
router.patch('/users/:id/profile', auditLog('UPDATE_USER_PROFILE'), updateUserProfile);
router.patch('/users/:id/password', auditLog('RESET_PASSWORD'), resetPassword);
router.get('/users/:id/documents', auditLog('GET_USER_DOCUMENTS'), getUserDocuments);
router.delete('/users/:id', auditLog('DELETE_USER'), deleteUser);

module.exports = router;
