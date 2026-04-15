const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { seedUsers } = require('./utils/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode}`);
  });
  next();
});

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/protected', require('./routes/protected'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running (no MongoDB needed!)' });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

// Seed in-memory DB then start server
seedUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Using in-memory database (no MongoDB needed)`);
    console.log(`⚠️  Data resets when server restarts\n`);
  });
});
