// // models/Payment.js
// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//   // Consultation Reference
//   consultationId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Consultation',
//     required: [true, 'Consultation ID is required'],
//     unique: true, // One payment per consultation
//     index: true
//   },
  
//   // Patient Reference (denormalized for quick access)
//   patientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // User with role: PATIENT
//     required: [true, 'Patient ID is required'],
//     index: true
//   },
  
//   // Payment Amount
//   amount: {
//     type: Number,
//     required: [true, 'Amount is required'],
//     min: [0, 'Amount cannot be negative'],
//     validate: {
//       validator: Number.isInteger,
//       message: 'Amount must be an integer (in smallest currency unit)'
//     }
//   },
  
//   // Currency (ISO 4217)
//   currency: {
//     type: String,
//     required: [true, 'Currency is required'],
//     default: 'INR',
//     uppercase: true,
//     enum: {
//       values: ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'],
//       message: 'Please provide a valid currency code'
//     }
//   },
  
//   // Payment Status
//   status: {
//     type: String,
//     enum: {
//       values: [
//         'PENDING',      // Payment initiated
//         'PROCESSING',   // Being processed by gateway
//         'SUCCESS',      // Payment successful
//         'FAILED',       // Payment failed
//         'REFUNDED',     // Fully refunded
//         'PARTIALLY_REFUNDED', // Partially refunded
//         'CANCELLED',    // Cancelled by user/system
//         'DISPUTED'      // Chargeback/dispute
//       ],
//       message: 'Invalid payment status'
//     },
//     required: [true, 'Status is required'],
//     default: 'PENDING',
//     index: true
//   },
  
//   // Payment Gateway Transaction ID
//   transactionId: {
//     type: String,
//     trim: true,
//     unique: true,
//     sparse: true, // Allow null for pending payments
//     maxlength: [100, 'Transaction ID cannot exceed 100 characters'],
//     index: true
//   },
  
//   // Idempotency Key (prevents duplicate payments)
//   idempotencyKey: {
//     type: String,
//     required: [true, 'Idempotency key is required'],
//     unique: true,
//     trim: true,
//     maxlength: [100, 'Idempotency key cannot exceed 100 characters'],
//     index: true
//   },
  
//   // Payment Method
//   paymentMethod: {
//     type: String,
//     enum: ['CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CASH', 'OTHER'],
//     default: null
//   },
  
//   // Payment Gateway Details
//   gateway: {
//     type: String,
//     enum: ['RAZORPAY', 'STRIPE', 'PAYPAL', 'PAYTM', 'PHONEPE', 'CASHFREE', 'OTHER'],
//     default: null
//   },
  
//   gatewayOrderId: {
//     type: String,
//     trim: true,
//     maxlength: [100, 'Gateway order ID cannot exceed 100 characters']
//   },
  
//   gatewayPaymentId: {
//     type: String,
//     trim: true,
//     maxlength: [100, 'Gateway payment ID cannot exceed 100 characters']
//   },
  
//   gatewaySignature: {
//     type: String,
//     trim: true,
//     maxlength: [500, 'Gateway signature cannot exceed 500 characters']
//   },
  
//   // Card Details (if applicable, tokenized only)
//   cardDetails: {
//     last4: {
//       type: String,
//       maxlength: 4
//     },
//     network: {
//       type: String, // VISA, MASTERCARD, etc.
//       enum: ['VISA', 'MASTERCARD', 'AMEX', 'RUPAY', 'DISCOVER', 'OTHER']
//     },
//     type: {
//       type: String, // CREDIT, DEBIT
//       enum: ['CREDIT', 'DEBIT']
//     }
//   },
  
//   // UPI Details (if applicable)
//   upiDetails: {
//     vpa: {
//       type: String, // Virtual Payment Address
//       trim: true,
//       maxlength: [50, 'VPA cannot exceed 50 characters']
//     },
//     bank: {
//       type: String
//     }
//   },
  
//   // Refund Details
//   refundAmount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
  
//   refundReason: {
//     type: String,
//     enum: [
//       'PATIENT_REQUEST',
//       'DOCTOR_CANCELLATION',
//       'SYSTEM_ERROR',
//       'DUPLICATE_PAYMENT',
//       'SERVICE_NOT_PROVIDED',
//       'OTHER'
//     ],
//     default: null
//   },
  
//   refundTransactionId: {
//     type: String,
//     trim: true,
//     maxlength: [100, 'Refund transaction ID cannot exceed 100 characters']
//   },
  
//   refundedAt: Date,
//   refundedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User' // Admin who processed refund
//   },
  
//   // Failure Details
//   failureCode: {
//     type: String,
//     trim: true,
//     maxlength: [50, 'Failure code cannot exceed 50 characters']
//   },
  
//   failureReason: {
//     type: String,
//     maxlength: [500, 'Failure reason cannot exceed 500 characters']
//   },
  
//   failureDescription: {
//     type: String,
//     maxlength: [1000, 'Failure description cannot exceed 1000 characters']
//   },
  
//   failedAt: Date,
  
//   // Payment Timeline
//   initiatedAt: {
//     type: Date,
//     default: Date.now
//   },
//   processedAt: Date,
//   succeededAt: Date,
//   cancelledAt: Date,
  
//   // Receipt/Invoice Details
//   receiptNumber: {
//     type: String,
//     unique: true,
//     sparse: true,
//     trim: true
//   },
  
//   invoiceNumber: {
//     type: String,
//     unique: true,
//     sparse: true,
//     trim: true
//   },
  
//   invoiceUrl: {
//     type: String, // URL to PDF invoice
//     maxlength: [500, 'Invoice URL cannot exceed 500 characters']
//   },
  
//   // Tax Details
//   taxAmount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
  
//   taxRate: {
//     type: Number, // Percentage
//     default: 0,
//     min: 0,
//     max: 100
//   },
  
//   // Discount Details
//   discountAmount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
  
//   discountCode: {
//     type: String,
//     trim: true,
//     maxlength: [50, 'Discount code cannot exceed 50 characters']
//   },
  
//   // Final Amount (after tax and discount)
//   finalAmount: {
//     type: Number,
//     min: 0
//   },
  
//   // Metadata (for additional context)
//   metadata: {
//     type: Map,
//     of: String
//   },
  
//   // Notes (internal)
//   notes: {
//     type: String,
//     maxlength: [1000, 'Notes cannot exceed 1000 characters'],
//     trim: true
//   },
  
//   // Customer IP (for fraud detection)
//   customerIp: {
//     type: String,
//     trim: true
//   },
  
//   // User Agent
//   userAgent: {
//     type: String,
//     maxlength: [500, 'User agent cannot exceed 500 characters']
//   },
  
//   // Retry Count (for failed payments)
//   retryCount: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
  
//   // Webhook Events
//   webhookEvents: [{
//     event: {
//       type: String,
//       enum: ['payment.created', 'payment.succeeded', 'payment.failed', 'payment.refunded', 'payment.disputed']
//     },
//     eventId: String,
//     receivedAt: {
//       type: Date,
//       default: Date.now
//     },
//     processed: {
//       type: Boolean,
//       default: false
//     }
//   }],
  
//   // Audit Fields
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // ==================== INDEXES ====================
// // Compound indexes for common queries
// paymentSchema.index({ 
//   patientId: 1, 
//   status: 1, 
//   createdAt: -1 
// });

// paymentSchema.index({ 
//   consultationId: 1 
// }, { unique: true });

// paymentSchema.index({ 
//   idempotencyKey: 1 
// }, { unique: true });

// paymentSchema.index({ 
//   transactionId: 1 
// }, { unique: true, sparse: true });

// paymentSchema.index({ 
//   status: 1, 
//   createdAt: 1 
// });

// paymentSchema.index({ 
//   patientId: 1, 
//   createdAt: -1 
// });

// paymentSchema.index({ 
//   gateway: 1, 
//   status: 1 
// });

// // Partial index for successful payments
// paymentSchema.index(
//   { patientId: 1, status: 1 },
//   { 
//     partialFilterExpression: { status: 'SUCCESS' },
//     name: 'successful_payments_idx'
//   }
// );

// // TTL index for pending payments (auto-cleanup after 24 hours)
// paymentSchema.index(
//   { createdAt: 1 },
//   { 
//     expireAfterSeconds: 86400,
//     partialFilterExpression: { status: 'PENDING' },
//     name: 'pending_payments_ttl'
//   }
// );

// // ==================== MIDDLEWARE ====================

// // Generate receipt number before saving
// paymentSchema.pre('save', async function(next) {
//   if (this.isNew && !this.receiptNumber && this.status === 'SUCCESS') {
//     const year = new Date().getFullYear();
//     const count = await this.model.countDocuments({
//       status: 'SUCCESS',
//       createdAt: {
//         $gte: new Date(year, 0, 1),
//         $lt: new Date(year + 1, 0, 1)
//       }
//     });
    
//     this.receiptNumber = `RCP-${year}-${String(count + 1).padStart(6, '0')}`;
//   }
  
//   // Calculate final amount
//   if (this.amount !== undefined) {
//     this.finalAmount = this.amount - (this.discountAmount || 0) + (this.taxAmount || 0);
//   }
  
//   this.updatedAt = Date.now();
//   next();
// });

// // Validate status transitions
// paymentSchema.pre('save', function(next) {
//   if (!this.isModified('status')) {
//     return next();
//   }
  
//   const validTransitions = {
//     'PENDING': ['PROCESSING', 'FAILED', 'CANCELLED'],
//     'PROCESSING': ['SUCCESS', 'FAILED', 'CANCELLED'],
//     'SUCCESS': ['REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED'],
//     'FAILED': ['PENDING', 'CANCELLED'], // Allow retry
//     'REFUNDED': [],
//     'PARTIALLY_REFUNDED': ['REFUNDED'],
//     'CANCELLED': [],
//     'DISPUTED': []
//   };
  
//   const oldStatus = this._oldStatus || 'PENDING';
//   const newStatus = this.status;
  
//   if (!validTransitions[oldStatus]?.includes(newStatus)) {
//     const error = new Error(`Invalid payment status transition from ${oldStatus} to ${newStatus}`);
//     error.name = 'ValidationError';
//     return next(error);
//   }
  
//   next();
// });

// // Store old status for transition validation
// paymentSchema.pre('save', function(next) {
//   if (this.isModified('status')) {
//     this._oldStatus = this.status;
//   }
//   next();
// });

// // ==================== INSTANCE METHODS ====================

// // Mark payment as processing
// paymentSchema.methods.markProcessing = function() {
//   if (this.status !== 'PENDING') {
//     throw new Error('Only PENDING payments can be marked as processing');
//   }
  
//   this.status = 'PROCESSING';
//   this.processedAt = Date.now();
  
//   return this.save();
// };

// // Mark payment as successful
// paymentSchema.methods.markSuccess = function(transactionId, gatewayPaymentId) {
//   if (this.status !== 'PROCESSING' && this.status !== 'PENDING') {
//     throw new Error('Payment must be in PENDING or PROCESSING status');
//   }
  
//   this.status = 'SUCCESS';
//   this.transactionId = transactionId;
//   this.gatewayPaymentId = gatewayPaymentId;
//   this.succeededAt = Date.now();
  
//   return this.save();
// };

// // Mark payment as failed
// paymentSchema.methods.markFailed = function(failureCode, failureReason, failureDescription) {
//   if (['SUCCESS', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(this.status)) {
//     throw new Error('Cannot mark this payment as failed');
//   }
  
//   this.status = 'FAILED';
//   this.failureCode = failureCode;
//   this.failureReason = failureReason;
//   this.failureDescription = failureDescription;
//   this.failedAt = Date.now();
  
//   return this.save();
// };

// // Retry failed payment
// paymentSchema.methods.retry = function(newIdempotencyKey) {
//   if (this.status !== 'FAILED') {
//     throw new Error('Only FAILED payments can be retried');
//   }
  
//   if (this.retryCount >= 5) {
//     throw new Error('Maximum retry limit reached');
//   }
  
//   this.status = 'PENDING';
//   this.idempotencyKey = newIdempotencyKey;
//   this.retryCount += 1;
//   this.failureCode = null;
//   this.failureReason = null;
//   this.failureDescription = null;
//   this.failedAt = null;
  
//   return this.save();
// };

// // Cancel payment
// paymentSchema.methods.cancel = function() {
//   if (['SUCCESS', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(this.status)) {
//     throw new Error('Cannot cancel a successful or refunded payment');
//   }
  
//   this.status = 'CANCELLED';
//   this.cancelledAt = Date.now();
  
//   return this.save();
// };

// // Process full refund
// paymentSchema.methods.refund = function(userId, reason, refundTransactionId) {
//   if (this.status !== 'SUCCESS') {
//     throw new Error('Only SUCCESS payments can be refunded');
//   }
  
//   this.status = 'REFUNDED';
//   this.refundAmount = this.finalAmount;
//   this.refundReason = reason;
//   this.refundTransactionId = refundTransactionId;
//   this.refundedAt = Date.now();
//   this.refundedBy = userId;
  
//   return this.save();
// };

// // Process partial refund
// paymentSchema.methods.partialRefund = function(amount, userId, reason, refundTransactionId) {
//   if (!['SUCCESS', 'PARTIALLY_REFUNDED'].includes(this.status)) {
//     throw new Error('Only SUCCESS or PARTIALLY_REFUNDED payments can be partially refunded');
//   }
  
//   if (amount <= 0 || amount > (this.finalAmount - this.refundAmount)) {
//     throw new Error('Invalid refund amount');
//   }
  
//   this.status = 'PARTIALLY_REFUNDED';
//   this.refundAmount += amount;
//   this.refundReason = reason;
//   this.refundTransactionId = refundTransactionId;
//   this.refundedAt = Date.now();
//   this.refundedBy = userId;
  
//   // If fully refunded now
//   if (this.refundAmount >= this.finalAmount) {
//     this.status = 'REFUNDED';
//   }
  
//   return this.save();
// };

// // Add webhook event
// paymentSchema.methods.addWebhookEvent = function(event, eventId) {
//   if (!this.webhookEvents) {
//     this.webhookEvents = [];
//   }
  
//   this.webhookEvents.push({
//     event,
//     eventId,
//     receivedAt: Date.now(),
//     processed: false
//   });
  
//   return this.save();
// };

// // Mark webhook as processed
// paymentSchema.methods.markWebhookProcessed = function(eventId) {
//   if (!this.webhookEvents) {
//     throw new Error('No webhook events found');
//   }
  
//   const webhookEvent = this.webhookEvents.find(we => we.eventId === eventId);
  
//   if (!webhookEvent) {
//     throw new Error('Webhook event not found');
//   }
  
//   webhookEvent.processed = true;
//   return this.save();
// };

// // ==================== STATIC METHODS ====================

// // Get payments for a patient
// paymentSchema.statics.findByPatient = function(patientId, status = null, limit = 20, skip = 0) {
//   const query = { patientId };
  
//   if (status) {
//     query.status = status;
//   }
  
//   return this.find(query)
//     .sort({ createdAt: -1 })
//     .limit(limit)
//     .skip(skip)
//     .populate([
//       { path: 'consultationId', select: 'doctorId scheduledAt' },
//       { path: 'patientId', select: 'name email' }
//     ]);
// };

// // Get payment by consultation ID
// paymentSchema.statics.findByConsultation = function(consultationId) {
//   return this.findOne({ consultationId })
//     .populate([
//       { path: 'consultationId', select: 'doctorId patientId scheduledAt' },
//       { path: 'patientId', select: 'name email phone' }
//     ]);
// };

// // Get payment by idempotency key (for idempotent processing)
// paymentSchema.statics.findByIdempotencyKey = function(idempotencyKey) {
//   return this.findOne({ idempotencyKey })
//     .populate('consultationId');
// };

// // Get successful payments for a patient
// paymentSchema.statics.findSuccessfulForPatient = function(patientId) {
//   return this.find({
//     patientId,
//     status: 'SUCCESS'
//   })
//   .sort({ createdAt: -1 })
//   .populate('consultationId', 'doctorId scheduledAt');
// };

// // Get pending payments (for cleanup)
// paymentSchema.statics.findPendingPayments = function(olderThan = 24) {
//   const cutoffTime = new Date(Date.now() - (olderThan * 60 * 60 * 1000));
  
//   return this.find({
//     status: 'PENDING',
//     createdAt: { $lt: cutoffTime }
//   });
// };

// // Get payment statistics for a doctor (via consultations)
// paymentSchema.statics.getDoctorRevenue = async function(doctorId, startDate, endDate) {
//   const Consultation = mongoose.model('Consultation');
  
//   // Get all consultation IDs for the doctor in date range
//   const consultations = await Consultation.find({
//     doctorId,
//     scheduledAt: {
//       $gte: startDate,
//       $lte: endDate
//     }
//   }).distinct('_id');
  
//   // Get payments for these consultations
//   const payments = await this.find({
//     consultationId: { $in: consultations },
//     status: { $in: ['SUCCESS', 'REFUNDED', 'PARTIALLY_REFUNDED'] }
//   });
  
//   const stats = {
//     totalRevenue: 0,
//     totalRefunds: 0,
//     netRevenue: 0,
//     transactionCount: 0,
//     refundCount: 0
//   };
  
//   payments.forEach(payment => {
//     if (payment.status === 'SUCCESS') {
//       stats.totalRevenue += payment.finalAmount;
//       stats.transactionCount += 1;
//     } else if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
//       stats.totalRefunds += payment.refundAmount;
//       stats.refundCount += 1;
//     }
//   });
  
//   stats.netRevenue = stats.totalRevenue - stats.totalRefunds;
  
//   return stats;
// };

// // Get payment statistics for a patient
// paymentSchema.statics.getPatientStats = async function(patientId) {
//   const stats = await this.aggregate([
//     {
//       $match: { patientId }
//     },
//     {
//       $group: {
//         _id: '$status',
//         count: { $sum: 1 },
//         totalAmount: { $sum: '$finalAmount' }
//       }
//     }
//   ]);
  
//   const result = {
//     total: 0,
//     successful: 0,
//     failed: 0,
//     refunded: 0,
//     pending: 0,
//     totalSpent: 0
//   };
  
//   stats.forEach(stat => {
//     result.total += stat.count;
//     result.totalSpent += stat.totalAmount;
    
//     if (stat._id === 'SUCCESS') {
//       result.successful = stat.count;
//       result.totalSpent = stat.totalAmount;
//     }
//     if (stat._id === 'FAILED') result.failed = stat.count;
//     if (stat._id === 'REFUNDED' || stat._id === 'PARTIALLY_REFUNDED') result.refunded = stat.count;
//     if (stat._id === 'PENDING' || stat._id === 'PROCESSING') result.pending = stat.count;
//   });
  
//   return result;
// };

// // Get payments by status
// paymentSchema.statics.findByStatus = function(status, limit = 100) {
//   return this.find({ status })
//     .sort({ createdAt: -1 })
//     .limit(limit)
//     .populate([
//       { path: 'consultationId', select: 'doctorId patientId scheduledAt' },
//       { path: 'patientId', select: 'name email' }
//     ]);
// };

// // Search payments by transaction ID
// paymentSchema.statics.findByTransactionId = function(transactionId) {
//   return this.findOne({ transactionId })
//     .populate([
//       { path: 'consultationId', select: 'doctorId patientId scheduledAt' },
//       { path: 'patientId', select: 'name email phone' }
//     ]);
// };

// // Get failed payments for analysis
// paymentSchema.statics.getFailedPayments = function(startDate, endDate) {
//   return this.find({
//     status: 'FAILED',
//     createdAt: {
//       $gte: startDate,
//       $lte: endDate
//     }
//   })
//   .sort({ createdAt: -1 })
//   .populate([
//     { path: 'consultationId', select: 'doctorId patientId' },
//     { path: 'patientId', select: 'name email' }
//   ]);
// };

// // ==================== VIRTUAL FIELDS ====================

// // Amount in rupees (if stored in paise)
// paymentSchema.virtual('amountInRupees').get(function() {
//   if (this.currency === 'INR') {
//     return (this.finalAmount / 100).toFixed(2);
//   }
//   return this.finalAmount;
// });

// // Formatted amount with currency
// paymentSchema.virtual('formattedAmount').get(function() {
//   const currencySymbols = {
//     'INR': '₹',
//     'USD': '$',
//     'EUR': '€',
//     'GBP': '£',
//     'AUD': 'A$',
//     'CAD': 'C$',
//     'SGD': 'S$',
//     'AED': 'د.إ'
//   };
  
//   const symbol = currencySymbols[this.currency] || this.currency;
//   return `${symbol}${(this.finalAmount / 100).toFixed(2)}`;
// });

// // Is payment refundable?
// paymentSchema.virtual('isRefundable').get(function() {
//   return this.status === 'SUCCESS' && this.refundAmount === 0;
// });

// // Is payment partially refundable?
// paymentSchema.virtual('isPartiallyRefundable').get(function() {
//   return this.status === 'SUCCESS' && this.refundAmount > 0 && this.refundAmount < this.finalAmount;
// });

// // Refundable amount
// paymentSchema.virtual('refundableAmount').get(function() {
//   if (this.status === 'SUCCESS') {
//     return this.finalAmount - this.refundAmount;
//   }
//   return 0;
// });

// // Payment age in days
// paymentSchema.virtual('ageInDays').get(function() {
//   if (!this.createdAt) return null;
  
//   const oneDay = 24 * 60 * 60 * 1000;
//   return Math.floor((Date.now() - this.createdAt) / oneDay);
// });

// // Can be retried?
// paymentSchema.virtual('canBeRetried').get(function() {
//   return this.status === 'FAILED' && this.retryCount < 5;
// });

// // ==================== EXPORT MODEL ====================
// const Payment = mongoose.model('Payment', paymentSchema);

// module.exports = Payment;