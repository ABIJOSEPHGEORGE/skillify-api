const jwt = require('jsonwebtoken');
const { success, error, validation } = require("../responseApi");
const User = require('../models/userSchema');

module.exports = {
    //jwt token verification middleware
    tokenVerification:async(req,res,next)=>{
        try{
            const token = req.headers.authorization;
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            if(!decode){
                return res.status(403).json(error('User is unauthorized, Please login as a valid user'))
            }
            
            req.user = decode.user;
            next()
        }catch(err){

            return res.status(500).json(error('Something went wrong, Try after sometimes'),res.statusCode)
        }
    },
    isBlocked:async(req,res,next)=>{
        try{
            const user = await User.findOne({email:req.user});
            if(user.status){
                return res.status(403).json(error("Your account has been blocked"))
            }else{
                next()
            }
        }catch(err){
            return res.status(500).json(error('Something went wrong, Try after sometimes'),res.statusCode)
        }
    }
}