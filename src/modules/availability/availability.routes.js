import express from 'express';

import {
  createAvailability,
  getAvailability,
  deleteAvailability
} from './availability.controller.js';

import {
  authenticate,
  authorize
} from '../../common/middleware/auth.js';

const doctorAvailabilityRouter = express.Router();
const availabilityRouter = express.Router();

// Mounted at: /api/v1/doctors
doctorAvailabilityRouter.post(
  '/:doctorId/availability',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  createAvailability
);

doctorAvailabilityRouter.get(
  '/:doctorId/availability',
  getAvailability
);

// Mounted at: /api/v1/availability
availabilityRouter.delete(
  '/:slotId',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  deleteAvailability
);

export {
  doctorAvailabilityRouter,
  availabilityRouter
};