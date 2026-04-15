const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db, toSafe } = require('../utils/db');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email and password are required.' });

    if (username.length < 3)
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    const existing = db.findUserByUsernameOrEmail(username, email);
    if (existing)
      return res.status(400).json({ error: 'Username or email already exists.' });

    const user = await db.createUser({ username, email, password, role: 'user' });
    const token = generateToken(user.id);

    res.status(201).json({ message: 'Registered successfully!', token, user: toSafe(user) });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login  — Exp 3.1.1 + 3.1.2
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const user = db.findUser({ username });
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials.' });

    if (!user.isActive)
      return res.status(403).json({ error: 'Account has been deactivated.' });

    const isMatch = await db.comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid credentials.' });

    db.updateLastLogin(user.id);
    const token = generateToken(user.id);

    res.json({ message: `Welcome back, ${user.username}!`, token, user: toSafe(user) });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: toSafe(req.user) });
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both current and new password are required.' });

    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });

    const user = db.getUserById(req.user.id);
    const isMatch = await db.comparePassword(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Current password is incorrect.' });

    await db.updatePassword(req.user.id, newPassword);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
