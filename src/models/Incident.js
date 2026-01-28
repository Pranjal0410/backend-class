/**
 * Incident Model
 * Core entity representing a system incident
 * Kept lean - detailed history lives in IncidentUpdate
 */
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  status: {
    type: String,
    enum: ['investigating', 'identified', 'monitoring', 'resolved'],
    default: 'investigating'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commander: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for dashboard queries: active incidents by severity
incidentSchema.index({ status: 1, severity: 1 });

// Auto-set resolvedAt when status changes to resolved
incidentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);
