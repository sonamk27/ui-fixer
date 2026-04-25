const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const analysisService = require('../services/analysisService');

// File-based storage helpers (no MongoDB needed)
const getComparisonsDir = () => path.join(__dirname, '../../uploads/comparisons');

const saveComparisonToFile = async (comparison) => {
  const dir = getComparisonsDir();
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${comparison.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(comparison, null, 2));
  return comparison;
};

const readComparisonFromFile = async (comparisonId) => {
  try {
    const filePath = path.join(getComparisonsDir(), `${comparisonId}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
};

const listAllComparisons = async () => {
  try {
    const dir = getComparisonsDir();
    await fs.mkdir(dir, { recursive: true });
    const files = await fs.readdir(dir);
    const comparisons = [];
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const data = await fs.readFile(path.join(dir, file), 'utf8');
        comparisons.push(JSON.parse(data));
      } catch (_) {}
    }
    return comparisons;
  } catch (_) {
    return [];
  }
};

/**
 * Comparison Controller
 * Handles UI comparison between original and modified designs (file-based, no MongoDB)
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

      // Generate modified image (simulated)
      const modifiedImageResult = await this.generateModifiedImage(originalImage, modifications, comparisonType);

      const comparison = {
        id: uuidv4(),
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
          generatedAt: new Date().toISOString(),
          processingTime: modifiedImageResult.processingTime
        },
        analysis: modifiedImageResult.analysis,
        appliedModifications: modifications || [],
        comparisonType,
        confidence: modifiedImageResult.confidence,
        status: 'completed',
        version: 1,
        createdAt: new Date().toISOString()
      };

      await saveComparisonToFile(comparison);

      res.status(201).json({
        success: true,
        data: {
          comparisonId: comparison.id,
          originalImage: comparison.originalImage,
          modifiedImage: comparison.modifiedImage,
          analysis: comparison.analysis,
          appliedModifications: comparison.appliedModifications,
          comparisonType: comparison.comparisonType,
          confidence: comparison.confidence,
          processingTime: modifiedImageResult.processingTime,
          createdAt: comparison.createdAt
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

      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      const comparison = {
        id: uuidv4(),
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
          size: 0,
          generatedAt: new Date().toISOString(),
          processingTime: 0
        },
        analysis,
        appliedModifications: appliedModifications || [],
        comparisonType: 'basic',
        confidence: 80,
        status: 'completed',
        version: 1,
        createdAt: new Date().toISOString()
      };

      await saveComparisonToFile(comparison);

      res.status(201).json({
        success: true,
        data: {
          comparisonId: comparison.id,
          originalImage: comparison.originalImage,
          modifiedImage: comparison.modifiedImage,
          analysis: comparison.analysis,
          appliedModifications: comparison.appliedModifications,
          createdAt: comparison.createdAt
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
      const comparison = await readComparisonFromFile(comparisonId);

      if (!comparison) {
        const error = new Error('Comparison not found');
        error.statusCode = 404;
        error.code = 'COMPARISON_NOT_FOUND';
        return next(error);
      }

      res.status(200).json({
        success: true,
        data: comparison,
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

      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      const allComparisons = await listAllComparisons();
      const filtered = allComparisons.filter(
        c => c.originalImage?.url === originalImage.publicUrl
      );

      res.status(200).json({
        success: true,
        data: {
          originalImage,
          comparisons: filtered,
          totalComparisons: filtered.length
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

      const originalImage = await this.getOriginalImage(originalImageId);
      if (!originalImage) {
        const error = new Error('Original image not found');
        error.statusCode = 404;
        error.code = 'ORIGINAL_IMAGE_NOT_FOUND';
        return next(error);
      }

      const allComparisons = await listAllComparisons();
      const chain = allComparisons
        .filter(c => c.originalImage?.url === originalImage.publicUrl)
        .sort((a, b) => (a.version || 1) - (b.version || 1));

      res.status(200).json({
        success: true,
        data: {
          originalImage,
          comparisonChain: chain,
          totalVersions: chain.length
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

      if (rating && (rating < 1 || rating > 5)) {
        const error = new Error('Rating must be between 1 and 5');
        error.statusCode = 400;
        error.code = 'INVALID_RATING';
        return next(error);
      }

      const comparison = await readComparisonFromFile(comparisonId);
      if (!comparison) {
        const error = new Error('Comparison not found');
        error.statusCode = 404;
        error.code = 'COMPARISON_NOT_FOUND';
        return next(error);
      }

      comparison.userFeedback = { rating, comments, preferred, submittedAt: new Date().toISOString() };
      await saveComparisonToFile(comparison);

      res.status(200).json({
        success: true,
        data: {
          comparisonId: comparison.id,
          feedback: comparison.userFeedback
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

      const parentComparison = await readComparisonFromFile(comparisonId);
      if (!parentComparison) {
        const error = new Error('Parent comparison not found');
        error.statusCode = 404;
        error.code = 'PARENT_COMPARISON_NOT_FOUND';
        return next(error);
      }

      const modifiedImageResult = await this.generateModifiedImage(
        parentComparison.originalImage,
        modifications,
        comparisonType
      );

      const newComparison = {
        id: uuidv4(),
        originalImage: parentComparison.originalImage,
        modifiedImage: {
          url: modifiedImageResult.url,
          filename: modifiedImageResult.filename,
          size: modifiedImageResult.size,
          generatedAt: new Date().toISOString(),
          processingTime: modifiedImageResult.processingTime
        },
        analysis: modifiedImageResult.analysis,
        appliedModifications: modifications || [],
        comparisonType: comparisonType || parentComparison.comparisonType,
        confidence: modifiedImageResult.confidence,
        parentComparison: parentComparison.id,
        version: (parentComparison.version || 1) + 1,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      await saveComparisonToFile(newComparison);

      res.status(201).json({
        success: true,
        data: {
          comparisonId: newComparison.id,
          version: newComparison.version,
          originalImage: newComparison.originalImage,
          modifiedImage: newComparison.modifiedImage,
          analysis: newComparison.analysis,
          appliedModifications: newComparison.appliedModifications,
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
      const all = await listAllComparisons();
      const typeCounts = all.reduce((acc, c) => {
        const t = c.comparisonType || 'basic';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});
      const avgConfidence = all.length
        ? Math.round(all.reduce((s, c) => s + (c.confidence || 80), 0) / all.length)
        : 0;

      res.status(200).json({
        success: true,
        data: {
          totalComparisons: all.length,
          avgConfidence,
          comparisonsByType: typeCounts
        },
        message: 'Comparison statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting comparison stats:', error);
      next(error);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  generateModifiedImage = async (originalImage, modifications, comparisonType) => {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const modifiedFilename = `modified_${originalImage.id || Date.now()}_${Date.now()}.jpg`;
    const modifiedUrl = `/uploads/${modifiedFilename}`;
    const analysis = this.generateAnalysisFromModifications(modifications, comparisonType);
    const processingTime = Date.now() - startTime;
    const confidence = this.calculateConfidence(modifications, comparisonType);

    return { url: modifiedUrl, filename: modifiedFilename, size: originalImage.size || 0, processingTime, analysis, confidence };
  }

  generateAnalysisFromModifications = (modifications, comparisonType) => {
    const baseAnalysis = { colorImprovements: [], spacingIssues: [], typographyFixes: [], layoutProblems: [], uxSuggestions: [] };
    if (!modifications || !Array.isArray(modifications)) return baseAnalysis;

    modifications.forEach(({ type, target, newValue, description }) => {
      switch (type) {
        case 'color':
          baseAnalysis.colorImprovements.push({ issue: `Inconsistent colors in ${target}`, suggestion: description || `Apply color: ${newValue?.color || '#667eea'}` });
          break;
        case 'spacing':
          baseAnalysis.spacingIssues.push({ issue: `Poor spacing in ${target}`, suggestion: description || `Use ${newValue?.padding || '16px'} padding` });
          break;
        case 'typography':
          baseAnalysis.typographyFixes.push({ issue: `Typography issues in ${target}`, suggestion: description || `Set font-size to ${newValue?.fontSize || '16px'}` });
          break;
        case 'layout':
          baseAnalysis.layoutProblems.push({ issue: `Layout problems in ${target}`, suggestion: description || `Use ${newValue?.display || 'flex'} layout` });
          break;
      }
    });

    if (comparisonType === 'comprehensive') {
      baseAnalysis.accessibilityIssues = [{ issue: 'Missing accessibility features', suggestion: 'Add ARIA labels and keyboard navigation' }];
      baseAnalysis.responsiveDesign = [{ issue: 'Responsive design needs improvement', suggestion: 'Implement mobile-first responsive design' }];
    }

    return baseAnalysis;
  }

  calculateConfidence = (modifications, comparisonType) => {
    let base = 75;
    if (modifications?.length) base += Math.min(modifications.length * 3, 15);
    base += ({ basic: 0, detailed: 5, comprehensive: 10 }[comparisonType] || 0);
    return Math.min(base, 95);
  }

  getOriginalImage = async (originalImageId) => {
    try {
      return await analysisService.getImageMetadata(originalImageId);
    } catch (_) {
      return null;
    }
  }

  extractFilename = (url) => {
    if (!url) return 'modified.jpg';
    return url.split('/').pop() || 'modified.jpg';
  }
}

module.exports = new ComparisonController();
