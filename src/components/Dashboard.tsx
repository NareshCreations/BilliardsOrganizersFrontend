import React from 'react';
import { BaseComponentComplete } from './base/BaseComponent';
import { OrganizerHeader } from './organisms/OrganizerHeader/OrganizerHeader';
import { DashboardOverview } from './organisms/DashboardOverview/DashboardOverview';
import { TournamentManagement } from './organisms/TournamentManagement/TournamentManagement';
import { PlayerManagement } from './organisms/PlayerManagement/PlayerManagement';
import { LiveGameControl } from './organisms/LiveGameControl/LiveGameControl';
import { OrganizerFooter } from './organisms/OrganizerFooter/OrganizerFooter';
import styles from './Dashboard.module.scss';

/**
 * Dashboard props interface
 */
export interface DashboardProps {
  user?: {
    name: string;
    role: string;
    organization: string;
  };
}

/**
 * Dashboard state interface
 */
interface DashboardState {
  activeSection: 'dashboard' | 'tournaments' | 'players' | 'live-games';
  isLoading: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: Date;
  }>;
}

/**
 * Professional Dashboard Component
 * Main dashboard for billiards tournament organizers
 */
export class OrganizerDashboard extends BaseComponentComplete<DashboardProps, DashboardState> {
  /**
   * Get initial state for the organizer home page
   */
  protected getInitialState(): DashboardState {
    return {
      activeSection: 'dashboard',
      isLoading: false,
      notifications: [
        {
          id: '1',
          message: 'Tournament "Spring Championship" starts in 2 hours',
          type: 'info',
          timestamp: new Date()
        },
        {
          id: '2',
          message: 'Player registration deadline approaching',
          type: 'warning',
          timestamp: new Date()
        }
      ]
    };
  }

  /**
   * Handle section navigation
   */
  private handleSectionChange = (section: DashboardState['activeSection']): void => {
    this.updateState({ activeSection: section });
    this.log('Section changed', { section });
  };

  /**
   * Handle notification dismissal
   */
  private handleNotificationDismiss = (notificationId: string): void => {
    const updatedNotifications = this.state.notifications.filter(
      notification => notification.id !== notificationId
    );
    this.updateState({ notifications: updatedNotifications });
  };

  /**
   * Render navigation sidebar
   */
  private renderNavigationSidebar(): React.ReactNode {
    const { activeSection } = this.state;

    const navigationItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'tournaments', label: 'Tournaments', icon: '🏆' },
      { id: 'players', label: 'Players', icon: '👥' },
      { id: 'live-games', label: 'Live Games', icon: '🎯' }
    ] as const;

    return (
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Organizer Portal</h2>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{this.props.user?.name || 'Organizer'}</span>
            <span className={styles.userRole}>{this.props.user?.role || 'Tournament Director'}</span>
          </div>
        </div>
        
        <ul className={styles.navigationList}>
          {navigationItems.map((item) => (
            <li key={item.id} className={styles.navigationItem}>
              <button
                className={`${styles.navigationButton} ${
                  activeSection === item.id ? styles.active : ''
                }`}
                onClick={() => this.handleSectionChange(item.id)}
              >
                <span className={styles.navigationIcon}>{item.icon}</span>
                <span className={styles.navigationLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  /**
   * Render notifications panel
   */
  private renderNotificationsPanel(): React.ReactNode {
    const { notifications } = this.state;

    if (notifications.length === 0) return null;

    return (
      <div className={styles.notificationsPanel}>
        <div className={styles.notificationsHeader}>
          <h3 className={styles.notificationsTitle}>Notifications</h3>
          <span className={styles.notificationsCount}>{notifications.length}</span>
        </div>
        
        <div className={styles.notificationsList}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notification} ${styles[`notification--${notification.type}`]}`}
            >
              <div className={styles.notificationContent}>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <span className={styles.notificationTime}>
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button
                className={styles.notificationDismiss}
                onClick={() => this.handleNotificationDismiss(notification.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render main content area
   */
  private renderMainContent(): React.ReactNode {
    const { activeSection } = this.state;

    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'tournaments':
        return <TournamentManagement />;
      case 'players':
        return <PlayerManagement />;
      case 'live-games':
        return <LiveGameControl />;
      default:
        return <DashboardOverview />;
    }
  }

  /**
   * Render the organizer home page
   */
  render(): React.ReactNode {
    const { isLoading } = this.state;

    return (
      <div className={styles.organizerHome}>
        <OrganizerHeader />
        
        <div className={styles.mainLayout}>
          {this.renderNavigationSidebar()}
          
          <main className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h1 className={styles.pageTitle}>
                {this.state.activeSection === 'dashboard' && 'Dashboard Overview'}
                {this.state.activeSection === 'tournaments' && 'Tournament Management'}
                {this.state.activeSection === 'players' && 'Player Management'}
                {this.state.activeSection === 'live-games' && 'Live Game Control'}
              </h1>
              <div className={styles.contentActions}>
                {this.renderNotificationsPanel()}
              </div>
            </div>
            
            <div className={styles.contentBody}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading...</p>
                </div>
              ) : (
                this.renderMainContent()
              )}
            </div>
          </main>
        </div>
        
        <OrganizerFooter />
      </div>
    );
  }
}
