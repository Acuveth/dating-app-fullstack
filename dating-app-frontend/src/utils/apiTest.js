// Simple API test utility
const API_URL = 'http://172.20.10.2:5001/api';

export const testRegistration = async () => {
  try {
    const testData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      displayName: 'Test User',
      age: 25,
      gender: 'male'
    };

    console.log('Testing registration with:', { ...testData, password: '[HIDDEN]' });

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration test error:', error);
    throw error;
  }
};

export const testHealth = async () => {
  try {
    console.log('Testing health endpoint...');

    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    const data = await response.json();

    console.log('Health check:', data);
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};