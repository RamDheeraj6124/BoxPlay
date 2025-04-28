const express = require('express');
const shopController = require('../controllers/shopcontroller');
const router = express.Router();
const multer = require('multer');

/**
 * @swagger
 * tags:
 *   name: Shop
 *   description: Shop management endpoints
 */

// Multer configuration (unchanged)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${req.session.shop._id}${req.body.groundname}.${fileExtension}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only images are allowed!'), false);
    }
};
const upload = multer({ storage, fileFilter });

/**
 * @swagger
 * /shop/shopregister:
 *   post:
 *     summary: Register a new shop
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shop registered successfully
 *       400:
 *         description: Shop with this email already exists
 *       404:
 *         description: Invalid email address
 *       500:
 *         description: Server error
 */
router.post('/shopregister', shopController.registershop);

/**
 * @swagger
 * /shop/shoplogin:
 *   post:
 *     summary: Login as a shop
 *     tags: [Shop]
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
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/shoplogin', shopController.loginshop);

/**
 * @swagger
 * /shop/checkshopsession:
 *   get:
 *     summary: Check shop session
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Returns shop details if session exists
 *       400:
 *         description: Session does not exist
 */
router.get('/checkshopsession', shopController.checkshopsession);

/**
 * @swagger
 * /shop/updateshop:
 *   post:
 *     summary: Update shop details
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopname:
 *                 type: string
 *               address:
 *                 type: string
 *               cityobject:
 *                 type: object
 *               locationlink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shop details updated successfully
 *       401:
 *         description: No shop logged in
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.post('/updateshop', shopController.updateshop);

/**
 * @swagger
 * /shop/addground:
 *   post:
 *     summary: Add a new ground
 *     tags: [Shop]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The ground image to upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               selectsport:
 *                 type: string
 *               groundname:
 *                 type: string
 *               priceperhour:
 *                 type: number
 *               maxplayers:
 *                 type: number
 *               groundLength:
 *                 type: number
 *               groundwidth:
 *                 type: number
 *               facilities:
 *                 type: string
 *               surfaceType:
 *                 type: string
 *               availability:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ground added successfully
 *       400:
 *         description: All fields are required
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.post('/addground', upload.single('image'), shopController.addground);

/**
 * @swagger
 * /shop/loadvenues:
 *   get:
 *     summary: Load all verified venues
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Returns list of verified venues
 *       404:
 *         description: No verified venues found
 *       500:
 *         description: Server error
 */
router.get('/loadvenues', shopController.loadVenues);

/**
 * @swagger
 * /shop/loadground:
 *   post:
 *     summary: Load specific ground details
 *     tags: [Shop]
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
 *       200:
 *         description: Returns ground details
 *       404:
 *         description: Shop or ground not found
 *       500:
 *         description: Server error
 */
router.post('/loadground', shopController.loadGround);

/**
 * @swagger
 * /shop/bookground:
 *   post:
 *     summary: Book a ground
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopname:
 *                 type: string
 *               groundname:
 *                 type: string
 *               date:
 *                 type: string
 *               timeSlot:
 *                 type: string
 *               groundfee:
 *                 type: number
 *               platformfee:
 *                 type: number
 *               amountPaid:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking confirmed
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */
router.post('/bookground', shopController.bookground);

/**
 * @swagger
 * /shop/todaybookings:
 *   get:
 *     summary: Get today's bookings
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Returns today's bookings
 *       500:
 *         description: Server error
 */
router.get('/todaybookings', shopController.todaybookings);

/**
 * @swagger
 * /shop/applyforverification:
 *   post:
 *     summary: Apply for ground verification
 *     tags: [Shop]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groundname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification applied successfully
 *       404:
 *         description: Ground not found
 *       500:
 *         description: Server error
 */
router.post('/applyforverification', shopController.applyforverification);

/**
 * @swagger
 * /shop/checkrevenue:
 *   get:
 *     summary: Check shop revenue
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Returns revenue data
 *       500:
 *         description: Server error
 */
router.get('/checkrevenue', shopController.checkRevenue);

/**
 * @swagger
 * /shop/logout:
 *   post:
 *     summary: Logout shop
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: No active session
 *       500:
 *         description: Failed to log out
 */
router.post('/logout', shopController.logout);

/**
 * @swagger
 * /shop/venues:
 *   get:
 *     summary: Search venues
 *     tags: [Shop]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term for venues
 *     responses:
 *       200:
 *         description: Returns search results
 *       400:
 *         description: Search term is required
 *       404:
 *         description: No venues found
 *       500:
 *         description: Server error
 */
router.get('/venues', shopController.searchvenue);

/**
 * @swagger
 * /shop/getsportslist:
 *   get:
 *     summary: Get sports list
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Returns sports list
 *       404:
 *         description: No sports found
 *       500:
 *         description: Server error
 */
router.get('/getsportslist', shopController.getsportslist);

/**
 * @swagger
 * /shop/getcitieslist:
 *   get:
 *     summary: Get cities list
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: Returns cities list
 *       500:
 *         description: Server error
 */
router.get('/getcitieslist', shopController.getcitieslist);

module.exports = router;