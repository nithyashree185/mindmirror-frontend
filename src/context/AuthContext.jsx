import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userCreatedAt = localStorage.getItem('userCreatedAt');
    if (userId && accessToken) {
      setUser({ id: userId, name: userName, email: userEmail, createdAt: userCreatedAt });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('userEmail', data.email || email);
      localStorage.setItem('userCreatedAt', data.createdAt || new Date().toISOString());
      setUser({ id: data.userId, name: data.name, email: data.email || email, createdAt: data.createdAt });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerService({ name, email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name || name);
      localStorage.setItem('userEmail', data.email || email);
      localStorage.setItem('userCreatedAt', data.createdAt || new Date().toISOString());
      setUser({ id: data.userId, name: data.name || name, email: data.email || email, createdAt: data.createdAt });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutService(refreshToken);
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userCreatedAt');
      localStorage.removeItem('currentChatId');
      setUser(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
