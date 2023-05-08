const { error, success } = require("../../responseApi")
const Courses = require('../../models/courseSchema');
const Course = require("../../models/courseSchema");


module.exports =  {
    allCourses:async(req,res)=>{
        try{
            const courses = await Courses.find({});
            res.status(200).json(success("OK",courses))
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes..."))
        }
    },
    singleCourse:async(req,res)=>{
        try{
            const course = await Course.findOne({_id:req.params.id});
            res.status(200).json(success("OK",course))
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes..."))
        }
    },
    approveCourse:async(req,res)=>{
        try{
            const response = await Course.findOneAndUpdate({_id:req.params.id},{isApproved:'approved',status:true});
            
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes..."))
        }
    },
    rejectCourse:async(req,res)=>{
        try{
            const response = await Course.findOneAndUpdate({_id:req.params.id},{isApproved:"rejected",status:false,reason:req.body.reason},{upsert:true,new:true});
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes..."))
        }
    },
    courseStatus:async(req,res)=>{
        try{
            await Course.findOneAndUpdate({_id:req.params.id},{status:req.query.status});
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes..."))  
        }
    }
}