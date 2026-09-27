import doctorService from './doctor.service.js';

import {
  createDoctorValidation,
  updateDoctorValidation,
  doctorIdParamValidation
} from './doctor.validation.js';

export const getDoctors = async (req, res, next) => {
  try {
    const result = await doctorService.getDoctors(req.query);

    res.status(200).json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { error } = doctorIdParamValidation.validate(req.params);

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const doctor = await doctorService.getDoctorById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Doctor retrieved successfully',
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const { error, value } = createDoctorValidation.validate(req.body, {
      abortEarly: true,
      stripUnknown: false
    });

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const doctor = await doctorService.createDoctor(value);

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { error: paramsError } = doctorIdParamValidation.validate(req.params);

    if (paramsError) {
      const validationError = new Error(paramsError.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const { error, value } = updateDoctorValidation.validate(req.body, {
      abortEarly: true,
      stripUnknown: false
    });

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = 'VALIDATION_ERROR';
      validationError.status = 400;
      throw validationError;
    }

    const doctor = await doctorService.updateDoctor(
      req.params.id,
      value,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};