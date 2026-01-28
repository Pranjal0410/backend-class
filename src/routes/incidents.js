/**
 * Incident Routes
 * REST API for incident management
 *
 * Responsibility: Parse requests, call service, send responses
 * Does NOT: Contain business logic or broadcast socket events
 *
 * Note: Real-time updates are handled separately via Socket.io
 * These routes are for initial data fetching and mutations
 */
const express = require('express');
const router = express.Router();
const { incidentService, presenceService } = require('../services');
const { authenticateHTTP, requireRole } = require('../middleware/auth');

// All incident routes require authentication
router.use(authenticateHTTP);

/**
 * GET /api/incidents
 * List all incidents (dashboard view)
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const incidents = await incidentService.getIncidents({ status, severity });
    res.json({ incidents });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/incidents
 * Create a new incident (admin, responder only)
 */
router.post('/', requireRole('admin', 'responder'), async (req, res, next) => {
  try {
    const { title, description, severity } = req.body;

    if (!title || !severity) {
      return res.status(400).json({ error: 'Title and severity required' });
    }

    const incident = await incidentService.createIncident(
      { title, description, severity },
      req.user._id
    );

    res.status(201).json({ incident });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/incidents/:id
 * Get incident details with update history
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { incident, updates } = await incidentService.getIncidentWithHistory(req.params.id);

    // Also fetch current presence for this incident
    const presence = await presenceService.getIncidentPresence(req.params.id);

    res.json({ incident, updates, presence });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/incidents/:id/status
 * Update incident status (admin, responder only)
 *
 * Note: This is a REST endpoint for direct updates.
 * Real-time broadcasts happen in the socket layer when needed.
 */
router.patch('/:id/status', requireRole('admin', 'responder'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const incident = await incidentService.updateStatus(
      req.params.id,
      status,
      req.user._id
    );

    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/incidents/:id/assignees
 * Assign user to incident (admin, responder only)
 */
router.post('/:id/assignees', requireRole('admin', 'responder'), async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const incident = await incidentService.assignUser(
      req.params.id,
      userId,
      req.user._id
    );

    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/incidents/:id/notes
 * Add note to incident timeline (admin, responder only)
 */
router.post('/:id/notes', requireRole('admin', 'responder'), async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Note text required' });
    }

    const update = await incidentService.addNote(
      req.params.id,
      text,
      req.user._id
    );

    res.status(201).json({ update });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
