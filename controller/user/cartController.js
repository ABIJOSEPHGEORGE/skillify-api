const { default: mongoose } = require("mongoose")
const Course = require("../../models/courseSchema")
const User = require("../../models/userSchema")
const { error, success } = require("../../responseApi")
const Coupon = require("../../models/couponSchema")

module.exports = {
    addToCart:async(req,res)=>{
        try{
            //checking whether product exist
            const isExist = await Course.findOne({_id:req.params.id})
            if(!isExist){
                return res.status(404).json(error("Course not found"));
            }
            //adding the item to cart
            await  User.findOneAndUpdate({email:req.user},{$addToSet:{cart:req.params.id}})
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },
    existInCart:async(req,res)=>{
        try{
            const isExist = await User.findOne({email:req.user,cart:req.params.id})
            if(isExist){
                return res.status(200).json(success("OK",true))
            }else{
                return res.status(200).json(success("OK",false))
            }
        }catch(err){
            res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },
    cartItems:async(req,res)=>{
        try{
            //getting the cart items
            const cartItems = await User.findOne({email:req.user}).populate({path:'cart',model:Course})
            //calculating the cart total
            const subTotal = cartItems.cart.reduce((acc,curr)=>{
                acc = acc + curr.course_sale_price;
                return acc;
            },0)
            res.status(200).json(success("OK",{cartItems:cartItems.cart,subTotal:subTotal}))
        }catch(err){
            res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },
    deleteCartItem:async(req,res)=>{
        try{
            const courseId = parseInt(req.params.id)
            await User.findOneAndUpdate({email:req.user},{$pull:{cart:req.params.id}});
            return res.status(200).json(success("OK"));
        }catch(err){
           
            res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },

}