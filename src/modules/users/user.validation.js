import Joi from 'joi';

export const updateMyProfileValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number'
    })
})
  .min(1)
  .messages({
    'object.min': 'Provide at least one field to update',
    'object.unknown': 'This field cannot be updated'
  });