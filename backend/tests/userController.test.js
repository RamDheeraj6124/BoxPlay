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

// Increase timeout for all tests
jest.setTimeout(30000); // 30 seconds

describe('User Controller Tests', () => {
  let agent;
  let testUser;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/testdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    
    // Clear any existing data
    await mongoose.connection.dropDatabase();
    
    // Create test agent
    agent = request.agent(app);
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.disconnect();
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
      
      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    test('POST /user/signup - should reject invalid email', async () => {
      const response = await agent
        .post('/user/signup')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.msg).toBe('invalid email address provided');
    });

    test('POST /user/signup - should reject duplicate email', async () => {
      // Create user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await agent
        .post('/user/signup')
        .send({
          username: 'testuser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.msg).toBe('User already exists');
    });

    test('POST /user/login - should authenticate user', async () => {
      // Create test user first
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword
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

    test('POST /user/login - should reject invalid credentials', async () => {
      // Create test user first
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.msg).toBe('Invalid credentials');
    });

    test('POST /user/logout - should terminate session', async () => {
      // First create and login a test user
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

    test('GET /user/checksession - should detect no session', async () => {
      const response = await agent.get('/user/checksession');
      expect(response.statusCode).toBe(400);
      expect(response.body.msg).toBe('Session does not exist');
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
      
      // Verify OTP was saved in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.otp).toBeDefined();
      expect(user.otpExpiration).toBeDefined();
    });

    test('POST /user/send-otp - should reject for non-existent user', async () => {
      const response = await agent
        .post('/user/send-otp')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    test('POST /user/login-otp - should login with valid OTP', async () => {
      // Create user with OTP
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        otp: '1234',
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      });

      const response = await agent
        .post('/user/login-otp')
        .send({
          email: 'test@example.com',
          otp: '1234'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful');
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

    test('GET /user/userbookings - should get user bookings', async () => {
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

      // TODO: Add test bookings here if needed

      const response = await agent.get('/user/userbookings');
      expect(response.statusCode).toBe(200);
      expect(response.body.bookings).toBeDefined();
    });

    test('POST /user/submitfeedback - should submit feedback', async () => {
      // Create test booking first
      // TODO: Add test booking setup if needed

      const response = await agent
        .post('/user/submitfeedback')
        .send({
          bookingId: 'testbookingid',
          rating: 5,
          review: 'Great service!'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Feedback submitted successfully');
    });

    test('POST /user/submitquery - should submit query', async () => {
      const response = await agent
        .post('/user/submitquery')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          mobile: '1234567890',
          message: 'Test query message'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Query saved successfully');
    });
  });
});