// models/Consultation.js
import { Schema, model } from 'mongoose';

const consultationSchema = new Schema({
  // Patient Reference
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // User with role: PATIENT
    required: [true, 'Patient ID is required'],
    index: true
  },
  
  // Doctor Reference
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  
  // Time Slot Reference
  slotId: {
    type: Schema.Types.ObjectId,
    ref: 'AvailabilitySlot',
    required: [true, 'Slot ID is required'],
    unique: true, // One consultation per slot
    index: true
  },
  
  // Consultation Status
  status: {
    type: String,
    enum: {
      values: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      message: 'Invalid consultation status'
    },
    required: [true, 'Status is required'],
    default: 'SCHEDULED',
    index: true
  },
  
  // Patient Symptoms (before consultation)
  symptoms: [{
    symptom: {
      type: String,
      trim: true,
      maxlength: [100, 'Symptom name cannot exceed 100 characters']
    },
    severity: {
      type: String,
      enum: ['MILD', 'MODERATE', 'SEVERE'],
      default: 'MODERATE'
    },
    duration: {
      type: String, // e.g., "2 days", "1 week"
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  
  // Chief Complaint
  chiefComplaint: {
    type: String,
    maxlength: [500, 'Chief complaint cannot exceed 500 characters'],
    trim: true
  },
  
  // Doctor's Notes (during/after consultation)
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  
  // Clinical Notes (structured)
  clinicalNotes: {
    // Subjective (patient's description)
    subjective: {
      type: String,
      maxlength: [1000, 'Subjective notes cannot exceed 1000 characters']
    },
    
    // Objective (doctor's observations)
    objective: {
      type: String,
      maxlength: [1000, 'Objective notes cannot exceed 1000 characters']
    },
    
    // Assessment (diagnosis)
    assessment: {
      type: String,
      maxlength: [1000, 'Assessment cannot exceed 1000 characters']
    },
    
    // Plan (treatment plan)
    plan: {
      type: String,
      maxlength: [1000, 'Plan cannot exceed 1000 characters']
    }
  },
  
  // Diagnosis
  diagnosis: [{
    condition: {
      type: String,
      trim: true
    },
    icdCode: {
      type: String, // ICD-10 code
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Vitals (optional)
  vitals: {
    temperature: {
      type: Number, // in Celsius
      min: 35,
      max: 42
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: {
      type: Number,
      min: 30,
      max: 200
    },
    respiratoryRate: {
      type: Number,
      min: 8,
      max: 60
    },
    oxygenSaturation: {
      type: Number,
      min: 70,
      max: 100
    },
    weight: {
      type: Number, // in kg
      min: 1,
      max: 300
    },
    height: {
      type: Number, // in cm
      min: 30,
      max: 250
    },
    bmi: {
      type: Number,
      min: 10,
      max: 60
    }
  },
  
  // Prescription Reference
  prescriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Prescription',
    default: null
  },
  
  // Lab Tests Reference
  labTests: [{
    type: Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  
  // Timeline Fields
  scheduledAt: Date, // From slot.startTime
  startedAt: Date,   // When doctor started consultation
  completedAt: Date, // When consultation ended
  cancelledAt: Date, // When cancelled
  
  // Cancellation Details
  cancellationReason: {
    type: String,
    enum: [
      'PATIENT_REQUEST',
      'DOCTOR_UNAVAILABLE',
      'EMERGENCY',
      'WEATHER',
      'TRANSPORT_ISSUE',
      'OTHER'
    ],
    default: null
  },
  
  cancellationNotes: {
    type: String,
    maxlength: [500, 'Cancellation notes cannot exceed 500 characters']
  },
  
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Who cancelled (patient or doctor)
  },
  
  // No-Show Details
  noShowMarkedAt: Date,
  noShowMarkedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Usually doctor or admin
  },
  
  // Consultation Type
  consultationType: {
    type: String,
    enum: ['IN_PERSON', 'VIDEO', 'PHONE', 'CHAT'],
    default: 'IN_PERSON'
  },
  
  // Follow-up
  isFollowUp: {
    type: Boolean,
    default: false
  },
  
  followUpOf: {
    type: Schema.Types.ObjectId,
    ref: 'Consultation',
    default: null
  },
  
  followUpRecommended: {
    type: Boolean,
    default: false
  },
  
  followUpDate: Date,
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED', 'WAIVED'],
    default: 'PENDING'
  },
  
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  
  // Consultation Duration (auto-calculated)
  actualDuration: {
    type: Number, // in minutes
    min: 0
  },
  
  // Ratings & Feedback (after completion)
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    submittedAt: Date
  },
  
  // Attachments (reports, images, etc.)
  attachments: [{
    type: {
      type: String,
      enum: ['LAB_REPORT', 'PRESCRIPTION', 'IMAGE', 'DOCUMENT', 'OTHER']
    },
    url: String,
    fileName: String,
    fileSize: Number, // in bytes
    uploadedAt: {
      type: Date,
      default: Date.now
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
// Compound index for common queries
consultationSchema.index({ 
  patientId: 1, 
  status: 1, 
  scheduledAt: -1 
});

consultationSchema.index({ 
  doctorId: 1, 
  status: 1, 
  scheduledAt: -1 
});

consultationSchema.index({ 
  slotId: 1 
}, { unique: true });

consultationSchema.index({ 
  status: 1, 
  scheduledAt: 1 
});

consultationSchema.index({ 
  patientId: 1, 
  isFollowUp: 1 
});

consultationSchema.index({ 
  followUpDate: 1 
}, { 
  sparse: true,
  partialFilterExpression: { followUpRecommended: true }
});

// Text index for search
consultationSchema.index({
  chiefComplaint: 'text',
  'clinicalNotes.subjective': 'text',
  'clinicalNotes.assessment': 'text',
  'diagnosis.condition': 'text'
});

// ==================== MIDDLEWARE ====================

// Auto-populate scheduledAt from slot before saving
consultationSchema.pre('save', async function(next) {
  if (this.isNew && this.slotId) {
    const slot = await this.model('AvailabilitySlot').findById(this.slotId);
    if (slot) {
      this.scheduledAt = slot.startTime;
    }
  }
  
  // Calculate actual duration if completed
  if (this.isModified('status') && this.status === 'COMPLETED' && this.startedAt && !this.completedAt) {
    this.completedAt = Date.now();
    const durationMs = this.completedAt - this.startedAt;
    this.actualDuration = Math.round(durationMs / 60000);
  }
  
  this.updatedAt = Date.now();
  next();
});

// Validate status transitions
consultationSchema.pre('save', function(next) {
  if (!this.isModified('status')) {
    return next();
  }
  
  const validTransitions = {
    'SCHEDULED': ['ONGOING', 'CANCELLED', 'NO_SHOW'],
    'ONGOING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // Terminal state
    'CANCELLED': [], // Terminal state
    'NO_SHOW': []    // Terminal state
  };
  
  const oldStatus = this._oldStatus || 'SCHEDULED';
  const newStatus = this.status;
  
  if (!validTransitions[oldStatus]?.includes(newStatus)) {
    const error = new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

// Store old status for transition validation
consultationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this._oldStatus = this.status;
  }
  next();
});

// ==================== INSTANCE METHODS ====================

// Start consultation
consultationSchema.methods.start = function() {
  if (this.status !== 'SCHEDULED') {
    throw new Error('Only SCHEDULED consultations can be started');
  }
  
  this.status = 'ONGOING';
  this.startedAt = Date.now();
  
  return this.save();
};

// Complete consultation
consultationSchema.methods.complete = function(notes, diagnosis) {
  if (this.status !== 'ONGOING') {
    throw new Error('Only ONGOING consultations can be completed');
  }
  
  this.status = 'COMPLETED';
  this.completedAt = Date.now();
  
  if (notes) {
    this.notes = notes;
  }
  
  if (diagnosis && Array.isArray(diagnosis)) {
    this.diagnosis = diagnosis;
  }
  
  // Calculate duration
  if (this.startedAt) {
    const durationMs = this.completedAt - this.startedAt;
    this.actualDuration = Math.round(durationMs / 60000);
  }
  
  return this.save();
};

// Cancel consultation
consultationSchema.methods.cancel = function(userId, reason, notes) {
  if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(this.status)) {
    throw new Error('Cannot cancel a consultation in this status');
  }
  
  this.status = 'CANCELLED';
  this.cancelledAt = Date.now();
  this.cancellationReason = reason;
  this.cancellationNotes = notes;
  this.cancelledBy = userId;
  
  return this.save();
};

// Mark as no-show
consultationSchema.methods.markNoShow = function(userId) {
  if (this.status !== 'SCHEDULED') {
    throw new Error('Only SCHEDULED consultations can be marked as no-show');
  }
  
  this.status = 'NO_SHOW';
  this.noShowMarkedAt = Date.now();
  this.noShowMarkedBy = userId;
  
  return this.save();
};

// Add symptoms
consultationSchema.methods.addSymptoms = function(symptomsArray) {
  if (!Array.isArray(symptomsArray)) {
    throw new Error('Symptoms must be an array');
  }
  
  symptomsArray.forEach(symptom => {
    const existingIndex = this.symptoms.findIndex(
      s => s.symptom.toLowerCase() === symptom.symptom.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing symptom
      this.symptoms[existingIndex] = { ...this.symptoms[existingIndex], ...symptom };
    } else {
      // Add new symptom
      this.symptoms.push(symptom);
    }
  });
  
  return this.save();
};

// Add diagnosis
consultationSchema.methods.addDiagnosis = function(condition, icdCode, isPrimary = false) {
  if (isPrimary) {
    // Set all other diagnoses as non-primary
    this.diagnosis.forEach(d => d.isPrimary = false);
  }
  
  this.diagnosis.push({
    condition,
    icdCode,
    isPrimary
  });
  
  return this.save();
};

// Add vitals
consultationSchema.methods.addVitals = function(vitalsData) {
  this.vitals = { ...this.vitals, ...vitalsData };
  
  // Auto-calculate BMI if weight and height provided
  if (this.vitals.weight && this.vitals.height && !this.vitals.bmi) {
    const heightInMeters = this.vitals.height / 100;
    this.vitals.bmi = Math.round((this.vitals.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  
  return this.save();
};

// Submit patient feedback
consultationSchema.methods.submitFeedback = function(rating, comment) {
  if (this.status !== 'COMPLETED') {
    throw new Error('Feedback can only be submitted for completed consultations');
  }
  
  if (this.patientFeedback?.submittedAt) {
    throw new Error('Feedback already submitted for this consultation');
  }
  
  this.patientFeedback = {
    rating,
    comment,
    submittedAt: Date.now()
  };
  
  return this.save();
};

// ==================== STATIC METHODS ====================

// Get consultations for a patient
consultationSchema.statics.findByPatient = function(patientId, status = null, limit = 10, skip = 0) {
  const query = { patientId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ scheduledAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate([
      { path: 'doctorId', select: 'userId specialization rating' },
      { path: 'slotId', select: 'startTime endTime' },
      { path: 'prescriptionId' },
      { path: 'followUpOf', select: 'scheduledAt diagnosis' }
    ]);
};

// Get consultations for a doctor
consultationSchema.statics.findByDoctor = function(doctorId, status = null, date = null) {
  const query = { doctorId };
  
  if (status) {
    query.status = status;
  }
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.scheduledAt = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }
  
  return this.find(query)
    .sort({ scheduledAt: 1 })
    .populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'slotId', select: 'startTime endTime' }
    ]);
};

// Get upcoming consultations for a doctor
consultationSchema.statics.findUpcomingForDoctor = function(doctorId) {
  return this.find({
    doctorId,
    status: 'SCHEDULED',
    scheduledAt: { $gte: new Date() }
  })
  .sort({ scheduledAt: 1 })
  .populate([
    { path: 'patientId', select: 'name email phone' },
    { path: 'slotId', select: 'startTime endTime' }
  ]);
};

// Get today's consultations for a doctor
consultationSchema.statics.findTodaysConsultations = function(doctorId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorId,
    scheduledAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  })
  .sort({ scheduledAt: 1 })
  .populate([
    { path: 'patientId', select: 'name email phone' },
    { path: 'slotId', select: 'startTime endTime' }
  ]);
};

// Get consultation statistics for a doctor
consultationSchema.statics.getDoctorStats = async function(doctorId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        doctorId,
        scheduledAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'SCHEDULED') result.scheduled = stat.count;
    if (stat._id === 'ONGOING') result.ongoing = stat.count;
    if (stat._id === 'COMPLETED') result.completed = stat.count;
    if (stat._id === 'CANCELLED') result.cancelled = stat.count;
    if (stat._id === 'NO_SHOW') result.noShow = stat.count;
  });
  
  return result;
};

// Get patient's consultation history
consultationSchema.statics.getPatientHistory = async function(patientId) {
  return this.aggregate([
    {
      $match: { 
        patientId,
        status: 'COMPLETED'
      }
    },
    {
      $sort: { scheduledAt: -1 }
    },
    {
      $group: {
        _id: '$doctorId',
        totalConsultations: { $sum: 1 },
        lastConsultation: { $first: '$scheduledAt' },
        averageRating: { 
          $avg: '$patientFeedback.rating' 
        }
      }
    },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    {
      $unwind: '$doctor'
    },
    {
      $project: {
        doctorId: '$_id',
        doctorName: '$doctor.userId',
        specialization: '$doctor.specialization',
        totalConsultations: 1,
        lastConsultation: 1,
        averageRating: { $round: ['$averageRating', 1] }
      }
    }
  ]);
};

// Search consultations by symptoms or diagnosis
consultationSchema.statics.searchConsultations = function(searchTerm, patientId = null) {
  const query = {
    $text: { $search: searchTerm }
  };
  
  if (patientId) {
    query.patientId = patientId;
  }
  
  return this.find(query)
    .sort({ scheduledAt: -1 })
    .populate([
      { path: 'doctorId', select: 'userId specialization' },
      { path: 'patientId', select: 'name email' }
    ]);
};

// Get follow-up consultations due
consultationSchema.statics.findFollowUpsDue = function(doctorId) {
  return this.find({
    doctorId,
    followUpRecommended: true,
    followUpDate: {
      $lte: new Date()
    },
    status: { $nin: ['CANCELLED', 'NO_SHOW'] }
  })
  .sort({ followUpDate: 1 })
  .populate([
    { path: 'patientId', select: 'name email phone' },
    { path: 'followUpOf', select: 'scheduledAt diagnosis' }
  ]);
};

// ==================== VIRTUAL FIELDS ====================

// Patient name (from patientId)
consultationSchema.virtual('patientName').get(function() {
  if (this.patientId && this.patientId.name) {
    return this.patientId.name;
  }
  return null;
});

// Doctor name (from doctorId)
consultationSchema.virtual('doctorName').get(function() {
  if (this.doctorId && this.doctorId.userId && this.doctorId.userId.name) {
    return this.doctorId.userId.name;
  }
  return null;
});

// Consultation date (from scheduledAt)
consultationSchema.virtual('consultationDate').get(function() {
  if (!this.scheduledAt) return null;
  
  return new Date(this.scheduledAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Consultation time (from scheduledAt)
consultationSchema.virtual('consultationTime').get(function() {
  if (!this.scheduledAt) return null;
  
  return new Date(this.scheduledAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Is consultation in the past?
consultationSchema.virtual('isPast').get(function() {
  return this.scheduledAt && this.scheduledAt < new Date();
});

// Can be started?
consultationSchema.virtual('canBeStarted').get(function() {
  return this.status === 'SCHEDULED' && 
         this.scheduledAt && 
         this.scheduledAt <= new Date();
});

// Can be completed?
consultationSchema.virtual('canBeCompleted').get(function() {
  return this.status === 'ONGOING';
});

// Has feedback?
consultationSchema.virtual('hasFeedback').get(function() {
  return this.patientFeedback && this.patientFeedback.submittedAt;
});

// ==================== EXPORT MODEL ====================
const Consultation = model('Consultation', consultationSchema);

export default Consultation;