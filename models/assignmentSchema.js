const mongoose = require('mongoose');

const Assignment =mongoose.model('Assignment',new mongoose.Schema({
    course_id:{
        type:mongoose.Types.ObjectId,
        ref:'Course',
        required:true,
    },
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true,
    },
    assignment_id:{
        type:String,
        required:true,
    },
    tutor:{
        type:String,
        required:true,
    },
    answer:{
        type:String,
        required:true,
    },
    feedback:{
        type:String,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:false
    },

}))

module.exports = Assignment;