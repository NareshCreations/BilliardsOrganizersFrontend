/**
 * Authentication Context
 * Provides global authentication state management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { User, LoginCredentials, LoginResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('🔄 AuthContext: Initializing authentication...');
    initializeAuth();
  }, []);

  // Monitor authentication state changes
  useEffect(() => {
      // Organizers may use identifier instead of email
      const userIdentifier = user?.email || (user as any)?.identifier || user?.id || undefined;
      console.log('🔄 AuthContext: Authentication state changed:', { isAuthenticated, isLoading, user: userIdentifier });
  }, [isAuthenticated, isLoading, user]);

  // Check token expiry periodically and refresh if needed
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        if (authService.isTokenExpiringSoon()) {
          console.log('⚠️ Token expiring soon, attempting refresh...');
          try {
            const refreshed = await authService.refreshAccessToken();
            if (!refreshed) {
              console.log('❌ Token refresh failed, logging out and redirecting to login');
              handleLogout();
              // Redirect to login page
              window.location.href = '/login';
            } else {
              console.log('✅ Token refreshed successfully');
            }
          } catch (error) {
            console.log('❌ Token refresh error, logging out and redirecting to login:', error);
            handleLogout();
            // Redirect to login page
            window.location.href = '/login';
          }
        }
        if (!authService.isAuthenticated()) {
          console.log('❌ User not authenticated, logging out and redirecting to login');
          handleLogout();
          // Redirect to login page
          window.location.href = '/login';
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Initializing authentication...');
      
      if (authService.isAuthenticated()) {
        console.log('✅ User is authenticated, loading stored user data...');
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          // Organizers may use identifier instead of email
          const userIdentifier = storedUser.email || (storedUser as any)?.identifier || storedUser.id || 'user';
          console.log('✅ Stored user loaded:', userIdentifier, 'isAuthenticated:', true);
          
          // Verify token is still valid (but don't fail if verification fails - network might be down)
          try {
            const token = authService.getAccessToken();
            if (token) {
              console.log('🔍 Verifying token...');
              try {
                await authService.verifyToken(token);
                console.log('✅ Token verification successful');
              } catch (verifyError) {
                // If verification fails, don't logout - might be network issue
                // Just log it and keep the user logged in (token might still be valid)
                console.log('⚠️ Token verification failed, but keeping user logged in:', verifyError);
              }
            } else {
              console.log('❌ No token found for verification');
            }
          } catch (error) {
            // Don't logout on verification errors - network issues shouldn't prevent access
            console.log('⚠️ Token verification error, but keeping user logged in:', error);
          }
        }
      } else {
        console.log('❌ User is not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
      console.log('🔄 Auth initialization complete, isLoading:', false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      console.log('🔐 AuthContext: Starting login process...');
      const response = await authService.login(credentials);
      
      console.log('✅ AuthContext: Login API response received:', response);
      console.log('📋 AuthContext: Response structure check:', {
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        hasTokens: !!(response.data?.tokens || response.data?.accessToken),
        responseKeys: Object.keys(response)
      });

      if (!response.data) {
        throw new Error('Invalid response: missing data field');
      }

      if (!response.data.user) {
        throw new Error('Invalid response: missing user field');
      }

      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Organizers may use identifier instead of email
      const userIdentifier = response.data.user?.email || (response.data.user as any)?.identifier || response.data.user?.id || 'organizer';
      console.log('✅ AuthContext: Authentication state updated - user:', userIdentifier, 'isAuthenticated:', true);
      console.log('✅ AuthContext: User object:', response.data.user);
      
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      console.error('❌ AuthContext: Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🔄 AuthContext: Login process complete, isLoading:', false);
    }
  };

  const logout = () => {
    handleLogout();
  };

  const handleLogout = () => {
    console.log('🚪 AuthContext: Logging out user...');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('🚪 AuthContext: User logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getUserProfile();
      if (profile.success && profile.data) {
        setUser(profile.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      handleLogout();
      // If it's a token expiration error, redirect to login
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('Session expired') || errorMessage.includes('expired') || errorMessage.includes('401')) {
        window.location.href = '/login';
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
