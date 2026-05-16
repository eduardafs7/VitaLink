const { Notification } = require('../../entities');
const { addCrudRoutes } = require('./crud-routes');

function registerNotificationRoutes(store, addRoute) {
  addCrudRoutes(store, addRoute, {
    collection: 'notifications',
    path: 'notifications',
    resource: 'NotificaÃ§Ã£o',
    build: (body, id) => new Notification({ id, ...body }),
  });
}

module.exports = {
  registerNotificationRoutes,
};
