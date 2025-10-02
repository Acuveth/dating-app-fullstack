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

  uploadPhotos: async (photos, replaceAll = true) => {
    try {
      const api = await createApiInstance();
      const base64Photos = [];

      // Convert URIs to base64
      for (const photo of photos) {
        // Check if photo has base64 data directly from image picker
        if (photo.base64) {
          base64Photos.push(`data:image/jpeg;base64,${photo.base64}`);
        } else if (photo.uri) {
          // If it's already a base64 data URL, use it directly
          if (photo.uri.startsWith('data:')) {
            base64Photos.push(photo.uri);
          } else {
            // For file URIs without base64, we can't easily convert in React Native
            // without additional libraries, so we'll skip or handle differently
            console.warn('Photo URI without base64 data:', photo.uri);
            // You might want to show an error or handle this case differently
            continue;
          }
        }
      }

      if (base64Photos.length === 0) {
        throw new Error('No valid photos to upload');
      }

      console.log(`${replaceAll ? 'Replacing' : 'Adding'} photos (base64):`, base64Photos.length);

      // Use different endpoints based on whether we're replacing all photos or adding
      const endpoint = replaceAll ? '/users/photos/base64' : '/users/photos/add';
      const payload = replaceAll
        ? { photos: base64Photos, replaceAll: true }
        : { photos: base64Photos };

      const response = await api.post(endpoint, payload, {
        timeout: 60000, // 60 second timeout for photo uploads
      });

      console.log('Photo upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload photos');
    }
  },

  addPhotos: async (photos) => {
    return userService.uploadPhotos(photos, false);
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