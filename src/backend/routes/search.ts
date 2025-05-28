import express from 'express';
import {
  searchContent,
  getSearchSuggestions
} from '../controllers/searchController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// Search for posts and groups
// GET /api/search?q=searchTerm&type=all|posts|groups&limit=20
router.get('/', authenticateJWT, searchContent);

// Get search suggestions for autocomplete
// GET /api/search/suggestions?q=searchTerm&limit=5
router.get('/suggestions', authenticateJWT, getSearchSuggestions);

export default router;
