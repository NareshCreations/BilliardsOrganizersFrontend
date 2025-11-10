import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.scss';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const throttledScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    const throttledResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', throttledScroll);
    window.addEventListener('resize', throttledResize);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledResize);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    // Lock body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle menu item click
  const handleMenuItemClick = (menuItem: string) => {
    setActiveMenuItem(menuItem);
    setIsMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    console.log('🚪 DashboardHeader: Logging out and redirecting to login...');
    setIsLoggingOut(true);
    try {
      logout(); // AuthContext clears auth state
      // Force a full page reload to clear all state and redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback to window.location if navigation fails
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hamburger Button Component
  const HamburgerButton = () => (
    <button
      className={styles.menuToggle}
      onClick={toggleMobileMenu}
      aria-label="Toggle mobile menu"
      aria-expanded={isMobileMenuOpen}
      aria-controls="mobile-menu"
    >
      <div className={styles.hamburgerIcon}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
  );

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          <HamburgerButton />

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
                  onClick={() => handleMenuItemClick('home')}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`${styles.navLink} ${activeMenuItem === 'games' ? styles.active : ''}`}
                  onClick={() => handleMenuItemClick('games')}
                >
                  Games
                </Link>
              </li>
              <li>
                <a
                  href="#about"
                  className={`${styles.navLink} ${activeMenuItem === 'about' ? styles.active : ''}`}
                  onClick={() => handleMenuItemClick('about')}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className={`${styles.navLink} ${activeMenuItem === 'services' ? styles.active : ''}`}
                  onClick={() => handleMenuItemClick('services')}
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`${styles.navLink} ${activeMenuItem === 'contact' ? styles.active : ''}`}
                  onClick={() => handleMenuItemClick('contact')}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className={styles.headerCta}>
            <button
              className={styles.logoutButton}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            <div
              className={styles.mobileMenuOverlay}
              onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => handleMenuItemClick('home')}
                  >
                    Home
                  </Link>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <Link
                    to="/dashboard"
                    className={styles.mobileNavLink}
                    role="menuitem"
                    onClick={() => handleMenuItemClick('games')}
                  >
                    Games
                  </Link>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <a
                    href="#about"
                    className={styles.mobileNavLink}
                    role="menuitem"
                    onClick={() => handleMenuItemClick('about')}
                  >
                    About
                  </a>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <a
                    href="#services"
                    className={styles.mobileNavLink}
                    role="menuitem"
                    onClick={() => handleMenuItemClick('services')}
                  >
                    Services
                  </a>
                </li>
                <li className={styles.mobileNavItem} role="none">
                  <a
                    href="#contact"
                    className={styles.mobileNavLink}
                    role="menuitem"
                    onClick={() => handleMenuItemClick('contact')}
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
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </header>
    </>
  );
};

export default DashboardHeader;
