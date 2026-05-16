const { notFound, sendJson, sendNoContent, serialize } = require('../http-utils');

function addCrudRoutes(store, addRoute, { collection, path, resource, build }) {
  addRoute('GET', `/${path}`, async (_ctx, res) => {
    sendJson(res, 200, store.list(collection).map(serialize));
  });

  addRoute('POST', `/${path}`, async ({ body }, res) => {
    const entity = build(body, body.id || store.nextId(path.slice(0, 3)));
    store.create(collection, entity);
    sendJson(res, 201, serialize(entity));
  });

  addRoute('GET', `/${path}/:id`, async ({ params }, res) => {
    const entity = store.find(collection, params.id);

    if (!entity) {
      notFound(res, resource);
      return;
    }

    sendJson(res, 200, serialize(entity));
  });

  addRoute('PUT', `/${path}/:id`, async ({ params, body }, res) => {
    const existing = store.find(collection, params.id);

    if (!existing) {
      notFound(res, resource);
      return;
    }

    const updated = build({ ...existing, ...body }, params.id);
    store.update(collection, params.id, () => updated);
    sendJson(res, 200, serialize(updated));
  });

  addRoute('DELETE', `/${path}/:id`, async ({ params }, res) => {
    if (!store.delete(collection, params.id)) {
      notFound(res, resource);
      return;
    }

    sendNoContent(res);
  });
}

module.exports = {
  addCrudRoutes,
};
