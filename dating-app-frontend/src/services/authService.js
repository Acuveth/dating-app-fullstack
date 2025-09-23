import axios from 'axios';

const API_URL = 'http://172.20.10.2:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]' });
      console.log('API URL:', `${API_URL}/auth/register`);

      const response = await api.post('/auth/register', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Make sure the backend is running on port 5001.');
      }

      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  },

  googleLogin: async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Google login failed');
    }
  },

  getProfile: async (token) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      throw new Error('Failed to get profile');
    }
  },

  logout: async (token) => {
    try {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};