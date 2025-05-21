/**
 * MemeCoin Pro - Combined Application Server
 * Stack: Node.js, Express, EJS, Bootstrap
 * Combines marketing landing page, admin dashboard, and honeypot functionality
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const useragent = require('express-useragent');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(useragent.express());

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (Bootstrap CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory session simulation (not secure, just for honeypot)
let loggedIn = false;
let refreshSuccess = false;

// Log file path
const logFilePath = path.join(__dirname, 'interactions.log');

// Helper to log interactions
function logInteraction(ip, action, userAgent) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | IP: ${ip} | Action: ${action} | User-Agent: ${userAgent}\n`;
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) console.error('Error logging interaction:', err);
  });
}

// Generate random amount with decimals
function getRandomAmount(min, max) {
  return (Math.random() * (max - min) + min).toFixed(4);
}

// Generate recent activity with random amounts
function generateRecentActivity() {
  const activities = [
    { desc: 'Arbitrage Executed', pair: 'BTC/ETH', exchange: 'Binance → Kraken' },
    { desc: 'Arbitrage Executed', pair: 'ETH/USDT', exchange: 'Coinbase → Bitfinex' },
    { desc: 'Arbitrage Executed', pair: 'BTC/USDT', exchange: 'Binance → Coinbase' },
    { desc: 'Arbitrage Executed', pair: 'ETH/BTC', exchange: 'Kraken → Binance' },
  ];
  return activities.map(activity => ({
    ...activity,
    amount: getRandomAmount(0.1, 0.6),
    asset: activity.pair.split('/')[0],
  }));
}

// Home page route (MemeCoin Pro landing page)
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

// Helper to serve .env file with logging
function serveEnvFile(req, res, asDownload = false) {
  const envPath = path.join(__dirname, '.env');
  const ip = req.ip;
  const ua = req.headers['user-agent'] || '';
  const method = req.method;
  const pathAccessed = req.originalUrl;
  console.log(`[ENV ACCESS] ${method} ${pathAccessed} from ${ip} UA: ${ua}`);
  fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    if (asDownload) {
      res.setHeader('Content-Disposition', 'attachment; filename=".env"');
    }
    res.type('text/plain').send(data);
  });
}

// Expose .env file at multiple routes
app.get('/.env', (req, res) => {
  // Allow if user-agent is a known scraper or any browser
  const ua = req.headers['user-agent'] || '';
  if (/curl|python|nmap|sqlmap|wpscan|nikto|requests|httpie|wget|mozilla|chrome|firefox|safari/i.test(ua)) {
    serveEnvFile(req, res);
  } else {
    serveEnvFile(req, res); // Still serve for all, but log
  }
});

app.get('/environment', (req, res) => {
  serveEnvFile(req, res);
});

app.get('/.env.txt', (req, res) => {
  serveEnvFile(req, res);
});

app.get('/.env-download', (req, res) => {
  serveEnvFile(req, res, true);
});

app.post('/getenv', (req, res) => {
  serveEnvFile(req, res);
});

// Admin Dashboard Routes
// Login page
app.get('/admin', (req, res) => {
  if (loggedIn) {
    const ip = req.ip;
    const userAgent = req.useragent.source;
    logInteraction(ip, 'view_dashboard', userAgent);

    function getRandomCryptoAmount(min, max) {
      const amount = (Math.random() * (max - min) + min);
      const decimals = Math.floor(Math.random() * 4) + 3;
      return parseFloat(amount.toFixed(decimals));
    }

    const portfolio = {
      BTC: getRandomCryptoAmount(1000, 2000),
      ETH: getRandomCryptoAmount(30000, 40000),
      USDT: getRandomCryptoAmount(100000, 600000),
    };

    const recentActivity = generateRecentActivity();

    res.render('admin', {
      portfolio,
      recentActivity,
      refreshSuccess,
      supportEmail: process.env.ADMIN_EMAIL || 'support@MemeCoinPro.com',
    });
    
    refreshSuccess = false;
  } else {
    res.render('login', { error: null });
  }
});

// Handle login POST
app.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.useragent.source;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASS
  ) {
    loggedIn = true;
    logInteraction(ip, 'login_success', userAgent);
    res.redirect('/admin');
  } else {
    logInteraction(ip, 'login_failed', userAgent);
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Handle refresh button click
app.post('/admin/refresh', (req, res) => {
  refreshSuccess = true;
  res.redirect('/admin');
});

// Withdraw page
app.get('/admin/withdraw', (req, res) => {
  if (!loggedIn) {
    return res.redirect('/admin');
  }

  const ip = req.ip;
  const userAgent = req.useragent.source;
  logInteraction(ip, 'view_withdraw', userAgent);

  function getRandomCryptoAmount(min, max) {
    const amount = (Math.random() * (max - min) + min);
    const decimals = Math.floor(Math.random() * 4) + 3;
    return parseFloat(amount.toFixed(decimals));
  }

  const portfolio = {
    BTC: getRandomCryptoAmount(1000, 2000),
    ETH: getRandomCryptoAmount(10000, 40000),
    USDT: getRandomCryptoAmount(100000, 600000),
  };

  res.render('withdraw', { portfolio });
});

// Deposit fee submission page
app.post('/admin/pay', (req, res) => {
  const ip = req.ip;
  const userAgent = req.useragent.source;
  logInteraction(ip, 'fee_attempt', userAgent);

  const excuses = [
    'Network congestion detected, please send an additional 0.1 ETH.',
    'Price volatility requires an extra 0.05 ETH processing fee.',
    'Smart contract upgrade fee pending, please send 0.07 ETH more.',
    'Gas fees have increased, additional 0.08 ETH required.',
    'Security verification in progress, send 0.06 ETH to continue.',
  ];

  const excuse = excuses[Math.floor(Math.random() * excuses.length)];
  res.render('pay', { excuse });
});

// Logout route
app.get('/admin/logout', (req, res) => {
  loggedIn = false;
  res.redirect('/admin');
});

// Start server
app.listen(PORT, () => {
  console.log(`MemeCoin Pro combined application running on port ${PORT}`);
});
