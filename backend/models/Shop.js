
const mongoose = require('mongoose');
const shopsportSchema = require('./Shopsport'); // Assuming shopsportSchema is in a separate file
const City = require('./City');

const shopSchema = new mongoose.Schema({
    sportname: {
        type: String
    },
    owner: {
        type: String,
        required: true,
    },
    shopname: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true, // Unique index
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String
    },
    contact: {
        type: String
    },
    availablesports: [shopsportSchema],
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    locationlink: {
        type: String
    }
});

// Indexes for optimization
shopSchema.index({ email: 1 }, { unique: true }); // Unique index for email
shopSchema.index({ 'availablesports.verify': 1 }); // Index for verified sports grounds
shopSchema.index({ 'availablesports.groundname': 1 }); // Index for ground names
shopSchema.index({ shopname: 1 }); // Index for shop names
shopSchema.index({ sportname: 1 }); // Index for sport names

module.exports = mongoose.model('Shop', shopSchema);