import Consultation from './consultation.model.js';
import Doctor from '../doctors/doctor.model.js';
import AvailabilitySlot from '../availability/availability.model.js';

class ConsultationService {
  async createConsultation(patientId, data) {
    const { doctorId, slotId, symptoms, chiefComplaint, consultationType } = data;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.code = 'DOCTOR_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (!doctor.isVerified || !doctor.isAvailable) {
      const error = new Error('Doctor is currently unavailable for consultation');
      error.code = 'DOCTOR_UNAVAILABLE';
      error.status = 409;
      throw error;
    }

    /*
      Atomic update:
      Slot must match doctor and be AVAILABLE.
      If another patient booked it first, this returns null.
    */
    const slot = await AvailabilitySlot.findOneAndUpdate(
      {
        _id: slotId,
        doctorId,
        status: 'AVAILABLE',
        isCancelled: false,
        startTime: { $gt: new Date() }
      },
      {
        $set: {
          status: 'BOOKED',
          bookedAt: new Date(),
          bookedBy: patientId,
          checkInStatus: 'PENDING'
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!slot) {
      const error = new Error(
        'Slot is unavailable, already booked, invalid, or in the past'
      );
      error.code = 'SLOT_UNAVAILABLE';
      error.status = 409;
      throw error;
    }

    try {
      const consultation = await Consultation.create({
        patientId,
        doctorId,
        slotId: slot._id,
        status: 'SCHEDULED',
        symptoms: symptoms || [],
        chiefComplaint: chiefComplaint || '',
        consultationType: consultationType || 'IN_PERSON',
        scheduledAt: slot.startTime
      });

      slot.consultationId = consultation._id;
      await slot.save();

      return Consultation.findById(consultation._id).populate([
        {
          path: 'doctorId',
          select: 'userId specialization consultationFee',
          populate: {
            path: 'userId',
            select: 'name email phone'
          }
        },
        {
          path: 'slotId',
          select: 'date startTime endTime status'
        }
      ]);
    } catch (err) {
      // If consultation creation fails, release the reserved slot.
      await AvailabilitySlot.findByIdAndUpdate(slot._id, {
        $set: {
          status: 'AVAILABLE',
          bookedAt: null,
          bookedBy: null,
          consultationId: null
        }
      });

      throw err;
    }
  }

  async getConsultations(currentUser, queryParams) {
    const { status, page = 1, limit = 10 } = queryParams;

    const filter = {};

    if (currentUser.role === 'PATIENT') {
      filter.patientId = currentUser.userId;
    } else if (currentUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: currentUser.userId });

      if (!doctor) {
        const error = new Error('Doctor profile not found');
        error.code = 'DOCTOR_PROFILE_NOT_FOUND';
        error.status = 404;
        throw error;
      }

      filter.doctorId = doctor._id;
    }

    // ADMIN sees all consultations.
    if (status) {
      filter.status = status;
    }

    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate([
          {
            path: 'patientId',
            select: 'name email phone'
          },
          {
            path: 'doctorId',
            select: 'userId specialization consultationFee',
            populate: {
              path: 'userId',
              select: 'name email phone'
            }
          },
          {
            path: 'slotId',
            select: 'date startTime endTime status'
          }
        ]),

      Consultation.countDocuments(filter)
    ]);

    return {
      consultations,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    };
  }

  async getConsultationById(consultationId, currentUser) {
    const consultation = await Consultation.findById(consultationId)
      .populate([
        {
          path: 'patientId',
          select: 'name email phone'
        },
        {
          path: 'doctorId',
          select: 'userId specialization qualification experience consultationFee',
          populate: {
            path: 'userId',
            select: 'name email phone'
          }
        },
        {
          path: 'slotId',
          select: 'date startTime endTime status'
        }
      ]);

    if (!consultation) {
      const error = new Error('Consultation not found');
      error.code = 'CONSULTATION_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const isAdmin = currentUser.role === 'ADMIN';

    const isPatient =
      consultation.patientId._id.toString() ===
      currentUser.userId.toString();

    let isDoctor = false;

    if (currentUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({
        userId: currentUser.userId
      });

      isDoctor =
        doctor &&
        doctor._id.toString() === consultation.doctorId._id.toString();
    }

    if (!isAdmin && !isPatient && !isDoctor) {
      const error = new Error(
        'You do not have permission to access this consultation'
      );
      error.code = 'FORBIDDEN';
      error.status = 403;
      throw error;
    }

    return consultation;
  }

  async cancelConsultation(consultationId, cancellationData, currentUser) {
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      const error = new Error('Consultation not found');
      error.code = 'CONSULTATION_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (!['SCHEDULED', 'ONGOING'].includes(consultation.status)) {
      const error = new Error(
        'Only SCHEDULED or ONGOING consultations can be cancelled'
      );
      error.code = 'CANNOT_CANCEL_CONSULTATION';
      error.status = 409;
      throw error;
    }

    const isAdmin = currentUser.role === 'ADMIN';

    const isPatient =
      consultation.patientId.toString() === currentUser.userId.toString();

    let isDoctor = false;

    if (currentUser.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({
        userId: currentUser.userId
      });

      isDoctor =
        doctor &&
        doctor._id.toString() === consultation.doctorId.toString();
    }

    if (!isAdmin && !isPatient && !isDoctor) {
      const error = new Error(
        'You do not have permission to cancel this consultation'
      );
      error.code = 'FORBIDDEN';
      error.status = 403;
      throw error;
    }

    const now = new Date();

    consultation.status = 'CANCELLED';
    consultation.cancelledAt = now;
    consultation.cancelledBy = currentUser.userId;
    consultation.cancellationReason = cancellationData.cancellationReason;
    consultation.cancellationNotes =
      cancellationData.cancellationNotes || '';

    await consultation.save();

    // Release slot only if it still belongs to this consultation.
    await AvailabilitySlot.findOneAndUpdate(
      {
        _id: consultation.slotId,
        consultationId: consultation._id,
        status: 'BOOKED'
      },
      {
        $set: {
          status: 'AVAILABLE',
          isCancelled: false,
          consultationId: null,
          bookedAt: null,
          bookedBy: null,
          checkInStatus: 'PENDING'
        }
      }
    );

    return consultation;
  }

  async addPrescription(consultationId, userId, userRole, prescriptionData) {
  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    const error = new Error('Consultation not found');
    error.code = 'CONSULTATION_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  // Only doctor can add prescription
  const isDoctor = consultation.doctorId.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isDoctor && !isAdmin) {
    const error = new Error('Only doctor can add prescription');
    error.code = 'UNAUTHORIZED';
    error.status = 403;
    throw error;
  }

  // Consultation must be completed or in progress
  if (!['IN_PROGRESS', 'COMPLETED'].includes(consultation.status)) {
    const error = new Error('Can only add prescription for completed consultations');
    error.code = 'INVALID_STATUS';
    error.status = 400;
    throw error;
  }

  // Add prescription
  consultation.prescription = prescriptionData;
  await consultation.save();

  return await Consultation.findById(consultation._id)
    .populate('doctorId', 'name email phone specialization')
    .populate('patientId', 'name email phone');
}

async getPrescription(consultationId, userId, userRole) {
  const consultation = await Consultation.findById(consultationId)
    .populate('doctorId', 'name email phone specialization')
    .populate('patientId', 'name email phone');

  if (!consultation) {
    const error = new Error('Consultation not found');
    error.code = 'CONSULTATION_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  // Check authorization
  const isPatient = consultation.patientId._id.toString() === userId.toString();
  const isDoctor = consultation.doctorId._id.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isPatient && !isDoctor && !isAdmin) {
    const error = new Error('Unauthorized to view this prescription');
    error.code = 'UNAUTHORIZED';
    error.status = 403;
    throw error;
  }

  return {
    consultationId: consultation._id,
    patient: consultation.patientId,
    doctor: consultation.doctorId,
    prescription: consultation.prescription,
    doctorNotes: consultation.doctorNotes,
    diagnosis: consultation.diagnosis,
    completedAt: consultation.completedAt
  };
}
}

export default new ConsultationService();