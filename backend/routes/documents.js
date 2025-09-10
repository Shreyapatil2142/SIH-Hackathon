const express = require('express');
const { uploadDocument, processDocument, getDocument, getDocuments, getSummary, getAllSummaries, updateDocument, deleteDocument, searchDocuments } = require('../controllers/documentController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All document routes require authentication
router.use(authenticateToken);

// Public document routes (authenticated users)
router.get('/', auditLog('GET_DOCUMENTS'), getDocuments);
router.get('/search', auditLog('SEARCH_DOCUMENTS'), searchDocuments);
router.get('/:id', auditLog('GET_DOCUMENT'), getDocument);

// Summary routes (authenticated users)
router.get('/:id/summary', auditLog('GET_SUMMARY'), getSummary);
router.get('/summaries/all', auditLog('GET_ALL_SUMMARIES'), getAllSummaries);

// Document management routes (authenticated users - permission checked in controller)
router.put('/:id', auditLog('UPDATE_DOCUMENT'), updateDocument);
router.delete('/:id', auditLog('DELETE_DOCUMENT'), deleteDocument);

// Admin-only routes
router.post('/', requireAdmin, auditLog('UPLOAD_DOCUMENT'), uploadDocument);
router.post('/:id/process', requireAdmin, auditLog('PROCESS_DOCUMENT'), processDocument);

module.exports = router;
