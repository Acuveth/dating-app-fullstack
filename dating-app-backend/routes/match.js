const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');
const { getDistance } = require('../utils/location');

const router = express.Router();

router.post('/find', auth, async (req, res) => {
  console.log('🎯 MATCH REQUEST RECEIVED');
  try {
    const user = req.user;
    const { preferences, location, blockedUsers, _id } = user;

    console.log('=== MATCH FINDING DEBUG ===');
    console.log('User:', {
      id: _id,
      displayName: user.displayName,
      age: user.age,
      gender: user.gender,
      preferences: preferences,
      location: location?.city,
      hasCoordinates: !!location?.coordinates
    });

    if (!location?.coordinates) {
      console.log('ERROR: No coordinates set for user');
      return res.status(400).json({ error: 'Location not set' });
    }

    const recentMatchUserIds = user.recentMatches
      .filter(m => new Date() - m.matchedAt < 24 * 60 * 60 * 1000)
      .map(m => m.userId);

    console.log('Recent matches (last 24h):', recentMatchUserIds.length);

    // Make isOnline optional for testing
    let query = {
      _id: {
        $ne: _id,
        $nin: [...blockedUsers, ...recentMatchUserIds]
      },
      // isOnline: true, // Temporarily disable online requirement
      age: { $gte: preferences.ageMin, $lte: preferences.ageMax }
    };

    if (preferences.gender !== 'both') {
      query.gender = preferences.gender;
    }

    console.log('Query criteria:', query);

    const potentialMatches = await User.find(query)
      .select('displayName age bio location photos gender preferences isOnline')
      .limit(50);

    console.log('Potential matches found:', potentialMatches.length);
    potentialMatches.forEach(match => {
      console.log('  -', {
        id: match._id,
        name: match.displayName,
        age: match.age,
        gender: match.gender,
        isOnline: match.isOnline,
        hasLocation: !!match.location?.coordinates
      });
    });

    const filteredMatches = potentialMatches.filter(match => {
      console.log(`Checking match: ${match.displayName}`);

      if (!match.location?.coordinates) {
        console.log(`  - REJECTED: No coordinates`);
        return false;
      }

      const distance = getDistance(
        location.coordinates.lat,
        location.coordinates.lng,
        match.location.coordinates.lat,
        match.location.coordinates.lng
      );

      console.log(`  - Distance: ${distance}km (max: ${preferences.maxDistance}km)`);
      if (distance > preferences.maxDistance) {
        console.log(`  - REJECTED: Too far`);
        return false;
      }

      if (match.preferences) {
        console.log(`  - Match age preferences: ${match.preferences.ageMin}-${match.preferences.ageMax}, user age: ${user.age}`);
        if (user.age < match.preferences.ageMin ||
            user.age > match.preferences.ageMax) {
          console.log(`  - REJECTED: Age mismatch`);
          return false;
        }

        console.log(`  - Match gender pref: ${match.preferences.gender}, user gender: ${user.gender}`);
        if (match.preferences.gender !== 'both' &&
            match.preferences.gender !== user.gender) {
          console.log(`  - REJECTED: Gender mismatch`);
          return false;
        }
      }

      console.log(`  - ACCEPTED: ${match.displayName}`);
      return true;
    });

    console.log('Filtered matches:', filteredMatches.length);

    if (filteredMatches.length === 0) {
      console.log('RESULT: No matches available');
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