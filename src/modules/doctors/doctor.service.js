import Doctor from './doctor.model.js';
import User from '../users/user.model.js';

class DoctorService {
  async getDoctors(queryParams) {
    const {
      specialization,
      city,
      language,
      minRating,
      maxFee,
      isAvailable,
      isVerified,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = queryParams;

    const filter = {};

    // Public list: only verified and available doctors
    // filter.isVerified = true;
    // filter.isAvailable = true;

    if (specialization) {
      filter.specialization = specialization;
    }

    if (city) {
      filter['clinicAddress.city'] = new RegExp(city, 'i');
    }

    if (language) {
      filter.languages = language;
    }

    if (minRating !== undefined) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (maxFee !== undefined) {
      filter.consultationFee = { $lte: Number(maxFee) };
    }

    // Admin may later use this service with custom visibility options.
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const allowedSortFields = [
      'rating',
      'consultationFee',
      'experience',
      'createdAt',
      'totalAppointments'
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'rating';

    const sortDirection = sortOrder === 'asc' ? 1 : -1;

   const doctorsRaw = await Doctor.find(filter)
  .populate('userId', 'name email phone')
  .sort({
    [safeSortBy]: sortDirection,
    totalReviews: -1
  })
  .skip(skip)
  .limit(safeLimit);

const total = await Doctor.countDocuments(filter);

// Transform doctors to include name at top level
const doctors = doctorsRaw.map(doctor => ({
  _id: doctor._id,
  name: doctor.userId?.name,
  email: doctor.userId?.email,
  phone: doctor.userId?.phone,
  specialization: doctor.specialization,
  experience: doctor.experience,
  consultationFee: doctor.consultationFee,
  languages: doctor.languages,
  rating: doctor.rating,
  totalReviews: doctor.totalReviews,
  isVerified: doctor.isVerified,
  isAvailable: doctor.isAvailable,
  bio: doctor.bio,
  profileImage: doctor.profileImage,
  clinicAddress: doctor.clinicAddress,
  workingHours: doctor.workingHours,
  createdAt: doctor.createdAt,
  updatedAt: doctor.updatedAt
}));

return {
  doctors,
  pagination: {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit)
  }
};
  }

  async getDoctorById(doctorId) {
    const doctor = await Doctor.findById(doctorId)
      .populate('userId', 'name email phone isActive');

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.code = 'DOCTOR_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return doctor;
  }

  async createDoctor(data) {
    const user = await User.findById(data.userId);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (user.role !== 'DOCTOR') {
      const error = new Error('Selected user must have DOCTOR role');
      error.code = 'INVALID_USER_ROLE';
      error.status = 400;
      throw error;
    }

    const existingDoctor = await Doctor.findOne({
      userId: data.userId
    });

    if (existingDoctor) {
      const error = new Error('Doctor profile already exists for this user');
      error.code = 'DOCTOR_PROFILE_EXISTS';
      error.status = 409;
      throw error;
    }

    const doctor = await Doctor.create({
      ...data,
      isVerified: false,
      rating: 0,
      totalReviews: 0,
      totalAppointments: 0
    });

    return Doctor.findById(doctor._id)
      .populate('userId', 'name email phone');
  }

  async updateDoctor(doctorId, updateData, currentUser) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.code = 'DOCTOR_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const isOwnProfile = doctor.userId.toString() === currentUser.userId.toString();

    if (!isAdmin && !isOwnProfile) {
      const error = new Error('You can update only your own doctor profile');
      error.code = 'FORBIDDEN';
      error.status = 403;
      throw error;
    }

    const allowedFields = [
      'specialization',
      'qualification',
      'experience',
      'consultationFee',
      'currency',
      'languages',
      'bio',
      'profileImage',
      'clinicAddress',
      'workingHours',
      'isAvailable'
    ];

    const safeUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([field]) =>
        allowedFields.includes(field)
      )
    );

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        $set: safeUpdateData
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email phone');

    return updatedDoctor;
  }
}

export default new DoctorService();