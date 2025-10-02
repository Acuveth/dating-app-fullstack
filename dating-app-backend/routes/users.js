const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

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

// Add new photos (preserves existing ones)
router.post('/photos/add', auth, async (req, res) => {
  try {
    console.log('Add photos request received');
    const { photos } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    // Check if user would exceed photo limit (max 6 photos)
    const currentPhotoCount = req.user.photos ? req.user.photos.length : 0;
    const maxPhotos = 6;

    if (currentPhotoCount + photos.length > maxPhotos) {
      return res.status(400).json({
        error: `Cannot add ${photos.length} photos. Maximum ${maxPhotos} photos allowed. You currently have ${currentPhotoCount}.`
      });
    }

    const savedPhotos = [];

    for (let i = 0; i < photos.length; i++) {
      const photoData = photos[i];

      // Extract base64 data from data URL or use raw base64
      let base64Data = photoData;
      if (photoData.startsWith('data:')) {
        base64Data = photoData.split(',')[1];
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${req.user._id}-${uniqueSuffix}.jpg`;
      const filePath = path.join(uploadsDir, filename);

      // Convert base64 to buffer and save
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      savedPhotos.push({
        url: `/uploads/${filename}`,
        publicId: path.parse(filename).name
      });

      console.log(`Saved photo ${i}: ${filename}, size: ${buffer.length} bytes`);
    }

    // Add new photos to existing ones
    if (!req.user.photos) {
      req.user.photos = [];
    }
    req.user.photos.push(...savedPhotos);
    await req.user.save();

    console.log('Photos added successfully:', savedPhotos);
    res.json({ photos: req.user.photos });
  } catch (error) {
    console.error('Add photos error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Base64 photo upload endpoint for React Native (replaces all photos)
router.post('/photos/base64', auth, async (req, res) => {
  try {
    console.log('Base64 photo upload request received');
    const { photos, replaceAll = true } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    // Only delete old photos if replaceAll is true
    if (replaceAll && req.user.photos && req.user.photos.length > 0) {
      req.user.photos.forEach(photo => {
        if (photo.url && !photo.url.startsWith('data:')) {
          const filename = path.basename(photo.url);
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted old photo:', filename);
          }
        }
      });
    }

    const savedPhotos = [];

    for (let i = 0; i < photos.length; i++) {
      const photoData = photos[i];

      // Extract base64 data from data URL or use raw base64
      let base64Data = photoData;
      if (photoData.startsWith('data:')) {
        base64Data = photoData.split(',')[1];
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${req.user._id}-${uniqueSuffix}.jpg`;
      const filePath = path.join(uploadsDir, filename);

      // Convert base64 to buffer and save
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      savedPhotos.push({
        url: `/uploads/${filename}`,
        publicId: path.parse(filename).name
      });

      console.log(`Saved photo ${i}: ${filename}, size: ${buffer.length} bytes`);
    }

    if (replaceAll) {
      req.user.photos = savedPhotos;
    } else {
      if (!req.user.photos) {
        req.user.photos = [];
      }
      req.user.photos.push(...savedPhotos);
    }

    await req.user.save();

    console.log('Photos saved successfully:', savedPhotos);
    res.json({ photos: req.user.photos });
  } catch (error) {
    console.error('Base64 photo upload error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/photos', auth, upload.array('photos', 3), async (req, res) => {
  try {
    console.log('Photo upload request received');
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Body:', req.body);

    if (req.files) {
      req.files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          filename: file.filename,
          size: file.size
        });
      });
    }

    if (!req.files || req.files.length === 0) {
      console.log('No files received in request');
      return res.status(400).json({ error: 'No photos provided' });
    }

    // Delete old photos from filesystem
    if (req.user.photos && req.user.photos.length > 0) {
      req.user.photos.forEach(photo => {
        if (photo.url && !photo.url.startsWith('data:')) {
          const filename = path.basename(photo.url);
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted old photo:', filename);
          }
        }
      });
    }

    const photos = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      publicId: path.parse(file.filename).name
    }));

    req.user.photos = photos;
    await req.user.save();

    console.log('Photos saved successfully:', photos);
    res.json({ photos: req.user.photos });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/photos/:photoId', auth, async (req, res) => {
  try {
    const photoToDelete = req.user.photos.find(
      photo => photo.publicId === req.params.photoId
    );

    if (photoToDelete && photoToDelete.url && !photoToDelete.url.startsWith('data:')) {
      const filename = path.basename(photoToDelete.url);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    req.user.photos = req.user.photos.filter(
      photo => photo.publicId !== req.params.photoId
    );
    await req.user.save();
    res.json({ photos: req.user.photos });
  } catch (error) {
    console.error('Photo delete error:', error);
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