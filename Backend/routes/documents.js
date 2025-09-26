const express = require('express');
const { body, validationResult, query } = require('express-validator');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/auth');
const { upload, handleMulterError, getFileType, deleteFile } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware for document creation
const validateDocument = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('category')
    .isIn([
      'leave_application',
      'expense_report', 
      'project_document',
      'personal_document',
      'compliance',
      'hr_document',
      'finance_document',
      'other'
    ])
    .withMessage('Please select a valid category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];

// @route   POST /api/documents/upload
// @desc    Upload a new document
// @access  Private
router.post('/upload', 
  upload.single('document'),
  handleMulterError,
  validateDocument,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Delete uploaded file if validation fails
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const {
        title,
        description,
        category,
        priority = 'medium',
        tags,
        expiryDate,
        metadata
      } = req.body;

      // Parse tags if provided as string
      let parsedTags = [];
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }

      // Parse metadata if provided
      let parsedMetadata = {};
      if (metadata) {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      }

      // Create document record
      const document = new Document({
        title,
        description,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileType: getFileType(req.file.mimetype),
        category,
        priority,
        uploadedBy: req.user._id,
        tags: parsedTags,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        metadata: {
          ...parsedMetadata,
          department: req.user.department
        }
      });

      await document.save();

      // Populate user information
      await document.populate('uploadedBy', 'name employeeId department');

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          document
        }
      });

    } catch (error) {
      // Delete uploaded file if database operation fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Document upload failed. Please try again.'
      });
    }
  }
);

// @route   GET /api/documents
// @desc    Get user's documents
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'under_review']),
  query('category').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'title', 'status', 'fileSize']),
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { 
      uploadedBy: req.user._id,
      isArchived: false
    };

    if (status) query.status = status;
    if (category) query.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const documents = await Document.find(query)
      .populate('reviewedBy', 'name employeeId')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

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
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// @route   GET /api/documents/my-stats
// @desc    Get current user's document statistics
// @access  Private
router.get('/my-stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get document counts by status
    const stats = await Document.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize default counts
    const result = {
      totalDocuments: 0,
      pendingDocuments: 0,
      approvedDocuments: 0,
      rejectedDocuments: 0,
      underReviewDocuments: 0
    };

    // Map the aggregation results
    stats.forEach(stat => {
      result.totalDocuments += stat.count;
      
      switch (stat._id) {
        case 'pending':
          result.pendingDocuments = stat.count;
          break;
        case 'approved':
          result.approvedDocuments = stat.count;
          break;
        case 'rejected':
          result.rejectedDocuments = stat.count;
          break;
        case 'under_review':
          result.underReviewDocuments = stat.count;
          break;
      }
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user statistics'
    });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name employeeId department')
      .populate('reviewedBy', 'name employeeId');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user owns the document or is admin
    if (document.uploadedBy._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        document
      }
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document'
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document metadata
// @access  Private
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('category').optional().isIn([
    'leave_application', 'expense_report', 'project_document',
    'personal_document', 'compliance', 'hr_document', 'finance_document', 'other'
  ]),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('tags').optional().isArray(),
  body('expiryDate').optional().isISO8601()
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

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user owns the document
    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own documents.'
      });
    }

    // Don't allow editing if document is approved or rejected
    if (document.status === 'approved' || document.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit document that has been approved or rejected'
      });
    }

    const allowedUpdates = ['title', 'description', 'category', 'priority', 'tags', 'expiryDate'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'expiryDate' && req.body[field]) {
          updates[field] = new Date(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name employeeId department')
     .populate('reviewedBy', 'name employeeId');

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: {
        document: updatedDocument
      }
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document'
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user owns the document
    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own documents.'
      });
    }

    // Don't allow deletion if document is approved
    if (document.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved document'
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
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download document file
// @access  Private
router.get('/:id/download', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user owns the document or is admin
    if (document.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

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
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// @route   GET /api/documents/search
// @desc    Search documents
// @access  Private
router.get('/search/query', [
  query('q').optional().isString().withMessage('Search query must be a string'),
  query('category').optional().isString(),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'under_review']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { q, category, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search filters
    const filters = { uploadedBy: req.user._id };
    if (category) filters.category = category;
    if (status) filters.status = status;

    // Execute search
    const documents = await Document.search(q, filters)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        documents,
        query: q,
        filters: { category, status },
        pagination: {
          page,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

module.exports = router;