const express = require('express');
const { body, validationResult } = require('express-validator');
const Medication = require('../models/Medication');
const Notification = require('../models/Notification');
const { protect, checkFamilyAccess } = require('../middleware/auth');
const { 
  createSuccessResponse, 
  createErrorResponse,
  sanitizeInput,
  calculateNextDose,
  paginate,
  createPaginationInfo
} = require('../utils/helpers');

const router = express.Router();

// Validation middleware
const validateMedication = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  body('dosage')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage is required and must be less than 50 characters'),
  body('frequency')
    .isIn(['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('pillCount')
    .isInt({ min: 0 })
    .withMessage('Pill count must be a non-negative integer'),
  body('nextDose')
    .optional()
    .isISO8601()
    .withMessage('Next dose must be a valid date')
];

// @desc    Get all medications for user
// @route   GET /api/medications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50, active = 'true', userId } = req.query;
    
    // Determine which user's medications to fetch
    let targetUserId = req.user._id;
    
    if (userId && userId !== req.user._id.toString()) {
      // Check if user has permission to view this user's medications
      if (req.user.role !== 'doctor') {
        // Check family access
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json(
            createErrorResponse('User not found')
          );
        }
        
        const hasAccess = targetUser.familyConnections.some(connection => 
          connection.userId.toString() === req.user._id.toString() &&
          connection.permissions.viewMedications
        );
        
        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view medications')
          );
        }
      }
      
      targetUserId = userId;
    }

    const { skip, limit: limitNum } = paginate(page, limit);
    
    const query = { userId: targetUserId };
    
    if (active !== 'all') {
      query.isActive = active === 'true';
    }

    const [medications, total] = await Promise.all([
      Medication.find(query)
        .sort({ nextDose: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email'),
      Medication.countDocuments(query)
    ]);

    const pagination = createPaginationInfo(total, parseInt(page), limitNum);

    res.json(
      createSuccessResponse(
        'Medications retrieved successfully',
        { medications },
        { pagination }
      )
    );
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve medications')
    );
  }
});

// @desc    Get single medication
// @route   GET /api/medications/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('prescribedBy.doctorId', 'name email');

    if (!medication) {
      return res.status(404).json(
        createErrorResponse('Medication not found')
      );
    }

    // Check if user has permission to view this medication
    if (medication.userId._id.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'doctor') {
        // Check family access
        const hasAccess = medication.userId.familyConnections.some(connection => 
          connection.userId.toString() === req.user._id.toString() &&
          connection.permissions.viewMedications
        );
        
        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view this medication')
          );
        }
      }
    }

    res.json(
      createSuccessResponse(
        'Medication retrieved successfully',
        { medication }
      )
    );
  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve medication')
    );
  }
});

// @desc    Add new medication
// @route   POST /api/medications
// @access  Private
router.post('/', protect, validateMedication, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const medicationData = {
      userId: req.body.userId || req.user._id,
      name: sanitizeInput(req.body.name),
      dosage: sanitizeInput(req.body.dosage),
      frequency: req.body.frequency,
      pillCount: parseInt(req.body.pillCount),
      notes: req.body.notes ? sanitizeInput(req.body.notes) : undefined,
      instructions: req.body.instructions,
      medicationType: req.body.medicationType,
      strength: req.body.strength ? sanitizeInput(req.body.strength) : undefined,
      manufacturer: req.body.manufacturer ? sanitizeInput(req.body.manufacturer) : undefined,
      expiryDate: req.body.expiryDate,
      reminderSettings: req.body.reminderSettings,
      lowStockThreshold: req.body.lowStockThreshold || 5
    };

    // If adding medication for another user, check permissions
    if (medicationData.userId.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'doctor') {
        return res.status(403).json(
          createErrorResponse('Only doctors can add medications for other users')
        );
      }
    }

    // Set next dose time
    if (req.body.nextDose) {
      medicationData.nextDose = new Date(req.body.nextDose);
    } else {
      // Calculate next dose based on frequency
      medicationData.nextDose = calculateNextDose(medicationData.frequency);
    }

    // Add prescriber information if user is a doctor
    if (req.user.role === 'doctor') {
      medicationData.prescribedBy = {
        doctorName: req.user.name,
        doctorId: req.user._id,
        prescriptionDate: new Date()
      };
    }

    const medication = new Medication(medicationData);
    await medication.save();

    // Populate user information
    await medication.populate('userId', 'name email');

    // Create initial reminder notification if enabled
    if (medication.reminderSettings.enabled) {
      try {
        await Notification.createMedicationReminder(
          medication.userId._id,
          medication
        );
      } catch (notificationError) {
        console.error('Failed to create medication reminder:', notificationError);
        // Don't fail the medication creation if notification fails
      }
    }

    res.status(201).json(
      createSuccessResponse(
        'Medication added successfully',
        { medication }
      )
    );
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json(
      createErrorResponse('Failed to add medication')
    );
  }
});

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
router.put('/:id', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  body('dosage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be less than 50 characters'),
  body('frequency')
    .optional()
    .isIn(['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('pillCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Pill count must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json(
        createErrorResponse('Medication not found')
      );
    }

    // Check if user has permission to update this medication
    if (medication.userId.toString() !== req.user._id.toString() && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied to update this medication')
      );
    }

    const allowedUpdates = [
      'name', 'dosage', 'frequency', 'pillCount', 'notes', 'instructions',
      'medicationType', 'strength', 'manufacturer', 'expiryDate', 
      'reminderSettings', 'lowStockThreshold', 'isActive', 'isPaused'
    ];

    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (typeof req.body[key] === 'string') {
          updates[key] = sanitizeInput(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // If frequency changed, recalculate next dose
    if (updates.frequency && updates.frequency !== medication.frequency) {
      updates.nextDose = calculateNextDose(updates.frequency);
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.json(
      createSuccessResponse(
        'Medication updated successfully',
        { medication: updatedMedication }
      )
    );
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json(
      createErrorResponse('Failed to update medication')
    );
  }
});

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json(
        createErrorResponse('Medication not found')
      );
    }

    // Check if user has permission to delete this medication
    if (medication.userId.toString() !== req.user._id.toString() && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied to delete this medication')
      );
    }

    await Medication.findByIdAndDelete(req.params.id);

    // Remove related notifications
    await Notification.deleteMany({
      'relatedData.medicationId': req.params.id
    });

    res.json(
      createSuccessResponse('Medication deleted successfully')
    );
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json(
      createErrorResponse('Failed to delete medication')
    );
  }
});

// @desc    Record medication taken
// @route   POST /api/medications/:id/take
// @access  Private
router.post('/:id/take', protect, [
  body('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),
  body('method')
    .optional()
    .isIn(['manual', 'camera_verification', 'barcode_scan'])
    .withMessage('Invalid verification method'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json(
        createErrorResponse('Medication not found')
      );
    }

    // Check if user has permission to record for this medication
    if (medication.userId.toString() !== req.user._id.toString()) {
      // Check if family member has permission
      const targetUser = await User.findById(medication.userId);
      const hasAccess = targetUser.familyConnections.some(connection => 
        connection.userId.toString() === req.user._id.toString() &&
        connection.permissions.viewMedications
      );
      
      if (!hasAccess && req.user.role !== 'doctor') {
        return res.status(403).json(
          createErrorResponse('Access denied to record medication for this user')
        );
      }
    }

    // Update medication tracking
    medication.takenDoses += 1;
    medication.totalDoses += 1;
    
    // Decrease pill count
    if (medication.pillCount > 0) {
      medication.pillCount -= 1;
    }

    // Calculate next dose
    medication.nextDose = medication.calculateNextDose();
    
    // Update adherence
    medication.updateAdherence();

    await medication.save();

    // Create notification for successful dose taken
    try {
      await Notification.create({
        userId: medication.userId,
        type: 'medication_taken',
        title: 'Medication Taken',
        message: `${medication.name} dose recorded successfully`,
        priority: 'low',
        category: 'medication',
        relatedData: {
          medicationId: medication._id
        },
        metadata: {
          method: req.body.method || 'manual',
          verified: req.body.verified || false,
          recordedBy: req.user._id
        }
      });
    } catch (notificationError) {
      console.error('Failed to create medication taken notification:', notificationError);
    }

    // Check for low stock and create notification if needed
    if (medication.isLowStock()) {
      try {
        await Notification.create({
          userId: medication.userId,
          type: 'medication_low_stock',
          title: 'Low Stock Alert',
          message: `${medication.name} is running low (${medication.pillCount} remaining)`,
          priority: 'medium',
          category: 'medication',
          relatedData: {
            medicationId: medication._id
          }
        });
      } catch (notificationError) {
        console.error('Failed to create low stock notification:', notificationError);
      }
    }

    res.json(
      createSuccessResponse(
        'Medication dose recorded successfully',
        { 
          medication: {
            id: medication._id,
            name: medication.name,
            pillCount: medication.pillCount,
            nextDose: medication.nextDose,
            adherence: medication.adherence,
            takenDoses: medication.takenDoses,
            totalDoses: medication.totalDoses
          }
        }
      )
    );
  } catch (error) {
    console.error('Record medication taken error:', error);
    res.status(500).json(
      createErrorResponse('Failed to record medication dose')
    );
  }
});

// @desc    Get medication adherence stats
// @route   GET /api/medications/stats/adherence
// @access  Private
router.get('/stats/adherence', protect, async (req, res) => {
  try {
    const { userId, period = '30' } = req.query;
    
    // Determine which user's stats to fetch
    let targetUserId = req.user._id;
    
    if (userId && userId !== req.user._id.toString()) {
      // Check permissions for family/doctor access
      if (req.user.role !== 'doctor') {
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json(
            createErrorResponse('User not found')
          );
        }
        
        const hasAccess = targetUser.familyConnections.some(connection => 
          connection.userId.toString() === req.user._id.toString() &&
          connection.permissions.viewMedications
        );
        
        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view medication stats')
          );
        }
      }
      
      targetUserId = userId;
    }

    const medications = await Medication.find({
      userId: targetUserId,
      isActive: true
    });

    const stats = {
      totalMedications: medications.length,
      averageAdherence: 0,
      totalDoses: 0,
      takenDoses: 0,
      missedDoses: 0,
      medicationsOnTrack: 0,
      medicationsNeedingAttention: 0
    };

    if (medications.length > 0) {
      stats.totalDoses = medications.reduce((sum, med) => sum + med.totalDoses, 0);
      stats.takenDoses = medications.reduce((sum, med) => sum + med.takenDoses, 0);
      stats.missedDoses = medications.reduce((sum, med) => sum + med.missedDoses, 0);
      stats.averageAdherence = medications.reduce((sum, med) => sum + med.adherence, 0) / medications.length;
      
      stats.medicationsOnTrack = medications.filter(med => med.adherence >= 80).length;
      stats.medicationsNeedingAttention = medications.filter(med => med.adherence < 80).length;
    }

    res.json(
      createSuccessResponse(
        'Medication adherence stats retrieved successfully',
        { stats }
      )
    );
  } catch (error) {
    console.error('Get adherence stats error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve adherence stats')
    );
  }
});

module.exports = router;
