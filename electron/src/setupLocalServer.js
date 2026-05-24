const http = require('http');
const WebSocket = require('ws');

const startServer = async ({onConnected, onDisconnected, onMessage}) => {
  const { getPort, portNumbers } = await import('get-port').then(module => ({ getPort: module.default, ...module }));
  const port = await getPort({ port: portNumbers(49355, 49458) });

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(200);
    res.end('WebSocket Server Active');
  });

  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat', message: 'ping' }));
      } else {
        clearInterval(interval);
        onDisconnected(ws);
      }
    }, 1000);
    onConnected(ws);

    ws.on('message', onMessage);
  });

  server.listen(port, () => {});

  return server;
}

module.exports = startServer