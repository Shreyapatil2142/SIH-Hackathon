const db = require('../models/db');

const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Check if tag already exists
    const existingTags = await db.query(
      'SELECT id FROM document_tags WHERE name = ?',
      [name]
    );

    if (existingTags.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    // Create tag
    const result = await db.query(
      'INSERT INTO document_tags (name, color) VALUES (?, ?)',
      [name, color || '#6B7280']
    );

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: {
        tagId: result.insertId,
        name,
        color: color || '#6B7280'
      }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
};

const getTags = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM document_tags ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get tags
    const tags = await db.query(
      `SELECT id, name, color, created_at, updated_at 
       FROM document_tags ${whereClause} 
       ORDER BY name ASC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    res.json({
      success: true,
      message: 'Tags retrieved successfully',
      data: {
        tags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tags',
      error: error.message
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Check if tag exists
    const tags = await db.query(
      'SELECT id FROM document_tags WHERE id = ?',
      [id]
    );

    if (tags.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      // Check if name is already taken by another tag
      const existingTags = await db.query(
        'SELECT id FROM document_tags WHERE name = ? AND id != ?',
        [name, id]
      );

      if (existingTags.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tag name already taken'
        });
      }

      updates.push('name = ?');
      params.push(name);
    }

    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE document_tags SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Tag updated successfully'
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tag',
      error: error.message
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const tags = await db.query(
      'SELECT id FROM document_tags WHERE id = ?',
      [id]
    );

    if (tags.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check if tag is being used by any documents
    const documentCount = await db.query(
      'SELECT COUNT(*) as count FROM document_tag_relations WHERE tag_id = ?',
      [id]
    );

    if (documentCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete tag that is assigned to documents'
      });
    }

    // Delete tag
    await db.query('DELETE FROM document_tags WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tag',
      error: error.message
    });
  }
};

const assignTagsToDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tag IDs array is required'
      });
    }

    // Check if document exists
    const documents = await db.query(
      'SELECT id FROM documents WHERE id = ?',
      [documentId]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if all tags exist
    const placeholders = tagIds.map(() => '?').join(',');
    const existingTags = await db.query(
      `SELECT id FROM document_tags WHERE id IN (${placeholders})`,
      tagIds
    );

    if (existingTags.length !== tagIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more tags not found'
      });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Remove existing tag assignments
      await db.query(
        'DELETE FROM document_tag_relations WHERE document_id = ?',
        [documentId]
      );

      // Add new tag assignments
      for (const tagId of tagIds) {
        await db.query(
          'INSERT INTO document_tag_relations (document_id, tag_id) VALUES (?, ?)',
          [documentId, tagId]
        );
      }

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Tags assigned to document successfully'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Assign tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tags to document',
      error: error.message
    });
  }
};

const getDocumentTags = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get tags for document
    const tags = await db.query(
      `SELECT t.id, t.name, t.color 
       FROM document_tags t
       JOIN document_tag_relations tr ON t.id = tr.tag_id
       WHERE tr.document_id = ?
       ORDER BY t.name ASC`,
      [documentId]
    );

    res.json({
      success: true,
      message: 'Document tags retrieved successfully',
      data: { tags }
    });
  } catch (error) {
    console.error('Get document tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document tags',
      error: error.message
    });
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  assignTagsToDocument,
  getDocumentTags
};
