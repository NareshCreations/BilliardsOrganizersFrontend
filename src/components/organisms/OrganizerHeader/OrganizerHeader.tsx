import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import styles from './OrganizerHeader.module.scss';

/**
 * Organizer header props interface
 */
export interface OrganizerHeaderProps {
  user?: {
    name: string;
    avatar?: string;
    organization: string;
  };
  onLogout?: () => void;
  onProfileClick?: () => void;
}

/**
 * Organizer header state interface
 */
interface OrganizerHeaderState {
  isMenuOpen: boolean;
  isProfileDropdownOpen: boolean;
}

/**
 * Professional Organizer Header Component
 * Top navigation bar for the organizer portal
 */
export class OrganizerHeader extends BaseComponentComplete<OrganizerHeaderProps, OrganizerHeaderState> {
  /**
   * Get initial state for the header
   */
  protected getInitialState(): OrganizerHeaderState {
    return {
      isMenuOpen: false,
      isProfileDropdownOpen: false
    };
  }

  /**
   * Handle menu toggle
   */
  private handleMenuToggle = (): void => {
    this.updateState({ isMenuOpen: !this.state.isMenuOpen });
  };

  /**
   * Handle profile dropdown toggle
   */
  private handleProfileToggle = (): void => {
    this.updateState({ isProfileDropdownOpen: !this.state.isProfileDropdownOpen });
  };

  /**
   * Handle logout
   */
  private handleLogout = (): void => {
    this.props.onLogout?.();
    this.log('User logged out');
  };

  /**
   * Handle profile click
   */
  private handleProfileClick = (): void => {
    this.props.onProfileClick?.();
    this.updateState({ isProfileDropdownOpen: false });
  };

  /**
   * Render logo and branding
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
   * Render quick actions
   */
  private renderQuickActions(): React.ReactNode {
    return (
      <div className={styles.quickActions}>
        <button className={styles.actionButton} title="Create New Tournament">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        
        <button className={styles.actionButton} title="Live Games">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        
        <button className={styles.actionButton} title="Notifications">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span className={styles.notificationBadge}>3</span>
        </button>
      </div>
    );
  }

  /**
   * Render user profile section
   */
  private renderUserProfile(): React.ReactNode {
    const { user } = this.props;
    const { isProfileDropdownOpen } = this.state;

    return (
      <div className={styles.userProfile}>
        <button 
          className={styles.profileButton}
          onClick={this.handleProfileToggle}
        >
          <div className={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Organizer'}</span>
            <span className={styles.userRole}>{user?.organization || 'Tournament Director'}</span>
          </div>
          <svg 
            className={`${styles.dropdownIcon} ${isProfileDropdownOpen ? styles.open : ''}`}
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>

        {isProfileDropdownOpen && (
          <div className={styles.profileDropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownAvatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className={styles.dropdownUserInfo}>
                <span className={styles.dropdownUserName}>{user?.name || 'Organizer'}</span>
                <span className={styles.dropdownUserEmail}>{user?.organization || 'Tournament Director'}</span>
              </div>
            </div>
            
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={this.handleProfileClick}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Profile Settings
              </button>
              
              <button className={styles.dropdownItem}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
                Preferences
              </button>
              
              <button className={styles.dropdownItem}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Help & Support
              </button>
              
              <div className={styles.dropdownDivider}></div>
              
              <button className={styles.dropdownItem} onClick={this.handleLogout}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Render mobile menu button
   */
  private renderMobileMenuButton(): React.ReactNode {
    const { isMenuOpen } = this.state;

    return (
      <button 
        className={styles.mobileMenuButton}
        onClick={this.handleMenuToggle}
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
   * Render the organizer header
   */
  render(): React.ReactNode {
    return (
      <header className={styles.organizerHeader}>
        <div className={styles.headerContainer}>
          {this.renderLogo()}
          
          <div className={styles.headerActions}>
            {this.renderQuickActions()}
            {this.renderUserProfile()}
            {this.renderMobileMenuButton()}
          </div>
        </div>
      </header>
    );
  }
}
