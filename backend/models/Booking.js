const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    groundname: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    platformfee: {
        type: Number,
        required: true
    },
    groundfee: {
        type: Number,
        required: true
    },
    timeSlot: {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    },
    amountPaid: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date,
        default: null
    },
    transactionId: {
        type: String,
        default: null
    },
    cancellationReason: {
        type: String,
        default: null
    },
    cancellationDate: {
        type: Date,
        default: null
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: {
            type: String,
            maxlength: 500
        },
        feedbackDate: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true });
/*
// Indexes for optimization
bookingSchema.index({ user: 1 }); // Index for user queries
bookingSchema.index({ date: 1 }); // Index for date queries
bookingSchema.index({ platformfee: 1 }); // Index for revenue calculations (platform fee)
bookingSchema.index({ groundfee: 1 }); // Index for revenue calculations (ground fee
bookingSchema.index({ 'feedback.rating': 1 }); // Index for feedback rating queries
bookingSchema.index({ user: 1, date: 1 }); // Composite index for user and date
*/
module.exports = mongoose.model('Booking', bookingSchema);