const express = require('express');
const cors = require('cors');
const path = require('path');
const RequestLogger = require('./middleware/requestLogger.cjs');
const { getLoggingConfig } = require('./config/logging.cjs');

// Import routes
const booksRouter = require('./routes/books.cjs');
const logsRouter = require('./routes/logs.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize request logger with environment-specific config
const loggingConfig = getLoggingConfig(NODE_ENV);
const requestLogger = new RequestLogger(loggingConfig);

// Set up middleware
app.use(cors({
  origin: NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply request logging middleware
app.use(requestLogger.middleware());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/books', booksRouter);

// Set up logs router with logger instance
logsRouter.setRequestLogger(requestLogger);
app.use('/api/logs', logsRouter);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Book Management API',
    version: '1.0.0',
    description: 'A RESTful API for managing books with request logging',
    endpoints: {
      books: {
        'GET /api/books': 'Get all books or search books with ?search=query',
        'GET /api/books/:id': 'Get book by ID',
        'POST /api/books': 'Create new book',
        'PUT /api/books/:id': 'Update book by ID',
        'DELETE /api/books/:id': 'Delete book by ID'
      },
      logs: {
        'GET /api/logs': 'Get recent request logs (limit with ?limit=number)'
      },
      system: {
        'GET /health': 'Health check endpoint',
        'GET /api': 'API documentation'
      }
    },
    logging: {
      enabled: true,
      format: loggingConfig.format,
      directory: loggingConfig.logDirectory,
      fileName: loggingConfig.logFileName
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal server error' : error.message,
    ...(NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/api', '/health', '/api/books', '/api/logs']
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Book Management API running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`📝 Request logging: ${loggingConfig.format} format`);
  console.log(`📁 Log directory: ${loggingConfig.logDirectory}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;