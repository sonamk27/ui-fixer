const express = require('express');
const router = express.Router();

// Import controller and middleware
const comparisonController = require('../controllers/comparisonController');
const { validate, schemas } = require('../middleware/validation');

// Generate modified UI from original image
router.post('/generate', validate(schemas.generateModifiedUI), comparisonController.generateModifiedUI);

// Save comparison between original and modified
router.post('/save', validate(schemas.saveComparison), comparisonController.saveComparison);

// Get comparison data
router.get('/:comparisonId', validate(schemas.getComparison, 'params'), comparisonController.getComparison);

// Get comparisons for original image
router.get('/original/:originalImageId', validate(schemas.getComparisonsByOriginal, 'params'), comparisonController.getComparisonsByOriginal);

// Get comparison chain (all versions)
router.get('/chain/:originalImageId', validate(schemas.getComparisonChain, 'params'), comparisonController.getComparisonChain);

// Add user feedback
router.post('/:comparisonId/feedback', validate(schemas.addFeedback), comparisonController.addFeedback);

// Create new version from existing comparison
router.post('/:comparisonId/version', validate(schemas.createNewVersion), comparisonController.createNewVersion);

// Get comparison statistics
router.get('/stats', comparisonController.getComparisonStats);

// Export router
module.exports = router;
