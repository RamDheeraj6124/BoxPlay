const mongoose = require('mongoose');
const stateschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    cities:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'City'}]
})

module.exports=mongoose.model('State',stateschema);