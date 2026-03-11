require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

// Create uploads dir if missing
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files ─────────────────────────────
app.use('/uploads', express.static(uploadsDir));
app.use('/images',  express.static(path.join(__dirname, 'public', 'images')));

// ── Routes ────────────────────────────────────
app.use('/api/books', require('./routes/books'));

// ── Health check ──────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// ── Error handler ─────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n📚  API running on http://localhost:${PORT}\n`);
});