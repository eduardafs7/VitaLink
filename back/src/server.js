const http = require('http');
const { createRouter } = require('./api/router');
const { MemoryStore } = require('./store/memory-store');
const { seedStore } = require('./store/seed-data');

const port = Number(process.env.PORT || 3000);
const store = new MemoryStore();
seedStore(store);
const router = createRouter(store);

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});

module.exports = {
  server,
  store,
};
