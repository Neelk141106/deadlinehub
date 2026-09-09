const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Middleware to verify JWT token in Authorization header
 * Expected format: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication required. Invalid token format.', 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError('Server configuration error: JWT_SECRET is not configured', 500));
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Authentication failed.', 401));
  }
};

module.exports = authMiddleware;
