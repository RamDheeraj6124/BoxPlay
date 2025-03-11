const express = require('express');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Booking=require('../models/Booking');
const Sport=require('../models/Sport');
const Query = require('../models/Query');

const displaydetails = async () => {
    let users = [];
    let shops = [];
    let queries=[];
    try {
        users = await User.find();
        shops = await Shop.find();
        queries=await Query.find();
        return { users, shops,queries }; // Return the data
    } catch (err) {
        console.error(err);
        throw new Error("Error retrieving data");
    }
};

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
        } catch (error) {
            error.type = 'redirect';
            next(error);
        }
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

exports.adminverify = async (req, res, next) => {
    const { shopId, availablesports } = req.body;

    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            const error = new Error('Shop not found');
            error.type = 'redirect';
            return next(error);
        }

        shop.availablesports = availablesports;
        const updatedShop = await shop.save();

        return res.json(updatedShop);
    } catch (error) {
        error.type = 'redirect';
        next(error);
    }
};

exports.admindeleteground = async (req, res, next) => {
    const { shopId, groundName } = req.body;

    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            const error = new Error('Shop not found');
            error.type = 'redirect';
            return next(error);
        }

        const groundIndex = shop.availablesports.findIndex(sport => sport.groundname === groundName);
        if (groundIndex === -1) {
            const error = new Error('Ground not found');
            error.type = 'redirect';
            return next(error);
        }

        shop.availablesports.splice(groundIndex, 1);
        await shop.save();

        return res.status(200).json({ message: 'Ground deleted successfully', shop });
    } catch (error) {
        error.type = 'redirect';
        next(error);
    }
};

exports.admindeleteuser = async (req, res, next) => {
    const { userId } = req.body;

    try {
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'Deleted Successfully' });
    } catch (error) {
        error.type = 'redirect';
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
        error.type = 'redirect';
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
            const error = new Error('Admin not found');
            error.type = 'redirect';
            next(error);
        }
    } catch (error) {
        error.type = 'redirect';
        next(error);
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
        error.type = 'redirect';
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
    } catch (error) {
        error.type = 'redirect';
        next(error);
    }
};

exports.getsportslist = async (req, res, next) => {
    try {
        const sportslist = await Sport.find();

        if (sportslist) {
            res.status(200).json({ success: true, sportslist });
        } else {
            const error = new Error('No sports found');
            error.type = 'redirect';
            next(error);
        }
    } catch (error) {
        error.type = 'redirect';
        next(error);
    }
};

exports.addsport = async (req, res, next) => {
    try {
        const { sportName, equipmentRequired, rules } = req.body;

        if (!sportName || !equipmentRequired || !rules) {
            const error = new Error('All fields are required');
            error.type = 'redirect';
            return next(error);
        }

        const newSport = new Sport({
            name: sportName,
            equipmentRequired,
            rules
        });

        await newSport.save();

        res.status(201).json({ message: 'Sport added successfully', sport: newSport });
    } catch (error) {
        error.type = 'redirect';
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    if (req.session && req.session.user.role === 'admin') {
        req.session.destroy(err => {
            if (err) {
                err.type = 'redirect';
                return next(err);
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        res.status(400).json({ message: 'No active session to log out from' });
    }
};


