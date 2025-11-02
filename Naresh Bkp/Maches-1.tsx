import React, { useState } from 'react';
import { Calendar, Clock, Users, Settings, Trophy, Plus, Save, X, Check, AlertCircle, MapPin, User, Target, Timer } from 'lucide-react';

const OrganizerMatchScheduler = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);

  // Match form state
  const [matchForm, setMatchForm] = useState({
    matchName: '',
    gameType: '9-ball',
    matchFormat: 'race-to-7',
    lastBallLastPocket: true,
    ballInHand: true,
    foulChances: 2,
    matchDate: '',
    matchTime: '',
    registrationEndTime: '',
    venue: '',
    entryFee: '',
    entryCurrency: 'USD',
    maxPlayers: 32,
    description: '',
    prizes: {},
    specialRules: []
  });

  const [selectedPrize, setSelectedPrize] = useState('');
  const [showPrizeForm, setShowPrizeForm] = useState(false);

  // Existing matches
  const [matches] = useState([
    {
      id: 1,
      name: "9-Ball Championship",
      gameType: "9-ball",
      format: "race-to-7",
      date: "2025-09-30",
      time: "14:00",
      registrationEnd: "2025-09-30T12:00",
      status: "scheduled",
      players: 16,
      maxPlayers: 32,
      entryFee: 50
    },
    {
      id: 2,
      name: "8-Ball Tournament",
      gameType: "8-ball",
      format: "race-to-5",
      date: "2025-10-05",
      time: "18:00",
      registrationEnd: "2025-10-05T16:00",
      status: "open",
      players: 8,
      maxPlayers: 16,
      entryFee: 30
    }
  ]);

  const currencies = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
    { value: 'INR', label: 'INR (₹)', symbol: '₹' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
    { value: 'SGD', label: 'SGD (S$)', symbol: 'S$' }
  ];

  const prizeOptions = [
    { value: '1st', label: '1st Prize' },
    { value: '2nd', label: '2nd Prize' },
    { value: '3rd', label: '3rd Prize' },
    { value: '4th', label: '4th Prize' },
    { value: '5th', label: '5th Prize' }
  ];

  const gameTypes = [
    { value: '8-ball', label: '8-Ball Pool' },
    { value: '9-ball', label: '9-Ball Pool' },
    { value: '10-ball', label: '10-Ball Pool' },
    { value: 'straight-pool', label: 'Straight Pool' },
    { value: 'one-pocket', label: 'One Pocket' }
  ];

  const matchFormats = [
    { value: 'race-to-3', label: 'Race to 3' },
    { value: 'race-to-5', label: 'Race to 5' },
    { value: 'race-to-7', label: 'Race to 7' },
    { value: 'race-to-9', label: 'Race to 9' },
    { value: 'race-to-11', label: 'Race to 11' },
    { value: 'single-elimination', label: 'Single Elimination' },
    { value: 'double-elimination', label: 'Double Elimination' }
  ];

  const handlePrizeChange = (field, value) => {
    if (!selectedPrize) return;
    setMatchForm(prev => ({
      ...prev,
      prizes: {
        ...prev.prizes,
        [selectedPrize]: {
          ...prev.prizes[selectedPrize],
          [field]: value
        }
      }
    }));
  };

  const handlePrizeSelection = (prizeType) => {
    if (prizeType === '') {
      setShowPrizeForm(false);
      setSelectedPrize('');
      return;
    }

    setSelectedPrize(prizeType);
    setShowPrizeForm(true);

    // Initialize prize object if it doesn't exist
    if (!matchForm.prizes[prizeType]) {
      setMatchForm(prev => ({
        ...prev,
        prizes: {
          ...prev.prizes,
          [prizeType]: {
            title: '',
            money: '',
            currency: 'USD',
            extraRewards: ''
          }
        }
      }));
    }
  };

  const deletePrize = (prizeType) => {
    const newPrizes = { ...matchForm.prizes };
    delete newPrizes[prizeType];
    setMatchForm(prev => ({
      ...prev,
      prizes: newPrizes
    }));

    if (selectedPrize === prizeType) {
      setSelectedPrize('');
      setShowPrizeForm(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setMatchForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setMatchForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Match scheduled:', matchForm);
    setIsCreatingMatch(false);
    setMatchForm({
      matchName: '',
      gameType: '9-ball',
      matchFormat: 'race-to-7',
      lastBallLastPocket: true,
      ballInHand: true,
      foulChances: 2,
      matchDate: '',
      matchTime: '',
      registrationEndTime: '',
      venue: '',
      entryFee: '',
      entryCurrency: 'USD',
      maxPlayers: 32,
      description: '',
      prizes: {},
      specialRules: []
    });
    setSelectedPrize('');
    setShowPrizeForm(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Matches
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
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">New Match Setup</h2>
                        <p className="text-blue-100 mt-1">Configure your tournament details</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreatingMatch(false)}
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
                            Venue
                          </label>
                          <input
                            type="text"
                            value={matchForm.venue}
                            onChange={(e) => handleInputChange('venue', e.target.value)}
                            placeholder="e.g., Delhi Sports Complex"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
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
                            Match Format *
                          </label>
                          <select
                            value={matchForm.matchFormat}
                            onChange={(e) => handleInputChange('matchFormat', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {matchFormats.map(format => (
                              <option key={format.value} value={format.value}>
                                {format.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Rule Toggles */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">Last Ball Last Pocket</div>
                            <div className="text-sm text-gray-600">9-ball must go in called pocket</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={matchForm.lastBallLastPocket}
                              onChange={(e) => handleInputChange('lastBallLastPocket', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">Ball in Hand</div>
                            <div className="text-sm text-gray-600">After foul, player gets ball in hand</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={matchForm.ballInHand}
                              onChange={(e) => handleInputChange('ballInHand', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="font-medium text-gray-900 mb-2">Foul Chances</div>
                          <div className="text-sm text-gray-600 mb-3">Maximum fouls before penalty</div>
                          <select
                            value={matchForm.foulChances}
                            onChange={(e) => handleInputChange('foulChances', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={1}>1 Chance</option>
                            <option value={2}>2 Chances</option>
                            <option value={3}>3 Chances</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Schedule & Registration */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Schedule & Registration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Match Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={matchForm.matchDate}
                            onChange={(e) => handleInputChange('matchDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={matchForm.matchTime}
                            onChange={(e) => handleInputChange('matchTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Registration End Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={matchForm.registrationEndTime}
                            onChange={(e) => handleInputChange('registrationEndTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Players
                          </label>
                          <select
                            value={matchForm.maxPlayers}
                            onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                            <option value={32}>32 Players</option>
                            <option value={64}>64 Players</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Prize & Entry */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Prize & Entry Fee
                      </h3>

                      {/* Entry Fee Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Entry Fee
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={matchForm.entryFee}
                              onChange={(e) => handleInputChange('entryFee', e.target.value)}
                              placeholder="0"
                              min="0"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <select
                              value={matchForm.entryCurrency}
                              onChange={(e) => handleInputChange('entryCurrency', e.target.value)}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {currencies.map(currency => (
                                <option key={currency.value} value={currency.value}>
                                  {currency.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Prize Configuration */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Configure Prizes
                          </label>
                          <select
                            value={selectedPrize}
                            onChange={(e) => handlePrizeSelection(e.target.value)}
                            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Prize to Configure</option>
                            {prizeOptions.map(prize => (
                              <option key={prize.value} value={prize.value}>
                                {prize.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Configured Prizes List */}
                        {Object.keys(matchForm.prizes).length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Configured Prizes:</h4>
                            <div className="space-y-2">
                              {Object.entries(matchForm.prizes).map(([prizeType, prize]) => (
                                <div key={prizeType} className="flex items-center justify-between bg-white p-3 rounded border">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {prizeOptions.find(p => p.value === prizeType)?.label} - {prize.title || 'Untitled'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {prize.money && prize.currency ? 
                                        `${currencies.find(c => c.value === prize.currency)?.symbol}${prize.money}` : 
                                        'No amount set'
                                      }
                                      {prize.extraRewards && ` + ${prize.extraRewards.substring(0, 30)}...`}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handlePrizeSelection(prizeType)}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deletePrize(prizeType)}
                                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prize Configuration Form */}
                        {showPrizeForm && selectedPrize && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-gray-900">
                                Configure {prizeOptions.find(p => p.value === selectedPrize)?.label}
                              </h4>
                              <button
                                type="button"
                                onClick={() => setShowPrizeForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* Prize Title */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Title *
                                </label>
                                <input
                                  type="text"
                                  value={matchForm.prizes[selectedPrize]?.title || ''}
                                  onChange={(e) => handlePrizeChange('title', e.target.value)}
                                  placeholder={`e.g., ${prizeOptions.find(p => p.value === selectedPrize)?.label} Winner`}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              {/* Prize Money and Currency */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prize Money
                                  </label>
                                  <input
                                    type="number"
                                    value={matchForm.prizes[selectedPrize]?.money || ''}
                                    onChange={(e) => handlePrizeChange('money', e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                  </label>
                                  <select
                                    value={matchForm.prizes[selectedPrize]?.currency || 'USD'}
                                    onChange={(e) => handlePrizeChange('currency', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    {currencies.map(currency => (
                                      <option key={currency.value} value={currency.value}>
                                        {currency.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Extra Rewards */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Extra Rewards
                                </label>
                                <textarea
                                  value={matchForm.prizes[selectedPrize]?.extraRewards || ''}
                                  onChange={(e) => handlePrizeChange('extraRewards', e.target.value)}
                                  placeholder="e.g., Trophy, Medal, Certificate, Sponsorship deals, etc."
                                  rows={3}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              {/* Save Prize Button */}
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowPrizeForm(false)}
                                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Save Prize
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Match Description
                      </label>
                      <textarea
                        value={matchForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Add any additional details, special rules, or notes for players..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsCreatingMatch(false)}
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
                        Schedule Match
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">My Tournaments</h2>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
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
                            {match.players}/{match.maxPlayers} players
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${match.entryFee}</div>
                        <div className="text-sm text-gray-500">Entry Fee</div>
                      </div>
                    </div>
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
      </div>
    </div>
  );
};

export default OrganizerMatchScheduler;