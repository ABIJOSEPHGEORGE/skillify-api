const { success, error, validation } = require("../../responseApi");
const User = require("../../models/userSchema");
const jwt = require('jsonwebtoken')
module.exports = {
    adminLogin:(req,res)=>{
        try{
            const {email,password} = req.body;
            if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASS){
                const token = jwt.sign({user:email,role:'admin'},process.env.JWT_SECRET)
                return res.status(200).json(success('OK',{token:token}))
            }else{
                return res.status(403).json(error('Invalid Email or Password, Try again...'))
            }
        }catch(err){
            return res.status(500).json(error('Something went wrong, Try after sometimes'))
        }
    },
    getAllUsers:async(req,res)=>{
        try{
            const users = await User.find({instructor:false});
            return res.status(200).json(success("OK",{users:users}));
        }catch(err){
            return res.status(500).json(error('Something went wrong, Try after sometimes'));
        }
    },
    //blocking and unblocking the users
    updateUserStatus:async(req,res)=>{
        try{
            //getting the user id and status
            const user = req.params.id;
            const status = req.query.status;
            //checking whether user exist 
            const isExist = await User.findOne({_id:user});
            if(!isExist){
                return res.status(404).json(error('User not found'));
            }
            //updating the user status
            isExist.status = status;
            await isExist.save()
            return res.status(200).json(success('OK'))
        }catch(err){
            res.status(500).json(error('Something went wrong, Please try after sometimes'));
        }
    },
    getAllInstructors:async(req,res)=>{
        try{
            const users = await User.find({instructor:true});
            return res.status(200).json(success("OK",{instructors:users}));
        }catch(err){
            return res.status(500).json(error('Something went wrong, Try after sometimes'));
        }
    },
}