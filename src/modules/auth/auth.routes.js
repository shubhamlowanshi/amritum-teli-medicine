import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  enableMFA,
  verifyMFA,
  disableMFA
} from './auth.controller.js';
import { authenticate } from '../../common/middleware/auth.js';
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// MFA routes (protected)
router.post('/mfa/enable', authenticate, enableMFA);
router.post('/mfa/verify', authenticate, verifyMFA);
router.post('/mfa/disable', authenticate, disableMFA);

export default router;