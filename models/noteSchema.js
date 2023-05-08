const mongoose = require('mongoose');


const Notes = mongoose.model('Notes', new mongoose.Schema({
    courseId:{
        type:mongoose.Types.ObjectId,
        ref:'Course'
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    note:{
        type:String,
        required:true,
    }
}))

module.exports = {
    Notes
}