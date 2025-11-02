import React from 'react';
import { BaseComponentComplete } from '../base/BaseComponent';
import { Calendar, Clock, Users, Settings, Trophy, Plus, Save, X, Check, AlertCircle, MapPin, User, Target, ChevronRight, Bell } from 'lucide-react';
import { matchesApiService, Match as ApiMatch } from '../../services/matchesApi';

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
  roundsWon?: string[];
  hasPlayed?: boolean;
  copiedToRounds?: string[]; // Track which rounds this winner has been copied to
  originalRound?: string; // Track the original round this player came from
}

interface TournamentRound {
  id: string;
  name: string;
  displayName?: string; // Optional display name for frontend (e.g., "Semi Final (Round 5)")
  players: Player[];
  matches: TournamentMatch[];
  status: 'active' | 'completed' | 'pending';
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
  activeRoundSubTab: { [roundId: string]: 'matches' | 'waiting' | 'winners' }; // Active sub-tab for each round
  showRoundNameModal: boolean; // Show round name input modal
  newRoundDisplayName: string; // Display name for new round being created
  // API data
  scheduledMatches: ApiMatch[];
  previousMatches: ApiMatch[];
  loading: boolean;
  error: string | null;
  // Tournament API data
  apiTournaments: Array<{
    tournamentId: string;
    tournamentName: string;
  }>;
  // Tournament detail modal
  showTournamentModal: boolean;
  selectedTournament: any | null;
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
      showRoundNameModal: false,
      newRoundDisplayName: '',
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
      selectedPlayers: [] // This stores players selected for the next round
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
    // Create round directly without modal
    this.handleCreateRound();
  };

  private handleCreateRound = (): void => {
    if (!this.state.currentGameMatch) return;
    
    // Show modal for round name input
    this.setState({
      showRoundNameModal: true,
      newRoundDisplayName: ''
    });
  };

  private handleConfirmRoundCreation = (): void => {
    if (!this.state.currentGameMatch) return;
    
    const currentRounds = this.state.currentGameMatch.rounds || [];
    const roundNumber = currentRounds.length + 1;
    const finalDisplayName = this.state.newRoundDisplayName.trim() || null;
    
    const newRound: TournamentRound = {
      id: `round-${roundNumber}`,
      name: `Round ${roundNumber}`,
      displayName: finalDisplayName,
      players: [],
      matches: [],
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
      activeRoundTab: activeRoundTab,
      showRoundNameModal: false,
      newRoundDisplayName: ''
    });

    const roundTitle = finalDisplayName ? `${finalDisplayName} (Round ${roundNumber})` : `Round ${roundNumber}`;
    console.log('🎯 Added new round:', roundTitle);
  };

  // Get available round titles (excludes already used ones)
  private getAvailableRoundTitles = (): { normal: string[], finals: string[] } => {
    const usedTitles = this.state.currentGameMatch?.rounds?.map(r => r.displayName).filter(Boolean) || [];
    
    const normalRounds = [
      'First Round', 'Second Round', 'Third Round', 'Fourth Round', 'Fifth Round',
      'Sixth Round', 'Seventh Round', 'Eighth Round', 'Ninth Round', 'Tenth Round'
    ];
    
    const finalRounds = [
      'Quarter Final', 'Semi Final', 'Final', 'Championship Round', 'Grand Final'
    ];
    
    return {
      normal: normalRounds.filter(title => !usedTitles.includes(title)),
      finals: finalRounds.filter(title => !usedTitles.includes(title))
    };
  };

  // Get unmatched players for a round
  private getUnmatchedPlayers = (round: TournamentRound): Player[] => {
    const matchedPlayerIds = new Set();
    round.matches.forEach(match => {
      matchedPlayerIds.add(match.player1.id);
      matchedPlayerIds.add(match.player2.id);
    });
    
    return round.players.filter(p => 
      p.status === 'in_round' && !matchedPlayerIds.has(p.id)
    );
  };

  // Get winners count for tab title
  private getWinnersCount = (round: TournamentRound): number => {
    const simpleWinners = round.players?.filter(p => p.status === 'winner') || [];
    
    console.log('🏷️ SIMPLIFIED Tab Title Count for', round.name, ':', {
      simpleWinners: simpleWinners.length,
      simpleWinnerNames: simpleWinners.map(p => p.name),
      allPlayers: round.players?.length || 0
    });
    
    return simpleWinners.length;
  };

  // Check if shuffle button should be shown
  private shouldShowShuffleButton = (round: TournamentRound): boolean => {
    const unmatchedPlayers = round.players.filter(p => p.status === 'in_round' && !round.matches.some(m => m.player1.id === p.id || m.player2.id === p.id));
    const hasUnmatchedPlayers = unmatchedPlayers.length > 0;
    const roundIsPending = round.status === 'pending';
    const roundIsActive = round.status === 'active';
    const roundIsCompleted = round.status === 'completed';
    const hasPendingMatches = round.matches.some(m => m.status === 'pending' || m.status === 'active');
    
    // Always show shuffle buttons - never hide them
    const finalShouldShow = true;
    
    // Debug logging
    console.log('🔍 Shuffle Button Debug (Always Visible):', {
      roundId: round.id,
      roundStatus: round.status,
      totalPlayers: round.players.length,
      totalMatches: round.matches.length,
      completedMatches: round.matches.filter(m => m.status === 'completed').length,
      pendingMatches: round.matches.filter(m => m.status === 'pending' || m.status === 'active').length,
      unmatchedPlayers: unmatchedPlayers.map(p => ({ name: p.name, status: p.status })),
      hasUnmatchedPlayers,
      roundIsPending,
      roundIsActive,
      roundIsCompleted,
      hasPendingMatches,
      finalShouldShow: 'ALWAYS TRUE'
    });
    
    return finalShouldShow;
  };

  // Render unmatched players section
  private renderUnmatchedPlayersSection = (round: TournamentRound): JSX.Element | null => {
    const unmatchedPlayers = this.getUnmatchedPlayers(round);
    
    // Debug logging
    console.log('🔍 Unmatched Players Debug:', {
      roundId: round.id,
      roundPlayers: round.players.map(p => ({ name: p.name, status: p.status, id: p.id })),
      matches: round.matches.map(m => ({ id: m.id, player1: m.player1.name, player2: m.player2.name })),
      unmatchedPlayers: unmatchedPlayers.map(p => ({ name: p.name, status: p.status, id: p.id }))
    });
    
    if (unmatchedPlayers.length === 0) return null;
    
    return (
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Unmatched Players ({unmatchedPlayers.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {unmatchedPlayers.map((player: Player, index: number) => (
            <div 
              key={player.id} 
              className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200 relative cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => this.handleTogglePlayerSelection(player.id)}
            >
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Unmatched"></div>
              </div>
              <div className="text-center">
                <img
                  src={player.profilePic}
                  alt={player.name}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-yellow-400"
                />
                <div className="font-medium text-gray-900">{player.name}</div>
                <div className="text-xs text-gray-600 mb-2">{player.email}</div>
                <div className="flex justify-center gap-1 mb-2">
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                    {player.skill}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Unmatched
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={player.selected}
                  onChange={() => this.handleTogglePlayerSelection(player.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
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
    );
  };

  private handleCancelRoundCreation = (): void => {
    this.setState({
      showRoundNameModal: false,
      newRoundDisplayName: ''
    });
  };


  // Helper method to get round display title
  private getRoundDisplayTitle = (round: TournamentRound): string => {
    if (round.displayName) {
      return `${round.displayName} (${round.name})`;
    }
    return round.name;
  };

  // Helper method to check if all matches in a round are completed
  private areAllMatchesCompleted = (round: TournamentRound): boolean => {
    if (round.matches.length === 0) return false;
    return round.matches.every(match => match.status === 'completed');
  };

  private handleMoveSelectedToRound = (roundId: string): void => {
    if (!this.state.currentGameMatch || !this.state.currentGameMatch.allPlayers) return;
    
    const selectedPlayerIds = this.state.currentGameMatch.allPlayers
      .filter((player: Player) => player.selected)
      .map((player: Player) => player.id);

    if (selectedPlayerIds.length === 0) {
      console.log('No players selected to move to round');
      return;
    }

    const selectedPlayers = this.state.currentGameMatch.allPlayers
      .filter((player: Player) => selectedPlayerIds.includes(player.id));

    // Create updated players with correct status
    const updatedSelectedPlayers = selectedPlayers.map(player => ({
      ...player,
      status: 'in_round' as const,
      selected: false,
      currentRound: roundId
    }));

    // Update rounds to include the selected players
    const updatedRounds = this.state.currentGameMatch.rounds?.map((round: TournamentRound) => 
      round.id === roundId 
        ? {
            ...round,
            players: [...round.players, ...updatedSelectedPlayers]
          }
        : round
    ) || [];

    // Update players status to 'in_round'
    const updatedPlayers = this.state.currentGameMatch.allPlayers.map((player: Player) => 
      selectedPlayerIds.includes(player.id) 
        ? { ...player, status: 'in_round' as const, selected: false, currentRound: roundId }
        : player
    );

    this.setState({
      currentGameMatch: {
        ...this.state.currentGameMatch,
        allPlayers: updatedPlayers,
        rounds: updatedRounds
      },
      activeRoundTab: roundId,
      activeRoundSubTab: {
        ...this.state.activeRoundSubTab,
        [roundId]: 'matches'
      }
    });

    const roundName = updatedRounds.find(r => r.id === roundId)?.name || 'Unknown Round';
    console.log('🎯 Moved', selectedPlayerIds.length, 'players to', roundName);
    console.log('🎯 Round players count:', updatedRounds.find(r => r.id === roundId)?.players.length);
    console.log('🎯 Players in round:', updatedRounds.find(r => r.id === roundId)?.players.map(p => ({ name: p.name, status: p.status })));
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

  private handleTournamentClick = async (tournamentId: string, tournamentName: string): Promise<void> => {
    console.log('🏆 Tournament clicked:', { tournamentId, tournamentName });
    console.log('🏆 Setting modal state to true...');
    console.log('🏆 Function handleTournamentClick is being executed');
    
    // Show modal first with loading state
    this.setState({
      showTournamentModal: true,
      selectedTournament: {
        id: tournamentId,
        name: '9-ball',
        status: 'scheduled',
        type: 'single_elimination',
        gameType: '9-ball',
        startDate: new Date('2025-10-15T14:00:00').toISOString(),
        endDate: new Date('2025-10-15T22:00:00').toISOString(),
        venue: 'Delhi Sports Complex - Main Branch',
        address: 'Delhi Sports Complex - Main Branch',
        entryFee: 50,
        maxParticipants: 50,
        currentParticipants: 0,
        description: 'Exciting 9-ball tournament with great prizes!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registeredPlayers: [],
        loading: true
      }
    });

    try {
      // Fetch real player registrations from API
      console.log('👥 Fetching customer registrations...');
      console.log('👥 Tournament ID:', tournamentId);
      console.log('👥 Tournament Name:', tournamentName);
      const organizerId = 'eeda070d-e3df-4701-89fc-cbfd1b31d14b';
      const venueId = 'c579e215-d6a6-4afe-8696-2d6a36e44d1a';
      
      console.log('👥 API Parameters:', { organizerId, tournamentId, venueId });
      console.log('👥 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1');
      console.log('👥 About to call matchesApiService.getCustomerRegistrations...');
      
      // Test if the API service is available
      console.log('👥 matchesApiService:', matchesApiService);
      console.log('👥 getCustomerRegistrations method:', matchesApiService.getCustomerRegistrations);
      
      const registrationsResponse = await matchesApiService.getCustomerRegistrations(
        organizerId,
        tournamentId,
        venueId
      );
      
      console.log('👥 API call completed, response received');

      console.log('👥 Customer registrations response:', registrationsResponse);
      console.log('👥 Raw API response data:', JSON.stringify(registrationsResponse, null, 2));
      console.log('👥 Response success:', registrationsResponse.success);
      console.log('👥 Response data:', registrationsResponse.data);
      if (registrationsResponse.data) {
        console.log('👥 Data registrations:', registrationsResponse.data.registrations);
        console.log('👥 Data customers:', registrationsResponse.data.customers);
        console.log('👥 Data keys:', Object.keys(registrationsResponse.data));
      }

      let registeredPlayers = [];
      let currentParticipants = 0;

      // Handle different possible API response structures
      let registrations = [];
      if (registrationsResponse.success) {
        if (registrationsResponse.data && registrationsResponse.data.registrations) {
          registrations = registrationsResponse.data.registrations;
        } else if (registrationsResponse.data && registrationsResponse.data.customers) {
          registrations = registrationsResponse.data.customers;
        } else if (registrationsResponse.data && registrationsResponse.data.data) {
          registrations = registrationsResponse.data.data;
        } else if (registrationsResponse.data && Array.isArray(registrationsResponse.data)) {
          registrations = registrationsResponse.data;
        } else if (Array.isArray(registrationsResponse.registrations)) {
          registrations = registrationsResponse.registrations;
        } else if (Array.isArray(registrationsResponse.customers)) {
          registrations = registrationsResponse.customers;
        } else if (Array.isArray(registrationsResponse)) {
          registrations = registrationsResponse;
        }
      }

      if (registrations && registrations.length > 0) {
        console.log('👥 Processing', registrations.length, 'registrations');
        registeredPlayers = registrations.map((registration: any, index: number) => {
          console.log('👤 Processing registration:', registration);
          
          const player = {
            id: index + 1,
            name: this.extractPlayerName(registration),
            email: this.extractPlayerEmail(registration),
            skillLevel: this.getSkillLevelFromRegistration(registration),
            skillColor: this.getSkillColor(this.getSkillLevelFromRegistration(registration)),
            registrationDate: this.formatRegistrationDate(registration.createdAt || registration.registrationDate || registration.date),
            profilePic: registration.profilePic || registration.avatar || registration.image || `https://images.unsplash.com/photo-${1507003211169 + index}?w=150&h=150&fit=crop&crop=face`,
            // Store original registration data for debugging
            originalData: registration
          };
          console.log('👤 Processed player:', player);
          return player;
        });
        currentParticipants = registeredPlayers.length;
        console.log('👥 Total participants processed:', currentParticipants);
      } else {
        // Fallback to dummy data if API fails
        console.log('⚠️ API failed, using dummy data');
        registeredPlayers = this.generateDummyPlayers();
        currentParticipants = registeredPlayers.length;
      }

      // Update tournament data with real player data
      const tournamentData = {
        id: tournamentId,
        name: '9-ball',
        status: 'scheduled',
        type: 'single_elimination',
        gameType: '9-ball',
        startDate: new Date('2025-10-15T14:00:00').toISOString(),
        endDate: new Date('2025-10-15T22:00:00').toISOString(),
        venue: 'Delhi Sports Complex - Main Branch',
        address: 'Delhi Sports Complex - Main Branch',
        entryFee: 50,
        maxParticipants: 50,
        currentParticipants: currentParticipants,
        description: 'Exciting 9-ball tournament with great prizes!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registeredPlayers: registeredPlayers,
        loading: false
      };
      
      console.log('🏆 Tournament data updated with real players:', tournamentData);
      
      this.setState({
        selectedTournament: tournamentData
      }, () => {
        console.log('🏆 Modal state updated with real data:', this.state.showTournamentModal);
        console.log('🏆 Selected tournament with players:', this.state.selectedTournament);
      });

    } catch (error) {
      console.error('❌ Error fetching player registrations:', error);
      
      // Fallback to dummy data on error
      const tournamentData = {
        id: tournamentId,
        name: '9-ball',
        status: 'scheduled',
        type: 'single_elimination',
        gameType: '9-ball',
        startDate: new Date('2025-10-15T14:00:00').toISOString(),
        endDate: new Date('2025-10-15T22:00:00').toISOString(),
        venue: 'Delhi Sports Complex - Main Branch',
        address: 'Delhi Sports Complex - Main Branch',
        entryFee: 50,
        maxParticipants: 50,
        currentParticipants: 13,
        description: 'Exciting 9-ball tournament with great prizes!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registeredPlayers: this.generateDummyPlayers(),
        loading: false
      };

      this.setState({
        selectedTournament: tournamentData
      });
    }
  };

  private handleScheduledMatchesClick = async (): Promise<void> => {
    console.log('🏆 Scheduled Tournaments tab clicked - calling tournament API');
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
    console.log('📍 API URL:', `${apiBaseUrl}/tournaments?organizerId=eeda070d-e3df-4701-89fc-cbfd1b31d14b`);
    
    try {
      // Use the organizer ID from the request
      const organizerId = 'eeda070d-e3df-4701-89fc-cbfd1b31d14b';
      
      console.log('🚀 Making API call...');
      const response = await matchesApiService.getTournamentsByOrganizerId(organizerId);
      
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
          
          return {
            tournamentId: tournament.id || tournament.tournamentId || 'unknown-id',
            tournamentName: tournament.name || tournament.tournamentName || tournament.title || 'Unnamed Tournament'
          };
        });
        
        console.log('🎯 Extracted tournaments:', apiTournaments);
        
        // Update state with extracted tournament data
        this.setState({ 
          activeTab: 'scheduled',
          apiTournaments: apiTournaments
        });
        
      } else {
        console.warn('⚠️ API returned success: false with message:', response.message);
        this.setState({ 
          activeTab: 'scheduled',
          apiTournaments: []
        });
      }
      
    } catch (error) {
      console.error('❌ Error calling tournament API:', error);
      this.setState({ 
        activeTab: 'scheduled',
        error: error instanceof Error ? error.message : 'Failed to fetch tournaments',
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
    return registration.customerName || 
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
           registration.user_name ||
           'Unknown Player';
  };

  private extractPlayerEmail = (registration: any): string => {
    // Try different possible field names for email
    return registration.customerEmail || 
           registration.customer_email ||
           registration.email || 
           registration.emailAddress ||
           registration.email_address ||
           registration.contactEmail ||
           registration.contact_email ||
           registration.userEmail ||
           registration.user_email ||
           'unknown@email.com';
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
    
    const organizerId = 'eeda070d-e3df-4701-89fc-cbfd1b31d14b';
    const tournamentId = 'c5a59aa8-631f-4192-bb04-eddf9619e667';
    const venueId = 'c579e215-d6a6-4afe-8696-2d6a36e44d1a';
    
    console.log('🧪 API Parameters:', { organizerId, tournamentId, venueId });
    
    try {
      const response = await matchesApiService.getCustomerRegistrations(
        organizerId,
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

  private handleNextGameOrganization = (): void => {
    if (!this.state.selectedTournament) {
      console.log('No tournament selected');
      return;
    }

    console.log('🎮 Starting Tournament Dashboard for:', this.state.selectedTournament.name);

    // Create tournament data with all players available for selection
    const tournamentData: TournamentDashboard = {
      id: this.state.selectedTournament.id,
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
      tournamentStarted: true
    };

    // Set the current game match and show tournament dashboard
    this.setState({
      currentGameMatch: tournamentData,
      showGameOrganization: true,
      showTournamentModal: false,
      selectedTournament: null
    });

    console.log('🎮 Tournament Dashboard setup complete with', tournamentData.allPlayers.length, 'players');
  };


  private handleStartTournament = (): void => {
    if (!this.state.shuffledMatches || this.state.shuffledMatches.length === 0) {
      console.log('No shuffled matches found');
      return;
    }

    // Navigate to tournament running page with shuffled matches data
    const tournamentData = {
      matchId: this.state.currentGameMatch?.id,
      matchName: this.state.currentGameMatch?.name,
      shuffledMatches: this.state.shuffledMatches,
      players: this.state.currentGameMatch?.registeredPlayers || []
    };

    // Store tournament data in sessionStorage for the tournament running page
    sessionStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    
    // Navigate to tournament running page
    window.location.href = '/tournament-running';
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


  private initializeFirstRound = (players: any[]): TournamentRound => {
    return {
      id: `round_1`,
      name: `Round 1`,
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
      status: 'active' as const
    };
  };



  private renderRoundsAndPlayers = (): JSX.Element => {
    if (!this.state.rounds || this.state.rounds.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No rounds created yet. Start by creating your first round!</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        {this.state.rounds.map((round, roundIndex) => (
          <div key={round.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {round.name}
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {round.players.length} players
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {round.players.map((player, playerIndex) => (
                <div key={player.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.skill}</p>
                  </div>
                  <button
                    onClick={() => this.selectPlayerForNextRound(player, roundIndex)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      player.selected 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {player.selected ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
            
            {round.players.filter(p => p.selected).length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {round.players.filter(p => p.selected).length} player(s) selected for next round
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };


  private selectPlayerForNextRound = (player: Player, roundIndex: number): void => {
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



      <div>
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
  {/* Progress Indicator for Game Organization */}
  {this.state.activeTab === 'scheduled' && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      !this.state.showGameOrganization 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        !this.state.showGameOrganization ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium">Step 1: Scheduled Matches</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      this.state.showGameOrganization 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        this.state.showGameOrganization ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium">Step 2: Game Organization</span>
                    </div>
                  </div>
                  {this.state.showGameOrganization && this.state.currentGameMatch && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Current Match</div>
                      <div className="font-semibold text-gray-900">{this.state.currentGameMatch.name}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


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



          {/* ===== STEP 1: SCHEDULED TOURNAMENTS TAB ===== */}
          {/* This section displays when user clicks on "Scheduled Tournaments" tab */}
          {/* Shows tournaments fetched from API and existing scheduled matches */}
          {this.state.activeTab === 'scheduled' && !this.state.showGameOrganization && (
            <div className="space-y-6">
              {/* Main container for scheduled tournaments */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                {/* Header section with title and controls */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Scheduled Tournaments</h2>
                  <div className="flex items-center gap-4">
                    {/* Test API button for debugging customer registrations */}
                    <button
                      onClick={() => this.testCustomerRegistrationsAPI()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Test API
                    </button>
                    {/* Step indicator showing this is Step 1 of 2 */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Step 1 of 2
                    </div>
                  </div>
                </div>
                
                {/* Tournament cards container */}
                <div className="space-y-4">
                  {/* ===== API TOURNAMENTS SECTION ===== */}
                  {/* Display first 3 tournaments fetched from backend API */}
                  {/* Each tournament card is clickable and shows tournament details */}
                  {this.state.apiTournaments.slice(0, 3).map((tournament, index) => {
                    console.log('🎨 Rendering tournament:', tournament);
                    console.log('🎨 Tournament name being displayed:', tournament.tournamentName);
                    console.log('🎨 Tournament ID:', tournament.tournamentId);
                    
                    return (
                    // ===== INDIVIDUAL TOURNAMENT CARD =====
                    // Clickable tournament card that opens tournament modal
                    <div key={`api-${tournament.tournamentId}`} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => this.handleTournamentClick(tournament.tournamentId, tournament.tournamentName)}>
                      {/* Tournament header with name, status, and details */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Tournament name and status badge */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{tournament.tournamentName}</h3>
                            <span className="px-3 py-1 text-sm font-medium rounded-full border border-orange-200 bg-orange-50 text-orange-700">
                              Scheduled
                            </span>
                          </div>
                          {/* Tournament details grid (game type, date, time, players) */}
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
                        {/* Entry fee display */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">$50</div>
                          <div className="text-sm text-gray-500">Entry Fee</div>
                        </div>
                      </div>

                      {/* ===== TOURNAMENT ACTION BUTTONS ===== */}
                      {/* Action buttons for tournament management */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        {/* Edit tournament button */}
                        <button
                          onClick={() => this.handleEditMatch(tournament.tournamentId)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Settings className="w-4 h-4" />
                          Edit Match
                        </button>
                        {/* Send notification button */}
                        <button
                          onClick={() => this.handleSendNotification(tournament.tournamentId, tournament.tournamentName)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          <Bell className="w-4 h-4" />
                          Send Notification
                        </button>
                        {/* Show notified users button */}
                        <button
                          onClick={() => this.handleShowNotifiedUsers(tournament.tournamentId, tournament.tournamentName)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                        >
                          <Bell className="w-4 h-4" />
                          Notified Users (0)
                        </button>
                      </div>

                      {/* ===== REGISTERED PLAYERS SECTION ===== */}
                      {/* Shows registered players (empty for API tournaments) */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">Registered Players (0)</h4>
                        {/* Empty state for no registered players */}
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No players registered yet</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}

                  {/* ===== EXISTING SCHEDULED MATCHES SECTION ===== */}
                  {/* Display existing scheduled matches from local state */}
                  {/* These are different from API tournaments - they're locally created matches */}
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

                      {/* Selected Players Count */}
                      <div className="text-center text-sm text-gray-600 mb-3">
                        {this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0} players selected
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        {/* Move to Round */}
                        {(this.state.currentGameMatch.rounds?.length || 0) > 0 && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Move to Round
                            </label>
                            <select 
                              onChange={(e) => {
                                if (e.target.value) {
                                  this.handleMoveSelectedToRound(e.target.value);
                                  e.target.value = ''; // Reset selection
                                }
                              }}
                              disabled={(this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0) === 0}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select Round...</option>
                              {this.state.currentGameMatch.rounds?.map((round: TournamentRound) => (
                                <option key={round.id} value={round.id}>
                                  {this.getRoundDisplayTitle(round)} ({round.players.length} players)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <button
                          onClick={this.handleMoveSelectedToLobby}
                          disabled={(this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0) === 0}
                          className="w-full bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Move to Lobby
                        </button>
                        <button
                          onClick={this.handleShuffleSelected}
                          disabled={(this.state.currentGameMatch.allPlayers?.filter((p: Player) => p.selected).length || 0) < 2}
                          className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Shuffle Selected
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {this.renderRoundsAndPlayers()}

            {/* Rounds Section with Horizontal Tabs */}
            {(this.state.currentGameMatch.rounds?.length || 0) > 0 && (
            <div className="space-y-6">
                 {/* Round Tabs Navigation */}
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">Tournament Rounds</h3>
                    <div className="flex space-x-2 overflow-x-auto">
                      {this.state.currentGameMatch.rounds?.map((round: TournamentRound, index: number) => (
                        <button
                          key={round.id}
                          onClick={() => this.setState({ activeRoundTab: round.id })}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            this.state.activeRoundTab === round.id
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{this.getRoundDisplayTitle(round)}</div>
                            <div className="text-xs opacity-75">{round.players.length} players</div>
                          </div>
                        </button>
                      ))}
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
                            <h4 className="text-xl font-bold text-gray-900">{this.getRoundDisplayTitle(round)}</h4>
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
                                Winners ({this.getWinnersCount(round)})
                              </button>
                            </div>
							




            {/* Sub-Tab Content */}
            <div className="p-6">
              {/* Matches Tab */}
              {(this.state.activeRoundSubTab[round.id] || 'matches') === 'matches' && (
                <div>
                  {/* Match Control Buttons */}
                  <div className="flex gap-3 mb-6">
                                    {/* Shuffle Players Button - Always show, never hide */}
                                    {(() => {
                                      const unmatchedPlayers = round.players.filter(p => p.status === 'in_round' && !round.matches.some(m => m.player1.id === p.id || m.player2.id === p.id));
                                      const hasUnmatchedPlayers = unmatchedPlayers.length > 0;
                                      const roundIsPending = round.status === 'pending';
                                      const roundIsActive = round.status === 'active';
                                      const roundIsCompleted = round.status === 'completed';
                                      const hasPendingMatches = round.matches.some(m => m.status === 'pending' || m.status === 'active');
                                      
                                      // Always show shuffle buttons - never hide them
                                      const finalShouldShow = true;
                                      
                                      // Debug logging
                                      console.log('🔍 Shuffle Button Debug (Always Visible):', {
                                        roundId: round.id,
                                        roundStatus: round.status,
                                        totalPlayers: round.players.length,
                                        totalMatches: round.matches.length,
                                        completedMatches: round.matches.filter(m => m.status === 'completed').length,
                                        pendingMatches: round.matches.filter(m => m.status === 'pending' || m.status === 'active').length,
                                        unmatchedPlayers: unmatchedPlayers.map(p => ({ name: p.name, status: p.status })),
                                        hasUnmatchedPlayers,
                                        roundIsPending,
                                        roundIsActive,
                                        roundIsCompleted,
                                        hasPendingMatches,
                                        finalShouldShow: 'ALWAYS TRUE'
                                      });
                                      
                                      return finalShouldShow;
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
                                    
                                    {/* Reshuffle All Players Button - Always show, never hide */}
                                    {(() => {
                                      const unmatchedPlayers = round.players.filter(p => p.status === 'in_round' && !round.matches.some(m => m.player1.id === p.id || m.player2.id === p.id));
                                      const hasUnmatchedPlayers = unmatchedPlayers.length > 0;
                                      const roundIsPending = round.status === 'pending';
                                      const roundIsActive = round.status === 'active';
                                      const roundIsCompleted = round.status === 'completed';
                                      const hasPendingMatches = round.matches.some(m => m.status === 'pending' || m.status === 'active');
                                      
                                      // Always show reshuffle buttons - never hide them
                                      const finalShouldShow = true;
                                      
                                      console.log('🔍 Reshuffle Button Debug (Always Visible):', {
                                        roundId: round.id,
                                        roundStatus: round.status,
                                        hasUnmatchedPlayers,
                                        roundIsPending,
                                        roundIsActive,
                                        roundIsCompleted,
                                        hasPendingMatches,
                                        finalShouldShow: 'ALWAYS TRUE'
                                      });
                                      
                                      return finalShouldShow;
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

                                    {/* Start Round / Close Round Button */}
                                    {round.status === 'pending' ? (
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
                                    ) : round.status === 'active' ? (
                                      <button
                                        onClick={() => {
                                          // Close round - mark round as completed
                                          const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                            r.id === round.id ? { ...r, status: 'completed' as const } : r
                                          );
                                          
                                          this.setState({
                                            currentGameMatch: {
                                              ...this.state.currentGameMatch!,
                                              rounds: updatedRounds
                                            }
                                          });
                                          
                                          console.log('🏁 Round closed:', round.name);
                                        }}
                                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Close Round
                                      </button>
                                    ) : null}
                                  </div>






                  {round.matches && round.matches.length > 0 ? (
                    <div>
                      {/* Matches List */}
                      <div className="space-y-4">
                        {round.matches.map((match: TournamentMatch, index: number) => {
                          console.log('🎯 Rendering match:', match.id, 'status:', match.status, 'index:', index);
                          return (
                            <div key={match.id} className={`rounded-xl shadow-lg p-6 ${
                              match.status === 'active' 
                                ? 'bg-red-50 border-2 border-red-300' 
                                : match.status === 'completed'
                                ? 'bg-green-50 border-2 border-green-300'
                                : 'bg-white border border-gray-200'
                            }`}>
                              
                              {/* 11111111 */}
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
                              
                               {/* Match Action Buttons - Show immediately when matches are created */}
                               {match.status === 'pending' && (
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
                                              console.log('🎮 Starting match:', match.id, 'in round:', round.id);
                                              console.log('🎮 Match details:', { player1: match.player1.name, player2: match.player2.name });
                                              
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
                                              
                                              console.log('🎮 Match started successfully:', match.id);
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
                                            console.log('🏁 Closing match:', match.id, 'in round:', round.id);
                                            console.log('🏁 Match details:', { player1: match.player1.name, player2: match.player2.name });
                                            
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
                                                  status: 'winner' as const,
                                                  currentRound: round.id // Ensure current round is set
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
                                            
                                            // Update round players with winner status - handle both original and copied players
                                            const updatedRoundPlayers = round.players.map(p => {
                                              if (p.id === winner.id) {
                                                return { 
                                                  ...p, 
                                                  status: 'winner' as const,
                                                  matchesPlayed: (p.matchesPlayed || 0) + 1,
                                                  roundsWon: [...(p.roundsWon || []), round.name],
                                                  hasPlayed: true,
                                                  currentRound: round.id
                                                };
                                              } else if (p.id === loser.id) {
                                                return { 
                                                  ...p, 
                                                  status: 'eliminated' as const,
                                                  matchesPlayed: (p.matchesPlayed || 0) + 1,
                                                  hasPlayed: true
                                                };
                                              }
                                              return p;
                                            });
                                            
                                            // For copied winners, we need to ensure they exist in the round's players array
                                            // If the winner is not in the round's players array, add them
                                            const winnerExistsInRound = updatedRoundPlayers.some(p => p.id === winner.id);
                                            if (!winnerExistsInRound) {
                                              const winnerFromAllPlayers = updatedPlayers.find(p => p.id === winner.id);
                                              if (winnerFromAllPlayers) {
                                                updatedRoundPlayers.push(winnerFromAllPlayers);
                                              }
                                            }
                                            
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
                                            }, () => {
                                              // Force re-render after state update
                                              console.log('🔄 State updated, forcing re-render');
                                              this.forceUpdate();
                                            });
                                            
                                            // Debug logging
                                            console.log('🏆 Match completed:', {
                                              winner: winner.name,
                                              loser: loser.name,
                                              round: round.name,
                                              roundId: round.id,
                                              winnerExistsInRound,
                                              updatedRoundPlayersCount: updatedRoundPlayers.length,
                                              winnersInRound: updatedRoundPlayers.filter(p => p.status === 'winner').length,
                                              winnerRoundsWon: updatedPlayers.find(p => p.id === winner.id)?.roundsWon
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
								  




                    {/* match.status === 'completed' */}
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






                              




                              {/* Completed Match Details */}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Unmatched Players Section */}
                      {this.renderUnmatchedPlayersSection(round)}
                    </div>
                  ) : (
                    round.players.length > 0 ? (
                      <div>
                       <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="text-lg font-semibold text-gray-900">Players in Round ({round.players.length})</h4>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => {
                                                // Select all players in this round
                                                const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                  r.id === round.id 
                                                    ? { ...r, players: r.players.map(p => ({ ...p, selected: true })) }
                                                    : r
                                                );
                                                const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                  round.players.some(rp => rp.id === p.id) ? { ...p, selected: true } : p
                                                );
                                                this.setState({
                                                  currentGameMatch: {
                                                    ...this.state.currentGameMatch!,
                                                    allPlayers: updatedPlayers,
                                                    rounds: updatedRounds
                                                  }
                                                });
                                              }}
                                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                            >
                                              Select All
                                            </button>
                                            <button
                                              onClick={() => {
                                                // Deselect all players in this round
                                                const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                  r.id === round.id 
                                                    ? { ...r, players: r.players.map(p => ({ ...p, selected: false })) }
                                                    : r
                                                );
                                                const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                  round.players.some(rp => rp.id === p.id) ? { ...p, selected: false } : p
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
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                          <p className="text-gray-600 text-sm">Select players you want to exclude from shuffling</p>
                                          {round.players.filter(p => p.selected).length > 0 && (
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => {
                                                  // Move selected players back to available
                                                  const selectedPlayerIds = round.players.filter(p => p.selected).map(p => p.id);
                                                  
                                                  // Remove selected players from round
                                                  const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                    r.id === round.id 
                                                      ? { ...r, players: r.players.filter(p => !p.selected) }
                                                      : r
                                                  );
                                                  
                                                  // Update players status back to available
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
                                                  
                                                  console.log('🔄 Moved', selectedPlayerIds.length, 'players back to available');
                                                }}
                                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center gap-2"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                                </svg>
                                                Back to Available ({round.players.filter(p => p.selected).length})
                                              </button>
                                              
                                              <button
                                                onClick={() => {
                                                  // Move selected players to waiting area
                                                  const selectedPlayerIds = round.players.filter(p => p.selected).map(p => p.id);
                                                  
                                                  // Update selected players status to waiting
                                                  const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                    r.id === round.id 
                                                      ? { ...r, players: r.players.map(p => 
                                                          p.selected 
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
                                                  
                                                  console.log('⏳ Moved', selectedPlayerIds.length, 'players to waiting area');
                                                }}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center gap-2"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Move to Waiting Area ({round.players.filter(p => p.selected).length})
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>




          {/* Original Players Display (when no sub-tabs) */}
          {this.state.rounds.map((round, roundIndex) => (
  this.state.activeRoundTab !== round.id && (round.players.length > 0 ? (
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {round.players.map((player: Player, index: number) => (
                                                    <div 
                                                      key={player.id} 
                                                      className={`bg-blue-50 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300 hover:shadow-md ${
                                                        player.selected ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
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
                                                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
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
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
                                                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                          Player #{index + 1}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
          </div>
          ):(
          <div className="text-center py-12">
                                  <div className="text-gray-500 text-lg mb-2">No players in this round yet</div>
                                  <div className="text-gray-400 text-sm">Select players from the available list and move them to this round</div>
                                </div>
          ))))}








                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        
                                      </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-2">No players in this round yet</div>
                        <div className="text-gray-400 text-sm">Select players from the available list and move them to this round</div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
))}






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
                                                {this.getRoundDisplayTitle(r)} ({r.players.length} players)
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
                                      {(() => {
                                        // SIMPLIFIED: Just count all players with winner status in this round
                                        const simpleWinners = round.players?.filter(p => p.status === 'winner') || [];
                                        
                                        console.log('🏆 SIMPLIFIED Badge Count for', round.name, ':', {
                                          simpleWinners: simpleWinners.length,
                                          simpleWinnerNames: simpleWinners.map(p => p.name),
                                          allPlayers: round.players?.length || 0
                                        });
                                        
                                        return simpleWinners.length;
                                      })()} Winners
                                    </span>
                                  </div>
                                  
                                  {/* Winner Selection Controls */}
                                  {(() => {
                                    const actualWinners = round.players?.filter(p => {
                                      if (p.status !== 'winner') return false;
                                      if (p.originalRound && p.originalRound !== round.id) return false;
                                      
                                      // Check if player won this round by name OR by being in this round with winner status
                                      const wonByName = p.roundsWon?.includes(round.name);
                                      const wonByRound = p.currentRound === round.id && p.status === 'winner';
                                      
                                      return wonByName || wonByRound;
                                    }) || [];
                                    console.log('🎯 Winner Selection Controls for', round.name, ':', {
                                      allPlayers: round.players?.length || 0,
                                      allWinners: round.players?.filter(p => p.status === 'winner').length || 0,
                                      actualWinners: actualWinners.length,
                                      actualWinnerNames: actualWinners.map(p => p.name),
                                      roundName: round.name,
                                      allPlayersDetails: round.players?.map(p => ({
                                        name: p.name,
                                        status: p.status,
                                        roundsWon: p.roundsWon,
                                        originalRound: p.originalRound
                                      })) || []
                                    });
                                    return actualWinners.length > 0;
                                  })() && (
                                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-green-800">
                                          {round.players.filter(p => p.status === 'winner' && p.roundsWon?.includes(round.name) && p.selected).length} winners selected
                                        </span>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => {
                                              // Select all winners of this round
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id 
                                                  ? { ...r, players: r.players.map(p => 
                                                      p.status === 'winner' && p.roundsWon?.includes(round.name) ? { ...p, selected: true } : p
                                                    ) }
                                                  : r
                                              );
                                              const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                p.status === 'winner' && p.currentRound === round.id && p.roundsWon?.includes(round.name) ? { ...p, selected: true } : p
                                              );
                                              this.setState({
                                                currentGameMatch: {
                                                  ...this.state.currentGameMatch!,
                                                  allPlayers: updatedPlayers,
                                                  rounds: updatedRounds
                                                }
                                              });
                                            }}
                                            className="px-3 py-1 bg-green-200 text-green-800 rounded-lg hover:bg-green-300 transition-colors text-sm font-medium"
                                          >
                                            Select All Winners
                                          </button>
                                          <button
                                            onClick={() => {
                                              // Deselect all winners of this round
                                              const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                                r.id === round.id 
                                                  ? { ...r, players: r.players.map(p => 
                                                      p.status === 'winner' && p.roundsWon?.includes(round.name) ? { ...p, selected: false } : p
                                                    ) }
                                                  : r
                                              );
                                              const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                                p.status === 'winner' && p.currentRound === round.id && p.roundsWon?.includes(round.name) ? { ...p, selected: false } : p
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
                                            Deselect All
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Copy to Other Rounds */}
                                      {round.players.filter(p => p.status === 'winner' && p.roundsWon?.includes(round.name) && p.selected).length > 0 && (
                                        <div className="flex gap-2">
                                          <select
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                const selectedWinnerIds = round.players.filter(p => p.status === 'winner' && p.roundsWon?.includes(round.name) && p.selected).map(p => p.id);
                                                const targetRoundId = e.target.value;
                                                
                                                // Check if any winners are already copied to this round
                                                const alreadyCopied = selectedWinnerIds.some(winnerId => {
                                                  const winner = round.players.find(p => p.id === winnerId);
                                                  return winner?.copiedToRounds?.includes(targetRoundId);
                                                });
                                                
                                                if (alreadyCopied) {
                                                  alert('Some selected winners have already been copied to this round. Please deselect them first.');
                                                  e.target.value = '';
                                                  return;
                                                }
                                                
                                                // Copy selected winners to target round
                                                const winnersToCopy = round.players.filter(p => p.status === 'winner' && p.roundsWon?.includes(round.name) && p.selected);
                                                const copiedWinners = winnersToCopy.map(winner => ({
                                                  ...winner,
                                                  selected: false,
                                                  status: 'in_round', // Reset status - they need to win again in the new round
                                                  copiedToRounds: [...(winner.copiedToRounds || []), targetRoundId],
                                                  originalRound: round.id,
                                                  currentRound: targetRoundId,
                                                  currentMatch: null // Clear any current match
                                                }));
                                                
                                                // Update target round to include copied winners
                                                const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => {
                                                  if (r.id === targetRoundId) {
                                                    return {
                                                      ...r,
                                                      players: [...r.players, ...copiedWinners]
                                                    };
                                                  } else if (r.id === round.id) {
                                                    // Update original round winners with copied info
                                                    return {
                                                      ...r,
                                                      players: r.players.map(p => {
                                                        if (winnersToCopy.some(w => w.id === p.id)) {
                                                          return {
                                                            ...p,
                                                            selected: false,
                                                            copiedToRounds: [...(p.copiedToRounds || []), targetRoundId]
                                                          };
                                                        }
                                                        return p;
                                                      })
                                                    };
                                                  }
                                                  return r;
                                                });
                                                
                                                // Update allPlayers with copied info
                                                const updatedAllPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => {
                                                  const winnerToCopy = winnersToCopy.find(w => w.id === p.id);
                                                  if (winnerToCopy) {
                                                    return {
                                                      ...p,
                                                      selected: false,
                                                      copiedToRounds: [...(p.copiedToRounds || []), targetRoundId]
                                                    };
                                                  }
                                                  return p;
                                                });
                                                
                                                // Add copied winners to allPlayers
                                                const newAllPlayers = [...updatedAllPlayers, ...copiedWinners];
                                                
                                                this.setState({
                                                  currentGameMatch: {
                                                    ...this.state.currentGameMatch!,
                                                    allPlayers: newAllPlayers,
                                                    rounds: updatedRounds
                                                  }
                                                });
                                                
                                                console.log('📋 Copied', copiedWinners.length, 'winners to', targetRoundId);
                                                e.target.value = '';
                                              }
                                            }}
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                          >
                                            <option value="">Copy Selected to Round...</option>
                                            {this.state.currentGameMatch!.rounds!.filter(r => r.id !== round.id).map((r: TournamentRound) => (
                                              <option key={r.id} value={r.id}>
                                                {this.getRoundDisplayTitle(r)} ({r.players.length} players)
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Show copied winners with delete option - only show those who haven't won in this round yet */}
                                  {round.players?.filter(p => p.status === 'winner' && p.originalRound && p.originalRound !== round.id && !p.roundsWon?.includes(round.name)).length > 0 && (
                                    <div className="mb-6">
                                      <h5 className="text-md font-semibold text-gray-700 mb-3">Copied Winners (Can be deleted)</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {round.players.filter(p => p.status === 'winner' && p.originalRound && p.originalRound !== round.id && !p.roundsWon?.includes(round.name)).map((player: Player, index: number) => (
                                          <div key={player.id} className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 relative">
                                            <div className="flex items-center gap-3 mb-3">
                                              <img
                                                src={player.profilePic}
                                                alt={player.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                                              />
                                              <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{player.name}</div>
                                                <div className="text-sm text-gray-600">{player.email}</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                player.skill === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                player.skill === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                              }`}>
                                                {player.skill}
                                              </span>
                                              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                Copied Winner
                                              </div>
                                            </div>
                                            
                                            {/* Show original round */}
                                            {player.originalRound && (
                                              <div className="text-xs text-blue-600 mb-2">
                                                From: {(() => {
                                                  const originalRound = this.state.currentGameMatch?.rounds?.find(r => r.id === player.originalRound);
                                                  return originalRound ? this.getRoundDisplayTitle(originalRound) : player.originalRound;
                                                })()}
                                              </div>
                                            )}
                                            
                                            {/* Delete button */}
                                            <button
                                              onClick={() => {
                                                // Remove this copied winner from current round
                                                const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => {
                                                  if (r.id === round.id) {
                                                    return {
                                                      ...r,
                                                      players: r.players.filter(p => p.id !== player.id)
                                                    };
                                                  } else if (r.id === player.originalRound) {
                                                    // Update original round to remove copied info
                                                    return {
                                                      ...r,
                                                      players: r.players.map(p => {
                                                        if (p.id === player.id) {
                                                          const updatedCopiedToRounds = (p.copiedToRounds || []).filter(roundId => roundId !== round.id);
                                                          return {
                                                            ...p,
                                                            copiedToRounds: updatedCopiedToRounds
                                                          };
                                                        }
                                                        return p;
                                                      })
                                                    };
                                                  }
                                                  return r;
                                                });
                                                
                                                // Remove from allPlayers
                                                const updatedAllPlayers = this.state.currentGameMatch!.allPlayers!.filter(p => p.id !== player.id);
                                                
                                                // Update original player in allPlayers
                                                const finalAllPlayers = updatedAllPlayers.map(p => {
                                                  if (p.id === player.id && p.currentRound === player.originalRound) {
                                                    const updatedCopiedToRounds = (p.copiedToRounds || []).filter(roundId => roundId !== round.id);
                                                    return {
                                                      ...p,
                                                      copiedToRounds: updatedCopiedToRounds
                                                    };
                                                  }
                                                  return p;
                                                });
                                                
                                                this.setState({
                                                  currentGameMatch: {
                                                    ...this.state.currentGameMatch!,
                                                    allPlayers: finalAllPlayers,
                                                    rounds: updatedRounds
                                                  }
                                                });
                                                
                                                console.log('🗑️ Deleted copied winner', player.name, 'from', this.getRoundDisplayTitle(round));
                                              }}
                                              className="w-full mt-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                              Remove from Round
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Show original winners - TEMPORARY SIMPLIFIED VERSION FOR DEBUGGING */}
                                  {(() => {
                                    // SIMPLIFIED: Just show all players with winner status in this round
                                    const simpleWinners = round.players?.filter(p => p.status === 'winner') || [];
                                    
                                    console.log('🏆 SIMPLIFIED Winners tab content for', round.name, ':', {
                                      allPlayers: round.players?.length || 0,
                                      simpleWinners: simpleWinners.length,
                                      simpleWinnerNames: simpleWinners.map(p => p.name),
                                      roundName: round.name,
                                      roundId: round.id,
                                      allPlayerDetails: round.players?.map(p => ({
                                        name: p.name,
                                        status: p.status,
                                        currentRound: p.currentRound,
                                        roundsWon: p.roundsWon,
                                        originalRound: p.originalRound
                                      })) || []
                                    });
                                    
                                    // TEMPORARY: Show if there are ANY winners in this round
                                    return simpleWinners.length > 0;
                                  })() ? (
                                    <div>
                                      {round.players?.filter(p => p.status === 'winner' && p.originalRound && p.originalRound !== round.id).length > 0 && (
                                        <h5 className="text-md font-semibold text-gray-700 mb-3">Original Winners</h5>
                                      )}
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {(() => {
                                          // SIMPLIFIED: Just show all players with winner status in this round
                                          const simpleWinners = round.players?.filter(p => p.status === 'winner') || [];
                                          return simpleWinners;
                                        })().map((player: Player, index: number) => (
                                        <div 
                                          key={player.id} 
                                          className={`bg-green-50 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-green-300 hover:shadow-md ${
                                            player.selected ? 'border-green-500 bg-green-100' : 'border-green-200'
                                          }`}
                                          onClick={() => {
                                            // Toggle selection for this winner
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
                                              className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                                            />
                                            <div className="flex-1">
                                              <div className="font-semibold text-gray-900">{player.name}</div>
                                              <div className="text-sm text-gray-600">{player.email}</div>
                                            </div>
                                            <input
                                              type="checkbox"
                                              checked={player.selected || false}
                                              onChange={() => {}} // Handled by parent onClick
                                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
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
                                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                              Winner
                                            </div>
                                          </div>
                                          
                                          {/* Show copied status */}
                                          {player.copiedToRounds && player.copiedToRounds.length > 0 && (
                                            <div className="mt-2 text-xs text-blue-600">
                                              Copied to: {player.copiedToRounds.map(roundId => {
                                                const targetRound = this.state.currentGameMatch?.rounds?.find(r => r.id === roundId);
                                                return targetRound ? this.getRoundDisplayTitle(targetRound) : roundId;
                                              }).join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-12">
                                      <div className="text-gray-500 text-lg mb-2">No winners yet</div>
                                      <div className="text-gray-400 text-sm">Completed match winners will appear here</div>
                                      <div className="text-xs text-gray-400 mt-2">
                                        Debug: {(() => {
                                          const allPlayers = round.players?.length || 0;
                                          const allWinners = round.players?.filter(p => p.status === 'winner').length || 0;
                                          const actualWinners = round.players?.filter(p => p.status === 'winner' && p.roundsWon?.includes(round.name)).length || 0;
                                          
                                          // Debug all players in this round
                                          console.log('🔍 All Players in Round', round.name, ':', round.players?.map(p => ({
                                            name: p.name,
                                            status: p.status,
                                            currentRound: p.currentRound,
                                            roundsWon: p.roundsWon,
                                            originalRound: p.originalRound,
                                            id: p.id
                                          })) || []);
                                          
                                          return `Players: ${allPlayers}, All Winners: ${allWinners}, Actual Winners: ${actualWinners}`;
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}








  













            </div>
            )}




             {/* Original Players Display (when no sub-tabs) */}
             {this.state.rounds.map((round, roundIndex) => (
  this.state.activeRoundTab !== round.id && (round.players.length > 0 ? (
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
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Move single player to lobby
                                        const updatedRounds = this.state.currentGameMatch!.rounds!.map((r: TournamentRound) => 
                                          r.id === round.id ? { ...r, players: r.players.filter(p => p.id !== player.id) } : r
                                        );
                                        const updatedPlayers = this.state.currentGameMatch!.allPlayers!.map((p: Player) => 
                                          p.id === player.id 
                                            ? { ...p, status: 'in_lobby' as const, currentRound: null, selected: false }
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
                                      className="text-gray-400 hover:text-red-600 transition-colors text-xs"
                                      title="Move to Lobby"
                                    >
                                      🏟️
                                    </button>
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
                        ))))}







 {/* Control Buttons */}
 {this.state.rounds.map((round, roundIndex) => (
  <React.Fragment key={round.id}>
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
  </React.Fragment>
))}







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
                          Round 1 (First Round): {this.state.shuffledMatches.length * 2} players â†’ {this.state.shuffledMatches.length} matches â†’ {this.state.shuffledMatches.length} winners
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
                                <div className="text-sm text-gray-600">Rank #{match.player1.rank} â€¢ Rating: {match.player1.rating}</div>
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
                                <div className="text-sm text-gray-600">Rank #{match.player2.rank} â€¢ Rating: {match.player2.rating}</div>
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
                    <h3 className="text-xl font-bold text-white">{this.state.selectedMatch.name}</h3>
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
                      <p className="text-gray-900">{this.state.selectedMatch.gameType}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Venue</span>
                      <p className="text-gray-900">{this.state.selectedMatch.venue}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date & Time</span>
                      <p className="text-gray-900">{new Date(this.state.selectedMatch.date).toLocaleDateString()} at {this.state.selectedMatch.time}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Players</span>
                      <p className="text-gray-900">{this.state.selectedMatch.players}/{this.state.selectedMatch.maxPlayers || this.state.selectedMatch.players}</p>
                    </div>
                  </div>

                  {/* Organizer Info */}
                  {this.state.selectedMatch.organizerName && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">Organizer</span>
                      <p className="text-gray-900 font-medium">{this.state.selectedMatch.organizerName}</p>
                      {this.state.selectedMatch.organizerDescription && (
                        <p className="text-sm text-gray-600 mt-1">{this.state.selectedMatch.organizerDescription}</p>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Entry Fee</span>
                    <p className="text-2xl font-bold text-green-600">${this.state.selectedMatch.entryFee}</p>
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
                    <h1 className="text-3xl font-bold mb-2">ðŸŽ± {this.state.selectedMatch.name}</h1>
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
                          <span className="text-xs font-bold text-white">ðŸ¢</span>
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
                {this.state.selectedMatch.topPlayers && (
                  <div className="mt-6 pt-4 border-t border-blue-400 border-opacity-30">
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">ðŸ† Top 4 Champions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Winner */}
                      <div 
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-20 cursor-pointer hover:bg-opacity-20 transition-all duration-200"
                        onClick={() => this.handleOpenProfileModal(this.state.selectedMatch.topPlayers.winner)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-2">
                            <img 
                              src={this.state.selectedMatch.topPlayers.winner.avatar} 
                              alt={this.state.selectedMatch.topPlayers.winner.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">1</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-white text-sm">{this.state.selectedMatch.topPlayers.winner.name}</h4>
                          <p className="text-blue-200 text-xs">ðŸ¥‡ Winner</p>
                          <p className="text-yellow-300 text-xs font-bold">{this.state.selectedMatch.topPlayers.winner.prize}</p>
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
                          <p className="text-blue-200 text-xs">ðŸ¥ˆ Runner-up</p>
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
                          <p className="text-blue-200 text-xs">ðŸ¥‰ 3rd Place</p>
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
                          <p className="text-blue-200 text-xs">ðŸ… 4th Place</p>
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
                                    {player.finalPosition <= 2 && <span className="text-green-600 font-bold">âœ“</span>}
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
                                        {((this.state.selectedMatch?.registeredPlayers?.[index - 1]?.finalPosition || 0) <= 2) && <span className="text-green-600 font-bold">âœ“</span>}
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
                                      {player.finalPosition <= 2 && <span className="text-green-600 font-bold">âœ“</span>}
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
                                      {player.finalPosition <= 4 && <span className="text-green-600 font-bold">âœ“</span>}
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
                                      {player.finalPosition <= 2 && <span className="text-green-600 font-bold">âœ“</span>}
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
                              ðŸ† Final Rankings
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
                                          {player.finalPosition === 1 ? 'ðŸ† Champion' : 
                                           player.finalPosition === 2 ? 'ðŸ¥ˆ Runner-up' : 
                                           player.finalPosition === 3 ? 'ðŸ¥‰ 3rd Place' :
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
                            <span className="text-green-600 font-bold mr-2">âœ“</span>
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
                    {this.state.selectedProfile.position === 1 ? 'ðŸ† Winner' :
                     this.state.selectedProfile.position === 2 ? 'ðŸ¥ˆ Runner-up' :
                     this.state.selectedProfile.position === 3 ? 'ðŸ¥‰ 3rd Place' :
                     this.state.selectedProfile.position === 4 ? 'ðŸ… 4th Place' :
                     this.state.selectedProfile.position === 'Tournament Director' ? 'ðŸ¢ Tournament Director' :
                     this.state.selectedProfile.skill ? `ðŸŽ¯ ${this.state.selectedProfile.skill}` :
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
                          {this.state.selectedProfile.position === 1 && <span className="text-2xl">ðŸ†</span>}
                          {this.state.selectedProfile.position === 2 && <span className="text-2xl">ðŸ¥ˆ</span>}
                          {this.state.selectedProfile.position === 3 && <span className="text-2xl">ðŸ¥‰</span>}
                          {this.state.selectedProfile.position === 4 && <span className="text-2xl">ðŸ…</span>}
                          {this.state.selectedProfile.position === 'Tournament Director' && <span className="text-2xl">ðŸ¢</span>}
                          {this.state.selectedProfile.skill && !this.state.selectedProfile.position && <span className="text-2xl">ðŸŽ¯</span>}
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
                            <span className="text-blue-600 text-sm">ðŸ“§</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.email}</span>
                        </div>
                      )}
                      {this.state.selectedProfile.contact && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">ðŸ“ž</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.contact}</span>
                        </div>
                      )}
                      {this.state.selectedProfile.website && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-sm">ðŸŒ</span>
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
                            <span className="text-purple-600 text-sm">ðŸ¢</span>
                          </div>
                          <span className="text-gray-700">{this.state.selectedProfile.name}</span>
                        </div>
                        {this.state.selectedProfile.description && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">ðŸ“</span>
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
                          {this.state.selectedProfile.position === 'Tournament Director' ? 'ðŸ¢' : 
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
                    Start Tournament
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}




        
        </div>





{/* Round Name Input Modal */}

{this.state.showRoundNameModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create New Round</h3>
              <p className="text-sm text-gray-600 mt-1">Enter a display name for your new round</p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="mb-4">
                <label htmlFor="roundDisplayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Round Display Name (Optional)
                </label>
                <input
                  type="text"
                  id="roundDisplayName"
                  value={this.state.newRoundDisplayName}
                  onChange={(e) => this.setState({ newRoundDisplayName: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      this.handleConfirmRoundCreation();
                    } else if (e.key === 'Escape') {
                      this.handleCancelRoundCreation();
                    }
                  }}
                  placeholder="e.g., Semi Final, Quarter Final, Final"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to use default naming (Round {((this.state.currentGameMatch?.rounds?.length || 0) + 1)})
                </p>
              </div>

                 {/* Ready-made Round Titles */}
                 {(() => {
                   const availableTitles = this.getAvailableRoundTitles();
                   return (
                     <div className="mb-4">
                       <p className="text-sm font-medium text-gray-700 mb-3">Quick Select:</p>
                       
                       {/* Normal Rounds */}
                       {availableTitles.normal.length > 0 && (
                         <div className="mb-3">
                           <p className="text-xs font-medium text-blue-600 mb-2">Normal Rounds</p>
                           <div className="grid grid-cols-2 gap-2">
                             {availableTitles.normal.map((title, index) => (
                               <button
                                 key={`normal-${index}`}
                                 onClick={() => this.setState({ newRoundDisplayName: title })}
                                 className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700 border border-blue-200"
                               >
                                 {title}
                               </button>
                             ))}
                           </div>
                         </div>
                       )}
                       
                       {/* Final Rounds */}
                       {availableTitles.finals.length > 0 && (
                         <div>
                           <p className="text-xs font-medium text-green-600 mb-2">Final Rounds</p>
                           <div className="grid grid-cols-2 gap-2">
                             {availableTitles.finals.map((title, index) => (
                               <button
                                 key={`finals-${index}`}
                                 onClick={() => this.setState({ newRoundDisplayName: title })}
                                 className="px-3 py-2 text-sm bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-green-700 border border-green-200"
                               >
                                 {title}
                               </button>
                             ))}
                           </div>
                         </div>
                       )}
                       
                       {/* Show message if all titles are used */}
                       {availableTitles.normal.length === 0 && availableTitles.finals.length === 0 && (
                         <div className="text-center py-4 text-gray-500 text-sm">
                           <p>All suggested titles have been used.</p>
                           <p>Enter a custom name above.</p>
                         </div>
                       )}
                     </div>
                   );
                 })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={this.handleCancelRoundCreation}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={this.handleConfirmRoundCreation}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Round
              </button>
            </div>
          </div>
          
    </div>
)}




      </div>





    );
  }
}

export default Matches;
