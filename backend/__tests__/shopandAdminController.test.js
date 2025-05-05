const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server1');
const City = require('../models/City');
const State = require('../models/State');
const Shop = require('../models/Shop');
const Sport = require('../models/Sport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const redis = require('../config/redisClient');

// Hardcoded test configuration
const TEST_CONFIG = {
  MONGO_URI: 'mongodb+srv://testuser:testpass@cluster0.example.mongodb.net/testdb?retryWrites=true&w=majority',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'testsecret-jwt-key-for-tests',
  ADMIN_CREDS: {
    email: 'admin@test.com',
    password: 'adminpassword123'
  },
  TEST_SHOP: {
    owner: 'Test Owner',
    email: 'testshop@example.com',
    password: 'shopassword123'
  }
};

// Configure environment
process.env = {
  ...process.env,
  ...TEST_CONFIG,
  NODE_ENV: 'test'
};

jest.setTimeout(30000); // Individual test timeout

describe('Shop and Admin Controller Integration Tests', () => {
  let adminAgent;
  let shopAgent;
  let testState;
  let testCity;
  let testSport;
  let testShop;

  beforeAll(async () => {
    // Connect to databases
    await mongoose.connect(TEST_CONFIG.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000
    });

    // Create test agents
    adminAgent = request.agent(app);
    shopAgent = request.agent(app);

    // Create test data
    testState = await State.create({ name: 'Test State' });
    testCity = await City.create({ 
      name: 'Test City', 
      state: testState._id 
    });
    testSport = await Sport.create({
      name: 'Football',
      description: 'Test football',
      equipmentRequired: 'Ball, Goals',
      rules: 'Standard rules'
    });

    // Create admin user
    await User.create({
      username: 'admin',
      email: TEST_CONFIG.ADMIN_CREDS.email,
      password: await bcrypt.hash(TEST_CONFIG.ADMIN_CREDS.password, 10),
      role: 'admin'
    });

    // Login admin
    await adminAgent.post('/user/login').send({
      email: TEST_CONFIG.ADMIN_CREDS.email,
      password: TEST_CONFIG.ADMIN_CREDS.password
    });
  }, 60000); // Setup timeout

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await redis.quit();
  });

  beforeEach(async () => {
    await Shop.deleteMany({});
  });

  describe('Admin Operations', () => {
    test('POST /admin/addstate - should create new state', async () => {
      const res = await adminAgent.post('/admin/addstate').send({
        name: 'New Test State'
      });
      
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('State added successfully');
      
      const state = await State.findOne({ name: 'New Test State' });
      expect(state).toBeTruthy();
    });
  });

  describe('Shop Operations', () => {
    test('POST /shop/shopregister - should register new shop', async () => {
      const res = await shopAgent.post('/shop/shopregister').send({
        owner: TEST_CONFIG.TEST_SHOP.owner,
        email: TEST_CONFIG.TEST_SHOP.email,
        password: TEST_CONFIG.TEST_SHOP.password
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('successfully');

      const shop = await Shop.findOne({ email: TEST_CONFIG.TEST_SHOP.email });
      expect(shop).toBeTruthy();
      expect(shop.owner).toBe(TEST_CONFIG.TEST_SHOP.owner);
    });
  });

  describe('Redis Caching', () => {
    test('GET /shop/loadvenues - should cache venues', async () => {
      // Create verified shop
      testShop = await Shop.create({
        owner: 'Cache Owner',
        email: 'cache@test.com',
        password: 'cachepass123',
        shopname: 'Cache Sports',
        availablesports: [{
          sport: testSport._id,
          groundname: 'Cached Ground',
          verify: true,
          priceperhour: 100
        }]
      });

      // First request - should cache
      const firstCall = await shopAgent.get('/shop/loadvenues');
      expect(firstCall.status).toBe(200);
      expect(firstCall.body.length).toBe(1);

      // Verify cache
      const cached = await redis.get('venueData');
      expect(cached).toBeTruthy();
      expect(JSON.parse(cached)[0].name).toBe('Cache Sports');
    });
  });
});