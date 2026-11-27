require('dotenv').config();
const { io } = require('socket.io-client');

const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

async function runChatDemo() {
  console.log(`Connecting chat clients to ${SERVER_URL}...\n`);

  const socketAditi = io(SERVER_URL);
  const socketRohan = io(SERVER_URL);

  await Promise.all([
    new Promise((res) => socketAditi.on('connect', res)),
    new Promise((res) => socketRohan.on('connect', res))
  ]);

  // Join room 'general'
  socketAditi.emit('join_room', 'general');
  socketRohan.emit('join_room', 'general');

  await new Promise((r) => setTimeout(r, 300));

  // Send message 1
  socketAditi.emit('chat_message', {
    room: 'general',
    sender: 'Aditi',
    message: 'Hey team, backend is ready 🚀'
  });

  await new Promise((r) => setTimeout(r, 400));

  // Send message 2
  socketRohan.emit('chat_message', {
    room: 'general',
    sender: 'Rohan',
    message: 'Testing chat now...'
  });

  await new Promise((r) => setTimeout(r, 400));

  // Send message 3
  socketAditi.emit('chat_message', {
    room: 'general',
    sender: 'Aditi',
    message: 'Messages arriving in real time ⚡'
  });

  await new Promise((r) => setTimeout(r, 600));

  socketAditi.disconnect();
  socketRohan.disconnect();
  console.log('\nChat demo completed.');
  process.exit(0);
}

runChatDemo();
