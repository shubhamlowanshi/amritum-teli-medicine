import Joi from 'joi';
const objectId = Joi.string()
  .hex()
  .length(24)
  .messages({
    'string.hex': 'Invalid MongoDB ObjectId',
    'string.length': 'Invalid MongoDB ObjectId'
  });

const symptomValidation = Joi.object({
  symptom: Joi.string()
    .trim()
    .max(100)
    .required(),

  severity: Joi.string()
    .valid('MILD', 'MODERATE', 'SEVERE')
    .default('MODERATE'),

  duration: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .optional(),

  notes: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .optional()
});

export const createConsultationValidation = Joi.object({
  doctorId: objectId.required(),

  slotId: objectId.required(),

  symptoms: Joi.array()
    .items(symptomValidation)
    .max(10)
    .default([]),

  chiefComplaint: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional(),

  consultationType: Joi.string()
    .valid('IN_PERSON', 'VIDEO', 'PHONE', 'CHAT')
    .default('IN_PERSON')
});

export const consultationIdParamValidation = Joi.object({
  id: objectId.required()
});

export const cancelConsultationValidation = Joi.object({
  cancellationReason: Joi.string()
    .valid(
      'PATIENT_REQUEST',
      'DOCTOR_UNAVAILABLE',
      'EMERGENCY',
      'WEATHER',
      'TRANSPORT_ISSUE',
      'OTHER'
    )
    .required(),

  cancellationNotes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
});

export const getConsultationsQueryValidation = Joi.object({
  status: Joi.string()
    .valid('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    .optional(),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
});
export const addPrescriptionValidation = Joi.object({
  prescription: Joi.array().items(
    Joi.object({
      medicineName: Joi.string().trim().required().messages({
        'any.required': 'Medicine name is required',
        'string.base': 'Medicine name must be a string'
      }),
      dosage: Joi.string().trim().required().messages({
        'any.required': 'Dosage is required',
        'string.base': 'Dosage must be a string'
      }),
      frequency: Joi.string().trim().required().messages({
        'any.required': 'Frequency is required',
        'string.base': 'Frequency must be a string'
      }),
      duration: Joi.string().trim().required().messages({
        'any.required': 'Duration is required',
        'string.base': 'Duration must be a string'
      }),
      instructions: Joi.string().trim().max(500).optional().messages({
        'string.base': 'Instructions must be a string',
        'string.max': 'Instructions cannot exceed 500 characters'
      })
    })
  ).min(1).required().messages({
    'array.base': 'Prescription must be an array',
    'array.min': 'At least one medicine is required',
    'any.required': 'Prescription is required'
  })
});