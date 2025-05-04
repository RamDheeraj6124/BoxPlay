const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: true  // ✅ Enable TLS
  },
  username: process.env.REDIS_USERNAME, // only needed if Redis uses ACL
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

client.connect();

module.exports = client;