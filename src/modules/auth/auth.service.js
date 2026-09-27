import User from '../users/user.model.js';
import Doctor from '../doctors/doctor.model.js';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { compare } from 'bcryptjs';


class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId: userId.toString() },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );


    const refreshToken = jwt.sign(
      { userId: userId.toString() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );


    return { accessToken, refreshToken };
  }


  verifyToken(token, type = 'access') {
    const secret =
      type === 'access'
        ? process.env.JWT_ACCESS_SECRET
        : process.env.JWT_REFRESH_SECRET;


    return jwt.verify(token, secret);
  }


  async register(userData) {
    const {
      name,
      email,
      phone,
      password,
      role = 'PATIENT'
    } = userData;


    const normalizedEmail = email.toLowerCase().trim();


    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone }
      ]
    });


    if (existingUser) {
      const error = new Error('Email or phone number is already registered');
      error.code = 'USER_EXISTS';
      error.status = 409;
      throw error;
    }


    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      role
    });


    // Create doctor profile if role is DOCTOR
  if (role === 'DOCTOR') {
  try {
    console.log('=== CREATING DOCTOR ===');
    console.log('User ID:', user._id);
    console.log('Doctor model:', Doctor);
    console.log('Doctor.create exists:', typeof Doctor.create);
    
   const doctor = await Doctor.create({
  userId: user._id,
  specialization: 'General Physician',
  qualification: [{
    degree: 'MBBS',
    institution: 'Medical College',
    yearOfCompletion: Number(new Date().getFullYear())
  }],
  experience: 0,
  consultationFee: 500,
  currency: 'INR',
  languages: ['English', 'Hindi'],
  rating: 0,
  totalReviews: 0,
  isVerified: false,
  isAvailable: true,
  bio: 'General Physician',
  clinicAddress: {
    street: 'Main Road',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462001',
    country: 'India',
    coordinates: {
      type: 'Point',
      coordinates: [77.4126, 23.2599] // [longitude, latitude] - Bhopal coordinates
    }
  },
  workingHours: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isWorking: true },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isWorking: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isWorking: true },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isWorking: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isWorking: true },
    { day: 'Saturday', startTime: '09:00', endTime: '13:00', isWorking: true },
    { day: 'Sunday', startTime: '09:00', endTime: '17:00', isWorking: false }
  ]
});
    
    console.log('✅ Doctor created successfully!');
    console.log('Doctor ID:', doctor._id);
    console.log('Doctor userId:', doctor.userId);
    console.log('========================');
  } catch (error) {
    console.error('❌ Error creating doctor profile:');
    console.error('Message:', error.message);
    console.error('Errors:', error.errors);
    console.error('Full error:', error);
    throw new Error(`User created but doctor profile creation failed: ${error.message}`);
  }
}


    const { accessToken, refreshToken } = this.generateTokens(user._id);


    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }


  async login({ email, password, mfaCode }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true
    }).select('+password +mfaSecret');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    // DEBUG LOGS - Add these
    console.log('User found:', user._id);
    console.log('Password hash exists:', !!user.password);
    console.log('Password hash:', user.password?.substring(0, 20) + '...');

     const isMatch = await new Promise((resolve, reject) => {
    compare(password, user.password, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

    console.log('Password match:', isMatch);

    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }


    if (user.mfaEnabled) {
      if (!mfaCode) {
        const error = new Error('MFA code is required');
        error.code = 'MFA_REQUIRED';
        error.status = 401;
        throw error;
      }


      const isMfaValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 1
      });


      if (!isMfaValid) {
        const error = new Error('Invalid MFA code');
        error.code = 'INVALID_MFA';
        error.status = 401;
        throw error;
      }
    }


    user.lastLogin = new Date();
    await user.save();


    const { accessToken, refreshToken } = this.generateTokens(user._id);


    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      },
      accessToken,
      refreshToken
    };
  }


  async refreshTokens(refreshToken) {
    let decoded;


    try {
      decoded = this.verifyToken(refreshToken, 'refresh');
    } catch (error) {
      const err = new Error('Invalid or expired refresh token');
      err.code = 'INVALID_REFRESH_TOKEN';
      err.status = 401;
      throw err;
    }


    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true
    });


    if (!user) {
      const error = new Error('User not found or inactive');
      error.code = 'USER_NOT_FOUND';
      error.status = 401;
      throw error;
    }


    return this.generateTokens(user._id);
  }


  async logout() {
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }


  async getCurrentUser(userId) {
    const user = await User.findOne({
      _id: userId,
      isActive: true
    }).select('-password -mfaSecret');


    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }


    let doctorProfile = null;


    if (user.role === 'DOCTOR') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }


    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      doctorProfile
    };
  }


  async enableMFA(userId) {
    const user = await User.findById(userId).select('+mfaSecret');


    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }


    const secret = speakeasy.generateSecret({
      name: `${process.env.MFA_ISSUER_NAME || 'Amrutam Telemedicine'} (${user.email})`,
      length: 20
    });


    user.mfaSecret = secret.base32;
    user.mfaEnabled = false;
    await user.save();


    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }


  async verifyMFA(userId, token) {
    const user = await User.findById(userId).select('+mfaSecret');


    if (!user || !user.mfaSecret) {
      const error = new Error('MFA setup was not initiated');
      error.code = 'MFA_SETUP_NOT_FOUND';
      error.status = 400;
      throw error;
    }


    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });


    if (!verified) {
      const error = new Error('Invalid MFA code');
      error.code = 'INVALID_MFA';
      error.status = 400;
      throw error;
    }


    user.mfaEnabled = true;
    await user.save();


    return {
      success: true,
      message: 'MFA enabled successfully'
    };
  }


  async disableMFA(userId, token) {
    const user = await User.findById(userId).select('+mfaSecret');


    if (!user || !user.mfaEnabled) {
      const error = new Error('MFA is not enabled');
      error.code = 'MFA_NOT_ENABLED';
      error.status = 400;
      throw error;
    }


    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });


    if (!verified) {
      const error = new Error('Invalid MFA code');
      error.code = 'INVALID_MFA';
      error.status = 401;
      throw error;
    }


    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();


    return {
      success: true,
      message: 'MFA disabled successfully'
    };
  }
}


export default new AuthService();