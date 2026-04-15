# AuthLab — Combined Experiment 3.1.1 + 3.1.2 + 3.1.3

A full-stack authentication + RBAC application combining all three experiments.

---

## What's Covered

| Experiment | Topic | Implementation |
|---|---|---|
| 3.1.1 | Login Form + React State | React Hook Form, MUI, validation, loading spinner |
| 3.1.2 | Protected Routes + JWT | Express middleware, jsonwebtoken, Axios interceptors, React Router guards |
| 3.1.3 | Role-Based Access Control | MongoDB roles, admin panel, permission map, route guards |

---

## Tech Stack

**Backend**
- Node.js + Express 4
- MongoDB + Mongoose 7
- jsonwebtoken 9
- bcryptjs

**Frontend**
- React 18
- React Router 6
- React Hook Form 7
- Material UI 5
- Axios 1.6

---

## Project Structure

```
auth-rbac-project/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT verify + RBAC authorize middleware
│   ├── models/
│   │   └── User.js          # Mongoose User model with bcrypt
│   ├── routes/
│   │   ├── auth.js          # /api/auth — login, register, me
│   │   ├── users.js         # /api/users — admin CRUD
│   │   └── protected.js     # /api/protected — JWT demo routes
│   ├── utils/
│   │   └── seed.js          # Auto-seeds default users
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js   # ProtectedRoute + RoleRoute
    │   ├── context/
    │   │   └── AuthContext.js      # Global auth state + hooks
    │   ├── pages/
    │   │   ├── LoginPage.js        # Exp 3.1.1
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js    # Exp 3.1.2 + 3.1.3
    │   │   ├── AdminPage.js        # Exp 3.1.3 — RBAC admin
    │   │   └── ProfilePage.js
    │   ├── utils/
    │   │   └── api.js              # Axios with JWT interceptors
    │   ├── App.js                  # Routes
    │   └── index.js
    └── package.json
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### Step 1 — Backend

```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev
# Server starts at http://localhost:5000
# DB auto-seeds 4 test users
```

### Step 2 — Frontend

```bash
cd frontend
npm install
npm start
# App opens at http://localhost:3000
```

---

## Test Accounts (auto-seeded)

| Username | Password | Role |
|---|---|---|
| admin | admin123 | admin |
| moderator | mod123 | moderator |
| alice | alice123 | user |
| bob | bob123 | user |

---

## API Endpoints

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | JWT Required |
| PUT | /api/auth/change-password | JWT Required |
| GET | /api/protected | JWT Required |
| GET | /api/protected/admin-dashboard | Admin Only |
| GET | /api/protected/moderator-zone | Admin + Moderator |
| GET | /api/protected/profile | JWT Required |
| GET | /api/users | Admin + Moderator |
| PUT | /api/users/:id/role | Admin Only |
| PUT | /api/users/:id/toggle-status | Admin Only |
| DELETE | /api/users/:id | Admin Only |

---

## Role Permissions

| Permission | Admin | Moderator | User |
|---|---|---|---|
| read:all | ✓ | ✓ | ✗ |
| write:all | ✓ | ✗ | ✗ |
| delete:all | ✓ | ✗ | ✗ |
| manage:users | ✓ | ✗ | ✗ |
| view:dashboard | ✓ | ✓ | ✗ |
| view:profile | ✓ | ✓ | ✓ |
| read:own | ✓ | ✓ | ✓ |
| write:own | ✓ | ✓ | ✗ |
