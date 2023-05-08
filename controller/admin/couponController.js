const Coupon = require('../../models/couponSchema')
const {error, success} = require('../../responseApi')
module.exports = {
    createCoupon:async(req,res)=>{
        try{
            req.body.coupon_id = req.body.coupon_id.split(" ").join("-").toUpperCase()
            await Coupon.create(req.body);
            res.status(200).json(success("CREATED"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong..."))
        }
    },
    allCoupons:async(req,res)=>{
        try{
            const coupons = await Coupon.find({});
            res.status(200).json(success("OK",coupons))
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    singleCoupon:async(req,res)=>{
        try{
            const coupon = await Coupon.findOne({_id:req.params.id})
            res.status(200).json(success("OK",coupon))
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    updateCoupon:async(req,res)=>{
        try{
            await Coupon.findOneAndUpdate({_id:req.params.id},req.body);
            res.status(200).json(success("UPDATED"));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    listAndUnlist:async(req,res)=>{
        try{
            await Coupon.findOneAndUpdate({_id:req.params.id},{status:req.query.status});
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong..."))
        }
    },
}