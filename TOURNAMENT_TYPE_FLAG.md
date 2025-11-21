# Tournament Type Flag

## Current Implementation

The tournament type is determined by the `bracket_type` field in the `tournaments` table:

### Tournament Types:

1. **Normal/Manual Tournament**
   - `bracket_type = NULL` (default)
   - Organizer creates rounds manually
   - Organizer adds players as they wish
   - No strict rules or regulations
   - Full flexibility

2. **Bracket Tournament**
   - `bracket_type = 'power_of_2'` (set when bracket is generated)
   - Follows strict bracket rules
   - Automatic advancement
   - Professional standards

## How It Works

### When Tournament is Created:
```json
{
  "tournamentName": "Spring Championship",
  "gameType": "8-ball",
  ...
}
```
- `bracket_type` is automatically set to `NULL`
- Tournament is a **Normal/Manual** tournament by default

### When Bracket is Generated:
```json
POST /api/v1/organizers/tournaments/:id/generate-bracket
{
  "playerIds": ["uuid1", "uuid2", ...]
}
```
- `bracket_type` is set to `'power_of_2'`
- Tournament becomes a **Bracket** tournament

## How to Check Tournament Type

### In API Response:

**Get Tournament API:**
```json
GET /api/v1/organizers/tournaments/:id

Response:
{
  "tournament": {
    "bracketType": null,  // ← NULL = Normal/Manual
    "bracketSize": null,
    "bracketGeneratedAt": null
  }
}
```

Or after bracket generation:
```json
{
  "tournament": {
    "bracketType": "power_of_2",  // ← 'power_of_2' = Bracket
    "bracketSize": 16,
    "bracketGeneratedAt": "2025-12-15T10:05:00Z"
  }
}
```

### Frontend Logic:

```javascript
// Check tournament type
if (tournament.bracketType === null || tournament.bracketType === undefined) {
  // Normal/Manual Tournament
  // Show: Manual round creation, flexible player management
  showManualTournamentUI();
} else if (tournament.bracketType === 'power_of_2') {
  // Bracket Tournament
  // Show: Bracket view, automatic advancement
  showBracketTournamentUI();
}
```

## Alternative: Add Tournament Type During Creation

If you want to set tournament type **during creation** (instead of waiting for bracket generation), we can add a `tournamentType` field:

### Option 1: Add `tournamentType` to Create Tournament API

```json
POST /api/v1/organizers/tournaments
{
  "tournamentName": "Spring Championship",
  "gameType": "8-ball",
  "tournamentType": "manual",  // or "bracket"
  ...
}
```

**Pros:**
- Clear intent from the start
- Frontend knows which UI to show immediately
- Can validate bracket requirements early

**Cons:**
- Redundant with `bracket_type` (we'd have two fields)
- Tournament type is determined by bracket generation anyway

### Option 2: Keep Current System (Recommended)

**Current system is better because:**
- `bracket_type` is the single source of truth
- Type is determined by actual bracket generation (not just intent)
- Simpler - one field instead of two
- Can't have mismatch between `tournamentType` and `bracket_type`

## Recommended Approach

**Use `bracket_type` as the flag:**

```javascript
// Check if tournament is bracket type
const isBracketTournament = tournament.bracketType === 'power_of_2';
const isManualTournament = tournament.bracketType === null;

// In UI
if (isBracketTournament) {
  // Show bracket view
  // Hide manual round creation
  // Show bracket-specific features
} else {
  // Show manual tournament view
  // Show round creation buttons
  // Show flexible player management
}
```

## Summary

- **Flag exists:** `bracket_type` field
- **Normal Tournament:** `bracket_type = NULL`
- **Bracket Tournament:** `bracket_type = 'power_of_2'`
- **Check in frontend:** `if (tournament.bracketType === 'power_of_2')`
- **Set automatically:** When bracket is generated (not during creation)

This system works well because:
1. Tournament starts as manual by default
2. Only becomes bracket when bracket is actually generated
3. Can't have inconsistent state
4. Single source of truth

