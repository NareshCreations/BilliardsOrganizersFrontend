import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';

export interface TournamentManagementProps {}

interface TournamentManagementState {
  tournaments: Array<{
    id: string;
    name: string;
    status: 'upcoming' | 'active' | 'completed';
    startDate: Date;
    players: number;
    maxPlayers: number;
  }>;
  showCreateForm: boolean;
  newTournament: {
    name: string;
    startDate: string;
    maxPlayers: number;
  };
}

export class TournamentManagement extends BaseComponentComplete<TournamentManagementProps, TournamentManagementState> {
  protected getInitialState(): TournamentManagementState {
    return {
      tournaments: [
        {
          id: '1',
          name: 'Spring Championship 2025',
          status: 'active',
          startDate: new Date('2025-03-15'),
          players: 24,
          maxPlayers: 32
        },
        {
          id: '2',
          name: 'Summer Open Tournament',
          status: 'upcoming',
          startDate: new Date('2025-06-01'),
          players: 0,
          maxPlayers: 64
        },
        {
          id: '3',
          name: 'Winter Classic 2024',
          status: 'completed',
          startDate: new Date('2024-12-01'),
          players: 48,
          maxPlayers: 48
        }
      ],
      showCreateForm: false,
      newTournament: {
        name: '',
        startDate: '',
        maxPlayers: 32
      }
    };
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

  private handleSaveTournament = (): void => {
    const { newTournament, tournaments } = this.state;
    if (!newTournament.name.trim() || !newTournament.startDate) {
      return;
    }

    const tournament = {
      id: Date.now().toString(),
      name: newTournament.name,
      status: 'upcoming' as const,
      startDate: new Date(newTournament.startDate),
      players: 0,
      maxPlayers: newTournament.maxPlayers
    };

    this.setState({
      tournaments: [...tournaments, tournament],
      showCreateForm: false,
      newTournament: {
        name: '',
        startDate: '',
        maxPlayers: 32
      }
    });
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
      case 'active': return '#10b981';
      case 'upcoming': return '#f59e0b';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  render(): React.ReactNode {
    const { tournaments, showCreateForm, newTournament } = this.state;

    return (
      <div style={{ padding: '2rem', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#ffffff' }}>Tournament Management</h2>
          <button
            onClick={this.handleCreateTournament}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create Tournament
          </button>
        </div>

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
                    {tournament.startDate.toLocaleDateString()} • {tournament.players}/{tournament.maxPlayers} players
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
      </div>
    );
  }
}
