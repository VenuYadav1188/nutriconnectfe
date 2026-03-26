import axios from 'axios';

const api = axios.create({
  // Strictly use production backend. No localhost fallbacks.
  baseURL: process.env.REACT_APP_API_URL || 'https://nutriconnectbe.onrender.com/api',
});

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

export default api;
