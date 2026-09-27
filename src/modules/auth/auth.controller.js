import authService from './auth.service.js';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  logoutValidation
} from './auth.validation.js';

// Temporary: AuditLog abhi add nahi kiya hai.
// Audit model setup hone ke baad isko import/use kar lena.

const getClientIP = (req) => {
  return (
    req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  );
}; 
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 example: Secure@123
 *               role:
 *                 type: string
 *                 enum: [PATIENT, DOCTOR, ADMIN]
 *                 example: PATIENT
 *     responses:
 *       201:
 *         description: Registration successful
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
 *                   example: Registration successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

export const register = async (req, res, next) => {
  try {
    const { error, value } = registerValidation.validate(req.body);

    if (error) {
      const err = new Error(error.details[0].message);
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    const result = await authService.register(value);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error, value } = loginValidation.validate(req.body);

    if (error) {
      const err = new Error(error.details[0].message);
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    const result = await authService.login(value);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { error, value } = refreshTokenValidation.validate(req.body);

    if (error) {
      const err = new Error(error.details[0].message);
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    const result = await authService.refreshTokens(value.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    const { error, value } = logoutValidation.validate(req.body);

    if (error) {
      const err = new Error(error.details[0].message);
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    const result = await authService.logout(userId, value.refreshToken);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const enableMFA = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    const result = await authService.enableMFA(userId);

    res.status(200).json({
      success: true,
      message: 'MFA setup initiated. Verify the generated code.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMFA = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { token } = req.body;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    if (!token) {
      const error = new Error('MFA token is required');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const result = await authService.verifyMFA(userId, token);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const disableMFA = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { token } = req.body;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    if (!token) {
      const error = new Error('MFA token is required');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const result = await authService.disableMFA(userId, token);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};