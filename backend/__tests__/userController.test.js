const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server1');
const User = require('../models/User');
const Booking = require('../models/Booking');
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

// Increase timeout for all tests
jest.setTimeout(60000);

describe('User Controller Tests', () => {
  let agent;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/testdb');

    // Create test agent
    agent = request.agent(app);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Booking.deleteMany({});
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
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('POST /user/logout - should terminate session', async () => {
      // First login to create session
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
  });

  describe('User Operations', () => {
    /*
    test('POST /user/updatecontact - should update user contact', async () => {
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
            .put('/user/updatecontact')
            .send({
                contact: '1234567890'
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.contact).toBe('1234567890');
    });*/
    test('GET /user/userbookings - should get user bookings', async () => {
      // Create test user and booking
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const testBooking = await Booking.create({
        user: testUser._id,
        shop: new mongoose.Types.ObjectId(), // Mock shop ID
        groundname: 'Test Ground',
        date: new Date(),
        timeSlot: { start: new Date(), end: new Date() },
        amountPaid: 100,
        platformfee: 10,
        groundfee: 90
      });

      // Login
      await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await agent.get('/user/userbookings');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.bookings.length).toBe(1);
      expect(response.body.bookings[0].groundname).toBe('Test Ground');
    });

    test('POST /user/submitfeedback - should submit feedback', async () => {
      // Create test user and booking
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const testBooking = await Booking.create({
        user: testUser._id,
        shop: new mongoose.Types.ObjectId(), // Mock shop ID
        groundname: 'Test Ground',
        date: new Date(),
        timeSlot: { start: new Date(), end: new Date() },
        amountPaid: 100,
        platformfee: 10,
        groundfee: 90
      });

      // Login
      await agent
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await agent
        .post('/user/submitfeedback')
        .send({
          bookingId: testBooking._id.toString(),
          rating: 5,
          review: 'Great service!'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Feedback submitted successfully');
    });
  });
});