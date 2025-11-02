import express from 'express';
import {
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  githubAuth,
  githubCallback,
  logoutUser,
  getUser,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

router.post('/logout', logoutUser);
router.get('/user', getUser);

export default router;
