const mongoose = require('mongoose');

/**
 * UI Comparison Schema
 * Stores comparison data between original and modified UI designs
 */
const uiComparisonSchema = new mongoose.Schema({
  // Original image information
  originalImage: {
    url: {
      type: String,
      required: [true, 'Original image URL is required'],
      trim: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    mimetype: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Modified image information
  modifiedImage: {
    url: {
      type: String,
      required: [true, 'Modified image URL is required'],
      trim: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    processingTime: {
      type: Number, // in milliseconds
      min: 0,
      default: 0
    }
  },

  // Analysis data
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Analysis data is required'],
    validate: {
      validator: function(v) {
        return v && typeof v === 'object' && Object.keys(v).length > 0;
      },
      message: 'Analysis must be a non-empty object'
    }
  },

  // Applied modifications
  appliedModifications: [{
    type: {
      type: String,
      enum: ['color', 'spacing', 'typography', 'layout'],
      required: true
    },
    target: {
      type: String,
      required: true,
      trim: true
    },
    originalValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    _id: false // Use custom id
  }],

  // Comparison metadata
  comparisonType: {
    type: String,
    enum: ['basic', 'detailed', 'comprehensive'],
    default: 'basic'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },

  // User feedback and ratings
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      trim: true,
      maxlength: 500
    },
    preferred: {
      type: String,
      enum: ['original', 'modified']
    }
  },

  // Version tracking
  version: {
    type: Number,
    default: 1
  },
  parentComparison: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UIComparison',
    default: null
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'uiComparisons'
});

// Indexes for better query performance
uiComparisonSchema.index({ 'originalImage.uploadedAt': -1 });
uiComparisonSchema.index({ 'modifiedImage.generatedAt': -1 });
uiComparisonSchema.index({ status: 1 });
uiComparisonSchema.index({ comparisonType: 1 });
uiComparisonSchema.index({ 'originalImage.url': 1 });

// Virtual fields
uiComparisonSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

uiComparisonSchema.virtual('modificationCount').get(function() {
  return this.appliedModifications ? this.appliedModifications.length : 0;
});

uiComparisonSchema.virtual('processingDuration').get(function() {
  if (this.modifiedImage.generatedAt && this.originalImage.uploadedAt) {
    return this.modifiedImage.generatedAt.getTime() - this.originalImage.uploadedAt.getTime();
  }
  return 0;
});

// Ensure virtual fields are included in JSON
uiComparisonSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret._id;
    ret.id = doc.id;
    return ret;
  }
});

// Pre-save middleware
uiComparisonSchema.pre('save', function(next) {
  // Auto-calculate confidence based on modifications
  if (this.isNew && this.appliedModifications && this.appliedModifications.length > 0) {
    const baseConfidence = 75;
    const modificationBonus = Math.min(this.appliedModifications.length * 2, 20);
    this.confidence = Math.min(baseConfidence + modificationBonus, 95);
  }

  // Set status based on processing
  if (this.modifiedImage.url && this.analysis) {
    this.status = 'completed';
  } else if (this.modifiedImage.url) {
    this.status = 'processing';
  }

  next();
});

// Static methods for common queries
uiComparisonSchema.statics = {
  /**
   * Find comparisons by original image URL
   */
  findByOriginalImage: function(originalImageUrl) {
    return this.find({ 'originalImage.url': originalImageUrl })
      .sort({ 'modifiedImage.generatedAt': -1 })
      .populate('parentComparison');
  },

  /**
   * Find comparisons by status
   */
  findByStatus: function(status) {
    return this.find({ status })
      .sort({ createdAt: -1 });
  },

  /**
   * Get comparison statistics
   */
  async getStatistics() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalComparisons: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          avgProcessingTime: { $avg: '$processingTime' },
          comparisonsByType: {
            $push: '$comparisonType'
          },
          totalModifications: { $sum: '$modificationCount' }
        }
      },
      {
        $project: {
          totalComparisons: 1,
          avgConfidence: { $round: ['$avgConfidence', 2] },
          avgProcessingTime: { $round: ['$avgProcessingTime', 0] },
          comparisonsByType: 1,
          totalModifications: 1
        }
      }
    ]);

    const result = stats[0] || {
      totalComparisons: 0,
      avgConfidence: 0,
      avgProcessingTime: 0,
      comparisonsByType: [],
      totalModifications: 0
    };

    // Count by type
    const typeCounts = result.comparisonsByType.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      ...result,
      comparisonsByType: typeCounts
    };
  },

  /**
   * Get recent comparisons
   */
  getRecentComparisons: function(limit = 10) {
    return this.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('parentComparison');
  },

  /**
   * Find comparison chain (all versions of an original image)
   */
  findComparisonChain: function(originalImageUrl) {
    return this.find({ 'originalImage.url': originalImageUrl })
      .sort({ version: 1 })
      .populate('parentComparison');
  }
};

// Instance methods
uiComparisonSchema.methods = {
  /**
   * Get summary of comparison
   */
  getSummary: function() {
    return {
      id: this.id,
      originalImageUrl: this.originalImage.url,
      modifiedImageUrl: this.modifiedImage.url,
      comparisonType: this.comparisonType,
      status: this.status,
      confidence: this.confidence,
      modificationCount: this.modificationCount,
      processingTime: this.processingDuration,
      createdAt: this.createdAt,
      hasUserFeedback: !!this.userFeedback
    };
  },

  /**
   * Add user feedback
   */
  addUserFeedback: function(rating, comments, preferred) {
    this.userFeedback = {
      rating,
      comments,
      preferred,
      submittedAt: new Date()
    };
    return this.save();
  },

  /**
   * Create new version
   */
  createNewVersion: function(newModifications) {
    return this.constructor({
      originalImage: this.originalImage,
      comparisonType: this.comparisonType,
      appliedModifications: newModifications,
      parentComparison: this._id,
      version: (this.version || 1) + 1
    });
  }
};

// Create and export the model
const UIComparison = mongoose.model('UIComparison', uiComparisonSchema);

module.exports = UIComparison;
