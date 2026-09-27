// models/AuditLog.js
import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema({
  // Actor Information
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor ID is required'],
    index: true
  },
  
  actorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  
  actorName: {
    type: String,
    trim: true
  },
  
  actorRole: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'SYSTEM'],
    index: true
  },
  
  // Action Details
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: [
        // Authentication
        'LOGIN',
        'LOGOUT',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'MFA_ENABLE',
        'MFA_DISABLE',
        'MFA_VERIFY',
        
        // User Management
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DELETE',
        'USER_VIEW',
        'USER_ACTIVATE',
        'USER_DEACTIVATE',
        
        // Doctor Management
        'DOCTOR_CREATE',
        'DOCTOR_UPDATE',
        'DOCTOR_VERIFY',
        'DOCTOR_REJECT',
        'DOCTOR_SUSPEND',
        
        // Consultation
        'CONSULTATION_CREATE',
        'CONSULTATION_UPDATE',
        'CONSULTATION_CANCEL',
        'CONSULTATION_COMPLETE',
        'CONSULTATION_NO_SHOW',
        
        // Appointment
        'APPOINTMENT_BOOK',
        'APPOINTMENT_RESCHEDULE',
        'APPOINTMENT_CANCEL',
        'APPOINTMENT_CHECK_IN',
        'APPOINTMENT_CHECK_OUT',
        
        // Prescription
        'PRESCRIPTION_CREATE',
        'PRESCRIPTION_UPDATE',
        'PRESCRIPTION_VIEW',
        'PRESCRIPTION_DISCONTINUE',
        
        // Payment
        'PAYMENT_INITIATE',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PAYMENT_REFUND',
        'PAYMENT_VIEW',
        
        // Medical Records
        'RECORD_CREATE',
        'RECORD_UPDATE',
        'RECORD_VIEW',
        'RECORD_DELETE',
        
        // Lab Tests
        'LAB_TEST_ORDER',
        'LAB_TEST_UPDATE',
        'LAB_TEST_VIEW',
        'LAB_TEST_COMPLETE',
        
        // System
        'DATA_EXPORT',
        'DATA_IMPORT',
        'REPORT_GENERATE',
        'SETTINGS_UPDATE',
        'ROLE_ASSIGN',
        'ROLE_REMOVE',
        
        // Security
        'ACCESS_DENIED',
        'SUSPICIOUS_ACTIVITY',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        
        // Other
        'OTHER'
      ],
      message: 'Please provide a valid action type'
    },
    index: true
  },
  
  // Resource Information
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: {
      values: [
        'users',
        'doctors',
        'patients',
        'consultations',
        'appointments',
        'prescriptions',
        'payments',
        'medical_records',
        'lab_tests',
        'audit_logs',
        'settings',
        'reports',
        'files',
        'other'
      ],
      message: 'Please provide a valid resource type'
    },
    index: true
  },
  
  resourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  
  // Additional Metadata
  metadata: {
    type: Object,
    default: {}
    // Examples:
    // { changes: { old: {...}, new: {...} } }
    // { reason: 'Patient requested cancellation' }
    // { previousStatus: 'SCHEDULED', newStatus: 'CANCELLED' }
  },
  
  // Changes (for UPDATE actions)
  changes: {
    type: [{
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed
    }],
    default: []
  },
  
  // Request Information
  ip: {
    type: String,
    trim: true,
    index: true
  },
  
  userAgent: {
    type: String,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  
  // HTTP Request Details
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
  },
  
  path: {
    type: String,
    trim: true,
    maxlength: [500, 'Path cannot exceed 500 characters']
  },
  
  statusCode: {
    type: Number,
    min: 100,
    max: 599
  },
  
  // Outcome
  outcome: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'DENIED'],
    default: 'SUCCESS',
    index: true
  },
  
  // Error Details (if failed)
  errorCode: {
    type: String,
    trim: true
  },
  
  errorMessage: {
    type: String,
    maxlength: [1000, 'Error message cannot exceed 1000 characters']
  },
  
  // Session Information
  sessionId: {
    type: String,
    trim: true,
    index: true
  },
  
  // Device Information
  deviceType: {
    type: String,
    enum: ['DESKTOP', 'MOBILE', 'TABLET', 'OTHER'],
    default: 'OTHER'
  },
  
  os: {
    type: String, // Operating System
    trim: true
  },
  
  browser: {
    type: String,
    trim: true
  },
  
  // Location Information
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  
  riskFactors: [{
    type: String
    // Examples: 'UNUSUAL_LOCATION', 'UNUSUAL_TIME', 'MULTIPLE_FAILED_ATTEMPTS', 'NEW_DEVICE'
  }],
  
  // Compliance Flags
  isPHIAccess: {
    type: Boolean,
    default: false // Protected Health Information access (HIPAA)
  },
  
  isSensitive: {
    type: Boolean,
    default: false
  },
  
  // Retention
  retentionPeriod: {
    type: Number, // Days to retain (default: based on compliance requirements)
    default: 2555 // 7 years for healthcare
  },
  
  retainUntil: {
    type: Date,
    default: function() {
      return new Date(Date.now() + (this.retentionPeriod * 24 * 60 * 60 * 1000));
    }
  },
  
  // Archive Status
  isArchived: {
    type: Boolean,
    default: false
  },
  
  archivedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
// Compound indexes for common queries
auditLogSchema.index({ 
  actorId: 1, 
  createdAt: -1 
});

auditLogSchema.index({ 
  actorId: 1, 
  action: 1, 
  createdAt: -1 
});

auditLogSchema.index({ 
  resource: 1, 
  resourceId: 1, 
  createdAt: -1 
});

auditLogSchema.index({ 
  action: 1, 
  createdAt: -1 
});

auditLogSchema.index({ 
  outcome: 1, 
  createdAt: -1 
});

auditLogSchema.index({ 
  createdAt: 1, 
  outcome: 1, 
  action: 1 
});

// Index for IP-based queries (security investigations)
auditLogSchema.index({ 
  ip: 1, 
  createdAt: -1 
});

// Index for session tracking
auditLogSchema.index({ 
  sessionId: 1, 
  createdAt: -1 
});

// Partial index for failed/denied actions (security monitoring)
auditLogSchema.index(
  { outcome: 1, createdAt: -1 },
  { 
    partialFilterExpression: { 
      outcome: { $in: ['FAILURE', 'DENIED'] } 
    },
    name: 'failed_actions_idx'
  }
);

// Partial index for PHI access (HIPAA compliance)
auditLogSchema.index(
  { isPHIAccess: 1, createdAt: -1 },
  { 
    partialFilterExpression: { isPHIAccess: true },
    name: 'phi_access_idx'
  }
);

// TTL index for auto-deletion after retention period
auditLogSchema.index(
  { retainUntil: 1 },
  { 
    expireAfterSeconds: 0,
    name: 'retention_ttl',
    background: true
  }
);

// Text index for searching metadata
auditLogSchema.index({
  'metadata.$**': 'text',
  errorMessage: 'text'
});

// ==================== MIDDLEWARE ====================

// Auto-populate actor details before saving
auditLogSchema.pre('save', async function(next) {
  if (this.isNew && this.actorId && !this.actorEmail) {
    const User = model('User');
    const user = await User.findById(this.actorId).select('email name role').lean();
    
    if (user) {
      this.actorEmail = user.email;
      this.actorName = user.name;
      this.actorRole = user.role;
    }
  }
  
  // Auto-calculate risk level from score
  if (this.riskScore !== undefined) {
    if (this.riskScore >= 75) {
      this.riskLevel = 'CRITICAL';
    } else if (this.riskScore >= 50) {
      this.riskLevel = 'HIGH';
    } else if (this.riskScore >= 25) {
      this.riskLevel = 'MEDIUM';
    } else {
      this.riskLevel = 'LOW';
    }
  }
  
  next();
});

// ==================== INSTANCE METHODS ====================

// Add change to changes array
auditLogSchema.methods.addChange = function(field, oldValue, newValue) {
  if (!this.changes) {
    this.changes = [];
  }
  
  this.changes.push({
    field,
    oldValue,
    newValue
  });
  
  return this.save();
};

// Add risk factor
auditLogSchema.methods.addRiskFactor = function(factor) {
  if (!this.riskFactors) {
    this.riskFactors = [];
  }
  
  if (!this.riskFactors.includes(factor)) {
    this.riskFactors.push(factor);
    this.markModified('riskFactors');
  }
  
  return this.save();
};

// Update risk score
auditLogSchema.methods.updateRiskScore = function(score) {
  this.riskScore = Math.max(0, Math.min(100, score));
  return this.save();
};

// Mark as PHI access
auditLogSchema.methods.markPHIAccess = function() {
  this.isPHIAccess = true;
  this.isSensitive = true;
  return this.save();
};

// Archive log entry
auditLogSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = Date.now();
  return this.save();
};

// ==================== STATIC METHODS ====================

// Get audit logs for a user
auditLogSchema.statics.findByActor = function(actorId, options = {}) {
  const {
    action = null,
    resource = null,
    outcome = null,
    startDate = null,
    endDate = null,
    limit = 100,
    skip = 0
  } = options;
  
  const query = { actorId };
  
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (outcome) query.outcome = outcome;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Get audit logs for a resource
auditLogSchema.statics.findByResource = function(resource, resourceId = null, limit = 100) {
  const query = { resource };
  
  if (resourceId) {
    query.resourceId = resourceId;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actorId', 'email name role');
};

// Get resource trail (complete history of a specific entity)
auditLogSchema.statics.getResourceTrail = function(resource, resourceId) {
  return this.find({ resource, resourceId })
    .sort({ createdAt: 1 }) // Chronological order
    .populate('actorId', 'email name role');
};

// Get failed actions (security monitoring)
auditLogSchema.statics.getFailedActions = function(options = {}) {
  const {
    actorId = null,
    ip = null,
    startDate = null,
    endDate = null,
    limit = 100
  } = options;
  
  const query = {
    outcome: { $in: ['FAILURE', 'DENIED'] }
  };
  
  if (actorId) query.actorId = actorId;
  if (ip) query.ip = ip;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Get PHI access logs (HIPAA compliance)
auditLogSchema.statics.getPHIAccessLogs = function(patientId = null, startDate = null, endDate = null) {
  const query = { isPHIAccess: true };
  
  if (patientId) {
    query.resourceId = patientId;
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('actorId', 'email name role');
};

// Get suspicious activities (high risk)
auditLogSchema.statics.getSuspiciousActivities = function(options = {}) {
  const {
    minRiskScore = 50,
    limit = 100
  } = options;
  
  return this.find({
    riskScore: { $gte: minRiskScore }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('actorId', 'email name role');
};

// Get login history for a user
auditLogSchema.statics.getLoginHistory = function(actorId, limit = 50) {
  return this.find({
    actorId,
    action: { $in: ['LOGIN', 'LOGOUT', 'ACCESS_DENIED'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Get audit statistics for a date range
auditLogSchema.statics.getStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$outcome', 'SUCCESS'] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$outcome', 'FAILURE'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const result = {
    total: 0,
    success: 0,
    failure: 0,
    denied: 0,
    byAction: {}
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    result.success += stat.successCount;
    result.failure += stat.failureCount;
    result.byAction[stat._id] = {
      total: stat.count,
      success: stat.successCount,
      failure: stat.failureCount
    };
  });
  
  // Get denied count separately
  const deniedCount = await this.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    outcome: 'DENIED'
  });
  result.denied = deniedCount;
  
  return result;
};

// Get user activity summary
auditLogSchema.statics.getUserActivitySummary = async function(actorId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        actorId,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

// Search audit logs by metadata
auditLogSchema.statics.searchByMetadata = function(searchTerm, limit = 100) {
  return this.find({
    $text: { $search: searchTerm }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('actorId', 'email name role');
};

// Bulk create audit logs (for batch operations)
auditLogSchema.statics.bulkCreate = async function(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return [];
  }
  
  return await this.insertMany(logs, {
    ordered: false, // Continue even if some fail
    lean: true
  });
};

// Clean old logs (manual cleanup if TTL is not enabled)
auditLogSchema.statics.cleanOldLogs = async function(olderThanDays = 2555) {
  const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isArchived: true
  });
  
  return result;
};

// Export logs for compliance reporting
auditLogSchema.statics.exportForCompliance = async function(startDate, endDate, format = 'json') {
  const logs = await this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ createdAt: 1 })
  .lean();
  
  if (format === 'csv') {
    // Convert to CSV
    const headers = [
      'createdAt',
      'actorId',
      'actorEmail',
      'action',
      'resource',
      'resourceId',
      'outcome',
      'ip',
      'riskLevel'
    ];
    
    const rows = logs.map(log => 
      headers.map(h => JSON.stringify(log[h] || '')).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  return logs;
};

// ==================== VIRTUAL FIELDS ====================

// Formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  if (!this.createdAt) return null;
  
  return new Date(this.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
});

// Action category
auditLogSchema.virtual('actionCategory').get(function() {
  if (!this.action) return null;
  
  const authActions = ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'MFA_ENABLE', 'MFA_DISABLE'];
  const userActions = ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE'];
  const consultationActions = ['CONSULTATION_CREATE', 'CONSULTATION_UPDATE', 'CONSULTATION_CANCEL'];
  const paymentActions = ['PAYMENT_INITIATE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REFUND'];
  
  if (authActions.includes(this.action)) return 'AUTHENTICATION';
  if (userActions.includes(this.action)) return 'USER_MANAGEMENT';
  if (consultationActions.includes(this.action)) return 'CONSULTATION';
  if (paymentActions.includes(this.action)) return 'PAYMENT';
  
  return 'OTHER';
});

// Is sensitive action?
auditLogSchema.virtual('isSensitiveAction').get(function() {
  const sensitiveActions = [
    'PASSWORD_CHANGE',
    'MFA_DISABLE',
    'USER_DELETE',
    'DATA_EXPORT',
    'ROLE_ASSIGN',
    'ACCESS_DENIED'
  ];
  
  return sensitiveActions.includes(this.action);
});

// Device info string
auditLogSchema.virtual('deviceInfo').get(function() {
  const parts = [];
  
  if (this.deviceType) parts.push(this.deviceType);
  if (this.os) parts.push(this.os);
  if (this.browser) parts.push(this.browser);
  
  return parts.join(' | ') || 'Unknown';
});

// Location string
auditLogSchema.virtual('locationString').get(function() {
  if (!this.location) return null;
  
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.region) parts.push(this.location.region);
  if (this.location.country) parts.push(this.location.country);
  
  return parts.join(', ') || null;
});

// Time since action
auditLogSchema.virtual('timeAgo').get(function() {
  if (!this.createdAt) return null;
  
  const now = new Date();
  const diff = now - new Date(this.createdAt);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// ==================== EXPORT MODEL ====================
const AuditLog = model('AuditLog', auditLogSchema);

export default AuditLog;