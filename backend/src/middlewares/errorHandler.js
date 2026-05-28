const { logger } = require('../utils/logger');

class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 내부 오류가 발생했습니다.' },
  });
}

module.exports = { AppError, errorHandler };
