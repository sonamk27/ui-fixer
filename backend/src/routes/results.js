const express = require('express');
const router = express.Router();

// Import controller and middleware
const resultsController = require('../controllers/resultsController');
const { validate, schemas } = require('../middleware/validation');

// Get analysis results by ID
router.get('/:id', validate(schemas.getResults, 'params'), resultsController.getResults);

// Export router
module.exports = router;
