import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.scss';
import { apiService } from '../../services/api';

interface LoginState {
  formData: {
    email: string;
    password: string;
    rememberMe: boolean;
  };
  errors: {[key: string]: string};
  isLoading: boolean;
}

// Higher-order component to provide navigation
function withNavigation(WrappedComponent: any) {
  return function WithNavigationComponent(props: any) {
    const navigate = useNavigate();
    return <WrappedComponent {...props} navigate={navigate} />;
  };
}

class Login extends Component<any, LoginState> {
  constructor(props: any) {
    super(props);
    this.state = {
      formData: {
        email: '',
        password: '',
        rememberMe: false
      },
      errors: {},
      isLoading: false
    };
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
    
    // Clear error when user starts typing
    if (this.state.errors[name]) {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: '' }
      }));
    }
  };

  validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!this.state.formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(this.state.formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!this.state.formData.password) {
      newErrors.password = 'Password is required';
    } else if (this.state.formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    this.setState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, navigate function available:', !!this.props.navigate);
    
    if (!this.validateForm()) return;

    this.setState({ isLoading: true });
    
    try {
      console.log('Attempting login with:', { email: this.state.formData.email });
      
      // Call the real login API
      const response = await apiService.login({
        email: this.state.formData.email,
        password: this.state.formData.password
      });
      
      console.log('API Response:', response);
      console.log('Response structure:', {
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        hasAccessToken: response.data?.accessToken ? 'yes' : 'no',
        hasRefreshToken: response.data?.refreshToken ? 'yes' : 'no',
        hasUser: response.data?.user ? 'yes' : 'no'
      });
      
      if (response.success && response.data) {
        // Check if tokens exist in the response (they are directly in data, not nested under tokens)
        if (response.data.accessToken) {
          // Store tokens in localStorage
          apiService.setTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
          
          // Handle successful login
          console.log('Login successful:', response.data.user);
          
          // Clear any previous errors
          this.setState({ errors: {} });
          
          // Navigate to dashboard after successful login
          console.log('Navigating to dashboard...');
          this.props.navigate('/dashboard');
          console.log('Navigation called');
        } else {
          // Fallback: if no accessToken but user data exists, use test mode
          if (response.data.user) {
            console.log('No accessToken found, using test mode');
            apiService.setTokens('test-access-token', 'test-refresh-token');
            this.setState({ errors: {} });
            this.props.navigate('/dashboard');
            return;
          }
          
          throw new Error('No access token found in response');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Check if it's a network error (backend not running)
      if (error.message.includes('Unable to connect to server')) {
        // For testing purposes, allow login with any credentials when backend is down
        console.log('Backend not available, using test mode');
        
        // Store dummy tokens for testing
        apiService.setTokens('test-access-token', 'test-refresh-token');
        
        // Clear any previous errors
        this.setState({ errors: {} });
        
        // Navigate to dashboard for testing
        console.log('Test mode: Navigating to dashboard...');
        this.props.navigate('/dashboard');
        console.log('Test mode: Navigation called');
        return;
      }
      
      // Show error message to user
      this.setState({
        errors: {
          ...this.state.errors,
          general: error.message || 'Login failed. Please check your credentials and try again.'
        }
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { formData, errors, isLoading } = this.state;
    
    return (
      <div className={styles.authContainer}>
        <div className={styles.authBackground}>
          <div className={styles.poolTable}>
            <div className={styles.poolBalls}>
              <div className={styles.ball}></div>
              <div className={styles.ball}></div>
              <div className={styles.ball}></div>
            </div>
          </div>
        </div>

        <div className={styles.authFormContainer}>
          <div className={styles.authForm}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <div className={styles.logoBalls}>
                  <div className={`${styles.logoBall} ${styles.logoBall8}`}>8</div>
                  <div className={`${styles.logoBall} ${styles.logoBallCue}`}></div>
                </div>
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>BFX</span>
                <span className={styles.logoTagline}>BILLIARDS</span>
              </div>
            </div>

            {/* Header */}
            <div className={styles.authHeader}>
              <h1 className={styles.authTitle}>Welcome Back</h1>
              <p className={styles.authSubtitle}>Sign in to your BFX Billiards account</p>
            </div>

            {/* Form */}
            <form onSubmit={this.handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={this.handleInputChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={this.handleInputChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={this.handleInputChange}
                    className={styles.checkbox}
                    disabled={isLoading}
                  />
                  <span className={styles.checkboxText}>Remember me</span>
                </label>
                
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* General Error Message */}
            {errors.general && (
              <div className={styles.errorMessage}>
                {errors.general}
              </div>
            )}

            {/* Test Navigation Button */}
            <button
              type="button"
              onClick={() => {
                console.log('Test navigation clicked');
                this.props.navigate('/dashboard');
              }}
              style={{
                margin: '10px 0',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test Navigation to Dashboard
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span>or</span>
            </div>

            {/* Social Login */}
            <div className={styles.socialLogin}>
              <button className={styles.socialButton} disabled={isLoading}>
                <svg className={styles.socialIcon} viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Sign Up Link */}
            <div className={styles.authFooter}>
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className={styles.authLink}>
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withNavigation(Login);
