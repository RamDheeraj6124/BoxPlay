const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const userroutes = require('./routes/userroutes');
const shoproutes = require('./routes/shoproutes');
const adminroutes = require('./routes/adminroutes');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();
const morgan = require('morgan');
const MongoStore = require('connect-mongo');


const app = express();

// Detect test environment
const isTestEnv = process.env.NODE_ENV === 'test';

app.set('trust proxy', 1);
// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "example.com"],
      },
    },
  })
);



// Logging setup - skip file logging in test environment
app.use(morgan('tiny'));

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'https://boxplay-2.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Session configuration - use memory store in test environment
app.use(session({
  secret: process.env.SESSION_SECRET || 'project',
  resave: false,
  saveUninitialized: false,
  store: isTestEnv ? new session.MemoryStore() : MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Routes
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);

// Error handler
app.use(errorHandler);

// Export app for testing
module.exports = app;
