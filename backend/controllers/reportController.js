const db = require('../models/db');

const getOverview = async (req, res) => {
  try {
    // Get task status summary
    const taskStatusSummary = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks
      GROUP BY status
    `);

    // Get tasks by role
    const tasksByRole = await db.query(`
      SELECT 
        ta.assignee_role,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated_tasks,
        SUM(CASE WHEN t.due_date < CURDATE() AND t.status != 'COMPLETED' THEN 1 ELSE 0 END) as overdue_tasks
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      GROUP BY ta.assignee_role
    `);

    // Get recent escalations
    const recentEscalations = await db.query(`
      SELECT 
        t.id as task_id,
        t.title,
        t.due_date,
        ta.assignee_role,
        u.name as escalated_by,
        tu.created_at as escalated_at
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN task_updates tu ON t.id = tu.task_id
      LEFT JOIN users u ON tu.updated_by = u.id
      WHERE t.status = 'ESCALATED'
      ORDER BY tu.created_at DESC
      LIMIT 10
    `);

    // Get overdue tasks
    const overdueTasks = await db.query(`
      SELECT 
        t.id,
        t.title,
        t.due_date,
        ta.assignee_role,
        u.name as assignee_name,
        DATEDIFF(CURDATE(), t.due_date) as days_overdue
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.assignee_user_id = u.id
      WHERE t.due_date < CURDATE() AND t.status != 'COMPLETED'
      ORDER BY t.due_date ASC
      LIMIT 20
    `);

    // Get document processing stats
    const documentStats = await db.query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(s.id) as processed_documents,
        COUNT(t.id) as total_tasks_generated
      FROM documents d
      LEFT JOIN summaries s ON d.id = s.document_id
      LEFT JOIN tasks t ON d.id = t.document_id
    `);

    // Get user activity stats
    const userActivity = await db.query(`
      SELECT 
        u.role,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.is_active = TRUE THEN u.id END) as active_users
      FROM users u
      GROUP BY u.role
    `);

    // Get recent activity
    const recentActivity = await db.query(`
      SELECT 
        al.action,
        al.timestamp,
        u.name as user_name,
        u.role as user_role,
        al.details
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      message: 'Overview report generated successfully',
      data: {
        taskStatusSummary: taskStatusSummary.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        tasksByRole: tasksByRole.map(role => ({
          role: role.assignee_role,
          total_tasks: role.total_tasks,
          completed_tasks: role.completed_tasks,
          escalated_tasks: role.escalated_tasks,
          overdue_tasks: role.overdue_tasks,
          completion_rate: role.total_tasks > 0 ? 
            ((role.completed_tasks / role.total_tasks) * 100).toFixed(2) : 0
        })),
        recentEscalations,
        overdueTasks,
        documentStats: documentStats[0],
        userActivity,
        recentActivity: recentActivity.map(activity => ({
          action: activity.action,
          timestamp: activity.timestamp,
          user: {
            name: activity.user_name,
            role: activity.user_role
          },
          details: activity.details ? JSON.parse(activity.details) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview report'
    });
  }
};

const getTaskReport = async (req, res) => {
  try {
    const { start_date, end_date, role, status } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (start_date) {
      whereClause += ' AND t.created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND t.created_at <= ?';
      params.push(end_date);
    }

    if (role) {
      whereClause += ' AND ta.assignee_role = ?';
      params.push(role);
    }

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    const tasks = await db.query(`
      SELECT 
        t.id,
        t.title,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        ta.assignee_role,
        u.name as assignee_name,
        d.title as document_title,
        DATEDIFF(CURDATE(), t.due_date) as days_overdue
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.assignee_user_id = u.id
      LEFT JOIN documents d ON t.document_id = d.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `, params);

    res.json({
      success: true,
      message: 'Task report generated successfully',
      data: {
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          due_date: task.due_date,
          created_at: task.created_at,
          updated_at: task.updated_at,
          assigned_to: {
            role: task.assignee_role,
            name: task.assignee_name
          },
          document_title: task.document_title,
          days_overdue: task.days_overdue
        })),
        filters: {
          start_date,
          end_date,
          role,
          status
        },
        total_tasks: tasks.length
      }
    });
  } catch (error) {
    console.error('Get task report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate task report'
    });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const { user_id, start_date, end_date, action } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (user_id) {
      whereClause += ' AND al.user_id = ?';
      params.push(user_id);
    }

    if (start_date) {
      whereClause += ' AND al.timestamp >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND al.timestamp <= ?';
      params.push(end_date);
    }

    if (action) {
      whereClause += ' AND al.action = ?';
      params.push(action);
    }

    const activities = await db.query(`
      SELECT 
        al.id,
        al.action,
        al.timestamp,
        al.details,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT 100
    `, params);

    res.json({
      success: true,
      message: 'User activity report generated successfully',
      data: {
        activities: activities.map(activity => ({
          id: activity.id,
          action: activity.action,
          timestamp: activity.timestamp,
          user: {
            name: activity.user_name,
            email: activity.user_email,
            role: activity.user_role
          },
          details: activity.details ? JSON.parse(activity.details) : null
        })),
        filters: {
          user_id,
          start_date,
          end_date,
          action
        },
        total_activities: activities.length
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate user activity report'
    });
  }
};

module.exports = {
  getOverview,
  getTaskReport,
  getUserActivity
};
