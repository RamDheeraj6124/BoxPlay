// redisClient.js
const Redis = require('ioredis');
require('dotenv').config(); 
// Initialize Redis connection using environment variables from Render
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

// Test Redis connection (this can be removed after confirming Redis works)
redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = redis;