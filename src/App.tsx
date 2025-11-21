import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Homepage } from './components/Homepage';
import { OrganizerDashboard } from './components/Dashboard';
import { Matches } from './components/pages/Matches';
import { TournamentBracket } from './components/pages/TournamentBracket';
import { Signup } from './pages/Auth';
import Login from './components/auth/Login';
import { Dashboard, BarDashboard } from './pages/Dashboard';
import MatchDetails from './pages/MatchDetails/MatchDetails';
import { GameOrganization } from './pages/GameOrganization';
import { TournamentRunning } from './pages/TournamentRunning';
import UserProfile from './components/auth/UserProfile';
import { OrganizerProfile } from './pages/OrganizerProfile';
import authService from './services/authService';

// Global Token Expiration Checker Component
const GlobalTokenChecker: React.FC = () => {
  React.useEffect(() => {
    // Check token expiration on mount
    const checkTokenExpiration = () => {
      // Only check if we're not on login/signup pages
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        const token = authService.getAccessToken();
        const expiry = localStorage.getItem('billiards_token_expiry');
        
        if (!token || !expiry) {
          console.log('🔐 Global token check: No token found, redirecting to login...');
          authService.logout();
          // Use setTimeout to ensure redirect happens
          setTimeout(() => {
            window.location.replace('/login');
          }, 0);
          return;
        }
        
        // Check if token is expired
        const expiryDate = new Date(expiry);
        const now = new Date();
        
        if (now >= expiryDate) {
          console.log('🔐 Global token check: Token expired, redirecting to login...');
          authService.logout();
          // Use setTimeout to ensure redirect happens
          setTimeout(() => {
            window.location.replace('/login');
          }, 0);
          return;
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check periodically (every 30 seconds)
    const interval = setInterval(checkTokenExpiration, 30000);

    // Check when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTokenExpiration();
      }
    };

    // Check on focus (user clicks back into window)
    const handleFocus = () => {
      checkTokenExpiration();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null; // This component doesn't render anything
};

class App extends Component {
  render() {
    console.log('🔄 App: Rendering application...');
    return (
      <AuthProvider>
        <GlobalTokenChecker />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/tournaments" 
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tournament-bracket" 
              element={
                <ProtectedRoute>
                  <TournamentBracket />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/bar/:barId" 
              element={
                <ProtectedRoute>
                  <BarDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/match/:matchId" 
              element={
                <ProtectedRoute>
                  <MatchDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game-organization/:matchId" 
              element={
                <ProtectedRoute>
                  <GameOrganization />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tournament-running" 
              element={
                <ProtectedRoute>
                  <TournamentRunning />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/organizer-profile" 
              element={
                <ProtectedRoute>
                  <OrganizerProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    );
  }
}

export default App;
