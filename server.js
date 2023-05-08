const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config()
const cors = require('cors')
const logger = require('morgan');
const {Server} = require('socket.io')

const db = require('./config/database');

const indexRoute = require('./routes/indexRoute');
const userRoute = require('./routes/userRoute');
const instructorRoute = require('./routes/instructorRoute');
const adminRoute = require('./routes/adminRoute');
const { socketioConnection } = require('./controller/user/discussionController');

const app = express();
db.connectDB();

const httpServer = require('http').createServer(app)
const io = new Server(httpServer,{
  cors:{
    origin:process.env.DOMAIN,
    methods:['GET','POST'],
    transports:['websocket','polling'],
    credentials:true
  },
  allowEIO3: true
})

socketioConnection(io)

app.use(cors(
    {
      origin:process.env.DOMAIN,
      credentials:true
    }
  ));

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin',process.env.DOMAIN);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
app.use(logger('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser())
app.use('/public', express.static('public'));


app.use('/',indexRoute);
app.use('/user',userRoute);
app.use('/instructor',instructorRoute);
app.use('/admin',adminRoute);

const port = process.env.PORT || 8080;


httpServer.listen(port,()=>{
  console.log('Server started at port 3001')
})