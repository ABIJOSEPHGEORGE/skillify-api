
const {success, error} = require('../../responseApi')
const Assignments = require('../../models/assignmentSchema');
const User = require('../../models/userSchema');
const Course = require('../../models/courseSchema');
module.exports =  {
    allAssignments:async(req,res)=>{
        try{
            const assignments = await Assignments.aggregate([
                {
                  $match: { tutor: req.user }
                },
                {
                  $lookup: {
                    from: "courses",
                    localField: "course_id",
                    foreignField: "_id",
                    as: "course"
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                  }
                },
                {
                  $project: {
                    assignmentData: "$$ROOT",
                    "course.course_title": 1,
                    "user.first_name": 1
                  }
                }
              ]);

            const assignmentData = assignments.map((item)=>{
                item.assignmentData.course = item.course[0].course_title;
                item.assignmentData.user = item.user[0].first_name;
                return item.assignmentData;
            })
            
            res.status(200).json(success("Ok",assignmentData))
        }catch(err){
       
            res.status(500).json(error("Something went wrong..."))
        }
    },
    updateFeedBack:async(req,res)=>{
        try{
            await Assignments.findOneAndUpdate({_id:req.params.id},{status:true,feedback:req.body.feedback});
            res.status(200).json(success("OK"))
        }catch(err){
            res.status(500).json(error("Something went wrong..."))
        }
    }
}