const express = require('express');
const { createTag, getTags, updateTag, deleteTag, assignTagsToDocument, getDocumentTags } = require('../controllers/tagsController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All tag routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.post('/', requireAdmin, auditLog('CREATE_TAG'), createTag);
router.get('/', auditLog('GET_TAGS'), getTags);
router.patch('/:id', requireAdmin, auditLog('UPDATE_TAG'), updateTag);
router.delete('/:id', requireAdmin, auditLog('DELETE_TAG'), deleteTag);

// Document-tag assignment routes
router.post('/documents/:documentId', auditLog('ASSIGN_TAGS'), assignTagsToDocument);
router.get('/documents/:documentId', auditLog('GET_DOCUMENT_TAGS'), getDocumentTags);

module.exports = router;
