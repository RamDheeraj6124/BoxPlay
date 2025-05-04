const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Mock nodemailer globally
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation((mailOptions, callback) => {
      callback(null, { response: '250 OK' });
    }),
  }),
}));

// Mock Redis
jest.mock('../config/redisClient', () => ({
  set: jest.fn(),
  get: jest.fn((key, callback) => callback(null, 'mocked-value')),
  on: jest.fn(),
  connect: jest.fn()
}));

describe('User Controller Tests', () => {
  let agent;
  let testUser;

  beforeAll(async () => {
    // Clear any existing connections
    await mongoose.connection.dropDatabase();
    
    // Create test agent
    agent = request.agent(app);
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
  });

  beforeEach(async () => {
    // Clear users before each test
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
      
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    test('POST /user/login - should authenticate user', async () => {
      // Create test user first
      testUser = await User.create({
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
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('POST /user/logout - should terminate session', async () => {
      // First login to create session
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
      // Create and login test user
      await User.create({
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
      // Create test user first
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
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000)
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
      
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.contact).toBe('1234567890');
    });
  });
});