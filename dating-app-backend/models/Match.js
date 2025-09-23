const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'extended'],
    default: 'pending'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  user1Decision: {
    type: String,
    enum: ['yes', 'no', 'pending'],
    default: 'pending'
  },
  user2Decision: {
    type: String,
    enum: ['yes', 'no', 'pending'],
    default: 'pending'
  },
  extended: {
    type: Boolean,
    default: false
  },
  conversationHelpers: {
    iceBreakersUsed: [String],
    wouldYouRatherUsed: [Number],
    twoTruthsOneLieUsed: [Number],
    topicsUsed: [String]
  },
  duration: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

matchSchema.index({ user1: 1, user2: 1 });
matchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Match', matchSchema);