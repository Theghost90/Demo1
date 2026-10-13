// Minimal static file server for previewing dist/.  PORT (default 3111), HOST (default 0.0.0.0).
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 3111;
const host = process.env.HOST || '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
};

async function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return { status: 400 };
  }
  if (decoded.includes('\0')) return { status: 400 };

  const file = normalize(join(root, decoded));
  if (file !== root && !file.startsWith(root + sep)) return { status: 403 };

  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      if (!urlPath.endsWith('/')) return { status: 301, location: `${urlPath}/` };
      return resolveFile(`${urlPath}index.html`);
    }
    return { status: 200, file, size: info.size };
  } catch {
    return { status: 404 };
  }
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  const url = new URL(req.url, 'http://localhost');
  const found = await resolveFile(url.pathname);

  if (found.status === 301) {
    return send(res, 301, '', { Location: found.location + url.search });
  }
  if (found.status === 404) {
    const page = await readFile(join(root, '404.html')).catch(() => 'Not found');
    return send(res, 404, req.method === 'HEAD' ? '' : page, { 'Content-Type': TYPES['.html'] });
  }
  if (found.status !== 200) return send(res, found.status, 'Bad request');

  const ext = extname(found.file).toLowerCase();
  const immutable = url.pathname.startsWith('/assets/');
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    Vary: 'Accept-Encoding',
  };

  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (gzip) headers['Content-Encoding'] = 'gzip';
  else headers['Content-Length'] = found.size;

  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();

  const stream = createReadStream(found.file);
  stream.on('error', () => res.destroy());
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Portfolio preview: http://localhost:${port}  (EN)  |  http://localhost:${port}/fr/  (FR)`);
});
