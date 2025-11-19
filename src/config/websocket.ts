/**
 * WebSocket Configuration
 * Handles WebSocket URL configuration based on environment variables
 */

/**
 * Get WebSocket URL from environment variables
 * Falls back to API base URL if VITE_WS_URL is not set
 */
export const getWebSocketUrl = (): string => {
  // Try to get WebSocket URL from environment variable
  const wsUrl = (import.meta as any).env?.VITE_WS_URL;
  
  if (wsUrl) {
    return wsUrl;
  }
  
  // Fallback: Derive from API base URL
  const apiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  
  if (apiUrl) {
    // Convert http:// to ws:// and https:// to wss://
    if (apiUrl.startsWith('https://')) {
      return apiUrl.replace('https://', 'wss://');
    } else if (apiUrl.startsWith('http://')) {
      return apiUrl.replace('http://', 'ws://');
    }
    return apiUrl;
  }
  
  // Final fallback for development
  console.warn('⚠️ VITE_WS_URL and VITE_API_BASE_URL not set, using default localhost:3005');
  return 'http://localhost:3005';
};

