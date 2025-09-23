const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  bio: {
    type: String,
    maxLength: 140,
    default: ''
  },
  location: {
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  photos: [{
    url: String,
    publicId: String
  }],
  preferences: {
    ageMin: {
      type: Number,
      default: 18
    },
    ageMax: {
      type: Number,
      default: 100
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'both'],
      default: 'both'
    },
    maxDistance: {
      type: Number,
      default: 50
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  conversationHelpers: {
    iceBreakerAnswers: [{
      question: String,
      answer: String
    }],
    wouldYouRatherAnswers: [{
      question: {
        option1: String,
        option2: String
      },
      choice: String, // either 'option1' or 'option2'
      reason: String // optional explanation
    }],
    twoTruthsOneLie: [{
      truth1: String,
      truth2: String,
      lie: String,
      category: String
    }]
  },
  recentMatches: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.blockedUsers;
  delete obj.reportedUsers;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);