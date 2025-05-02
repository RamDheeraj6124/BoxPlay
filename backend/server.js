const express = require('express');
const cors = require('cors');
const dbconnect = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const userroutes = require('./routes/userroutes');
const shoproutes = require('./routes/shoproutes');
const adminroutes = require('./routes/adminroutes');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const helmet = require('helmet'); 
require('dotenv').config(); 
const paymentRoutes = require('./routes/payment');
const morgan = require('morgan');
const path = require('path');
const MongoStore = require('connect-mongo');
var rfs = require('rotating-file-stream');

const app = express();

// Set trust proxy - important for sessions behind proxies like on Render.com
app.set('trust proxy', 1);

// Connect to database
dbconnect();

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

// Logging setup
app.use(morgan('tiny'));
app.use(morgan('combined'));
app.use(morgan(':method :url :status'));
morgan.token("timed", "A new :method request :url :status ");

var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
});

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));
morgan.token("timed", "A new :method request :url :status ");

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://boxplay-frontend.onrender.com',
  // Add any other origins you need
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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'project',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: true, // Always secure for cross-origin with sameSite: none
    httpOnly: true,
    sameSite: 'none', // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use('/api/payment', paymentRoutes);

// Debug endpoint for session troubleshooting
app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.cookies,
    hasUser: !!req.session.user
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));