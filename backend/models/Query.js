const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String
    },
    message: {
        type: String
        
    },
    replied:{
        type:Boolean,
        default: false
    }
});



module.exports = mongoose.model('Query', querySchema);
