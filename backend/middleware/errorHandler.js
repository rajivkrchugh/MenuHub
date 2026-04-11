const logger = require('../config/logger');

function notFoundHandler(req, res, _next) {
  res.status(404).json({ success: false, error: 'Route not found' });
}

function globalErrorHandler(err, _req, res, _next) {
  logger.error(err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ success: false, error: message });
}

module.exports = { notFoundHandler, globalErrorHandler };
