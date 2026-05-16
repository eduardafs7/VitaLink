const { ActionLog } = require('../../entities');
const { addCrudRoutes } = require('./crud-routes');

function registerActionLogRoutes(store, addRoute) {
  addCrudRoutes(store, addRoute, {
    collection: 'actionLogs',
    path: 'action-logs',
    resource: 'HistÃ³rico',
    build: (body, id) => new ActionLog({ id, ...body }),
  });
}

module.exports = {
  registerActionLogRoutes,
};
