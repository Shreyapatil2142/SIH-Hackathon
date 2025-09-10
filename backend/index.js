const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./models/db');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const documentRoutes = require('./routes/documents');
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const fileRoutes = require('./routes/files');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'MetroDocs API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/documents', documentRoutes);
app.use('/tasks', taskRoutes);
app.use('/reports', reportRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/files', fileRoutes);
app.use('/export', exportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initialize();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`MetroDocs API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
