const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const UIComparison = require('../models/UIComparison');
const analysisService = require('../services/analysisService');

/**
 * Comparison Controller
 * Handles UI comparison between original and modified designs
 */
class ComparisonController {
  /**
   * Generate modified UI from original image
   */
  generateModifiedUI = async (req, res, next) => {
    try {
      const { originalImageId, modifications, comparisonType = 'basic' } = req.body;

      console.log(`Generating modified UI for image: ${originalImageId}`);

      // Get original image metadata
      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      // Generate modified image
      const modifiedImageResult = await this.generateModifiedImage(originalImage, modifications, comparisonType);

      // Save comparison
      const comparison = new UIComparison({
        originalImage: {
          url: originalImage.publicUrl,
          filename: originalImage.filename,
          size: originalImage.size,
          mimetype: originalImage.mimetype,
          uploadedAt: originalImage.uploadedAt
        },
        modifiedImage: {
          url: modifiedImageResult.url,
          filename: modifiedImageResult.filename,
          size: modifiedImageResult.size,
          generatedAt: new Date(),
          processingTime: modifiedImageResult.processingTime
        },
        analysis: modifiedImageResult.analysis,
        appliedModifications: modifications || [],
        comparisonType,
        confidence: modifiedImageResult.confidence,
        status: 'completed'
      });

      const savedComparison = await comparison.save();

      res.status(201).json({
        success: true,
        data: {
          comparisonId: savedComparison.id,
          originalImage: savedComparison.originalImage,
          modifiedImage: savedComparison.modifiedImage,
          analysis: savedComparison.analysis,
          appliedModifications: savedComparison.appliedModifications,
          comparisonType: savedComparison.comparisonType,
          confidence: savedComparison.confidence,
          processingTime: savedComparison.processingDuration,
          createdAt: savedComparison.createdAt
        },
        message: 'Modified UI generated successfully'
      });

    } catch (error) {
      console.error('Error generating modified UI:', error);
      next(error);
    }
  }

  /**
   * Save comparison between original and modified
   */
  saveComparison = async (req, res, next) => {
    try {
      const { originalImageId, modifiedImageUrl, analysis, appliedModifications } = req.body;

      // Get original image metadata
      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      // Create comparison entry
      const comparison = new UIComparison({
        originalImage: {
          url: originalImage.publicUrl,
          filename: originalImage.filename,
          size: originalImage.size,
          mimetype: originalImage.mimetype,
          uploadedAt: originalImage.uploadedAt
        },
        modifiedImage: {
          url: modifiedImageUrl,
          filename: this.extractFilename(modifiedImageUrl),
          size: 0, // Would be calculated in real implementation
          generatedAt: new Date(),
          processingTime: 0
        },
        analysis,
        appliedModifications: appliedModifications || [],
        comparisonType: 'basic',
        confidence: 80,
        status: 'completed'
      });

      const savedComparison = await comparison.save();

      res.status(201).json({
        success: true,
        data: {
          comparisonId: savedComparison.id,
          originalImage: savedComparison.originalImage,
          modifiedImage: savedComparison.modifiedImage,
          analysis: savedComparison.analysis,
          appliedModifications: savedComparison.appliedModifications,
          createdAt: savedComparison.createdAt
        },
        message: 'Comparison saved successfully'
      });

    } catch (error) {
      console.error('Error saving comparison:', error);
      next(error);
    }
  }

  /**
   * Get comparison data by ID
   */
  getComparison = async (req, res, next) => {
    try {
      const { comparisonId } = req.params;

      const comparison = await UIComparison.findById(comparisonId)
        .populate('parentComparison');

      if (!comparison) {
        const error = new Error('Comparison not found');
        error.statusCode = 404;
        error.code = 'COMPARISON_NOT_FOUND';
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: comparison.getSummary(),
        message: 'Comparison retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting comparison:', error);
      next(error);
    }
  }

  /**
   * Get all comparisons for an original image
   */
  getComparisonsByOriginal = async (req, res, next) => {
    try {
      const { originalImageId } = req.params;

      // Find original image to get URL
      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      // Get all comparisons for this original image
      const comparisons = await UIComparison.findByOriginalImage(originalImage.publicUrl);

      res.status(200).json({
        success: true,
        data: {
          originalImage,
          comparisons: comparisons.map(comp => comp.getSummary()),
          totalComparisons: comparisons.length
        },
        message: 'Comparisons retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting comparisons:', error);
      next(error);
    }
  }

  /**
   * Get comparison chain (all versions)
   */
  getComparisonChain = async (req, res, next) => {
    try {
      const { originalImageId } = req.params;

      // Find original image
      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      // Get comparison chain
      const comparisons = await UIComparison.findComparisonChain(originalImage.publicUrl);

      res.status(200).json({
        success: true,
        data: {
          originalImage,
          comparisonChain: comparisons.map(comp => comp.getSummary()),
          totalVersions: comparisons.length
        },
        message: 'Comparison chain retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting comparison chain:', error);
      next(error);
    }
  }

  /**
   * Add user feedback to comparison
   */
  addFeedback = async (req, res, next) => {
    try {
      const { comparisonId } = req.params;
      const { rating, comments, preferred } = req.body;

      // Validate rating
      if (rating && (rating < 1 || rating > 5)) {
        const error = new Error('Rating must be between 1 and 5');
        error.statusCode = 400;
        error.code = 'INVALID_RATING';
        return next(error);
      }

      const comparison = await UIComparison.findById(comparisonId);
      if (!comparison) {
        const error = new Error('Comparison not found');
        error.statusCode = 404;
        error.code = 'COMPARISON_NOT_FOUND';
        return next(error);
      }

      // Add feedback
      await comparison.addUserFeedback(rating, comments, preferred);

      res.status(200).json({
        success: true,
        data: {
          comparisonId: comparison.id,
          feedback: {
            rating,
            comments,
            preferred,
            submittedAt: new Date()
          }
        },
        message: 'Feedback added successfully'
      });

    } catch (error) {
      console.error('Error adding feedback:', error);
      next(error);
    }
  }

  /**
   * Create new version from existing comparison
   */
  createNewVersion = async (req, res, next) => {
    try {
      const { comparisonId } = req.params;
      const { modifications, comparisonType } = req.body;

      const parentComparison = await UIComparison.findById(comparisonId);
      if (!parentComparison) {
        const error = new Error('Parent comparison not found');
        error.statusCode = 404;
        error.code = 'PARENT_COMPARISON_NOT_FOUND';
        return next(error);
      }

      // Generate new modified image
      const modifiedImageResult = await this.generateModifiedImage(
        parentComparison.originalImage,
        modifications,
        comparisonType
      );

      // Create new comparison version
      const newComparison = new UIComparison({
        originalImage: parentComparison.originalImage,
        modifiedImage: {
          url: modifiedImageResult.url,
          filename: modifiedImageResult.filename,
          size: modifiedImageResult.size,
          generatedAt: new Date(),
          processingTime: modifiedImageResult.processingTime
        },
        analysis: modifiedImageResult.analysis,
        appliedModifications: modifications || [],
        comparisonType: comparisonType || parentComparison.comparisonType,
        confidence: modifiedImageResult.confidence,
        parentComparison: parentComparison._id,
        version: (parentComparison.version || 1) + 1,
        status: 'completed'
      });

      const savedComparison = await newComparison.save();

      res.status(201).json({
        success: true,
        data: {
          comparisonId: savedComparison.id,
          version: savedComparison.version,
          originalImage: savedComparison.originalImage,
          modifiedImage: savedComparison.modifiedImage,
          analysis: savedComparison.analysis,
          appliedModifications: savedComparison.appliedModifications,
          parentVersion: parentComparison.version
        },
        message: 'New comparison version created successfully'
      });

    } catch (error) {
      console.error('Error creating new version:', error);
      next(error);
    }
  }

  /**
   * Get comparison statistics
   */
  getComparisonStats = async (req, res, next) => {
    try {
      const stats = await UIComparison.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Comparison statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting comparison stats:', error);
      next(error);
    }
  }

  /**
   * Generate modified image from original
   */
  generateModifiedImage = async (originalImage, modifications, comparisonType) => {
    try {
      const startTime = Date.now();

      // In a real implementation, this would:
      // 1. Load the original image
      // 2. Apply each modification programmatically
      // 3. Use image processing libraries to modify colors, spacing, etc.
      // 4. Save the modified image
      // 5. Return the new image URL

      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      const modifiedFilename = `modified_${originalImage.id}_${Date.now()}.jpg`;
      const modifiedUrl = `/uploads/${modifiedFilename}`;

      // Generate enhanced analysis based on modifications
      const analysis = this.generateAnalysisFromModifications(modifications, comparisonType);

      const processingTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(modifications, comparisonType);

      return {
        url: modifiedUrl,
        filename: modifiedFilename,
        size: originalImage.size, // Would be calculated in real implementation
        processingTime,
        analysis,
        confidence
      };

    } catch (error) {
      console.error('Error generating modified image:', error);
      throw error;
    }
  }

  /**
   * Generate analysis from modifications
   */
  generateAnalysisFromModifications = (modifications, comparisonType) => {
    const baseAnalysis = {
      colorImprovements: [],
      spacingIssues: [],
      typographyFixes: [],
      layoutProblems: [],
      uxSuggestions: []
    };

    if (!modifications || !Array.isArray(modifications)) {
      return baseAnalysis;
    }

    modifications.forEach(mod => {
      const { type, target, newValue, description } = mod;

      switch (type) {
        case 'color':
          baseAnalysis.colorImprovements.push({
            issue: `Inconsistent colors in ${target}`,
            suggestion: description || `Apply color scheme: ${newValue.color || '#667eea'}`
          });
          break;

        case 'spacing':
          baseAnalysis.spacingIssues.push({
            issue: `Poor spacing in ${target}`,
            suggestion: description || `Use ${newValue.padding || '16px'} padding and ${newValue.margin || '8px'} margin`
          });
          break;

        case 'typography':
          baseAnalysis.typographyFixes.push({
            issue: `Typography issues in ${target}`,
            suggestion: description || `Set font-size to ${newValue.fontSize || '16px'} and line-height to ${newValue.lineHeight || '1.6'}`
          });
          break;

        case 'layout':
          baseAnalysis.layoutProblems.push({
            issue: `Layout problems in ${target}`,
            suggestion: description || `Use ${newValue.display || 'flex'} layout with ${newValue.flexDirection || 'row'} direction`
          });
          break;
      }
    });

    // Add comprehensive analysis for detailed/comprehensive types
    if (comparisonType === 'comprehensive') {
      baseAnalysis.accessibilityIssues = [
        {
          issue: 'Missing accessibility features',
          suggestion: 'Add ARIA labels and keyboard navigation'
        }
      ];
      baseAnalysis.responsiveDesign = [
        {
          issue: 'Responsive design needs improvement',
          suggestion: 'Implement mobile-first responsive design'
        }
      ];
    }

    return baseAnalysis;
  }

  /**
   * Calculate confidence based on modifications and type
   */
  calculateConfidence = (modifications, comparisonType) => {
    let baseConfidence = 75;

    // Add confidence based on modification count
    if (modifications && modifications.length > 0) {
      baseConfidence += Math.min(modifications.length * 3, 15);
    }

    // Add confidence based on comparison type
    const typeBonus = {
      basic: 0,
      detailed: 5,
      comprehensive: 10
    };

    baseConfidence += typeBonus[comparisonType] || 0;

    return Math.min(baseConfidence, 95);
  }

  /**
   * Get original image metadata
   */
  getOriginalImage = async (originalImageId) => {
    try {
      // Try to get from analysis service first
      return await analysisService.getImageMetadata(originalImageId);
    } catch (error) {
      // If not found in analysis, try to find in comparisons
      const comparison = await UIComparison.findOne({ 'originalImage.url': { $regex: originalImageId } });
      return comparison ? comparison.originalImage : null;
    }
  }

  /**
   * Extract filename from URL
   */
  extractFilename = (url) => {
    if (!url) return 'modified.jpg';
    return url.split('/').pop() || 'modified.jpg';
  }
}

module.exports = new ComparisonController();
