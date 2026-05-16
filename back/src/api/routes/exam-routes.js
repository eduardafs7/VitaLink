const { ExamResult } = require('../../entities');
const { notFound, sendJson, serialize } = require('../http-utils');
const { addCrudRoutes } = require('./crud-routes');

function registerExamRoutes(store, addRoute) {
  addCrudRoutes(store, addRoute, {
    collection: 'exams',
    path: 'exams',
    resource: 'Exame',
    build: (body, id) => new ExamResult({ id, ...body }),
  });

  addRoute('PATCH', '/exams/:id/release', async ({ params, body }, res) => {
    const exam = store.find('exams', params.id);

    if (!exam) {
      notFound(res, 'Exame');
      return;
    }

    exam.release(body.userId);
    sendJson(res, 200, serialize(exam));
  });
}

module.exports = {
  registerExamRoutes,
};
