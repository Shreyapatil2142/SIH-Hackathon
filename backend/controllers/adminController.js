const bcrypt = require('bcrypt');
const db = require('../models/db');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        userId: result.insertId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, is_active } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get users
    const users = await db.query(
      `SELECT id, name, email, role, is_active, created_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    // Check if user exists
    const users = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUsers = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }

      updates.push('email = ?');
      params.push(email);
    }

    if (role !== undefined) {
      const validRoles = ['ADMIN', 'ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
      updates.push('role = ?');
      params.push(role);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Check if user exists
    const users = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const users = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete (set is_active to false)
    await db.query(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = id || req.user.id; // Allow getting own profile or admin getting others

    // Check if user has permission (own profile or admin)
    if (userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this profile'
      });
    }

    // Get user profile
    const users = await db.query(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get user statistics
    const [docCount, taskCount] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM documents WHERE created_by = ?', [userId]),
      db.query('SELECT COUNT(*) as count FROM task_assignments WHERE assignee_user_id = ?', [userId])
    ]);

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        statistics: {
          documents_created: docCount[0].count,
          tasks_assigned: taskCount[0].count
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const userId = id || req.user.id; // Allow updating own profile or admin updating others

    // Check if user has permission (own profile or admin)
    if (userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this profile'
      });
    }

    // Check if user exists
    const users = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUsers = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }

      updates.push('email = ?');
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    params.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
};

const getUserDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userId = id || req.user.id; // Allow getting own documents or admin getting others

    // Check if user has permission (own documents or admin)
    if (userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these documents'
      });
    }

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM documents WHERE created_by = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Get user's documents
    const documents = await db.query(
      `SELECT d.id, d.title, d.file_url, d.created_at,
              COUNT(s.id) as summary_count,
              COUNT(t.id) as task_count
       FROM documents d
       LEFT JOIN summaries s ON d.id = s.document_id
       LEFT JOIN tasks t ON d.id = t.document_id
       WHERE d.created_by = ?
       GROUP BY d.id
       ORDER BY d.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [userId]
    );

    res.json({
      success: true,
      message: 'User documents retrieved successfully',
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
    console.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user documents',
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  resetPassword,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getUserDocuments
};
