/**
 * Global Error Handling Middleware
 *
 * Catches all errors passed via next(error) and returns
 * a consistent JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ [Error] ${req.method} ${req.originalUrl} — ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Middleware
 *
 * Catches any request that doesn't match a defined route.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
