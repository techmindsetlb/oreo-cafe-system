const jwt = require('jsonwebtoken');

const JWT_SECRET = 'cafe-software-secret-key-2026';

// Valid roles in the system
const ROLES = ['superadmin', 'admin', 'manager', 'cashier', 'waiter', 'kitchen'];

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles, JWT_SECRET, ROLES };
