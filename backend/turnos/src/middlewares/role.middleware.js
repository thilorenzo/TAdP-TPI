function requireInspector(req, res, next) {
  const role = req.header('x-role');
  if (role !== 'inspector') {
    return res.status(403).json({ message: 'Acceso solo para usuarios con rol inspector' });
  }
  next();
}

module.exports = {
  requireInspector
};
