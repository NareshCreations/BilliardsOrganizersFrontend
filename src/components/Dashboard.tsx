import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
 * Professional Dashboard Component
 * Main dashboard for billiards tournament organizers
 */
const OrganizerDashboard: React.FC<DashboardProps> = (props) => {
  const { logout } = useAuth();

  const [activeSection, setActiveSection] = useState<'dashboard' | 'tournaments' | 'players' | 'live-games'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: Date;
  }>>([
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
  ]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    console.log('🚪 OrganizerDashboard: Logging out and redirecting to login...');
    logout(); // AuthContext clears auth state
    window.location.href = '/login'; // Redirect to login page
  };

  /**
   * Handle section navigation
   */
  const handleSectionChange = (section: 'dashboard' | 'tournaments' | 'players' | 'live-games') => {
    setActiveSection(section);
    console.log('Section changed', { section });
  };

  /**
   * Handle notification dismissal
   */
  const handleNotificationDismiss = (notificationId: string) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    setNotifications(updatedNotifications);
  };

  /**
   * Render navigation sidebar
   */
  const renderNavigationSidebar = () => {
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
            <span className={styles.userName}>{props.user?.name || 'Organizer'}</span>
            <span className={styles.userRole}>{props.user?.role || 'Tournament Director'}</span>
          </div>
        </div>

        <ul className={styles.navigationList}>
          {navigationItems.map((item) => (
            <li key={item.id} className={styles.navigationItem}>
              <button
                className={`${styles.navigationButton} ${
                  activeSection === item.id ? styles.active : ''
                }`}
                onClick={() => handleSectionChange(item.id)}
              >
                <span className={styles.navigationIcon}>{item.icon}</span>
                <span className={styles.navigationLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  /**
   * Render notifications panel
   */
  const renderNotificationsPanel = () => {
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
                onClick={() => handleNotificationDismiss(notification.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render main content area
   */
  const renderMainContent = () => {
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
  };

  console.log('🔄 Dashboard: Rendering dashboard component');

  return (
    <div className={styles.organizerHome}>
      <OrganizerHeader onLogout={handleLogout} />

      <div className={styles.mainLayout}>
        {renderNavigationSidebar()}

        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>
              {activeSection === 'dashboard' && 'Dashboard Overview'}
              {activeSection === 'tournaments' && 'Tournament Management'}
              {activeSection === 'players' && 'Player Management'}
              {activeSection === 'live-games' && 'Live Game Control'}
            </h1>
            <div className={styles.contentActions}>
              {renderNotificationsPanel()}
            </div>
          </div>

          <div className={styles.contentBody}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
              </div>
            ) : (
              renderMainContent()
            )}
          </div>
        </main>
      </div>

      <OrganizerFooter />
    </div>
  );
};

export { OrganizerDashboard };
