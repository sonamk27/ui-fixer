/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Multer error handling
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum size is 10MB.';
    error = {
      statusCode: 400,
      message,
      code: 'FILE_TOO_LARGE'
    };
  }

  // Multer file type error
  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded. Maximum is 1 file.';
    error = {
      statusCode: 400,
      message,
      code: 'TOO_MANY_FILES'
    };
  }

  // Invalid file type
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Invalid file field or too many files.';
    error = {
      statusCode: 400,
      message,
      code: 'INVALID_FILE_FIELD'
    };
  }

  // Joi validation error
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = {
      statusCode: 400,
      message: `Validation Error: ${message}`,
      code: 'VALIDATION_ERROR'
    };
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      statusCode: 400,
      message,
      code: 'DUPLICATE_FIELD'
    };
  }

  // MongoDB cast error
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      statusCode: 404,
      message,
      code: 'NOT_FOUND'
    };
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    error = {
      statusCode: 403,
      message: 'Cross-origin request blocked',
      code: 'CORS_ERROR'
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
