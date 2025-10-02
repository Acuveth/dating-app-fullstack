require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateExistingUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('Connected to MongoDB');

    console.log('Finding users without gender or preferences...');
    const usersToUpdate = await User.find({
      $or: [
        { gender: { $exists: false } },
        { preferences: { $exists: false } },
        { 'preferences.gender': { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    for (const user of usersToUpdate) {
      console.log(`Updating user: ${user.displayName}`);

      const updates = {};

      // Set gender if missing
      if (!user.gender) {
        // Randomly assign gender based on name patterns
        const maleNames = ['Alex', 'Marcus', 'David', 'Ryan', 'Liam', 'Noah', 'Oliver', 'Lucas', 'Sebastian', 'Jackson', 'Mason', 'Ethan'];
        const femaleNames = ['Maya', 'Emma', 'Sofia', 'Zoe', 'Luna', 'Isabella', 'Ava', 'Chloe', 'Mia', 'Harper', 'Aria', 'Lily'];

        const firstName = user.displayName.split(' ')[0];
        if (maleNames.includes(firstName)) {
          updates.gender = 'male';
        } else if (femaleNames.includes(firstName)) {
          updates.gender = 'female';
        } else {
          // For Jordan and other ambiguous names
          updates.gender = 'other';
        }
      }

      // Set preferences if missing or incomplete
      if (!user.preferences || !user.preferences.gender) {
        updates.preferences = {
          ageMin: user.preferences?.ageMin || Math.max(18, (user.age || 25) - 7),
          ageMax: user.preferences?.ageMax || Math.min(60, (user.age || 25) + 7),
          gender: user.preferences?.gender || (Math.random() > 0.7 ? 'both' : (Math.random() > 0.5 ? 'male' : 'female')),
          maxDistance: user.preferences?.maxDistance || (30 + Math.floor(Math.random() * 40))
        };
      }

      await User.findByIdAndUpdate(user._id, updates);
      console.log(`✓ Updated ${user.displayName}:`, {
        gender: updates.gender || user.gender,
        preferences: updates.preferences || user.preferences
      });
    }

    console.log('\n🎉 Successfully updated all users!');

    // Show final stats
    const totalUsers = await User.countDocuments();
    const maleUsers = await User.countDocuments({ gender: 'male' });
    const femaleUsers = await User.countDocuments({ gender: 'female' });
    const otherUsers = await User.countDocuments({ gender: 'other' });

    console.log('\nFinal user stats:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Male: ${maleUsers}`);
    console.log(`Female: ${femaleUsers}`);
    console.log(`Other: ${otherUsers}`);

    const lookingForMale = await User.countDocuments({ 'preferences.gender': 'male' });
    const lookingForFemale = await User.countDocuments({ 'preferences.gender': 'female' });
    const lookingForBoth = await User.countDocuments({ 'preferences.gender': 'both' });

    console.log('\nPreference stats:');
    console.log(`Looking for males: ${lookingForMale}`);
    console.log(`Looking for females: ${lookingForFemale}`);
    console.log(`Looking for everyone: ${lookingForBoth}`);

  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

updateExistingUsers();