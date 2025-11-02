import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Trophy, Play, Award, User } from 'lucide-react';
import './MatchDetails.css';

const MatchDetails = () => {
  // Tournament info
  const [tournamentInfo] = useState({
    name: "Billiards Championship 2025",
    date: "2025-09-26",
    location: "Delhi Sports Complex",
    totalPlayers: 20,
    currentRound: 1,
    status: "ongoing"
  });

  // All 20 players with profile settings
  const players = {
    vijay: { id: 1, name: "Vijay Kumar", rating: 2250, profileVisibility: "public", wins: 45, losses: 12 },
    ram: { id: 2, name: "Ram Sharma", rating: 2100, profileVisibility: "public", wins: 38, losses: 15 },
    kumar: { id: 3, name: "Kumar Patel", rating: 2180, profileVisibility: "friends", wins: 42, losses: 18 },
    mukesh: { id: 4, name: "Mukesh Gupta", rating: 1950, profileVisibility: "private", wins: 28, losses: 22 },
    vishal: { id: 5, name: "Vishal Singh", rating: 2050, profileVisibility: "public", wins: 35, losses: 20 },
    chandu: { id: 6, name: "Chandu Verma", rating: 2120, profileVisibility: "friends", wins: 40, losses: 16 },
    subash: { id: 7, name: "Subash Reddy", rating: 1850, profileVisibility: "private", wins: 25, losses: 28 },
    santhosh: { id: 8, name: "Santhosh Kumar", rating: 1980, profileVisibility: "public", wins: 32, losses: 19 },
    rahul: { id: 9, name: "Rahul Sharma", rating: 1920, profileVisibility: "friends", wins: 30, losses: 21 },
    arjun: { id: 10, name: "Arjun Mehta", rating: 1750, profileVisibility: "private", wins: 22, losses: 25 },
    deepak: { id: 11, name: "Deepak Joshi", rating: 1880, profileVisibility: "public", wins: 26, losses: 24 },
    manoj: { id: 12, name: "Manoj Tiwari", rating: 1650, profileVisibility: "friends", wins: 20, losses: 30 },
    pradeep: { id: 13, name: "Pradeep Yadav", rating: 1820, profileVisibility: "private", wins: 24, losses: 26 },
    ashok: { id: 14, name: "Ashok Singh", rating: 1580, profileVisibility: "public", wins: 18, losses: 32 },
    ravi: { id: 15, name: "Ravi Agarwal", rating: 1720, profileVisibility: "friends", wins: 21, losses: 29 },
    naveen: { id: 16, name: "Naveen Kumar", rating: 1680, profileVisibility: "private", wins: 19, losses: 31 },
    kiran: { id: 17, name: "Kiran Sharma", rating: 1520, profileVisibility: "public", wins: 15, losses: 35 },
    ankit: { id: 18, name: "Ankit Jain", rating: 1620, profileVisibility: "friends", wins: 17, losses: 33 },
    vikash: { id: 19, name: "Vikash Singh", rating: 1450, profileVisibility: "private", wins: 12, losses: 38 },
    gopal: { id: 20, name: "Gopal Nair", rating: 1380, profileVisibility: "public", wins: 10, losses: 40 }
  };

  // Complete tournament bracket - 20 players knockout
  const [matches] = useState({
    // Round 1: 20 players -> 10 matches -> 10 winners
    round1: [
      { id: 1, sno: 1, player1: players.vijay, player2: players.gopal, winner: players.vijay, score: "15-8", status: "completed", completedAt: "2025-09-26T14:30:00", duration: "45 min" },
      { id: 2, sno: 2, player1: players.ram, player2: players.vikash, winner: players.ram, score: "15-6", status: "completed", completedAt: "2025-09-26T14:45:00", duration: "38 min" },
      { id: 3, sno: 3, player1: players.kumar, player2: players.ankit, winner: players.kumar, score: "15-11", status: "completed", completedAt: "2025-09-26T15:10:00", duration: "52 min" },
      { id: 4, sno: 4, player1: players.mukesh, player2: players.kiran, winner: players.mukesh, score: "15-9", status: "completed", completedAt: "2025-09-26T15:25:00", duration: "41 min" },
      { id: 5, sno: 5, player1: players.vishal, player2: players.naveen, winner: players.vishal, score: "15-12", status: "completed", completedAt: "2025-09-26T15:40:00", duration: "48 min" },
      { id: 6, sno: 6, player1: players.chandu, player2: players.ravi, winner: players.chandu, score: "15-10", status: "completed", completedAt: "2025-09-26T15:55:00", duration: "43 min" },
      { id: 7, sno: 7, player1: players.subash, player2: players.ashok, winner: null, score: "11-13", status: "ongoing", currentPlayer: players.ashok, startedAt: "2025-09-26T16:10:00", expectedDuration: "~15 min left" },
      { id: 8, sno: 8, player1: players.santhosh, player2: players.pradeep, winner: null, score: "", status: "pending", scheduledAt: "2025-09-26T16:30:00", expectedStart: "in 20 min" },
      { id: 9, sno: 9, player1: players.rahul, player2: players.manoj, winner: null, score: "", status: "pending", scheduledAt: "2025-09-26T16:45:00", expectedStart: "in 35 min" },
      { id: 10, sno: 10, player1: players.arjun, player2: players.deepak, winner: null, score: "", status: "pending", scheduledAt: "2025-09-26T17:00:00", expectedStart: "in 50 min" }
    ],
    // Round 2: 10 winners -> 5 matches -> 5 winners
    round2: [
      { id: 11, sno: 1, player1: players.vijay, player2: players.ram, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T17:30:00", expectedStart: "after Round 1 completes" },
      { id: 12, sno: 2, player1: players.kumar, player2: players.mukesh, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T17:45:00", expectedStart: "after Round 1 completes" },
      { id: 13, sno: 3, player1: players.vishal, player2: players.chandu, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T18:00:00", expectedStart: "after Round 1 completes" },
      { id: 14, sno: 4, player1: null, player2: null, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T18:15:00", expectedStart: "waiting for Match 7&8 winners" },
      { id: 15, sno: 5, player1: null, player2: null, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T18:30:00", expectedStart: "waiting for Match 9&10 winners" }
    ],
    // Round 3: 5 winners -> 2 matches + 1 bye -> 3 players
    round3: [
      { id: 16, sno: 1, player1: null, player2: null, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T19:00:00", expectedStart: "after Round 2 completes" },
      { id: 17, sno: 2, player1: null, player2: null, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T19:15:00", expectedStart: "after Round 2 completes" }
    ],
    // Round 4: Semi Final -> 2 winners
    round4: [
      { id: 18, sno: 1, player1: null, player2: null, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T19:45:00", expectedStart: "after Round 3 completes" }
    ],
    // Round 5: Final
    round5: [
      { id: 19, sno: 1, player1: null, player2: null, winner: null, score: "", status: "waiting", scheduledAt: "2025-09-26T20:30:00", expectedStart: "Championship Match" }
    ]
  });

  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getRoundName = (round: number) => {
    switch(round) {
      case 1: return "Round 1 (First Round)";
      case 2: return "Round 2 (Second Round)"; 
      case 3: return "Round 3 (Quarter Final)";
      case 4: return "Round 4 (Semi Final)";
      case 5: return "Round 5 (Final)";
      default: return `Round ${round}`;
    }
  };

  const getRoundDescription = (round: number) => {
    switch(round) {
      case 1: return "20 players → 10 matches → 10 winners";
      case 2: return "10 players → 5 matches → 5 winners"; 
      case 3: return "5 players → 2 matches + 1 bye → 3 players";
      case 4: return "3 players → 1 match + 1 bye → 2 players";
      case 5: return "2 players → 1 match → Champion";
      default: return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'ongoing': return <Play className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'waiting': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'ongoing': return 'Live Now';
      case 'pending': return 'Scheduled';
      case 'waiting': return 'Awaiting';
      default: return 'Pending';
    }
  };

  const handlePlayerClick = (player: any) => {
    if (!player) return;
    
    // Check profile visibility
    const currentUser = { id: 999, name: "Current User", friends: [1, 2, 3, 5, 8, 10, 14, 17, 20] }; // Mock current user
    
    if (player.profileVisibility === "public") {
      setSelectedPlayer(player);
      setShowProfileModal(true);
    } else if (player.profileVisibility === "friends" && currentUser.friends.includes(player.id)) {
      setSelectedPlayer(player);
      setShowProfileModal(true);
    } else if (player.profileVisibility === "private") {
      alert(`${player.name}'s profile is private. Only they can view their profile.`);
    } else {
      alert(`${player.name}'s profile is only visible to friends.`);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedPlayer(null);
  };

  const getStatusBadge = (status: string) => {
    const statusClass = `status-badge status-${status}`;
    const statusText = getStatusText(status);
    
    return (
      <span className={statusClass}>
        {status === 'ongoing' && '🔴'}
        {status === 'completed' && '✅'}
        {status === 'pending' && '⏳'}
        {status === 'waiting' && '⏸️'}
        {statusText}
      </span>
    );
  };

  const getCurrentRoundMatches = () => {
    switch(selectedRound) {
      case 1: return matches.round1;
      case 2: return matches.round2;
      case 3: return matches.round3;
      case 4: return matches.round4;
      case 5: return matches.round5;
      default: return [];
    }
  };

  // Enhanced Excel-style table view with icons and player details
  const renderTable = () => {
    const currentMatches = getCurrentRoundMatches();
    
    const getPlayerRank = (player: any) => {
      if (!player) return null;
      const allPlayers = Object.values(players);
      const sortedPlayers = allPlayers.sort((a: any, b: any) => b.rating - a.rating);
      return sortedPlayers.findIndex((p: any) => p.id === player.id) + 1;
    };

    const getRankIcon = (rank: number) => {
      if (rank === 1) return "🥇";
      if (rank === 2) return "🥈";
      if (rank === 3) return "🥉";
      if (rank <= 5) return "🏆";
      if (rank <= 10) return "⭐";
      return "👤";
    };

    const getWinnerIcon = (status: string, winner: any) => {
      if (winner) return "🏆";
      if (status === 'ongoing') return "🔴";
      if (status === 'pending') return "⏳";
      if (status === 'waiting') return "⏸️";
      return "⏳";
    };

    const getTimeDetails = (match: any) => {
      const formatTime = (timeString: string) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      };

      const calculateEndTime = (startTime: string, durationStr: string) => {
        if (!startTime || !durationStr) return '';
        try {
          const start = new Date(startTime);
          const durationMinutes = parseInt(durationStr.toString().replace(/\D/g, '')) || 45;
          const end = new Date(start.getTime() + (durationMinutes * 60000));
          return formatTime(end.toISOString());
        } catch (error) {
          return '';
        }
      };

      const getStartTime = (completedAt: string, duration: string) => {
        if (!completedAt || !duration) return '';
        try {
          const end = new Date(completedAt);
          const durationMinutes = parseInt(duration.toString().replace(/\D/g, '')) || 45;
          const start = new Date(end.getTime() - (durationMinutes * 60000));
          return formatTime(start.toISOString());
        } catch (error) {
          return '';
        }
      };

      if (match.status === 'completed') {
        return {
          startTime: {
            time: getStartTime(match.completedAt, match.duration),
            label: 'Started',
            className: 'text-green-600'
          },
          endTime: {
            time: formatTime(match.completedAt),
            label: 'Finished',
            className: 'text-green-600'
          },
          duration: {
            time: match.duration || '45 min',
            label: 'Total Time',
            className: 'text-green-600'
          }
        };
      } else if (match.status === 'ongoing') {
        return {
          startTime: {
            time: formatTime(match.startedAt),
            label: 'Started',
            className: 'text-blue-600'
          },
          endTime: {
            time: 'Live',
            label: 'In Progress',
            className: 'text-blue-600'
          },
          duration: {
            time: match.expectedDuration || '~15 min left',
            label: 'Remaining',
            className: 'text-blue-600'
          }
        };
      } else if (match.status === 'pending') {
        return {
          startTime: {
            time: formatTime(match.scheduledAt),
            label: 'Scheduled',
            className: 'text-yellow-600'
          },
          endTime: {
            time: calculateEndTime(match.scheduledAt, '45'),
            label: 'Expected End',
            className: 'text-yellow-600'
          },
          duration: {
            time: match.expectedStart || 'Soon',
            label: 'Starts',
            className: 'text-yellow-600'
          }
        };
      } else if (match.status === 'waiting') {
        return {
          startTime: {
            time: formatTime(match.scheduledAt),
            label: 'Planned',
            className: 'text-gray-500'
          },
          endTime: {
            time: 'TBD',
            label: 'Awaiting',
            className: 'text-gray-500'
          },
          duration: {
            time: 'Waiting',
            label: match.expectedStart || 'Dependencies',
            className: 'text-gray-500'
          }
        };
      }
      return null;
    };

    const formatPlayerDisplay = (player: any, isWinner: boolean, isLeading: boolean) => {
      if (!player) return { name: 'TBD', details: 'Awaiting winner', className: 'text-gray-400 italic' };
      
      const rank = getPlayerRank(player);
      const rankIcon = getRankIcon(rank || 0);
      
      let className = 'text-gray-800';
      if (isWinner) className = 'font-bold text-green-700';
      else if (isLeading) className = 'font-semibold text-blue-700';
      
      return {
        name: player.name,
        details: `${rankIcon} Rank #${rank} • Rating: ${player.rating}`,
        className
      };
    };
    
    return (
      <div className="excel-table">
        {/* Enhanced Header */}
        <div className="table-header">
          <div className="table-header-row">
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>📋 S.No</span>
            </div>
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>👥 Player Details</span>
            </div>
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>🏆 Winner</span>
            </div>
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>📊 Status</span>
            </div>
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>🕐 Start Time</span>
            </div>
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>⏰ End Time</span>
            </div>
            <div className="table-header-cell">
              <span style={{ fontSize: '18px' }}>⏳ Duration</span>
            </div>
          </div>
        </div>
        
        <div className="table-body">
          {currentMatches.map((match: any, index: number) => {
            const timeDetails = getTimeDetails(match);
            return (
              <div key={match.id} className="match-row">
                {/* First player row */}
                <div className="player-row">
                  <div className="player-cell serial-cell">
                    <div>{match.sno}</div>
                  </div>
                  <div className="player-cell player-details">
                    {(() => {
                      const playerInfo = formatPlayerDisplay(
                        match.player1, 
                        match.winner?.id === match.player1?.id, 
                        (match as any).currentPlayer?.id === match.player1?.id
                      );
                      return (
                        <div>
                          <div 
                            className={`player-name ${playerInfo.className} clickable`}
                            onClick={() => handlePlayerClick(match.player1)}
                            style={{ cursor: 'pointer' }}
                          >
                            {playerInfo.name}
                          </div>
                          <div className="player-info">
                            {playerInfo.details}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="player-cell winner-cell">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '24px' }}>{getWinnerIcon(match.status, match.winner)}</span>
                      </div>
                      {match.winner ? (
                        <div>
                          <div className="winner-name">{match.winner.name}</div>
                          <div className="winner-score">
                            {match.score ? `Final: ${match.score}` : 'Victory!'}
                          </div>
                        </div>
                      ) : match.status === 'ongoing' ? (
                        <div>
                          <div style={{ color: '#1d4ed8', fontWeight: '600', fontSize: '14px' }}>LIVE MATCH</div>
                          {(match as any).currentPlayer && (
                            <div style={{ fontSize: '12px', color: '#1d4ed8' }}>{(match as any).currentPlayer.name} leads</div>
                          )}
                          {match.score && (
                            <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '4px' }}>Score: {match.score}</div>
                          )}
                        </div>
                      ) : match.status === 'waiting' ? (
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          <div>Waiting...</div>
                          <div style={{ fontSize: '12px' }}>Previous round</div>
                        </div>
                      ) : (
                        <div style={{ color: '#d97706', fontSize: '14px' }}>
                          <div>Scheduled</div>
                          <div style={{ fontSize: '12px' }}>Ready to play</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="player-cell" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
                    {getStatusBadge(match.status)}
                  </div>
                  <div className="player-cell time-cell">
                    {timeDetails?.startTime && (
                      <div>
                        <div className={`time-value ${timeDetails.startTime.className}`}>
                          {timeDetails.startTime.time}
                        </div>
                        <div className="time-label">
                          {timeDetails.startTime.label}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="player-cell time-cell">
                    {timeDetails?.endTime && (
                      <div>
                        <div className={`time-value ${timeDetails.endTime.className}`}>
                          {timeDetails.endTime.time}
                        </div>
                        <div className="time-label">
                          {timeDetails.endTime.label}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="player-cell time-cell">
                    {timeDetails?.duration && (
                      <div>
                        <div className={`time-value ${timeDetails.duration.className}`}>
                          {timeDetails.duration.time}
                        </div>
                        <div className="time-label">
                          {timeDetails.duration.label}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Second player row */}
                <div className="player-row">
                  <div className="player-cell serial-cell">
                    <div>{match.sno + 1}</div>
                  </div>
                  <div className="player-cell player-details">
                    {(() => {
                      const playerInfo = formatPlayerDisplay(
                        match.player2, 
                        match.winner?.id === match.player2?.id, 
                        (match as any).currentPlayer?.id === match.player2?.id
                      );
                      return (
                        <div>
                          <div 
                            className={`player-name ${playerInfo.className} clickable`}
                            onClick={() => handlePlayerClick(match.player2)}
                            style={{ cursor: 'pointer' }}
                          >
                            {playerInfo.name}
                          </div>
                          <div className="player-info">
                            {playerInfo.details}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="player-cell">
                    {/* Empty for second player row in winner column */}
                  </div>
                  <div className="player-cell">
                    {/* Empty for second player row in status column */}
                  </div>
                  <div className="player-cell">
                    {/* Empty for second player row in start time column */}
                  </div>
                  <div className="player-cell">
                    {/* Empty for second player row in end time column */}
                  </div>
                  <div className="player-cell">
                    {/* Empty for second player row in duration column */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced Footer */}
        <div style={{ 
          background: 'linear-gradient(to right, #f3f4f6, #e5e7eb)', 
          padding: '12px 24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>🏆 Winner</span>
              <span>📊 Status</span>
              <span>🔴 Live</span>
              <span>⏳ Scheduled</span>
              <span>⏸️ Awaiting</span>
              <span>🕐 Start</span>
              <span>⏰ End</span>
              <span>⏳ Duration</span>
            </div>
            <div style={{ fontSize: '12px' }}>
              Total Matches: {currentMatches.length} • All times in 24hr format
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get tournament statistics
  const getStats = () => {
    const allMatches = [...matches.round1, ...matches.round2, ...matches.round3, ...matches.round4, ...matches.round5];
    const completed = allMatches.filter(m => m.status === 'completed').length;
    const ongoing = allMatches.filter(m => m.status === 'ongoing').length;
    const pending = allMatches.filter(m => m.status === 'pending').length;
    const waiting = allMatches.filter(m => m.status === 'waiting').length;
    
    return { completed, ongoing, pending, waiting };
  };

  const stats = getStats();

  return (
    <div className="tournament-container">
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Tournament Header */}
        <div className="tournament-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h1 className="tournament-title">{tournamentInfo.name}</h1>
              <div className="tournament-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  {new Date(tournamentInfo.date).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin style={{ width: '16px', height: '16px' }} />
                  {tournamentInfo.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users style={{ width: '16px', height: '16px' }} />
                  {tournamentInfo.totalPlayers} Players
                </div>
              </div>
            </div>
            <div>
              <span style={{ 
                background: '#dbeafe', 
                color: '#1e40af', 
                padding: '4px 12px', 
                borderRadius: '9999px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                Tournament in Progress
              </span>
            </div>
          </div>
        </div>

        {/* Round Navigation */}
        <div className="round-navigation">
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Tournament Bracket - All Rounds
          </h2>
          <div className="round-tabs">
            {[1, 2, 3, 4, 5].map(round => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`round-tab ${selectedRound === round ? 'active' : ''}`}
              >
                {getRoundName(round)}
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                  ({getCurrentRoundMatches().length})
                </span>
              </button>
            ))}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            background: '#f9fafb', 
            padding: '12px', 
            borderRadius: '6px' 
          }}>
            <strong>{getRoundName(selectedRound)}:</strong> {getRoundDescription(selectedRound)}
          </div>
        </div>

        {/* Excel-style Table View */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>
            {getRoundName(selectedRound)} - Excel View
          </h2>
          {renderTable()}
        </div>

        {/* Live Tournament Statistics */}
        <div className="stats-section">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>
            Complete Tournament Overview
          </h2>
          <div className="stats-grid">
            <div className="stat-card stat-completed">
              <div className="stat-number" style={{ color: '#16a34a' }}>{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-ongoing">
              <div className="stat-number" style={{ color: '#2563eb' }}>{stats.ongoing}</div>
              <div className="stat-label">Live Now</div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-number" style={{ color: '#d97706' }}>{stats.pending}</div>
              <div className="stat-label">Scheduled</div>
            </div>
            <div className="stat-card stat-waiting">
              <div className="stat-number" style={{ color: '#6b7280' }}>{stats.waiting}</div>
              <div className="stat-label">Awaiting</div>
            </div>
          </div>
          
          {/* Tournament Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(stats.completed / (stats.completed + stats.ongoing + stats.pending + stats.waiting)) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Tournament Progress: {Math.round((stats.completed / (stats.completed + stats.ongoing + stats.pending + stats.waiting)) * 100)}% Complete
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedPlayer && (
        <div className="profile-modal" onClick={closeProfileModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <div className="profile-avatar">
                {selectedPlayer.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="profile-info">
                <h3>{selectedPlayer.name}</h3>
                <p>Rating: {selectedPlayer.rating}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">{selectedPlayer.wins}</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedPlayer.losses}</div>
                <div className="stat-label">Losses</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedPlayer.rating}</div>
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {Math.round((selectedPlayer.wins / (selectedPlayer.wins + selectedPlayer.losses)) * 100)}%
                </div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>

            <div className="profile-visibility">
              <div className="visibility-label">
                {selectedPlayer.profileVisibility === 'public' && '🌍 Public Profile'}
                {selectedPlayer.profileVisibility === 'friends' && '👥 Friends Only'}
                {selectedPlayer.profileVisibility === 'private' && '🔒 Private Profile'}
              </div>
              <div className="visibility-info">
                {selectedPlayer.profileVisibility === 'public' && 'Anyone can view this profile'}
                {selectedPlayer.profileVisibility === 'friends' && 'Only friends can view this profile'}
                {selectedPlayer.profileVisibility === 'private' && 'Only you can view this profile'}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={closeProfileModal}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;
