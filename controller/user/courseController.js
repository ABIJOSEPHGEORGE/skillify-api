const { default: mongoose } = require("mongoose");
const Course = require("../../models/courseSchema");
const User = require("../../models/userSchema");
const { error, success } = require("../../responseApi");
const { Notes } = require("../../models/noteSchema");
const Assignment = require("../../models/assignmentSchema");
module.exports = {
    getCourses:async(req,res)=>{
        try{
            //configuring filter , sort and pagination
            const category = req.query.category === undefined || req.query.category=== "All" ? {} : { "category.category_name": req.query.category };
            const sub_category = req.query.sub_category === undefined || req.query.sub_category==="All" ? {} : {"sub_category":req.query.sub_category};
            const price = req.query.price === undefined || req.query.price==="All" ? {} : {"isFree":JSON.parse(req.query.price)};
            const searchKey = req.query.search === "null" ? {} : {"course_title" : {$regex:req.query.search,$options: "i"}}
            
            //pagination
            const productPerPage = 5;
            const page = req.query.p??1;

            //sorting
            const sort = parseInt(req.query.sort);
            const status = true;

            const filter = { $and: [category,sub_category,price,searchKey,{status:true}]};

            const courses = await Course.aggregate([
            { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $match: filter },
            {$skip:(page-1)*productPerPage},
            {$limit:productPerPage},
            {$sort:{"course_sale_price":sort}}
            ]);
           
            return res.status(200).json(success("OK",{courses:courses,currentPage:page,hasNextPage:productPerPage*page<courses.length,nextPage:parseInt(page)+1,lastPage:Math.ceil(courses.length/productPerPage)}))
        }catch(err){
         
            res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },
    singleCourse:async(req,res)=>{
        try{
            const course = await Course.findOne({_id:req.params.id})
            return res.status(200).json(success("OK",course))
        }catch(err){
            res.status(500).json(error("Something went wrong, Try after sometimes"))
        }
    },
    isEnrolled:async(req,res)=>{
        try{
            //finding the user
            const user = await User.findOne({email:req.user});
            //finding the course is enrolled or not
            req.params.id = new mongoose.Types.ObjectId(req.params.id).toString()
            const isEnrolled = user.enrolled_course.find(course=>course.course_id.toString()===req.params.id)
            if(isEnrolled){
                return res.status(200).json(success("OK",true))
            }else{
                return res.status(200).json(success("OK",false))
            }
        }catch(err){
           
            return res.status(500).json(error("Something went wrong"));
        }
    },
    enrolledCourses:async(req,res)=>{
        try{
            //fetching all courses enrolled by user
            const courses = await User.findOne({email:req.user}).populate({path:"enrolled_course.course_id"});
            res.status(200).json(success("OK",courses.enrolled_course))
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes"))
        }
    },
    
    newCourseNote:async(req,res)=>{
        try{
            const {_id} = await User.findOne({email:req.user})
            const newNote = {
                userId : _id,
                courseId:req.params.id,
                note:req.body.note,
            }
            
            await Notes.create(newNote);
            res.status(200).json(success("OK"));
        }catch(err){
           
            res.status(500).json(error("Something wen't wrong, Try after sometimes"))
        }
    },
    allNotes:async(req,res)=>{
        try{
            const {_id} = await User.findOne({email:req.user});
            const notes = await Notes.find({userId:_id,courseId:req.params.id});
            res.status(200).json(success("OK",notes))
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes"))
        }
    },



    //Course Reviews
    createReview:async(req,res)=>{
        try{
            const {_id,first_name,last_name,profile_image} = await User.findOne({email:req.user});
            const {desc,rating} = req.body;
            const user_name = `${first_name} ${last_name}`
            let user_profile;
            if(profile_image){
                user_profile = profile_image
            }
            const createdAt = new Date();
            await Course.findOneAndUpdate({_id:req.params.id},{$push:{reviews:{userId:_id,user_name:user_name,rating:rating,review:desc,createdAt:createdAt,profile_image:user_profile}}});
            res.status(201).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong, Try after sometimes"))
        }
    },
    allReviews:async(req,res)=>{
        try{
            const {_id,enrolled_course} = await User.findOne({email:req.user});
            const course = await Course.findOne({_id:req.params.id}).select('reviews');
            const totalReviews = course.reviews.length;
            //checking the current user alreay wrote a review
            let isDone = course.reviews.reduce((acc, courseCurr) => {
                const response = enrolled_course.reduce((acc2, userCurr) => {
                  if (userCurr.course_id.toString() === course._id.toString() && courseCurr.userId.toString() === _id.toString()) {
                    return true;
                  }
                  return acc2;
                }, false);
              
                return acc || response;
              }, false) || (enrolled_course.length === 0);
              const isEnrolled = enrolled_course.find(course=>course.course_id.toString()===req.params.id)
              if(!isEnrolled){
                isDone = true;
              }

            const average = course.reviews.reduce((acc,curr)=>{
                acc = acc+curr.rating;
                return acc/totalReviews;
            },0)
            
            res.status(200).json(success("OK",{reviews:course.reviews,currentUser:isDone,average:average,totalReviews:totalReviews}));
        }catch(err){
          
            res.status(500).json(error("Something wen't wrong, Try after sometimes"))
        }
    },

    //course attending part
    updateVideoProgress:async(req,res)=>{
        const { video_id, progress,completed,watched,total_duration } = req.body;
        try {
           
            //const courseId = new mongoose.Types.ObjectId(req.params.id)
            // Find the relevant enrolled course for the user
            const user = await User.findOne({
                email: req.user,
            });
            const enrolled_course = user.enrolled_course.find((ele)=>ele.course_id.toString()===req.params.id)
         
            // Update the video progress for the relevant video
            const videoIndex = enrolled_course.video_progress.findIndex(
                (video) => video.video_id === video_id
            );
            
            if (videoIndex === -1) {
                // If the video doesn't exist, add it to the video progress array
                enrolled_course.video_progress.push({
                video_id: video_id,
                progress: 0,
                watched: true,
                completed:false,
                });
            } else {
                // Update the existing video progress object
                const videoProgress = enrolled_course.video_progress[videoIndex];
                
                videoProgress.watched = true;
                videoProgress.total_duration = total_duration;

                if(videoProgress.progress<progress){
                    videoProgress.progress=progress
                }else{
                    videoProgress.progress = videoProgress.progress
                }
            }
            
            // Save the updated enrolled course to the database
            await user.save();
            
            // Return a success response
            return res.status(200).json({ message: 'Video progress updated' });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Something went wrong" });
          }
    },
    getVideorogress:async(req,res)=>{
       
            try {
              // Get the course ID and video ID from the request parameters
            //   const courseId = new mongoose.Types.ObjectId(req.params.id);
              const videoId = req.params.videoId;
              
              // Find the relevant enrolled course for the user
              const user = await User.findOne({ email: req.user });
              const enrolled_course = user.enrolled_course.find(
                (course) => course.course_id.toString() === req.params.id
              );
              
              // Find the relevant video progress for the video
              const videoProgress = enrolled_course.video_progress.find(
                (video) => video.video_id === videoId
              );
             
              if (!videoProgress) {
                // If the video progress is not found, return an error
                return res.status(200).json(success("Video progress not found",{found:false}));
              }
              
              // Return the video progress
              return res.status(200).json(success("OK",videoProgress));
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Something went wrong' });
            }
         
    },


    //fetching the active session and content

    findCurrentSession:async(req,res)=> {
        try {
            const user = await User.findOne({email:req.user});
            const courseId =req.params.id;
            const enrolledCourse = user.enrolled_course.find(course => course.course_id.toString() === courseId);
            if (!enrolledCourse) {
            return;
            }
            const completionStatus = enrolledCourse.completion_status;
            const firstIncompleteSession = completionStatus.find(session => !session.completed);
            if (!firstIncompleteSession) {
            return;
            }
            const currentSession = {
            index: completionStatus.indexOf(firstIncompleteSession),
            active_content:firstIncompleteSession.active_content
            };
            const videoProgress = enrolledCourse.video_progress.find(video => video.watched === false);
            if (videoProgress) {
            currentSession.type = 'video';
            currentSession.id = videoProgress.video_id;
            return currentSession;
            }
            const quizProgress = enrolledCourse.quiz_progress.find(quiz => quiz.completed === false);
            if (quizProgress) {
            currentSession.type = 'quiz';
            currentSession.id = quizProgress.quiz_id;
            return currentSession;
            }
            const assignmentProgress = enrolledCourse.assignment_progress.find(assignment => assignment.completed === false);
            if (assignmentProgress) {
            currentSession.type = 'assignment';
            currentSession.id = assignmentProgress.assignment_id;
            return currentSession;
            }
            res.status(200).json(success("OK",{currentSession,videoProgress,quizProgress,assignmentProgress}));
        } catch (error) {
            return res.status(500).json(error("Something wen't wrong..."));
        }
    },
    fetchCourseContent:async(req,res)=>{
        try{
            const courseId = req.params.id;
            const {curriculum} = await Course.findOne({_id:courseId}).select('curriculum');
            res.status(200).json(success("OK",curriculum));
        }catch(err){
           
            res.status(500).json({ message: 'Something went wrong' });
        }
    },
    fetchAllVideoProgress:async(req,res)=>{
        try{
            const courseId = req.params.id;
            const enrolled_course = await User.findOne({email:req.user}).select()
        }catch(err){
            res.status(500).json({ message: 'Something went wrong' });
        }
    },
    contentCompleted:async(req,res)=>{
        try{
            const { courseId, contentId, contentType,sessionId,payload} = req.body;
            
            const user = await User.findOne({email:req.user})
            //finding the course status
            const course_status = user.enrolled_course.map((item,index)=>{
                if(item.course_id.toString()===courseId){
                    return item;
                }
            })
            

            const course_index = course_status.findIndex((ele)=>ele!==undefined);
         
            
            //finding and updating the content in the completion status
            const current_section = course_status[course_index].completion_status.map((section,index)=>{
                if(section.session_id.toString()===new mongoose.Types.ObjectId(sessionId).toString()){
                    return section;
                }
            })

            const curr_index = current_section.findIndex((ele)=>ele!==undefined);


            //submitting the assignment if the content is an assignment
            if(contentType==="assignment"){
                const {_id} = await User.findOne({email:req.user});
                const course = await Course.findOne({_id:courseId});
               
               await Assignment.create({answer:payload.answer,course_id:course._id,user_id:_id,
                tutor:course.tutor.email,assignment_id:contentId,title:payload.question,description:payload.description});
            }

            //updating content status completed
            current_section[curr_index].content.forEach((content,index)=>{
                if(contentType==="lecture"&&content.video_id===contentId){
                    content.completed=true;
                }else if(contentType==="quiz"&&content.quiz_id===contentId){
                    content.completed = true;
                    content.score = payload;
                }else if(contentType==="assignment"&&content.assignment_id===contentId){
                    content.completed = true;  
                }
            })


           
            

            //updating the active content
            const incomplete_content = current_section[curr_index].content.reduce((acc,curr,index)=>{
                if(!curr.completed){
                    return index;
                }else{
                    return -1;
                }
            },-1)

            if(incomplete_content!==-1){
                current_section[curr_index].active_content = incomplete_content+1;
            }

           

            //checking whether all content in the section has been completed
            const status = current_section[curr_index].content.every(obj=>obj.completed);
            //if all true update the current session as completed
            if(status){
                current_section[curr_index].completed = true;
            }

            //calculating the percentage for updating the progress
            const total_sessions = course_status[course_index].completion_status.length;
            const total_content = course_status[course_index].completion_status.reduce((acc,curr)=>{
                    acc = acc + curr.content.length
                    return acc;
            },0);
            const total_completed_session = course_status[course_index].completion_status.reduce((acc,curr)=>{
                if(curr.completed){
                    acc = acc +1;
                }
                return acc;
            },0)
            const total_completed_content = course_status[course_index].completion_status.reduce((acc,curr)=>{
                const completed =curr.content.reduce((con,concurr)=>{
                    if(concurr.completed){
                        con = con+1;
                    }
                    return con
                },0)
                acc = acc +completed;
                return acc;
            },0)

            //updatin gthe course progress
            const overallPercentage = (total_completed_content / total_content) * (total_completed_session / total_sessions) * 100;
            //updating the totalProgress
            course_status[course_index].progress = Math.floor(overallPercentage)
           
            user.enrolled_course[course_index] = course_status[course_index]

            
            //updating the user 
            await user.save()
            

            res.status(200).json(success("OK"))

        }catch(err){
          
            res.status(500).json(error("Something wen't wrong..."))
        }
    },
    courseProgress:async(req,res)=>{
        try{
            const {enrolled_course} = await User.findOne({email:req.user}).select("enrolled_course")
            const course = await enrolled_course.find((ele)=>ele.course_id.toString()===req.params.courseId);
            res.status(200).json(success("OK",course?.progress))
        }catch(err){
          
            res.status(500).json(error("Something went wrong..."))
        }
    },
    quizProgress:async(req,res)=>{
        try{
           
            const user = await User.findOne({email:req.user});
          
            const course = user.enrolled_course.find((ele)=>ele.course_id.toString()===req.params.courseId)
            
           
            
            const current_section = course.completion_status.find((ele)=>ele.session_id.toString()===req.params.sessionId)
        
           
            const quizData = current_section.content.find((ele)=>ele.quiz_id===req.params.contentId)
            res.status(200).json(success("OK",quizData))
        }catch(err){
        
            res.status(500).json(error("Something went wwrong..."))
        }
    },



    //Assignment
    assignmentProgress:async(req,res)=>{
        try{
             const user = await User.findOne({email:req.user});
             const course = user.enrolled_course.find((ele)=>ele.course_id.toString()===req.params.courseId);

             const current_section = course.completion_status.find((ele)=>ele.session_id.toString()===req.params.sessionId);
             const assignmentData = current_section.content.find((ele)=>ele.assignment_id===req.params.contentId)
             
             //getting the assignment status and feedback if completed
             const assignment = await Assignment.findOne({assignment_id:assignmentData.assignment_id});
             if(assignment){
                assignmentData.status = assignment.status;
                if(assignment?.status){
                    assignmentData.feedback = assignment.feedback;
                }
             }
             
             res.status(200).json(success("OK",assignmentData));
        }catch(err){
           
            res.status(500).json(error("Something went wrong..."))
        }
    },



}