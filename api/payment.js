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
  
  // Return mock data for testing
  res.status(200).json([
    {
      name: "Test User",
      email: "test@example.com",
      paymentMethod: "cash",
      date: new Date().toISOString()
    },
    {
      name: "Another User",
      email: "another@example.com",
      paymentMethod: "online",
      date: new Date().toISOString()
    }
  ]);
};