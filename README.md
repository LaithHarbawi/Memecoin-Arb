# MemeCoin Pro (Decoy Site)

This is a decoy site for the honeypot project that simulates a crypto arbitrage bot service.

## Features

- Marketing landing page with pricing plans
- Mock payment system
- Intentionally exposed .env file with "sensitive" credentials

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 3000 by default.

## Project Structure

- `server.js` - Express server setup and routes
- `views/` - EJS templates for pages
  - `index.ejs` - Landing page with pricing
  - `pay.ejs` - Mock payment page
- `public/` - Static assets (images)
- `.env` - Exposed configuration file (intentional for honeypot)

## Security Notice

This is part of a honeypot project. The exposed .env file and admin credentials are intentional for security research purposes. The payment system is non-functional and for demonstration only.

## Monitoring

All interactions with the exposed .env file and admin login attempts are logged for security research.
