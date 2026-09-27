import Joi from 'joi';

const objectId = Joi.string()
  .hex()
  .length(24)
  .messages({
    'string.hex': 'Invalid MongoDB ObjectId',
    'string.length': 'Invalid MongoDB ObjectId'
  });

export const doctorIdParamValidation = Joi.object({
  doctorId: objectId.required()
});

export const slotIdParamValidation = Joi.object({
  slotId: objectId.required()
});

/*
  `date` is separate because your model requires it.
  Use date at midnight in ISO format:
  2026-09-18T00:00:00.000Z
*/
export const createAvailabilityValidation = Joi.object({
  date: Joi.date()
    .iso()
    .required()
    .messages({
      'any.required': 'date is required',
      'date.format': 'date must be ISO format'
    }),

  startTime: Joi.date()
    .iso()
    .required()
    .messages({
      'any.required': 'startTime is required',
      'date.format': 'startTime must be ISO format'
    }),

  endTime: Joi.date()
    .iso()
    .greater(Joi.ref('startTime'))
    .required()
    .messages({
      'any.required': 'endTime is required',
      'date.greater': 'endTime must be after startTime',
      'date.format': 'endTime must be ISO format'
    })
});

export const getAvailabilityQueryValidation = Joi.object({
  date: Joi.date().iso().optional(),

  startDate: Joi.date().iso().optional(),

  endDate: Joi.date().iso().optional(),

  status: Joi.string()
    .valid('AVAILABLE', 'BOOKED', 'BLOCKED')
    .optional()
});