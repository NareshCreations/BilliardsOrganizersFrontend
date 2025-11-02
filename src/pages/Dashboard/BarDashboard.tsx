import React, { Component } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '@/components/Header/DashboardHeader';
import { Footer } from '@/components/organisms/Footer';
import styles from './BarDashboard.module.scss';

interface Match {
  id: string;
  title: string;
  gameType: string;
  players: number;
  maxPlayers: number;
  prize: string;
  entryFee: string;
  startTime: string;
  status: 'upcoming' | 'active' | 'completed';
  tableNumber: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

interface BarDetails {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  description: string;
  facilities: string[];
  operatingHours: string;
  contact: string;
  address: string;
}

interface BarDashboardState {
  activeTab: 'scheduled' | 'history';
}

// Higher-order component to provide navigation and params
function withNavigation(WrappedComponent: any) {
  return function WithNavigationComponent(props: any) {
    const navigate = useNavigate();
    const params = useParams();
    return <WrappedComponent {...props} navigate={navigate} params={params} />;
  };
}

class BarDashboard extends Component<any, BarDashboardState> {
  constructor(props: any) {
    super(props);
    this.state = {
      activeTab: 'scheduled'
    };
  }

  // Sample bar data - in real app, this would come from API
  get barDetails(): BarDetails {
    return {
      id: this.props.params.barId || '1',
      name: 'Elite Billiards Club',
      location: 'Downtown',
      rating: 4.8,
      image: '/api/placeholder/600/300',
      description: 'Premium billiards club with state-of-the-art tables and professional atmosphere. We host regular tournaments and provide coaching services.',
      facilities: ['8-Foot Tables', '9-Foot Tables', 'Snooker Tables', 'Bar & Lounge', 'Parking', 'Tournament Room', 'VIP Section'],
      operatingHours: 'Mon-Sun: 10:00 AM - 2:00 AM',
      contact: '+1 (555) 123-4567',
      address: '123 Main Street, Downtown District, City 12345'
    };
  }

  // Sample matches data
  scheduledMatches: Match[] = [
    {
      id: '1',
      title: 'Weekly 8-Ball Tournament',
      gameType: '8-Ball',
      players: 12,
      maxPlayers: 16,
      prize: '$500',
      entryFee: '$25',
      startTime: '7:00 PM Today',
      status: 'upcoming',
      tableNumber: 1,
      skillLevel: 'intermediate'
    },
    {
      id: '2',
      title: 'Advanced 9-Ball Championship',
      gameType: '9-Ball',
      players: 8,
      maxPlayers: 8,
      prize: '$1,200',
      entryFee: '$50',
      startTime: '8:30 PM Tomorrow',
      status: 'upcoming',
      tableNumber: 2,
      skillLevel: 'advanced'
    },
    {
      id: '3',
      title: 'Beginner Friendly Match',
      gameType: '8-Ball',
      players: 4,
      maxPlayers: 6,
      prize: '$100',
      entryFee: '$10',
      startTime: '6:00 PM Today',
      status: 'active',
      tableNumber: 3,
      skillLevel: 'beginner'
    },
    {
      id: '4',
      title: 'Professional Snooker League',
      gameType: 'Snooker',
      players: 2,
      maxPlayers: 2,
      prize: '$800',
      entryFee: '$40',
      startTime: '9:00 PM Today',
      status: 'upcoming',
      tableNumber: 4,
      skillLevel: 'professional'
    }
  ];

  previousMatches: Match[] = [
    {
      id: '5',
      title: 'Monthly 8-Ball Championship',
      gameType: '8-Ball',
      players: 16,
      maxPlayers: 16,
      prize: '$750',
      entryFee: '$30',
      startTime: 'Completed',
      status: 'completed',
      tableNumber: 1,
      skillLevel: 'advanced'
    },
    {
      id: '6',
      title: 'Weekly 9-Ball Tournament',
      gameType: '9-Ball',
      players: 8,
      maxPlayers: 8,
      prize: '$400',
      entryFee: '$20',
      startTime: 'Completed',
      status: 'completed',
      tableNumber: 2,
      skillLevel: 'intermediate'
    }
  ];

  getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'active': return '#22c55e';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      case 'professional': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  handleJoinMatch = (matchId: string) => {
    // In real app, this would handle joining the match
    console.log(`Joining match ${matchId}`);
    // Could navigate to match details or show join confirmation
  };

  renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.starHalf}>★</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.starEmpty}>★</span>);
    }
    return stars;
  };

  render() {
    const { activeTab } = this.state;
    
    return (
      <>
        <DashboardHeader />
        <div className={styles.barDashboardContainer}>
          <div className={styles.barDashboardContent}>
            {/* Back Button */}
            <button 
              onClick={() => this.props.navigate('/dashboard')}
              className={styles.backButton}
            >
              ← Back to All Bars
            </button>

          {/* Bar Header */}
          <div className={styles.barHeader}>
            <div className={styles.barImage}>
              <img src={this.barDetails.image} alt={this.barDetails.name} />
            </div>
            <div className={styles.barInfo}>
              <h1 className={styles.barName}>{this.barDetails.name}</h1>
              <div className={styles.barRating}>
                {this.renderStars(this.barDetails.rating)}
                <span className={styles.ratingText}>({this.barDetails.rating})</span>
              </div>
              <div className={styles.barLocation}>
                <span className={styles.locationIcon}>📍</span>
                {this.barDetails.location}
              </div>
              <p className={styles.barDescription}>{this.barDetails.description}</p>
              
              <div className={styles.barDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Address:</span>
                  <span className={styles.detailValue}>{this.barDetails.address}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Hours:</span>
                  <span className={styles.detailValue}>{this.barDetails.operatingHours}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Contact:</span>
                  <span className={styles.detailValue}>{this.barDetails.contact}</span>
                </div>
              </div>

              <div className={styles.facilities}>
                <h3>Facilities:</h3>
                <div className={styles.facilitiesList}>
                  {this.barDetails.facilities.map((facility, index) => (
                    <span key={index} className={styles.facility}>
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tabButton} ${activeTab === 'scheduled' ? styles.active : ''}`}
              onClick={() => this.setState({ activeTab: 'scheduled' })}
            >
              Scheduled Matches ({this.scheduledMatches.length})
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => this.setState({ activeTab: 'history' })}
            >
              Match History ({this.previousMatches.length})
            </button>
          </div>

          {/* Scheduled Matches */}
          {activeTab === 'scheduled' && (
            <div className={styles.matchesSection}>
              <div className={styles.matchesGrid}>
                {this.scheduledMatches.map((match) => (
                  <div key={match.id} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <div className={styles.matchTitle}>
                        <h3>{match.title}</h3>
                        <span 
                          className={styles.gameType}
                          style={{ backgroundColor: this.getSkillLevelColor(match.skillLevel) }}
                        >
                          {match.gameType}
                        </span>
                      </div>
                      <div 
                        className={styles.statusBadge}
                        style={{ backgroundColor: this.getStatusColor(match.status) }}
                      >
                        {match.status.toUpperCase()}
                      </div>
                    </div>

                    <div className={styles.matchDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Players:</span>
                        <span className={styles.detailValue}>
                          {match.players}/{match.maxPlayers}
                        </span>
                      </div>
                      
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Prize:</span>
                        <span className={styles.prizeValue}>{match.prize}</span>
                      </div>
                      
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Entry Fee:</span>
                        <span className={styles.entryFee}>{match.entryFee}</span>
                      </div>
                      
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Start Time:</span>
                        <span className={styles.detailValue}>{match.startTime}</span>
                      </div>
                      
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Table:</span>
                        <span className={styles.detailValue}>#{match.tableNumber}</span>
                      </div>
                      
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Skill Level:</span>
                        <span 
                          className={styles.skillLevel}
                          style={{ color: this.getSkillLevelColor(match.skillLevel) }}
                        >
                          {match.skillLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {match.status !== 'completed' && (
                      <div className={styles.matchActions}>
                        <button 
                          className={styles.joinButton}
                          onClick={() => this.handleJoinMatch(match.id)}
                          disabled={match.players >= match.maxPlayers}
                        >
                          {match.players >= match.maxPlayers ? 'Full' : 'Join Match'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match History */}
          {activeTab === 'history' && (
            <div className={styles.historySection}>
              <div className={styles.historyGrid}>
                {this.previousMatches.map((match) => (
                  <div key={match.id} className={styles.historyCard}>
                    <div className={styles.historyHeader}>
                      <h3>{match.title}</h3>
                      <span 
                        className={styles.gameType}
                        style={{ backgroundColor: this.getSkillLevelColor(match.skillLevel) }}
                      >
                        {match.gameType}
                      </span>
                    </div>
                    
                    <div className={styles.historyDetails}>
                      <div className={styles.historyRow}>
                        <span className={styles.historyLabel}>Players:</span>
                        <span className={styles.historyValue}>{match.players}</span>
                      </div>
                      
                      <div className={styles.historyRow}>
                        <span className={styles.historyLabel}>Prize:</span>
                        <span className={styles.prizeWon}>{match.prize}</span>
                      </div>
                      
                      <div className={styles.historyRow}>
                        <span className={styles.historyLabel}>Entry Fee:</span>
                        <span className={styles.historyValue}>{match.entryFee}</span>
                      </div>
                      
                      <div className={styles.historyRow}>
                        <span className={styles.historyLabel}>Status:</span>
                        <span className={styles.completedStatus}>COMPLETED</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
    );
  }
}

export default withNavigation(BarDashboard);
