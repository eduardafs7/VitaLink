const { FamilyUser, User, UserRole } = require('../../entities');
const { addCrudRoutes } = require('./crud-routes');

function registerUserRoutes(store, addRoute) {
  addCrudRoutes(store, addRoute, {
    collection: 'users',
    path: 'users',
    resource: 'UsuÃ¡rio',
    build: (body, id) =>
      body.role === UserRole.FAMILY
        ? new FamilyUser({ id, ...body })
        : new User({ id, ...body }),
  });
}

module.exports = {
  registerUserRoutes,
};
