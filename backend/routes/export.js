const express = require('express');
const { exportDocuments, exportSummaries } = require('../controllers/exportController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All export routes require authentication
router.use(authenticateToken);

// Export routes
router.get('/documents', auditLog('EXPORT_DOCUMENTS'), exportDocuments);
router.get('/summaries', auditLog('EXPORT_SUMMARIES'), exportSummaries);

module.exports = router;
