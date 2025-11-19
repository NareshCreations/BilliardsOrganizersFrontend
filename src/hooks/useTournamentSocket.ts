/**
 * Custom React Hook for Tournament WebSocket
 * Manages WebSocket connection and event handlers for tournament updates
 */

import { useEffect, useRef, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';

interface PlayerRegisteredData {
  tournamentId: string;
  playerId: string;
  playerName: string;
  registeredCount: number;
  registrationId: string;
  timestamp: string;
}

interface MatchUpdateData {
  tournamentId: string;
  matchId: string;
  roundId: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'deleted';
  player1Id?: string;
  player2Id?: string;
  winnerId?: string | null;
  scorePlayer1?: number | null;
  scorePlayer2?: number | null;
  startTime?: Date | null;
  endTime?: Date | null;
  matchNumber?: number;
  tableNumber?: number | null;
  deleted?: boolean;
  timestamp: string;
}

interface RoundUpdateData {
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  roundName?: string | null;
  roundDisplayName?: string | null;
  status: 'pending' | 'active' | 'completed';
  isFreezed: boolean;
  timestamp: string;
}

interface TournamentStatusData {
  tournamentId: string;
  status: 'started' | 'completed';
  startedAt?: Date;
  endedAt?: Date;
  timestamp: string;
}

interface UseTournamentSocketOptions {
  tournamentId: string | null;
  onPlayerRegistered?: (data: PlayerRegisteredData) => void;
  onMatchUpdate?: (data: MatchUpdateData) => void;
  onRoundUpdate?: (data: RoundUpdateData) => void;
  onTournamentStatus?: (data: TournamentStatusData) => void;
  enabled?: boolean; // Whether to enable WebSocket connection
}

export const useTournamentSocket = (options: UseTournamentSocketOptions) => {
  const {
    tournamentId,
    onPlayerRegistered,
    onMatchUpdate,
    onRoundUpdate,
    onTournamentStatus,
    enabled = true
  } = options;

  const { isAuthenticated } = useAuth();
  const callbacksRef = useRef({
    onPlayerRegistered,
    onMatchUpdate,
    onRoundUpdate,
    onTournamentStatus
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onPlayerRegistered,
      onMatchUpdate,
      onRoundUpdate,
      onTournamentStatus
    };
  }, [onPlayerRegistered, onMatchUpdate, onRoundUpdate, onTournamentStatus]);

  // Event handlers that use the latest callbacks
  const handlePlayerRegistered = useCallback((data: PlayerRegisteredData) => {
    console.log('📢 WebSocket: Player registered:', data);
    callbacksRef.current.onPlayerRegistered?.(data);
  }, []);

  const handleMatchUpdate = useCallback((data: MatchUpdateData) => {
    console.log('📢 WebSocket: Match update:', data);
    callbacksRef.current.onMatchUpdate?.(data);
  }, []);

  const handleRoundUpdate = useCallback((data: RoundUpdateData) => {
    console.log('📢 WebSocket: Round update:', data);
    callbacksRef.current.onRoundUpdate?.(data);
  }, []);

  const handleTournamentStatus = useCallback((data: TournamentStatusData) => {
    console.log('📢 WebSocket: Tournament status:', data);
    callbacksRef.current.onTournamentStatus?.(data);
  }, []);

  // Initialize socket connection and event listeners
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      console.log('🔌 WebSocket disabled or user not authenticated');
      return;
    }

    // Connect socket
    socketService.connect();

    // Set up event listeners
    socketService.on('player:registered', handlePlayerRegistered);
    socketService.on('match:update', handleMatchUpdate);
    socketService.on('round:update', handleRoundUpdate);
    socketService.on('tournament:status', handleTournamentStatus);

    // Join tournament room if tournamentId is provided
    if (tournamentId) {
      socketService.joinTournament(tournamentId);
    }

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket listeners');
      socketService.off('player:registered', handlePlayerRegistered);
      socketService.off('match:update', handleMatchUpdate);
      socketService.off('round:update', handleRoundUpdate);
      socketService.off('tournament:status', handleTournamentStatus);
      
      // Leave tournament room if we joined one
      if (tournamentId) {
        socketService.leaveTournament(tournamentId);
      }
    };
  }, [enabled, isAuthenticated, tournamentId, handlePlayerRegistered, handleMatchUpdate, handleRoundUpdate, handleTournamentStatus]);

  // Update tournament room when tournamentId changes
  useEffect(() => {
    if (!enabled || !isAuthenticated || !tournamentId) {
      return;
    }

    // Leave previous tournament if any
    // Join new tournament
    socketService.joinTournament(tournamentId);

    return () => {
      socketService.leaveTournament(tournamentId);
    };
  }, [tournamentId, enabled, isAuthenticated]);

  return {
    isConnected: socketService.getConnectionStatus(),
    socket: socketService.getSocket()
  };
};

