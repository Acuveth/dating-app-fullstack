require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const sampleProfilePhotos = {
  // Small sample base64 images for testing (these are tiny 1x1 pixel images)
  male1: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hqCnBgAAAABJRU5ErkJggg==', // blue
  male2: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', // red
  male3: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M8ABQwAgAAZALhXRfUAAAAASUVORK5CYII=', // green
  female1: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BkwABggEAP3XlZQAAAABJRU5ErkJggg==', // purple
  female2: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/w8ACgEBAADGLrYAAAAASUVORK5CYII=', // orange
  female3: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPAAIAAQABgAAZA2oAAAAASUVORK5CYII=', // yellow
  nonbinary1: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk/P8fAwAAkgAZAMQmJgQAAAAASUVORK5CYII=', // cyan
  nonbinary2: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8DAAIAAgABgAAZAoAAAAASUVORK5CYII=', // pink
};

const testUsers = [
  {
    displayName: 'Alex Chen',
    email: 'alex.chen@test.com',
    password: 'password123',
    age: 28,
    gender: 'male',
    bio: 'Software engineer by day, chef by night. Love hiking, guitar, and new restaurants. Looking for adventure companions!',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0569, lng: 14.5058 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 35,
      gender: 'both',
      maxDistance: 50
    },
    photos: ['male1', 'male2'],
    conversationHelpers: {
      iceBreakerAnswers: [
        { question: 'What\'s your biggest guilty pleasure?', answer: 'Binge-watching cooking shows at 2 AM' },
        { question: 'What\'s the most embarrassing thing that\'s happened to you?', answer: 'I once got lost in my own neighborhood after moving there' },
        { question: 'What\'s a random skill you have?', answer: 'I can solve a Rubik\'s cube in under 2 minutes' }
      ],
      wouldYouRatherAnswers: [
        {
          question: { option1: 'Have the ability to fly', option2: 'Be invisible' },
          choice: 'option1',
          reason: 'Imagine the commute!'
        },
        {
          question: { option1: 'Always be 10 minutes late', option2: 'Always be 20 minutes early' },
          choice: 'option2',
          reason: 'Gives me time to overthink everything'
        },
        {
          question: { option1: 'Fight one horse-sized duck', option2: 'Fight 100 duck-sized horses' },
          choice: 'option2',
          reason: 'Better odds with the horses'
        }
      ],
      twoTruthsOneLie: [
        {
          truth1: 'I speak four languages fluently',
          truth2: 'I\'ve never broken a bone',
          lie: 'I once performed stand-up comedy',
          category: 'skills'
        }
      ]
    }
  },
  {
    displayName: 'Maya Rodriguez',
    email: 'maya.rodriguez@test.com',
    password: 'password123',
    age: 25,
    gender: 'female',
    bio: 'Art teacher and weekend photographer. Passionate about environmental conservation and yoga. Always up for a good coffee and meaningful conversations.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0511, lng: 14.5051 }
    },
    preferences: {
      ageMin: 23,
      ageMax: 32,
      gender: 'male',
      maxDistance: 30
    },
    photos: ['female1', 'female2'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I collect vintage cameras but I\'m terrible at using them',
        'My plants have names and I talk to them daily',
        'I once accidentally dyed my hair green instead of blonde'
      ],
      wouldYouRatherAnswers: [
        'Would you rather live in a world without music or without colors? Without colors - music feeds the soul',
        'Would you rather have free WiFi everywhere or free coffee everywhere? Coffee! I can survive without internet occasionally',
        'Would you rather be able to speak to animals or speak all human languages? Animals - imagine the gossip!'
      ],
      twoTruthsOneLie: [
        'I\'ve been skydiving three times',
        'I can paint with both hands simultaneously',
        'I\'ve lived in five different countries'
      ]
    }
  },
  {
    displayName: 'Jordan Kim',
    email: 'jordan.kim@test.com',
    password: 'password123',
    age: 26,
    gender: 'nonbinary',
    bio: 'Marketing professional and part-time DJ. Love electronic music, street art, and trying new cuisines. Looking for genuine connections and great conversations.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0547, lng: 14.5089 }
    },
    preferences: {
      ageMin: 21,
      ageMax: 35,
      gender: 'both',
      maxDistance: 40
    },
    photos: ['nonbinary1', 'nonbinary2'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I have a playlist for every possible mood and situation',
        'I once DJed at a wedding and accidentally played a funeral song',
        'I can beatbox while humming at the same time'
      ],
      wouldYouRatherAnswers: [
        'Would you rather only communicate through song lyrics or dance moves? Song lyrics - at least people might understand',
        'Would you rather have a rewind button or a pause button for your life? Pause - need more time to think',
        'Would you rather eat only spicy food or only sweet food? Spicy - life needs some heat'
      ],
      twoTruthsOneLie: [
        'I\'ve performed at three different music festivals',
        'I can juggle while riding a unicycle',
        'I have a twin sibling'
      ]
    }
  },
  {
    displayName: 'Emma Thompson',
    email: 'emma.thompson@test.com',
    password: 'password123',
    age: 24,
    gender: 'female',
    bio: 'Medical student with a passion for travel and languages. Love rock climbing, reading, and discovering hidden gems in the city. Seeking someone intellectually curious.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0581, lng: 14.5021 }
    },
    preferences: {
      ageMin: 22,
      ageMax: 30,
      gender: 'both',
      maxDistance: 25
    },
    photos: ['female3'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I can diagnosis myself with 20 diseases just from WebMD',
        'I once got stuck on a climbing wall for an hour',
        'I know how to say "hello" in 12 languages but only count to 10 in three'
      ],
      wouldYouRatherAnswers: [
        'Would you rather know the date of your death or the cause? Neither, but if forced - the cause, so I can avoid it',
        'Would you rather be stuck in an elevator with your ex or with a stranger? Stranger - less awkward small talk',
        'Would you rather have unlimited books or unlimited travel? Travel - books can wait, experiences can\'t'
      ],
      twoTruthsOneLie: [
        'I\'ve performed surgery on a grape',
        'I can speak five languages',
        'I\'ve climbed three mountains over 3000m'
      ]
    }
  },
  {
    displayName: 'Marcus Johnson',
    email: 'marcus.johnson@test.com',
    password: 'password123',
    age: 30,
    gender: 'male',
    bio: 'Fitness trainer and nutrition coach. Former basketball player turned wellness enthusiast. Love outdoor activities, cooking healthy meals, and motivating others.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0523, lng: 14.5067 }
    },
    preferences: {
      ageMin: 25,
      ageMax: 35,
      gender: 'female',
      maxDistance: 35
    },
    photos: ['male3'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I can do a handstand for 5 minutes straight',
        'My protein smoothies have scared away three roommates',
        'I once benchPressed my own bodyweight in vegetables'
      ],
      wouldYouRatherAnswers: [
        'Would you rather give up exercise forever or give up unhealthy food forever? Unhealthy food - exercise is life',
        'Would you rather be able to eat anything without gaining weight or never need sleep? Never need sleep - more time for gains',
        'Would you rather have super strength or super speed? Strength - imagine the deadlifts'
      ],
      twoTruthsOneLie: [
        'I\'ve competed in three marathons',
        'I can bench press 300 pounds',
        'I\'ve never eaten a hamburger'
      ]
    }
  },
  {
    displayName: 'Sofia Petrov',
    email: 'sofia.petrov@test.com',
    password: 'password123',
    age: 27,
    gender: 'female',
    bio: 'Graphic designer and illustrator. Love creating art, attending concerts, and exploring vintage shops. Looking for someone creative and passionate about life.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0498, lng: 14.5074 }
    },
    preferences: {
      ageMin: 24,
      ageMax: 33,
      gender: 'male',
      maxDistance: 45
    },
    photos: ['female2', 'female1'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I design logos by day and doodle terrible cartoons by night',
        'My apartment is basically a museum of thrift store finds',
        'I once accidentally submitted a grocery list as a client proposal'
      ],
      wouldYouRatherAnswers: [
        'Would you rather be able to draw anything perfectly or sing any song perfectly? Draw - I can create worlds',
        'Would you rather live in a world without art or without music? Impossible choice, but without art - music moves the soul',
        'Would you rather have fingers for toes or toes for fingers? Toes for fingers - better grip for drawing'
      ],
      twoTruthsOneLie: [
        'I\'ve sold artwork in three different countries',
        'I can draw realistic portraits with my non-dominant hand',
        'I once met my favorite artist at a coffee shop'
      ]
    }
  },
  {
    displayName: 'David Martinez',
    email: 'david.martinez@test.com',
    password: 'password123',
    age: 29,
    gender: 'male',
    bio: 'Environmental scientist and weekend hiker. Passionate about sustainability and wildlife photography. Always planning the next outdoor adventure.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0534, lng: 14.5031 }
    },
    preferences: {
      ageMin: 23,
      ageMax: 34,
      gender: 'both',
      maxDistance: 60
    },
    photos: ['male2', 'male1'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I can identify bird species by their calls but not by sight',
        'My camera gear costs more than my car',
        'I once got chased by a very territorial squirrel'
      ],
      wouldYouRatherAnswers: [
        'Would you rather save the forests or save the oceans? Forests - they\'re the lungs of our planet',
        'Would you rather live in the mountains or by the sea? Mountains - closer to the stars',
        'Would you rather photograph wildlife or landscapes? Wildlife - every animal has a story'
      ],
      twoTruthsOneLie: [
        'I\'ve hiked in seven different countries',
        'I once spent a week living in a tree house for research',
        'I discovered a new species of beetle'
      ]
    }
  },
  {
    displayName: 'Zoe Williams',
    email: 'zoe.williams@test.com',
    password: 'password123',
    age: 23,
    gender: 'female',
    bio: 'Psychology student and volunteer counselor. Love board games, philosophical discussions, and helping others. Seeking deep connections and meaningful relationships.',
    location: {
      city: 'Ljubljana, Slovenia',
      coordinates: { lat: 46.0556, lng: 14.5042 }
    },
    preferences: {
      ageMin: 21,
      ageMax: 29,
      gender: 'both',
      maxDistance: 30
    },
    photos: ['female3', 'female2'],
    conversationHelpers: {
      iceBreakerAnswers: [
        'I analyze everyone\'s personality but can\'t figure out my own',
        'I have 47 board games and I\'ve mastered exactly 3 of them',
        'I once accidentally psychoanalyzed my barista\'s latte art'
      ],
      wouldYouRatherAnswers: [
        'Would you rather read minds or predict the future? Read minds - understanding people is fascinating',
        'Would you rather have perfect memory or the ability to forget anything? Perfect memory - experiences shape us',
        'Would you rather solve world hunger or solve mental health stigma? Mental health - it affects everything else'
      ],
      twoTruthsOneLie: [
        'I can solve a 1000-piece puzzle in under 4 hours',
        'I\'ve never lost a game of chess',
        'I volunteer at three different organizations'
      ]
    }
  }
];

async function createRealisticTestUsers() {
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

    console.log('Creating realistic test users...');

    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.displayName}...`);

      // Process photos - convert keys to base64 data URLs
      const processedPhotos = userData.photos.map(photoKey => {
        const base64Data = sampleProfilePhotos[photoKey];
        return {
          url: `data:image/png;base64,${base64Data}`,
          publicId: `test-${photoKey}-${Date.now()}`
        };
      });

      const user = new User({
        ...userData,
        photos: processedPhotos,
        isOnline: Math.random() > 0.5, // Randomly set some users as online
        lastActive: new Date(Date.now() - Math.random() * 86400000) // Random last active within 24h
      });

      await user.save();
      console.log(`✓ Created: ${userData.displayName} (${userData.gender}, age ${userData.age})`);
    }

    console.log('\n🎉 Successfully created all realistic test users!');
    console.log('\nTest users created:');
    testUsers.forEach(user => {
      console.log(`- ${user.displayName} (${user.gender}, ${user.age}) - ${user.email}`);
    });

    console.log('\nYou can now test live matchmaking with these diverse profiles!');
    console.log('All users have the password: password123');

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
  createRealisticTestUsers();
}