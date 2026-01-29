/**
 * Centralized Configuration
 * All environment variables accessed through this module
 *
 * SECURITY CONSIDERATIONS:
 * ─────────────────────────
 * - JWT_SECRET must be strong in production (use openssl rand -hex 64)
 * - CLIENT_URL restricts CORS to known frontend (reduces attack surface)
 * - NODE_ENV controls error verbosity
 *
 * INTERVIEW EXPLANATION:
 * "We centralize config to avoid scattered process.env calls.
 * This makes it easier to audit, test, and mock configuration."
 */
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Validate required production environment variables
if (isProduction) {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Warn about weak JWT secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters in production');
  }
}

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/incident-platform'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  /**
   * CORS Configuration
   *
   * Why restrict origin?
   * - Reduces attack surface by only allowing known frontend
   * - Prevents unauthorized domains from making authenticated requests
   * - credentials: true enables cookies/auth headers in cross-origin requests
   *
   * Production: Set CLIENT_URL to your Vercel frontend URL
   * Development: Defaults to localhost:3000
   */
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  /**
   * Rate Limiting (values only - implementation is optional)
   * Would use express-rate-limit in production
   */
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000 // requests per window
  }
};
