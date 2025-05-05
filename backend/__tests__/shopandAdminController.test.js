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

jest.setTimeout(120000);

describe('Shop and Admin Controller Tests', () => {
  let agent;
  let adminAgent;
  let testState;
  let testCity;
  let testSport;

  beforeAll(async () => {
    // Connect to the test database
    const uri = 'mongodb+srv://group38:project38@cluster0.jyxib.mongodb.net/boxplay_test?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Create test agents
    agent = request.agent(app);
    adminAgent = request.agent(app);

    // Create a test state
    testState = await State.create({ name: 'Test State' });

    // Create a test city
    testCity = await City.create({ name: 'Test City', state: testState._id });

    // Create a test sport
    testSport = await Sport.create({
      name: 'Football',
      description: 'Team sport played with a ball',
      equipmentRequired: 'Football, Goalposts',
      rules: 'Standard football rules',
    });

    // Create an admin user
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await redis.quit(); // Properly disconnect Redis client
  });

  beforeEach(async () => {
    // Clear data before each test
    await Shop.deleteMany({});
  });

  describe('Admin Operations', () => {
    test('POST /admin/addstate - should add a state', async () => {
      const response = await adminAgent.post('/admin/addstate').send({
        name: 'New State',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('State added successfully');

      const state = await State.findOne({ name: 'New State' });
      expect(state).toBeTruthy();
    });

    test('POST /admin/addcity - should add a city to an existing state', async () => {
      const response = await adminAgent.post('/admin/addcity').send({
        name: 'New City',
        stateId: testState._id,
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('city added successfully');

      const city = await City.findOne({ name: 'New City' });
      expect(city).toBeTruthy();
      expect(city.state.toString()).toBe(testState._id.toString());
    });

    test('GET /admin/getstateslist - should fetch the list of states', async () => {
      const response = await adminAgent.get('/admin/getstateslist');

      expect(response.statusCode).toBe(200);
      expect(response.body.states.length).toBeGreaterThan(0);
    });

    test('GET /admin/getcitieslist - should fetch the list of cities', async () => {
      const response = await adminAgent.get('/admin/getcitieslist');

      expect(response.statusCode).toBe(200);
      expect(response.body.cities.length).toBeGreaterThan(0);
    });

    test('GET /admin/getsportslist - should fetch the list of sports', async () => {
      const response = await adminAgent.get('/admin/getsportslist');

      expect(response.statusCode).toBe(200);
      expect(response.body.sportslist.length).toBeGreaterThan(0);
    });
  });

  describe('Shop Registration and Login', () => {
    test('POST /shop/shopregister - should register a new shop', async () => {
      const response = await agent.post('/shop/shopregister').send({
        owner: 'Test Owner',
        email: 'testshop@example.com',
        password: 'password123',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Shop registered successfully');

      const shop = await Shop.findOne({ email: 'testshop@example.com' });
      expect(shop).toBeTruthy();
      expect(shop.owner).toBe('Test Owner');
    });

    test('POST /shop/shoplogin - should log in a shop', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Shop.create({
        owner: 'Test Owner',
        email: 'testshop@example.com',
        password: hashedPassword,
        city: testCity._id,
      });

      const response = await agent.post('/shop/shoplogin').send({
        email: 'testshop@example.com',
        password: 'password123',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.msg).toBe('Login Successful');
    });
  });

  describe('Admin and Shop Session Management', () => {
    test('GET /admin/checksession - should check admin session', async () => {
      // Admin login
      await adminAgent.post('/user/login').send({
        email: 'admin@example.com',
        password: 'adminpassword',
      });

      const response = await adminAgent.get('/admin/checksession');
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Session Exists');
    });

    test('GET /shop/checkshopsession - should check shop session', async () => {
      // Create and login a shop
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Shop.create({
        owner: 'Test Owner',
        email: 'testshop@example.com',
        password: hashedPassword,
        city: testCity._id,
      });

      await agent.post('/shop/shoplogin').send({
        email: 'testshop@example.com',
        password: 'password123',
      });

      const response = await agent.get('/shop/checkshopsession');
      expect(response.statusCode).toBe(200);
      expect(response.body.msg).toBe('Shop session exists');
    });
    test('should return venues from Redis cache', async () => {
      // Mock cached data
      const cachedVenueData = [
        {
          name: 'Cached Shop',
          address: '123 Test St',
          image: 'data:image/jpeg;base64,cached-image-data',
          groundname: 'Cached Ground',
          priceperhour: 100,
          maxplayers: 10,
          surfacetype: 'Grass',
          sportname: 'Football',
          facilities: ['Showers'],
        },
      ];
      await redis.set('venueData', JSON.stringify(cachedVenueData), 'EX', 3600);
  
      const response = await request(app).get('/shop/loadvenues');
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(cachedVenueData);
      console.log('✔️ Served from Redis cache');
    });
  
    test('should return venues from MongoDB and cache the result', async () => {
      await redis.del('venueData');
      // Create a shop with valid data, including availablesports
      const testShop = await Shop.create({
        owner: 'John Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword123',
        shopname: 'John\'s Sports Center',
        address: '123 Main Street',
        city: testCity._id,
        availablesports: [
          {
            sport: testSport._id,
            groundname: 'Football Arena',
            priceperhour: 120,
            maxplayers: [11],
            grounddimensions: { length: 100, width: 50 },
            availability: [
              {
                day: 'Monday',
                times: [
                  { start: '10:00', end: '12:00' },
                ],
              },
            ],
            facilities: ['Showers', 'Lockers'],
            surfacetype: 'Grass',
            status: 'Active',
            verify: true, // Mark as verified
          },
        ],
      });
  
      const response = await request(app).get('/shop/loadvenues');
  
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe(testShop.shopname);
      expect(response.body[0].groundname).toBe('Football Arena');
      expect(response.body[0].priceperhour).toBe(120);
      expect(response.body[0].sportname).toBe('Football');
  
      // Check if the data is cached in Redis
      const cachedData = await redis.get('venueData');
      expect(JSON.parse(cachedData).length).toBe(1);
      expect(JSON.parse(cachedData)[0].name).toBe(testShop.shopname);
      console.log('✔️ Data fetched from MongoDB and cached in Redis');
    });
  
  
    test('should return 404 when no verified venues are found', async () => {
      await redis.del('venueData');
      // Ensure database is cleared
      await Shop.deleteMany({});
  
      const response = await request(app).get('/shop/loadvenues');
  
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No verified venues found');
      console.log('✔️ No venues found case handled correctly');
    });
  
    test('should return 500 on server error', async () => {
      // Mock an error in the Redis client
      jest.spyOn(redis, 'get').mockImplementationOnce(() => {
        throw new Error('Redis error');
      });
  
      const response = await request(app).get('/shop/loadvenues');
  
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Internal server error');
      console.log('✔️ Server error handled correctly');
    });
  });
});