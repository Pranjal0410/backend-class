/**
 * Presence Model
 * Tracks who is currently viewing which incident
 * Uses TTL index for automatic cleanup of stale presence
 */
const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    default: null // null means user is on dashboard, not a specific incident
  },
  socketId: {
    type: String,
    required: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound index for presence queries
presenceSchema.index({ userId: 1, incidentId: 1 });

// TTL index: auto-delete presence after 5 minutes of inactivity
presenceSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('Presence', presenceSchema);
