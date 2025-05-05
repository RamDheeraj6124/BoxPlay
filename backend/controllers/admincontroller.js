const express = require('express'); 
const User = require('../models/User');
const Shop = require('../models/Shop');
const Booking = require('../models/Booking');
const Sport = require('../models/Sport');
const Query = require('../models/Query');
const State = require('../models/State');
const City= require('../models/City');
const fs=require('fs');
const path=require('path');
const redis = require('../config/redisClient');

/*
const displaydetails = async (req, res) => {
    try {
        const cacheKey = 'Displayadmin';
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            console.log('Serving details from Redis cache');
            return JSON.parse(cachedData);
        }

        const users = await User.find().lean();
        const shops = await Shop.find().populate('availablesports.sport').lean(); 
        const queries = await Query.find().lean();

        shops.forEach((shop) => {
            if (shop.availablesports && shop.availablesports.length > 0) {
                shop.availablesports = shop.availablesports.map((item) => {
                    const sport = item.sport || {};
                    try {
                        if (sport.image && sport.image.data) {
                            const mimeType = sport.image.contentType || 'image/jpeg';
                            sport.getimage = `data:${mimeType};base64,${sport.image.data.toString('base64')}`;
                        } else {
                            sport.getimage = '';
                        }
                    } catch (imageError) {
                        console.error(`Error processing image for sport:`, imageError);
                        sport.getimage = '';
                    }
                    item.sport = sport;
                    return item;
                });
            }
        });

        const responseData = { users, shops, queries };

        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 3600);
        return responseData;

    } catch (err) {
        console.error("❌ Error retrieving data:", err);
        return res.status(500).json({ message: "Error retrieving data" });
    }
};
*/
const displaydetails = async (req, res) => {
    try {
        const [cachedUsers, cachedShops, cachedQueries] = await Promise.all([
            redis.get('AdminUsers'),
            redis.get('AdminShops'),
            redis.get('AdminQueries'),
        ]);

        let users = cachedUsers ? JSON.parse(cachedUsers) : null;
        let shops = cachedShops ? JSON.parse(cachedShops) : null;
        let queries = cachedQueries ? JSON.parse(cachedQueries) : null;

        if (!users) {
            users = await User.find().lean();
            await redis.set('AdminUsers', JSON.stringify(users), 'EX', 3600);
        }

        if (!shops) {
            shops = await Shop.find().populate('availablesports.sport').lean();

            shops.forEach((shop) => {
                if (shop.availablesports && shop.availablesports.length > 0) {
                    shop.availablesports = shop.availablesports.map((item) => {
                        const sport = item.sport || {};
                        try {
                            if (sport.image && sport.image.data) {
                                const mimeType = sport.image.contentType || 'image/jpeg';
                                sport.getimage = `data:${mimeType};base64,${sport.image.data.toString('base64')}`;
                            } else {
                                sport.getimage = '';
                            }
                        } catch (imageError) {
                            console.error(`Error processing image for sport:`, imageError);
                            sport.getimage = '';
                        }
                        item.sport = sport;
                        return item;
                    });
                }
            });

            await redis.set('AdminShops', JSON.stringify(shops), 'EX', 3600);
        }

        if (!queries) {
            queries = await Query.find().lean();
            await redis.set('AdminQueries', JSON.stringify(queries), 'EX', 3600);
        }

        return res.status(200).json({ users, shops, queries });

    } catch (err) {
        console.error("❌ Error retrieving data:", err);
        return res.status(500).json({ message: "Error retrieving data" });
    }
};



// Admin check session
exports.checksession = async (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        try {
            const admin = await User.findById(req.session.user._id);
            const details = await displaydetails();
            res.status(200).json({
                message: "Session Exists",
                username: req.session.user.username,
                details,
                admin
            });
        } catch (err) {
            next(err);
        }
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

// Admin verify route
/*
exports.adminverify = async (req, res, next) => {
    const { shopId, gid } = req.body; // gid is the list of sport _id's to verify

    try {
        const shop = await Shop.findById(shopId);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Update verification flags only for selected grounds
        shop.availablesports.forEach(sport => {
            if (gid.includes(String(sport._id))) {
                sport.verify = true;
                sport.appliedforverification = false;
            }
        });

        const updatedShop = await shop.save();
        return res.json(updatedShop);
    } catch (error) {
        console.error("Error in adminverify:", error);
        next(error);
    }
};*/
exports.adminverify = async (req, res, next) => {
    const { shopId, gid } = req.body; // gid is the list of sport _id's to verify

    try {
        const shop = await Shop.findById(shopId).populate('availablesports.sport');

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Update verification flags only for selected grounds
        shop.availablesports.forEach(sport => {
            if (gid.includes(String(sport._id))) {
                sport.verify = true;
                sport.appliedforverification = false;
            }
        });

        await shop.save();

        // Process sport images (like in displaydetails)
        if (shop.availablesports.length > 0) {
            shop.availablesports = shop.availablesports.map((item) => {
                const sport = item.sport || {};
                try {
                    if (sport.image && sport.image.data) {
                        const mimeType = sport.image.contentType || 'image/jpeg';
                        sport.getimage = `data:${mimeType};base64,${sport.image.data.toString('base64')}`;
                    } else {
                        sport.getimage = '';
                    }
                } catch (imageError) {
                    console.error("Error processing sport image:", imageError);
                    sport.getimage = '';
                }
                item.sport = sport;
                return item;
            });
        }

        // Update AdminShops Redis cache
        const cachedShops = await redis.get('AdminShops');
        if (cachedShops) {
            let shops = JSON.parse(cachedShops);
            const shopIndex = shops.findIndex(s => s._id === shopId);
            if (shopIndex !== -1) {
                shops[shopIndex].availablesports = shop.availablesports;
                await redis.set('AdminShops', JSON.stringify(shops), 'EX', 3600);
            }
        }

        return res.json(shop);
    } catch (error) {
        console.error("Error in adminverify:", error);
        next(error);
    }
};

/*
exports.admindeleteground = async (req, res, next) => {
    const { shopId, groundName } = req.body;
    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const groundIndex = shop.availablesports.findIndex(sport => sport.groundname === groundName);
        if (groundIndex === -1) {
            return res.status(404).json({ message: 'Ground not found' });
        }

        shop.availablesports.splice(groundIndex, 1);
        await shop.save();

        return res.status(200).json({ message: 'Ground deleted successfully', shop });
    } catch (error) {
        next(error);
    }
};*/
exports.admindeleteground = async (req, res, next) => {
    const { shopId, groundName } = req.body;

    try {
        const shop = await Shop.findById(shopId).populate('availablesports.sport');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const groundIndex = shop.availablesports.findIndex(
            sport => sport.groundname === groundName
        );
        if (groundIndex === -1) {
            return res.status(404).json({ message: 'Ground not found' });
        }

        // Remove ground and save shop
        shop.availablesports.splice(groundIndex, 1);
        await shop.save();

        // Process images like in displaydetails
        if (shop.availablesports.length > 0) {
            shop.availablesports = shop.availablesports.map((item) => {
                const sport = item.sport || {};
                try {
                    if (sport.image && sport.image.data) {
                        const mimeType = sport.image.contentType || 'image/jpeg';
                        sport.getimage = `data:${mimeType};base64,${sport.image.data.toString('base64')}`;
                    } else {
                        sport.getimage = '';
                    }
                } catch (imageError) {
                    console.error(`Error processing sport image:`, imageError);
                    sport.getimage = '';
                }
                item.sport = sport;
                return item;
            });
        }

        // Update AdminShops cache
        const cachedShops = await redis.get('AdminShops');
        if (cachedShops) {
            let shops = JSON.parse(cachedShops);
            const shopIndex = shops.findIndex(s => s._id === shopId);
            if (shopIndex !== -1) {
                shops[shopIndex].availablesports = shop.availablesports;
                await redis.set('AdminShops', JSON.stringify(shops), 'EX', 3600);
            }
        }

        return res.status(200).json({ message: 'Ground deleted successfully', shop });
    } catch (error) {
        next(error);
    }
};
/*
exports.verifygroundagain = async (req, res, next) => {
    const { shopId, groundName } = req.body;
    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const groundIndex = shop.availablesports.findIndex(sport => sport.groundname === groundName);
        if (groundIndex === -1) {
            return res.status(404).json({ message: 'Ground not found' });
        }

        shop.availablesports.verify=false;
        await shop.save();

        return res.status(200).json({ message: 'Ground deleted successfully', shop });
    } catch (error) {
        next(error);
    }
};*/
exports.verifygroundagain = async (req, res, next) => {
    const { shopId, groundName } = req.body;

    try {
        const shop = await Shop.findById(shopId).populate('availablesports.sport');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const groundIndex = shop.availablesports.findIndex(
            sport => sport.groundname === groundName
        );
        if (groundIndex === -1) {
            return res.status(404).json({ message: 'Ground not found' });
        }

        // Reset verification
        shop.availablesports[groundIndex].verify = false;
        shop.availablesports[groundIndex].appliedforverification = false;

        await shop.save();

        // Process images like in displaydetails
        shop.availablesports = shop.availablesports.map((item) => {
            const sport = item.sport || {};
            try {
                if (sport.image && sport.image.data) {
                    const mimeType = sport.image.contentType || 'image/jpeg';
                    sport.getimage = `data:${mimeType};base64,${sport.image.data.toString('base64')}`;
                } else {
                    sport.getimage = '';
                }
            } catch (imageError) {
                console.error(`Error processing sport image:`, imageError);
                sport.getimage = '';
            }
            item.sport = sport;
            return item;
        });

        // Update Redis cache
        const cachedShops = await redis.get('AdminShops');
        if (cachedShops) {
            let shops = JSON.parse(cachedShops);
            const shopIndex = shops.findIndex(s => s._id === shopId);
            if (shopIndex !== -1) {
                shops[shopIndex].availablesports = shop.availablesports;
                await redis.set('AdminShops', JSON.stringify(shops), 'EX', 3600);
            }
        }

        return res.status(200).json({ message: 'Ground verification reset successfully', shop });
    } catch (error) {
        next(error);
    }
};

/*
exports.admindeleteuser = async (req, res, next) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndDelet(userId);
        res.status(200).json({ message: 'Deleted Successfully' });
    } catch (error) {
        next(error);
    }
};*/
exports.admindeleteuser = async (req, res, next) => {
    const { userId } = req.body;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update Redis cache
        const cachedUsers = await redis.get('AdminUsers');
        if (cachedUsers) {
            let users = JSON.parse(cachedUsers);
            users = users.filter(user => user._id !== userId);
            await redis.set('AdminUsers', JSON.stringify(users), 'EX', 3600);
        }

        res.status(200).json({ message: 'Deleted Successfully' });
    } catch (error) {
        next(error);
    }
};


exports.fixpercentage = async (req, res, next) => {
    const { percentage } = req.body;
    try {
        const adminid = req.session.user._id;
        const admin = await User.findById(adminid);
        admin.revenuepercentage = percentage;
        await admin.save();

        res.status(200).json({ message: 'Percentage updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getpercentage = async (req, res, next) => {
    try {
        const role = 'admin';
        const admin = await User.findOne({ role: role });

        if (admin) {
            res.status(200).json({ percentage: admin.revenuepercentage });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (err) {
        next(err);
    }
};
/*
exports.checkRevenue = async (req, res, next) => {
    try {
        const bookings = await Booking.find();
        const shops = await Shop.find();

        const shopMap = {};
        shops.forEach(shop => {
            shopMap[shop._id] = shop.shopname;
        });

        const revenueMap = {};
        let totalRevenue = 0;

        bookings.forEach((booking) => {
            const shopId = booking.shop;
            const platformFee = booking.platformfee || 0;
            totalRevenue += platformFee;

            if (shopId) {
                if (revenueMap[shopId]) {
                    revenueMap[shopId].platformFee += platformFee;
                } else {
                    revenueMap[shopId] = {
                        shopName: shopMap[shopId] || "Unknown Shop",
                        platformFee: platformFee
                    };
                }
            }
        });

        const shopRevenues = Object.keys(revenueMap).map((shopId) => ({
            shopId: shopId,
            shopName: revenueMap[shopId].shopName,
            platformFee: revenueMap[shopId].platformFee
        }));

        res.json({
            totalRevenue: totalRevenue,
            shopRevenues: shopRevenues
        });
    } catch (error) {
        next(error);
    }
};*/
exports.checkRevenue = async (req, res, next) => {
    try {
        let shops;

        // Check Redis cache first
        const cachedShops = await redis.get('AdminShops');
        if (cachedShops) {
            shops = JSON.parse(cachedShops);
        } else {
            // Fetch from DB if not cached
            shops = await Shop.find().populate('availablesports.sport').lean();

            // Handle sport image conversion (like in displaydetails)
            shops.forEach((shop) => {
                if (shop.availablesports && shop.availablesports.length > 0) {
                    shop.availablesports = shop.availablesports.map((item) => {
                        const sport = item.sport || {};
                        try {
                            if (sport.image && sport.image.data) {
                                const mimeType = sport.image.contentType || 'image/jpeg';
                                sport.getimage = `data:${mimeType};base64,${sport.image.data.toString('base64')}`;
                            } else {
                                sport.getimage = '';
                            }
                        } catch (imageError) {
                            console.error(`Error processing image for sport:`, imageError);
                            sport.getimage = '';
                        }
                        item.sport = sport;
                        return item;
                    });
                }
            });

            // Cache the result
            await redis.set('AdminShops', JSON.stringify(shops), 'EX', 3600);
        }

        const bookings = await Booking.find();

        const shopMap = {};
        shops.forEach(shop => {
            shopMap[shop._id] = shop.shopname;
        });

        const revenueMap = {};
        let totalRevenue = 0;

        bookings.forEach((booking) => {
            const shopId = booking.shop;
            const platformFee = booking.platformfee || 0;
            totalRevenue += platformFee;

            if (shopId) {
                if (revenueMap[shopId]) {
                    revenueMap[shopId].platformFee += platformFee;
                } else {
                    revenueMap[shopId] = {
                        shopName: shopMap[shopId] || "Unknown Shop",
                        platformFee: platformFee
                    };
                }
            }
        });

        const shopRevenues = Object.keys(revenueMap).map((shopId) => ({
            shopId: shopId,
            shopName: revenueMap[shopId].shopName,
            platformFee: revenueMap[shopId].platformFee
        }));

        res.json({
            totalRevenue: totalRevenue,
            shopRevenues: shopRevenues
        });

    } catch (error) {
        next(error);
    }
};


exports.getallbookings = async (req, res, next) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const futureBookings = await Booking.find({ date: { $gt: endOfDay } }).populate('user shop');
        const todaysBookings = await Booking.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('user shop');
        const pastBookings = await Booking.find({ date: { $lt: startOfDay } }).populate('user shop');

        res.status(200).json({
            success: true,
            futureBookings,
            todaysBookings,
            pastBookings
        });
    } catch (err) {
        next(err);
    }
};

exports.getsportslist = async (req, res, next) => {
    try {
        const sportslist = await Sport.find();

        if (sportslist.length > 0) {
            res.status(200).json({ success: true, sportslist });
        } else {
            res.status(404).json({ success: false, message: 'No sports found' });
        }
    } catch (err) {
        next(err);
    }
};

exports.addsport = async (req, res, next) => {
    try {
        const { sportName, equipmentRequired, rules } = req.body;

        if (!sportName || !equipmentRequired || !rules) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newSport = new Sport({
            name: sportName,
            equipmentRequired,
            rules
        });

        await newSport.save();

        return res.status(201).json({ message: 'Sport added successfully', sport: newSport });
    } catch (err) {
        next(err);
    }
};
exports.getstateslist=async(req,res)=>{
    try{
        const states = await State.find();
        res.status(200).json({ states });
    }catch(err){
        next(err);
    }
}
exports.getcitieslist=async(req,res)=>{
    try{
        const cities = await City.find();
        res.status(200).json({ cities });
    }catch(err){
        next(err);
    }
}
exports.addstate=async(req,res)=>{
    try{
        const name=req.body.name;
        const check=await State.findOne({name});
        if(check){
            return res.status(400).json({ message: 'State already exists.' });
        }
        const newState = new State({
            name
            });
        await newState.save();
        res.status(201).json({ message: 'State added successfully', state: newState });
        }catch(err){
        next(err);
    }}
exports.addcity=async(req,res)=>{
    try{
        const name=req.body.name;
        const stateId=req.body.stateId;
        const check=await City.findOne({name});
        const state=await State.findById(stateId);
        if(check){
            return res.status(400).json({ message: 'City already exists.' });
        }
        const newCity = new City({
            name,
            state:state._id
            });
        await newCity.save();
        state.cities.push(newCity);
        res.status(201).json({ message: 'city added successfully', city: newCity });
        }catch(err){
        console.log(err);
    }}    
   
            

exports.logout = async (req, res, next) => {
    if (req.session && req.session.user.role === 'admin') {
        req.session.destroy(err => {
            if (err) {
                return next(err);
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        res.status(400).json({ message: 'No active session to log out from' });
    }
};
