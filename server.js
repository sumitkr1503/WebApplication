// ============================================================
//  server.js — Express Backend for DevPortfolio
//  Run: node server.js   (requires Node.js >= 16)
// ============================================================

const express  = require('express');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// ---- MIDDLEWARE ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the "frontend" folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Simple request logger
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ---- HELPER: format uptime ----
function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600)  / 60);
  const s = totalSeconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

// ============================================================
//  API ROUTES
// ============================================================

// GET /api/status — basic server status
app.get('/api/status', (req, res) => {
  res.json({
    status  : 'online',
    uptime  : formatUptime(Date.now() - startTime),
    version : '1.0.0',
    message : 'Server is running smoothly 🚀',
  });
});

// GET /api/health — health-check endpoint (used by load balancers / Docker)
app.get('/api/health', (req, res) => {
  const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  res.json({
    healthy      : true,
    memory_mb    : parseFloat(memMB),
    node_version : process.version,
    platform     : process.platform,
    pid          : process.pid,
  });
});

// GET /api/info — general server info
app.get('/api/info', (req, res) => {
  res.json({
    app         : 'DevPortfolio Backend',
    description : 'Simple Express server for DevOps practice',
    author      : 'Your Name',
    repository  : 'https://github.com/yourhandle/devportfolio',
    endpoints   : [
      'GET  /api/status',
      'GET  /api/health',
      'GET  /api/info',
      'POST /api/contact',
    ],
  });
});

// POST /api/contact — contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success : false,
      message : 'All fields are required.',
    });
  }

  // Log the submission (in production you'd send an email / save to DB)
  const submission = { name, email, message, timestamp: new Date().toISOString() };
  console.log('[Contact Form]', JSON.stringify(submission, null, 2));

  // Append to a local JSON log file
  const logFile = path.join(__dirname, 'contacts.json');
  let contacts = [];
  if (fs.existsSync(logFile)) {
    try { contacts = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch (_) {}
  }
  contacts.push(submission);
  fs.writeFileSync(logFile, JSON.stringify(contacts, null, 2));

  res.json({
    success : true,
    message : 'Message received! I will get back to you soon.',
  });
});

// ---- 404 fallback — serve index.html for any unknown route ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────┐');
  console.log(`  │  DevPortfolio server                 │`);
  console.log(`  │  http://localhost:${PORT}               │`);
  console.log('  └─────────────────────────────────────┘');
  console.log('');
});
