const Announcements = require("../../models/announcementsSchema");
const Course = require("../../models/courseSchema");
const User = require("../../models/userSchema");
const { error, success } = require("../../responseApi")

module.exports  = {
    createAnnouncement:async(req,res)=>{
        try{
            await Announcements.create({courseId:req.body.course,message:req.body.announcement,tutor:req.user,title:req.body.title,createdAt:new Date()})
            res.status(200).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    allAnnouncements:async(req,res)=>{
        try{
            const announcements = await Announcements.find({tutor:req.user}).populate('courseId');
            res.status(200).json(success("OK",announcements));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    courseAnnouncements:async(req,res)=>{
        try{
            const announcements =  await Announcements.find({courseId:req.params.courseId}).sort({createdAt:1})
            res.status(200).json(success("OK",announcements));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    deleteAnnouncement:async(req,res)=>{
        try{
            await Announcements.findOneAndDelete({_id:req.params.id});
            res.status(200).json(success("DELETED"));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    },
    updateAnnouncement:async(req,res)=>{
        try{
            await Announcements.findOneAndUpdate({_id:req.params.id},{message:req.body.announcement,title:req.body.title,courseId:req.body.course});
            res.status(200).json(success("UPDATED"));
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    }
}