const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  fileName: {
    type: String,
    required: function() { return this.hasFile; }
  },
  originalName: {
    type: String,
    required: function() { return this.hasFile; }
  },
  filePath: {
    type: String,
    required: function() { return this.hasFile; }
  },
  fileSize: {
    type: Number,
    required: function() { return this.hasFile; }
  },
  mimeType: {
    type: String,
    required: function() { return this.hasFile; }
  },
  fileType: {
    type: String,
    required: true,
    enum: {
      values: ['pdf', 'doc', 'docx', 'image', 'other'],
      message: 'File type must be one of: pdf, doc, docx, image, other'
    }
  },
  category: {
    type: String,
    required: [true, 'Document category is required'],
    enum: {
      values: [
        'leave_application',
        'expense_report',
        'project_document',
        'personal_document',
        'compliance',
        'hr_document',
        'finance_document',
        'other'
      ],
      message: 'Please select a valid category'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'under_review'],
      message: 'Status must be one of: pending, approved, rejected, under_review'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be one of: low, medium, high, urgent'
    },
    default: 'medium'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploaded by user is required']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewDate: {
    type: Date,
    default: null
  },
  reviewComments: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comments cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadDate: {
    type: Date,
    default: null
  },
  metadata: {
    department: String,
    projectId: String,
    clientName: String,
    documentNumber: String,
    version: {
      type: String,
      default: '1.0'
    }
  },
  // New vendor-related fields
  vendorDetails: {
    vendorName: {
      type: String,
      trim: true,
      maxlength: [100, 'Vendor name cannot exceed 100 characters']
    },
    vendorPhone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    vendorDate: {
      type: Date
    },
    vendorNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Vendor notes cannot exceed 500 characters']
    }
  },
  // Allow saving details even without file
  hasFile: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for document age
documentSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for status color (for frontend use)
documentSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    under_review: '#17a2b8'
  };
  return colors[this.status] || '#6c757d';
});

// Indexes for better performance
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ status: 1, createdAt: -1 });
documentSchema.index({ category: 1, createdAt: -1 });
documentSchema.index({ reviewedBy: 1, reviewDate: -1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
}, {
  weights: { title: 10, description: 5, tags: 1 }
});

// Pre-save middleware
documentSchema.pre('save', function(next) {
  // Set file type based on mime type if not set
  if (!this.fileType) {
    if (this.mimeType.includes('pdf')) {
      this.fileType = 'pdf';
    } else if (this.mimeType.includes('word') || 
               this.mimeType.includes('document') ||
               this.originalName.toLowerCase().includes('.doc')) {
      this.fileType = this.originalName.toLowerCase().includes('.docx') ? 'docx' : 'doc';
    } else if (this.mimeType.includes('image')) {
      this.fileType = 'image';
    } else {
      this.fileType = 'other';
    }
  }
  
  // Set review date when status changes to approved/rejected
  if (this.isModified('status') && 
      (this.status === 'approved' || this.status === 'rejected')) {
    this.reviewDate = new Date();
  }
  
  next();
});

// Instance method to increment download count
documentSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastDownloadDate = new Date();
  return this.save();
};

// Static method to get documents by status
documentSchema.statics.findByStatus = function(status) {
  return this.find({ status, isArchived: false })
    .populate('uploadedBy', 'name employeeId department')
    .populate('reviewedBy', 'name employeeId')
    .sort({ createdAt: -1 });
};

// Static method to get user's documents
documentSchema.statics.findByUser = function(userId) {
  return this.find({ uploadedBy: userId, isArchived: false })
    .populate('reviewedBy', 'name employeeId')
    .sort({ createdAt: -1 });
};

// Static method for search
documentSchema.statics.search = function(query, filters = {}) {
  const searchQuery = { isArchived: false };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Apply filters
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key] !== 'all') {
      searchQuery[key] = filters[key];
    }
  });
  
  return this.find(searchQuery)
    .populate('uploadedBy', 'name employeeId department')
    .populate('reviewedBy', 'name employeeId')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
};

module.exports = mongoose.model('Document', documentSchema);