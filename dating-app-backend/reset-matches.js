const mongoose = require('mongoose');
const User = require('./models/User');
const Match = require('./models/Match');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app')
  .then(() => {
    console.log('Connected to MongoDB');
    resetMatches();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetMatches() {
  try {
    console.log('🔄 Resetting all matches and recent match history...');

    // Clear all recent matches from all users
    await User.updateMany(
      { email: { $regex: /test\d+@example\.com/ } },
      { $set: { recentMatches: [] } }
    );

    // Delete all match records
    await Match.deleteMany({});

    console.log('✅ All matches and recent match history cleared!');
    console.log('You can now test matching functionality again.');

  } catch (error) {
    console.error('Error resetting matches:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}