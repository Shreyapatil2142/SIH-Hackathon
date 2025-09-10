const db = require('../models/db');
const fs = require('fs').promises;
const path = require('path');

const exportDocuments = async (req, res) => {
  try {
    const { format = 'json', category, tag, dateFrom, dateTo } = req.query;

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (category) {
      whereClause += ' AND d.id IN (SELECT document_id FROM document_category_relations WHERE category_id = ?)';
      params.push(category);
    }

    if (tag) {
      whereClause += ' AND d.id IN (SELECT document_id FROM document_tag_relations WHERE tag_id = ?)';
      params.push(tag);
    }

    if (dateFrom) {
      whereClause += ' AND d.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND d.created_at <= ?';
      params.push(dateTo);
    }

    // Get documents with related data
    const documents = await db.query(
      `SELECT d.id, d.title, d.text, d.file_url, d.created_at,
              u.name as created_by_name, u.email as created_by_email,
              GROUP_CONCAT(DISTINCT dc.name) as categories,
              GROUP_CONCAT(DISTINCT dt.name) as tags
       FROM documents d
       JOIN users u ON d.created_by = u.id
       LEFT JOIN document_category_relations dcr ON d.id = dcr.document_id
       LEFT JOIN document_categories dc ON dcr.category_id = dc.id
       LEFT JOIN document_tag_relations dtr ON d.id = dtr.document_id
       LEFT JOIN document_tags dt ON dtr.tag_id = dt.id
       ${whereClause}
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      params
    );

    if (format === 'json') {
      res.json({
        success: true,
        message: 'Documents exported successfully',
        data: {
          documents,
          exportInfo: {
            format: 'json',
            count: documents.length,
            exportedAt: new Date().toISOString(),
            filters: { category, tag, dateFrom, dateTo }
          }
        }
      });
    } else if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,Title,Content,Created By,Email,Categories,Tags,Created At\n';
      const csvRows = documents.map(doc => {
        const content = (doc.text || '').replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 500);
        return `"${doc.id}","${doc.title}","${content}","${doc.created_by_name}","${doc.created_by_email}","${doc.categories || ''}","${doc.tags || ''}","${doc.created_at}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="documents-export-${Date.now()}.csv"`);
      res.send(csvContent);
    } else if (format === 'txt') {
      // Generate TXT
      let txtContent = 'METRODOCS DOCUMENT EXPORT\n';
      txtContent += '========================\n\n';
      txtContent += `Export Date: ${new Date().toLocaleString()}\n`;
      txtContent += `Total Documents: ${documents.length}\n\n`;

      documents.forEach((doc, index) => {
        txtContent += `Document ${index + 1}\n`;
        txtContent += `ID: ${doc.id}\n`;
        txtContent += `Title: ${doc.title}\n`;
        txtContent += `Created By: ${doc.created_by_name} (${doc.created_by_email})\n`;
        txtContent += `Categories: ${doc.categories || 'None'}\n`;
        txtContent += `Tags: ${doc.tags || 'None'}\n`;
        txtContent += `Created: ${doc.created_at}\n`;
        txtContent += `Content: ${(doc.text || '').substring(0, 1000)}${doc.text && doc.text.length > 1000 ? '...' : ''}\n`;
        txtContent += '\n' + '='.repeat(50) + '\n\n';
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="documents-export-${Date.now()}.txt"`);
      res.send(txtContent);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: json, csv, txt'
      });
    }
  } catch (error) {
    console.error('Export documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export documents',
      error: error.message
    });
  }
};

const exportSummaries = async (req, res) => {
  try {
    const { format = 'json', dateFrom, dateTo } = req.query;

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (dateFrom) {
      whereClause += ' AND s.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND s.created_at <= ?';
      params.push(dateTo);
    }

    // Get summaries with document info
    const summaries = await db.query(
      `SELECT s.id, s.summary_en, s.summary_ml, s.key_points_json, s.created_at,
              d.title as document_title, d.id as document_id,
              u.name as created_by_name
       FROM summaries s
       JOIN documents d ON s.document_id = d.id
       JOIN users u ON d.created_by = u.id
       ${whereClause}
       ORDER BY s.created_at DESC`,
      params
    );

    if (format === 'json') {
      res.json({
        success: true,
        message: 'Summaries exported successfully',
        data: {
          summaries,
          exportInfo: {
            format: 'json',
            count: summaries.length,
            exportedAt: new Date().toISOString(),
            filters: { dateFrom, dateTo }
          }
        }
      });
    } else if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,Document Title,Summary EN,Summary ML,Key Points,Created By,Created At\n';
      const csvRows = summaries.map(summary => {
        const summaryEn = (summary.summary_en || '').replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 500);
        const summaryMl = (summary.summary_ml || '').replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 500);
        const keyPoints = summary.key_points_json ? JSON.stringify(summary.key_points_json).replace(/"/g, '""') : '';
        return `"${summary.id}","${summary.document_title}","${summaryEn}","${summaryMl}","${keyPoints}","${summary.created_by_name}","${summary.created_at}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="summaries-export-${Date.now()}.csv"`);
      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: json, csv'
      });
    }
  } catch (error) {
    console.error('Export summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export summaries',
      error: error.message
    });
  }
};

module.exports = {
  exportDocuments,
  exportSummaries
};
