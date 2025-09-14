// api/submit.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Payment = require('../models/Payment');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Submit payment endpoint
router.post('/submit', upload.single('screenshot'), async (req, res) => {
  try {
    const { name, email, paymentMethod, date } = req.body;
    
    // Validate required fields
    if (!name || !email || !paymentMethod || !date) {
      return res.status(400).json({ error: 'Name, email, payment method, and date are required' });
    }

    // Create new payment
    const newPayment = new Payment({
      name,
      email,
      paymentMethod,
      screenshot: req.file ? `/uploads/${req.file.filename}` : null,
      date: new Date(date)
    });

    // Save to database
    await newPayment.save();

    res.status(201).json({ 
      message: 'Payment submitted successfully', 
      payment: newPayment 
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;