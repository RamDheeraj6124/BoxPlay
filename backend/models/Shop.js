const mongoose = require('mongoose');
const shopsportSchema = require('./Shopsport'); // Assuming shopsportSchema is in a separate file

const shopSchema = new mongoose.Schema({
    sportname:{
        type:String
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
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String
    },
    contact:{
        type:String
    },
    availablesports: [shopsportSchema]
});

module.exports = mongoose.model('Shop', shopSchema);
