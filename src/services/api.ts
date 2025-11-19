// API Configuration
import authService from './authService';

// Helper function to force redirect to login
const forceRedirectToLogin = (): void => {
  console.log('🔐 Force redirecting to login page...');
  authService.logout();
  // Use setTimeout to ensure redirect happens even if called from error handler
  setTimeout(() => {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.replace('/login');
    }
  }, 0);
};

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

const API_BASE_URL = getApiBaseUrl();

// Helper function to make authenticated API calls
export const makeAuthenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  // Check token expiration before making request
  const token = authService.getAccessToken();
  const expiry = localStorage.getItem('billiards_token_expiry');
  
  if (!token || !expiry) {
    console.log('❌ No token or expiry found before API request');
    forceRedirectToLogin();
    throw new Error('Session expired. Please login again.');
  }
  
  // Check if token is expired
  const expiryDate = new Date(expiry);
  const now = new Date();
  
  if (now >= expiryDate) {
    console.log('❌ Token expired before API request');
    forceRedirectToLogin();
    throw new Error('Session expired. Please login again.');
  }
  
  const authHeaders = authService.getAuthHeader();
  
  console.log('🔐 Making authenticated request to:', url);
  console.log('🔐 Auth headers:', authHeaders);
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, requestOptions);
  
  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    console.log('❌ Unauthorized request (401), token expired or invalid');
    forceRedirectToLogin();
    throw new Error('Session expired. Please login again.');
  }
  
  // Also check response body for token expiration errors (some APIs return 200 with error message)
  if (response.ok) {
    try {
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      const contentType = clonedResponse.headers.get('content-type') || '';
      
      // Only check JSON responses
      if (contentType.includes('application/json')) {
        const data = await clonedResponse.json();
        const errorMessage = data.message || data.error || '';
        const lowerMessage = errorMessage.toLowerCase();
        
        // Check if response indicates token expiration
        if (
          lowerMessage.includes('expired') ||
          lowerMessage.includes('invalid token') ||
          lowerMessage.includes('unauthorized') ||
          lowerMessage.includes('session expired') ||
          lowerMessage.includes('token expired')
        ) {
          console.log('❌ Token expiration detected in API response:', errorMessage);
          forceRedirectToLogin();
          throw new Error('Session expired. Please login again.');
        }
      }
    } catch (error) {
      // If error is already a session expired error, re-throw it
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      // Otherwise, ignore parsing errors and continue with original response
    }
  }
  
  return response;
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  identifierType?: 'email' | 'org_id' | 'phone';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    isActive: boolean;
    isPremium: boolean;
    accountType: string;
    lastLogin: string;
    profileCompletionPercentage: number;
    createdAt: string;
  };
}

export interface RegisterRequest {
  identifier: string; // email, phone, or org_id
  identifierType: 'email' | 'phone' | 'org_id';
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email?: string; // Optional, but should match identifier if identifierType is 'email'
  phone?: string; // Optional, but should match identifier if identifierType is 'phone'
  dateOfBirth?: string; // Optional
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string;
  };
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('🌐 Making API request to:', url);
      console.log('🌐 Request method:', config.method || 'GET');
      console.log('🌐 Request headers:', config.headers);
      console.log('🌐 Request body:', config.body);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API response received:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running on port 3001.');
      }
      
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    console.log('📤 API Service - Register request data:', userData);
    console.log('📤 API Service - Register request JSON:', JSON.stringify(userData));
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse> {
    const { accessToken, refreshToken } = this.getTokens();
    
    if (!accessToken) {
      throw new Error('No access token found');
    }

    return this.request('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  async forgotPassword(identifier: string, identifierType: 'email' | 'phone' = 'email'): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, identifierType }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const { accessToken } = this.getTokens();
    if (!accessToken) {
      throw new Error('No access token found');
    }

    return this.request('/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const { accessToken } = this.getTokens();
    return !!accessToken;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
