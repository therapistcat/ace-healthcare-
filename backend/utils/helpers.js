const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Format date for display
const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return d.toLocaleDateString();
  }
};

// Format time for display
const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate BMI
const calculateBMI = (weight, height, weightUnit = 'kg', heightUnit = 'cm') => {
  if (!weight || !height) return null;
  
  // Convert to kg and meters
  let weightInKg = weight;
  let heightInM = height;
  
  if (weightUnit === 'lbs') {
    weightInKg = weight * 0.453592;
  }
  
  if (heightUnit === 'cm') {
    heightInM = height / 100;
  } else if (heightUnit === 'inches') {
    heightInM = height * 0.0254;
  }
  
  const bmi = weightInKg / (heightInM * heightInM);
  return Math.round(bmi * 10) / 10;
};

// Get BMI category
const getBMICategory = (bmi) => {
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  const skip = (pageNum - 1) * limitNum;
  
  return {
    skip,
    limit: limitNum,
    page: pageNum
  };
};

// Create pagination info
const createPaginationInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

// Generate medication schedule
const generateMedicationSchedule = (frequency, startTime = '09:00') => {
  const schedules = {
    'once_daily': [startTime],
    'twice_daily': [startTime, '21:00'],
    'thrice_daily': ['09:00', '14:00', '21:00'],
    'four_times_daily': ['09:00', '13:00', '17:00', '21:00'],
    'weekly': [startTime],
    'monthly': [startTime]
  };
  
  return schedules[frequency] || [startTime];
};

// Calculate next dose time
const calculateNextDose = (frequency, lastDose = new Date()) => {
  const now = new Date(lastDose);
  
  switch (frequency) {
    case 'once_daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'twice_daily':
      now.setHours(now.getHours() + 12);
      break;
    case 'thrice_daily':
      now.setHours(now.getHours() + 8);
      break;
    case 'four_times_daily':
      now.setHours(now.getHours() + 6);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  
  return now;
};

// Check if time is within range
const isTimeInRange = (time, startTime, endTime) => {
  const current = new Date(`1970-01-01T${time}:00`);
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  
  return current >= start && current <= end;
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}_${random}.${extension}`;
};

// Get file extension
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Check if file type is allowed
const isAllowedFileType = (filename, allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']) => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

// Convert bytes to human readable format
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Mask sensitive data
const maskEmail = (email) => {
  if (!email) return '';
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  
  return `${maskedUsername}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const masked = cleaned.substring(0, 2) + '*'.repeat(cleaned.length - 4) + cleaned.substring(cleaned.length - 2);
  
  return masked;
};

// Generate API response
const createResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (meta !== null) {
    response.meta = meta;
  }
  
  return response;
};

// Error response helper
const createErrorResponse = (message, errors = null, statusCode = 400) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

// Success response helper
const createSuccessResponse = (message, data = null, meta = null) => {
  return createResponse(true, message, data, meta);
};

module.exports = {
  generateToken,
  generateOTP,
  generateRandomString,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  formatDate,
  formatTime,
  calculateAge,
  calculateBMI,
  getBMICategory,
  paginate,
  createPaginationInfo,
  generateMedicationSchedule,
  calculateNextDose,
  isTimeInRange,
  generateUniqueFilename,
  getFileExtension,
  isAllowedFileType,
  formatFileSize,
  maskEmail,
  maskPhone,
  createResponse,
  createErrorResponse,
  createSuccessResponse
};
