const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'medication_reminder',
      'medication_missed',
      'medication_low_stock',
      'appointment_reminder',
      'appointment_confirmed',
      'appointment_cancelled',
      'vitals_alert',
      'vitals_reminder',
      'family_alert',
      'system_update',
      'health_tip',
      'scheme_eligibility',
      'bill_reminder',
      'report_ready',
      'emergency_alert'
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['medication', 'appointment', 'health', 'family', 'system', 'financial'],
    required: true
  },
  
  // Status tracking
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Delivery tracking
  deliveryStatus: {
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    }
  },
  
  // Related data
  relatedData: {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    vitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VitalSigns'
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthReport'
    }
  },
  
  // Action buttons/links
  actions: [{
    label: String,
    action: String, // 'view', 'take_medication', 'snooze', 'dismiss', 'call', 'navigate'
    url: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Metadata
  metadata: {
    deviceType: String,
    appVersion: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    source: {
      type: String,
      enum: ['system', 'manual', 'automated', 'external'],
      default: 'system'
    }
  },
  
  // Interaction tracking
  interactions: [{
    action: {
      type: String,
      enum: ['viewed', 'clicked', 'dismissed', 'snoozed', 'shared']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Add interaction
notificationSchema.methods.addInteraction = function(action, data = {}) {
  this.interactions.push({
    action,
    data,
    timestamp: new Date()
  });
  return this.save();
};

// Check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to create medication reminder
notificationSchema.statics.createMedicationReminder = function(userId, medication) {
  return this.create({
    userId,
    type: 'medication_reminder',
    title: 'Time for your medication',
    message: `It's time to take your ${medication.name} (${medication.dosage})`,
    priority: 'high',
    category: 'medication',
    relatedData: {
      medicationId: medication._id
    },
    actions: [
      {
        label: 'Take Now',
        action: 'take_medication',
        data: { medicationId: medication._id }
      },
      {
        label: 'Snooze 15 min',
        action: 'snooze',
        data: { minutes: 15 }
      }
    ],
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  });
};

// Static method to create appointment reminder
notificationSchema.statics.createAppointmentReminder = function(userId, appointment) {
  return this.create({
    userId,
    type: 'appointment_reminder',
    title: 'Upcoming appointment',
    message: `You have an appointment with ${appointment.doctorName} at ${appointment.time}`,
    priority: 'medium',
    category: 'appointment',
    relatedData: {
      appointmentId: appointment._id
    },
    actions: [
      {
        label: 'View Details',
        action: 'view',
        url: `/appointments/${appointment._id}`
      }
    ],
    scheduledFor: new Date(appointment.date.getTime() - 60 * 60 * 1000) // 1 hour before
  });
};

// Static method to create vitals alert
notificationSchema.statics.createVitalsAlert = function(userId, vital, alertType) {
  const messages = {
    high_bp: 'Your blood pressure reading is higher than normal',
    low_bp: 'Your blood pressure reading is lower than normal',
    high_glucose: 'Your blood glucose level is elevated',
    low_glucose: 'Your blood glucose level is low',
    irregular_hr: 'Irregular heart rate detected'
  };
  
  return this.create({
    userId,
    type: 'vitals_alert',
    title: 'Health Alert',
    message: messages[alertType] || 'Unusual vital signs detected',
    priority: 'high',
    category: 'health',
    relatedData: {
      vitalId: vital._id
    },
    actions: [
      {
        label: 'View Details',
        action: 'view',
        url: `/health/vitals/${vital._id}`
      },
      {
        label: 'Contact Doctor',
        action: 'call'
      }
    ]
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
