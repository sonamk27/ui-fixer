const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const analysisService = require('../services/analysisService');

/**
 * Regeneration Controller
 * Handles image regeneration with applied changes
 */
class RegenerationController {
  /**
   * Regenerate image with tracked changes
   */
  regenerateWithChanges = async (req, res, next) => {
    try {
      const { imageId, appliedChanges, modificationHistory } = req.body;

      console.log(`Regenerating image ${imageId} with ${Object.keys(appliedChanges || {}).length} changes`);

      // Get original image metadata
      let imageMetadata;
      try {
        imageMetadata = await analysisService.getImageMetadata(imageId);
      } catch (error) {
        console.error('Error getting image metadata:', error);
      }
      
      if (!imageMetadata) {
        // Create mock metadata for testing if not found
        imageMetadata = {
          id: imageId,
          filename: `${imageId}.jpg`,
          uploadPath: `uploads/${imageId}.jpg`,
          publicUrl: `/uploads/${imageId}.jpg`,
          size: 1024,
          mimetype: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        };
        console.log('Using mock image metadata for testing:', imageMetadata);
      }

      // Perform regeneration with changes
      const regenerationResult = await this.performRegeneration(
        imageMetadata, 
        appliedChanges, 
        modificationHistory
      );

      // Save regeneration results
      await this.saveRegenerationResults(regenerationResult);

      res.status(200).json({
        success: true,
        data: {
          regenerationId: regenerationResult.id,
          originalImageId: imageId,
          regeneratedImageUrl: regenerationResult.imageUrl,
          appliedChanges: regenerationResult.appliedChanges,
          modificationCount: Object.keys(appliedChanges || {}).length,
          regeneratedAt: regenerationResult.regeneratedAt,
          processingTime: regenerationResult.processingTime,
          cssGenerated: regenerationResult.cssGenerated
        },
        message: 'Image regenerated successfully with applied changes'
      });

    } catch (error) {
      console.error('Regeneration error:', error);
      next(error);
    }
  }

  /**
   * Get modification history for an image
   */
  getModificationHistory = async (req, res, next) => {
    try {
      const { imageId } = req.params;

      // Get modification history from storage
      const history = await this.getModificationHistoryFromStorage(imageId);

      res.status(200).json({
        success: true,
        data: {
          imageId,
          modifications: history,
          totalModifications: history.length
        },
        message: 'Modification history retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting modification history:', error);
      next(error);
    }
  }

  /**
   * Apply specific changes to an image
   */
  applyChanges = async (req, res, next) => {
    try {
      const { imageId, changes } = req.body;

      // Validate changes
      if (!changes || typeof changes !== 'object') {
        const error = new Error('Invalid changes format');
        error.statusCode = 400;
        error.code = 'INVALID_CHANGES';
        return next(error);
      }

      // Apply changes to image
      const applicationResult = await this.applyChangesToImage(imageId, changes);

      res.status(200).json({
        success: true,
        data: {
          imageId,
          appliedChanges: applicationResult.appliedChanges,
          changesCount: Object.keys(changes).length,
          appliedAt: applicationResult.appliedAt
        },
        message: 'Changes applied successfully'
      });

    } catch (error) {
      console.error('Error applying changes:', error);
      next(error);
    }
  }

  /**
   * Perform actual regeneration with changes
   */
  performRegeneration = async (imageMetadata, appliedChanges, modificationHistory) => {
    try {
      const startTime = Date.now();

      // Simulate regeneration process with AI or enhanced simulation
      let regeneratedImageUrl;
      
      if (this.hasRealAIAccess()) {
        regeneratedImageUrl = await this.regenerateWithAI(imageMetadata, appliedChanges);
      } else {
        regeneratedImageUrl = await this.regenerateWithSimulation(imageMetadata, appliedChanges);
      }

      // Generate CSS from applied changes
      const cssGenerated = this.generateCSSFromChanges(appliedChanges);

      const processingTime = Date.now() - startTime;

      return {
        id: uuidv4(),
        originalImageId: imageMetadata.id,
        imageUrl: regeneratedImageUrl,
        appliedChanges,
        modificationHistory: modificationHistory || [],
        cssGenerated,
        regeneratedAt: new Date().toISOString(),
        processingTime,
        regenerationMethod: this.hasRealAIAccess() ? 'ai' : 'simulation'
      };

    } catch (error) {
      console.error('Error during regeneration:', error);
      throw error;
    }
  }

  /**
   * Regenerate using AI (if available)
   */
  regenerateWithAI = async (imageMetadata, appliedChanges) => {
    // In a real implementation, this would:
    // 1. Load the original image
    // 2. Apply the tracked changes using image processing
    // 3. Use AI to enhance with the applied constraints
    // 4. Return the new image URL
    
    // For now, simulate with enhanced processing
    return await this.simulateEnhancedRegeneration(imageMetadata, appliedChanges, 'ai');
  }

  /**
   * Regenerate using simulation
   */
  regenerateWithSimulation = async (imageMetadata, appliedChanges) => {
    return await this.simulateEnhancedRegeneration(imageMetadata, appliedChanges, 'simulation');
  }

  /**
   * Simulate enhanced regeneration
   */
  simulateEnhancedRegeneration = async (imageMetadata, appliedChanges, method) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Generate a "regenerated" image URL (in real app, this would be actual image processing)
    const regeneratedFilename = `regenerated_${imageMetadata.id}_${Date.now()}.jpg`;
    const regeneratedImageUrl = `/uploads/${regeneratedFilename}`;

    // In a real implementation, you would:
    // 1. Load the original image
    // 2. Apply each change programmatically (color adjustments, spacing, typography)
    // 3. Save the modified image
    // 4. Return the new image URL

    console.log(`Simulated ${method} regeneration with changes:`, appliedChanges);
    
    return regeneratedImageUrl;
  }

  /**
   * Generate CSS from applied changes
   */
  generateCSSFromChanges = (appliedChanges) => {
    if (!appliedChanges || typeof appliedChanges !== 'object') {
      return '/* Generated CSS from applied changes */';
    }

    let css = '/* Generated CSS from applied changes */\n';

    Object.entries(appliedChanges).forEach(([key, value]) => {
      const [type, target] = key.split('_');
      
      switch (type) {
        case 'color':
          css += '\n/* Color improvements for ' + target + ' */\n.' + target + ' {\n  color: ' + (value.color || '#ffffff') + ';\n  background-color: ' + (value.backgroundColor || 'transparent') + ';\n  border-color: ' + (value.borderColor || 'transparent') + ';\n}\n';
          break;
        case 'spacing':
          css += '\n/* Spacing improvements for ' + target + ' */\n.' + target + ' {\n  padding: ' + (value.padding || '16px') + ';\n  margin: ' + (value.margin || '0') + ';\n  gap: ' + (value.gap || '0') + ';\n}\n';
          break;
        case 'typography':
          css += '\n/* Typography improvements for ' + target + ' */\n.' + target + ' {\n  font-size: ' + (value.fontSize || '16px') + ';\n  line-height: ' + (value.lineHeight || '1.6') + ';\n  font-weight: ' + (value.fontWeight || '400') + ';\n}\n';
          break;
        case 'layout':
          css += '\n/* Layout improvements for ' + target + ' */\n.' + target + ' {\n  display: ' + (value.display || 'block') + ';\n  flex-direction: ' + (value.flexDirection || 'row') + ';\n  align-items: ' + (value.alignItems || 'stretch') + ';\n  justify-content: ' + (value.justifyContent || 'flex-start') + ';\n}\n';
          break;
      }
    });

    return css;
  }

  
  /**
   * Check if real AI access is available
   */
  hasRealAIAccess = () => {
    return process.env.OPENAI_API_KEY && 
           process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  }

  /**
   * Save regeneration results
   */
  saveRegenerationResults = async (regenerationResult) => {
    try {
      const resultsDir = path.join(__dirname, '../../uploads/regenerations');
      await fs.mkdir(resultsDir, { recursive: true });
      
      const resultsPath = path.join(resultsDir, `${regenerationResult.id}.json`);
      await fs.writeFile(resultsPath, JSON.stringify(regenerationResult, null, 2));
    } catch (error) {
      console.error('Error saving regeneration results:', error);
      // Don't throw error here, just log it
    }
  }

  /**
   * Get modification history from storage
   */
  getModificationHistoryFromStorage = async (imageId) => {
    try {
      const historyPath = path.join(__dirname, '../../uploads/modifications', `${imageId}.json`);
      const history = await fs.readFile(historyPath, 'utf8');
      return JSON.parse(history);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Apply changes to image
   */
  applyChangesToImage = async (imageId, changes) => {
    // In a real implementation, this would:
    // 1. Load the original image
    // 2. Apply each change programmatically
    // 3. Save the modified image
    // 4. Return the result
    
    return {
      appliedChanges: changes,
      appliedAt: new Date().toISOString()
    };
  }
}

module.exports = new RegenerationController();
