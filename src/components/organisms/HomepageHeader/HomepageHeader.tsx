import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import styles from './HomepageHeader.module.scss';

/**
 * Homepage header props interface
 */
export interface HomepageHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

/**
 * Homepage header state interface
 */
interface HomepageHeaderState {
  isScrolled: boolean;
}

/**
 * Professional Homepage Header Component
 * Navigation header for visitors with auth buttons
 */
export class HomepageHeader extends BaseComponentComplete<HomepageHeaderProps, HomepageHeaderState> {
  /**
   * Get initial state for the header
   */
  protected getInitialState(): HomepageHeaderState {
    return {
      isScrolled: false
    };
  }

  /**
   * Handle scroll event
   */
  private handleScroll = (): void => {
    const isScrolled = window.scrollY > 50;
    if (isScrolled !== this.state.isScrolled) {
      this.updateState({ isScrolled });
    }
  };

  /**
   * Component mount lifecycle
   */
  protected onComponentMount(): void {
    window.addEventListener('scroll', this.handleScroll);
  }

  /**
   * Component unmount lifecycle
   */
  protected onComponentUnmount(): void {
    window.removeEventListener('scroll', this.handleScroll);
  }

  /**
   * Render logo
   */
  private renderLogo(): React.ReactNode {
    return (
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          <h1 className={styles.logoTitle}>Billiards Organizer</h1>
          <span className={styles.logoSubtitle}>Professional Tournament Management</span>
        </div>
      </div>
    );
  }

  /**
   * Render navigation menu
   */
  private renderNavigation(): React.ReactNode {
    const menuItems = [
      { id: 'home', label: 'Home', href: '#home' },
      { id: 'features', label: 'Features', href: '#features' },
      { id: 'about', label: 'About', href: '#about' },
      { id: 'contact', label: 'Contact', href: '#contact' }
    ];

    return (
      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.navItem}>
              <a 
                href={item.href}
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  this.log('Navigation clicked', { item: item.id });
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  /**
   * Render auth buttons
   */
  private renderAuthButtons(): React.ReactNode {
    return (
      <div className={styles.authButtons}>
        <button 
          className={styles.signInButton}
          onClick={this.props.onSignIn}
        >
          Sign In
        </button>
        <button 
          className={styles.signUpButton}
          onClick={this.props.onSignUp}
        >
          Sign Up
        </button>
      </div>
    );
  }

  /**
   * Render mobile menu button
   */
  private renderMobileMenuButton(): React.ReactNode {
    const { isMenuOpen } = this.props;

    return (
      <button 
        className={styles.mobileMenuButton}
        onClick={this.props.onMenuToggle}
        aria-label="Toggle menu"
      >
        <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    );
  }

  /**
   * Render mobile menu
   */
  private renderMobileMenu(): React.ReactNode {
    const { isMenuOpen } = this.props;

    if (!isMenuOpen) return null;

    return (
      <div className={styles.mobileMenu}>
        <div className={styles.mobileMenuContent}>
          {this.renderNavigation()}
          <div className={styles.mobileAuthButtons}>
            <button 
              className={styles.mobileSignInButton}
              onClick={this.props.onSignIn}
            >
              Sign In
            </button>
            <button 
              className={styles.mobileSignUpButton}
              onClick={this.props.onSignUp}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render the homepage header
   */
  render(): React.ReactNode {
    const { isScrolled } = this.state;

    return (
      <header className={`${styles.homepageHeader} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          {this.renderLogo()}
          
          <div className={styles.headerActions}>
            {this.renderNavigation()}
            {this.renderAuthButtons()}
            {this.renderMobileMenuButton()}
          </div>
        </div>
        
        {this.renderMobileMenu()}
      </header>
    );
  }
}
