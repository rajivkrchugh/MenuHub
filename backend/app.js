const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const chatRoutes = require('./routes/chat.routes');
const adsRoutes = require('./routes/ads.routes');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Security headers ────────────────────────────────
app.use(helmet());

// ─── CORS (LOCAL + PROD) ─────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://menu-hub-ashen.vercel.app',
    'https://menu-hub-*.vercel.app',
    'https://menu-hub-63j4-7w93x80kx-rajivkrchughs-projects.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// ─── Body parsing ────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Sanitize mongo queries ─────────────────────────
app.use(mongoSanitize());

// ─── Request logging ─────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// ─── Serve ad images statically ──────────────────────
app.use('/api/ads/images', express.static(path.join(__dirname, 'public', 'ads')));

// ─── Rate limiting (applied to /api routes) ──────────
app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/ads', adsRoutes);

// ─── Health check ────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;