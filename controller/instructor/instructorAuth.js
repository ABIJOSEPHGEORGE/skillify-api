const User = require("../../models/userSchema");
const { success, error, validation } = require("../../responseApi");
const jwt = require('jsonwebtoken');

module.exports = {
    //instructor signup
    // get onboarding experience details
    // store details
    // update user status
    instructorSignup:async(req,res)=>{
        try{
            const {experience_mode,experience_years} = req.body;
            //updating the experience details
            const response =  await User.findOneAndUpdate({email:req.user},{instructor_details:req.body,instructor:true},{new:true});
            if(response.instructor){
                const token = jwt.sign({user:response.email,role:"instructor"},process.env.JWT_SECRET,{expiresIn:"24hr"})
                return res.status(200).json(success("OK",{token:token},res.statusCode))
            }
        }catch(err){
            res.status(500).json(error("Something went wrong, Please try after sometimes..."))
        }
    }
}