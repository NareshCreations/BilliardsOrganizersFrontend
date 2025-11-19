/**
 * Socket.io Service
 * Manages WebSocket connections for real-time tournament updates
 */

import { io, Socket } from 'socket.io-client';
import { getWebSocketUrl } from '../config/websocket';
import authService from './authService';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private currentTournamentId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Initialize socket connection
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    const token = authService.getAccessToken();
    const user = authService.getStoredUser();

    if (!token || !user) {
      console.warn('⚠️ Cannot connect socket: No token or user found');
      return;
    }

    const userId = user.id;
    const wsUrl = getWebSocketUrl();

    console.log('🔌 Connecting to WebSocket:', wsUrl);
    console.log('👤 User ID:', userId);

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    // Create new socket connection
    this.socket = io(wsUrl, {
      auth: {
        token: token,
        userId: userId
      },
      transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Rejoin tournament room if we were in one
      if (this.currentTournamentId) {
        this.joinTournament(this.currentTournamentId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        console.error('🔐 Authentication failed, token may be expired');
        // Token expired - will be handled by auth service
      }
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    // Tournament room confirmation
    this.socket.on('joined:tournament', (data) => {
      console.log('✅ Joined tournament room:', data.tournamentId);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      // Leave tournament room if joined
      if (this.currentTournamentId) {
        this.leaveTournament(this.currentTournamentId);
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentTournamentId = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  /**
   * Join tournament room
   */
  joinTournament(tournamentId: string): void {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Cannot join tournament: Socket not connected');
      // Try to connect first
      this.connect();
      // Wait a bit for connection, then try again
      setTimeout(() => {
        if (this.socket && this.isConnected) {
          this.socket.emit('join:tournament', tournamentId);
          this.currentTournamentId = tournamentId;
        }
      }, 1000);
      return;
    }

    console.log('🎯 Joining tournament room:', tournamentId);
    this.socket.emit('join:tournament', tournamentId);
    this.currentTournamentId = tournamentId;
  }

  /**
   * Leave tournament room
   */
  leaveTournament(tournamentId: string): void {
    if (!this.socket || !this.isConnected) {
      return;
    }

    console.log('🚪 Leaving tournament room:', tournamentId);
    this.socket.emit('leave:tournament', tournamentId);
    
    if (this.currentTournamentId === tournamentId) {
      this.currentTournamentId = null;
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn(`⚠️ Cannot subscribe to ${event}: Socket not initialized`);
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Emit an event to server
   */
  emit(event: string, ...args: any[]): void {
    if (!this.socket || !this.isConnected) {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
      return;
    }

    this.socket.emit(event, ...args);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Reconnect socket (useful after token refresh)
   */
  reconnect(): void {
    console.log('🔄 Reconnecting socket...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 500);
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;

