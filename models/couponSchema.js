const { default: mongoose } = require('mongoose');
const mognoose = require('mongoose');

const Coupon = mongoose.model('Coupon',new mongoose.Schema({
    coupon_id:{
        type:String,
        required:true,
    },
    users_allowed:{
        type:Number,
        required:true,
    },
    minimum_purchase:{
        type:Number,
        required:true,
    },
    expiry_date:{
        type:Date,
        required:true,
    },
    discount_amount:{
        type:Number,
        required:true,
    },
    maximum_discount_amount:{
        type:Number,
        required:true,
    },
    status:{
        type:Boolean,
        default:false,
    }
}))

module.exports = Coupon;