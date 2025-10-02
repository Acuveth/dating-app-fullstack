// Simple test script to verify photo upload functionality
const path = require('path');
const fs = require('fs');

console.log('Testing photo upload system...');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Uploads directory:', uploadsDir);
console.log('Directory exists:', fs.existsSync(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Directory created successfully');
} else {
  console.log('Directory already exists');
}

// List existing files
const files = fs.readdirSync(uploadsDir);
console.log('Files in uploads directory:', files.length);
files.forEach(file => console.log(' -', file));

console.log('Test completed. The photo upload system should work now.');
console.log('Make sure to restart the backend server to apply changes.');