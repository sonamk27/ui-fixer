const Joi = require('joi');

/**
 * Validation schemas
 */
const schemas = {
  // Image upload validation
  imageUpload: Joi.object({
    // This is for multer file validation, handled separately
  }),

  // Analysis request validation
  analysisRequest: Joi.object({
    imageId: Joi.string().uuid().required().messages({
      'string.uuid': 'Image ID must be a valid UUID',
      'any.required': 'Image ID is required'
    }),
    analysisType: Joi.string().valid('basic', 'detailed', 'comprehensive').default('basic').messages({
      'any.only': 'Analysis type must be one of: basic, detailed, comprehensive'
    })
  }),

  // Results retrieval validation
  getResults: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'ID must be a valid UUID',
      'any.required': 'ID is required'
    })
  }),

  // Regeneration request validation
  regenerationRequest: Joi.object({
    imageId: Joi.string().uuid().required().messages({
      'string.uuid': 'Image ID must be a valid UUID',
      'any.required': 'Image ID is required'
    }),
    appliedChanges: Joi.object().pattern(
      Joi.string(),
      Joi.object()
    ).default({}),
    modificationHistory: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('color', 'spacing', 'typography', 'layout').required(),
        target: Joi.string().required(),
        originalValue: Joi.any(),
        newValue: Joi.any(),
        description: Joi.string(),
        timestamp: Joi.string().isoDate(),
        applied: Joi.boolean().default(false)
      })
    ).default([])
  }),

  // Apply changes request validation
  applyChangesRequest: Joi.object({
    imageId: Joi.string().uuid().required().messages({
      'string.uuid': 'Image ID must be a valid UUID',
      'any.required': 'Image ID is required'
    }),
    changes: Joi.object().pattern(
      Joi.string(),
      Joi.object()
    ).required().messages({
      'any.required': 'Changes object is required'
    })
  }),

  // Generate modified UI validation
  generateModifiedUI: Joi.object({
    originalImageId: Joi.string().uuid().required().messages({
      'string.uuid': 'Original image ID must be a valid UUID',
      'any.required': 'Original image ID is required'
    }),
    modifications: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('color', 'spacing', 'typography', 'layout').required(),
        target: Joi.string().required(),
        newValue: Joi.object().required(),
        description: Joi.string().required()
      })
    ).default([]),
    comparisonType: Joi.string().valid('basic', 'detailed', 'comprehensive').default('basic')
  }),

  // Save comparison validation
  saveComparison: Joi.object({
    originalImageId: Joi.string().uuid().required(),
    modifiedImageUrl: Joi.string().uri().required(),
    analysis: Joi.object().required(),
    appliedModifications: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('color', 'spacing', 'typography', 'layout').required(),
        target: Joi.string().required(),
        newValue: Joi.object().required(),
        description: Joi.string().required()
      })
    ).default([])
  }),

  // Get comparison validation
  getComparison: Joi.object({
    comparisonId: Joi.string().uuid().required().messages({
      'string.uuid': 'Comparison ID must be a valid UUID',
      'any.required': 'Comparison ID is required'
    })
  }),

  // Get comparisons by original validation
  getComparisonsByOriginal: Joi.object({
    originalImageId: Joi.string().uuid().required().messages({
      'string.uuid': 'Original image ID must be a valid UUID',
      'any.required': 'Original image ID is required'
    })
  }),

  // Get comparison chain validation
  getComparisonChain: Joi.object({
    originalImageId: Joi.string().uuid().required().messages({
      'string.uuid': 'Original image ID must be a valid UUID',
      'any.required': 'Original image ID is required'
    })
  }),

  // Add feedback validation
  addFeedback: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comments: Joi.string().max(500).optional(),
    preferred: Joi.string().valid('original', 'modified').optional()
  }),

  // Create new version validation
  createNewVersion: Joi.object({
    modifications: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('color', 'spacing', 'typography', 'layout').required(),
        target: Joi.string().required(),
        newValue: Joi.object().required(),
        description: Joi.string().required()
      })
    ).required(),
    comparisonType: Joi.string().valid('basic', 'detailed', 'comprehensive').optional()
  })
};

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      const validationError = new Error(`Validation Error: ${errorMessage}`);
      validationError.isJoi = true;
      validationError.details = error.details;
      return next(validationError);
    }

    req[property] = value;
    next();
  };
};

/**
 * File validation middleware
 */
const validateFile = (req, res, next) => {
  if (!req.file) {
    const error = new Error('No file uploaded');
    error.statusCode = 400;
    error.code = 'NO_FILE';
    return next(error);
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    const error = new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    return next(error);
  }

  // Check file size (already handled by multer, but double-check)
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    const error = new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    error.statusCode = 400;
    error.code = 'FILE_TOO_LARGE';
    return next(error);
  }

  next();
};

module.exports = {
  validate,
  validateFile,
  schemas
};
