const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let isMongooseConnected = false;

const dataDir = path.join(__dirname, '../../data');
const dbFilePath = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure db.json exists
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({ users: [], notes: [] }, null, 2));
}

const loadDb = () => {
  try {
    const content = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return { users: [], notes: [] };
  }
};

const saveDb = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

const generateObjectId = () => {
  return crypto.randomBytes(12).toString('hex');
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not set. Using JSON file data persistence.');
    return;
  }

  try {
    // Attempt Mongoose connection with a short timeout to prevent blocking if Mongo is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isMongooseConnected = true;
    console.log('[Database] Connected to MongoDB via Mongoose');
  } catch (error) {
    console.log('[Database] MongoDB connection failed or offline. Using JSON file data persistence.');
    isMongooseConnected = false;
  }
};

module.exports = {
  connectDB,
  isMongooseConnected: () => isMongooseConnected,
  loadDb,
  saveDb,
  generateObjectId
};
