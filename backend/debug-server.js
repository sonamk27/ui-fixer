console.log('Starting debug server...');

try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  
  const express = require('express');
  console.log('✅ express loaded');
  
  const cors = require('cors');
  console.log('✅ cors loaded');
  
  const helmet = require('helmet');
  console.log('✅ helmet loaded');
  
  const rateLimit = require('express-rate-limit');
  console.log('✅ rateLimit loaded');
  
  const morgan = require('morgan');
  console.log('✅ morgan loaded');
  
  const path = require('path');
  const fs = require('fs');
  console.log('✅ path and fs loaded');
  
  // Test basic server setup
  const app = express();
  console.log('✅ express app created');
  
  // Basic middleware
  app.use(cors());
  console.log('✅ cors middleware added');
  
  app.use(express.json());
  console.log('✅ json middleware added');
  
  // Health endpoint
  app.get('/health', (req, res) => {
    console.log('Health endpoint called');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Debug server is running'
    });
  });
  console.log('✅ health endpoint added');
  
  const PORT = 5001;
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`📊 Health endpoint: http://localhost:${PORT}/health`);
  });
  
  console.log('✅ server.listen called');
  
} catch (error) {
  console.error('❌ Error starting debug server:', error.message);
  console.error('Stack:', error.stack);
}
