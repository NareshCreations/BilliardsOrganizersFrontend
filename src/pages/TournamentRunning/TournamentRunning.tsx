import React, { Component } from 'react';
import { BaseComponentComplete } from '../../components/base/BaseComponent';
import { Trophy, Clock, Users, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { tournamentApiService, TournamentData as ApiTournamentData, ApiResponse } from '../../services/tournamentApi';

export interface TournamentRunningProps {
  className?: string;
}

interface TournamentData {
  matchId: number;
  matchName: string;
  shuffledMatches: any[];
  players: any[];
}

interface TournamentRunningState {
  tournamentData: ApiTournamentData | null;
  currentRound: number;
  activeTab: number;
  isTournamentRunning: boolean;
  currentMatchIndex: number;
  selectedMatch: any | null;
  matchResults: { [matchId: number]: any };
  roundWinners: { [round: number]: any[] };
  rounds: any[];
  loading: boolean;
  error: string | null;
  activeMatch: any | null;
  closedMatches: { [matchId: number]: { winner: any; loser: any } };
  showWinnerModal: boolean;
  winnerModalMatch: any | null;
  lobbyPlayers: any[];
  showLobbyModal: boolean;
  showCancelMatchModal: boolean;
  cancelMatchData: any | null;
  cancelMessage: string;
  selectedWinner: any | null;
  showWinnerConfirmation: boolean;
  showRoundConfigModal: boolean;
  roundConfigData: {
    roundTitle: string;
    roundDescription: string;
    roundComments: string;
  };
  playerComments: {
    player1Comment: string;
    player2Comment: string;
  };
  cancelledMatches: {
    [matchId: string]: {
      match: any;
      reason: string;
      timestamp: string;
      round: number;
    }
  };
  lobbyActiveTab: 'all' | 'never-played' | 'odd-winners' | 'cancelled';
  selectedLobbyPlayers: number[];
  showAlert: boolean;
  alertMessage: string;
  alertType: 'success' | 'error' | 'warning' | 'info';
  showAddRoundModal: boolean;
  newRoundName: string;
  showAssignPlayersModal: boolean;
  assignPlayersRound: number | null;
  selectedPlayer1: any | null;
  selectedPlayer2: any | null;
  availablePlayers: any[];
}

export interface LobbyPlayer {
  id: number;
  name: string;
  rank: number;
  rating: number;
  profilePic: string;
  skillLevel: string;
  matchesPlayed?: number;
  matchesWon?: number;
  winRate?: number;
  status: string;
  reason: string;
  fromRound?: number;
  category: 'never-played' | 'odd-winner' | 'cancelled'; // NEW
}

export class TournamentRunning extends BaseComponentComplete<TournamentRunningProps, TournamentRunningState> {
  constructor(props: TournamentRunningProps) {
    super(props);
    this.log('TournamentRunning component initialized');
  }

  protected getInitialState(): TournamentRunningState {
    return {
      tournamentData: null,
      currentRound: 1,
      activeTab: 1,
      isTournamentRunning: false,
      currentMatchIndex: 0,
      selectedMatch: null,
      matchResults: {},
      roundWinners: {},
      rounds: [],
      loading: true,
      error: null,
      activeMatch: null,
      closedMatches: {},
      showWinnerModal: false,
      winnerModalMatch: null,
      lobbyPlayers: [],
      showLobbyModal: false,
      showCancelMatchModal: false,
      cancelMatchData: null,
      cancelMessage: '',
      selectedWinner: null,
      showWinnerConfirmation: false,
      showRoundConfigModal: false,
      roundConfigData: {
        roundTitle: '',
        roundDescription: '',
        roundComments: ''
      },
      playerComments: {
        player1Comment: '',
        player2Comment: ''
      },
      cancelledMatches: {},
      selectedLobbyPlayers: [],
      showAlert: false,
      alertMessage: '',
      alertType: 'info',
      lobbyActiveTab: 'all',
      showAddRoundModal: false,
      newRoundName: '',
      showAssignPlayersModal: false,
      assignPlayersRound: null,
      selectedPlayer1: null,
      selectedPlayer2: null,
      availablePlayers: []
    };
  }

  componentDidMount() {
    this.loadTournamentData();
  }

  private loadTournamentData = async (): Promise<void> => {
    try {
      const storedData = sessionStorage.getItem('tournamentData');
      if (storedData) {
        const tournamentData = JSON.parse(storedData);
        
        // Convert the data structure from Matches.tsx to the expected format
        const convertedData: ApiTournamentData = {
          tournamentId: `tour_${tournamentData.matchId}`,
          tournamentName: tournamentData.matchName || 'Tournament',
          tournamentDate: new Date().toISOString().split('T')[0],
          tournamentTime: new Date().toTimeString().split(' ')[0],
          totalPlayers: tournamentData.players?.length || 0,
          totalRounds: Math.ceil(Math.log2(tournamentData.players?.length || 1)),
          currentRound: 1,
          status: 'ongoing',
          matches: tournamentData.shuffledMatches || [],
          rounds: tournamentData.shuffledMatches ? this.createRoundsFromMatches(tournamentData.shuffledMatches) : [],
          matchResults: {},
          roundWinners: {},
          closedMatches: {},
          tournamentStats: {
            totalMatches: tournamentData.shuffledMatches?.length || 0,
            completedMatches: 0,
            remainingMatches: tournamentData.shuffledMatches?.length || 0,
            totalPlayers: tournamentData.players?.length || 0,
            activePlayers: tournamentData.players?.length || 0,
            eliminatedPlayers: 0
          },
          lobbyPlayers: []
        };
        
        this.setState({
          tournamentData: convertedData,
          loading: false
        });
        
        if (tournamentData.shuffledMatches) {
          const rounds = this.initializeRounds(tournamentData.shuffledMatches);
          this.setState({ rounds });
        }
      } else {
        const response: ApiResponse<ApiTournamentData> = await tournamentApiService.getTournamentData('tour_001');
        
        if (response.success) {
          this.setState({
            tournamentData: response.data,
            loading: false
          });
          
          if (response.data.matches) {
            const rounds = this.initializeRounds(response.data.matches);
            this.setState({ rounds });
          }
        } else {
          this.setState({
            error: 'Failed to load tournament data from API',
            loading: false
          });
        }
      }
    } catch (error) {
      this.setState({
        error: 'Failed to load tournament data',
        loading: false
      });
    }
  };

  private handleStartTournament = (): void => {
    if (!this.state.selectedMatch) {
      this.showCustomAlert('Please select a match to start the tournament', 'warning')
      return;
    }

    this.setState({
      isTournamentRunning: true,
      currentMatchIndex: 0
    });
  };

  private handlePauseTournament = async (): Promise<void> => {
    try {
      const response = await tournamentApiService.pauseTournament('tour_001');
      
      if (response.success) {
        this.setState({
          isTournamentRunning: false,
          activeMatch: null
        });
      } else {
        console.error('Failed to pause tournament:', response.message);
      }
    } catch (error) {
      console.error('Error pausing tournament:', error);
    }
  };

  private handleResetTournament = async (): Promise<void> => {
    try {
      const response = await tournamentApiService.resetTournament('tour_001');
      
      if (response.success) {
        this.setState({
          isTournamentRunning: false,
          currentMatchIndex: 0,
          activeMatch: null,
          matchResults: {},
          roundWinners: {},
          closedMatches: {},
          currentRound: 1,
          activeTab: 0
        });
        
        // Reload tournament data
        await this.loadTournamentData();
      } else {
        console.error('Failed to reset tournament:', response.message);
      }
    } catch (error) {
      console.error('Error resetting tournament:', error);
    }
  };

  private handleGoBack = (): void => {
    window.history.back();
  };

  private createRoundsFromMatches = (matches: any[]): any[] => {
    const rounds = [];
    const totalPlayers = matches.length * 2;
    let currentPlayers = totalPlayers;
    let roundNumber = 1;
    
    // Calculate total rounds needed
    let totalRounds = Math.ceil(Math.log2(currentPlayers));
    
    for (let i = 0; i < totalRounds; i++) {
      rounds.push({
        id: `round_${roundNumber}`,
        name: `Round ${roundNumber}`,
        roundNumber: roundNumber,
        matches: i === 0 ? matches : [], // Only first round gets matches
        players: [],
        winners: [],
        isShuffled: i === 0,
        status: i === 0 ? 'active' : 'pending'
      });
      
      currentPlayers = Math.ceil(currentPlayers / 2);
      roundNumber++;
    }
    
    return rounds;
  };

  private initializeRounds = (matches: any[]): any[] => {
    // Use the rounds data from tournament data instead of calculating
    if (this.state.tournamentData && this.state.tournamentData.rounds) {
      return this.state.tournamentData.rounds.map((round: any, index: number) => ({
        ...round,
        matches: index === 0 ? matches : [], // Only first round gets matches, others start empty
        winners: [], // All rounds start with empty winners
        isShuffled: index === 0 // First round is already shuffled
      }));
    }
    
    // Fallback calculation if no tournament data
    const rounds = [];
    const totalPlayers = matches.length * 2; // Each match has 2 players
    let currentPlayers = totalPlayers;
    let roundNumber = 1;
    
    // Calculate total rounds needed
    let totalRounds = Math.ceil(Math.log2(currentPlayers));
    
    for (let i = 0; i < totalRounds; i++) {
      const matchesInRound = Math.ceil(currentPlayers / 2);
      rounds.push({
        roundNumber: roundNumber,
        matchCount: matchesInRound,
        players: currentPlayers,
        isCompleted: false,
        matches: i === 0 ? matches : [], // First round gets the shuffled matches
        winners: [], // Initialize winners array
        isShuffled: i === 0 // First round is already shuffled
      });
      
      currentPlayers = Math.ceil(currentPlayers / 2);
      roundNumber++;
    }
    
    return rounds;
  };

  private handleMatchResult = (matchId: number, winner: any): void => {
    const newResults = {
      ...this.state.matchResults,
      [matchId]: winner
    };

    // Add winner to current round winners
    const currentRoundWinners = this.state.roundWinners[this.state.currentRound] || [];
    const updatedRoundWinners = {
      ...this.state.roundWinners,
      [this.state.currentRound]: [...currentRoundWinners, winner]
    };

    this.setState({
      matchResults: newResults,
      currentMatchIndex: this.state.currentMatchIndex + 1,
      roundWinners: updatedRoundWinners
    }, () => {
      // Check if current round is complete
      this.checkRoundCompletion();
    });
  };

  private checkRoundCompletion = async (): Promise<void> => {
    const currentRoundMatches = this.getCurrentRoundMatches();
    const completedMatches = currentRoundMatches.filter((match: any) => 
      this.state.closedMatches[match.id]
    );

    // Just check if round is complete - no auto-completion
    if (completedMatches.length === currentRoundMatches.length) {
      console.log(`Round ${this.state.currentRound} is complete!`);
      // Round is complete, but don't auto-progress
    }
  };


  private isCurrentRoundComplete = (): boolean => {
    const currentRoundMatches = this.getCurrentRoundMatches();
    const completedMatches = currentRoundMatches.filter((match: any) => 
      this.state.closedMatches[match.id]
    );
    
    const isComplete = completedMatches.length === currentRoundMatches.length && currentRoundMatches.length > 0;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Round completion check:', {
        currentRound: this.state.currentRound,
        totalMatches: currentRoundMatches.length,
        completedMatches: completedMatches.length,
        isComplete,
        closedMatches: Object.keys(this.state.closedMatches)
      });
    }
    
    return isComplete;
  };

  private handleGoToNextRound = (): void => {
    if (!this.isCurrentRoundComplete()) {
      console.log('Current round is not complete yet');
      return;
    }
    
    // Show round configuration modal
    this.setState({
      showRoundConfigModal: true,
      roundConfigData: {
        roundTitle: `Round ${this.state.currentRound + 1}`,
        roundDescription: '',
        roundComments: ''
      }
    });
  };

  private handleCloseRoundConfigModal = (): void => {
    this.setState({
      showRoundConfigModal: false,
      roundConfigData: {
        roundTitle: '',
        roundDescription: '',
        roundComments: ''
      }
    });
  };

  private handleRoundConfigChange = (field: string, value: string): void => {
    this.setState({
      roundConfigData: {
        ...this.state.roundConfigData,
        [field]: value
      }
    });
  };

  private handleConfirmRoundConfig = async (): Promise<void> => {
    // Close modal and progress to next round
    this.setState({ showRoundConfigModal: false });
    await this.progressToNextRound();
  };

  private progressToNextRound = async (): Promise<void> => {
    try {
      const currentRound = this.state.currentRound;
      const nextRound = currentRound + 1;
      
      if (nextRound > this.state.rounds.length) {
        console.log('Tournament completed!');
        return;
      }

      // Collect winners from current round's completed matches
      const currentRoundData = this.state.rounds[currentRound - 1];
      const currentRoundWinners = currentRoundData.matches
        .filter((match: any) => this.state.closedMatches[match.id])
        .map((match: any) => this.state.closedMatches[match.id].winner);

      console.log('Current round winners:', currentRoundWinners);

      // Call API to progress to next round
      const response = await tournamentApiService.progressToNextRound(currentRound);
      
      if (response.success && response.data) {
        const { nextRoundWinners, nextRoundMatches } = response.data;
        
        // Update the next round with winners but NO matches initially
        const updatedRounds = this.state.rounds.map(round => {
          if (round.roundNumber === nextRound) {
            return {
              ...round,
              winners: currentRoundWinners, // Use the actual winners from current round
              matches: [], // Start with empty matches - require shuffle to create them
              isShuffled: false,
              roundTitle: this.state.roundConfigData.roundTitle,
              roundDescription: this.state.roundConfigData.roundDescription,
              roundComments: this.state.roundConfigData.roundComments
            };
          } else if (round.roundNumber === currentRound) {
            return {
              ...round,
              isCompleted: true
            };
          }
          return round;
        });

        this.setState({
          currentRound: nextRound,
          activeTab: nextRound,
          rounds: updatedRounds,
          matchResults: {},
          activeMatch: null,
          selectedMatch: null
        });

        console.log(`Progressed to Round ${nextRound} with ${currentRoundWinners.length} winners`);
      }
    } catch (error) {
      console.error('Error progressing to next round:', error);
    }
  };

  async shuffleWinners(roundNumber: number): Promise<ApiResponse<any>> {
    await this.delay(400);
    
    // Find the current round in tournament data
    const currentRound = tournamentData.rounds.find(r => r.roundNumber === roundNumber);
    if (!currentRound) {
      return {
        success: false,
        message: 'Round not found',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  
    // Get winners from the current round (these are the players to shuffle)
    const winners = currentRound.winners || [];
    
    if (winners.length === 0) {
      return {
        success: false,
        message: 'No winners to shuffle',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  
    console.log(`Shuffling ${winners.length} winners for round ${roundNumber}`);
  
    // Shuffle the winners array
    const shuffled = [...winners].sort(() => Math.random() - 0.5);
    
    // Create matches from pairs
    const newMatches: Match[] = [];
    let oddPlayer = null;
  
    // Pair up players (leave last one if odd number)
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      this.matchCounter++;
      const matchId = `${tournamentData.tournamentId}-R${roundNumber}-M${Date.now()}-${this.matchCounter}`;
      
      newMatches.push({
        id: matchId,
        round: roundNumber,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        status: 'pending',
        startTime: null,
        endTime: null,
        winner: null,
        score: null
      });
    }
  
    // Handle odd player
    if (shuffled.length % 2 !== 0) {
      oddPlayer = {
        ...shuffled[shuffled.length - 1],
        status: 'waiting',
        reason: 'Odd winner - waiting for next pairing',
        fromRound: roundNumber,
        category: 'odd-winner'
      };
      console.log('Odd player detected:', oddPlayer.name);
    }
  
    console.log(`Created ${newMatches.length} matches, odd player: ${oddPlayer ? oddPlayer.name : 'none'}`);
  
    return {
      success: true,
      message: 'Winners shuffled successfully',
      data: {
        roundNumber,
        shuffledWinners: shuffled,
        newMatches,
        oddPlayer
      },
      timestamp: new Date().toISOString()
    };
  }

  private createMatchesForRound = (players: any[], roundNumber: number): any[] => {
    const matches = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matches.push({
          id: `${roundNumber}-${Math.floor(i / 2) + 1}`,
          player1: players[i],
          player2: players[i + 1],
          round: roundNumber
        });
      }
    }
    return matches;
  };

  private getCurrentRoundMatches = () => {
    const currentRound = this.state.rounds.find(round => round.roundNumber === this.state.currentRound);
    return currentRound?.matches || [];
  };

  private getCurrentMatch = () => {
    const currentRoundMatches = this.getCurrentRoundMatches();
    return currentRoundMatches[this.state.currentMatchIndex] || null;
  };

  private getCompletedMatches = () => {
    return this.getCurrentRoundMatches().filter((match: any) => 
      this.state.matchResults[match.id]
    );
  };

  private getRemainingMatches = () => {
    return this.getCurrentRoundMatches().filter((match: any) => 
      !this.state.matchResults[match.id]
    );
  };

  private handleTabChange = (roundNumber: number): void => {
    this.setState({
      activeTab: roundNumber
    });
  };

  private handleMatchSelection = (match: any): void => {
    this.setState({
      selectedMatch: match
    });
  };

  private handleStartMatch = async (match: any): Promise<void> => {
    try {
      const response = await tournamentApiService.startMatch(match.id);
      
      if (response.success) {
        this.setState({
          activeMatch: match,
          isTournamentRunning: true // Mark tournament as running when first match starts
        });
        
        // Update match status in rounds
        const updatedRounds = this.state.rounds.map(round => ({
          ...round,
          matches: round.matches.map((m: any) => 
            m.id === match.id ? { ...m, status: 'live', startTime: new Date().toISOString() } : m
          )
        }));
        
        this.setState({ rounds: updatedRounds });
      } else {
        console.error('Failed to start match:', response.message);
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  private handleCloseMatch = (): void => {
    if (!this.state.activeMatch) return;
    
    this.setState({
      showWinnerModal: true,
      winnerModalMatch: this.state.activeMatch,
      isTournamentRunning: true,
      playerComments: {  // ADD THESE 3 LINES
        player1Comment: '',
        player2Comment: ''
      }
    });
  };

  private handlePlayerCommentChange = (player: 'player1' | 'player2', comment: string): void => {
    this.setState({
      playerComments: {
        ...this.state.playerComments,
        [`${player}Comment`]: comment
      }
    });
  };

  

  private handleSelectWinner = (winner: any): void => {
    this.setState({
      selectedWinner: winner,
      showWinnerConfirmation: true
    });
  };

  private handleConfirmWinner = async (): Promise<void> => {
    if (!this.state.winnerModalMatch || !this.state.selectedWinner) return;
    
    try {
      const response = await tournamentApiService.recordMatchResult(
        this.state.winnerModalMatch.id, 
        this.state.selectedWinner.id,
        this.state.playerComments
      );
      
      if (response.success) {
        const match = this.state.winnerModalMatch;
        const winner = this.state.selectedWinner;
        const loser = winner.id === match.player1.id ? match.player2 : match.player1;
        
        this.setState({
          activeMatch: null,
          closedMatches: {
            ...this.state.closedMatches,
            [match.id]: { winner, loser, comments: this.state.playerComments }
          },
          showWinnerModal: false,
          winnerModalMatch: null,
          selectedWinner: null,
          showWinnerConfirmation: false,
          playerComments: { 
            player1Comment: '',
            player2Comment: ''
          }
        });
        
        // Update match status in rounds
        const updatedRounds = this.state.rounds.map(round => ({
          ...round,
          matches: round.matches.map((m: any) => 
            m.id === match.id ? { 
              ...m, 
              status: 'completed', 
              endTime: new Date().toISOString(),
              winner: winner,
              score: response.data.matchDetails.finalScore
            } : m
          )
        }));
        
        this.setState({ rounds: updatedRounds });
        
        // Check if round is complete and progress to next round
        this.checkRoundCompletion();
      } else {
        console.error('Failed to record match result:', response.message);
      }
    } catch (error) {
      console.error('Error recording match result:', error);
    }
  };

  private handleCancelWinnerSelection = (): void => {
    this.setState({
      selectedWinner: null,
      showWinnerConfirmation: false
    });
  };

  private handleCloseWinnerModal = (): void => {
    this.setState({
      showWinnerModal: false,
      winnerModalMatch: null,
      selectedWinner: null,
      showWinnerConfirmation: false
    });
  };

  // Lobby Management Methods
  private loadLobbyPlayers = async (): Promise<void> => {
    try {
      const response = await tournamentApiService.getLobbyPlayers();
      if (response.success) {
        const playersWithCategory = response.data.map(player => ({
          ...player,
          category: player.category || 'never-played'
        }));
        
        this.setState({ lobbyPlayers: playersWithCategory });
        console.log('Lobby players loaded:', playersWithCategory);
      }
    } catch (error) {
      console.error('Error loading lobby players:', error);
    }
  };


  private handleShowLobby = (): void => {
    this.setState({ showLobbyModal: true });
    this.loadLobbyPlayers();
  };

  private handleCloseLobby = (): void => {
    this.setState({ showLobbyModal: false });
  };

  private handleCancelMatch = (match: any): void => {
    console.log('Opening cancel modal for match:', match.id);
    console.log('Current rounds state:', this.state.rounds.map(r => ({
      round: r.roundNumber,
      matches: r.matches.map(m => m.id)
    })));
    
    this.setState({
      showCancelMatchModal: true,
      cancelMatchData: match,
      cancelMessage: ''
    });
  };

  private handleCloseCancelMatchModal = (): void => {
    this.setState({
      showCancelMatchModal: false,
      cancelMatchData: null,
      cancelMessage: ''
    });
  };

  private handleCancelMessageChange = (message: string): void => {
    this.setState({ cancelMessage: message });
  };

  private handleConfirmCancelMatch = async (reason: string): Promise<void> => {
    if (!this.state.cancelMatchData) return;
  
    /*if (!reason.trim()) {
      this.showCustomAlert('Please enter a cancellation message', 'warning');
      return;
    }*/
  
    try {
      // Pass the full match object instead of just the ID
      const response = await tournamentApiService.cancelMatch(
        this.state.cancelMatchData,  // Pass entire match object
        reason
      );
      
      if (response.success) {
        const cancelledMatchInfo = {
          match: this.state.cancelMatchData,
          reason: reason,
          timestamp: new Date().toISOString(),
          round: this.state.cancelMatchData.round
        };
        
        const updatedRounds = this.state.rounds.map(round => ({
          ...round,
          matches: round.matches.filter((m: any) => 
            String(m.id) !== String(this.state.cancelMatchData.id)
          )
        }));
        
        this.setState({
          rounds: updatedRounds,
          showCancelMatchModal: false,
          cancelMatchData: null,
          cancelMessage: '',
          cancelledMatches: {
            ...this.state.cancelledMatches,
            [this.state.cancelMatchData.id]: cancelledMatchInfo
          }
        });
        
        await this.loadLobbyPlayers();
        this.showCustomAlert('Match cancelled successfully', 'success');
      } else {
        this.showCustomAlert(response.message, 'error');
      }
    } catch (error) {
      console.error('Error cancelling match:', error);
      this.showCustomAlert('Error cancelling match. Please try again.', 'error');
    }
  };
  
  private handleMovePlayerToRound = async (playerId: number, roundNumber: number): Promise<void> => {
    try {
      const response = await tournamentApiService.movePlayerToRound(playerId, roundNumber);
      
      if (response.success) {
        // Reload lobby players and tournament data
        this.loadLobbyPlayers();
        this.loadTournamentData();
        
        console.log('Player moved to round successfully');
      } else {
        console.error('Failed to move player:', response.message);
      }
    } catch (error) {
      console.error('Error moving player:', error);
    }
  };

  private handleRemovePlayer = async (playerId: number): Promise<void> => {
    try {
      const response = await tournamentApiService.removePlayerFromTournament(playerId);
      
      if (response.success) {
        // Reload lobby players and tournament data
        this.loadLobbyPlayers();
        this.loadTournamentData();
        
        console.log('Player removed from tournament successfully');
      } else {
        console.error('Failed to remove player:', response.message);
      }
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  private getTournamentSummary = () => {
    const totalPlayers = this.state.tournamentData?.totalPlayers || 0;
    const completedMatches = Object.keys(this.state.closedMatches).length;
    const cancelledMatches = Object.keys(this.state.cancelledMatches).length;
    const playersWhoAttended = totalPlayers - (cancelledMatches * 2); // Approximate
    
    return {
      totalPlayers,
      playersWhoAttended,
      completedMatches,
      cancelledMatches,
      cancelledMatchDetails: Object.values(this.state.cancelledMatches),
      winners: Object.values(this.state.closedMatches).map(m => m.winner),
      lobbyPlayers: this.state.lobbyPlayers
    };
  };

  private handleShowSummary = (): void => {
    const summary = this.getTournamentSummary();
    console.log('Tournament Summary:', summary);
    // You can show this in a modal or navigate to a summary page
  };
  

// Alert methods
private showCustomAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void => {
  this.setState({
    showAlert: true,
    alertMessage: message,
    alertType: type
  });
};

private closeAlert = (): void => {
  this.setState({
    showAlert: false,
    alertMessage: '',
    alertType: 'info'
  });
};

// Lobby player selection
private handleToggleLobbyPlayerSelection = (playerId: number): void => {
  const currentSelected = this.state.selectedLobbyPlayers;
  
  if (currentSelected.includes(playerId)) {
    this.setState({
      selectedLobbyPlayers: currentSelected.filter(id => id !== playerId)
    });
  } else {
    if (currentSelected.length < 2) {
      this.setState({
        selectedLobbyPlayers: [...currentSelected, playerId]
      });
    } else {
      this.showCustomAlert('You can only select 2 players at a time to create a match', 'warning');
    }
  }
};

// ==================== NEW: Dynamic Round Management ====================

// Show Add Round Modal
private handleShowAddRoundModal = (): void => {
  this.setState({
    showAddRoundModal: true,
    newRoundName: `Round ${this.state.rounds.length + 1}`
  });
};

// Close Add Round Modal
private handleCloseAddRoundModal = (): void => {
  this.setState({
    showAddRoundModal: false,
    newRoundName: ''
  });
};

// Handle Round Name Change
private handleRoundNameChange = (name: string): void => {
  this.setState({ newRoundName: name });
};

// Add New Round
private handleAddRound = (): void => {
  const { newRoundName, rounds } = this.state;
  
  if (!newRoundName.trim()) {
    this.showCustomAlert('Please enter a round name', 'warning');
    return;
  }

  const newRound = {
    roundNumber: rounds.length + 1,
    roundTitle: newRoundName,
    roundDescription: '',
    roundComments: '',
    players: 0,
    matchCount: 0,
    matches: [],
    winners: [],
    isShuffled: false,
    isCompleted: false
  };

  this.setState({
    rounds: [...rounds, newRound],
    showAddRoundModal: false,
    newRoundName: ''
  });

  this.showCustomAlert(`Round "${newRoundName}" added successfully!`, 'success');
};

// Show Assign Players Modal
private handleShowAssignPlayersModal = (roundNumber: number): void => {
  // Get all winners from completed matches in ALL previous rounds
  const allWinners: any[] = [];
  
  // Collect winners from all completed matches across all rounds
  this.state.rounds.forEach((round) => {
    if (round.roundNumber < roundNumber) {
      round.matches.forEach((match: any) => {
        if (this.state.closedMatches[match.id]) {
          const winner = this.state.closedMatches[match.id].winner;
          // Avoid duplicates
          if (!allWinners.find(w => w.id === winner.id)) {
            allWinners.push(winner);
          }
        }
      });
    }
  });

  // Combine winners with lobby players
  const availablePlayers = [...allWinners, ...this.state.lobbyPlayers];

  this.setState({
    showAssignPlayersModal: true,
    assignPlayersRound: roundNumber,
    availablePlayers,
    selectedPlayer1: null,
    selectedPlayer2: null
  });
};

// Close Assign Players Modal
private handleCloseAssignPlayersModal = (): void => {
  this.setState({
    showAssignPlayersModal: false,
    assignPlayersRound: null,
    availablePlayers: [],
    selectedPlayer1: null,
    selectedPlayer2: null
  });
};

// Select Player 1
private handleSelectPlayer1 = (player: any): void => {
  this.setState({ selectedPlayer1: player });
};

// Select Player 2
private handleSelectPlayer2 = (player: any): void => {
  this.setState({ selectedPlayer2: player });
};

// Clear Player Selection
private handleClearPlayer = (playerNumber: 1 | 2): void => {
  if (playerNumber === 1) {
    this.setState({ selectedPlayer1: null });
  } else {
    this.setState({ selectedPlayer2: null });
  }
};

// Create Match with Selected Players
private handleCreateMatch = (): void => {
  const { selectedPlayer1, selectedPlayer2, assignPlayersRound, rounds, availablePlayers } = this.state;

  if (!selectedPlayer1 || !selectedPlayer2) {
    this.showCustomAlert('Please select both players', 'warning');
    return;
  }

  if (selectedPlayer1.id === selectedPlayer2.id) {
    this.showCustomAlert('Cannot create a match with the same player', 'error');
    return;
  }

  // Create new match
  const newMatchId = Date.now();
  const newMatch = {
    id: newMatchId,
    round: assignPlayersRound,
    player1: selectedPlayer1,
    player2: selectedPlayer2,
    status: 'pending',
    startTime: null,
    endTime: null,
    winner: null,
    score: null
  };

  // Update rounds with new match
  const updatedRounds = rounds.map(round => {
    if (round.roundNumber === assignPlayersRound) {
      return {
        ...round,
        matches: [...round.matches, newMatch],
        matchCount: round.matches.length + 1,
        players: round.players + 2
      };
    }
    return round;
  });

  // Remove selected players from available players
  const updatedAvailablePlayers = availablePlayers.filter(
    p => p.id !== selectedPlayer1.id && p.id !== selectedPlayer2.id
  );

  // Remove from lobby if they were there
  const updatedLobbyPlayers = this.state.lobbyPlayers.filter(
    p => p.id !== selectedPlayer1.id && p.id !== selectedPlayer2.id
  );

  this.setState({
    rounds: updatedRounds,
    availablePlayers: updatedAvailablePlayers,
    lobbyPlayers: updatedLobbyPlayers,
    selectedPlayer1: null,
    selectedPlayer2: null
  });

  this.showCustomAlert('Match created successfully!', 'success');
};

// Move Winners to Lobby
private handleMoveWinnersToLobby = (selectedWinnerIds: number[]): void => {
  if (selectedWinnerIds.length === 0) {
    this.showCustomAlert('Please select at least one winner to move to lobby', 'warning');
    return;
  }

  // Get selected winners
  const selectedWinners = Object.values(this.state.closedMatches)
    .map(m => m.winner)
    .filter(w => selectedWinnerIds.includes(w.id));

  // Convert to lobby player format
  const lobbyPlayersToAdd: LobbyPlayer[] = selectedWinners.map(winner => ({
    ...winner,
    status: 'waiting',
    reason: 'moved_to_lobby',
    category: 'odd-winner' as const,
    fromRound: this.state.currentRound
  }));

  this.setState({
    lobbyPlayers: [...this.state.lobbyPlayers, ...lobbyPlayersToAdd]
  });

  this.showCustomAlert(`${selectedWinners.length} winner(s) moved to lobby`, 'success');
};

private handlePairPlayersToRound = async (roundNumber: number): Promise<void> => {
  const { selectedLobbyPlayers, lobbyPlayers } = this.state;
  
  if (selectedLobbyPlayers.length !== 2) {
    this.showCustomAlert('Please select exactly 2 players to create a match', 'warning');
    return;
  }
  
  const player1 = lobbyPlayers.find(p => p.id === selectedLobbyPlayers[0]);
  const player2 = lobbyPlayers.find(p => p.id === selectedLobbyPlayers[1]);
  
  if (!player1 || !player2) {
    this.showCustomAlert('Selected players not found', 'error');
    return;
  }
  
  try {
    const response = await tournamentApiService.createMatchFromLobby(
      player1.id,
      player2.id,
      roundNumber
    );
    
    if (response.success && response.data) {
      const newMatch = response.data.match;
      
      const updatedRounds = this.state.rounds.map(round => {
        if (round.roundNumber === roundNumber) {
          return {
            ...round,
            matches: [...round.matches, newMatch],
            matchCount: round.matchCount + 1
          };
        }
        return round;
      });
      
      const updatedLobbyPlayers = lobbyPlayers.filter(
        p => !selectedLobbyPlayers.includes(p.id)
      );
      
      this.setState({
        rounds: updatedRounds,
        lobbyPlayers: updatedLobbyPlayers,
        selectedLobbyPlayers: [],
        showLobbyModal: false
      });
      
      this.showCustomAlert('Match created successfully', 'success');
      console.log(`New match created in Round ${roundNumber}:`, newMatch);
    } else {
      console.error('Failed to create match:', response.message);
      this.showCustomAlert('Failed to create match. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error creating match:', error);
    this.showCustomAlert('Error creating match. Please try again.', 'error');
  }
};

  render() {
    if (this.state.loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tournament data...</p>
          </div>
        </div>
      );
    }

    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{this.state.error}</p>
            <button
              onClick={this.handleGoBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    if (!this.state.tournamentData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tournament Data</h2>
            <p className="text-gray-600 mb-4">Please start a tournament first.</p>
            <button
              onClick={this.handleGoBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    const { tournamentData } = this.state;
    const currentMatch = this.getCurrentMatch();
    const completedMatches = this.getCompletedMatches();
    const remainingMatches = this.getRemainingMatches();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={this.handleGoBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tournament Running</h1>
                  <p className="text-sm text-gray-600">{tournamentData.tournamentName}</p>
                  {this.state.selectedMatch && (
                    <p className="text-sm text-blue-600 mt-1">
                      Selected: Match #{this.state.selectedMatch.id} - {this.state.selectedMatch.player1.name} vs {this.state.selectedMatch.player2.name}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Tournament Controls */}
              <div className="flex items-center gap-3">
                {!this.state.isTournamentRunning ? (
                  <button
                    onClick={this.handleStartTournament}
                    disabled={!this.state.selectedMatch}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      this.state.selectedMatch
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    {this.state.selectedMatch ? 'Start Tournament' : 'Select a Match First'}
                  </button>
                ) : (
                  <button
                    onClick={this.handlePauseTournament}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={this.handleResetTournament}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                
                <button
                  onClick={this.handleShowLobby}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Lobby ({this.state.lobbyPlayers.length})
                </button>
                
                {/* Go to Next Round Button */}
                {this.state.isTournamentRunning && this.isCurrentRoundComplete() && (
                  <button
                    onClick={this.handleGoToNextRound}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Go to Next Round
                  </button>
                )}
                
                {/* Debug info for troubleshooting */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-2">
                    Debug: Tournament Running: {this.state.isTournamentRunning ? 'Yes' : 'No'}, 
                    Round Complete: {this.isCurrentRoundComplete() ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

           {/* Main Content */}
           <div className="max-w-7xl mx-auto px-6 py-8">
             {/* Tournament Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{tournamentData.totalPlayers}</div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{completedMatches.length}</div>
                <div className="text-sm text-gray-600">Completed Matches</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{remainingMatches.length}</div>
                <div className="text-sm text-gray-600">Remaining Matches</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">Round {this.state.currentRound}</div>
                <div className="text-sm text-gray-600">Current Round</div>
                <div className="text-xs text-gray-500 mt-1">
                  {this.getCurrentRoundMatches().length} matches
                </div>
              </div>
            </div>
            </div>


   {/* Current Match */}
   {this.state.selectedMatch && this.state.isTournamentRunning && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Match</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Match #{this.state.selectedMatch.id}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    IN PROGRESS
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-8">
                  {/* Player 1 */}
                  <div className="text-center">
                    <div className="relative mb-3">
                      <img
                        src={this.state.selectedMatch.player1.profilePic}
                        alt={this.state.selectedMatch.player1.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-blue-400 mx-auto"
                      />
                    </div>
                    <div className="font-semibold text-gray-900">{this.state.selectedMatch.player1.name}</div>
                    <div className="text-sm text-gray-600">Rank: {this.state.selectedMatch.player1.rank}</div>
                    <div className="text-sm text-gray-600">Rating: {this.state.selectedMatch.player1.rating}</div>
                    <button
                      onClick={() => this.handleMatchResult(this.state.selectedMatch.id, this.state.selectedMatch.player1)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Winner
                    </button>
                  </div>

                  {/* VS */}
                  <div className="text-2xl font-bold text-gray-400">VS</div>

                  {/* Player 2 */}
                  <div className="text-center">
                    <div className="relative mb-3">
                      <img
                        src={this.state.selectedMatch.player2.profilePic}
                        alt={this.state.selectedMatch.player2.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-gray-300 mx-auto"
                      />
                    </div>
                    <div className="font-semibold text-gray-900">{this.state.selectedMatch.player2.name}</div>
                    <div className="text-sm text-gray-600">Rank: {this.state.selectedMatch.player2.rank}</div>
                    <div className="text-sm text-gray-600">Rating: {this.state.selectedMatch.player2.rating}</div>
                    <button
                      onClick={() => this.handleMatchResult(this.state.selectedMatch.id, this.state.selectedMatch.player2)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Winner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}



           {/* Tournament Bracket with Round Tabs */}

           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tournament Bracket</h2>
              
              {/* Add Round Button */}
              <button
                onClick={this.handleShowAddRoundModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Round
              </button>
            </div>


            {/* Round Tabs */}
  {this.state.rounds.length > 0 ? (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      {this.state.rounds.map((round) => {
        const isCurrentRound = round.roundNumber === this.state.currentRound;
        const isRoundComplete = round.isCompleted || (isCurrentRound && this.isCurrentRoundComplete());
        
        return (
          <button
            key={round.roundNumber}
            onClick={() => this.handleTabChange(round.roundNumber)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors relative ${
              this.state.activeTab === round.roundNumber
                ? 'bg-white text-blue-600 shadow-sm'
                : isRoundComplete
                ? 'text-green-600 hover:text-green-700 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {round.roundTitle || `Round ${round.roundNumber}`}
            <div className="text-xs text-gray-500 mt-1">
              {round.players} players
            </div>
            {isRoundComplete && (
              <div className="absolute top-1 right-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  ) : (
    <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
      <p className="text-gray-600">Loading rounds...</p>
    </div>
  )}

  {/* Tab Content */}
  {this.state.rounds.length > 0 ? (
    <div className="space-y-4">
      {this.state.rounds.map((round) => (
        <div
          key={round.roundNumber}
          className={`${this.state.activeTab === round.roundNumber ? 'block' : 'hidden'}`}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {round.roundTitle || `Round ${round.roundNumber}`} - {round.matchCount} Matches
            </h3>
            <p className="text-sm text-gray-600">
              {round.roundDescription || (round.roundNumber === 1 
                ? 'Initial matches with all registered players'
                : `Matches between winners from Round ${round.roundNumber - 1}`
              )}
            </p>
            {round.roundComments && (
              <p className="text-sm text-gray-500 mt-2 italic">
                "{round.roundComments}"
              </p>
            )}
            
            {/* Round Completion Status */}
            {round.roundNumber === this.state.currentRound && this.isCurrentRoundComplete() && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">Round {round.roundNumber} Complete!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  All matches finished. Click "Go to Next Round" to proceed.
                </p>
              </div>
            )}
          </div>

          {/* Assign Players Button - Show only if round has no matches */}
          {round.matches.length === 0 && round.roundNumber > 1 && (
            <div className="mb-6">
              <button
                onClick={() => this.handleShowAssignPlayersModal(round.roundNumber)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Assign Players to Matches
              </button>
            </div>
          )}

          {/* Show winners if they exist and matches haven't been created yet */}
          {round.winners.length > 0 && round.matches.length === 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-800">
                  Winners from Round {round.roundNumber - 1} ({round.winners.length} players)
                </h4>
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500">
                    Debug: isShuffled={round.isShuffled ? 'true' : 'false'}, matches={round.matches.length}
                  </div>
                )}
                {!round.isShuffled && (
                  <button
                    onClick={() => {
                      console.log('Shuffle button clicked for round:', round.roundNumber);
                      this.shuffleWinners(round.roundNumber);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Shuffle Winners
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {round.winners.map((winner: any, index: number) => (
                  <div key={winner.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <img
                        src={winner.profilePic}
                        alt={winner.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-400 mx-auto mb-2"
                      />
                      <h5 className="font-semibold text-gray-900 text-sm">{winner.name}</h5>
                      <p className="text-xs text-gray-600">Rank: {winner.rank}</p>
                      <p className="text-xs text-gray-600">Rating: {winner.rating}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Winner #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show shuffle button if winners are shuffled but no matches yet */}
          {round.winners.length > 0 && round.matches.length === 0 && round.isShuffled && (
            <div className="mb-6 text-center">
              <button
                onClick={() => {
                  console.log('Shuffle Again button clicked for round:', round.roundNumber);
                  this.shuffleWinners(round.roundNumber);
                }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Shuffle Again
              </button>
            </div>
          )}

          {round.matches.length > 0 ? (
            <div className="space-y-4">
             {round.matches.map((match: any, index: number) => {
  const isCompleted = this.state.matchResults[match.id];
  const isCurrent = round.roundNumber === this.state.currentRound && 
                   index === this.state.currentMatchIndex && 
                   this.state.isTournamentRunning;
  
  const isSelected = this.state.selectedMatch?.id === match.id;
  const isClosed = this.state.closedMatches[match.id];
  const isActiveMatch = this.state.activeMatch?.id === match.id;
  const showStartMatchButton = !this.state.activeMatch && !isClosed;
  
  // Generate friendly display number based on position
  const matchDisplayNumber = index + 1;

  return (
    <div
      key={match.id}
      className={`p-4 rounded-lg border-2 transition-all ${
        isClosed
          ? 'border-green-500 bg-green-50 shadow-md'
          : isActiveMatch
          ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg animate-pulse ring-2 ring-red-200 shadow-red-200'
          : isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : isCurrent 
          ? 'border-green-400 bg-green-50' 
          : isCompleted 
          ? 'border-gray-300 bg-gray-50' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">Match #{matchDisplayNumber}</h4>
          {isClosed && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              CLOSED
            </span>
          )}
          {isActiveMatch && !isClosed && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium animate-pulse">
              LIVE
            </span>
          )}
          {isSelected && !isActiveMatch && !isClosed && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              SELECTED
            </span>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isClosed
            ? 'bg-green-100 text-green-800'
            : isActiveMatch
            ? 'bg-red-100 text-red-800'
            : isCurrent
            ? 'bg-green-100 text-green-800'
            : isCompleted
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {isClosed ? 'CLOSED' : isActiveMatch ? 'LIVE' : isCurrent ? 'IN PROGRESS' : isCompleted ? 'COMPLETED' : 'PENDING'}
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-8 mb-4">
        {/* Player 1 */}
        <div className="text-center">
          <img
            src={match.player1.profilePic}
            alt={match.player1.name}
            className={`w-12 h-12 rounded-full object-cover border-2 mx-auto mb-2 ${
              isClosed && this.state.closedMatches[match.id]?.winner.id === match.player1.id
                ? 'border-green-400'
                : isCompleted && this.state.matchResults[match.id]?.id === match.player1.id
                ? 'border-green-400'
                : 'border-gray-300'
            }`}
          />
          <div className={`font-medium ${
            isClosed && this.state.closedMatches[match.id]?.winner.id === match.player1.id
              ? 'text-green-900'
              : 'text-gray-900'
          }`}>{match.player1.name}</div>
          <div className="text-sm text-gray-600">Rank: {match.player1.rank}</div>
          {isClosed && this.state.closedMatches[match.id]?.winner.id === match.player1.id && (
            <div className="text-green-600 font-semibold text-sm">WINNER</div>
          )}
          {isCompleted && this.state.matchResults[match.id]?.id === match.player1.id && (
            <div className="text-green-600 font-semibold text-sm">WINNER</div>
          )}
        </div>

        {/* VS */}
        <div className="text-lg font-bold text-gray-400">VS</div>

        {/* Player 2 */}
        <div className="text-center">
          <img
            src={match.player2.profilePic}
            alt={match.player2.name}
            className={`w-12 h-12 rounded-full object-cover border-2 mx-auto mb-2 ${
              isClosed && this.state.closedMatches[match.id]?.winner.id === match.player2.id
                ? 'border-green-400'
                : isCompleted && this.state.matchResults[match.id]?.id === match.player2.id
                ? 'border-green-400'
                : 'border-gray-300'
            }`}
          />
          <div className={`font-medium ${
            isClosed && this.state.closedMatches[match.id]?.winner.id === match.player2.id
              ? 'text-green-900'
              : 'text-gray-900'
          }`}>{match.player2.name}</div>
          <div className="text-sm text-gray-600">Rank: {match.player2.rank}</div>
          {isClosed && this.state.closedMatches[match.id]?.winner.id === match.player2.id && (
            <div className="text-green-600 font-semibold text-sm">WINNER</div>
          )}
          {isCompleted && this.state.matchResults[match.id]?.id === match.player2.id && (
            <div className="text-green-600 font-semibold text-sm">WINNER</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        {isClosed ? (
          <div className="text-center">
            <div className="text-green-600 font-semibold text-sm mb-1">Match Closed</div>
            <div className="text-xs text-gray-500">
              Winner: {this.state.closedMatches[match.id]?.winner.name}
            </div>
          </div>
        ) : isActiveMatch ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              this.handleCloseMatch();
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Close Match
          </button>
        ) : (
          <>
            {showStartMatchButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  this.handleStartMatch(match);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Match
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                this.handleCancelMatch(match);
              }}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors"
            >
              Cancel Match
            </button>
          </>
        )}
      </div>
    </div>
  );
})}


            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏆</div>
              <p>Round {round.roundNumber} matches will be created when Round {round.roundNumber - 1} is completed</p>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8 text-gray-500">
      <div className="text-4xl mb-2">🏆</div>
      <p>No rounds available</p>
    </div>
  )}

        {/* Winner Selection Modal */}
        {this.state.showWinnerModal && this.state.winnerModalMatch && !this.state.showWinnerConfirmation && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Winner</h2>
        <p className="text-gray-600 mb-6">
          Match #{this.state.winnerModalMatch.id}
        </p>
        
        <div className="space-y-4">
          {/* Player 1 Option */}
          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all">
          <button
  onClick={() => this.handleSelectWinner(this.state.winnerModalMatch.player1)}
  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group mb-3"
>
  <div className="flex items-center space-x-4">
    <img
      src={this.state.winnerModalMatch.player1.profilePic}
      alt={this.state.winnerModalMatch.player1.name}
      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 group-hover:border-blue-500"
    />
    <div className="text-left">
      <div className="font-semibold text-gray-900 group-hover:text-blue-900">
        {this.state.winnerModalMatch.player1.name}
      </div>
      <div className="text-sm text-gray-600">
        Rank: {this.state.winnerModalMatch.player1.rank}
      </div>
    </div>
  </div>
</button>
            
            {/* Player 1 Comment Textarea */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Comments for {this.state.winnerModalMatch.player1.name} (Optional)
              </label>
              <textarea
                value={this.state.playerComments.player1Comment}
                onChange={(e) => this.handlePlayerCommentChange('player1', e.target.value)}
                rows={3}
                placeholder="Add notes about this player's performance..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-200 h-px flex-1"></div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">VS</span>
            <div className="bg-gray-200 h-px flex-1"></div>
          </div>

          {/* Player 2 Option */}
          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all">
          <button
  onClick={() => this.handleSelectWinner(this.state.winnerModalMatch.player2)}
  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group mb-3"
>
  <div className="flex items-center space-x-4">
    <img
      src={this.state.winnerModalMatch.player2.profilePic}
      alt={this.state.winnerModalMatch.player2.name}
      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 group-hover:border-blue-500"
    />
    <div className="text-left">
      <div className="font-semibold text-gray-900 group-hover:text-blue-900">
        {this.state.winnerModalMatch.player2.name}
      </div>
      <div className="text-sm text-gray-600">
        Rank: {this.state.winnerModalMatch.player2.rank}
      </div>
    </div>
  </div>
</button>
            
            {/* Player 2 Comment Textarea */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Comments for {this.state.winnerModalMatch.player2.name} (Optional)
              </label>
              <textarea
                value={this.state.playerComments.player2Comment}
                onChange={(e) => this.handlePlayerCommentChange('player2', e.target.value)}
                rows={3}
                placeholder="Add notes about this player's performance..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={this.handleCloseWinnerModal}
          className="mt-6 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

        {/* Winner Confirmation Modal */}
        {this.state.showWinnerConfirmation && this.state.selectedWinner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Winner</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to select <strong>{this.state.selectedWinner.name}</strong> as the winner?
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={this.state.selectedWinner.profilePic}
                      alt={this.state.selectedWinner.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {this.state.selectedWinner.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rank: {this.state.selectedWinner.rank} | Rating: {this.state.selectedWinner.rating}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={this.handleCancelWinnerSelection}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={this.handleConfirmWinner}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirm Winner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lobby Modal */}
        {/* Lobby Modal - Enhanced with Pairing */}
{/* Lobby Modal with Tabs */}
{this.state.showLobbyModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl w-full mx-4 max-h-[85vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tournament Lobby</h2>
          {this.state.selectedLobbyPlayers.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {this.state.selectedLobbyPlayers.length} player(s) selected
            </p>
          )}
        </div>
        <button
          onClick={this.handleCloseLobby}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => this.setState({ lobbyActiveTab: 'all' })}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            this.state.lobbyActiveTab === 'all'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Players ({this.state.lobbyPlayers.length})
        </button>
        <button
          onClick={() => this.setState({ lobbyActiveTab: 'never-played' })}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            this.state.lobbyActiveTab === 'never-played'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Never Played ({this.state.lobbyPlayers.filter(p => p.category === 'never-played').length})
        </button>
        <button
          onClick={() => this.setState({ lobbyActiveTab: 'odd-winners' })}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            this.state.lobbyActiveTab === 'odd-winners'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Odd Winners ({this.state.lobbyPlayers.filter(p => p.category === 'odd-winner').length})
        </button>
        <button
          onClick={() => this.setState({ lobbyActiveTab: 'cancelled' })}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            this.state.lobbyActiveTab === 'cancelled'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cancelled ({this.state.lobbyPlayers.filter(p => p.category === 'cancelled').length})
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        {this.state.lobbyActiveTab === 'all' && (
          <p className="text-sm text-blue-800">All players currently in the lobby. Select 2 to create a match.</p>
        )}
        {this.state.lobbyActiveTab === 'never-played' && (
          <p className="text-sm text-blue-800">Players who haven't played any match yet.</p>
        )}
        {this.state.lobbyActiveTab === 'odd-winners' && (
          <p className="text-sm text-blue-800">Winners from previous rounds waiting to be paired (odd number of winners after shuffle).</p>
        )}
        {this.state.lobbyActiveTab === 'cancelled' && (
          <p className="text-sm text-blue-800">Players from cancelled matches who have already played at least one match.</p>
        )}
      </div>

      {(() => {
        let filteredPlayers = this.state.lobbyPlayers;
        
        if (this.state.lobbyActiveTab === 'never-played') {
          filteredPlayers = this.state.lobbyPlayers.filter(p => p.category === 'never-played');
        } else if (this.state.lobbyActiveTab === 'odd-winners') {
          filteredPlayers = this.state.lobbyPlayers.filter(p => p.category === 'odd-winner');
        } else if (this.state.lobbyActiveTab === 'cancelled') {
          filteredPlayers = this.state.lobbyPlayers.filter(p => p.category === 'cancelled');
        }

        return filteredPlayers.length > 0 ? (
          <>
            {this.state.selectedLobbyPlayers.length === 2 && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Create Match with Selected Players</h3>
                <div className="flex items-center gap-4">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        this.handlePairPlayersToRound(parseInt(e.target.value));
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Select Round to Add Match...</option>
                    {this.state.rounds.map((round: any) => (
                      <option key={round.roundNumber} value={round.roundNumber}>
                        Add to Round {round.roundNumber} ({round.matches.length} matches)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => this.setState({ selectedLobbyPlayers: [] })}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map((player: any) => {
                const isSelected = this.state.selectedLobbyPlayers.includes(player.id);
                
                return (
                  <div 
                    key={player.id} 
                    className={`bg-gray-50 p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => this.handleToggleLobbyPlayerSelection(player.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src={player.profilePic}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{player.name}</h4>
                          <p className="text-sm text-gray-600">Rank: {player.rank}</p>
                          {player.fromRound && (
                            <p className="text-xs text-blue-600 font-medium">
                              From Round {player.fromRound}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        player.category === 'never-played' ? 'bg-gray-200 text-gray-700' :
                        player.category === 'odd-winner' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {player.category === 'never-played' ? 'Never Played' :
                         player.category === 'odd-winner' ? 'Odd Winner' :
                         'From Cancelled Match'}
                      </span>
                    </div>

                    {player.reason && (
                      <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                        <p className="text-orange-800 font-medium mb-1">Cancellation Reason:</p>
                        <p className="text-orange-700">{player.reason}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            this.handleMovePlayerToRound(player.id, parseInt(e.target.value));
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Move to Round...</option>
                        {this.state.rounds.map((round: any) => (
                          <option key={round.roundNumber} value={round.roundNumber}>
                            Round {round.roundNumber}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => this.handleRemovePlayer(player.id)}
                        className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        Remove from Tournament
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏆</div>
            <p>No players in this category</p>
          </div>
        );
      })()}
    </div>
  </div>
)}


        {/* Cancel Match Modal */}
        {this.state.showCancelMatchModal && this.state.cancelMatchData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Match</h2>
                <p className="text-gray-600 mb-6">
                  Match #{this.state.cancelMatchData.id}: {this.state.cancelMatchData.player1.name} vs {this.state.cancelMatchData.player2.name}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Message:
                    </label>
                    <textarea
                      id="cancelMatchTextarea"
                      value={this.state.cancelMessage}
                      onChange={(e) => this.handleCancelMessageChange(e.target.value)}
                      rows={4}
                      placeholder="Enter detailed reason for cancellation... (e.g., Due to Suresh Rao, match is cancelled. He is feeling not well)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This message will be visible in the tournament lobby
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={this.handleCloseCancelMatchModal}
                      className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        this.handleConfirmCancelMatch(this.state.cancelMessage.trim());
                        /*if (this.state.cancelMessage.trim()) {
                          this.handleConfirmCancelMatch(this.state.cancelMessage.trim());
                        } 
                        else {
                          this.showCustomAlert('Please enter a cancellation message', 'warning');
                        }*/
                      }}
                      className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors"
                    >
                      Confirm Cancellation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Round Configuration Modal */}
        {this.state.showRoundConfigModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Configure Next Round</h2>
                <button
                  onClick={this.handleCloseRoundConfigModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Title
                  </label>
                  <input
                    type="text"
                    value={this.state.roundConfigData.roundTitle}
                    onChange={(e) => this.handleRoundConfigChange('roundTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Quarter Finals, Semi Finals, Finals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Description
                  </label>
                  <textarea
                    id="roundDescriptionTextarea"
                    value={this.state.roundConfigData.roundDescription}
                    onChange={(e) => this.handleRoundConfigChange('roundDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe this round (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    id="roundCommentsTextarea"
                    value={this.state.roundConfigData.roundComments}
                    onChange={(e) => this.handleRoundConfigChange('roundComments', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Any additional comments or notes (optional)"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={this.handleCloseRoundConfigModal}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={this.handleConfirmRoundConfig}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Proceed to Next Round
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Alert Modal */}
{/* Custom Alert Modal */}
{/* Custom Alert Modal */}
{this.state.showAlert && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          this.state.alertType === 'success' ? 'bg-green-100' :
          this.state.alertType === 'error' ? 'bg-red-100' :
          this.state.alertType === 'warning' ? 'bg-yellow-100' :
          'bg-blue-100'
        }`}>
          {this.state.alertType === 'success' && (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {this.state.alertType === 'error' && (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {this.state.alertType === 'warning' && (
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {this.state.alertType === 'info' && (
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <p className="text-gray-800 text-lg mb-6">
          {this.state.alertMessage}
        </p>

        <button
          onClick={this.closeAlert}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            this.state.alertType === 'success' ? 'bg-green-600 hover:bg-green-700' :
            this.state.alertType === 'error' ? 'bg-red-600 hover:bg-red-700' :
            this.state.alertType === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
            'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

        {/* Add Round Modal */}
        {this.state.showAddRoundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Round</h2>
                <button
                  onClick={this.handleCloseAddRoundModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Name
                  </label>
                  <input
                    type="text"
                    value={this.state.newRoundName}
                    onChange={(e) => this.handleRoundNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Quarter Finals, Semi Finals, Finals"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={this.handleCloseAddRoundModal}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={this.handleAddRound}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Round
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Players Modal */}
        {this.state.showAssignPlayersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Assign Players - Round {this.state.assignPlayersRound}
                </h2>
                <button
                  onClick={this.handleCloseAssignPlayersModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Players */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Available Players ({this.state.availablePlayers.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {this.state.availablePlayers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No available players</p>
                    ) : (
                      this.state.availablePlayers.map((player) => {
                        const isSelected = 
                          this.state.selectedPlayer1?.id === player.id || 
                          this.state.selectedPlayer2?.id === player.id;
                        
                        return (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={player.profilePic}
                                alt={player.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-semibold text-gray-900">{player.name}</p>
                                <p className="text-xs text-gray-600">
                                  Rank: {player.rank} | Rating: {player.rating}
                                </p>
                              </div>
                            </div>
                            {!isSelected && (
                              <button
                                onClick={() => {
                                  if (!this.state.selectedPlayer1) {
                                    this.handleSelectPlayer1(player);
                                  } else if (!this.state.selectedPlayer2) {
                                    this.handleSelectPlayer2(player);
                                  }
                                }}
                                disabled={this.state.selectedPlayer1 && this.state.selectedPlayer2}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                Select
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Selected Players for Match */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Players for Match
                  </h3>
                  <div className="space-y-4">
                    {/* Player 1 */}
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <h4 className="font-medium text-gray-700 mb-2">Player 1</h4>
                      {this.state.selectedPlayer1 ? (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <img
                              src={this.state.selectedPlayer1.profilePic}
                              alt={this.state.selectedPlayer1.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{this.state.selectedPlayer1.name}</p>
                              <p className="text-xs text-gray-600">
                                Rank: {this.state.selectedPlayer1.rank} | Rating: {this.state.selectedPlayer1.rating}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => this.handleClearPlayer(1)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">No player selected</p>
                      )}
                    </div>

                    {/* Player 2 */}
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <h4 className="font-medium text-gray-700 mb-2">Player 2</h4>
                      {this.state.selectedPlayer2 ? (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <img
                              src={this.state.selectedPlayer2.profilePic}
                              alt={this.state.selectedPlayer2.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{this.state.selectedPlayer2.name}</p>
                              <p className="text-xs text-gray-600">
                                Rank: {this.state.selectedPlayer2.rank} | Rating: {this.state.selectedPlayer2.rating}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => this.handleClearPlayer(2)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">No player selected</p>
                      )}
                    </div>

                    {/* Create Match Button */}
                    <button
                      onClick={this.handleCreateMatch}
                      disabled={!this.state.selectedPlayer1 || !this.state.selectedPlayer2}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      Create Match
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={this.handleCloseAssignPlayersModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
        </div>
      </div>
    );
  }
}
