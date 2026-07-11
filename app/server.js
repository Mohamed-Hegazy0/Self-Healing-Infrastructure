const express = require('express');
const promClient = require('prom-client');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// السحر هنا: عطلنا الـ CSP مؤقتاً عشان الزرار (Inline Script) يشتغل
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const errorCounter = new promClient.Counter({
  name: 'app_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type']
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Self-Healing Infrastructure</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .dashboard { background-color: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); text-align: center; max-width: 600px; width: 100%; }
            h1 { color: #38bdf8; margin-bottom: 10px; }
            p { color: #94a3b8; line-height: 1.6; }
            .status-box { margin: 30px 0; padding: 20px; border-radius: 8px; background-color: #0f172a; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
            .status-indicator { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #22c55e; }
            .dot { height: 15px; width: 15px; background-color: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
            .btn-crash { background-color: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.3s; width: 100%; margin-top: 10px; }
            .btn-crash:hover { background-color: #dc2626; }
            .links { margin-top: 30px; display: flex; justify-content: center; gap: 20px; }
            .links a { color: #38bdf8; text-decoration: none; font-size: 14px; border-bottom: 1px dashed #38bdf8; }
        </style>
    </head>
    <body>
        <div class="dashboard">
            <h1>VSCAN Secure Infrastructure</h1>
            <p>Welcome to the automated self-healing application environment.</p>
            <div class="status-box">
                <span>System Status:</span>
                <div class="status-indicator"><span class="dot" id="statusDot"></span><span id="statusText">System Healthy</span></div>
            </div>
            <button class="btn-crash" onclick="simulateCrash()">⚠️ Simulate Critical Error</button>
            <div class="links">
                <a href="/metrics" target="_blank">View Metrics</a>
                <a href="/health" target="_blank">Health Check</a>
            </div>
        </div>
        <script>
            function simulateCrash() {
                document.getElementById('statusDot').style.backgroundColor = '#ef4444';
                document.getElementById('statusDot').style.boxShadow = '0 0 10px #ef4444';
                document.getElementById('statusText').style.color = '#ef4444';
                document.getElementById('statusText').innerText = 'System Failing...';
                fetch('/api/simulate-error').catch(error => console.error('Error:', error));
            }
        </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/simulate-error', (req, res) => {
  errorCounter.inc({ type: 'simulated' });
  logger.error('CRITICAL: Simulated crash triggered!');
  res.status(500).json({ error: 'System is crashing now...' });
  
  setTimeout(() => {
    console.log("Crashing the system for Self-Healing demo...");
    process.exit(1); 
  }, 1000);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
