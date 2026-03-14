import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');
    if (token && role && username) {
      const lat = (latitude && latitude !== 'null' && latitude !== 'undefined') ? parseFloat(latitude) : null;
      const lon = (longitude && longitude !== 'null' && longitude !== 'undefined') ? parseFloat(longitude) : null;
      setUser({ token, role, username, latitude: lat, longitude: lon });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role, karmaPoints, latitude, longitude } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('latitude', latitude);
      localStorage.setItem('longitude', longitude);
      setUser({ token, role, username: response.data.username, karmaPoints, latitude, longitude });
      return { success: true, role };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      // Feature 7: Secret admin login path
      const response = await api.post('/auth/xadmin9/login', { username, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', response.data.username);
      setUser({
        token: response.data.token,
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
        latitude: response.data.latitude,
        longitude: response.data.longitude
      });
      return { success: true, role };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Admin login failed' };
    }
  };

  const register = async (registerData) => {
    try {
      // registerData should now be an object with name, email, phone, etc.
      await api.post('/auth/register', registerData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
