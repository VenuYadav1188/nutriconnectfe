import axios from 'axios';

const api = axios.create({
  // Strictly
  baseURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (process.env.REACT_APP_API_URL || 'http://localhost:8080/api')
    : (process.env.REACT_APP_API_URL || 'https://nutriconnectbe.onrender.com/api'),
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
