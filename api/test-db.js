const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://pritamtung03_db_user:WLIFVuRwEev7APoP@cluster0.4ysopge.mongodb.net/Study_game";

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB');
    
    // Check if database exists and is accessible
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check if payments collection exists
    const paymentCollectionExists = collections.some(c => c.name === 'payments');
    
    res.status(200).json({
      status: 'success',
      message: 'Connected to MongoDB successfully',
      database: mongoose.connection.db.databaseName,
      collections: collections.map(c => c.name),
      paymentCollectionExists: paymentCollectionExists
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message
    });
  }
};