const mongoose = require('mongoose');

/**
 * UI Analysis Schema
 * Stores UI analysis data with proper validation
 */
const uiAnalysisSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v) || /^\/uploads\/.+/.test(v);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL or relative path'
    }
  },

  analysis: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Analysis data is required'],
    validate: {
      validator: function(v) {
        // Ensure analysis is an object with some content
        return v && typeof v === 'object' && Object.keys(v).length > 0;
      },
      message: 'Analysis must be a non-empty object'
    }
  },

  // Optional fields for enhanced tracking
  analysisType: {
    type: String,
    enum: ['basic', 'detailed', 'comprehensive'],
    default: 'basic'
  },

  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: function() {
      // Default confidence based on analysis type
      const confidenceMap = {
        'basic': 75,
        'detailed': 85,
        'comprehensive': 90
      };
      return confidenceMap[this.analysisType] || 75;
    }
  },

  processingTime: {
    type: Number, // in milliseconds
    min: 0,
    default: 0
  },

  // Metadata for tracking
  fileName: {
    type: String,
    trim: true
  },

  fileSize: {
    type: Number,
    min: 0
  },

  mimeType: {
    type: String,
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'uiAnalyses'
});

// Indexes for better query performance
uiAnalysisSchema.index({ createdAt: -1 }); // For sorting by creation date
uiAnalysisSchema.index({ imageUrl: 1 }); // For searching by image URL
uiAnalysisSchema.index({ status: 1 }); // For filtering by status
uiAnalysisSchema.index({ analysisType: 1 }); // For filtering by analysis type

// Virtual for formatted creation date
uiAnalysisSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Pre-save middleware for validation
uiAnalysisSchema.pre('save', function(next) {
  // Ensure analysis data structure is valid
  if (this.analysis && typeof this.analysis === 'object') {
    // Add timestamp to analysis if not present
    if (!this.analysis.analyzedAt) {
      this.analysis.analyzedAt = new Date().toISOString();
    }
  }

  // Auto-set status based on analysis presence
  if (this.analysis && Object.keys(this.analysis).length > 0) {
    this.status = 'completed';
  } else {
    this.status = 'pending';
  }

  next();
});

// Static methods for common queries
uiAnalysisSchema.statics = {
  /**
   * Find analyses by date range
   */
  findByDateRange(startDate, endDate) {
    return this.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ createdAt: -1 });
  },

  /**
   * Find analyses by type
   */
  findByType(analysisType) {
    return this.find({ analysisType }).sort({ createdAt: -1 });
  },

  /**
   * Get statistics
   */
  async getStatistics() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          avgProcessingTime: { $avg: '$processingTime' },
          analysesByType: {
            $push: '$analysisType'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAnalyses: 0,
      avgConfidence: 0,
      avgProcessingTime: 0,
      analysesByType: []
    };

    // Count by type
    const typeCounts = result.analysesByType.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAnalyses: result.totalAnalyses,
      averageConfidence: Math.round(result.avgConfidence * 100) / 100,
      averageProcessingTime: Math.round(result.avgProcessingTime),
      analysesByType: typeCounts
    };
  }
};

// Instance methods
uiAnalysisSchema.methods = {
  /**
   * Get analysis summary
   */
  getSummary() {
    return {
      id: this._id,
      imageUrl: this.imageUrl,
      analysisType: this.analysisType,
      confidence: this.confidence,
      status: this.status,
      createdAt: this.createdAt,
      hasAnalysis: this.analysis && Object.keys(this.analysis).length > 0
    };
  },

  /**
   * Update analysis status
   */
  async updateStatus(newStatus) {
    this.status = newStatus;
    return this.save();
  }
};

// Convert to JSON and remove sensitive/internal fields
uiAnalysisSchema.methods.toJSON = function() {
  const analysis = this.toObject();
  delete analysis.__v;
  return analysis;
};

// Create and export the model
const UIAnalysis = mongoose.model('UIAnalysis', uiAnalysisSchema);

module.exports = UIAnalysis;
