import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile, login as apiLogin } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getProfile();
        const userData = response.data.data;
        setUser(userData);
        setBusiness(userData);
        
        // Store business ID if available
        if (userData?.id) {
          localStorage.setItem('businessId', userData.id);
          console.log('✅ Business ID loaded from profile:', userData.id);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      console.log('📊 Login response:', response.data);
      
      const { token, business } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Store business ID
      if (business?.id) {
        localStorage.setItem('businessId', business.id);
        console.log('✅ Business ID stored in AppContext:', business.id);
      } else {
        // Fallback to demo ID
        const demoId = '59f7d90e-2d0c-42d5-9389-b4712c29a154';
        localStorage.setItem('businessId', demoId);
        console.log('✅ Using demo business ID:', demoId);
      }
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(business));
      
      setUser(business);
      setBusiness(business);
      
      toast.success('Login successful!');
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
      return { 
        success: false, 
        error: error.response?.data?.error 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('businessId');
    localStorage.removeItem('user');
    setUser(null);
    setBusiness(null);
    toast.success('Logged out successfully');
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markNotificationsRead = () => {
    setUnreadCount(0);
  };

  const value = {
    user,
    business,
    loading,
    login,
    logout,
    notifications,
    unreadCount,
    addNotification,
    markNotificationsRead,
    setBusiness,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};