/**
 * Service exports
 * Single point of import for all services
 */
module.exports = {
  authService: require('./authService'),
  incidentService: require('./incidentService'),
  userService: require('./userService'),
  presenceService: require('./presenceService')
};
