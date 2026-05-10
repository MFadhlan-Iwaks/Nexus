function requireRole(...allowedRoles) {
  const allowed = allowedRoles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    const currentRole = String(req.user?.role || '').toLowerCase();

    if (!allowed.includes(currentRole)) {
      return res.status(403).json({
        message: `Akses hanya untuk role: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

module.exports = { requireRole };
