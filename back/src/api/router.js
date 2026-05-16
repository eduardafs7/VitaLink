const { notFound, parseBody, sendError } = require('./http-utils');
const { registerActionLogRoutes } = require('./routes/action-log-routes');
const { registerAppointmentRoutes } = require('./routes/appointment-routes');
const { registerExamRoutes } = require('./routes/exam-routes');
const { registerHealthRoutes } = require('./routes/health-routes');
const { registerNotificationRoutes } = require('./routes/notification-routes');
const { registerPatientRoutes } = require('./routes/patient-routes');
const { registerUserRoutes } = require('./routes/user-routes');

function createRouteRegistry() {
  const routes = [];

  function addRoute(method, pattern, handler) {
    routes.push({ method, pattern, handler });
  }

  function matchRoute(method, pathname) {
    const pathParts = pathname.split('/').filter(Boolean);

    for (const route of routes) {
      if (route.method !== method) {
        continue;
      }

      const patternParts = route.pattern.split('/').filter(Boolean);

      if (patternParts.length !== pathParts.length) {
        continue;
      }

      const params = {};
      const matches = patternParts.every((part, index) => {
        if (part.startsWith(':')) {
          params[part.slice(1)] = pathParts[index];
          return true;
        }

        return part === pathParts[index];
      });

      if (matches) {
        return { handler: route.handler, params };
      }
    }

    return null;
  }

  return {
    addRoute,
    matchRoute,
  };
}

function createRouter(store) {
  const registry = createRouteRegistry();
  registerRoutes(store, registry.addRoute);

  return async function router(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const matchedRoute = registry.matchRoute(req.method, url.pathname);

    if (!matchedRoute) {
      notFound(res, 'Rota');
      return;
    }

    try {
      const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await parseBody(req) : {};
      await matchedRoute.handler({ body, params: matchedRoute.params, query: url.searchParams }, res);
    } catch (error) {
      sendError(res, error);
    }
  };
}

function registerRoutes(store, addRoute) {
  registerHealthRoutes(addRoute);
  registerPatientRoutes(store, addRoute);
  registerUserRoutes(store, addRoute);
  registerAppointmentRoutes(store, addRoute);
  registerExamRoutes(store, addRoute);
  registerNotificationRoutes(store, addRoute);
  registerActionLogRoutes(store, addRoute);
}

module.exports = {
  createRouter,
};
