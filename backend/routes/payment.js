const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const cors = require('cors');  // Add this to handle CORS
require('dotenv').config();

// Allow CORS for frontend URL (Adjust this if your frontend is hosted somewhere else)
router.use(cors({ origin: 'https://boxplay-2.onrender.com' }));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create an order
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt = 'receipt_order_1' } = req.body;

  // Check if the amount is valid
  const amountInPaise = amount * 100;  // Razorpay expects amount in paise
  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Prepare Razorpay order options
    const options = {
      amount: amountInPaise, // Amount in paise
      currency,
      receipt,
    };

    // Create order
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order);  // Log the order details

    res.json({ order });
  } catch (error) {
    // Log full error details for better debugging
    console.error('Error creating order:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

module.exports = router;
