import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c6af7' },
    background: { default: '#0f0f13', paper: '#1a1a24' },
    text: { primary: '#e8e6f0', secondary: '#8b8aa0' }
  },
  typography: {
    fontFamily: "'Sora', 'Segoe UI', sans-serif"
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiSelect: {
      styleOverrides: {
        paper: { backgroundColor: '#1a1a24' }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundColor: '#1a1a24', border: '1px solid #2e2e42' }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: '#2a2a3a' } }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes — Exp 3.1.2 (JWT required) */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Role Route — Exp 3.1.3 (Admin only) */}
            <Route path="/admin" element={
              <RoleRoute roles={['admin', 'moderator']}><AdminPage /></RoleRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
