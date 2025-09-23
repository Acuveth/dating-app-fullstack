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

export const userService = {
  updateProfile: async (profileData) => {
    try {
      const api = await createApiInstance();
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },

  uploadPhotos: async (photos) => {
    try {
      const api = await createApiInstance();
      const formData = new FormData();

      photos.forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `photo_${index}.jpg`,
        });
      });

      const response = await api.post('/users/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload photos');
    }
  },

  deletePhoto: async (photoId) => {
    try {
      const api = await createApiInstance();
      const response = await api.delete(`/users/photos/${photoId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete photo');
    }
  },

  updateLocation: async (location) => {
    try {
      const api = await createApiInstance();
      const response = await api.put('/users/location', location);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update location');
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const api = await createApiInstance();
      const response = await api.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update preferences');
    }
  },

  blockUser: async (userId) => {
    try {
      const api = await createApiInstance();
      const response = await api.post(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to block user');
    }
  },

  reportUser: async (userId, reason) => {
    try {
      const api = await createApiInstance();
      const response = await api.post(`/users/report/${userId}`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to report user');
    }
  }
};