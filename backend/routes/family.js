const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Medication = require('../models/Medication');
const VitalSigns = require('../models/VitalSigns');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { 
  createSuccessResponse, 
  createErrorResponse,
  sanitizeInput
} = require('../utils/helpers');

const router = express.Router();

// @desc    Get family dashboard data
// @route   GET /api/family/dashboard
// @access  Private (Family members only)
router.get('/dashboard', protect, authorize('family'), async (req, res) => {
  try {
    const familyMember = await User.findById(req.user._id)
      .populate('familyConnections.userId', 'name email age gender role');

    if (!familyMember || familyMember.familyConnections.length === 0) {
      return res.status(404).json(
        createErrorResponse('No family connections found')
      );
    }

    const dashboardData = [];

    // Get data for each connected family member
    for (const connection of familyMember.familyConnections) {
      const patientId = connection.userId._id;
      const patient = connection.userId;

      // Get recent medications
      const medications = await Medication.find({
        userId: patientId,
        isActive: true
      }).sort({ nextDose: 1 }).limit(5);

      // Get recent vitals
      const recentVitals = await VitalSigns.findOne({
        userId: patientId
      }).sort({ recordedAt: -1 });

      // Get upcoming appointments
      const upcomingAppointments = await Appointment.find({
        patientId,
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      }).sort({ date: 1 }).limit(3);

      // Get recent alerts/notifications
      const recentAlerts = await Notification.find({
        userId: patientId,
        priority: { $in: ['high', 'urgent'] },
        isRead: false
      }).sort({ createdAt: -1 }).limit(5);

      // Calculate medication adherence
      const adherenceStats = medications.length > 0 
        ? medications.reduce((sum, med) => sum + med.adherence, 0) / medications.length
        : 0;

      // Determine health status
      let healthStatus = 'good';
      if (recentAlerts.length > 0) {
        healthStatus = 'needs_attention';
      } else if (adherenceStats < 80) {
        healthStatus = 'monitoring';
      }

      dashboardData.push({
        patient: {
          id: patient._id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          relationship: connection.relationship
        },
        healthStatus,
        adherenceScore: Math.round(adherenceStats),
        medications: {
          total: medications.length,
          due: medications.filter(med => med.isDue()).length,
          lowStock: medications.filter(med => med.isLowStock()).length
        },
        vitals: recentVitals ? {
          bloodPressure: recentVitals.bloodPressure,
          heartRate: recentVitals.heartRate,
          bloodSugar: recentVitals.bloodSugar,
          recordedAt: recentVitals.recordedAt
        } : null,
        upcomingAppointments: upcomingAppointments.length,
        alerts: recentAlerts.length,
        permissions: connection.permissions,
        lastUpdated: new Date()
      });
    }

    res.json(
      createSuccessResponse(
        'Family dashboard data retrieved successfully',
        { familyMembers: dashboardData }
      )
    );
  } catch (error) {
    console.error('Get family dashboard error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve family dashboard data')
    );
  }
});

// @desc    Get detailed patient data for family member
// @route   GET /api/family/patient/:patientId
// @access  Private (Family members only)
router.get('/patient/:patientId', protect, authorize('family'), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if family member has access to this patient
    const familyMember = await User.findById(req.user._id);
    const connection = familyMember.familyConnections.find(
      conn => conn.userId.toString() === patientId
    );

    if (!connection) {
      return res.status(403).json(
        createErrorResponse('Access denied to view this patient\'s data')
      );
    }

    // Get patient basic info
    const patient = await User.findById(patientId)
      .select('name email age gender address emergencyContact');

    if (!patient) {
      return res.status(404).json(
        createErrorResponse('Patient not found')
      );
    }

    const patientData = {
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        relationship: connection.relationship
      },
      permissions: connection.permissions
    };

    // Get medications if permission granted
    if (connection.permissions.viewMedications) {
      const medications = await Medication.find({
        userId: patientId,
        isActive: true
      }).sort({ nextDose: 1 });

      patientData.medications = {
        list: medications,
        stats: {
          total: medications.length,
          due: medications.filter(med => med.isDue()).length,
          lowStock: medications.filter(med => med.isLowStock()).length,
          averageAdherence: medications.length > 0 
            ? Math.round(medications.reduce((sum, med) => sum + med.adherence, 0) / medications.length)
            : 0
        }
      };
    }

    // Get vitals if permission granted
    if (connection.permissions.viewVitals) {
      const vitals = await VitalSigns.find({
        userId: patientId
      }).sort({ recordedAt: -1 }).limit(10);

      patientData.vitals = {
        recent: vitals,
        latest: vitals[0] || null
      };
    }

    // Get appointments if permission granted
    if (connection.permissions.viewAppointments) {
      const appointments = await Appointment.find({
        patientId,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).sort({ date: -1 });

      patientData.appointments = {
        recent: appointments,
        upcoming: appointments.filter(apt => 
          apt.date >= new Date() && ['scheduled', 'confirmed'].includes(apt.status)
        )
      };
    }

    // Get alerts/notifications
    const alerts = await Notification.find({
      userId: patientId,
      priority: { $in: ['medium', 'high', 'urgent'] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ createdAt: -1 }).limit(10);

    patientData.alerts = alerts;

    res.json(
      createSuccessResponse(
        'Patient data retrieved successfully',
        patientData
      )
    );
  } catch (error) {
    console.error('Get patient data error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve patient data')
    );
  }
});

// @desc    Send alert to patient
// @route   POST /api/family/patient/:patientId/alert
// @access  Private (Family members only)
router.post('/patient/:patientId/alert', protect, authorize('family'), [
  body('type')
    .isIn(['medication_reminder', 'health_check', 'appointment_reminder', 'emergency', 'general'])
    .withMessage('Invalid alert type'),
  body('message')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { patientId } = req.params;
    const { type, message, priority = 'medium' } = req.body;

    // Check if family member has access to this patient
    const familyMember = await User.findById(req.user._id);
    const connection = familyMember.familyConnections.find(
      conn => conn.userId.toString() === patientId
    );

    if (!connection) {
      return res.status(403).json(
        createErrorResponse('Access denied to send alerts to this patient')
      );
    }

    // Create notification
    const notification = new Notification({
      userId: patientId,
      type: 'family_alert',
      title: `Message from ${req.user.name}`,
      message: sanitizeInput(message),
      priority,
      category: 'family',
      relatedData: {
        familyMemberId: req.user._id
      },
      metadata: {
        source: 'family_member',
        alertType: type
      }
    });

    await notification.save();

    res.status(201).json(
      createSuccessResponse(
        'Alert sent successfully',
        { notification }
      )
    );
  } catch (error) {
    console.error('Send alert error:', error);
    res.status(500).json(
      createErrorResponse('Failed to send alert')
    );
  }
});

// @desc    Get family member activity log
// @route   GET /api/family/activity
// @access  Private (Family members only)
router.get('/activity', protect, authorize('family'), async (req, res) => {
  try {
    const { patientId, limit = 20 } = req.query;

    // Get family member's connections
    const familyMember = await User.findById(req.user._id);
    let patientIds = familyMember.familyConnections.map(conn => conn.userId);

    // Filter by specific patient if requested
    if (patientId) {
      const hasAccess = familyMember.familyConnections.some(
        conn => conn.userId.toString() === patientId
      );
      
      if (!hasAccess) {
        return res.status(403).json(
          createErrorResponse('Access denied to view this patient\'s activity')
        );
      }
      
      patientIds = [patientId];
    }

    // Get recent activities
    const activities = [];

    // Recent medication activities
    const recentMedications = await Medication.find({
      userId: { $in: patientIds },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('userId', 'name').sort({ updatedAt: -1 }).limit(parseInt(limit) / 3);

    recentMedications.forEach(med => {
      activities.push({
        type: 'medication',
        action: 'updated',
        description: `${med.userId.name} updated medication: ${med.name}`,
        timestamp: med.updatedAt,
        patientId: med.userId._id,
        patientName: med.userId.name,
        data: { medicationName: med.name }
      });
    });

    // Recent vital signs
    const recentVitals = await VitalSigns.find({
      userId: { $in: patientIds },
      recordedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('userId', 'name').sort({ recordedAt: -1 }).limit(parseInt(limit) / 3);

    recentVitals.forEach(vital => {
      activities.push({
        type: 'vitals',
        action: 'recorded',
        description: `${vital.userId.name} recorded vital signs`,
        timestamp: vital.recordedAt,
        patientId: vital.userId._id,
        patientName: vital.userId.name,
        data: {
          bloodPressure: vital.bloodPressure,
          heartRate: vital.heartRate,
          bloodSugar: vital.bloodSugar
        }
      });
    });

    // Recent appointments
    const recentAppointments = await Appointment.find({
      patientId: { $in: patientIds },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('patientId', 'name').sort({ updatedAt: -1 }).limit(parseInt(limit) / 3);

    recentAppointments.forEach(apt => {
      activities.push({
        type: 'appointment',
        action: apt.status,
        description: `${apt.patientId.name} ${apt.status} appointment with Dr. ${apt.doctorName}`,
        timestamp: apt.updatedAt,
        patientId: apt.patientId._id,
        patientName: apt.patientId.name,
        data: {
          doctorName: apt.doctorName,
          date: apt.date,
          status: apt.status
        }
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(
      createSuccessResponse(
        'Family activity log retrieved successfully',
        { activities: activities.slice(0, parseInt(limit)) }
      )
    );
  } catch (error) {
    console.error('Get family activity error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve family activity log')
    );
  }
});

// @desc    Update family connection permissions
// @route   PUT /api/family/permissions/:patientId
// @access  Private (Family members only)
router.put('/permissions/:patientId', protect, authorize('family'), [
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

    const { patientId } = req.params;
    const { permissions } = req.body;

    // Update permissions in family member's connections
    const familyMember = await User.findById(req.user._id);
    const connection = familyMember.familyConnections.find(
      conn => conn.userId.toString() === patientId
    );

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

    await familyMember.save();

    res.json(
      createSuccessResponse(
        'Permissions updated successfully',
        { permissions: connection.permissions }
      )
    );
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json(
      createErrorResponse('Failed to update permissions')
    );
  }
});

// @desc    Get family statistics
// @route   GET /api/family/stats
// @access  Private (Family members only)
router.get('/stats', protect, authorize('family'), async (req, res) => {
  try {
    const familyMember = await User.findById(req.user._id);
    const patientIds = familyMember.familyConnections.map(conn => conn.userId);

    if (patientIds.length === 0) {
      return res.json(
        createSuccessResponse(
          'No family connections found',
          { stats: { totalPatients: 0 } }
        )
      );
    }

    const [
      totalMedications,
      dueMedications,
      lowStockMedications,
      recentVitals,
      upcomingAppointments,
      unreadAlerts
    ] = await Promise.all([
      Medication.countDocuments({
        userId: { $in: patientIds },
        isActive: true
      }),
      Medication.countDocuments({
        userId: { $in: patientIds },
        isActive: true,
        nextDose: { $lte: new Date() }
      }),
      Medication.countDocuments({
        userId: { $in: patientIds },
        isActive: true,
        $expr: { $lte: ['$pillCount', '$lowStockThreshold'] }
      }),
      VitalSigns.countDocuments({
        userId: { $in: patientIds },
        recordedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Appointment.countDocuments({
        patientId: { $in: patientIds },
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      Notification.countDocuments({
        userId: { $in: patientIds },
        priority: { $in: ['high', 'urgent'] },
        isRead: false
      })
    ]);

    const stats = {
      totalPatients: patientIds.length,
      medications: {
        total: totalMedications,
        due: dueMedications,
        lowStock: lowStockMedications
      },
      vitalsRecordedToday: recentVitals,
      upcomingAppointments,
      unreadAlerts
    };

    res.json(
      createSuccessResponse(
        'Family statistics retrieved successfully',
        { stats }
      )
    );
  } catch (error) {
    console.error('Get family stats error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve family statistics')
    );
  }
});

module.exports = router;
