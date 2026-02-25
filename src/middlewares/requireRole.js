/**
 * Role Authorization Middleware
 * Restricts access to specific roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).render('shared/error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
        layout: 'shared/layout',
      });
    }

    next();
  };
}

module.exports = requireRole;
