const db = require('../models/db');

const auditLog = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          if (req.user) {
            await db.query(
              'INSERT INTO audit_logs (action, user_id, details) VALUES (?, ?, ?)',
              [
                action,
                req.user.id,
                JSON.stringify({
                  method: req.method,
                  url: req.originalUrl,
                  ip: req.ip,
                  userAgent: req.get('User-Agent'),
                  timestamp: new Date().toISOString(),
                  success: data.success || false,
                  ...(req.body && Object.keys(req.body).length > 0 && { requestBody: req.body }),
                  ...(req.params && Object.keys(req.params).length > 0 && { params: req.params }),
                  ...(req.query && Object.keys(req.query).length > 0 && { query: req.query })
                })
              ]
            );
          }
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      });
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  auditLog
};
