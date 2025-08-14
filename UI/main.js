const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Load .env only in local dev (Render sets env vars differently)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: 'ui.env' });
}

const apiProxyTarget = process.env.API_PROXY_TARGET;
const app = express();

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Optional proxy for GraphQL API
if (apiProxyTarget) {
  app.use('/graphql', createProxyMiddleware({
    target: apiProxyTarget,
    changeOrigin: true
  }));
}

// SPA fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use Render's PORT env var
const port = process.env.PORT || process.env.UI_PORT || 3999;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});
