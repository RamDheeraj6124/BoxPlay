const express = require('express');
const Usercontroller = require('../controllers/usercontroller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: User already exists
 *       404:
 *         description: Invalid email address
 *       500:
 *         description: Server error
 */
router.post('/signup', Usercontroller.signup);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', Usercontroller.login);

/**
 * @swagger
 * /user/checksession:
 *   get:
 *     summary: Check user session
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Returns user details if session exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       400:
 *         description: Session does not exist
 */
router.get('/checksession', Usercontroller.checksession);

/**
 * @swagger
 * /user/sendOTP:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error sending OTP
 */
router.post('/sendOTP', Usercontroller.sendOTP);

/**
 * @swagger
 * /user/loginOTP:
 *   post:
 *     summary: Login using OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 role:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/loginOTP', Usercontroller.loginOTP);

/**
 * @swagger
 * /user/resetPassword:
 *   post:
 *     summary: Reset user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/resetPassword', Usercontroller.resetPassword);

/**
 * @swagger
 * /user/userbookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Returns user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *       500:
 *         description: Server error
 */
router.get('/userbookings', Usercontroller.userbookings);

/**
 * @swagger
 * /user/updatecontact:
 *   post:
 *     summary: Update user contact
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: Contact is required
 *       500:
 *         description: Failed to update contact
 */
router.post('/updatecontact', Usercontroller.updatecontact);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: No active session
 *       500:
 *         description: Failed to log out
 */
router.post('/logout', Usercontroller.logout);

/**
 * @swagger
 * /user/submitfeedback:
 *   post:
 *     summary: Submit feedback for a booking
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *               rating:
 *                 type: number
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/submitfeedback', Usercontroller.submitfeedback);

/**
 * @swagger
 * /user/submitquery:
 *   post:
 *     summary: Submit a user query
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query saved successfully
 *       500:
 *         description: Server error
 */
router.post('/submitquery', Usercontroller.submitquery);

module.exports = router;