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
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const paymentRoutes = require('./routes/payment');
const morgan = require('morgan');
const path = require('path');
const MongoStore = require('connect-mongo');
const rfs = require('rotating-file-stream');
const connectRedis = require('connect-redis');
const Redis = require('ioredis');

// Setup Redis client
const redisClient = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL.includes('red-') ? {} : undefined,
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Setup Redis Store for sessions
const RedisStore = connectRedis(session);

const app = express();
app.set('trust proxy', 1);

// Connect to MongoDB
dbconnect();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "example.com"],
      },
    },
  })
);

// Swagger config
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
      { url: 'http://localhost:3000' }
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

// Logging
app.use(morgan('tiny'));
app.use(morgan('combined'));
app.use(morgan(':method :url :status'));
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
});
app.use(morgan('combined', { stream: accessLogStream }));

// CORS
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

// Session configuration using Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'project',
  resave: false,
  saveUninitialized: false,
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// Export redis client for use in other files
module.exports = redisClient;