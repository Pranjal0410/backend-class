/**
 * Presence Service
 * Handles real-time presence tracking
 *
 * Responsibility: Track who is viewing which incident
 * Does NOT: Broadcast updates (socket layer does that)
 *
 * Design Decision: We store presence in MongoDB with TTL
 * - Survives server restarts
 * - Auto-cleans stale presence via TTL index
 * - Acceptable latency for <1000 users (would use Redis at scale)
 */
const { Presence } = require('../models');

/**
 * Record user joining an incident room
 * @param {string} userId
 * @param {string} incidentId
 * @param {string} socketId
 * @returns {Object} - Created presence record
 */
const joinIncident = async (userId, incidentId, socketId) => {
  // Remove any existing presence for this user/incident combo
  await Presence.deleteMany({ userId, incidentId });

  const presence = await Presence.create({
    userId,
    incidentId,
    socketId,
    lastActiveAt: new Date()
  });

  return presence;
};

/**
 * Record user leaving an incident room
 * @param {string} userId
 * @param {string} incidentId
 */
const leaveIncident = async (userId, incidentId) => {
  await Presence.deleteMany({ userId, incidentId });
};

/**
 * Remove all presence records for a socket (on disconnect)
 * @param {string} socketId
 * @returns {Array} - Incident IDs the user was viewing
 */
const removeBySocketId = async (socketId) => {
  // Find which incidents this socket was viewing (for broadcast)
  const presences = await Presence.find({ socketId });
  const incidentIds = presences.map(p => p.incidentId).filter(Boolean);

  await Presence.deleteMany({ socketId });

  return incidentIds;
};

/**
 * Get all users currently viewing an incident
 * @param {string} incidentId
 * @returns {Array} - List of users with their presence info
 */
const getIncidentPresence = async (incidentId) => {
  return Presence.find({ incidentId })
    .populate('userId', 'name email')
    .sort({ lastActiveAt: -1 });
};

/**
 * Update last active timestamp (heartbeat)
 * @param {string} socketId
 */
const updateActivity = async (socketId) => {
  await Presence.updateOne(
    { socketId },
    { lastActiveAt: new Date() }
  );
};

/**
 * Get user's current location (which incident they're viewing)
 * @param {string} userId
 * @returns {Object|null} - Presence record or null
 */
const getUserPresence = async (userId) => {
  return Presence.findOne({ userId })
    .sort({ lastActiveAt: -1 });
};

module.exports = {
  joinIncident,
  leaveIncident,
  removeBySocketId,
  getIncidentPresence,
  updateActivity,
  getUserPresence
};
