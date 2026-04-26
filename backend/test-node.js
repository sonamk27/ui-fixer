console.log('Node.js is working!');
console.log('Current working directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Platform:', process.platform);

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const app = express();
  console.log('Express app created');
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working', timestamp: new Date().toISOString() });
  });
  
  const PORT = 5005;
  app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📊 Test endpoint: http://localhost:${PORT}/test`);
  });
  
} catch (error) {
  console.error('Error:', error.message);
}
