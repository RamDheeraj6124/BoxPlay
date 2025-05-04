// config/redisClient.js
const Redis = require('ioredis');

const redis = new Redis({
  host: 'redis-16336.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 16336,
  username: 'default',
  password: '8jVYlKqELDMgd6nWu2TloRgEx3coeBrK',
  tls: {} // enable TLS for Redis Cloud
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

module.exports = redis;