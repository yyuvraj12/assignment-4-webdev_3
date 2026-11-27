const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();

// Register application-wide event listeners
appEvents.on('user:registered', (user) => {
  console.log(`[EventEmitter] Event: user:registered | User: ${user.username} (${user.email}), ID: ${user.id || user._id}`);
});

appEvents.on('user:login', (data) => {
  console.log(`[EventEmitter] Event: user:login | User: ${data.email} logged in at ${new Date().toISOString()}`);
});

appEvents.on('note:created', (note) => {
  console.log(`[EventEmitter] Event: note:created | Note ID: ${note._id}, Title: "${note.title}", Owner: ${note.owner}`);
});

appEvents.on('note:updated', (note) => {
  console.log(`[EventEmitter] Event: note:updated | Note ID: ${note._id}, Title: "${note.title}"`);
});

appEvents.on('note:deleted', (data) => {
  console.log(`[EventEmitter] Event: note:deleted | Note ID: ${data.noteId}, Deleted by: ${data.userId}`);
});

appEvents.on('chat:message', (data) => {
  console.log(`[EventEmitter] Event: chat:message | Room: ${data.room}, Sender: ${data.sender}`);
});

module.exports = appEvents;
