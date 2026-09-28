import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../constants/Supabase';
import { Cache } from '../constants/Cache';
import {
  UserProfile,
  Post,
  PostComment,
  Job,
  JobApplication,
  Conversation,
  ChatMessage,
  DirectPayment,
  WalletTransaction,
  NotificationItem,
  Review,
  ThemeMode,
  PostType,
  CommunityGroup,
  CommunityMessage,
  CommunityJoinRequest,
  UserCredentialDocument,
  PaymentCurrency
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_POSTS,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_REVIEWS,
  INITIAL_COMMUNITIES,
  INITIAL_COMMUNITY_MESSAGES
} from '../data/mockData';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface AppContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  toggleDarkMode: () => void;

  // Auth & 3-Month Persistent Session
  authToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (open: boolean) => void;
  login: (username: string, email: string) => { success: boolean; error?: string };
  checkCredentials: (username: string, email: string) => { isValid: boolean; error?: string; cleanHandle?: string; cleanEmail?: string; isExisting?: boolean };
  logout: () => void;
  completeOnboarding: (data: Partial<UserProfile> & { documents?: UserCredentialDocument[] }) => void;

  // Document & Credentials Management
  addUserDocument: (doc: Omit<UserCredentialDocument, 'id' | 'uploadedAt'>) => void;
  updateUserDocument: (docId: string, updates: Partial<UserCredentialDocument>) => void;
  deleteUserDocument: (docId: string) => void;
  toggleDefaultDocument: (docId: string) => void;

  // Bookmarked Jobs Modal
  isBookmarkedJobsModalOpen: boolean;
  setIsBookmarkedJobsModalOpen: (open: boolean) => void;
  
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  profiles: UserProfile[];
  
  activeTab: string;
  setActiveTab: (tab: string) => void;

  isSplashVisible: boolean;
  setIsSplashVisible: (visible: boolean) => void;
  triggerSplashScreen: () => void;

  // Wallet
  isWalletConnected: boolean;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  solBalance: number;
  setSolBalance: React.Dispatch<React.SetStateAction<number>>;
  skrBalance: number;
  walletType: string | null;
  connectWallet: (type: string) => void;
  disconnectWallet: () => void;
  sendTipSol: (recipientName: string, recipientAddress: string, amountSol: number) => boolean;
  addTransaction: (tx: WalletTransaction) => void;

  // Posts
  posts: Post[];
  addPost: (content: string, type: PostType, hashtags: string[], mediaUrlOrUrls?: string | string[], jobDetails?: Post['jobDetails']) => void;
  appendPosts: (newPosts: Post[]) => void;
  toggleLikePost: (postId: string) => void;
  addCommentPost: (postId: string, commentText: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  toggleRepost: (postId: string) => void;
  deletePost: (postId: string) => void;
  editPost: (postId: string, newContent: string, newMediaUrls?: string[]) => void;
  toggleBookmarkPost: (postId: string) => void;

  // Jobs
  jobs: Job[];
  addJob: (jobData: Omit<Job, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'posterCompany' | 'posterVerified' | 'postedAt' | 'applicantsCount' | 'status'>) => void;
  toggleSaveJob: (jobId: string) => void;

  // Applications
  applications: JobApplication[];
  applyForJob: (
    jobId: string,
    coverLetter: string,
    proposedRateSol: number,
    applicantData?: {
      applicantName?: string;
      applicantEmail?: string;
      applicantPhone?: string;
      portfolioUrl?: string;
      attachedDocuments?: UserCredentialDocument[];
    }
  ) => void;

  // Chat
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, attachmentUrl?: string, attachmentType?: 'image' | 'file') => void;
  createConversationWith: (profileId: string) => string;
  markConversationAsRead: (conversationId: string) => void;
  receiveRealtimeMessage: (conversationId: string, text: string, senderId: string) => void;

  // Communities / Group Chats
  communities: CommunityGroup[];
  communityMessages: Record<string, CommunityMessage[]>;
  activeCommunityId: string | null;
  setActiveCommunityId: (id: string | null) => void;
  sendCommunityMessage: (groupId: string, text: string) => void;
  toggleCommunityMessageLike: (groupId: string, msgId: string) => void;
  toggleCommunityMessagePin: (groupId: string, msgId: string) => void;
  deleteCommunityMessage: (groupId: string, msgId: string) => void;
  editCommunityMessage: (groupId: string, msgId: string, newText: string) => void;
  addCommunityMember: (groupId: string, userId: string) => void;
  removeCommunityMember: (groupId: string, userId: string) => void;
  toggleCommunityAdmin: (groupId: string, userId: string) => void;
  toggleCommunityLock: (groupId: string) => void;
  updateCommunityDetails: (groupId: string, data: { name?: string; description?: string; iconType?: CommunityGroup['iconType']; isLocked?: boolean }) => void;
  requestToJoinCommunity: (groupId: string, note?: string) => void;
  cancelJoinRequest: (groupId: string) => void;
  approveJoinRequest: (groupId: string, userId: string) => void;
  rejectJoinRequest: (groupId: string, userId: string) => void;
  leaveCommunity: (groupId: string) => void;
  addCommunityGroup: (group: { name: string; description: string; category: string; iconType?: CommunityGroup['iconType'] }) => string;
  joinCommunity: (groupId: string) => void;

  // Direct Payments (Replacing Escrow)
  payments: DirectPayment[];
  escrows: DirectPayment[]; // Backwards compatibility alias
  sendDirectPayment: (jobTitle: string, talentId: string, amount: number, currency?: PaymentCurrency, notes?: string) => boolean;
  createEscrowMilestone: (jobTitle: string, talentId: string, amount: number, currency?: PaymentCurrency, notes?: string) => void;
  fundEscrow: (escrowId: string) => void;
  releaseEscrow: (escrowId: string) => void;
  disputeEscrow: (escrowId: string) => void;

  // Transactions & Notifications
  transactions: WalletTransaction[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotifAsRead: (id: string) => void;
  markAllNotifsAsRead: () => void;
  
  reviews: Review[];
  addReview: (jobId: string, jobTitle: string, revieweeId: string, rating: number, comment: string) => void;

  // Toast
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Search filter global helper
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Freelancer Profile Page Global Navigation
  viewingProfile: UserProfile | null;
  setViewingProfile: (profile: UserProfile | null) => void;
  viewProfileById: (profileId: string) => void;
  closeProfile: () => void;
  goBack: () => void;
  followedUserIds: string[];
  toggleFollowUser: (userId: string) => void;

  // Global Modals
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  shareModalData: { title: string; shareText: string; shareUrl: string } | null;
  openShareModal: (title: string, shareText: string, shareUrl: string) => void;
  closeShareModal: () => void;

  // Bottom Tab Bar visibility (hides on scroll, pops back on stop)
  isTabBarVisible: boolean;
  setIsTabBarVisible: (visible: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Safe storage helper for cross-platform compatibility
const safeGetItem = (key: string): string | null => null;

const safeSetItem = (key: string, value: string): void => {
  void AsyncStorage.setItem(key, value).catch(() => undefined);
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .trim();
};

export const validateUsername = (username: string): { isValid: boolean; error?: string; clean: string } => {
  const clean = sanitizeInput(username).replace(/^@/, '');
  if (!clean) {
    return { isValid: false, error: 'Username is required', clean: '' };
  }
  if (clean.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters', clean };
  }
  if (clean.length > 24) {
    return { isValid: false, error: 'Username must be 24 characters or less', clean };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores', clean };
  }
  return { isValid: true, clean: `@${clean}` };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string; clean: string } => {
  const clean = sanitizeInput(email).toLowerCase();
  if (!clean) {
    return { isValid: false, error: 'Email is required', clean: '' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com)', clean };
  }
  return { isValid: true, clean };
};

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state default to 'light'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (safeGetItem('skc_theme') as ThemeMode) || 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = safeGetItem('skc_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    safeSetItem('skc_theme', themeMode);
    const darkActive = themeMode === 'dark';
    setIsDark(darkActive);
    if (typeof document !== 'undefined') {
      if (darkActive) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleDarkMode = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth & 90-Day (3-Month) Persistent Session State
  const [authSession, setAuthSession] = useState<{ token: string; expiry: number; userId: string } | null>(null);

  useEffect(() => {
    const initStorage = async () => {
      try {
        const [savedSession, savedOnboarded, savedTheme] = await Promise.all([
          AsyncStorage.getItem('skc_auth_session'),
          AsyncStorage.getItem('skc_onboarded'),
          AsyncStorage.getItem('skc_theme'),
        ]);

        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.token && parsed.expiry && Date.now() < parsed.expiry) {
            console.log('[AppContext] Restored active 90-day session. Token valid until:', new Date(parsed.expiry).toLocaleDateString());
            setAuthSession(parsed);
          } else {
            console.log('[AppContext] Session expired (90 days elapsed). Prompting re-login.');
            await AsyncStorage.removeItem('skc_auth_session');
            setAuthSession(null);
          }
        }

        if (savedTheme) {
          setThemeModeState(savedTheme as ThemeMode);
          setIsDark(savedTheme === 'dark');
        }
      } catch (err) {
        console.warn('[AppContext] Storage initialization notice:', err);
      }
    };
    initStorage();
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isBookmarkedJobsModalOpen, setIsBookmarkedJobsModalOpen] = useState<boolean>(false);

  const isAuthenticated = Boolean(authSession && authSession.token && Date.now() < authSession.expiry);
  const authToken = authSession?.token || null;
  const tokenExpiry = authSession?.expiry || null;

  // Splash
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);
  const triggerSplashScreen = () => setIsSplashVisible(true);

  // Active Tab & Visibility State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTabBarVisible, setIsTabBarVisible] = useState<boolean>(true);

  // Global Modals State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareModalData, setShareModalData] = useState<{ title: string; shareText: string; shareUrl: string } | null>(null);

  const openShareModal = (title: string, shareText: string, shareUrl: string) => {
    setShareModalData({ title, shareText, shareUrl });
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareModalData(null);
  };

  // Profiles
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const titleOverrides: Record<string, string> = {
      user_me: 'Senior Solana Smart Contract Engineer',
      user_elena: 'Anchor Security Auditor',
      user_devin: 'Web3 UI/UX Designer',
      user_marcus: 'Head of Talent',
      user_sarah: 'Lead Web3 Product Designer',
      user_kai: 'Senior Solana Infrastructure Lead',
      user_amara: 'Smart Contract Auditor',
      user_liam: 'Senior Rust Core Developer',
      user_priya: 'Solana Mobile Stack Specialist',
      user_mateo: 'DeFi Oracle Architect',
    };

    const saved = safeGetItem('skc_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: UserProfile) => {
          const override = titleOverrides[p.id];
          if (override) {
            return { ...p, title: override };
          }
          if (p.title && p.title.includes(' & ')) {
            return { ...p, title: p.title.split(' & ')[0].trim() };
          }
          return p;
        });
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PROFILES;
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    if (authSession?.userId) {
      const found = profiles.find((p) => p.id === authSession.userId);
      if (found) return found;
    }
    return profiles[0];
  });

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    setProfiles((prev) => prev.map((p) => (p.id === user.id ? user : p)));
    showToast(`Switched account to ${user.name}`, `Now acting as ${user.title}`, 'info');
  };

  const checkCredentials = (
    usernameInput: string,
    emailInput: string
  ): { isValid: boolean; error?: string; cleanHandle?: string; cleanEmail?: string; isExisting?: boolean } => {
    const userVal = validateUsername(usernameInput);
    if (!userVal.isValid) {
      return { isValid: false, error: userVal.error };
    }

    const emailVal = validateEmail(emailInput);
    if (!emailVal.isValid) {
      return { isValid: false, error: emailVal.error };
    }

    const cleanHandle = userVal.clean;
    const cleanEmail = emailVal.clean;

    const handleOwner = profiles.find((p) => p.handle.toLowerCase() === cleanHandle.toLowerCase());
    const emailOwner = profiles.find((p) => p.email.toLowerCase() === cleanEmail.toLowerCase());

    // If handle belongs to someone else with a different email
    if (handleOwner && handleOwner.email.toLowerCase() !== cleanEmail.toLowerCase()) {
      return {
        isValid: false,
        error: `Username "${cleanHandle}" is already taken by another account. Please choose a different username.`
      };
    }

    // If email belongs to a different handle
    if (emailOwner && emailOwner.handle.toLowerCase() !== cleanHandle.toLowerCase()) {
      return {
        isValid: false,
        error: `Email "${cleanEmail}" is already linked to handle "${emailOwner.handle}".`
      };
    }

    const isExisting = !!(handleOwner || emailOwner);
    return { isValid: true, cleanHandle, cleanEmail, isExisting };
  };

  const login = (usernameInput: string, emailInput: string): { success: boolean; error?: string } => {
    const check = checkCredentials(usernameInput, emailInput);
    if (!check.isValid) {
      return { success: false, error: check.error };
    }

    const cleanHandle = check.cleanHandle!;
    const cleanEmail = check.cleanEmail!;

    // Check if profile exists
    let matchedProfile = profiles.find(
      (p) => p.handle.toLowerCase() === cleanHandle.toLowerCase() || p.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    let isNewUser = false;
    if (!matchedProfile) {
      isNewUser = true;
      const newId = `user_${Date.now()}`;
      const defaultName = cleanHandle.replace(/^@/, '');
      const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      
      matchedProfile = {
        id: newId,
        name: capitalizedName,
        handle: cleanHandle,
        email: cleanEmail,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
        title: 'Web3 Specialist',
        bio: 'Solana & Web3 Freelancer on SkillChain.',
        isVerified: false,
        walletAddress: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        hourlyRateSol: 1.5,
        rating: 5.0,
        reviewCount: 0,
        skills: ['Solana', 'Web3', 'Rust', 'TypeScript'],
        chains: ['Solana'],
        role: 'both',
        isOnline: true,
        location: 'Remote',
        jobTypes: ['Remote', 'Contract'],
        completedJobsCount: 0,
        totalEarnedSol: 0,
        joinedDate: 'Just now',
        portfolio: [],
        experience: [],
        credentials: [],
        documents: [],
        isOnboarded: false
      };

      setProfiles((prev) => [matchedProfile!, ...prev]);
    }

    // Generate 3-month session
    const expiry = Date.now() + THREE_MONTHS_MS;
    const newToken = `sk_auth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const newSession = {
      token: newToken,
      expiry,
      userId: matchedProfile.id
    };

    setAuthSession(newSession);
    safeSetItem('skc_auth_session', JSON.stringify(newSession));
    setCurrentUserState(matchedProfile);
    setIsAuthModalOpen(false);

    if (isNewUser || !matchedProfile.isOnboarded) {
      setIsOnboardingModalOpen(true);
      showToast('Welcome to SkillChain!', 'Please set up your profile and credentials.', 'success');
    } else {
      showToast('Welcome Back!', `Logged in as ${matchedProfile.name}`, 'success');
    }

    return { success: true };
  };

  const logout = () => {
    setAuthSession(null);
    safeSetItem('skc_auth_session', '');
    safeSetItem('skc_onboarded', '');
    setIsWalletConnected(false);
    setWalletAddress('');

    // Close all open modals & active views
    setIsSettingsModalOpen(false);
    setIsWalletModalOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchModalOpen(false);
    setIsCreatePostModalOpen(false);
    setIsOnboardingModalOpen(false);
    setIsBookmarkedJobsModalOpen(false);
    setIsShareModalOpen(false);
    setViewingProfile(null);
    setActiveCommunityId(null);
    setActiveConversationId(null);

    showToast('Logged Out', 'You have been safely signed out.', 'info');
    setIsAuthModalOpen(true);
  };

  const completeOnboarding = (data: Partial<UserProfile> & { documents?: UserCredentialDocument[] }) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      ...data,
      isOnboarded: true
    };
    setCurrentUserState(updatedUser);
    setProfiles((prev) => prev.map((p) => (p.id === updatedUser.id ? updatedUser : p)));
    safeSetItem('skc_onboarded', 'true');
    safeSetItem('skc_profiles', JSON.stringify(profiles));
    if (data.walletAddress) {
      setWalletAddress(data.walletAddress);
      setIsWalletConnected(true);
      setWalletType('Phantom');
    }
    setIsOnboardingModalOpen(false);
    showToast('Profile Setup Complete!', 'Your profile and wallet are connected for transactions.', 'success');

    if (currentUser.id) {
      void supabase.from('profile').update({
        full_name: updatedUser.name,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar,
        skills: updatedUser.skills || [],
        hourly_rate: updatedUser.hourlyRateSol || (updatedUser.hourlyRateAmount ? Number(updatedUser.hourlyRateAmount) : 2.5),
        solana_address: updatedUser.walletAddress || null
      }).eq('id', currentUser.id).then(({ error }: any) => {
        if (error) console.error('[completeOnboarding] Supabase profile sync error:', error);
        else console.log('[completeOnboarding] Profile synced to Supabase successfully');
      });
    }
  };

  const addUserDocument = (doc: Omit<UserCredentialDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: UserCredentialDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadedAt: 'Just now'
    };
    const currentDocs = currentUser.documents || [];
    const updatedUser: UserProfile = {
      ...currentUser,
      documents: [newDoc, ...currentDocs]
    };
    setCurrentUserState(updatedUser);
    setProfiles((prev) => prev.map((p) => (p.id === updatedUser.id ? updatedUser : p)));
    showToast('Document Uploaded', `Added ${newDoc.title}`, 'success');
  };

  const updateUserDocument = (docId: string, updates: Partial<UserCredentialDocument>) => {
    const currentDocs = currentUser.documents || [];
    const updatedDocs = currentDocs.map((d) => (d.id === docId ? { ...d, ...updates } : d));
    const updatedUser: UserProfile = {
      ...currentUser,
      documents: updatedDocs
    };
    setCurrentUserState(updatedUser);
    setProfiles((prev) => prev.map((p) => (p.id === updatedUser.id ? updatedUser : p)));
    showToast('Document Updated', 'Changes saved to your credential document.', 'success');
  };

  const deleteUserDocument = (docId: string) => {
    const currentDocs = currentUser.documents || [];
    const updatedUser: UserProfile = {
      ...currentUser,
      documents: currentDocs.filter((d) => d.id !== docId)
    };
    setCurrentUserState(updatedUser);
    setProfiles((prev) => prev.map((p) => (p.id === updatedUser.id ? updatedUser : p)));
    showToast('Document Removed', undefined, 'info');
  };

  const toggleDefaultDocument = (docId: string) => {
    const currentDocs = currentUser.documents || [];
    const target = currentDocs.find((d) => d.id === docId);
    if (!target) return;
    const targetType = target.type;
    const updatedDocs = currentDocs.map((d) => {
      if (d.type === targetType) {
        return { ...d, isDefault: d.id === docId ? !d.isDefault : false };
      }
      return d;
    });
    const updatedUser: UserProfile = {
      ...currentUser,
      documents: updatedDocs
    };
    setCurrentUserState(updatedUser);
    setProfiles((prev) => prev.map((p) => (p.id === updatedUser.id ? updatedUser : p)));
    showToast('Default Updated', 'Document set as default for job applications.', 'success');
  };

  // Freelancer Profile View State
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  const viewProfileById = (profileId: string) => {
    if (!profileId) return;
    const cleanId = profileId.replace(/^@/, '').toLowerCase();
    
    // If clicking own profile, navigate to personal profile tab
    if (
      currentUser.id === profileId ||
      currentUser.handle.toLowerCase().replace(/^@/, '') === cleanId ||
      currentUser.name.toLowerCase() === cleanId ||
      profileId === 'user_alex' ||
      profileId === 'user_me' ||
      profileId === 'u1'
    ) {
      setViewingProfile(null);
      setActiveTab('profile');
      return;
    }

    const found = profiles.find(
      (p) => p.id === profileId || p.handle.toLowerCase().replace(/^@/, '') === cleanId
    );
    if (found) {
      if (found.id === currentUser.id) {
        setViewingProfile(null);
        setActiveTab('profile');
      } else {
        setViewingProfile(found);
      }
    } else {
      const fallback = profiles.find((p) => p.name.toLowerCase().includes(cleanId));
      if (fallback && fallback.id !== currentUser.id) {
        setViewingProfile(fallback);
      } else {
        setViewingProfile(null);
        setActiveTab('profile');
      }
    }
  };

  const closeProfile = () => {
    setViewingProfile(null);
  };

  const goBack = () => {
    if (viewingProfile) {
      setViewingProfile(null);
      return;
    }
    if (activeCommunityId) {
      setActiveCommunityId(null);
      return;
    }
    if (activeConversationId) {
      setActiveConversationId(null);
      return;
    }
    if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  // Followed Freelancers State
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    const saved = safeGetItem('skc_followed_users');
    return saved ? JSON.parse(saved) : ['user_elena', 'user_marcus'];
  });

  useEffect(() => {
    safeSetItem('skc_followed_users', JSON.stringify(followedUserIds));
  }, [followedUserIds]);

  const toggleFollowUser = (userId: string) => {
    const isFollowing = followedUserIds.includes(userId);
    const target = profiles.find((p) => p.id === userId);
    if (isFollowing) {
      setFollowedUserIds((prev) => prev.filter((id) => id !== userId));
      showToast(`Unfollowed ${target?.name || 'User'}`, undefined, 'info');
    } else {
      setFollowedUserIds((prev) => [...prev, userId]);
      showToast(`Following ${target?.name || 'User'}`, "You'll see their latest updates.", 'success');
    }
  };

  // Wallet State
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('7Xw9...4Kp9mN2q8Xv1');
  const [solBalance, setSolBalance] = useState<number>(24.85);
  const [skrBalance, setSkrBalance] = useState<number>(1250);
  const [walletType, setWalletType] = useState<string | null>('Phantom');

  const connectWallet = (type: string) => {
    setIsWalletConnected(true);
    setWalletType(type);
    setWalletAddress('7Xw9...4Kp9mN2q8Xv1');
    showToast('Wallet Connected', `Connected via ${type} on Solana Mainnet`, 'success');
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletType(null);
    showToast('Wallet Disconnected', 'You can reconnect anytime.', 'info');
  };

  // Toast State with duplicate prevention
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{ title: string; time: number }>({ title: '', time: 0 });

  const showToast = (title: string, message?: string, type: Toast['type'] = 'success') => {
    const now = Date.now();
    if (lastToastRef.current.title === title && now - lastToastRef.current.time < 1200) {
      return; // Skip double toast
    }
    lastToastRef.current = { title, time: now };
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev.filter((t) => t.title !== title).slice(-1), { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 2400);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = safeGetItem('skc_posts');
    if (saved) {
      try {
        const parsed: Post[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => {
            const initialMatch = INITIAL_POSTS.find((ip) => ip.id === p.id);
            let comments = p.comments || [];
            if (initialMatch && initialMatch.comments && initialMatch.comments.length > comments.length) {
              comments = initialMatch.comments;
            }
            return {
              ...p,
              mediaUrls: p.mediaUrls || (p.mediaUrl ? [p.mediaUrl] : []),
              comments,
              commentsCount: Math.max(p.commentsCount || 0, comments.length)
            };
          });
        }
      } catch (e) {
        console.error('Failed to parse cached posts', e);
      }
    }
    return INITIAL_POSTS;
  });

  useEffect(() => {
    safeSetItem('skc_posts', JSON.stringify(posts));
  }, [posts]);

  // Real-time / Background Synchronization with Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const [
          { data: remotePosts, error: postErr },
          { data: likesData },
          { data: commentsData }
        ] = await Promise.all([
          supabase
            .from('posts')
            .select(`
              *,
              profile:profile!posts_user_id_fkey(
                full_name,
                avatar_url,
                solana_address
              )
            `)
            .order('created_at', { ascending: false }),
          supabase.from('likes').select('id, user_id, post_id'),
          supabase.from('comments').select(`
            id,
            user_id,
            post_id,
            content,
            created_at,
            profile:profile!comments_user_id_fkey(
              full_name,
              avatar_url
            )
          `).order('created_at', { ascending: true })
        ]);

        if (!postErr && remotePosts && remotePosts.length > 0) {
          const allLikes = likesData || [];
          const allComments = commentsData || [];

          const mappedPosts: Post[] = remotePosts.map((rp: any) => {
            const postLikes = allLikes.filter((l: any) => l.post_id === rp.id);
            const isLiked = postLikes.some((l: any) => l.user_id === currentUser.id);
            const postComments: PostComment[] = allComments
              .filter((c: any) => c.post_id === rp.id)
              .map((c: any) => ({
                id: c.id,
                authorId: c.user_id,
                authorName: c.profile?.full_name || 'Builder',
                authorAvatar: c.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
                authorHandle: c.profile?.full_name ? `@${c.profile.full_name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}` : '@builder',
                isVerified: true,
                content: c.content || '',
                createdAt: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                likes: 0,
                isLiked: false
              }));

            const authorName = rp.profile?.full_name || 'Web3 Builder';
            const authorHandle = rp.profile?.full_name ? `@${rp.profile.full_name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}` : '@builder';
            const authorAvatar = rp.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';

            return {
              id: rp.id,
              authorId: rp.user_id,
              authorName,
              authorHandle,
              authorAvatar,
              authorWallet: rp.profile?.solana_address,
              type: 'general',
              content: rp.content || '',
              hashtags: [],
              mediaUrl: rp.image_urls && rp.image_urls.length > 0 ? rp.image_urls[0] : undefined,
              mediaUrls: rp.image_urls || undefined,
              likesCount: postLikes.length,
              commentsCount: postComments.length,
              repostsCount: 0,
              isLiked,
              isReposted: false,
              createdAt: rp.created_at ? new Date(rp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
              comments: postComments,
              profile: rp.profile
            };
          });

          setPosts((prev) => {
            const remoteIds = new Set(mappedPosts.map((p) => p.id));
            const existingNonRemote = prev.filter((p) => !remoteIds.has(p.id));
            return [...mappedPosts, ...existingNonRemote];
          });
        }
      } catch (err) {
        console.warn('[AppContext] Supabase post sync:', err);
      }

      try {
        const { data: remoteJobs, error: jobErr } = await supabase
          .from('jobs')
          .select(`
            *,
            profile:profile!jobs_user_id_fkey(
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (!jobErr && remoteJobs && remoteJobs.length > 0) {
          const mappedJobs: Job[] = remoteJobs.map((rj: any) => ({
            id: rj.id,
            title: rj.title || 'Web3 Developer',
            posterId: rj.user_id,
            posterName: rj.profile?.full_name || 'SkillChain Partner',
            posterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            posterCompany: rj.profile?.full_name || 'SkillChain Employer',
            posterVerified: true,
            jobType: (rj.operation_mode || 'REMOTE') as any,
            contractType: (rj.contract_type || 'CONTRACT') as any,
            payRangeSol: rj.salary ? `${rj.salary} ${rj.currency || 'SOL'}` : 'Competitive',
            budgetSol: rj.salary || 25,
            skills: ['Solana', 'Rust', 'Web3'],
            chains: ['Solana'],
            description: rj.description || '',
            requirements: ['Strong Web3 experience', 'Self-motivated'],
            deliverables: ['Production-ready code', 'Documentation'],
            escrowSecured: true,
            postedAt: rj.created_at ? new Date(rj.created_at).toLocaleDateString() : 'Recently',
            applicantsCount: 0,
            status: 'OPEN'
          }));
          setJobs((prev) => {
            const remoteIds = new Set(mappedJobs.map((j) => j.id));
            const existingNonRemote = prev.filter((j) => !remoteIds.has(j.id));
            return [...mappedJobs, ...existingNonRemote];
          });
        }
      } catch (err) {
        console.warn('[AppContext] Supabase job sync:', err);
      }
    };

    fetchSupabaseData();
  }, [currentUser.id]);

  const addPost = (
    content: string,
    type: PostType = 'general',
    hashtags?: string[],
    mediaUrlsInput?: string | string[],
    jobDetails?: Post['jobDetails']
  ) => {
    let mediaUrls: string[] = [];
    if (Array.isArray(mediaUrlsInput)) {
      mediaUrls = mediaUrlsInput.filter(Boolean);
    } else if (typeof mediaUrlsInput === 'string' && mediaUrlsInput.trim()) {
      mediaUrls = [mediaUrlsInput.trim()];
    }

    const cleanedTags = Array.from(
      new Set(
        (hashtags || [])
          .map((t) => t.trim().replace(/^#+/, ''))
          .filter(Boolean)
      )
    );

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      authorTitle: currentUser.title,
      authorWallet: currentUser.walletAddress,
      profile: {
        full_name: currentUser.name,
        avatar_url: currentUser.avatar,
        solana_address: currentUser.walletAddress,
      },
      type,
      content,
      hashtags: cleanedTags,
      mediaUrl: mediaUrls[0],
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      isLiked: false,
      isReposted: false,
      createdAt: 'Just now',
      comments: [],
      jobDetails
    };
    setPosts((prev) => [newPost, ...prev]);

    // Asynchronously persist to Supabase
    try {
      supabase.from('posts').insert({
        content,
        image_urls: mediaUrls.length > 0 ? mediaUrls : null,
        user_id: currentUser.id
      }).then(({ error }) => {
        if (error) console.log('[AppContext] Note: Post saved in local store (Supabase insert notice: ' + error.message + ')');
      });
    } catch {}

    showToast('Post Published', 'Shared with SkillChain network!', 'success');
  };

  const appendPosts = (newPosts: Post[]) => {
    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const toAdd = newPosts.filter((p) => !existingIds.has(p.id));
      return [...prev, ...toAdd];
    });
  };

  const toggleLikePost = (postId: string) => {
    let willBeLiked = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          willBeLiked = isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
          };
        }
        return p;
      })
    );

    if (currentUser.id) {
      try {
        if (willBeLiked) {
          supabase.from('likes').insert({ user_id: currentUser.id, post_id: postId }).then(({ error }) => {
            if (error && !error.message?.includes('duplicate')) console.log('[AppContext] Like sync notice:', error.message);
          });
        } else {
          supabase.from('likes').delete().match({ user_id: currentUser.id, post_id: postId }).then(({ error }) => {
            if (error) console.log('[AppContext] Unlike sync notice:', error.message);
          });
        }
      } catch {}
    }
  };

  const addCommentPost = (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    const cleanText = commentText.trim();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const existingComments = p.comments || [];
          const newComment: PostComment = {
            id: `comment_${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar,
            authorHandle: currentUser.handle,
            isVerified: currentUser.isVerified,
            content: cleanText,
            createdAt: 'Just now',
            likes: 0,
            isLiked: false
          };
          return {
            ...p,
            commentsCount: (p.commentsCount || existingComments.length) + 1,
            comments: [...existingComments, newComment]
          };
        }
        return p;
      })
    );

    if (currentUser.id) {
      try {
        supabase.from('comments').insert({
          user_id: currentUser.id,
          post_id: postId,
          content: cleanText
        }).then(({ error }) => {
          if (error) console.log('[AppContext] Comment sync notice:', error.message);
        });
      } catch {}
    }

    showToast('Comment Added', undefined, 'success');
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = (p.comments || []).map((c) => {
            if (c.id === commentId) {
              const isLiked = !c.isLiked;
              return {
                ...c,
                isLiked,
                likes: isLiked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 0) - 1)
              };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };

  const toggleRepost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isReposted = !p.isReposted;
          return {
            ...p,
            isReposted,
            repostsCount: isReposted ? p.repostsCount + 1 : p.repostsCount - 1
          };
        }
        return p;
      })
    );
    showToast('Post Reposted', 'Added to your timeline', 'info');
  };

  const deletePost = (postId: string) => {
    const postToDelete = posts.find((p) => p.id === postId);
    if (postToDelete && postToDelete.authorId !== currentUser.id) {
      showToast('Unauthorized', 'You can only delete your own posts.', 'error');
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      supabase.from('posts').delete().eq('id', postId).eq('user_id', currentUser.id).then(({ error }) => {
        if (error) console.log('[AppContext] Delete post notice:', error.message);
      });
    } catch {}
    showToast('Post Deleted', 'Your post was removed.', 'info');
  };

  const editPost = (postId: string, newContent: string, newMediaUrls?: string[]) => {
    const postToEdit = posts.find((p) => p.id === postId);
    if (postToEdit && postToEdit.authorId !== currentUser.id) {
      showToast('Unauthorized', 'You can only edit your own posts.', 'error');
      return;
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            content: newContent,
            mediaUrls: newMediaUrls !== undefined ? newMediaUrls : p.mediaUrls,
            mediaUrl: newMediaUrls && newMediaUrls.length > 0 ? newMediaUrls[0] : (newMediaUrls !== undefined ? undefined : p.mediaUrl)
          };
        }
        return p;
      })
    );
    try {
      supabase.from('posts').update({
        content: newContent,
        image_urls: newMediaUrls !== undefined ? newMediaUrls : undefined
      }).eq('id', postId).eq('user_id', currentUser.id).then(({ error }) => {
        if (error) console.log('[AppContext] Edit post notice:', error.message);
      });
    } catch {}
    showToast('Post Updated', 'Your post has been updated.', 'info');
  };

  const toggleBookmarkPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isBookmarked = !p.isBookmarked;
          showToast(isBookmarked ? 'Post Bookmarked' : 'Bookmark Removed', undefined, 'info');
          return {
            ...p,
            isBookmarked
          };
        }
        return p;
      })
    );
  };

  // Jobs State
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = safeGetItem('skc_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  useEffect(() => {
    safeSetItem('skc_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (jobData: Omit<Job, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'posterCompany' | 'posterVerified' | 'postedAt' | 'applicantsCount' | 'status'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}`,
      posterId: currentUser.id,
      posterName: currentUser.name,
      posterAvatar: currentUser.avatar,
      posterCompany: currentUser.name,
      posterVerified: currentUser.isVerified,
      postedAt: 'Just now',
      applicantsCount: 0,
      status: 'OPEN'
    };
    setJobs((prev) => [newJob, ...prev]);

    // Asynchronously persist to Supabase
    try {
      supabase.from('jobs').insert({
        title: newJob.title,
        description: newJob.description,
        salary: newJob.budgetSol,
        salary_scale: 'PROJECT',
        currency: 'SOL',
        operation_mode: newJob.jobType,
        contract_type: newJob.contractType,
        user_id: currentUser.id
      }).then(({ error }) => {
        if (error) console.log('[AppContext] Note: Job saved in local store (Supabase notice: ' + error.message + ')');
      });
    } catch {}

    // Also optionally create a Job Announcement post
    addPost(
      `💼 **NEW JOB POSTED**: ${newJob.title}\n\n💰 Pay: **${newJob.payRangeSol}**\n📍 Location: ${newJob.jobType}\n⚡ Required Skills: ${newJob.skills.join(', ')}\n\n${newJob.description}`,
      'job_announcement',
      ['SolanaJobs', 'Web3Hiring', ...newJob.skills],
      undefined,
      { jobId: newJob.id, budgetSol: newJob.budgetSol, skills: newJob.skills }
    );

    showToast('Job Listed Successfully', 'Talent on SkillChain can now apply.', 'success');
  };

  const toggleSaveJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const isSaved = !j.isSaved;
          showToast(isSaved ? 'Job Saved' : 'Job Unsaved', undefined, 'info');
          return { ...j, isSaved };
        }
        return j;
      })
    );
  };

  // Applications
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = safeGetItem('skc_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  useEffect(() => {
    safeSetItem('skc_applications', JSON.stringify(applications));
  }, [applications]);

  const applyForJob = (
    jobId: string,
    coverLetter: string,
    proposedRateSol: number,
    applicantData?: {
      applicantName?: string;
      applicantEmail?: string;
      applicantPhone?: string;
      portfolioUrl?: string;
      attachedDocuments?: UserCredentialDocument[];
    }
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    // Check if already applied
    if (applications.some((a) => a.jobId === jobId && a.applicantId === currentUser.id)) {
      showToast('Already Applied', 'You have already submitted an application for this job.', 'warning');
      return;
    }

    const destination = targetJob.submissionDestination || targetJob.posterEmail || `${targetJob.posterCompany.toLowerCase().replace(/\s+/g, '')}@jobs.skillchain.sol`;

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId,
      jobTitle: targetJob.title,
      companyName: targetJob.posterCompany,
      applicantId: currentUser.id,
      applicantName: applicantData?.applicantName || currentUser.name,
      applicantEmail: applicantData?.applicantEmail || currentUser.email || `${currentUser.handle.replace('@', '')}@soldev.net`,
      applicantPhone: applicantData?.applicantPhone || '+1 (555) 019-2834',
      portfolioUrl: applicantData?.portfolioUrl || currentUser.portfolio?.[0]?.link || `https://github.com/${currentUser.handle.replace('@', '')}`,
      submissionDestination: destination,
      coverLetter,
      proposedRateSol,
      attachedDocuments: applicantData?.attachedDocuments || currentUser.documents || [],
      status: 'applied',
      appliedAt: 'Just now',
      updatedAt: 'Just now'
    };

    setApplications((prev) => [newApp, ...prev]);

    // Asynchronously persist to Supabase
    try {
      supabase.from('job_applications').insert({
        job_id: jobId,
        applicant_id: currentUser.id,
        cover_letter: coverLetter,
        proposed_rate: proposedRateSol,
        status: 'applied'
      }).then(({ error }) => {
        if (error) console.log('[AppContext] Note: Application saved locally (Supabase notice: ' + error.message + ')');
      });
    } catch {}

    // Update job applicant count
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );

    // Trigger Real-time Notification
    addNotification({
      id: `notif_${Date.now()}`,
      type: 'job_status',
      title: 'Application Submitted!',
      message: `Proposal dispatched to ${destination} for "${targetJob.title}".`,
      amountTag: `Rate: ${proposedRateSol} SOL`,
      createdAt: 'Just now',
      isRead: false,
      linkTab: 'jobs'
    });

    showToast('Application Delivered!', `Sent directly to ${destination}.`, 'success');
  };

  // Direct Payments State (Replacing Escrow)
  const [payments, setPayments] = useState<DirectPayment[]>(() => {
    const saved = safeGetItem('skc_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  useEffect(() => {
    safeSetItem('skc_payments', JSON.stringify(payments));
  }, [payments]);

  const sendDirectPayment = (
    jobTitle: string,
    talentId: string,
    amount: number,
    currency: PaymentCurrency = 'SOL',
    notes?: string
  ): boolean => {
    const talent = profiles.find((p) => p.id === talentId) || profiles[1];
    
    if (currency === 'SOL' && solBalance < amount) {
      showToast('Insufficient SOL Balance', `You need ${amount} SOL in your wallet.`, 'error');
      return false;
    }

    if (currency === 'SOL') {
      // Deduct SOL immediately
      setSolBalance((prev) => Number(Math.max(0, prev - amount).toFixed(2)));
    }

    const txHash = `${Math.random().toString(36).substring(2, 12)}...${Math.random().toString(36).substring(2, 6)}`;
    const newPayment: DirectPayment = {
      id: `pay_${Date.now()}`,
      jobTitle,
      clientName: currentUser.name,
      clientId: currentUser.id,
      talentName: talent.name,
      talentId: talent.id,
      amount,
      amountSol: currency === 'SOL' ? amount : undefined,
      currency,
      status: 'CONFIRMED',
      createdAt: 'Just now',
      recipientAddress: talent.walletAddress,
      txHash,
      notes: notes || `Direct ${currency} payment on SkillChain`
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Record Transaction
    addTransaction({
      id: `tx_${Date.now()}`,
      type: 'PAYMENT_SENT',
      amount,
      amountSol: currency === 'SOL' ? amount : undefined,
      currency,
      counterpartyName: talent.name,
      counterpartyAddress: talent.walletAddress,
      txHash,
      timestamp: 'Just now',
      status: 'CONFIRMED'
    });

    // Add Notification
    addNotification({
      id: `notif_${Date.now()}`,
      type: 'payment',
      title: `Direct ${currency} Payment Sent!`,
      message: `${amount} ${currency} transferred directly to ${talent.name} for "${jobTitle}".`,
      amountTag: `Amount: -${amount} ${currency}`,
      createdAt: 'Just now',
      isRead: false,
      linkTab: 'wallet'
    });

    showToast(`Payment Sent in ${currency}!`, `${amount} ${currency} transferred directly to ${talent.name}.`, 'success');
    return true;
  };

  // Backwards compatibility aliases
  const createEscrowMilestone = (jobTitle: string, talentId: string, amount: number, currency: PaymentCurrency = 'SOL', notes?: string) => {
    sendDirectPayment(jobTitle, talentId, amount, currency, notes);
  };

  const fundEscrow = (paymentId: string) => {
    const target = payments.find((p) => p.id === paymentId);
    if (!target) return;
    const amountSol = target.amountSol ?? target.amount ?? 0;
    if (solBalance < amountSol) {
      showToast('Insufficient SOL Balance', `You need ${amountSol} SOL.`, 'error');
      return;
    }
    setSolBalance((prev) => Number((prev - amountSol).toFixed(2)));
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'CONFIRMED' } : p))
    );
    showToast('Payment Settled!', `${amountSol} SOL paid directly.`, 'success');
  };

  const releaseEscrow = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'RELEASED' } : p))
    );
    showToast('Payment Confirmed!', 'Direct transfer verified.', 'success');
  };

  const disputeEscrow = (paymentId: string) => {
    showToast('Transaction Flagged', 'SkillChain support oracle notified.', 'warning');
  };

  // Tip SOL
  const sendTipSol = (recipientName: string, recipientAddress: string, amountSol: number): boolean => {
    if (solBalance < amountSol) {
      showToast('Insufficient SOL', `You need at least ${amountSol} SOL.`, 'error');
      return false;
    }

    setSolBalance((prev) => Number((prev - amountSol).toFixed(2)));

    const txHash = `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`;

    addTransaction({
      id: `tx_${Date.now()}`,
      type: 'TIP_SENT',
      amount: amountSol,
      amountSol,
      currency: 'SOL',
      counterpartyName: recipientName,
      counterpartyAddress: recipientAddress || 'Solana Wallet',
      txHash,
      timestamp: 'Just now',
      status: 'CONFIRMED'
    });

    showToast('Tip Sent Successfully!', `Sent ${amountSol} SOL to ${recipientName} on Solana.`, 'success');
    return true;
  };

  // Transactions State
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = safeGetItem('skc_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const addTransaction = (tx: WalletTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = safeGetItem('skc_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const addNotification = (notif: NotificationItem) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const markNotifAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All Notifications Read', undefined, 'info');
  };

  // Chat Conversations & Messages
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = safeGetItem('skc_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse conversations', e);
      }
    }
    return INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = safeGetItem('skc_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse messages', e);
      }
    }
    return INITIAL_MESSAGES;
  });

  useEffect(() => {
    safeSetItem('skc_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    safeSetItem('skc_messages', JSON.stringify(messages));
  }, [messages]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const markConversationAsRead = (conversationId: string) => {
    if (!conversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    setMessages((prev) => {
      const convMsgs = prev[conversationId];
      if (!convMsgs || convMsgs.every((m) => m.read)) return prev;
      return {
        ...prev,
        [conversationId]: convMsgs.map((m) => ({ ...m, read: true }))
      };
    });
  };

  const receiveRealtimeMessage = (conversationId: string, text: string, senderId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isCurrentlyOpen = activeConversationId === conversationId;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId,
      text: text.trim(),
      createdAt: nowTime,
      read: isCurrentlyOpen
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastMessageAt: nowTime,
              unreadCount: isCurrentlyOpen ? 0 : (c.unreadCount || 0) + 1
            }
          : c
      )
    );
  };

  const sendMessage = (conversationId: string, text: string, attachmentUrl?: string, attachmentType?: 'image' | 'file') => {
    if (!text.trim() && !attachmentUrl) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      text: text.trim(),
      attachmentUrl,
      attachmentType,
      createdAt: 'Just now',
      read: true
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    // Update conversation last message and keep unreadCount 0 for active conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim() || 'Sent an attachment',
              lastMessageAt: 'Just now',
              unreadCount: 0
            }
          : c
      )
    );
  };

  const createConversationWith = (profileId: string): string => {
    // Clear any open profile overlay so chat opens immediately
    setViewingProfile(null);

    const existing = conversations.find((c) => c.participantId === profileId);
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('chat');
      return existing.id;
    }

    const newConvId = `conv_${Date.now()}`;
    const targetProfile = profiles.find((p) => p.id === profileId);

    const newConv: Conversation = {
      id: newConvId,
      participantId: profileId,
      lastMessage: 'Conversation started',
      lastMessageAt: 'Just now',
      unreadCount: 0
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newConvId]: [
        {
          id: `m_init_${Date.now()}`,
          conversationId: newConvId,
          senderId: currentUser.id,
          text: `Hi ${targetProfile ? targetProfile.name : 'there'}! I reached out via your SkillChain profile.`,
          createdAt: 'Just now',
          read: true
        }
      ]
    }));

    setActiveConversationId(newConvId);
    setActiveTab('chat');
    showToast(`Conversation started with ${targetProfile?.name || 'Talent'}`, undefined, 'info');
    return newConvId;
  };

  // Communities State
  const [communities, setCommunities] = useState<CommunityGroup[]>(() => {
    const saved = safeGetItem('skc_communities');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  useEffect(() => {
    safeSetItem('skc_communities', JSON.stringify(communities));
  }, [communities]);

  const [communityMessages, setCommunityMessages] = useState<Record<string, CommunityMessage[]>>(() => {
    const saved = safeGetItem('skc_community_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_COMMUNITY_MESSAGES,
          ...parsed,
          comm_solana_builders: (parsed.comm_solana_builders && parsed.comm_solana_builders.length >= 3)
            ? parsed.comm_solana_builders
            : INITIAL_COMMUNITY_MESSAGES.comm_solana_builders
        };
      } catch (e) {
        console.error('Failed to parse cached community messages', e);
      }
    }
    return INITIAL_COMMUNITY_MESSAGES;
  });

  useEffect(() => {
    safeSetItem('skc_community_messages', JSON.stringify(communityMessages));
  }, [communityMessages]);

  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);

  const sendCommunityMessage = (groupId: string, text: string) => {
    if (!text.trim()) return;

    const newMsg: CommunityMessage = {
      id: `cmsg_${Date.now()}`,
      groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderTitle: 'Full-Stack Web3 Engineer',
      senderBadge: 'admin',
      isVerified: currentUser.isVerified,
      text: text.trim(),
      createdAt: 'Just now',
      likesCount: 0,
      isLiked: false,
      isPinned: false,
      read: true
    };

    setCommunityMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMsg]
    }));

    // Update community group's last message
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === groupId
          ? {
              ...c,
              lastMessage: text.trim(),
              lastMessageTime: 'Just now'
            }
          : c
      )
    );

    // Dynamic peer simulated responses in the group chat
    setTimeout(() => {
      const elenaReplies = [
        "Spot on! Let's make sure we test the zero-copy deserialization limits on localnet before merging.",
        "Reviewed! The Anchor CPI validation looks great. Ready for staging deployment.",
        "Awesome progress team! I will add the automated fuzz tests to our CI workflow.",
        "Checking the IDL bindings now. Looks clean and type-safe!"
      ];
      const randomReply = elenaReplies[Math.floor(Math.random() * elenaReplies.length)];

      const peerMsg: CommunityMessage = {
        id: `cmsg_reply_${Date.now()}`,
        groupId,
        senderId: 'user_elena',
        senderName: 'Elena Rostova',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        senderTitle: 'Lead Rust & ZK Engineer',
        senderBadge: 'link',
        isVerified: true,
        text: randomReply,
        createdAt: 'Just now',
        likesCount: 1,
        isLiked: false,
        isPinned: false
      };

      setCommunityMessages((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), peerMsg]
      }));

      setCommunities((prev) =>
        prev.map((c) =>
          c.id === groupId
            ? {
                ...c,
                lastMessage: randomReply,
                lastMessageTime: 'Just now'
              }
            : c
        )
      );
    }, 1400);
  };

  const toggleCommunityMessageLike = (groupId: string, msgId: string) => {
    setCommunityMessages((prev) => {
      const list = prev[groupId] || [];
      const updated = list.map((m) => {
        if (m.id === msgId) {
          const isLiked = !m.isLiked;
          const count = m.likesCount || 0;
          return {
            ...m,
            isLiked,
            likesCount: isLiked ? count + 1 : Math.max(0, count - 1)
          };
        }
        return m;
      });
      return { ...prev, [groupId]: updated };
    });
  };

  const toggleCommunityMessagePin = (groupId: string, msgId: string) => {
    setCommunityMessages((prev) => {
      const list = prev[groupId] || [];
      const updated = list.map((m) =>
        m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
      );
      return { ...prev, [groupId]: updated };
    });
    showToast('Pin Updated', 'Community message pin status changed', 'info');
  };

  const deleteCommunityMessage = (groupId: string, msgId: string) => {
    setCommunityMessages((prev) => {
      const list = prev[groupId] || [];
      const updated = list.filter((m) => m.id !== msgId);
      return { ...prev, [groupId]: updated };
    });
    showToast('Message Deleted', undefined, 'info');
  };

  const editCommunityMessage = (groupId: string, msgId: string, newText: string) => {
    if (!newText.trim()) return;
    setCommunityMessages((prev) => {
      const list = prev[groupId] || [];
      const updated = list.map((m) =>
        m.id === msgId ? { ...m, text: newText.trim() } : m
      );
      return { ...prev, [groupId]: updated };
    });
    showToast('Message Updated', undefined, 'success');
  };

  const addCommunityMember = (groupId: string, userIdOrName: string) => {
    const foundProfile = profiles.find((p) => p.id === userIdOrName || p.name.toLowerCase() === userIdOrName.toLowerCase());
    const memberId = foundProfile ? foundProfile.id : userIdOrName;
    const memberName = foundProfile ? foundProfile.name : userIdOrName;

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const currentMembers = c.memberIds || ['user_me'];
          if (currentMembers.includes(memberId)) {
            return c;
          }
          const updatedMembers = [...currentMembers, memberId];
          return {
            ...c,
            memberIds: updatedMembers,
            memberCount: updatedMembers.length
          };
        }
        return c;
      })
    );
    showToast('Member Added', `${memberName} joined the group!`, 'success');
  };

  const removeCommunityMember = (groupId: string, userId: string) => {
    const foundProfile = profiles.find((p) => p.id === userId);
    const memberName = foundProfile ? foundProfile.name : 'Member';

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const updatedMembers = (c.memberIds || []).filter((id) => id !== userId);
          const updatedAdmins = (c.adminIds || []).filter((id) => id !== userId);
          return {
            ...c,
            memberIds: updatedMembers,
            adminIds: updatedAdmins,
            memberCount: Math.max(1, updatedMembers.length)
          };
        }
        return c;
      })
    );
    showToast('Member Removed', `${memberName} was removed from the group.`, 'info');
  };

  const toggleCommunityAdmin = (groupId: string, userId: string) => {
    const foundProfile = profiles.find((p) => p.id === userId);
    const memberName = foundProfile ? foundProfile.name : 'Member';

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const admins = c.adminIds || (c.creatorId ? [c.creatorId] : ['user_me']);
          const isAdmin = admins.includes(userId);
          const updatedAdmins = isAdmin
            ? admins.filter((id) => id !== userId)
            : [...admins, userId];
          
          showToast(
            isAdmin ? 'Admin Role Removed' : 'Promoted to Admin',
            `${memberName} is ${isAdmin ? 'now a regular member' : 'now an admin'}.`,
            'info'
          );

          return {
            ...c,
            adminIds: updatedAdmins
          };
        }
        return c;
      })
    );
  };

  const toggleCommunityLock = (groupId: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const nextLock = !c.isLocked;
          showToast(
            nextLock ? '🔒 Group Locked' : '🔓 Group Unlocked',
            nextLock ? 'Only admins can post messages in this channel.' : 'All members can now post messages.',
            'info'
          );
          return { ...c, isLocked: nextLock };
        }
        return c;
      })
    );
  };

  const updateCommunityDetails = (
    groupId: string,
    data: { name?: string; description?: string; iconType?: CommunityGroup['iconType']; isLocked?: boolean }
  ) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === groupId ? { ...c, ...data } : c))
    );
    showToast('Group Details Updated', 'Community settings saved.', 'success');
  };

  const requestToJoinCommunity = (groupId: string, note?: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const requests = c.pendingJoinRequests || [];
          if (requests.some((r) => r.userId === currentUser.id)) {
            return c;
          }
          const newRequest: CommunityJoinRequest = {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            userTitle: currentUser.title,
            userHandle: currentUser.handle,
            requestedAt: 'Just now',
            note: note || 'Requesting access to group.',
            status: 'pending'
          };
          return {
            ...c,
            pendingJoinRequests: [newRequest, ...requests]
          };
        }
        return c;
      })
    );
    showToast('Join Request Sent', 'The group admin has been notified and will review your request.', 'success');
  };

  const cancelJoinRequest = (groupId: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          return {
            ...c,
            pendingJoinRequests: (c.pendingJoinRequests || []).filter((r) => r.userId !== currentUser.id)
          };
        }
        return c;
      })
    );
    showToast('Request Cancelled', 'Your join request was withdrawn.', 'info');
  };

  const approveJoinRequest = (groupId: string, userId: string) => {
    const foundProfile = profiles.find((p) => p.id === userId);
    const memberName = foundProfile ? foundProfile.name : 'Applicant';

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const currentMembers = c.memberIds || ['user_me'];
          const updatedMembers = currentMembers.includes(userId) ? currentMembers : [...currentMembers, userId];
          const updatedRequests = (c.pendingJoinRequests || []).filter((r) => r.userId !== userId);
          return {
            ...c,
            memberIds: updatedMembers,
            memberCount: updatedMembers.length,
            pendingJoinRequests: updatedRequests
          };
        }
        return c;
      })
    );
    showToast('Request Approved', `${memberName} is now a member of this group!`, 'success');
  };

  const rejectJoinRequest = (groupId: string, userId: string) => {
    const foundProfile = profiles.find((p) => p.id === userId);
    const memberName = foundProfile ? foundProfile.name : 'Applicant';

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          return {
            ...c,
            pendingJoinRequests: (c.pendingJoinRequests || []).filter((r) => r.userId !== userId)
          };
        }
        return c;
      })
    );
    showToast('Request Declined', `${memberName}'s request was declined.`, 'info');
  };

  const leaveCommunity = (groupId: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const updatedMembers = (c.memberIds || []).filter((id) => id !== currentUser.id);
          const updatedAdmins = (c.adminIds || []).filter((id) => id !== currentUser.id);
          return {
            ...c,
            memberIds: updatedMembers,
            adminIds: updatedAdmins,
            memberCount: Math.max(0, updatedMembers.length)
          };
        }
        return c;
      })
    );
    if (activeCommunityId === groupId) {
      setActiveCommunityId(null);
    }
    showToast('Left Group', 'You have left the community channel.', 'info');
  };

  const addCommunityGroup = (group: { name: string; description: string; category: string; iconType?: CommunityGroup['iconType'] }): string => {
    const newId = `comm_${Date.now()}`;
    const newGroup: CommunityGroup = {
      id: newId,
      name: group.name,
      description: group.description,
      category: group.category || 'General',
      iconType: group.iconType || 'custom',
      iconBgColor: '#EFF6FF',
      iconColor: '#2554EB',
      memberCount: 1,
      isOfficial: false,
      isPinned: false,
      unreadCount: 0,
      lastMessage: 'Group created',
      lastMessageTime: 'Just now',
      creatorId: currentUser.id,
      adminIds: [currentUser.id],
      memberIds: [currentUser.id],
      isLocked: false,
      pendingJoinRequests: []
    };

    setCommunities((prev) => [newGroup, ...prev]);
    setCommunityMessages((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `cmsg_init_${Date.now()}`,
          groupId: newId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          senderRole: currentUser.title,
          isVerified: currentUser.isVerified,
          text: `Welcome to ${group.name}! 🎉`,
          createdAt: 'Just now'
        }
      ]
    }));

    showToast('Community Group Created!', `${group.name} is now live. You are the Admin.`, 'success');
    return newId;
  };

  const joinCommunity = (groupId: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === groupId) {
          const currentMembers = c.memberIds || [];
          if (!currentMembers.includes(currentUser.id)) {
            const updated = [...currentMembers, currentUser.id];
            return { ...c, memberIds: updated, memberCount: updated.length };
          }
        }
        return c;
      })
    );
    showToast('Joined Community', 'You are now a member of this channel.', 'success');
  };

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeGetItem('skc_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const addReview = (jobId: string, jobTitle: string, revieweeId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      jobId,
      jobTitle,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      revieweeId,
      rating,
      comment,
      createdAt: 'Just now',
      verifiedOnChain: true
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast('Review & Rating Submitted', 'Recorded permanently on-chain!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        setThemeMode,
        isDark,
        toggleDarkMode,

        // Auth & Session
        authToken,
        tokenExpiry,
        isAuthenticated,
        isOnboarded: currentUser.isOnboarded ?? true,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        login,
        checkCredentials,
        logout,
        completeOnboarding,

        // Documents
        addUserDocument,
        updateUserDocument,
        deleteUserDocument,
        toggleDefaultDocument,

        // Bookmarks
        isBookmarkedJobsModalOpen,
        setIsBookmarkedJobsModalOpen,

        currentUser,
        setCurrentUser,
        profiles,

        activeTab,
        setActiveTab,

        isSplashVisible,
        setIsSplashVisible,
        triggerSplashScreen,

        isWalletConnected,
        walletAddress,
        setWalletAddress,
        solBalance,
        setSolBalance,
        skrBalance,
        walletType,
        connectWallet,
        disconnectWallet,
        sendTipSol,
        addTransaction,

        posts,
        addPost,
        appendPosts,
        toggleLikePost,
        addCommentPost,
        toggleLikeComment,
        toggleRepost,
        deletePost,
        editPost,
        toggleBookmarkPost,

        jobs,
        addJob,
        toggleSaveJob,

        applications,
        applyForJob,

        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        createConversationWith,
        markConversationAsRead,
        receiveRealtimeMessage,

        communities,
        communityMessages,
        activeCommunityId,
        setActiveCommunityId,
        sendCommunityMessage,
        toggleCommunityMessageLike,
        toggleCommunityMessagePin,
        deleteCommunityMessage,
        editCommunityMessage,
        addCommunityMember,
        removeCommunityMember,
        toggleCommunityAdmin,
        toggleCommunityLock,
        updateCommunityDetails,
        requestToJoinCommunity,
        cancelJoinRequest,
        approveJoinRequest,
        rejectJoinRequest,
        leaveCommunity,
        addCommunityGroup,
        joinCommunity,

        payments,
        escrows: payments,
        sendDirectPayment,
        createEscrowMilestone,
        fundEscrow,
        releaseEscrow,
        disputeEscrow,

        transactions,
        notifications,
        unreadNotifsCount,
        markNotifAsRead,
        markAllNotifsAsRead,

        reviews,
        addReview,

        toasts,
        showToast,
        removeToast,

        searchQuery,
        setSearchQuery,

        viewingProfile,
        setViewingProfile,
        viewProfileById,
        closeProfile,
        goBack,
        followedUserIds,
        toggleFollowUser,

        isNotificationsOpen,
        setIsNotificationsOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isCreatePostModalOpen,
        setIsCreatePostModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        shareModalData,
        openShareModal,
        closeShareModal,

        isTabBarVisible,
        setIsTabBarVisible
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
