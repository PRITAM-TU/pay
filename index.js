const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


// MongoDB Connection
const MONGODB_URI = "mongodb+srv://pritamtung03_db_user:WLIFVuRwEev7APoP@cluster0.4ysopge.mongodb.net/Study_game";
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

let isconnected = false;
async function connecttoMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isconnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
app.use(async (req, res, next) => {
  if (!isconnected) {
    await connecttoMongoDB();
  }
  next();
});

// Payment Schema and Model
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
    type: String,
    required: function() {
      return this.paymentMethod === 'online';
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

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

// Routes
// Submit payment endpoint
app.post('/api/submit', upload.single('screenshot'), async (req, res) => {
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

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;