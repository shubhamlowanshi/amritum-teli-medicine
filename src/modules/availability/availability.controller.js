import availabilityService from './availability.service.js';

import {
  doctorIdParamValidation,
  slotIdParamValidation,
  createAvailabilityValidation,
  getAvailabilityQueryValidation
} from './availability.validation.js';

export const createAvailability = async (req, res, next) => {
  try {
    const { error: paramsError, value: params } =
      doctorIdParamValidation.validate(req.params);

    if (paramsError) {
      const error = new Error(paramsError.details[0].message);
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const { error: bodyError, value: body } =
      createAvailabilityValidation.validate(req.body);

    if (bodyError) {
      const error = new Error(bodyError.details[0].message);
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const slot = await availabilityService.createSlot(
      params.doctorId,
      body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Availability slot created successfully',
      data: { slot }
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const { error: paramsError, value: params } =
      doctorIdParamValidation.validate(req.params);

    if (paramsError) {
      const error = new Error(paramsError.details[0].message);
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const { error: queryError, value: query } =
      getAvailabilityQueryValidation.validate(req.query);

    if (queryError) {
      const error = new Error(queryError.details[0].message);
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const slots = await availabilityService.getSlots(
      params.doctorId,
      query
    );

    res.status(200).json({
      success: true,
      message: 'Availability retrieved successfully',
      data: { slots }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvailability = async (req, res, next) => {
  try {
    const { error: paramsError, value: params } =
      slotIdParamValidation.validate(req.params);

    if (paramsError) {
      const error = new Error(paramsError.details[0].message);
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const result = await availabilityService.deleteSlot(
      params.slotId,
      req.user
    );

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};