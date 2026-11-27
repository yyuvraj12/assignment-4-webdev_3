let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  bcrypt = require('bcryptjs');
}

const mongoose = require('mongoose');
const { isMongooseConnected, loadDb, saveDb, generateObjectId } = require('../config/db');

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);

// Unified User Data Access Object
const User = {
  async create({ username, email, password, role = 'user' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isMongooseConnected()) {
      const doc = await MongoUser.create({
        username,
        email,
        password: hashedPassword,
        role
      });
      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        role: doc.role,
        createdAt: doc.createdAt.toISOString()
      };
    } else {
      const db = loadDb();
      const existingUser = db.users.find(u => u.email === email || u.username === username);
      if (existingUser) {
        const error = new Error('User already exists');
        error.code = 11000;
        throw error;
      }
      const id = generateObjectId();
      const now = new Date().toISOString();
      const newUser = {
        _id: id,
        id: id,
        username,
        email,
        password: hashedPassword,
        role,
        createdAt: now
      };
      db.users.push(newUser);
      saveDb(db);
      return {
        id: newUser.id,
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      };
    }
  },

  async findByEmail(email) {
    if (isMongooseConnected()) {
      const doc = await MongoUser.findOne({ email });
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        password: doc.password,
        role: doc.role,
        createdAt: doc.createdAt.toISOString()
      };
    } else {
      const db = loadDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  async findById(id) {
    if (isMongooseConnected()) {
      const doc = await MongoUser.findById(id);
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        password: doc.password,
        role: doc.role,
        createdAt: doc.createdAt.toISOString()
      };
    } else {
      const db = loadDb();
      const user = db.users.find(u => u.id === id || u._id === id);
      return user || null;
    }
  },

  async findAll() {
    if (isMongooseConnected()) {
      const docs = await MongoUser.find({}, '-password');
      return docs.map(doc => ({
        id: doc._id.toString(),
        _id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        role: doc.role,
        createdAt: doc.createdAt.toISOString()
      }));
    } else {
      const db = loadDb();
      return db.users.map(({ password, ...u }) => u);
    }
  },

  async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
};

module.exports = User;
