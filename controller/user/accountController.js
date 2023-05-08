const User = require('../../models/userSchema')
const {success, error} = require('../../responseApi')
const fs = require('fs');
const bcrypt = require('bcrypt');
const Course = require('../../models/courseSchema');
module.exports = {
    fetchAccountDetails:async(req,res)=>{
        try{
            const {first_name,last_name,description,email} = await User.findOne({email:req.user})
            res.status(200).json(success("OK",{first_name,last_name,description,email}));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    updateProfileInfo:async(req,res)=>{
        try{
            const {first_name,last_name,description} = req.body;
            await User.findOneAndUpdate({email:req.user},{first_name,last_name,description});
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    updateProfileImage:async(req,res)=>{
        try{
            //finding and deleting the previous profile image
            const prev_img = await User.findOne({email:req.user}).select("profile_image");
            if(prev_img.profile_image){
                fs.unlinkSync(prev_img.profile_image);
            }
            const user = await User.findOne({email:req.user});
            user.profile_image = req.file.path;
            //if user is an instrcutor updating the profile in user courses
            if (user.instructor) {
                const courses = await Course.find({ 'tutor.email': req.user });
                courses.forEach(async (course) => {
                    await Course.findOneAndUpdate({_id:course._id},{'tutor.profile_image':req.file.path})
                });
            }
            await user.save()

            res.status(200).json(success("Profile Image updated successfully",req.file.path));
        }catch(err){
          
            res.status(500).json(error("Something went wrong..."))
        }
    },
    getProfileImage:async(req,res)=>{
        try{
            const {profile_image} = await User.findOne({email:req.user}).select('profile_image');
            res.status(200).json(success("OK",profile_image))
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    resetPassword:async(req,res)=>{
        try{
            const {existing_password,new_password} = req.body;
            //comparing the exisiting password 
            const existPass = await User.findOne({email:req.user}).select('password');
            const compare = await bcrypt.compare(existing_password,existPass.password);
            if(!compare){
                return res.status(403).json(error('Invalid Existing Password...'));
            }else{
                const hash = await bcrypt.hash(new_password,10);
                await User.findOneAndUpdate({email:req.user},{password:hash});
                res.status(200).json(success("Password updated successfully"));
            }
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    }
}