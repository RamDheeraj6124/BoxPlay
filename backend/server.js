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
const paymentRoutes = require('./routes/payment');
const morgan=require('morgan')
const path=require('path')
const MongoStore = require('connect-mongo');
var rfs = require('rotating-file-stream')
const app = express();
dbconnect();
app.set('trust proxy', 1);

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
  origin: 'https://boxplay-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'project',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: true, // Always use secure in cross-domain scenarios
    httpOnly: true,
    // Make sure this domain matches your setup
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : 'localhost',
    sameSite: 'none', // Correct for cross-origin
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use('/api/payment', paymentRoutes);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));