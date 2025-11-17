import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Homepage } from './components/Homepage';
import { OrganizerDashboard } from './components/Dashboard';
import { Matches } from './components/pages/Matches';
import { Signup } from './pages/Auth';
import Login from './components/auth/Login';
import { Dashboard, BarDashboard } from './pages/Dashboard';
import MatchDetails from './pages/MatchDetails/MatchDetails';
import { GameOrganization } from './pages/GameOrganization';
import { TournamentRunning } from './pages/TournamentRunning';
import UserProfile from './components/auth/UserProfile';
import { OrganizerProfile } from './pages/OrganizerProfile';




class App extends Component {
  render() {
    console.log('🔄 App: Rendering application...');
    return (
      <AuthProvider>
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
