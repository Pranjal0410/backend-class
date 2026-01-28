/**
 * IncidentUpdate Model
 * Structured audit trail for incident timeline
 * Separate from Incident to prevent document bloat
 */
const mongoose = require('mongoose');

const incidentUpdateSchema = new mongoose.Schema({
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['status_change', 'assignment', 'note', 'action_item'],
    required: true
  },
  content: {
    // status_change
    previousStatus: String,
    newStatus: String,
    // assignment
    action: {
      type: String,
      enum: ['assigned', 'unassigned']
    },
    targetUserId: mongoose.Schema.Types.ObjectId,
    // note & action_item
    text: String,
    // action_item only
    completed: Boolean
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // updates are immutable
});

// Index for timeline queries
incidentUpdateSchema.index({ incidentId: 1, createdAt: 1 });

module.exports = mongoose.model('IncidentUpdate', incidentUpdateSchema);
