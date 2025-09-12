const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test Patient',
  email: 'test@example.com',
  password: 'password123',
  phone: '1234567890',
  role: 'patient',
  age: 30,
  gender: 'male'
};

let authToken = '';
let userId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint} failed:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🔍 Testing health check...');
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('\n🔍 Testing user registration...');
  try {
    const response = await makeRequest('POST', '/auth/signup', testUser);
    console.log('✅ User registration successful');
    console.log('📧 OTP verification required for email:', testUser.email);
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding to login test');
      return true;
    }
    return false;
  }
};

const testUserLogin = async () => {
  console.log('\n🔍 Testing user login...');
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      userId = response.data.user._id;
      console.log('✅ User login successful');
      console.log('🔑 Auth token received');
      return true;
    } else {
      console.log('⚠️ Login successful but user needs OTP verification');
      return false;
    }
  } catch (error) {
    return false;
  }
};

const testGetProfile = async () => {
  console.log('\n🔍 Testing get user profile...');
  try {
    const response = await makeRequest('GET', '/users/profile');
    console.log('✅ Profile retrieved successfully');
    console.log('👤 User:', response.data.profile.name);
    return true;
  } catch (error) {
    return false;
  }
};

const testAddMedication = async () => {
  console.log('\n🔍 Testing add medication...');
  try {
    const medicationData = {
      name: 'Test Medication',
      dosage: '10mg',
      frequency: 'twice_daily',
      pillCount: 30,
      instructions: ['Take with food', 'Do not exceed recommended dose'],
      medicationType: 'tablet',
      strength: '10mg',
      reminderSettings: {
        enabled: true,
        times: ['08:00', '20:00'],
        beforeMeal: false,
        afterMeal: true
      },
      lowStockThreshold: 5
      // Don't specify userId - it will use the current user
    };

    const response = await makeRequest('POST', '/medications', medicationData);
    console.log('✅ Medication added successfully');
    console.log('💊 Medication:', response.data.medication.name);
    return response.data.medication._id;
  } catch (error) {
    return null;
  }
};

const testGetMedications = async () => {
  console.log('\n🔍 Testing get medications...');
  try {
    const response = await makeRequest('GET', '/medications');
    console.log('✅ Medications retrieved successfully');
    console.log('📊 Total medications:', response.data.medications.length);
    return true;
  } catch (error) {
    return false;
  }
};

const testAddVitalSigns = async () => {
  console.log('\n🔍 Testing add vital signs...');
  try {
    const vitalData = {
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      heartRate: {
        value: 72
      },
      bloodSugar: {
        value: 95,
        unit: 'mg/dL',
        testType: 'fasting'
      },
      weight: {
        value: 70,
        unit: 'kg'
      },
      height: {
        value: 175,
        unit: 'cm'
      },
      temperature: {
        value: 36.5,
        unit: 'celsius'
      },
      notes: 'Regular checkup vitals'
      // Don't specify userId - it will use the current user
    };

    const response = await makeRequest('POST', '/health/vitals', vitalData);
    console.log('✅ Vital signs added successfully');
    console.log('📈 Recorded at:', new Date(response.data.vital.recordedAt).toLocaleString());
    return true;
  } catch (error) {
    return false;
  }
};

const testGetVitalSigns = async () => {
  console.log('\n🔍 Testing get vital signs...');
  try {
    const response = await makeRequest('GET', '/health/vitals');
    console.log('✅ Vital signs retrieved successfully');
    console.log('📊 Total vital records:', response.data.vitals.length);
    return true;
  } catch (error) {
    return false;
  }
};

const testBookAppointment = async () => {
  console.log('\n🔍 Testing book appointment...');
  try {
    const appointmentData = {
      doctorName: 'Dr. Test Doctor',
      specialty: 'general_medicine',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      time: '10:00',
      duration: 30,
      type: 'consultation',
      reason: 'Regular checkup and medication review',
      symptoms: ['fatigue', 'headache'],
      priority: 'medium',
      location: {
        type: 'clinic',
        address: {
          name: 'Health City Medical Center',
          street: '123 Medical Center Dr',
          city: 'Health City',
          state: 'CA',
          pincode: '12345'
        },
        room: '101',
        floor: '1st Floor'
      }
      // Don't specify patientId - it will use the current user
    };

    const response = await makeRequest('POST', '/appointments', appointmentData);
    console.log('✅ Appointment booked successfully');
    console.log('📅 Appointment with:', response.data.appointment.doctorName);
    console.log('🕐 Date & Time:', response.data.appointment.date, response.data.appointment.time);
    return true;
  } catch (error) {
    return false;
  }
};

const testGetNotifications = async () => {
  console.log('\n🔍 Testing get notifications...');
  try {
    const response = await makeRequest('GET', '/notifications');
    console.log('✅ Notifications retrieved successfully');
    console.log('📬 Total notifications:', response.data.notifications.length);
    if (response.meta?.unreadCount !== undefined) {
      console.log('📭 Unread notifications:', response.meta.unreadCount);
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting HealthCare+ API Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Add Medication', fn: testAddMedication },
    { name: 'Get Medications', fn: testGetMedications },
    { name: 'Add Vital Signs', fn: testAddVitalSigns },
    { name: 'Get Vital Signs', fn: testGetVitalSigns },
    { name: 'Book Appointment', fn: testBookAppointment },
    { name: 'Get Notifications', fn: testGetNotifications }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the error messages above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
