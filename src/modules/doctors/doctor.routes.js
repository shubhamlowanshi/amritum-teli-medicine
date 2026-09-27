import express from 'express';

import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor
} from './doctor.controller.js';

import {
  authenticate,
  authorize
} from '../../common/middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Only ADMIN can manually create a doctor profile
router.post('/', authenticate, authorize('ADMIN'), createDoctor);

// A doctor can update own profile; admin can update any doctor profile
router.patch('/:id', authenticate, authorize('DOCTOR', 'ADMIN'), updateDoctor);

export default router;