const multer = require('multer');


const DIR = './public/images';
const VIDEODIR = './public/course/videos';



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // check the file type and store in the appropriate directory
      if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mkv') {
        cb(null, VIDEODIR);
      } else if (file.mimetype.startsWith('image/')) {
        cb(null, DIR);
      } else {
        cb(new Error('Invalid file type'));
      }
    },
    filename: function (req, file, cb) {
      // set the file name and extension
      const ext = file.mimetype.split('/')[1];
      cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
    },
  });
  
  const upload = multer({ storage });
module.exports ={
    upload
}