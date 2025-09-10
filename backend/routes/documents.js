const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadDocument,
  processDocument,
  getDocument,
  getDocuments,
  getSummary,
  getAllSummaries,
  updateDocument,
  deleteDocument,
  searchDocuments
} = require('../controllers/documentController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

router.use(authenticateToken);

router.get('/', auditLog('GET_DOCUMENTS'), getDocuments);
router.get('/search', auditLog('SEARCH_DOCUMENTS'), searchDocuments);
router.get('/:id', auditLog('GET_DOCUMENT'), getDocument);
router.get('/:id/summary', auditLog('GET_SUMMARY'), getSummary);
router.get('/summaries/all', auditLog('GET_ALL_SUMMARIES'), getAllSummaries);
router.put('/:id', auditLog('UPDATE_DOCUMENT'), updateDocument);
router.delete('/:id', auditLog('DELETE_DOCUMENT'), deleteDocument);

// Upload document — Admin only
router.post(
  '/',
  requireAdmin,
  upload.single('file'),
  auditLog('UPLOAD_DOCUMENT'),
  uploadDocument
);

router.post('/:id/process', requireAdmin, auditLog('PROCESS_DOCUMENT'), processDocument);

module.exports = router;
