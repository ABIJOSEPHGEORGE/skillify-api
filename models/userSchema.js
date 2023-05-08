const mongoose = require('mongoose')



const cart = {
    
        type:mongoose.Types.ObjectId,
        ref:'Course'
    
}
const enrolled_course = {
    course_id:{
        type:mongoose.Types.ObjectId,
        ref:'Course'
    },
    progress:{
        type:Number,
        default:0,
    },
    completion_status:{
        type:Array,
    },
    video_progress: [{
        video_id: {
            type: String,
        },
        progress: {
            type: Number,
            default: 0
        },
        watched: {
            type: Boolean,
            default: false
        },
        completed:{
            type:Boolean,
            default:false,
        },
        total_duration:{
            type:Number,
            default:0,
        }
    }],
    quiz_progress: [{
        quiz_id: {
            type: String, // unique ID for the quiz
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    assignment_progress: [{
        assignment_id: {
            type: String, // unique ID for the assignment
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }]
}

const User = mongoose.model('User',new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    email_verified:{
        type:Boolean,
        default:false,
    },
    description:{
        type:String,
    },
    phone:{
        tpe:Number
    },
    password:{
        type:String,
        required:true,
    },
    cart:[
        cart
    ],
    enrolled_course:[
        enrolled_course
    ],
    status:{
        type:Boolean,
        default:false,
    },
    instructor:{
        type:Boolean,
        default:false,
    },
    student:{
        type:Boolean,
        default:true,
    },
    createdAt:{
        type:Date,
        default:new Date(),
    },
    instructor_details:{
       experience_mode:{
        type:String,
       },
       experience_years:{
        type:String,
       }
    },
    payout_method:{
        type:String,
    },
    certificates:{
        type:Array,
    },
    confirmationToken:{
        type:String,
    },
    profile_image:{
        type:String,
    },
    
},{timestamps:true}));

module.exports = User;