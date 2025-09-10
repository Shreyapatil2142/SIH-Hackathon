const db = require('../models/db');

const getTasks = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filter by user's role if not admin
    if (req.user.role !== 'ADMIN') {
      whereClause += ' AND (ta.assignee_role = ? OR ta.assignee_user_id = ?)';
      params.push(req.user.role, req.user.id);
    } else if (role) {
      whereClause += ' AND ta.assignee_role = ?';
      params.push(role);
    }

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      ${whereClause}
    `, params);
    const total = countResult[0].total;

    // Get tasks
    const tasks = await db.query(`
      SELECT 
        t.id, t.title, t.description_en, t.description_ml, t.due_date, t.status,
        t.created_at, t.updated_at,
        d.title as document_title, d.id as document_id,
        ta.assignee_role, ta.assignee_user_id,
        u.name as assignee_name, u.email as assignee_email,
        creator.name as created_by_name
      FROM tasks t
      LEFT JOIN documents d ON t.document_id = d.id
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.assignee_user_id = u.id
      LEFT JOIN users creator ON d.created_by = creator.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `, params);

    res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description_en: task.description_en,
          description_ml: task.description_ml,
          due_date: task.due_date,
          status: task.status,
          document: {
            id: task.document_id,
            title: task.document_title
          },
          assigned_to: {
            role: task.assignee_role,
            user_id: task.assignee_user_id,
            name: task.assignee_name,
            email: task.assignee_email
          },
          created_by: task.created_by_name,
          created_at: task.created_at,
          updated_at: task.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks'
    });
  }
};

const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, status } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Notes are required'
      });
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Check if task exists and user has permission
    const tasks = await db.query(`
      SELECT t.id, ta.assignee_role, ta.assignee_user_id
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      WHERE t.id = ?
    `, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = tasks[0];

    // Check permissions
    if (req.user.role !== 'ADMIN' && 
        task.assignee_role !== req.user.role && 
        task.assignee_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Update task status if provided
      if (status) {
        await db.query(
          'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, id]
        );
      }

      // Add task update
      await db.query(
        'INSERT INTO task_updates (task_id, updated_by, notes, status) VALUES (?, ?, ?, ?)',
        [id, req.user.id, notes, status || task.status]
      );

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Task progress updated successfully'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Update task progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task progress'
    });
  }
};

const escalateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if task exists
    const tasks = await db.query(
      'SELECT id, status FROM tasks WHERE id = ?',
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = tasks[0];

    if (task.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot escalate a completed task'
      });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Update task status to escalated
      await db.query(
        'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['ESCALATED', id]
      );

      // Add escalation update
      await db.query(
        'INSERT INTO task_updates (task_id, updated_by, notes, status) VALUES (?, ?, ?, ?)',
        [id, req.user.id, notes || 'Task escalated', 'ESCALATED']
      );

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Task escalated successfully'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Escalate task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate task'
    });
  }
};

const getTaskUpdates = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ?',
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get task updates
    const updates = await db.query(`
      SELECT tu.*, u.name as updated_by_name, u.email as updated_by_email
      FROM task_updates tu
      JOIN users u ON tu.updated_by = u.id
      WHERE tu.task_id = ?
      ORDER BY tu.created_at DESC
    `, [id]);

    res.json({
      success: true,
      message: 'Task updates retrieved successfully',
      data: {
        updates: updates.map(update => ({
          id: update.id,
          notes: update.notes,
          status: update.status,
          updated_by: {
            id: update.updated_by,
            name: update.updated_by_name,
            email: update.updated_by_email
          },
          created_at: update.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get task updates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task updates'
    });
  }
};

module.exports = {
  getTasks,
  updateTaskProgress,
  escalateTask,
  getTaskUpdates
};
