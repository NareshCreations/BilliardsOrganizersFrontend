import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Trophy, Target, Settings, Bell } from 'lucide-react';
import { matchesApiService } from '../../services/matchesApi';

interface TournamentDetailState {
  tournament: any | null;
  loading: boolean;
  error: string | null;
}

export class TournamentDetail extends React.Component<{}, TournamentDetailState> {
  private tournamentId: string;

  constructor(props: {}) {
    super(props);
    
    // Get tournament ID from URL
    const pathParts = window.location.pathname.split('/');
    this.tournamentId = pathParts[pathParts.length - 1];
    
    this.state = {
      tournament: null,
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.loadTournamentDetails();
  }

  private loadTournamentDetails = async (): Promise<void> => {
    try {
      console.log('🏆 Loading tournament details for ID:', this.tournamentId);
      
      // For now, we'll use the organizer ID to get tournaments and find the specific one
      // In a real implementation, you'd have a specific API endpoint for single tournament
      const organizerId = 'eeda070d-e3df-4701-89fc-cbfd1b31d14b';
      const response = await matchesApiService.getTournamentsByOrganizerId(organizerId);
      
      if (response.success && response.data.tournaments) {
        const tournament = response.data.tournaments.find((t: any) => t.id === this.tournamentId);
        
        if (tournament) {
          console.log('✅ Tournament found:', tournament);
          this.setState({
            tournament: tournament,
            loading: false,
            error: null
          });
        } else {
          console.log('❌ Tournament not found with ID:', this.tournamentId);
          this.setState({
            tournament: null,
            loading: false,
            error: 'Tournament not found'
          });
        }
      } else {
        this.setState({
          tournament: null,
          loading: false,
          error: 'Failed to load tournament data'
        });
      }
    } catch (error) {
      console.error('❌ Error loading tournament details:', error);
      this.setState({
        tournament: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load tournament details'
      });
    }
  };

  private handleBackClick = (): void => {
    window.location.href = '/tournaments';
  };

  private handleEditTournament = (): void => {
    console.log('📝 Edit tournament clicked:', this.tournamentId);
    // TODO: Implement edit functionality
  };

  private handleSendNotification = (): void => {
    console.log('🔔 Send notification clicked:', this.tournamentId);
    // TODO: Implement notification functionality
  };

  render() {
    const { tournament, loading, error } = this.state;

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tournament details...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Tournament</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={this.handleBackClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    if (!tournament) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
            <p className="text-gray-600 mb-6">The tournament you're looking for doesn't exist.</p>
            <button
              onClick={this.handleBackClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={this.handleBackClick}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Tournaments
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Tournament Details</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tournament Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                {/* Tournament Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{tournament.name}</h2>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-2 text-sm font-medium rounded-full border border-orange-200 bg-orange-50 text-orange-700">
                        {tournament.status?.charAt(0).toUpperCase() + tournament.status?.slice(1) || 'Scheduled'}
                      </span>
                      <span className="px-4 py-2 text-sm font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        {tournament.type?.replace('_', ' ').toUpperCase() || 'TOURNAMENT'}
                      </span>
                    </div>
                    {tournament.description && (
                      <p className="text-gray-600 text-lg leading-relaxed">{tournament.description}</p>
                    )}
                  </div>
                </div>

                {/* Tournament Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Game Type</p>
                        <p className="font-semibold text-gray-900">{tournament.gameType || '8-Ball'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">
                          {tournament.startDate ? new Date(tournament.startDate).toLocaleTimeString() : '14:00'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Participants</p>
                        <p className="font-semibold text-gray-900">
                          {tournament.currentParticipants || 0}/{tournament.maxParticipants || 50} players
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Entry Fee</p>
                        <p className="font-semibold text-gray-900">${tournament.entryFee || 50}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-semibold text-gray-900">{tournament.venue || 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <button
                    onClick={this.handleEditTournament}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Settings className="w-5 h-5" />
                    Edit Tournament
                  </button>
                  <button
                    onClick={this.handleSendNotification}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Bell className="w-5 h-5" />
                    Send Notification
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registered Players */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Registered Players</h3>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No players registered yet</p>
                </div>
              </div>

              {/* Tournament Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tournament Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tournament ID:</span>
                    <span className="font-mono text-gray-900">{this.tournamentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-gray-900">
                      {tournament.updatedAt ? new Date(tournament.updatedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TournamentDetail;
