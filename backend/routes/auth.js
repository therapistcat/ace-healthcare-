const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, sensitiveOperationLimit } = require('../middleware/auth');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/email');
const { 
  generateToken, 
  generateOTP, 
  createSuccessResponse, 
  createErrorResponse,
  sanitizeInput,
  isValidEmail,
  isValidPhone
} = require('../utils/helpers');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .isIn(['patient', 'family', 'caregiver', 'doctor'])
    .withMessage('Role must be patient, family, caregiver, or doctor'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateOTP = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
];

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { email, password, name, phone, role, age, gender } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      email: email.toLowerCase().trim(),
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      role,
      age: age ? parseInt(age) : undefined,
      gender
    };

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: sanitizedData.email },
        { phone: sanitizedData.phone }
      ]
    });

    if (existingUser) {
      return res.status(400).json(
        createErrorResponse('User already exists with this email or phone number')
      );
    }

    // Create user
    const user = new User({
      ...sanitizedData,
      password,
      isVerified: false
    });

    // Generate and set OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email (don't fail registration if email fails)
    try {
      await sendOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json(
      createSuccessResponse(
        'User registered successfully. Please verify your email with the OTP sent.',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          },
          token,
          requiresVerification: true
        }
      )
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json(
      createErrorResponse('Registration failed. Please try again.')
    );
  }
});

// @desc    Register user (alias for signup)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateSignup, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { name, email, password, phone, role, age, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json(
        createErrorResponse('User with this email or phone already exists')
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      name: sanitizeInput(name),
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'patient',
      age,
      gender,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json(
      createSuccessResponse(
        'Registration successful. Please check your email for OTP verification.',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          requiresVerification: true
        }
      )
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      createErrorResponse('Registration failed. Please try again.')
    );
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, sensitiveOperationLimit(5), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { email, password } = req.body;

    // Demo account bypass
    if (email === 'demo@healthcare.com' && password === 'demo123') {
      let demoUser = await User.findOne({ email: 'demo@healthcare.com' });

      if (!demoUser) {
        // Create demo user if doesn't exist
        demoUser = new User({
          name: 'Demo User',
          email: 'demo@healthcare.com',
          phone: '+919999999999',
          password: 'demo123',
          role: 'patient',
          isVerified: true,
          isActive: true
        });
        await demoUser.save();
        console.log('✅ Demo account created: demo@healthcare.com / demo123');
      }

      const token = generateToken(demoUser._id);
      demoUser.lastLogin = new Date();
      await demoUser.save();

      console.log('✅ Demo account login successful for:', demoUser.email);

      return res.json(
        createSuccessResponse('Demo login successful', {
          user: {
            id: demoUser._id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            isVerified: demoUser.isVerified,
            language: demoUser.language || 'en'
          },
          token
        })
      );
    }

    // Find user and include password for comparison
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!user) {
      return res.status(401).json(
        createErrorResponse('Invalid email or password')
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json(
        createErrorResponse('Account is deactivated. Please contact support.')
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(
        createErrorResponse('Invalid email or password')
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json(
      createSuccessResponse(
        'Login successful',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            language: user.language
          },
          token
        }
      )
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      createErrorResponse('Login failed. Please try again.')
    );
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', validateOTP, sensitiveOperationLimit(3), async (req, res) => {
  try {
    console.log('🔍 OTP Verification Request:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { email, otp } = req.body;

    // Demo OTP bypass
    if (otp === '123456') {
      console.log('🔓 Demo OTP used: 123456 (bypassing verification)');

      const user = await User.findOne({
        email: email.toLowerCase().trim()
      });

      if (!user) {
        return res.status(404).json(
          createErrorResponse('User not found')
        );
      }

      // Verify user with demo OTP
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      const token = generateToken(user._id);

      return res.json(
        createSuccessResponse('Account verified successfully (demo)', {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            language: user.language || 'en'
          },
          token
        })
      );
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    // Verify OTP
    const verificationResult = user.verifyOTP(otp);
    
    if (!verificationResult.success) {
      return res.status(400).json(
        createErrorResponse(verificationResult.message)
      );
    }

    // Save user (OTP is cleared in verifyOTP method)
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name, user.role);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if welcome email fails
    }

    // Generate new token
    const token = generateToken(user._id);

    res.json(
      createSuccessResponse(
        'Email verified successfully',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            language: user.language
          },
          token
        }
      )
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json(
      createErrorResponse('OTP verification failed. Please try again.')
    );
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', sensitiveOperationLimit(3), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json(
        createErrorResponse('Please provide a valid email')
      );
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    if (user.isVerified) {
      return res.status(400).json(
        createErrorResponse('User is already verified')
      );
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp, user.name);
      
      res.json(
        createSuccessResponse(
          'OTP sent successfully to your email'
        )
      );
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json(
        createErrorResponse('Failed to send OTP. Please try again.')
      );
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json(
      createErrorResponse('Failed to resend OTP. Please try again.')
    );
  }
});

// @desc    Get current user session
// @route   GET /api/auth/session
// @access  Private
router.get('/session', protect, async (req, res) => {
  try {
    res.json(
      createSuccessResponse(
        'Session retrieved successfully',
        {
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isVerified: req.user.isVerified,
            language: req.user.language,
            lastLogin: req.user.lastLogin
          }
        }
      )
    );
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json(
      createErrorResponse('Failed to retrieve session')
    );
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just return success as the client will remove the token
    
    res.json(
      createSuccessResponse('Logged out successfully')
    );
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(
      createErrorResponse('Logout failed')
    );
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', errors.array())
      );
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(
        createErrorResponse('Current password is incorrect')
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json(
      createSuccessResponse('Password changed successfully')
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(
      createErrorResponse('Failed to change password')
    );
  }
});

module.exports = router;
