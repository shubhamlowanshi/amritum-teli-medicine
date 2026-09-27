import Joi from 'joi';

const objectIdValidation = Joi.string()
  .hex()
  .length(24)
  .messages({
    'string.hex': 'Invalid MongoDB ObjectId',
    'string.length': 'Invalid MongoDB ObjectId'
  });

const qualificationValidation = Joi.object({
  degree: Joi.string()
    .trim()
    .max(150)
    .required(),

  institution: Joi.string()
    .trim()
    .max(200)
    .required(),

  yearOfCompletion: Joi.number()
    .integer()
    .min(1950)
    .max(new Date().getFullYear())
    .required()
});

const workingHoursValidation = Joi.object({
  day: Joi.string()
    .valid(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    )
    .required(),

  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'startTime must be in HH:MM format, e.g. 09:00'
    }),

  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'endTime must be in HH:MM format, e.g. 17:00'
    }),

  isWorking: Joi.boolean()
    .default(true)
});

const addressValidation = Joi.object({
  street: Joi.string().trim().max(200).optional(),
  city: Joi.string().trim().max(100).optional(),
  state: Joi.string().trim().max(100).optional(),
  pincode: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Pincode must contain 6 digits'
    }),
  country: Joi.string().trim().max(100).default('India').optional(),

  coordinates: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .messages({
        'array.length': 'Coordinates must be [longitude, latitude]'
      })
  }).optional()
});

const specializationList = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Gynecologist',
  'Neurologist',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist',
  'Dentist',
  'Surgeon',
  'Physiotherapist',
  'Homeopath',
  'Ayurvedic',
  'Other'
];

const languageList = [
  'Hindi',
  'English',
  'Marathi',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Bengali',
  'Other'
];

export const createDoctorValidation = Joi.object({
  userId: objectIdValidation.required(),

  specialization: Joi.string()
    .valid(...specializationList)
    .required(),

  qualification: Joi.array()
    .items(qualificationValidation)
    .default([]),

  experience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .default(0),

  consultationFee: Joi.number()
    .min(0)
    .default(0),

  currency: Joi.string()
    .valid('INR', 'USD', 'EUR', 'GBP')
    .default('INR'),

  languages: Joi.array()
    .items(Joi.string().valid(...languageList))
    .default([]),

  bio: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional(),

  profileImage: Joi.string()
    .uri()
    .allow(null, '')
    .optional(),

  clinicAddress: addressValidation.optional(),

  workingHours: Joi.array()
    .items(workingHoursValidation)
    .max(7)
    .default([]),

  isAvailable: Joi.boolean().default(false)
});

export const updateDoctorValidation = Joi.object({
  specialization: Joi.string()
    .valid(...specializationList)
    .optional(),

  qualification: Joi.array()
    .items(qualificationValidation)
    .optional(),

  experience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .optional(),

  consultationFee: Joi.number()
    .min(0)
    .optional(),

  currency: Joi.string()
    .valid('INR', 'USD', 'EUR', 'GBP')
    .optional(),

  languages: Joi.array()
    .items(Joi.string().valid(...languageList))
    .optional(),

  bio: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional(),

  profileImage: Joi.string()
    .uri()
    .allow(null, '')
    .optional(),

  clinicAddress: addressValidation.optional(),

  workingHours: Joi.array()
    .items(workingHoursValidation)
    .max(7)
    .optional(),

  isAvailable: Joi.boolean().optional()
})
  .min(1)
  .messages({
    'object.min': 'Provide at least one field to update',
    'object.unknown': 'This field cannot be updated'
  });

export const doctorIdParamValidation = Joi.object({
  id: objectIdValidation.required()
});