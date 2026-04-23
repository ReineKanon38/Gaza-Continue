export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};
