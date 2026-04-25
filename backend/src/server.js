require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Ensure required upload directories exist on startup
const uploadsDir = path.join(__dirname, '../uploads');
const metadataDir = path.join(uploadsDir, 'metadata');
const analysisDir = path.join(uploadsDir, 'analysis');
const redesignedDir = path.join(uploadsDir, 'redesigned');
[uploadsDir, metadataDir, analysisDir, redesignedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Import routes
const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');
const resultsRoutes = require('./routes/results');
const redesignRoutes = require('./routes/redesign');
const regenerationRoutes = require('./routes/regeneration');
const comparisonRoutes = require('./routes/comparison');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Temporarily disabled to resolve framing issues in local dev
  frameguard: false, // Disable X-Frame-Options: SAMEORIGIN
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/redesign', redesignRoutes);
app.use('/api/regeneration', regenerationRoutes);
app.use('/api/comparison', comparisonRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'UI Fixer Backend API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/upload',
      analyze: 'POST /api/analyze',
      results: 'GET /api/results/:id',
      regeneration: 'POST /api/regeneration',
      regenerationHistory: 'GET /api/regeneration/history/:imageId',
      applyChanges: 'POST /api/regeneration/apply-changes',
      comparison: {
        generate: 'POST /api/comparison/generate',
        save: 'POST /api/comparison/save',
        get: 'GET /api/comparison/:comparisonId',
        getByOriginal: 'GET /api/comparison/original/:originalImageId',
        getChain: 'GET /api/comparison/chain/:originalImageId',
        addFeedback: 'POST /api/comparison/:comparisonId/feedback',
        createVersion: 'POST /api/comparison/:comparisonId/version',
        stats: 'GET /api/comparison/stats'
      },
      health: 'GET /health'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
