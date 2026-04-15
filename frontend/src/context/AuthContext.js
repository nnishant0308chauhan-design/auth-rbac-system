import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const PERMISSIONS = {
  admin: ['read:all', 'write:all', 'delete:all', 'manage:users', 'view:dashboard', 'view:profile'],
  moderator: ['read:all', 'write:own', 'view:dashboard', 'view:profile'],
  user: ['read:own', 'view:profile']
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user from token on app start
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.user);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await API.post('/auth/login', { username, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await API.post('/auth/register', { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      return (PERMISSIONS[user.role] || []).includes(permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, hasPermission, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
