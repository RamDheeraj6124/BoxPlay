const Redis = require('ioredis');
require('dotenv').config();

// Toggle TLS support via REDIS_TLS env variable
const useTLS = process.env.REDIS_TLS === 'true';

// Create Redis instance
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  ...(useTLS ? { tls: {} } : {}) // Enable TLS only if needed
});

// Connection success
redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Connection error
redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

module.exports = redis;