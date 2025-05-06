
const mongoose = require('mongoose');

const shopsportSchema = new mongoose.Schema({
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport'
    },
    groundname: { 
        type: String, 
        required: true, 
    },
    priceperhour: { 
        type: Number, 
        default: 0 
    },
    maxplayers: {
        type: [Number], 
        default: [0]
    },
    image: {
        data: Buffer,
        ContentType: String
    },
    grounddimensions: { 
        length: { type: Number },
        width: { type: Number }
    },
    availability: [{
        day: { 
            type: String, 
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        times: [{
            start: { type: String, required: true },  
            end: { type: String, required: true } ,    
        }]
    }],
    facilities: [{
        type: String
    }],
    surfacetype: {
        type: String,
        enum: ['Grass', 'Turf', 'Clay', 'Hard', 'Synthetic'],
        default: 'Grass'
    },
    reviews: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        date: { type: Date, default: Date.now }
    }],
    status: { 
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active'
    },
    verify: {
        type: Boolean,
        default: false
    },
    appliedforverification: {
        type: Boolean,
        default: false
    } 
}); 
/*
// Indexes for optimization
shopsportSchema.index({ sport: 1 }); // Index for sport reference
shopsportSchema.index({ groundname: 1 }); // Index for ground names
shopsportSchema.index({ verify: 1 }); // Index for verification status
shopsportSchema.index({ appliedforverification: 1 }); // Index for applied for verification
shopsportSchema.index({ 'availability.day': 1 }); // Index for availability by day
shopsportSchema.index({ 'reviews.rating': 1 }); // Index for review ratings
*/
module.exports = shopsportSchema;