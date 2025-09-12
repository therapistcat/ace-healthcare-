const mongoose = require('mongoose');

const vitalSignsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Blood Pressure
  bloodPressure: {
    systolic: {
      type: Number,
      min: [50, 'Systolic pressure too low'],
      max: [300, 'Systolic pressure too high']
    },
    diastolic: {
      type: Number,
      min: [30, 'Diastolic pressure too low'],
      max: [200, 'Diastolic pressure too high']
    },
    unit: {
      type: String,
      default: 'mmHg'
    },
    category: {
      type: String,
      enum: ['low', 'normal', 'elevated', 'high_stage1', 'high_stage2', 'crisis']
    }
  },
  
  // Heart Rate
  heartRate: {
    value: {
      type: Number,
      min: [30, 'Heart rate too low'],
      max: [250, 'Heart rate too high']
    },
    unit: {
      type: String,
      default: 'bpm'
    },
    category: {
      type: String,
      enum: ['low', 'normal', 'elevated', 'high']
    },
    rhythm: {
      type: String,
      enum: ['regular', 'irregular', 'unknown'],
      default: 'regular'
    }
  },
  
  // Blood Sugar/Glucose
  bloodSugar: {
    value: {
      type: Number,
      min: [20, 'Blood sugar too low'],
      max: [600, 'Blood sugar too high']
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL'
    },
    testType: {
      type: String,
      enum: ['fasting', 'random', 'post_meal', 'hba1c'],
      required: true
    },
    category: {
      type: String,
      enum: ['low', 'normal', 'pre_diabetic', 'diabetic']
    },
    mealContext: {
      type: String,
      enum: ['before_meal', 'after_meal', 'bedtime', 'other']
    }
  },
  
  // Weight
  weight: {
    value: {
      type: Number,
      min: [10, 'Weight too low'],
      max: [500, 'Weight too high']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  
  // Height (for BMI calculation)
  height: {
    value: {
      type: Number,
      min: [50, 'Height too low'],
      max: [250, 'Height too high']
    },
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm'
    }
  },
  
  // Body Temperature
  temperature: {
    value: {
      type: Number,
      min: [30, 'Temperature too low'],
      max: [50, 'Temperature too high']
    },
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    },
    category: {
      type: String,
      enum: ['low', 'normal', 'fever', 'high_fever']
    }
  },
  
  // Oxygen Saturation
  oxygenSaturation: {
    value: {
      type: Number,
      min: [70, 'Oxygen saturation too low'],
      max: [100, 'Oxygen saturation cannot exceed 100%']
    },
    unit: {
      type: String,
      default: '%'
    },
    category: {
      type: String,
      enum: ['low', 'normal', 'high']
    }
  },
  
  // Respiratory Rate
  respiratoryRate: {
    value: {
      type: Number,
      min: [5, 'Respiratory rate too low'],
      max: [60, 'Respiratory rate too high']
    },
    unit: {
      type: String,
      default: 'breaths/min'
    },
    category: {
      type: String,
      enum: ['low', 'normal', 'high']
    }
  },
  
  // Additional measurements
  cholesterol: {
    total: Number,
    ldl: Number,
    hdl: Number,
    triglycerides: Number,
    unit: {
      type: String,
      default: 'mg/dL'
    }
  },
  
  // Recording details
  recordedAt: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: String,
    enum: ['self', 'family', 'doctor', 'nurse', 'device'],
    default: 'self'
  },
  deviceInfo: {
    deviceType: String,
    deviceModel: String,
    deviceId: String,
    accuracy: String
  },
  
  // Context and notes
  context: {
    activity: {
      type: String,
      enum: ['resting', 'after_exercise', 'after_meal', 'before_meal', 'stressed', 'sick', 'other']
    },
    medication: {
      taken: Boolean,
      timeSinceMedication: Number // minutes
    },
    symptoms: [String],
    location: String
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Alerts and flags
  alerts: [{
    type: {
      type: String,
      enum: ['critical', 'warning', 'info']
    },
    message: String,
    triggered: {
      type: Boolean,
      default: false
    }
  }],
  
  // Data quality
  dataQuality: {
    accuracy: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Sharing and privacy
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relationship: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
vitalSignsSchema.index({ userId: 1, recordedAt: -1 });
vitalSignsSchema.index({ userId: 1, 'bloodPressure.category': 1 });
vitalSignsSchema.index({ userId: 1, 'bloodSugar.category': 1 });
vitalSignsSchema.index({ recordedAt: 1 });

// Calculate BMI if weight and height are available
vitalSignsSchema.methods.calculateBMI = function() {
  if (this.weight && this.weight.value && this.height && this.height.value) {
    let weightInKg = this.weight.value;
    let heightInM = this.height.value;
    
    // Convert weight to kg if needed
    if (this.weight.unit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }
    
    // Convert height to meters if needed
    if (this.height.unit === 'inches') {
      heightInM = heightInM * 0.0254;
    } else if (this.height.unit === 'cm') {
      heightInM = heightInM / 100;
    }
    
    const bmi = weightInKg / (heightInM * heightInM);
    return Math.round(bmi * 10) / 10;
  }
  return null;
};

// Categorize blood pressure
vitalSignsSchema.methods.categorizeBP = function() {
  if (!this.bloodPressure || !this.bloodPressure.systolic || !this.bloodPressure.diastolic) {
    return null;
  }
  
  const sys = this.bloodPressure.systolic;
  const dia = this.bloodPressure.diastolic;
  
  if (sys < 90 || dia < 60) return 'low';
  if (sys < 120 && dia < 80) return 'normal';
  if (sys < 130 && dia < 80) return 'elevated';
  if (sys < 140 || dia < 90) return 'high_stage1';
  if (sys < 180 || dia < 120) return 'high_stage2';
  return 'crisis';
};

// Categorize blood sugar
vitalSignsSchema.methods.categorizeBloodSugar = function() {
  if (!this.bloodSugar || !this.bloodSugar.value) {
    return null;
  }
  
  const value = this.bloodSugar.value;
  const testType = this.bloodSugar.testType;
  
  if (testType === 'fasting') {
    if (value < 70) return 'low';
    if (value < 100) return 'normal';
    if (value < 126) return 'pre_diabetic';
    return 'diabetic';
  } else if (testType === 'random' || testType === 'post_meal') {
    if (value < 70) return 'low';
    if (value < 140) return 'normal';
    if (value < 200) return 'pre_diabetic';
    return 'diabetic';
  }
  
  return 'normal';
};

// Check for critical values that need immediate attention
vitalSignsSchema.methods.checkCriticalValues = function() {
  const alerts = [];
  
  // Critical blood pressure
  if (this.bloodPressure) {
    const category = this.categorizeBP();
    if (category === 'crisis') {
      alerts.push({
        type: 'critical',
        message: 'Blood pressure is critically high - seek immediate medical attention'
      });
    } else if (category === 'low') {
      alerts.push({
        type: 'warning',
        message: 'Blood pressure is low - monitor closely'
      });
    }
  }
  
  // Critical blood sugar
  if (this.bloodSugar) {
    if (this.bloodSugar.value < 70) {
      alerts.push({
        type: 'critical',
        message: 'Blood sugar is dangerously low - take immediate action'
      });
    } else if (this.bloodSugar.value > 400) {
      alerts.push({
        type: 'critical',
        message: 'Blood sugar is critically high - seek immediate medical attention'
      });
    }
  }
  
  // Critical heart rate
  if (this.heartRate && this.heartRate.value) {
    if (this.heartRate.value < 50 || this.heartRate.value > 150) {
      alerts.push({
        type: 'warning',
        message: 'Heart rate is outside normal range'
      });
    }
  }
  
  this.alerts = alerts;
  return alerts;
};

// Pre-save middleware to categorize values and check for alerts
vitalSignsSchema.pre('save', function(next) {
  // Categorize blood pressure
  if (this.bloodPressure && this.bloodPressure.systolic && this.bloodPressure.diastolic) {
    this.bloodPressure.category = this.categorizeBP();
  }
  
  // Categorize blood sugar
  if (this.bloodSugar && this.bloodSugar.value) {
    this.bloodSugar.category = this.categorizeBloodSugar();
  }
  
  // Check for critical values
  this.checkCriticalValues();
  
  next();
});

module.exports = mongoose.model('VitalSigns', vitalSignsSchema);
