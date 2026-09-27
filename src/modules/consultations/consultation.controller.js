import consultationService from './consultation.service.js';

import {
  createConsultationValidation,
  consultationIdParamValidation,
  cancelConsultationValidation,
  getConsultationsQueryValidation,
  addPrescriptionValidation
} from './consultation.validation.js';


/**
 * @swagger
 * /api/v1/consultations:
 *   post:
 *     summary: Create a new consultation
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - type
 *               - scheduledAt
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: 6aab7dd6f0932c42ed011557
 *               doctorId:
 *                 type: string
 *                 example: 6aab81339f781f854da8c7bc
 *               type:
 *                 type: string
 *                 enum: [VIDEO, AUDIO, CHAT]
 *                 example: VIDEO
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-22T10:00:00.000Z
 *               duration:
 *                 type: number
 *                 example: 30
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [fever, headache, cold]
 *     responses:
 *       201:
 *         description: Consultation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Consultation created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     consultation:
 *                       $ref: '#/components/schemas/Consultation'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Doctor not available
 */

export const createConsultation = async (req, res, next) => {
  try {
    const { error, value } = createConsultationValidation.validate(req.body);

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const consultation = await consultationService.createConsultation(
      req.user.userId,
      value
    );

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      data: { consultation }
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @swagger
 * /api/v1/consultations:
 *   get:
 *     summary: Get all consultations (filtered by user role)
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Consultations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Consultations retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     consultations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Consultation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */

export const getConsultations = async (req, res, next) => {
  try {
    const { error, value } = getConsultationsQueryValidation.validate(req.query);

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const result = await consultationService.getConsultations(
      req.user,
      value
    );

    res.status(200).json({
      success: true,
      message: 'Consultations retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req, res, next) => {
  try {
    const { error, value } =
      consultationIdParamValidation.validate(req.params);

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const consultation = await consultationService.getConsultationById(
      value.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Consultation retrieved successfully',
      data: { consultation }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelConsultation = async (req, res, next) => {
  try {
    const { error: paramsError, value: params } =
      consultationIdParamValidation.validate(req.params);

    if (paramsError) {
      const validationError = new Error(paramsError.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const { error: bodyError, value: body } =
      cancelConsultationValidation.validate(req.body);

    if (bodyError) {
      const validationError = new Error(bodyError.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const consultation = await consultationService.cancelConsultation(
      params.id,
      body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Consultation cancelled successfully',
      data: { consultation }
    });
  } catch (error) {
    next(error);
  }
};

export const addPrescription = async (req, res, next) => {
  try {
    const { error: paramsError, value: params } =
      consultationIdParamValidation.validate(req.params);

    if (paramsError) {
      const validationError = new Error(paramsError.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const { error: bodyError, value: body } =
      addPrescriptionValidation.validate(req.body);

    if (bodyError) {
      const validationError = new Error(bodyError.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const consultation = await consultationService.addPrescription(
      params.id,
      req.user,
      body.prescription
    );

    res.status(200).json({
      success: true,
      message: 'Prescription added successfully',
      data: { consultation }
    });
  } catch (error) {
    next(error);
  }
};


export const getPrescription = async (req, res, next) => {
  try {
    const { error, value } =
      consultationIdParamValidation.validate(req.params);

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const prescription = await consultationService.getPrescription(
      value.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      data: { prescription }
    });
  } catch (error) {
    next(error);
  }
};