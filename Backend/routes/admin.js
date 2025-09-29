const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Document = require('../models/Document');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { deleteFile } = require('../middleware/upload');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get various statistics
    const [
      totalUsers,
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      todayUploads,
      recentDocuments
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Document.countDocuments({ isArchived: false }),
      Document.countDocuments({ status: 'pending', isArchived: false }),
      Document.countDocuments({ status: 'approved', isArchived: false }),
      Document.countDocuments({ status: 'rejected', isArchived: false }),
      Document.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        },
        isArchived: false
      }),
      Document.find({ isArchived: false })
        .populate('uploadedBy', 'name employeeId department')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Get documents by status for chart
    const documentsByStatus = {
      pending: pendingDocuments,
      approved: approvedDocuments,
      rejected: rejectedDocuments,
      under_review: await Document.countDocuments({ status: 'under_review', isArchived: false })
    };

    // Get documents by category
    const documentsByCategory = await Document.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent user registrations
    const recentUsers = await User.find({ role: 'user' })
      .select('name employeeId department createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalDocuments,
          pendingDocuments,
          approvedDocuments,
          rejectedDocuments,
          todayUploads
        },
        charts: {
          documentsByStatus,
          documentsByCategory
        },
        recentActivity: {
          recentDocuments,
          recentUsers
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data'
    });
  }
});

// @route   GET /api/admin/documents
// @desc    Get all documents for admin review
// @access  Private (Admin only)
router.get('/documents', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'under_review', 'all']),
  query('category').optional().isString(),
  query('department').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'title', 'status', 'uploadedBy']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, category, department, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { isArchived: false };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'uploadedBy') {
      sort['uploadedBy.name'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Base aggregation pipeline
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploadedBy'
        }
      },
      { $unwind: '$uploadedBy' },
      {
        $lookup: {
          from: 'users',
          localField: 'reviewedBy',
          foreignField: '_id',
          as: 'reviewedBy'
        }
      },
      {
        $unwind: {
          path: '$reviewedBy',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add department filter if specified
    if (department) {
      pipeline.push({
        $match: { 'uploadedBy.department': department }
      });
    }

    // Add sorting
    pipeline.push({ $sort: sort });

    // Execute aggregation with pagination
    const documentsPromise = Document.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalPromise = Document.aggregate([
      ...pipeline,
      { $count: 'total' }
    ]);

    const [documents, totalResult] = await Promise.all([documentsPromise, totalPromise]);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// @route   PUT /api/admin/documents/:id/review
// @desc    Review document (approve/reject)
// @access  Private (Admin only)
router.put('/documents/:id/review', [
  body('status')
    .isIn(['approved', 'rejected', 'under_review'])
    .withMessage('Status must be approved, rejected, or under_review'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review comments must be less than 500 characters')
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

    const { status, reviewComments } = req.body;

    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name employeeId department email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document
    document.status = status;
    document.reviewedBy = req.user._id;
    document.reviewDate = new Date();
    if (reviewComments) {
      document.reviewComments = reviewComments;
    }

    await document.save();

    // Populate reviewer information
    await document.populate('reviewedBy', 'name employeeId');

    res.json({
      success: true,
      message: `Document ${status} successfully`,
      data: {
        document
      }
    });

  } catch (error) {
    console.error('Document review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review document'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().isString(),
  query('status').optional().isIn(['active', 'inactive', 'all']),
  query('role').optional().isIn(['user', 'admin', 'all']),
  query('search').optional().isString()
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { department, status, role, search } = req.query;

    // Build query
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

    const { isActive } = req.body;

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/reports/summary
// @desc    Get summary report
// @access  Private (Admin only)
router.get('/reports/summary', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('department').optional().isString()
], async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Build aggregation pipeline for documents
    let documentPipeline = [
      { $match: { isArchived: false, ...dateFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploadedBy'
        }
      },
      { $unwind: '$uploadedBy' }
    ];

    // Add department filter if specified
    if (department) {
      documentPipeline.push({
        $match: { 'uploadedBy.department': department }
      });
    }

    // Get document statistics
    const [
      documentStats,
      documentsByCategory,
      documentsByDepartment,
      documentsByStatus
    ] = await Promise.all([
      Document.aggregate([
        ...documentPipeline,
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
            avgProcessingTime: {
              $avg: {
                $cond: [
                  { $ne: ['$reviewDate', null] },
                  { $subtract: ['$reviewDate', '$createdAt'] },
                  null
                ]
              }
            }
          }
        }
      ]),
      
      Document.aggregate([
        ...documentPipeline,
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      Document.aggregate([
        ...documentPipeline,
        { $group: { _id: '$uploadedBy.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      Document.aggregate([
        ...documentPipeline,
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        summary: documentStats[0] || { total: 0, totalSize: 0, avgProcessingTime: 0 },
        breakdown: {
          byCategory: documentsByCategory,
          byDepartment: documentsByDepartment,
          byStatus: documentsByStatus
        },
        filters: {
          startDate,
          endDate,
          department
        }
      }
    });

  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary report'
    });
  }
});

// @route   DELETE /api/admin/documents/:id
// @desc    Delete document (admin only)
// @access  Private (Admin only)
router.delete('/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    deleteFile(document.filePath);

    // Delete document record
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// @route   GET /api/admin/documents/:id/download
// @desc    Admin download any document
// @access  Private (Admin only)
router.get('/documents/:id/download', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if document has file
    if (!document.hasFile || !document.filePath) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this document'
      });
    }

    const path = require('path');
    const fs = require('fs');

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await document.incrementDownloadCount();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Send file
    res.sendFile(path.resolve(document.filePath));

  } catch (error) {
    console.error('Admin download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

module.exports = router;