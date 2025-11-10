import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';

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
}

export class PlayerManagement extends BaseComponentComplete<PlayerManagementProps, PlayerManagementState> {
  protected getInitialState(): PlayerManagementState {
    return {
      players: [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1-555-0123',
          skillLevel: 'advanced',
          status: 'active',
          joinDate: new Date('2024-01-15'),
          tournamentsPlayed: 12,
          winRate: 68.5
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1-555-0456',
          skillLevel: 'intermediate',
          status: 'active',
          joinDate: new Date('2024-03-22'),
          tournamentsPlayed: 8,
          winRate: 45.2
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@email.com',
          skillLevel: 'professional',
          status: 'suspended',
          joinDate: new Date('2023-11-08'),
          tournamentsPlayed: 25,
          winRate: 82.1
        },
        {
          id: '4',
          name: 'Emma Davis',
          email: 'emma.davis@email.com',
          phone: '+1-555-0789',
          skillLevel: 'beginner',
          status: 'active',
          joinDate: new Date('2024-06-10'),
          tournamentsPlayed: 3,
          winRate: 33.3
        }
      ],
      showAddForm: false,
      newPlayer: {
        name: '',
        email: '',
        phone: '',
        skillLevel: 'beginner'
      },
      searchTerm: '',
      filterStatus: 'all'
    };
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

  private handleSavePlayer = (): void => {
    const { newPlayer, players } = this.state;
    if (!newPlayer.name.trim() || !newPlayer.email.trim()) {
      return;
    }

    const player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      email: newPlayer.email,
      phone: newPlayer.phone || undefined,
      skillLevel: newPlayer.skillLevel,
      status: 'active' as const,
      joinDate: new Date(),
      tournamentsPlayed: 0,
      winRate: 0
    };

    this.setState({
      players: [...players, player],
      showAddForm: false,
      newPlayer: {
        name: '',
        email: '',
        phone: '',
        skillLevel: 'beginner'
      }
    });
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
    const { showAddForm, newPlayer, searchTerm, filterStatus } = this.state;
    const filteredPlayers = this.getFilteredPlayers();

    return (
      <div style={{ padding: '2rem', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#ffffff' }}>Player Management</h2>
          <button
            onClick={this.handleAddPlayer}
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
            Add Player
          </button>
        </div>

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

        {filteredPlayers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <p>No players found matching your criteria.</p>
          </div>
        )}
      </div>
    );
  }
}
