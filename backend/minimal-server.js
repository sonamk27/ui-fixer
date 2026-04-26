console.log('Starting minimal server...');

const express = require('express');
const app = express();

console.log('Express loaded');

// Basic middleware
app.use(express.json());
console.log('JSON middleware added');

// Health endpoint
app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Minimal server is running'
  });
});

console.log('Health endpoint configured');

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📊 Health endpoint: http://localhost:${PORT}/health`);
});

console.log('Server setup complete');
