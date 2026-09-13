import express from 'express';
import compression from 'compression';
import { createRequestHandler } from '@react-router/express';
import { fileURLToPath } from 'node:url';

const app = express();
app.disable('x-powered-by');
// Render is the single trusted proxy in front of this service.
app.set('trust proxy', 1);
app.use(compression({ threshold: 512, brotli: { enabled: true } }));
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
const client = fileURLToPath(new URL('./dist/client/', import.meta.url));
app.use(
  '/assets',
  express.static(`${client}/assets`, { immutable: true, maxAge: '1y' }),
);
app.use(
  express.static(client, { maxAge: '1h', index: false, redirect: false }),
);
app.use(
  createRequestHandler({
    build: () => import('./dist/server/index.js'),
    mode: process.env.NODE_ENV || 'production',
  }),
);
const server = app.listen(
  Number(process.env.PORT || 8788),
  process.env.HOST || '0.0.0.0',
  () => {
    console.log(`Bulk Away listening on port ${process.env.PORT || 8788}`);
  },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => {
      server.closeAllConnections();
      process.exit(1);
    }, 25000).unref();
  });
