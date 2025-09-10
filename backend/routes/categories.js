const express = require('express');
const { createCategory, getCategories, updateCategory, deleteCategory, assignCategoryToDocument, removeCategoryFromDocument } = require('../controllers/categoriesController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All category routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.post('/', requireAdmin, auditLog('CREATE_CATEGORY'), createCategory);
router.get('/', auditLog('GET_CATEGORIES'), getCategories);
router.patch('/:id', requireAdmin, auditLog('UPDATE_CATEGORY'), updateCategory);
router.delete('/:id', requireAdmin, auditLog('DELETE_CATEGORY'), deleteCategory);

// Document-category assignment routes
router.post('/:categoryId/documents/:documentId', auditLog('ASSIGN_CATEGORY'), assignCategoryToDocument);
router.delete('/:categoryId/documents/:documentId', auditLog('REMOVE_CATEGORY'), removeCategoryFromDocument);

module.exports = router;
