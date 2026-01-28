/**
 * Auth Routes
 * Handles user registration and login
 *
 * Responsibility: Parse requests, call service, send responses
 * Does NOT: Contain business logic (that's the service's job)
 */
const express = require('express');
const router = express.Router();
const { authService } = require('../services');
const { authenticateHTTP } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Basic validation (could use Joi/Zod for production)
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    const { user, token } = await authService.register({ email, password, name, role });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { user, token } = await authService.login({ email, password });

    res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
router.get('/me', authenticateHTTP, async (req, res, next) => {
  try {
    // req.user is attached by authenticateHTTP middleware
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
