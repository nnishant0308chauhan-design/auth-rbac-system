const bcrypt = require('bcryptjs');

// ── In-Memory "Database" (replaces MongoDB) ──────────────────────────────────
// Data lives in RAM while server is running. Resets on server restart.

let users = [];
let nextId = 1;

// Seed default users on startup
const seedUsers = async () => {
  const defaults = [
    { username: 'admin',     email: 'admin@authlab.com',     password: 'admin123', role: 'admin' },
    { username: 'moderator', email: 'mod@authlab.com',       password: 'mod123',   role: 'moderator' },
    { username: 'alice',     email: 'alice@authlab.com',     password: 'alice123', role: 'user' },
    { username: 'bob',       email: 'bob@authlab.com',       password: 'bob123',   role: 'user' },
  ];

  for (const u of defaults) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(u.password, salt);
    users.push({
      id: String(nextId++),
      username: u.username,
      email: u.email,
      password: hashed,
      role: u.role,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    });
  }

  console.log('🌱 In-memory DB seeded with 4 users:');
  console.log('   admin      / admin123  (admin)');
  console.log('   moderator  / mod123    (moderator)');
  console.log('   alice      / alice123  (user)');
  console.log('   bob        / bob123    (user)');
};

// ── DB Helper Methods ────────────────────────────────────────────────────────

const db = {
  // Find user by any field
  findUser: (query) => {
    return users.find(u => {
      return Object.keys(query).every(k => u[k] === query[k]);
    }) || null;
  },

  // Find user by id OR username OR email (for login checks)
  findUserByUsernameOrEmail: (username, email) => {
    return users.find(u => u.username === username || u.email === email) || null;
  },

  // Get all users (without passwords)
  getAllUsers: () => users.map(u => toSafe(u)),

  // Get user by id
  getUserById: (id) => users.find(u => u.id === id) || null,

  // Create user
  createUser: async ({ username, email, password, role = 'user' }) => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = {
      id: String(nextId++),
      username,
      email,
      password: hashed,
      role,
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    return user;
  },

  // Update role
  updateRole: (id, role) => {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    user.role = role;
    return toSafe(user);
  },

  // Toggle active status
  toggleStatus: (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    user.isActive = !user.isActive;
    return toSafe(user);
  },

  // Update last login
  updateLastLogin: (id) => {
    const user = users.find(u => u.id === id);
    if (user) user.lastLogin = new Date().toISOString();
  },

  // Update password
  updatePassword: async (id, newPassword) => {
    const user = users.find(u => u.id === id);
    if (!user) return false;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    return true;
  },

  // Delete user
  deleteUser: (id) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const [deleted] = users.splice(idx, 1);
    return deleted;
  },

  // Compare password
  comparePassword: async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
  }
};

// Strip password from user object
const toSafe = (user) => {
  const { password, ...safe } = user;
  return safe;
};

module.exports = { db, seedUsers, toSafe };
