const express = require('express');
const cors = require('cors');
const dbconnect = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const userroutes = require('./routes/userroutes');
const shoproutes = require('./routes/shoproutes');
const adminroutes = require('./routes/adminroutes');
const paymentRoutes = require('./routes/payment');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const helmet = require('helmet'); 
require('dotenv').config(); 
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const path = require('path');
const MongoStore = require('connect-mongo');
const rfs = require('rotating-file-stream');
const redis = require('./config/redisClient');

const app = express();

// Detect test environment
const isTestEnv = process.env.NODE_ENV === 'test';

app.set('trust proxy', 1);

// MongoDB connection - skip in test environment
if (!isTestEnv) {
  dbconnect();
}

// Redis test - skip in test environment
if (!isTestEnv) {
  redis.set('foo', 'bar');
  redis.get('foo', (err, result) => {
    if (err) {
      console.error('Redis GET error:', err);
    } else {
      console.log('Redis value for "foo":', result);
    }
  });
}

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

// Swagger setup - skip in test environment
if (!isTestEnv) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Your API Documentation',
        version: '1.0.0',
        description: 'API docs for your Node.js application',
      },
      servers: [
        { url: 'https://boxplay-2.onrender.com' },
        { url: 'http://localhost:3000' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/*.js'],
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Logging setup - skip file logging in test environment
app.use(morgan('tiny'));
app.use(morgan('combined'));
app.use(morgan(':method :url :status'));

if (!isTestEnv) {
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'log'),
  });
  app.use(morgan('combined', { stream: accessLogStream }));
}

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
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Routes
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use('/api/payment', paymentRoutes);

// Error handler
app.use(errorHandler);

// Export app for testing
module.exports = app;

// Start server only if not in test environment
if (!isTestEnv) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}