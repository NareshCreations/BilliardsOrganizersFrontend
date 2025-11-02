import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.module.scss'

// Types
interface MenuItem {
  id: string;
  label: string;
  href: string;
  dropdown?: MenuItem[];
}

interface HeaderState {
  isScrolled: boolean;
  isMenuOpen: boolean;
  activeMenu: string;
}

// Menu Configuration
const menuItems: MenuItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'games', label: 'Games', href: '#games' },
  { id: 'tournaments', label: 'Tournaments', href: '#tournaments' },
  { id: 'tables', label: 'Tables', href: '#tables' },
  { id: 'contact', label: 'Contact', href: '#contact' }
]

export class Header extends Component<{}, HeaderState> {
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      isScrolled: false,
      isMenuOpen: false,
      activeMenu: 'home'
    };
  }

  debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  componentDidMount() {
    const handleScroll = this.debounce(() => {
      this.setState({ isScrolled: window.scrollY > 20 })
    }, 100)

    const handleResize = this.debounce(() => {
      if (window.innerWidth > 768 && this.state.isMenuOpen) {
        this.setState({ isMenuOpen: false })
      }
    }, 100)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.state.isMenuOpen) {
        this.setState({ isMenuOpen: false })
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleKeyDown)

    // Store references for cleanup
    this.scrollTimeout = setTimeout(() => {}, 0)
    this.resizeTimeout = setTimeout(() => {}, 0)
  }

  componentDidUpdate(prevProps: {}, prevState: HeaderState) {
    // Handle body scroll lock when mobile menu is open
    if (this.state.isMenuOpen !== prevState.isMenuOpen) {
      if (this.state.isMenuOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
    }
  }

  componentWillUnmount() {
    // Cleanup event listeners
    window.removeEventListener('scroll', () => {})
    window.removeEventListener('resize', () => {})
    document.removeEventListener('keydown', () => {})
    
    // Clear timeouts
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout)
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
    
    // Reset body overflow
    document.body.style.overflow = 'unset'
  }

  handleMenuClick = (menuId: string) => {
    this.setState({ 
      activeMenu: menuId,
      isMenuOpen: false 
    })
  }

  // Mobile menu toggle button
  HamburgerButton = () => (
    <button 
      className={`${styles.menuToggle} ${this.state.isMenuOpen ? styles.isOpen : ''}`}
      onClick={() => this.setState({ isMenuOpen: !this.state.isMenuOpen })}
      aria-label="Toggle menu"
      aria-expanded={this.state.isMenuOpen}
      aria-controls="mobile-menu"
    >
      <span className={styles.hamburgerIcon}></span>
    </button>
  )

  render() {
    const { isScrolled, isMenuOpen, activeMenu } = this.state;
    
    return (
      <header 
        className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${isMenuOpen ? styles.menuOpen : ''}`}
        role="banner"
      >
        <div className={styles.headerContainer}>
          {/* Logo Section */}
          <div className={styles.headerLogo}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <div className={styles.poolBalls}>
                  <div className={`${styles.ball} ${styles.ball8}`}>8</div>
                  <div className={`${styles.ball} ${styles.ballCue}`}></div>
                </div>
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>BFX</span>
                <span className={styles.logoTagline}>BILLIARDS</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={styles.headerNav} role="navigation" aria-label="Main navigation">
            <ul className={styles.navMenu} role="menubar">
              {menuItems.map((item) => (
                <li 
                  key={item.id} 
                  className={styles.navItem} 
                  role="none"
                >
                  <a 
                    href={item.href} 
                    className={`${styles.navLink} ${activeMenu === item.id ? styles.navLinkActive : ''}`}
                    role="menuitem"
                    aria-current={activeMenu === item.id ? "page" : undefined}
                    onClick={() => this.handleMenuClick(item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth Links */}
          <div className={styles.headerCta}>
          <Link 
            to="/login"
            className={styles.loginButton}
            role="button"
            aria-label="Login"
          >
            Login
          </Link>
            
            <Link 
              to="/signup"
              className={styles.btnBook}
              aria-label="Sign Up"
            >
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <this.HamburgerButton />
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div 
            className={styles.mobileMenuOverlay}
            onClick={() => this.setState({ isMenuOpen: false })}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu */}
        <div 
          id="mobile-menu"
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ''}`}
          aria-hidden={!isMenuOpen}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className={styles.mobileMenuContent}>
            <ul className={styles.mobileNavMenu} role="menubar">
              {menuItems.map((item, index) => (
                <li key={item.id} className={styles.mobileNavItem} role="none">
                  <a 
                    href={item.href}
                    className={`${styles.mobileNavLink} ${activeMenu === item.id ? styles.mobileNavLinkActive : ''}`}
                    onClick={() => this.handleMenuClick(item.id)}
                    role="menuitem"
                    aria-current={activeMenu === item.id ? "page" : undefined}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              
              {/* Separator */}
              <li className={styles.mobileNavSeparator}></li>
              
              {/* Auth Links */}
              <li className={styles.mobileNavItem} role="none">
                <Link to="/login" className={styles.mobileAuthLink} role="menuitem">Login</Link>
              </li>
              <li className={styles.mobileNavItem} role="none">
                <Link to="/signup" className={styles.mobileAuthLinkPrimary} role="menuitem">Sign Up</Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    )
  }
}