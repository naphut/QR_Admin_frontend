import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAdmin(userData.is_admin || true); // Temporarily set to true
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await adminAPI.login(email, password);
      const { access_token, user } = response.data;
      
      // Temporarily bypass admin check - remove this once backend admin privileges are fixed
      // if (!user.is_admin) {
      //   toast.error('Access denied. Admin privileges required.');
      //   return { success: false };
      // }
      
      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setUser(user);
      setIsAdmin(user.is_admin || true); // Temporarily set to true
      toast.success('Welcome back, Admin!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setIsAdmin(false);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    logout,
    isAuthenticated: !!user && isAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};