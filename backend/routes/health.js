const express = require('express');
const { body, validationResult } = require('express-validator');
const VitalSigns = require('../models/VitalSigns');
const HealthReport = require('../models/HealthReport');
const Notification = require('../models/Notification');
const User = require('../models/User');

const { protect, checkFamilyAccess } = require('../middleware/auth');
const {
  createSuccessResponse,
  createErrorResponse,
  paginate,
  createPaginationInfo,
  calculateBMI
} = require('../utils/helpers');

const router = express.Router();

// @desc    Get vital signs for user
// @route   GET /api/health/vitals
// @access  Private
router.get('/vitals', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate,
      userId
    } = req.query;

    // Determine which user's vitals to fetch
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
          connection.permissions.viewVitals
        );

        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view vitals')
          );
        }
      }

      targetUserId = userId;
    }

    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { userId: targetUserId };

    // Add date range filter
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const [vitals, total] = await Promise.all([
      VitalSigns.find(query)
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email'),
      VitalSigns.countDocuments(query)
    ]);

    const pagination = createPaginationInfo(total, parseInt(page), limitNum);

    res.json(
      createSuccessResponse(
        'Vital signs retrieved successfully',
        { vitals },
        { pagination }
      )
    );
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve vital signs')
    );
  }
});

// @desc    Add vital signs (Simple version for embedded storage)
// @route   POST /api/health/vitals-simple
// @access  Private
router.post('/vitals-simple', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.healthData) {
      user.healthData = { vitals: [], medications: [], medicationLogs: [] };
    }

    if (!user.healthData.vitals) {
      user.healthData.vitals = [];
    }

    const vitalData = {
      bloodPressure: req.body.bloodPressure,
      heartRate: req.body.heartRate,
      bloodSugar: req.body.bloodSugar,
      weight: req.body.weight,
      temperature: req.body.temperature,
      oxygenSaturation: req.body.oxygenSaturation,
      recordedAt: req.body.recordedAt || new Date()
    };

    user.healthData.vitals.push(vitalData);
    await user.save();

    console.log('✅ Vitals recorded for user:', user.email);

    res.json(
      createSuccessResponse('Vitals recorded successfully', vitalData)
    );
  } catch (error) {
    console.error('Error recording vitals:', error);
    res.status(500).json(
      createErrorResponse('Error recording vitals')
    );
  }
});

// @desc    Get vital signs (Simple version for embedded storage)
// @route   GET /api/health/vitals-simple
// @access  Private
router.get('/vitals-simple', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const vitals = user.healthData?.vitals || [];

    // Sort by most recent first
    vitals.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

    res.json(
      createSuccessResponse('Vitals retrieved successfully', vitals)
    );
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json(
      createErrorResponse('Error fetching vitals')
    );
  }
});

// @desc    Add vital signs
// @route   POST /api/health/vitals
// @access  Private
router.post('/vitals', protect, [
  body('bloodPressure.systolic')
    .optional()
    .isInt({ min: 50, max: 300 })
    .withMessage('Systolic pressure must be between 50 and 300'),
  body('bloodPressure.diastolic')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Diastolic pressure must be between 30 and 200'),
  body('heartRate.value')
    .optional()
    .isInt({ min: 30, max: 250 })
    .withMessage('Heart rate must be between 30 and 250'),
  body('bloodSugar.value')
    .optional()
    .isFloat({ min: 20, max: 600 })
    .withMessage('Blood sugar must be between 20 and 600'),
  body('weight.value')
    .optional()
    .isFloat({ min: 10, max: 500 })
    .withMessage('Weight must be between 10 and 500'),
  body('height.value')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('Height must be between 50 and 250'),
  body('temperature.value')
    .optional()
    .isFloat({ min: 30, max: 50 })
    .withMessage('Temperature must be between 30 and 50')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const vitalData = {
      userId: req.body.userId || req.user._id,
      ...req.body,
      recordedBy: req.user.role === 'doctor' ? 'doctor' : 'self',
      recordedAt: req.body.recordedAt || new Date()
    };

    // If adding vitals for another user, check permissions
    if (vitalData.userId.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'doctor') {
        return res.status(403).json(
          createErrorResponse('Only doctors can add vitals for other users')
        );
      }
    }

    const vital = new VitalSigns(vitalData);
    await vital.save();

    // Check for critical values and create alerts
    const alerts = vital.checkCriticalValues();
    if (alerts.length > 0) {
      for (const alert of alerts) {
        if (alert.type === 'critical') {
          try {
            await Notification.createVitalsAlert(
              vital.userId,
              vital,
              alert.message.includes('blood pressure') ? 'high_bp' : 'high_glucose'
            );
          } catch (notificationError) {
            console.error('Failed to create vitals alert:', notificationError);
          }
        }
      }
    }

    await vital.populate('userId', 'name email');

    res.status(201).json(
      createSuccessResponse(
        'Vital signs recorded successfully',
        { vital }
      )
    );
  } catch (error) {
    console.error('Add vitals error:', error);
    res.status(500).json(
      createErrorResponse('Failed to record vital signs')
    );
  }
});

// @desc    Get health reports for user
// @route   GET /api/health/reports
// @access  Private
router.get('/reports', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      userId
    } = req.query;

    // Determine which user's reports to fetch
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
          connection.userId.toString() === req.user._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view reports')
          );
        }
      }

      targetUserId = userId;
    }

    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { userId: targetUserId };

    // Add filters
    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
      HealthReport.find(query)
        .sort({ reportDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email')
        .select('-ocrData -aiAnalysis'), // Exclude large fields for list view
      HealthReport.countDocuments(query)
    ]);

    const pagination = createPaginationInfo(total, parseInt(page), limitNum);

    res.json(
      createSuccessResponse(
        'Health reports retrieved successfully',
        { reports },
        { pagination }
      )
    );
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve health reports')
    );
  }
});

// @desc    Get single health report
// @route   GET /api/health/reports/:id
// @access  Private
router.get('/reports/:id', protect, async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('relatedAppointment', 'doctorName date time');

    if (!report) {
      return res.status(404).json(
        createErrorResponse('Health report not found')
      );
    }

    // Check if user has access to this report
    if (!report.hasAccess(req.user._id, 'view')) {
      return res.status(403).json(
        createErrorResponse('Access denied to view this report')
      );
    }

    // Log access
    await report.logAccess(req.user._id, 'viewed', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(
      createSuccessResponse(
        'Health report retrieved successfully',
        { report }
      )
    );
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve health report')
    );
  }
});

// @desc    Upload health report
// @route   POST /api/health/reports
// @access  Private
router.post('/reports', protect, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Report name must be between 1 and 200 characters'),
  body('type')
    .isIn([
      'lab_test', 'diagnostic_imaging', 'prescription', 'discharge_summary',
      'consultation_notes', 'vaccination_record', 'insurance_document',
      'bill_receipt', 'other'
    ])
    .withMessage('Invalid report type'),
  body('category')
    .isIn([
      'blood_work', 'urine_test', 'stool_test', 'x_ray', 'ct_scan', 'mri',
      'ultrasound', 'ecg', 'echo', 'endoscopy', 'biopsy', 'pathology',
      'radiology', 'cardiology', 'neurology', 'orthopedics', 'general', 'other'
    ])
    .withMessage('Invalid report category'),
  body('provider.name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Provider name is required'),
  body('reportDate')
    .isISO8601()
    .withMessage('Valid report date is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const reportData = {
      userId: req.body.userId || req.user._id,
      name: req.body.name,
      type: req.body.type,
      category: req.body.category,
      provider: req.body.provider,
      reportDate: new Date(req.body.reportDate),
      testDate: req.body.testDate ? new Date(req.body.testDate) : undefined,
      files: req.body.files || [],
      content: req.body.content || {},
      notes: req.body.notes,
      tags: req.body.tags || [],
      metadata: {
        uploadedBy: req.user._id,
        source: 'app_upload'
      }
    };

    // If uploading report for another user, check permissions
    if (reportData.userId !== req.user._id.toString()) {
      if (req.user.role !== 'doctor') {
        return res.status(403).json(
          createErrorResponse('Only doctors can upload reports for other users')
        );
      }
    }

    const report = new HealthReport(reportData);
    await report.save();

    await report.populate('userId', 'name email');

    res.status(201).json(
      createSuccessResponse(
        'Health report uploaded successfully',
        { report }
      )
    );
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json(
      createErrorResponse('Failed to upload health report')
    );
  }
});

// @desc    Get health statistics
// @route   GET /api/health/stats
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
          connection.permissions.viewVitals
        );

        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view health stats')
          );
        }
      }

      targetUserId = userId;
    }

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const [
      recentVitals,
      totalReports,
      vitalsCount
    ] = await Promise.all([
      VitalSigns.find({
        userId: targetUserId,
        recordedAt: { $gte: startDate }
      }).sort({ recordedAt: -1 }).limit(10),
      HealthReport.countDocuments({ userId: targetUserId }),
      VitalSigns.countDocuments({
        userId: targetUserId,
        recordedAt: { $gte: startDate }
      })
    ]);

    // Calculate averages and trends
    const stats = {
      period: periodDays,
      vitalsRecorded: vitalsCount,
      reportsUploaded: totalReports,
      averages: {},
      trends: {},
      alerts: []
    };

    if (recentVitals.length > 0) {
      // Calculate averages
      const bpReadings = recentVitals.filter(v => v.bloodPressure && v.bloodPressure.systolic);
      const hrReadings = recentVitals.filter(v => v.heartRate && v.heartRate.value);
      const bsReadings = recentVitals.filter(v => v.bloodSugar && v.bloodSugar.value);

      if (bpReadings.length > 0) {
        stats.averages.bloodPressure = {
          systolic: Math.round(bpReadings.reduce((sum, v) => sum + v.bloodPressure.systolic, 0) / bpReadings.length),
          diastolic: Math.round(bpReadings.reduce((sum, v) => sum + v.bloodPressure.diastolic, 0) / bpReadings.length)
        };
      }

      if (hrReadings.length > 0) {
        stats.averages.heartRate = Math.round(hrReadings.reduce((sum, v) => sum + v.heartRate.value, 0) / hrReadings.length);
      }

      if (bsReadings.length > 0) {
        stats.averages.bloodSugar = Math.round(bsReadings.reduce((sum, v) => sum + v.bloodSugar.value, 0) / bsReadings.length);
      }

      // Check for concerning patterns
      const highBPCount = bpReadings.filter(v => v.bloodPressure.systolic > 140 || v.bloodPressure.diastolic > 90).length;
      const highBSCount = bsReadings.filter(v => v.bloodSugar.value > 180).length;

      if (highBPCount > bpReadings.length * 0.5) {
        stats.alerts.push({
          type: 'warning',
          message: 'Frequent high blood pressure readings detected'
        });
      }

      if (highBSCount > bsReadings.length * 0.5) {
        stats.alerts.push({
          type: 'warning',
          message: 'Frequent high blood sugar readings detected'
        });
      }
    }

    res.json(
      createSuccessResponse(
        'Health statistics retrieved successfully',
        { stats }
      )
    );
  } catch (error) {
    console.error('Get health stats error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve health statistics')
    );
  }
});

// @desc    Add medication
// @route   POST /api/health/medications
// @access  Private
router.post('/medications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.healthData) {
      user.healthData = { vitals: [], medications: [], medicationLogs: [] };
    }

    if (!user.healthData.medications) {
      user.healthData.medications = [];
    }

    const medicationData = {
      _id: new Date().getTime().toString(),
      name: req.body.name,
      dosage: req.body.dosage,
      frequency: req.body.frequency,
      times: req.body.times,
      instructions: req.body.instructions,
      isActive: true,
      createdAt: new Date()
    };

    user.healthData.medications.push(medicationData);
    await user.save();

    console.log('✅ Medication added for user:', user.email, '- Medication:', req.body.name);

    res.json(
      createSuccessResponse('Medication added successfully', { medication: medicationData })
    );
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json(
      createErrorResponse('Failed to add medication')
    );
  }
});

// @desc    Get medications
// @route   GET /api/health/medications
// @access  Private
router.get('/medications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const medications = user.healthData?.medications?.filter(med => med.isActive) || [];

    res.json(
      createSuccessResponse('Medications retrieved successfully', medications)
    );
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve medications')
    );
  }
});

// @desc    Log medication taken with optional photo verification
// @route   POST /api/health/medication-logs
// @access  Private
router.post('/medication-logs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.healthData) {
      user.healthData = { vitals: [], medications: [], medicationLogs: [] };
    }

    if (!user.healthData.medicationLogs) {
      user.healthData.medicationLogs = [];
    }

    const logData = {
      medicationId: req.body.medicationId,
      scheduledTime: req.body.scheduledTime,
      takenAt: req.body.takenAt || new Date(),
      status: req.body.status || 'taken',
      verificationPhoto: req.body.verificationPhoto || null,
      photoTimestamp: req.body.verificationPhoto ? new Date() : null,
      location: req.body.location || null,
      notes: req.body.notes || null,
      createdAt: new Date()
    };

    user.healthData.medicationLogs.push(logData);
    await user.save();

    console.log('✅ Medication logged for user:', user.email, '- Status:', req.body.status);

    // Notify family members if medication was missed and they have alert permissions
    if (req.body.status === 'missed') {
      await notifyFamilyMembers(user, 'medication_missed', {
        medicationId: req.body.medicationId,
        scheduledTime: req.body.scheduledTime,
        patientName: user.name
      });
    }

    res.json(
      createSuccessResponse('Medication logged successfully', logData)
    );
  } catch (error) {
    console.error('Error logging medication:', error);
    res.status(500).json(
      createErrorResponse('Failed to log medication')
    );
  }
});

// @desc    Get medication logs
// @route   GET /api/health/medication-logs
// @access  Private
router.get('/medication-logs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let logs = user.healthData?.medicationLogs || [];

    if (req.query.date) {
      logs = logs.filter(log =>
        log.createdAt.toISOString().split('T')[0] === req.query.date
      );
    }

    res.json(
      createSuccessResponse('Medication logs retrieved successfully', logs)
    );
  } catch (error) {
    console.error('Error fetching medication logs:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve medication logs')
    );
  }
});

// @desc    Get medication stats
// @route   GET /api/health/medication-stats
// @access  Private
router.get('/medication-stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const logs = user.healthData?.medicationLogs || [];
    const medications = user.healthData?.medications?.filter(med => med.isActive) || [];

    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayLogs = logs.filter(log =>
        log.createdAt.toISOString().split('T')[0] === dateStr && log.status === 'taken'
      );

      const totalRequired = medications.reduce((total, med) => total + med.times.length, 0);

      if (totalRequired === 0 || dayLogs.length < totalRequired) {
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);

      if (streak > 365) break;
    }

    const points = logs.filter(log => log.status === 'taken').length * 10;

    res.json(
      createSuccessResponse('Medication stats retrieved successfully', {
        streak,
        points,
        totalMedications: medications.length,
        totalLogs: logs.length
      })
    );
  } catch (error) {
    console.error('Error fetching medication stats:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve medication stats')
    );
  }
});

// @desc    Get patients for doctor
// @route   GET /api/health/doctor/patients
// @access  Private (Doctor only)
router.get('/doctor/patients', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied. Doctor role required.')
      );
    }

    // Find patients who have granted access to this doctor
    const patients = await User.find({
      'familyConnections.email': req.user.email,
      'familyConnections.role': 'doctor',
      'familyConnections.status': 'accepted'
    }).select('name email age gender phone healthData.vitals healthData.medications');

    res.json(createSuccessResponse('Patients retrieved successfully', patients));
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json(createErrorResponse('Failed to fetch patients'));
  }
});

// @desc    Get connected patients for family/caregiver
// @route   GET /api/health/family/connected-patients
// @access  Private (Family/Caregiver only)
router.get('/family/connected-patients', protect, async (req, res) => {
  try {
    if (!['family', 'caregiver'].includes(req.user.role)) {
      return res.status(403).json(
        createErrorResponse('Access denied. Family or caregiver role required.')
      );
    }

    // Find patients who have granted access to this family member/caregiver
    const patients = await User.find({
      'familyConnections.email': req.user.email,
      'familyConnections.role': { $in: ['family', 'caregiver'] },
      'familyConnections.status': 'accepted'
    }).select('name email age gender phone healthData.vitals healthData.medications healthData.medicationLogs');

    // Calculate medication compliance for each patient
    const patientsWithStats = patients.map(patient => {
      const logs = patient.healthData?.medicationLogs || [];
      const totalLogs = logs.length;
      const takenLogs = logs.filter(log => log.status === 'taken').length;
      const compliance = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;

      return {
        ...patient.toObject(),
        medicationCompliance: compliance,
        recentVitals: patient.healthData?.vitals?.[0] || null,
        alerts: logs.filter(log => log.status === 'missed').length
      };
    });

    res.json(createSuccessResponse('Connected patients retrieved successfully', patientsWithStats));
  } catch (error) {
    console.error('Error fetching connected patients:', error);
    res.status(500).json(createErrorResponse('Failed to fetch connected patients'));
  }
});

// @desc    Get alerts for family/caregiver
// @route   GET /api/health/family/alerts
// @access  Private (Family/Caregiver only)
router.get('/family/alerts', protect, async (req, res) => {
  try {
    if (!['family', 'caregiver'].includes(req.user.role)) {
      return res.status(403).json(
        createErrorResponse('Access denied. Family or caregiver role required.')
      );
    }

    // Find patients connected to this family member/caregiver
    const patients = await User.find({
      'familyConnections.email': req.user.email,
      'familyConnections.role': { $in: ['family', 'caregiver'] },
      'familyConnections.status': 'accepted'
    }).select('name healthData.medicationLogs healthData.vitals');

    const alerts = [];

    patients.forEach(patient => {
      const logs = patient.healthData?.medicationLogs || [];
      const vitals = patient.healthData?.vitals || [];

      // Check for missed medications
      const missedMeds = logs.filter(log =>
        log.status === 'missed' &&
        new Date(log.scheduledTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      missedMeds.forEach(log => {
        alerts.push({
          _id: `med_${log._id}`,
          patientName: patient.name,
          type: 'medication_missed',
          message: `Missed medication: ${log.medicationName || 'Unknown medication'}`,
          timestamp: log.scheduledTime,
          severity: 'medium'
        });
      });

      // Check for critical vitals
      const recentVitals = vitals.slice(0, 3); // Last 3 readings
      recentVitals.forEach(vital => {
        if (vital.bloodPressure?.systolic > 140 || vital.bloodPressure?.diastolic > 90) {
          alerts.push({
            _id: `vital_${vital._id}`,
            patientName: patient.name,
            type: 'vitals_alert',
            message: `Blood pressure reading above normal range (${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic})`,
            timestamp: vital.recordedAt,
            severity: 'high'
          });
        }
      });
    });

    // Sort alerts by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(createSuccessResponse('Alerts retrieved successfully', alerts));
  } catch (error) {
    console.error('Error fetching family alerts:', error);
    res.status(500).json(createErrorResponse('Failed to fetch alerts'));
  }
});

// Helper function to notify family members
async function notifyFamilyMembers(patient, alertType, data) {
  try {
    const familyMembers = patient.familyConnections.filter(
      connection => connection.status === 'active' && connection.permissions.receiveAlerts
    );

    for (const connection of familyMembers) {
      if (connection.userId) {
        const familyMember = await User.findById(connection.userId);
        if (familyMember && familyMember.notificationPreferences.medication) {
          console.log(`🔔 Notifying ${familyMember.email} about ${alertType} for ${data.patientName}`);

          // Here you would integrate with your notification service
          // await sendEmailNotification(familyMember, alertType, data);
          // await sendSMSNotification(familyMember, alertType, data);
        }
      }
    }
  } catch (error) {
    console.error('Error notifying family members:', error);
  }
}

// @desc    Send connection request
// @route   POST /api/health/connection-request
// @access  Private
router.post('/connection-request', protect, async (req, res) => {
  try {
    const { targetEmail, myRole, relationship, message } = req.body;

    if (!targetEmail || !myRole) {
      return res.status(400).json(createErrorResponse('Target email and your role are required'));
    }

    // Find target user
    const targetUser = await User.findOne({ email: targetEmail });
    if (!targetUser) {
      return res.status(404).json(createErrorResponse('User not found with this email'));
    }

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json(createErrorResponse('Cannot send connection request to yourself'));
    }

    // Check if connection already exists
    const existingConnection = targetUser.familyConnections.find(
      conn => conn.email === req.user.email
    );

    if (existingConnection) {
      return res.status(400).json(createErrorResponse('Connection already exists'));
    }

    // Add to sender's sent requests
    const sender = await User.findById(req.user.id);
    const existingSentRequest = sender.sentConnectionRequests.find(
      req => req.targetEmail === targetEmail
    );

    if (existingSentRequest) {
      return res.status(400).json(createErrorResponse('Connection request already sent'));
    }

    sender.sentConnectionRequests.push({
      targetUserId: targetUser._id,
      targetEmail: targetEmail,
      targetName: targetUser.name,
      myRole: myRole,
      relationship: relationship,
      message: message,
      status: 'pending'
    });

    // Add to target user's family connections as pending
    targetUser.familyConnections.push({
      userId: sender._id,
      email: sender.email,
      name: sender.name,
      role: myRole,
      relationship: relationship,
      status: 'pending',
      invitedBy: sender._id,
      invitedAt: new Date(),
      permissions: {
        viewMedications: true,
        viewVitals: true,
        viewAppointments: true,
        receiveAlerts: true
      }
    });

    await sender.save();
    await targetUser.save();

    console.log(`📨 Connection request sent from ${sender.email} to ${targetEmail} as ${myRole}`);

    res.json(createSuccessResponse('Connection request sent successfully'));
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json(createErrorResponse('Failed to send connection request'));
  }
});

// @desc    Respond to connection request
// @route   POST /api/health/connection-response
// @access  Private
router.post('/connection-response', protect, async (req, res) => {
  try {
    const { connectionId, response } = req.body; // response: 'accept' or 'decline'

    if (!connectionId || !response) {
      return res.status(400).json(createErrorResponse('Connection ID and response are required'));
    }

    const user = await User.findById(req.user.id);
    const connection = user.familyConnections.id(connectionId);

    if (!connection) {
      return res.status(404).json(createErrorResponse('Connection request not found'));
    }

    if (connection.status !== 'pending') {
      return res.status(400).json(createErrorResponse('Connection request already processed'));
    }

    if (response === 'accept') {
      connection.status = 'active';
      connection.acceptedAt = new Date();

      // Update sender's sent request status
      const sender = await User.findById(connection.userId);
      if (sender) {
        const sentRequest = sender.sentConnectionRequests.find(
          req => req.targetUserId.toString() === user._id.toString()
        );
        if (sentRequest) {
          sentRequest.status = 'accepted';
        }
        await sender.save();
      }

      console.log(`✅ Connection accepted: ${connection.email} -> ${user.email} as ${connection.role}`);
    } else {
      connection.status = 'declined';

      // Update sender's sent request status
      const sender = await User.findById(connection.userId);
      if (sender) {
        const sentRequest = sender.sentConnectionRequests.find(
          req => req.targetUserId.toString() === user._id.toString()
        );
        if (sentRequest) {
          sentRequest.status = 'declined';
        }
        await sender.save();
      }

      console.log(`❌ Connection declined: ${connection.email} -> ${user.email}`);
    }

    await user.save();

    res.json(createSuccessResponse(`Connection request ${response}ed successfully`));
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json(createErrorResponse('Failed to respond to connection request'));
  }
});

// @desc    Get pending connection requests
// @route   GET /api/health/pending-connections
// @access  Private
router.get('/pending-connections', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const pendingRequests = user.familyConnections.filter(
      conn => conn.status === 'pending'
    );

    res.json(createSuccessResponse('Pending connection requests retrieved', pendingRequests));
  } catch (error) {
    console.error('Error getting pending connections:', error);
    res.status(500).json(createErrorResponse('Failed to get pending connections'));
  }
});

// @desc    Get my connections
// @route   GET /api/health/my-connections
// @access  Private
router.get('/my-connections', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const activeConnections = user.familyConnections.filter(
      conn => conn.status === 'active'
    );

    const sentRequests = user.sentConnectionRequests || [];

    res.json(createSuccessResponse('Connections retrieved', {
      received: activeConnections,
      sent: sentRequests
    }));
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json(createErrorResponse('Failed to get connections'));
  }
});

module.exports = router;
