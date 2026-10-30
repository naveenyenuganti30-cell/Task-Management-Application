import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', logout);

router.get('/me', authenticateToken, getMe);
router.patch('/profile', authenticateToken, updateProfileValidator, updateProfile);
router.patch('/change-password', authenticateToken, changePasswordValidator, changePassword);

export default router;
