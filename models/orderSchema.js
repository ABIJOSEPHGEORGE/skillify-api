const mongoose = require('mongoose');
const Order = mongoose.model('Order',new mongoose.Schema({
    order_id:{
        type:String,
        required:true,
    },
    bill_amount:{
        type:Number,
        required:true
    },
    billing_address:{
        first_name:{
            type:String,
            required:true,
        },
        last_name:{
            type:String,
            required:true,
        },
        state:{
            type:String,
            required:true,
        },
        country:{
            type:String,
            required:true
        },
        email:{
            type:String,
        }
    },
    order_date:{
        type:Date,
        required:true,
    },
    courses:{
        type:Array,
        required:true
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['pending','success','failed'],
        default:'pending'
    }
}))


module.exports = Order;