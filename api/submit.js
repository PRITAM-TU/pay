const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://pritamtung03_db_user:WLIFVuRwEev7APoP@cluster0.4ysopge.mongodb.net/Study_game";

// Payment Schema
const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash'],
    required: true
  },
  screenshot: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

let Payment;
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
    
    // Define model after connection
    Payment = mongoose.model('Payment', paymentSchema);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await connectToDatabase();
    
    const { name, email, paymentMethod, date } = req.body;
    
    // Validate required fields
    if (!name || !email || !paymentMethod || !date) {
      return res.status(400).json({ error: 'Name, email, payment method, and date are required' });
    }
    
    // For online payments, we'll just store a placeholder since we can't upload files easily
    const screenshot = paymentMethod === 'online' ? 'online_payment_received' : null;
    
    // Create new payment
    const newPayment = new Payment({
      name,
      email,
      paymentMethod,
      screenshot,
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
};