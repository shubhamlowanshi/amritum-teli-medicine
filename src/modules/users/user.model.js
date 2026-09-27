// models/User.js
import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';


const userSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)']
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password in queries by default
  },

  // Role Management
  role: {
    type: String,
    enum: {
      values: ['PATIENT', 'DOCTOR', 'ADMIN'],
      message: 'Role must be PATIENT, DOCTOR, or ADMIN'
    },
    required: [true, 'Role is required'],
    default: 'PATIENT'
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Multi-Factor Authentication
  mfaEnabled: {
    type: Boolean,
    default: false
  },

  mfaSecret: {
    type: String,
    select: false // Keep secret hidden
  },

  mfaBackupCodes: [{
    type: String,
    select: false
  }],

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,

  // Audit Fields
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt & updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// ==================== INDEXES ====================
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });


// ==================== MIDDLEWARE ====================

// Hash password before saving (FIXED - bcryptjs uses callbacks, wrapped in Promises)
// ==================== MIDDLEWARE ====================

// Hash password before saving (FIXED for Mongoose 8+)
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await new Promise((resolve, reject) => {
    genSalt(10, (err, salt) => {
      if (err) reject(err);
      else resolve(salt);
    });
  });

  this.password = await new Promise((resolve, reject) => {
    hash(this.password, salt, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
});

// ==================== INSTANCE METHODS ====================


// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await new Promise((resolve, reject) => {
    compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });
};


// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = randomBytes(20).toString('hex');

  this.resetPasswordToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};


// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = randomBytes(20).toString('hex');

  this.emailVerificationToken = createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};


// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};


// Increment login attempts
userSchema.methods.incrementLoginAttempts = function () {
  // If lockUntil has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 1 hour
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};


// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};


// ==================== STATIC METHODS ====================


// Find user by email (excluding sensitive fields)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true
  }).select('+password +mfaSecret');
};


// Find active users by role
userSchema.statics.findActiveByRole = function (role) {
  return this.find({
    role,
    isActive: true
  });
};


// ==================== VIRTUAL FIELDS ====================


// Full contact info (computed field)
userSchema.virtual('contactInfo').get(function () {
  return {
    email: this.email,
    phone: this.phone,
    name: this.name
  };
});


// Account age in days
userSchema.virtual('accountAge').get(function () {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((Date.now() - this.createdAt) / oneDay);
});


// ==================== EXPORT MODEL ====================
const User = model('User', userSchema);


export default User;