const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => {
    console.log('Connected to MongoDB');
    createTestUsers();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createTestUsers() {
  try {
    // Delete existing test users
    await User.deleteMany({ email: { $regex: /test\d+@example\.com/ } });

    const testUsers = [
      {
        email: 'test1@example.com',
        password: 'password123',
        displayName: 'Alex',
        age: 25,
        gender: 'male',
        bio: 'Love hiking and photography',
        location: {
          city: 'Ljubljana, Ljubljana',
          coordinates: {
            lat: 46.0569,
            lng: 14.5058
          }
        },
        preferences: {
          ageMin: 20,
          ageMax: 30,
          gender: 'female',
          maxDistance: 50
        },
        isOnline: true,
        photos: []
      },
      {
        email: 'test2@example.com',
        password: 'password123',
        displayName: 'Emma',
        age: 23,
        gender: 'female',
        bio: 'Artist and coffee enthusiast',
        location: {
          city: 'Ljubljana, Ljubljana',
          coordinates: {
            lat: 46.0569,
            lng: 14.5058
          }
        },
        preferences: {
          ageMin: 22,
          ageMax: 28,
          gender: 'male',
          maxDistance: 50
        },
        isOnline: true,
        photos: []
      },
      {
        email: 'test3@example.com',
        password: 'password123',
        displayName: 'Jamie',
        age: 27,
        gender: 'female',
        bio: 'Tech lover and musician',
        location: {
          city: 'Ljubljana, Ljubljana',
          coordinates: {
            lat: 46.0570,
            lng: 14.5059
          }
        },
        preferences: {
          ageMin: 20,
          ageMax: 35,
          gender: 'male',
          maxDistance: 50
        },
        isOnline: true,
        photos: []
      },
      {
        email: 'test4@example.com',
        password: 'password123',
        displayName: 'Marcus',
        age: 28,
        gender: 'male',
        bio: 'Fitness enthusiast and cook',
        location: {
          city: 'Ljubljana, Ljubljana',
          coordinates: {
            lat: 46.0571,
            lng: 14.5057
          }
        },
        preferences: {
          ageMin: 23,
          ageMax: 32,
          gender: 'female',
          maxDistance: 50
        },
        isOnline: true,
        photos: []
      },
      {
        email: 'test5@example.com',
        password: 'password123',
        displayName: 'Sofia',
        age: 24,
        gender: 'female',
        bio: 'Travel blogger and nature lover',
        location: {
          city: 'Ljubljana, Ljubljana',
          coordinates: {
            lat: 46.0568,
            lng: 14.5060
          }
        },
        preferences: {
          ageMin: 22,
          ageMax: 30,
          gender: 'male',
          maxDistance: 50
        },
        isOnline: true,
        photos: []
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created test user: ${user.displayName} (${user.email})`);
    }

    console.log('\nTest users created successfully!');
    console.log('You can now test matching functionality.');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}