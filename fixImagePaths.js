const fs = require('fs-extra');
const path = require('path');

// Define the uploads directory paths
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const POST_IMAGES = path.join(UPLOAD_DIR, 'posts');

// Ensure the posts directory exists
fs.ensureDirSync(POST_IMAGES);

// Move post image files from root to posts directory
async function movePostImages() {
  try {
    // Get all files in the uploads root directory
    const files = await fs.readdir(UPLOAD_DIR);
    
    // Filter for image files with timestamp pattern that should be in posts directory
    const imageFiles = files.filter(file => {
      // Check if it's a file (not a directory) and has the timestamp pattern
      return fs.statSync(path.join(UPLOAD_DIR, file)).isFile() && 
             /^\d{13}-\d+-/.test(file);
    });
    
    console.log(`Found ${imageFiles.length} potential post image files to move`);
    
    // Move each file to the posts directory
    for (const file of imageFiles) {
      const sourcePath = path.join(UPLOAD_DIR, file);
      const destPath = path.join(POST_IMAGES, file);
      
      // Check if the file exists in the destination
      const exists = await fs.pathExists(destPath);
      if (exists) {
        console.log(`File already exists in posts directory: ${file}`);
        continue;
      }
      
      // Move the file
      await fs.move(sourcePath, destPath);
      console.log(`Moved ${file} to posts directory`);
    }
    
    console.log('File migration completed successfully');
  } catch (error) {
    console.error('Error moving image files:', error);
  }
}

// Run the function
movePostImages();
