// Script to move images to correct folders
const fs = require('fs');
const path = require('path');

// Base upload directory
const uploadDir = path.join(__dirname, 'uploads');

// Subdirectories
const postsDir = path.join(uploadDir, 'posts');
const profilesDir = path.join(uploadDir, 'profiles');
const commentsDir = path.join(uploadDir, 'comments');
const groupsDir = path.join(uploadDir, 'groups');

// Ensure all directories exist
[postsDir, profilesDir, commentsDir, groupsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Get all files in the uploads root directory
const files = fs.readdirSync(uploadDir).filter(file => {
  const filePath = path.join(uploadDir, file);
  return fs.statSync(filePath).isFile(); // Only get files, not directories
});

console.log(`Found ${files.length} files in uploads directory`);

// Move files to the posts directory (assuming all root files are post images)
let movedCount = 0;
files.forEach(file => {
  const sourcePath = path.join(uploadDir, file);
  const destPath = path.join(postsDir, file);
  
  // Skip if the file already exists in the destination
  if (fs.existsSync(destPath)) {
    console.log(`Skipping ${file} - already exists in posts directory`);
    return;
  }
  
  try {
    // Copy the file to the posts directory
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to posts directory`);
    movedCount++;
  } catch (error) {
    console.error(`Error copying ${file}:`, error);
  }
});

console.log(`Successfully copied ${movedCount} files to posts directory`);
console.log('You can manually delete the original files from uploads root after verifying everything works');
