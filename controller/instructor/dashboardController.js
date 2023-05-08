const Course = require('../../models/courseSchema');
const Orders = require('../../models/orderSchema');
const {error, success} = require('../../responseApi');
module.exports = {
    dashboardContents:async(req,res)=>{
        try{
            //finding the total approved course
            const approved_courses = await Course.find({'tutor.email':req.user,status:true});
            const pending_course = await Course.find({'tutor.email':req.user,status:false});
            
            
            // Find all courses taught by the instructor
            const courses = await Course.find({ 'tutor.email': req.user }, '_id');

            if (!courses.length) {
           
            return;
            }

            const courseIds = courses.map(course => course._id);

            // Find all orders that include any of the courses' IDs and have a status of 'success'
            const orders = await Orders.find({ courses: { $in: courseIds }, status: 'success' }, 'bill_amount');

            if (!orders.length) {
            
            return;
            }

            const totalAmount = orders.reduce((sum, order) => sum + order.bill_amount, 0);
            const afterAdmin = totalAmount - totalAmount/100*15
            
             
            res.status(200).json(success("OK",{approved_courses:approved_courses.length,pending_courses:pending_course.length,totalAmount,afterAdmin}))
        }catch(err){
          
            res.status(500).json(error("Something went wrong..."))
        }
    },
    dashboardChart:async(req,res)=>{
        try{
          const orders = await Orders.find({});
          const courses = orders.map((ele)=>{
            return ele.courses;
          })

          //avoiding duplicates id from the courses
          

          const tutor_course = await Promise.all(courses.map(async(id)=>{
              return await Course.findOne({_id:id,"tutor.email":req.user});
          }))
          
         
          res.status(200).json(success("OK"))
        }catch(err){
          
            res.status(500).json(error("Somethiing went wrong..."))
        }
    }
}