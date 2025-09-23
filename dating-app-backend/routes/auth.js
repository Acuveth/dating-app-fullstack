const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { ...req.body, password: '[HIDDEN]' });

    const { email, password, displayName, age, gender, location, bio } = req.body;

    // Validation
    if (!email || !password || !displayName || !age || !gender) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (age < 18) {
      console.log('Age validation failed:', age);
      return res.status(400).json({ error: 'Must be at least 18 years old' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      displayName,
      age: parseInt(age),
      gender,
      location,
      bio
    });

    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    const token = generateToken(user._id);

    res.status(201).json({
      user: user.toPublicJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${errors.join(', ')}` });
    }

    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      user: user.toPublicJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = new User({
        googleId,
        email,
        displayName: name,
        age: 18,
        gender: 'other'
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      user: user.toPublicJSON(),
      token,
      isNewUser: !user.location?.city
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Google authentication failed' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastActive = new Date();
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;