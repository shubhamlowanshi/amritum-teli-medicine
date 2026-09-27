import AvailabilitySlot from './availability.model.js';
import Doctor from '../doctors/doctor.model.js';

class AvailabilityService {
  async createSlot(doctorId, slotData, currentUser) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.code = 'DOCTOR_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const isAdmin = currentUser.role === 'ADMIN';

    const isOwnDoctorProfile =
      doctor.userId.toString() === currentUser.userId.toString();

    if (!isAdmin && !isOwnDoctorProfile) {
      const error = new Error(
        'You can create availability only for your own doctor profile'
      );
      error.code = 'FORBIDDEN';
      error.status = 403;
      throw error;
    }

    const date = new Date(slotData.date);
    const startTime = new Date(slotData.startTime);
    const endTime = new Date(slotData.endTime);

    if (startTime >= endTime) {
      const error = new Error('End time must be after start time');
      error.code = 'INVALID_SLOT_TIME';
      error.status = 400;
      throw error;
    }

    if (startTime <= new Date()) {
      const error = new Error('Availability slots must be in the future');
      error.code = 'INVALID_SLOT_TIME';
      error.status = 400;
      throw error;
    }

    // Ensures supplied date and startTime represent same calendar day.
    const dateOnly = date.toISOString().slice(0, 10);
    const startDateOnly = startTime.toISOString().slice(0, 10);

    if (dateOnly !== startDateOnly) {
      const error = new Error('date and startTime must be on the same day');
      error.code = 'DATE_TIME_MISMATCH';
      error.status = 400;
      throw error;
    }

    const hasConflict = await AvailabilitySlot.hasTimeConflict(
      doctorId,
      date,
      startTime,
      endTime
    );

    if (hasConflict) {
      const error = new Error(
        'This slot overlaps with an existing doctor availability slot'
      );
      error.code = 'SLOT_CONFLICT';
      error.status = 409;
      throw error;
    }

    const slot = await AvailabilitySlot.create({
      doctorId,
      date,
      startTime,
      endTime,
      status: 'AVAILABLE',
      consultationId: null
    });

    return slot;
  }

  async getSlots(doctorId, queryParams = {}) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.code = 'DOCTOR_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const filter = {
      doctorId,
      isCancelled: false
    };

    // Default public listing shows only bookable slots.
    filter.status = queryParams.status || 'AVAILABLE';

    if (queryParams.date) {
      const requestedDate = new Date(queryParams.date);

      const startOfDay = new Date(requestedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(requestedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      filter.startTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    if (queryParams.startDate || queryParams.endDate) {
      filter.startTime = {};

      if (queryParams.startDate) {
        filter.startTime.$gte = new Date(queryParams.startDate);
      }

      if (queryParams.endDate) {
        const endDate = new Date(queryParams.endDate);
        endDate.setUTCHours(23, 59, 59, 999);
        filter.startTime.$lte = endDate;
      }
    }

    return AvailabilitySlot.find(filter)
      .sort({ startTime: 1 })
      .select('-consultationId -bookedBy -blockNote -cancelledBy');
  }

  async deleteSlot(slotId, currentUser) {
    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      const error = new Error('Availability slot not found');
      error.code = 'SLOT_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const doctor = await Doctor.findById(slot.doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.code = 'DOCTOR_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const isAdmin = currentUser.role === 'ADMIN';

    const isOwnDoctorProfile =
      doctor.userId.toString() === currentUser.userId.toString();

    if (!isAdmin && !isOwnDoctorProfile) {
      const error = new Error(
        'You can delete only your own availability slots'
      );
      error.code = 'FORBIDDEN';
      error.status = 403;
      throw error;
    }

    if (slot.status === 'BOOKED') {
      const error = new Error(
        'Booked availability slot cannot be deleted. Cancel consultation first.'
      );
      error.code = 'BOOKED_SLOT_CANNOT_DELETE';
      error.status = 409;
      throw error;
    }

    await slot.deleteOne();

    return {
      success: true,
      message: 'Availability slot deleted successfully'
    };
  }
}

export default new AvailabilityService();