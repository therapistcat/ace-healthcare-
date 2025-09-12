const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: [100, 'Medication name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly'],
    default: 'once_daily'
  },
  frequencyDetails: {
    times: [{
      hour: {
        type: Number,
        min: 0,
        max: 23
      },
      minute: {
        type: Number,
        min: 0,
        max: 59,
        default: 0
      }
    }],
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    }],
    interval: Number // for custom intervals
  },
  nextDose: {
    type: Date,
    required: [true, 'Next dose time is required']
  },
  pillCount: {
    type: Number,
    required: [true, 'Pill count is required'],
    min: [0, 'Pill count cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Low stock threshold cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  instructions: {
    beforeFood: Boolean,
    afterFood: Boolean,
    withFood: Boolean,
    onEmptyStomach: Boolean,
    specialInstructions: String
  },
  prescribedBy: {
    doctorName: String,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prescriptionDate: Date,
    prescriptionNumber: String
  },
  medicationType: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'cream', 'inhaler', 'other'],
    default: 'tablet'
  },
  strength: String, // e.g., "500mg", "10ml"
  manufacturer: String,
  batchNumber: String,
  expiryDate: Date,
  
  // Adherence tracking
  adherence: {
    type: Number,
    default: 0,
    min: [0, 'Adherence cannot be negative'],
    max: [100, 'Adherence cannot exceed 100%']
  },
  totalDoses: {
    type: Number,
    default: 0
  },
  takenDoses: {
    type: Number,
    default: 0
  },
  missedDoses: {
    type: Number,
    default: 0
  },
  
  // Status and settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  pausedUntil: Date,
  
  // Reminder settings
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    advanceMinutes: {
      type: Number,
      default: 15,
      min: [0, 'Advance minutes cannot be negative']
    },
    snoozeMinutes: {
      type: Number,
      default: 15,
      min: [1, 'Snooze minutes must be at least 1']
    },
    maxSnoozes: {
      type: Number,
      default: 3,
      min: [0, 'Max snoozes cannot be negative']
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    vibrationEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Treatment period
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years', 'ongoing']
    }
  },
  
  // Side effects tracking
  sideEffects: [{
    effect: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Refill information
  refillInfo: {
    pharmacy: String,
    pharmacyContact: String,
    autoRefill: {
      type: Boolean,
      default: false
    },
    lastRefillDate: Date,
    nextRefillDate: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
medicationSchema.index({ userId: 1 });
medicationSchema.index({ nextDose: 1 });
medicationSchema.index({ isActive: 1 });
medicationSchema.index({ userId: 1, isActive: 1 });

// Calculate next dose based on frequency
medicationSchema.methods.calculateNextDose = function() {
  const now = new Date();
  let nextDose = new Date(now);
  
  switch (this.frequency) {
    case 'once_daily':
      nextDose.setDate(nextDose.getDate() + 1);
      break;
    case 'twice_daily':
      nextDose.setHours(nextDose.getHours() + 12);
      break;
    case 'thrice_daily':
      nextDose.setHours(nextDose.getHours() + 8);
      break;
    case 'four_times_daily':
      nextDose.setHours(nextDose.getHours() + 6);
      break;
    case 'weekly':
      nextDose.setDate(nextDose.getDate() + 7);
      break;
    case 'monthly':
      nextDose.setMonth(nextDose.getMonth() + 1);
      break;
    default:
      nextDose.setDate(nextDose.getDate() + 1);
  }
  
  this.nextDose = nextDose;
  return nextDose;
};

// Update adherence percentage
medicationSchema.methods.updateAdherence = function() {
  if (this.totalDoses > 0) {
    this.adherence = Math.round((this.takenDoses / this.totalDoses) * 100);
  }
  return this.adherence;
};

// Check if medication is due
medicationSchema.methods.isDue = function() {
  return new Date() >= this.nextDose;
};

// Check if medication is low stock
medicationSchema.methods.isLowStock = function() {
  return this.pillCount <= this.lowStockThreshold;
};

module.exports = mongoose.model('Medication', medicationSchema);
