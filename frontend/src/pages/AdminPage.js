import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, IconButton,
  Chip, Button, Alert, CircularProgress, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const ROLE_COLORS = { admin: '#f87171', moderator: '#fbbf24', user: '#34d399' };

const AdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, username: '' });

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 3000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      showAlert('error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await API.put(`/users/${userId}/role`, { role: newRole });
      showAlert('success', res.data.message);
      setUsers(prev => prev.map(u => u.id === userId || u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Failed to update role.');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await API.put(`/users/${userId}/toggle-status`);
      showAlert('success', res.data.message);
      setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Failed to update status.');
    }
  };

  const confirmDelete = (userId, username) => setDeleteDialog({ open: true, userId, username });

  const handleDelete = async () => {
    try {
      await API.delete(`/users/${deleteDialog.userId}`);
      showAlert('success', `User ${deleteDialog.username} deleted.`);
      setUsers(prev => prev.filter(u => u.id !== deleteDialog.userId && u._id !== deleteDialog.userId));
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setDeleteDialog({ open: false, userId: null, username: '' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f13', p: 3 }}>
      <Box maxWidth={1000} mx="auto">
        <Box mb={3} display="flex" alignItems="center" gap={1.5}>
          <AdminPanelSettingsIcon sx={{ color: '#a78bfa', fontSize: 32 }} />
          <Box>
            <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#7c6af7', letterSpacing: 2 }}>
              EXP 3.1.3 — RBAC
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#e8e6f0">Admin Panel</Typography>
            <Typography variant="body2" color="#8b8aa0">Manage users, roles, and access control</Typography>
          </Box>
        </Box>

        {alert.msg && (
          <Alert severity={alert.type} sx={{ mb: 2, bgcolor: alert.type === 'error' ? '#3a1c1c' : '#1a3a2a', color: alert.type === 'error' ? '#f87171' : '#34d399' }}>
            {alert.msg}
          </Alert>
        )}

        {/* Stats row */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {['admin', 'moderator', 'user'].map(role => (
            <Card key={role} elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2, px: 2, py: 1.5, minWidth: 120 }}>
              <Typography variant="caption" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{role}s</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: ROLE_COLORS[role] }}>
                {users.filter(u => u.role === role).length}
              </Typography>
            </Card>
          ))}
        </Box>

        <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress sx={{ color: '#7c6af7' }} /></Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#22222f', color: '#8b8aa0', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #2e2e42' } }}>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => {
                      const uid = u._id || u.id;
                      const isCurrentUser = uid === (user?._id || user?.id);
                      return (
                        <TableRow key={uid} sx={{ '& td': { borderBottom: '1px solid #2e2e42', color: '#e8e6f0' }, '&:last-child td': { borderBottom: 'none' } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#a78bfa' }}>
                                {u.username[0].toUpperCase()}
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{u.username}</Typography>
                                {isCurrentUser && <Chip label="you" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#2a2a3a', color: '#a78bfa' }} />}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#8b8aa0', fontSize: 13 }}>{u.email}</TableCell>
                          <TableCell>
                            {isCurrentUser ? (
                              <Chip label={u.role} size="small" sx={{ bgcolor: '#22222f', color: ROLE_COLORS[u.role], fontWeight: 700 }} />
                            ) : (
                              <Select value={u.role} size="small" onChange={(e) => handleRoleChange(uid, e.target.value)}
                                sx={{ color: ROLE_COLORS[u.role], bgcolor: '#22222f', border: '1px solid #2e2e42', borderRadius: 1.5, fontSize: 13, fontWeight: 600,
                                  '& .MuiSelect-icon': { color: '#8b8aa0' },
                                  '& fieldset': { border: 'none' } }}>
                                <MenuItem value="admin" sx={{ color: '#f87171' }}>admin</MenuItem>
                                <MenuItem value="moderator" sx={{ color: '#fbbf24' }}>moderator</MenuItem>
                                <MenuItem value="user" sx={{ color: '#34d399' }}>user</MenuItem>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip label={u.isActive ? 'active' : 'inactive'} size="small"
                              sx={{ bgcolor: u.isActive ? '#1a3a2a' : '#3a1c1c', color: u.isActive ? '#34d399' : '#f87171', fontWeight: 600 }} />
                          </TableCell>
                          <TableCell sx={{ color: '#8b8aa0', fontSize: 12 }}>
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </TableCell>
                          <TableCell align="right">
                            {!isCurrentUser && (
                              <Box display="flex" justifyContent="flex-end" gap={0.5}>
                                <Tooltip title={u.isActive ? 'Deactivate' : 'Activate'}>
                                  <IconButton size="small" onClick={() => handleToggleStatus(uid)}
                                    sx={{ color: u.isActive ? '#fbbf24' : '#34d399' }}>
                                    {u.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete user">
                                  <IconButton size="small" onClick={() => confirmDelete(uid, u.username)} sx={{ color: '#f87171' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}
        PaperProps={{ sx: { bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 } }}>
        <DialogTitle sx={{ color: '#e8e6f0' }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography color="#8b8aa0">
            Are you sure you want to delete <strong style={{ color: '#f87171' }}>{deleteDialog.username}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false })} sx={{ color: '#8b8aa0', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#7c2020', '&:hover': { bgcolor: '#9a2a2a' }, textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
