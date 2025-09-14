// api/payments.js
const express = require('express');
const Payment = require('../models/Payment');

const router = express.Router();

// Get all payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;