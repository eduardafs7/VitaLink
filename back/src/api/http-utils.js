const { DomainError } = require('../entities');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}

function sendError(res, error) {
  if (error instanceof DomainError) {
    const statusCode = domainStatusCode(error.message);
    sendJson(res, statusCode, { error: error.message });
    return;
  }

  sendJson(res, 500, { error: 'Erro interno do servidor' });
}

function domainStatusCode(message) {
  if (message === 'CPF já cadastrado' || message.includes('já vinculado')) {
    return 409;
  }

  if (message.includes('Limite') || message.includes('Prazo')) {
    return 422;
  }

  return 400;
}

function notFound(res, resource = 'Recurso') {
  sendJson(res, 404, { error: `${resource} não encontrado` });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('error', reject);
    req.on('end', () => {
      const rawBody = Buffer.concat(chunks).toString('utf8');

      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(new Error('JSON inválido'));
      }
    });
  });
}

function serialize(entity) {
  return JSON.parse(JSON.stringify(entity));
}

module.exports = {
  notFound,
  parseBody,
  sendError,
  sendJson,
  sendNoContent,
  serialize,
};
