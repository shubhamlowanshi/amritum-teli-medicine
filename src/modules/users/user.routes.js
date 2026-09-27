import express from 'express';

import {
  getMyProfile,
  updateMyProfile
} from './user.controller.js';

import { authenticate } from '../../common/middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);

export default router;