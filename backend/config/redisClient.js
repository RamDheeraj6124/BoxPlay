const Redis = require('ioredis');
require('dotenv').config(); // Load environment variables from .env file
const redis = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL.includes('red-') ? {} : undefined // Required for Render external URLs
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redis;