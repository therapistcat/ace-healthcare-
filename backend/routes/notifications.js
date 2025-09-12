const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const User = require('../models/User');

const { protect, checkFamilyAccess } = require('../middleware/auth');
const {
  createSuccessResponse,
  createErrorResponse,
  paginate,
  createPaginationInfo
} = require('../utils/helpers');

const router = express.Router();

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priority,
      read = 'all',
      userId
    } = req.query;

    // Determine which user's notifications to fetch
    let targetUserId = req.user._id;

    if (userId && userId !== req.user._id.toString()) {
      // Check if user has permission to view notifications for this user
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
            createErrorResponse('Access denied to view notifications')
          );
        }
      }

      targetUserId = userId;
    }

    const { skip, limit: limitNum } = paginate(page, limit);

    const query = { userId: targetUserId };

    // Add filters
    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    if (read !== 'all') {
      query.isRead = read === 'true';
    }

    // Don't show expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('relatedData.medicationId', 'name dosage')
        .populate('relatedData.appointmentId', 'doctorName date time')
        .populate('userId', 'name email'),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: targetUserId, isRead: false })
    ]);

    const pagination = createPaginationInfo(total, parseInt(page), limitNum);

    res.json(
      createSuccessResponse(
        'Notifications retrieved successfully',
        { notifications },
        { pagination, unreadCount }
      )
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve notifications')
    );
  }
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedData.medicationId', 'name dosage frequency')
      .populate('relatedData.appointmentId', 'doctorName date time location')
      .populate('userId', 'name email');

    if (!notification) {
      return res.status(404).json(
        createErrorResponse('Notification not found')
      );
    }

    // Check if user has permission to view this notification
    if (notification.userId._id.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'doctor') {
        // Check family access
        const hasAccess = notification.userId.familyConnections.some(connection =>
          connection.userId.toString() === req.user._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view this notification')
          );
        }
      }
    }

    // Mark as read if not already read and user is the owner
    if (!notification.isRead && notification.userId._id.toString() === req.user._id.toString()) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json(
      createSuccessResponse(
        'Notification retrieved successfully',
        { notification }
      )
    );
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve notification')
    );
  }
});

// @desc    Create notification (for doctors/system)
// @route   POST /api/notifications
// @access  Private
router.post('/', protect, [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('type')
    .isIn([
      'medication_reminder', 'medication_missed', 'medication_low_stock',
      'appointment_reminder', 'appointment_confirmed', 'appointment_cancelled',
      'vitals_alert', 'vitals_reminder', 'family_alert', 'system_update',
      'health_tip', 'scheme_eligibility', 'bill_reminder', 'report_ready',
      'emergency_alert'
    ])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('category')
    .isIn(['medication', 'appointment', 'health', 'family', 'system', 'financial'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    // Only doctors and system can create notifications for other users
    if (req.body.userId !== req.user._id.toString() && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Only doctors can create notifications for other users')
      );
    }

    const notificationData = {
      userId: req.body.userId,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || 'medium',
      category: req.body.category,
      relatedData: req.body.relatedData || {},
      actions: req.body.actions || [],
      scheduledFor: req.body.scheduledFor,
      expiresAt: req.body.expiresAt,
      metadata: {
        source: 'manual',
        ...req.body.metadata
      }
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Populate related data
    await notification.populate('userId', 'name email');

    res.status(201).json(
      createSuccessResponse(
        'Notification created successfully',
        { notification }
      )
    );
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json(
      createErrorResponse('Failed to create notification')
    );
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json(
        createErrorResponse('Notification not found')
      );
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        createErrorResponse('Access denied to modify this notification')
      );
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json(
      createSuccessResponse(
        'Notification marked as read',
        { notification }
      )
    );
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json(
      createErrorResponse('Failed to mark notification as read')
    );
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.json(
      createSuccessResponse(
        `${result.modifiedCount} notifications marked as read`
      )
    );
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json(
      createErrorResponse('Failed to mark all notifications as read')
    );
  }
});

// @desc    Add interaction to notification
// @route   POST /api/notifications/:id/interact
// @access  Private
router.post('/:id/interact', protect, [
  body('action')
    .isIn(['viewed', 'clicked', 'dismissed', 'snoozed', 'shared'])
    .withMessage('Invalid interaction action'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Interaction data must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json(
        createErrorResponse('Notification not found')
      );
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        createErrorResponse('Access denied to interact with this notification')
      );
    }

    await notification.addInteraction(req.body.action, req.body.data || {});

    res.json(
      createSuccessResponse(
        'Interaction recorded successfully'
      )
    );
  } catch (error) {
    console.error('Add notification interaction error:', error);
    res.status(500).json(
      createErrorResponse('Failed to record interaction')
    );
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json(
        createErrorResponse('Notification not found')
      );
    }

    // Check if user owns this notification or is a doctor
    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'doctor') {
      return res.status(403).json(
        createErrorResponse('Access denied to delete this notification')
      );
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json(
      createSuccessResponse('Notification deleted successfully')
    );
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json(
      createErrorResponse('Failed to delete notification')
    );
  }
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { userId } = req.query;

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
          connection.userId.toString() === req.user._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json(
            createErrorResponse('Access denied to view notification stats')
          );
        }
      }

      targetUserId = userId;
    }

    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByPriority
    ] = await Promise.all([
      Notification.countDocuments({ userId: targetUserId }),
      Notification.countDocuments({ userId: targetUserId, isRead: false }),
      Notification.aggregate([
        { $match: { userId: targetUserId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.aggregate([
        { $match: { userId: targetUserId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      total: totalNotifications,
      unread: unreadNotifications,
      read: totalNotifications - unreadNotifications,
      byType: notificationsByType,
      byPriority: notificationsByPriority
    };

    res.json(
      createSuccessResponse(
        'Notification statistics retrieved successfully',
        { stats }
      )
    );
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve notification statistics')
    );
  }
});

module.exports = router;
