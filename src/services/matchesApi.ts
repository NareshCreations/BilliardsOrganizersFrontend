// API service for matches data
import { makeAuthenticatedRequest } from './api';
import authService from './authService';

// Helper function to force redirect to login when token expires
const forceRedirectToLogin = (): void => {
  console.log('🔐 Force redirecting to login page...');
  authService.logout();
  // Use setTimeout to ensure redirect happens even if called from error handler
  // Use replace instead of href to prevent back button navigation
  setTimeout(() => {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.replace('/login');
    }
  }, 0);
};
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
  // Determine API base URL
  // Use relative path to leverage proxy (Vite in dev, server.js in production)
  // Only use full URL if explicitly set via environment variable
  private getApiBaseUrl(): string {
    const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envUrl) {
      return envUrl;
    }
    // Use relative path - will be proxied by Vite (dev) or server.js (production)
    return '/api/v1';
  }
  
  private apiBaseUrl = this.getApiBaseUrl();

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch scheduled matches
  async getScheduledMatches(): Promise<MatchesResponse> {
    await this.delay(300);
    const response = await fetch('/data/scheduled-matches.json');
    if (!response.ok) {
      throw new Error('Failed to fetch scheduled matches');
    }
    return response.json();
  }

  // Fetch previous matches
  async getPreviousMatches(): Promise<MatchesResponse> {
    await this.delay(300);
    const response = await fetch('/data/previous-matches.json');
    if (!response.ok) {
      throw new Error('Failed to fetch previous matches');
    }
    return response.json();
  }

  // Fetch match details by ID
  async getMatchDetails(matchId: number): Promise<Match> {
    await this.delay(200);
    const response = await fetch(`/data/previous-matches.json`);
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

  // Create Tournament API
  // POST /api/v1/organizers/tournaments
  // Token is passed in Authorization header as Bearer token
  async createTournament(tournamentData: {
    tournamentName: string;
    gameType: string;
    tournamentDate: string;
    tournamentTime: string;
    maxPlayers: number;
    entryFee: number;
    prizePool: number;
    description?: string;
    registrationDeadline?: string;
  }): Promise<any> {
    try {
      console.log('🏆 Calling Create Tournament API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('📝 Tournament Data:', tournamentData);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: POST');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tournament created successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Create tournament API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Delete Tournament API
  // DELETE /api/v1/organizers/tournaments/{tournament_id}
  // Token is passed in Authorization header as Bearer token
  async deleteTournament(tournamentId: string): Promise<any> {
    try {
      console.log('🗑️ Calling Delete Tournament API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: DELETE');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tournament deleted successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Delete tournament API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Get Tournament API (includes registered players and tournament status)
  // GET /api/v1/organizers/tournaments/{tournament_id}
  // Token is passed in Authorization header as Bearer token
  async getTournamentPlayers(tournamentId: string): Promise<any> {
    try {
      console.log('🏆 Calling Get Tournament API (includes registered players)');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: GET');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      // Use authenticated request helper which handles Authorization header
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
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
        forceRedirectToLogin();
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
      console.log('✅ Tournament API response received');
      console.log('📦 Response structure:', {
        success: data.success,
        hasData: !!data.data,
        playerCount: data.data?.count || 0,
        hasPlayers: !!(data.data?.players && Array.isArray(data.data.players)),
        hasTournamentStatus: !!(data.data?.tournament_status),
        tournament: data.data?.tournament_status?.tournament,
        rounds: data.data?.tournament_status?.rounds,

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

  // Create Round API
  // POST /api/v1/organizers/tournaments/{tournament_id}/rounds
  // Requires Authorization Bearer token in header
  async createRound(tournamentId: string, roundData: {
    roundNumber: number;
    roundName?: string;
    roundDisplayName?: string;
    status?: 'pending' | 'active' | 'completed';
    isFreezed?: boolean;
  }): Promise<any> {
    try {
      console.log('🎯 Calling create round API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('📋 Round Data:', roundData);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: POST');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roundData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
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
      console.log('✅ Round created successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Create round API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Update Round API
  // PUT /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}
  // Requires Authorization Bearer token in header
  async updateRound(tournamentId: string, roundId: string, roundData: {
    roundName?: string;
    roundDisplayName?: string;
    status?: 'pending' | 'active' | 'completed';
    isFreezed?: boolean;
    matches?: Array<{
      id?: string; // Optional - if provided, updates existing match; if not, creates new match
      player1Id: string; // Required - customer_profile ID or user ID
      player2Id: string; // Required - customer_profile ID or user ID
      matchNumber?: number;
      status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
      winnerId?: string;
      scorePlayer1?: number;
      scorePlayer2?: number;
      startTime?: string;
      endTime?: string;
      tableNumber?: number;
    }>;
    deleteMatchIds?: string[];
  }): Promise<any> {
    try {
      console.log('🔄 Calling update round API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎯 Round ID:', roundId);
      console.log('📋 Round Data:', roundData);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: PUT');
      console.log('🔐 Using Authorization Bearer token from authService');
      console.log('📦 Request payload:', JSON.stringify(roundData, null, 2));
      
      // Validate URL and IDs
      if (!tournamentId || !roundId) {
        throw new Error(`Invalid parameters: tournamentId=${tournamentId}, roundId=${roundId}`);
      }
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roundData),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check if response is HTML (server error page)
        const contentType = response.headers.get('content-type') || '';
        const isHtml = contentType.includes('text/html') || errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html') || errorText.includes('<title>');
        
        let errorMessage: string;
        
        if (isHtml) {
          // Try to extract error message from HTML
          const match = errorText.match(/<pre[^>]*>([^<]+)<\/pre>/i) || errorText.match(/Cannot (PUT|POST|GET|DELETE)[^\n]*/i);
          if (match) {
            errorMessage = match[1] || match[0];
            console.error('❌ Extracted error from HTML:', errorMessage);
          } else {
            errorMessage = `Server error (${response.status}): The server returned an HTML error page. This usually means the endpoint doesn't exist or the server is misconfigured.`;
          }
        } else {
          // Try to parse error as JSON
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          } catch {
            errorMessage = errorText || `HTTP error! status: ${response.status}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Round updated successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Update round API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Move Players to Round API
  // POST /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}/players
  // Requires Authorization Bearer token in header
  async movePlayersToRound(tournamentId: string, roundId: string, playerIds: string[]): Promise<any> {
    try {
      console.log('🎯 Calling move players to round API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎲 Round ID:', roundId);
      console.log('👥 Player IDs:', playerIds);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}/players`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: POST');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerIds: playerIds
        }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
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
      console.log('✅ Players moved to round successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Move players to round API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Remove Players from Round API
  // DELETE /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}/players/remove
  // Requires Authorization Bearer token in header
  async removePlayersFromRound(tournamentId: string, roundId: string, playerIds: string[]): Promise<any> {
    try {
      console.log('🗑️ Calling remove players from round API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎲 Round ID:', roundId);
      console.log('👥 Player IDs:', playerIds);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}/players/remove`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: DELETE');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerIds: playerIds
        }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
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
      console.log('✅ Players removed from round successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Remove players from round API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Delete Round API
  // DELETE /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}
  // Requires Authorization Bearer token in header
  async deleteRound(tournamentId: string, roundId: string): Promise<any> {
    try {
      console.log('🗑️ Calling delete round API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎲 Round ID:', roundId);

      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: DELETE');

      const response = await makeAuthenticatedRequest(url, {
        method: 'DELETE',
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
        forceRedirectToLogin();
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
      console.log('✅ Round deleted successfully');
      console.log('📦 Response data:', data);

      return data;
    } catch (error) {
      console.error('❌ Delete round API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });

      throw error;
    }
  }

  // Start Match API
  // POST /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}/matches
  // Requires Authorization Bearer token in header
  async startMatch(tournamentId: string, roundId: string, player1Id: string, player2Id: string, tableNumber?: number): Promise<any> {
    try {
      console.log('🎮 Calling start match API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎲 Round ID:', roundId);
      console.log('👤 Player 1 ID:', player1Id);
      console.log('👤 Player 2 ID:', player2Id);
      console.log('🪑 Table Number:', tableNumber);
      
      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}/matches`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: POST');
      console.log('🔐 Using Authorization Bearer token from authService');
      
      const requestBody: any = {
        player1Id: player1Id,
        player2Id: player2Id
      };
      
      if (tableNumber !== undefined) {
        requestBody.tableNumber = tableNumber;
      }
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response statusText:', response.statusText);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      // Read response body once (can only be read once)
      const responseText = await response.text();
      console.log('📥 Raw response text:', responseText);
      console.log('📥 Response text length:', responseText.length);

      // Check if response is successful (200, 201, etc.)
      if (!response.ok) {
        console.error('❌ API error response status:', response.status);
        console.error('❌ API error response body:', responseText);
        
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Parse response body
      let data;
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          // Empty response - might be 201 Created with no body
          console.warn('⚠️ Empty response body, creating default response');
          data = {
            success: response.status === 201 || response.status === 200,
            message: response.status === 201 ? 'Match created successfully' : 'Match started successfully',
            data: {}
          };
        }
      } catch (parseError) {
        console.error('❌ Error parsing response JSON:', parseError);
        console.error('❌ Response text that failed to parse:', responseText);
        throw new Error(`Invalid response from server: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      console.log('✅ Match API call successful');
      console.log('📦 Parsed response data:', data);
      
      // Ensure response has success field
      if (data.success === undefined) {
        // If no success field, assume success for 200/201 status
        data.success = response.status === 200 || response.status === 201;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Start match API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
    }
  }

  // Complete/Close Match API
  // PATCH /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}/matches/{match_id}
  // Requires Authorization Bearer token in header
  async completeMatch(
    tournamentId: string,
    roundId: string,
    matchId: string,
    winnerId: string,
    scorePlayer1: number,
    scorePlayer2: number
  ): Promise<any> {
    try {
      console.log('🏁 Calling complete match API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎲 Round ID:', roundId);
      console.log('🎮 Match ID:', matchId);
      console.log('👑 Winner ID:', winnerId);
      console.log('📊 Score Player 1:', scorePlayer1);
      console.log('📊 Score Player 2:', scorePlayer2);

      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}/matches/${matchId}`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: PATCH (trying PATCH first, will fallback to PUT if needed)');
      console.log('🔐 Using Authorization Bearer token from authService');

      const requestBody = {
        winnerId: winnerId,
        scorePlayer1: scorePlayer1,
        scorePlayer2: scorePlayer2
      };

      const response = await makeAuthenticatedRequest(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response statusText:', response.statusText);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      // Read response body once (can only be read once)
      const responseText = await response.text();
      console.log('📥 Raw response text:', responseText);
      console.log('📥 Response text length:', responseText.length);

      // Check if response is successful (200, 201, etc.)
      if (!response.ok) {
        console.error('❌ API error response status:', response.status);
        console.error('❌ API error response body:', responseText);

        // Check if response is HTML (backend error page)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          // Extract error message from HTML if possible
          const errorMatch = responseText.match(/<pre[^>]*>([^<]+)<\/pre>/i) || 
                            responseText.match(/<body[^>]*>([^<]+)<\/body>/i) ||
                            responseText.match(/Cannot (GET|POST|PUT|PATCH|DELETE) ([^\s]+)/i);
          
          if (errorMatch) {
            const errorMessage = errorMatch[1] || errorMatch[0];
            console.error('❌ Extracted error from HTML:', errorMessage);
            throw new Error(`Backend route error: ${errorMessage}. Please check if the API endpoint exists and supports PATCH method.`);
          } else {
            throw new Error(`Backend returned HTML error page. Status: ${response.status}. The API endpoint may not exist or may not support PATCH method.`);
          }
        }

        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP error! status: ${response.status}` };
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Parse response body
      let data;
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          // Empty response - might be 200 OK with no body
          console.warn('⚠️ Empty response body, creating default response');
          data = {
            success: response.status === 200,
            message: 'Match completed successfully',
            data: {}
          };
        }
      } catch (parseError) {
        console.error('❌ Error parsing response JSON:', parseError);
        console.error('❌ Response text that failed to parse:', responseText);
        throw new Error(`Invalid response from server: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      console.log('✅ Match completion API call successful');
      console.log('📦 Parsed response data:', data);

      // Ensure response has success field
      if (data.success === undefined) {
        // If no success field, assume success for 200 status
        data.success = response.status === 200;
      }

      return data;
    } catch (error) {
      console.error('❌ Complete match API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });

      throw error;
    }
  }

  // Cancel/Delete Match API
  // DELETE /api/v1/organizers/tournaments/{tournament_id}/rounds/{round_id}/matches/{match_id}
  // Requires Authorization Bearer token in header
  async cancelMatch(
    tournamentId: string,
    roundId: string,
    matchId: string,
    deleteMatch: boolean = false
  ): Promise<any> {
    try {
      console.log('❌ Calling cancel match API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🎲 Round ID:', roundId);
      console.log('🎮 Match ID:', matchId);
      console.log('🗑️ Delete Match:', deleteMatch);

      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/rounds/${roundId}/matches/${matchId}`;
      console.log('📍 Full API URL:', url);
      console.log('🔐 Request method: DELETE');
      console.log('🔐 Using Authorization Bearer token from authService');

      // Validate URL and IDs
      if (!tournamentId || !roundId || !matchId) {
        throw new Error(`Invalid parameters: tournamentId=${tournamentId}, roundId=${roundId}, matchId=${matchId}`);
      }

      const requestBody = {
        deleteMatch: deleteMatch
      };

      const response = await makeAuthenticatedRequest(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        console.log('❌ Unauthorized request (401), token expired or invalid');
        console.log('🔐 Logging out user and redirecting to login page...');
        forceRedirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check if response is HTML (server error page)
        const contentType = response.headers.get('content-type') || '';
        const isHtml = contentType.includes('text/html') || errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html') || errorText.includes('<title>');
        
        let errorMessage: string;
        
        if (isHtml) {
          // Try to extract error message from HTML
          const match = errorText.match(/<pre[^>]*>([^<]+)<\/pre>/i) || errorText.match(/Cannot (PUT|POST|GET|DELETE)[^\n]*/i);
          if (match) {
            errorMessage = match[1] || match[0];
            console.error('❌ Extracted error from HTML:', errorMessage);
          } else {
            errorMessage = `Server error (${response.status}): The server returned an HTML error page. This usually means the endpoint doesn't exist or the server is misconfigured.`;
          }
        } else {
          // Try to parse error as JSON
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          } catch {
            errorMessage = errorText || `HTTP error! status: ${response.status}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Match cancelled successfully');
      console.log('📦 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Cancel match API error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      throw error;
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
        //const authService = (await import('./authService')).default;
        forceRedirectToLogin();
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

  // Save Winner Titles API
  // POST /api/v1/organizers/tournaments/{tournament_id}/winners
  // Requires Authorization Bearer token in header
  async saveWinnerTitles(tournamentId: string, winners: Array<{
    customerId: string;
    rank: number;
    title: string;
    isCustomTitle?: boolean;
    displayInResults?: boolean;
  }>): Promise<any> {
    try {
      console.log('🏆 Calling save winner titles API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🏆 Winners:', winners);

      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/winners`;
      console.log('🌐 Full API URL:', url);
      console.log('🌐 Request body:', JSON.stringify({ winners: winners }, null, 2));
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: winners }),
      });
      
      console.log('🌐 API Response status:', response.status);
      console.log('🌐 API Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              // Try to extract error message from HTML if it's an HTML error page
              const match = errorText.match(/<title[^>]*>([^<]+)<\/title>/i) || errorText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              if (match) {
                errorMessage = match[1];
              } else if (errorText.length < 200) {
                errorMessage = errorText;
              }
            }
          } catch (textError) {
            console.error('Error reading error response as text:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Save winner titles API response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error saving winner titles:', error);
      throw error;
    }
  }

  async closeTournament(tournamentId: string): Promise<any> {
    try {
      console.log('🔒 Calling close tournament API');
      console.log('🌐 API Base URL:', this.apiBaseUrl);
      console.log('🔒 Tournament ID:', tournamentId);

      const url = `${this.apiBaseUrl}/organizers/tournaments/${tournamentId}/close`;
      console.log('🌐 Full API URL:', url);
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('🌐 API Response status:', response.status);
      console.log('🌐 API Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          // Try to read as JSON first
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // Not JSON, try to extract error from HTML
            if (errorText) {
              const match = errorText.match(/<title[^>]*>([^<]+)<\/title>/i) || errorText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              if (match) {
                errorMessage = match[1];
              } else if (errorText.length < 200) {
                errorMessage = errorText;
              }
            }
          }
        } catch (textError) {
          console.error('Error reading error response:', textError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Close tournament API response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error closing tournament:', error);
      throw error;
    }
  }
}

export const matchesApiService = new MatchesApiService();
