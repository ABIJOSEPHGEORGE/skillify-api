const Course = require('../../models/courseSchema');
const Order = require('../../models/orderSchema');
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
          const today = new Date(); // Current date
            const lastSevenDays = new Date(today);
            lastSevenDays.setDate(lastSevenDays.getDate() - 6); // Subtract 6 days to get a week's range

            const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.order_date); // Assuming 'order_date' is the property with the timestamp string
            return orderDate >= lastSevenDays && orderDate <= today;
            });

            const dateRange = [];
            let currentDate = new Date(lastSevenDays);
            while (currentDate <= today) {
            dateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
            }

            const dataWithZeroValues = dateRange.map(date => {
            const matchingOrder = filteredOrders.find(order => {
                const orderDate = new Date(order.order_date);
                return orderDate.toDateString() === date.toDateString();
            });

            const billAmount = matchingOrder ? matchingOrder.bill_amount : 0;

            return { date: date.toISOString().split('T')[0], bill_amount: billAmount };
            });


            const afterPayout = dataWithZeroValues.map(data => {
                const updatedBillAmount = data.bill_amount - (data.bill_amount * 0.15); // Reduce 15% from the original bill amount
                return { ...data, bill_amount: updatedBillAmount };
              });

          res.status(200).json(success("OK",{beforePayout:dataWithZeroValues,afterPayout:afterPayout}))
        }catch(err){
          
            res.status(500).json(error("Somethiing went wrong..."))
        }
    },
    salesReport:async(req,res)=>{
        try{
            const { from, to } = req.query;
            
           
            const orders = await Order.find({
                order_date: {
                  $gte: new Date(from),
                  $lte: new Date(to),
                },
              }).select('bill_amount order_date billing_address.order_id billing_address.first_name billing_address.last_name billing_address.state billing_address.country');
          
              const ordersWithPayout = orders.map(order => ({
                ...order.toObject(),
                after_payout: order.bill_amount * 0.85, // Assuming 15% commission
              }));

              res.status(200).json(success("OK",ordersWithPayout))

        }catch(err){
            
            res.status(500).json(error('Something went wrong...'))
        }
    }
}