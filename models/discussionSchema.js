const { default: mongoose } = require("mongoose");


const message = {
    message:{
        type:String,
    },
    first_name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
    },
    vote:{
        type:Number,
        default:0,
    }
}

const Discussion = mongoose.model('Discussion',new mongoose.Schema({
    course_id:{
        type:mongoose.Types.ObjectId,
        required:true,
    },
    students:{
        type:Array,
    },
    messages:[
        message
    ]
     
}))

module.exports = Discussion;