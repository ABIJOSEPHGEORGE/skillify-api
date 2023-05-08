const mongoose = require('mongoose');

const Announcements = mongoose.model('Announcements',new mongoose.Schema({
    courseId:{
        type:mongoose.Types.ObjectId,
        ref:'Course',
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    tutor:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        required:true,
    }
}))

module.exports = Announcements;
