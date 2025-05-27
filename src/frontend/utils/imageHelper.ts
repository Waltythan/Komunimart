/**
 * Helper functions for handling image URLs throughout the application
 */

// Export this so it can be used in components that need direct access
export const BACKEND_URL = 'http://localhost:3000';

/**
 * Normalizes an image URL to ensure it works regardless of how it's stored in the database
 * 
 * @param imageUrl - The raw image URL from the backend
 * @param type - The type of image (profiles, posts, comments, groups)
 * @returns A properly formatted absolute URL to the image
 */
export const normalizeImageUrl = (imageUrl: string | null | undefined, type?: 'profiles' | 'posts' | 'comments' | 'groups'): string => {
  // If no image URL, return empty string
  if (!imageUrl || imageUrl.trim() === '') {
    return '';
  }

  // If it's already an absolute URL, return it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it already has the /uploads path, just add the backend URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  // Special handling based on the actual folder structure we observed
  if (/^\d{13}-\d+-/.test(imageUrl)) {
    // Check if it's a group image - groups are consistently in /uploads/groups/
    if (type === 'groups') {
      return `${BACKEND_URL}/uploads/groups/${imageUrl}`;
    }
    
    // Profile images are in /uploads/profiles/
    if (type === 'profiles') {
      return `${BACKEND_URL}/uploads/profiles/${imageUrl}`;
    }
    
    // Post images with timestamp pattern are directly in /uploads/ root
    if (type === 'posts' || !type) {
      return `${BACKEND_URL}/uploads/${imageUrl}`;
    }
  }

  // If we know the type and it's just a filename without the timestamp pattern
  // (like test-post-image.png that's in a type-specific folder)
  if (type) {
    return `${BACKEND_URL}/uploads/${type}/${imageUrl}`;
  }

  // If we don't know the type, try to infer it from the path
  if (imageUrl.includes('/profiles/')) {
    return `${BACKEND_URL}${imageUrl}`;
  } else if (imageUrl.includes('/posts/')) {
    return `${BACKEND_URL}${imageUrl}`;
  } else if (imageUrl.includes('/comments/')) {
    return `${BACKEND_URL}${imageUrl}`;
  } else if (imageUrl.includes('/groups/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // Last resort: assume it's just a filename and no type was provided
  // Try direct uploads folder as that's where most images seem to be
  return `${BACKEND_URL}/uploads/${imageUrl}`;
};

/**
 * Returns a base64-encoded SVG placeholder image for when an image fails to load
 */
export const getFallbackImageSrc = (width = 600, height = 400, fontSize = 18): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F0F2F5"/>
      <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#65676B" font-family="Arial" font-size="${fontSize}">Image Not Found</text>
    </svg>
  `)}`;
};

/**
 * Debug function to check all possible URL formats for a given image
 * Logs all attempts to the console to help diagnose issues
 */
export const debugImageUrl = (originalUrl: string | null | undefined): void => {
  if (!originalUrl) {
    console.log('🔍 Debug Image: URL is null or undefined');
    return;
  }
  
  console.group(`🔍 Debug Image URL: "${originalUrl}"`);
  
  // Try different formats
  const formats = [
    // Original
    { desc: 'Original', url: originalUrl },
    // With backend URL
    { desc: 'With backend URL', url: `${BACKEND_URL}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}` },
    // In /uploads/ root
    { desc: 'In uploads root', url: `${BACKEND_URL}/uploads/${originalUrl.includes('/') ? originalUrl.split('/').pop() : originalUrl}` },
    // In /uploads/posts/
    { desc: 'In posts subfolder', url: `${BACKEND_URL}/uploads/posts/${originalUrl.includes('/') ? originalUrl.split('/').pop() : originalUrl}` },
    // In /uploads/profiles/
    { desc: 'In profiles subfolder', url: `${BACKEND_URL}/uploads/profiles/${originalUrl.includes('/') ? originalUrl.split('/').pop() : originalUrl}` },
    // In /uploads/groups/
    { desc: 'In groups subfolder', url: `${BACKEND_URL}/uploads/groups/${originalUrl.includes('/') ? originalUrl.split('/').pop() : originalUrl}` }
  ];
  
  formats.forEach(format => {
    console.log(`${format.desc}: ${format.url}`);
  });
  
  console.groupEnd();
};
