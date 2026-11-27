const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header (Bearer <token> or raw token)
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  // 2. Check x-access-token header
  if (!token && req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  // 3. Check cookies (e.g. Cookie: token=...)
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // If no token was found, return 403 Forbidden with exact message from PDF
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
