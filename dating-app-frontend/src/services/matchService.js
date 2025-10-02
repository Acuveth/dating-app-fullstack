import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.20.10.2:5001/api';

const createApiInstance = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export const matchService = {
  findMatch: async () => {
    try {
      console.log('🚀 Starting match request...');
      const api = await createApiInstance();
      console.log('📡 API instance created, sending POST to /match/find');

      const response = await api.post('/match/find');
      console.log('✅ Match response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Match request failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(error.response?.data?.error || 'Failed to find match');
    }
  },

  makeDecision: async (matchId, decision) => {
    try {
      const api = await createApiInstance();
      const response = await api.put(`/match/decision/${matchId}`, { decision });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to make decision');
    }
  },

  skipMatch: async (matchId) => {
    try {
      const api = await createApiInstance();
      const response = await api.post(`/match/skip/${matchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to skip match');
    }
  },

  getActiveMatch: async () => {
    try {
      const api = await createApiInstance();
      const response = await api.get('/match/active');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get active match');
    }
  }
};