const express = require('express');
const router = express.Router();
const { protect, authorize, PERMISSIONS } = require('../middleware/auth');
const { toSafe } = require('../utils/db');

// GET /api/protected — Any logged in user  (Exp 3.1.2)
router.get('/', protect, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}! JWT verified successfully.`,
    user: { id: req.user.id, username: req.user.username, role: req.user.role }
  });
});

// GET /api/protected/admin-dashboard — Admin only  (Exp 3.1.3)
router.get('/admin-dashboard', protect, authorize('admin'), (req, res) => {
  res.json({
    message: 'Admin Dashboard — restricted content.',
    stats: { totalRoutes: 8, activeUsers: 4, roles: 3 },
    accessedBy: req.user.username
  });
});

// GET /api/protected/moderator-zone — Admin + Moderator
router.get('/moderator-zone', protect, authorize('admin', 'moderator'), (req, res) => {
  res.json({
    message: `Moderator Zone accessed by ${req.user.username}.`,
    role: req.user.role
  });
});

// GET /api/protected/profile — Any authenticated user
router.get('/profile', protect, (req, res) => {
  res.json({
    user: toSafe(req.user),
    permissions: PERMISSIONS[req.user.role] || []
  });
});

// GET /api/protected/permissions — Show permission map
router.get('/permissions', protect, (req, res) => {
  res.json({
    allPermissions: PERMISSIONS,
    yourPermissions: PERMISSIONS[req.user.role] || []
  });
});

module.exports = router;
