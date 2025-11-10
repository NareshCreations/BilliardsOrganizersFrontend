import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import { matchesApiService } from '../../../services/matchesApi';
import authService from '../../../services/authService';

export interface LiveGameControlProps {}

interface LiveGameControlState {
  activeGames: Array<{
    id: string;
    tournamentName: string;
    player1: string;
    player2: string;
    currentScore: { player1: number; player2: number };
    status: 'in_progress' | 'paused' | 'finished';
    startTime: Date;
    tableNumber: number;
  }>;
  selectedGame: string | null;
  showScoreModal: boolean;
  loading: boolean;
  error: string | null;
  selectedTournament: string | null;
}

export class LiveGameControl extends BaseComponentComplete<LiveGameControlProps, LiveGameControlState> {
  protected getInitialState(): LiveGameControlState {
    return {
      activeGames: [],
      selectedGame: null,
      showScoreModal: false,
      loading: false,
      error: null,
      selectedTournament: null
    };
  }

  componentDidMount() {
    this.loadLiveGames();
  }

  private async loadLiveGames() {
    this.setState({ loading: true, error: null });
    try {
      // Note: API for getting live games doesn't exist yet
      // For now, we'll show a message that this would fetch from API
      console.log('Live game control: Would fetch live games from API here');

      // In the future, this would be:
      // const response = await matchesApiService.getLiveTournaments();
      // this.setState({ activeGames: response.games, loading: false });

      // For now, keep empty array and show message
      this.setState({ loading: false });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load live games',
        loading: false
      });
    }
  }

  private handlePauseGame = (gameId: string): void => {
    this.setState(prevState => ({
      activeGames: prevState.activeGames.map(game =>
        game.id === gameId ? { ...game, status: 'paused' as const } : game
      )
    }));
  };

  private handleResumeGame = (gameId: string): void => {
    this.setState(prevState => ({
      activeGames: prevState.activeGames.map(game =>
        game.id === gameId ? { ...game, status: 'in_progress' as const } : game
      )
    }));
  };

  private handleFinishGame = (gameId: string): void => {
    this.setState(prevState => ({
      activeGames: prevState.activeGames.map(game =>
        game.id === gameId ? { ...game, status: 'finished' as const } : game
      )
    }));
  };

  private handleUpdateScore = (gameId: string, player: 'player1' | 'player2', increment: boolean): void => {
    this.setState(prevState => ({
      activeGames: prevState.activeGames.map(game => {
        if (game.id === gameId) {
          const newScore = { ...game.currentScore };
          if (increment) {
            newScore[player] = Math.min(newScore[player] + 1, 21); // Max 21 points
          } else {
            newScore[player] = Math.max(newScore[player] - 1, 0);
          }
          return { ...game, currentScore: newScore };
        }
        return game;
      })
    }));
  };

  private getGameDuration = (startTime: Date): string => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  private getStatusColor = (status: string): string => {
    switch (status) {
      case 'in_progress': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'finished': return '#6b7280';
      default: return '#6b7280';
    }
  };

  render(): React.ReactNode {
    const { activeGames, loading, error } = this.state;

    return (
      <div style={{ padding: '2rem', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#ffffff' }}>Live Game Control</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#1f2937',
              color: '#10b981',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {activeGames.filter(g => g.status === 'in_progress').length} Active
            </span>
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#1f2937',
              color: '#f59e0b',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {activeGames.filter(g => g.status === 'paused').length} Paused
            </span>
          </div>
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
            Loading live games...
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {activeGames.map((game) => (
            <div
              key={game.id}
              style={{
                backgroundColor: '#1f2937',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #374151'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.125rem' }}>
                    Table {game.tableNumber}: {game.player1} vs {game.player2}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#9ca3af', fontSize: '0.875rem' }}>
                    {game.tournamentName} • Started {this.getGameDuration(game.startTime)} ago
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: this.getStatusColor(game.status),
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}
                  >
                    {game.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Score Display */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#111827',
                borderRadius: '0.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: game.currentScore.player1 > game.currentScore.player2 ? '#10b981' : '#ffffff',
                    marginBottom: '0.5rem'
                  }}>
                    {game.currentScore.player1}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{game.player1}</div>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => this.handleUpdateScore(game.id, 'player1', false)}
                      disabled={game.status !== 'in_progress'}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#374151',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: game.status === 'in_progress' ? 'pointer' : 'not-allowed',
                        opacity: game.status === 'in_progress' ? 1 : 0.5
                      }}
                    >
                      -
                    </button>
                    <button
                      onClick={() => this.handleUpdateScore(game.id, 'player1', true)}
                      disabled={game.status !== 'in_progress'}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#374151',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: game.status === 'in_progress' ? 'pointer' : 'not-allowed',
                        opacity: game.status === 'in_progress' ? 1 : 0.5
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>VS</div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: game.currentScore.player2 > game.currentScore.player1 ? '#10b981' : '#ffffff',
                    marginBottom: '0.5rem'
                  }}>
                    {game.currentScore.player2}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{game.player2}</div>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => this.handleUpdateScore(game.id, 'player2', false)}
                      disabled={game.status !== 'in_progress'}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#374151',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: game.status === 'in_progress' ? 'pointer' : 'not-allowed',
                        opacity: game.status === 'in_progress' ? 1 : 0.5
                      }}
                    >
                      -
                    </button>
                    <button
                      onClick={() => this.handleUpdateScore(game.id, 'player2', true)}
                      disabled={game.status !== 'in_progress'}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#374151',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: game.status === 'in_progress' ? 'pointer' : 'not-allowed',
                        opacity: game.status === 'in_progress' ? 1 : 0.5
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {game.status === 'in_progress' ? (
                  <button
                    onClick={() => this.handlePauseGame(game.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Pause Game
                  </button>
                ) : game.status === 'paused' ? (
                  <button
                    onClick={() => this.handleResumeGame(game.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Resume Game
                  </button>
                ) : null}

                <button
                  onClick={() => this.handleFinishGame(game.id)}
                  disabled={game.status === 'finished'}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: game.status === 'finished' ? '#6b7280' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: game.status === 'finished' ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: game.status === 'finished' ? 0.5 : 1
                  }}
                >
                  Finish Game
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && activeGames.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <p>No active games at the moment.</p>
            <p>Games will appear here when tournaments are in progress.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Select a tournament above to view live games.
            </p>
          </div>
        )}
      </div>
    );
  }
}
