const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters')
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Employee ID can only contain letters and numbers'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters')
];

const validateLogin = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      employeeId,
      name,
      email,
      password,
      department,
      position,
      role = 'user'
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { employeeId: employeeId.toUpperCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.employeeId === employeeId.toUpperCase() 
          ? 'Employee ID already exists'
          : 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      employeeId: employeeId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      password,
      department,
      position,
      role: role === 'admin' ? 'admin' : 'user' // Only allow admin if explicitly set
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.profile,
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employeeId, password } = req.body;

    // Find user by employee ID
    const user = await User.findByEmployeeId(employeeId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.profile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/admin/signup
// @desc    Register a new admin (can only be done by existing admin)
// @access  Private (Admin only)
router.post('/admin/signup', authenticate, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create admin accounts'
      });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      employeeId,
      name,
      email,
      password,
      department,
      position
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { employeeId: employeeId.toUpperCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.employeeId === employeeId.toUpperCase() 
          ? 'Employee ID already exists'
          : 'Email already registered'
      });
    }

    // Create new admin
    const admin = new User({
      employeeId: employeeId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      password,
      department,
      position,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: admin.profile
      }
    });

  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin registration failed. Please try again.'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.profile
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('department').optional().trim().isLength({ min: 2, max: 50 }),
  body('position').optional().trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'department', 'position'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.profile
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client should delete token)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;