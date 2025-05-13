import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject({ ...error, message: 'Session expired. Please login again.' });
    }
    
    if (status === 403) {
      return Promise.reject({ ...error, message: 'You do not have permission to access this resource.' });
    }
    
    if (status === 404) {
      return Promise.reject({ ...error, message: 'Resource not found' });
    }
    
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({ ...error, message: 'Network error. Please check your connection.' });
    }
    
    return Promise.reject(error);
  }
);

export default api;
