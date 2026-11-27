const mongoose = require('mongoose');
const { isMongooseConnected, loadDb, saveDb, generateObjectId } = require('../config/db');

// Mongoose Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoNote = mongoose.models.Note || mongoose.model('Note', noteSchema);

const Note = {
  async create({ title, content, owner }) {
    if (isMongooseConnected()) {
      const doc = await MongoNote.create({
        title,
        content,
        owner
      });
      return {
        _id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        owner: doc.owner,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } else {
      const db = loadDb();
      const id = generateObjectId();
      const now = new Date().toISOString();
      const newNote = {
        _id: id,
        title,
        content,
        owner,
        createdAt: now,
        updatedAt: now
      };
      db.notes.push(newNote);
      saveDb(db);
      return newNote;
    }
  },

  async findByOwner(ownerId) {
    if (isMongooseConnected()) {
      const docs = await MongoNote.find({ owner: ownerId }).sort({ createdAt: 1 });
      return docs.map(doc => ({
        _id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        owner: doc.owner,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }));
    } else {
      const db = loadDb();
      return db.notes.filter(n => n.owner === ownerId);
    }
  },

  async findById(noteId) {
    if (isMongooseConnected()) {
      const doc = await MongoNote.findById(noteId);
      if (!doc) return null;
      return {
        _id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        owner: doc.owner,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } else {
      const db = loadDb();
      const note = db.notes.find(n => n._id === noteId);
      return note || null;
    }
  },

  async updateById(noteId, { title, content }) {
    if (isMongooseConnected()) {
      const doc = await MongoNote.findByIdAndUpdate(
        noteId,
        {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          updatedAt: new Date()
        },
        { new: true }
      );
      if (!doc) return null;
      return {
        _id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        owner: doc.owner,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } else {
      const db = loadDb();
      const index = db.notes.findIndex(n => n._id === noteId);
      if (index === -1) return null;
      const note = db.notes[index];
      const updated = {
        ...note,
        title: title !== undefined ? title : note.title,
        content: content !== undefined ? content : note.content,
        updatedAt: new Date().toISOString()
      };
      db.notes[index] = updated;
      saveDb(db);
      return updated;
    }
  },

  async deleteById(noteId) {
    if (isMongooseConnected()) {
      const res = await MongoNote.findByIdAndDelete(noteId);
      return !!res;
    } else {
      const db = loadDb();
      const index = db.notes.findIndex(n => n._id === noteId);
      if (index === -1) return false;
      db.notes.splice(index, 1);
      saveDb(db);
      return true;
    }
  },

  async findAll() {
    if (isMongooseConnected()) {
      const docs = await MongoNote.find({}).sort({ createdAt: 1 });
      return docs.map(doc => ({
        _id: doc._id.toString(),
        title: doc.title,
        content: doc.content,
        owner: doc.owner,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }));
    } else {
      const db = loadDb();
      return db.notes;
    }
  }
};

module.exports = Note;
