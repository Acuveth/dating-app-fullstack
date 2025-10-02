require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testUsers = [
  {
    displayName: 'Alex Chen',
    email: 'alex.chen@test.com',
    password: 'password123',
    age: 28,
    gender: 'male',
    bio: 'Software engineer who loves cooking and hiking. Always up for new adventures!',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0569, lng: 14.5058 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 35,
      gender: 'both',
      maxDistance: 50
    }
  },
  {
    displayName: 'Maya Rodriguez',
    email: 'maya.rodriguez@test.com',
    password: 'password123',
    age: 25,
    gender: 'female',
    bio: 'Art teacher and photographer. Love coffee, yoga, and meaningful conversations.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0511, lng: 14.5051 }
    },
    preferences: {
      ageMin: 23,
      ageMax: 32,
      gender: 'male',
      maxDistance: 30
    }
  },
  {
    displayName: 'Jordan Kim',
    email: 'jordan.kim@test.com',
    password: 'password123',
    age: 26,
    gender: 'other',
    bio: 'Marketing pro and part-time DJ. Love electronic music, street art, and good food.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0547, lng: 14.5089 }
    },
    preferences: {
      ageMin: 21,
      ageMax: 35,
      gender: 'both',
      maxDistance: 40
    }
  },
  {
    displayName: 'Emma Thompson',
    email: 'emma.thompson@test.com',
    password: 'password123',
    age: 24,
    gender: 'female',
    bio: 'Medical student who loves travel, reading, and rock climbing.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0581, lng: 14.5021 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 30,
      gender: 'both',
      maxDistance: 25
    }
  },
  {
    displayName: 'Marcus Johnson',
    email: 'marcus.johnson@test.com',
    password: 'password123',
    age: 30,
    gender: 'male',
    bio: 'Fitness trainer and nutrition coach. Former basketball player, love outdoor activities.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0523, lng: 14.5067 }
    },
    preferences: {
      ageMin: 25,
      ageMax: 35,
      gender: 'female',
      maxDistance: 35
    }
  },
  {
    displayName: 'Sofia Petrov',
    email: 'sofia.petrov@test.com',
    password: 'password123',
    age: 27,
    gender: 'female',
    bio: 'Graphic designer and illustrator. Love creating art, concerts, and vintage shops.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0498, lng: 14.5074 }
    },
    preferences: {
      ageMin: 24,
      ageMax: 33,
      gender: 'male',
      maxDistance: 45
    }
  },
  {
    displayName: 'David Martinez',
    email: 'david.martinez@test.com',
    password: 'password123',
    age: 29,
    gender: 'male',
    bio: 'Environmental scientist and photographer. Love hiking and wildlife photography.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0534, lng: 14.5031 }
    },
    preferences: {
      ageMin: 23,
      ageMax: 34,
      gender: 'both',
      maxDistance: 60
    }
  },
  {
    displayName: 'Zoe Williams',
    email: 'zoe.williams@test.com',
    password: 'password123',
    age: 23,
    gender: 'female',
    bio: 'Psychology student and volunteer counselor. Love board games and deep conversations.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0556, lng: 14.5042 }
    },
    preferences: {
      ageMin: 21,
      ageMax: 29,
      gender: 'both',
      maxDistance: 30
    }
  },
  {
    displayName: 'Ryan Foster',
    email: 'ryan.foster@test.com',
    password: 'password123',
    age: 31,
    gender: 'male',
    bio: 'Chef and food blogger. Love experimenting with cuisines and wine pairing.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0512, lng: 14.5033 }
    },
    preferences: {
      ageMin: 25,
      ageMax: 35,
      gender: 'both',
      maxDistance: 40
    }
  },
  {
    displayName: 'Luna Chen',
    email: 'luna.chen@test.com',
    password: 'password123',
    age: 22,
    gender: 'female',
    bio: 'Fashion design student. Love music festivals, thrift shopping, and photography.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0588, lng: 14.5019 }
    },
    preferences: {
      ageMin: 20,
      ageMax: 28,
      gender: 'both',
      maxDistance: 35
    }
  }
];

async function createSimpleTestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('Connected to MongoDB');

    console.log('Checking for existing test users...');
    const existingUserEmails = testUsers.map(user => user.email);
    const existingUsers = await User.find({ email: { $in: existingUserEmails } });

    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing test users. Deleting them first...`);
      await User.deleteMany({ email: { $in: existingUserEmails } });
      console.log('Existing test users deleted.');
    }

    console.log('Creating simple test users...');

    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.displayName}...`);

      const user = new User({
        ...userData,
        photos: [], // Start with no photos to avoid complexity
        conversationHelpers: {
          iceBreakerAnswers: [],
          wouldYouRatherAnswers: [],
          twoTruthsOneLie: []
        },
        isOnline: Math.random() > 0.3, // 70% chance to be online for testing
        lastActive: new Date(Date.now() - Math.random() * 3600000) // Random last active within 1 hour
      });

      await user.save();
      console.log(`✓ Created: ${userData.displayName} (${userData.gender}, age ${userData.age}) - ${user.isOnline ? 'Online' : 'Offline'}`);
    }

    console.log('\n🎉 Successfully created all test users!');
    console.log('\nTest users created:');
    testUsers.forEach(user => {
      console.log(`- ${user.displayName} (${user.gender}, ${user.age}) - ${user.email}`);
    });

    console.log('\nYou can now test live matchmaking with these profiles!');
    console.log('All users have the password: password123');
    console.log('Most users are set as online for easier testing.');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Add option to clean up all test users
if (process.argv.includes('--cleanup')) {
  async function cleanupTestUsers() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
      const existingUserEmails = testUsers.map(user => user.email);
      const result = await User.deleteMany({ email: { $in: existingUserEmails } });
      console.log(`Deleted ${result.deletedCount} test users`);
      await mongoose.connection.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
  cleanupTestUsers();
} else {
  createSimpleTestUsers();
}