/**
 * Authentication Configuration
 * Centralized configuration for authentication settings
 */

export const AUTH_CONFIG = {
  // API endpoints
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3005/api/v1',

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
    '/matches',
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
