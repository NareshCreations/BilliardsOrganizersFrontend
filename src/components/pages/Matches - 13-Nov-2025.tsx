import React from 'react';
import { BaseComponentComplete } from '../base/BaseComponent';
import { Calendar, Clock, Users, Settings, Trophy, Plus, Save, X, Check, AlertCircle, MapPin, User, Target, ChevronRight, Bell } from 'lucide-react';
import { matchesApiService, Match as ApiMatch } from '../../services/matchesApi';
import authService from '../../services/authService';

export interface MatchesProps {
  className?: string;
}

interface MatchForm {
  matchName: string;
  gameType: string;
  organizerName: string;
  organizerDescription: string;
  ballRules: string;
  fewRules: string;
  matchDate: string;
  matchTime: string;
  registrationEndTime: string;
  venue: string;
  locationId: string;
  entryFee: string;
  maxPlayers: string;
  moreDetails: string;
  sendNotification?: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
  notificationRecipients?: string;
  selectedSkillCustomers?: number[];
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  facilities: string[];
}

interface TournamentDashboard extends Match {
  tournamentStarted?: boolean;
  allPlayers?: Player[];
  rounds?: TournamentRound[];
  currentRound?: string | null;
  tournamentId?: string; // Store original tournament ID string for API calls
}

interface Player {
  id: string;
  name: string;
  email: string;
  skill: string;
  profilePic: string;
  selected: boolean;
  status: 'available' | 'in_round' | 'in_match' | 'in_lobby' | 'eliminated' | 'waiting' | 'winner';
  currentRound?: string | null;
  currentMatch?: string | null;
  matchesPlayed?: number;
  isPreviousRoundWinner?: boolean;
  originalWinnerRoundId?: string | null;
  previousWinningRoundId?: string | null; // Track the previous round where they won
  lastWinningRound?: string | null; // Track the most recent round where they won
  lastRoundPlayedNumber?: number; // Track the round number (array index) where they last played
  roundsWon?: string[];
  hasPlayed?: boolean;
}

interface TournamentRound {
  id: string;
  name: string;
  displayName?: string;
  players: Player[];
  matches: TournamentMatch[];
  winners: Player[];
  losers: Player[]; // Track losers for potential advancement
  status: 'active' | 'completed' | 'pending';
  isFrozen?: boolean; // Track if round is frozen (no more changes allowed)
}

interface TournamentMatch {
  id: string;
  player1: Player;
  player2: Player;
  status: 'pending' | 'active' | 'completed';
  startTime?: string;
  endTime?: string;
  duration?: string;
  score?: string;
  winner?: Player;
}

interface Match {
  id: number;
  name: string;
  gameType: string;
  organizerName: string;
  organizerDescription: string;
  date: string;
  time: string;
  status: string;
  players: number;
  maxPlayers: number;
  entryFee: number;
  venue: string;
  location?: Location;
  ballRules: string;
  registeredPlayers?: any[];
  notifiedUsers?: any;
  conductedBy?: string;
  conductedByProfile?: {
    name: string;
    logo: string;
    description: string;
    contact: string;
    website?: string;
  };
  startTime?: string;
  endTime?: string;
  topPlayers?: {
    winner: {
      id: number;
      name: string;
      email: string;
      position: number;
      skillLevel: string;
      avatar?: string;
      prize?: string;
    };
    runnerUp: {
      id: number;
      name: string;
      email: string;
      position: number;
      skillLevel: string;
      avatar?: string;
      prize?: string;
    };
    thirdPlace: {
      id: number;
      name: string;
      email: string;
      position: number;
      skillLevel: string;
      avatar?: string;
      prize?: string;
    };
    fourthPlace: {
      id: number;
      name: string;
      email: string;
      position: number;
      skillLevel: string;
      avatar?: string;
      prize?: string;
    };
  };
}

interface NotificationForm {
  title: string;
  message: string;
  notificationType: 'all' | 'selected';
  selectedCustomers: number[];
  matchId?: number;
}

interface NotificationHistory {
  id: number;
  title: string;
  message: string;
  sentTo: string;
  sentCount: number;
  sentAt: string;
  matchId?: number;
  matchName?: string;
}

interface MatchesState {
  activeTab: 'schedule' | 'scheduled' | 'previous' | 'settings' | 'notifications';
  isCreatingMatch: boolean;
  isEditMode: boolean;
  selectedMatch: ApiMatch | null;
  showMatchDetails: boolean;
  showNotifiedUsers: boolean;
  showNotificationModal: boolean;
  showSendNotificationModal: boolean;
  showMatchDetailsModal: boolean; // Single popup for match details
  modalActiveTab: 'players' | 'tournament'; // Tab state for the modal
  showProfileModal: boolean; // Profile popup modal
  selectedProfile: any | null; // Selected profile data
  matchForm: MatchForm;
  selectedLocation: Location | null;
  notificationForm: NotificationForm;
  customerPage: number;
  customersPerPage: number;
  previousMatchesPage: number; // Added for previous matches pagination
  previousMatchesPerPage: number; // Added for previous matches pagination
  showGameOrganization: boolean; // Game organization section
  shuffledMatches: any[]; // Shuffled tournament matches
  currentGameMatch: TournamentDashboard | null; // Current match for game organization
  showBracketForRound: string | null; // Round ID showing bracket view
  activeLobbyTab: 'never-played' | 'winners'; // Active lobby tab
  activeRoundTab: string | null; // Active round tab ID
  activeRoundSubTab: { [roundId: string]: 'matches' | 'waiting' | 'winners' | 'losers' };
  // API data
  scheduledMatches: ApiMatch[];
  previousMatches: ApiMatch[];
  loading: boolean;
  error: string | null;
  // Tournament API data
  apiTournaments: Array<{
    tournamentId: string;
    tournamentName: string;
    organizerId: string;
    venueId: string;
    status?: string; // Tournament status: 'scheduled', 'registration_open', 'started', 'running', 'completed', etc.
  }>;
  // Tournament detail modal
  showTournamentModal: boolean;
  selectedTournament: any | null;
  // Round management
  rounds: TournamentRound[];
  currentRoundIndex: number;
  selectedPlayers: Player[];
  showRoundNameModal: boolean;
  selectedRoundDisplayName: string;
  selectedRoundId: string | null;
  selectedPlayersForMovement: Player[];
  usedRoundNames: string[]; // Track which round names have been used
  showOddNumberAlert: boolean; // Show alert for odd number validation
  oddNumberAlertMessage: string; // Message for odd number alert
  showWinnerSelectionModal: boolean; // Show winner selection modal
  editingRoundId: string | null; // Track which round is being edited
  editingRoundName: string; // Track the round name being edited
  selectedMatchForWinner: string | null; // Match ID for winner selection
  showCustomAlert: boolean; // Show custom styled alert modal
  customAlertTitle: string; // Title for custom alert
  customAlertMessage: string; // Message for custom alert
  showDeleteConfirmModal: boolean; // Show delete confirmation modal
  deleteConfirmTitle: string; // Title for delete confirmation
  deleteConfirmMessage: string; // Message for delete confirmation
  deleteConfirmCallback: (() => void) | null; // Callback function to execute on confirm
  showTournamentResults: boolean; // Show tournament results/bracket modal
  showSetWinnerTitles: boolean; // Show set winner titles modal
  rankedWinners: Array<{
    player: Player;
    rank: number;
    title: string;
    roundWon: string;
    selected: boolean;
    editingRoundId: string | null;
editingRoundName: string;
  }>; // Ranked winners with titles
  winnerHistory: Array<{
    player: Player;
    roundWon: string;
    roundWonId: string;
    wonAt: Date;
    matchId: string;
  }>; // Permanent winner history
  winnersToDisplay: Array<{
    player: Player;
    rank: number;
    title: string;
    roundWon: string;
    roundWonId: string;
    selected: boolean;
  }>; // Winners to display (most recent round only) - never gets modified
}

export class Matches extends BaseComponentComplete<MatchesProps, MatchesState> {
  constructor(props: MatchesProps) {
    super(props);
    this.log('Matches component initialized');
  }

  protected getInitialState(): MatchesState {
    return {
      activeTab: 'schedule',
      isCreatingMatch: false,
      isEditMode: false,
      selectedMatch: null,
      showMatchDetails: false,
      showNotifiedUsers: false,
      showNotificationModal: false,
      showSendNotificationModal: false,
      matchForm: {
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
        moreDetails: '',
        sendNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        notificationRecipients: 'all',
        selectedSkillCustomers: []
      },
      selectedLocation: null,
      notificationForm: {
        title: '',
        message: '',
        notificationType: 'all',
        selectedCustomers: []
      },
      customerPage: 1,
      customersPerPage: 10,
      previousMatchesPage: 1,
      previousMatchesPerPage: 10,
      showMatchDetailsModal: false,
      modalActiveTab: 'players',
      showProfileModal: false,
      selectedProfile: null,
      showGameOrganization: false,
      shuffledMatches: [],
      currentGameMatch: null,
      showBracketForRound: null,
      activeLobbyTab: 'never-played',
      activeRoundTab: null,
      activeRoundSubTab: {},
      // API data
      scheduledMatches: [],
      previousMatches: [],
      loading: false,
      error: null,
      // Tournament API data
      apiTournaments: [],
      // Tournament detail modal
      showTournamentModal: false,
      selectedTournament: null,
      rounds: [], // This will store all the tournament rounds
currentRoundIndex: 0, // This tracks which round we're currently working on
selectedPlayers: [], // This stores players selected for the next round
showRoundNameModal: false,
selectedRoundDisplayName: '',
      selectedRoundId: 'dashboard', // Track which round is selected in dropdown (default to dashboard)
      selectedPlayersForMovement: [], // Track players selected for moving to other rounds
      usedRoundNames: [], // Track which round names have been used
      showOddNumberAlert: false, // Show alert for odd number validation
      oddNumberAlertMessage: '', // Message for odd number alert
      showWinnerSelectionModal: false, // Show winner selection modal
      editingRoundId: null, // Track which round is being edited
      editingRoundName: '', // Track the round name being edited
      selectedMatchForWinner: null, // Match ID for winner selection
      showCustomAlert: false, // Show custom styled alert modal
      customAlertTitle: '', // Title for custom alert
      customAlertMessage: '', // Message for custom alert
      showDeleteConfirmModal: false, // Show delete confirmation modal
      deleteConfirmTitle: '', // Title for delete confirmation
      deleteConfirmMessage: '', // Message for delete confirmation
      deleteConfirmCallback: null, // Callback function to execute on confirm
      showTournamentResults: false, // Show tournament results/bracket modal
      showSetWinnerTitles: false, // Show set winner titles modal
      rankedWinners: [], // Ranked winners with titles
      winnerHistory: [], // Permanent winner history
      winnersToDisplay: [], // Winners to display (most recent round only) - never gets modified

    };
  }

  componentDidMount() {
    this.loadData();
  }

  private async loadData() {
    this.setState({ loading: true, error: null });
    try {
      const [scheduledData, previousData] = await Promise.all([
        matchesApiService.getScheduledMatches(),
        matchesApiService.getPreviousMatches()
      ]);
      
      this.setState({
        scheduledMatches: scheduledData.matches,
        previousMatches: previousData.matches,
        loading: false
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false
      });
    }
  }

  // Static data arrays
  private readonly organizationLocations: Location[] = [
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

  private readonly registeredCustomers = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 2, name: 'Priya Sharma', email: 'priya@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 3, name: 'Amit Patel', email: 'amit@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 4, name: 'Sneha Gupta', email: 'sneha@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face' },
    { id: 6, name: 'Anita Reddy', email: 'anita@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 7, name: 'Rahul Mehta', email: 'rahul@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
    { id: 8, name: 'Kavya Nair', email: 'kavya@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 9, name: 'Arjun Joshi', email: 'arjun@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
    { id: 10, name: 'Deepika Iyer', email: 'deepika@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 11, name: 'Suresh Kumar', email: 'suresh@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
    { id: 12, name: 'Meera Patel', email: 'meera@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face' },
    { id: 13, name: 'Kiran Sharma', email: 'kiran@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face' },
    { id: 14, name: 'Ravi Verma', email: 'ravi@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face' },
    { id: 15, name: 'Sunita Das', email: 'sunita@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 16, name: 'Manoj Tiwari', email: 'manoj@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
    { id: 17, name: 'Pooja Agarwal', email: 'pooja@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 18, name: 'Rajesh Malhotra', email: 'rajesh.m@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 19, name: 'Neha Kapoor', email: 'neha@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 20, name: 'Vishal Jain', email: 'vishal@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
    { id: 21, name: 'Shruti Bansal', email: 'shruti@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 22, name: 'Amitabh Roy', email: 'amitabh@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 23, name: 'Ritu Chawla', email: 'ritu@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 24, name: 'Sandeep Khanna', email: 'sandeep@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
    { id: 25, name: 'Nisha Oberoi', email: 'nisha@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 26, name: 'Gaurav Sethi', email: 'gaurav@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
    { id: 27, name: 'Preeti Goel', email: 'preeti@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 28, name: 'Harsh Vardhan', email: 'harsh@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 29, name: 'Swati Mehra', email: 'swati@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 30, name: 'Rohit Bajaj', email: 'rohit@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 31, name: 'Anjali Sinha', email: 'anjali@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { id: 32, name: 'Kunal Dutta', email: 'kunal@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face' },
    { id: 33, name: 'Divya Rana', email: 'divya@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 34, name: 'Abhishek Pandey', email: 'abhishek@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 35, name: 'Rashmi Saxena', email: 'rashmi@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 36, name: 'Nikhil Agarwal', email: 'nikhil@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 37, name: 'Sakshi Mittal', email: 'sakshi@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { id: 38, name: 'Varun Chopra', email: 'varun@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face' },
    { id: 39, name: 'Isha Gupta', email: 'isha@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 40, name: 'Aditya Malhotra', email: 'aditya@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
    { id: 41, name: 'Tanya Singh', email: 'tanya@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 42, name: 'Rohan Kapoor', email: 'rohan@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 43, name: 'Shilpa Jain', email: 'shilpa@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
    { id: 44, name: 'Akash Bansal', email: 'akash@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 45, name: 'Richa Roy', email: 'richa@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 46, name: 'Vikash Chawla', email: 'vikash@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { id: 47, name: 'Pallavi Khanna', email: 'pallavi@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 48, name: 'Siddharth Oberoi', email: 'siddharth@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 49, name: 'Monika Sethi', email: 'monika@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
    { id: 50, name: 'Rajat Goel', email: 'rajat@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
    { id: 51, name: 'Karan Malhotra', email: 'karan@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 52, name: 'Pooja Singh', email: 'pooja.s@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 53, name: 'Rohit Verma', email: 'rohit.v@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face' },
    { id: 54, name: 'Sonia Agarwal', email: 'sonia@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 55, name: 'Vikram Joshi', email: 'vikram.j@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 56, name: 'Kavya Reddy', email: 'kavya.r@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 57, name: 'Arjun Sharma', email: 'arjun.s@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 58, name: 'Deepika Nair', email: 'deepika.n@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { id: 59, name: 'Suresh Patel', email: 'suresh.p@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face' },
    { id: 60, name: 'Meera Kumar', email: 'meera.k@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { id: 61, name: 'Kiran Gupta', email: 'kiran.g@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face' },
    { id: 62, name: 'Ravi Singh', email: 'ravi.s@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' },
    { id: 63, name: 'Sunita Mehta', email: 'sunita.m@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
    { id: 64, name: 'Manoj Nair', email: 'manoj.n@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 65, name: 'Pooja Joshi', email: 'pooja.j@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 66, name: 'Rajesh Reddy', email: 'rajesh.r@email.com', skill: 'Beginner', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' },
    { id: 67, name: 'Neha Sharma', email: 'neha.s@email.com', skill: 'Advanced', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { id: 68, name: 'Vishal Kumar', email: 'vishal.k@email.com', skill: 'Intermediate', profilePic: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face' },
    { id: 69, name: 'Shruti Patel', email: 'shruti.p@email.com', skill: 'Beginner' },
    { id: 70, name: 'Amitabh Gupta', email: 'amitabh.g@email.com', skill: 'Advanced' },
    { id: 71, name: 'Ritu Singh', email: 'ritu.s@email.com', skill: 'Intermediate' },
    { id: 72, name: 'Sandeep Mehta', email: 'sandeep.m@email.com', skill: 'Beginner' },
    { id: 73, name: 'Nisha Nair', email: 'nisha.n@email.com', skill: 'Advanced' },
    { id: 74, name: 'Gaurav Joshi', email: 'gaurav.j@email.com', skill: 'Intermediate' },
    { id: 75, name: 'Preeti Reddy', email: 'preeti.r@email.com', skill: 'Beginner' },
    { id: 76, name: 'Harsh Sharma', email: 'harsh.s@email.com', skill: 'Advanced' },
    { id: 77, name: 'Swati Kumar', email: 'swati.k@email.com', skill: 'Intermediate' },
    { id: 78, name: 'Rohit Patel', email: 'rohit.p@email.com', skill: 'Beginner' },
    { id: 79, name: 'Anjali Gupta', email: 'anjali.g@email.com', skill: 'Advanced' },
    { id: 80, name: 'Kunal Singh', email: 'kunal.s@email.com', skill: 'Intermediate' },
    { id: 81, name: 'Divya Mehta', email: 'divya.m@email.com', skill: 'Beginner' },
    { id: 82, name: 'Abhishek Nair', email: 'abhishek.n@email.com', skill: 'Advanced' },
    { id: 83, name: 'Rashmi Joshi', email: 'rashmi.j@email.com', skill: 'Intermediate' },
    { id: 84, name: 'Nikhil Reddy', email: 'nikhil.r@email.com', skill: 'Beginner' },
    { id: 85, name: 'Sakshi Sharma', email: 'sakshi.s@email.com', skill: 'Advanced' },
    { id: 86, name: 'Varun Kumar', email: 'varun.k@email.com', skill: 'Intermediate' },
    { id: 87, name: 'Isha Patel', email: 'isha.p@email.com', skill: 'Beginner' },
    { id: 88, name: 'Aditya Gupta', email: 'aditya.g@email.com', skill: 'Advanced' },
    { id: 89, name: 'Tanya Singh', email: 'tanya.s@email.com', skill: 'Intermediate' },
    { id: 90, name: 'Rohan Mehta', email: 'rohan.m@email.com', skill: 'Beginner' },
    { id: 91, name: 'Shilpa Nair', email: 'shilpa.n@email.com', skill: 'Advanced' },
    { id: 92, name: 'Akash Joshi', email: 'akash.j@email.com', skill: 'Intermediate' },
    { id: 93, name: 'Richa Reddy', email: 'richa.r@email.com', skill: 'Beginner' },
    { id: 94, name: 'Vikash Sharma', email: 'vikash.s@email.com', skill: 'Advanced' },
    { id: 95, name: 'Pallavi Kumar', email: 'pallavi.k@email.com', skill: 'Intermediate' },
    { id: 96, name: 'Siddharth Patel', email: 'siddharth.p@email.com', skill: 'Beginner' },
    { id: 97, name: 'Monika Gupta', email: 'monika.g@email.com', skill: 'Advanced' },
    { id: 98, name: 'Rajat Singh', email: 'rajat.s@email.com', skill: 'Intermediate' },
    { id: 99, name: 'Karan Mehta', email: 'karan.m@email.com', skill: 'Beginner' },
    { id: 100, name: 'Pooja Nair', email: 'pooja.n@email.com', skill: 'Advanced' }
  ];

  private readonly gameTypes = [
    { value: '8-ball', label: '8-Ball Pool' },
    { value: '9-ball', label: '9-Ball Pool' },
    { value: '10-ball', label: '10-Ball Pool' }
  ];

  private readonly ballRulesOptions = [
    { value: 'lastball-yes-ballinhand-yes', label: 'Last Ball Last Pocket: Yes, Ball in Hand: Yes' },
    { value: 'lastball-yes-ballinhand-no', label: 'Last Ball Last Pocket: Yes, Ball in Hand: No' },
    { value: 'lastball-no-ballinhand-yes', label: 'Last Ball Last Pocket: No, Ball in Hand: Yes' },
    { value: 'lastball-no-ballinhand-no', label: 'Last Ball Last Pocket: No, Ball in Hand: No' }
  ];

  // Hardcoded data - now using API data
  // private readonly scheduledMatches: Match[] = [
  //   {
  //     id: 1,
  //     name: "9-Ball Championship",
  //     gameType: "9-ball",
  //     organizerName: "Rajesh Tournament Director",
  //     organizerDescription: "Professional tournament organizer with 15+ years experience",
  //     date: "2025-10-15",
  //     time: "14:00",
  //     status: "scheduled",
  //     players: 40,
  //     maxPlayers: 50,
  //     entryFee: 50,
  //     venue: "Delhi Sports Complex - Main Branch",
  //     location: this.organizationLocations[0],
  //     ballRules: "lastball-yes-ballinhand-yes",
  //     registeredPlayers: [
  //       { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', skill: 'Advanced', registeredAt: '2025-10-01', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', rank: 1, rating: 2250 },
  //       { id: 2, name: 'Priya Sharma', email: 'priya@email.com', skill: 'Intermediate', registeredAt: '2025-10-02', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', rank: 20, rating: 1380 },
  //       { id: 3, name: 'Amit Patel', email: 'amit@email.com', skill: 'Expert', registeredAt: '2025-10-03', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', rank: 4, rating: 2100 },
  //       { id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', skill: 'Pro', registeredAt: '2025-10-04', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', rank: 19, rating: 1450 },
  //       { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', skill: 'Advanced', registeredAt: '2025-10-05', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', rank: 2, rating: 2200 },
  //       { id: 6, name: 'Ananya Gupta', email: 'ananya@email.com', skill: 'Intermediate', registeredAt: '2025-10-06', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', rank: 18, rating: 1500 },
  //       { id: 7, name: 'Rohit Verma', email: 'rohit@email.com', skill: 'Expert', registeredAt: '2025-10-07', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', rank: 3, rating: 2150 },
  //       { id: 8, name: 'Kavya Nair', email: 'kavya@email.com', skill: 'Pro', registeredAt: '2025-10-08', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', rank: 17, rating: 1550 },
  //       { id: 9, name: 'Arjun Mehta', email: 'arjun@email.com', skill: 'Advanced', registeredAt: '2025-10-09', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face', rank: 5, rating: 2050 },
  //       { id: 10, name: 'Isha Joshi', email: 'isha@email.com', skill: 'Intermediate', registeredAt: '2025-10-10', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', rank: 16, rating: 1600 },
  //       { id: 11, name: 'Deepak Kumar', email: 'deepak@email.com', skill: 'Expert', registeredAt: '2025-10-11', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', rank: 6, rating: 2000 },
  //       { id: 12, name: 'Meera Iyer', email: 'meera@email.com', skill: 'Pro', registeredAt: '2025-10-12', profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', rank: 15, rating: 1650 },
  //       { id: 13, name: 'Suresh Rao', email: 'suresh@email.com', skill: 'Advanced', registeredAt: '2025-10-13', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', rank: 7, rating: 1950 },
  //       { id: 14, name: 'Divya Agarwal', email: 'divya@email.com', skill: 'Intermediate', registeredAt: '2025-10-14', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', rank: 14, rating: 1700 },
  //       { id: 15, name: 'Ravi Sharma', email: 'ravi@email.com', skill: 'Expert', registeredAt: '2025-10-15', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', rank: 8, rating: 1900 },
  //       { id: 16, name: 'Pooja Desai', email: 'pooja@email.com', skill: 'Pro', registeredAt: '2025-10-16', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', rank: 13, rating: 1750 },
  //       { id: 17, name: 'Kiran Malhotra', email: 'kiran@email.com', skill: 'Advanced', registeredAt: '2025-10-17', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', rank: 9, rating: 1850 },
  //       { id: 18, name: 'Neha Kapoor', email: 'neha@email.com', skill: 'Intermediate', registeredAt: '2025-10-18', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', rank: 12, rating: 1800 },
  //       { id: 19, name: 'Manoj Tiwari', email: 'manoj@email.com', skill: 'Expert', registeredAt: '2025-10-19', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', rank: 10, rating: 1820 },
  //       { id: 20, name: 'Shruti Jain', email: 'shruti@email.com', skill: 'Pro', registeredAt: '2025-10-20', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', rank: 11, rating: 1810 },
  //       { id: 21, name: 'Gaurav Chawla', email: 'gaurav@email.com', skill: 'Advanced', registeredAt: '2025-10-21', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face', rank: 21, rating: 1350 },
  //       { id: 22, name: 'Ritu Bansal', email: 'ritu@email.com', skill: 'Intermediate', registeredAt: '2025-10-22', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', rank: 22, rating: 1320 },
  //       { id: 23, name: 'Nikhil Agarwal', email: 'nikhil@email.com', skill: 'Expert', registeredAt: '2025-10-23', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', rank: 23, rating: 1300 },
  //       { id: 24, name: 'Sunita Reddy', email: 'sunita@email.com', skill: 'Pro', registeredAt: '2025-10-24', profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', rank: 24, rating: 1280 },
  //       { id: 25, name: 'Rajesh Kumar', email: 'rajesh2@email.com', skill: 'Advanced', registeredAt: '2025-10-25', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', rank: 25, rating: 1250 },
  //       { id: 26, name: 'Priya Sharma', email: 'priya2@email.com', skill: 'Intermediate', registeredAt: '2025-10-26', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', rank: 26, rating: 1220 },
  //       { id: 27, name: 'Amit Patel', email: 'amit2@email.com', skill: 'Expert', registeredAt: '2025-10-27', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', rank: 27, rating: 1200 },
  //       { id: 28, name: 'Sneha Reddy', email: 'sneha2@email.com', skill: 'Pro', registeredAt: '2025-10-28', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', rank: 28, rating: 1180 },
  //       { id: 29, name: 'Vikram Singh', email: 'vikram2@email.com', skill: 'Advanced', registeredAt: '2025-10-29', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', rank: 29, rating: 1150 },
  //       { id: 30, name: 'Ananya Gupta', email: 'ananya2@email.com', skill: 'Intermediate', registeredAt: '2025-10-30', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', rank: 30, rating: 1120 },
  //       { id: 31, name: 'Rohit Verma', email: 'rohit2@email.com', skill: 'Expert', registeredAt: '2025-11-01', profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', rank: 31, rating: 1100 },
  //       { id: 32, name: 'Kavya Nair', email: 'kavya2@email.com', skill: 'Pro', registeredAt: '2025-11-02', profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', rank: 32, rating: 1080 },
  //       { id: 33, name: 'Arjun Mehta', email: 'arjun2@email.com', skill: 'Advanced', registeredAt: '2025-11-03', profilePic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face', rank: 33, rating: 1050 },
  //       { id: 34, name: 'Isha Joshi', email: 'isha2@email.com', skill: 'Intermediate', registeredAt: '2025-11-04', profilePic: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', rank: 34, rating: 1020 },
  //       { id: 35, name: 'Deepak Kumar', email: 'deepak2@email.com', skill: 'Expert', registeredAt: '2025-11-05', profilePic: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', rank: 35, rating: 1000 },
  //       { id: 36, name: 'Meera Iyer', email: 'meera2@email.com', skill: 'Pro', registeredAt: '2025-11-06', profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', rank: 36, rating: 980 },
  //       { id: 37, name: 'Suresh Rao', email: 'suresh2@email.com', skill: 'Advanced', registeredAt: '2025-11-07', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', rank: 37, rating: 950 },
  //       { id: 38, name: 'Divya Agarwal', email: 'divya2@email.com', skill: 'Intermediate', registeredAt: '2025-11-08', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', rank: 38, rating: 920 },
  //       { id: 39, name: 'Ravi Sharma', email: 'ravi2@email.com', skill: 'Expert', registeredAt: '2025-11-09', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', rank: 39, rating: 900 },
  //       { id: 40, name: 'Pooja Desai', email: 'pooja2@email.com', skill: 'Pro', registeredAt: '2025-11-10', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', rank: 40, rating: 880 }
  //     ],
  //     notifiedUsers: {
  //       type: 'all',
  //       count: 3,
  //       users: this.registeredCustomers,
  //       message: 'Join our exciting 9-Ball Championship!'
  //     }
  //   }
  // ];

  // Hardcoded previousMatches data - now using API data
  // All previous matches data has been moved to src/data/previous-matches.json
  // The entire previousMatches array has been commented out
  // All data moved to src/data/previous-matches.json

  private readonly notificationHistory: NotificationHistory[] = [
    {
      id: 1,
      title: "9-Ball Championship Reminder",
      message: "Don't forget! The 9-Ball Championship starts tomorrow at 2:00 PM. Good luck!",
      sentTo: "All Customers",
      sentCount: 3,
      sentAt: "2025-09-16T15:30:00",
      matchId: 3,
      matchName: "Summer 9-Ball Cup"
    },
    {
      id: 3,
      title: "Welcome New Tournament",
      message: "Join our exciting new 8-Ball tournament next weekend!",
      sentTo: "Selected Customers",
      sentCount: 2,
      sentAt: "2025-10-10T09:00:00"
    }
  ];

  // Class methods
  private handleInputChange = (field: string, value: string | boolean): void => {
    this.setState({
      matchForm: {
        ...this.state.matchForm,
        [field]: value
      }
    });

    if (field === 'locationId') {
      const location = this.organizationLocations.find(loc => loc.id === value);
      this.setState({ selectedLocation: location || null });
      if (location) {
        this.setState({
          matchForm: {
            ...this.state.matchForm,
            venue: location.name
          }
        });
      }
    }
  };

  private handleSubmit = (): void => {
    const { matchForm } = this.state;
    
    console.log('Match scheduled:', matchForm);
    
    // Handle notification if enabled
    if (matchForm.sendNotification && matchForm.notificationTitle && matchForm.notificationMessage) {
      let recipients: any[] = [];
      let recipientCount = 0;
      
      if (matchForm.notificationRecipients === 'all') {
        recipients = this.registeredCustomers;
        recipientCount = recipients.length;
      } else if (matchForm.selectedSkillCustomers && matchForm.selectedSkillCustomers.length > 0) {
        recipients = this.registeredCustomers.filter(customer => 
          matchForm.selectedSkillCustomers!.includes(customer.id)
        );
        recipientCount = recipients.length;
      }
      
      console.log('Notification sent:', {
        title: matchForm.notificationTitle,
        message: matchForm.notificationMessage,
        recipients: recipientCount,
        recipientType: matchForm.notificationRecipients,
        selectedCustomers: matchForm.selectedSkillCustomers
      });
      
      if (recipientCount > 0) {
        alert(`Tournament created successfully! Notification sent to ${recipientCount} customers.`);
      } else {
        alert('Tournament created successfully! No customers selected for notification.');
      }
    } else {
      alert('Tournament created successfully!');
    }
    
    this.setState({
      isCreatingMatch: false,
      isEditMode: false,
      matchForm: {
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
        moreDetails: '',
        sendNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        notificationRecipients: 'all',
        selectedSkillCustomers: []
      },
      selectedLocation: null
    });
  };

  private getNotificationRecipients = (recipientType: string): any[] => {
    switch (recipientType) {
      case 'advanced':
        return this.registeredCustomers.filter(customer => customer.skill === 'Advanced');
      case 'intermediate':
        return this.registeredCustomers.filter(customer => customer.skill === 'Intermediate');
      case 'beginner':
        return this.registeredCustomers.filter(customer => customer.skill === 'Beginner');
      default:
        return this.registeredCustomers;
    }
  };

  private getFilteredCustomers = (): any[] => {
    const { notificationRecipients } = this.state.matchForm;
    if (!notificationRecipients || notificationRecipients === 'all') {
      return this.registeredCustomers;
    }
    return this.registeredCustomers.filter(customer => customer.skill === notificationRecipients.charAt(0).toUpperCase() + notificationRecipients.slice(1));
  };

  private handleSkillCustomerSelection = (customerId: number, isSelected: boolean): void => {
    const { selectedSkillCustomers } = this.state.matchForm;
    const updatedCustomers = isSelected
      ? [...(selectedSkillCustomers || []), customerId]
      : (selectedSkillCustomers || []).filter(id => id !== customerId);

    this.setState({
      matchForm: {
        ...this.state.matchForm,
        selectedSkillCustomers: updatedCustomers
      }
    });
  };

  private handleSelectAllSkillCustomers = (): void => {
    const paginatedCustomers = this.getPaginatedCustomers();
    const currentSelected = this.state.matchForm.selectedSkillCustomers || [];
    const newSelections = paginatedCustomers.map(customer => customer.id);
    const updatedSelections = [...new Set([...currentSelected, ...newSelections])];
    
    this.setState({
      matchForm: {
        ...this.state.matchForm,
        selectedSkillCustomers: updatedSelections
      }
    });
  };

  private handleClearSkillCustomerSelection = (): void => {
    const paginatedCustomers = this.getPaginatedCustomers();
    const paginatedIds = paginatedCustomers.map(customer => customer.id);
    const currentSelected = this.state.matchForm.selectedSkillCustomers || [];
    const updatedSelections = currentSelected.filter(id => !paginatedIds.includes(id));
    
    this.setState({
      matchForm: {
        ...this.state.matchForm,
        selectedSkillCustomers: updatedSelections
      }
    });
  };

  // Previous matches pagination methods
  private handlePreviousMatchesPageChange = (page: number): void => {
    this.setState({
      previousMatchesPage: page
    });
  };

  private getPaginatedPreviousMatches = (): ApiMatch[] => {
    const { previousMatchesPage, previousMatchesPerPage } = this.state;
    const startIndex = (previousMatchesPage - 1) * previousMatchesPerPage;
    const endIndex = startIndex + previousMatchesPerPage;
    return this.state.previousMatches.slice(startIndex, endIndex);
  };

  private getPreviousMatchesTotalPages = (): number => {
    return Math.ceil(this.state.previousMatches.length / this.state.previousMatchesPerPage);
  };

  private getPreviousMatchesPageNumbers = (): (number | string)[] => {
    const currentPage = this.state.previousMatchesPage;
    const totalPages = this.getPreviousMatchesTotalPages();
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      if (currentPage <= 4) {
        // Show first 5 pages, then ellipsis, then last page
        for (let i = 2; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page, ellipsis, then last 5 pages
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  // Match details modal methods
  private handleShowMatchDetailsModal = async (match: ApiMatch): Promise<void> => {
    try {
      // Fetch detailed match data from API
      const detailedMatch = await matchesApiService.getMatchDetails(match.id);
      this.setState({
        selectedMatch: detailedMatch,
        showMatchDetailsModal: true
      });
    } catch (error) {
      console.error('Error fetching match details:', error);
      // Fallback to using the provided match data
      this.setState({
        selectedMatch: match,
        showMatchDetailsModal: true
      });
    }
  };

  private handleCloseMatchDetailsModal = (): void => {
    this.setState({
      showMatchDetailsModal: false,
      selectedMatch: null
    });
  };

  private handleOpenProfileModal = async (profile: any): Promise<void> => {
    // If profile has an ID, fetch detailed profile from API
    if (profile?.id) {
      try {
        const detailedProfile = await matchesApiService.getPlayerProfile(profile.id);
        this.setState({
          selectedProfile: { ...profile, ...detailedProfile },
          showProfileModal: true
        });
      } catch (error) {
        console.error('Error fetching player profile:', error);
        // Fallback to using the provided profile data
        this.setState({
          selectedProfile: profile,
          showProfileModal: true
        });
      }
    } else {
      // For profiles without ID (like conducted by profiles), use as-is
      this.setState({
        selectedProfile: profile,
        showProfileModal: true
      });
    }
  };

  private handleGameInitiate = (match: ApiMatch): void => {
    this.setState({
      showGameOrganization: true,
      currentGameMatch: match,
      shuffledMatches: []
    });
  };

  private handleShuffleGame = async (): Promise<void> => {
    if (!this.state.currentGameMatch?.registeredPlayers) {
      console.log('No current game match or registered players found');
      return;
    }
    
    console.log('Shuffling game with', this.state.currentGameMatch.registeredPlayers.length, 'players');
    
    try {
      const shuffledPlayers = await matchesApiService.shufflePlayers(
        this.state.currentGameMatch.id,
        this.state.currentGameMatch.registeredPlayers
      );
      
      const matches = await matchesApiService.createTournamentBracket(shuffledPlayers);
      console.log('Created', matches.length, 'matches');
      
      this.setState({
        shuffledMatches: matches
      });
    } catch (error) {
      console.error('Error shuffling game:', error);
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to shuffle game'
      });
    }
  };

  // Tournament Dashboard Handlers
  private handleSelectAllPlayers = (): void => {
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.allPlayers) return;
    
    const updatedPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => ({
      ...player,
      selected: player.status === 'available'
    }));

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedPlayers
      }
    });
  };

  private handleDeselectAllPlayers = (): void => {
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.allPlayers) return;
    
    const updatedPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => ({
      ...player,
      selected: false
    }));

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedPlayers
      }
    });
  };

  private handleTogglePlayerSelection = (playerId: string): void => {
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.allPlayers) return;
    
    const updatedPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => 
      player.id === playerId ? { ...player, selected: !player.selected } : player
    );

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedPlayers
      }
    });
  };

  private handleAddRound = (): void => {
    // Show round creation modal
    this.showRoundModal();
  };

  private handleCreateRound = (): void => {
    if (!this.state.currentGameMatch) return;
    
    const currentRounds = this.state.currentGameMatch.rounds || [];
    const roundNumber = currentRounds.length + 1;
    const newRound: TournamentRound = {
      id: `round-${roundNumber}`,
      name: `Round ${roundNumber}`,
      players: [],
      matches: [],
      winners: [],
      losers: [],
      status: 'pending'
    };

    // Set the first round as active if no round is currently active
    const activeRoundTab = this.state.activeRoundTab || (currentRounds.length === 0 ? newRound.id : this.state.activeRoundTab);

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        rounds: [...currentRounds, newRound],
        currentRound: newRound.id
      },
      activeRoundTab: activeRoundTab
    });

    console.log('🎯 Added new round:', newRound.name);
  };


  // Helper method to check if all matches in a round are completed
  private areAllMatchesCompleted = (round: TournamentRound): boolean => {
    if (round.matches.length === 0) return false;
    return round.matches.every(match => match.status === 'completed');
  };

  private handleMoveSelectedToRound = (): void => {
    if (!this.state.currentGameMatch || !this.state.selectedRoundId) {
      alert('Please select a target round');
      return;
    }
  
    const selectedPlayers = this.state.currentGameMatch.allPlayers
      .filter((player: Player) => player.selected);
  
    if (selectedPlayers.length === 0) {
      alert('Please select players to move');
      return;
    }
  
    // Find the target round
    const targetRoundIndex = this.state.rounds.findIndex(r => r.id === this.state.selectedRoundId);
    
    if (targetRoundIndex === -1) {
      alert('Target round not found');
      return;
    }
  
    const targetRound = this.state.rounds[targetRoundIndex];
    
    // Check if target round is frozen
    if (targetRound.isFrozen) {
      this.showCustomAlert(
        'Cannot Move Players',
        `Cannot move players to "${targetRound.displayName || targetRound.name}".\n\nThis round is frozen and no more changes are allowed.`
      );
      return;
    }
    
    const currentPlayersInTarget = targetRound.players.length;
    const playersAfterMove = currentPlayersInTarget + selectedPlayers.length;
  
    // Allow single players to be moved to rounds - they can wait as unmatched players
    // The validation for even numbers will happen when creating matches, not when moving players
    console.log(`Moving ${selectedPlayers.length} player(s) from Main Area to ${targetRound.displayName || targetRound.name}. Target will have ${playersAfterMove} players.`);
  
    // Update the rounds array - add players to target round
    const updatedRounds = this.state.rounds.map((round, index) => {
      if (index === targetRoundIndex) {
        return {
          ...round,
          players: [
            ...round.players,
            ...selectedPlayers.map(p => ({ 
              ...p, 
              selected: false,
              status: 'in_round' as const,
              currentRound: round.id,
              lastRoundPlayedNumber: index // Set the round number (array index) where they're playing
            }))
          ]
        };
      }
      return round;
    });
  
    // Update allPlayers - change status from available to in_round
    const selectedPlayerIds = selectedPlayers.map(p => p.id);
    const updatedAllPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => 
      selectedPlayerIds.includes(player.id)
        ? { 
            ...player, 
            selected: false, 
            status: 'in_round' as const, 
            currentRound: this.state.selectedRoundId 
          }
        : player
                  );
                  
    // Store the target round ID before resetting selectedRoundId
    const targetRoundId = this.state.selectedRoundId;
    
    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedAllPlayers
      },
      rounds: updatedRounds,
      selectedRoundId: 'dashboard', // Reset selection after successful move
      activeRoundTab: targetRoundId // Set the active round tab to show the target round
    });
  
    const targetRoundName = this.state.rounds[targetRoundIndex].displayName || this.state.rounds[targetRoundIndex].name;
    console.log(`✅ Moved ${selectedPlayers.length} players to "${targetRoundName}"`);
  };


  private handleMoveSelectedToLobby = (): void => {
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.allPlayers) return;
    
    const selectedPlayerIds = this.state.currentGameMatch.allPlayers
      .filter((player: Player) => player.selected)
      .map((player: Player) => player.id);

    if (selectedPlayerIds.length === 0) {
      console.log('No players selected to move to lobby');
      return;
    }

    const updatedPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => 
      selectedPlayerIds.includes(player.id) 
        ? { ...player, status: 'in_lobby' as const, selected: false }
        : player
    );

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedPlayers
      }
    });

    console.log('🏟️ Moved', selectedPlayerIds.length, 'players to lobby');
  };

  private handleShuffleSelected = (): void => {
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.allPlayers) return;
    
    const selectedPlayers = this.state.currentGameMatch.allPlayers
      .filter((player: Player) => player.selected);

    if (selectedPlayers.length < 2) {
      console.log('Need at least 2 players to shuffle');
      return;
    }

    const selectedPlayerIds = selectedPlayers.map((p: Player) => p.id);

    // Shuffle only the selected players
    const shuffledPlayers = [...selectedPlayers].sort(() => Math.random() - 0.5);
    
    // Create matches from shuffled players
    const matches: TournamentMatch[] = [];
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        matches.push({
          id: `match-${Date.now()}-${i}`,
          player1: shuffledPlayers[i],
          player2: shuffledPlayers[i + 1],
          status: 'pending'
        });
      }
    }

    console.log('🎲 Shuffled', selectedPlayers.length, 'selected players into', matches.length, 'matches');

    // Update selected players to be in matches
    const updatedPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => {
      if (selectedPlayerIds.includes(player.id)) {
        const match = matches.find(m => m.player1.id === player.id || m.player2.id === player.id);
        return {
          ...player,
          status: 'in_match' as const,
          selected: false,
          currentMatch: match?.id || null
        };
      }
      return player;
    });

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedPlayers
      }
    });
  };

  private handleTournamentClick = async (tournamentId: string, tournamentName: string, organizerId?: string, venueId?: string, tournamentStatus?: string): Promise<void> => {
    console.log('🏆 Tournament clicked:', { tournamentId, tournamentName, organizerId, venueId, tournamentStatus });
    
    // Normalize status to lowercase for comparison
    const status = (tournamentStatus || 'scheduled').toLowerCase();
    console.log('🏆 Tournament status:', status);
    
    // Set loading state
    this.setState({
      loading: true,
      showGameOrganization: false
    });

    try {
      console.log('👥 Step 1: Fetching registered players for tournament');
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🏆 Tournament Name:', tournamentName);
      console.log('🏆 Tournament Status:', status);
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1');
      
      // Verify user is authenticated before making the call
      const token = authService.getAccessToken();
      
      if (!token) {
        console.error('❌ No authentication token found. User must be logged in.');
        alert('Please login to view tournament players');
        this.setState({ 
          loading: false,
          error: 'Please login to view tournament players'
        });
        return;
      }
      
      console.log('✅ Token found, making authenticated request...');
      
      // Fetch registered players
      const playersResponse = await matchesApiService.getTournamentPlayers(tournamentId);
      
      console.log("playersResponse", playersResponse);
      console.log("playersResponse.data.tournament_status.rounds", playersResponse.data.tournament_status.rounds);
      console.log('👥 API call completed, response received');
      console.log('👥 Response success:', playersResponse.success);
      console.log('👥 Response message:', playersResponse.message);

      let registeredPlayers = [];
      let currentParticipants = 0;

      // Handle the new API response structure
      if (playersResponse.success && playersResponse.data && playersResponse.data.players) {
        const players = playersResponse.data.players;
        console.log('👥 Processing', players.length, 'registered players from new API');
        
        registeredPlayers = players.map((player: any, index: number) => {
          // Map the new API response structure to our player format
          const mappedPlayer = {
            id: index + 1,
            name: player.fullName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Unknown Player',
            email: player.email || '',
            skillLevel: player.skillLevel || 'Beginner',
            skillColor: this.getSkillColor(player.skillLevel || 'Beginner'),
            rating: player.rating || 0,
            registrationDate: this.formatRegistrationDate(
              player.registrationDate || player.userCreatedAt || new Date().toISOString()
            ),
            profilePic: player.profilePic ||
                       `https://images.unsplash.com/photo-${1507003211169 + index}?w=150&h=150&fit=crop&crop=face`,
            // Store additional player information
            phone: player.phone || '',
            city: player.city || '',
            state: player.state || '',
            country: player.country || '',
            isVerified: player.isVerified || false,
            // Payment information
            paymentStatus: player.paymentStatus || 'unknown',
            paymentAmount: player.paymentAmount || 0,
            paymentMethod: player.paymentMethod || '',
            registrationStatus: player.registrationStatus || 'registered',
            registrationId: player.registrationId || '',
            userId: player.userId || '',
            customerProfileId: player.customerProfileId || '',
            // Store original player data for debugging
            originalData: player
          };
          return mappedPlayer;
        });
        
        currentParticipants = registeredPlayers.length;
        console.log('👥 Total participants processed:', currentParticipants);
      } else {
        console.warn('⚠️ API returned no players or invalid response structure.');
        registeredPlayers = [];
        currentParticipants = 0;
      }

      // Check tournament status to determine routing
      // If status is "started", "running", or "completed" → go directly to dashboard
      // If status is "registration_open" or "scheduled" → show popup
      const shouldGoToDashboard = ['started', 'running', 'ongoing', 'completed'].includes(status);
      const shouldShowPopup = ['registration_open', 'scheduled', 'upcoming', 'draft'].includes(status);

      console.log('🎯 Routing decision:', {
        status,
        shouldGoToDashboard,
        shouldShowPopup
      });

      if (shouldGoToDashboard) {
        // Go directly to tournament dashboard
        console.log('🎮 Status is started/running/completed - going directly to dashboard');
        
        // Convert tournamentId string to number for Match interface compatibility
        const tournamentIdNumber = tournamentId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
       
        const staticRoundsa: TournamentRound[] = [
          {
            id: 'round_final',
            name: 'Round 1',
            displayName: 'Championship Round',
            status: 'completed',
            isFrozen: true,
            players: [
              {
                id: 'p1',
                name: 'Arjun Mehta',
                email: 'arjun.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=8',
                selected: false,
                status: 'winner',
                currentRound: 'round_final',
                currentMatch: 'match_final',
                currentMatch: 'match_final',
                matchesPlayed: 1,
                roundsWon: ['round_final'],
                hasPlayed: true
              },
              {
                id: 'p2',
                name: 'Rohan Mehta',
                email: 'rohan.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=19',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_final',
                currentMatch: 'match_final',
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              },
              {
                id: 'p3',
                name: 'Tanya Saxena',
                email: 'tanya.saxena@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=4',
                selected: false,
                status: 'winner',
                currentRound: 'round_final',
                currentMatch: 'match_bronze',
                matchesPlayed: 1,
                roundsWon: ['round_final'],
                hasPlayed: true
              },
              {
                id: 'p4',
                name: 'Vikram Singh',
                email: 'vikram.singh@example.com',
                skill: 'Intermediate',
                profilePic: 'https://i.pravatar.cc/150?img=18',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_final',
                currentMatch: 'match_bronze',
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              }
            ],
            matches: [
              {
                id: 'match_final',
                player1: {
                  id: 'p1',
                  name: 'Arjun Mehta',
                  email: 'arjun.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=8',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_final',
                  currentMatch: 'match_final',
                  matchesPlayed: 1,
                  roundsWon: ['round_final'],
                  hasPlayed: true
                },
                player2: {
                  id: 'p2',
                  name: 'Rohan Mehta',
                  email: 'rohan.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=19',
                  selected: false,
                  status: 'eliminated',
                  currentRound: 'round_final',
                  currentMatch: 'match_final',
                  matchesPlayed: 1,
                  roundsWon: [],
                  hasPlayed: true
                },
                status: 'completed',
                startTime: '2025-11-15T15:00:00.000Z',
                endTime: '2025-11-15T15:40:00.000Z',
                duration: '40m',
                score: '5-3',
                winner: {
                  id: 'p1',
                  name: 'Arjun Mehta',
                  email: 'arjun.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=8',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_final',
                  currentMatch: 'match_final',
                  matchesPlayed: 1,
                  roundsWon: ['round_final'],
                  hasPlayed: true
                }
              },
              {
                id: 'match_bronze',
                player1: {
                  id: 'p3',
                  name: 'Tanya Saxena',
                  email: 'tanya.saxena@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=4',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_final',
                  currentMatch: 'match_bronze',
                  matchesPlayed: 1,
                  roundsWon: ['round_final'],
                  hasPlayed: true
                },
                player2: {
                  id: 'p4',
                  name: 'Vikram Singh',
                  email: 'vikram.singh@example.com',
                  skill: 'Intermediate',
                  profilePic: 'https://i.pravatar.cc/150?img=18',
                  selected: false,
                  status: 'eliminated',
                  currentRound: 'round_final',
                  currentMatch: 'match_bronze',
                  matchesPlayed: 1,
                  roundsWon: [],
                  hasPlayed: true
                },
                status: 'completed',
                startTime: '2025-11-15T14:00:00.000Z',
                endTime: '2025-11-15T14:35:00.000Z',
                duration: '35m',
                score: '4-2',
                winner: {
                  id: 'p3',
                  name: 'Tanya Saxena',
                  email: 'tanya.saxena@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=4',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_final',
                  currentMatch: 'match_bronze',
                  matchesPlayed: 1,
                  roundsWon: ['round_final'],
                  hasPlayed: true
                }
              }
            ],
            winners: [
              {
                id: 'p1',
                name: 'Arjun Mehta',
                email: 'arjun.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=8',
                selected: false,
                status: 'winner',
                currentRound: 'round_final',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: ['round_final'],
                hasPlayed: true
              },
              {
                id: 'p3',
                name: 'Tanya Saxena',
                email: 'tanya.saxena@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=4',
                selected: false,
                status: 'winner',
                currentRound: 'round_final',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: ['round_final'],
                hasPlayed: true
              }
            ],
            losers: [
              {
                id: 'p2',
                name: 'Rohan Mehta',
                email: 'rohan.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=19',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_final',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              },
              {
                id: 'p4',
                name: 'Vikram Singh',
                email: 'vikram.singh@example.com',
                skill: 'Intermediate',
                profilePic: 'https://i.pravatar.cc/150?img=18',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_final',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              }
            ]
          }
        ];
        
        const staticRounds: TournamentRound[] = [
          {
            id: 'round_1',
            name: 'Round 1',
            displayName: 'Semi Finals',
            status: 'completed',
            isFrozen: true,
            players: [
              {
                id: 'p1',
                name: 'Arjun Mehta',
                email: 'arjun.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=8',
                selected: false,
                status: 'winner',
                currentRound: 'round_1',
                currentMatch: 'round_1-match-1',
                matchesPlayed: 1,
                roundsWon: ['round_1'],
                hasPlayed: true
              },
              {
                id: 'p2',
                name: 'Rohan Mehta',
                email: 'rohan.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=19',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_1',
                currentMatch: 'round_1-match-1',
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              },
              {
                id: 'p3',
                name: 'Tanya Saxena',
                email: 'tanya.saxena@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=4',
                selected: false,
                status: 'winner',
                currentRound: 'round_1',
                currentMatch: 'round_1-match-2',
                matchesPlayed: 1,
                roundsWon: ['round_1'],
                hasPlayed: true
              },
              {
                id: 'p4',
                name: 'Vikram Singh',
                email: 'vikram.singh@example.com',
                skill: 'Intermediate',
                profilePic: 'https://i.pravatar.cc/150?img=18',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_1',
                currentMatch: 'round_1-match-2',
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              }
            ],
            matches: [
              {
                id: 'round_1-match-1',
                player1: {
                  id: 'p1',
                  name: 'Arjun Mehta',
                  email: 'arjun.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=8',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_1',
                  currentMatch: 'round_1-match-1',
                  matchesPlayed: 1,
                  roundsWon: ['round_1'],
                  hasPlayed: true
                },
                player2: {
                  id: 'p2',
                  name: 'Rohan Mehta',
                  email: 'rohan.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=19',
                  selected: false,
                  status: 'eliminated',
                  currentRound: 'round_1',
                  currentMatch: 'round_1-match-1',
                  matchesPlayed: 1,
                  roundsWon: [],
                  hasPlayed: true
                },
                status: 'completed',
                startTime: '2025-11-15T14:00:00.000Z',
                endTime: '2025-11-15T14:35:00.000Z',
                duration: '35m',
                score: '5-3',
                winner: {
                  id: 'p1',
                  name: 'Arjun Mehta',
                  email: 'arjun.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=8',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_1',
                  currentMatch: 'round_1-match-1',
                  matchesPlayed: 1,
                  roundsWon: ['round_1'],
                  hasPlayed: true
                }
              },
              {
                id: 'round_1-match-2',
                player1: {
                  id: 'p3',
                  name: 'Tanya Saxena',
                  email: 'tanya.saxena@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=4',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_1',
                  currentMatch: 'round_1-match-2',
                  matchesPlayed: 1,
                  roundsWon: ['round_1'],
                  hasPlayed: true
                },
                player2: {
                  id: 'p4',
                  name: 'Vikram Singh',
                  email: 'vikram.singh@example.com',
                  skill: 'Intermediate',
                  profilePic: 'https://i.pravatar.cc/150?img=18',
                  selected: false,
                  status: 'eliminated',
                  currentRound: 'round_1',
                  currentMatch: 'round_1-match-2',
                  matchesPlayed: 1,
                  roundsWon: [],
                  hasPlayed: true
                },
                status: 'completed',
                startTime: '2025-11-15T14:40:00.000Z',
                endTime: '2025-11-15T15:15:00.000Z',
                duration: '35m',
                score: '4-2',
                winner: {
                  id: 'p3',
                  name: 'Tanya Saxena',
                  email: 'tanya.saxena@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=4',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_1',
                  currentMatch: 'round_1-match-2',
                  matchesPlayed: 1,
                  roundsWon: ['round_1'],
                  hasPlayed: true
                }
              }
            ],
            winners: [
              {
                id: 'p1',
                name: 'Arjun Mehta',
                email: 'arjun.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=8',
                selected: false,
                status: 'winner',
                currentRound: 'round_1',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: ['round_1'],
                hasPlayed: true
              },
              {
                id: 'p3',
                name: 'Tanya Saxena',
                email: 'tanya.saxena@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=4',
                selected: false,
                status: 'winner',
                currentRound: 'round_1',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: ['round_1'],
                hasPlayed: true
              }
            ],
            losers: [
              {
                id: 'p2',
                name: 'Rohan Mehta',
                email: 'rohan.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=19',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_1',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              },
              {
                id: 'p4',
                name: 'Vikram Singh',
                email: 'vikram.singh@example.com',
                skill: 'Intermediate',
                profilePic: 'https://i.pravatar.cc/150?img=18',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_1',
                currentMatch: null,
                matchesPlayed: 1,
                roundsWon: [],
                hasPlayed: true
              }
            ]
          },
          {
            id: 'round_2',
            name: 'Final',
            displayName: 'Championship Final',
            status: 'completed',
            isFrozen: true,
            players: [
              {
                id: 'p1',
                name: 'Arjun Mehta',
                email: 'arjun.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=8',
                selected: false,
                status: 'winner',
                currentRound: 'round_2',
                currentMatch: 'round_2-match-1',
                matchesPlayed: 2,
                roundsWon: ['round_1', 'round_2'],
                hasPlayed: true
              },
              {
                id: 'p3',
                name: 'Tanya Saxena',
                email: 'tanya.saxena@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=4',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_2',
                currentMatch: 'round_2-match-1',
                matchesPlayed: 2,
                roundsWon: ['round_1'],
                hasPlayed: true
              }
            ],
            matches: [
              {
                id: 'round_2-match-1',
                player1: {
                  id: 'p1',
                  name: 'Arjun Mehta',
                  email: 'arjun.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=8',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_2',
                  currentMatch: 'round_2-match-1',
                  matchesPlayed: 2,
                  roundsWon: ['round_1', 'round_2'],
                  hasPlayed: true
                },
                player2: {
                  id: 'p3',
                  name: 'Tanya Saxena',
                  email: 'tanya.saxena@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=4',
                  selected: false,
                  status: 'eliminated',
                  currentRound: 'round_2',
                  currentMatch: 'round_2-match-1',
                  matchesPlayed: 2,
                  roundsWon: ['round_1'],
                  hasPlayed: true
                },
                status: 'completed',
                startTime: '2025-11-15T15:30:00.000Z',
                endTime: '2025-11-15T16:05:00.000Z',
                duration: '35m',
                score: '5-4',
                winner: {
                  id: 'p1',
                  name: 'Arjun Mehta',
                  email: 'arjun.mehta@example.com',
                  skill: 'Advanced',
                  profilePic: 'https://i.pravatar.cc/150?img=8',
                  selected: false,
                  status: 'winner',
                  currentRound: 'round_2',
                  currentMatch: 'round_2-match-1',
                  matchesPlayed: 2,
                  roundsWon: ['round_1', 'round_2'],
                  hasPlayed: true
                }
              }
            ],
            winners: [
              {
                id: 'p1',
                name: 'Arjun Mehta',
                email: 'arjun.mehta@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=8',
                selected: false,
                status: 'winner',
                currentRound: 'round_2',
                currentMatch: null,
                matchesPlayed: 2,
                roundsWon: ['round_1', 'round_2'],
                hasPlayed: true
              }
            ],
            losers: [
              {
                id: 'p3',
                name: 'Tanya Saxena',
                email: 'tanya.saxena@example.com',
                skill: 'Advanced',
                profilePic: 'https://i.pravatar.cc/150?img=4',
                selected: false,
                status: 'eliminated',
                currentRound: 'round_2',
                currentMatch: null,
                matchesPlayed: 2,
                roundsWon: ['round_1'],
                hasPlayed: true
              }
            ]
          }
        ];
        
        const tournamentData: TournamentDashboard = {
          id: tournamentIdNumber,
          name: tournamentName,
          gameType: '9-ball', // Default, can be updated from API if needed
          organizerName: 'Tournament Organizer',
          organizerDescription: 'Professional tournament management',
          date: new Date('2025-10-15T14:00:00').toISOString(),
          time: new Date('2025-10-15T14:00:00').toLocaleTimeString(),
          status: 'active',
          players: currentParticipants,
          maxPlayers: 50,
          entryFee: 50,
          venue: 'Delhi Sports Complex - Main Branch',
          ballRules: 'Standard tournament rules',
          allPlayers: registeredPlayers.map((player: any) => ({
            id: player.id.toString(),
            name: player.name,
            email: player.email,
            skill: player.skillLevel,
            profilePic: player.profilePic,
            selected: false,
            status: 'available' as const,
            currentRound: null,
            currentMatch: null
          })),
          rounds: [],
          //rounds: staticRounds,
          //rounds: playersResponse.data.tournament_status.rounds,
          currentRound: null,
          tournamentStarted: true,
          registeredPlayers: registeredPlayers,
          tournamentId: tournamentId // Store original tournament ID string for API calls
        };


        // Navigate directly to tournament dashboard (skip modal)
        /*this.setState({
          currentGameMatch: tournamentData,
          showGameOrganization: true,
          showTournamentModal: false, // Don't show popup
          selectedTournament: null,
          loading: false
        });*/


        /*
        this.setState({
          currentGameMatch: {
            ...tournamentData,
            rounds: staticRounds,
            currentRound: tournamentData.currentRound ?? initialRoundId
          },
          rounds: staticRounds,
          activeRoundTab: initialRoundId,
          activeRoundSubTab: initialRoundId
            ? { ...this.state.activeRoundSubTab, [initialRoundId]: 'players' }
            : {},
          showGameOrganization: true,
          showTournamentModal: false,
          selectedTournament: null,
          loading: false
        });*/

        //const initialRoundId = staticRounds[0].id;
        const initialRoundId = staticRounds[0]?.id ?? null;

        const winnersToDisplay = staticRounds
  .flatMap(round =>
    round.matches
      .filter(match => match.status === 'completed' && match.winner)
      .map(match => ({
        player: { ...match.winner },
        roundWon: round.displayName ?? round.name,
        roundWonId: round.id,
        matchId: match.id,
        wonAt: match.endTime ? new Date(match.endTime) : new Date(),
        // defaults for Set Winner Titles modal
        rank: 1,
        title: '',
        selected: true
      }))
  )
  // keep only the most recent win per player
  .reduce((acc, entry) => {
    const idx = acc.findIndex(item => item.player.id === entry.player.id);
    if (idx === -1 || ((entry.wonAt?.getTime() ?? 0) > (acc[idx].wonAt?.getTime() ?? 0))) {
      if (idx === -1) acc.push(entry);
      else acc[idx] = entry;
    }
    return acc;
  }, [] as Array<{
    player: Player;
    roundWon: string;
    roundWonId: string;
    matchId: string;
    wonAt: Date;
    rank: number;
    title: string;
    selected: boolean;
  }>)
  // assign sequential ranks for display
  .map((winner, index) => ({ ...winner, rank: index + 1 }));

  this.setState({
    currentGameMatch: {
      ...tournamentData,
      rounds: staticRounds,
      currentRound: initialRoundId
    },
    rounds: staticRounds,
    winnersToDisplay,
    activeRoundTab: initialRoundId,
    activeRoundSubTab: { [initialRoundId]: 'players' },
    showGameOrganization: true,
    showTournamentModal: false,
          selectedTournament: null,
          loading: false
        });

        console.log('✅ Navigated directly to tournament dashboard (status:', status, ')');
        
      } else if (shouldShowPopup) {
        // Show popup with registered users (don't start tournament automatically)
        console.log('📋 Status is registration_open/scheduled - showing popup with registered users');
        
        const tournamentData = {
          id: tournamentId,
          name: tournamentName,
          status: status,
          type: 'single_elimination',
          gameType: '9-ball',
          startDate: new Date('2025-10-15T14:00:00').toISOString(),
          endDate: new Date('2025-10-15T22:00:00').toISOString(),
          venue: 'Delhi Sports Complex - Main Branch',
          address: 'Delhi Sports Complex - Main Branch',
          entryFee: 50,
          maxParticipants: 50,
          currentParticipants: currentParticipants,
          description: `Tournament: ${tournamentName}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredPlayers: registeredPlayers,
          loading: false
        };
        
        this.setState({
          selectedTournament: tournamentData,
          showTournamentModal: true, // Show popup
          showGameOrganization: false,
          loading: false
        }, () => {
          console.log('✅ Popup shown with registered users (status:', status, ')');
        });
        
      } else {
        // Unknown status - default to popup
        console.warn('⚠️ Unknown tournament status:', status, '- defaulting to popup');
        
        const tournamentData = {
          id: tournamentId,
          name: tournamentName,
          status: status,
          type: 'single_elimination',
          gameType: '9-ball',
          startDate: new Date('2025-10-15T14:00:00').toISOString(),
          endDate: new Date('2025-10-15T22:00:00').toISOString(),
          venue: 'Delhi Sports Complex - Main Branch',
          address: 'Delhi Sports Complex - Main Branch',
          entryFee: 50,
          maxParticipants: 50,
          currentParticipants: currentParticipants,
          description: `Tournament: ${tournamentName}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredPlayers: registeredPlayers,
          loading: false
        };
        
        this.setState({
          selectedTournament: tournamentData,
          showTournamentModal: true, // Show popup
          showGameOrganization: false,
          loading: false
        });
      }

    } catch (error) {
      console.error('❌ Error in handleTournamentClick:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tournament';
      
      // Show error message to user
      alert(`Error: ${errorMessage}`);
      
      this.setState({
        loading: false,
        error: errorMessage,
        showGameOrganization: false,
        showTournamentModal: false
      });
    }
  };

  private handleScheduledMatchesClick = async (): Promise<void> => {
    console.log('🏆 Scheduled Tournaments tab clicked - calling NEW token-based tournament API');
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
    console.log('📍 Expected API URL:', `${apiBaseUrl}/organizers/tournaments`);
    
    // Set loading state immediately and switch to scheduled tab
    this.setState({ 
      activeTab: 'scheduled',
      loading: true,
      error: null
    });
    
    try {
      console.log('🚀 Making API call with token authentication...');
      console.log('🔐 Checking for authentication token...');
      
      // Verify user is authenticated before making the call
      //const authService = (await import('../../services/authService')).default;
      const token = authService.getAccessToken();
      
      if (!token) {
        console.error('❌ No authentication token found. User must be logged in.');
        this.setState({ 
          activeTab: 'scheduled',
          loading: false,
          error: 'Please login to view tournaments',
          apiTournaments: []
        });
        return;
      }
      
      console.log('✅ Token found, making authenticated request...');
      
      const response = await matchesApiService.getTournamentsByOrganizerId();
      
      console.log('📊 Tournament API Response:', response);
      console.log('📊 Response Data:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log(`✅ Successfully retrieved ${response.data.count} tournaments`);
        console.log('🏆 Tournaments:', response.data.tournaments);
        
        // Extract tournamentId and tournamentName from API response
        console.log('🔍 Raw tournament data:', response.data.tournaments);
        
        const apiTournaments = response.data.tournaments.map((tournament: any) => {
          console.log('🔍 Individual tournament:', tournament);
          console.log('🔍 Tournament ID:', tournament.id);
          console.log('🔍 Tournament Name:', tournament.name);
          console.log('🔍 Tournament Status:', tournament.status);
          console.log('🔍 Tournament organizerId:', tournament.organizerId || tournament.organizer_id);
          console.log('🔍 Tournament venueId:', tournament.venueId || tournament.venue_id);
          console.log('🔍 All tournament keys:', Object.keys(tournament));
          
          return {
            tournamentId: tournament.id || tournament.tournamentId || 'unknown-id',
            tournamentName: tournament.name || tournament.tournamentName || tournament.title || 'Unnamed Tournament',
            organizerId: tournament.organizerId || tournament.organizer_id || response.data.organizerId || '',
            venueId: tournament.venueId || tournament.venue_id || tournament.venue?.id || '',
            status: tournament.status || 'scheduled' // Store tournament status
          };
        });
        
        console.log('🎯 Extracted tournaments:', apiTournaments);
        console.log('🎯 Total tournaments extracted:', apiTournaments.length);
        console.log('🎯 Tournament IDs:', apiTournaments.map(t => t.tournamentId));
        console.log('🎯 Tournament Names:', apiTournaments.map(t => t.tournamentName));
        
        // Update state with extracted tournament data
        this.setState({ 
          activeTab: 'scheduled',
          loading: false,
          apiTournaments: apiTournaments,
          error: null
        });
        
      } else {
        console.warn('⚠️ API returned success: false with message:', response.message);
        this.setState({ 
          activeTab: 'scheduled',
          loading: false,
          apiTournaments: [],
          error: response.message || 'Failed to fetch tournaments'
        });
      }
      
    } catch (error) {
      console.error('❌ Error calling tournament API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tournaments';
      
      // Check if it's a redirect error (session expired) - don't set state if redirecting
      if (errorMessage.includes('Session expired') || errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        // Wait a moment to let redirect happen, but set error state in case redirect fails
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            this.setState({ 
              activeTab: 'scheduled',
              loading: false,
              error: 'Your session has expired. Please login again.',
              apiTournaments: []
            });
          }
        }, 100);
        return; // Don't set state immediately if redirecting
      }
      
      // For other errors, set error state normally
      this.setState({ 
        activeTab: 'scheduled',
        loading: false,
        error: errorMessage,
        apiTournaments: []
      });
    }
  };

  private generateDummyPlayers = (): any[] => {
    // Exact player names from the image
    const playerNames = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
      'Ananya Gupta', 'Rohit Verma', 'Kavya Nair', 'Arjun Mehta', 'Isha Joshi',
      'Deepak Kumar', 'Meera Iyer', 'Suresh Rao'
    ];
    
    const skillLevels = [
      { name: 'Advanced', color: 'bg-blue-100 text-blue-800' },
      { name: 'Intermediate', color: 'bg-green-100 text-green-800' },
      { name: 'Pro', color: 'bg-purple-100 text-purple-800' },
      { name: 'Expert', color: 'bg-red-100 text-red-800' }
    ];
    
    // Exact dates from the image
    const dates = [
      '01/10/2025', '02/10/2025', '03/10/2025', '04/10/2025', '05/10/2025',
      '06/10/2025', '07/10/2025', '08/10/2025', '09/10/2025', '10/10/2025',
      '11/10/2025', '12/10/2025', '13/10/2025'
    ];
    
    return playerNames.map((name, index) => {
      const skillLevel = skillLevels[index % skillLevels.length];
      
      return {
        id: index + 1,
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        skillLevel: skillLevel.name,
        skillColor: skillLevel.color,
        registrationDate: dates[index],
        profilePic: `https://images.unsplash.com/photo-${1507003211169 + index}?w=150&h=150&fit=crop&crop=face`
      };
    });
  };

  private extractPlayerName = (registration: any): string => {
    // Try different possible field names for player name
    const flatName = registration.customerName || 
           registration.customer_name ||
           registration.customerName ||
           registration.name || 
           registration.fullName ||
           registration.full_name ||
           registration.playerName ||
           registration.player_name ||
           (registration.firstName && registration.lastName ? registration.firstName + ' ' + registration.lastName : '') ||
           (registration.first_name && registration.last_name ? registration.first_name + ' ' + registration.last_name : '') ||
           registration.userName ||
           registration.user_name;

    const nestedName = (registration.customer && (
              registration.customer.name ||
              (registration.customer.firstName && registration.customer.lastName
                ? `${registration.customer.firstName} ${registration.customer.lastName}`
                : '') ||
              registration.customer.fullName
            )) ||
            (registration.user && (
              registration.user.name ||
              (registration.user.firstName && registration.user.lastName
                ? `${registration.user.firstName} ${registration.user.lastName}`
                : '') ||
              registration.user.fullName
            )) ||
            (registration.player && (
              registration.player.name || registration.player.fullName
            ));

    return flatName || nestedName || 'Unknown Player';
  };

  private extractPlayerEmail = (registration: any): string => {
    // Try different possible field names for email
    const flatEmail = registration.customerEmail || 
           registration.customer_email ||
           registration.email || 
           registration.emailAddress ||
           registration.email_address ||
           registration.contactEmail ||
           registration.contact_email ||
           registration.userEmail ||
           registration.user_email;

    const nestedEmail = (registration.customer && (registration.customer.email || registration.customer.contact?.email)) ||
           (registration.user && registration.user.email) ||
           (registration.player && registration.player.email) ||
           (registration.profile && registration.profile.email);

    const email = flatEmail || nestedEmail || 'unknown@email.com';
    return email && email.trim() !== '' ? email : 'unknown@email.com';
  };

  private getSkillLevelFromRegistration = (registration: any): string => {
    // Try different possible field names for skill level
    return registration.skill || 
           registration.skillLevel || 
           registration.skill_level ||
           registration.level || 
           registration.experience ||
           registration.experienceLevel ||
           registration.experience_level ||
           registration.playerLevel ||
           registration.player_level ||
           (registration.customer && registration.customer.skillLevel) ||
           (registration.user && registration.user.skillLevel) ||
           (registration.player && registration.player.skillLevel) ||
           'Intermediate';
  };

  private getSkillColor = (skill: string): string => {
    const skillLevels = {
      'Advanced': 'bg-blue-100 text-blue-800',
      'Intermediate': 'bg-green-100 text-green-800',
      'Pro': 'bg-purple-100 text-purple-800',
      'Expert': 'bg-red-100 text-red-800',
      'Beginner': 'bg-gray-100 text-gray-800'
    };
    return skillLevels[skill as keyof typeof skillLevels] || 'bg-gray-100 text-gray-800';
  };

  private formatRegistrationDate = (dateString: string): string => {
    if (!dateString) return '01/10/2025';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return '01/10/2025';
    }
  };

  private testCustomerRegistrationsAPI = async (): Promise<void> => {
    console.log('🧪 Testing Customer Registrations API...');
    
    const organizerId = 'a5088fd6-c0c1-4be7-a37b-c45af885faf8';
    const tournamentId = '72e7d5c0-3fb4-4b07-800d-467e036fb912';
    const venueId = 'b1594d86-5689-44e5-848e-ef64224475ed';
    
    console.log('🧪 API Parameters:', { organizerId, tournamentId, venueId });
    
    try {
      const response = await matchesApiService.getTournamentRegistrations(
        tournamentId,
        venueId
      );
      
      console.log('🧪 Test API Response:', response);
      console.log('🧪 Test API Response (JSON):', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ API call successful!');
        if (response.data && response.data.registrations) {
          console.log('📊 Found', response.data.registrations.length, 'registrations');
          response.data.registrations.forEach((reg: any, index: number) => {
            console.log(`👤 Registration ${index + 1}:`, reg);
          });
        } else {
          console.log('⚠️ No registrations found in response');
        }
      } else {
        console.log('❌ API call failed:', response.message);
      }
      
    } catch (error) {
      console.error('❌ Test API Error:', error);
    }
  };

  private handleCloseTournamentModal = (): void => {
    this.setState({
      showTournamentModal: false,
      selectedTournament: null
    });
  };

  private handleNextGameOrganization = async (): Promise<void> => {
    if (!this.state.selectedTournament) {
      console.log('❌ No tournament selected');
      return;
    }

    const tournamentId = this.state.selectedTournament.id;
    console.log('🎮 Starting Tournament Dashboard for:', this.state.selectedTournament.name);
    console.log('🏆 Tournament ID:', tournamentId);

    try {
      // First, call the start tournament API
      console.log('🚀 Calling start tournament API...');
      const startResponse = await matchesApiService.startTournament(tournamentId);
      
      if (startResponse.success) {
        console.log('✅ Tournament started successfully');
        console.log('📊 Tournament status updated to:', startResponse.data?.status);
        
        // Update the selected tournament status in state
        if (this.state.selectedTournament) {
          this.setState({
            selectedTournament: {
              ...this.state.selectedTournament,
              status: startResponse.data?.status || 'started'
            }
          });
        }
      } else {
        console.warn('⚠️ Start tournament API returned success: false:', startResponse.message);
        // Still proceed with game organization even if API fails
      }

      // Create tournament data with all players available for selection
      // Convert tournament ID to number if it's a string
      const tournamentIdString = typeof this.state.selectedTournament.id === 'string' 
        ? this.state.selectedTournament.id 
        : this.state.selectedTournament.id.toString();
      const tournamentIdNumber = typeof this.state.selectedTournament.id === 'number'
        ? this.state.selectedTournament.id
        : tournamentIdString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      
      const tournamentData: TournamentDashboard = {
        id: tournamentIdNumber,
        name: this.state.selectedTournament.name,
        gameType: this.state.selectedTournament.gameType,
        organizerName: 'Tournament Organizer',
        organizerDescription: 'Professional tournament management',
        date: this.state.selectedTournament.startDate,
        time: new Date(this.state.selectedTournament.startDate).toLocaleTimeString(),
        status: 'active',
        players: this.state.selectedTournament.registeredPlayers?.length || 0,
        maxPlayers: this.state.selectedTournament.maxParticipants || 50,
        entryFee: this.state.selectedTournament.entryFee,
        venue: this.state.selectedTournament.venue,
        ballRules: 'Standard tournament rules',
        allPlayers: this.state.selectedTournament.registeredPlayers?.map((player: any) => ({
          id: player.id,
          name: player.name,
          email: player.email,
          skill: player.skillLevel,
          profilePic: player.profilePic,
          selected: false,
          status: 'available' as const, // available, in_round, in_match, in_lobby, eliminated
          currentRound: null,
          currentMatch: null
        })) || [],
        rounds: [],
        currentRound: null,
        tournamentStarted: true,
        tournamentId: tournamentIdString // Store original tournament ID string for API calls
      };

      // Set the current game match and show tournament dashboard
      this.setState({
        currentGameMatch: tournamentData,
        showGameOrganization: true,
        showTournamentModal: false,
        selectedTournament: null
      });

      console.log('🎮 Tournament Dashboard setup complete with', tournamentData.allPlayers.length, 'players');
      
    } catch (error) {
      console.error('❌ Error starting tournament:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start tournament';
      
      // Show error message to user
      alert(`Failed to start tournament: ${errorMessage}`);
      
      // Still proceed with game organization if it's not an auth error
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('401')) {
        // Create tournament data even if API call failed
        // Convert tournament ID to number if it's a string
        const tournamentIdString = typeof this.state.selectedTournament.id === 'string' 
          ? this.state.selectedTournament.id 
          : this.state.selectedTournament.id.toString();
        const tournamentIdNumber = typeof this.state.selectedTournament.id === 'number'
          ? this.state.selectedTournament.id
          : tournamentIdString.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        
        const tournamentData: TournamentDashboard = {
          id: tournamentIdNumber,
          name: this.state.selectedTournament.name,
          gameType: this.state.selectedTournament.gameType,
          organizerName: 'Tournament Organizer',
          organizerDescription: 'Professional tournament management',
          date: this.state.selectedTournament.startDate,
          time: new Date(this.state.selectedTournament.startDate).toLocaleTimeString(),
          status: 'active',
          players: this.state.selectedTournament.registeredPlayers?.length || 0,
          maxPlayers: this.state.selectedTournament.maxParticipants || 50,
          entryFee: this.state.selectedTournament.entryFee,
          venue: this.state.selectedTournament.venue,
          ballRules: 'Standard tournament rules',
          allPlayers: this.state.selectedTournament.registeredPlayers?.map((player: any) => ({
            id: player.id,
            name: player.name,
            email: player.email,
            skill: player.skillLevel,
            profilePic: player.profilePic,
            selected: false,
            status: 'available' as const,
            currentRound: null,
            currentMatch: null
          })) || [],
          rounds: [],
          currentRound: null,
          tournamentStarted: true,
          tournamentId: tournamentIdString // Store original tournament ID string for API calls
        };

        this.setState({
          currentGameMatch: tournamentData,
          showGameOrganization: true,
          showTournamentModal: false,
          selectedTournament: null
        });
      }
    }
  };


  private initializeFirstRound = (players: any[]): TournamentRound => {
    return {
      id: `round_1`,
      name: `Round 1`,
      displayName: `First Round`, // Add this line
      players: players.map((player: any, index: number) => ({
        id: player.id.toString(),
        name: player.name,
        email: player.email,
        skill: player.skillLevel || 'Beginner',
        profilePic: player.profilePic || '/default-avatar.png',
        selected: false,
        status: 'available' as const,
        currentRound: 'round_1',
        currentMatch: null,
        matchesPlayed: 0,
        roundsWon: [],
        hasPlayed: false
      })),
      matches: [],
      winners: [], // Empty initially - winners will be added when matches complete
      losers: [], // Empty initially - losers will be added when matches complete
      status: 'active' as const
    };
  };

  // Method to toggle player selection for movement
  private togglePlayerSelection = (player: Player, roundIndex: number): void => {
    const updatedRounds = this.state.rounds.map((round, index) => {
      if (index === roundIndex) {
        return {
          ...round,
          players: round.players.map(p => 
            p.id === player.id ? { ...p, selected: !p.selected } : p
          )
        };
      }
      return round;
    });

    this.setState({ rounds: updatedRounds });
  };

  // Method to move selected players to target round
  private startMatch = (matchId: string): void => {
    const updatedRounds = this.state.rounds.map(round => ({
      ...round,
      matches: round.matches.map(match => 
        match.id === matchId 
          ? { ...match, status: 'active' as const }
          : match
      )
    }));

    this.setState({ rounds: updatedRounds });
    console.log(`Started match: ${matchId}`);
  };

  private cancelMatch = (matchId: string): void => {
    // Find the match and its players before deleting
    let cancelledMatch = null;
    const updatedRounds = this.state.rounds.map(round => ({
      ...round,
      matches: round.matches.filter(match => {
        if (match.id === matchId) {
          cancelledMatch = match;
          return false; // Remove this match
        }
        return true; // Keep other matches
      }),
      // Also remove the players from the round's players array
      players: round.matches.some(match => match.id === matchId) 
        ? round.players.filter(player => {
            const cancelledPlayers = round.matches
              .filter(match => match.id === matchId)
              .flatMap(match => [match.player1, match.player2]);
            return !cancelledPlayers.some(cancelledPlayer => cancelledPlayer.id === player.id);
          })
        : round.players
    }));

    // Move players back to Tournament Dashboard (main area)
    if (cancelledMatch && this.state.currentGameMatch) {
      const playersToReturn = [cancelledMatch.player1, cancelledMatch.player2];
      
      // Update allPlayers to set status back to 'available'
      const updatedAllPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => {
        const isReturningPlayer = playersToReturn.some(p => p.id === player.id);
        if (isReturningPlayer) {
          return {
            ...player,
            status: 'available' as const,
            selected: false,
            currentRound: null
          };
        }
        return player;
      });

      // Update the current game match
      const updatedCurrentGameMatch = {
        ...this.state.currentGameMatch,
        allPlayers: updatedAllPlayers
      };

      this.setState({ 
        rounds: updatedRounds,
        currentGameMatch: updatedCurrentGameMatch
      });

      console.log(`Cancelled and deleted match: ${matchId}. Returned players: ${playersToReturn.map(p => p.name).join(', ')} to Tournament Dashboard and removed from round`);
    } else {
      this.setState({ rounds: updatedRounds });
      console.log(`Cancelled and deleted match: ${matchId}`);
    }
  };

  private closeMatch = (matchId: string): void => {
    this.setState({
      showWinnerSelectionModal: true,
      selectedMatchForWinner: matchId
    });
  };



  private selectWinner = (winnerPlayer: Player): void => {
    if (!this.state.selectedMatchForWinner) return;
  
    const updatedRounds = this.state.rounds.map(round => {
      // Find the current match to check if it already has a winner
      const currentMatch = round.matches.find(match => match.id === this.state.selectedMatchForWinner);
      
      // Only process the round that contains this match
      if (currentMatch) {
        let updatedWinners = [...round.winners];
        let updatedLosers = [...(round.losers || [])];
        let updatedPlayers = [...round.players];
  
        // Determine the NEW loser (the player who didn't win THIS TIME)
        const newLoserPlayer = currentMatch.player1.id === winnerPlayer.id 
          ? currentMatch.player2 
          : currentMatch.player1;
  
        console.log(`🔄 Winner changed: New winner is ${winnerPlayer.name}, New loser is ${newLoserPlayer.name}`);
  
        // Check if this match already had a winner (winner change scenario)
        if (currentMatch.winner && currentMatch.winner.id !== winnerPlayer.id) {
          const oldWinner = currentMatch.winner;
          const oldLoser = currentMatch.player1.id === oldWinner.id 
            ? currentMatch.player2 
            : currentMatch.player1;
          
          console.log(`📝 Old winner was: ${oldWinner.name}, Old loser was: ${oldLoser.name}`);
          
          // 1. Remove the OLD WINNER from winners array
          updatedWinners = updatedWinners.filter(winner => winner.id !== oldWinner.id);
          console.log(`Removed old winner from winners: ${oldWinner.name}`);
          
          // 2. Remove the OLD LOSER from losers array (because they're becoming the new winner)
          updatedLosers = updatedLosers.filter(loser => loser.id !== oldLoser.id);
          console.log(`Removed old loser from losers: ${oldLoser.name} (they are now the winner)`);
          
          // 3. Add the OLD WINNER to losers array (they are now the loser)
          const oldWinnerAsLoser = {
            ...oldWinner,
            selected: false,
            status: 'eliminated' as const
          };
          updatedLosers.push(oldWinnerAsLoser);
          console.log(`Added old winner to losers: ${oldWinner.name}`);
        } else {
          // First time selecting a winner - just remove the loser from players if they're there
          console.log(`📝 First time selecting winner for this match`);
        }
  
        // Remove the NEW WINNER from active players (if they were there)
        updatedPlayers = updatedPlayers.filter(player => player.id !== winnerPlayer.id);
        
        // Remove the NEW WINNER from losers array (in case they were marked as loser before)
        updatedLosers = updatedLosers.filter(loser => loser.id !== winnerPlayer.id);
        
        // Add the NEW WINNER to winners array with winner flags
        const roundIndex = this.state.rounds.findIndex(r => r.id === round.id);
        const winnerWithFlags = { 
          ...winnerPlayer, 
          selected: false,
          isPreviousRoundWinner: true,
          originalWinnerRoundId: round.id,
          previousWinningRoundId: winnerPlayer.currentRound || null,
          lastWinningRound: round.id,
          lastRoundPlayedNumber: roundIndex
        };
        
        updatedWinners.push(winnerWithFlags);
        console.log(`✅ Added new winner to winners array: ${winnerPlayer.name}`);
        
        // Remove the NEW LOSER from active players
        updatedPlayers = updatedPlayers.filter(player => player.id !== newLoserPlayer.id);
        
        // Remove the NEW LOSER from winners array (in case they were marked as winner before)
        updatedWinners = updatedWinners.filter(winner => winner.id !== newLoserPlayer.id);
        
        // Remove the NEW LOSER from losers array first (to prevent duplicates)
        updatedLosers = updatedLosers.filter(loser => loser.id !== newLoserPlayer.id);
        
        // Add the NEW LOSER to losers array
        const newLoserWithFlags = {
          ...newLoserPlayer,
          selected: false,
          status: 'eliminated' as const
        };
        
        updatedLosers.push(newLoserWithFlags);
        console.log(`❌ Added new loser to losers array: ${newLoserPlayer.name}`);
        
        console.log(`📊 Final state: ${updatedWinners.length} winners, ${updatedLosers.length} losers`);
        
        // Update the match with the new winner
        const updatedMatches = round.matches.map(match => 
          match.id === this.state.selectedMatchForWinner 
            ? { ...match, status: 'completed' as const, winner: winnerPlayer }
            : match
        );
        
        return {
          ...round,
          matches: updatedMatches,
          winners: updatedWinners,
          losers: updatedLosers,
          players: updatedPlayers
        };
      }
  
      // Return unchanged round if it doesn't contain the match
      return round;
    });
  
    // Add winner to permanent history
    const currentRound = this.state.rounds.find(round => 
      round.matches.some(match => match.id === this.state.selectedMatchForWinner)
    );
    
    if (currentRound) {
      const winnerRecord = {
        player: { ...winnerPlayer },
        roundWon: currentRound.displayName || currentRound.name,
        roundWonId: currentRound.id,
        wonAt: new Date(),
        matchId: this.state.selectedMatchForWinner!
      };
      const updatedWinnerHistory = [...this.state.winnerHistory, winnerRecord];
      
      const newWinnerToDisplay = {
        player: { ...winnerPlayer },
        rank: 1,
        title: '',
        roundWon: currentRound.displayName || currentRound.name,
        roundWonId: currentRound.id,
        selected: true
      };
  
      const filteredWinnersToDisplay = this.state.winnersToDisplay.filter(
        winner => winner.player.id !== winnerPlayer.id
      );
  
      const updatedWinnersToDisplay = [newWinnerToDisplay, ...filteredWinnersToDisplay].slice(0, 5);
      
      this.setState({ 
        rounds: updatedRounds,
        winnerHistory: updatedWinnerHistory,
        winnersToDisplay: updatedWinnersToDisplay,
        showWinnerSelectionModal: false,
        selectedMatchForWinner: null
      });
      
      console.log(`✅ Winner selection complete. New winner: ${winnerPlayer.name}`);
    } else {
      this.setState({ 
        rounds: updatedRounds,
        showWinnerSelectionModal: false,
        selectedMatchForWinner: null
      });
    }
  };




  private changeWinner = (matchId: string): void => {
    this.setState({
      showWinnerSelectionModal: true,
      selectedMatchForWinner: matchId
    });
  };

  private showCustomAlert = (title: string, message: string): void => {
    this.setState({
      showCustomAlert: true,
      customAlertTitle: title,
      customAlertMessage: message
    });
  };

  private hideCustomAlert = (): void => {
    this.setState({
      showCustomAlert: false,
      customAlertTitle: '',
      customAlertMessage: ''
    });
  };

  private showDeleteConfirm = (title: string, message: string, callback: () => void): void => {
    this.setState({
      showDeleteConfirmModal: true,
      deleteConfirmTitle: title,
      deleteConfirmMessage: message,
      deleteConfirmCallback: callback
    });
  };

  private hideDeleteConfirm = (): void => {
    this.setState({
      showDeleteConfirmModal: false,
      deleteConfirmTitle: '',
      deleteConfirmMessage: '',
      deleteConfirmCallback: null
    });
  };

  private confirmDelete = (): void => {
    if (this.state.deleteConfirmCallback) {
      this.state.deleteConfirmCallback();
    }
    this.hideDeleteConfirm();
  };

  // Tournament Results Modal
  private showTournamentResults = (): void => {
    this.setState({ showTournamentResults: true });
  };

  private hideTournamentResults = (): void => {
    this.setState({ showTournamentResults: false });
  };

  // Set Winner Titles Modal
  private showSetWinnerTitles = (): void => {
    console.log('🏆 Setting Winner Titles - Using WinnersToDisplay Array:');
    console.log('Current winners to display:', this.state.winnersToDisplay.length);
    console.log('Winners details:', this.state.winnersToDisplay.map(w => ({
      name: w.player.name,
      round: w.roundWon,
      rank: w.rank
    })));

    // Use the winnersToDisplay array directly (most recent round only for each player)
    const rankedWinners = this.state.winnersToDisplay.slice(0, 5).map((winner, index) => ({
      player: winner.player,
      rank: index + 1,
      title: winner.title,
      roundWon: winner.roundWon,
      selected: winner.selected || true // Default to selected if not set
    }));

    console.log('Final ranked winners to display:', rankedWinners.length);

    this.setState({ 
      showSetWinnerTitles: true,
      rankedWinners
    });
  };

  private hideSetWinnerTitles = (): void => {
    this.setState({ showSetWinnerTitles: false });
  };

  private updateWinnerTitle = (index: number, title: string): void => {
    const updatedWinners = [...this.state.rankedWinners];
    updatedWinners[index] = {
      ...updatedWinners[index],
      title
    };
    this.setState({ rankedWinners: updatedWinners });
  };

  private updateWinnerRank = (index: number, newRank: number): void => {
    const updatedWinners = [...this.state.rankedWinners];
    const [movedWinner] = updatedWinners.splice(index, 1);
    movedWinner.rank = newRank;
    updatedWinners.splice(newRank - 1, 0, movedWinner);
    
    // Update all ranks
    updatedWinners.forEach((winner, idx) => {
      winner.rank = idx + 1;
    });
    
    this.setState({ rankedWinners: updatedWinners });
  };

  private toggleWinnerSelection = (index: number): void => {
    const updatedWinners = [...this.state.rankedWinners];
    updatedWinners[index] = {
      ...updatedWinners[index],
      selected: !updatedWinners[index].selected
    };
    this.setState({ rankedWinners: updatedWinners });
  };

  private saveWinnerTitles = (): void => {
    // Update winnersToDisplay with the new titles and rankings
    const updatedWinnersToDisplay = this.state.rankedWinners.map((rankedWinner, index) => ({
      player: rankedWinner.player,
      rank: index + 1,
      title: rankedWinner.title,
      roundWon: rankedWinner.roundWon,
      roundWonId: this.state.winnersToDisplay.find(w => w.player.id === rankedWinner.player.id)?.roundWonId || '',
      selected: rankedWinner.selected || false
    }));

    console.log('💾 Saving winner titles:', {
      rankedWinners: this.state.rankedWinners.length,
      winnersToDisplay: updatedWinnersToDisplay.length,
      titles: updatedWinnersToDisplay.map(w => ({ name: w.player.name, title: w.title, rank: w.rank }))
    });

    this.setState({ 
      winnersToDisplay: updatedWinnersToDisplay,
      showSetWinnerTitles: false 
    });

    // Show success message
    this.showCustomAlert(
      'Winner Titles Saved',
      'Winner titles and rankings have been saved successfully!'
    );
  };

  private deleteLastRound = (): void => {
    if (this.state.rounds.length <= 1) {
      this.showCustomAlert(
        'Cannot Delete Round',
        'Cannot delete the first round. At least one round must exist for the tournament.'
      );
      return;
    }
  
    const lastRound = this.state.rounds[this.state.rounds.length - 1];
    
    // Check if the last round is empty (no players, no matches, no winners)
    const isEmpty = lastRound.players.length === 0 && 
                   lastRound.matches.length === 0 && 
                   lastRound.winners.length === 0;
    
    if (!isEmpty) {
      this.showCustomAlert(
        'Cannot Delete Round',
        `Cannot delete "${lastRound.displayName || lastRound.name}".\n\nThe round must be completely empty (no players, matches, or winners) to be deleted.`
      );
      return;
    }
  
    // Show confirmation modal
    const roundName = lastRound.displayName || lastRound.name;
    this.showDeleteConfirm(
      'Delete Round',
      `Are you sure you want to delete "${roundName}"?\n\nThis action cannot be undone.`,
      () => {
        // Delete the last round
        const updatedRounds = this.state.rounds.slice(0, -1);
        
        // Remove the deleted round's name from usedRoundNames so it can be used again
        const deletedRoundName = lastRound.displayName || lastRound.name;
        const originalRoundName = lastRound.name;

        // Remove the custom display name from usedRoundNames
        let updatedUsedRoundNames = this.state.usedRoundNames.filter(name => 
          name !== deletedRoundName
        );

        // Always add back the standard display name for the round being deleted
        const standardDisplayNames = {
          'Round 1': 'First Round',
          'Round 2': 'Second Round', 
          'Round 3': 'Third Round',
          'Round 4': 'Fourth Round',
          'Round 5': 'Fifth Round',
          'Round 6': 'Sixth Round',
          'Round 7': 'Seventh Round',
          'Round 8': 'Eighth Round',
          'Round 9': 'Ninth Round',
          'Round 10': 'Tenth Round'
        };
        
        const standardDisplayName = standardDisplayNames[lastRound.name] || lastRound.name;
        updatedUsedRoundNames = [...updatedUsedRoundNames, standardDisplayName];
        
        // If the deleted round was active, switch to the previous round
        let newActiveRoundTab = this.state.activeRoundTab;
        if (this.state.activeRoundTab === lastRound.id) {
          newActiveRoundTab = updatedRounds.length > 0 ? updatedRounds[updatedRounds.length - 1].id : null;
        }
  
        this.setState({
          rounds: updatedRounds,
          activeRoundTab: newActiveRoundTab,
          usedRoundNames: updatedUsedRoundNames
        });
  
        console.log(`Deleted last round: ${deletedRoundName}. Made round name available for reuse.`);
      }
    );
  };

  
 
  // Method to start editing round name
  private startEditingRoundName = (roundId: string): void => {
    const round = this.state.rounds.find(r => r.id === roundId);
    if (round) {
      this.setState({
        editingRoundId: roundId,
        editingRoundName: round.displayName || round.name
      });
    }
  };

  // Method to save edited round name
  private saveRoundName = (roundId: string): void => {
    const newName = this.state.editingRoundName.trim();
    if (!newName) return;

    const updatedRounds = this.state.rounds.map(round => 
      round.id === roundId 
        ? { ...round, displayName: newName }
        : round
    );

    this.setState({
      rounds: updatedRounds,
      editingRoundId: null,
      editingRoundName: ''
    });

    this.showCustomAlert("Round name updated successfully!", "success");
  };

  // Method to cancel editing
  private cancelEditingRoundName = (): void => {
    this.setState({
      editingRoundId: null,
      editingRoundName: ''
    });
  };

  // Method to handle closing empty rounds
  private handleCloseRound = (roundId: string): void => {
  const round = this.state.rounds.find(r => r.id === roundId);
  if (!round) return;
  
  // Check if round is empty (same logic as deleteLastRound)
  const isEmpty = round.players.length === 0 && 
                 round.matches.length === 0 && 
                 round.winners.length === 0 &&
                 (round.losers?.length === 0 || !round.losers);
  
  if (!isEmpty) {
    this.showCustomAlert(
      'Cannot Close Round',
      `Cannot close "${round.displayName || round.name}".\n\nThe round must be completely empty (no players, matches, winners, or losers) to be closed.`
    );
    return;
  }

  // Show confirmation modal
  const roundName = round.displayName || round.name;
  this.showDeleteConfirm(
    'Close Round',
    `Are you sure you want to close "${roundName}"?\n\nThis action cannot be undone.`,
    () => {
      // Remove the round
      const updatedRounds = this.state.rounds.filter(r => r.id !== roundId);
      
      // Remove the closed round's name from usedRoundNames so it can be used again
      const closedRoundName = round.displayName || round.name;
      const originalRoundName = round.name;

      // Remove the custom display name from usedRoundNames
      let updatedUsedRoundNames = this.state.usedRoundNames.filter(name => 
        name !== closedRoundName
      );

      // Always add back the standard display name for the round being deleted
      const standardDisplayNames = {
        'Round 1': 'First Round',
        'Round 2': 'Second Round', 
        'Round 3': 'Third Round',
        'Round 4': 'Fourth Round',
        'Round 5': 'Fifth Round',
        'Round 6': 'Sixth Round',
        'Round 7': 'Seventh Round',
        'Round 8': 'Eighth Round',
        'Round 9': 'Ninth Round',
        'Round 10': 'Tenth Round'
      };
      
      const standardDisplayName = standardDisplayNames[round.name] || round.name;
      updatedUsedRoundNames = [...updatedUsedRoundNames, standardDisplayName];
      
      // If the closed round was active, switch to another round or clear selection
      let newActiveRoundTab = this.state.activeRoundTab;
      if (this.state.activeRoundTab === roundId) {
        newActiveRoundTab = updatedRounds.length > 0 ? updatedRounds[0].id : null;
      }
      
      this.setState({
        rounds: updatedRounds,
        activeRoundTab: newActiveRoundTab,
        usedRoundNames: updatedUsedRoundNames
      });

      console.log('🔍 After close cleanup:', {
        closedRoundName,
        originalRoundName,
        updatedUsedRoundNames,
        hasCustomDisplayName: round.displayName && round.displayName !== round.name
      });
      console.log(`Closed round: ${closedRoundName}. Made round name available for reuse.`);
      this.showCustomAlert("Round closed successfully.", "success");
    }
  );
};



  // Method to toggle winner selection for movement
  private toggleWinnerSelectionForMovement = (winner: Player, roundId: string): void => {
    const updatedRounds = this.state.rounds.map(round => {
      if (round.id === roundId) {
        return {
          ...round,
          winners: round.winners.map(w => 
            w.id === winner.id 
              ? { ...w, selected: !w.selected }
              : w
          )
        };
      }
      return round;
    });

    this.setState({ rounds: updatedRounds });
  };

  // Method to move selected winners to target round
  private moveSelectedWinnersToRound = (sourceRoundId: string): void => {
    if (!this.state.selectedRoundId) {
      console.log('Please select a destination');
      return;
    }

    // Find source round
    const sourceRoundIndex = this.state.rounds.findIndex(r => r.id === sourceRoundId);
    if (sourceRoundIndex === -1) {
      console.log('Source round not found');
      return;
    }

    const sourceRound = this.state.rounds[sourceRoundIndex];
    const selectedWinners = sourceRound.winners.filter(w => w.selected);
    
    if (selectedWinners.length === 0) {
      console.log('No winners selected to move');
      return;
    }

    // Winners can only move to other rounds (not dashboard) to maintain tournament hierarchy
    // Dashboard option is removed from winners tab dropdown

    // Find target round
    const targetRoundIndex = this.state.rounds.findIndex(r => r.id === this.state.selectedRoundId);
    if (targetRoundIndex === -1) {
      console.log('Target round not found');
      return;
    }

    const targetRound = this.state.rounds[targetRoundIndex];
    
    // Check if target round is frozen
    if (targetRound.isFrozen) {
      this.showCustomAlert(
        'Cannot Move Winners',
        `Cannot move winners to "${targetRound.displayName || targetRound.name}".\n\nThis round is frozen and no more changes are allowed.`
      );
      return;
    }
    
    const currentPlayersInTarget = targetRound.players.length;
    const playersAfterMove = currentPlayersInTarget + selectedWinners.length;

    // Allow odd numbers when moving from winners tab - winners can advance to next round
    // The validation for even numbers will happen when creating matches, not when moving winners
    console.log(`Moving ${selectedWinners.length} winners to ${targetRound.displayName || targetRound.name}. Target will have ${playersAfterMove} players.`);

    // Determine if we're moving to a previous round (back to winners) or next round (advance to players)
    const currentRoundIndex = this.state.rounds.findIndex(r => r.id === sourceRoundId);
    const isMovingToPreviousRound = targetRoundIndex < currentRoundIndex;
    
    // For backward movement, validate that winners can only move back to their lastWinningRound
    if (isMovingToPreviousRound) {
      // Check if any selected winner is trying to move beyond their lastWinningRound
      const invalidWinners = selectedWinners.filter(winner => {
        if (winner.lastWinningRound) {
          const lastWinningRoundIndex = this.state.rounds.findIndex(r => r.id === winner.lastWinningRound);
          return targetRoundIndex < lastWinningRoundIndex;
        }
        return false;
      });
      
      if (invalidWinners.length > 0) {
        const targetRoundName = targetRound.displayName || targetRound.name;
        const sourceRoundName = sourceRound.displayName || sourceRound.name;
        const invalidWinnerNames = invalidWinners.map(w => w.name).join(', ');
        this.setState({
          showOddNumberAlert: true,
          oddNumberAlertMessage: `Cannot move winners from "${sourceRoundName}" to "${targetRoundName}".\n\nWinners (${invalidWinnerNames}) can only move back to their last winning round or further.\n\nPlease select a valid target round.`
        });
        return;
      }
    }
    
    // Check if any selected winners have the isPreviousRoundWinner flag
    const previousRoundWinners = selectedWinners.filter(w => w.isPreviousRoundWinner);
    const hasPreviousRoundWinners = previousRoundWinners.length > 0;
    
    console.log(`Move logic: currentRoundIndex=${currentRoundIndex}, targetRoundIndex=${targetRoundIndex}, isMovingToPreviousRound=${isMovingToPreviousRound}`);
    console.log(`Selected winners:`, selectedWinners.map(w => ({ 
      name: w.name, 
      isPreviousRoundWinner: w.isPreviousRoundWinner, 
      originalWinnerRoundId: w.originalWinnerRoundId,
      currentRound: w.currentRound
    })));
    console.log(`Winner history tracking:`, selectedWinners.map(w => ({
      name: w.name,
      history: `Won in: ${w.originalWinnerRoundId || 'Unknown'}, Current: ${w.currentRound || 'Unknown'}`
    })));

    // Update the rounds array
    const updatedRounds = this.state.rounds.map((round, index) => {
      if (index === sourceRoundIndex) {
        // Remove selected winners from source round
        return {
          ...round,
          winners: round.winners.filter(w => !w.selected)
        };
      } else if (index === targetRoundIndex) {
        if (isMovingToPreviousRound) {
          // Moving back to previous round - add to winners tab (allow odd numbers)
          const newWinners = [
            ...round.winners,
            ...selectedWinners.map(w => ({ 
              ...w, 
              selected: false,
              // Maintain winner flags when going back
              isPreviousRoundWinner: w.isPreviousRoundWinner || false,
              originalWinnerRoundId: w.originalWinnerRoundId || null,
              previousWinningRoundId: w.previousWinningRoundId || null
            }))
          ];
          console.log(`Adding ${selectedWinners.length} winners to ${round.displayName || round.name} winners tab. New count: ${newWinners.length} (odd numbers allowed for winners tab)`);
          return {
            ...round,
            winners: newWinners
          };
        } else {
          // Moving forward to next round - add to players tab for new matches
          const newPlayers = [
            ...round.players,
            ...selectedWinners.map(w => ({ 
              ...w, 
              selected: false, 
              currentRound: round.id, 
              status: 'available' as const,
              lastRoundPlayedNumber: index, // Set the round number (array index) where they're playing
              // Maintain winner flags when advancing
              isPreviousRoundWinner: w.isPreviousRoundWinner || false,
              originalWinnerRoundId: w.originalWinnerRoundId || null,
              previousWinningRoundId: sourceRoundId // Track the round they're coming from
            }))
          ];
          console.log(`Adding ${selectedWinners.length} winners to ${round.displayName || round.name} players tab. New count: ${newPlayers.length}`);
          return {
            ...round,
            players: newPlayers
          };
        }
      }
      return round;
    });

    this.setState({ 
      rounds: updatedRounds,
      selectedRoundId: null // Reset selection
    });

    const destination = isMovingToPreviousRound ? 
      `${this.state.rounds[targetRoundIndex].displayName || this.state.rounds[targetRoundIndex].name} Winners Tab` :
      `${this.state.rounds[targetRoundIndex].displayName || this.state.rounds[targetRoundIndex].name} Players Tab`;
    
    console.log(`Moved ${selectedWinners.length} winners from ${sourceRound.displayName || sourceRound.name} Winners Tab to ${destination}`);
  };

  private shuffleRoundPlayers = (roundId: string): void => {
    const roundIndex = this.state.rounds.findIndex(r => r.id === roundId);
    if (roundIndex === -1) {
      console.log('Round not found');
      return;
    }

    const round = this.state.rounds[roundIndex];
    
    // Check if round is frozen
    if (round.isFrozen) {
      this.showCustomAlert(
        'Cannot Shuffle Round',
        `Cannot shuffle "${round.displayName || round.name}".\n\nThis round is frozen and no more changes are allowed.`
      );
      return;
    }
    
    // Get all players who are already in matches
    const matchedPlayerIds = new Set();
    round.matches.forEach(match => {
      matchedPlayerIds.add(match.player1.id);
      matchedPlayerIds.add(match.player2.id);
    });
    
    // Filter out players who are already in matches - only shuffle unmatched players
    const unmatchedPlayers = round.players.filter(player => !matchedPlayerIds.has(player.id));
    
    if (unmatchedPlayers.length === 0) {
      console.log('No unmatched players to shuffle');
      return;
    }

    // Check if unmatched players count is odd number
    if (unmatchedPlayers.length % 2 !== 0) {
      this.setState({
        showOddNumberAlert: true,
        oddNumberAlertMessage: `Cannot create matches in "${round.displayName || round.name}".\n\nThere are ${unmatchedPlayers.length} unmatched players (odd number).\n\nRounds must have even number of players for proper match pairings.\n\nPlease add or remove 1 player to create matches.`
      });
      return;
    }
    
    // Shuffle only the unmatched players
    const playersToShuffle = [...unmatchedPlayers];
    for (let i = playersToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playersToShuffle[i], playersToShuffle[j]] = [playersToShuffle[j], playersToShuffle[i]];
    }

    // Create new matches from unmatched players
    const newMatches: TournamentMatch[] = [];
    const existingMatchCount = round.matches.length;
    for (let i = 0; i < playersToShuffle.length; i += 2) {
      if (i + 1 < playersToShuffle.length) {
        newMatches.push({
          id: `match_${roundId}_${existingMatchCount + Math.floor(i / 2) + 1}`,
          player1: playersToShuffle[i],
          player2: playersToShuffle[i + 1],
          status: 'pending' as const
        });
      }
    }

    // Combine existing matches with new matches
    const allMatches = [...round.matches, ...newMatches];

    // Update the round with existing matches + new matches
    const updatedRounds = this.state.rounds.map((r, index) => {
      if (index === roundIndex) {
        return {
          ...r,
          matches: allMatches
        };
      }
      return r;
    });

    this.setState({ rounds: updatedRounds });
    console.log(`Shuffled ${playersToShuffle.length} unmatched players and created ${newMatches.length} new matches in ${round.displayName || round.name}. Preserved ${round.matches.length} existing matches.`);
  };

  private freezeRound = (roundId: string): void => {
    const roundIndex = this.state.rounds.findIndex(r => r.id === roundId);
    if (roundIndex === -1) {
      console.log('Round not found');
      return;
    }

    const round = this.state.rounds[roundIndex];
    
    // Check if round can be frozen:
    // 1. All matches must be completed
    // 2. No unmatched players should remain
    
    const allMatchesCompleted = round.matches.length > 0 && round.matches.every(match => match.status === 'completed');
    
    // Get all players who are already in matches
    const matchedPlayerIds = new Set();
    round.matches.forEach(match => {
      matchedPlayerIds.add(match.player1.id);
      matchedPlayerIds.add(match.player2.id);
    });
    
    // Filter out players who are already in matches
    const unmatchedPlayers = round.players.filter(player => !matchedPlayerIds.has(player.id));
    const hasUnmatchedPlayers = unmatchedPlayers.length > 0;
    
    if (!allMatchesCompleted) {
      this.showCustomAlert(
        'Cannot Freeze Round',
        `Cannot freeze "${round.displayName || round.name}".\n\nAll matches must be completed before freezing the round.`
      );
      return;
    }
    
    if (hasUnmatchedPlayers) {
      this.showCustomAlert(
        'Cannot Freeze Round',
        `Cannot freeze "${round.displayName || round.name}".\n\nThere are ${unmatchedPlayers.length} unmatched players remaining.\n\nPlease move them out or complete matches with them before freezing.`
      );
      return;
    }
    
    // Freeze the round
    const updatedRounds = this.state.rounds.map((r, index) => {
      if (index === roundIndex) {
        return {
          ...r,
          isFrozen: true,
          status: 'completed' as const
        };
      }
      return r;
    });

    this.setState({ rounds: updatedRounds });
    console.log(`Frozen round: ${round.displayName || round.name}. No more changes allowed.`);
  };

  private moveSelectedPlayersFromRound = (sourceRoundId: string): void => {
    /*if (!this.state.selectedRoundId) {
      console.log('Please select a destination');
      return;
    }*/

    // Default to dashboard if no selection
    const targetRoundId = this.state.selectedRoundId || 'dashboard';

    // Find source round
    const sourceRoundIndex = this.state.rounds.findIndex(r => r.id === sourceRoundId);
    if (sourceRoundIndex === -1) {
      console.log('Source round not found');
      return;
    }

    const sourceRound = this.state.rounds[sourceRoundIndex];
    const selectedPlayers = sourceRound.players.filter(p => p.selected);
    
    if (selectedPlayers.length === 0) {
      console.log('No players selected to move');
      return;
    }

    // Check if moving to dashboard
    if (targetRoundId === 'dashboard' || targetRoundId === 'dashboard2' || targetRoundId === 'dashboard3') {
      // Check if any selected players are previous round winners
      const previousRoundWinners = selectedPlayers.filter(p => p.isPreviousRoundWinner);
      const regularPlayers = selectedPlayers.filter(p => !p.isPreviousRoundWinner);
      
      if (previousRoundWinners.length > 0) {
        // Previous round winners should automatically go back to their original winners tab
        console.log(`${previousRoundWinners.length} previous round winner(s) detected. They will be moved to their original winners tab instead of dashboard.`);
        
        // Move previous round winners to their original winners tab
        const updatedRoundsForWinners = this.state.rounds.map(round => {
          const winnersToAdd = previousRoundWinners.filter(w => w.originalWinnerRoundId === round.id);
          if (winnersToAdd.length > 0) {
            return {
              ...round,
              winners: [
                ...round.winners,
                ...winnersToAdd.map(w => ({ 
                  ...w, 
                  selected: false,
                  // Maintain winner history when returning to dashboard
                  isPreviousRoundWinner: true,
                  originalWinnerRoundId: w.originalWinnerRoundId
                }))
              ]
            };
          }
          return round;
        });
        
        // Move regular players back to Tournament Dashboard
        let updatedAllPlayers = this.state.currentGameMatch?.allPlayers || [];
        if (regularPlayers.length > 0 && this.state.currentGameMatch) {
          updatedAllPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => {
            const isMovingPlayer = regularPlayers.some(p => p.id === player.id);
            if (isMovingPlayer) {
              return {
                ...player,
                status: 'available' as const,
                selected: false,
                currentRound: null
              };
            }
            return player;
          });
        }
        
        // Remove all selected players from source round
        const updatedRounds = updatedRoundsForWinners.map((round, index) => {
          if (index === sourceRoundIndex) {
            return {
              ...round,
              players: round.players.filter(p => !p.selected)
            };
          }
          return round;
        });
        
        const updatedCurrentGameMatch = {
          ...this.state.currentGameMatch,
          allPlayers: updatedAllPlayers
        };

        this.setState({ 
          rounds: updatedRounds,
          currentGameMatch: updatedCurrentGameMatch,
          selectedRoundId: null
        });

        console.log(`Moved ${regularPlayers.length} regular players to dashboard and ${previousRoundWinners.length} previous round winners to their original winners tabs`);
        return;
      }
      
      // Move regular players back to Tournament Dashboard
      if (this.state.currentGameMatch) {
        const updatedAllPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => {
          const isMovingPlayer = selectedPlayers.some(p => p.id === player.id);
          if (isMovingPlayer) {
            return {
              ...player,
              status: 'available' as const,
              selected: false,
              currentRound: null
            };
          }
          return player;
        });

        // Remove players from source round
        const updatedRounds = this.state.rounds.map((round, index) => {
          if (index === sourceRoundIndex) {
            return {
              ...round,
              players: round.players.filter(p => !p.selected)
            };
          }
          return round;
        });

        const updatedCurrentGameMatch = {
          ...this.state.currentGameMatch,
          allPlayers: updatedAllPlayers
        };

        this.setState({ 
          rounds: updatedRounds,
          currentGameMatch: updatedCurrentGameMatch,
          selectedRoundId: null
        });

        console.log(`Moved ${selectedPlayers.length} players from ${sourceRound.displayName || sourceRound.name} back to Tournament Dashboard`);
      }
      return;
    }

    // Find target round
    const targetRoundIndex = this.state.rounds.findIndex(r => r.id === targetRoundId);
    
    if (targetRoundIndex === -1) {
      console.log('Target round not found');
      return;
    }

    const targetRound = this.state.rounds[targetRoundIndex];
    
    // Check if target round is frozen
    if (targetRound.isFrozen) {
      this.showCustomAlert(
        'Cannot Move Players',
        `Cannot move players to "${targetRound.displayName || targetRound.name}".\n\nThis round is frozen and no more changes are allowed.`
      );
      return;
    }
    
    const currentPlayersInTarget = targetRound.players.length;
    const playersAfterMove = currentPlayersInTarget + selectedPlayers.length;

    // Check if target round will have even number of players
    // BUT allow odd numbers if winners are moving back to their previous winners tab
    const isWinnerMovingBackToPreviousWinnersTab = selectedPlayers.some(p => 
      p.isPreviousRoundWinner && p.previousWinningRoundId === this.state.selectedRoundId
    );
    
    if (playersAfterMove % 2 !== 0 && !isWinnerMovingBackToPreviousWinnersTab) {
      const targetRoundName = this.state.rounds[targetRoundIndex].displayName || this.state.rounds[targetRoundIndex].name;
      const sourceRoundName = sourceRound.displayName || sourceRound.name;
      this.setState({
        showOddNumberAlert: true,
        oddNumberAlertMessage: `Cannot move ${selectedPlayers.length} player(s) from "${sourceRoundName}" to "${targetRoundName}".\n\nTarget round will have ${playersAfterMove} players (odd number).\n\nRounds must have even number of players for proper match pairings.\n\nPlease select a different number of players or choose a different target round.`
      });
      return;
    }

    // Update the rounds array
    const updatedRounds = this.state.rounds.map((round, index) => {
      if (index === sourceRoundIndex) {
        // Remove selected players from source round
        return {
          ...round,
          players: round.players.filter(p => !p.selected)
        };
        } else if (index === targetRoundIndex) {
          // Check if any selected players are previous round winners
          const previousRoundWinners = selectedPlayers.filter(p => p.isPreviousRoundWinner);
          const regularPlayers = selectedPlayers.filter(p => !p.isPreviousRoundWinner);
          
          let updatedRound = { ...round };
          
          // Add regular players to players tab
          if (regularPlayers.length > 0) {
            updatedRound = {
              ...updatedRound,
              players: [
                ...round.players,
                ...regularPlayers.map(p => ({ ...p, selected: false, currentRound: round.id, lastRoundPlayedNumber: index }))
              ]
            };
          }
          
          // Add previous round winners to winners tab if they're going back to their previous winning round
          if (previousRoundWinners.length > 0) {
            const winnersToAddToWinners = previousRoundWinners.filter(p => p.previousWinningRoundId === round.id);
            if (winnersToAddToWinners.length > 0) {
              updatedRound = {
                ...updatedRound,
                winners: [
                  ...round.winners,
                  ...winnersToAddToWinners.map(p => ({ 
                    ...p, 
                    selected: false,
                    // Maintain winner history - they're returning to their previous winners tab
                    isPreviousRoundWinner: true,
                    originalWinnerRoundId: p.originalWinnerRoundId,
                    previousWinningRoundId: p.previousWinningRoundId
                  }))
                ]
              };
              console.log(`Added ${winnersToAddToWinners.length} previous round winners to ${round.displayName || round.name} winners tab (returning to previous winning round)`);
            }
            
            // Add remaining previous round winners to players tab
            const winnersToAddToPlayers = previousRoundWinners.filter(p => p.previousWinningRoundId !== round.id);
            if (winnersToAddToPlayers.length > 0) {
              updatedRound = {
                ...updatedRound,
                players: [
                  ...updatedRound.players,
                  ...winnersToAddToPlayers.map(p => ({ 
                    ...p, 
                    selected: false, 
                    currentRound: round.id,
                    // Maintain winner history even when going to a different round
                    isPreviousRoundWinner: true,
                    originalWinnerRoundId: p.originalWinnerRoundId
                  }))
                ]
              };
              console.log(`Added ${winnersToAddToPlayers.length} previous round winners to ${round.displayName || round.name} players tab (cross-round movement, maintaining history)`);
            }
          }
          
          return updatedRound;
        }
      return round;
    });

    this.setState({ 
      rounds: updatedRounds,
      selectedRoundId: null // Reset selection
    });

    console.log(`Moved ${selectedPlayers.length} players from ${sourceRound.displayName || sourceRound.name} to ${this.state.rounds[targetRoundIndex].displayName || this.state.rounds[targetRoundIndex].name}`);
  };

  private moveSelectedPlayersToRound = (): void => {
    if (!this.state.selectedRoundId) {
      this.addAppNotification('Please select a target round', 'error');
      return;
    }

    const firstRound = this.state.rounds[0];
    const selectedPlayers = firstRound.players.filter(p => p.selected);
    
    if (selectedPlayers.length === 0) {
      this.addAppNotification('Please select players to move', 'error');
      return;
    }

    // Find target round
    const targetRoundIndex = this.state.rounds.findIndex(r => r.id === this.state.selectedRoundId);
    
    if (targetRoundIndex === -1) {
      this.addAppNotification('Target round not found', 'error');
      return;
    }

    // Move players: remove from first round, add to target round
    const updatedRounds = this.state.rounds.map((round, index) => {
      if (index === 0) {
        // Remove selected players from first round
        return {
          ...round,
          players: round.players.filter(p => !p.selected)
        };
      } else if (index === targetRoundIndex) {
        // Add selected players to target round (unselect them)
        return {
          ...round,
          players: [
            ...round.players,
            ...selectedPlayers.map(p => ({ 
              ...p, 
              selected: false,
              currentRound: round.id,
              // Maintain winner history when moving between rounds
              isPreviousRoundWinner: p.isPreviousRoundWinner || false,
              originalWinnerRoundId: p.originalWinnerRoundId || null
            }))
          ]
        };
      }
      return round;
    });

    this.setState({ 
      rounds: updatedRounds,
      selectedRoundId: null // Reset dropdown
    });

    this.addAppNotification(
      `Moved ${selectedPlayers.length} player(s) successfully!`, 
      'success'
    );
  };

  private handleStartTournament = (): void => {
    if (!this.state.selectedTournament) {
      this.showCustomAlert("No tournament selected", "error");
      return;
    }
  
    // Create tournament data
    const tournamentData: TournamentDashboard = {
      id: this.state.selectedTournament.id,
      name: this.state.selectedTournament.name,
      location: this.state.selectedTournament.location,
      date: this.state.selectedTournament.date,
      time: this.state.selectedTournament.time,
      gameType: this.state.selectedTournament.gameType,
      registeredPlayers: this.state.selectedTournament.registeredPlayers || [],
      allPlayers: (this.state.selectedTournament.registeredPlayers || []).map((player: any, index: number) => ({
        id: player.id.toString(),
        name: player.name,
        email: player.email,
        skill: player.skillLevel || 'Beginner',
        profilePic: player.profilePic || '/default-avatar.png',
        selected: false,
        status: 'available' as const,
        currentRound: null,
        currentMatch: null
      })) || [],
      rounds: [],
      currentRound: null,
      tournamentStarted: true
    };
  
    // Initialize the first round
    const firstRound = this.initializeFirstRound(this.state.selectedTournament.registeredPlayers || []);
    
    console.log('🎮 Tournament data created:', {
      id: tournamentData.id,
      name: tournamentData.name,
      allPlayers: tournamentData.allPlayers.length,
      tournamentStarted: tournamentData.tournamentStarted,
      firstRoundPlayers: firstRound.players.length
    });
  
    // Set the current game match and show tournament dashboard
    this.setState({
      currentGameMatch: {
        ...tournamentData,
        rounds: [firstRound]
      },
      showGameOrganization: true,
      activeRoundTab: firstRound.id,
      activeRoundSubTab: { [firstRound.id]: 'players' },
      // Add "First Round" to usedRoundNames since it's created automatically
      usedRoundNames: ['First Round']
    });
  
    console.log('🎮 Tournament Dashboard setup complete with', tournamentData.allPlayers.length, 'players');
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

  private handleCloseGameOrganization = (): void => {
    this.setState({
      showGameOrganization: false,
      currentGameMatch: null,
      shuffledMatches: []
    });
  };

  private generateRandomTime = (): string => {
    const hours = Math.floor(Math.random() * 12) + 13; // 13-24 (1 PM - 12 AM)
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  private generateRandomDuration = (): string => {
    const minutes = Math.floor(Math.random() * 60) + 30; // 30-89 minutes
    return `${minutes} min`;
  };

  private generateRandomScore = (): string => {
    const score1 = Math.floor(Math.random() * 10) + 10; // 10-19
    const score2 = Math.floor(Math.random() * 10) + 5;  // 5-14
    return `${score1}-${score2}`;
  };

  private handleCloseProfileModal = (): void => {
    this.setState({
      showProfileModal: false,
      selectedProfile: null
    });
  };

  private handleCustomerPageChange = (page: number): void => {
    this.setState({
      customerPage: page
    });
  };

  private getPaginatedCustomers = (): any[] => {
    const { customerPage, customersPerPage } = this.state;
    const filteredCustomers = this.getFilteredCustomers();
    const startIndex = (customerPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  };

  private getTotalPages = (): number => {
    const filteredCustomers = this.getFilteredCustomers();
    return Math.ceil(filteredCustomers.length / this.state.customersPerPage);
  };

  private getPageNumbers = (): (number | string)[] => {
    const currentPage = this.state.customerPage;
    const totalPages = this.getTotalPages();
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      if (currentPage <= 4) {
        // Show first 5 pages, then ellipsis, then last page
        for (let i = 2; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page, ellipsis, then last 5 pages
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  private handleMatchClick = (match: Match): void => {
    this.setState({
      selectedMatch: match,
      showMatchDetails: true
    });
  };

  private handleEditMatch = (match: Match): void => {
    this.setState({
      isEditMode: true,
      isCreatingMatch: true,
      matchForm: {
        matchName: match.name,
        gameType: match.gameType,
        organizerName: match.organizerName || '',
        organizerDescription: match.organizerDescription || '',
        ballRules: match.ballRules,
        fewRules: '',
        matchDate: match.date,
        matchTime: match.time,
        registrationEndTime: '',
        venue: match.venue,
        locationId: match.location?.id || '',
        entryFee: match.entryFee.toString(),
        maxPlayers: match.maxPlayers.toString(),
        moreDetails: ''
      },
      selectedLocation: match.location || null
    });
  };

  private handleShowNotifiedUsers = (): void => {
    this.setState({ showNotifiedUsers: true });
  };

  private getStatusColor = (status: string): string => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Notification methods
  private handleNotificationInputChange = (field: string, value: string | number[]): void => {
    this.setState({
      notificationForm: {
        ...this.state.notificationForm,
        [field]: value
      }
    });
  };

  private handleCustomerSelection = (customerId: number, isSelected: boolean): void => {
    const { selectedCustomers } = this.state.notificationForm;
    const updatedCustomers = isSelected
      ? [...selectedCustomers, customerId]
      : selectedCustomers.filter(id => id !== customerId);

    this.setState({
      notificationForm: {
        ...this.state.notificationForm,
        selectedCustomers: updatedCustomers
      }
    });
  };

  private handleSelectAllCustomers = (): void => {
    const allCustomerIds = this.registeredCustomers.map(customer => customer.id);
    this.setState({
      notificationForm: {
        ...this.state.notificationForm,
        selectedCustomers: allCustomerIds
      }
    });
  };

  private handleClearCustomerSelection = (): void => {
    this.setState({
      notificationForm: {
        ...this.state.notificationForm,
        selectedCustomers: []
      }
    });
  };

  private handleSendNotification = (): void => {
    const { notificationForm } = this.state;
    const { notificationType, selectedCustomers } = notificationForm;
    
    let sentTo = '';
    let sentCount = 0;

    if (notificationType === 'all') {
      sentTo = 'All Customers';
      sentCount = this.registeredCustomers.length;
    } else {
      sentTo = 'Selected Customers';
      sentCount = selectedCustomers.length;
    }

    console.log('Notification sent:', {
      ...notificationForm,
      sentTo,
      sentCount,
      sentAt: new Date().toISOString()
    });

    // Reset form and close modal
    this.setState({
      showSendNotificationModal: false,
      notificationForm: {
        title: '',
        message: '',
        notificationType: 'all',
        selectedCustomers: []
      }
    });

    alert(`Notification sent successfully to ${sentCount} customers!`);
  };

  private handleOpenSendNotification = (matchId?: number): void => {
    this.setState({
      showSendNotificationModal: true,
      notificationForm: {
        ...this.state.notificationForm,
        matchId
      }
    });
  };


  private createNewRound = (displayName: string): TournamentRound => {
    const roundNumber = this.state.rounds.length + 1;
    
    return {
      id: `round_${roundNumber}`,
      name: `Round ${roundNumber}`,
      displayName: displayName, // This will be "First Round", "Semi Final", etc.
      players: [], // Empty initially - players will be added later
      matches: [],
      winners: [], // Empty initially - winners will be added when matches complete
      losers: [], // Empty initially - losers will be added when matches complete
      status: 'pending' as const
    };
  };

  private handleCreateRoundFromModal = async (): Promise<void> => {
    if (!this.state.selectedRoundDisplayName.trim()) {
      alert('Please enter a round name');
      return;
    }
    
    // Get tournament ID from currentGameMatch
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.tournamentId) {
      console.error('❌ No tournament ID found in currentGameMatch');
      alert('Error: Tournament ID not found. Please refresh and try again.');
      return;
    }
    
    const tournamentId = this.state.currentGameMatch.tournamentId;
    const roundNumber = this.state.rounds.length + 1;
    const roundDisplayName = this.state.selectedRoundDisplayName.trim();
    
    // Determine roundName from displayName (use a simplified version)
    const roundName = roundDisplayName.toLowerCase().replace(/\s+/g, '_');
    
    console.log('🎯 Creating round via API:', {
      tournamentId,
      roundNumber,
      roundName,
      roundDisplayName
    });
    
    try {
      // Call the create round API
      const response = await matchesApiService.createRound(tournamentId, {
        roundNumber: roundNumber,
        roundName: roundName,
        roundDisplayName: roundDisplayName,
        status: 'pending', // Default to pending, can be changed later
        isFreezed: false
      });
      
      if (response.success) {
        console.log('✅ Round created successfully via API');
        console.log('📦 Round data from API:', response.data);
        
        // Create the round locally with the data from API
        const newRound = this.createNewRound(roundDisplayName);
        
        // Update state with the new round
        this.setState({
          rounds: [...this.state.rounds, newRound],
          activeRoundTab: newRound.id, // Set the new round as active
          activeRoundSubTab: { ...this.state.activeRoundSubTab, [newRound.id]: 'matches' }, // Initialize sub-tab to 'matches'
          showRoundNameModal: false,
          selectedRoundDisplayName: '',
          usedRoundNames: [...this.state.usedRoundNames, roundDisplayName] // Add to used names
        });
        
        alert('Round created successfully!');
      } else {
        throw new Error(response.message || 'Failed to create round');
      }
      
    } catch (error) {
      console.error('❌ Error creating round:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create round';
      alert(`Error creating round: ${errorMessage}`);
    }
  };


  private showRoundModal = (): void => {
    // Show modal or dropdown with predefined round names
    this.setState({
      showRoundNameModal: true
    });
  };
  
  private handleConfirmRoundCreation = (selectedDisplayName: string): void => {
    const newRound = this.createNewRound(selectedDisplayName);
    
    this.setState({
      rounds: [...this.state.rounds, newRound],
      showRoundNameModal: false
    });
  };









// Method to toggle loser selection for movement
private toggleLoserSelectionForMovement = (loser: Player, roundId: string): void => {
  const updatedRounds = this.state.rounds.map(round => {
    if (round.id === roundId) {
      return {
        ...round,
        losers: round.losers.map(l => 
          l.id === loser.id 
            ? { ...l, selected: !l.selected }
            : l
        )
      };
    }
    return round;
  });

  this.setState({ rounds: updatedRounds });
};

// Method to move selected losers to destination
private moveSelectedLosersToDestination = (sourceRoundId: string): void => {
  if (!this.state.selectedRoundId) {
    console.log('Please select a destination');
    return;
  }

  // Find source round
  const sourceRoundIndex = this.state.rounds.findIndex(r => r.id === sourceRoundId);
  if (sourceRoundIndex === -1) {
    console.log('Source round not found');
    return;
  }

  const sourceRound = this.state.rounds[sourceRoundIndex];
  const selectedLosers = sourceRound.losers.filter(l => l.selected);
  
  if (selectedLosers.length === 0) {
    console.log('No losers selected to move');
    return;
  }

  // Check if moving to dashboard
  if (this.state.selectedRoundId === 'dashboard') {
    // Move losers back to Tournament Dashboard
    if (this.state.currentGameMatch) {
      const updatedAllPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => {
        const isMovingLoser = selectedLosers.some(l => l.id === player.id);
        if (isMovingLoser) {
          return {
            ...player,
            status: 'available' as const,
            selected: false,
            currentRound: null
          };
        }
        return player;
      });

      // Remove losers from source round
      const updatedRounds = this.state.rounds.map((round, index) => {
        if (index === sourceRoundIndex) {
          return {
            ...round,
            losers: round.losers.filter(l => !l.selected)
          };
        }
        return round;
      });

      const updatedCurrentGameMatch = {
        ...this.state.currentGameMatch,
        allPlayers: updatedAllPlayers
      };

      this.setState({ 
        rounds: updatedRounds,
        currentGameMatch: updatedCurrentGameMatch,
        selectedRoundId: null
      });

      console.log(`Moved ${selectedLosers.length} losers from ${sourceRound.displayName || sourceRound.name} back to Tournament Dashboard`);
    }
    return;
  }

  // Find target round
  const targetRoundIndex = this.state.rounds.findIndex(r => r.id === this.state.selectedRoundId);
  
  if (targetRoundIndex === -1) {
    console.log('Target round not found');
    return;
  }

  const targetRound = this.state.rounds[targetRoundIndex];
  
  // Check if target round is frozen
  if (targetRound.isFrozen) {
    this.showCustomAlert(
      'Cannot Move Losers',
      `Cannot move losers to "${targetRound.displayName || targetRound.name}".\n\nThis round is frozen and no more changes are allowed.`
    );
    return;
  }

  // Move losers to target round's players array
  const updatedRounds = this.state.rounds.map((round, index) => {
    if (index === sourceRoundIndex) {
      // Remove selected losers from source round
      return {
        ...round,
        losers: round.losers.filter(l => !l.selected)
      };
    } else if (index === targetRoundIndex) {
      // Add selected losers to target round as players
      return {
        ...round,
        players: [
          ...round.players,
          ...selectedLosers.map(l => ({ 
            ...l, 
            selected: false, 
            status: 'in_round' as const,
            currentRound: round.id,
            lastRoundPlayedNumber: index
          }))
        ]
      };
    }
    return round;
  });

  // Update allPlayers status
  const updatedAllPlayers = this.state.currentGameMatch!.allPlayers!.map((player: Player) => {
    const isMovingLoser = selectedLosers.some(l => l.id === player.id);
    if (isMovingLoser) {
      return {
        ...player,
        status: 'in_round' as const,
        selected: false,
        currentRound: this.state.selectedRoundId
      };
    }
    return player;
  });

  this.setState({ 
    rounds: updatedRounds,
    currentGameMatch: {
      ...this.state.currentGameMatch!,
      allPlayers: updatedAllPlayers
    },
    selectedRoundId: null
  });

  const targetRoundName = this.state.rounds[targetRoundIndex].displayName || this.state.rounds[targetRoundIndex].name;
  console.log(`Moved ${selectedLosers.length} losers from ${sourceRound.displayName || sourceRound.name} to ${targetRoundName}`);
};


/*Methods Ending Here*/

  render() {
    // Show loading state
    if (this.state.loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading matches...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (this.state.error) {
      // Check if error is related to token expiration - redirect immediately
      const errorMessage = this.state.error.toLowerCase();
      if (
        errorMessage.includes('expired') ||
        errorMessage.includes('session expired') ||
        errorMessage.includes('invalid or expired token') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('401')
      ) {
        console.log('🔐 Token expiration detected in error state, redirecting to login...');
        // Clear auth state
        authService.logout();
        // Redirect to login
        window.location.href = '/login';
        // Return loading state while redirecting
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to login...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">âš ï¸</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{this.state.error}</p>
            <button
              onClick={() => this.loadData()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

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
                onClick={() => this.setState({ activeTab: 'schedule' })}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  this.state.activeTab === 'schedule'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Schedule Tournament
              </button>
              <button
                onClick={this.handleScheduledMatchesClick}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  this.state.activeTab === 'scheduled'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Scheduled Tournaments
              </button>
              <button
                onClick={() => this.setState({ activeTab: 'previous' })}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  this.state.activeTab === 'previous'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Previous Matches
              </button>
              <button
                onClick={() => this.setState({ activeTab: 'notifications' })}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  this.state.activeTab === 'notifications'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => this.setState({ activeTab: 'settings' })}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  this.state.activeTab === 'settings'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Settings
              </button>
            </div>
          </div>



 {/* Schedule Match Tab */}
 {this.state.activeTab === 'schedule' && (
            <div className="space-y-6">
              {!this.state.isCreatingMatch ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Match</h2>
                    <p className="text-gray-600 mb-6">Schedule a new billiards tournament with custom rules and settings</p>
                    <button
                      onClick={() => this.setState({ isCreatingMatch: true })}
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
                          {this.state.isEditMode ? 'Edit Match Setup' : 'New Match Setup'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                          {this.state.isEditMode ? 'Update your tournament details' : 'Configure your tournament details'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          this.setState({
                            isCreatingMatch: false,
                            isEditMode: false
                          });
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
                            value={this.state.matchForm.matchName}
                            onChange={(e) => this.handleInputChange('matchName', e.target.value)}
                            placeholder="e.g., 9-Ball Championship 2025"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <select
                            value={this.state.matchForm.locationId}
                            onChange={(e) => this.handleInputChange('locationId', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Location</option>
                            {this.organizationLocations.map(location => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Location Details */}
                      {this.state.selectedLocation && (
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Address:</span> {this.state.selectedLocation.address}</p>
                            <p><span className="font-medium">Phone:</span> {this.state.selectedLocation.phone}</p>
                            <div>
                              <span className="font-medium">Facilities:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {this.state.selectedLocation.facilities.map((facility, index) => (
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
                            value={this.state.matchForm.gameType}
                            onChange={(e) => this.handleInputChange('gameType', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {this.gameTypes.map(type => (
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
                            value={this.state.matchForm.organizerName}
                            onChange={(e) => this.handleInputChange('organizerName', e.target.value)}
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
                          value={this.state.matchForm.organizerDescription}
                          onChange={(e) => this.handleInputChange('organizerDescription', e.target.value)}
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
                          value={this.state.matchForm.ballRules}
                          onChange={(e) => this.handleInputChange('ballRules', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {this.ballRulesOptions.map(option => (
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
                          value={this.state.matchForm.fewRules}
                          onChange={(e) => this.handleInputChange('fewRules', e.target.value)}
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
                        value={this.state.matchForm.moreDetails}
                        onChange={(e) => this.handleInputChange('moreDetails', e.target.value)}
                        placeholder="Add any additional details, venue information, or notes for players..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Notification Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-600" />
                        Send Notification
                      </h3>
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="sendNotification"
                              checked={this.state.matchForm.sendNotification || false}
                              onChange={(e) => this.handleInputChange('sendNotification', e.target.checked)}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <label htmlFor="sendNotification" className="ml-3 text-sm font-medium text-gray-700">
                              Send notification to customers about this tournament
                            </label>
                          </div>

                          {this.state.matchForm.sendNotification && (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notification Title
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={this.state.matchForm.notificationTitle || ''}
                                      onChange={(e) => this.handleInputChange('notificationTitle', e.target.value)}
                                      placeholder={this.state.matchForm.matchName ? `New Tournament: ${this.state.matchForm.matchName}` : "e.g., New Tournament: 9-Ball Championship"}
                                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {this.state.matchForm.matchName && !this.state.matchForm.notificationTitle && (
                                      <button
                                        type="button"
                                        onClick={() => this.handleInputChange('notificationTitle', `New Tournament: ${this.state.matchForm.matchName}`)}
                                        className="px-3 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                                        title="Auto-fill with match name"
                                      >
                                        Auto-fill
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipients
                                  </label>
                                  <select
                                    value={this.state.matchForm.notificationRecipients || 'all'}
                                    onChange={(e) => this.handleInputChange('notificationRecipients', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="all">All Registered Customers</option>
                                    <option value="advanced">Advanced Players Only</option>
                                    <option value="intermediate">Intermediate Players Only</option>
                                    <option value="beginner">Beginner Players Only</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Notification Message
                                </label>
                                <textarea
                                  value={this.state.matchForm.notificationMessage || ''}
                                  onChange={(e) => this.handleInputChange('notificationMessage', e.target.value)}
                                  placeholder="Enter your notification message..."
                                  rows={3}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>

                              {/* Customer Selection for Specific Skill Levels */}
                              {this.state.matchForm.notificationRecipients && this.state.matchForm.notificationRecipients !== 'all' && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Select Customers</h4>
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                      <span className="text-sm text-gray-600">
                                        {this.state.matchForm.notificationRecipients === 'advanced' ? 'Advanced Players' :
                                         this.state.matchForm.notificationRecipients === 'intermediate' ? 'Intermediate Players' :
                                         this.state.matchForm.notificationRecipients === 'beginner' ? 'Beginner Players' :
                                         'Selected Customers'}
                                      </span>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => this.handleSelectAllSkillCustomers()}
                                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
                                        >
                                          Select Page
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => this.handleClearSkillCustomerSelection()}
                                          className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200 transition-colors"
                                        >
                                          Clear Page
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                                      {this.getPaginatedCustomers().map((customer) => (
                                        <div key={customer.id} className="flex items-center p-3 bg-white rounded border hover:bg-gray-50 transition-colors">
                                          <input
                                            type="checkbox"
                                            id={`skill-customer-${customer.id}`}
                                            checked={this.state.matchForm.selectedSkillCustomers?.includes(customer.id) || false}
                                            onChange={(e) => this.handleSkillCustomerSelection(customer.id, e.target.checked)}
                                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                          />
                            <label htmlFor={`skill-customer-${customer.id}`} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={customer.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                                  alt={customer.name}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                />
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
                                  <div className="text-xs text-gray-600">{customer.email}</div>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {customer.skill}
                                  </span>
                                </div>
                              </div>
                            </label>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Pagination Controls */}
                                    {this.getTotalPages() > 1 && (
                                      <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                          Page {this.state.customerPage} of {this.getTotalPages()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => this.handleCustomerPageChange(this.state.customerPage - 1)}
                                            disabled={this.state.customerPage === 1}
                                            className="px-4 py-2 text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:shadow-sm disabled:hover:scale-100 transition-all duration-200"
                                          >
                                            Previous
                                          </button>
                                          
                                          {/* Page Numbers */}
                                          {this.getPageNumbers().map((pageNum, index) => (
                                            <React.Fragment key={index}>
                                              {pageNum === '...' ? (
                                                <span className="px-2 py-1 text-sm text-gray-500">...</span>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => this.handleCustomerPageChange(pageNum as number)}
                                                  className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 shadow-sm ${
                                                    this.state.customerPage === pageNum
                                                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105'
                                                      : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 hover:shadow-md hover:scale-105'
                                                  }`}
                                                >
                                                  {pageNum}
                                                </button>
                                              )}
                                            </React.Fragment>
                                          ))}
                                          
                                          <button
                                            type="button"
                                            onClick={() => this.handleCustomerPageChange(this.state.customerPage + 1)}
                                            disabled={this.state.customerPage === this.getTotalPages()}
                                            className="px-4 py-2 text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:shadow-sm disabled:hover:scale-100 transition-all duration-200"
                                          >
                                            Next
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="mt-3 text-sm text-gray-600">
                                      Selected: {this.state.matchForm.selectedSkillCustomers?.length || 0} of {this.getFilteredCustomers().length} customers
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Notification Preview */}
                              <div className="bg-white p-4 rounded-lg border border-purple-200">
                                <h4 className="font-medium text-purple-900 mb-2">Notification Preview</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Title:</span> {this.state.matchForm.notificationTitle || 'New Tournament Available'}</p>
                                  <p><span className="font-medium">Message:</span> {this.state.matchForm.notificationMessage || 'A new tournament has been scheduled!'}</p>
                                  <p><span className="font-medium">Recipients:</span> {
                                    this.state.matchForm.notificationRecipients === 'all' ? 'All Registered Customers' :
                                    this.state.matchForm.notificationRecipients === 'advanced' ? 'Selected Advanced Players' :
                                    this.state.matchForm.notificationRecipients === 'intermediate' ? 'Selected Intermediate Players' :
                                    this.state.matchForm.notificationRecipients === 'beginner' ? 'Selected Beginner Players' :
                                    'All Registered Customers'
                                  }</p>
                                  <p><span className="font-medium">Recipients Count:</span> {
                                    this.state.matchForm.notificationRecipients === 'all' ? this.registeredCustomers.length :
                                    this.state.matchForm.selectedSkillCustomers?.length || 0
                                  } customers</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 -mx-8">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            this.setState({
                              isCreatingMatch: false,
                              isEditMode: false
                            });
                          }}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={this.handleSubmit}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          {this.state.isEditMode ? 'Update Match' : 'Schedule Match'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scheduled Tournaments Tab */}
          {this.state.activeTab === 'scheduled' && !this.state.showGameOrganization && (
            <div className="space-y-6">
              {/* Loading State */}
              {this.state.loading && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading tournaments...</p>
                      <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your tournaments</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {!this.state.loading && this.state.error && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="text-center py-12">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tournaments</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{this.state.error}</p>
                    <button
                      onClick={this.handleScheduledMatchesClick}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              
              {/* Content - Only show when not loading and no error */}
              {!this.state.loading && !this.state.error && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Scheduled Tournaments</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => this.testCustomerRegistrationsAPI()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Test API
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Step 1 of 2
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Empty State */}
                  {this.state.apiTournaments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">🏆</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Tournaments</h3>
                      <p className="text-gray-600 mb-6">You don't have any scheduled tournaments yet.</p>
                      <button
                        onClick={() => this.setState({ activeTab: 'schedule' })}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Schedule a Tournament
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* API Tournaments - Show all tournaments from API */}
                      {this.state.apiTournaments.map((tournament, index) => {
                    console.log('🎨 Rendering tournaments. Total count:', this.state.apiTournaments.length);
                    console.log('🎨 Tournament data:', this.state.apiTournaments);
                    console.log('🎨 Rendering tournament:', tournament);
                    console.log('🎨 Tournament name being displayed:', tournament.tournamentName);
                    console.log('🎨 Tournament ID:', tournament.tournamentId);
                    
                    return (
                    <div key={`api-${tournament.tournamentId}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => this.handleTournamentClick(tournament.tournamentId, tournament.tournamentName, tournament.organizerId, tournament.venueId, tournament.status)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{tournament.tournamentName}</h3>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                              tournament.status === 'started' || tournament.status === 'running' || tournament.status === 'ongoing' 
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : tournament.status === 'completed'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-orange-200 bg-orange-50 text-orange-700'
                            }`}>
                              {tournament.status ? tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1).replace('_', ' ') : 'Scheduled'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              8-ball
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              14:00
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              0/50 players
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">$50</div>
                          <div className="text-sm text-gray-500">Entry Fee</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => this.handleEditMatch(tournament.tournamentId)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Settings className="w-4 h-4" />
                          Edit Match
                        </button>
                        <button
                          onClick={() => this.handleSendNotification(tournament.tournamentId, tournament.tournamentName)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          <Bell className="w-4 h-4" />
                          Send Notification
                        </button>
                        <button
                          onClick={() => this.handleShowNotifiedUsers(tournament.tournamentId, tournament.tournamentName)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                        >
                          <Bell className="w-4 h-4" />
                          Notified Users (0)
                        </button>
                      </div>

                      {/* Registered Players Section - Empty for API tournaments */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">Registered Players (0)</h4>
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No players registered yet</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                    </>
                  )}

                  {/* Existing Scheduled Matches */}
                  {this.state.scheduledMatches.map((match) => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 cursor-pointer" onClick={() => this.handleMatchClick(match)}>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${this.getStatusColor(match.status)}`}>
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
                          onClick={() => this.handleEditMatch(match)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Edit Match
                        </button>
                        <button
                          onClick={() => this.handleOpenSendNotification(match.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Send Notification
                        </button>
                        <button
                          onClick={this.handleShowNotifiedUsers}
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
                              <div 
                                key={player.id} 
                                className="bg-white p-3 rounded border hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                                onClick={() => this.handleOpenProfileModal(player)}
                              >
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
                                <div className="flex justify-between items-center mt-1">
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
                      )}
                      
                      {/* Game Initiate Button */}
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => this.handleGameInitiate(match)}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Next: Game Organization
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          )}

          {/* Tournament Dashboard */}
          {this.state.showGameOrganization && this.state.currentGameMatch && this.state.currentGameMatch.tournamentStarted && (
            <div className="space-y-6">
 {/* Tournament Dashboard Header */}
 <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={this.handleCloseGameOrganization}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Tournaments
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <h2 className="text-xl font-bold text-gray-900">Tournament Dashboard - {this.state.currentGameMatch.name}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.status === 'available').length || 0} Available
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {this.state.currentGameMatch.rounds?.length || 0} Rounds
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Tournament Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {this.state.currentGameMatch.gameType}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(this.state.currentGameMatch.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {this.state.currentGameMatch.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {this.state.currentGameMatch.venue}
                    </div>
                  </div>
                </div>

                {/* Tournament Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Available Players Section */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Available Players ({this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.status === 'available').length || 0})
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={this.handleSelectAllPlayers}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={this.handleDeselectAllPlayers}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                      {this.state.currentGameMatch.allPlayers
                        ?.filter((player: Player) => player.status === 'available')
                        .map((player: Player) => (
                        <div key={player.id} className={`p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                          player.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`} onClick={() => this.handleTogglePlayerSelection(player.id)}>
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="checkbox"
                              checked={player.selected}
                              onChange={() => this.handleTogglePlayerSelection(player.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className={`w-3 h-3 rounded-full ${
                              player.status === 'available' ? 'bg-green-500' :
                              player.status === 'in_round' ? 'bg-blue-500' :
                              player.status === 'in_lobby' ? 'bg-orange-500' :
                              'bg-gray-500'
                            }`} title={player.status}></div>
                          </div>
                          <div className="text-center">
                            <img
                              src={player.profilePic}
                              alt={player.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 mx-auto mb-2 group-hover:border-blue-400 transition-colors"
                            />
                            <div className="font-medium text-gray-900 text-sm truncate mb-1">{player.name}</div>
                            <div className="text-xs text-gray-500 truncate mb-2">{player.email}</div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              player.skill === 'Pro' ? 'bg-purple-100 text-purple-800' :
                              player.skill === 'Expert' ? 'bg-red-100 text-red-800' :
                              player.skill === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {player.skill}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


                  {/* Tournament Controls */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Tournament Controls</h4>
                      
                      {/* Add Round Button */}
                      <button
                        onClick={this.handleAddRound}
                        className="w-full mb-3 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Round
                      </button>

                      {/* Delete Last Round Button - Show only if more than 1 round exists */}
                      {this.state.rounds.length > 1 && (
                        <div className="relative group">
                          <button
                            onClick={this.deleteLastRound}
                            className="w-full mb-3 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                            title="Delete the last round (only if empty)"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Last Round
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Only the last round can be deleted (if empty)
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                        </div>
                      )}

                      {/* Set Winner Titles Button - Show when at least one round has winners */}
                      {this.state.rounds.some(r => r.winners && r.winners.length > 0) && (
                        <button
                          onClick={this.showSetWinnerTitles}
                          className="w-full mb-3 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                          title="Set winner titles and rankings"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Set Winner Titles
                        </button>
                      )}

                      {/* Tournament Result Button - Show when at least one round exists */}
                      {this.state.rounds.length > 0 && (
                        <button
                          onClick={this.showTournamentResults}
                          className="w-full mb-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                          title="View tournament bracket and results"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Tournament Results
                        </button>
                      )}

   {/* Round Selection with Stats */}
    <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Target Round
                            </label>
                            <select 
        value={this.state.selectedRoundId || 'dashboard'}
        onChange={(e) => this.setState({ selectedRoundId: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">- Select Round -</option>
        {this.state.rounds
          .filter((round) => {
            // Simple logic: If previous round has completed matches, then this round is eligible
            const currentRoundIndex = this.state.rounds.findIndex(r => r.id === round.id);
            const isFirstRound = currentRoundIndex === 0;
            
            // First round is always available
            if (isFirstRound) {
              return true;
            }
            
            // For other rounds: check if the PREVIOUS round has completed matches
            const previousRoundIndex = currentRoundIndex - 1;
            if (previousRoundIndex >= 0) {
              const previousRound = this.state.rounds[previousRoundIndex];
              const previousRoundHasCompletedMatches = previousRound.matches && previousRound.matches.length > 0 && 
                previousRound.matches.some(match => match.status === 'completed');
              
              console.log(`Dashboard filter for ${round.displayName || round.name}: isFirstRound=${isFirstRound}, previousRoundHasCompletedMatches=${previousRoundHasCompletedMatches}`);
              return previousRoundHasCompletedMatches;
            }
            
            return false;
          })
          .map((round) => {
            const playerCount = round.players.length;
            const selectedCount = this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0;
            const afterCount = playerCount + selectedCount;
            const willBeEven = afterCount % 2 === 0;
            
            // Check if round is empty (no players AND no completed matches)
            const hasCompletedMatches = round.matches && round.matches.length > 0 && 
              round.matches.some(match => match.status === 'completed');
            const isEmpty = round.players.length === 0 && round.winners.length === 0 && !hasCompletedMatches;
            const isEmptyText = isEmpty ? " (Empty)" : "";
            
            return (
                                <option key={round.id} value={round.id}>
              {round.displayName || round.name}{isEmptyText} - {playerCount} players
              {selectedCount > 0 && ` → ${afterCount} after move ${willBeEven ? '✓' : '⚠️'}`}
                                </option>
            );
          })}
                            </select>
      
      {/* Show helpful message when round selected */}
      {this.state.selectedRoundId && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          {(() => {
            const targetRound = this.state.rounds.find(r => r.id === this.state.selectedRoundId);
            const selectedCount = this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0;
            const currentCount = targetRound?.players.length || 0;
            const afterCount = currentCount + selectedCount;
            const willBeEven = afterCount % 2 === 0;
            
            return (
              <>
                <strong>{targetRound?.displayName || targetRound?.name}</strong>
                <br />
                Current: {currentCount} players
                <br />
                After move: {afterCount} players
                {willBeEven ? ' ✓ (Even - Ready to shuffle)' : ' ⚠️ (Odd - Cannot shuffle)'}
              </>
            );
          })()}
                          </div>
                        )}
      
      {/* No rounds message */}
      {this.state.rounds.length === 0 && (
        <p className="mt-2 text-xs text-gray-600">
          No rounds created yet. Click "Add Round" to create your first round.
        </p>
      )}
      
      {/* Selected players indicator */}
      {this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length > 0 && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
          <strong>{this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length} players selected</strong> from Tournament Dashboard
        </div>
      )}
    </div>

    {/* Quick Actions */}
    <div className="space-y-2">
      {/* Move to Round Button */}
      <button
        onClick={this.handleMoveSelectedToRound}
        disabled={(this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0) === 0 || !this.state.selectedRoundId}
        className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {this.state.selectedRoundId 
          ? `Move to ${this.state.rounds.find(r => r.id === this.state.selectedRoundId)?.displayName || 'Round'}`
          : 'Move to Round'}
        {(this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0) > 0 && 
          ` (${this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length})`}
      </button>
                        
                       
      
                       
                      </div>
                    </div>

                    {/* Tournament Stats */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Tournament Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Players:</span>
                          <span className="font-medium">{this.state.currentGameMatch.allPlayers?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-green-600">
                            {this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.status === 'available').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">In Rounds:</span>
                          <span className="font-medium text-blue-600">
                            {this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.status === 'in_round').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">In Lobby:</span>
                          <span className="font-medium text-orange-600">
                            {this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.status === 'in_lobby').length || 0}
                          </span>
                        </div>
      
      {/* Round breakdown */}
      {this.state.rounds.length > 0 && (
        <>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-700 font-medium">Rounds ({this.state.rounds.length}):</span>
                      </div>
          {this.state.rounds.map(round => (
            <div key={round.id} className="flex justify-between pl-4">
              <span className="text-gray-600">{round.displayName || round.name}:</span>
              <span className="font-medium text-purple-600">{round.players.length}</span>
                    </div>
          ))}
        </>
      )}
                  </div>
                </div>
              </div>
                </div>
              )}
            </div>
      </div>
    }
    }
    );
  }
}
