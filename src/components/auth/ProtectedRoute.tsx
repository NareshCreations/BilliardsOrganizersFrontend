/**
 * Protected Route Component
 * Wraps components that require authentication
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🛡️ ProtectedRoute render:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('🛡️ ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ ProtectedRoute: User not authenticated, redirecting to login');
    // Store the intended URL for redirect after login
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/login') {
      localStorage.setItem('redirectAfterLogin', currentPath);
      console.log('🛡️ ProtectedRoute: Stored redirect URL:', currentPath);
    }
    // Force immediate redirect to login using replace (prevents back button navigation)
    setTimeout(() => {
      window.location.replace('/login');
    }, 0);
    return null;
  }

  console.log('🛡️ ProtectedRoute: User authenticated, showing protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
