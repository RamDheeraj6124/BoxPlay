const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server1');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Hardcoded test configuration
const TEST_CONFIG = {
  MONGO_URI: 'mongodb+srv://testuser:testpass@cluster0.example.mongodb.net/testdb?retryWrites=true&w=majority',
  JWT_SECRET: 'testsecret-jwt-key-for-tests',
  TEST_USER: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
  }
};

// Configure environment
process.env = {
  ...process.env,
  ...TEST_CONFIG,
  NODE_ENV: 'test'
};

jest.setTimeout(30000); // Individual test timeout

describe('User Controller Integration Tests', () => {
  let agent;

  beforeAll(async () => {
    await mongoose.connect(TEST_CONFIG.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    agent = request.agent(app);
  }, 60000); // Setup timeout

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Authentication', () => {
    test('POST /user/signup - should register new user', async () => {
      const res = await agent.post('/user/signup').send({
        username: TEST_CONFIG.TEST_USER.username,
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password
      });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Signup Successful');

      const user = await User.findOne({ email: TEST_CONFIG.TEST_USER.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(TEST_CONFIG.TEST_USER.username);
    });

    test('POST /user/login - should authenticate user', async () => {
      // Create user first
      await User.create({
        username: TEST_CONFIG.TEST_USER.username,
        email: TEST_CONFIG.TEST_USER.email,
        password: await bcrypt.hash(TEST_CONFIG.TEST_USER.password, 10)
      });

      const res = await agent.post('/user/login').send({
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password
      });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Login Successful');
    });
  });

  describe('Session Management', () => {
    test('GET /user/checksession - should return active session', async () => {
      // Create and login user
      await User.create({
        username: TEST_CONFIG.TEST_USER.username,
        email: TEST_CONFIG.TEST_USER.email,
        password: await bcrypt.hash(TEST_CONFIG.TEST_USER.password, 10)
      });

      await agent.post('/user/login').send({
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password
      });

      const res = await agent.get('/user/checksession');
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(TEST_CONFIG.TEST_USER.email);
    });

    test('POST /user/logout - should terminate session', async () => {
      const res = await agent.post('/user/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});