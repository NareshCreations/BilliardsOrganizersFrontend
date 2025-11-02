import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { apiService } from '../../services/api';

interface DashboardHeaderState {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  activeMenuItem: string;
  isLoggingOut: boolean;
}

// Higher-order component to provide navigation
function withNavigation(WrappedComponent: any) {
  return function WithNavigationComponent(props: any) {
    const navigate = useNavigate();
    return <WrappedComponent {...props} navigate={navigate} />;
  };
}

class DashboardHeader extends Component<any, DashboardHeaderState> {
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      isScrolled: false,
      isMobileMenuOpen: false,
      activeMenuItem: '',
      isLoggingOut: false
    };
  }

  componentDidMount() {
    const throttledScroll = () => {
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY;
        this.setState({ isScrolled: scrollTop > 50 });
      }, 10);
    };

    const throttledResize = () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (window.innerWidth > 768) {
          this.setState({ isMobileMenuOpen: false });
        }
      }, 100);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.setState({ isMobileMenuOpen: false });
      }
    };

    window.addEventListener('scroll', throttledScroll);
    window.addEventListener('resize', throttledResize);
    document.addEventListener('keydown', handleEscape);
  }

  componentDidUpdate(prevProps: {}, prevState: DashboardHeaderState) {
    // Lock body scroll when mobile menu is open
    if (this.state.isMobileMenuOpen !== prevState.isMobileMenuOpen) {
      if (this.state.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
  }

  componentWillUnmount() {
    // Cleanup event listeners
    window.removeEventListener('scroll', () => {});
    window.removeEventListener('resize', () => {});
    document.removeEventListener('keydown', () => {});
    
    // Clear timeouts
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    
    // Reset body overflow
    document.body.style.overflow = 'unset';
  }

  // Handle mobile menu toggle
  toggleMobileMenu = () => {
    this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
  };

  // Handle menu item click
  handleMenuItemClick = (menuItem: string) => {
    this.setState({
      activeMenuItem: menuItem,
      isMobileMenuOpen: false
    });
  };

  // Handle logout
  handleLogout = async () => {
    this.setState({ isLoggingOut: true });
    
    try {
      console.log('Logging out...');
      
      // Call logout API
      await apiService.logout();
      
      // Clear tokens from localStorage
      apiService.clearTokens();
      
      console.log('Logout successful, redirecting to home...');
      
      // Navigate to home page
      this.props.navigate('/');
      
    } catch (error: any) {
      console.error('Logout failed:', error);
      
      // Even if API call fails, clear local tokens and redirect
      apiService.clearTokens();
      this.props.navigate('/');
      
    } finally {
      this.setState({ isLoggingOut: false });
    }
  };

  // Hamburger Button Component
  HamburgerButton = () => (
    <button
      className={styles.menuToggle}
      onClick={this.toggleMobileMenu}
      aria-label="Toggle mobile menu"
      aria-expanded={this.state.isMobileMenuOpen}
      aria-controls="mobile-menu"
    >
      <div className={styles.hamburgerIcon}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
  );

  render() {
    const { isScrolled, isMobileMenuOpen, activeMenuItem } = this.state;
    
    return (
      <>
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
          <div className={styles.headerContainer}>
            <this.HamburgerButton />
          
          <div className={styles.headerLogo}>
            <div className={styles.poolBalls}>
              <div className={`${styles.ball} ${styles.ball8}`}>8</div>
              <div className={`${styles.ball} ${styles.ballCue}`}></div>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>bFox</span>
              <span className={styles.logoTagline}>BILLIARDS</span>
            </div>
          </div>

          <nav className={styles.navMenu}>
            <ul>
              <li>
                <Link 
                  to="/" 
                  className={`${styles.navLink} ${activeMenuItem === 'home' ? styles.active : ''}`}
                  onClick={() => this.handleMenuItemClick('home')}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`${styles.navLink} ${activeMenuItem === 'games' ? styles.active : ''}`}
                  onClick={() => this.handleMenuItemClick('games')}
                >
                  Games
                </Link>
              </li>
              <li>
                <a 
                  href="#about" 
                  className={`${styles.navLink} ${activeMenuItem === 'about' ? styles.active : ''}`}
                  onClick={() => this.handleMenuItemClick('about')}
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  className={`${styles.navLink} ${activeMenuItem === 'services' ? styles.active : ''}`}
                  onClick={() => this.handleMenuItemClick('services')}
                >
                  Services
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className={`${styles.navLink} ${activeMenuItem === 'contact' ? styles.active : ''}`}
                  onClick={() => this.handleMenuItemClick('contact')}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className={styles.headerCta}>
            <button 
              className={styles.logoutButton}
              onClick={this.handleLogout}
              disabled={this.state.isLoggingOut}
            >
              {this.state.isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            <div 
              className={styles.mobileMenuOverlay}
              onClick={() => this.setState({ isMobileMenuOpen: false })}
              aria-hidden="true"
            />
            <nav 
              className={styles.mobileMenu}
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <ul>
                <li className={styles.mobileNavItem} role="none">
                  <Link 
                    to="/" 
                    className={styles.mobileNavLink} 
                    role="menuitem"
                    onClick={() => this.handleMenuItemClick('home')}
                  >
                    Home
                  </Link>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <Link 
                    to="/dashboard" 
                    className={styles.mobileNavLink} 
                    role="menuitem"
                    onClick={() => this.handleMenuItemClick('games')}
                  >
                    Games
                  </Link>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <a 
                    href="#about" 
                    className={styles.mobileNavLink} 
                    role="menuitem"
                    onClick={() => this.handleMenuItemClick('about')}
                  >
                    About
                  </a>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <a 
                    href="#services" 
                    className={styles.mobileNavLink} 
                    role="menuitem"
                    onClick={() => this.handleMenuItemClick('services')}
                  >
                    Services
                  </a>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <a 
                    href="#contact" 
                    className={styles.mobileNavLink} 
                    role="menuitem"
                    onClick={() => this.handleMenuItemClick('contact')}
                  >
                    Contact
                  </a>
                </li>
                {/* Separator */}
                <li className={styles.mobileNavSeparator}></li>
                {/* Logout Link */}
                <li className={styles.mobileNavItem} role="none">
                  <button 
                    className={styles.mobileAuthLink} 
                    role="menuitem"
                    onClick={this.handleLogout}
                    disabled={this.state.isLoggingOut}
                  >
                    {this.state.isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </header>
    </>
    );
  }
}

export default withNavigation(DashboardHeader);
