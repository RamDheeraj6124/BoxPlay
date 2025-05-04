const Redis = require('ioredis');
require('dotenv').config();

const redisClient = new Redis(process.env.REDIS_URL, {
  tls: process.env.REDIS_URL.includes('rediss://') ? {} : undefined, // For Render-hosted Redis
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redisClient;