const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');
const { getDistance } = require('../utils/location');

const router = express.Router();

router.post('/find', auth, async (req, res) => {
  try {
    const user = req.user;
    const { preferences, location, blockedUsers, _id } = user;

    if (!location?.coordinates) {
      return res.status(400).json({ error: 'Location not set' });
    }

    const recentMatchUserIds = user.recentMatches
      .filter(m => new Date() - m.matchedAt < 24 * 60 * 60 * 1000)
      .map(m => m.userId);

    let query = {
      _id: {
        $ne: _id,
        $nin: [...blockedUsers, ...recentMatchUserIds]
      },
      isOnline: true,
      age: { $gte: preferences.ageMin, $lte: preferences.ageMax }
    };

    if (preferences.gender !== 'both') {
      query.gender = preferences.gender;
    }

    const potentialMatches = await User.find(query)
      .select('displayName age bio location photos gender preferences')
      .limit(50);

    const filteredMatches = potentialMatches.filter(match => {
      if (!match.location?.coordinates) return false;

      const distance = getDistance(
        location.coordinates.lat,
        location.coordinates.lng,
        match.location.coordinates.lat,
        match.location.coordinates.lng
      );

      if (distance > preferences.maxDistance) return false;

      if (match.preferences) {
        if (user.age < match.preferences.ageMin ||
            user.age > match.preferences.ageMax) return false;

        if (match.preferences.gender !== 'both' &&
            match.preferences.gender !== user.gender) return false;
      }

      return true;
    });

    if (filteredMatches.length === 0) {
      return res.json({ match: null, message: 'No matches available' });
    }

    const randomMatch = filteredMatches[
      Math.floor(Math.random() * filteredMatches.length)
    ];

    const newMatch = new Match({
      user1: _id,
      user2: randomMatch._id,
      status: 'pending'
    });

    await newMatch.save();

    user.recentMatches.push({
      userId: randomMatch._id,
      matchedAt: new Date()
    });
    await user.save();

    res.json({
      match: {
        ...randomMatch.toObject(),
        matchId: newMatch._id
      }
    });
  } catch (error) {
    console.error('Match finding error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/decision/:matchId', auth, async (req, res) => {
  try {
    const { decision } = req.body;
    const { matchId } = req.params;

    if (!['yes', 'no'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const isUser1 = match.user1.equals(req.user._id);
    const isUser2 = match.user2.equals(req.user._id);

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Not your match' });
    }

    if (isUser1) {
      match.user1Decision = decision;
    } else {
      match.user2Decision = decision;
    }

    if (match.user1Decision === 'yes' && match.user2Decision === 'yes') {
      match.status = 'extended';
      match.extended = true;
    } else if (match.user1Decision === 'no' || match.user2Decision === 'no') {
      match.status = 'ended';
      match.endedAt = new Date();
    }

    await match.save();

    res.json({
      match,
      extended: match.status === 'extended'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/skip/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const isUser1 = match.user1.equals(req.user._id);
    const isUser2 = match.user2.equals(req.user._id);

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: 'Not your match' });
    }

    match.status = 'ended';
    match.endedAt = new Date();
    if (isUser1) {
      match.user1Decision = 'no';
    } else {
      match.user2Decision = 'no';
    }

    await match.save();

    res.json({ message: 'Match skipped', match });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active', auth, async (req, res) => {
  try {
    const activeMatch = await Match.findOne({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ],
      status: { $in: ['pending', 'active', 'extended'] }
    }).populate('user1 user2', 'displayName age bio photos location gender');

    res.json({ match: activeMatch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;