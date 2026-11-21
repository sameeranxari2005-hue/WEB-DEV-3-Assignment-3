function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details;

  if (err.name === "ValidationError") {
    status = 400;
    details = Object.values(err.errors).map(item => item.message);
    message = "Validation failed";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid resource ID or field value";
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(", ")}`;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON request body";
  }

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === "development" && status === 500 ? { stack: err.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
