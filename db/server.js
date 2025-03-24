// filepath: /Users/mkaanmac/Desktop/ZtProjelerUzunStaj/resto-project/server.js
const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db/db.json'));
const middlewares = jsonServer.defaults();

// CORS Middleware
server.use(cors());
server.use(middlewares);
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
});