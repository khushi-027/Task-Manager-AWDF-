import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('task_manager_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login page, remove stale token
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.hash.includes('#/login');
      if (!isAuthRoute) {
        localStorage.removeItem('task_manager_token');
        localStorage.removeItem('task_manager_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
