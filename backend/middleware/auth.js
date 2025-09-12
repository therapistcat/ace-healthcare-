const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns the resource or has permission
const checkOwnership = (resourceUserField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // For doctors, they can access any patient data
      if (req.user.role === 'doctor') {
        return next();
      }

      // Get resource ID from params or body
      const resourceId = req.params.id || req.body.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // This will be implemented in individual route handlers
      // as the logic varies by resource type
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in ownership check'
      });
    }
  };
};

// Check family member access
const checkFamilyAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Doctors have access to all patient data
    if (req.user.role === 'doctor') {
      return next();
    }

    const targetUserId = req.params.userId || req.body.userId;
    
    // Users can always access their own data
    if (req.user._id.toString() === targetUserId) {
      return next();
    }

    // Check if user is a family member with access
    if (req.user.role === 'family') {
      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Target user not found'
        });
      }

      // Check if family member has access to this patient
      const hasAccess = targetUser.familyConnections.some(connection => 
        connection.userId.toString() === req.user._id.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not authorized to view this patient\'s data.'
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    console.error('Family access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in family access check'
    });
  }
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.user ? req.user._id : '');
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    attempts.set(key, validAttempts);

    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current attempt
    validAttempts.push(now);
    next();
  };
};

// Verify user is verified (for operations requiring verified users)
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required. Please verify your account first.'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  checkFamilyAccess,
  sensitiveOperationLimit,
  requireVerified
};
