const express = require('express');
const router = express.Router();
const { db, toSafe } = require('../utils/db');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users — Admin + Moderator
router.get('/', protect, authorize('admin', 'moderator'), (req, res) => {
  const users = db.getAllUsers();
  res.json({ message: 'Users fetched.', count: users.length, users });
});

// GET /api/users/:id — Admin only
router.get('/:id', protect, authorize('admin'), (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: toSafe(user) });
});

// PUT /api/users/:id/role — Admin only  (Exp 3.1.3)
router.put('/:id/role', protect, authorize('admin'), (req, res) => {
  const { role } = req.body;

  if (!['admin', 'moderator', 'user'].includes(role))
    return res.status(400).json({ error: 'Invalid role. Use: admin, moderator, or user.' });

  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Cannot change your own role.' });

  const user = db.updateRole(req.params.id, role);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({ message: `Role updated to '${role}' for ${user.username}.`, user });
});

// PUT /api/users/:id/toggle-status — Admin only
router.put('/:id/toggle-status', protect, authorize('admin'), (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Cannot deactivate your own account.' });

  const user = db.toggleStatus(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({ message: `User ${user.username} is now ${user.isActive ? 'active' : 'inactive'}.`, user });
});

// DELETE /api/users/:id — Admin only
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Cannot delete your own account.' });

  const user = db.deleteUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({ message: `User ${user.username} deleted.` });
});

module.exports = router;
