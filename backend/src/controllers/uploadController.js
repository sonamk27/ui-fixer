const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Upload Controller
 */
class UploadController {
  /**
   * Handle image upload
   */
  uploadImage = async (req, res, next) => {
    try {
      if (!req.file) {
        const error = new Error('No file uploaded');
        error.statusCode = 400;
        error.code = 'NO_FILE';
        return next(error);
      }

      // Generate unique ID for this upload
      const uploadId = uuidv4();
      
      // Create upload metadata
      const uploadData = {
        id: uploadId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadPath: req.file.path,
        publicUrl: `/uploads/${req.file.filename}`,
        uploadedAt: new Date().toISOString()
      };

      // Save metadata to file system (in production, use database)
      await this.saveUploadMetadata(uploadId, uploadData);

      res.status(201).json({
        success: true,
        data: {
          id: uploadId,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          publicUrl: uploadData.publicUrl,
          uploadedAt: uploadData.uploadedAt
        },
        message: 'Image uploaded successfully'
      });

    } catch (error) {
      // Clean up uploaded file if there's an error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      next(error);
    }
  }

  /**
   * Save upload metadata to file system
   * In production, this should be replaced with database storage
   */
  saveUploadMetadata = async (uploadId, metadata) => {
    try {
      const metadataDir = path.join(__dirname, '../../uploads/metadata');
      await fs.mkdir(metadataDir, { recursive: true });
      
      const metadataPath = path.join(metadataDir, `${uploadId}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Error saving upload metadata:', error);
      throw error;
    }
  }

  /**
   * Get upload metadata
   */
  getUploadMetadata = async (uploadId) => {
    try {
      const metadataPath = path.join(__dirname, '../../uploads/metadata', `${uploadId}.json`);
      const metadata = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(metadata);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete uploaded file and metadata
   */
  deleteUpload = async (uploadId) => {
    try {
      const metadata = await this.getUploadMetadata(uploadId);
      if (!metadata) {
        return false;
      }

      // Delete file
      try {
        await fs.unlink(metadata.uploadPath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }

      // Delete metadata
      const metadataPath = path.join(__dirname, '../../uploads/metadata', `${uploadId}.json`);
      try {
        await fs.unlink(metadataPath);
      } catch (metadataError) {
        console.error('Error deleting metadata:', metadataError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting upload:', error);
      throw error;
    }
  }
}

module.exports = new UploadController();
