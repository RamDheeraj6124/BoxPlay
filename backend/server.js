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
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const paymentRoutes = require('./routes/payment');
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
const Redis = require('ioredis');
const RedisStore = require('connect-redis');  // Directly import the module, no need for .default
const redisClient = require('./config/redisClient');

require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// Connect to MongoDB
dbconnect();

// Connect to Redis
const redisClient = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL.includes('red-') ? {} : undefined,
});
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});
redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Middleware
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

// Swagger setup
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

// Logging
app.use(morgan('tiny'));
app.use(morgan('combined'));
app.use(morgan(':method :url :status'));
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, 'log'),
});
app.use(morgan('combined', { stream: accessLogStream }));

// CORS setup
const allowedOrigins = ['http://localhost:3000', 'https://boxplay-2.onrender.com'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Redis session store
app.use(session({
  store: new RedisStore({ client: redisClient }), // Updated to use the factory function
  secret: process.env.SESSION_SECRET || 'project',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  }
}));

// Routes
app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use('/api/payment', paymentRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));