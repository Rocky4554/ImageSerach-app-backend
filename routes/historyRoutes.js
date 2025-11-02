import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { getHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/history', isAuthenticated, getHistory);

export default router;
