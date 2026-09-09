const AppError = require('../utils/AppError');

/**
 * Role-based authorization middleware.
 * Must be used AFTER authMiddleware so req.user is already populated.
 *
 * Usage:
 *   router.post('/', authMiddleware, requireRole('teacher'), handler)
 *   router.post('/', requireRole('teacher'), handler)  // when route group already uses authMiddleware
 *
 * @param {...string} allowedRoles - one or more roles that are permitted
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new AppError(
        `Forbidden: this action requires one of the following roles: ${allowedRoles.join(', ')}.`,
        403
      )
    );
  }

  next();
};

module.exports = requireRole;
