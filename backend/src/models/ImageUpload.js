const mongoose = require('mongoose');

/**
 * Image Upload Schema
 * Stores metadata about uploaded images
 */
const imageUploadSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadPath: {
    type: String,
    required: true
  },
  publicUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'imageUploads'
});

// Index for faster queries
imageUploadSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('ImageUpload', imageUploadSchema);
