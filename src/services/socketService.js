const { Server } = require('socket.io');
const appEvents = require('./eventEmitter');

const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Exact format shown in Fig 3: User connected: <socket.id>
    console.log(`User connected: ${socket.id}`);

    // Handle joining a room (supports 'join' or 'join_room')
    const handleJoin = (room) => {
      const roomName = typeof room === 'string' ? room : room?.room || 'general';
      socket.join(roomName);
      // Exact format shown in Fig 3: <socket.id> joined room <room>
      console.log(`${socket.id} joined room ${roomName}`);
      socket.emit('joined', { room: roomName, socketId: socket.id });
    };

    socket.on('join', handleJoin);
    socket.on('join_room', handleJoin);

    // Handle sending a message (supports 'chat_message' or 'send_message')
    const handleMessage = (data) => {
      const room = data.room || 'general';
      const sender = data.sender || 'Anonymous';
      const message = data.message || '';

      // Exact format shown in Fig 3: [<room>] <sender>: <message>
      console.log(`[${room}] ${sender}: ${message}`);

      // Emit event through Node.js EventEmitter
      appEvents.emit('chat:message', { room, sender, message });

      const payload = {
        room,
        sender,
        message,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all clients in the room
      io.to(room).emit('receive_message', payload);
      io.to(room).emit('chat_message', payload);
    };

    socket.on('chat_message', handleMessage);
    socket.on('send_message', handleMessage);

    socket.on('disconnect', () => {
      // User disconnected logging
      // console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initSocketIO };
