const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Sample base64 image (1x1 red pixel)
const sampleBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Or create a larger test image (10x10 blue square)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

async function testBase64Upload() {
  try {
    // First, we need to login or get a token
    // You'll need to replace this with an actual user token
    const token = process.env.TEST_USER_TOKEN || 'your-test-token-here';

    console.log('Testing base64 photo upload...');

    // Create full data URLs
    const photos = [
      `data:image/png;base64,${sampleBase64Image}`,
      `data:image/png;base64,${testImageBase64}`,
      `data:image/png;base64,${sampleBase64Image}`
    ];

    const response = await axios.post(
      'http://localhost:5001/api/users/photos/base64',
      { photos },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Upload successful!');
    console.log('Response:', response.data);

    // Check if files were created
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    console.log('\nFiles in uploads directory:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(uploadsDir, file));
      console.log(`  - ${file}: ${stats.size} bytes`);
    });

  } catch (error) {
    console.error('Upload failed:');
    console.error(error.response?.data || error.message);
  }
}

// Instructions for getting a token
console.log(`
To test the upload:
1. First, get a valid JWT token by logging in a user
2. Set the TEST_USER_TOKEN environment variable
3. Run: TEST_USER_TOKEN="your-token" node test-base64-upload.js

Or modify the script to include a login step first.
`);

// Uncomment to run the test
// testBase64Upload();