/**
 * User Routes
 * REST API for user management
 *
 * Responsibility: Parse requests, call service, send responses
 * Does NOT: Handle authentication (that's auth routes)
 */
const express = require('express');
const router = express.Router();
const { userService } = require('../services');
const { authenticateHTTP, requireRole } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateHTTP);

/**
 * GET /api/users
 * List all users (for assignment dropdowns)
 */
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await userService.getUsers({ role });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/:id/role
 * Update user role (admin only)
 */
router.patch('/:id/role', requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role required' });
    }

    const validRoles = ['admin', 'responder', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await userService.updateUserRole(req.params.id, role);

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
