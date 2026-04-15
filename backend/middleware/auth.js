const jwt = require('jsonwebtoken');
const { db } = require('../utils/db');

const PERMISSIONS = {
  admin:     ['read:all', 'write:all', 'delete:all', 'manage:users', 'view:dashboard', 'view:profile'],
  moderator: ['read:all', 'write:own', 'view:dashboard', 'view:profile'],
  user:      ['read:own', 'view:profile']
};

// Exp 3.1.2 — Verify JWT token
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing token. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.getUserById(decoded.id);

    if (!user) return res.status(401).json({ error: 'User not found.' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// Exp 3.1.3 — Role-Based Access Control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        error: `Forbidden: requires ${roles.join(' or ')} role. Your role: ${req.user?.role}`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, PERMISSIONS };
