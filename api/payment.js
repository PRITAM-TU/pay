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

// Cache the connection
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
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { conn, Payment } = await connectToDatabase();
    
    const payments = await Payment.find().sort({ date: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};