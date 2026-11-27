const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: Role not found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Requires ${allowedRoles.join(' or ')} role`
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
