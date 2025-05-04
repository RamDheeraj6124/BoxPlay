const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import your Express app
const User = require('../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('User Controller Tests', () => {
  let mongoServer;
  let agent;

  beforeAll(async () => {
    // Create in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the test database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test agent that maintains cookies
    agent = request.agent(app);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  describe('Authentication Tests', () => {
    test('POST /user/signup - should create a new user', async () => {
      const response = await agent
        .post('/user/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.msg).toBe('Signup Successful');
      
      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    test('POST /user/login - should authenticate user', async () => {
      // First create a test user
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.msg).toBe('Login Successful');
      expect(response.headers['set-cookie']).toBeDefined(); // Check for session cookie
    });

    test('POST /user/logout - should terminate session', async () => {
      // First login to create a session
      await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await agent.post('/user/logout');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('Session Tests', () => {
    test('GET /user/checksession - should check active session', async () => {
      // First create and login a test user
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await agent.get('/user/checksession');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('OTP Tests', () => {
    test('POST /user/send-otp - should send OTP to email', async () => {
      // Create a test user first
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await agent
        .post('/user/send-otp')
        .send({
          email: 'test@example.com'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('OTP sent successfully');
      
      // Verify OTP was saved in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.otp).toBeDefined();
      expect(user.otpExpiration).toBeDefined();
    });

    test('POST /user/reset-password - should reset password with valid OTP', async () => {
      // Create user with OTP
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('oldpassword', 10),
        otp: '1234',
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      });

      const response = await agent
        .post('/user/reset-password')
        .send({
          email: 'test@example.com',
          otp: '1234',
          newPassword: 'newpassword123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Password updated successfully');
      
      // Verify password was changed and OTP cleared
      const updatedUser = await User.findById(testUser._id);
      const isMatch = await bcrypt.compare('newpassword123', updatedUser.password);
      expect(isMatch).toBe(true);
      expect(updatedUser.otp).toBe('');
    });
  });

  describe('User Operations', () => {
    test('PUT /user/update-contact - should update user contact', async () => {
      // Create and login test user
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await agent
        .put('/user/update-contact')
        .send({
          contact: '1234567890'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.contact).toBe('1234567890');
      
      // Verify update in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.contact).toBe('1234567890');
    });
  });
});