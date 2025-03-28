const express = require('express');
const cors = require('cors');
const dbconnect = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const userroutes = require('./routes/userroutes');
const shoproutes=require('./routes/shoproutes');
const adminroutes=require('./routes/adminroutes');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const helmet = require('helmet'); 
require('dotenv').config(); 
const morgan=require('morgan')
const path=require('path')
var rfs = require('rotating-file-stream')
const app = express();
dbconnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'", "example.com"],
        },
      },
    }),
  );
app.use(morgan('tiny'))
app.use(morgan('combined'))
app.use(morgan(':method :url :status'))
morgan.token("timed","A new :method request :url :status ")
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    
  })
  // setup the logger
app.use(morgan('combined' , { stream: accessLogStream }))
morgan.token("timed","A new :method request :url :status ")
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true
}));

app.use(session({
    key: "userid",
    secret: "project",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24 * 1000, // 1 day
        secure: false,  // Allow HTTP for development (set to true for production with HTTPS)
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        sameSite: 'Lax' // Helps mitigate CSRF attacks
    }
}));
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use(errorHandler);
const Redis = require("ioredis");
const redis = new Redis(); // Default: localhost:6379
  
  redis.on("connect", () => {
      console.log("Connected to Redis!");
  });
  
  redis.on("error", (err) => {
      console.error("Redis error: ", err);
  });
  
module.exports = redis;
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
