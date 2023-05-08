const Course = require("../../models/courseSchema");
const Order = require("../../models/orderSchema");
const User = require("../../models/userSchema")
const { error, success } = require("../../responseApi")

module.exports = {
    dashboardCOntent:async(req,res)=>{
        try{
            const instructors = await User.find({instructor:true});
            const students = await User.find({instructor:false});

            const courses = await Course.find({status:true});


            if (!courses.length) {
       
            return;
            }

            const courseIds = courses.map(course => course._id);

            // Find all orders that include any of the courses' IDs and have a status of 'success'
            const orders = await Order.find({ courses: { $in: courseIds }, status: 'success' }, 'bill_amount');

            if (!orders.length) {
          
            return;
            }

            const totalAmount = orders.reduce((sum, order) => sum + order.bill_amount, 0);
            const afterAdmin = totalAmount - totalAmount/100*15
            
            res.status(200).json(success("OK",{totalAmount:totalAmount,afterAdmin:afterAdmin,totalCourses:courses.length,instructors:instructors.length,students:students.length}))
        }catch(err){
          
            res.status(500).json(error("Something went wrong..."))
        }
    }
}