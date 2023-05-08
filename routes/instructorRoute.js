const express = require('express');
const { tokenVerification, isBlocked } = require('../middlewares/authMiddlewares');
const {upload} = require('../config/multer');
const { uploadVideo, createCourse, getAllCourses, deletCourse, editCourse } = require('../controller/instructor/courseController');
const { parentSubCategories } = require('../controller/admin/categoryController');
const { singleCourse } = require('../controller/user/courseController');
const { dashboardContents, dashboardChart } = require('../controller/instructor/dashboardController');
const { allAssignments, updateFeedBack } = require('../controller/instructor/assignmentsController');
const { createAnnouncement, allAnnouncements, deleteAnnouncement, updateAnnouncement } = require('../controller/instructor/AnnouncementController');



const router = express.Router()

router.use(tokenVerification)
router.use(isBlocked)

router.get('/subcategories/:id',parentSubCategories);
router.get('/course/',getAllCourses);
router.get('/course/:id',singleCourse);
router.get('/dashboard',dashboardContents);
router.get('/dashboard/chart',dashboardChart);
router.get('/assignments',allAssignments);
router.get('/announcements',allAnnouncements);

router.post('/course/upload-video',upload.single('section_video'),uploadVideo);
router.post('/course/create-course',upload.fields([
    { name: 'course_image', maxCount: 1 },
    { name: 'promotional_video', maxCount: 1 },
  ]),createCourse);
router.post('/course/announcement/create',createAnnouncement);

router.put('/course/edit-course/:id',upload.fields([
  { name: 'course_image', maxCount: 1 },
  { name: 'promotional_video', maxCount: 1 }]),editCourse);

router.put('/assignment/update/:id',updateFeedBack);
router.put('/announcement/:id',updateAnnouncement);

router.delete('/course/:id',deletCourse);
router.delete('/announcements/:id',deleteAnnouncement);

module.exports = router;