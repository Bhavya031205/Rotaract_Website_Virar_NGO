import axios from 'axios';

// Create the axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure port matches your backend
  withCredentials: true, // Important for cookies/sessions
});

// 1. REQUEST INTERCEPTOR (Attaches Token)
api.interceptors.request.use(
  (config) => {
    // Check both common storage keys
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR (Handles Expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Optional: Auto-logout if token is invalid
      // localStorage.removeItem('token');
      // window.location.href = '/login';
      console.error("Session expired or unauthorized access.");
    }
    return Promise.reject(error);
  }
);

export default api;