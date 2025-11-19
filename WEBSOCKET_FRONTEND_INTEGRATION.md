# WebSocket Integration Guide for Frontend

## Overview
This document provides all the details needed to integrate WebSocket (Socket.io) real-time updates into the Customer and Organizer portals.

## Connection Details

### WebSocket Server URL Configuration

**Important**: Use environment variables for different environments. Never hardcode URLs!

### Environment Variables Setup

#### For React/Vite Projects
Create/update `.env` files:

**.env.development**
```env
VITE_API_BASE_URL=http://localhost:3005
VITE_WS_URL=http://localhost:3005
```

**.env.uat** (or .env.staging)
```env
VITE_API_BASE_URL=https://uat-api.yourdomain.com
VITE_WS_URL=wss://uat-api.yourdomain.com
```

**.env.production**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

#### For Next.js Projects
**.env.local** (development)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
NEXT_PUBLIC_WS_URL=http://localhost:3005
```

**.env.uat**
```env
NEXT_PUBLIC_API_BASE_URL=https://uat-api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://uat-api.yourdomain.com
```

**.env.production**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### Connection Setup (Using Environment Variables)

```typescript
import { io, Socket } from 'socket.io-client';

// Get WebSocket URL from environment variable
const getWebSocketUrl = (): string => {
  // For React/Vite
  const wsUrl = import.meta.env.VITE_WS_URL;
  
  // For Next.js (use NEXT_PUBLIC_WS_URL)
  // const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  
  // Fallback for development
  return wsUrl || 'http://localhost:3005';
};

// Initialize Socket.io connection
const socket: Socket = io(getWebSocketUrl(), {
  auth: {
    token: 'your-jwt-token', // JWT token from login API
    userId: 'user-id' // User ID from JWT token payload
  },
  transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### Alternative: Use API Base URL

If your REST API base URL is already configured, you can derive WebSocket URL from it:

```typescript
// Get API base URL from your existing config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005';

// WebSocket uses the same host/port as REST API
// Convert http:// to ws:// and https:// to wss://
const getWebSocketUrl = (): string => {
  if (API_BASE_URL.startsWith('https://')) {
    return API_BASE_URL.replace('https://', 'wss://') + '/socket.io';
  } else {
    return API_BASE_URL.replace('http://', 'ws://') + '/socket.io';
  }
};

const socket = io(getWebSocketUrl(), {
  auth: {
    token: 'your-jwt-token',
    userId: 'user-id'
  }
});
```

### Authentication
- **Token**: JWT token from login API (`/api/v1/auth/login`)
- **UserId**: Extract from JWT token payload (field: `userId`)
- Token must be valid and not expired

## Connection Lifecycle

### 1. Connect on App/Component Load
```typescript
useEffect(() => {
  // Connect to WebSocket
  socket.connect();
  
  // Handle connection success
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket.id);
  });
  
  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
    // Handle error (show notification, retry, etc.)
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
    // Handle reconnection logic if needed
  });
  
  // Cleanup on unmount
  return () => {
    socket.disconnect();
  };
}, []);
```

## Tournament Room Management

### Join Tournament Room
To receive real-time updates for a specific tournament, join its room:

```typescript
// Join tournament room
socket.emit('join:tournament', tournamentId);

// Listen for join confirmation
socket.on('joined:tournament', (data) => {
  console.log('Joined tournament room:', data.tournamentId);
});
```

### Leave Tournament Room
```typescript
socket.emit('leave:tournament', tournamentId);
```

**Important**: Join tournament room when:
- User opens tournament details page
- User views tournament dashboard
- User navigates to tournament-specific views

## Available Events (Listen for Updates)

### 1. Player Registered Event
**Event Name**: `player:registered`

**When Emitted**: When a customer registers for a tournament

**Payload Structure**:
```typescript
{
  tournamentId: string;
  playerId: string; // customer_profile.id
  playerName: string; // Display name or "FirstName LastName"
  registeredCount: number; // Updated total registered count
  registrationId: string; // Registration ID
  timestamp: string; // ISO timestamp
}
```

**Usage Example**:
```typescript
socket.on('player:registered', (data) => {
  // Update player count in UI
  setRegisteredCount(data.registeredCount);
  
  // Show notification
  showNotification(`${data.playerName} registered for the tournament!`);
  
  // Refresh player list if needed
  refreshPlayerList();
});
```

### 2. Match Update Event
**Event Name**: `match:update`

**When Emitted**: 
- When a match is started
- When a match is completed
- When a match is cancelled
- When a match is deleted

**Payload Structure**:
```typescript
{
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
  deleted?: boolean; // true if match was deleted
  timestamp: string;
}
```

**Usage Example**:
```typescript
socket.on('match:update', (data) => {
  if (data.deleted) {
    // Remove match from UI
    removeMatchFromList(data.matchId);
  } else {
    // Update match in UI
    updateMatchInList(data);
    
    if (data.status === 'completed') {
      showNotification(`Match ${data.matchNumber} completed!`);
    }
  }
});
```

### 3. Round Update Event
**Event Name**: `round:update`

**When Emitted**: When round details are updated (name, status, matches, etc.)

**Payload Structure**:
```typescript
{
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  roundName?: string | null;
  roundDisplayName?: string | null;
  status: 'pending' | 'active' | 'completed';
  isFreezed: boolean;
  timestamp: string;
}
```

**Usage Example**:
```typescript
socket.on('round:update', (data) => {
  // Update round information in UI
  updateRoundInfo(data);
  
  // If round status changed, show notification
  if (data.status === 'completed') {
    showNotification(`Round ${data.roundNumber} completed!`);
  }
});
```

### 4. Tournament Status Event
**Event Name**: `tournament:status`

**When Emitted**: 
- When tournament is started
- When tournament is completed/closed

**Payload Structure**:
```typescript
{
  tournamentId: string;
  status: 'started' | 'completed';
  startedAt?: Date; // When status is 'started'
  endedAt?: Date; // When status is 'completed'
  timestamp: string;
}
```

**Usage Example**:
```typescript
socket.on('tournament:status', (data) => {
  // Update tournament status in UI
  setTournamentStatus(data.status);
  
  if (data.status === 'started') {
    showNotification('Tournament has started!');
    // Disable registration button, etc.
  } else if (data.status === 'completed') {
    showNotification('Tournament has ended!');
    // Show final results, etc.
  }
});
```

## Client Events (Emit to Server)

### 1. Join Tournament Room
```typescript
socket.emit('join:tournament', tournamentId);
```

### 2. Leave Tournament Room
```typescript
socket.emit('leave:tournament', tournamentId);
```

## Complete Integration Example

### React Hook Example
```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Helper to get WebSocket URL from environment
const getWebSocketUrl = (): string => {
  // React/Vite
  const wsUrl = import.meta.env.VITE_WS_URL;
  
  // Next.js (uncomment if using Next.js)
  // const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  
  // Fallback
  return wsUrl || 'http://localhost:3005';
};

export const useTournamentSocket = (tournamentId: string, token: string, userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);

  useEffect(() => {
    // Initialize socket connection with environment-based URL
    const newSocket = io(getWebSocketUrl(), {
      auth: {
        token: token,
        userId: userId
      }
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      
      // Join tournament room
      newSocket.emit('join:tournament', tournamentId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Tournament room confirmation
    newSocket.on('joined:tournament', (data) => {
      console.log('Joined tournament room:', data.tournamentId);
    });

    // Listen for player registrations
    newSocket.on('player:registered', (data) => {
      console.log('New player registered:', data);
      setRegisteredCount(data.registeredCount);
      // Show notification, update UI, etc.
    });

    // Listen for match updates
    newSocket.on('match:update', (data) => {
      console.log('Match updated:', data);
      // Update match in UI
    });

    // Listen for round updates
    newSocket.on('round:update', (data) => {
      console.log('Round updated:', data);
      // Update round in UI
    });

    // Listen for tournament status changes
    newSocket.on('tournament:status', (data) => {
      console.log('Tournament status changed:', data);
      // Update tournament status in UI
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.emit('leave:tournament', tournamentId);
      newSocket.disconnect();
    };
  }, [tournamentId, token, userId]);

  return {
    socket,
    isConnected,
    registeredCount
  };
};
```

### Usage in Component
```typescript
// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005';

const TournamentDashboard = ({ tournamentId }) => {
  const { token, userId } = useAuth(); // Your auth hook
  const { socket, isConnected, registeredCount } = useTournamentSocket(
    tournamentId,
    token,
    userId
  );

  // Still use REST APIs for actions (using environment variable)
  const handleRegister = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/customers/tournaments/${tournamentId}/register`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    // Handle response...
    // WebSocket will automatically notify all clients about the registration
  };

  return (
    <div>
      <div>Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
      <div>Registered Players: {registeredCount}</div>
      {/* Your UI components */}
    </div>
  );
};
```

## Error Handling

### Connection Errors
```typescript
socket.on('connect_error', (error) => {
  if (error.message.includes('Authentication')) {
    // Token expired or invalid - redirect to login
    redirectToLogin();
  } else {
    // Network error - show retry option
    showRetryConnection();
  }
});
```

### Server Errors
```typescript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Handle error appropriately
});
```

## Best Practices

### 1. Connection Management
- Connect once when app/component loads
- Disconnect when component unmounts
- Reconnect automatically on disconnect (Socket.io handles this)

### 2. Room Management
- Join tournament room when viewing tournament
- Leave tournament room when navigating away
- Don't join the same room multiple times

### 3. Event Cleanup
- Remove event listeners when component unmounts
- Use React's `useEffect` cleanup function

### 4. Error Handling
- Always handle connection errors
- Show user-friendly error messages
- Implement retry logic for failed connections

### 5. Performance
- Only listen to events you need
- Don't create multiple socket connections
- Use a singleton pattern for socket instance

## Environment Variables Configuration

### Complete Environment Setup

#### React/Vite Project Structure
```
project-root/
├── .env                    # Default (gitignored)
├── .env.development        # Development environment
├── .env.uat                # UAT/Staging environment
├── .env.production         # Production environment
└── src/
```

#### Environment Files Content

**.env.development**
```env
VITE_API_BASE_URL=http://localhost:3005
VITE_WS_URL=http://localhost:3005
```

**.env.uat**
```env
VITE_API_BASE_URL=https://uat-api.yourdomain.com
VITE_WS_URL=wss://uat-api.yourdomain.com
```

**.env.production**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

#### Next.js Project Structure
```
project-root/
├── .env.local              # Local development (gitignored)
├── .env.development        # Development
├── .env.uat                # UAT/Staging
├── .env.production         # Production
└── src/
```

#### Environment Files Content (Next.js)

**.env.local** or **.env.development**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
NEXT_PUBLIC_WS_URL=http://localhost:3005
```

**.env.uat**
```env
NEXT_PUBLIC_API_BASE_URL=https://uat-api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://uat-api.yourdomain.com
```

**.env.production**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### Using Environment Variables in Code

#### React/Vite Example
```typescript
// config/websocket.ts
export const getWebSocketUrl = (): string => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  
  if (!wsUrl) {
    console.warn('VITE_WS_URL not set, using default localhost');
    return 'http://localhost:3005';
  }
  
  return wsUrl;
};

// Usage
import { getWebSocketUrl } from './config/websocket';

const socket = io(getWebSocketUrl(), {
  auth: { token, userId }
});
```

#### Next.js Example
```typescript
// config/websocket.ts
export const getWebSocketUrl = (): string => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  
  if (!wsUrl) {
    console.warn('NEXT_PUBLIC_WS_URL not set, using default localhost');
    return 'http://localhost:3005';
  }
  
  return wsUrl;
};

// Usage
import { getWebSocketUrl } from './config/websocket';

const socket = io(getWebSocketUrl(), {
  auth: { token, userId }
});
```

### Auto-Detection from API URL

If you already have API base URL configured, you can auto-detect WebSocket URL:

```typescript
// config/websocket.ts
export const getWebSocketUrl = (): string => {
  // Get API base URL (remove trailing slash if present)
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005').replace(/\/$/, '');
  
  // Convert http:// to ws:// and https:// to wss://
  if (apiUrl.startsWith('https://')) {
    return apiUrl.replace('https://', 'wss://');
  } else {
    return apiUrl.replace('http://', 'ws://');
  }
};
```

## Testing

### Test Connection
```typescript
socket.on('connect', () => {
  console.log('✅ Connected with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});
```

### Test Events
1. Register for tournament → Should receive `player:registered`
2. Complete a match → Should receive `match:update`
3. Update round → Should receive `round:update`
4. Start tournament → Should receive `tournament:status`

## Troubleshooting

### Connection Issues
- **Problem**: Cannot connect
  - **Solution**: Check if server is running on correct port
  - **Solution**: Verify JWT token is valid
  - **Solution**: Check CORS settings

### Not Receiving Events
- **Problem**: Events not received
  - **Solution**: Verify you've joined the tournament room
  - **Solution**: Check if event is being emitted (check server logs)
  - **Solution**: Verify tournament ID matches

### Authentication Errors
- **Problem**: Authentication error on connect
  - **Solution**: Ensure token is passed in `auth.token`
  - **Solution**: Verify token is not expired
  - **Solution**: Check token format (should be JWT string)

## Summary

### What Frontend Needs to Do:
1. ✅ Install `socket.io-client` package
2. ✅ Connect to WebSocket server with JWT token
3. ✅ Join tournament room when viewing tournament
4. ✅ Listen for events (`player:registered`, `match:update`, etc.)
5. ✅ Update UI when events are received
6. ✅ Still use REST APIs for all user actions

### What Backend Does:
1. ✅ Emits events after successful operations
2. ✅ Broadcasts to all clients in tournament room
3. ✅ Handles authentication automatically
4. ✅ Manages rooms and connections

### Key Points:
- **REST APIs**: Still used for all actions (register, update, complete, etc.)
- **WebSocket**: Only for receiving real-time updates
- **No Breaking Changes**: All existing API calls work as before
- **Automatic Updates**: UI updates automatically when events are received

## Support

For questions or issues, contact the backend team with:
- Tournament ID
- User ID
- Event name
- Error messages (if any)
- Browser console logs

