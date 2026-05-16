const { Appointment } = require('../../entities');
const { notFound, sendJson, serialize } = require('../http-utils');
const { addCrudRoutes } = require('./crud-routes');

function registerAppointmentRoutes(store, addRoute) {
  addCrudRoutes(store, addRoute, {
    collection: 'appointments',
    path: 'appointments',
    resource: 'Consulta',
    build: (body, id) => new Appointment({ id, ...body }),
  });

  addRoute('PATCH', '/appointments/:id/confirm', async ({ params, body }, res) => {
    const appointment = store.find('appointments', params.id);

    if (!appointment) {
      notFound(res, 'Consulta');
      return;
    }

    appointment.confirm(body.userId);
    sendJson(res, 200, serialize(appointment));
  });

  addRoute('PATCH', '/appointments/:id/cancel', async ({ params, body }, res) => {
    const appointment = store.find('appointments', params.id);

    if (!appointment) {
      notFound(res, 'Consulta');
      return;
    }

    appointment.cancel(body.userId, body.now ? new Date(body.now) : new Date());
    sendJson(res, 200, serialize(appointment));
  });
}

module.exports = {
  registerAppointmentRoutes,
};
