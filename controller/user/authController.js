const User = require("../../models/userSchema");
const emailValidator = require('deep-email-validator');
const bcrypt  = require('bcrypt');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const jwt = require('jsonwebtoken')
const { success, error, validation } = require("../../responseApi");

module.exports = {
    // Handling user registration
    userRegistration:async(req,res)=>{
        try{
            const {first_name,last_name,email,password} = req.body;
            // checking whether the email exist
            const isExist = await User.findOne({email:email});
            if(isExist){
                return res.status(409).json({msg:'Email already exist'});
            }
           
            // bcrypting the password
            const hash = await bcrypt.hash(password,10);

            // creating the user
            const user = await new User({
                first_name : first_name,
                last_name:last_name,
                email:email,
                password : hash
            }).save();

            //generating the confirmation link
            await generateEmailLink(user,'register');
            return res.status(201).json({msg:`A link to verify your account has been sent to ${email}`,user:email});
            

        }catch(err){
            res.status(500).json({msg:'something went wrong'});
        }
    },
    // verify email confirmation link
    verifyEmail:async(req,res)=>{
        try{
            //getting the token and user
            const {token,user} = req.body;
            
            // verifying the user exist
            const isExist = await User.findById(user);
            if(!isExist){
                return res.status(404).json({msg:'User not found, Please try again...'})
            }
            // verifying the token
            if(isExist.confirmationToken === token)
            {
                isExist.email_verified = true;
                isExist.confirmationToken = null;
                await isExist.save();
                return  res.status(200).json({msg:'Email verified successfully',user:isExist.first_name})
            }else if(isExist.email_verified===true){
                return res.status(409).json({msg:'Email has been already verified.'})
            }else{
                return res.status(400).json({msg:'Confirmation link is not valid...'})
            }
            
        }catch(err){
            res.status(500).json({msg:'something went wrong'});
        }
    },
    // verify email confirmation link
    verifyResetEmail:async(req,res)=>{
        try{
            //getting the token and user
            const {token,user} = req.body;
            
            // verifying the user exist
            const isExist = await User.findById(user);
            if(!isExist){
                return res.status(404).json({msg:'User not found, Please try again...'})
            }
            // verifying the token
            if(isExist.confirmationToken === token)
            {
                isExist.confirmationToken = null;
                await isExist.save();
                return  res.status(200).json({msg:'Email verified successfully',user:isExist.first_name})
            }
            
            
        }catch(err){
            res.status(500).json({msg:'something went wrong'});
        }
    },
    // resend email verification link
    resendEmail:async(req,res)=>{
        // resending the email confirmation link
        try{
            const isExist = await User.findOne({email:req.params.id});
            if(!isExist){
                return res.status(404).json({msg:`A account with this email doesn't exist`})
            }
            //getting action
            const action = req.query.action;
            
            await generateEmailLink(isExist,action);
            return res.json({msg:`A link to verify your account has been sent to ${isExist.email}`,user:isExist.email});
        }catch(err){
            return res.status(500).json({msg : 'Something went wrong try again...'})
        } 
    },
    //Handling the user login
    userLogin:async(req,res)=>{
        try{
            const {email,password} = req.body;
            // checking whether the user exist
            const isExist = await User.findOne({email:email});
            if(!isExist){
                return res.status(401).json({msg:"Email doesn't exist, Please try again..."})
            }
            const checkPassword = await bcrypt.compare(password,isExist.password);
            if(!checkPassword){
                return res.status(401).json({msg:"Invalid Credentials, Please try again..."})
            }
            // checking whether user email is verified
            if(!isExist.email_verified){
                return res.status(403).json({msg:'Please verify your email before login'})
            }
            //checking the user status
            if(isExist.status){
                return res.status(401).json(error("Your account has been blocked."));
            }
            //setting up the user role
            let role;
            if(isExist.instructor===true){
                role = 'instructor'
            }else{
                role = 'user'
            }
            // generating jwt token
            const token = jwt.sign({user:isExist.email,role:role},process.env.JWT_SECRET,{expiresIn:"24hr"})
            return res.status(200).json(success('OK',{token:token},res.statusCode))
        }catch(err){
           
            res.status(500).json({msg:'Something went wrong, Please try after sometimes'})
        }
    },
    //verifying the token
    verifyToken:(req,res)=>{
        try{
            const decode = jwt.verify(req.body.token,process.env.JWT_SECRET);
            return res.status(200).json({msg:'user authenticated successfully...',user:decode});
        }catch(err){
            return res.status(403).json({msg:'Invalid authentication token...'})
        }
        
    },
        //handling forgot password
    forgotPassword:async(req,res)=>{
        try{
           const {email} = req.body;
            // checking whether user exist with given email
            const isExist =  await User.findOne({email:email});
            if(!isExist){
                return res.status(404).json(error('No user found with the provided email'));
            }
            //generating the confirmation link
            await generateEmailLink({_id:isExist._id,email:isExist.email},'reset');
            return res.status(201).json({msg:`A link to verify your account has been sent to ${email}`,user:email});

        }catch(err){
            res.status(500).json(error('Something went wrong,Try after sometimes...'))
        }
    },
    resetPassword:async(req,res)=>{
        try{
            const {password,user} = req.body;
            // checking whether user exist 
            const isExist = await User.findOne({_id:user});
            if(!isExist){
                return res.status(404).json(error("User not found, Try again..."));
            }
            // hashing the new password
            const hash = await bcrypt.hash(password,10);
            //updating the password
            isExist.password = hash;
            await isExist.save()
            return res.status(200).json(success("OK"));
            
        }catch(err){
            res.status(500).json(error('Something went wrong,Try after sometimes...'))
        }
    },
    fetchUserInfo:async(req,res)=>{
        try{
            const user = await User.findOne({email:req.user});
            res.status(200).json(success("OK",{first_name:user.first_name,profile_image:user.profile_image}))
        }catch(err){
            res.status(500).json(error("Something wen't wrong..."))
        }
    }
}

async function generateEmailLink({_id,email},action){
    try{
        //generating confirmation token
        const token =  uuid.v4();

        //updating the token in user database
        const response = await User.findOneAndUpdate({email:email},{confirmationToken:token},{new:true});

        //configuring email with nodemailer transporter
        const smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.PASSWORD
            }
        };
        const transporter = nodemailer.createTransport(smtpConfig)

        const confirmationLink = action==="register" ? `${process.env.DOMAIN}/user/confirm?token=${token}&id=${_id}` 
        : `${process.env.DOMAIN}/user/reset?token=${token}&id=${_id}` 
        const mailOptions = {
            to:email,
            subject:'Confirm your email address',
            text:`Click on this link to confirm your email address : ${confirmationLink}`
        }

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                return error;
            }
            return info.response;
        })
    }catch(err){
        return err;
    }



}