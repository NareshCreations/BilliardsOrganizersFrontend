// API service for matches data
import { makeAuthenticatedRequest } from './api';
export interface Match {
  id: number;
  name: string;
  gameType: string;
  organizerName?: string;
  organizerDescription?: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  players: number;
  maxPlayers: number;
  entryFee: number;
  venue: string;
  location?: {
    id: number;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    amenities: string[];
  };
  ballRules: string;
  conductedBy?: string;
  conductedByProfile?: {
    name: string;
    profilePic?: string;
    logo?: string;
    position: string;
    skillLevel: string;
    email: string;
    contact: string;
    website: string;
    organization: string;
    experience: string;
    description: string;
  };
  topPlayers?: {
    winner: any;
    runnerUp: any;
    thirdPlace: any;
    fourthPlace: any;
  };
  allPlayers?: any[];
  tournamentBracket?: {
    round1: any[];
    round2: any[];
    semifinals: any[];
  };
  registeredPlayers?: any[];
  notifiedUsers?: any;
}

export interface MatchesResponse {
  matches: Match[];
}

// Tournament API interfaces
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  startDate?: string;
  endDate?: string;
  venue?: string;
  address?: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  gameType?: string;
  rules?: string;
  prizeStructure?: {
    first: number;
    second: number;
    third: number;
    [key: string]: number;
  };
  settings?: {
    allowLateRegistration: boolean;
    requirePayment: boolean;
    allowSpectators: boolean;
    [key: string]: any;
  };
  metadata?: {
    tags: string[];
    difficulty: string;
    ageGroup: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TournamentResponse {
  success: boolean;
  message: string;
  data: {
    tournaments: Tournament[];
    count: number;
    organizerId: string;
  };
}

class MatchesApiService {
  private baseUrl = '/api/matches';
  // Default to port 3005 as per Postman collection, but allow override via env variable
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch scheduled matches
  async getScheduledMatches(): Promise<MatchesResponse> {
    await this.delay(300);
    const response = await fetch('/src/data/scheduled-matches.json');
    if (!response.ok) {
      throw new Error('Failed to fetch scheduled matches');
    }
    return response.json();
  }

  // Fetch previous matches
  async getPreviousMatches(): Promise<MatchesResponse> {
    await this.delay(300);
    const response = await fetch('/src/data/previous-matches.json');
    if (!response.ok) {
      throw new Error('Failed to fetch previous matches');
    }
    return response.json();
  }

  // Fetch match details by ID
  async getMatchDetails(matchId: number): Promise<Match> {
    await this.delay(200);
    const response = await fetch(`/src/data/previous-matches.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch match details');
    }
    const data: MatchesResponse = await response.json();
    const match = data.matches.find(m => m.id === matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  }

  // Fetch player profile by ID
  async getPlayerProfile(playerId: number): Promise<any> {
    await this.delay(200);
    // This would typically fetch from a players API
    // For now, we'll return a mock profile
    return {
      id: playerId,
      name: `Player ${playerId}`,
      profilePic: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&id=${playerId}`,
      skill: 'Advanced',
      email: `player${playerId}@email.com`,
      contact: `+91 98765 4${playerId.toString().padStart(4, '0')}`,
      website: `www.player${playerId}-billiards.com`
    };
  }

  // Shuffle players for tournament
  async shufflePlayers(matchId: number, players: any[]): Promise<any[]> {
    await this.delay(500);
    // Fisher-Yates shuffle algorithm
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Create tournament bracket
  async createTournamentBracket(players: any[]): Promise<any[]> {
    await this.delay(300);
    const matches = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matches.push({
          id: Math.floor(i / 2) + 1,
          player1: players[i],
          player2: players[i + 1],
          status: 'COMPLETED',
          startTime: this.generateRandomTime(),
          endTime: this.generateRandomTime(),
          duration: this.generateRandomDuration(),
          score: this.generateRandomScore()
        });
      }
    }
    return matches;
  }

  private generateRandomTime(): string {
    const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private generateRandomDuration(): string {
    const minutes = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
    return `${minutes} min`;
  }

  private generateRandomScore(): string {
    const score1 = Math.floor(Math.random() * 7) + 1;
    const score2 = Math.floor(Math.random() * 7) + 1;
    return `${Math.max(score1, score2)}-${Math.min(score1, score2)}`;
  }

  // Tournament API method - Token-based (NEW API)
  // GET /api/v1/organizers/tournaments with Authorization Bearer token
  async getTournamentsByOrganizerId(): Promise<TournamentResponse> {
    try {
      console.log('🔍 Calling NEW token-based tournament API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: GET');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tournament API response received');
      console.log('📦 Response structure:', {
        success: data.success,
        hasData: !!data.data,
        tournamentCount: data.data?.count || 0,
        hasTournaments: !!(data.data?.tournaments && Array.isArray(data.data.tournaments))
      });
      
      return data;
    } catch (error) {
      console.error('❌ Tournament API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Return empty response on error
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tournaments',
        data: {
          tournaments: [],
          count: 0,
          organizerId: 'token-based-auth'
        }
      };
    }
  }

  async getCustomerRegistrations(organizerId: string, tournamentId: string, venueId: string): Promise<any> {
    try {
      console.log('👥 Calling customer registrations API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      const url = `${this.apiBaseUrl}/dev/customer-registrations?organizerId=${organizerId}&tournamentId=${tournamentId}&venueId=${venueId}`;
      console.log('📍 Full API URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Customer API Response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Customer registrations API response:', data);
      return data;
    } catch (error) {
      console.error('❌ Customer registrations API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch customer registrations',
        data: {
          registrations: [],
          count: 0
        }
      };
    }
  }

  // Get tournament by ID (Token-based)
  async getTournamentById(tournamentId: string): Promise<any> {
    try {
      console.log('🏆 Calling token-based tournament by ID API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      
      const url = `${this.apiBaseUrl}/tournament/${tournamentId}`;
      console.log('📍 Full API URL:', url);
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tournament by ID API response:', data);
      return data;
    } catch (error) {
      console.error('❌ Tournament by ID API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tournament',
        data: null
      };
    }
  }

  // Get Tournament Players API (NEW - Token-based)
  // POST /api/v1/organizers/tournaments/{tournament_id}/players
  // Token is passed in request body as per Postman collection
  async getTournamentPlayers(tournamentId: string): Promise<any> {
    try {
      console.log('👥 Calling NEW token-based tournament players API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/players`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: POST');
      
      // Get token from authService
      const authService = (await import('./authService')).default;
      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please login first.');
      }
      
      console.log('🔐 Token found, including in request body');
      
      // According to Postman collection, token is passed in request body
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        authService.logout();
        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tournament players API response received');
      console.log('📦 Response structure:', {
        success: data.success,
        hasData: !!data.data,
        playerCount: data.data?.count || 0,
        hasPlayers: !!(data.data?.players && Array.isArray(data.data.players))
      });
      
      return data;
    } catch (error) {
      console.error('❌ Tournament players API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Return empty response on error
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tournament players',
        data: {
          tournamentId: tournamentId,
          players: [],
          count: 0
        }
      };
    }
  }

  // Tournament registrations API (Still using dev endpoint until backend implements token-based)
  // DEPRECATED: Use getTournamentPlayers instead
  async getTournamentRegistrations(tournamentId: string, venueId: string): Promise<any> {
    try {
      console.log('🏆 Calling tournament registrations API (dev endpoint - still requires organizerId)');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      const url = `${this.apiBaseUrl}/dev/tournament-registrations?organizerId=a5088fd6-c0c1-4be7-a37b-c45af885faf8&tournamentId=${tournamentId}&venueId=${venueId}`;
      console.log('📍 Full API URL:', url);
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      });
      console.log("Tournament Registrations API Response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Tournament registrations API response:', data);
      return data;
    } catch (error) {
      console.error('❌ Tournament registrations API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tournament registrations',
        data: {
          registrations: [],
          count: 0
        }
      };
    }
  }

  // Start Tournament API
  // PATCH /api/v1/organizers/tournaments/{tournament_id}/start
  // Requires Authorization Bearer token in header
  async startTournament(tournamentId: string): Promise<any> {
    try {
      console.log('🚀 Calling start tournament API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/start`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: PATCH');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        const authService = (await import('./authService')).default;
        authService.logout();
        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tournament started successfully');
      console.log('📦 Response structure:', {
        success: data.success,
        hasData: !!data.data,
        tournamentId: data.data?.tournamentId,
        status: data.data?.status
      });
      
      return data;
    } catch (error) {
      console.error('❌ Start tournament API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }
}

export const matchesApiService = new MatchesApiService();
