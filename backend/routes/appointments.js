const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { protect, authorize, checkFamilyAccess } = require('../middleware/auth');
const { 
  createSuccessResponse, 
  createErrorResponse,
  paginate,
  createPaginationInfo,
  sanitizeInput
} = require('../utils/helpers');

const router = express.Router();

// Validation middleware
const validateAppointment = [
  body('date')
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time in HH:MM format is required'),
  body('type')
    .isIn(['consultation', 'followup', 'emergency', 'checkup', 'vaccination'])
    .withMessage('Invalid appointment type'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// @desc    Get appointments for user
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      type,
      specialty,
      startDate,
      endDate,
      userId 
    } = req.query;

    // Determine which user's appointments to fetch
    let targetUserId = req.user._id;
    
    if (userId && userId !== req.user._id.toString()) {
      // Check permissions
      if (req.user.role === 'doctor') {
        // Doctors can view appointments where they are the doctor
        targetUserId = userId;
      } else {
        // Check family access
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json(
            createErrorResponse('User not found')
          );
        }
        
        const hasAccess = targetUser.familyConnections.some(connection => 
          connection.userId.toString() === req.user._id.toString() &&
          connection.permissions.viewAppointments
        );
        
        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view appointments')
          );
        }
        
        targetUserId = userId;
      }
    }

    const { skip, limit: limitNum } = paginate(page, limit);
    
    const query = {};
    
    // Set query based on user role
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else {
      query.patientId = targetUserId;
    }
    
    // Add filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (specialty) query.specialty = specialty;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('patientId', 'name email phone age')
        .populate('doctorId', 'name email phone'),
      Appointment.countDocuments(query)
    ]);

    const pagination = createPaginationInfo(total, parseInt(page), limitNum);

    res.json(
      createSuccessResponse(
        'Appointments retrieved successfully',
        { appointments },
        { pagination }
      )
    );
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve appointments')
    );
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone age gender')
      .populate('doctorId', 'name email phone specialty')
      .populate('medicalInfo.vitalSigns')
      .populate('medicalInfo.labReports');

    if (!appointment) {
      return res.status(404).json(
        createErrorResponse('Appointment not found')
      );
    }

    // Check if user has permission to view this appointment
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId && appointment.doctorId._id.toString() === req.user._id.toString();
    
    if (!isPatient && !isDoctor) {
      // Check family access
      if (req.user.role === 'family') {
        const hasAccess = appointment.patientId.familyConnections.some(connection => 
          connection.userId.toString() === req.user._id.toString() &&
          connection.permissions.viewAppointments
        );
        
        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view this appointment')
          );
        }
      } else {
        return res.status(403).json(
          createErrorResponse('Access denied to view this appointment')
        );
      }
    }

    res.json(
      createSuccessResponse(
        'Appointment retrieved successfully',
        { appointment }
      )
    );
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve appointment')
    );
  }
});

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', protect, validateAppointment, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const appointmentData = {
      patientId: req.body.patientId || req.user._id,
      doctorId: req.body.doctorId,
      doctorName: req.body.doctorName || 'TBD',
      specialty: req.body.specialty || 'general_medicine',
      date: new Date(req.body.date),
      time: req.body.time,
      duration: req.body.duration || 30,
      type: req.body.type,
      reason: sanitizeInput(req.body.notes || req.body.reason || 'General consultation'),
      symptoms: req.body.symptoms || [],
      priority: req.body.priority || 'medium',
      status: req.body.status || 'pending',
      location: req.body.location || { type: 'clinic' },
      metadata: {
        source: 'app',
        bookedBy: req.user._id,
        bookedAt: new Date()
      }
    };

    // If booking for another user, check permissions
    if (appointmentData.patientId.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'doctor' && req.user.role !== 'family') {
        return res.status(403).json(
          createErrorResponse('Access denied to book appointments for other users')
        );
      }
    }

    // If doctor is specified by ID, check for conflicts
    if (req.body.doctorId) {
      appointmentData.doctorId = req.body.doctorId;
      
      const conflicts = await Appointment.findConflicts(
        req.body.doctorId,
        appointmentData.date,
        appointmentData.time,
        appointmentData.duration
      );
      
      if (conflicts.length > 0) {
        return res.status(409).json(
          createErrorResponse('Doctor is not available at the requested time')
        );
      }
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate patient and doctor information
    await appointment.populate('patientId', 'name email phone');
    if (appointment.doctorId) {
      await appointment.populate('doctorId', 'name email phone');
    }

    // Create appointment confirmation notification
    try {
      await Notification.createAppointmentReminder(
        appointment.patientId._id,
        appointment
      );
    } catch (notificationError) {
      console.error('Failed to create appointment notification:', notificationError);
    }

    res.status(201).json(
      createSuccessResponse(
        'Appointment booked successfully',
        { appointment }
      )
    );
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json(
      createErrorResponse('Failed to book appointment')
    );
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json(
        createErrorResponse('Appointment not found')
      );
    }

    // Check if user has permission to update this appointment
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId && appointment.doctorId.toString() === req.user._id.toString();
    
    if (!isPatient && !isDoctor && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied to update this appointment')
      );
    }

    const allowedUpdates = [
      'date', 'time', 'duration', 'reason', 'symptoms', 'priority',
      'location', 'telemedicine', 'status', 'outcome', 'billing'
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

    // If rescheduling, check for conflicts
    if ((updates.date || updates.time || updates.duration) && appointment.doctorId) {
      const newDate = updates.date ? new Date(updates.date) : appointment.date;
      const newTime = updates.time || appointment.time;
      const newDuration = updates.duration || appointment.duration;
      
      const conflicts = await Appointment.findConflicts(
        appointment.doctorId,
        newDate,
        newTime,
        newDuration,
        appointment._id
      );
      
      if (conflicts.length > 0) {
        return res.status(409).json(
          createErrorResponse('Doctor is not available at the requested time')
        );
      }
    }

    // Update metadata
    updates['metadata.lastModified'] = new Date();
    updates['metadata.modifiedBy'] = req.user._id;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('patientId', 'name email phone')
     .populate('doctorId', 'name email phone');

    res.json(
      createSuccessResponse(
        'Appointment updated successfully',
        { appointment: updatedAppointment }
      )
    );
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json(
      createErrorResponse('Failed to update appointment')
    );
  }
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json(
        createErrorResponse('Appointment not found')
      );
    }

    // Check if user has permission to cancel this appointment
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId && appointment.doctorId.toString() === req.user._id.toString();
    
    if (!isPatient && !isDoctor && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied to cancel this appointment')
      );
    }

    // Update status to cancelled instead of deleting
    await appointment.updateStatus('cancelled', req.body.reason || 'Cancelled by user', req.user._id);

    // Create cancellation notification
    try {
      await Notification.create({
        userId: appointment.patientId,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Your appointment with Dr. ${appointment.doctorName} has been cancelled`,
        priority: 'medium',
        category: 'appointment',
        relatedData: {
          appointmentId: appointment._id
        }
      });
    } catch (notificationError) {
      console.error('Failed to create cancellation notification:', notificationError);
    }

    res.json(
      createSuccessResponse('Appointment cancelled successfully')
    );
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json(
      createErrorResponse('Failed to cancel appointment')
    );
  }
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { userId, period = '30' } = req.query;
    
    // Determine which user's stats to fetch
    let targetUserId = req.user._id;
    
    if (userId && userId !== req.user._id.toString()) {
      // Check permissions
      if (req.user.role !== 'doctor') {
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json(
            createErrorResponse('User not found')
          );
        }
        
        const hasAccess = targetUser.familyConnections.some(connection => 
          connection.userId.toString() === req.user._id.toString() &&
          connection.permissions.viewAppointments
        );
        
        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view appointment stats')
          );
        }
      }
      
      targetUserId = userId;
    }

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const query = req.user.role === 'doctor' 
      ? { doctorId: req.user._id }
      : { patientId: targetUserId };

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsByStatus
    ] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.countDocuments({
        ...query,
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      Appointment.countDocuments({
        ...query,
        status: 'completed'
      }),
      Appointment.countDocuments({
        ...query,
        status: 'cancelled'
      }),
      Appointment.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      total: totalAppointments,
      upcoming: upcomingAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      byStatus: appointmentsByStatus
    };

    res.json(
      createSuccessResponse(
        'Appointment statistics retrieved successfully',
        { stats }
      )
    );
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve appointment statistics')
    );
  }
});

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json(
        createErrorResponse('Appointment not found')
      );
    }

    // Check if user has permission to update this appointment
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId && appointment.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied to update this appointment')
      );
    }

    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json(
        createErrorResponse('Invalid status')
      );
    }

    appointment.status = status;
    appointment.metadata.lastModified = new Date();
    appointment.metadata.modifiedBy = req.user._id;

    await appointment.save();

    // Populate the appointment data
    await appointment.populate('patientId', 'name email phone');
    if (appointment.doctorId) {
      await appointment.populate('doctorId', 'name email phone');
    }

    res.json(
      createSuccessResponse(
        'Appointment status updated successfully',
        { appointment }
      )
    );
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json(
      createErrorResponse('Failed to update appointment status')
    );
  }
});

module.exports = router;
