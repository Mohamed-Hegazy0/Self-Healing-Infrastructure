const express = require('express');
const promClient = require('prom-client');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/app.log' })
  ]
});

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const errorCounter = new promClient.Counter({
  name: 'app_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type']
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/data', (req, res) => {
  try {
    const data = {
      message: 'Data retrieved successfully',
      items: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        createdAt: new Date().toISOString()
      }))
    };
    logger.info('Data API called');
    res.json(data);
  } catch (error) {
    errorCounter.inc({ type: 'api_error' });
    logger.error('Error in /api/data', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/simulate-error', (req, res) => {
  errorCounter.inc({ type: 'simulated' });
  logger.error('Simulated error triggered');
  res.status(500).json({ error: 'Simulated error for testing' });
});

app.get('/api/slow', async (req, res) => {
  const delay = parseInt(req.query.delay) || 2000;
  await new Promise(resolve => setTimeout(resolve, delay));
  res.json({ message: `Response after ${delay}ms delay` });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  errorCounter.inc({ type: 'unhandled' });
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
