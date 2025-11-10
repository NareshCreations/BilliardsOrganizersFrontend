import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import styles from './DashboardOverview.module.scss';

/**
 * Dashboard overview props interface
 */
export interface DashboardOverviewProps {
  // Add any specific props if needed
}

/**
 * Dashboard overview state interface
 */
interface DashboardOverviewState {
  activeTournaments: number;
  totalPlayers: number;
  liveGames: number;
  completedMatches: number;
  recentActivity: Array<{
    id: string;
    type: 'tournament' | 'match' | 'player' | 'system';
    message: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error' | 'info';
  }>;
}

/**
 * Dashboard Overview Component
 * Main dashboard showing key metrics and recent activity
 */
export class DashboardOverview extends BaseComponentComplete<DashboardOverviewProps, DashboardOverviewState> {
  /**
   * Get initial state for the dashboard
   */
  protected getInitialState(): DashboardOverviewState {
    return {
      activeTournaments: 3,
      totalPlayers: 127,
      liveGames: 2,
      completedMatches: 45,
      recentActivity: [
        {
          id: '1',
          type: 'tournament',
          message: 'Spring Championship Round 2 completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          status: 'success'
        },
        {
          id: '2',
          type: 'player',
          message: 'New player registration: John Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          status: 'info'
        },
        {
          id: '3',
          type: 'match',
          message: 'Match #1247: Alice vs Bob - In Progress',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          status: 'warning'
        },
        {
          id: '4',
          type: 'system',
          message: 'Tournament bracket updated automatically',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          status: 'info'
        }
      ]
    };
  }

  /**
   * Get status icon for activity items
   */
  private getStatusIcon(status: DashboardOverviewState['recentActivity'][0]['status']): React.ReactNode {
    const iconMap = {
      success: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ),
      warning: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      ),
      error: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      info: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      )
    };

    return iconMap[status];
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }

  /**
   * Render metric cards
   */
  private renderMetricCards(): React.ReactNode {
    const { activeTournaments, totalPlayers, liveGames, completedMatches } = this.state;

    const metrics = [
      {
        title: 'Active Tournaments',
        value: activeTournaments,
        icon: '🏆',
        color: 'blue',
        trend: '+12%'
      },
      {
        title: 'Total Players',
        value: totalPlayers,
        icon: '👥',
        color: 'green',
        trend: '+8%'
      },
      {
        title: 'Live Games',
        value: liveGames,
        icon: '🎯',
        color: 'orange',
        trend: '+2'
      },
      {
        title: 'Completed Matches',
        value: completedMatches,
        icon: '✅',
        color: 'purple',
        trend: '+15%'
      }
    ];

    return (
      <div className={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} className={`${styles.metricCard} ${styles[`metricCard--${metric.color}`]}`}>
            <div className={styles.metricIcon}>
              <span className={styles.metricEmoji}>{metric.icon}</span>
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricTitle}>{metric.title}</div>
              <div className={styles.metricTrend}>{metric.trend}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Render recent activity section
   */
  private renderRecentActivity(): React.ReactNode {
    const { recentActivity } = this.state;

    return (
      <div className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <button className={styles.viewAllButton}>View All</button>
        </div>
        
        <div className={styles.activityList}>
          {recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles[`activityIcon--${activity.status}`]}`}>
                {this.getStatusIcon(activity.status)}
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityMessage}>{activity.message}</p>
                <span className={styles.activityTime}>
                  {this.formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render quick actions
   */
  private renderQuickActions(): React.ReactNode {
    const actions = [
      {
        title: 'Create Tournament',
        description: 'Start a new tournament',
        icon: '🏆',
        action: () => this.log('Create tournament clicked')
      },
      {
        title: 'Add Player',
        description: 'Register new player',
        icon: '👤',
        action: () => this.log('Add player clicked')
      },
      {
        title: 'Live Scoring',
        description: 'Manage live games',
        icon: '📊',
        action: () => this.log('Live scoring clicked')
      },
      {
        title: 'View Reports',
        description: 'Tournament analytics',
        icon: '📈',
        action: () => this.log('View reports clicked')
      }
    ];

    return (
      <div className={styles.quickActionsSection}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.quickActionsGrid}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={styles.quickActionCard}
              onClick={action.action}
            >
              <div className={styles.quickActionIcon}>
                <span className={styles.quickActionEmoji}>{action.icon}</span>
              </div>
              <div className={styles.quickActionContent}>
                <h4 className={styles.quickActionTitle}>{action.title}</h4>
                <p className={styles.quickActionDescription}>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render the dashboard overview
   */
  render(): React.ReactNode {
    console.log('🔄 DashboardOverview: Rendering dashboard overview component');

    return (
      <div className={styles.dashboardOverview}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.dashboardTitle}>Dashboard Overview</h2>
          <p className={styles.dashboardSubtitle}>
            Welcome back! Here's what's happening with your tournaments.
          </p>
        </div>

        {this.renderMetricCards()}

        <div className={styles.dashboardContent}>
          <div className={styles.contentLeft}>
            {this.renderRecentActivity()}
          </div>
          <div className={styles.contentRight}>
            {this.renderQuickActions()}
          </div>
        </div>
      </div>
    );
  }
}
