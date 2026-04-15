import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Chip, Box,
  IconButton, Menu, MenuItem, Avatar, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShieldIcon from '@mui/icons-material/Shield';

const ROLE_COLORS = {
  admin: 'error',
  moderator: 'warning',
  user: 'success'
};

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#0f0f13', borderBottom: '1px solid #2e2e42' }}>
      <Toolbar>
        <ShieldIcon sx={{ color: '#a78bfa', mr: 1 }} />
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ flexGrow: 1, fontFamily: "'JetBrains Mono', monospace", color: '#a78bfa', cursor: 'pointer' }}
          onClick={() => navigate(user ? '/dashboard' : '/')}
        >
          Auth<span style={{ color: '#34d399' }}>Lab</span>
        </Typography>

        {user ? (
          <Box display="flex" alignItems="center" gap={1}>
            {/* Nav Links */}
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ color: '#e8e6f0', textTransform: 'none' }}
            >
              Dashboard
            </Button>

            {hasRole('admin', 'moderator') && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettingsIcon />}
                onClick={() => navigate('/admin')}
                sx={{ color: '#e8e6f0', textTransform: 'none' }}
              >
                Admin
              </Button>
            )}

            <Chip
              label={user.role.toUpperCase()}
              color={ROLE_COLORS[user.role] || 'default'}
              size="small"
              sx={{ fontWeight: 700, fontSize: 11 }}
            />

            {/* User menu */}
            <IconButton onClick={handleMenu} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#7c6af7', fontSize: 14 }}>
                {user.username[0].toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
              PaperProps={{ sx: { bgcolor: '#1a1a24', border: '1px solid #2e2e42', minWidth: 180 } }}>
              <Box px={2} py={1}>
                <Typography variant="body2" fontWeight={700} color="#e8e6f0">{user.username}</Typography>
                <Typography variant="caption" color="#8b8aa0">{user.email}</Typography>
              </Box>
              <Divider sx={{ borderColor: '#2e2e42' }} />
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}
                sx={{ color: '#e8e6f0', '&:hover': { bgcolor: '#2a2a3a' } }}>
                <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} /> My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: '#f87171', '&:hover': { bgcolor: '#2a1a1a' } }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <Button variant="outlined" onClick={() => navigate('/login')}
              sx={{ borderColor: '#7c6af7', color: '#a78bfa', textTransform: 'none' }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')}
              sx={{ bgcolor: '#7c6af7', textTransform: 'none', '&:hover': { bgcolor: '#6b58e8' } }}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
