// models/AvailabilitySlot.js
import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  // Reference to Doctor
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  
  // Time Slot Details
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        // End time must be after start time
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  
  // Slot Status
  status: {
    type: String,
    enum: {
      values: ['AVAILABLE', 'BOOKED', 'BLOCKED'],
      message: 'Status must be AVAILABLE, BOOKED, or BLOCKED'
    },
    required: [true, 'Status is required'],
    default: 'AVAILABLE',
    index: true
  },
  
  // Booking Reference (when status is BOOKED)
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    default: null,
    sparse: true // Allow null values without unique constraint
  },
  
  // Block Reason (when status is BLOCKED)
  blockReason: {
    type: String,
    enum: [
      'PERSONAL_LEAVE',
      'MEDICAL_EMERGENCY',
      'HOLIDAY',
      'CONFERENCE',
      'VACATION',
      'UNAVAILABLE',
      'OTHER'
    ],
    default: null
  },
  
  blockNote: {
    type: String,
    maxlength: [200, 'Block note cannot exceed 200 characters']
  },
  
  // Slot Metadata
  slotDuration: {
    type: Number, // Duration in minutes
    default: 30,
    min: [15, 'Minimum slot duration is 15 minutes'],
    max: [120, 'Maximum slot duration is 120 minutes']
  },
  
  // Booking Details (when BOOKED)
  bookedAt: Date,
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Patient who booked
  },
  
  // Cancellation Details
  isCancelled: {
    type: Boolean,
    default: false
  },
  
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  cancellationReason: {
    type: String,
    enum: ['PATIENT_REQUEST', 'DOCTOR_UNAVAILABLE', 'EMERGENCY', 'OTHER'],
    default: null
  },
  
  // No-Show Tracking
  isNoShow: {
    type: Boolean,
    default: false
  },
  
  // Check-in Status
  checkInStatus: {
    type: String,
    enum: ['PENDING', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'],
    default: 'PENDING'
  },
  
  checkedInAt: Date,
  completedAt: Date,
  
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
// Compound index for efficient slot queries
availabilitySlotSchema.index({ 
  doctorId: 1, 
  date: 1, 
  startTime: 1 
}, { unique: true }); // Prevent duplicate slots

// Index for finding available slots
availabilitySlotSchema.index({ 
  doctorId: 1, 
  date: 1, 
  status: 1 
});

// Index for booking queries
availabilitySlotSchema.index({ 
  consultationId: 1 
});

// Index for date range queries
availabilitySlotSchema.index({ 
  date: 1, 
  status: 1 
});

// Partial index for available slots only
availabilitySlotSchema.index(
  { doctorId: 1, date: 1 },
  { 
    partialFilterExpression: { status: 'AVAILABLE' },
    name: 'available_slots_idx'
  }
);

// ==================== MIDDLEWARE ====================

// Validate time range before saving
availabilitySlotSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    const error = new Error('End time must be after start time');
    error.name = 'ValidationError';
    return next(error);
  }
  
  // Auto-calculate slot duration
  const durationMs = this.endTime - this.startTime;
  this.slotDuration = Math.round(durationMs / 60000); // Convert to minutes
  
});

// Update updatedAt on save
availabilitySlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

});

// Prevent modifying booked slots (business logic)
availabilitySlotSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  const slot = await this.model.findOne(this.getQuery());
  
  if (slot && slot.status === 'BOOKED' && !update.$set?.isCancelled) {
    const error = new Error('Cannot modify a booked slot. Cancel first.');
    error.name = 'BusinessRuleError';
    return next(error);
  }
  
  next();
});

// ==================== INSTANCE METHODS ====================

// Book the slot
availabilitySlotSchema.methods.book = function(consultationId, userId) {
  if (this.status !== 'AVAILABLE') {
    throw new Error('Slot is not available for booking');
  }
  
  this.status = 'BOOKED';
  this.consultationId = consultationId;
  this.bookedAt = Date.now();
  this.bookedBy = userId;
  this.checkInStatus = 'PENDING';
  
  return this.save();
};

// Block the slot (doctor unavailable)
availabilitySlotSchema.methods.block = function(reason, note) {
  if (this.status === 'BOOKED') {
    throw new Error('Cannot block a booked slot');
  }
  
  this.status = 'BLOCKED';
  this.blockReason = reason;
  this.blockNote = note;
  
  return this.save();
};

// Cancel the booking
availabilitySlotSchema.methods.cancel = function(userId, reason) {
  if (this.status !== 'BOOKED') {
    throw new Error('Slot is not booked');
  }
  
  this.isCancelled = true;
  this.cancelledAt = Date.now();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  this.status = 'AVAILABLE'; // Make slot available again
  this.consultationId = null;
  
  return this.save();
};

// Mark as no-show
availabilitySlotSchema.methods.markNoShow = function() {
  if (this.status !== 'BOOKED') {
    throw new Error('Only booked slots can be marked as no-show');
  }
  
  this.isNoShow = true;
  this.checkInStatus = 'NO_SHOW';
  
  return this.save();
};

// Check-in patient
availabilitySlotSchema.methods.checkIn = function() {
  if (this.status !== 'BOOKED') {
    throw new Error('Only booked slots can be checked in');
  }
  
  this.checkInStatus = 'CHECKED_IN';
  this.checkedInAt = Date.now();
  
  return this.save();
};

// Complete the consultation
availabilitySlotSchema.methods.complete = function() {
  if (this.status !== 'BOOKED' || this.checkInStatus !== 'CHECKED_IN') {
    throw new Error('Slot must be booked and checked in to complete');
  }
  
  this.checkInStatus = 'COMPLETED';
  this.completedAt = Date.now();
  
  return this.save();
};

// Release slot (make available again)
availabilitySlotSchema.methods.release = function() {
  this.status = 'AVAILABLE';
  this.consultationId = null;
  this.isCancelled = false;
  this.blockReason = null;
  this.blockNote = null;
  
  return this.save();
};

// ==================== STATIC METHODS ====================

// Find available slots for a doctor on a specific date
availabilitySlotSchema.statics.findAvailableSlots = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: 'AVAILABLE',
    isCancelled: false
  })
  .sort({ startTime: 1 })
  .populate('doctorId', 'userId specialization');
};

// Find available slots in a date range
availabilitySlotSchema.statics.findAvailableSlotsInRange = function(doctorId, startDate, endDate) {
  return this.find({
    doctorId,
    date: {
      $gte: startDate,
      $lte: endDate
    },
    status: 'AVAILABLE',
    isCancelled: false
  })
  .sort({ date: 1, startTime: 1 })
  .populate('doctorId', 'userId specialization');
};

// Find booked slots for a doctor
availabilitySlotSchema.statics.findBookedSlots = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: 'BOOKED',
    isCancelled: false
  })
  .sort({ startTime: 1 })
  .populate([
    { path: 'doctorId', select: 'userId specialization' },
    { path: 'consultationId', select: 'patientId symptoms' },
    { path: 'bookedBy', select: 'name email phone' }
  ]);
};

// Find slots by consultation ID
availabilitySlotSchema.statics.findByConsultation = function(consultationId) {
  return this.findOne({ consultationId })
    .populate([
      { path: 'doctorId', select: 'userId specialization' },
      { path: 'consultationId' },
      { path: 'bookedBy', select: 'name email phone' }
    ]);
};

// Check if time slot conflicts with existing slots
availabilitySlotSchema.statics.hasTimeConflict = async function(doctorId, date, startTime, endTime) {
  const existingSlot = await this.findOne({
    doctorId,
    date,
    status: { $in: ['AVAILABLE', 'BOOKED'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  });
  
  return !!existingSlot;
};

// Create multiple slots for a day (bulk creation)
availabilitySlotSchema.statics.createSlotsForDay = async function(doctorId, date, slotsConfig) {
  const {
    startTime,     // "09:00"
    endTime,       // "17:00"
    slotDuration,  // 30 minutes
    breakTimes     // [{ start: "13:00", end: "14:00" }]
  } = slotsConfig;
  
  const slots = [];
  const dateObj = new Date(date);
  
  let currentTime = new Date(dateObj);
  const [startHour, startMin] = startTime.split(':').map(Number);
  currentTime.setHours(startHour, startMin, 0, 0);
  
  const [endHour, endMin] = endTime.split(':').map(Number);
  const dayEndTime = new Date(dateObj);
  dayEndTime.setHours(endHour, endMin, 0, 0);
  
  while (currentTime < dayEndTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
    
    if (slotEnd > dayEndTime) break;
    
    // Check if slot falls in break time
    const isBreakTime = breakTimes?.some(breakTime => {
      const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);
      
      const breakStart = new Date(dateObj);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);
      
      const breakEnd = new Date(dateObj);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
      
      return slotStart >= breakStart && slotEnd <= breakEnd;
    });
    
    if (!isBreakTime) {
      slots.push({
        doctorId,
        date: dateObj,
        startTime: slotStart,
        endTime: slotEnd,
        status: 'AVAILABLE',
        slotDuration
      });
    }
    
    currentTime = slotEnd;
  }
  
  if (slots.length > 0) {
    await this.insertMany(slots, { ordered: false });
  }
  
  return slots.length;
};

// Get slot statistics for a doctor
availabilitySlotSchema.statics.getSlotStats = async function(doctorId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        doctorId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDuration: { $sum: '$slotDuration' }
      }
    }
  ]);
  
  const result = {
    totalSlots: 0,
    available: 0,
    booked: 0,
    blocked: 0,
    cancelled: 0,
    noShow: 0,
    completed: 0
  };
  
  stats.forEach(stat => {
    result.totalSlots += stat.count;
    if (stat._id === 'AVAILABLE') result.available = stat.count;
    if (stat._id === 'BOOKED') result.booked = stat.count;
    if (stat._id === 'BLOCKED') result.blocked = stat.count;
  });
  
  // Get cancelled and completed counts
  const cancelledCount = await this.countDocuments({
    doctorId,
    date: { $gte: startDate, $lte: endDate },
    isCancelled: true
  });
  result.cancelled = cancelledCount;
  
  const noShowCount = await this.countDocuments({
    doctorId,
    date: { $gte: startDate, $lte: endDate },
    isNoShow: true
  });
  result.noShow = noShowCount;
  
  const completedCount = await this.countDocuments({
    doctorId,
    date: { $gte: startDate, $lte: endDate },
    checkInStatus: 'COMPLETED'
  });
  result.completed = completedCount;
  
  return result;
};

// ==================== VIRTUAL FIELDS ====================

// Slot duration in minutes (computed)
availabilitySlotSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / 60000);
  }
  return this.slotDuration || 0;
});

// Time label for display
availabilitySlotSchema.virtual('timeLabel').get(function() {
  if (!this.startTime) return '';
  
  const start = new Date(this.startTime);
  const end = new Date(this.endTime);
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
});

// Date label for display
availabilitySlotSchema.virtual('dateLabel').get(function() {
  if (!this.date) return '';
  
  return new Date(this.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Is slot in the past?
availabilitySlotSchema.virtual('isPast').get(function() {
  return this.endTime && this.endTime < new Date();
});

// Can be booked?
availabilitySlotSchema.virtual('canBeBooked').get(function() {
  return this.status === 'AVAILABLE' && 
         !this.isCancelled && 
         !this.isPast &&
         this.startTime > new Date();
});

// ==================== EXPORT MODEL ====================
const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

export default AvailabilitySlot;