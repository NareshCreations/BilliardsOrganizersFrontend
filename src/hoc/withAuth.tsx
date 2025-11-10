/**
 * Higher-Order Component for Authentication Protection
 * Wraps components that require authentication
 */

import React, { ComponentType, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/auth/Login';

interface WithAuthProps {
  children?: ReactNode;
}

interface WithAuthOptions {
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * HOC that wraps a component to require authentication
 */
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
): ComponentType<P & WithAuthProps> {
  const { redirectTo = '/login', fallback } = options;

  const WithAuthComponent: React.FC<P & WithAuthProps> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();

    console.log('🛡️ withAuth HOC - Auth check:', { isAuthenticated, isLoading });

    if (isLoading) {
      console.log('🛡️ withAuth HOC: Showing loading state');
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
      console.log('🛡️ withAuth HOC: User not authenticated, redirecting to login');

      // If a custom fallback is provided, use it
      if (fallback) {
        return <>{fallback}</>;
      }

      // Otherwise, redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }

      // Fallback while redirecting
      return <Login />;
    }

    console.log('🛡️ withAuth HOC: User authenticated, rendering protected component');
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAuthComponent;
}

/**
 * Hook-based authentication guard for functional components
 */
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      console.log('🛡️ useAuthGuard: Redirecting to login');
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
};

export default withAuth;
