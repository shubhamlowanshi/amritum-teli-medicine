import User from './user.model.js';

class UserService {
  async getMyProfile(userId) {
    const user = await User.findOne({
      _id: userId,
      isActive: true
    }).select('-password -mfaSecret -mfaBackupCodes');

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return user;
  }

  async updateMyProfile(userId, updateData) {
    const allowedFields = ['name', 'phone'];

    const safeUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) =>
        allowedFields.includes(key)
      )
    );

    if (Object.keys(safeUpdateData).length === 0) {
      const error = new Error('No valid fields provided for update');
      error.code = 'INVALID_UPDATE_FIELDS';
      error.status = 400;
      throw error;
    }

    if (safeUpdateData.name) {
      safeUpdateData.name = safeUpdateData.name.trim();
    }

    if (safeUpdateData.phone) {
      safeUpdateData.phone = safeUpdateData.phone.trim();

      const phoneOwner = await User.findOne({
        phone: safeUpdateData.phone,
        _id: { $ne: userId }
      });

      if (phoneOwner) {
        const error = new Error('This phone number is already in use');
        error.code = 'PHONE_ALREADY_EXISTS';
        error.status = 409;
        throw error;
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        isActive: true
      },
      {
        $set: safeUpdateData
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password -mfaSecret -mfaBackupCodes');

    if (!updatedUser) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return updatedUser;
  }
}

export default new UserService();