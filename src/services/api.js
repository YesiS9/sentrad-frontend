// src/services/api.js
 
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sentrad-backend-production.up.railway.app/api',
  // baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('Using tokens:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hapus token yang expired
      localStorage.removeItem('token')
      // Redirect ke login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const getUnreadNotificationCount = () => api.get('/notifikasi/unread');
export const fetchNotifications = () => api.get('/notifikasi');
export const getUserCount = () => api.get('/user/count');
export const getIndividualRegistrationCount = () => api.get('/register-individu/count');
export const getGroupRegistrationCount = () => api.get('/register-kelompok/count');
export const fetchUser = () => api.get('/user');

export default api;
