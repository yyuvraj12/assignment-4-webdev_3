const User = require('../models/User');
const Note = require('../models/Note');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Admin getAllUsers error:', error);
    return res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll();
    return res.status(200).json(notes);
  } catch (error) {
    console.error('Admin getAllNotes error:', error);
    return res.status(500).json({ message: 'Failed to retrieve notes' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const users = await User.findAll();
    const notes = await Note.findAll();
    return res.status(200).json({
      status: 'success',
      totalUsers: users.length,
      totalNotes: notes.length,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Admin getSystemStats error:', error);
    return res.status(500).json({ message: 'Failed to retrieve system stats' });
  }
};

module.exports = {
  getAllUsers,
  getAllNotes,
  getSystemStats
};
