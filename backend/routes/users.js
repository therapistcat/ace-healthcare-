const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, checkFamilyAccess } = require('../middleware/auth');
const { 
  createSuccessResponse, 
  createErrorResponse,
  sanitizeInput,
  calculateAge,
  paginate,
  createPaginationInfo
} = require('../utils/helpers');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('familyConnections.userId', 'name email role')
      .select('-password -otp');

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    res.json(
      createSuccessResponse(
        'Profile retrieved successfully',
        { profile: user }
      )
    );
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve profile')
    );
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Language must be en or hi')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const allowedUpdates = [
      'name', 'phone', 'age', 'gender', 'language', 
      'emergencyContact', 'address', 'notificationPreferences', 
      'privacySettings'
    ];
    
    const updates = {};
    
    // Filter and sanitize allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (typeof req.body[key] === 'string') {
          updates[key] = sanitizeInput(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Check if phone number is already taken by another user
    if (updates.phone) {
      const existingUser = await User.findOne({
        phone: updates.phone,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json(
          createErrorResponse('Phone number is already registered with another account')
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -otp');

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    res.json(
      createSuccessResponse(
        'Profile updated successfully',
        { profile: user }
      )
    );
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json(
        createErrorResponse('Phone number is already registered')
      );
    }
    
    res.status(500).json(
      createErrorResponse('Failed to update profile')
    );
  }
});

// @desc    Get user by ID (for family members and doctors)
// @route   GET /api/users/:userId
// @access  Private
router.get('/:userId', protect, checkFamilyAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('familyConnections.userId', 'name email role')
      .select('-password -otp');

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    // Filter sensitive information based on user role and permissions
    let userData = user.toObject();
    
    if (req.user.role === 'family') {
      // Family members get limited access based on permissions
      const connection = user.familyConnections.find(
        conn => conn.userId._id.toString() === req.user._id.toString()
      );
      
      if (connection && !connection.permissions.viewProfile) {
        delete userData.address;
        delete userData.emergencyContact;
        delete userData.privacySettings;
      }
    }

    res.json(
      createSuccessResponse(
        'User profile retrieved successfully',
        { profile: userData }
      )
    );
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve user profile')
    );
  }
});

// @desc    Search users (for doctors to find patients)
// @route   GET /api/users/search
// @access  Private (Doctors only)
router.get('/search', protect, authorize('doctor'), async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json(
        createErrorResponse('Search query must be at least 2 characters')
      );
    }

    const { skip, limit: limitNum } = paginate(page, limit);
    
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const query = {
      $and: [
        { role: { $in: ['patient', 'family'] } },
        { isActive: true },
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex }
          ]
        }
      ]
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone role age gender')
        .skip(skip)
        .limit(limitNum)
        .sort({ name: 1 }),
      User.countDocuments(query)
    ]);

    const pagination = createPaginationInfo(total, parseInt(page), limitNum);

    res.json(
      createSuccessResponse(
        'Users found successfully',
        { users },
        { pagination }
      )
    );
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json(
      createErrorResponse('Failed to search users')
    );
  }
});

// @desc    Get family connections
// @route   GET /api/users/family
// @access  Private
router.get('/family', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('familyConnections.userId', 'name email phone role age gender')
      .select('familyConnections');

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    res.json(
      createSuccessResponse(
        'Family connections retrieved successfully',
        { familyConnections: user.familyConnections }
      )
    );
  } catch (error) {
    console.error('Get family connections error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve family connections')
    );
  }
});

// @desc    Add family connection
// @route   POST /api/users/family/connect
// @access  Private
router.post('/family/connect', protect, [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('relationship')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters'),
  body('permissions')
    .optional()
    .isObject()
    .withMessage('Permissions must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { userId, relationship, permissions = {} } = req.body;

    // Can't connect to yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json(
        createErrorResponse('Cannot connect to yourself')
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    // Check if connection already exists
    const currentUser = await User.findById(req.user._id);
    const existingConnection = currentUser.familyConnections.find(
      conn => conn.userId.toString() === userId
    );

    if (existingConnection) {
      return res.status(400).json(
        createErrorResponse('Family connection already exists')
      );
    }

    // Default permissions
    const defaultPermissions = {
      viewMedications: true,
      viewVitals: true,
      viewAppointments: true,
      receiveAlerts: true,
      ...permissions
    };

    // Add connection to current user
    currentUser.familyConnections.push({
      userId,
      relationship: sanitizeInput(relationship),
      permissions: defaultPermissions
    });

    await currentUser.save();

    // Add reverse connection to target user (if they're a patient)
    if (targetUser.role === 'patient') {
      const reverseRelationship = req.user.role === 'family' ? 'family_member' : 'caregiver';
      
      targetUser.familyConnections.push({
        userId: req.user._id,
        relationship: reverseRelationship,
        permissions: defaultPermissions
      });

      await targetUser.save();
    }

    // Populate the new connection
    await currentUser.populate('familyConnections.userId', 'name email phone role');

    const newConnection = currentUser.familyConnections[currentUser.familyConnections.length - 1];

    res.status(201).json(
      createSuccessResponse(
        'Family connection added successfully',
        { connection: newConnection }
      )
    );
  } catch (error) {
    console.error('Add family connection error:', error);
    res.status(500).json(
      createErrorResponse('Failed to add family connection')
    );
  }
});

// @desc    Update family connection permissions
// @route   PUT /api/users/family/:connectionId
// @access  Private
router.put('/family/:connectionId', protect, [
  body('permissions')
    .isObject()
    .withMessage('Permissions must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { permissions } = req.body;
    const { connectionId } = req.params;

    const user = await User.findById(req.user._id);
    const connection = user.familyConnections.id(connectionId);

    if (!connection) {
      return res.status(404).json(
        createErrorResponse('Family connection not found')
      );
    }

    // Update permissions
    connection.permissions = {
      ...connection.permissions,
      ...permissions
    };

    await user.save();

    res.json(
      createSuccessResponse(
        'Family connection permissions updated successfully',
        { connection }
      )
    );
  } catch (error) {
    console.error('Update family connection error:', error);
    res.status(500).json(
      createErrorResponse('Failed to update family connection')
    );
  }
});

// @desc    Remove family connection
// @route   DELETE /api/users/family/:connectionId
// @access  Private
router.delete('/family/:connectionId', protect, async (req, res) => {
  try {
    const { connectionId } = req.params;

    const user = await User.findById(req.user._id);
    const connection = user.familyConnections.id(connectionId);

    if (!connection) {
      return res.status(404).json(
        createErrorResponse('Family connection not found')
      );
    }

    const targetUserId = connection.userId;

    // Remove connection from current user
    user.familyConnections.pull(connectionId);
    await user.save();

    // Remove reverse connection from target user
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      targetUser.familyConnections = targetUser.familyConnections.filter(
        conn => conn.userId.toString() !== req.user._id.toString()
      );
      await targetUser.save();
    }

    res.json(
      createSuccessResponse('Family connection removed successfully')
    );
  } catch (error) {
    console.error('Remove family connection error:', error);
    res.status(500).json(
      createErrorResponse('Failed to remove family connection')
    );
  }
});

// @desc    Deactivate user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    res.json(
      createSuccessResponse('Account deactivated successfully')
    );
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json(
      createErrorResponse('Failed to deactivate account')
    );
  }
});

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
router.get('/doctors', protect, async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      isActive: true
    })
    .select('name email phone specialization')
    .sort({ name: 1 });

    res.json(
      createSuccessResponse(
        'Doctors retrieved successfully',
        { data: doctors }
      )
    );
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve doctors')
    );
  }
});

// @desc    Get all patients (for doctors)
// @route   GET /api/users/patients
// @access  Private (Doctor only)
router.get('/patients', protect, authorize('doctor'), async (req, res) => {
  try {
    const patients = await User.find({
      role: 'patient',
      isActive: true
    })
    .select('name email phone age')
    .sort({ name: 1 });

    res.json(
      createSuccessResponse(
        'Patients retrieved successfully',
        { data: patients }
      )
    );
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve patients')
    );
  }
});

module.exports = router;
