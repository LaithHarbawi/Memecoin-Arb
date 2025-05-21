/**
 * MemeCoin Pro - Decoy Site Server
 * Stack: Node.js, Express, EJS, Bootstrap
 * Serves marketing landing page, mock payment page, and exposes .env file
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (Bootstrap CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Home page route
app.get('/', (req, res) => {
  res.render('index', {
    dashboardUrl: process.env.DASHBOARD_URL || '#',
  });
});

// Payment page route
app.get('/pay', (req, res) => {
  const thankYou = req.query.thankyou === '1';
  res.render('pay', { thankYou });
});

// Expose .env file at /.env route (readable in browser)
app.get('/.env', (req, res) => {
  const envPath = path.join(__dirname, '.env');
  fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.type('text/plain').send(data);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MemeCoin Pro decoy site running on port ${PORT}`);
});
