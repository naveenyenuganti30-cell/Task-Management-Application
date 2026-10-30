import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('taskflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Clear session helper
  const clearSession = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
  }, []);

  // Fetch current user details on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Session validation error:', err);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to expired token broadcast from API interceptor
    const handleAuthExpired = () => {
      clearSession();
      toast.warning('Your session has expired. Please sign in again.');
    };

    window.addEventListener('taskflow_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('taskflow_auth_expired', handleAuthExpired);
  }, [clearSession, toast]);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        toast.success(`Welcome to TaskFlow, ${data.user.name}!`);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignored: cleanup client state regardless
    }
    clearSession();
    toast.info('You have been logged out.');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const data = await authApi.updateProfile(profileData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        toast.success('Profile updated successfully!');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    try {
      const data = await authApi.changePassword(passwords);
      if (data.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
