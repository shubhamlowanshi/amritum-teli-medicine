import express from 'express';
import {
  searchDoctors,
  searchDoctorsByLocation
} from './search.controller.js';
import { authenticate } from '../../common/middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/doctors', searchDoctors);
router.get('/doctors/nearby', searchDoctorsByLocation);

export default router;