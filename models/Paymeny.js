// models/Payment.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Payment', paymentSchema);