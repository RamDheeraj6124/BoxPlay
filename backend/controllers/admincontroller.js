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


const displaydetails = async (req, res) => {
    try {


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
        return responseData;

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
};


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
};

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
};


exports.admindeleteuser = async (req, res, next) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndDelet(userId);
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
