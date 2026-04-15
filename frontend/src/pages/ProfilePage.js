import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Divider,
  Button, TextField, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth, PERMISSIONS } from '../context/AuthContext';
import API from '../utils/api';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ROLE_COLORS = { admin: '#f87171', moderator: '#fbbf24', user: '#34d399' };

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#e8e6f0', bgcolor: '#22222f',
    '& fieldset': { borderColor: '#2e2e42' },
    '&:hover fieldset': { borderColor: '#7c6af7' },
    '&.Mui-focused fieldset': { borderColor: '#7c6af7' }
  },
  '& .MuiInputLabel-root': { color: '#8b8aa0' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
  '& .MuiFormHelperText-root': { color: '#f87171' }
};

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const newPassword = watch('newPassword');
  const userPermissions = PERMISSIONS[user?.role] || [];

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 3000);
  };

  const onChangePassword = async (data) => {
    setLoading(true);
    try {
      const res = await API.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      showAlert('success', res.data.message);
      reset();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  // Decode JWT for display
  const decodeToken = () => {
    if (!token) return null;
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch { return null; }
  };

  const tokenPayload = decodeToken();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f13', p: 3 }}>
      <Box maxWidth={800} mx="auto">
        <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#7c6af7', letterSpacing: 2 }}>
          EXP 3.1.2 + 3.1.3 — PROFILE & JWT
        </Typography>
        <Typography variant="h4" fontWeight={700} color="#e8e6f0" mb={3}>My Profile</Typography>

        <Grid container spacing={2}>
          {/* User Info */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#2a2a3a', border: '2px solid #7c6af7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#a78bfa' }}>
                    {user?.username?.[0]?.toUpperCase()}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#e8e6f0">{user?.username}</Typography>
                    <Typography variant="body2" color="#8b8aa0">{user?.email}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: '#2e2e42', mb: 2 }} />
                {[
                  ['Role', <Chip label={user?.role} size="small" sx={{ bgcolor: '#22222f', color: ROLE_COLORS[user?.role], fontWeight: 700 }} />],
                  ['User ID', <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#8b8aa0' }}>{user?.id || user?._id}</Typography>],
                  ['Member since', <Typography variant="caption" color="#8b8aa0">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Typography>],
                  ['Last login', <Typography variant="caption" color="#8b8aa0">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Now'}</Typography>]
                ].map(([k, v]) => (
                  <Box key={k} display="flex" alignItems="center" justifyContent="space-between" py={0.8} borderBottom="1px solid #2e2e42">
                    <Typography variant="body2" color="#8b8aa0">{k}</Typography>
                    {v}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Permissions */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Permissions</Typography>
                <Box display="flex" flexWrap="wrap" gap={0.7}>
                  {['read:all', 'write:all', 'delete:all', 'manage:users', 'view:dashboard', 'view:profile', 'read:own', 'write:own'].map(p => {
                    const granted = userPermissions.includes(p);
                    return (
                      <Chip key={p} label={p} size="small"
                        icon={granted ? <CheckCircleIcon style={{ fontSize: 13, color: '#34d399' }} /> : <CancelIcon style={{ fontSize: 13, color: '#555' }} />}
                        sx={{ bgcolor: granted ? '#1a3a2a' : '#22222f', color: granted ? '#34d399' : '#555', border: `1px solid ${granted ? '#2a5a3a' : '#2e2e42'}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* JWT Token Info */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>JWT Token (Exp 3.1.2)</Typography>
                <Box sx={{ bgcolor: '#0f0f13', border: '1px solid #2e2e42', borderRadius: 1.5, p: 1.5, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, wordBreak: 'break-all', lineHeight: 2 }}>
                  {token?.split('.').map((part, i) => (
                    <span key={i}>
                      <span style={{ color: ['#f87171', '#fbbf24', '#34d399'][i] }}>{part}</span>
                      {i < 2 && <span style={{ color: '#555' }}>.</span>}
                    </span>
                  ))}
                </Box>
                {tokenPayload && (
                  <Box mt={2}>
                    <Typography variant="caption" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Decoded Payload</Typography>
                    <Box sx={{ bgcolor: '#0f0f13', border: '1px solid #2e2e42', borderRadius: 1.5, p: 1.5, mt: 0.5, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#fbbf24' }}>
                      {JSON.stringify({ id: tokenPayload.id, iat: 'issued now', exp: '1 hour' }, null, 2)}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Change Password */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="#8b8aa0" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Change Password</Typography>
                {alert.msg && <Alert severity={alert.type} sx={{ mb: 2, bgcolor: alert.type === 'error' ? '#3a1c1c' : '#1a3a2a', color: alert.type === 'error' ? '#f87171' : '#34d399' }}>{alert.msg}</Alert>}
                <form onSubmit={handleSubmit(onChangePassword)} noValidate>
                  {[
                    { name: 'currentPassword', label: 'Current Password', rules: { required: 'Required' } },
                    { name: 'newPassword', label: 'New Password', rules: { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } } },
                    { name: 'confirmPassword', label: 'Confirm New Password', rules: { required: 'Required', validate: v => v === newPassword || 'Passwords do not match' } }
                  ].map(f => (
                    <Controller key={f.name} name={f.name} control={control} rules={f.rules}
                      render={({ field }) => (
                        <TextField {...field} label={f.label} type="password" fullWidth margin="dense"
                          error={!!errors[f.name]} helperText={errors[f.name]?.message} sx={inputSx}
                          InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#8b8aa0', fontSize: 18 }} /></InputAdornment> }} />
                      )} />
                  ))}
                  <Button type="submit" variant="contained" fullWidth disabled={loading}
                    sx={{ mt: 2, bgcolor: '#7c6af7', '&:hover': { bgcolor: '#6b58e8' }, textTransform: 'none', fontWeight: 600 }}>
                    {loading ? <CircularProgress size={18} color="inherit" /> : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilePage;
