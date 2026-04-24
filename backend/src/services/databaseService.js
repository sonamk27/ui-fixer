const ImageUpload = require('../models/ImageUpload');
const AnalysisResult = require('../models/AnalysisResult');

/**
 * Database Service
 * Handles all database operations for uploads and analysis results
 */
class DatabaseService {
  /**
   * Save image upload metadata
   */
  async saveImageUpload(uploadData) {
    try {
      const imageUpload = new ImageUpload(uploadData);
      const saved = await imageUpload.save();
      return saved.toObject();
    } catch (error) {
      console.error('Error saving image upload:', error);
      throw error;
    }
  }

  /**
   * Get image upload by ID
   */
  async getImageUpload(imageId) {
    try {
      const upload = await ImageUpload.findOne({ id: imageId });
      return upload ? upload.toObject() : null;
    } catch (error) {
      console.error('Error getting image upload:', error);
      throw error;
    }
  }

  /**
   * Delete image upload
   */
  async deleteImageUpload(imageId) {
    try {
      const result = await ImageUpload.deleteOne({ id: imageId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting image upload:', error);
      throw error;
    }
  }

  /**
   * Save analysis result
   */
  async saveAnalysisResult(resultData) {
    try {
      const analysisResult = new AnalysisResult(resultData);
      const saved = await analysisResult.save();
      return saved.toObject();
    } catch (error) {
      console.error('Error saving analysis result:', error);
      throw error;
    }
  }

  /**
   * Get analysis result by ID
   */
  async getAnalysisResult(analysisId) {
    try {
      const result = await AnalysisResult.findOne({ id: analysisId });
      return result ? result.toObject() : null;
    } catch (error) {
      console.error('Error getting analysis result:', error);
      throw error;
    }
  }

  /**
   * Get analysis results by image ID
   */
  async getAnalysisResultsByImageId(imageId) {
    try {
      const results = await AnalysisResult.find({ imageId })
        .sort({ analyzedAt: -1 })
        .lean();
      return results;
    } catch (error) {
      console.error('Error getting analysis results by image ID:', error);
      throw error;
    }
  }

  /**
   * Get recent analysis results
   */
  async getRecentResults(limit = 10) {
    try {
      const results = await AnalysisResult.find()
        .sort({ analyzedAt: -1 })
        .limit(limit)
        .lean();
      return results;
    } catch (error) {
      console.error('Error getting recent results:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const totalUploads = await ImageUpload.countDocuments();
      const totalAnalyses = await AnalysisResult.countDocuments();
      const analysesByType = await AnalysisResult.aggregate([
        { $group: { _id: '$analysisType', count: { $sum: 1 } } }
      ]);
      const avgConfidence = await AnalysisResult.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
      ]);

      return {
        totalUploads,
        totalAnalyses,
        analysesByType: analysesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        averageConfidence: avgConfidence[0]?.avgConfidence?.toFixed(2) || 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Cleanup old uploads and results
   */
  async cleanupOldData(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Delete old analysis results
      const analysisResult = await AnalysisResult.deleteMany({
        analyzedAt: { $lt: cutoffDate }
      });

      // Delete old image uploads
      const uploadResult = await ImageUpload.deleteMany({
        uploadedAt: { $lt: cutoffDate }
      });

      return {
        deletedAnalyses: analysisResult.deletedCount,
        deletedUploads: uploadResult.deletedCount,
        cutoffDate
      };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
