const jwt = require('jsonwebtoken');
const User = require('../models/User');
const appEvents = require('../services/eventEmitter');

const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    // Emit event for event-driven architecture
    appEvents.emit('user:registered', newUser);

    // Exact response matching Figure 1 in PDF
    return res.status(201).json({
      message: 'User registered',
      id: newUser.id || newUser._id,
      username: newUser.username,
      email: newUser.email
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id || user._id,
        email: user.email,
        username: user.username,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Emit event for event-driven architecture
    appEvents.emit('user:login', {
      userId: user.id || user._id,
      email: user.email,
      role: user.role
    });

    // Exact response matching Figure 1 in PDF
    return res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

module.exports = {
  signup,
  login
};
