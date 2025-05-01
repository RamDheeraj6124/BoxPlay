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
const morgan = require('morgan');
const path = require('path');
var rfs = require('rotating-file-stream');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
dbconnect();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API docs for your Node.js application',
    },
    servers: [
      { url: 'http://localhost:5000' },
      { url: 'https://your-production-url.com' },
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "example.com"],
    },
  },
}));
app.use(morgan('tiny'));
app.use(morgan('combined'));
app.use(morgan(':method :url :status'));
morgan.token("timed", "A new :method request :url :status ");
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
});
app.use(morgan('combined', { stream: accessLogStream }));
morgan.token("timed", "A new :method request :url :status ");

app.use(cors({
  origin: 'https://boxplay-2.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(session({
  name: 'sessionId', // Cookie name (optional)
  secret: process.env.SESSION_SECRET, // Must be set in Render env vars
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Required for HTTPS (Render forces HTTPS)
    sameSite: 'none', // Required for cross-site cookies
    httpOnly: true, // Prevents client-side JS access
    maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
    domain: '.onrender.com', // Allows cookies across *.onrender.com subdomains
  },
}));

app.use('/user', userroutes);
app.use('/shop', shoproutes);
app.use('/admin', adminroutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));