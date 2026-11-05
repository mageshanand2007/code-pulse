/**
 * Global Error Handler Middleware
 */

export function errorHandler(err, req, res, next) {
  console.error('[CodePulse Error]:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred while analyzing the repository.';

  res.status(status).json({
    success: false,
    error: message,
    statusCode: status,
    timestamp: new Date().toISOString(),
  });
}

export default errorHandler;
