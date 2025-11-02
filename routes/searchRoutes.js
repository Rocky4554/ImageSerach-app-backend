import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { getTopSearches, searchImages } from '../controllers/searchController.js';

const router = express.Router();

router.get('/top-searches', isAuthenticated, getTopSearches);
router.post('/search', isAuthenticated, searchImages);

export default router;
