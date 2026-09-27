import express from 'express';

import {
  createConsultation,
  getConsultations,
  getConsultationById,
  cancelConsultation,
  addPrescription,
  getPrescription
} from './consultation.controller.js';
import {
  authenticate,
  authorize
} from '../../common/middleware/auth.js';

const router = express.Router();

/*
  POST: only patient can book.
  GET: patient sees their own; doctor sees their own; admin sees all.
  CANCEL: patient, doctor, or admin; service confirms ownership.
*/
router.post(
  '/',
  authenticate,
  authorize('PATIENT'),
  createConsultation
);

router.get(
  '/',
  authenticate,
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  getConsultations
);

router.get(
  '/:id',
  authenticate,
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  getConsultationById
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  cancelConsultation
);

router.post(
  '/:id/addPrescription',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  addPrescription
);

// Get prescription (PATIENT, DOCTOR, ADMIN)
router.get(
  '/:id/prescription',
  authenticate,
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  getPrescription
);

export default router;