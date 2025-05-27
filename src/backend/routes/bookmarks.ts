import express from 'express';
import {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmarkStatus
} from '../controllers/bookmarkController';

const router = express.Router();

// Add a bookmark
router.post('/', addBookmark);

// Remove a bookmark
router.delete('/', removeBookmark);

// Get user's bookmarks
router.get('/user/:userId', getUserBookmarks);

// Check bookmark status
router.get('/status', checkBookmarkStatus);

export default router;
