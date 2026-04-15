import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  Alert, List, ListItem, ListItemText, ListItemIcon, Divider, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, PERMISSIONS } from '../context/AuthContext';
import API from '../utils/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const ROLE_COLORS = { admin: '#f87171', moderator: '#fbbf24', user: '#34d399' };

const StatCard = ({ label, value, color = '#a78bfa' }) => (
  <Card elevation={0} sx={{ bgcolor: '#22222f', border: '1px solid #2e2e42', borderRadius: 2 }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="caption" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ color, mt: 0.5 }}>{value}</Typography>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user, token, hasRole } = useAuth();
  const navigate = useNavigate();
  const [routeTests, setRouteTests] = useState([]);
  const [testing, setTesting] = useState(false);

  const userPermissions = PERMISSIONS[user?.role] || [];

  const allRoutes = [
    { label: 'POST /api/auth/login', access: 'Public', allowed: true },
    { label: 'GET /api/protected', access: 'JWT Required', allowed: !!user },
    { label: 'GET /api/protected/profile', access: 'JWT Required', allowed: !!user },
    { label: 'GET /api/protected/admin-dashboard', access: 'Admin Only', allowed: hasRole('admin') },
    { label: 'GET /api/protected/moderator-zone', access: 'Admin + Moderator', allowed: hasRole('admin', 'moderator') },
    { label: 'GET /api/users', access: 'Admin + Moderator', allowed: hasRole('admin', 'moderator') },
    { label: 'PUT /api/users/:id/role', access: 'Admin Only', allowed: hasRole('admin') },
    { label: 'DELETE /api/users/:id', access: 'Admin Only', allowed: hasRole('admin') }
  ];

  const runRouteTests = async () => {
    setTesting(true);
    const results = [];

    // Test 1: Protected route (should pass for all logged in)
    try {
      const r = await API.get('/protected');
      results.push({ route: 'GET /api/protected', status: 200, result: r.data.message, ok: true });
    } catch (e) {
      results.push({ route: 'GET /api/protected', status: e.response?.status, result: e.response?.data?.error, ok: false });
    }

    // Test 2: Admin dashboard
    try {
      const r = await API.get('/protected/admin-dashboard');
      results.push({ route: 'GET /api/protected/admin-dashboard', status: 200, result: r.data.message, ok: true });
    } catch (e) {
      results.push({ route: 'GET /api/protected/admin-dashboard', status: e.response?.status, result: e.response?.data?.error, ok: false });
    }

    // Test 3: Moderator zone
    try {
      const r = await API.get('/protected/moderator-zone');
      results.push({ route: 'GET /api/protected/moderator-zone', status: 200, result: r.data.message, ok: true });
    } catch (e) {
      results.push({ route: 'GET /api/protected/moderator-zone', status: e.response?.status, result: e.response?.data?.error, ok: false });
    }

    // Test 4: No token
    try {
      const r = await API.get('/protected', { headers: { Authorization: '' } });
      results.push({ route: 'GET /api/protected (no token)', status: 200, result: 'Unexpected pass', ok: false });
    } catch (e) {
      results.push({ route: 'GET /api/protected (no token)', status: e.response?.status, result: e.response?.data?.error, ok: e.response?.status === 401 });
    }

    setRouteTests(results);
    setTesting(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f13', p: 3 }}>
      <Box maxWidth={900} mx="auto">
        {/* Header */}
        <Box mb={3}>
          <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#7c6af7', letterSpacing: 2 }}>
            EXP 3.1.1 + 3.1.2 + 3.1.3 — COMBINED
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#e8e6f0" mt={0.5}>
            {hasRole('admin') ? 'Admin Dashboard' : hasRole('moderator') ? 'Moderator Dashboard' : 'User Dashboard'}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Typography variant="body2" color="#8b8aa0">Logged in as</Typography>
            <Chip label={user?.username} size="small" sx={{ bgcolor: '#22222f', color: '#e8e6f0', fontWeight: 700 }} />
            <Chip label={user?.role} size="small" sx={{ bgcolor: '#22222f', color: ROLE_COLORS[user?.role], fontWeight: 700 }} />
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Role" value={user?.role} color={ROLE_COLORS[user?.role]} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Permissions" value={userPermissions.length} color="#a78bfa" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="JWT Status" value="Active" color="#34d399" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Auth" value="Verified" color="#34d399" />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {/* Permissions */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Your Permissions
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {['read:all', 'write:all', 'delete:all', 'manage:users', 'view:dashboard', 'view:profile', 'read:own', 'write:own'].map(p => {
                    const granted = userPermissions.includes(p);
                    return (
                      <Chip key={p} label={p} size="small"
                        icon={granted ? <CheckCircleIcon style={{ fontSize: 14, color: '#34d399' }} /> : <CancelIcon style={{ fontSize: 14, color: '#f87171' }} />}
                        sx={{
                          bgcolor: granted ? '#1a3a2a' : '#22222f',
                          color: granted ? '#34d399' : '#555',
                          border: `1px solid ${granted ? '#2a5a3a' : '#2e2e42'}`,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11
                        }} />
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Route Access Map */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  Route Access Map (Exp 3.1.2 + 3.1.3)
                </Typography>
                {allRoutes.map((r, i) => (
                  <Box key={i} display="flex" alignItems="center" justifyContent="space-between" py={0.7}
                    borderBottom={i < allRoutes.length - 1 ? '1px solid #2e2e42' : 'none'}>
                    <Box>
                      <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#a78bfa', display: 'block' }}>
                        {r.label}
                      </Typography>
                      <Typography variant="caption" color="#555">{r.access}</Typography>
                    </Box>
                    <Chip label={r.allowed ? '✓ allowed' : '✗ blocked'} size="small"
                      sx={{ bgcolor: r.allowed ? '#1a3a2a' : '#3a1c1c', color: r.allowed ? '#34d399' : '#f87171', fontSize: 10 }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Live Route Tests */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle2" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Live JWT Route Tests (Exp 3.1.2)
                  </Typography>
                  <Button variant="outlined" size="small" onClick={runRouteTests} disabled={testing}
                    startIcon={testing ? <CircularProgress size={14} /> : <VpnKeyIcon />}
                    sx={{ borderColor: '#7c6af7', color: '#a78bfa', textTransform: 'none' }}>
                    {testing ? 'Testing…' : 'Run Tests'}
                  </Button>
                </Box>
                {routeTests.length === 0 && (
                  <Typography variant="body2" color="#555">Click "Run Tests" to test JWT-protected API routes live.</Typography>
                )}
                {routeTests.map((t, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={2} py={0.8}
                    borderBottom={i < routeTests.length - 1 ? '1px solid #2e2e42' : 'none'}>
                    <Chip label={t.status} size="small"
                      sx={{ bgcolor: t.ok ? '#1a3a2a' : '#3a1c1c', color: t.ok ? '#34d399' : '#f87171', fontFamily: "'JetBrains Mono', monospace", minWidth: 48 }} />
                    <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#a78bfa', flex: 1 }}>
                      {t.route}
                    </Typography>
                    <Typography variant="caption" sx={{ color: t.ok ? '#34d399' : '#f87171' }}>{t.result}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick nav cards */}
          {hasRole('admin') && (
            <Grid item xs={12} sm={6}>
              <Card elevation={0} onClick={() => navigate('/admin')} sx={{ bgcolor: '#1e1a3a', border: '1px solid #3a3a7a', borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: '#7c6af7' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AdminPanelSettingsIcon sx={{ color: '#a78bfa', fontSize: 40 }} />
                  <Box>
                    <Typography fontWeight={700} color="#e8e6f0">Admin Panel</Typography>
                    <Typography variant="caption" color="#8b8aa0">Manage users, roles, permissions</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Card elevation={0} onClick={() => navigate('/profile')} sx={{ bgcolor: '#1a2a1a', border: '1px solid #2a5a3a', borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: '#34d399' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon sx={{ color: '#34d399', fontSize: 40 }} />
                <Box>
                  <Typography fontWeight={700} color="#e8e6f0">My Profile</Typography>
                  <Typography variant="caption" color="#8b8aa0">View your account & JWT info</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
