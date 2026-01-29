/**
 * Global Error Handler
 * Catches unhandled errors and returns consistent responses
 *
 * ERROR HANDLING STRATEGY:
 * ─────────────────────────
 * 1. HTTP errors → This middleware catches and formats
 * 2. Socket errors → Handled in socket/index.js, emits 'error' event
 * 3. Unhandled rejections → Caught by process handlers (see index.js)
 *
 * PRODUCTION CONSIDERATIONS:
 * - Never expose stack traces or internal details in production
 * - Log errors for debugging but return generic messages
 * - Classify errors by type for appropriate status codes
 *
 * INTERVIEW EXPLANATION:
 * "Error responses are consistent across the API. In production,
 * we hide implementation details to avoid information leakage,
 * but we still log full errors for debugging."
 */
const config = require('../config');

/**
 * Error classification
 * Maps error types to appropriate HTTP status codes
 */
const classifyError = (err) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return {
      status: 400,
      message: messages.join(', '),
      type: 'VALIDATION_ERROR'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return {
      status: 400,
      message: `Duplicate value for ${field}`,
      type: 'DUPLICATE_ERROR'
    };
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return {
      status: 400,
      message: 'Invalid ID format',
      type: 'CAST_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return {
      status: 401,
      message: 'Invalid token',
      type: 'AUTH_ERROR'
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      status: 401,
      message: 'Token expired',
      type: 'AUTH_ERROR'
    };
  }

  // Custom application errors (with status property)
  if (err.status) {
    return {
      status: err.status,
      message: err.message,
      type: 'APPLICATION_ERROR'
    };
  }

  // Default: Internal server error
  return {
    status: 500,
    message: config.isProduction ? 'Internal server error' : err.message,
    type: 'INTERNAL_ERROR'
  };
};

/**
 * Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Classify the error
  const classified = classifyError(err);

  // Log error (always, for debugging)
  const logData = {
    type: classified.type,
    status: classified.status,
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (!config.isProduction) {
    logData.stack = err.stack;
  }

  console.error('Error:', JSON.stringify(logData, null, 2));

  // Send response
  res.status(classified.status).json({
    error: classified.message,
    // Include error code in development for easier debugging
    ...(config.isProduction ? {} : { code: classified.type })
  });
};

module.exports = errorHandler;
