const mongoose = require('mongoose');

const Course = mongoose.model('Course',new mongoose.Schema({
    course_title:{
        type:String,
        required:true
    },
    course_subtitle:{
        type:String,
        required:true
    },
    course_description:{
        type:String
    },
    status:{
        type:Boolean,
        default:false,
    },
    isApproved:{
        type:String,
        default:"pending",
    },
    course_image:{
        type:String,
        required:true
    },
    promotional_video:{
        type:String,
        required:true,
    },
    course_welcome_message:{
        type:String
    },
    course_completion_message:{
        type:String
    },
    course_price:{
        type:Number,
    },
    course_sale_price:{
        type:Number
    },
    isFree:{
        type:Boolean,
        default:false
    },
    reviews:[],
    curriculum:{
        type:Array,
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref: 'Category',
    },
    sub_category:{
        type:String,
    },
    tutor:{
        type:Object,
        required:true,
    }

}))

module.exports = Course;