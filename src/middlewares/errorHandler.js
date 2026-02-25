/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Check if request expects JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  // Render error page
  res.status(statusCode).render('shared/error', {
    title: 'Error',
    message: statusCode === 500 ? 'Something went wrong. Please try again.' : message,
    statusCode,
    layout: 'shared/layout',
  });
}

module.exports = errorHandler;
