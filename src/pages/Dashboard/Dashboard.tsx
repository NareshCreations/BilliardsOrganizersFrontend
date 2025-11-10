import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardHeader from '@/components/Header/DashboardHeader';
import { Footer } from '@/components/organisms/Footer';
import styles from './Dashboard.module.scss';

interface Bar {
  id: string;
  name: string;
  location: string;
  rating: number;
  totalMatches: number;
  activeMatches: number;
  image: string;
  description: string;
  facilities: string[];
  operatingHours: string;
  contact: string;
}

interface DashboardState {
  searchTerm: string;
  selectedLocation: string;
}

// Higher-order component to provide navigation
function withNavigation(WrappedComponent: any) {
  return function WithNavigationComponent(props: any) {
    const navigate = useNavigate();
    return <WrappedComponent {...props} navigate={navigate} />;
  };
}

class Dashboard extends Component<any, DashboardState> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchTerm: '',
      selectedLocation: 'all'
    };
  }

  // Sample data for registered bars
  bars: Bar[] = [
    {
      id: '1',
      name: 'Elite Billiards Club',
      location: 'Downtown',
      rating: 4.8,
      totalMatches: 156,
      activeMatches: 12,
      image: '/api/placeholder/300/200',
      description: 'Premium billiards club with state-of-the-art tables and professional atmosphere.',
      facilities: ['8-Foot Tables', '9-Foot Tables', 'Snooker Tables', 'Bar & Lounge', 'Parking'],
      operatingHours: 'Mon-Sun: 10:00 AM - 2:00 AM',
      contact: '+1 (555) 123-4567'
    },
    {
      id: '2',
      name: 'Golden Cue Sports Center',
      location: 'Westside',
      rating: 4.6,
      totalMatches: 89,
      activeMatches: 8,
      image: '/api/placeholder/300/200',
      description: 'Family-friendly sports center with multiple billiards tables and tournament facilities.',
      facilities: ['Tournament Tables', 'Practice Tables', 'Coaching', 'Equipment Rental'],
      operatingHours: 'Mon-Fri: 9:00 AM - 11:00 PM, Sat-Sun: 10:00 AM - 12:00 AM',
      contact: '+1 (555) 234-5678'
    },
    {
      id: '3',
      name: 'Crystal Ball Billiards',
      location: 'Eastside',
      rating: 4.7,
      totalMatches: 203,
      activeMatches: 15,
      image: '/api/placeholder/300/200',
      description: 'Modern billiards hall with crystal-clear tables and premium lighting.',
      facilities: ['LED Lighting', 'Tournament Room', 'VIP Section', 'Food & Drinks'],
      operatingHours: 'Mon-Sun: 11:00 AM - 3:00 AM',
      contact: '+1 (555) 345-6789'
    },
    {
      id: '4',
      name: 'Break Point Lounge',
      location: 'Downtown',
      rating: 4.5,
      totalMatches: 67,
      activeMatches: 5,
      image: '/api/placeholder/300/200',
      description: 'Cozy lounge atmosphere with professional-grade tables and friendly staff.',
      facilities: ['Lounge Area', 'Bar Service', 'Private Rooms', 'Live Music'],
      operatingHours: 'Tue-Sun: 6:00 PM - 2:00 AM',
      contact: '+1 (555) 456-7890'
    },
    {
      id: '5',
      name: 'Championship Billiards',
      location: 'Northside',
      rating: 4.9,
      totalMatches: 312,
      activeMatches: 18,
      image: '/api/placeholder/300/200',
      description: 'Professional tournament facility with championship-level tables and equipment.',
      facilities: ['Tournament Tables', 'Spectator Seating', 'Broadcasting Setup', 'Pro Shop'],
      operatingHours: 'Mon-Sun: 8:00 AM - 1:00 AM',
      contact: '+1 (555) 567-8901'
    }
  ];

  get locations() {
    return ['all', ...Array.from(new Set(this.bars.map(bar => bar.location)))];
  }

  get filteredBars() {
    return this.bars.filter(bar => {
      const matchesSearch = bar.name.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
                           bar.description.toLowerCase().includes(this.state.searchTerm.toLowerCase());
      const matchesLocation = this.state.selectedLocation === 'all' || bar.location === this.state.selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }

  handleBarClick = (barId: string) => {
    this.props.navigate(`/dashboard/bar/${barId}`);
  };

  handleJoinMatch = (barId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the bar click
    console.log(`Joining match at bar ${barId}`);
    // Navigate to match details page
    this.props.navigate(`/match/${barId}`);
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
    const { searchTerm, selectedLocation } = this.state;
    
    return (
      <>
        <DashboardHeader />
        <div className={styles.dashboardContainer}>
          <div className={styles.dashboardContent}>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <div className={styles.avatarIcon}>👤</div>
                </div>
                <div className={styles.userDetails}>
                  <h1 className={styles.welcomeTitle}>Welcome back, Player!</h1>
                  <div className={styles.userStats}>
                    <span className={styles.stat}>Rank: Gold</span>
                    <span className={styles.stat}>Wins: 24</span>
                    <span className={styles.stat}>Total Games: 45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search bars by name or description..."
                  value={searchTerm}
                  onChange={(e) => this.setState({ searchTerm: e.target.value })}
                  className={styles.searchInput}
                />
                <select
                  value={selectedLocation}
                  onChange={(e) => this.setState({ selectedLocation: e.target.value })}
                  className={styles.locationFilter}
                >
                  {this.locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bars Grid */}
            <div className={styles.barsSection}>
              <div className={styles.sectionTitle}>
                <h2>Registered Billiards Bars & Organizations</h2>
                <p>Choose a bar to view their matches and join games</p>
              </div>
              
              <div className={styles.barsGrid}>
                {this.filteredBars.map((bar) => (
                  <div
                    key={bar.id}
                    className={styles.barCard}
                    onClick={() => this.handleBarClick(bar.id)}
                  >
                    <div className={styles.barImage}>
                      <img src={bar.image} alt={bar.name} />
                      <div className={styles.barOverlay}>
                        <span className={styles.activeMatches}>
                          {bar.activeMatches} Active Matches
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.barInfo}>
                      <div className={styles.barHeader}>
                        <h3 className={styles.barName}>{bar.name}</h3>
                        <div className={styles.barRating}>
                          {this.renderStars(bar.rating)}
                          <span className={styles.ratingText}>({bar.rating})</span>
                        </div>
                      </div>
                      
                      <div className={styles.barLocation}>
                        <span className={styles.locationIcon}>📍</span>
                        {bar.location}
                      </div>
                      
                      <p className={styles.barDescription}>{bar.description}</p>
                      
                      <div className={styles.barStats}>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>{bar.totalMatches}</span>
                          <span className={styles.statLabel}>Total Matches</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statNumber}>{bar.activeMatches}</span>
                          <span className={styles.statLabel}>Active Now</span>
                        </div>
                      </div>
                      
                      <div className={styles.barFacilities}>
                        {bar.facilities.slice(0, 3).map((facility, index) => (
                          <span key={index} className={styles.facility}>
                            {facility}
                          </span>
                        ))}
                        {bar.facilities.length > 3 && (
                          <span className={styles.moreFacilities}>
                            +{bar.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.barFooter}>
                      <div className={styles.barFooterInfo}>
                        <div className={styles.operatingHours}>
                          <span className={styles.hoursIcon}>🕒</span>
                          {bar.operatingHours}
                        </div>
                        <div className={styles.contact}>
                          <span className={styles.contactIcon}>📞</span>
                          {bar.contact}
                        </div>
                      </div>
                      <button 
                        className={styles.joinMatchButton}
                        onClick={(e) => this.handleJoinMatch(bar.id, e)}
                      >
                        Join Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {this.filteredBars.length === 0 && (
                <div className={styles.noResults}>
                  <p>No bars found matching your criteria.</p>
                  <button 
                    onClick={() => {
                      this.setState({
                        searchTerm: '',
                        selectedLocation: 'all'
                      });
                    }}
                    className={styles.clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}

export default withNavigation(Dashboard);
