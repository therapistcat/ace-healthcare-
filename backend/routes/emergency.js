const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { createSuccessResponse, createErrorResponse } = require('../utils/helpers');

const router = express.Router();

// @desc    Trigger an emergency alert for a patient
// @route   POST /api/emergency/alert
// @access  Private (patient, family, caregiver, doctor)
router.post(
  '/alert',
  protect,
  [
    body('patientId').optional().isMongoId().withMessage('Invalid patientId'),
    body('message').optional().isLength({ min: 3, max: 500 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createErrorResponse('Validation failed', errors.array()));
      }

      // Determine target patient
      let patientId = req.body.patientId || req.user._id.toString();

      // Access control
      if (req.user.role === 'family' || req.user.role === 'caregiver') {
        // Family/caregiver must be connected to the patient
        const patient = await User.findById(patientId);
        if (!patient) return res.status(404).json(createErrorResponse('Patient not found'));
        const isConnected = patient.familyConnections.some(
          (c) => c.userId.toString() === req.user._id.toString()
        );
        if (!isConnected) {
          return res.status(403).json(createErrorResponse('Access denied for this patient'));
        }
      } else if (req.user.role === 'doctor') {
        // Allowed for provided patientId
        if (!patientId) {
          return res.status(400).json(createErrorResponse('patientId is required for doctors'));
        }
      } else if (req.user.role === 'patient') {
        // Patient can trigger only for self
        patientId = req.user._id.toString();
      }

      const patient = await User.findById(patientId);
      if (!patient) return res.status(404).json(createErrorResponse('Patient not found'));

      const title = 'Emergency Alert';
      const baseMessage = req.body.message || 'Immediate assistance required';

      const notifications = [];

      // Notify patient
      notifications.push(
        new Notification({
          userId: patient._id,
          type: 'emergency_alert',
          title,
          message: baseMessage,
          priority: 'urgent',
          category: 'health',
          metadata: { source: 'manual', triggeredBy: req.user._id },
        })
      );

      // Notify family/caregiver connections
      if (Array.isArray(patient.familyConnections)) {
        patient.familyConnections.forEach((conn) => {
          notifications.push(
            new Notification({
              userId: conn.userId,
              type: 'emergency_alert',
              title: `Emergency: ${patient.name}`,
              message: `${baseMessage}. Relationship: ${conn.relationship || 'family/caregiver'}`,
              priority: 'urgent',
              category: 'health',
              metadata: { source: 'manual', patientId: patient._id },
            })
          );
        });
      }

      await Notification.insertMany(notifications);

      return res.status(201).json(
        createSuccessResponse('Emergency alerts sent', {
          count: notifications.length,
          patient: { id: patient._id, name: patient.name },
        })
      );
    } catch (error) {
      console.error('Emergency alert error:', error);
      return res.status(500).json(createErrorResponse('Failed to trigger emergency alert'));
    }
  }
);

// @desc    List curated emergency videos (CPR, choking, bleeding, etc.)
// @route   GET /api/emergency/videos
// @access  Public
router.get('/videos', async (_req, res) => {
  try {
    const videos = [
      {
        id: 'cpr-en',
        title: {
          en: 'Hands-only CPR (Adult) - Quick Guide',
          hi: 'हैंड्स-ओनली सीपीआर (वयस्क) - त्वरित गाइड',
        },
        url: 'https://www.youtube.com/watch?v=M4ACYp75mjU',
        category: 'cpr',
      },
      {
        id: 'cpr-child',
        title: {
          en: 'CPR for Children - Step by Step',
          hi: 'बच्चों के लिए सीपीआर - चरण दर चरण',
        },
        url: 'https://www.youtube.com/watch?v=51M5ZtK8bfs',
        category: 'cpr',
      },
      {
        id: 'choking',
        title: { en: 'Heimlich Maneuver (Choking)', hi: 'गला घुटने पर क्या करें (हैम्लिक तकनीक)' },
        url: 'https://www.youtube.com/watch?v=Qt1WkpY9LQo',
        category: 'choking',
      },
      {
        id: 'bleeding',
        title: { en: 'Severe Bleeding Control', hi: 'गंभीर रक्तस्राव नियंत्रण' },
        url: 'https://www.youtube.com/watch?v=3QnZJd8b32c',
        category: 'bleeding',
      },
    ];

    return res.json(createSuccessResponse('Emergency videos', { videos }));
  } catch (error) {
    console.error('Emergency videos error:', error);
    return res.status(500).json(createErrorResponse('Failed to load emergency videos'));
  }
});

module.exports = router;

