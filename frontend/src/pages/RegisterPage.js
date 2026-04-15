import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const inputSx = {
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
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await register(data.username, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card elevation={0} sx={{ bgcolor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: 3, width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} color="#e8e6f0" mb={0.5}>Create Account</Typography>
          <Typography variant="body2" color="#8b8aa0" mb={3}>New users get the 'user' role by default.</Typography>

          {serverError && <Alert severity="error" sx={{ mb: 2, bgcolor: '#3a1c1c', color: '#f87171' }}>{serverError}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller name="username" control={control}
              rules={{ required: 'Username required', minLength: { value: 3, message: 'Min 3 chars' } }}
              render={({ field }) => (
                <TextField {...field} label="Username" fullWidth margin="normal" error={!!errors.username}
                  helperText={errors.username?.message} sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#8b8aa0', fontSize: 20 }} /></InputAdornment> }} />
              )} />

            <Controller name="email" control={control}
              rules={{ required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } }}
              render={({ field }) => (
                <TextField {...field} label="Email" fullWidth margin="normal" error={!!errors.email}
                  helperText={errors.email?.message} sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#8b8aa0', fontSize: 20 }} /></InputAdornment> }} />
              )} />

            <Controller name="password" control={control}
              rules={{ required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } }}
              render={({ field }) => (
                <TextField {...field} label="Password" type={showPw ? 'text' : 'password'} fullWidth margin="normal"
                  error={!!errors.password} helperText={errors.password?.message} sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#8b8aa0', fontSize: 20 }} /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(!showPw)} sx={{ color: '#8b8aa0' }}>{showPw ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                  }} />
              )} />

            <Controller name="confirmPassword" control={control}
              rules={{ required: 'Please confirm password', validate: (val) => val === password || 'Passwords do not match' }}
              render={({ field }) => (
                <TextField {...field} label="Confirm Password" type={showPw ? 'text' : 'password'} fullWidth margin="normal"
                  error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#8b8aa0', fontSize: 20 }} /></InputAdornment> }} />
              )} />

            <Button type="submit" variant="contained" fullWidth disabled={loading}
              sx={{ mt: 2, py: 1.5, bgcolor: '#7c6af7', '&:hover': { bgcolor: '#6b58e8' }, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: 15 }}>
              {loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> Registering…</> : 'Create Account →'}
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="#8b8aa0">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
