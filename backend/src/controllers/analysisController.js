const { v4: uuidv4 } = require('uuid');
const analysisService = require('../services/analysisService');

/**
 * Analysis Controller
 */
class AnalysisController {
  /**
   * Analyze uploaded image
   */
  async analyzeImage(req, res, next) {
    try {
      const { imageId, analysisType = 'basic' } = req.body;

      // Start analysis
      console.log(`Starting ${analysisType} analysis for image: ${imageId}`);

      // Perform analysis
      const results = await analysisService.analyzeImage(imageId, analysisType);

      // Save results
      await analysisService.saveAnalysisResults(results.id, results);

      res.status(200).json({
        success: true,
        data: {
          analysisId: results.id,
          imageId: results.imageId,
          analysisType: results.analysisType,
          status: 'completed',
          analyzedAt: results.analyzedAt,
          processingTime: results.processingTime,
          confidence: results.confidence,
          suggestions: results.suggestions,
          metadata: results.metadata
        },
        message: 'Image analysis completed successfully'
      });

    } catch (error) {
      console.error('Analysis error:', error);
      next(error);
    }
  }
}

module.exports = new AnalysisController();
