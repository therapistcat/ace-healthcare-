const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Basic report information
  name: {
    type: String,
    required: [true, 'Report name is required'],
    trim: true,
    maxlength: [200, 'Report name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: [
      'lab_test',
      'diagnostic_imaging',
      'prescription',
      'discharge_summary',
      'consultation_notes',
      'vaccination_record',
      'insurance_document',
      'bill_receipt',
      'other'
    ]
  },
  category: {
    type: String,
    required: [true, 'Report category is required'],
    enum: [
      'blood_work',
      'urine_test',
      'stool_test',
      'x_ray',
      'ct_scan',
      'mri',
      'ultrasound',
      'ecg',
      'echo',
      'endoscopy',
      'biopsy',
      'pathology',
      'radiology',
      'cardiology',
      'neurology',
      'orthopedics',
      'general',
      'other'
    ]
  },
  
  // Provider information
  provider: {
    name: {
      type: String,
      required: [true, 'Provider name is required']
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'lab', 'pharmacy', 'doctor', 'other'],
      required: true
    },
    address: String,
    contact: String,
    licenseNumber: String
  },
  
  // Report dates
  reportDate: {
    type: Date,
    required: [true, 'Report date is required']
  },
  testDate: Date,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // File information
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    url: String,
    thumbnail: String,
    pages: Number,
    isMainFile: {
      type: Boolean,
      default: false
    }
  }],
  
  // Report content and analysis
  content: {
    summary: String,
    findings: [String],
    recommendations: [String],
    normalValues: [{
      parameter: String,
      value: String,
      unit: String,
      normalRange: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'borderline', 'critical']
      }
    }],
    abnormalValues: [{
      parameter: String,
      value: String,
      unit: String,
      normalRange: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'critical']
      },
      notes: String
    }],
    diagnosis: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }]
  },
  
  // OCR and AI analysis
  ocrData: {
    extractedText: String,
    confidence: Number,
    processedAt: Date,
    language: String,
    errors: [String]
  },
  aiAnalysis: {
    processed: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    keyFindings: [String],
    riskFactors: [String],
    recommendations: [String],
    followUpRequired: Boolean,
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    confidence: Number,
    model: String,
    version: String
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'reviewed', 'archived', 'error'],
    default: 'uploaded'
  },
  processingStatus: {
    ocr: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    analysis: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    review: {
      type: String,
      enum: ['pending', 'in_review', 'completed'],
      default: 'pending'
    }
  },
  
  // Medical review
  medicalReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    approved: Boolean,
    flagged: Boolean,
    flagReason: String,
    followUpRequired: Boolean,
    followUpDate: Date
  },
  
  // Related data
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  relatedMedications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication'
  }],
  relatedVitals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VitalSigns'
  }],
  
  // Sharing and access
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['doctor', 'family', 'caregiver', 'insurance']
    },
    permissions: {
      view: {
        type: Boolean,
        default: true
      },
      download: {
        type: Boolean,
        default: false
      },
      share: {
        type: Boolean,
        default: false
      }
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Privacy and security
  isPrivate: {
    type: Boolean,
    default: false
  },
  accessLog: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['viewed', 'downloaded', 'shared', 'edited', 'deleted']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  
  // Tags and organization
  tags: [String],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Metadata
  metadata: {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    source: {
      type: String,
      enum: ['app_upload', 'email', 'scan', 'api', 'manual'],
      default: 'app_upload'
    },
    deviceInfo: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
healthReportSchema.index({ userId: 1, reportDate: -1 });
healthReportSchema.index({ userId: 1, type: 1 });
healthReportSchema.index({ userId: 1, category: 1 });
healthReportSchema.index({ status: 1 });
healthReportSchema.index({ tags: 1 });
healthReportSchema.index({ 'provider.name': 1 });

// Virtual for file count
healthReportSchema.virtual('fileCount').get(function() {
  return this.files ? this.files.length : 0;
});

// Virtual for main file
healthReportSchema.virtual('mainFile').get(function() {
  return this.files ? this.files.find(file => file.isMainFile) || this.files[0] : null;
});

// Method to add access log entry
healthReportSchema.methods.logAccess = function(userId, action, metadata = {}) {
  this.accessLog.push({
    userId,
    action,
    timestamp: new Date(),
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent
  });
  return this.save();
};

// Method to share report
healthReportSchema.methods.shareWith = function(userId, role, permissions = {}, expiresAt = null) {
  // Remove existing share if any
  this.sharedWith = this.sharedWith.filter(share => !share.userId.equals(userId));
  
  // Add new share
  this.sharedWith.push({
    userId,
    role,
    permissions: {
      view: permissions.view !== undefined ? permissions.view : true,
      download: permissions.download !== undefined ? permissions.download : false,
      share: permissions.share !== undefined ? permissions.share : false
    },
    sharedAt: new Date(),
    expiresAt
  });
  
  return this.save();
};

// Method to check if user has access
healthReportSchema.methods.hasAccess = function(userId, action = 'view') {
  // Owner always has access
  if (this.userId.equals(userId)) {
    return true;
  }
  
  // Check shared access
  const share = this.sharedWith.find(share => 
    share.userId.equals(userId) && 
    (!share.expiresAt || share.expiresAt > new Date())
  );
  
  if (!share) {
    return false;
  }
  
  return share.permissions[action] === true;
};

// Method to update processing status
healthReportSchema.methods.updateProcessingStatus = function(type, status) {
  if (this.processingStatus[type] !== undefined) {
    this.processingStatus[type] = status;
    
    // Update overall status based on processing status
    if (status === 'failed') {
      this.status = 'error';
    } else if (this.processingStatus.ocr === 'completed' && this.processingStatus.analysis === 'completed') {
      this.status = 'processed';
    } else if (this.processingStatus.ocr === 'processing' || this.processingStatus.analysis === 'processing') {
      this.status = 'processing';
    }
  }
  
  return this.save();
};

// Static method to find reports by date range
healthReportSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    reportDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ reportDate: -1 });
};

// Static method to find reports by type
healthReportSchema.statics.findByType = function(userId, type, category = null) {
  const query = { userId, type };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ reportDate: -1 });
};

module.exports = mongoose.model('HealthReport', healthReportSchema);
