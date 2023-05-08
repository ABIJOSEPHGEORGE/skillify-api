const Course = require("../../models/courseSchema");
const User = require('../../models/userSchema')
const { error, success } = require("../../responseApi");
const fs = require('fs')
const io = require('socket.io')
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')


module.exports ={
    uploadVideo:async(req,res)=>{
        try{
            if(req.body?.exist_path){
            
                fs.unlink(req.body.exist_path,(err)=>{
                    if(err){
                        return err;
                    }
                })
            }
            if(req.file){
                const uuid = uuidv4();
                return res.status(201).json(success("OK",{path:req.file.path,videoId:uuid}));
            }else{
                return res.status(415).json(error("Please upload a valid file"));
            }
        }catch(err){
            return res.status(500).json(error("Something wen't wrong, Try after sometimes"));
        }
    },
    
    createCourse:async(req,res)=>{
        try{
         
            req.body.course_image = req.files['course_image'][0].path;
            req.body.promotional_video = req.files['promotional_video'][0].path;
          
            const curriculum = JSON.parse(req.body.curriculum)
            
            // Create new ObjectIds for each curriculum
            req.body.curriculum = curriculum.map((section) => {
                return { 
                    title: section.title,
                    description:section.description,
                    content: section.content.map((contentItem) => {
                        return {
                            ...contentItem,
                            _id: new mongoose.Types.ObjectId()
                        }
                    }),
                    session_id:new mongoose.Types.ObjectId(),
                }
            })
            //fetching the tutor details
            const tutor = await User.findOne({email:req.user});
            req.body.tutor = {first_name:tutor.first_name,last_name:tutor.last_name,profile_image:tutor.profile_image,description:tutor.description,email:tutor.email}
            
            await Course.create(req.body)
            return res.status(200).json(success("Course created successfully"));
        }catch(err){
            
            return res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },
    
    getAllCourses:async(req,res)=>{
        try{
            
            const tutor = req.user;
            const courses = await Course.find({"tutor.email":req.user});
            return res.status(200).json(success("OK",courses));
        }catch(err){
       
            return res.status(500).json(error("Something wen't wrong, Try after sometimes"));
        }
    },
    deletCourse:async(req,res)=>{
        try{
            const id = req.params.id;
            await Course.findOneAndDelete({_id:id})
            return res.status(200).json(success("OK"));
        }catch(err){
            return res.status(500).json(error("Something wen't wrong, Please try after sometimes"))
        }
    },
    editCourse:async(req,res)=>{
        try{
           
            if(Object.keys(req.files).length !== 0 && req.files['course_image']){
                req.body.course_image = req.files['course_image'][0].path;
            }
            if(Object.keys(req.files).length !== 0 && req.files['promotional_video']){
                req.body.promotional_video = req.files['promotional_video'][0].path;
            }
        
            req.body.tutor = JSON.parse(req.body.tutor);
            req.body.reviews = JSON.parse(req.body.reviews);
            const curriculum = JSON.parse(req.body.curriculum)
            // Create new ObjectIds for each curriculum
            req.body.curriculum = curriculum.map((section) => {
                return { 
                    title: section.title,
                    description:section.description,
                    content: section.content.map((contentItem) => {
                        if(!contentItem._id){
                            return {
                                ...contentItem,
                                _id: new mongoose.Types.ObjectId()
                            }
                        }else{
                            return {
                                ...contentItem
                            }
                        }
                        
                    })
                }
            })
            await Course.findOneAndUpdate({_id:req.params.id},req.body,{new:true});
            res.status(200).json(success("OK"));
        }catch(err){
           
            return res.status(500).json(error("Something wen't wrong, Please try after sometimes"))
        }
    },



    
    
}