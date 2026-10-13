// Local preview only: serves index.html and runs api/*.js like Vercel would.
// Usage: node --env-file=.env dev-server.js
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = 3000;
const ROUTES = new Set(['state', 'join', 'submit', 'host']);

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const name = url.pathname.match(/^\/api\/(\w+)$/)?.[1];

  if (!name) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(await readFile('index.html'));
  }
  if (!ROUTES.has(name)) {
    res.statusCode = 404;
    return res.end('Not found');
  }

  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = undefined; }
  req.query = Object.fromEntries(url.searchParams);
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };

  const { default: handler } = await import(`./api/${name}.js`);
  await handler(req, res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
