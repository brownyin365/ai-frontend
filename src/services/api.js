import axios from 'axios';
import toast from 'react-hot-toast';

// Get API URL from environment with fallback
const API_URL = process.env.REACT_APP_API_URL || 'https://ai-backend-red.vercel.app/api';

console.log('🌐 API URL:', API_URL);
console.log('📱 User Agent:', navigator.userAgent);

// Create axios instance with better timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // Set to false for CORS
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    console.log('📦 Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    // Network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else {
        toast.error('Network Error. Please check your internet connection.');
      }
      return Promise.reject(error);
    }
    
    // HTTP errors
    const { status, data } = error.response;
    
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('businessId');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(data?.error || 'Access denied');
    } else if (status === 404) {
      toast.error('API endpoint not found');
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(data?.error || 'An error occurred');
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================
export const login = async (email, password) => {
  try {
    console.log('🔐 Attempting login...');
    console.log('📧 Email:', email);
    
    const response = await api.post('/businesses/login', { email, password });
    console.log('✅ Login response:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Login API error:', error);
    throw error;
  }
};

export const register = async (businessData) => {
  try {
    const response = await api.post('/businesses/register', businessData);
    return response;
  } catch (error) {
    console.error('❌ Register API error:', error);
    throw error;
  }
};

export const getProfile = () => api.get('/businesses/profile');

// ==================== OTHER ENDPOINTS ====================
export const getDocuments = () => api.get('/documents');
export const getConversations = (businessId) => api.get(`/conversations/${businessId}`);
export const getLeads = (businessId) => api.get(`/leads/${businessId}`);

export default api;
