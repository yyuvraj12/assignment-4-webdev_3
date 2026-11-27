const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllNotes,
  getSystemStats
} = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

// RBAC: All admin routes require valid JWT and 'admin' role
router.use(verifyToken, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/notes', getAllNotes);
router.get('/stats', getSystemStats);

module.exports = router;
