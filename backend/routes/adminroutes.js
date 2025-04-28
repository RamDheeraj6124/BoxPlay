const express = require('express');
const Admincontroller = require('../controllers/admincontroller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /admin/checksession:
 *   get:
 *     summary: Check admin session
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns admin details if session exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 username:
 *                   type: string
 *                 details:
 *                   type: object
 *                 admin:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/checksession', Admincontroller.checksession);

/**
 * @swagger
 * /admin/adminverify:
 *   post:
 *     summary: Verify shop details
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopId:
 *                 type: string
 *               availablesports:
 *                 type: array
 *     responses:
 *       200:
 *         description: Shop verified successfully
 *       404:
 *         description: Shop not found
 */
router.post('/adminverify', Admincontroller.adminverify);

/**
 * @swagger
 * /admin/deleteground:
 *   post:
 *     summary: Delete a ground
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopId:
 *                 type: string
 *               groundName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ground deleted successfully
 *       404:
 *         description: Shop or ground not found
 */
router.post('/deleteground', Admincontroller.admindeleteground);

/**
 * @swagger
 * /admin/deleteuser:
 *   post:
 *     summary: Delete a user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.post('/deleteuser', Admincontroller.admindeleteuser);

/**
 * @swagger
 * /admin/fixpercentage:
 *   post:
 *     summary: Set revenue percentage
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               percentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Percentage updated successfully
 */
router.post('/fixpercentage', Admincontroller.fixpercentage);

/**
 * @swagger
 * /admin/getpercentage:
 *   get:
 *     summary: Get revenue percentage
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns revenue percentage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 percentage:
 *                   type: number
 *       404:
 *         description: Admin not found
 */
router.get('/getpercentage', Admincontroller.getpercentage);

/**
 * @swagger
 * /admin/checkrevenue:
 *   get:
 *     summary: Check revenue statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                 shopRevenues:
 *                   type: array
 */
router.get('/checkrevenue', Admincontroller.checkRevenue);

/**
 * @swagger
 * /admin/getallbookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns all bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 futureBookings:
 *                   type: array
 *                 todaysBookings:
 *                   type: array
 *                 pastBookings:
 *                   type: array
 */
router.get('/getallbookings', Admincontroller.getallbookings);

/**
 * @swagger
 * /admin/getsportslist:
 *   get:
 *     summary: Get sports list
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns sports list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sportslist:
 *                   type: array
 *       404:
 *         description: No sports found
 */
router.get('/getsportslist', Admincontroller.getsportslist);

/**
 * @swagger
 * /admin/addsport:
 *   post:
 *     summary: Add a new sport
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sportName:
 *                 type: string
 *               equipmentRequired:
 *                 type: string
 *               rules:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sport added successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/addsport', Admincontroller.addsport);

/**
 * @swagger
 * /admin/verifygroundagain:
 *   post:
 *     summary: Re-verify a ground
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopId:
 *                 type: string
 *               groundName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ground verification reset
 *       404:
 *         description: Shop or ground not found
 */
router.post('/verifygroundagain', Admincontroller.verifygroundagain);

/**
 * @swagger
 * /admin/getstateslist:
 *   get:
 *     summary: Get states list
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns states list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 states:
 *                   type: array
 */
router.get('/getstateslist', Admincontroller.getstateslist);

/**
 * @swagger
 * /admin/getcitieslist:
 *   get:
 *     summary: Get cities list
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns cities list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 */
router.get('/getcitieslist', Admincontroller.getcitieslist);

/**
 * @swagger
 * /admin/addstate:
 *   post:
 *     summary: Add a new state
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: State added successfully
 *       400:
 *         description: State already exists
 */
router.post('/addstate', Admincontroller.addstate);

/**
 * @swagger
 * /admin/addcity:
 *   post:
 *     summary: Add a new city
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               stateId:
 *                 type: string
 *     responses:
 *       201:
 *         description: City added successfully
 *       400:
 *         description: City already exists
 */
router.post('/addcity', Admincontroller.addcity);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: No active session
 */
router.post('/logout', Admincontroller.logout);

module.exports = router;