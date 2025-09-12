const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Doctor specialty is required'],
    enum: [
      'general_medicine',
      'cardiology',
      'endocrinology',
      'neurology',
      'orthopedics',
      'dermatology',
      'psychiatry',
      'pediatrics',
      'gynecology',
      'ophthalmology',
      'ent',
      'urology',
      'oncology',
      'gastroenterology',
      'pulmonology',
      'nephrology',
      'rheumatology',
      'other'
    ]
  },
  
  // Appointment scheduling
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Appointment duration must be at least 15 minutes'],
    max: [180, 'Appointment duration cannot exceed 3 hours']
  },
  
  // Appointment details
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: ['consultation', 'follow_up', 'check_up', 'emergency', 'telemedicine', 'procedure', 'lab_review']
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  symptoms: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Location and contact
  location: {
    type: {
      type: String,
      enum: ['clinic', 'hospital', 'home', 'telemedicine'],
      default: 'clinic'
    },
    address: {
      name: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    room: String,
    floor: String,
    instructions: String
  },
  
  // Telemedicine details
  telemedicine: {
    platform: {
      type: String,
      enum: ['zoom', 'google_meet', 'teams', 'custom', 'phone']
    },
    meetingId: String,
    meetingPassword: String,
    meetingLink: String,
    phoneNumber: String
  },
  
  // Medical information
  medicalInfo: {
    currentMedications: [String],
    allergies: [String],
    previousVisits: [{
      date: Date,
      diagnosis: String,
      treatment: String
    }],
    vitalSigns: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VitalSigns'
    },
    labReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthReport'
    }]
  },
  
  // Appointment outcome
  outcome: {
    diagnosis: String,
    treatment: String,
    prescriptions: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    followUpRequired: Boolean,
    followUpDate: Date,
    referrals: [{
      specialty: String,
      doctorName: String,
      reason: String
    }],
    labTests: [{
      testName: String,
      instructions: String,
      urgency: String
    }],
    notes: String
  },
  
  // Billing and payment
  billing: {
    consultationFee: {
      type: Number,
      min: [0, 'Consultation fee cannot be negative']
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'insurance', 'scheme']
    },
    insuranceClaim: {
      claimNumber: String,
      status: String,
      amount: Number
    }
  },
  
  // Reminders and notifications
  reminders: {
    patient: {
      enabled: {
        type: Boolean,
        default: true
      },
      times: [{
        type: String,
        enum: ['24h', '2h', '30m', '15m'],
        sent: {
          type: Boolean,
          default: false
        }
      }]
    },
    doctor: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Feedback and rating
  feedback: {
    patientRating: {
      type: Number,
      min: 1,
      max: 5
    },
    patientReview: String,
    doctorNotes: String,
    serviceQuality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['app', 'website', 'phone', 'walk_in'],
      default: 'app'
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ specialty: 1 });

// Virtual for full datetime
appointmentSchema.virtual('datetime').get(function() {
  const [hours, minutes] = this.time.split(':');
  const datetime = new Date(this.date);
  datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return datetime;
});

// Check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  return this.datetime > new Date() && ['scheduled', 'confirmed'].includes(this.status);
};

// Check if appointment is overdue
appointmentSchema.methods.isOverdue = function() {
  return this.datetime < new Date() && ['scheduled', 'confirmed'].includes(this.status);
};

// Calculate total billing amount
appointmentSchema.methods.calculateTotal = function() {
  let total = this.billing.consultationFee || 0;
  
  if (this.billing.additionalCharges) {
    total += this.billing.additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  }
  
  this.billing.totalAmount = total;
  return total;
};

// Update status with history
appointmentSchema.methods.updateStatus = function(newStatus, reason, updatedBy) {
  this.statusHistory.push({
    status: this.status,
    reason,
    updatedBy,
    timestamp: new Date()
  });
  
  this.status = newStatus;
  this.metadata.lastModified = new Date();
  this.metadata.modifiedBy = updatedBy;
  
  return this.save();
};

// Pre-save middleware
appointmentSchema.pre('save', function(next) {
  // Calculate total billing amount
  this.calculateTotal();
  
  // Update last modified timestamp
  this.metadata.lastModified = new Date();
  
  next();
});

// Static method to find conflicts
appointmentSchema.statics.findConflicts = function(doctorId, date, time, duration, excludeId) {
  const [hours, minutes] = time.split(':');
  const startTime = new Date(date);
  startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  const query = {
    doctorId,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    $or: [
      {
        $and: [
          { date: { $lte: startTime } },
          { $expr: { $gte: [{ $add: ['$date', { $multiply: ['$duration', 60000] }] }, startTime] } }
        ]
      },
      {
        $and: [
          { date: { $lt: endTime } },
          { date: { $gte: startTime } }
        ]
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Appointment', appointmentSchema);
