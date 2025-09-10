const db = require('../models/db');

const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategories = await db.query(
      'SELECT id FROM document_categories WHERE name = ?',
      [name]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create category
    const result = await db.query(
      'INSERT INTO document_categories (name, description, color) VALUES (?, ?, ?)',
      [name, description || null, color || '#3B82F6']
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        categoryId: result.insertId,
        name,
        description,
        color: color || '#3B82F6'
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM document_categories ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get categories
    const categories = await db.query(
      `SELECT id, name, description, color, created_at, updated_at 
       FROM document_categories ${whereClause} 
       ORDER BY name ASC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Check if category exists
    const categories = await db.query(
      'SELECT id FROM document_categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      // Check if name is already taken by another category
      const existingCategories = await db.query(
        'SELECT id FROM document_categories WHERE name = ? AND id != ?',
        [name, id]
      );

      if (existingCategories.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Category name already taken'
        });
      }

      updates.push('name = ?');
      params.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
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
      `UPDATE document_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categories = await db.query(
      'SELECT id FROM document_categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is being used by any documents
    const documentCount = await db.query(
      'SELECT COUNT(*) as count FROM document_category_relations WHERE category_id = ?',
      [id]
    );

    if (documentCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is assigned to documents'
      });
    }

    // Delete category
    await db.query('DELETE FROM document_categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

const assignCategoryToDocument = async (req, res) => {
  try {
    const { documentId, categoryId } = req.params;

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

    // Check if category exists
    const categories = await db.query(
      'SELECT id FROM document_categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if assignment already exists
    const existingAssignments = await db.query(
      'SELECT document_id FROM document_category_relations WHERE document_id = ? AND category_id = ?',
      [documentId, categoryId]
    );

    if (existingAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category already assigned to this document'
      });
    }

    // Create assignment
    await db.query(
      'INSERT INTO document_category_relations (document_id, category_id) VALUES (?, ?)',
      [documentId, categoryId]
    );

    res.json({
      success: true,
      message: 'Category assigned to document successfully'
    });
  } catch (error) {
    console.error('Assign category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign category to document',
      error: error.message
    });
  }
};

const removeCategoryFromDocument = async (req, res) => {
  try {
    const { documentId, categoryId } = req.params;

    // Remove assignment
    const result = await db.query(
      'DELETE FROM document_category_relations WHERE document_id = ? AND category_id = ?',
      [documentId, categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Category removed from document successfully'
    });
  } catch (error) {
    console.error('Remove category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove category from document',
      error: error.message
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  assignCategoryToDocument,
  removeCategoryFromDocument
};
