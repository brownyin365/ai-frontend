import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('businessId');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.error || error.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);


// ============= WHATSAPP ENDPOINTS =============
export const restartWhatsApp = (data) => 
  api.post('/businesses/restart-whatsapp', data);

export const getWhatsAppStatus = () => 
  api.get('/businesses/whatsapp-status');



// ============= EMAIL ENDPOINTS =============
export const restartEmail = (data) => 
  api.post('/businesses/restart-email', data);

export const getEmailStatus = () => 
  api.get('/businesses/email-status');

export const sendTestEmail = (to) => 
  api.post('/businesses/send-test-email', { to });



// ============= AUTH ENDPOINTS =============
export const login = (email, password) => 
  api.post('/businesses/login', { email, password });

export const register = (businessData) => 
  api.post('/businesses/register', businessData);

export const getProfile = () => 
  api.get('/businesses/profile');

// ============= DOCUMENT ENDPOINTS =============
export const getDocuments = () => 
  api.get('/documents');

export const uploadDocument = (formData) => 
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteDocument = (id) => 
  api.delete(`/documents/${id}`);

// ============= CONVERSATION ENDPOINTS =============
export const getConversations = (businessId) => 
  api.get(`/conversations/${businessId}`);

export const getConversation = (id) => 
  api.get(`/conversations/${id}`);

export const sendMessage = (conversationId, message) => 
  api.post(`/conversations/${conversationId}/message`, { message });

export const escalateConversation = (id, data) => 
  api.put(`/conversations/${id}/escalate`, data);

export const resolveConversation = (id) => 
  api.put(`/conversations/${id}/resolve`);

// ============= LEAD ENDPOINTS =============
export const getLeads = (businessId) => 
  api.get(`/leads/${businessId}`);

export const getLead = (id) => 
  api.get(`/leads/${id}`);

export const updateLead = (id, data) => 
  api.put(`/leads/${id}`, data);

export const addLeadNote = (id, note) => 
  api.post(`/leads/${id}/note`, note);

export const convertLead = (id) => 
  api.put(`/leads/${id}/convert`);

// ============= DASHBOARD ENDPOINTS =============
export const getDashboardStats = () => 
  api.get('/dashboard/stats');

// ============= SETTINGS ENDPOINTS =============
export const updateSettings = (settings) => 
  api.put('/businesses/settings', settings);

// ============= TELEGRAM ENDPOINTS =============
export const restartTelegram = (data) => 
  api.post('/businesses/restart-telegram', data);

export const getTelegramStatus = () => 
  api.get('/businesses/telegram-status');

// Export the api instance for direct use
export default api;