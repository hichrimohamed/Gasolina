const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { verifyToken, requireAdmin } = require('./middleware/auth.middleware');
const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend origin in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body size limit (prevent large payload attacks)
app.use(express.json({ limit: '1mb' }));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Auth routes — public, rate-limited
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));

// All routes below require a valid JWT
app.use(verifyToken);

app.use('/api/upload',     requireAdmin, require('./routes/upload.routes'));
app.use('/api/dashboard',  require('./routes/dashboard.routes'));
app.use('/api/ventes',     require('./routes/ventes.routes'));
app.use('/api/achats',     require('./routes/achats.routes'));
app.use('/api/marges',     require('./routes/marges.routes'));
app.use('/api/dailystate', require('./routes/dailystate.routes'));
app.use('/api/calendar',   require('./routes/calendar.routes'));
app.use('/api/workers',    require('./routes/workers.routes'));
app.use('/api/tasks',      require('./routes/tasks.routes'));

app.use(require('./middleware/error.middleware'));

module.exports = app;
