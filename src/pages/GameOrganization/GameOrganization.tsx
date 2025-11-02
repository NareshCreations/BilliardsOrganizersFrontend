import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BaseComponent } from '../../components/base/BaseComponent';
import { Match } from '../../types/Match';

interface GameOrganizationState {
  players: any[];
  shuffledMatches: any[];
  showShuffled: boolean;
  currentRound: number;
  totalRounds: number;
}

export class GameOrganization extends BaseComponent<{}, GameOrganizationState> {
  private matchData: Match | null = null;

  constructor(props: {}) {
    super(props);
    this.state = this.getInitialState();
  }

  protected getInitialState(): GameOrganizationState {
    return {
      players: [],
      shuffledMatches: [],
      showShuffled: false,
      currentRound: 1,
      totalRounds: 0
    };
  }

  componentDidMount() {
    this.loadMatchData();
  }

  private loadMatchData = (): void => {
    // Mock data - in real app, this would come from API
    const mockMatch: Match = {
      id: 1,
      name: "9-Ball Championship",
      gameType: "9-ball",
      organizerName: "Rajesh Tournament Director",
      organizerDescription: "Professional tournament organizer with 15+ years experience",
      date: "2025-10-15",
      time: "14:00",
      status: "scheduled",
      players: 40,
      maxPlayers: 50,
      entryFee: 50,
      venue: "Delhi Sports Complex - Main Branch",
      location: {
        id: 1,
        name: "Delhi Sports Complex - Main Branch",
        address: "123 Sports Avenue, New Delhi, India",
        coordinates: { lat: 28.6139, lng: 77.2090 },
        amenities: ["Parking", "Food Court", "Restrooms", "WiFi"]
      },
      ballRules: "lastball-yes-ballinhand-yes",
      registeredPlayers: [
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', skill: 'Advanced', registeredAt: '2025-10-01', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: 2, name: 'Priya Sharma', email: 'priya@email.com', skill: 'Intermediate', registeredAt: '2025-10-02', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
        { id: 3, name: 'Amit Patel', email: 'amit@email.com', skill: 'Expert', registeredAt: '2025-10-03', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', skill: 'Pro', registeredAt: '2025-10-04', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
        { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', skill: 'Advanced', registeredAt: '2025-10-05', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
        { id: 6, name: 'Ananya Gupta', email: 'ananya@email.com', skill: 'Intermediate', registeredAt: '2025-10-06', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
        { id: 7, name: 'Rohit Verma', email: 'rohit@email.com', skill: 'Expert', registeredAt: '2025-10-07', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
        { id: 8, name: 'Kavya Nair', email: 'kavya@email.com', skill: 'Pro', registeredAt: '2025-10-08', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
        { id: 9, name: 'Arjun Mehta', email: 'arjun@email.com', skill: 'Advanced', registeredAt: '2025-10-09', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
        { id: 10, name: 'Isha Joshi', email: 'isha@email.com', skill: 'Intermediate', registeredAt: '2025-10-10', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
        { id: 11, name: 'Deepak Kumar', email: 'deepak@email.com', skill: 'Expert', registeredAt: '2025-10-11', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
        { id: 12, name: 'Meera Iyer', email: 'meera@email.com', skill: 'Pro', registeredAt: '2025-10-12', profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' },
        { id: 13, name: 'Suresh Rao', email: 'suresh@email.com', skill: 'Advanced', registeredAt: '2025-10-13', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: 14, name: 'Divya Agarwal', email: 'divya@email.com', skill: 'Intermediate', registeredAt: '2025-10-14', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
        { id: 15, name: 'Ravi Sharma', email: 'ravi@email.com', skill: 'Expert', registeredAt: '2025-10-15', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { id: 16, name: 'Pooja Desai', email: 'pooja@email.com', skill: 'Pro', registeredAt: '2025-10-16', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
        { id: 17, name: 'Kiran Malhotra', email: 'kiran@email.com', skill: 'Advanced', registeredAt: '2025-10-17', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
        { id: 18, name: 'Neha Kapoor', email: 'neha@email.com', skill: 'Intermediate', registeredAt: '2025-10-18', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
        { id: 19, name: 'Manoj Tiwari', email: 'manoj@email.com', skill: 'Expert', registeredAt: '2025-10-19', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
        { id: 20, name: 'Shruti Jain', email: 'shruti@email.com', skill: 'Pro', registeredAt: '2025-10-20', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
        { id: 21, name: 'Gaurav Chawla', email: 'gaurav@email.com', skill: 'Advanced', registeredAt: '2025-10-21', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
        { id: 22, name: 'Ritu Bansal', email: 'ritu@email.com', skill: 'Intermediate', registeredAt: '2025-10-22', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
        { id: 23, name: 'Nikhil Agarwal', email: 'nikhil@email.com', skill: 'Expert', registeredAt: '2025-10-23', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
        { id: 24, name: 'Sunita Reddy', email: 'sunita@email.com', skill: 'Pro', registeredAt: '2025-10-24', profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' },
        { id: 25, name: 'Rajesh Kumar', email: 'rajesh2@email.com', skill: 'Advanced', registeredAt: '2025-10-25', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: 26, name: 'Priya Sharma', email: 'priya2@email.com', skill: 'Intermediate', registeredAt: '2025-10-26', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
        { id: 27, name: 'Amit Patel', email: 'amit2@email.com', skill: 'Expert', registeredAt: '2025-10-27', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { id: 28, name: 'Sneha Reddy', email: 'sneha2@email.com', skill: 'Pro', registeredAt: '2025-10-28', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
        { id: 29, name: 'Vikram Singh', email: 'vikram2@email.com', skill: 'Advanced', registeredAt: '2025-10-29', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
        { id: 30, name: 'Ananya Gupta', email: 'ananya2@email.com', skill: 'Intermediate', registeredAt: '2025-10-30', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
        { id: 31, name: 'Rohit Verma', email: 'rohit2@email.com', skill: 'Expert', registeredAt: '2025-11-01', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
        { id: 32, name: 'Kavya Nair', email: 'kavya2@email.com', skill: 'Pro', registeredAt: '2025-11-02', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
        { id: 33, name: 'Arjun Mehta', email: 'arjun2@email.com', skill: 'Advanced', registeredAt: '2025-11-03', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
        { id: 34, name: 'Isha Joshi', email: 'isha2@email.com', skill: 'Intermediate', registeredAt: '2025-11-04', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
        { id: 35, name: 'Deepak Kumar', email: 'deepak2@email.com', skill: 'Expert', registeredAt: '2025-11-05', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
        { id: 36, name: 'Meera Iyer', email: 'meera2@email.com', skill: 'Pro', registeredAt: '2025-11-06', profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' },
        { id: 37, name: 'Suresh Rao', email: 'suresh2@email.com', skill: 'Advanced', registeredAt: '2025-11-07', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: 38, name: 'Divya Agarwal', email: 'divya2@email.com', skill: 'Intermediate', registeredAt: '2025-11-08', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
        { id: 39, name: 'Ravi Sharma', email: 'ravi2@email.com', skill: 'Expert', registeredAt: '2025-11-09', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { id: 40, name: 'Pooja Desai', email: 'pooja2@email.com', skill: 'Pro', registeredAt: '2025-11-10', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' }
      ],
      notifiedUsers: {
        type: 'all',
        count: 3,
        users: [],
        message: 'Join our exciting 9-Ball Championship!'
      }
    };

    this.matchData = mockMatch;
    this.setState({
      players: mockMatch.registeredPlayers || []
    });
  };

  private handleShuffleGame = (): void => {
    const shuffledPlayers = [...this.state.players].sort(() => Math.random() - 0.5);
    const matches = this.createTournamentBracket(shuffledPlayers);
    
    this.setState({
      shuffledMatches: matches,
      showShuffled: true,
      currentRound: 1,
      totalRounds: this.calculateTotalRounds(shuffledPlayers.length)
    });
  };

  private createTournamentBracket = (players: any[]): any[] => {
    const matches = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matches.push({
          id: Math.floor(i / 2) + 1,
          player1: players[i],
          player2: players[i + 1],
          status: 'pending',
          round: 1
        });
      }
    }
    return matches;
  };

  private calculateTotalRounds = (playerCount: number): number => {
    return Math.ceil(Math.log2(playerCount));
  };

  private handleBackToMatches = (): void => {
    window.location.href = '/matches';
  };

  render() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={this.handleBackToMatches}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Matches
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold text-gray-900">Game Organization</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tournament Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{this.matchData?.name}</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {this.matchData?.players}/{this.matchData?.maxPlayers} Players
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(this.matchData?.date || '').toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {this.matchData?.time}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {this.matchData?.venue}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                ${this.matchData?.entryFee}
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Registered Players ({this.state.players.length})</h3>
              <button
                onClick={this.handleShuffleGame}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Shuffle Game
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {this.state.players.map((player) => (
                <div key={player.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <img
                        src={player.profilePic}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {player.id}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{player.name}</div>
                      <div className="text-sm text-gray-600">{player.email}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      player.skill === 'Pro' ? 'bg-purple-100 text-purple-800' :
                      player.skill === 'Expert' ? 'bg-red-100 text-red-800' :
                      player.skill === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {player.skill}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(player.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tournament Bracket */}
          {this.state.showShuffled && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Tournament Bracket - Round 1</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {this.state.shuffledMatches.length} matches
                  </span>
                  <span className="text-sm text-gray-600">
                    {this.state.shuffledMatches.length * 2} players
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {this.state.shuffledMatches.map((match) => (
                  <div key={match.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Match #{match.id}</h4>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {/* Player 1 */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <img
                            src={match.player1.profilePic}
                            alt={match.player1.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {match.player1.id}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{match.player1.name}</div>
                          <div className="text-sm text-gray-600">{match.player1.email}</div>
                          <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                            match.player1.skill === 'Pro' ? 'bg-purple-100 text-purple-800' :
                            match.player1.skill === 'Expert' ? 'bg-red-100 text-red-800' :
                            match.player1.skill === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {match.player1.skill}
                          </div>
                        </div>
                      </div>

                      {/* VS */}
                      <div className="flex items-center justify-center mx-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-sm">VS</span>
                        </div>
                      </div>

                      {/* Player 2 */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <img
                            src={match.player2.profilePic}
                            alt={match.player2.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {match.player2.id}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{match.player2.name}</div>
                          <div className="text-sm text-gray-600">{match.player2.email}</div>
                          <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                            match.player2.skill === 'Pro' ? 'bg-purple-100 text-purple-800' :
                            match.player2.skill === 'Expert' ? 'bg-red-100 text-red-800' :
                            match.player2.skill === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {match.player2.skill}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
