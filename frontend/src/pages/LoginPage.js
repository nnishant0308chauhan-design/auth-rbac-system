import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Divider, Chip, InputAdornment, IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';

const sx = {
  page: {
    minHeight: '100vh',
    bgcolor: '#0f0f13',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2
  },
  card: {
    bgcolor: '#1a1a24',
    border: '1px solid #2e2e42',
    borderRadius: 3,
    width: '100%',
    maxWidth: 440
  },
  input: {
    '& .MuiOutlinedInput-root': {
      color: '#e8e6f0',
      bgcolor: '#22222f',
      '& fieldset': { borderColor: '#2e2e42' },
      '&:hover fieldset': { borderColor: '#7c6af7' },
      '&.Mui-focused fieldset': { borderColor: '#7c6af7' }
    },
    '& .MuiInputLabel-root': { color: '#8b8aa0' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
    '& .MuiFormHelperText-root': { color: '#f87171' }
  }
};

const TEST_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'moderator', password: 'mod123', role: 'moderator' },
  { username: 'alice', password: 'alice123', role: 'user' }
];

const ROLE_COLORS = { admin: '#f87171', moderator: '#fbbf24', user: '#34d399' };

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await login(data.username, data.password);
      setSuccessMsg(res.message || 'Login successful! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (acc) => {
    setValue('username', acc.username);
    setValue('password', acc.password);
  };

  return (
    <Box sx={sx.page}>
      <Box sx={sx.card} component={Card} elevation={0}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ShieldIcon sx={{ color: '#a78bfa' }} />
            <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#7c6af7', letterSpacing: 2 }}>
              EXP 3.1.1 + 3.1.2 + 3.1.3
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="#e8e6f0" mb={0.5}>Sign in</Typography>
          <Typography variant="body2" color="#8b8aa0" mb={3}>
            JWT Authentication + RBAC Protected Routes
          </Typography>

          {/* Alerts */}
          {serverError && <Alert severity="error" sx={{ mb: 2, bgcolor: '#3a1c1c', color: '#f87171', border: '1px solid #6b3333' }}>{serverError}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2, bgcolor: '#1a3a2a', color: '#34d399', border: '1px solid #2a6a4a' }}>{successMsg}</Alert>}

          {/* Form — Exp 3.1.1 */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="username"
              control={control}
              rules={{
                required: 'Username is required',
                minLength: { value: 3, message: 'Minimum 3 characters' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  margin="normal"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={sx.input}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#8b8aa0', fontSize: 20 }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={sx.input}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#8b8aa0', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#8b8aa0' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, py: 1.5, bgcolor: '#7c6af7', '&:hover': { bgcolor: '#6b58e8' }, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: 15 }}
            >
              {loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> Verifying…</> : 'Sign In →'}
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="#8b8aa0">
              No account?{' '}
              <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
            </Typography>
          </Box>

          {/* Test Accounts Hint */}
          <Divider sx={{ my: 3, borderColor: '#2e2e42' }} />
          <Typography variant="caption" color="#8b8aa0" display="block" mb={1} sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
            Quick Login (Test Accounts)
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {TEST_ACCOUNTS.map((acc) => (
              <Chip
                key={acc.username}
                label={`${acc.username} · ${acc.role}`}
                onClick={() => fillAccount(acc)}
                size="small"
                sx={{
                  bgcolor: '#22222f',
                  color: ROLE_COLORS[acc.role],
                  border: `1px solid ${ROLE_COLORS[acc.role]}33`,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  '&:hover': { bgcolor: '#2a2a3a' }
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Box>
    </Box>
  );
};

export default LoginPage;
