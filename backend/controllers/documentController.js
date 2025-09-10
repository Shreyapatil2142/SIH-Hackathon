const db = require('../models/db');
const aiService = require('../utils/aiService');

const uploadDocument = async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log("UploadDocument called");
    console.log("req.body:", req.body);       // For text fields
    console.log("req.file:", req.file);       // If using multer
    console.log("req.files:", req.files);     // If multiple files

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`; // adjust path based on static serve

    // Insert into DB
    const result = await db.query(
      "INSERT INTO documents (title, file_url, created_by) VALUES (?, ?, ?)",
      [req.body.title, req.file.path, req.user.id]
    );

    const documentId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentId,
        title,
        description: description || '',
        file_url: fileUrl,
        created_by: req.user.id
      }
    });
  } catch (error) {
    
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

const processDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document
    const documents = await db.query(
      'SELECT id, title, text FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[0];

    // Process document with AI services
    console.log('Processing document with AI services...');
    const processResult = await aiService.processDocument(document.text);

    if (!processResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Document processing failed',
        error: processResult.error
      });
    }

    const { summary_en, summary_ml, key_points, tasks } = processResult.data;

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Save summary
      const summaryResult = await db.query(
        'INSERT INTO summaries (document_id, summary_en, summary_ml, key_points_json) VALUES (?, ?, ?, ?)',
        [id, summary_en, summary_ml, JSON.stringify(key_points)]
      );

      // Save tasks
      const taskIds = [];
      for (const task of tasks) {
        const taskResult = await db.query(
          'INSERT INTO tasks (document_id, title, description_en, description_ml, due_date) VALUES (?, ?, ?, ?, ?)',
          [id, task.title, task.description_en, null, task.due_date]
        );
        
        const taskId = taskResult.insertId;
        taskIds.push(taskId);

        // Create task assignment
        await db.query(
          'INSERT INTO task_assignments (task_id, assignee_role) VALUES (?, ?)',
          [taskId, task.assigned_role]
        );
      }

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Document processed successfully',
        data: {
          documentId: id,
          summary: {
            english: summary_en,
            malayalam: summary_ml,
            key_points: key_points
          },
          tasks: tasks.map((task, index) => ({
            id: taskIds[index],
            title: task.title,
            description: task.description_en,
            due_date: task.due_date,
            assigned_role: task.assigned_role
          }))
        }
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Process document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process document'
    });
  }
};

const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document with creator info
    const documents = await db.query(`
      SELECT d.*, u.name as created_by_name, u.email as created_by_email
      FROM documents d
      JOIN users u ON d.created_by = u.id
      WHERE d.id = ?
    `, [id]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[0];

    // Get summary
    const summaries = await db.query(
      'SELECT * FROM summaries WHERE document_id = ?',
      [id]
    );

    // Get tasks with assignments
    const tasks = await db.query(`
      SELECT t.*, ta.assignee_role, ta.assignee_user_id, u.name as assignee_name
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.assignee_user_id = u.id
      WHERE t.document_id = ?
      ORDER BY t.created_at DESC
    `, [id]);

    res.json({
      success: true,
      message: 'Document retrieved successfully',
      data: {
        document: {
          id: document.id,
          title: document.title,
          file_url: document.file_url,
          text: document.text,
          created_by: {
            id: document.created_by,
            name: document.created_by_name,
            email: document.created_by_email
          },
          created_at: document.created_at
        },
        summary: summaries.length > 0 ? {
          id: summaries[0].id,
          summary_en: summaries[0].summary_en,
          summary_ml: summaries[0].summary_ml,
          key_points: summaries[0].key_points_json ? JSON.parse(summaries[0].key_points_json) : []
        } : null,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description_en: task.description_en,
          description_ml: task.description_ml,
          due_date: task.due_date,
          status: task.status,
          assigned_to: {
            role: task.assignee_role,
            user_id: task.assignee_user_id,
            user_name: task.assignee_name
          },
          created_at: task.created_at,
          updated_at: task.updated_at
        }))
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document'
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (d.title LIKE ? OR d.text LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM documents d
      ${whereClause}
    `, params);
    const total = countResult[0].total;

    // Get documents
    const documents = await db.query(`
      SELECT d.id, d.title, d.file_url, d.created_at, u.name as created_by_name
      FROM documents d
      JOIN users u ON d.created_by = u.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `, params);

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
};

const getSummary = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting summary for document ID:', id);

    // Get summary for document
    const summaries = await db.query(
      'SELECT s.*, d.title as document_title FROM summaries s JOIN documents d ON s.document_id = d.id WHERE s.document_id = ?',
      [id]
    );

    console.log('Found summaries:', summaries.length);

    if (summaries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found for this document'
      });
    }

    const summary = summaries[0];
    console.log('Summary data:', {
      id: summary.id,
      document_id: summary.document_id,
      has_summary_en: !!summary.summary_en,
      has_summary_ml: !!summary.summary_ml,
      key_points_type: typeof summary.key_points_json
    });

    res.json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        id: summary.id,
        document_id: summary.document_id,
        document_title: summary.document_title,
        summary_en: summary.summary_en,
        summary_ml: summary.summary_ml,
        key_points: Array.isArray(summary.key_points_json) ? summary.key_points_json : (summary.key_points_json ? JSON.parse(summary.key_points_json) : []),
        confidence_score: summary.confidence_score,
        processing_time_ms: summary.processing_time_ms,
        created_at: summary.created_at
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve summary',
      error: error.message
    });
  }
};

const getAllSummaries = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('Getting all summaries with params:', { page, limit, search, offset });

    // Get summaries with pagination - simplified query
    const summaries = await db.query(
      `SELECT s.id, s.document_id, d.title as document_title, 
              LEFT(s.summary_en, 200) as summary_preview, 
              s.created_at
       FROM summaries s 
       JOIN documents d ON s.document_id = d.id 
       ORDER BY s.created_at DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );

    console.log('Found summaries:', summaries.length);

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM summaries s 
       JOIN documents d ON s.document_id = d.id`
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    console.log('Total summaries:', total, 'Total pages:', totalPages);

    res.json({
      success: true,
      message: 'Summaries retrieved successfully',
      data: {
        summaries,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve summaries',
      error: error.message
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, file_url } = req.body;

    // Check if document exists
    const documents = await db.query(
      'SELECT id, created_by FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[0];

    // Check if user has permission to update (creator or admin)
    if (document.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this document'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }

    if (text !== undefined) {
      updates.push('text = ?');
      params.push(text);
    }

    if (file_url !== undefined) {
      updates.push('file_url = ?');
      params.push(file_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const documents = await db.query(
      'SELECT id, created_by FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[0];

    // Check if user has permission to delete (creator or admin)
    if (document.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document'
      });
    }

    // Start transaction to delete related data
    await db.query('START TRANSACTION');

    try {
      // Delete related summaries
      await db.query('DELETE FROM summaries WHERE document_id = ?', [id]);
      
      // Delete related tasks
      await db.query('DELETE FROM tasks WHERE document_id = ?', [id]);
      
      // Delete the document
      await db.query('DELETE FROM documents WHERE id = ?', [id]);

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

const searchDocuments = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const validSortFields = ['title', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];

    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM documents d
      JOIN users u ON d.created_by = u.id
      WHERE (d.title LIKE ? OR d.text LIKE ?)
    `, [searchTerm, searchTerm]);
    const total = countResult[0].total;

    // Get search results
    const documents = await db.query(`
      SELECT d.id, d.title, d.file_url, d.created_at,
             u.name as created_by_name, u.email as created_by_email
      FROM documents d
      JOIN users u ON d.created_by = u.id
      WHERE (d.title LIKE ? OR d.text LIKE ?)
      ORDER BY d.${sortField} ${sortOrder}
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `, [searchTerm, searchTerm]);

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        documents,
        query: q,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        sort: {
          field: sortField,
          order: sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search documents',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  processDocument,
  getDocument,
  getDocuments,
  getSummary,
  getAllSummaries,
  updateDocument,
  deleteDocument,
  searchDocuments
};
