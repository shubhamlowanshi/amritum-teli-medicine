// models/Prescription.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  // Medicine Details
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [200, 'Medicine name cannot exceed 200 characters']
  },
  
  // Generic name (optional)
  genericName: {
    type: String,
    trim: true,
    maxlength: [200, 'Generic name cannot exceed 200 characters']
  },
  
  // Brand name (optional)
  brandName: {
    type: String,
    trim: true,
    maxlength: [200, 'Brand name cannot exceed 200 characters']
  },
  
  // Dosage Information
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [100, 'Dosage cannot exceed 100 characters']
    // Examples: "500mg", "10ml", "2 tablets", "1 capsule"
  },
  
  // Frequency
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    trim: true,
    maxlength: [100, 'Frequency cannot exceed 100 characters'],
    enum: {
      values: [
        'Once daily',
        'Twice daily',
        'Three times daily',
        'Four times daily',
        'Every 4 hours',
        'Every 6 hours',
        'Every 8 hours',
        'Every 12 hours',
        'Once a week',
        'Twice a week',
        'As needed',
        'At bedtime',
        'Before meals',
        'After meals',
        'With meals',
        'On empty stomach',
        'Other'
      ],
      message: 'Please select a valid frequency or use "Other" with instructions'
    }
  },
  
  // Custom frequency (if "Other" is selected)
  frequencyOther: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom frequency cannot exceed 100 characters']
  },
  
  // Duration
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [100, 'Duration cannot exceed 100 characters']
    // Examples: "5 days", "2 weeks", "1 month", "Until finished"
  },
  
  durationDays: {
    type: Number,
    min: 0,
    max: 365
    // Auto-calculated or manually entered
  },
  
  // Instructions for patient
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
    // Examples: "Take with food", "Avoid alcohol", "Do not drive"
  },
  
  // Medicine type
  medicineType: {
    type: String,
    enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'SPRAY', 'SUSPENSION', 'OTHER'],
    default: 'TABLET'
  },
  
  // Quantity to dispense
  quantity: {
    type: String,
    trim: true,
    maxlength: [50, 'Quantity cannot exceed 50 characters']
    // Examples: "10 tablets", "1 bottle", "2 strips"
  },
  
  // Refill information
  refills: {
    type: Number,
    default: 0,
    min: 0,
    max: 12
  },
  
  // Start date
  startDate: {
    type: Date,
    default: Date.now
  },
  
  // End date (calculated from duration)
  endDate: Date,
  
  // Is medicine currently active?
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Stop reason (if discontinued)
  stopReason: {
    type: String,
    enum: ['COMPLETED', 'SIDE_EFFECTS', 'ALLERGY', 'NOT_EFFECTIVE', 'DOCTOR_ADVICE', 'OTHER'],
    default: null
  },
  
  stoppedAt: Date,
  stoppedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Sub-document _id for individual medicine tracking
  _id: false // Disable automatic _id if you want simpler array
}, {
  _id: true // Enable _id for each medicine subdocument
});

const prescriptionSchema = new mongoose.Schema({
  // Consultation Reference
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: [true, 'Consultation ID is required'],
    unique: true, // One prescription per consultation
    index: true
  },
  
  // Doctor Reference (denormalized for quick access)
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  
  // Patient Reference (denormalized for quick access)
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User with role: PATIENT
    required: [true, 'Patient ID is required'],
    index: true
  },
  
  // Medicines Array
  medicines: {
    type: [medicineSchema],
    validate: {
      validator: function(medicines) {
        return medicines && medicines.length > 0;
      },
      message: 'Prescription must have at least one medicine'
    }
  },
  
  // Prescription Notes
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    trim: true
  },
  
  // Additional Instructions
  generalInstructions: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each instruction cannot exceed 200 characters']
  }],
  
  // Diet Recommendations
  dietRecommendations: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each recommendation cannot exceed 200 characters']
  }],
  
  // Lifestyle Advice
  lifestyleAdvice: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each advice cannot exceed 200 characters']
  }],
  
  // Warnings/Precautions
  warnings: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each warning cannot exceed 200 characters']
  }],
  
  // Follow-up instructions
  followUpInstructions: {
    type: String,
    maxlength: [500, 'Follow-up instructions cannot exceed 500 characters'],
    trim: true
  },
  
  // Prescription Date
  prescriptionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Validity
  validUntil: {
    type: Date,
    default: function() {
      // Default: 30 days from prescription date
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  
  // Is prescription active?
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'DISCONTINUED'],
    default: 'ACTIVE',
    index: true
  },
  
  // Pharmacy Reference (if dispensed)
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    default: null
  },
  
  // Dispensing Details
  dispensedAt: Date,
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Pharmacist
  },
  
  // Prescription Number (auto-generated)
  prescriptionNumber: {
    type: String,
    unique: true,
    sparse: true
    // Format: "RX-2026-000001"
  },
  
  // Digital Signature
  digitallySigned: {
    type: Boolean,
    default: false
  },
  
  signedAt: Date,
  signatureHash: String,
  
  // QR Code for verification
  qrCodeData: String,
  qrCodeUrl: String,
  
  // Attachments (if any)
  attachments: [{
    type: {
      type: String,
      enum: ['LAB_REPORT', 'IMAGE', 'DOCUMENT', 'OTHER']
    },
    url: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit Fields
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
// Compound indexes for common queries
prescriptionSchema.index({ 
  patientId: 1, 
  prescriptionDate: -1 
});

prescriptionSchema.index({ 
  doctorId: 1, 
  prescriptionDate: -1 
});

prescriptionSchema.index({ 
  consultationId: 1 
}, { unique: true });

prescriptionSchema.index({ 
  patientId: 1, 
  status: 1 
});

prescriptionSchema.index({ 
  prescriptionDate: 1, 
  status: 1 
});

// Index for medicine search (text index on array)
prescriptionSchema.index({ 'medicines.name': 'text' });

// Index for active prescriptions
prescriptionSchema.index(
  { patientId: 1, isActive: 1 },
  { 
    partialFilterExpression: { isActive: true },
    name: 'active_prescriptions_idx'
  }
);

// ==================== MIDDLEWARE ====================

// Generate prescription number before saving
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const year = new Date().getFullYear();
    const count = await this.model.countDocuments({
      prescriptionDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    
    this.prescriptionNumber = `RX-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Auto-calculate end dates for medicines
prescriptionSchema.pre('save', function(next) {
  if (this.medicines && this.medicines.length > 0) {
    this.medicines.forEach(medicine => {
      if (medicine.durationDays && medicine.startDate) {
        medicine.endDate = new Date(medicine.startDate);
        medicine.endDate.setDate(medicine.endDate.getDate() + medicine.durationDays);
      }
    });
  }
  
  next();
});

// ==================== INSTANCE METHODS ====================

// Add medicine to prescription
prescriptionSchema.methods.addMedicine = function(medicineData) {
  if (!this.medicines) {
    this.medicines = [];
  }
  
  this.medicines.push(medicineData);
  return this.save();
};

// Remove medicine from prescription
prescriptionSchema.methods.removeMedicine = function(medicineId) {
  if (!this.medicines || this.medicines.length === 0) {
    throw new Error('No medicines in prescription');
  }
  
  const index = this.medicines.findIndex(m => m._id.toString() === medicineId);
  
  if (index === -1) {
    throw new Error('Medicine not found');
  }
  
  this.medicines.splice(index, 1);
  return this.save();
};

// Update medicine details
prescriptionSchema.methods.updateMedicine = function(medicineId, updates) {
  if (!this.medicines) {
    throw new Error('No medicines in prescription');
  }
  
  const medicine = this.medicines.id(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found');
  }
  
  Object.assign(medicine, updates);
  return this.save();
};

// Stop a medicine
prescriptionSchema.methods.stopMedicine = function(medicineId, userId, reason) {
  if (!this.medicines) {
    throw new Error('No medicines in prescription');
  }
  
  const medicine = this.medicines.id(medicineId);
  
  if (!medicine) {
    throw new Error('Medicine not found');
  }
  
  medicine.isActive = false;
  medicine.stopReason = reason;
  medicine.stoppedAt = Date.now();
  medicine.stoppedBy = userId;
  
  return this.save();
};

// Mark prescription as completed
prescriptionSchema.methods.complete = function() {
  this.status = 'COMPLETED';
  this.isActive = false;
  
  // Mark all medicines as completed
  if (this.medicines) {
    this.medicines.forEach(medicine => {
      medicine.isActive = false;
      medicine.stopReason = 'COMPLETED';
    });
  }
  
  return this.save();
};

// Discontinue prescription
prescriptionSchema.methods.discontinue = function() {
  this.status = 'DISCONTINUED';
  this.isActive = false;
  return this.save();
};

// Digitally sign prescription
prescriptionSchema.methods.sign = function(signatureHash) {
  this.digitallySigned = true;
  this.signedAt = Date.now();
  this.signatureHash = signatureHash;
  
  // Generate QR code data
  this.qrCodeData = JSON.stringify({
    prescriptionNumber: this.prescriptionNumber,
    doctorId: this.doctorId,
    patientId: this.patientId,
    date: this.prescriptionDate,
    signatureHash: this.signatureHash
  });
  
  return this.save();
};

// Get active medicines
prescriptionSchema.methods.getActiveMedicines = function() {
  if (!this.medicines) return [];
  return this.medicines.filter(m => m.isActive);
};

// Get medicines by type
prescriptionSchema.methods.getMedicinesByType = function(type) {
  if (!this.medicines) return [];
  return this.medicines.filter(m => m.medicineType === type);
};

// ==================== STATIC METHODS ====================

// Get prescriptions for a patient
prescriptionSchema.statics.findByPatient = function(patientId, status = null, limit = 20, skip = 0) {
  const query = { patientId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ prescriptionDate: -1 })
    .limit(limit)
    .skip(skip)
    .populate([
      { path: 'doctorId', select: 'userId specialization' },
      { path: 'consultationId', select: 'scheduledAt diagnosis' }
    ]);
};

// Get prescriptions for a doctor
prescriptionSchema.statics.findByDoctor = function(doctorId, date = null) {
  const query = { doctorId };
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.prescriptionDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }
  
  return this.find(query)
    .sort({ prescriptionDate: -1 })
    .populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'consultationId', select: 'scheduledAt' }
    ]);
};

// Get active prescriptions for a patient
prescriptionSchema.statics.findActiveForPatient = function(patientId) {
  return this.find({
    patientId,
    isActive: true,
    status: 'ACTIVE',
    validUntil: { $gte: new Date() }
  })
  .sort({ prescriptionDate: -1 })
  .populate('doctorId', 'userId specialization');
};

// Get prescription by consultation ID
prescriptionSchema.statics.findByConsultation = function(consultationId) {
  return this.findOne({ consultationId })
    .populate([
      { path: 'doctorId', select: 'userId specialization' },
      { path: 'patientId', select: 'name email phone' },
      { path: 'consultationId', select: 'scheduledAt diagnosis symptoms' }
    ]);
};

// Search prescriptions by medicine name
prescriptionSchema.statics.searchByMedicine = function(medicineName, patientId = null) {
  const query = {
    'medicines.name': new RegExp(medicineName, 'i'),
    isActive: true
  };
  
  if (patientId) {
    query.patientId = patientId;
  }
  
  return this.find(query)
    .sort({ prescriptionDate: -1 })
    .populate([
      { path: 'doctorId', select: 'userId specialization' },
      { path: 'patientId', select: 'name email' }
    ]);
};

// Get prescription statistics for a doctor
prescriptionSchema.statics.getDoctorStats = async function(doctorId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        doctorId,
        prescriptionDate: {
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
    active: 0,
    completed: 0,
    expired: 0,
    discontinued: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'ACTIVE') result.active = stat.count;
    if (stat._id === 'COMPLETED') result.completed = stat.count;
    if (stat._id === 'EXPIRED') result.expired = stat.count;
    if (stat._id === 'DISCONTINUED') result.discontinued = stat.count;
  });
  
  return result;
};

// Get most prescribed medicines for a doctor
prescriptionSchema.statics.getTopMedicines = async function(doctorId, limit = 10) {
  return this.aggregate([
    {
      $match: { doctorId }
    },
    {
      $unwind: '$medicines'
    },
    {
      $group: {
        _id: '$medicines.name',
        count: { $sum: 1 },
        avgDuration: { $avg: '$medicines.durationDays' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        medicineName: '$_id',
        prescribedCount: '$count',
        averageDurationDays: { $round: ['$avgDuration', 1] }
      }
    }
  ]);
};

// Check for drug interactions (basic implementation)
prescriptionSchema.statics.checkDrugInteractions = function(medicines) {
  // This is a simplified example
  // In production, use a drug interaction API or database
  const interactions = [];
  
  const knownInteractions = [
    { drugs: ['Aspirin', 'Warfarin'], severity: 'HIGH' },
    { drugs: ['Ibuprofen', 'Lisinopril'], severity: 'MODERATE' }
  ];
  
  const medicineNames = medicines.map(m => m.name.toLowerCase());
  
  knownInteractions.forEach(interaction => {
    const [drug1, drug2] = interaction.drugs.map(d => d.toLowerCase());
    
    if (medicineNames.includes(drug1) && medicineNames.includes(drug2)) {
      interactions.push({
        drugs: interaction.drugs,
        severity: interaction.severity,
        message: `Potential interaction between ${interaction.drugs[0]} and ${interaction.drugs[1]}`
      });
    }
  });
  
  return interactions;
};

// ==================== VIRTUAL FIELDS ====================

// Total number of medicines
prescriptionSchema.virtual('totalMedicines').get(function() {
  return this.medicines ? this.medicines.length : 0;
});

// Active medicine count
prescriptionSchema.virtual('activeMedicineCount').get(function() {
  if (!this.medicines) return 0;
  return this.medicines.filter(m => m.isActive).length;
});

// Doctor name (from doctorId)
prescriptionSchema.virtual('doctorName').get(function() {
  if (this.doctorId && this.doctorId.userId && this.doctorId.userId.name) {
    return this.doctorId.userId.name;
  }
  return null;
});

// Patient name (from patientId)
prescriptionSchema.virtual('patientName').get(function() {
  if (this.patientId && this.patientId.name) {
    return this.patientId.name;
  }
  return null;
});

// Is prescription expired?
prescriptionSchema.virtual('isExpired').get(function() {
  return this.validUntil && this.validUntil < new Date();
});

// Days until expiry
prescriptionSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.validUntil) return null;
  
  const now = new Date();
  const diff = this.validUntil - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ==================== EXPORT MODEL ====================
const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;