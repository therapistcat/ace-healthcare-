const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['patient', 'family', 'caregiver', 'doctor'],
    default: 'patient'
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // OTP related fields
  otp: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  },
  // Notification preferences
  notificationPreferences: {
    medication: {
      type: Boolean,
      default: true
    },
    appointments: {
      type: Boolean,
      default: true
    },
    vitals: {
      type: Boolean,
      default: true
    },
    family: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  // Privacy settings
  privacySettings: {
    shareWithFamily: {
      type: Boolean,
      default: true
    },
    shareWithDoctors: {
      type: Boolean,
      default: true
    },
    dataForResearch: {
      type: Boolean,
      default: false
    },
    locationTracking: {
      type: Boolean,
      default: false
    }
  },
  // Health data storage
  healthData: {
    vitals: [{
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      bloodSugar: Number,
      weight: Number,
      temperature: Number,
      oxygenSaturation: Number,
      recordedAt: { type: Date, default: Date.now }
    }],
    medications: [{
      _id: String,
      name: String,
      dosage: String,
      frequency: String,
      times: [String],
      instructions: String,
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }],
    medicationLogs: [{
      medicationId: String,
      scheduledTime: String,
      takenAt: Date,
      status: { type: String, enum: ['taken', 'missed', 'skipped'], default: 'taken' },
      verificationPhoto: String, // Base64 encoded image or file path
      photoTimestamp: Date,
      location: {
        latitude: Number,
        longitude: Number
      },
      notes: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  // Family connections (for family members and patients)
  familyConnections: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    name: String,
    relationship: String,
    role: String,
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
    invitedAt: Date,
    acceptedAt: Date,
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      viewMedications: {
        type: Boolean,
        default: true
      },
      viewVitals: {
        type: Boolean,
        default: true
      },
      viewAppointments: {
        type: Boolean,
        default: true
      },
      receiveAlerts: {
        type: Boolean,
        default: true
      }
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Connection requests sent by this user
  sentConnectionRequests: [{
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetEmail: String,
    targetName: String,
    myRole: {
      type: String,
      enum: ['family', 'caregiver', 'doctor'],
      required: true
    },
    relationship: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    sentAt: { type: Date, default: Date.now },
    message: String
  }],

  // Doctor specific fields
  doctorInfo: {
    specialty: String,
    licenseNumber: String,
    hospital: String,
    experience: Number,
    consultationFee: Number
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000);
  
  this.otp = {
    code: otp,
    expiresAt,
    attempts: 0
  };
  
  return otp;
};

// Verify OTP method
userSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otp || !this.otp.code) {
    return { success: false, message: 'No OTP found' };
  }
  
  if (this.otp.expiresAt < new Date()) {
    return { success: false, message: 'OTP has expired' };
  }
  
  if (this.otp.attempts >= 3) {
    return { success: false, message: 'Too many OTP attempts' };
  }
  
  if (this.otp.code !== candidateOTP) {
    this.otp.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid
  this.otp = undefined;
  this.isVerified = true;
  return { success: true, message: 'OTP verified successfully' };
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.otp;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
