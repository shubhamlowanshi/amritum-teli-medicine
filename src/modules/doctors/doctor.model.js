// models/Doctor.js
import { Schema, model } from 'mongoose';


const doctorSchema = new Schema({
  // Reference to Users collection (one-to-one relationship)
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // Each user can have only one doctor profile
  },
  
  // Professional Information
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    enum: {
      values: [
        'General Physician',
        'Cardiologist',
        'Dermatologist',
        'Pediatrician',
        'Orthopedic',
        'Gynecologist',
        'Neurologist',
        'Psychiatrist',
        'ENT Specialist',
        'Ophthalmologist',
        'Dentist',
        'Surgeon',
        'Physiotherapist',
        'Homeopath',
        'Ayurvedic',
        'Other'
      ],
      message: 'Please select a valid specialization'
    }
  },
  
  qualification: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    yearOfCompletion: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear()
    },
    _id: false // Disable automatic _id for subdocuments
  }],
  
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [60, 'Experience cannot exceed 60 years'],
    default: 0 // Years of experience
  },
  
  // Consultation Details
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative'],
    default: 0
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  
  // Languages Spoken
  languages: [{
    type: String,
    trim: true,
    enum: ['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi', 'Bengali', 'Other']
  }],
  
  // Rating & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: v => Math.round(v * 10) / 10 // Round to 1 decimal place
  },
  
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalAppointments: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedAt: Date,
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Admin who verified
  },
  
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: ['Medical License', 'Degree Certificate', 'ID Proof', 'Experience Letter']
    },
    documentUrl: String,
    isApproved: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Availability Status
  isAvailable: {
    type: Boolean,
    default: true // Show/hide from search
  },
  
  // Additional Profile Information
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  
  profileImage: {
    type: String, // URL to image storage
    default: null
  },
  
  clinicAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      // For geospatial queries
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  
  // Working Hours
  workingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String, // Format: "09:00"
    endTime: String,   // Format: "17:00"
    isWorking: {
      type: Boolean,
      default: true
    }
  }],
  
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// ==================== INDEXES ====================
// Basic indexes
doctorSchema.index({ userId: 1 }, { unique: true });
doctorSchema.index({ specialization: 1, isAvailable: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ isVerified: 1, isAvailable: 1 });
doctorSchema.index({ 'clinicAddress.city': 1, specialization: 1 });


// Compound index for common search queries
doctorSchema.index({ 
  specialization: 1, 
  isAvailable: 1, 
  rating: -1,
  consultationFee: 1 
});


// Geospatial index for location-based search
doctorSchema.index({ 'clinicAddress.coordinates': '2dsphere' });


// Text index for search functionality
doctorSchema.index({ 
  specialization: 'text',
  bio: 'text',
  'qualification.degree': 'text'
});


// ==================== MIDDLEWARE ====================
// No middleware needed - timestamps: true handles createdAt/updatedAt automatically


// ==================== INSTANCE METHODS ====================


// Update rating after new review
doctorSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating * this.totalReviews + newRating;
  this.totalReviews += 1;
  this.rating = Math.round((totalRating / this.totalReviews) * 10) / 10;
  return this.save();
};


// Increment appointment count
doctorSchema.methods.incrementAppointments = function() {
  this.totalAppointments += 1;
  return this.save();
};


// Verify doctor profile
doctorSchema.methods.verify = function(adminUserId) {
  this.isVerified = true;
  this.verifiedAt = Date.now();
  this.verifiedBy = adminUserId;
  return this.save();
};


// Toggle availability
doctorSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};


// Add verification document
doctorSchema.methods.addVerificationDocument = function(docType, docUrl) {
  this.verificationDocuments.push({
    documentType: docType,
    documentUrl: docUrl,
    isApproved: false,
    uploadedAt: Date.now()
  });
  return this.save();
};


// ==================== STATIC METHODS ====================


// Find available doctors by specialization
doctorSchema.statics.findAvailableBySpecialization = function(specialization, city) {
  const query = {
    specialization,
    isAvailable: true
  };
  
  if (city) {
    query['clinicAddress.city'] = new RegExp(city, 'i');
  }
  
  return this.find(query)
    .sort({ rating: -1, totalAppointments: -1 })
    .populate('userId', 'name email phone');
};


// Find top-rated doctors
doctorSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 
    isAvailable: true, 
    isVerified: true,
    rating: { $gte: 4.0 }
  })
  .sort({ rating: -1, totalReviews: -1 })
  .limit(limit)
  .populate('userId', 'name email');
};


// Search doctors by text
doctorSchema.statics.searchDoctors = function(searchTerm) {
  return this.find({ 
    $text: { $search: searchTerm },
    isAvailable: true
  })
  .sort({ score: { $meta: 'textScore' } })
  .populate('userId', 'name email phone');
};


// Find doctors by location (geospatial query)
doctorSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    'clinicAddress.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isAvailable: true
  })
  .populate('userId', 'name email phone');
};


// Get doctors with filters
doctorSchema.statics.filterDoctors = function(filters) {
  const query = { isAvailable: true };
  
  if (filters.specialization) {
    query.specialization = filters.specialization;
  }
  
  if (filters.minRating) {
    query.rating = { $gte: filters.minRating };
  }
  
  if (filters.maxFee) {
    query.consultationFee = { $lte: filters.maxFee };
  }
  
  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified;
  }
  
  if (filters.city) {
    query['clinicAddress.city'] = new RegExp(filters.city, 'i');
  }
  
  if (filters.languages) {
    query.languages = { $in: filters.languages };
  }
  
  return this.find(query)
    .sort({ rating: -1 })
    .populate('userId', 'name email phone');
};


// ==================== VIRTUAL FIELDS ====================


// Full doctor name (from userId)
doctorSchema.virtual('doctorName').get(function() {
  if (this.userId && this.userId.name) {
    return this.userId.name;
  }
  return null;
});


// Doctor email (from userId)
doctorSchema.virtual('doctorEmail').get(function() {
  if (this.userId && this.userId.email) {
    return this.userId.email;
  }
  return null;
});


// Experience level categorization
doctorSchema.virtual('experienceLevel').get(function() {
  if (this.experience < 3) return 'Junior';
  if (this.experience < 10) return 'Mid-Level';
  if (this.experience < 20) return 'Senior';
  return 'Expert';
});


// Fee category
doctorSchema.virtual('feeCategory').get(function() {
  if (this.consultationFee < 500) return 'Affordable';
  if (this.consultationFee < 1000) return 'Moderate';
  if (this.consultationFee < 2000) return 'Premium';
  return 'Luxury';
});


// ==================== EXPORT MODEL ====================
const Doctor = model('Doctor', doctorSchema);


export default Doctor;