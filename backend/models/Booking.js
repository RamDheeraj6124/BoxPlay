const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    groundname: {
        type: String,
    },
    date: {
        type: Date,
        required: true
    },
    platformfee: {
        type: Number
    },
    groundfee: {
        type: Number
    },
    timeSlot: {
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    },
    amountPaid: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date
    },
    transactionId: {
        type: String
    },
    cancellationReason: {
        type: String,
    },
    cancellationDate: {
        type: Date
    },
    refundAmount: {
        type: Number,
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: {
            type: String
        },
        feedbackDate: {
            type: Date
        }
    }
}, { timestamps: true });

// Indexes for optimization
bookingSchema.index({ user: 1 }); // Index for user queries
bookingSchema.index({ date: 1 }); // Index for date queries
bookingSchema.index({ platformfee: 1 }); // Index for revenue calculations (platform fee)
bookingSchema.index({ groundfee: 1 }); // Index for revenue calculations (ground fee
bookingSchema.index({ 'feedback.rating': 1 }); // Index for feedback rating queries
bookingSchema.index({ user: 1, date: 1 }); // Composite index for user and date
module.exports = mongoose.model('Booking', bookingSchema);