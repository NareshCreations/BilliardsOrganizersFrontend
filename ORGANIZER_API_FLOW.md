# Organizer API Flow Guide

Complete step-by-step guide for organizers to start tournaments, generate brackets, and display tournament data.

---

## 🎯 Tournament Type Flag

**Important:** Tournaments have a type flag (`bracketType`):
- **`bracketType = null`** → Normal/Manual Tournament (organizer creates rounds manually, full flexibility)
- **`bracketType = 'power_of_2'`** → Bracket Tournament (strict bracket rules, automatic advancement)

**Default:** When tournament is created, `bracketType = null` (manual tournament)
**Changed:** When bracket is generated, `bracketType = 'power_of_2'` (bracket tournament)

---

## 🎯 Complete Flow for Bracket Tournaments

### Step 1: Create Tournament
**API:** `POST /api/v1/organizers/tournaments`

**Request:**
```json
{
  "tournamentName": "Spring Championship 2025",
  "tournamentId": "SPRING-2025-001",
  "gameType": "8-ball",
  "tournamentDate": "2025-12-15",
  "tournamentTime": "10:00:00",
  "registrationDeadline": "2025-12-10",
  "maxPlayers": 16,
  "entryFee": 50.00,
  "prizePool": 800.00,
  "description": "Professional 8-ball tournament"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tournament created successfully",
  "data": {
    "tournament": {
      "id": "uuid-here",
      "tournamentId": "SPRING-2025-001",
      "tournamentName": "Spring Championship 2025",
      "status": "pending",
      "bracketType": null,  // ← NULL = Normal/Manual Tournament (default)
      "bracketSize": null,
      "bracketGeneratedAt": null
      ...
    }
  }
}
```

---

### Step 2: Get Registered Players
**API:** `GET /api/v1/organizers/tournaments/:tournamentId/players`

**Request:**
```
GET /api/v1/organizers/tournaments/{tournamentId}/players
Headers: Authorization: Bearer {organizer_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Registered players fetched successfully",
  "data": {
    "tournamentId": "uuid",
    "players": [
      {
        "id": "player-uuid-1",
        "name": "John Doe",
        "email": "john@example.com",
        "skill": "intermediate",
        "status": "registered"
      },
      ...
    ],
    "count": 10
  }
}
```

---

### Step 3: Start Tournament
**API:** `PATCH /api/v1/organizers/tournaments/:tournamentId/start`

**Request:**
```
PATCH /api/v1/organizers/tournaments/{tournamentId}/start
Headers: Authorization: Bearer {organizer_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Tournament started successfully",
  "data": {
    "tournament": {
      "id": "uuid",
      "status": "started",
      "startedAt": "2025-12-15T10:00:00Z"
    }
  }
}
```

**Important:** Tournament must be in `pending` status to start. Once started, you can generate brackets.

---

### Step 4: Generate Bracket (ONE TIME ONLY)
**API:** `POST /api/v1/organizers/tournaments/:tournamentId/generate-bracket`

**Request:**
```json
POST /api/v1/organizers/tournaments/{tournamentId}/generate-bracket
Headers: Authorization: Bearer {organizer_token}

Body:
{
  "playerIds": [
    "player-uuid-1",
    "player-uuid-2",
    "player-uuid-3",
    ...
    "player-uuid-10"
  ]
}
```

**What This Does:**
- Calculates bracket size (power of 2: 8, 16, 32, 64...)
- Shuffles players once
- Creates ALL rounds and matches automatically
- Assigns byes in Round 1 only
- Links matches (winner → next match)
- Auto-advances players with byes

**Response:**
```json
{
  "success": true,
  "message": "Bracket generated successfully",
  "data": {
    "tournamentId": "uuid",
    "bracketType": "power_of_2",
    "bracketSize": 16,
    "totalPlayers": 10,
    "byes": 6,
    "rounds": 4,
    "matchesCreated": 15,
    "bracketGeneratedAt": "2025-12-15T10:05:00Z"
  }
}
```

**Example with 10 Players:**
- Bracket Size: **16** (next power of 2)
- Byes: **6** (16 - 10 = 6)
- Rounds: **4** (log2(16) = 4)
- Round 1 Matches: **8** (4 real matches, 6 byes)
- Total Matches: **15** (16 - 1 = 15)

---

### Step 5: Display Complete Tournament Data
**API:** `GET /api/v1/organizers/tournaments/:tournamentId`

**Request:**
```
GET /api/v1/organizers/tournaments/{tournamentId}
Headers: Authorization: Bearer {organizer_token}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Tournament details fetched successfully",
  "data": {
    "tournament": {
      "id": "uuid",
      "tournamentId": "SPRING-2025-001",
      "tournamentName": "Spring Championship 2025",
      "gameType": "8-ball",
      "status": "started",
      "registeredCount": 10,
      "maxPlayers": 16,
      "entryFee": 50.00,
      "prizePool": 800.00,
      
      // NEW: Bracket Information
      "bracketType": "power_of_2",
      "bracketSize": 16,
      "bracketGeneratedAt": "2025-12-15T10:05:00Z"
    },
    
    "players": [
      {
        "id": "player-uuid-1",
        "name": "John Doe",
        "email": "john@example.com",
        "skill": "intermediate",
        "status": "registered"
      },
      ...
    ],
    
    "tournament_status": {
      "tournament": {
        "code": "SPRING-2025-001",
        "name": "Spring Championship 2025",
        "game_type": "8-ball",
        "date": "2025-12-15",
        "status": "started",
        "registered": 10,
        "max_players": 16,
        
        // NEW: Bracket Information
        "bracket_type": "power_of_2",
        "bracket_size": 16,
        "bracket_generated_at": "2025-12-15T10:05:00Z"
      },
      
      "rounds": [
        {
          "id": "round-uuid-1",
          "name": "Round 1",
          "displayName": "Round 1",
          "status": "active",
          "isFrozen": false,
          "roundNumber": 1,
          "totalMatches": 8,
          "completedMatches": 2,
          
          // NEW: Byes Count
          "byesCount": 6,
          
          "players": [
            {
              "id": "player-uuid-1",
              "name": "John Doe",
              "email": "john@example.com",
              "skill": "intermediate",
              "status": "active",
              "isBye": false,
              ...
            },
            {
              "id": "player-uuid-3",
              "name": "Player C",
              "status": "active",
              "isBye": true,  // Player with bye
              ...
            }
          ],
          
          "matches": [
            {
              "id": "match-uuid-1",
              "matchNumber": 1,
              "status": "completed",
              "startTime": "2025-12-15T10:10:00Z",
              "endTime": "2025-12-15T10:25:00Z",
              "duration": "15m",
              "tableNumber": 1,
              "score": "7-5",
              "player1": {
                "id": "player-uuid-1",
                "name": "John Doe",
                "email": "john@example.com",
                "skill": "intermediate"
              },
              "player2": {
                "id": "player-uuid-2",
                "name": "Jane Smith",
                "email": "jane@example.com",
                "skill": "advanced"
              },
              "winner": {
                "id": "player-uuid-1",
                "name": "John Doe"
              },
              
              // NEW: Bracket Information
              "isBye": false,
              "positionInBracket": 1,
              "bracketSeed": 1,
              "nextMatchIdForWinner": "match-uuid-9"  // Winner goes to Round 2 Match 1
            },
            {
              "id": "match-uuid-3",
              "matchNumber": 3,
              "status": "completed",
              "player1": {
                "id": "player-uuid-3",
                "name": "Player C"
              },
              "player2": {
                "id": "00000000-0000-0000-0000-000000000001",
                "name": "BYE",  // BYE player
                "isBye": true
              },
              "winner": {
                "id": "player-uuid-3",
                "name": "Player C"
              },
              
              // NEW: Bracket Information
              "isBye": true,  // This match has a bye
              "positionInBracket": 3,
              "bracketSeed": 3,
              "nextMatchIdForWinner": "match-uuid-10"  // Player C advances to Round 2 Match 2
            }
          ],
          
          "winners": [...],
          "losers": [...]
        },
        {
          "id": "round-uuid-2",
          "name": "Round 2",
          "displayName": "Quarter-finals",
          "roundNumber": 2,
          "totalMatches": 4,
          "completedMatches": 0,
          "byesCount": 0,  // No byes after Round 1
          "matches": [
            {
              "id": "match-uuid-9",
              "matchNumber": 1,
              "status": "scheduled",
              "player1": {
                "id": "player-uuid-1",
                "name": "John Doe"  // Auto-advanced from Round 1 Match 1
              },
              "player2": {
                "id": "00000000-0000-0000-0000-000000000002",
                "name": "TBD"  // Placeholder - waiting for Round 1 Match 2 winner
              },
              "isBye": false,
              "positionInBracket": 9,
              "nextMatchIdForWinner": "match-uuid-13"  // Winner goes to Semi-final
            }
          ]
        },
        {
          "id": "round-uuid-3",
          "name": "Round 3",
          "displayName": "Semi-finals",
          "roundNumber": 3,
          "totalMatches": 2,
          ...
        },
        {
          "id": "round-uuid-4",
          "name": "Round 4",
          "displayName": "Final",
          "roundNumber": 4,
          "totalMatches": 1,
          ...
        }
      ]
    }
  }
}
```

---

## 🔄 Managing Matches During Tournament

### Complete a Match (Auto-Advancement)
**API:** `PATCH /api/v1/organizers/tournaments/:tournamentId/rounds/:roundId/matches/:matchId`

**Request:**
```json
{
  "status": "completed",
  "winnerId": "player-uuid-1",
  "scorePlayer1": 7,
  "scorePlayer2": 5,
  "endTime": "2025-12-15T10:25:00Z"
}
```

**What Happens:**
- Match status → `completed`
- Winner is saved
- **AUTOMATIC:** Winner is advanced to `nextMatchIdForWinner`
- If next match has a placeholder, winner replaces placeholder
- If next match has both players, winner is placed in correct position

---

### Cancel a Match (Give Bye)
**API:** `DELETE /api/v1/organizers/tournaments/:tournamentId/rounds/:roundId/matches/:matchId`

**Request:**
```json
{
  "giveByeTo": "player-uuid-1"  // Player who gets the bye
}
```

**What Happens:**
- Match is cancelled
- Specified player gets bye
- **AUTOMATIC:** Player is advanced to `nextMatchIdForWinner`

---

## 📊 Alternative: Get Bracket Status Only
**API:** `GET /api/v1/organizers/tournaments/:tournamentId/bracket/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "hasBracket": true,
    "bracketType": "power_of_2",
    "bracketSize": 16,
    "bracketGeneratedAt": "2025-12-15T10:05:00Z"
  }
}
```

---

## 🗑️ Delete Bracket (Revert to Manual)
**API:** `DELETE /api/v1/organizers/tournaments/:tournamentId/bracket`

**Request:**
```
DELETE /api/v1/organizers/tournaments/{tournamentId}/bracket
Headers: Authorization: Bearer {organizer_token}
```

**What Happens:**
- Deletes all bracket-linked matches
- Resets `bracket_type`, `bracket_size`, `bracket_generated_at` to `NULL`
- Tournament reverts to manual mode
- Existing manual rounds remain untouched

---

## 🎨 Frontend Display Logic

### For Organizer Portal:

1. **Check if Bracket Exists:**
   ```javascript
   if (tournament.bracketType === 'power_of_2') {
     // Show bracket view
   } else {
     // Show manual tournament view
   }
   ```

2. **Display Byes:**
   ```javascript
   match.isBye === true  // Show "BYE" badge
   round.byesCount > 0   // Show "X byes" in round header
   ```

3. **Show Match Connections:**
   ```javascript
   match.nextMatchIdForWinner  // Draw line to next match
   match.positionInBracket     // Position in bracket tree
   ```

4. **Auto-Update Display:**
   - When match is completed, winner automatically appears in next match
   - No need to manually move players
   - Just refresh tournament data to see updates

---

## 📝 Complete Flow Summary

```
1. Create Tournament
   ↓
2. Players Register (via customer APIs)
   ↓
3. Get Registered Players
   ↓
4. Start Tournament
   ↓
5. Generate Bracket (ONE TIME)
   ↓
6. Display Tournament Data (shows complete bracket)
   ↓
7. Complete Matches (winners auto-advance)
   ↓
8. Tournament Progresses Automatically
```

---

## ⚠️ Important Notes

1. **Bracket Generation is ONE TIME:**
   - Can only generate bracket once per tournament
   - If you need to regenerate, delete bracket first

2. **Tournament Must Be Started:**
   - Tournament status must be `started` before generating bracket

3. **All Players Must Be Registered:**
   - Only registered players can be included in bracket
   - Use `GET /tournaments/:id/players` to get valid player IDs

4. **Byes Only in Round 1:**
   - Byes are automatically assigned in Round 1 only
   - All subsequent rounds have real matches

5. **Auto-Advancement:**
   - Winners automatically advance to next match
   - No manual player movement needed
   - Just complete matches and winners move forward

---

## 🔗 Related APIs

- **Get Tournament Status:** `GET /api/v1/organizers/tournaments/:tournamentId/status`
- **Get Bracket View:** `GET /api/v1/organizers/tournaments/:tournamentId/bracket`
- **Create Match:** `POST /api/v1/organizers/tournaments/:tournamentId/rounds/:roundId/matches`
- **Update Match:** `PATCH /api/v1/organizers/tournaments/:tournamentId/rounds/:roundId/matches/:matchId`

---

## ✅ Testing Checklist

- [ ] Create tournament
- [ ] Register players
- [ ] Start tournament
- [ ] Generate bracket with 10 players (should create 16-size bracket with 6 byes)
- [ ] Verify Round 1 has 8 matches (4 real, 6 byes)
- [ ] Complete a match and verify winner appears in Round 2
- [ ] Display tournament data and verify all bracket fields are present
- [ ] Verify byes are shown correctly
- [ ] Test with different player counts (8, 16, 32, etc.)

