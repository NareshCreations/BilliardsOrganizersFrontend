import tournamentData from '../data/tournament-data.json';
import startMatchResponse from '../data/api-responses/start-match.json';
import matchResultResponse from '../data/api-responses/match-result.json';
import roundCompletionResponse from '../data/api-responses/round-completion.json';
import tournamentStatusResponse from '../data/api-responses/tournament-status.json';
import pauseTournamentResponse from '../data/api-responses/pause-tournament.json';
import resetTournamentResponse from '../data/api-responses/reset-tournament.json';
import shuffleWinnersResponse from '../data/api-responses/shuffle-winners.json';

export interface TournamentData {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  tournamentTime: string;
  totalPlayers: number;
  totalRounds: number;
  currentRound: number;
  status: string;
  matches: Match[];
  rounds: Round[];
  matchResults: { [matchId: number]: any };
  roundWinners: { [round: number]: any[] };
  closedMatches: { [matchId: number]: any };
  tournamentStats: TournamentStats;
  lobbyPlayers: LobbyPlayer[];
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
}

export interface Match {
  id: number | string;  // Support both number and string IDs
  round: number;
  player1: Player;
  player2: Player;
  status: string;
  startTime: string | null;
  endTime: string | null;
  winner: Player | null;
  score: string | null;
}

export interface Player {
  id: number;
  name: string;
  rank: number;
  rating: number;
  profilePic: string;
  skillLevel: string;
  matchesPlayed?: number;
  matchesWon?: number;
  winRate?: number;
}

export interface Round {
  roundNumber: number;
  matchCount: number;
  players: number;
  isCompleted: boolean;
  matches: Match[];
  winners: Player[];
  isShuffled: boolean;
}

export interface TournamentStats {
  totalMatches: number;
  completedMatches: number;
  remainingMatches: number;
  averageMatchDuration: string;
  longestMatch: string;
  shortestMatch: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

class TournamentApiService {
  private baseUrl = '/api/tournament';
  private matchCounter = 0;

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get initial tournament data
  async getTournamentData(tournamentId: string): Promise<ApiResponse<TournamentData>> {
    await this.delay(300);
    
    return {
      success: true,
      message: 'Tournament data retrieved successfully',
      data: tournamentData as TournamentData,
      timestamp: new Date().toISOString()
    };
  }

  // Start a match
  async startMatch(matchId: number | string): Promise<ApiResponse<any>> {
    await this.delay(400);
    
    const response = { ...startMatchResponse };
    response.data.matchId = matchId;
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Record match result (winner selection)
  async recordMatchResult(matchId: number | string, winnerId: number, comments?: any): Promise<ApiResponse<any>> {
    await this.delay(600);
    
    const response = { ...matchResultResponse };
    response.data.matchId = matchId;
    response.data.winner.id = winnerId;
    if (comments) {
      response.data.comments = comments;
    }
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Complete a round and progress to next
  async completeRound(roundNumber: number): Promise<ApiResponse<any>> {
    await this.delay(800);
    
    const response = { ...roundCompletionResponse };
    response.data.completedRound = roundNumber;
    response.data.nextRound = roundNumber + 1;
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Progress to next round (alias for completeRound)
  async progressToNextRound(roundNumber: number): Promise<ApiResponse<any>> {
    return this.completeRound(roundNumber);
  }

  // Get current tournament status
  async getTournamentStatus(tournamentId: string): Promise<ApiResponse<any>> {
    await this.delay(200);
    
    const response = { ...tournamentStatusResponse };
    response.data.tournamentId = tournamentId;
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Pause tournament
  async pauseTournament(tournamentId: string): Promise<ApiResponse<any>> {
    await this.delay(300);
    
    const response = { ...pauseTournamentResponse };
    response.data.tournamentId = tournamentId;
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Reset tournament
  async resetTournament(tournamentId: string): Promise<ApiResponse<any>> {
    await this.delay(500);
    
    const response = { ...resetTournamentResponse };
    response.data.tournamentId = tournamentId;
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Resume tournament
  async resumeTournament(tournamentId: string): Promise<ApiResponse<any>> {
    await this.delay(300);
    
    const response = { ...tournamentStatusResponse };
    response.data.tournamentId = tournamentId;
    response.data.status = 'running';
    response.timestamp = new Date().toISOString();
    
    return response;
  }

  // Get match details
  async getMatchDetails(matchId: number | string): Promise<ApiResponse<Match>> {
    await this.delay(250);
    
    const match = tournamentData.matches.find(m => m.id == matchId);
    
    return {
      success: true,
      message: 'Match details retrieved successfully',
      data: match as Match,
      timestamp: new Date().toISOString()
    };
  }

  // Get player details
  async getPlayerDetails(playerId: number): Promise<ApiResponse<Player>> {
    await this.delay(200);
    
    let player: Player | undefined;
    for (const match of tournamentData.matches) {
      if (match.player1.id === playerId) {
        player = match.player1;
        break;
      }
      if (match.player2.id === playerId) {
        player = match.player2;
        break;
      }
    }
    
    return {
      success: true,
      message: 'Player details retrieved successfully',
      data: player as Player,
      timestamp: new Date().toISOString()
    };
  }

  // Get tournament statistics
  async getTournamentStats(tournamentId: string): Promise<ApiResponse<TournamentStats>> {
    await this.delay(300);
    
    return {
      success: true,
      message: 'Tournament statistics retrieved successfully',
      data: tournamentData.tournamentStats,
      timestamp: new Date().toISOString()
    };
  }

  // Shuffle winners for a specific round
  async shuffleWinners(roundNumber: number): Promise<ApiResponse<any>> {
    await this.delay(400);
    
    console.log('=== SHUFFLE WINNERS DEBUG ===');
    console.log('Round number:', roundNumber);
    
    // Find the PREVIOUS round (the one that just completed)
    const previousRoundNumber = roundNumber - 1;
    const previousRound = tournamentData.rounds.find(r => r.roundNumber === previousRoundNumber);
    
    if (!previousRound) {
      console.error('Previous round not found');
      return {
        success: false,
        message: 'Previous round not found',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  
    console.log('Previous round matches:', previousRound.matches.length);
  
    // Collect winners from completed matches in the previous round
    const winners: Player[] = [];
    
    for (const match of previousRound.matches) {
      if (match.winner) {
        winners.push(match.winner);
        console.log('Found winner:', match.winner.name);
      }
    }
  
    console.log('Total winners collected:', winners.length);
  
    if (winners.length === 0) {
      return {
        success: false,
        message: 'No winners found in previous round',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  
    // Shuffle the winners
    const shuffled = [...winners].sort(() => Math.random() - 0.5);
    console.log('Shuffled winners:', shuffled.map(w => w.name));
    
    // Create matches from pairs
    const newMatches: Match[] = [];
    let oddPlayer = null;
  
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
      
      console.log(`Created match: ${shuffled[i].name} vs ${shuffled[i + 1].name}`);
    }
  
    // Handle odd player
    if (shuffled.length % 2 !== 0) {
      oddPlayer = {
        ...shuffled[shuffled.length - 1],
        status: 'waiting',
        reason: 'Odd winner - waiting for next pairing',
        fromRound: previousRoundNumber,
        category: 'odd-winner'
      };
      console.log('Odd player:', oddPlayer.name);
    }
  
    console.log('=== SHUFFLE COMPLETE ===');
    console.log('New matches:', newMatches.length);
    console.log('Odd player:', oddPlayer ? oddPlayer.name : 'none');
  
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

  // Get lobby players
  async getLobbyPlayers(): Promise<ApiResponse<LobbyPlayer[]>> {
    await this.delay(200);
    
    return {
      success: true,
      message: 'Lobby players retrieved successfully',
      data: tournamentData.lobbyPlayers || [],
      timestamp: new Date().toISOString()
    };
  }

  // Cancel a match and move players to lobby
  async cancelMatch(matchData: Match | number | string, reason: string): Promise<ApiResponse<any>> {
    await this.delay(300);
    
    console.log('=== CANCEL MATCH DEBUG ===');
    
    let match: Match | undefined;
    let matchId: number | string;
    
    // If full match object is passed, use it directly
    if (typeof matchData === 'object' && matchData !== null) {
      match = matchData;
      matchId = match.id;
      console.log('Match object provided directly:', matchId);
      
      // Ensure match exists in tournamentData.matches
      const existingMatch = tournamentData.matches.find(m => String(m.id) === String(matchId));
      if (!existingMatch) {
        console.log('Match not in tournamentData, adding it back temporarily');
        tournamentData.matches.push(match);
      }
    } else {
      // If only ID is passed, try to find it
      matchId = matchData;
      console.log('Trying to cancel match ID:', matchId);
      match = tournamentData.matches.find(m => String(m.id) === String(matchId));
    }
    
    console.log('Available matches:', tournamentData.matches.map(m => m.id));
    
    if (!match) {
      console.error('❌ Match not found!');
      return {
        success: false,
        message: `Match not found. It may have already been cancelled.`,
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  
    console.log('✅ Found and cancelling match:', match.id);
  
    const lobbyPlayer1: LobbyPlayer = {
      ...match.player1,
      status: 'waiting',
      reason: reason,
      fromRound: match.round,
      category: match.player1.matchesPlayed && match.player1.matchesPlayed > 0 ? 'cancelled' : 'never-played'  // ADD THIS LINE
    };
    
    const lobbyPlayer2: LobbyPlayer = {
      ...match.player2,
      status: 'waiting',
      reason: reason,
      fromRound: match.round,
      category: match.player2.matchesPlayed && match.player2.matchesPlayed > 0 ? 'cancelled' : 'never-played'  // ADD THIS LINE
    };
  
    if (!tournamentData.lobbyPlayers) {
      tournamentData.lobbyPlayers = [];
    }
    
    if (!tournamentData.lobbyPlayers.find(p => p.id === lobbyPlayer1.id)) {
      tournamentData.lobbyPlayers.push(lobbyPlayer1);
    }
    if (!tournamentData.lobbyPlayers.find(p => p.id === lobbyPlayer2.id)) {
      tournamentData.lobbyPlayers.push(lobbyPlayer2);
    }
  
    const beforeCount = tournamentData.matches.length;
    tournamentData.matches = tournamentData.matches.filter(m => String(m.id) !== String(matchId));
    const afterCount = tournamentData.matches.length;
  
    console.log(`Matches removed: ${beforeCount} → ${afterCount}`);
    console.log('Lobby now has:', tournamentData.lobbyPlayers.length, 'players');
    console.log('=== END CANCEL DEBUG ===');
  
    return {
      success: true,
      message: 'Match cancelled successfully',
      data: {
        matchId,
        cancelledPlayers: [lobbyPlayer1, lobbyPlayer2],
        reason
      },
      timestamp: new Date().toISOString()
    };
  }

  // Move player from lobby to a specific round
  async movePlayerToRound(playerId: number, roundNumber: number): Promise<ApiResponse<any>> {
    await this.delay(300);
    
    const lobbyPlayer = tournamentData.lobbyPlayers?.find(p => p.id === playerId);
    if (!lobbyPlayer) {
      return {
        success: false,
        message: 'Player not found in lobby',
        data: null,
        timestamp: new Date().toISOString()
      };
    }

    tournamentData.lobbyPlayers = tournamentData.lobbyPlayers.filter(p => p.id !== playerId);

    this.matchCounter++;
    const newMatchId = `${tournamentData.tournamentId}-R${roundNumber}-M${Date.now()}-${this.matchCounter}`;
    
    const newMatch: Match = {
      id: newMatchId,
      round: roundNumber,
      player1: lobbyPlayer,
      player2: lobbyPlayer,
      status: 'pending',
      startTime: null,
      endTime: null,
      winner: null,
      score: null
    };

    tournamentData.matches.push(newMatch);

    return {
      success: true,
      message: 'Player moved to round successfully',
      data: {
        playerId,
        roundNumber,
        newMatchId
      },
      timestamp: new Date().toISOString()
    };
  }

  // Remove player from tournament (permanent exit)
  async removePlayerFromTournament(playerId: number): Promise<ApiResponse<any>> {
    await this.delay(300);
    
    if (tournamentData.lobbyPlayers) {
      tournamentData.lobbyPlayers = tournamentData.lobbyPlayers.filter(p => p.id !== playerId);
    }

    tournamentData.matches = tournamentData.matches.filter(m => 
      m.player1.id !== playerId && m.player2.id !== playerId
    );

    return {
      success: true,
      message: 'Player removed from tournament successfully',
      data: { playerId },
      timestamp: new Date().toISOString()
    };
  }

  // Create match from lobby players
  async createMatchFromLobby(player1Id: number, player2Id: number, roundNumber: number): Promise<ApiResponse<any>> {
    await this.delay(300);
    
    const player1 = tournamentData.lobbyPlayers?.find((p: any) => p.id === player1Id);
    const player2 = tournamentData.lobbyPlayers?.find((p: any) => p.id === player2Id);
    
    if (!player1 || !player2) {
      return {
        success: false,
        message: 'One or both players not found in lobby',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
    
    this.matchCounter++;
    const newMatchId = `${tournamentData.tournamentId}-R${roundNumber}-M${Date.now()}-${this.matchCounter}`;
    
    console.log('Creating match with ID:', newMatchId);
    
    const newMatch: Match = {
      id: newMatchId,
      round: roundNumber,
      player1: player1,
      player2: player2,
      status: 'pending',
      startTime: null,
      endTime: null,
      winner: null,
      score: null
    };
    
    tournamentData.matches.push(newMatch);
    
    tournamentData.lobbyPlayers = tournamentData.lobbyPlayers?.filter(
      p => p.id !== player1Id && p.id !== player2Id
    ) || [];
    
    return {
      success: true,
      data: { match: newMatch },
      message: 'Match created successfully',
      timestamp: new Date().toISOString()
    };
  }
}
export const tournamentApiService = new TournamentApiService();
