import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import { matchesApiService, Tournament, TournamentResponse } from '../../../services/matchesApi';
import authService from '../../../services/authService';

export interface TournamentManagementProps {}

interface TournamentManagementState {
  tournaments: Tournament[];
  showCreateForm: boolean;
  newTournament: {
    name: string;
    startDate: string;
    maxPlayers: number;
  };
  loading: boolean;
  error: string | null;
}

export class TournamentManagement extends BaseComponentComplete<TournamentManagementProps, TournamentManagementState> {
  protected getInitialState(): TournamentManagementState {
    return {
      tournaments: [],
      showCreateForm: false,
      newTournament: {
        name: '',
        startDate: '',
        maxPlayers: 32
      },
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.loadTournaments();
  }

  private async loadTournaments() {
    this.setState({ loading: true, error: null });
    try {
      const response: TournamentResponse = await matchesApiService.getTournamentsByOrganizerId();
      if (response.success && response.data.tournaments) {
        this.setState({
          tournaments: response.data.tournaments,
          loading: false
        });
      } else {
        this.setState({
          error: response.message || 'Failed to load tournaments',
          loading: false
        });
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load tournaments',
        loading: false
      });
    }
  }

  private handleCreateTournament = (): void => {
    this.setState({ showCreateForm: true });
  };

  private handleCancelCreate = (): void => {
    this.setState({
      showCreateForm: false,
      newTournament: {
        name: '',
        startDate: '',
        maxPlayers: 32
      }
    });
  };

  private handleSaveTournament = async (): Promise<void> => {
    const { newTournament } = this.state;
    if (!newTournament.name.trim() || !newTournament.startDate) {
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      // Note: API for creating tournaments doesn't exist yet, so we'll show a message
      // In the future, this would call: await matchesApiService.createTournament(tournamentData);
      alert('Tournament creation API not yet implemented. This would create a tournament via the backend API.');

      // For now, just reload tournaments to show any changes
      await this.loadTournaments();

      this.setState({
        showCreateForm: false,
        newTournament: {
          name: '',
          startDate: '',
          maxPlayers: 32
        }
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to create tournament',
        loading: false
      });
    }
  };

  private handleInputChange = (field: keyof TournamentManagementState['newTournament'], value: string | number): void => {
    this.setState(prevState => ({
      newTournament: {
        ...prevState.newTournament,
        [field]: value
      }
    }));
  };

  private getStatusColor = (status: string): string => {
    switch (status) {
      case 'ongoing': return '#10b981';
      case 'upcoming': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      case 'draft': return '#6b7280';
      default: return '#6b7280';
    }
  };

  render(): React.ReactNode {
    const { tournaments, showCreateForm, newTournament, loading, error } = this.state;

    return (
      <div style={{ padding: '2rem', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#ffffff' }}>Tournament Management</h2>
          <button
            onClick={this.handleCreateTournament}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create Tournament
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
            Error: {error}
          </div>
        )}

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#9ca3af'
          }}>
            Loading tournaments...
          </div>
        )}

        {showCreateForm && (
          <div style={{
            backgroundColor: '#1f2937',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '1px solid #374151'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#ffffff' }}>Create New Tournament</h3>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Tournament Name</label>
                <input
                  type="text"
                  value={newTournament.name}
                  onChange={(e) => this.handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                  placeholder="Enter tournament name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Start Date</label>
                <input
                  type="date"
                  value={newTournament.startDate}
                  onChange={(e) => this.handleInputChange('startDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Max Players</label>
                <input
                  type="number"
                  value={newTournament.maxPlayers}
                  onChange={(e) => this.handleInputChange('maxPlayers', parseInt(e.target.value) || 32)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                  min="4"
                  max="128"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={this.handleSaveTournament}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={this.handleCancelCreate}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              style={{
                backgroundColor: '#1f2937',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #374151'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff' }}>{tournament.name}</h3>
                  <p style={{ margin: '0.25rem 0', color: '#9ca3af' }}>
                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Date TBD'} • {tournament.currentParticipants}/{tournament.maxParticipants} players • ₹{tournament.entryFee}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: this.getStatusColor(tournament.status),
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}
                  >
                    {tournament.status}
                  </span>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && tournaments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <p>No tournaments found. Create your first tournament to get started.</p>
          </div>
        )}
      </div>
    );
  }
}
