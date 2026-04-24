const express = require('express');
const router = express.Router();

// Import controller and middleware
const regenerationController = require('../controllers/regenerationController');
const { validate, schemas } = require('../middleware/validation');

// Regenerate image with applied changes
router.post('/', validate(schemas.regenerationRequest), regenerationController.regenerateWithChanges);

// Get modification history
router.get('/history/:imageId', regenerationController.getModificationHistory);

// Apply specific changes
router.post('/apply-changes', validate(schemas.applyChangesRequest), regenerationController.applyChanges);

// Export router
module.exports = router;
