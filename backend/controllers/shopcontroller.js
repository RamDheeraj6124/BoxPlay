const Shop = require('../models/Shop'); 
const bcrypt = require('bcryptjs'); 
const Booking = require('../models/Booking');
const Sport = require('../models/Sport');
const City = require('../models/City');
const dns = require('dns');


const validateEmailDomain = async (email) => {
    try {
        // Extract domain from email
        const domain = email.split('@')[1];
        if (!domain) {
            throw new Error('Invalid email format');
        }

        // Check for MX records
        const mxRecords = await new Promise((resolve, reject) => {
            dns.resolveMx(domain, (err, addresses) => {
                if (err) {
                    return reject(err);
                }
                resolve(addresses);
            });
        });

        return mxRecords && mxRecords.length > 0;
    } catch (error) {
        console.error('Domain validation error:', error);
        return false;
    }
};
// Controller for registering a new shop
exports.registershop = async (req, res) => {
  const { owner,email, password } = req.body;

  try {
    // Check if the shop email already exists
    if(validateEmailDomain(email)){
    const existingShop = await Shop.findOne({ email }).select('_id').lean().exec();
    if (existingShop) {
      return res.status(400).json({ message: 'Shop with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new shop instance
    const newShop = new Shop({
      owner,
      email,
      password: hashedPassword
    });

    // Save the new shop in the database
    await newShop.save();

    res.status(201).json({ message: 'Shop registered successfully', shop: newShop });}
    else{
        res.status(404).json({ message: 'invalid email address'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
exports.loginshop = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        // Find the shop by email
        const shop = await Shop.findOne({ email }).populate({
            path: 'city',
            populate: { path: 'state' }
        });
        if (!shop) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check the password
        const isMatch = await bcrypt.compare(password, shop.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Store shop details in the session
        req.session.shop = shop;
        console.log('Session created:', req.session.shop);
        res.status(200).json({ msg: 'Login Successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


exports.checkshopsession = (req, res) => {
    if (req.session.shop) {
        const shop = req.session.shop;

        if (shop.availablesports && shop.availablesports.length > 0) {
            shop.availablesports = shop.availablesports.map((sport) => {
                try {
                    if (sport.image && sport.image.data) {
                        const bufferData = Buffer.isBuffer(sport.image.data)
                            ? sport.image.data
                            : Buffer.from(sport.image.data.data);

                        const base64Image = bufferData.toString('base64');
                        const mimeType = sport.image.contentType || 'image/jpeg';
                        sport.getimage = `data:${mimeType};base64,${base64Image}`;
                    } else {
                        sport.getimage = '';
                    }
                } catch (imageError) {
                    console.error(`Error processing image for ${sport.groundname}:`, imageError);
                    sport.getimage = '';
                }
                return sport;
            });
        } else {
            console.log('No available sports found for this shop.');
        }

        res.status(200).json({ msg: 'Shop session exists', shop });
    } else {
        res.status(400).json({ msg: "Session does not exist" });
    }
};





exports.updateshop = async (req, res) => {
    if (!req.session.shop) {
        return res.status(401).json({ msg: 'No shop logged in' });
    }

    const shopId = req.session.shop._id;
    const { shopname, address,cityobject,locationlink } = req.body;

    try {
        const city = await City.findById(cityobject._id);
        const updatedShop = await Shop.findByIdAndUpdate(shopId, { shopname, address,city,locationlink}, { new: true });

        if (!updatedShop) {
            return res.status(404).json({ msg: 'Shop not found' });
        }

        req.session.shop = updatedShop; // Optionally update session data
        res.status(200).json({ msg: 'Shop details updated successfully'});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


exports.addground = async (req, res) => {
    const { selectsport,groundname, priceperhour, maxplayers, groundLength, groundwidth, facilities, surfaceType, availability } = req.body;
    const image = req.file; // Multer stores the uploaded file in req.file

    // Parse the availability from the request
    let parsedAvailability;
    console.log(req.body);
    console.log(availability);

    try {
        // Check if availability is a string and parse it
        if (typeof availability === 'string') {
            parsedAvailability = JSON.parse(availability);
        } else {
            parsedAvailability = availability;
        }
    } catch (error) {
        return res.status(400).json({ msg: 'Invalid availability data' });
    }

    // Validate the required fields
    if (!groundname || !priceperhour || !maxplayers || !groundLength || !groundwidth || !facilities || !surfaceType) {
        return res.status(400).json({ msg: 'All fields are required' });
    }

    try {
        // Find the shop by user session or ID (you may want to adapt this)
        const shopId = req.session.shop._id; // Assuming you store shop ID in session
        const shop = await Shop.findById(shopId);
        const sport=await Sport.findOne({name:selectsport});

        if (!shop) {
            return res.status(404).json({ msg: 'Shop not found' });
        }

        const newGround = {
            sport,
            groundname,
            priceperhour,
            maxplayers,
            grounddimensions: {
                length: groundLength,
                width: groundwidth,
            },
            facilities: facilities.split(',').map(facility => facility.trim()), // Convert to array
            surfacetype: surfaceType,
            availability: parsedAvailability, // Use parsed availability
            image: {
                data: image.buffer,
                contentType: image.mimetype
            },
            status: 'Active', // Default status
            verify: false,    // Default verification
            appliedforverification: false // Default verification application
        };

        // Push the new ground to the shop's availablesports array
        shop.availablesports.push(newGround);
        await shop.save();
        shop.availablesports = shop.availablesports.map((sport) => {
            try {

                if (sport.image && sport.image.data) {
                    const bufferData = Buffer.isBuffer(sport.image.data)
                            ? sport.image.data
                            : Buffer.from(sport.image.data.data);

                        const base64Image = bufferData.toString('base64');
                        const mimeType = sport.image.contentType || 'image/jpeg';
                        sport.getimage = `data:${mimeType};base64,${base64Image}`;
                } else {
                    sport.getimage = ''; // If image doesn't exist, use an empty string
                }
            } catch (imageError) {
                console.error(`Error reading image for ${sport.groundname}:`, imageError);
                sport.getimage = ''; // If any error occurs, set the image to an empty string
            }
            return sport;
        });
        req.session.shop = shop;

        res.status(201).json({ msg: 'Ground added successfully!' });
    } catch (error) {
        console.error('Error adding ground:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.applyforverification = async (req, res) => {
    try {
      const { groundname } = req.body;
  
      // Find the ground in the shop's available sports and mark it as applied for verification
      const shopid = req.session.shop;
      const shop=await Shop.findById(shopid);
      const ground = shop.availablesports.find(g => g.groundname === groundname);
      
      if (ground) {
        ground.appliedforverification = true;
        await shop.save(); // Save changes to the database
        
        // Update session data with the new shop object
        req.session.shop = shop;

  
        return res.status(200).json({ message: 'Verification applied successfully' });
      } else {
        return res.status(404).json({ message: 'Ground not found' });
      }
    } catch (error) {
      console.error('Error applying for verification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
/*
exports.loadVenues = async (req, res) => {
    try {
      const shopsWithVenues = await Shop.find({ "availablesports.verify": true })
        .populate("availablesports.sport")
        .exec();
  
      const venueData = shopsWithVenues
        .map((shop) => {
          const verifiedSports = shop.availablesports.filter((sport) => sport.verify);
          return verifiedSports.map((sport) => {
            let imageBase64 = "";
            try {
              if (sport.image && sport.image.data) {
                const mimeType = sport.image.contentType || 'image/jpeg';
                imageBase64 = `data:${mimeType};base64,${sport.image.data.toString("base64")}`;
              }
            } catch (imageError) {
              console.error(`Error reading image for ${sport.groundname}:`, imageError);
            }
  
            return {
              name: shop.shopname,
              address: shop.address,
              image: imageBase64,
              groundname: sport.groundname,
              priceperhour: sport.priceperhour,
              maxplayers: sport.maxplayers,
              surfacetype: sport.surfacetype,
              status: sport.status,
              sportname: sport.sport?.name,
              grounddimensions: sport.grounddimensions,
              availability: sport.availability,
              facilities: sport.facilities,
            };
          });
        })
        .flat();
  
      if (venueData.length === 0) {
        return res.status(404).json({ message: "No verified venues found" });
      }
  
      res.status(200).json(venueData);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
*/
/*
const redis = require('../config/redisClient'); // Adjust path as needed

exports.loadVenues = async (req, res) => {
  try {
    // Step 1: Fetch venues from MongoDB
    const shopsWithVenues = await Shop.find({ "availablesports.verify": true })
      .populate("availablesports.sport")
      .exec();

    if (!shopsWithVenues || shopsWithVenues.length === 0) {
      return res.status(404).json({ message: "No verified venues found" });
    }

    let venueData = [];

    for (const shop of shopsWithVenues) {
      const verifiedSports = shop.availablesports.filter((sport) => sport.verify);

      for (const sport of verifiedSports) {
        const venueId = `${shop._id}-${sport._id}`;
        const cacheKey = `venue:${venueId}`;
        const cachedValue = await redis.get(cacheKey);

        let useCached = false;
        let cachedVenue;

        if (cachedValue) {
          cachedVenue = JSON.parse(cachedValue);
          const mongoLastModified = sport.updatedAt || sport.lastModified;
          const cachedLastModified = cachedVenue.lastModified;

          // Use cache only if lastModified matches
          if (mongoLastModified && cachedLastModified && new Date(mongoLastModified).getTime() === new Date(cachedLastModified).getTime()) {
            useCached = true;
            venueData.push(cachedVenue.data);
            continue;
          }
        }

        // Prepare fresh data if not using cache
        let imageBase64 = "";
        try {
          if (sport.image && sport.image.data) {
            const mimeType = sport.image.contentType || 'image/jpeg';
            imageBase64 = `data:${mimeType};base64,${sport.image.data.toString("base64")}`;
          }
        } catch (imageError) {
          console.error(`Error reading image for ${sport.groundname}:`, imageError);
        }

        const freshData = {
          name: shop.shopname,
          address: shop.address,
          image: imageBase64,
          groundname: sport.groundname,
          priceperhour: sport.priceperhour,
          maxplayers: sport.maxplayers,
          surfacetype: sport.surfacetype,
          status: sport.status,
          sportname: sport.sport?.name,
          grounddimensions: sport.grounddimensions,
          availability: sport.availability,
          facilities: sport.facilities,
        };

        // Save fresh data in Redis with timestamp
        await redis.set(
          cacheKey,
          JSON.stringify({
            lastModified: sport.updatedAt || sport.lastModified || new Date().toISOString(),
            data: freshData
          }),
          'EX',
          3600 // 1 hour TTL
        );

        venueData.push(freshData);
      }
    }

    if (venueData.length === 0) {
      return res.status(404).json({ message: "No verified venues found" });
    }

    res.status(200).json(venueData);

  } catch (error) {
    console.error("❌ Error fetching venues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
*/
const redis = require('../config/redisClient'); // Adjust path as neededconst Shop = require('../models/Shop');

exports.loadVenues = async (req, res) => {
  try {
    const cacheKey = 'venueData';

    // Step 1: Check Redis Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('✅ Serving venues from Redis cache');
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Step 2: Fetch from MongoDB
    const shopsWithVenues = await Shop.find({ "availablesports.verify": true })
      .populate("availablesports.sport")
      .exec();

    const venueData = shopsWithVenues
      .map((shop) => {
        const verifiedSports = shop.availablesports.filter((sport) => sport.verify);
        return verifiedSports.map((sport) => {
          let imageBase64 = "";
          try {
            if (sport.image && sport.image.data) {
              const mimeType = sport.image.contentType || 'image/jpeg';
              imageBase64 = `data:${mimeType};base64,${sport.image.data.toString("base64")}`;
            }
          } catch (imageError) {
            console.error(`Error reading image for ${sport.groundname}:`, imageError);
          }

          return {
            name: shop.shopname,
            address: shop.address,
            image: imageBase64,
            groundname: sport.groundname,
            priceperhour: sport.priceperhour,
            maxplayers: sport.maxplayers,
            surfacetype: sport.surfacetype,
            status: sport.status,
            sportname: sport.sport?.name,
            grounddimensions: sport.grounddimensions,
            availability: sport.availability,
            facilities: sport.facilities,
          };
        });
      })
      .flat();

    if (venueData.length === 0) {
      return res.status(404).json({ message: "No verified venues found" });
    }

    // Step 3: Cache the data in Redis (TTL 1 hour)
    await redis.set(cacheKey, JSON.stringify(venueData), 'EX', 3600);
    console.log('📦 Data cached in Redis for 1 hour');

    res.status(200).json(venueData);
  } catch (error) {
    console.error("❌ Error fetching venues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


  
exports.getcitieslist=async(req,res)=>{
    try{
        const cities = await City.find().populate('state');
        res.status(200).json({ cities });
    }catch(err){
        next(err);
    }
}


exports.loadGround = async (req, res) => {
    try {
      const { name } = req.body;
      const shopname = name.split('_')[0].replace(/-/g, ' ');
      const groundname = name.split('_')[1].replace(/-/g, ' ');        
  
      const shop = await Shop.findOne({ shopname }).populate({
        path: 'city',
        populate: { path: 'state' }
      });
  
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found.' });
      }
  
      const groundIndex = shop.availablesports.findIndex(sport => sport.groundname === groundname);
      if (groundIndex === -1) {
        return res.status(404).json({ message: 'Ground not found in this shop.' });
      }
  
      const ground = shop.availablesports[groundIndex];
      
      // Convert MongoDB image buffer to base64
      if (ground.image && ground.image.data) {
        const mimeType = ground.image.contentType || 'image/jpeg';
        getimage = `data:${mimeType};base64,${ground.image.data.toString('base64')}`;
      } else {
        getimage = null;
      }
  
      const address = shop.address;
  
      const shopbookings = await Booking.find({ shop: shop._id }).populate('user', 'username');
      const groundfeedbacks = shopbookings
        .filter(feedback => feedback.groundname === ground.groundname)
        .map(feedback => ({
          username: feedback.user?.username || null,
          rating: feedback.feedback?.rating || null,
          review: feedback.feedback?.review || null,
          feedbackDate: feedback.feedback?.feedbackDate || null,
        }));
  
      res.status(200).json({ shop, ground, address, groundfeedbacks,getimage });
  
    } catch (error) {
      console.error('Error loading ground:', error);
      res.status(500).json({ message: 'An error occurred while loading the ground.' });
    }
  };
  
  exports.bookground = async (req, res) => {
    const {  shopname, groundname, date, timeSlot,groundfee,platformfee, amountPaid } = req.body;
    console.log(shopname+ groundname+ date+ timeSlot+ amountPaid )
    // Validation
    if ( !shopname || !groundname || !date || !timeSlot || !amountPaid) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    
    try {
        const user=req.session.user;
    const shop=await Shop.findOne({shopname:shopname});
    // Create a new booking record
    const newBooking = new Booking({
        user,
        shop,
        groundname,
        date: new Date(date),
        timeSlot,
        amountPaid,
        groundfee,
          platformfee,
          amountPaid,
        status: 'Confirmed', // Default status
    });
        // Save the new booking to the database
        await newBooking.save();
        return res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while saving the booking.', error });
    }
};
exports.todaybookings = async (req, res) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    console.log(today);

    try {
        const bookings = await Booking.find({
            date: {
                $gte: startOfToday,
                $lt: endOfToday
            }
        }).populate('user') // Adjust as needed
          .populate('shop'); // Adjust as needed

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};
exports.checkRevenue = async (req, res) => {
    try {
        // Fetch the shop with populated available sports
        const shop = await Shop.findById(req.session.shop._id).populate('availablesports'); 
        const bookings = await Booking.find({ shop: shop._id }).populate('shop');

        const groundRevenueMap = {};
        let totalRevenue = 0;

        bookings.forEach((booking) => {
            // Get the ground name from the booking
            const groundName = booking.groundname;
            const groundFee = booking.groundfee || 0; // Get ground fee or default to 0
            totalRevenue += groundFee; // Increment total revenue

            // Increment ground revenue in the map
            if (groundRevenueMap[groundName]) {
                groundRevenueMap[groundName].groundFee += groundFee; // Increment existing ground fee
            } else {
                // Initialize ground revenue entry
                groundRevenueMap[groundName] = {
                    groundName: groundName,
                    groundFee: groundFee
                };
            }
        });


        // Transform the revenue map into an array format for response
        const groundRevenues = Object.values(groundRevenueMap);

        res.json({
            totalRevenue: totalRevenue,
            groundRevenues: groundRevenues
        });
    } catch (error) {
        console.error("Error fetching revenue data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.logout=async (req,res)=>{
    if (req.session && req.session.shop) {
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Failed to log out' });
            }
            // Clear the cookie
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        return res.status(400).json({ message: 'No active session to log out from' });
    }
}


exports.searchvenue = async (req, res) => {
    const { search } = req.query;

    try {
        if (!search) {
            return res.status(400).json({ message: "Search term is required" });
        }

        // Regular expression for case-insensitive search
        const regex = new RegExp(search, 'i');

        // Search for matching shops with available sports
        const shops = await Shop.find({
            'availablesports.groundname': { $regex: regex }
        });

        // Extract relevant details
        const searchResults = shops.flatMap(shop => 
            shop.availablesports
                .filter(ground => regex.test(ground.groundname))
                .map(ground => ground.groundname)
        );

        const searchShop = shops.flatMap(shop =>
            shop.availablesports
                .filter(ground => regex.test(ground.groundname))
                .map(ground => ({
                    shopname: shop.shopname,
                    groundname: ground.groundname,
                    address: shop.address
                }))
        );

        if (searchResults.length > 0) {
            return res.status(200).json({ searchResults, searchShop });
        } else {
            return res.status(404).json({ message: "No venues found matching the search term" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching venues" });
    }
};
exports.getsportslist = async (req, res) => {
    try {
      // Fetch all sports from the database
      const sports = await Sport.find().exec();

  
      // Check if any sports were found
      if (!sports || sports.length === 0) {
        return res.status(404).json({ message: 'No sports found' });
      }
  
      // Map and format the response data
      const sportData = sports.map(sport => ({
        name: sport.name,
        description: sport.description,
        equipmentRequired: sport.equipmentRequired,
        rules: sport.rules,
      }));
  
      // Send the sports data in response
      res.status(200).json(sportData);
    } catch (error) {
      console.error('Error fetching sports:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };