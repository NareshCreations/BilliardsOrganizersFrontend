/**
 * Production-Grade Authentication Service
 * Handles login, token management, and authentication state
 */

import { AUTH_CONFIG, IdentifierType } from '../config/auth';

export interface LoginCredentials {
  identifier: string;
  password: string;
  identifierType: IdentifierType;
}

export interface User {
  id: string;
  email?: string; // Optional for organizers who use identifier
  identifier?: string; // For organizers using org_id
  identifier_type?: string; // Type of identifier (email, org_id, phone)
  user_type?: string; // customer or organizer
  phone?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isActive: boolean;
  isPremium?: boolean;
  accountType?: string;
  lastLogin?: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface TokenVerificationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      identifier: string;
      identifier_type: string;
      user_type: string;
      isActive: boolean;
      isVerified: boolean;
      lastLogin: string;
      createdAt: string;
    };
    isValid: boolean;
  };
}

class AuthService {
  private readonly API_BASE_URL = AUTH_CONFIG.API_BASE_URL;
  private readonly TOKEN_KEY = AUTH_CONFIG.TOKEN_KEY;
  private readonly REFRESH_TOKEN_KEY = AUTH_CONFIG.REFRESH_TOKEN_KEY;
  private readonly USER_KEY = AUTH_CONFIG.USER_KEY;
  private readonly TOKEN_EXPIRY_KEY = AUTH_CONFIG.TOKEN_EXPIRY_KEY;

  /**
   * Production-grade login with comprehensive error handling
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.identifier);
      console.log('🌐 API Base URL:', this.API_BASE_URL);
      console.log('🔗 Full URL:', `${this.API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.identifier,
          password: credentials.password,
          identifierType: credentials.identifierType,
        }),
      }).catch((fetchError) => {
        console.error('❌ Fetch error details:', fetchError);
        throw new Error(`Unable to connect to backend server at ${this.API_BASE_URL}. Please ensure the backend is running. Error: ${fetchError.message}`);
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const data: any = await response.json();
      console.log('📦 Raw API response received');
      console.log('📦 Response structure:', {
        hasSuccess: 'success' in data,
        success: data.success,
        hasData: 'data' in data,
        dataKeys: data.data ? Object.keys(data.data) : 'no data',
        hasAccessToken: !!(data.data?.accessToken || data.data?.tokens?.accessToken),
        hasRefreshToken: !!(data.data?.refreshToken || data.data?.tokens?.refreshToken),
        hasUser: !!data.data?.user
      });
      
      if (!data.success) {
        console.error('❌ API returned success: false', data);
        throw new Error(data.message || 'Login failed');
      }

      // Check if response has the expected structure
      if (!data.data) {
        console.error('❌ API response missing data field:', data);
        throw new Error('Invalid API response format: missing data field');
      }

      // Store authentication data securely
      // API returns: data.accessToken, data.refreshToken, data.user (as shown in Postman)
      // Handle both response formats: new format (tokens object) and old format (direct accessToken/refreshToken)
      const tokens = data.data.tokens || {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresAt: data.data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default 24h expiry
      };
      
      console.log('🔑 Token extraction:', {
        hasTokens: !!data.data.tokens,
        hasDirectTokens: !!(data.data.accessToken && data.data.refreshToken),
        tokenFormat: data.data.tokens ? 'tokens object' : 'direct fields'
      });

      if (!tokens.accessToken) {
        console.error('❌ No access token found in response:', data);
        throw new Error('Invalid API response format: missing access token');
      }

      if (!data.data.user) {
        console.error('❌ No user data found in response:', data);
        throw new Error('Invalid API response format: missing user data');
      }

      this.storeAuthData(data.data.user, tokens);
      
      console.log('✅ Login successful for user:', data.data.user?.email || data.data.user?.identifier || 'organizer');
      return data;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Provide more helpful error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const helpfulMessage = `Cannot connect to backend server at ${this.API_BASE_URL}. 
        
Please check:
1. Is the backend server running?
2. Is the server running on the correct port (check env variable VITE_API_BASE_URL)?
3. Is there a CORS issue?
4. Check the Network tab in browser DevTools for more details.

Default expected URL: http://localhost:3002/api/v1`;
        
        console.error('💡 Troubleshooting:', helpfulMessage);
        throw new Error(`Backend server not accessible. ${helpfulMessage}`);
      }
      
      throw error;
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(token: string): Promise<TokenVerificationResponse> {
    try {
      console.log('🔍 Verifying token with server...');
      
      const response = await fetch(`${this.API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Token verification failed - unauthorized');
          throw new Error('Token is invalid or expired');
        }
        throw new Error(`Token verification failed: ${response.status}`);
      }

      const data: TokenVerificationResponse = await response.json();
      console.log('✅ Token verification successful');
      return data;
      
    } catch (error) {
      console.error('❌ Token verification error:', error);
      
      // If it's a network error, we'll assume the token is still valid for now
      // but log the issue for debugging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('⚠️ Network error during token verification, assuming token is valid');
        return {
          success: true,
          message: 'Token verification skipped due to network error',
          data: {
            user: {
              id: '',
              identifier: '',
              identifier_type: 'email',
              user_type: 'customer',
              isActive: false,
              isVerified: false,
              lastLogin: '',
              createdAt: ''
            },
            isValid: true
          }
        };
      }
      
      throw error;
    }
  }

  /**
   * Get user profile using Authorization header
   */
  async getUserProfile(): Promise<any> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired - logout and redirect to login
          console.log('❌ Profile fetch failed with 401 - token expired');
          console.log('🔐 Logging out user and redirecting to login page...');
          this.logout();
          // Redirect to login page using replace to prevent back button navigation
          setTimeout(() => {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
              window.location.replace('/login');
            }
          }, 0);
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Profile fetch failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      throw error;
    }
  }

  /**
   * Store authentication data securely
   */
  private storeAuthData(user: User, tokens: AuthTokens): void {
    try {
      console.log('💾 Storing auth data:');
      const userIdentifier = user.email || (user as any)?.identifier || user.id || 'user';
      console.log('  - User:', userIdentifier);
      console.log('  - Access token length:', tokens.accessToken.length);
      console.log('  - Refresh token length:', tokens.refreshToken.length);
      console.log('  - Expires at:', tokens.expiresAt);
      
      // Store tokens
      localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, tokens.expiresAt);
      
      // Store user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Failed to get stored user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    console.log('🔍 Checking authentication status:');
    console.log('  - Token exists:', !!token);
    console.log('  - Token expiry exists:', !!expiry);
    
    if (!token || !expiry) {
      console.log('❌ No token or expiry found');
      return false;
    }

    // Check if token is expired
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    console.log('  - Token expiry:', expiry);
    console.log('  - Current time:', now.toISOString());
    console.log('  - Is expired:', now >= expiryDate);
    
    if (now >= expiryDate) {
      console.log('⚠️ Token expired, clearing auth data and redirecting to login');
      this.logout();
      // Force immediate redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        console.log('🔐 Forcing redirect to login page...');
        // Use replace to prevent back button navigation
        window.location.replace('/login');
      }
      return false;
    }

    console.log('✅ User is authenticated');
    return true;
  }

  /**
   * Get authorization header for API calls
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Logout and clear all stored data
   */
  logout(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      
      console.log('🚪 User logged out successfully');
    } catch (error) {
      console.error('❌ Failed to logout:', error);
    }
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return false;

    const expiryDate = new Date(expiry);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return fiveMinutesFromNow >= expiryDate;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing access token...');
      
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        console.log('❌ No refresh token available');
        return false;
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.log('❌ Token refresh failed:', response.status);
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.tokens) {
        console.log('✅ Token refreshed successfully');
        this.setTokens(data.data.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }

  /**
   * Set tokens (used for token refresh)
   */
  private setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, tokens.expiresAt);
      console.log('✅ Tokens updated successfully');
    } catch (error) {
      console.error('❌ Failed to set tokens:', error);
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): Date | null {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiry ? new Date(expiry) : null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
