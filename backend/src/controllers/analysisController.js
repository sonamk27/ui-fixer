const { v4: uuidv4 } = require('uuid');
const analysisService = require('../services/analysisService');

/**
 * Analysis Controller
 */
class AnalysisController {
  /**
   * Analyze uploaded image
   */
  analyzeImage = async (req, res, next) => {
    try {
      const { imageId, analysisType = 'basic' } = req.body;

      if (!imageId) {
        const error = new Error('imageId is required');
        error.statusCode = 400;
        return next(error);
      }

      // Start analysis
      console.log(`Starting ${analysisType} analysis for image: ${imageId}`);

      // Perform analysis
      const results = await analysisService.analyzeImage(imageId, analysisType);

      // Save redesigned HTML if present
      if (results.redesignedHtml) {
        await analysisService.saveRedesignedHtml(imageId, results.redesignedHtml);
      }

      // Save results
      await analysisService.saveAnalysisResults(results.id, results);

      console.log(`Analysis complete for image: ${imageId}, analysisId: ${results.id}`);

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
          report: results.report,
          designSystem: results.designSystem,
          redesignUrl: `http://localhost:5001/api/redesign/${results.imageId}`,
          metadata: results.metadata
        },
        message: 'Image analysis completed successfully'
      });

    } catch (error) {
      console.error('Analysis error details:', {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      next(error);
    }
  }
}

module.exports = new AnalysisController();
