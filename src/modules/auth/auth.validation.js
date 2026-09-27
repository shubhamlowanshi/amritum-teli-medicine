import Joi from 'joi';

export const registerValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number',
      'any.required': 'Phone number is required'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number and special character',
      'any.required': 'Password is required'
    }),

  role: Joi.string()
    .valid('PATIENT', 'DOCTOR')
    .default('PATIENT')
    .messages({
      'any.only': 'Role must be either PATIENT or DOCTOR'
    })
});

export const loginValidation = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),

  mfaCode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'MFA code must be exactly 6 digits'
    })
});

export const refreshTokenValidation = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
});

export const logoutValidation = Joi.object({
  refreshToken: Joi.string().optional()
});

export default {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  logoutValidation
};