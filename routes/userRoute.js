const express = require('express');
const { tokenVerification } = require('../middlewares/authMiddlewares');
const {addToCart, existInCart, cartItems, deleteCartItem} = require('../controller/user/cartController');
const { parentSubCategories } = require('../controller/admin/categoryController');
const { stripeCheckout, stripPublishKey, orderConfirmation, applyCoupon } = require('../controller/user/OrderController');
const { isEnrolled, enrolledCourses, courseProgress, createReview,updateVideoProgress, allReviews, newCourseNote, allNotes, getVideorogress, findCurrentSession, fetchActiveContent, fetchCourseContent, contentCompleted, quizStatus, quizProgress, assignmentProgress } = require('../controller/user/courseController');
const { getAllDiscussions } = require('../controller/user/discussionController');
const { editCourse } = require('../controller/instructor/courseController');
const { fetchAccountDetails, updateProfileInfo, updateProfileImage, getProfileImage, resetPassword } = require('../controller/user/accountController');
const {upload}= require('../config/multer');
const { fetchUserInfo } = require('../controller/user/authController');
const { courseAnnouncements } = require('../controller/instructor/AnnouncementController');

const router = express.Router();

router.use(tokenVerification)

router.get('/cart/:id',existInCart);
router.get('/cart',cartItems);
router.get('/subcategories/:id',parentSubCategories);
router.get('/stripe/publish-key',stripPublishKey);
router.get('/enrolled-courses/:id',isEnrolled);
router.get('/enrolled-courses',enrolledCourses);
router.get('/discussions/:id',getAllDiscussions);
router.get('/course/progress/:id',courseProgress);
router.get('/reviews/:id',allReviews);
router.get('/course/notes/:id',tokenVerification,allNotes);
router.get('/enroll/video-progress/:id/:videoId',getVideorogress);
router.get('/account',fetchAccountDetails)
router.get('/account/profile-image',getProfileImage);
router.get('/account/userinfo',fetchUserInfo);
router.get('/enrolled-course/progress/:courseId',courseProgress);

router.get('/course/active-session/:id',findCurrentSession);
router.get('/course/content/:id',fetchCourseContent)
router.get('/quiz/status/:courseId/:sessionId/:contentId',quizProgress)
router.get('/assignment/status/:courseId/:sessionId/:contentId',assignmentProgress);
router.get('/course/announcements/:courseId',courseAnnouncements);


router.post('/add-to-cart/:id',addToCart);
router.post('/checkout/stripe',stripeCheckout);
router.post('/review/create/:id',createReview);
router.post('/course/notes/:id',newCourseNote);
router.post('/coupon/apply-coupon',applyCoupon)

router.put('/order-confirmation',orderConfirmation);
router.put('/enroll/progress/:id/video-progress',updateVideoProgress);
router.put('/account',updateProfileInfo);
router.put('/enroll/course-content/status',contentCompleted);

router.patch('/account/profile-image',upload.single("profile_image"),updateProfileImage);
router.patch('/account/password',resetPassword);


router.delete('/cart/:id',deleteCartItem);



module.exports = router; 