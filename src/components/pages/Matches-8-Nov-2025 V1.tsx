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
    
    // Normalize status to lowercase for comparison (use stored status if available)
    const storedStatusBeforeFetch = tournamentStatus ? null : this.getStoredTournamentStatus(tournamentId);
    let derivedStatus = (tournamentStatus || storedStatusBeforeFetch || 'scheduled').toLowerCase();
    console.log('🏆 Tournament status (initial):', derivedStatus);
    let tournamentStatusData: any = null;
    
    // Set loading state
    this.setState({
      loading: true,
      showGameOrganization: false
    });

    try {
      console.log('👥 Step 1: Fetching registered players for tournament');
      console.log('🏆 Tournament ID:', tournamentId);
      console.log('🏆 Tournament Name:', tournamentName);
      console.log('🏆 Tournament Status (before API):', derivedStatus);
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
      tournamentStatusData = playersResponse.data?.tournament_status ?? null;
      const apiTournamentStatus = playersResponse.data?.tournament_status?.status;
      if (apiTournamentStatus) {
        derivedStatus = apiTournamentStatus.toLowerCase();
      }
      this.saveTournamentStatus(tournamentId, derivedStatus, tournamentStatusData);
      
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
      const shouldGoToDashboard = ['started', 'running', 'ongoing', 'completed'].includes(derivedStatus);
      const shouldShowPopup = ['registration_open', 'scheduled', 'upcoming', 'draft'].includes(derivedStatus);

      console.log('🎯 Routing decision:', {
        status: derivedStatus,
        shouldGoToDashboard,
        shouldShowPopup
      });
      if (shouldGoToDashboard) {
        // Go directly to tournament dashboard
        console.log('🎮 Status is started/running/completed - going directly to dashboard');
        
        // Convert tournamentId string to number for Match interface compatibility
        const tournamentIdNumber = tournamentId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        
        const tournamentData: TournamentDashboard = {
          id: tournamentIdNumber,
          name: tournamentName,
          gameType: '9-ball', // Default game type until API provides it
          organizerName: 'Tournament Organizer',
          organizerDescription: 'Professional tournament management',
          date: new Date('2025-10-15T14:00:00').toISOString(),
          time: new Date('2025-10-15T14:00:00').toLocaleTimeString(),
          status: derivedStatus,
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
          currentRound: null,
          tournamentStarted: ['started', 'running', 'ongoing', 'completed'].includes(derivedStatus),
          registeredPlayers: registeredPlayers,
          tournamentId: tournamentId // Store original tournament ID string for API calls
        };

        // Navigate directly to tournament dashboard (skip modal)
        this.setState({
          currentGameMatch: tournamentData,
          showGameOrganization: true,
          showTournamentModal: false, // Don't show popup
          selectedTournament: null,
          loading: false
        });

        console.log('✅ Navigated directly to tournament dashboard (status:', derivedStatus, ')');
        
      } else if (shouldShowPopup) {
        // Show popup with registered users (don't start tournament automatically)
        console.log('📋 Status is registration_open/scheduled - showing popup with registered users');
        
        const tournamentData = {
          id: tournamentId,
          name: tournamentName,
          status: derivedStatus,
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
          console.log('✅ Popup shown with registered users (status:', derivedStatus, ')');
        });
        
      } else {
        // Unknown status - default to popup
        console.warn('⚠️ Unknown tournament status:', derivedStatus, '- defaulting to popup');
        
        const tournamentData = {
          id: tournamentId,
          name: tournamentName,
          status: derivedStatus,
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
          
          const tournamentId = tournament.id || tournament.tournamentId || 'unknown-id';
          const storedStatus = this.getStoredTournamentStatus(tournamentId);
          const normalizedStatus = storedStatus || (tournament.status ? tournament.status.toLowerCase() : 'scheduled');
          
          return {
            tournamentId,
            tournamentName: tournament.name || tournament.tournamentName || tournament.title || 'Unnamed Tournament',
            organizerId: tournament.organizerId || tournament.organizer_id || response.data.organizerId || '',
            venueId: tournament.venueId || tournament.venue_id || tournament.venue?.id || '',
            status: normalizedStatus
          };
        });
        
        console.log('🎯 Extracted tournaments:', apiTournaments);
        console.log('🎯 Total tournaments extracted:', apiTournaments.length);
        console.log('🎯 Tournament IDs:', apiTournaments.map(t => t.tournamentId));
        console.log('🎯 Tournament Names:', apiTournaments.map(t => t.tournamentName));
        console.log('🎯 Tournament Statuses:', apiTournaments.map(t => t.status));
        
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

  private getStoredTournamentStatus = (tournamentId: string): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = localStorage.getItem(`tournament_status_${tournamentId}`);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      const stored = parsed?.status;
      return stored ? stored.toString().toLowerCase() : null;
    } catch (error) {
      console.error('❌ Failed to read stored tournament status', error);
      return null;
    }
  };

  private saveTournamentStatus = (tournamentId: string, status: string, statusData?: any): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const payload = {
        status: status.toLowerCase(),
        statusData: statusData ?? null,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`tournament_status_${tournamentId}`, JSON.stringify(payload));
    } catch (error) {
      console.error('❌ Failed to save tournament status', error);
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
        name: tournamentName,
        gameType: '9-ball', // Default game type until API provides it
        organizerName: 'Tournament Organizer',
        organizerDescription: 'Professional tournament management',
        date: new Date('2025-10-15T14:00:00').toISOString(),
        time: new Date('2025-10-15T14:00:00').toLocaleTimeString(),
        status: derivedStatus,
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
        currentRound: null,
        tournamentStarted: ['started', 'running', 'ongoing', 'completed'].includes(derivedStatus),
        registeredPlayers: registeredPlayers,
        tournamentId: tournamentId // Store original tournament ID string for API calls
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
        
        const fallbackStatus = (this.state.selectedTournament.status || 'active').toString().toLowerCase();
        const tournamentData: TournamentDashboard = {
          id: tournamentIdNumber,
          name: this.state.selectedTournament.name,
          gameType: this.state.selectedTournament.gameType,
          organizerName: 'Tournament Organizer',
          organizerDescription: 'Professional tournament management',
          date: this.state.selectedTournament.startDate,
          time: new Date(this.state.selectedTournament.startDate).toLocaleTimeString(),
          status: fallbackStatus,
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
          tournamentStarted: ['started', 'running', 'ongoing', 'completed'].includes(fallbackStatus),
          registeredPlayers: this.state.selectedTournament.registeredPlayers,
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
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
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
              </div>

            {/* Rounds Section with Horizontal Tabs */}
            {(this.state.currentGameMatch.rounds?.length || 0) > 0 && (
              <div className="space-y-6">
                 {/* Round Tabs Navigation */}
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Tournament Rounds</h3>
                   


                    <div className="flex space-x-2 overflow-x-auto">
  {this.state.currentGameMatch.rounds?.map((round: TournamentRound, index: number) => {
    const currentRounds = this.state.currentGameMatch.rounds || [];
    const isLastRound = currentRounds[currentRounds.length - 1]?.id === round.id;
    const hasPlayers = round.players.length > 0;
    const hasWinners = round.winners.length > 0;
    const hasLosers = round.losers.length > 0;
    const hasCompletedMatches = round.matches && 
      round.matches.length > 0 && 
      round.matches.some(match => match.status === 'completed');
    const isEmpty = !hasPlayers && !hasWinners && !hasLosers && !hasCompletedMatches;
    
    return (
      <div key={round.id} className="flex items-center space-x-1">
        <button
          onClick={() => this.setState({ activeRoundTab: round.id })}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            this.state.activeRoundTab === round.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="text-center">
            <div className="font-semibold">{round.name}</div>
            <div className={`text-xs opacity-75 flex items-center gap-1 ${
              round.players.length > 0 && round.players.length % 2 !== 0 ? 'text-red-600' : ''
            }`}>
              {round.players.length} players
              {round.players.length > 0 && round.players.length % 2 !== 0 && (
                <span>⚠️</span>
              )}
            </div>
          </div>
        </button>
        
        {/* Close Button for Empty Rounds */}
        {isEmpty && isLastRound && (
          <button
            onClick={() => this.handleCloseRound(round.id)}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            title="Close this empty round"
          >
            ✕
          </button>
        )}
      </div>
    );
  })}
</div>





                  </div>

{/* Round Content */}
{this.state.activeRoundTab && this.state.currentGameMatch.rounds?.map((round: TournamentRound, index: number) => (
  this.state.activeRoundTab === round.id && (
    <div key={round.id} className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Round Header */}
      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{round.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{round.players.length} players</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            round.status === 'active' ? 'bg-green-100 text-green-800' :
                            round.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {round.status}
                          </div>
                        </div>
                      </div>
      
      {/* Players Section */}
      <div className="p-6">                          
                        <div className="mb-6">
                          <h5 className="text-lg font-semibold text-gray-900">{round.name}</h5>
                        </div>
                          
        {/* Round Sub-Tabs */}
        {this.state.activeRoundTab === round.id && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Sub-Tab Navigation */}
            <div className="flex border-b border-gray-200">
                              <button
                                onClick={() => this.setState({
                                  activeRoundSubTab: {
                                    ...this.state.activeRoundSubTab,
                                    [round.id]: 'matches'
                                  }
                                })}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                  (this.state.activeRoundSubTab[round.id] || 'matches') === 'matches'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                Matches ({round.matches?.length || 0})
                              </button>
                              <button
                                onClick={() => this.setState({
                                  activeRoundSubTab: {
                                    ...this.state.activeRoundSubTab,
                                    [round.id]: 'waiting'
                                  }
                                })}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                  this.state.activeRoundSubTab[round.id] === 'waiting'
                                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                Waiting Area ({round.players?.filter(p => p.status === 'waiting').length || 0})
                              </button>
                              <button
                                onClick={() => this.setState({
                                  activeRoundSubTab: {
                                    ...this.state.activeRoundSubTab,
                                    [round.id]: 'winners'
                                  }
                                })}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                  this.state.activeRoundSubTab[round.id] === 'winners'
                                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                Winners ({round.players?.filter(p => p.status === 'winner').length || 0})
                              </button>
                            </div>

            {/* Sub-Tab Content */}
            <div className="p-6">
              {/* Matches Tab */}
              {(this.state.activeRoundSubTab[round.id] || 'matches') === 'matches' && (
                <div>
                  {/* Match Control Buttons */}
                  <div className="flex gap-3 mb-6">
                                    {/* Shuffle Players Button - Show when there are pending matches or unmatched players */}
                                    {(() => {
                                      const unmatchedPlayers = round.players.filter(p => p.status === 'in_round' && !round.matches.some(m => m.player1.id === p.id || m.player2.id === p.id));
                                      const hasUnmatchedPlayers = unmatchedPlayers.length > 0;
                                      const roundIsPending = round.status === 'pending';
                                      const hasPendingMatches = round.matches.some(m => m.status === 'pending' || m.status === 'active');
                                      const shouldShow = hasUnmatchedPlayers || roundIsPending || hasPendingMatches;
                                      
                                      // Debug logging
                                      console.log('🔍 Shuffle Button Debug:', {
                                        roundId: round.id,
                                        roundStatus: round.status,
                                        totalPlayers: round.players.length,
                                        totalMatches: round.matches.length,
                                        completedMatches: round.matches.filter(m => m.status === 'completed').length,
                                        pendingMatches: round.matches.filter(m => m.status === 'pending' || m.status === 'active').length,
                                        unmatchedPlayers: unmatchedPlayers.map(p => ({ name: p.name, status: p.status })),
                                        hasUnmatchedPlayers,
                                        roundIsPending,
                                        hasPendingMatches,
                                        shouldShow
                                      });
                                      
                                      return shouldShow;
                                    })() && (
                                      <button
                                        onClick={() => {
                                          // Get selected and non-selected players (exclude players from completed matches)
                                          const playersInCompletedMatches = new Set();
                                          round.matches.filter(m => m.status === 'completed').forEach(match => {
                                            playersInCompletedMatches.add(match.player1.id);
                                            playersInCompletedMatches.add(match.player2.id);
                                          });
                                          
                                          const availablePlayers = round.players.filter(p => !playersInCompletedMatches.has(p.id));
                                          const selectedPlayers = availablePlayers.filter(p => p.selected);
                                          const remainingPlayers = availablePlayers.filter(p => !p.selected);
                                          
                                          if (remainingPlayers.length < 2) {
                                            alert('Need at least 2 non-selected players to create matches');
                                            return;
                                          }
                                          
                                          // Shuffle only the remaining (non-selected) players
                                          const shuffledPlayers = [...remainingPlayers].sort(() => Math.random() - 0.5);
                                          const matches: TournamentMatch[] = [];
                                          
                                          // Create matches in pairs from shuffled players
                                          const matchedPlayers: Player[] = [];
                                          for (let i = 0; i < shuffledPlayers.length; i += 2) {
                                            if (i + 1 < shuffledPlayers.length) {
                                              matches.push({
                                                id: `match-${round.id}-${i/2 + 1}`,
                                                player1: shuffledPlayers[i],
                                                player2: shuffledPlayers[i + 1],
                                                status: 'pending'
                                              });
                                              matchedPlayers.push(shuffledPlayers[i], shuffledPlayers[i + 1]);
                                            }
                                          }
                                          
                                          // Find unmatched players (extra players who didn't get matched)
                                          const unmatchedPlayers = shuffledPlayers.filter(p => !matchedPlayers.some(mp => mp.id === p.id));
                                          
                                          // Move selected players to waiting area and update their status
                                          const playersToWaiting = selectedPlayers.map(p => ({ ...p, status: 'waiting' as const, selected: false }));
                                          
                                          // Keep unmatched players in round (status: 'in_round') for manual management
                                          const unmatchedInRound = unmatchedPlayers.map(p => ({ ...p, status: 'in_round' as const, selected: false }));
                                          
                                          // Preserve existing completed matches and add new matches
                                          const existingMatches = round.matches.filter(m => m.status === 'completed');
                                          const newMatches = matches;
                                          const allMatches = [...existingMatches, ...newMatches];
                                          
                                          // Update the round: keep matched and unmatched players in round, move selected players to waiting, preserve completed matches
                                          const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                            r.id === round.id 
                                              ? { 
                                                  ...r, 
                                                  players: [...matchedPlayers, ...unmatchedInRound, ...playersToWaiting], 
                                                  matches: allMatches 
                                                }
                                              : r
                                          );
                                          
                                          // Update all players status
                                          const updatedAllPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => {
                                            const selectedPlayer = selectedPlayers.find(sp => sp.id === p.id);
                                            if (selectedPlayer) {
                                              return { ...p, status: 'waiting' as const, selected: false };
                                            }
                                            return p;
                                          });
                                          
                                          this.setState({
                                            currentGameMatch: {
                                              ...this.state.currentGameMatch!,
                                              allPlayers: updatedAllPlayers,
                                              rounds: updatedRounds
                                            },
                                            showBracketForRound: round.id
                                          });
                                          
                                          console.log('🎲 Shuffled', matchedPlayers.length, 'players into', matches.length, 'new matches, preserved', existingMatches.length, 'completed matches, moved', selectedPlayers.length, 'to waiting area,', unmatchedPlayers.length, 'unmatched players remain');
                                        }}
                                        disabled={round.players.length < 2}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Shuffle Players
                                      </button>
                                    )}
                                    
                                    {/* Reshuffle All Players Button - Show when there are pending matches or unmatched players */}
                                    {(() => {
                                      const unmatchedPlayers = round.players.filter(p => p.status === 'in_round' && !round.matches.some(m => m.player1.id === p.id || m.player2.id === p.id));
                                      const hasUnmatchedPlayers = unmatchedPlayers.length > 0;
                                      const roundIsPending = round.status === 'pending';
                                      const hasPendingMatches = round.matches.some(m => m.status === 'pending' || m.status === 'active');
                                      return hasUnmatchedPlayers || roundIsPending || hasPendingMatches;
                                    })() && (
                                      <button
                                      onClick={() => {
                                        // Get all players in round (excluding waiting players and players from completed matches)
                                        const playersInCompletedMatches = new Set();
                                        round.matches.filter(m => m.status === 'completed').forEach(match => {
                                          playersInCompletedMatches.add(match.player1.id);
                                          playersInCompletedMatches.add(match.player2.id);
                                        });
                                        
                                        const playersInRound = round.players.filter(p => p.status === 'in_round' && !playersInCompletedMatches.has(p.id));
                                        
                                        if (playersInRound.length < 2) {
                                          alert('Need at least 2 players in round to reshuffle');
                                          return;
                                        }
                                        
                                        // Confirm reshuffle action
                                        const confirmed = window.confirm(
                                          `Are you sure you want to reshuffle ALL ${playersInRound.length} players in this round? This will break all existing matches and create new random pairings.`
                                        );
                                        
                                        if (!confirmed) return;
                                        
                                        // Shuffle ALL players in round
                                        const shuffledPlayers = [...playersInRound].sort(() => Math.random() - 0.5);
                                        const matches: TournamentMatch[] = [];
                                        
                                        // Create matches in pairs from shuffled players
                                        const matchedPlayers: Player[] = [];
                                        for (let i = 0; i < shuffledPlayers.length; i += 2) {
                                          if (i + 1 < shuffledPlayers.length) {
                                            matches.push({
                                              id: `match-${round.id}-${Date.now()}-${i/2 + 1}`, // Use timestamp to ensure unique IDs
                                              player1: shuffledPlayers[i],
                                              player2: shuffledPlayers[i + 1],
                                              status: 'pending'
                                            });
                                            matchedPlayers.push(shuffledPlayers[i], shuffledPlayers[i + 1]);
                                          }
                                        }
                                        
                                        // Find unmatched players (extra players who didn't get matched)
                                        const unmatchedPlayers = shuffledPlayers.filter(p => !matchedPlayers.some(mp => mp.id === p.id));
                                        
                                        // Keep unmatched players in round (status: 'in_round') for manual management
                                        const unmatchedInRound = unmatchedPlayers.map(p => ({ ...p, status: 'in_round' as const, selected: false }));
                                        
                                        // Keep waiting players as they are
                                        const waitingPlayers = round.players.filter(p => p.status === 'waiting');
                                        
                                        // Preserve existing completed matches and add new matches
                                        const existingMatches = round.matches.filter(m => m.status === 'completed');
                                        const newMatches = matches;
                                        const allMatches = [...existingMatches, ...newMatches];
                                        
                                        // Update the round: preserve completed matches, keep waiting players, add matched and unmatched players
                                        const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                          r.id === round.id 
                                            ? { 
                                                ...r, 
                                                players: [...matchedPlayers, ...unmatchedInRound, ...waitingPlayers], 
                                                matches: allMatches 
                                              }
                                            : r
                                        );
                                        
                                        // Update all players status (reset selection)
                                        const updatedAllPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => {
                                          const playerInRound = playersInRound.find(pr => pr.id === p.id);
                                          if (playerInRound) {
                                            return { ...p, selected: false }; // Reset selection for all reshuffled players
                                          }
                                          return p;
                                        });
                                        
                                        this.setState({
                                          currentGameMatch: {
                                            ...this.state.currentGameMatch!,
                                            allPlayers: updatedAllPlayers,
                                            rounds: updatedRounds
                                          },
                                          showBracketForRound: round.id
                                        });
                                        
                                        console.log('🔄 RESHUFFLED ALL', playersInRound.length, 'players into', matches.length, 'new matches, preserved', existingMatches.length, 'completed matches,', unmatchedPlayers.length, 'unmatched players remain');
                                      }}
                                      disabled={round.players.filter(p => p.status === 'in_round').length < 2}
                                      className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      Reshuffle All Players
                                    </button>
                                    )}
                                    {/* Start Round Button - Only show if round is pending (matches may or may not exist) */}
                                    {round.status === 'pending' && (
                                      <button
                                        onClick={() => {
                                          // Start round - mark round as active
                                          const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                            r.id === round.id ? { ...r, status: 'active' as const } : r
                                          );
                                          
                                          this.setState({
                                            currentGameMatch: {
                                              ...this.state.currentGameMatch!,
                                              rounds: updatedRounds
                                            }
                                          });
                                        }}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8a4 4 0 118 0v1H7V6z" />
                                        </svg>
                                        Start Round
                                      </button>
                                    )}
                                  </div>

                  {round.matches && round.matches.length > 0 ? (
                    <div>
                      {/* Matches List */}
                      <div className="space-y-4">
                              {round.matches.map((match: TournamentMatch, index: number) => (
                            <div key={match.id} className={`rounded-xl shadow-lg p-6 ${
                              match.status === 'active' 
                                ? 'bg-red-50 border-2 border-red-300' 
                                : match.status === 'completed'
                                ? 'bg-green-50 border-2 border-green-300'
                                : 'bg-white border border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Match #{index + 1}</h4>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      match.status === 'active' ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {match.status === 'completed' ? '✓ COMPLETED' :
                                       match.status === 'active' ? '● LIVE' : '○ PENDING'}
                                    </div>
                                  </div>
                              
                              {/* Players */}
                              <div className="flex items-center justify-between">
                                {/* Player 1 */}
                                <div className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                      match.winner?.id === match.player1.id ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                    }`}>
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={match.player1.profilePic}
                                          alt={match.player1.name}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                                        />
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900">{match.player1.name}</div>
                                          <div className="text-sm text-gray-600">Rank #{Math.floor(Math.random() * 20) + 1}</div>
                                          <div className="text-sm text-gray-600">Rating: {Math.floor(Math.random() * 500) + 1500}</div>
                                        </div>
                                        {match.winner?.id === match.player1.id && (
                                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            Winner
                                          </div>
                                        )}
                                      </div>
                                    </div>
									
									{/* VS */}
                                    <div className="mx-4 flex flex-col items-center">
                                      <div className="text-2xl font-bold text-gray-400">VS</div>
                                      {match.status === 'completed' && match.score && (
                                        <div className="text-sm font-semibold text-gray-600 mt-2">Score: {match.score}</div>
                                      )}
                                    </div>
									
									{/* Player 2 */}
                                    <div className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                      match.winner?.id === match.player2.id ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                    }`}>
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={match.player2.profilePic}
                                          alt={match.player2.name}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                                        />
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-900">{match.player2.name}</div>
                                          <div className="text-sm text-gray-600">Rank #{Math.floor(Math.random() * 20) + 1}</div>
                                          <div className="text-sm text-gray-600">Rating: {Math.floor(Math.random() * 500) + 1500}</div>
                                        </div>
                                        {match.winner?.id === match.player2.id && (
                                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            Winner
                                          </div>
                                        )}
                                      </div>
                                    </div>
                              </div>
                              
                                  {/* Match Action Buttons - Only show when round is active */}
                                  {match.status === 'pending' && round.status === 'active' && (
                                    <div className="mt-4 flex gap-3 justify-center">
                                      {/* Check if any other match in this round is LIVE */}
                                      {round.matches.some(m => m.status === 'active') ? (
                                        <div className="text-center py-4">
                                          <div className="text-gray-500 text-sm">
                                            ⏸️ Another match is currently LIVE
                                          </div>
                                          <div className="text-xs text-gray-400 mt-1">
                                            Complete the active match to start this one
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              // Start this match (set to active)
                                              const updatedMatches = round.matches.map(m => 
                                                m.id === match.id ? {
                                                  ...m,
                                                  status: 'active' as const,
                                                  startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
                                                } : m
                                              );
                                              
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id ? { ...r, matches: updatedMatches } : r
                                              );
                                              
                                              this.setState({
                                                currentGameMatch: {
                                                  ...this.state.currentGameMatch!,
                                                  rounds: updatedRounds
                                                }
                                              });
                                            }}
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8a4 4 0 118 0v1H7V6z" />
                                            </svg>
                                            Start Match
                                          </button>
                                          <button
                                            onClick={() => {
                                              // Cancel this match (remove from round and move players to waiting)
                                              const updatedMatches = round.matches.filter(m => m.id !== match.id);
                                              
                                              // Move cancelled match players to waiting status
                                              const updatedRoundPlayers = round.players.map(p => {
                                                if (p.id === match.player1.id || p.id === match.player2.id) {
                                                  return { ...p, status: 'waiting' as const };
                                                }
                                                return p;
                                              });
                                              
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id ? { ...r, matches: updatedMatches, players: updatedRoundPlayers } : r
                                              );
                                              
                                              this.setState({
                                                currentGameMatch: {
                                                  ...this.state.currentGameMatch!,
                                                  rounds: updatedRounds
                                                }
                                              });
                                            }}
                                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancel Match
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}
{/* LIVE Match Details */}
{match.status === 'active' && (
                                    <div className="mt-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold text-gray-900">Match LIVE</h5>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                          <span className="text-sm text-red-700 font-medium">LIVE</span>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                          <div className="text-gray-600">Start Time</div>
                                          <div className="font-semibold">{match.startTime || '22:23'}</div>
                                          <div className="text-xs text-gray-500">Status: Started</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                          <div className="text-gray-600">Current Time</div>
                                          <div className="font-semibold">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                                          <div className="text-xs text-gray-500">Status: In Progress</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                          <div className="text-gray-600">Duration</div>
                                          <div className="font-semibold">{match.duration || '45 min'}</div>
                                          <div className="text-xs text-gray-500">Type: Total Time</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                          <div className="text-gray-600">Current Score</div>
                                          <div className="font-semibold">{match.score || '8-6'}</div>
                                          <div className="text-xs text-gray-500">Live Score</div>
                                        </div>
                                      </div>
                                      
                                      {/* Close Match Button */}
                                      <div className="mt-4 flex justify-center">
                                        <button
                                          onClick={() => {
                                            // Close match with random winner
                                            const winner = Math.random() > 0.5 ? match.player1 : match.player2;
                                            const loser = winner.id === match.player1.id ? match.player2 : match.player1;
                                            const finalScore = winner.id === match.player1.id ? '14-6' : '6-14';
                                            
                                            // Update matches
                                            const updatedMatches = round.matches.map(m => 
                                              m.id === match.id ? {
                                                ...m,
                                                status: 'completed' as const,
                                                winner: winner,
                                                score: finalScore,
                                                endTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                                duration: '83 min'
                                              } : m
                                            );
                                            
                                            // Update players with match history and status
                                            const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map(p => {
                                              if (p.id === winner.id) {
                                                return {
                                                  ...p,
                                                  matchesPlayed: (p.matchesPlayed || 0) + 1,
                                                  roundsWon: [...(p.roundsWon || []), round.name],
                                                  hasPlayed: true,
                                                  status: 'winner' as const
                                                };
                                              } else if (p.id === loser.id) {
                                                return {
                                                  ...p,
                                                  matchesPlayed: (p.matchesPlayed || 0) + 1,
                                                  hasPlayed: true,
                                                  status: 'eliminated' as const
                                                };
                                              }
                                              return p;
                                            });
                                            
                                            // Update round players with winner status
                                            const updatedRoundPlayers = round.players.map(p => {
                                              if (p.id === winner.id) {
                                                return { ...p, status: 'winner' as const };
                                              } else if (p.id === loser.id) {
                                                return { ...p, status: 'eliminated' as const };
                                              }
                                              return p;
                                            });
                                            
                                            const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => {
                                              if (r.id === round.id) {
                                                const updatedRound = { ...r, matches: updatedMatches, players: updatedRoundPlayers };
                                                // Check if all matches are completed AND no unmatched players
                                                const allMatchesCompleted = updatedMatches.length > 0 && updatedMatches.every(m => m.status === 'completed');
                                                const noUnmatchedPlayers = !updatedRound.players.some(p => p.status === 'in_round' && !updatedMatches.some(m => m.player1.id === p.id || m.player2.id === p.id));
                                                const noPendingMatches = !updatedMatches.some(m => m.status === 'pending' || m.status === 'active');
                                                if (allMatchesCompleted && noUnmatchedPlayers && noPendingMatches) {
                                                  updatedRound.status = 'completed' as const;
                                                }
                                                return updatedRound;
                                              }
                                              return r;
                                            });
                                            
                                            this.setState({
                                              currentGameMatch: {
                                                ...this.state.currentGameMatch!,
                                                rounds: updatedRounds,
                                                allPlayers: updatedPlayers
                                              }
                                            });
                                          }}
                                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          Close Match
                                        </button>
                                      </div>
                                    </div>
                                  )}
								  
                    {match.status === 'completed' && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-gray-600">Start Time</div>
                                        <div className="font-semibold">{match.startTime || '22:23'}</div>
                                        <div className="text-xs text-gray-500">Status: Started</div>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-gray-600">End Time</div>
                                        <div className="font-semibold">{match.endTime || '23:45'}</div>
                                        <div className="text-xs text-gray-500">Status: Finished</div>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-gray-600">Duration</div>
                                        <div className="font-semibold">{match.duration || '83 min'}</div>
                                        <div className="text-xs text-gray-500">Type: Total Time</div>
                                      </div>
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-gray-600">Score</div>
                                        <div className="font-semibold">Final: {match.score || '14-6'}</div>
                                      </div>
                                      </div>
                                      )}
                                    </div>
                                  ))}
                                      </div>
                                      
                                      {/* Unmatched Players Section */}
                                      {(() => {
                                        const matchedPlayerIds = new Set();
                                        round.matches.forEach(match => {
                                          matchedPlayerIds.add(match.player1.id);
                                          matchedPlayerIds.add(match.player2.id);
                                        });
                                        const unmatchedPlayers = round.players.filter(p => 
                                          p.status === 'in_round' && !matchedPlayerIds.has(p.id)
                                        );
                                        
                                        // Debug logging
                                        console.log('🔍 Unmatched Players Debug:', {
                                          roundId: round.id,
                                          roundPlayers: round.players.map(p => ({ name: p.name, status: p.status, id: p.id })),
                                          matches: round.matches.map(m => ({ id: m.id, player1: m.player1.name, player2: m.player2.name })),
                                          matchedPlayerIds: Array.from(matchedPlayerIds),
                                          unmatchedPlayers: unmatchedPlayers.map(p => ({ name: p.name, status: p.status, id: p.id }))
                                        });
                                        return unmatchedPlayers.length > 0 ? (
                                          <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Unmatched Players ({unmatchedPlayers.length})</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                              {unmatchedPlayers.map((player: Player, index: number) => (
                                                <div 
                                                  key={player.id} 
                                                  className={`bg-yellow-50 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-yellow-300 hover:shadow-md ${
                                                    player.selected ? 'border-yellow-500 bg-yellow-100' : 'border-yellow-200'
                                                  }`}
                                                  onClick={() => {
                                                    // Toggle selection for this player
                                                    const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                      r.id === round.id 
                                                        ? { ...r, players: r.players.map(p => p.id === player.id ? { ...p, selected: !p.selected } : p) }
                                                        : r
                                                    );
                                                    const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                      p.id === player.id ? { ...p, selected: !p.selected } : p
                                                    );
                                                    this.setState({
                                                      currentGameMatch: {
                                                        ...this.state.currentGameMatch!,
                                                        allPlayers: updatedPlayers,
                                                        rounds: updatedRounds
                                                      }
                                                    });
                                                  }}
                                                >
                                                  <div className="flex items-center gap-3 mb-3">
                                                    <img
                                                      src={player.profilePic}
                                                      alt={player.name}
                                                      className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
                                                    />
                                                    <div className="flex-1">
                                                      <div className="font-semibold text-gray-900">{player.name}</div>
                                                      <div className="text-sm text-gray-600">{player.email}</div>
                                                    </div>
                                                    <input
                                                      type="checkbox"
                                                      checked={player.selected || false}
                                                      onChange={() => {}} // Handled by parent onClick
                                                      className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                                                    />
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                      player.skill === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                      player.skill === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                      'bg-red-100 text-red-800'
                                                    }`}>
                                                      {player.skill}
                                                    </span>
                                                    <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                      Unmatched
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            
                                            {/* Unmatched Players Controls */}
                                            {unmatchedPlayers.filter(p => p.selected).length > 0 && (
                                              <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="text-sm font-medium text-yellow-800">
                                                    {unmatchedPlayers.filter(p => p.selected).length} unmatched players selected
                                                  </span>
                                                  <div className="flex gap-2">
                                                    <button
                                                      onClick={() => {
                                                        // Select all unmatched players
                                                        const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                          r.id === round.id 
                                                            ? { ...r, players: r.players.map(p => 
                                                                unmatchedPlayers.some(up => up.id === p.id) 
                                                                  ? { ...p, selected: true }
                                                                  : p
                                                              ) }
                                                            : r
                                                        );
                                                        const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                          unmatchedPlayers.some(up => up.id === p.id) 
                                                            ? { ...p, selected: true }
                                                            : p
                                                        );
                                                        this.setState({
                                                          currentGameMatch: {
                                                            ...this.state.currentGameMatch!,
                                                            allPlayers: updatedPlayers,
                                                            rounds: updatedRounds
                                                          }
                                                        });
                                                      }}
                                                      className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-medium"
                                                    >
                                                      Select All Unmatched
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        // Deselect all unmatched players
                                                        const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                          r.id === round.id 
                                                            ? { ...r, players: r.players.map(p => 
                                                                unmatchedPlayers.some(up => up.id === p.id) 
                                                                  ? { ...p, selected: false }
                                                                  : p
                                                              ) }
                                                            : r
                                                        );
                                                        const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                          unmatchedPlayers.some(up => up.id === p.id) 
                                                            ? { ...p, selected: false }
                                                            : p
                                                        );
                                                        this.setState({
                                                          currentGameMatch: {
                                                            ...this.state.currentGameMatch!,
                                                            allPlayers: updatedPlayers,
                                                            rounds: updatedRounds
                                                          }
                                                        });
                                                      }}
                                                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                                    >
                                                      Deselect All Unmatched
                                                    </button>
                                                  </div>
                                                </div>
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => {
                                                      // Move selected unmatched players to waiting area
                                                      const selectedPlayerIds = unmatchedPlayers.filter(p => p.selected).map(p => p.id);
                                                      
                                                      const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                        r.id === round.id 
                                                          ? { ...r, players: r.players.map(p => 
                                                              selectedPlayerIds.includes(p.id) 
                                                                ? { ...p, status: 'waiting' as const, selected: false }
                                                                : p
                                                            ) }
                                                          : r
                                                      );
                                                      
                                                      const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                        selectedPlayerIds.includes(p.id) 
                                                          ? { ...p, status: 'waiting' as const, selected: false }
                                                          : p
                                                      );
                                                      
                                                      this.setState({
                                                        currentGameMatch: {
                                                          ...this.state.currentGameMatch!,
                                                          allPlayers: updatedPlayers,
                                                          rounds: updatedRounds
                                                        }
                                                      });
                                                      
                                                      console.log('⏳ Moved', selectedPlayerIds.length, 'unmatched players to waiting area');
                                                    }}
                                                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center gap-2"
                                                  >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Move Selected to Waiting Area ({unmatchedPlayers.filter(p => p.selected).length})
                                                  </button>
                            </div>
                      </div>
                                            )}
                                          </div>
                                        ) : null;
                                      })()}
                    </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-2">No players in this round yet</div>
                        <div className="text-gray-400 text-sm">Select players from the available list and move them to this round</div>
                      </div>
                  )}
                </div>
              )}
 {/* Waiting Area Tab */}
 {this.state.activeRoundSubTab[round.id] === 'waiting' && (
                                  <div>
                                    <div className="mb-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900">Players in Waiting Area</h4>
                                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                          {round.players?.filter(p => p.status === 'waiting').length || 0} Players
                                        </span>
                                      </div>
                                      <div className="flex gap-2 mb-4">
                                        <button
                                          onClick={() => {
                                            // Select all waiting players
                                            const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                              r.id === round.id 
                                                ? { ...r, players: r.players.map(p => p.status === 'waiting' ? { ...p, selected: true } : p) }
                                                : r
                                            );
                                            const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                              round.players.some(rp => rp.id === p.id && rp.status === 'waiting') ? { ...p, selected: true } : p
                                            );
                                            this.setState({
                                              currentGameMatch: {
                                                ...this.state.currentGameMatch!,
                                                allPlayers: updatedPlayers,
                                                rounds: updatedRounds
                                              }
                                            });
                                          }}
                                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                                        >
                                          Select All
                                        </button>
                                        <button
                                          onClick={() => {
                                            // Deselect all waiting players
                                            const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                              r.id === round.id 
                                                ? { ...r, players: r.players.map(p => p.status === 'waiting' ? { ...p, selected: false } : p) }
                                                : r
                                            );
                                            const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                              round.players.some(rp => rp.id === p.id && rp.status === 'waiting') ? { ...p, selected: false } : p
                                            );
                                            this.setState({
                                              currentGameMatch: {
                                                ...this.state.currentGameMatch!,
                                                allPlayers: updatedPlayers,
                                                rounds: updatedRounds
                                              }
                                            });
                                          }}
                                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                          Deselect All
                                        </button>
                                      </div>
                                      
                                      {/* Navigation Options for Selected Players */}
                                      {round.players?.filter(p => p.status === 'waiting' && p.selected).length > 0 && (
                                        <div className="flex gap-2 mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                          <button
                                            onClick={() => {
                                              // Move selected players back to dashboard (available)
                                              const selectedPlayerIds = round.players.filter(p => p.status === 'waiting' && p.selected).map(p => p.id);
                                              
                                              // Remove from round and update status to available
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id 
                                                  ? { ...r, players: r.players.filter(p => !(p.status === 'waiting' && p.selected)) }
                                                  : r
                                              );
                                              
                                              const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                selectedPlayerIds.includes(p.id) 
                                                  ? { ...p, status: 'available' as const, selected: false, currentRound: null }
                                                  : p
                                              );
                                              
                                              this.setState({
                                                currentGameMatch: {
                                                  ...this.state.currentGameMatch!,
                                                  allPlayers: updatedPlayers,
                                                  rounds: updatedRounds
                                                }
                                              });
                                              
                                              console.log('🏠 Moved', selectedPlayerIds.length, 'players back to dashboard');
                                            }}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Back to Dashboard ({round.players?.filter(p => p.status === 'waiting' && p.selected).length})
                                          </button>
                                          
                                          <button
                                            onClick={() => {
                                              // Move selected players back to matches (available for shuffling)
                                              const selectedPlayerIds = round.players.filter(p => p.status === 'waiting' && p.selected).map(p => p.id);
                                              
                                              // Update status from waiting to in_round (available for shuffling)
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id 
                                                  ? { ...r, players: r.players.map(p => 
                                                      p.status === 'waiting' && p.selected 
                                                        ? { ...p, status: 'in_round' as const, selected: false }
                                                        : p
                                                    ) }
                                                  : r
                                              );
                                              
                                              const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                selectedPlayerIds.includes(p.id) 
                                                  ? { ...p, status: 'in_round' as const, selected: false }
                                                  : p
                                              );
                                              
                                              this.setState({
                                                currentGameMatch: {
                                                  ...this.state.currentGameMatch!,
                                                  allPlayers: updatedPlayers,
                                                  rounds: updatedRounds
                                                }
                                              });
                                              
                                              console.log('🎲 Moved', selectedPlayerIds.length, 'players back to matches section');
                                            }}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Back to Matches ({round.players?.filter(p => p.status === 'waiting' && p.selected).length})
                                          </button>
                                          
                                          <button
                                            onClick={() => {
                                              // Move selected players to waiting area manually
                                              const selectedPlayerIds = round.players.filter(p => p.status === 'waiting' && p.selected).map(p => p.id);
                                              
                                              // Players are already in waiting area, just deselect them
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id 
                                                  ? { ...r, players: r.players.map(p => 
                                                      p.status === 'waiting' && p.selected 
                                                        ? { ...p, selected: false }
                                                        : p
                                                    ) }
                                                  : r
                                              );
                                              
                                              const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                selectedPlayerIds.includes(p.id) 
                                                  ? { ...p, selected: false }
                                                  : p
                                              );
                                              
                                              this.setState({
                                                currentGameMatch: {
                                                  ...this.state.currentGameMatch!,
                                                  allPlayers: updatedPlayers,
                                                  rounds: updatedRounds
                                                }
                                              });
                                              
                                              console.log('✅ Kept', selectedPlayerIds.length, 'players in waiting area');
                                            }}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center gap-2"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Keep in Waiting Area ({round.players?.filter(p => p.status === 'waiting' && p.selected).length})
                                          </button>
                                          {/* Move to Other Rounds */}
                                        {this.state.currentGameMatch!.rounds!.filter(r => r.id !== round.id).length > 0 && (
                                          <select
                                            onChange={(e) => {                                             
                                              if (e.target.value) {
                                                const selectedPlayerIds = round.players.filter(p => p.status === 'waiting' && p.selected).map(p => p.id);
                                                
                                                // Move players to selected round
                                                const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => {
                                                  if (r.id === round.id) {
                                                    // Remove from current round
                                                    return { ...r, players: r.players.filter(p => !(p.status === 'waiting' && p.selected)) };
                                                  } else if (r.id === e.target.value) {
                                                    // Add to target round
                                                    const playersToMove = round.players.filter(p => p.status === 'waiting' && p.selected).map(p => ({
                                                      ...p, 
                                                      status: 'in_round' as const, 
                                                      selected: false,
                                                      currentRound: e.target.value
                                                    }));
                                                    return { ...r, players: [...r.players, ...playersToMove] };
                                                  }
                                                  return r;
                                                });
                                                
                                                const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                  selectedPlayerIds.includes(p.id) 
                                                    ? { ...p, status: 'in_round' as const, selected: false, currentRound: e.target.value }
                                                    : p
                                                );
                                                
                                                this.setState({
                                                  currentGameMatch: {
                                                    ...this.state.currentGameMatch!,
                                                    allPlayers: updatedPlayers,
                                                    rounds: updatedRounds
                                                  }
                                                });
                                                
                                                console.log('🔄 Moved', selectedPlayerIds.length, 'players to round', e.target.value);
                                                e.target.value = '';
                                              }
                                            }}
                                            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                          >
                                            <option value="">Move to Round...</option>
                                            {this.state.currentGameMatch!.rounds!.filter(r => r.id !== round.id).map((r: TournamentRound) => (
                                              <option key={r.id} value={r.id}>
                                                {r.name} ({r.players.length} players)
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {round.players?.filter(p => p.status === 'waiting').length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                      {round.players.filter(p => p.status === 'waiting').map((player: Player, index: number) => (
                                        <div 
                                          key={player.id} 
                                          className={`bg-orange-50 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-orange-300 hover:shadow-md ${
                                            player.selected ? 'border-orange-500 bg-orange-100' : 'border-orange-200'
                                          }`}
                                          onClick={() => {
                                            // Toggle selection for this waiting player
                                            const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                              r.id === round.id 
                                                ? { ...r, players: r.players.map(p => p.id === player.id ? { ...p, selected: !p.selected } : p) }
                                                : r
                                            );
                                            const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                              p.id === player.id ? { ...p, selected: !p.selected } : p
                                            );
                                            this.setState({
                                              currentGameMatch: {
                                                ...this.state.currentGameMatch!,
                                                allPlayers: updatedPlayers,
                                                rounds: updatedRounds
                                              }
                                            });
                                          }}
                                        >
                                          <div className="flex items-center gap-3 mb-3">
                                            <img
                                              src={player.profilePic}
                                              alt={player.name}
                                              className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
                                            />
                                            <div className="flex-1">
                                              <div className="font-semibold text-gray-900">{player.name}</div>
                                              <div className="text-sm text-gray-600">{player.email}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={player.selected || false}
                                                onChange={() => {}} // Handled by parent onClick
                                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              player.skill === 'Beginner' ? 'bg-green-100 text-green-800' :
                                              player.skill === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {player.skill}
                                            </span>
                                            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                              Waiting
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-12">
                                      <div className="text-gray-500 text-lg mb-2">No players in waiting area</div>
                                      <div className="text-gray-400 text-sm">Selected players from shuffle will appear here</div>
                                    </div>
                                  )}
                                </div>
                              )}

                                  {/* Winners Tab */}
                                  {this.state.activeRoundSubTab[round.id] === 'winners' && (
                                <div>
                                  <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900">Round Winners</h4>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                      {round.players?.filter(p => p.status === 'winner').length || 0} Winners
                                    </span>
                                  </div>
                                  {round.players?.filter(p => p.status === 'winner').length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                      {round.players.filter(p => p.status === 'winner').map((player: Player, index: number) => (
                                        <div key={player.id} className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                                          <div className="flex items-center gap-3 mb-3">
                                            <img
                                              src={player.profilePic}
                                              alt={player.name}
                                              className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                                            />
                                            <div className="flex-1">
                                              <div className="font-semibold text-gray-900">{player.name}</div>
                                              <div className="text-sm text-gray-600">{player.email}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              player.skill === 'Beginner' ? 'bg-green-100 text-green-800' :
                                              player.skill === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {player.skill}
                                            </span>
                                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                              Winner
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-12">
                                      <div className="text-gray-500 text-lg mb-2">No winners yet</div>
                                      <div className="text-gray-400 text-sm">Completed match winners will appear here</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
            </div>
            )}
             {/* Original Players Display (when no sub-tabs) */}
             {this.state.activeRoundTab !== round.id && (round.players.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {round.players.map((player: Player, index: number) => (
                              <div 
                                key={player.id} 
                                className={`bg-gray-50 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300 hover:shadow-md ${
                                  player.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => {
                                  // Toggle selection for this player when clicking anywhere on the card
                                  const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                    r.id === round.id 
                                      ? { ...r, players: r.players.map(p => p.id === player.id ? { ...p, selected: !p.selected } : p) }
                                      : r
                                  );
                                  const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                    p.id === player.id ? { ...p, selected: !p.selected } : p
                                  );
                                  this.setState({
                                    currentGameMatch: {
                                      ...this.state.currentGameMatch!,
                                      allPlayers: updatedPlayers,
                                      rounds: updatedRounds
                                    }
                                  });
                                }}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="relative">
                                    <img
                                      src={player.profilePic}
                                      alt={player.name}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {index + 1}
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
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={player.selected}
                                      onChange={() => {
                                        // Toggle selection for this player
                                        const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                          r.id === round.id 
                                            ? { ...r, players: r.players.map(p => p.id === player.id ? { ...p, selected: !p.selected } : p) }
                                            : r
                                        );
                                        const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                          p.id === player.id ? { ...p, selected: !p.selected } : p
                                        );
                                        this.setState({
                                          currentGameMatch: {
                                            ...this.state.currentGameMatch!,
                                            allPlayers: updatedPlayers,
                                            rounds: updatedRounds
                                          }
                                        });
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No players in this round yet</h3>
                            <p className="text-sm">Select players from the available list and move them to this round</p>
                          </div>
                        ))}

 {/* Control Buttons */}
 {round.players.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm text-gray-600">
                                {round.players.filter(p => p.selected).length} players selected
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    // Select all players in this round
                                    const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                      r.id === round.id ? { ...r, players: r.players.map(p => ({ ...p, selected: true })) } : r
                                    );
                                    const roundPlayerIds = round.players.map(p => p.id);
                                    const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((player: Player) => 
                                      roundPlayerIds.includes(player.id) ? { ...player, selected: true } : player
                                    );
                                    this.setState({
                                      currentGameMatch: {
                                        ...this.state.currentGameMatch!,
                                        allPlayers: updatedPlayers,
                                        rounds: updatedRounds
                                      }
                                    });
                                  }}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors font-medium"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={() => {
                                    // Deselect all players in this round
                                    const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                      r.id === round.id ? { ...r, players: r.players.map(p => ({ ...p, selected: false })) } : r
                                    );
                                    const roundPlayerIds = round.players.map(p => p.id);
                                    const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((player: Player) => 
                                      roundPlayerIds.includes(player.id) ? { ...player, selected: false } : player
                                    );
                                    this.setState({
                                      currentGameMatch: {
                                        ...this.state.currentGameMatch!,
                                        allPlayers: updatedPlayers,
                                        rounds: updatedRounds
                                      }
                                    });
                                  }}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors font-medium"
                                >
                                  Deselect All
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  // Move selected players to lobby
                                  const selectedPlayerIds = round.players.filter(p => p.selected).map(p => p.id);
                                  const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                    r.id === round.id ? { ...r, players: r.players.filter(p => !p.selected) } : r
                                  );
                                  const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((player: Player) => 
                                    selectedPlayerIds.includes(player.id) 
                                      ? { ...player, status: 'in_lobby' as const, currentRound: null, selected: false }
                                      : player
                                  );
                                  this.setState({
                                    currentGameMatch: {
                                      ...this.state.currentGameMatch!,
                                      allPlayers: updatedPlayers,
                                      rounds: updatedRounds
                                    }
                                  });
                                }}
                                disabled={round.players.filter(p => p.selected).length === 0}
                                className="px-4 py-2 bg-orange-100 text-orange-800 text-sm rounded hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                Move Selected to Lobby
                              </button>
                              <button
                                onClick={() => {
                                  // Remove all players from this round
                                  const roundPlayerIds = round.players.map(p => p.id);
                                  const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                    r.id === round.id ? { ...r, players: [] } : r
                                  );
                                  const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((player: Player) => 
                                    roundPlayerIds.includes(player.id) 
                                      ? { ...player, status: 'available' as const, currentRound: null, selected: false }
                                      : player
                                  );
                                  this.setState({
                                    currentGameMatch: {
                                      ...this.state.currentGameMatch!,
                                      allPlayers: updatedPlayers,
                                      rounds: updatedRounds
                                    }
                                  });
                                }}
                                className="px-4 py-2 bg-pink-100 text-pink-800 text-sm rounded hover:bg-pink-200 transition-colors font-medium"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}

              {/* Dual Lobby System */}
              {(this.state.currentGameMatch.allPlayers?.some(p => p.status === 'in_lobby') || 
                this.state.currentGameMatch.allPlayers?.some(p => p.hasPlayed && p.roundsWon && p.roundsWon.length > 0)) && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  {/* Lobby Tabs */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Player Lobbies</h3>
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => this.setState({ activeLobbyTab: 'never-played' })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          this.state.activeLobbyTab === 'never-played'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Never Played ({this.state.currentGameMatch.allPlayers?.filter(p => !p.hasPlayed && p.status === 'in_lobby').length || 0})
                      </button>
                      <button
                        onClick={() => this.setState({ activeLobbyTab: 'winners' })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          this.state.activeLobbyTab === 'winners'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Winners ({this.state.currentGameMatch.allPlayers?.filter(p => p.hasPlayed && p.roundsWon && p.roundsWon.length > 0).length || 0})
                      </button>
                    </div>
                  </div>

                  {/* Never Played Lobby */}
                  {this.state.activeLobbyTab === 'never-played' && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Never Played Lobby</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {this.state.currentGameMatch.allPlayers?.filter(p => !p.hasPlayed && p.status === 'in_lobby').length || 0} players
                        </span>
                      </div>
                      
                      {this.state.currentGameMatch.allPlayers?.filter(p => !p.hasPlayed && p.status === 'in_lobby').length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {this.state.currentGameMatch.allPlayers
                            .filter((player: Player) => !player.hasPlayed && player.status === 'in_lobby')
                            .map((player: Player) => (
                              <div key={player.id} className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200 relative">
                                <div className="absolute top-2 right-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full" title="Never Played"></div>
                                </div>
                                <div className="text-center">
                                  <img
                                    src={player.profilePic}
                                    alt={player.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 mx-auto mb-2"
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
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                  <button
                                    onClick={() => {
                                      // Move player back to available
                                      const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                        p.id === player.id 
                                          ? { ...p, status: 'available' as const, currentRound: null }
                                          : p
                                      );
                                      this.setState({
                                        currentGameMatch: {
                                          ...this.state.currentGameMatch!,
                                          allPlayers: updatedPlayers
                                        }
                                      });
                                    }}
                                    className="w-full px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors font-medium"
                                  >
                                    Make Available
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">🎯</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Never Played Players</h3>
                          <p className="text-sm">All players in lobby have played at least one match</p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Winners Lobby */}
                  {this.state.activeLobbyTab === 'winners' && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Winners Lobby</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {this.state.currentGameMatch.allPlayers?.filter(p => p.hasPlayed && p.roundsWon && p.roundsWon.length > 0).length || 0} winners
                        </span>
                      </div>

                      {/* Group winners by rounds */}
                      {this.state.currentGameMatch.rounds?.map((round: TournamentRound) => {
                        const roundWinners = this.state.currentGameMatch!.allPlayers?.filter(p => 
                          p.roundsWon && p.roundsWon.includes(round.name)
                        ) || [];
                        
                        if (roundWinners.length === 0) return null;
                        
                        return (
                          <div key={round.id} className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-md font-semibold text-gray-900">{round.name} Winners</h5>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {roundWinners.length} winner{roundWinners.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                              {roundWinners.map((player: Player) => (
                                <div key={player.id} className="bg-white p-3 rounded-lg border-2 border-green-300 shadow-sm relative">
                                  <div className="absolute top-2 right-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🏆</div>
                                  </div>
                                  <div className="text-center">
                                    <img
                                      src={player.profilePic}
                                      alt={player.name}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-green-400 mx-auto mb-2"
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
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-center">
                                      <span className="text-xs text-green-600 font-medium">
                                        {player.roundsWon?.length || 0} win{(player.roundsWon?.length || 0) > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {this.state.currentGameMatch.allPlayers?.filter(p => p.hasPlayed && p.roundsWon && p.roundsWon.length > 0).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">🏆</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Winners Yet</h3>
                          <p className="text-sm">Complete some matches to see winners here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              </div>
  )}


{/* Legacy Game Organization Section - Only show if not tournament dashboard */}
{this.state.showGameOrganization && this.state.currentGameMatch && !this.state.currentGameMatch.tournamentStarted && (
 <div className="space-y-6">
{/* Legacy content will remain here for backward compatibility */}
<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
   {/* Players List - Only show when no matches are shuffled */}
   {this.state.shuffledMatches.length === 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Registered Players ({this.state.currentGameMatch.registeredPlayers?.length || 0})</h3>
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
                      {this.state.currentGameMatch.registeredPlayers?.map((player) => (
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
                )}

                {/* Shuffle Button - Show when matches are shuffled */}
                {this.state.shuffledMatches.length > 0 && (
                  <div className="mb-6 flex justify-center">
                    <button
                      onClick={this.handleShuffleGame}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Shuffle Again
                    </button>
                  </div>
                )}

                 {/* Start Tournament Button */}
                 {this.state.shuffledMatches.length > 0 && (
                  <div className="mb-6 flex justify-center">
                    <button
                      onClick={this.handleStartTournament}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V7a3 3 0 116 0v3M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                      </svg>
                      Start Tournament
                    </button>
                  </div>
                )}
                {/* Tournament Bracket */}
                {this.state.shuffledMatches.length > 0 ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Tournament Bracket - Round 1 (First Round)</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Round 1 (First Round): {this.state.shuffledMatches.length * 2} players → {this.state.shuffledMatches.length} matches → {this.state.shuffledMatches.length} winners
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {this.state.shuffledMatches.map((match) => (
                        <div key={match.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Match #{match.id}</h4>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              COMPLETED
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            {/* Player 1 */}
                            <div className="flex items-center gap-3 flex-1 bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="relative">
                                <img
                                  src={match.player1.profilePic}
                                  alt={match.player1.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-green-400"
                                />
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  Winner
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">{match.player1.name}</div>
                                <div className="text-sm text-gray-600">Rank #{match.player1.rank} • Rating: {match.player1.rating}</div>
                              </div>
                            </div>

                            {/* VS */}
                            <div className="flex items-center justify-center mx-6">
                              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-bold text-lg">VS</span>
                              </div>
                            </div>

                            {/* Player 2 */}
                            <div className="flex items-center gap-3 flex-1 bg-white p-4 rounded-lg border border-gray-200">
                              <div className="relative">
                                <img
                                  src={match.player2.profilePic}
                                  alt={match.player2.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">{match.player2.name}</div>
                                <div className="text-sm text-gray-600">Rank #{match.player2.rank} • Rating: {match.player2.rating}</div>
                              </div>
                            </div>
                          </div>

                          {/* Match Statistics */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-5 gap-4 text-center">
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">STATUS</div>
                                <div className="flex items-center justify-center gap-1 text-green-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-sm font-medium">COMPLETED</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">START TIME</div>
                                <div className="text-sm text-gray-600">{this.generateRandomTime()}</div>
                                <div className="text-xs text-gray-500">Started</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">END TIME</div>
                                <div className="text-sm text-gray-600">{this.generateRandomTime()}</div>
                                <div className="text-xs text-gray-500">Finished</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">DURATION</div>
                                <div className="text-sm text-gray-600">{this.generateRandomDuration()}</div>
                                <div className="text-xs text-gray-500">Total Time</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">SCORE</div>
                                <div className="text-sm font-semibold text-blue-600">Final: {this.generateRandomScore()}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tournament Bracket Yet</h3>
                      <p className="text-gray-600">Click "Shuffle Game" to create the tournament bracket with randomized match pairings.</p>
                    </div>
                  </div>
                )}
</div>
</div>
)}

{/* Previous Matches Tab */}
{this.state.activeTab === 'previous' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Previous Matches</h2>
                  <div className="text-sm text-gray-600">
                    Showing {((this.state.previousMatchesPage - 1) * this.state.previousMatchesPerPage) + 1}-{Math.min(this.state.previousMatchesPage * this.state.previousMatchesPerPage, this.state.previousMatches.length)} of {this.state.previousMatches.length} matches
                  </div>
                </div>
                <div className="space-y-4">
                  {this.getPaginatedPreviousMatches().map((match) => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => this.handleShowMatchDetailsModal(match)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
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
                              {match.players} players
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-600">${match.entryFee}</div>
                          <div className="text-sm text-gray-500">Entry Fee</div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
                {/* Pagination Controls for Previous Matches */}
                {this.getPreviousMatchesTotalPages() > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {this.state.previousMatchesPage} of {this.getPreviousMatchesTotalPages()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => this.handlePreviousMatchesPageChange(this.state.previousMatchesPage - 1)}
                        disabled={this.state.previousMatchesPage === 1}
                        className="px-4 py-2 text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:shadow-sm disabled:hover:scale-100 transition-all duration-200"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      {this.getPreviousMatchesPageNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === '...' ? (
                            <span className="px-2 py-1 text-sm text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => this.handlePreviousMatchesPageChange(pageNum as number)}
                              className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 shadow-sm ${
                                this.state.previousMatchesPage === pageNum
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
                        onClick={() => this.handlePreviousMatchesPageChange(this.state.previousMatchesPage + 1)}
                        disabled={this.state.previousMatchesPage === this.getPreviousMatchesTotalPages()}
                        className="px-4 py-2 text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:shadow-sm disabled:hover:scale-100 transition-all duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {this.state.activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Notification Management</h2>
                  <button
                    onClick={() => this.handleOpenSendNotification()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Send New Notification
                  </button>
                </div>

                {/* Notification History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification History</h3>
                  {this.notificationHistory.map((notification) => (
                    <div key={notification.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{notification.title}</h4>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                              notification.sentTo === 'All Customers' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}>
                              {notification.sentTo}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {notification.sentCount} recipients
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(notification.sentAt).toLocaleString()}
                            </div>
                            {notification.matchName && (
                              <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                {notification.matchName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

           {/* Settings Tab */}
           {this.state.activeTab === 'settings' && (
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
          {this.state.showMatchDetails && this.state.selectedMatch && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{this.state.selectedMatch?.name || 'Match Details'}</h3>
                    <button
                      onClick={() => this.setState({ showMatchDetails: false })}
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
                      <p className="text-gray-900">{this.state.selectedMatch?.gameType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Venue</span>
                      <p className="text-gray-900">{this.state.selectedMatch?.venue || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date & Time</span>
                      <p className="text-gray-900">{this.state.selectedMatch?.date ? new Date(this.state.selectedMatch.date).toLocaleDateString() : 'N/A'} at {this.state.selectedMatch?.time || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Players</span>
                      <p className="text-gray-900">{this.state.selectedMatch?.players || 0}/{this.state.selectedMatch?.maxPlayers || this.state.selectedMatch?.players || 0}</p>
                    </div>
                  </div>

                  {/* Organizer Info */}
                  {this.state.selectedMatch?.organizerName && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">Organizer</span>
                      <p className="text-gray-900 font-medium">{this.state.selectedMatch?.organizerName}</p>
                      {this.state.selectedMatch?.organizerDescription && (
                        <p className="text-sm text-gray-600 mt-1">{this.state.selectedMatch?.organizerDescription}</p>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Entry Fee</span>
                    <p className="text-2xl font-bold text-green-600">${this.state.selectedMatch?.entryFee || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Notified Users Modal */}
          {this.state.showNotifiedUsers && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Notified Users</h3>
                    <button
                      onClick={() => this.setState({ showNotifiedUsers: false })}
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
                      <span className="font-medium">Total Notified:</span> {this.registeredCustomers.length} users
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notified Users List</h4>
                    <div className="space-y-2">
                      {this.registeredCustomers.map(customer => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                          <div className="flex items-center gap-3">
                            <img 
                              src={customer.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                              alt={customer.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-600">{customer.email}</div>
                            </div>
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

           {/* Send Notification Modal */}
           {this.state.showSendNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Send Notification</h3>
                    <button
                      onClick={() => this.setState({ showSendNotificationModal: false })}
                      className="text-white hover:text-green-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Notification Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Title *
                      </label>
                      <input
                        type="text"
                        value={this.state.notificationForm.title}
                        onChange={(e) => this.handleNotificationInputChange('title', e.target.value)}
                        placeholder="e.g., Tournament Reminder"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Type
                      </label>
                      <select
                        value={this.state.notificationForm.notificationType}
                        onChange={(e) => this.handleNotificationInputChange('notificationType', e.target.value as 'all' | 'selected')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="all">Notify All Customers</option>
                        <option value="selected">Notify Selected Customers</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={this.state.notificationForm.message}
                      onChange={(e) => this.handleNotificationInputChange('message', e.target.value)}
                      placeholder="Enter your notification message..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  {/* Customer Selection */}
                  {this.state.notificationForm.notificationType === 'selected' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Select Customers</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={this.handleSelectAllCustomers}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            onClick={this.handleClearCustomerSelection}
                            className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {this.registeredCustomers.map((customer) => (
                          <div key={customer.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              id={`customer-${customer.id}`}
                              checked={this.state.notificationForm.selectedCustomers.includes(customer.id)}
                              onChange={(e) => this.handleCustomerSelection(customer.id, e.target.checked)}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <label htmlFor={`customer-${customer.id}`} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={customer.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                                  alt={customer.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                  <div className="text-sm text-gray-600">{customer.email}</div>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {customer.skill}
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600">
                        Selected: {this.state.notificationForm.selectedCustomers.length} of {this.registeredCustomers.length} customers
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {this.state.notificationForm.notificationType === 'all' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Notification Preview</h4>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Recipients:</span> All {this.registeredCustomers.length} registered customers
                      </p>
                      <p className="text-sm text-green-800 mt-1">
                        <span className="font-medium">Title:</span> {this.state.notificationForm.title || 'No title'}
                      </p>
                      <p className="text-sm text-green-800 mt-1">
                        <span className="font-medium">Message:</span> {this.state.notificationForm.message || 'No message'}
                      </p>
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => this.setState({ showSendNotificationModal: false })}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={this.handleSendNotification}
                      disabled={!this.state.notificationForm.title || !this.state.notificationForm.message || 
                               (this.state.notificationForm.notificationType === 'selected' && this.state.notificationForm.selectedCustomers.length === 0)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


 {/* Tournament Details Modal */}
 {this.state.showMatchDetailsModal && this.state.selectedMatch && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={this.handleCloseMatchDetailsModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-full w-full h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl relative flex-shrink-0">
                <button
                  onClick={this.handleCloseMatchDetailsModal}
                  className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20 z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {/* Tournament Info and Conducted By Profile - One Line */}
                <div className="flex items-center justify-between pr-16">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">🎱 {this.state.selectedMatch.name}</h1>
                    <div className="flex items-center gap-6 text-blue-100 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(this.state.selectedMatch.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{this.state.selectedMatch.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{this.state.selectedMatch.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conducted By Profile */}
                  {this.state.selectedMatch.conductedByProfile && (
                    <div 
                      className="flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 mr-2 cursor-pointer hover:bg-opacity-20 transition-all duration-200"
                      onClick={() => this.handleOpenProfileModal(this.state.selectedMatch.conductedByProfile)}
                    >
                      <div className="relative">
                        <img 
                          src={this.state.selectedMatch.conductedByProfile.profilePic || this.state.selectedMatch.conductedByProfile.logo} 
                          alt={this.state.selectedMatch.conductedByProfile.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white border-opacity-30"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">🏢</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="font-semibold text-white text-sm">{this.state.selectedMatch.conductedByProfile.name}</h4>
                        <p className="text-blue-200 text-xs">{this.state.selectedMatch.conductedByProfile.description}</p>
                        <p className="text-blue-300 text-xs">{this.state.selectedMatch.conductedByProfile.contact}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Top 4 Players in Header */}
                {this.state.selectedMatch?.topPlayers && (
                  <div className="mt-6 pt-4 border-t border-blue-400 border-opacity-30">
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">🏆 Top 4 Champions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Winner */}
                      <div 
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-20 cursor-pointer hover:bg-opacity-20 transition-all duration-200"
                        onClick={() => this.state.selectedMatch?.topPlayers?.winner && this.handleOpenProfileModal(this.state.selectedMatch.topPlayers.winner)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-2">
                            <img 
                              src={this.state.selectedMatch?.topPlayers?.winner?.avatar || '/default-avatar.png'} 
                              alt={this.state.selectedMatch?.topPlayers?.winner?.name || 'Winner'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">1</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-white text-sm">{this.state.selectedMatch?.topPlayers?.winner?.name || 'Winner Name'}</h4>
                          <p className="text-blue-200 text-xs">🏆 Winner</p>                          
                          <p className="text-yellow-300 text-xs font-bold">{this.state.selectedMatch?.topPlayers?.winner?.skill || 'Skill Level'}</p>
                        </div>
                      </div>

                      {/* Runner Up */}
                      <div 
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-20 cursor-pointer hover:bg-opacity-20 transition-all duration-200"
                        onClick={() => this.handleOpenProfileModal(this.state.selectedMatch.topPlayers.runnerUp)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-2">
                            <img 
                              src={this.state.selectedMatch.topPlayers.runnerUp.avatar} 
                              alt={this.state.selectedMatch.topPlayers.runnerUp.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">2</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-white text-sm">{this.state.selectedMatch.topPlayers.runnerUp.name}</h4>
                          <p className="text-blue-200 text-xs">🥈 Runner-up</p>
                          <p className="text-yellow-300 text-xs font-bold">{this.state.selectedMatch.topPlayers.runnerUp.prize}</p>
                        </div>
                      </div>

                      {/* Third Place */}
                      <div 
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-20 cursor-pointer hover:bg-opacity-20 transition-all duration-200"
                        onClick={() => this.handleOpenProfileModal(this.state.selectedMatch.topPlayers.thirdPlace)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-2">
                            <img 
                              src={this.state.selectedMatch.topPlayers.thirdPlace.avatar} 
                              alt={this.state.selectedMatch.topPlayers.thirdPlace.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">3</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-white text-sm">{this.state.selectedMatch.topPlayers.thirdPlace.name}</h4>
                          <p className="text-blue-200 text-xs">🥉 3rd Place</p>
                          <p className="text-yellow-300 text-xs font-bold">{this.state.selectedMatch.topPlayers.thirdPlace.prize}</p>
                        </div>
                      </div>

                      {/* Fourth Place */}
                      <div 
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-20 cursor-pointer hover:bg-opacity-20 transition-all duration-200"
                        onClick={() => this.handleOpenProfileModal(this.state.selectedMatch.topPlayers.fourthPlace)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-2">
                            <img 
                              src={this.state.selectedMatch.topPlayers.fourthPlace.avatar} 
                              alt={this.state.selectedMatch.topPlayers.fourthPlace.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">4</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-white text-sm">{this.state.selectedMatch.topPlayers.fourthPlace.name}</h4>
                          <p className="text-blue-200 text-xs">🏅 4th Place</p>
                          <p className="text-yellow-300 text-xs font-bold">{this.state.selectedMatch.topPlayers.fourthPlace.prize}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Tabs */}
              <div className="flex border-b border-gray-200 flex-shrink-0">
                <button
                  onClick={() => this.setState({ modalActiveTab: 'players' })}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    this.state.modalActiveTab === 'players'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5 inline-block mr-2" />
                  All Players ({this.state.selectedMatch.registeredPlayers?.length || 0})
                </button>
                <button
                  onClick={() => this.setState({ modalActiveTab: 'tournament' })}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    this.state.modalActiveTab === 'tournament'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Trophy className="w-5 h-5 inline-block mr-2" />
                  Tournament Bracket
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
                {/* Tab Content */}
                <div className="p-6">
                  {this.state.modalActiveTab === 'players' && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tournament Participants</h2>
                      <div className="mb-4 p-4 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">Scroll test: You should be able to scroll through all {this.state.selectedMatch.registeredPlayers?.length || 0} players below.</p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {this.state.selectedMatch.registeredPlayers && this.state.selectedMatch.registeredPlayers.map((player) => (
                          <div 
                            key={player.id} 
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                            onClick={() => this.handleOpenProfileModal(player)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="relative">
                                <img
                                  src={player.profilePic}
                                  alt={player.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {player.finalPosition || player.id}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                player.skill === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                                player.skill === 'Intermediate' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {player.skill}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">{player.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Email:</span>
                                <span className="font-medium text-blue-600">{player.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Position:</span>
                                <span className="font-medium text-green-600">#{player.finalPosition || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Debug content to ensure scrolling */}
                      <div className="mt-8 p-4 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800">End of player list - If you can see this, scrolling is working!</p>
                      </div>
                    </div>
                  )}
                  {this.state.modalActiveTab === 'tournament' && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tournament Bracket</h2>
                      <div className="overflow-x-auto">
                        <div className="flex space-x-6 min-w-max pb-4">
                          
                          {/* Round 1 */}
                          <div className="flex-shrink-0 w-64">
                            <h3 className="text-lg font-semibold mb-4 text-center bg-blue-100 text-blue-800 py-2 rounded-lg">
                              Round 1 (30 Players)
                            </h3>
                            {this.state.selectedMatch.registeredPlayers && this.state.selectedMatch.registeredPlayers.slice(0, 16).map((player, index) => (
                              <div key={`r1-${index}`} className="bg-white border-2 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow border-gray-200">
                                <div className="text-xs text-gray-500 mb-2 font-semibold">
                                  Match {index + 1}
                                </div>
                                <div className="space-y-2">
                                  <div 
                                    className="flex items-center justify-between p-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => this.handleOpenProfileModal(player)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={player.profilePic}
                                        alt={player.name}
                                        className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                      />
                                      <span className="text-sm font-medium">{player.name}</span>
                                    </div>
                                    {player.finalPosition <= 2 && <span className="text-green-600 font-bold">✅</span>}
                                  </div>
                                  {index % 2 === 1 && (
                                    <>
                                      <div className="text-center text-gray-400 text-xs">VS</div>
                                      <div 
                                        className="flex items-center justify-between p-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => this.handleOpenProfileModal(this.state.selectedMatch?.registeredPlayers?.[index - 1])}
                                      >
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={this.state.selectedMatch?.registeredPlayers?.[index - 1]?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                                            alt={this.state.selectedMatch?.registeredPlayers?.[index - 1]?.name || 'Player'}
                                            className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                          />
                                          <span className="text-sm font-medium">{this.state.selectedMatch?.registeredPlayers?.[index - 1]?.name || 'Player'}</span>
                                        </div>
                                        {((this.state.selectedMatch?.registeredPlayers?.[index - 1]?.finalPosition || 0) <= 2) && <span className="text-green-600 font-bold">✅</span>}
                                      </div>
                                    </>
                                  )}
                                </div>
                                {player.finalPosition <= 2 && (
                                  <div className="mt-2 text-center">
                                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                      Winner: {player.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </div>

                          {/* Round 2 */}
                          <div className="flex-shrink-0 w-64">
                            <h3 className="text-lg font-semibold mb-4 text-center bg-green-100 text-green-800 py-2 rounded-lg">
                              Round 2 (16 Players)
                            </h3>
                            {this.state.selectedMatch.registeredPlayers && this.state.selectedMatch.registeredPlayers
                              .filter(player => player.finalPosition <= 16)
                              .sort((a, b) => a.finalPosition - b.finalPosition)
                              .slice(0, 8)
                              .map((player, index) => (
                                <div key={`r2-${index}`} className="bg-white border-2 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow border-gray-200">
                                  <div className="text-xs text-gray-500 mb-2 font-semibold">
                                    Match {index + 1}
                                  </div>
                                  <div className="space-y-2">
                                    <div 
                                      className="flex items-center justify-between p-2 rounded bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                                      onClick={() => this.handleOpenProfileModal(player)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={player.profilePic}
                                          alt={player.name}
                                          className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                        />
                                        <span className="text-sm font-medium">{player.name}</span>
                                      </div>
                                      {player.finalPosition <= 2 && <span className="text-green-600 font-bold">✅</span>}
                                    </div>
                                    <div className="text-center text-gray-400 text-xs">VS</div>
                                    <div className="flex items-center justify-between p-2 rounded bg-green-50">
                                      <span className="text-sm font-medium">Opponent</span>
                                    </div>
                                  </div>
                                  {player.finalPosition <= 2 && (
                                    <div className="mt-2 text-center">
                                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                        Winner: {player.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </div>
                          {/* Round 3 */}
                          <div className="flex-shrink-0 w-64">
                            <h3 className="text-lg font-semibold mb-4 text-center bg-yellow-100 text-yellow-800 py-2 rounded-lg">
                              Round 3 (8 Players)
                            </h3>
                            {this.state.selectedMatch.registeredPlayers && this.state.selectedMatch.registeredPlayers
                              .filter(player => player.finalPosition <= 8)
                              .sort((a, b) => a.finalPosition - b.finalPosition)
                              .slice(0, 4)
                              .map((player, index) => (
                                <div key={`r3-${index}`} className="bg-white border-2 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow border-gray-200">
                                  <div className="text-xs text-gray-500 mb-2 font-semibold">
                                    Match {index + 1}
                                  </div>
                                  <div className="space-y-2">
                                    <div 
                                      className="flex items-center justify-between p-2 rounded bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors"
                                      onClick={() => this.handleOpenProfileModal(player)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={player.profilePic}
                                          alt={player.name}
                                          className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                        />
                                        <span className="text-sm font-medium">{player.name}</span>
                                      </div>
                                      {player.finalPosition <= 4 && <span className="text-green-600 font-bold">✅</span>}
                                    </div>
                                    <div className="text-center text-gray-400 text-xs">VS</div>
                                    <div className="flex items-center justify-between p-2 rounded bg-yellow-50">
                                      <span className="text-sm font-medium">Opponent</span>
                                    </div>
                                  </div>
                                  {player.finalPosition <= 4 && (
                                    <div className="mt-2 text-center">
                                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                        Winner: {player.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </div>
                          {/* Semifinals */}
                          <div className="flex-shrink-0 w-64">
                            <h3 className="text-lg font-semibold mb-4 text-center bg-purple-100 text-purple-800 py-2 rounded-lg">
                              Semifinals (4 Players)
                            </h3>
                            {this.state.selectedMatch.registeredPlayers && this.state.selectedMatch.registeredPlayers
                              .filter(player => player.finalPosition <= 4)
                              .sort((a, b) => a.finalPosition - b.finalPosition)
                              .slice(0, 2)
                              .map((player, index) => (
                                <div key={`sf-${index}`} className="bg-white border-2 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow border-gray-200">
                                  <div className="text-xs text-gray-500 mb-2 font-semibold">
                                    Match {index + 1}
                                  </div>
                                  <div className="space-y-2">
                                    <div 
                                      className="flex items-center justify-between p-2 rounded bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
                                      onClick={() => this.handleOpenProfileModal(player)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={player.profilePic}
                                          alt={player.name}
                                          className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                        />
                                        <span className="text-sm font-medium">{player.name}</span>
                                      </div>
                                      {player.finalPosition <= 2 && <span className="text-green-600 font-bold">✅</span>}
                                    </div>
                                    <div className="text-center text-gray-400 text-xs">VS</div>
                                    <div className="flex items-center justify-between p-2 rounded bg-purple-50">
                                      <span className="text-sm font-medium">Opponent</span>
                                    </div>
                                  </div>
                                  {player.finalPosition <= 2 && (
                                    <div className="mt-2 text-center">
                                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                        Winner: {player.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </div>

                          {/* Final Rankings */}
                          <div className="flex-shrink-0 w-64">
                            <h3 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 rounded-lg">
                              🏆 Final Rankings
                            </h3>
                            
                            {this.state.selectedMatch.registeredPlayers && this.state.selectedMatch.registeredPlayers
                              .filter(player => player.finalPosition <= 10)
                              .sort((a, b) => a.finalPosition - b.finalPosition)
                              .map((player) => (
                                <div key={`ranking-${player.id}`} className={`${
                                  player.finalPosition === 1 
                                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-md' 
                                    : player.finalPosition === 2 
                                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-400 shadow-md' 
                                    : player.finalPosition === 3
                                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-500 shadow-md'
                                    : 'bg-white border border-gray-300 shadow-sm'
                                } rounded-lg p-4 mb-3`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-8 h-8 ${
                                        player.finalPosition === 1 ? 'bg-yellow-500' :
                                        player.finalPosition === 2 ? 'bg-gray-500' :
                                        player.finalPosition === 3 ? 'bg-amber-600' :
                                        'bg-blue-500'
                                      } text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                                        {player.finalPosition}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-800">{player.name}</p>
                                        <p className={`text-xs font-medium ${
                                          player.finalPosition === 1 ? 'text-yellow-700' :
                                          player.finalPosition === 2 ? 'text-gray-600' :
                                          player.finalPosition === 3 ? 'text-amber-700' :
                                          'text-blue-600'
                                        }`}>
                                          {player.finalPosition === 1 ? '🏆 Champion' : 
                                           player.finalPosition === 2 ? '🥈 Runner-up' : 
                                           player.finalPosition === 3 ? '🥉 3rd Place' :
                                           `#${player.finalPosition} Place`}
                                        </p>
                                      </div>
                                    </div>
                                    <Trophy className={`w-6 h-6 ${
                                      player.finalPosition === 1 ? 'text-yellow-600' :
                                      player.finalPosition === 2 ? 'text-gray-500' :
                                      player.finalPosition === 3 ? 'text-amber-500' :
                                      'text-blue-400'
                                    }`} />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-gray-700">Tournament Progress:</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                            <span>Winner</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-50 rounded mr-2"></div>
                            <span>Eliminated</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-green-600 font-bold mr-2">✅</span>
                            <span>Match Winner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
         {/* Profile Details Modal */}
         {this.state.showProfileModal && this.state.selectedProfile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={this.handleCloseProfileModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl relative">
                <button
                  onClick={this.handleCloseProfileModal}
                  className="absolute top-4 right-4 text-white hover:text-purple-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img 
                      src={this.state.selectedProfile.avatar || this.state.selectedProfile.profilePic} 
                      alt={this.state.selectedProfile.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-sm font-bold text-white">{this.state.selectedProfile.position || this.state.selectedProfile.finalPosition || this.state.selectedProfile.id}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{this.state.selectedProfile.name}</h1>
              <p className="text-purple-200 text-sm">{this.state.selectedProfile.email || this.state.selectedProfile.contact}</p>
              {(this.state.selectedProfile.position || this.state.selectedProfile.finalPosition || this.state.selectedProfile.skill) && (
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    this.state.selectedProfile.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                    this.state.selectedProfile.position === 2 ? 'bg-gray-100 text-gray-800' :
                    this.state.selectedProfile.position === 3 ? 'bg-orange-100 text-orange-800' :
                    this.state.selectedProfile.position === 4 ? 'bg-blue-100 text-blue-800' :
                    this.state.selectedProfile.position === 'Tournament Director' ? 'bg-purple-100 text-purple-800' :
                    this.state.selectedProfile.skill === 'Pro' ? 'bg-purple-100 text-purple-800' :
                    this.state.selectedProfile.skill === 'Expert' ? 'bg-red-100 text-red-800' :
                    this.state.selectedProfile.skill === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                    this.state.selectedProfile.skill === 'Intermediate' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {this.state.selectedProfile.position === 1 ? '🏆 Winner' :
                     this.state.selectedProfile.position === 2 ? '🥈 Runner-up' :
                     this.state.selectedProfile.position === 3 ? '🥉 3rd Place' :
                     this.state.selectedProfile.position === 4 ? '🏅 4th Place' :
                     this.state.selectedProfile.position === 'Tournament Director' ? '🏢 Tournament Director' :
                     this.state.selectedProfile.skill ? `🎯 ${this.state.selectedProfile.skill}` :
                     `Position #${this.state.selectedProfile.finalPosition || this.state.selectedProfile.id}`}
                  </span>
                </div>
              )}
                </div>
              </div>
              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Position & Prize */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {this.state.selectedProfile.position === 'Tournament Director' ? 'Role & Position' : 
                           this.state.selectedProfile.position || this.state.selectedProfile.finalPosition ? 'Tournament Position' : 'Player Information'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {this.state.selectedProfile.position === 1 && <span className="text-2xl">🏆</span>}
                          {this.state.selectedProfile.position === 2 && <span className="text-2xl">🥈</span>}
                          {this.state.selectedProfile.position === 3 && <span className="text-2xl">🥉</span>}
                          {this.state.selectedProfile.position === 4 && <span className="text-2xl">🏅</span>}
                          {this.state.selectedProfile.position === 'Tournament Director' && <span className="text-2xl">🏢</span>}
                          {this.state.selectedProfile.skill && !this.state.selectedProfile.position && <span className="text-2xl">🎯</span>}
                          <span className="text-lg font-bold text-gray-800">
                            {this.state.selectedProfile.position === 1 ? 'Winner' :
                             this.state.selectedProfile.position === 2 ? 'Runner-up' :
                             this.state.selectedProfile.position === 3 ? '3rd Place' :
                             this.state.selectedProfile.position === 4 ? '4th Place' :
                             this.state.selectedProfile.position === 'Tournament Director' ? 'Tournament Director' :
                             this.state.selectedProfile.skill ? `${this.state.selectedProfile.skill} Player` :
                             `Position #${this.state.selectedProfile.finalPosition || this.state.selectedProfile.id}`}
                          </span>
                        </div>
                      </div>
                      {this.state.selectedProfile.prize && (
                        <div className="text-right">
                          <h3 className="font-semibold text-gray-900 mb-1">Prize Money</h3>
                          <div className="text-2xl font-bold text-green-600">{this.state.selectedProfile.prize}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skill Level */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {this.state.selectedProfile.position === 'Tournament Director' ? 'Experience Level' : 
                       this.state.selectedProfile.skill ? 'Skill Level' : 'Skill Level'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (this.state.selectedProfile.skillLevel || this.state.selectedProfile.skill) === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                        (this.state.selectedProfile.skillLevel || this.state.selectedProfile.skill) === 'Intermediate' ? 'bg-green-100 text-green-800' :
                        (this.state.selectedProfile.skillLevel || this.state.selectedProfile.skill) === 'Expert' ? 'bg-red-100 text-red-800' :
                        (this.state.selectedProfile.skillLevel || this.state.selectedProfile.skill) === 'Pro' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {this.state.selectedProfile.skillLevel || this.state.selectedProfile.skill}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {this.state.selectedProfile.position === 'Tournament Director' ? 'Organization Contact' : 'Contact Information'}
                    </h3>
                    <div className="space-y-2">
                      {this.state.selectedProfile.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📧</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.email}</span>
                        </div>
                      )}
                      {this.state.selectedProfile.contact && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">📞</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.contact}</span>
                        </div>
                      )}
                      {this.state.selectedProfile.website && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-sm">🌐</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.website}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organization Information (for Tournament Directors) */}
                  {this.state.selectedProfile.position === 'Tournament Director' && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">About the Organization</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-sm">🏢</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.name}</span>
                        </div>
                        {this.state.selectedProfile.description && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">📝</span>
                            </div>
                            <span className="text-gray-700">{this.state.selectedProfile.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tournament Stats */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {this.state.selectedProfile.position === 'Tournament Director' ? 'Director Profile' : 
                       this.state.selectedProfile.position || this.state.selectedProfile.finalPosition ? 'Tournament Performance' : 'Player Profile'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {this.state.selectedProfile.position === 'Tournament Director' ? '🏢' : 
                           this.state.selectedProfile.position || this.state.selectedProfile.finalPosition ? (this.state.selectedProfile.position || this.state.selectedProfile.finalPosition || this.state.selectedProfile.id) :
                           this.state.selectedProfile.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {this.state.selectedProfile.position === 'Tournament Director' ? 'Position' : 
                           this.state.selectedProfile.position || this.state.selectedProfile.finalPosition ? 'Final Position' : 'Player ID'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{this.state.selectedProfile.skillLevel || this.state.selectedProfile.skill}</div>
                        <div className="text-sm text-gray-600">
                          {this.state.selectedProfile.position === 'Tournament Director' ? 'Experience' : 'Skill Level'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Detail Modal */}
        {(() => {
          if (this.state.showTournamentModal && this.state.selectedTournament) {
            console.log('🎨 Rendering modal with tournament:', this.state.selectedTournament);
            return true;
          }
          return false;
        })() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{this.state.selectedTournament.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 text-sm font-medium rounded-full border border-orange-200 bg-orange-50 text-orange-700">
                        {this.state.selectedTournament.status.charAt(0).toUpperCase() + this.state.selectedTournament.status.slice(1)}
                      </span>
                      <span className="px-3 py-1 text-sm font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        {this.state.selectedTournament.gameType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={this.handleCloseTournamentModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content - Simplified to match the image */}
              <div className="p-6">
                {/* Tournament Details Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">9</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">9-ball</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">15/10/2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">14:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Delhi Sports Complex - Main Branch</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => this.handleShuffleGame()}
                      disabled={this.state.selectedTournament.loading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Shuffle Game
                    </button>
                  </div>
                </div>

                {/* Registered Players */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Registered Players ({this.state.selectedTournament.currentParticipants})</h3>
                  
                  {this.state.selectedTournament.loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading registered players...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {this.state.selectedTournament.registeredPlayers.map((player: any) => (
                        <div key={player.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <img
                                src={player.profilePic}
                                alt={player.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {player.id}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{player.name}</h4>
                              <p className="text-sm text-gray-600 truncate">{player.email}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${player.skillColor}`}>
                                  {player.skillLevel}
                                </span>
                                <span className="text-xs text-gray-500">{player.registrationDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Step Button */}
                <div className="mt-8 text-center">
                  <button 
                    onClick={() => this.handleNextGameOrganization()}
                    disabled={this.state.selectedTournament.loading}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium text-lg flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Organize Tournament
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}




       {/* Round Name Modal */}
{this.state.showRoundNameModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Round</h3>
                  <p className="text-sm text-gray-600 mt-1">Choose a round type and enter custom details</p>
                </div>
                {/* Debug button to reset usedRoundNames */}
                <button
                  onClick={() => this.setState({ usedRoundNames: [] })}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  title="Debug: Reset used round names"
                >
                  Reset Names
                </button>
              </div>
            </div>
      {/* Modal Content */}
      <div className="p-6">
        {/* Custom Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Round Title
          </label>
          <input
            type="text"
            value={this.state.selectedRoundDisplayName}
            onChange={(e) => this.setState({ selectedRoundDisplayName: e.target.value })}
            placeholder="Enter custom round name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {/* Round Categories */}
        <div className="space-y-6">
          {/* Regular Rounds */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Regular Rounds</h4>
            <div className="grid grid-cols-2 gap-2">
              {!this.state.usedRoundNames.includes('First Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'First Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">First Round</div>
                  <div className="text-xs text-gray-500">Initial tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Second Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Second Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Second Round</div>
                  <div className="text-xs text-gray-500">Second tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Third Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Third Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Third Round</div>
                  <div className="text-xs text-gray-500">Third tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Fourth Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Fourth Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Fourth Round</div>
                  <div className="text-xs text-gray-500">Fourth tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Fifth Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Fifth Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Fifth Round</div>
                  <div className="text-xs text-gray-500">Fifth tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Sixth Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Sixth Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Sixth Round</div>
                  <div className="text-xs text-gray-500">Sixth tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Seventh Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Seventh Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Seventh Round</div>
                  <div className="text-xs text-gray-500">Seventh tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Eighth Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Eighth Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Eighth Round</div>
                  <div className="text-xs text-gray-500">Eighth tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Ninth Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Ninth Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Ninth Round</div>
                  <div className="text-xs text-gray-500">Ninth tournament round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Tenth Round') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Tenth Round' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="font-medium text-gray-900">Tenth Round</div>
                  <div className="text-xs text-gray-500">Tenth tournament round</div>
                </button>
              )}
            </div>
          </div>

          {/* Final Rounds */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Final Rounds</h4>
            <div className="grid grid-cols-2 gap-2">
              {!this.state.usedRoundNames.includes('Round of 32') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Round of 32' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div className="font-medium text-gray-900">Round of 32</div>
                  <div className="text-xs text-gray-500">32 players remaining</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Round of 16') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Round of 16' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div className="font-medium text-gray-900">Round of 16</div>
                  <div className="text-xs text-gray-500">16 players remaining</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Round of 8') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Round of 8' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div className="font-medium text-gray-900">Round of 8</div>
                  <div className="text-xs text-gray-500">8 players remaining</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Quarter Final') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Quarter Final' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div className="font-medium text-gray-900">Quarter Final</div>
                  <div className="text-xs text-gray-500">Top 8 players</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Semi Final') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Semi Final' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors">
                  <div className="font-medium text-gray-900">Semi Final</div>
                  <div className="text-xs text-gray-500">Top 4 players</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Final') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Final' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors">
                  <div className="font-medium text-gray-900">Final</div>
                  <div className="text-xs text-gray-500">Championship round</div>
                </button>
              )}
              {!this.state.usedRoundNames.includes('Grand Final') && (
                <button onClick={() => this.setState({ selectedRoundDisplayName: 'Grand Final' })} className="p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                  <div className="font-medium text-gray-900">Grand Final</div>
                  <div className="text-xs text-gray-500">Ultimate championship</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button onClick={() => this.setState({ showRoundNameModal: false, selectedRoundDisplayName: '' })} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Cancel
        </button>
        <button onClick={this.handleCreateRoundFromModal} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
          Create Round
        </button>
      </div>
    </div>
  </div>
)

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => this.setState({ showWinnerSelectionModal: false, selectedMatchForWinner: null })} 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
                           </div>
                         </div>
                       )}
                       
      {/* Custom Alert Modal */}
      {this.state.showCustomAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {this.state.customAlertTitle}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="text-gray-700 whitespace-pre-line">
                {this.state.customAlertMessage}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={this.hideCustomAlert}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {this.state.showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {this.state.deleteConfirmTitle}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="text-gray-700 whitespace-pre-line">
                {this.state.deleteConfirmMessage}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={this.hideDeleteConfirm}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={this.confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Winner Titles Modal */}
      {/* Set Winner Titles Modal */}
{this.state.showSetWinnerTitles && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
      {/* Modal Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 rounded-t-2xl shadow-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
              <h3 className="text-2xl font-bold text-white">Set Winner Titles</h3>
              <p className="text-purple-100 text-sm mt-1">Assign titles and rankings to top winners</p>
            </div>
          </div>
          <button
            onClick={this.hideSetWinnerTitles}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="px-8 py-6">
        {/* Instructions */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-purple-800">
              <p className="font-semibold mb-1">How to use:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Shows winners from their most recent round only</li>
                <li>If a player wins multiple rounds, only the latest win is shown</li>
                <li>Most recent winners appear at the top</li>
                <li>Each player appears only once (no duplicates)</li>
                <li>Use checkboxes to select which winners appear in Tournament Results</li>
                <li>Select a predefined title or enter a custom title</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Winner List */}
        <div className="space-y-4">
          {this.state.rankedWinners.length > 0 ? (
            <>
              {/* Debug info */}
              <div className="p-2 bg-yellow-100 text-xs">
                DEBUG: Total winners to display: {this.state.rankedWinners.length}
              </div>
              
              {this.state.rankedWinners.map((rankedWinner, index) => {
                console.log('Rendering winner:', index, rankedWinner.player.name);
                   return (
                  <div 
                    key={`winner-${rankedWinner.player.id}-${index}`}
                    className="bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-6">
                      {/* Rank Number */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                            'bg-gradient-to-br from-purple-400 to-purple-600'
                          }`}>
                            {index + 1}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0 flex items-center">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rankedWinner.selected || false}
                            onChange={() => this.toggleWinnerSelection(index)}
                            className="w-6 h-6 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {rankedWinner.selected ? 'Display in Results' : 'Hide from Results'}
                          </span>
                        </label>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={rankedWinner.player.profilePic || '/default-avatar.png'} 
                            alt={rankedWinner.player.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-purple-300 shadow-md"
                          />
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900">{rankedWinner.player.name}</h4>
                            <p className="text-sm text-gray-600">{rankedWinner.player.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                {rankedWinner.roundWon}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Skill: {rankedWinner.player.skill || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Title Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Predefined Titles */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Predefined Titles
                            </label>
                           <div className="grid grid-cols-2 gap-2">
                              {['Champion', 'Runner Up', 'Third Place', '4th Place'].map((title) => (
                               <button
                                  key={title}
                                  onClick={() => this.updateWinnerTitle(index, title)}
                                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                    rankedWinner.title === title
                                      ? 'bg-purple-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                               >
                                 {title}
                               </button>
                             ))}
                           </div>
                          </div>

                          {/* Custom Title */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Custom Title
                            </label>
                            <input
                              type="text"
                              value={rankedWinner.title}
                              onChange={(e) => this.updateWinnerTitle(index, e.target.value)}
                              placeholder="Enter custom title..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Rank Order */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Rank Order
                          </label>
                          <select
                            value={index + 1}
                            onChange={(e) => this.updateWinnerRank(index, parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          >
                            {this.state.rankedWinners.map((_, idx) => (
                              <option key={idx + 1} value={idx + 1}>
                                Rank {idx + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-lg font-medium">No winners found</p>
              <p className="text-sm mt-1">Complete some matches and select winners first</p>
                         </div>
                       )}
        </div>
      </div>
      {/* Modal Footer */}
      <div className="sticky bottom-0 bg-gray-50 px-8 py-4 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
        <button
          onClick={this.hideSetWinnerTitles}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={this.saveWinnerTitles}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Winner Titles
        </button>
      </div>
    </div>
  </div>
)}

      {/* Tournament Results Modal */}
      {this.state.showTournamentResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto transform transition-all">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl shadow-md z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                         <div>
                    <h3 className="text-2xl font-bold text-white">Tournament Results</h3>
                    <p className="text-blue-100 text-sm mt-1">{this.state.currentGameMatch?.name || 'Tournament'} - Bracket View</p>
                  </div>
                </div>
                               <button
                  onClick={this.hideTournamentResults}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                               >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                               </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6">
              {/* Tournament Summary */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{this.state.rounds.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Rounds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {this.state.rounds.reduce((total, round) => 
                        total + (round.matches?.filter(m => m.status === 'completed').length || 0), 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completed Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {this.state.rounds.reduce((total, round) => total + (round.winners?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Winners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {this.state.currentGameMatch?.allPlayers?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Players</div>
                  </div>
                </div>
              </div>

              {/* Tournament Bracket - Tree Structure */}
              <div className="space-y-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Tournament Progression
                </h4>

                {/* Horizontal Bracket Layout */}
                <div className="flex gap-8 overflow-x-auto pb-4">
                  {this.state.rounds.map((round, roundIndex) => (
                    <div key={round.id} className="flex-shrink-0 min-w-[300px]">
                      {/* Round Header */}
                      <div className="mb-4 sticky top-0 bg-white z-10 pb-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg shadow-md">
                          <div className="font-bold text-lg">{round.displayName || round.name}</div>
                          <div className="text-xs text-blue-100 mt-1">
                            {round.matches?.filter(m => m.status === 'completed').length || 0} / {round.matches?.length || 0} matches completed
                          </div>
                        </div>
                      </div>

                      {/* Matches in this round */}
                      <div className="space-y-4">
                        {round.matches && round.matches.length > 0 ? (
                          round.matches.map((match, matchIndex) => (
                            <div 
                              key={match.id} 
                              className={`relative border-2 rounded-lg p-4 transition-all ${
                                match.status === 'completed' 
                                  ? 'bg-green-50 border-green-300 shadow-md' 
                                  : match.status === 'active'
                                  ? 'bg-yellow-50 border-yellow-300'
                                  : 'bg-gray-50 border-gray-300'
                              }`}
                            >
                              {/* Match Number */}
                              <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                Match {matchIndex + 1}
                              </div>

                              {/* Player 1 */}
                              <div className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                                match.winner && typeof match.winner === 'string' && match.winner === match.player1?.id ? 'bg-green-100 border-2 border-green-400' : 'bg-white'
                              }`}>
                                <img 
                                  src={match.player1?.profilePic || '/default-avatar.png'} 
                                  alt={match.player1?.name || 'Player 1'}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{match.player1?.name || 'Player 1'}</div>
                                  <div className="text-xs text-gray-600">{match.player1?.skill || 'N/A'}</div>
                                </div>
                                {match.winner && typeof match.winner === 'string' && match.winner === match.player1?.id && (
                                  <div className="flex items-center gap-1">
                                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-green-700 font-bold text-sm">WINNER</span>
                                  </div>
                                )}
                              </div>

                              {/* VS Divider */}
                              <div className="text-center py-1">
                                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">VS</span>
                              </div>

                              {/* Player 2 */}
                              <div className={`flex items-center gap-3 p-3 rounded-lg mt-2 ${
                                match.winner && typeof match.winner === 'string' && match.winner === match.player2?.id ? 'bg-green-100 border-2 border-green-400' : 'bg-white'
                              }`}>
                                <img 
                                  src={match.player2?.profilePic || '/default-avatar.png'} 
                                  alt={match.player2?.name || 'Player 2'}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{match.player2?.name || 'Player 2'}</div>
                                  <div className="text-xs text-gray-600">{match.player2?.skill || 'N/A'}</div>
                                </div>
                                {match.winner && typeof match.winner === 'string' && match.winner === match.player2?.id && (
                                  <div className="flex items-center gap-1">
                                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-green-700 font-bold text-sm">WINNER</span>
                                  </div>
                                )}
                              </div>

                              {/* Match Status */}
                              <div className="mt-2 text-center">
                                {match.status === 'completed' && (
                                  <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium">Completed</span>
                                )}
                                {match.status === 'active' && (
                                  <span className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-full font-medium">In Progress</span>
                                )}
                                {match.status === 'pending' && (
                                  <span className="text-xs bg-gray-600 text-white px-3 py-1 rounded-full font-medium">Pending</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            No matches in this round yet
                          </div>
                        )}
                      </div>
                      {/* Winners Section */}
                      {round.winners && round.winners.length > 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-400">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h5 className="font-bold text-yellow-800">Round Winners ({round.winners.length})</h5>
                          </div>
                          <div className="space-y-2">
                            {round.winners.map((winner, index) => (
                              <div key={winner.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-yellow-300">
                                <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full font-bold text-sm">
                                  #{index + 1}
                                </div>
                                <img 
                                  src={winner.profilePic || '/default-avatar.png'} 
                                  alt={winner.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{winner.name}</div>
                                  <div className="text-xs text-gray-600">{winner.skill || 'N/A'}</div>
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

              {/* Final Top Winners Section - Display Selected Winners from WinnersToDisplay */}
              {(() => {
                // Use winnersToDisplay array (most recent round only for each player) - filter only selected winners
                const selectedWinners = this.state.winnersToDisplay.filter(winner => winner.selected);
                const topWinners = selectedWinners.slice(0, 5).map((winner, index) => ({
                  player: winner.player,
                  rank: index + 1,
                  title: winner.title,
                  roundWon: winner.roundWon
                }));
                
                if (topWinners.length > 0) {
                  return (
                    <div className="mt-8 p-8 bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-2xl border-4 border-yellow-500 shadow-2xl">
                      <div className="text-center mb-6">
                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                          🏆 Tournament Champions 🏆
                        </h3>
                        <p className="text-gray-700">
                          Official Tournament Rankings - Selected winners only
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topWinners.slice(0, 5).map((rankedWinner, index) => (
                          <div 
                            key={rankedWinner.player.id} 
                            className={`relative p-6 rounded-xl shadow-xl transform transition-all hover:scale-105 ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-yellow-600' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-4 border-gray-600' :
                              index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 border-4 border-orange-600' :
                              index === 3 ? 'bg-gradient-to-br from-blue-300 to-blue-400 border-4 border-blue-600' :
                              'bg-gradient-to-br from-green-300 to-green-400 border-4 border-green-600'
                            }`}
                          >
                            {/* Rank Badge */}
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-current">
                              <span className="text-2xl font-bold">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                            </div>
                            
                            {/* Winner Info */}
                            <div className="text-center">
                              <img 
                                src={rankedWinner.player.profilePic || '/default-avatar.png'} 
                                alt={rankedWinner.player.name}
                                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4"
                              />
                              <h4 className="text-xl font-bold text-gray-900 mb-1">{rankedWinner.player.name}</h4>
                              <p className="text-sm text-gray-700 mb-2">{rankedWinner.player.email}</p>
                              
                              {/* Round Won Badge */}
                              <div className="mb-2">
                                <span className="inline-block px-3 py-1 bg-white bg-opacity-60 rounded-full text-xs font-medium text-gray-800">
                                  {rankedWinner.roundWon}
                                </span>
                              </div>
                              
                              {/* Skill Badge */}
                              <div className="inline-block px-3 py-1 bg-white bg-opacity-50 rounded-full text-sm font-medium mb-3">
                                Skill: {rankedWinner.player.skill || 'N/A'}
                              </div>
                              
                              {/* Title */}
                              {rankedWinner.title ? (
                                <div className="mt-3 text-xl font-bold text-gray-900 bg-white bg-opacity-60 rounded-lg py-2 px-3">
                                  {rankedWinner.title}
                                </div>
                              ) : (
                                <>
                                  {index === 0 && (
                                    <div className="mt-3 text-2xl font-bold text-yellow-800">Champion</div>
                                  )}
                                  {index === 1 && (
                                    <div className="mt-3 text-xl font-bold text-gray-800">Runner-up</div>
                                  )}
                                  {index === 2 && (
                                    <div className="mt-3 text-lg font-bold text-orange-800">3rd Place</div>
                                  )}
                                  {index === 3 && (
                                    <div className="mt-3 text-lg font-bold text-blue-800">4th Place</div>
                                  )}
                                  {index === 4 && (
                                    <div className="mt-3 text-lg font-bold text-green-800">5th Place</div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Set Winner Titles Hint */}
                      {this.state.rankedWinners.length === 0 && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => {
                              this.hideTournamentResults();
                              this.showSetWinnerTitles();
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Customize Winner Titles & Rankings
                          </button>
                          <p className="text-sm text-gray-600 mt-2">Click to set custom titles and change the order of winners</p>
                         </div>
                       )}
                     </div>
                   );
                }
                return null;
                 })()}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-8 py-4 border-t border-gray-200 rounded-b-2xl flex justify-end">
              <button
                onClick={this.hideTournamentResults}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

{/* Round Tabs */}
{this.state.rounds.length > 0 && (
  <div className="mt-8">
    {/* Tab Navigation */}
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6">
        {this.state.rounds.map((round, index) => (
          <div key={round.id} className="flex flex-col">
           {/* Round Group Header */}
<div className="text-xs text-gray-500 font-medium mb-1 text-center flex items-center justify-center gap-2">
  {this.state.editingRoundId === round.id ? (
    <div className="flex items-center space-x-1">
      <input
        type="text"
        value={this.state.editingRoundName}
        onChange={(e) => this.setState({ editingRoundName: e.target.value })}
        className="text-xs font-medium bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-500 text-center"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') this.saveRoundName(round.id);
          if (e.key === 'Escape') this.cancelEditingRoundName();
        }}
      />
      <button
        onClick={() => this.saveRoundName(round.id)}
        className="text-green-600 hover:text-green-800 text-xs"
      >
        ✓
      </button>
      <button
        onClick={this.cancelEditingRoundName}
        className="text-red-600 hover:text-red-800 text-xs"
      >
        ✗
      </button>
    </div>
  ) : (
    <div className="flex items-center space-x-1">
      <span>{round.displayName || round.name}</span>
      <button
        onClick={() => this.startEditingRoundName(round.id)}
        className="text-gray-400 hover:text-blue-600 transition-colors"
        title="Edit round name"
      >
        ✏️
      </button>
    </div>
  )}
  {/* Show "Last Round" badge for the last round */}
  {index === this.state.rounds.length - 1 && (
    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
      Last Round
    </span>
  )}
</div>
            
            
           {/* Tab Group Container */}
{/* Tab Group Container */}
<div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
  {/* Main Round Tab */}
  <button
    onClick={() => this.setState({ 
      activeRoundTab: round.id, 
      activeRoundSubTab: { ...this.state.activeRoundSubTab, [round.id]: 'matches' } 
    })}
    className={`py-2 px-4 font-medium text-sm flex items-center transition-all ${
      this.state.activeRoundTab === round.id && 
      this.state.activeRoundSubTab[round.id] !== 'winners' && 
      this.state.activeRoundSubTab[round.id] !== 'losers'
        ? 'bg-blue-500 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <Users className="w-4 h-4 mr-2" />
    Players
    <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 text-white rounded-full text-xs">
      {round.players.length}
    </span>
  </button>
  
  {/* Divider */}
  <div className="w-px bg-gray-300"></div>
  
  {/* Winners Tab */}
  <button
    onClick={() => this.setState({ 
      activeRoundTab: round.id, 
      activeRoundSubTab: { ...this.state.activeRoundSubTab, [round.id]: 'winners' } 
    })}
    className={`py-2 px-4 font-medium text-sm flex items-center transition-all ${
      this.state.activeRoundTab === round.id && 
      this.state.activeRoundSubTab[round.id] === 'winners'
        ? 'bg-green-500 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <Trophy className="w-4 h-4 mr-2" />
    Winners
    <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 text-white rounded-full text-xs">
      {round.winners.length}
    </span>
  </button>
  
  {/* Divider */}
  <div className="w-px bg-gray-300"></div>
  
  {/* Losers Tab - NEW! */}
  <button
    onClick={() => this.setState({ 
      activeRoundTab: round.id, 
      activeRoundSubTab: { ...this.state.activeRoundSubTab, [round.id]: 'losers' } 
    })}
    className={`py-2 px-4 font-medium text-sm flex items-center transition-all ${
      this.state.activeRoundTab === round.id && 
      this.state.activeRoundSubTab[round.id] === 'losers'
        ? 'bg-red-500 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    
    
    Losers
    <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 text-white rounded-full text-xs">
      {round.losers?.length || 0}
    </span>
  </button>




 {/* Close Button for Empty Rounds */}
{(() => {
  const currentRounds = this.state.rounds || [];
  const isLastRound = currentRounds.length === 1 || 
    currentRounds[currentRounds.length - 1]?.id === round.id;
  const hasPlayers = round.players.length > 0;
  const hasWinners = round.winners.length > 0;
  const hasLosers = round.losers.length > 0;
  const hasCompletedMatches = round.matches && 
    round.matches.length > 0 && 
    round.matches.some(match => match.status === 'completed');
  const isEmpty = !hasPlayers && !hasWinners && !hasLosers && !hasCompletedMatches;
  
  // Debug logging
  console.log("Close Button Debug (Fixed):", {
    roundId: round.id,
    currentRounds: currentRounds.map(r => r.id),
    currentRoundsLength: currentRounds.length,
    lastRoundId: currentRounds[currentRounds.length - 1]?.id,
    isLastRound,
    isEmpty
  });

  if (isEmpty && isLastRound) {
    return (
      <button
        onClick={() => this.handleCloseRound(round.id)}
        className="ml-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-110"
        title="Close this empty round"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );
  }
  return null;
})()}







</div>


          </div>
        ))}
      </nav>
    </div>
{/* Tab Content */}
<div className="mt-6 bg-white rounded-lg shadow-md p-6">
  {(() => {
    const activeRound = this.state.rounds.find(round => round.id === this.state.activeRoundTab);
    if (!activeRound) return null;
    
    // Check if we're viewing the winners tab
    const isWinnersTab = this.state.activeRoundSubTab[activeRound.id] === 'winners';
    
    if (isWinnersTab) {
      // Winners Tab Content
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800">
                  {activeRound.displayName || activeRound.name} Winners
                </h3>
                <p className="text-sm text-green-600">Champions of this round</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium shadow-sm">
                {activeRound.winners.length} Winner{activeRound.winners.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {activeRound.winners.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Winners Yet</h3>
              <p className="text-gray-500">Winners will appear here once matches are completed.</p>
            </div>
          ) : (
            <div>
              {/* Move Controls for Winners */}
              {activeRound.winners.filter(w => w.selected).length > 0 && (
                <div className="mb-6 p-4 bg-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-green-800 font-medium">
                        {activeRound.winners.filter(w => w.selected).length} winner{activeRound.winners.filter(w => w.selected).length !== 1 ? 's' : ''} selected
                      </span>
                    
                     

                      <select
  className="px-3 py-2 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
  onChange={(e) => this.setState({ selectedRoundId: e.target.value })}
  value={this.state.selectedRoundId || 'dashboard'}
>
  <option value="dashboard">← Back to Tournament Dashboard</option>
  
  {/* Backward movement options */}
  {(() => {
    const selectedWinners = activeRound.winners.filter(w => w.selected);
    
    if (selectedWinners.length === 0) return null;
    
    const validTargetRounds = this.state.rounds.filter(targetRound => {
      if (targetRound.id === activeRound.id) return false;
      
      const targetRoundIndex = this.state.rounds.findIndex(r => r.id === targetRound.id);
      const currentRoundIndex = this.state.rounds.findIndex(r => r.id === activeRound.id);
      
      const isValidForAllWinners = selectedWinners.every(winner => {
        if (winner.lastWinningRound) {
          const lastWinningRoundIndex = this.state.rounds.findIndex(r => r.id === winner.lastWinningRound);
          return targetRoundIndex >= lastWinningRoundIndex;
        }
        return true;
      });
      
      return isValidForAllWinners && targetRoundIndex < currentRoundIndex;
    });
    
    return validTargetRounds.map(targetRound => (
      <option key={targetRound.id} value={targetRound.id}>
        ← Back to {targetRound.displayName || targetRound.name} Winners Tab
      </option>
    ));
  })()}
  
  {/* Forward movement - with intermediate round activation check */}
  {this.state.rounds
    .filter(targetRound => {
      if (targetRound.id === activeRound.id) return false;
      
      const currentRoundIndex = this.state.rounds.findIndex(r => r.id === activeRound.id);
      const targetRoundIndex = this.state.rounds.findIndex(r => r.id === targetRound.id);
      
      // Check if current round has completed matches
      const currentRoundHasCompletedMatches = activeRound.matches && 
        activeRound.matches.length > 0 && 
        activeRound.matches.some(match => match.status === 'completed');
      
      const isMovingForward = targetRoundIndex > currentRoundIndex;
      
      if (!isMovingForward || !currentRoundHasCompletedMatches) {
        return false;
      }
      
      // Check if target is immediate next round
      const isImmediateNextRound = targetRoundIndex === currentRoundIndex + 1;
      
      // If immediate next round, always allow
      if (isImmediateNextRound) {
        return true;
      }
      
      // If skipping rounds, check that ALL intermediate rounds are active
      for (let i = currentRoundIndex + 1; i < targetRoundIndex; i++) {
        const intermediateRound = this.state.rounds[i];
        
        // Check if intermediate round is active (has players, matches, or winners)
        const isActive = 
          (intermediateRound.players && intermediateRound.players.length > 0) ||
          (intermediateRound.matches && intermediateRound.matches.length > 0) ||
          (intermediateRound.winners && intermediateRound.winners.length > 0);
        
        // If any intermediate round is NOT active, don't allow skipping
        if (!isActive) {
          return false;
        }
      }
      
      // All intermediate rounds are active, allow advancement
      return true;
    })
    .map((targetRound) => {
      const hasCompletedMatches = targetRound.matches && 
        targetRound.matches.length > 0 && 
        targetRound.matches.some(match => match.status === 'completed');
      const isEmpty = targetRound.players.length === 0 && 
        targetRound.winners.length === 0 && 
        !hasCompletedMatches;
      const isEmptyText = isEmpty ? " (Empty)" : "";
      
      return (
        <option key={targetRound.id} value={targetRound.id}>
          → Advance to {targetRound.displayName || targetRound.name}{isEmptyText}
        </option>
      );
    })}
</select>




                    </div>
                    <button
                      onClick={() => this.moveSelectedWinnersToRound(activeRound.id)}
                      disabled={!this.state.selectedRoundId}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Move Selected</span>
                    </button>
                           </div>
                         </div>
                       )}
              {/* Winner Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeRound.winners.map((winner: Player, index: number) => (
                  <div 
                    key={winner.id} 
                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-lg ${
                      winner.selected 
                        ? 'bg-blue-50 border-blue-400 shadow-md' 
                        : 'bg-green-50 border-green-200 hover:border-green-300'
                    }`}
                    onClick={() => this.toggleWinnerSelectionForMovement(winner, activeRound.id)}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center relative">
                      <img 
                        src={winner.profilePic} 
                        alt={winner.name}
                        className="w-14 h-14 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-14 h-14 rounded-full bg-green-200 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-800">
                          {winner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-yellow-800" />
                      </div>
                      {/* Selection indicator */}
                      {winner.selected && (
                        <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h4 className={`font-semibold mb-1 ${winner.selected ? 'text-blue-900' : 'text-green-900'}`}>
                      {winner.name}
                    </h4>
                    <p className={`text-sm mb-2 ${winner.selected ? 'text-blue-700' : 'text-green-700'}`}>
                      {winner.skill}
                    </p>
                    {/* Winner from Round label */}
                    {winner.originalWinnerRoundId && (() => {
                      const winningRound = this.state.rounds.find(r => r.id === winner.originalWinnerRoundId);
                      return winningRound ? (
                        <div className={`text-xs font-medium mb-1 ${winner.selected ? 'text-blue-600' : 'text-green-600'}`}>
                          🏆 Winner from {winningRound.displayName || winningRound.name}
                        </div>
                      ) : null;
                    })()}
                    <div className={`text-xs ${winner.selected ? 'text-blue-600' : 'text-green-600'}`}>
                      Winner #{index + 1}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Click to select
                    </div>
                  </div>
                ))}
              </div>
                         </div>
                       )}
                     </div>
                   );
                      </select>
                      <button
                        onClick={() => this.moveSelectedLosersToDestination(activeRound.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Move Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeRound.losers.map((loser: Player, index: number) => (
                  <div
                    key={loser.id}
                    onClick={() => this.toggleLoserSelectionForMovement(loser, activeRound.id)}
                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-lg ${
                      loser.selected 
                        ? 'bg-blue-50 border-blue-400 shadow-md' 
                        : 'bg-red-50 border-red-200 hover:border-red-300'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center relative">
                      <img 
                        src={loser.profilePic} 
                        alt={loser.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-red-300"
                      />
                      {loser.selected && (
                        <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h4 className={`font-semibold mb-1 ${loser.selected ? 'text-blue-900' : 'text-red-900'}`}>
                      {loser.name}
                    </h4>
                    <p className={`text-sm mb-2 ${loser.selected ? 'text-blue-700' : 'text-red-700'}`}>
                      {loser.skill}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Loser #{index + 1}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Click to select
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Main Round Tab Content (existing content)
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-800">
                {activeRound.displayName || activeRound.name} Players
              </h3>
              <p className="text-sm text-blue-600">Active players and matches</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
              activeRound.players.length === 0 
                ? 'bg-gray-500 text-white' 
                : activeRound.players.length % 2 === 0 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-red-500 text-white'
            }`}>
              {activeRound.players.length} Player{activeRound.players.length !== 1 ? 's' : ''}
              {activeRound.players.length > 0 && activeRound.players.length % 2 !== 0 && (
                <span className="ml-1 text-xs">⚠️</span>
              )}
            </span>
    <div className="flex items-center space-x-2">
      {activeRound.players.filter(p => p.selected).length > 0 && (
        <>
          <select
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => this.setState({ selectedRoundId: e.target.value })}
            value={this.state.selectedRoundId || 'dashboard'}
          >
            <option value="dashboard">← Back to Tournament Dashboard</option>
            <optgroup label="Move to Other Rounds">
              {this.state.rounds
                .filter(round => {
                  // Never allow movement to the same round
                  if (round.id === activeRound.id) return false;
                  
                  // Find current round index
                  const currentRoundIndex = this.state.rounds.findIndex(r => r.id === activeRound.id);
                  const targetRoundIndex = this.state.rounds.findIndex(r => r.id === round.id);
                  
                  // Check if current round has conducted matches (this is the key requirement)
                  const currentRoundHasCompletedMatches = activeRound.matches && activeRound.matches.length > 0 && 
                    activeRound.matches.some(match => match.status === 'completed');
                  
                  // For advancement to future rounds: only allow if CURRENT round has conducted matches AND following sequential progression
                  // For backward movement: always allow
                  const isMovingBackward = targetRoundIndex < currentRoundIndex;
                  const isMovingForward = targetRoundIndex > currentRoundIndex;
                  const isImmediateNextRound = targetRoundIndex === currentRoundIndex + 1;
                  
                  if (isMovingBackward) {
                    // Backward movement: always allow
                    return true;
                  } else if (isMovingForward) {
                    // Forward movement: only allow if:
                    // 1. CURRENT round has conducted at least 1 match, AND
                    // 2. Moving to immediate next round (sequential progression)
                    return currentRoundHasCompletedMatches && isImmediateNextRound;
                  }
                  
                  return false;
                })
                .map((round) => {
                  const selectedCount = activeRound.players.filter(p => p.selected).length;
                  const currentCount = round.players.length;
                  const afterCount = currentCount + selectedCount;
                  const willBeEven = afterCount % 2 === 0;
                  
                  // Check if round is empty (no players AND no completed matches)
                  const hasCompletedMatches = round.matches && round.matches.length > 0 && 
                    round.matches.some(match => match.status === 'completed');
                  const isEmpty = round.players.length === 0 && round.winners.length === 0 && !hasCompletedMatches;
                  const isEmptyText = isEmpty ? " (Empty)" : "";
                  
                  return (
                    <option key={round.id} value={round.id}>
                      {round.displayName || round.name}{isEmptyText} ({currentCount} → {afterCount} players) {willBeEven ? '✓' : '⚠️'}
                    </option>
                  );
                })}
            </optgroup>
          </select>
              <button
            onClick={() => this.moveSelectedPlayersFromRound(activeRound.id)}
            
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
            Move Selected ({activeRound.players.filter(p => p.selected).length})
              </button>
        </>
      )}
      
      
      
      {(() => {
  // Calculate unmatched players
  const matchedPlayerIds = new Set();
  activeRound.matches.forEach(match => {
    matchedPlayerIds.add(match.player1.id);
    matchedPlayerIds.add(match.player2.id);
  });
  const unmatchedPlayers = activeRound.players.filter(p => !matchedPlayerIds.has(p.id));
  const unmatchedCount = unmatchedPlayers.length;
  
  // Determine button label and styling
  const isStartMatch = unmatchedCount === 2;
  const buttonLabel = isStartMatch ? 'Start Match' : 'Shuffle';
  // Only show button if there are at least 2 players and round is not frozen
  if (activeRound.players.length >= 2 && !activeRound.isFrozen) {
    return (
      <button
        onClick={() => this.shuffleRoundPlayers(activeRound.id)}
        className={`px-3 py-1 text-white text-sm rounded flex items-center gap-1 transition-colors ${
          isStartMatch ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isStartMatch ? (
          // Play/Start icon for Start Match (2 players)
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        ) : (
          // Shuffle/Rotate icon for Shuffle (3+ players)
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
        {buttonLabel}
        {unmatchedCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-medium">
            {unmatchedCount}
          </span>
        )}
      </button>
    );
  }
  return null;
})()}

      
      {/* Freeze Round Button - Show when all matches are completed and no unmatched players */}
      {(() => {
        // Check if round is already frozen
        if (activeRound.isFrozen) {
          return (
            <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded flex items-center gap-2 border border-gray-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Round Frozen
            </div>
          );
        }
        
        // Check conditions to show Freeze button
        const allMatchesCompleted = activeRound.matches.length > 0 && activeRound.matches.every(m => m.status === 'completed');
        const matchedPlayerIds = new Set();
        activeRound.matches.forEach(match => {
          matchedPlayerIds.add(match.player1.id);
          matchedPlayerIds.add(match.player2.id);
        });
        const unmatchedPlayers = activeRound.players.filter(player => !matchedPlayerIds.has(player.id));
        const noUnmatchedPlayers = unmatchedPlayers.length === 0;
        
        const canFreeze = allMatchesCompleted && noUnmatchedPlayers;
        
        return canFreeze ? (
          <button
            onClick={() => this.freezeRound(activeRound.id)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Freeze Round
          </button>
        ) : null;
      })()}
    </div>
            </div>
          </div>
          



          
        {/* Warning for odd number of players */}
        {activeRound.players.length > 0 && activeRound.players.length % 2 !== 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 text-sm font-medium">
                This round has {activeRound.players.length} players (odd number). Add or remove 1 player to create proper match pairings.
              </span>
            </div>
    </div>
)}

        {/* Matches or Players List */}
      {/* Matches or Players List */}
{activeRound.matches && activeRound.matches.length > 0 ? (
  /* Show Matches (regardless of players array status) */
  <div className="space-y-6">
    {/* Matches Section */}
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Matches</h4>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
          {activeRound.matches.length} matches
        </span>
      </div>
      <div className="space-y-4">
        {activeRound.matches.map((match, index) => (
          <div key={match.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Match {index + 1}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 flex-1 ${match.status === 'completed' && match.winner?.id === match.player1.id ? 'bg-green-50 border-2 border-green-300 rounded-lg p-2' : ''}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative ${match.status === 'completed' && match.winner?.id === match.player1.id ? 'bg-green-400' : 'bg-gray-300'}`}>
                  {match.player1.profilePic ? (
                    <img 
                      src={match.player1.profilePic} 
                      alt={match.player1.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-600">
                      {match.player1.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {match.status === 'completed' && match.winner?.id === match.player1.id && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${match.status === 'completed' && match.winner?.id === match.player1.id ? 'text-green-800' : 'text-gray-900'}`}>
                    {match.player1.name}
                    {match.status === 'completed' && match.winner?.id === match.player1.id && (
                      <span className="ml-2 text-green-600">🏆</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{match.player1.skill}</p>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-gray-200 rounded-full mx-4">
                <span className="text-gray-600 font-medium text-sm">VS</span>
              </div>
              
              <div className={`flex items-center space-x-3 flex-1 justify-end ${match.status === 'completed' && match.winner?.id === match.player2.id ? 'bg-green-50 border-2 border-green-300 rounded-lg p-2' : ''}`}>
                <div className="text-right">
                  <p className={`font-medium ${match.status === 'completed' && match.winner?.id === match.player2.id ? 'text-green-800' : 'text-gray-900'}`}>
                    {match.player2.name}
                    {match.status === 'completed' && match.winner?.id === match.player2.id && (
                      <span className="ml-2 text-green-600">🏆</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{match.player2.skill}</p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative ${match.status === 'completed' && match.winner?.id === match.player2.id ? 'bg-green-400' : 'bg-gray-300'}`}>
                  {match.player2.profilePic ? (
                    <img 
                      src={match.player2.profilePic} 
                      alt={match.player2.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-600">
                      {match.player2.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {match.status === 'completed' && match.winner?.id === match.player2.id && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Match Control Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center space-x-3">
              {match.status === 'pending' && (
                <>
                  <button 
                    onClick={() => this.startMatch(match.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Start Match
                  </button>
                  <button 
                    onClick={() => this.cancelMatch(match.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    Cancel Match
                  </button>
                </>
              )}
              
              {match.status === 'active' && (
                <>
                  <button 
                    onClick={() => this.closeMatch(match.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Close Match
                  </button>
                </>
              )}
              
              {match.status === 'completed' && (
                <div className="text-center space-y-2">
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    ✅ Match Completed
                  </div>
                  <button 
                    onClick={() => this.changeWinner(match.id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Change Winner
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
) : activeRound.players.length > 0 ? (
  /* Show Individual Players (when no matches exist yet) */
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-lg font-semibold text-gray-800">Players in Round</h4>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            // Select all players
            const updatedRounds = this.state.rounds.map(r => 
              r.id === activeRound.id 
                ? { ...r, players: r.players.map(p => ({ ...p, selected: true })) }
                : r
            );
            this.setState({ rounds: updatedRounds });
          }}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
        >
          Select All
        </button>
        <button
          onClick={() => {
            // Deselect all players
            const updatedRounds = this.state.rounds.map(r => 
              r.id === activeRound.id 
                ? { ...r, players: r.players.map(p => ({ ...p, selected: false })) }
                : r
            );
            this.setState({ rounds: updatedRounds });
          }}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          Deselect All
        </button>
      </div>
    </div>
    {/* Player Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {activeRound.players.map((player) => (
        <div
          key={player.id}
          onClick={() => {
            if (!activeRound.isFrozen) {
              const roundIndex = this.state.rounds.findIndex(r => r.id === activeRound.id);
              if (roundIndex !== -1) {
                this.togglePlayerSelection(player, roundIndex);
              }
            }
          }}
          className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${
            activeRound.isFrozen 
              ? 'cursor-not-allowed opacity-60' 
              : player.selected 
                ? 'bg-blue-50 border-blue-300 shadow-md cursor-pointer' 
                : 'hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
          }`}
        >
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
            player.selected 
              ? 'bg-blue-500 border-blue-500' 
              : 'border-gray-300 hover:border-blue-400'
          }`}>
            {player.selected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {player.profilePic ? (
              <img 
                src={player.profilePic} 
                alt={player.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {player.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{player.name}</p>
            <p className="text-xs text-gray-500">{player.skill}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  /* No players and no matches */
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No players yet</h3>
    <p className="text-gray-500 mb-4">Add players to this round to get started</p>
    {activeRound.id === this.state.rounds[0]?.id ? (
      <p className="text-gray-400">Players will be automatically added here when tournament starts</p>
    ) : (
      <p className="text-gray-400">Select players from previous rounds to move them here</p>
    )}
  </div>
)}

      </div>
    );
  })()}
      </div>






  </div>
)}




      </div>
    );
  }
}