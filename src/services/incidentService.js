/**
 * Incident Service
 * Handles incident business logic
 *
 * Responsibility: CRUD operations, state transitions, update history
 * Does NOT: Handle HTTP/Socket responses, broadcast events
 *
 * Note: This service returns data. The caller (route or socket handler)
 * decides how to respond or broadcast.
 */
const { Incident, IncidentUpdate } = require('../models');

/**
 * Create a new incident
 * @param {Object} data - Incident data
 * @param {string} userId - Creator's user ID
 * @returns {Object} - Created incident
 */
const createIncident = async (data, userId) => {
  const incident = await Incident.create({
    ...data,
    createdBy: userId,
    commander: userId // Creator is default commander
  });

  // Create initial update for audit trail
  await IncidentUpdate.create({
    incidentId: incident._id,
    userId,
    type: 'status_change',
    content: {
      previousStatus: null,
      newStatus: incident.status
    }
  });

  return incident.populate(['createdBy', 'commander', 'assignees']);
};

/**
 * Get all incidents (for dashboard)
 * @param {Object} filters - Optional filters { status, severity }
 * @returns {Array} - List of incidents
 */
const getIncidents = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.severity) {
    query.severity = filters.severity;
  }

  return Incident.find(query)
    .populate(['createdBy', 'commander', 'assignees'])
    .sort({ createdAt: -1 });
};

/**
 * Get single incident by ID
 * @param {string} incidentId
 * @returns {Object} - Incident document
 */
const getIncidentById = async (incidentId) => {
  const incident = await Incident.findById(incidentId)
    .populate(['createdBy', 'commander', 'assignees']);

  if (!incident) {
    const error = new Error('Incident not found');
    error.status = 404;
    throw error;
  }

  return incident;
};

/**
 * Get incident with its update history
 * @param {string} incidentId
 * @returns {Object} - { incident, updates }
 */
const getIncidentWithHistory = async (incidentId) => {
  const incident = await getIncidentById(incidentId);

  const updates = await IncidentUpdate.find({ incidentId })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 });

  return { incident, updates };
};

/**
 * Update incident status
 * @param {string} incidentId
 * @param {string} newStatus
 * @param {string} userId - Who made the change
 * @returns {Object} - Updated incident
 */
const updateStatus = async (incidentId, newStatus, userId) => {
  const incident = await getIncidentById(incidentId);
  const previousStatus = incident.status;

  // Validate status transition (could add state machine logic here)
  if (previousStatus === newStatus) {
    const error = new Error('Status unchanged');
    error.status = 400;
    throw error;
  }

  incident.status = newStatus;
  await incident.save();

  // Record the change
  await IncidentUpdate.create({
    incidentId,
    userId,
    type: 'status_change',
    content: { previousStatus, newStatus }
  });

  return incident;
};

/**
 * Assign user to incident
 * @param {string} incidentId
 * @param {string} targetUserId - User being assigned
 * @param {string} actorUserId - Who made the assignment
 * @returns {Object} - Updated incident
 */
const assignUser = async (incidentId, targetUserId, actorUserId) => {
  const incident = await getIncidentById(incidentId);

  // Check if already assigned
  if (incident.assignees.some(a => a._id.toString() === targetUserId)) {
    const error = new Error('User already assigned');
    error.status = 400;
    throw error;
  }

  incident.assignees.push(targetUserId);
  await incident.save();
  await incident.populate('assignees');

  // Record the change
  await IncidentUpdate.create({
    incidentId,
    userId: actorUserId,
    type: 'assignment',
    content: { action: 'assigned', targetUserId }
  });

  return incident;
};

/**
 * Add a note to incident timeline
 * @param {string} incidentId
 * @param {string} text
 * @param {string} userId
 * @returns {Object} - Created update
 */
const addNote = async (incidentId, text, userId) => {
  // Verify incident exists
  await getIncidentById(incidentId);

  const update = await IncidentUpdate.create({
    incidentId,
    userId,
    type: 'note',
    content: { text }
  });

  return update.populate('userId', 'name email');
};

/**
 * Add an action item to incident timeline
 * Action items are tasks to complete during incident response
 * @param {string} incidentId
 * @param {string} text
 * @param {string} userId
 * @returns {Object} - Created update
 */
const addActionItem = async (incidentId, text, userId) => {
  // Verify incident exists
  await getIncidentById(incidentId);

  const update = await IncidentUpdate.create({
    incidentId,
    userId,
    type: 'action_item',
    content: {
      text,
      completed: false
    }
  });

  return update.populate('userId', 'name email');
};

/**
 * Toggle action item completion status
 * @param {string} updateId - The IncidentUpdate ID
 * @param {boolean} completed
 * @param {string} userId - Who toggled it (for audit, not stored)
 * @returns {Object} - Updated record
 */
const toggleActionItem = async (updateId, completed, userId) => {
  const update = await IncidentUpdate.findById(updateId);

  if (!update) {
    const error = new Error('Action item not found');
    error.status = 404;
    throw error;
  }

  if (update.type !== 'action_item') {
    const error = new Error('Not an action item');
    error.status = 400;
    throw error;
  }

  // Update the completed status
  // Note: We're mutating the content object, which is acceptable for action items
  // This is a deliberate exception to immutability for UX purposes
  update.content.completed = completed;
  await update.save();

  return update;
};

/**
 * Unassign user from incident
 * @param {string} incidentId
 * @param {string} targetUserId - User being unassigned
 * @param {string} actorUserId - Who made the change
 * @returns {Object} - Updated incident
 */
const unassignUser = async (incidentId, targetUserId, actorUserId) => {
  const incident = await getIncidentById(incidentId);

  const assigneeIndex = incident.assignees.findIndex(
    a => a._id.toString() === targetUserId
  );

  if (assigneeIndex === -1) {
    const error = new Error('User not assigned to this incident');
    error.status = 400;
    throw error;
  }

  incident.assignees.splice(assigneeIndex, 1);
  await incident.save();
  await incident.populate('assignees');

  // Record the change
  await IncidentUpdate.create({
    incidentId,
    userId: actorUserId,
    type: 'assignment',
    content: { action: 'unassigned', targetUserId }
  });

  return incident;
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  getIncidentWithHistory,
  updateStatus,
  assignUser,
  unassignUser,
  addNote,
  addActionItem,
  toggleActionItem
};
