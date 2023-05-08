const Discussion = require("../../models/discussionSchema");
const User = require("../../models/userSchema");
const { error, success } = require("../../responseApi")

module.exports = {
    createMessage:async(req,res)=>{
        try{
            //getting the user detail
            const user = await User.findOne({email:req.user});
            //creating the message
            const message = {
                message : req.body,
                student_id:user._id,
                createdAt:new Date(),
            }
            await Discussion.findOneAndUpdate({course_id:req.params.id},{$push:{messages:message},$addToSet:{students:user._id}});
            res.status(201).json(success("OK"));
        }catch(err){
            res.status(500).json(error("Something wen't wrong Please try again later"));
        }
    },
    socketioConnection:(io)=>{
        io.on("connection",(socket)=>{
           //joining the user to the course discussion
           socket.on('join_discussion',(courseId)=>{
                socket.join(courseId)
                
           })

           //receiving the message and storing it to db
           socket.on("send_message",async({message,courseId,student})=>{
            try{
                
                const roomId = courseId;
                const {_id,first_name,email} = await User.findOne({email:student})
                const newMessage = {
                    message,
                    first_name:first_name,
                    email:email,
                    createdAt:new Date(),
                }
                
                
                //saving the message to db
                const discussion = await Discussion.findOneAndUpdate({course_id:courseId},
                    {$push:{messages:newMessage},$addToSet:{students:_id}},{upsert:true,new:true});
               
                 //emit the message to all users in the same discussion
                 socket.to(roomId).emit('receive_message',newMessage);
                
            }catch(err){
                console.log(err)
            }
           
           })
        })
    },
    getAllDiscussions:async(req,res)=>{
        try{
            const discussions = await Discussion.findOne({course_id:req.params.id})
            res.status(200).json(success("OK",discussions));
        }catch(err){
            res.status(500).json(error("something wen't wrong try after sometimes..."));
        }
    }
}