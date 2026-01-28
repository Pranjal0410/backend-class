/**
 * Auth Service
 * Handles authentication business logic
 *
 * Responsibility: User registration, login validation, token generation
 * Does NOT: Handle HTTP requests/responses (that's the route's job)
 */
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

/**
 * Register a new user
 * @param {Object} userData - { email, password, name, role? }
 * @returns {Object} - { user, token }
 * @throws {Error} - If email already exists
 */
const register = async ({ email, password, name, role = 'responder' }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  // Create user (password hashing handled by model pre-save hook)
  const user = await User.create({
    email,
    passwordHash: password, // Will be hashed by pre-save hook
    name,
    role
  });

  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Authenticate user credentials
 * @param {Object} credentials - { email, password }
 * @returns {Object} - { user, token }
 * @throws {Error} - If credentials invalid
 */
const login = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Get user by ID (for token refresh, profile fetch)
 * @param {string} userId
 * @returns {Object} - User document
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

module.exports = {
  register,
  login,
  getUserById
};
