import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HomepageHeader } from './organisms/HomepageHeader/HomepageHeader';
import { HeroSection } from './organisms/HeroSection/HeroSection';
import { FeaturesSection } from './organisms/FeaturesSection/FeaturesSection';
import { Footer } from './organisms/Footer/Footer';
import styles from './Homepage.module.scss';

/**
 * Homepage props interface
 */
export interface HomepageProps {
  // Add any specific props if needed
}

/**
 * Professional Homepage Component
 * Landing page for visitors with navigation and auth options
 */
const Homepage: React.FC<HomepageProps> = (props) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      console.log('🏠 Homepage: User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  /**
   * Handle menu toggle
   */
  const handleMenuToggle = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Handle section change
   */
  const handleSectionChange = (section: string): void => {
    setActiveSection(section);
    console.log('Section changed', { section });
  };

  /**
   * Handle sign in click
   */
  const handleSignIn = (): void => {
    console.log('Sign in clicked');
    // Force full page reload to ensure clean navigation to login
    window.location.href = '/login';
  };

  /**
   * Handle sign up click
   */
  const handleSignUp = (): void => {
    console.log('Sign up clicked');
    // Navigate to sign up page
    window.location.href = '/signup';
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render homepage for authenticated users (they get redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.homepage}>
      <HomepageHeader
        isMenuOpen={isMenuOpen}
        onMenuToggle={handleMenuToggle}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />

      <main className={styles.mainContent}>
        <HeroSection
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
        />

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
};

export { Homepage };
