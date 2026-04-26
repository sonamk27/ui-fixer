const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server is running' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health endpoint: http://localhost:${PORT}/health`);
});

console.log('Starting test server...');
