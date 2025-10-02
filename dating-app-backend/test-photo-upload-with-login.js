require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const API_URL = 'http://localhost:5001/api';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

// Create a simple test image using Canvas (if available) or use a pre-made base64 image
// This is a 100x100 pixel gradient image
function generateTestImage() {
  // This is a small valid JPEG image encoded in base64
  // It's a 2x2 pixel image with different colors
  const testJpegBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

  return testJpegBase64;
}

async function testPhotoUpload() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('Connected to MongoDB');

    // Find a test user or create one
    let user = await User.findOne({ email: 'testphoto@test.com' });

    if (!user) {
      console.log('Creating test user...');
      user = new User({
        displayName: 'Test Photo User',
        email: 'testphoto@test.com',
        password: 'password123',
        age: 25,
        gender: 'male',
        preferences: {
          ageMin: 18,
          ageMax: 100,
          gender: 'both',
          maxDistance: 50
        },
        location: {
          city: 'Test City',
          coordinates: { lat: 0, lng: 0 }
        }
      });
      await user.save();
      console.log('Test user created');
    } else {
      console.log('Using existing test user');
    }

    // Generate a token for the user
    const token = generateToken(user._id);
    console.log('Generated auth token');

    // Create test images
    const testImage = generateTestImage();
    const photos = [
      `data:image/jpeg;base64,${testImage}`,
      `data:image/jpeg;base64,${testImage}`,
      `data:image/jpeg;base64,${testImage}`
    ];

    console.log('\\nUploading photos...');
    const response = await axios.post(
      `${API_URL}/users/photos/base64`,
      { photos },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Upload successful!');
    console.log('Photos saved:', response.data.photos);

    // Verify files were created with proper sizes
    const uploadsDir = path.join(__dirname, 'uploads');
    console.log('\\nVerifying uploaded files:');

    for (const photo of response.data.photos) {
      const filename = path.basename(photo.url);
      const filePath = path.join(uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✓ ${filename}: ${stats.size} bytes`);

        if (stats.size === 0) {
          console.error(`  ⚠ WARNING: File has 0 bytes!`);
        }
      } else {
        console.error(`✗ ${filename}: File not found!`);
      }
    }

    // Clean up test photos (optional)
    const cleanup = process.argv.includes('--cleanup');
    if (cleanup) {
      console.log('\\nCleaning up test photos...');
      for (const photo of response.data.photos) {
        const filename = path.basename(photo.url);
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filename}`);
        }
      }
    }

    console.log('\\nTest completed successfully!');
    console.log('Run with --cleanup flag to remove test images after upload');

  } catch (error) {
    console.error('Test failed:');
    console.error(error.response?.data || error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\\nDisconnected from MongoDB');
  }
}

// Run the test
testPhotoUpload();