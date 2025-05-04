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

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isTestEnv = process.env.NODE_ENV === 'test';

// Trust proxy in production
app.set('trust proxy', 1);

// Database connections
if (!isTestEnv) {
  dbconnect().catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
}

// Redis connection
if (!isTestEnv) {
  redis.on('error', (err) => console.error('Redis Client Error:', err));
  
  if (redis.status !== 'connecting' && redis.status !== 'connected') {
    redis.connect().then(() => {
      console.log('Redis connected successfully');
      return redis.set('foo', 'bar');
    }).then(() => redis.get('foo'))
      .then((val) => console.log('Redis test value:', val))
      .catch(err => console.error('Redis error:', err));
  }
}

// Middleware setup
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(helmet());

// Swagger setup
if (!isTestEnv) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'API documentation for the application',
      },
      servers: [
        { url: 'https://boxplay-2.onrender.com', description: 'Production server' },
        { url: 'http://localhost:3000', description: 'Local development' },
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

// Logging setup
app.use(morgan('dev'));

if (!isTestEnv) {
  const logDirectory = path.join(__dirname, 'logs');
  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory,
    compress: 'gzip',
  });
  app.use(morgan('combined', { stream: accessLogStream }));
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://boxplay-2.onrender.com',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Session configuration
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: 'sessions',
  ttl: 14 * 24 * 60 * 60, // 14 days
});

sessionStore.on('error', function(error) {
  console.error('SESSION STORE ERROR:', error);
});

app.use(session({
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: isTestEnv ? new session.MemoryStore() : sessionStore,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  rolling: true
}));

// Routes
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isTestEnv ? 'test' : 'connected',
    redis: isTestEnv ? 'test' : redis.status
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Export app for testing
module.exports = app;

// Start server only if not in test environment
if (!isTestEnv) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}