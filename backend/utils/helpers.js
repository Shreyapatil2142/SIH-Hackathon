// Utility functions for the MetroDocs backend

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

const formatDateTime = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const calculateDaysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusColor = (status) => {
  const colors = {
    'PENDING': '#f59e0b',
    'IN_PROGRESS': '#3b82f6',
    'COMPLETED': '#10b981',
    'ESCALATED': '#ef4444'
  };
  return colors[status] || '#6b7280';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateTaskId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TASK-${timestamp}-${random}`.toUpperCase();
};

const parseJSON = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
};

const createResponse = (success, message, data = null, error = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  return response;
};

module.exports = {
  formatDate,
  formatDateTime,
  generateRandomPassword,
  validateEmail,
  validatePassword,
  sanitizeInput,
  calculateDaysOverdue,
  getStatusColor,
  formatFileSize,
  generateTaskId,
  parseJSON,
  createResponse
};
