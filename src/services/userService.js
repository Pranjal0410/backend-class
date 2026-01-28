/**
 * User Service
 * Handles user-related business logic
 *
 * Responsibility: User queries, role management
 * Does NOT: Handle authentication (that's authService)
 */
const { User } = require('../models');

/**
 * Get all users (for assignment dropdowns, admin panel)
 * @param {Object} filters - Optional filters { role }
 * @returns {Array} - List of users (without sensitive data)
 */
const getUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  return User.find(query)
    .select('-passwordHash')
    .sort({ name: 1 });
};

/**
 * Get user by ID
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

/**
 * Update user role (admin only)
 * @param {string} userId
 * @param {string} newRole
 * @returns {Object} - Updated user
 */
const updateUserRole = async (userId, newRole) => {
  const user = await getUserById(userId);
  user.role = newRole;
  await user.save();
  return user;
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole
};
