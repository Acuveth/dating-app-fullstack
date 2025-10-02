require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const additionalTestUsers = [
  {
    displayName: 'Ethan Parker',
    email: 'ethan.parker@test.com',
    password: 'password123',
    age: 27,
    gender: 'male',
    bio: 'Software developer and gamer. Love board games, sci-fi movies, and craft beer.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0543, lng: 14.5065 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 32,
      gender: 'both',
      maxDistance: 45
    }
  },
  {
    displayName: 'Isabella Garcia',
    email: 'isabella.garcia@test.com',
    password: 'password123',
    age: 26,
    gender: 'female',
    bio: 'Dance instructor and choreographer. Love salsa, bachata, and live music.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0578, lng: 14.5023 }
    },
    preferences: {
      ageMin: 24,
      ageMax: 33,
      gender: 'male',
      maxDistance: 35
    }
  },
  {
    displayName: 'Noah Mitchell',
    email: 'noah.mitchell@test.com',
    password: 'password123',
    age: 24,
    gender: 'male',
    bio: 'Architecture student and urban explorer. Love sketching buildings and photography.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0501, lng: 14.5087 }
    },
    preferences: {
      ageMin: 21,
      ageMax: 29,
      gender: 'both',
      maxDistance: 50
    }
  },
  {
    displayName: 'Ava Thompson',
    email: 'ava.thompson@test.com',
    password: 'password123',
    age: 29,
    gender: 'female',
    bio: 'Veterinarian and animal lover. Love hiking with my dog and wildlife conservation.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0519, lng: 14.5045 }
    },
    preferences: {
      ageMin: 26,
      ageMax: 35,
      gender: 'both',
      maxDistance: 40
    }
  },
  {
    displayName: 'Liam Rodriguez',
    email: 'liam.rodriguez@test.com',
    password: 'password123',
    age: 32,
    gender: 'male',
    bio: 'Musician and music producer. Play guitar and piano, love live concerts.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0567, lng: 14.5012 }
    },
    preferences: {
      ageMin: 25,
      ageMax: 35,
      gender: 'female',
      maxDistance: 30
    }
  },
  {
    displayName: 'Chloe Anderson',
    email: 'chloe.anderson@test.com',
    password: 'password123',
    age: 23,
    gender: 'female',
    bio: 'Marketing coordinator and social media enthusiast. Love travel and food blogging.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0532, lng: 14.5098 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 30,
      gender: 'both',
      maxDistance: 55
    }
  },
  {
    displayName: 'Oliver Wilson',
    email: 'oliver.wilson@test.com',
    password: 'password123',
    age: 28,
    gender: 'male',
    bio: 'Personal trainer and nutrition coach. Love CrossFit, meal prep, and outdoor adventures.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0489, lng: 14.5034 }
    },
    preferences: {
      ageMin: 23,
      ageMax: 32,
      gender: 'female',
      maxDistance: 40
    }
  },
  {
    displayName: 'Mia Johnson',
    email: 'mia.johnson@test.com',
    password: 'password123',
    age: 25,
    gender: 'female',
    bio: 'Fashion blogger and stylist. Love vintage shopping, coffee culture, and street art.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0554, lng: 14.5076 }
    },
    preferences: {
      ageMin: 23,
      ageMax: 31,
      gender: 'both',
      maxDistance: 35
    }
  },
  {
    displayName: 'Lucas Brown',
    email: 'lucas.brown@test.com',
    password: 'password123',
    age: 31,
    gender: 'male',
    bio: 'Startup founder and tech enthusiast. Love innovation, entrepreneurship, and networking.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0515, lng: 14.5028 }
    },
    preferences: {
      ageMin: 26,
      ageMax: 35,
      gender: 'both',
      maxDistance: 60
    }
  },
  {
    displayName: 'Harper Davis',
    email: 'harper.davis@test.com',
    password: 'password123',
    age: 22,
    gender: 'female',
    bio: 'Environmental science student and sustainability advocate. Love zero-waste living.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0561, lng: 14.5018 }
    },
    preferences: {
      ageMin: 20,
      ageMax: 28,
      gender: 'both',
      maxDistance: 45
    }
  },
  {
    displayName: 'Sebastian Lee',
    email: 'sebastian.lee@test.com',
    password: 'password123',
    age: 30,
    gender: 'male',
    bio: 'Chef at a fine dining restaurant. Love experimenting with fusion cuisine.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0492, lng: 14.5061 }
    },
    preferences: {
      ageMin: 25,
      ageMax: 34,
      gender: 'both',
      maxDistance: 50
    }
  },
  {
    displayName: 'Aria Martinez',
    email: 'aria.martinez@test.com',
    password: 'password123',
    age: 27,
    gender: 'female',
    bio: 'Yoga instructor and wellness coach. Love meditation, healthy living, and nature.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0573, lng: 14.5039 }
    },
    preferences: {
      ageMin: 24,
      ageMax: 33,
      gender: 'male',
      maxDistance: 40
    }
  },
  {
    displayName: 'Jackson Taylor',
    email: 'jackson.taylor@test.com',
    password: 'password123',
    age: 26,
    gender: 'male',
    bio: 'Graphic designer and video game developer. Love pixel art and indie games.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0508, lng: 14.5083 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 30,
      gender: 'both',
      maxDistance: 45
    }
  },
  {
    displayName: 'Lily Clark',
    email: 'lily.clark@test.com',
    password: 'password123',
    age: 24,
    gender: 'female',
    bio: 'Journalist and travel writer. Love storytelling, cultural exploration, and languages.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0541, lng: 14.5052 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 30,
      gender: 'both',
      maxDistance: 55
    }
  },
  {
    displayName: 'Mason White',
    email: 'mason.white@test.com',
    password: 'password123',
    age: 29,
    gender: 'male',
    bio: 'Mechanical engineer and motorcycle enthusiast. Love road trips and adventure sports.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0526, lng: 14.5015 }
    },
    preferences: {
      ageMin: 24,
      ageMax: 32,
      gender: 'female',
      maxDistance: 65
    }
  }
];

async function createMoreTestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('Connected to MongoDB');

    console.log('Checking for existing additional test users...');
    const existingUserEmails = additionalTestUsers.map(user => user.email);
    const existingUsers = await User.find({ email: { $in: existingUserEmails } });

    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing additional test users. Deleting them first...`);
      await User.deleteMany({ email: { $in: existingUserEmails } });
      console.log('Existing additional test users deleted.');
    }

    console.log('Creating additional test users...');

    for (const userData of additionalTestUsers) {
      console.log(`Creating user: ${userData.displayName}...`);

      const user = new User({
        ...userData,
        photos: [],
        conversationHelpers: {
          iceBreakerAnswers: [],
          wouldYouRatherAnswers: [],
          twoTruthsOneLie: []
        },
        isOnline: Math.random() > 0.2, // 80% chance to be online for testing
        lastActive: new Date(Date.now() - Math.random() * 1800000) // Random last active within 30 minutes
      });

      await user.save();
      console.log(`✓ Created: ${userData.displayName} (${userData.gender}, age ${userData.age}) - ${user.isOnline ? 'Online' : 'Offline'}`);
    }

    console.log('\n🎉 Successfully created all additional test users!');
    console.log('\nAdditional test users created:');
    additionalTestUsers.forEach(user => {
      console.log(`- ${user.displayName} (${user.gender}, ${user.age}) - ${user.email}`);
    });

    console.log('\nYou now have even more users available for matchmaking!');
    console.log('All users have the password: password123');
    console.log('Most users are set as online for easier testing.');

  } catch (error) {
    console.error('Error creating additional test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

createMoreTestUsers();