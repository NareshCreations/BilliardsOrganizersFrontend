/**
 * Authentication Configuration
 * Centralized configuration for authentication settings
 */

// Determine API base URL
// Use relative path to leverage proxy (Vite in dev, server.js in production)
// Only use full URL if explicitly set via environment variable
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  // Use relative path - will be proxied by Vite (dev) or server.js (production)
  return '/api/v1';
};

export const AUTH_CONFIG = {
  // API endpoints
  API_BASE_URL: getApiBaseUrl(),

  // Token storage keys
  TOKEN_KEY: 'billiards_auth_token',
  REFRESH_TOKEN_KEY: 'billiards_refresh_token',
  USER_KEY: 'billiards_user',
  TOKEN_EXPIRY_KEY: 'billiards_token_expiry',

  // Token refresh settings
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  TOKEN_CHECK_INTERVAL: 60 * 1000, // Check every minute

  // Login identifier types
  IDENTIFIER_TYPES: {
    ORG_ID: 'org_id',
    EMAIL: 'email',
    PHONE: 'phone',
  } as const,

  // User types
  USER_TYPES: {
    CUSTOMER: 'customer',
    ORGANIZER: 'organizer',
  } as const,

  // Routes that require authentication
    PROTECTED_ROUTES: [
      '/dashboard',
      '/tournaments',
      '/profile',
    '/game-organization',
    '/tournament-running',
  ],

  // Routes that are public
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/signup',
  ],
};

export type IdentifierType = typeof AUTH_CONFIG.IDENTIFIER_TYPES[keyof typeof AUTH_CONFIG.IDENTIFIER_TYPES];
export type UserType = typeof AUTH_CONFIG.USER_TYPES[keyof typeof AUTH_CONFIG.USER_TYPES];
