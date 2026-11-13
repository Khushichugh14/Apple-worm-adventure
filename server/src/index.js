import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Ensure JWT_SECRET fallback in development/test
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'apple_worm_development_jwt_secret_key_2026';
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/db.js';
import { GAME_NAME } from './config/gameConfig.js';
import authRoutes from './routes/auth.js';
import economyRoutes from './routes/economy.js';
import playerRoutes from './routes/player.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // React app manages its own CSP
  crossOriginEmbedderPolicy: false,
}));

const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed =
      configuredOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      /^https:\/\/.*\.onrender\.com$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

// Rate limiters
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/economy', rateLimit({ windowMs: 60 * 1000, limit: 80, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/player', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }), playerRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/economy', economyRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, gameName: GAME_NAME, service: 'apple-worm-adventure-api' }));

// Serve React frontend static files in production
// Try multiple possible locations for the client build
const possibleClientDistPaths = [
  path.resolve(__dirname, '../../client/dist'),  // Local dev structure
  path.resolve(process.cwd(), 'client/dist'),    // Render build from root
  path.resolve(process.cwd(), '../client/dist'), // Alternative Render path
];

let clientDist = null;
for (const p of possibleClientDistPaths) {
  if (existsSync(p)) {
    clientDist = p;
    console.log(`[Static] Serving frontend from: ${p}`);
    break;
  }
}

if (clientDist) {
  console.log('[Static] clientDist resolved to:', clientDist);
  console.log('[Static] clientDist exists:', existsSync(clientDist));
  console.log('[Static] assets folder exists:', existsSync(path.join(clientDist, 'assets')));
  console.log('[Static] index.html exists:', existsSync(path.join(clientDist, 'index.html')));
  
  // List assets folder contents
  try {
    const assetsPath = path.join(clientDist, 'assets');
    if (existsSync(assetsPath)) {
      const files = require('fs').readdirSync(assetsPath);
      console.log('[Static] assets folder contents:', files);
    }
  } catch (e) {
    console.error('[Static] Error reading assets:', e.message);
  }

  const staticMiddleware = express.static(clientDist, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      // Ensure correct MIME types
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  });
  
  // CRITICAL: Register static middleware DIRECTLY, before any other routes
  app.use(staticMiddleware);
  
  // Debug: log static file requests
  app.use((req, res, next) => {
    if (req.path.startsWith('/assets/') || req.path.startsWith('/icons/') || req.path.startsWith('/manifest')) {
      console.log(`[Static Request] ${req.method} ${req.path}`);
    }
    next();
  });
  
  // All non-API routes → serve React index.html (SPA routing)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes that weren't matched
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    console.log('[SPA] Serving index.html for:', req.path);
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) {
        console.error('[Static] sendFile error:', err.message, 'for', req.path);
        res.status(500).send('Internal Server Error');
      }
    });
  });
} else {
  console.warn('[Static] Client dist folder not found! Checked:', possibleClientDistPaths);
  console.warn('[Static] cwd:', process.cwd());
  console.warn('[Static] __dirname:', __dirname);
  // Fallback if frontend not built
  app.get('/', (_req, res) => res.json({ status: 'online', game: GAME_NAME, health: '/api/health' }));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const port = Number(process.env.PORT || 5000);
if (process.env.NODE_ENV !== 'test') {
  connectDatabase()
    .then(() => app.listen(port, () => console.log(`${GAME_NAME} API listening on ${port}`)))
    .catch(err => {
      console.error('Server startup failed:', err.message);
      process.exit(1);
    });
}

export default app;
