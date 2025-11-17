import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import { matchesApiService, Tournament, TournamentResponse } from '../../../services/matchesApi';
import authService from '../../../services/authService';
import styles from './TournamentManagement.module.scss';

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

  private getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'ongoing':
      case 'started':
        return styles.statusStarted;
      case 'upcoming':
        return styles.statusUpcoming;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'draft':
        return styles.statusDraft;
      case 'registration_open':
        return styles.statusRegistrationOpen;
      default:
        return styles.statusDraft;
    }
  };

  render(): React.ReactNode {
    const { tournaments, showCreateForm, newTournament, loading, error } = this.state;

    return (
      <div className={styles.tournamentManagement}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tournament Management</h2>
          <button
            onClick={this.handleCreateTournament}
            disabled={loading}
            className={styles.createButton}
          >
            Create Tournament
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            Error: {error}
          </div>
        )}

        {loading && (
          <div className={styles.loadingState}>
            Loading tournaments...
          </div>
        )}

        {showCreateForm && (
          <div className={styles.createForm}>
            <h3 className={styles.formTitle}>Create New Tournament</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Tournament Name</label>
                <input
                  type="text"
                  value={newTournament.name}
                  onChange={(e) => this.handleInputChange('name', e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter tournament name"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Start Date</label>
                <input
                  type="date"
                  value={newTournament.startDate}
                  onChange={(e) => this.handleInputChange('startDate', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Max Players</label>
                <input
                  type="number"
                  value={newTournament.maxPlayers}
                  onChange={(e) => this.handleInputChange('maxPlayers', parseInt(e.target.value) || 32)}
                  className={styles.formInput}
                  min="4"
                  max="128"
                />
              </div>
              <div className={styles.formActions}>
                <button
                  onClick={this.handleSaveTournament}
                  className={styles.saveButton}
                >
                  Save
                </button>
                <button
                  onClick={this.handleCancelCreate}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.tournamentsList}>
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className={styles.tournamentCard}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{tournament.name}</h3>
                  <p className={styles.cardDetails}>
                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Date TBD'} • {tournament.currentParticipants}/{tournament.maxParticipants} players • ₹{tournament.entryFee}
                  </p>
                </div>
                <div className={styles.cardActions}>
                  <span className={`${styles.statusBadge} ${this.getStatusClass(tournament.status)}`}>
                    {tournament.status}
                  </span>
                  <button className={styles.manageButton}>
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && tournaments.length === 0 && (
          <div className={styles.emptyState}>
            <p>No tournaments found. Create your first tournament to get started.</p>
          </div>
        )}
      </div>
    );
  }
}
