const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../models/db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document and image formats
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, images, and Excel files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentId } = req.params;
    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    // Check if document exists
    const documents = await db.query(
      'SELECT id FROM documents WHERE id = ?',
      [documentId]
    );

    if (documents.length === 0) {
      // Clean up uploaded file
      await fs.unlink(filePath);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Save file attachment record
    const result = await db.query(
      'INSERT INTO file_attachments (document_id, original_name, file_name, file_path, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [documentId, originalname, filename, filePath, size, mimetype, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        attachmentId: result.insertId,
        originalName: originalname,
        fileName: filename,
        fileSize: size,
        mimeType: mimetype,
        filePath: filePath
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

const getDocumentFiles = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get files for document
    const files = await db.query(
      `SELECT fa.id, fa.original_name, fa.file_name, fa.file_size, fa.mime_type, fa.created_at,
              u.name as uploaded_by_name
       FROM file_attachments fa
       JOIN users u ON fa.uploaded_by = u.id
       WHERE fa.document_id = ?
       ORDER BY fa.created_at DESC`,
      [documentId]
    );

    res.json({
      success: true,
      message: 'Document files retrieved successfully',
      data: { files }
    });
  } catch (error) {
    console.error('Get document files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document files',
      error: error.message
    });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file information
    const files = await db.query(
      'SELECT file_path, original_name, mime_type FROM file_attachments WHERE id = ?',
      [fileId]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];

    // Check if file exists on disk
    try {
      await fs.access(file.file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type);

    // Stream file to response
    const fileStream = require('fs').createReadStream(file.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file information
    const files = await db.query(
      'SELECT file_path, document_id FROM file_attachments WHERE id = ?',
      [fileId]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];

    // Check if user has permission to delete (document creator or admin)
    const documents = await db.query(
      'SELECT created_by FROM documents WHERE id = ?',
      [file.document_id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (documents[0].created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this file'
      });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.file_path);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete file record from database
    await db.query('DELETE FROM file_attachments WHERE id = ?', [fileId]);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getDocumentFiles,
  downloadFile,
  deleteFile
};
