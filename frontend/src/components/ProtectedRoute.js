import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

// Shows spinner while checking auth
const LoadingScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress />
  </Box>
);

// Access Denied page
export const AccessDenied = ({ message = 'You do not have permission to view this page.' }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="60vh"
    gap={2}
  >
    <LockIcon sx={{ fontSize: 64, color: 'error.main' }} />
    <Typography variant="h4" fontWeight={700} color="error">
      Access Denied
    </Typography>
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);

// Exp 3.1.2: Protected Route — requires valid JWT
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Exp 3.1.3: Role Route — requires specific role(s)
export const RoleRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <AccessDenied
        message={`This page requires: ${roles.join(' or ')} role. Your role: ${user.role}`}
      />
    );
  }

  return children;
};
