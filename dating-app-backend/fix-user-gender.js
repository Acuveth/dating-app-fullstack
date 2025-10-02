const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => {
    console.log('Connected to MongoDB');
    fixUserGender();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixUserGender() {
  try {
    // Find your user and update gender preferences to be more inclusive
    const result = await User.updateOne(
      { displayName: 'Luka' },
      {
        gender: 'male' // Change from 'other' to 'male' so you can match with females
      }
    );

    // Also make some test users more inclusive
    await User.updateMany(
      { email: { $regex: /test[1-3]@example\.com/ } },
      {
        $set: { 'preferences.gender': 'both' }
      }
    );

    console.log('✅ Updated user gender and made some test users more inclusive!');
    console.log('You should now be able to find matches.');

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}