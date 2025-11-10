import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import { matchesApiService } from '../../../services/matchesApi';
import authService from '../../../services/authService';

export interface PlayerManagementProps {}

interface PlayerManagementState {
  players: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    status: 'active' | 'inactive' | 'suspended';
    joinDate: Date;
    tournamentsPlayed: number;
    winRate: number;
  }>;
  showAddForm: boolean;
  newPlayer: {
    name: string;
    email: string;
    phone: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  searchTerm: string;
  filterStatus: 'all' | 'active' | 'inactive' | 'suspended';
  loading: boolean;
  error: string | null;
}

export class PlayerManagement extends BaseComponentComplete<PlayerManagementProps, PlayerManagementState> {
  protected getInitialState(): PlayerManagementState {
    return {
      players: [],
      showAddForm: false,
      newPlayer: {
        name: '',
        email: '',
        phone: '',
        skillLevel: 'beginner'
      },
      searchTerm: '',
      filterStatus: 'all',
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.loadPlayers();
  }

  private async loadPlayers() {
    this.setState({ loading: true, error: null });
    try {
      // Note: API for getting all players doesn't exist yet
      // For now, we'll show a message that this would fetch from API
      console.log('Player management: Would fetch players from API here');

      // In the future, this would be:
      // const response = await matchesApiService.getAllPlayers();
      // this.setState({ players: response.players, loading: false });

      // For now, keep empty array and show message
      this.setState({ loading: false });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load players',
        loading: false
      });
    }
  }

  private handleAddPlayer = (): void => {
    this.setState({ showAddForm: true });
  };

  private handleCancelAdd = (): void => {
    this.setState({
      showAddForm: false,
      newPlayer: {
        name: '',
        email: '',
        phone: '',
        skillLevel: 'beginner'
      }
    });
  };

  private handleSavePlayer = async (): Promise<void> => {
    const { newPlayer } = this.state;
    if (!newPlayer.name.trim() || !newPlayer.email.trim()) {
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      // Note: API for creating players doesn't exist yet, so we'll show a message
      // In the future, this would call: await matchesApiService.createPlayer(playerData);
      alert('Player creation API not yet implemented. This would create a player via the backend API.');

      // For now, just reload players to show any changes
      await this.loadPlayers();

      this.setState({
        showAddForm: false,
        newPlayer: {
          name: '',
          email: '',
          phone: '',
          skillLevel: 'beginner'
        }
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to create player',
        loading: false
      });
    }
  };

  private handleInputChange = (field: keyof PlayerManagementState['newPlayer'], value: string): void => {
    this.setState(prevState => ({
      newPlayer: {
        ...prevState.newPlayer,
        [field]: value
      }
    }));
  };

  private handleSearchChange = (value: string): void => {
    this.setState({ searchTerm: value });
  };

  private handleFilterChange = (status: PlayerManagementState['filterStatus']): void => {
    this.setState({ filterStatus: status });
  };

  private getFilteredPlayers = (): PlayerManagementState['players'] => {
    const { players, searchTerm, filterStatus } = this.state;
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || player.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  private getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  private getSkillColor = (skill: string): string => {
    switch (skill) {
      case 'beginner': return '#3b82f6';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#10b981';
      case 'professional': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  render(): React.ReactNode {
    const { showAddForm, newPlayer, searchTerm, filterStatus, loading, error } = this.state;
    const filteredPlayers = this.getFilteredPlayers();

    return (
      <div style={{ padding: '2rem', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#ffffff' }}>Player Management</h2>
          <button
            onClick={this.handleAddPlayer}
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
            Add Player
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
            Loading players...
          </div>
        )}

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => this.handleSearchChange(e.target.value)}
              placeholder="Search players by name or email..."
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.25rem',
                color: '#ffffff'
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => this.handleFilterChange(e.target.value as PlayerManagementState['filterStatus'])}
            style={{
              padding: '0.5rem',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.25rem',
              color: '#ffffff'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {showAddForm && (
          <div style={{
            backgroundColor: '#1f2937',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '1px solid #374151'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#ffffff' }}>Add New Player</h3>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Full Name</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => this.handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Email</label>
                <input
                  type="email"
                  value={newPlayer.email}
                  onChange={(e) => this.handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Phone (Optional)</label>
                <input
                  type="tel"
                  value={newPlayer.phone}
                  onChange={(e) => this.handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', color: '#d1d5db' }}>Skill Level</label>
                <select
                  value={newPlayer.skillLevel}
                  onChange={(e) => this.handleInputChange('skillLevel', e.target.value as PlayerManagementState['newPlayer']['skillLevel'])}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.25rem',
                    color: '#ffffff'
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={this.handleSavePlayer}
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
                  onClick={this.handleCancelAdd}
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

        {/* Players List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              style={{
                backgroundColor: '#1f2937',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #374151'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff' }}>{player.name}</h3>
                  <p style={{ margin: '0.25rem 0', color: '#9ca3af' }}>{player.email}</p>
                  {player.phone && <p style={{ margin: '0.25rem 0', color: '#9ca3af' }}>{player.phone}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: this.getSkillColor(player.skillLevel),
                          color: 'white',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        {player.skillLevel}
                      </span>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: this.getStatusColor(player.status),
                          color: 'white',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        {player.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.875rem' }}>
                      {player.tournamentsPlayed} tournaments • {player.winRate.toFixed(1)}% win rate
                    </p>
                  </div>
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
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredPlayers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <p>No players found matching your criteria.</p>
            {this.state.players.length === 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Players will appear here once registered for tournaments.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
}
