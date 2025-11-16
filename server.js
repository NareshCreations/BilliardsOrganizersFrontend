/**
 * Production Server for Billiards Organizer React App
 * Serves the built static files from the dist directory
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Enable compression for better performance
app.use(compression());

// Security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy (adjust as needed for your app)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  next();
});

// Serve static files from the dist directory
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  lastModified: true,
  immutable: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API proxy (if needed - uncomment and configure if you want to proxy API requests)
// app.use('/api', (req, res) => {
//   const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
//   // Implement your API proxy logic here
//   res.status(501).json({ message: 'API proxy not configured' });
// });

// Handle SPA routing - all routes fallback to index.html
app.get('*', (req, res, next) => {
  // Don't serve index.html for API routes, health checks, or static assets
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/health') ||
    req.path.includes('.') // Has file extension
  ) {
    return next();
  }

  // Serve index.html for all other routes (SPA routing)
  try {
    const indexPath = join(distPath, 'index.html');
    const indexHtml = readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading application');
  }
});

// Error handling middleware (must have 4 parameters)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Production server is running!
📍 Environment: ${NODE_ENV}
🌐 Server: http://localhost:${PORT}
📦 Serving files from: ${distPath}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

