const Note = require('../models/Note');
const appEvents = require('../services/eventEmitter');

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required' });
    }

    const note = await Note.create({
      title,
      content,
      owner: req.user.id
    });

    // Trigger event-driven architecture
    appEvents.emit('note:created', note);

    return res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ message: 'Failed to create note' });
  }
};

// Get all notes for the authenticated user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.findByOwner(req.user.id);
    return res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Role-based verification: Owner or Admin
    if (note.owner !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this note' });
    }

    return res.status(200).json(note);
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch note' });
  }
};

// Update an existing note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const existing = await Note.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner (or admin) can update
    if (existing.owner !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this note' });
    }

    const updated = await Note.updateById(id, { title, content });

    // Trigger event-driven architecture
    appEvents.emit('note:updated', updated);

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ message: 'Failed to update note' });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Note.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner or admin can delete
    if (existing.owner !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this note' });
    }

    await Note.deleteById(id);

    // Trigger event-driven architecture
    appEvents.emit('note:deleted', { noteId: id, userId: req.user.id });

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ message: 'Failed to delete note' });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
};
