import React from 'react';
import { BaseComponentComplete } from './base/BaseComponent';
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
 * Homepage state interface
 */
interface HomepageState {
  isMenuOpen: boolean;
  activeSection: string;
}

/**
 * Professional Homepage Component
 * Landing page for visitors with navigation and auth options
 */
export class Homepage extends BaseComponentComplete<HomepageProps, HomepageState> {
  /**
   * Get initial state for the homepage
   */
  protected getInitialState(): HomepageState {
    return {
      isMenuOpen: false,
      activeSection: 'home'
    };
  }

  /**
   * Handle menu toggle
   */
  private handleMenuToggle = (): void => {
    this.updateState({ isMenuOpen: !this.state.isMenuOpen });
  };

  /**
   * Handle section change
   */
  private handleSectionChange = (section: string): void => {
    this.updateState({ activeSection: section });
    this.log('Section changed', { section });
  };

  /**
   * Handle sign in click
   */
  private handleSignIn = (): void => {
    this.log('Sign in clicked');
    // Force full page reload to ensure clean navigation to login
    window.location.href = '/login';
  };

  /**
   * Handle sign up click
   */
  private handleSignUp = (): void => {
    this.log('Sign up clicked');
    // Navigate to sign up page
    window.location.href = '/signup';
  };

  /**
   * Render the homepage
   */
  render(): React.ReactNode {
    return (
      <div className={styles.homepage}>
        <HomepageHeader 
          isMenuOpen={this.state.isMenuOpen}
          onMenuToggle={this.handleMenuToggle}
          onSignIn={this.handleSignIn}
          onSignUp={this.handleSignUp}
        />
        
        <main className={styles.mainContent}>
          <HeroSection 
            onSignUp={this.handleSignUp}
            onSignIn={this.handleSignIn}
          />
          
          <FeaturesSection />
        </main>
        
        <Footer />
      </div>
    );
  }
}
