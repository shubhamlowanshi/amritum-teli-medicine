import userService from './user.service.js';
import { updateMyProfileValidation } from './user.validation.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    const user = await userService.getMyProfile(userId);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    const { error, value } = updateMyProfileValidation.validate(req.body, {
      abortEarly: true,
      stripUnknown: false
    });

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const user = await userService.updateMyProfile(userId, value);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};