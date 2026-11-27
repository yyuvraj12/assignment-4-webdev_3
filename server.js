require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initSocketIO } = require('./src/services/socketService');

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express application
const server = http.createServer(app);

// Initialize Socket.IO attached to HTTP server
initSocketIO(server);

// Handle server listening errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`👉 On macOS, port 5000 is occupied by "AirPlay Receiver" (ControlCenter) by default.`);
    console.error(`   To resolve this, you can either:`);
    console.error(`   1. Turn off AirPlay Receiver: System Settings > General > AirDrop & AirPlay > Toggle OFF "AirPlay Receiver".`);
    console.error(`   2. Or change PORT in .env (e.g., PORT=5001).\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Start server after connecting to database
(async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
})();

module.exports = server;
