const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); // Use /tmp directory on Vercel
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Cache the connection and model
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, Payment: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached;
  }
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      // Define model after connection
      cached.Payment = mongoose.model('Payment', paymentSchema);
      return { mongoose, Payment: cached.Payment };
    });
  }
  
  cached.conn = await cached.promise;
  return cached;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Use multer to handle file upload
  upload.single('screenshot')(req, res, async function(err) {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const { conn, Payment } = await connectToDatabase();
      
      const { name, email, paymentMethod, date } = req.body;
      
      // Validate required fields
      if (!name || !email || !paymentMethod || !date) {
        return res.status(400).json({ error: 'Name, email, payment method, and date are required' });
      }
      
      // For Vercel, we can't save files permanently, so we'll just store the filename
      const screenshot = req.file ? req.file.filename : null;
      
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
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });
};