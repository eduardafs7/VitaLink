const { sendJson } = require('../http-utils');

function registerHealthRoutes(addRoute) {
  addRoute('GET', '/health', async (_ctx, res) => {
    sendJson(res, 200, { status: 'ok' });
  });
}

module.exports = {
  registerHealthRoutes,
};
