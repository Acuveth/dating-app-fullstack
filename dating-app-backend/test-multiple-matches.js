const mongoose = require('mongoose');
const axios = require('axios');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => {
    console.log('Connected to MongoDB');
    testMultipleMatches();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testMultipleMatches() {
  try {
    const baseURL = 'http://localhost:5001/api';

    // Test with multiple users
    const users = [
      { email: 'test2@example.com', name: 'Emma' },
      { email: 'test4@example.com', name: 'Marcus' },
      { email: 'test3@example.com', name: 'Jamie' }
    ];

    for (const user of users) {
      console.log(`\n🔐 Logging in as ${user.name}...`);
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: user.email,
        password: 'password123'
      });

      const token = loginResponse.data.token;
      console.log(`✅ Login successful for ${user.name}`);

      // Make a match request
      console.log(`🎯 Making match request for ${user.name}...`);
      const matchResponse = await axios.post(`${baseURL}/match/find`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (matchResponse.data.match) {
        console.log(`✨ ${user.name} matched with: ${matchResponse.data.match.displayName}`);
        console.log(`  Age: ${matchResponse.data.match.age}`);
        console.log(`  Bio: ${matchResponse.data.match.bio}`);
      } else {
        console.log(`❌ No match found for ${user.name}`);
        console.log(`  Reason: ${matchResponse.data.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}