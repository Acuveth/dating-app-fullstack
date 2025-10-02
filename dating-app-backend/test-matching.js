const mongoose = require('mongoose');
const axios = require('axios');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => {
    console.log('Connected to MongoDB');
    testMatching();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testMatching() {
  try {
    const baseURL = 'http://localhost:5001/api';

    // Login as test user Alex
    console.log('🔐 Logging in as Alex...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test1@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Make a match request
    console.log('\n🎯 Making match request...');
    const matchResponse = await axios.post(`${baseURL}/match/find`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🎉 Match result:', matchResponse.data);

    if (matchResponse.data.match) {
      console.log(`\n✨ Found match: ${matchResponse.data.match.displayName}`);
      console.log(`Age: ${matchResponse.data.match.age}`);
      console.log(`Bio: ${matchResponse.data.match.bio}`);
      console.log(`Match ID: ${matchResponse.data.match.matchId}`);
    } else {
      console.log('\n❌ No match found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}