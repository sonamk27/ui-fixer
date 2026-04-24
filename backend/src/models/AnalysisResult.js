const mongoose = require('mongoose');

/**
 * Analysis Result Schema
 * Stores UI analysis results
 */
const analysisResultSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  imageId: {
    type: String,
    required: true,
    ref: 'ImageUpload',
    index: true
  },
  analysisType: {
    type: String,
    enum: ['basic', 'detailed', 'comprehensive'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  },
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  confidence: {
    type: Number, // 0-100
    min: 0,
    max: 100,
    required: true
  },
  suggestions: {
    colorImprovements: [{
      issue: String,
      suggestion: String
    }],
    spacingIssues: [{
      issue: String,
      suggestion: String
    }],
    typographyFixes: [{
      issue: String,
      suggestion: String
    }],
    layoutProblems: [{
      issue: String,
      suggestion: String
    }],
    uxSuggestions: [{
      issue: String,
      suggestion: String
    }],
    accessibilityIssues: [{
      issue: String,
      suggestion: String
    }],
    responsiveDesign: [{
      issue: String,
      suggestion: String
    }]
  },
  metadata: {
    filename: String,
    originalName: String,
    fileSize: Number,
    analysisMethod: {
      type: String,
      enum: ['ai', 'simulation'],
      default: 'simulation'
    },
    rawResponse: String // For AI responses
  }
}, {
  timestamps: true,
  collection: 'analysisResults'
});

// Index for faster queries
analysisResultSchema.index({ analyzedAt: -1 });
analysisResultSchema.index({ imageId: 1, analyzedAt: -1 });

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
