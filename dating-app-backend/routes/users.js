const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'displayName', 'age', 'bio', 'location', 'preferences',
      'conversationHelpers', 'gender'
    ];

    const updates = Object.keys(req.body).filter(key =>
      allowedUpdates.includes(key)
    );

    updates.forEach(update => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    res.json({ user: req.user.toPublicJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/photos', auth, upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    const photos = req.files.map(file => ({
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      publicId: `${req.user._id}_${Date.now()}`
    }));

    req.user.photos = photos;
    await req.user.save();

    res.json({ photos: req.user.photos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/photos/:photoId', auth, async (req, res) => {
  try {
    req.user.photos = req.user.photos.filter(
      photo => photo.publicId !== req.params.photoId
    );
    await req.user.save();
    res.json({ photos: req.user.photos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/location', auth, async (req, res) => {
  try {
    const { city, lat, lng } = req.body;

    req.user.location = {
      city,
      coordinates: { lat, lng }
    };

    await req.user.save();
    res.json({ location: req.user.location });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/preferences', auth, async (req, res) => {
  try {
    const { ageMin, ageMax, gender, maxDistance } = req.body;

    req.user.preferences = {
      ageMin: ageMin || 18,
      ageMax: ageMax || 100,
      gender: gender || 'both',
      maxDistance: maxDistance || 50
    };

    await req.user.save();
    res.json({ preferences: req.user.preferences });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/block/:userId', auth, async (req, res) => {
  try {
    if (!req.user.blockedUsers.includes(req.params.userId)) {
      req.user.blockedUsers.push(req.params.userId);
      await req.user.save();
    }
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/report/:userId', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    req.user.reportedUsers.push({
      userId: req.params.userId,
      reason,
      reportedAt: new Date()
    });

    await req.user.save();
    res.json({ message: 'User reported successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;