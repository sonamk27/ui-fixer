// Root server.js for Render deployment
// This file points to the actual backend server

// Change working directory to backend and start the server
process.chdir('./backend');
require('./src/server.js');
