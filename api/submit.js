module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Parse the request body
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      body = req.body;
    }
    
    const { name, email, paymentMethod, date } = body;
    
    // Validate required fields
    if (!name || !email || !paymentMethod || !date) {
      return res.status(400).json({ error: 'Name, email, payment method, and date are required' });
    }
    
    // Return success response with mock data
    res.status(201).json({ 
      message: 'Payment submitted successfully (Mock Response)', 
      payment: {
        name,
        email,
        paymentMethod,
        date: new Date(date),
        screenshot: paymentMethod === 'online' ? 'online_payment_received' : null
      }
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};