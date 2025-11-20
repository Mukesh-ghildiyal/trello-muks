import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.data && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup(name, email, password);
      if (response.success && response.data && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Signup failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed',
      };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

