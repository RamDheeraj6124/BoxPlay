
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailveified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiration: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    contact: {
        type: String
    },
    revenuepercentage: {
        type: Number,
        default: 0
    },
    totalrevenue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexing fields for optimization
userSchema.index({ email: 1 });               // Unique user lookup
userSchema.index({ username: 1 });            // Username-based search
userSchema.index({ role: 1 });                // Filtering by role
userSchema.index({ revenuepercentage: -1 });  // Sort/filter by revenue share (admin)
userSchema.index({ totalrevenue: -1 });       // Sort by top earners (admin)

// Create and export the User model
module.exports = mongoose.model('User', userSchema);