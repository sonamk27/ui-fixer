const express = require('express');
const router = express.Router();

// Import controller and middleware
const analysisController = require('../controllers/analysisController');
const { validate, schemas } = require('../middleware/validation');

// Analyze uploaded image
router.post('/', validate(schemas.analysisRequest), analysisController.analyzeImage);

// Export router
module.exports = router;
