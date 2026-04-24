const analysisService = require('../services/analysisService');

/**
 * Results Controller
 */
class ResultsController {
  /**
   * Get analysis results by ID
   */
  async getResults(req, res, next) {
    try {
      const { id } = req.params;

      // Get analysis results
      const results = await analysisService.getAnalysisResults(id);

      if (!results) {
        const error = new Error('Analysis results not found');
        error.statusCode = 404;
        error.code = 'RESULTS_NOT_FOUND';
        return next(error);
      }

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
        message: 'Analysis results retrieved successfully'
      });

    } catch (error) {
      console.error('Results retrieval error:', error);
      next(error);
    }
  }
}

module.exports = new ResultsController();
