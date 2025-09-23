import axios from 'axios';

const API_URL = 'http://172.20.10.2:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const questionsService = {
  getAllQuestions: async () => {
    try {
      const response = await api.get('/questions/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch questions');
    }
  },

  getIceBreakers: async () => {
    try {
      const response = await api.get('/questions/icebreakers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch ice breakers');
    }
  },

  getWouldYouRather: async () => {
    try {
      const response = await api.get('/questions/wouldyourather');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch would you rather questions');
    }
  },

  getTwoTruths: async () => {
    try {
      const response = await api.get('/questions/twotruths');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch two truths examples');
    }
  }
};