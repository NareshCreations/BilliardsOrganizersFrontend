import React, { useState } from 'react';
import { Calendar, Clock, Users, Settings, Trophy, Plus, Save, X, Check, AlertCircle, MapPin, User, Target } from 'lucide-react';

const OrganizerMatchScheduler = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showNotifiedUsers, setShowNotifiedUsers] = useState(false);

  const [matchForm, setMatchForm] = useState({
    matchName: '',
    gameType: '9-ball',
    organizerName: '',
    organizerDescription: '',
    ballRules: 'lastball-yes-ballinhand-yes',
    fewRules: '',
    matchDate: '',
    matchTime: '',
    registrationEndTime: '',
    venue: '',
    locationId: '',
    entryFee: '',
    maxPlayers: '',
    moreDetails: ''
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const organizationLocations = [
    {
      id: 'loc1',
      name: 'Delhi Sports Complex - Main Branch',
      address: '123 Connaught Place, New Delhi, Delhi 110001, India',
      phone: '+91 11 2334 5678',
      facilities: ['8 Pool Tables', 'Snooker Tables', 'Restaurant', 'Parking']
    },
    {
      id: 'loc2',
      name: 'Mumbai Billiards Hall - Bandra Branch', 
      address: '456 Bandra West, Mumbai, Maharashtra 400050, India',
      phone: '+91 22 2645 7890',
      facilities: ['6 Pool Tables', 'Bar', 'AC Halls', 'Valet Parking']
    }
  ];

  const registeredCustomers = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', skill: 'Advanced' },
    { id: 2, name: 'Priya Sharma', email: 'priya@email.com', skill: 'Intermediate' },
    { id: 3, name: 'Amit Patel', email: 'amit@email.com', skill: 'Beginner' }
  ];

  const gameTypes = [
    { value: '8-ball', label: '8-Ball Pool' },
    { value: '9-ball', label: '9-Ball Pool' },
    { value: '10-ball', label: '10-Ball Pool' }
  ];

  const ballRulesOptions = [
    { value: 'lastball-yes-ballinhand-yes', label: 'Last Ball Last Pocket: Yes, Ball in Hand: Yes' },
    { value: 'lastball-yes-ballinhand-no', label: 'Last Ball Last Pocket: Yes, Ball in Hand: No' },
    { value: 'lastball-no-ballinhand-yes', label: 'Last Ball Last Pocket: No, Ball in Hand: Yes' },
    { value: 'lastball-no-ballinhand-no', label: 'Last Ball Last Pocket: No, Ball in Hand: No' }
  ];

  const scheduledMatches = [
    {
      id: 1,
      name: "9-Ball Championship",
      gameType: "9-ball",
      organizerName: "Rajesh Tournament Director",
      organizerDescription: "Professional tournament organizer with 15+ years experience",
      date: "2025-10-15",
      time: "14:00", 
      status: "scheduled",
      players: 16,
      maxPlayers: 32,
      entryFee: 50,
      venue: "Delhi Sports Complex - Main Branch",
      location: organizationLocations[0],
      ballRules: "lastball-yes-ballinhand-yes",
      registeredPlayers: [
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', skill: 'Advanced', registeredAt: '2025-10-01' },
        { id: 2, name: 'Priya Sharma', email: 'priya@email.com', skill: 'Intermediate', registeredAt: '2025-10-02' }
      ],
      notifiedUsers: {
        type: 'all',
        count: 3,
        users: registeredCustomers,
        message: 'Join our exciting 9-Ball Championship!'
      }
    }
  ];

  const previousMatches = [
    {
      id: 3,
      name: "Summer 9-Ball Cup",
      gameType: "9-ball",
      organizerName: "Priya Tournament Pro", 
      date: "2025-09-15",
      time: "10:00",
      status: "completed",
      players: 32,
      maxPlayers: 32,
      entryFee: 75,
      venue: "Chennai Sports Club",
      winner: "Rajesh Kumar",
      prize: "$500",
      registeredPlayers: [
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', skill: 'Advanced', finalPosition: 1 },
        { id: 2, name: 'Priya Sharma', email: 'priya@email.com', skill: 'Intermediate', finalPosition: 2 }
      ],
      tournamentLink: "/tournament-results/summer-9ball-cup-2025",
      notifiedUsers: {
        type: 'all',
        count: 3,
        users: registeredCustomers,
        message: 'Summer championship is here!'
      }
    }
  ];

  const handleInputChange = (field, value) => {
    setMatchForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'locationId') {
      const location = organizationLocations.find(loc => loc.id === value);
      setSelectedLocation(location);
      if (location) {
        setMatchForm(prev => ({
          ...prev,
          venue: location.name
        }));
      }
    }
  };

  const handleSubmit = () => {
    console.log('Match scheduled:', matchForm);
    setIsCreatingMatch(false);
    setIsEditMode(false);
    setMatchForm({
      matchName: '',
      gameType: '9-ball',
      organizerName: '',
      organizerDescription: '',
      ballRules: 'lastball-yes-ballinhand-yes',
      fewRules: '',
      matchDate: '',
      matchTime: '',
      registrationEndTime: '',
      venue: '',
      locationId: '',
      entryFee: '',
      maxPlayers: '',
      moreDetails: ''
    });
    setSelectedLocation(null);
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowMatchDetails(true);
  };

  const handleEditMatch = (match) => {
    setIsEditMode(true);
    setIsCreatingMatch(true);
    
    setMatchForm({
      matchName: match.name,
      gameType: match.gameType,
      organizerName: match.organizerName || '',
      organizerDescription: match.organizerDescription || '',
      ballRules: match.ballRules,
      fewRules: match.fewRules || '',
      matchDate: match.date,
      matchTime: match.time,
      registrationEndTime: '',
      venue: match.venue,
      locationId: match.location?.id || '',
      entryFee: match.entryFee.toString(),
      maxPlayers: match.maxPlayers.toString(),
      moreDetails: match.moreDetails || ''
    });
    
    if (match.location) {
      setSelectedLocation(match.location);
    }
  };

  const handleShowNotifiedUsers = (match) => {
    setShowNotifiedUsers(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizer Portal</h1>
                <p className="text-sm text-gray-600">Billiards Tournament Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">John Organizer</div>
                <div className="text-xs text-gray-500">Tournament Director</div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Schedule Match
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scheduled'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Scheduled Matches
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'previous'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Previous Matches
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Schedule Match Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {!isCreatingMatch ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Match</h2>
                  <p className="text-gray-600 mb-6">Schedule a new billiards tournament with custom rules and settings</p>
                  <button
                    onClick={() => setIsCreatingMatch(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Schedule New Match
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {isEditMode ? 'Edit Match Setup' : 'New Match Setup'}
                      </h2>
                      <p className="text-blue-100 mt-1">
                        {isEditMode ? 'Update your tournament details' : 'Configure your tournament details'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingMatch(false);
                        setIsEditMode(false);
                      }}
                      className="text-white hover:text-blue-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Match Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={matchForm.matchName}
                          onChange={(e) => handleInputChange('matchName', e.target.value)}
                          placeholder="e.g., 9-Ball Championship 2025"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location *
                        </label>
                        <select
                          value={matchForm.locationId}
                          onChange={(e) => handleInputChange('locationId', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Location</option>
                          {organizationLocations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Location Details */}
                    {selectedLocation && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Address:</span> {selectedLocation.address}</p>
                          <p><span className="font-medium">Phone:</span> {selectedLocation.phone}</p>
                          <div>
                            <span className="font-medium">Facilities:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedLocation.facilities.map((facility, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Game Configuration */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Game Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Game Type *
                        </label>
                        <select
                          value={matchForm.gameType}
                          onChange={(e) => handleInputChange('gameType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {gameTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Game Organizer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={matchForm.organizerName}
                          onChange={(e) => handleInputChange('organizerName', e.target.value)}
                          placeholder="e.g., John Tournament Director"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organizer Description
                      </label>
                      <textarea
                        value={matchForm.organizerDescription}
                        onChange={(e) => handleInputChange('organizerDescription', e.target.value)}
                        placeholder="Brief description about the organizer's experience and credentials..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Ball Rules */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ball Rules
                      </label>
                      <select
                        value={matchForm.ballRules}
                        onChange={(e) => handleInputChange('ballRules', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {ballRulesOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Few Rules */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Few Rules...
                      </label>
                      <textarea
                        value={matchForm.fewRules}
                        onChange={(e) => handleInputChange('fewRules', e.target.value)}
                        placeholder="Add specific rules for this tournament..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* More Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      More Details...
                    </label>
                    <textarea
                      value={matchForm.moreDetails}
                      onChange={(e) => handleInputChange('moreDetails', e.target.value)}
                      placeholder="Add any additional details, venue information, or notes for players..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Submit Actions */}
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 -mx-8">
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingMatch(false);
                          setIsEditMode(false);
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        {isEditMode ? 'Update Match' : 'Schedule Match'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scheduled Matches Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Scheduled Matches</h2>
              <div className="space-y-4">
                {scheduledMatches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 cursor-pointer" onClick={() => handleMatchClick(match)}>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(match.status)}`}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            {match.gameType}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {match.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {match.players}/{match.maxPlayers} players
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${match.entryFee}</div>
                        <div className="text-sm text-gray-500">Entry Fee</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => handleEditMatch(match)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Edit Match
                      </button>
                      <button
                        onClick={() => handleShowNotifiedUsers(match)}
                        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Notified Users ({match.notifiedUsers?.count || 0})
                      </button>
                    </div>

                    {/* Registered Players */}
                    {match.registeredPlayers && match.registeredPlayers.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Registered Players ({match.registeredPlayers.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {match.registeredPlayers.map((player) => (
                            <div key={player.id} className="bg-white p-3 rounded border">
                              <div className="font-medium text-gray-900">{player.name}</div>
                              <div className="text-sm text-gray-600">{player.email}</div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {player.skill}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Registered: {new Date(player.registeredAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Previous Matches Tab */}
        {activeTab === 'previous' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Previous Matches</h2>
              <div className="space-y-4">
                {previousMatches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleMatchClick(match)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(match.status)}`}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            {match.gameType}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {match.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {match.players} players
                          </div>
                        </div>
                        {match.winner && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-900">Winner: </span>
                            <span className="text-green-600">{match.winner}</span>
                            <span className="text-gray-500 ml-2">• Prize: {match.prize}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-600">${match.entryFee}</div>
                        <div className="text-sm text-gray-500">Entry Fee</div>
                      </div>
                    </div>

                    {/* Tournament Link */}
                    {match.tournamentLink && (
                      <div className="mb-4">
                        <a 
                          href={match.tournamentLink}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trophy className="w-4 h-4" />
                          View Tournament Results
                        </a>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowNotifiedUsers(match);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Notified Users ({match.notifiedUsers?.count || 0})
                      </button>
                    </div>

                    {/* Registered Players with Final Positions */}
                    {match.registeredPlayers && match.registeredPlayers.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Tournament Results ({match.registeredPlayers.length} players)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {match.registeredPlayers.map((player) => (
                            <div key={player.id} className="bg-white p-3 rounded border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{player.name}</div>
                                  <div className="text-sm text-gray-600">{player.email}</div>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {player.skill}
                                  </span>
                                </div>
                                {player.finalPosition && (
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                      player.finalPosition === 1 ? 'text-yellow-600' :
                                      player.finalPosition === 2 ? 'text-gray-600' :
                                      player.finalPosition === 3 ? 'text-orange-600' :
                                      'text-gray-500'
                                    }`}>
                                      #{player.finalPosition}
                                    </div>
                                    <div className="text-xs text-gray-500">Position</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="Delhi Billiards Club"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Venue
                </label>
                <input
                  type="text"
                  defaultValue="Delhi Sports Complex"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Match Details Modal */}
        {showMatchDetails && selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{selectedMatch.name}</h3>
                  <button
                    onClick={() => setShowMatchDetails(false)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Game Type</span>
                    <p className="text-gray-900">{selectedMatch.gameType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Venue</span>
                    <p className="text-gray-900">{selectedMatch.venue}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date & Time</span>
                    <p className="text-gray-900">{new Date(selectedMatch.date).toLocaleDateString()} at {selectedMatch.time}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Players</span>
                    <p className="text-gray-900">{selectedMatch.players}/{selectedMatch.maxPlayers || selectedMatch.players}</p>
                  </div>
                </div>

                {/* Organizer Info */}
                {selectedMatch.organizerName && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Organizer</span>
                    <p className="text-gray-900 font-medium">{selectedMatch.organizerName}</p>
                    {selectedMatch.organizerDescription && (
                      <p className="text-sm text-gray-600 mt-1">{selectedMatch.organizerDescription}</p>
                    )}
                  </div>
                )}

                {/* Location Details */}
                {selectedMatch.location && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Location Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Address:</span> {selectedMatch.location.address}</p>
                      <p><span className="font-medium">Phone:</span> {selectedMatch.location.phone}</p>
                      <div>
                        <span className="font-medium">Facilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedMatch.location.facilities?.map((facility, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMatch.ballRules && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ball Rules</span>
                    <p className="text-gray-900">
                      {ballRulesOptions.find(option => option.value === selectedMatch.ballRules)?.label || selectedMatch.ballRules}
                    </p>
                  </div>
                )}

                {selectedMatch.fewRules && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Rules</span>
                    <p className="text-gray-900">{selectedMatch.fewRules}</p>
                  </div>
                )}

                {selectedMatch.moreDetails && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">More Details</span>
                    <p className="text-gray-900">{selectedMatch.moreDetails}</p>
                  </div>
                )}

                {selectedMatch.winner && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Tournament Result</span>
                    <p className="text-gray-900">
                      <span className="font-semibold">Winner: </span>
                      <span className="text-green-600">{selectedMatch.winner}</span>
                      <span className="text-gray-500 ml-2">• Prize: {selectedMatch.prize}</span>
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Entry Fee</span>
                  <p className="text-2xl font-bold text-green-600">${selectedMatch.entryFee}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notified Users Modal */}
        {showNotifiedUsers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Notified Users</h3>
                  <button
                    onClick={() => setShowNotifiedUsers(false)}
                    className="text-white hover:text-orange-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">Notification Type:</span> All Registered Customers
                  </p>
                  <p className="text-sm text-orange-800 mt-1">
                    <span className="font-medium">Total Notified:</span> {registeredCustomers.length} users
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notified Users List</h4>
                  <div className="space-y-2">
                    {registeredCustomers.map(customer => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.email}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {customer.skill}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerMatchScheduler;