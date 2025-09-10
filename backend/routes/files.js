const express = require('express');
const { upload, uploadFile, getDocumentFiles, downloadFile, deleteFile } = require('../controllers/fileController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { auditLog } = require('../middlewares/auditMiddleware');

const router = express.Router();

// All file routes require authentication
router.use(authenticateToken);

// File upload route
router.post('/documents/:documentId/upload', upload.single('file'), auditLog('UPLOAD_FILE'), uploadFile);

// File management routes
router.get('/documents/:documentId', auditLog('GET_DOCUMENT_FILES'), getDocumentFiles);
router.get('/:fileId/download', auditLog('DOWNLOAD_FILE'), downloadFile);
router.delete('/:fileId', auditLog('DELETE_FILE'), deleteFile);

module.exports = router;
