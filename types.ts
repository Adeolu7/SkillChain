export type ThemeMode = 'light' | 'dark' | 'system';

export type TabType = 'home' | 'discover' | 'jobs' | 'chat' | 'wallet' | 'profile';

export type UserRole = 'talent' | 'client' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  isVerified: boolean;
  walletAddress: string;
  solana_address?: string | null;
  ethereum_address?: string | null;
  hourlyRateSol: number;
  hourlyRateAmount?: number;
  preferredCurrency?: 'SOL' | 'USDC' | 'USDT';
  rating: number;
  reviewCount: number;
  skills: string[];
  chains: string[];
  role: UserRole;
  isOnline: boolean;
  location: string;
  jobTypes?: string[]; // e.g. ['Remote', 'Full-time', 'Contract']
  completedJobsCount: number;
  totalEarnedSol: number;
  joinedDate: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolio: {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    link?: string;
    tags: string[];
  }[];
  experience: {
    id: string;
    role: string;
    company: string;
    period: string;
    verifiedOnChain: boolean;
    txHash?: string;
    description: string;
  }[];
  credentials: {
    id: string;
    title: string;
    issuer: string;
    issuedDate: string;
    badgeIcon: string;
    verifiedOnChain: boolean;
    txHash: string;
  }[];
  coverImage?: string;
  savedJobIds?: string[];
  documents?: UserCredentialDocument[];
  isOnboarded?: boolean;
}

export interface UserCredentialDocument {
  id: string;
  type: 'cv' | 'resume' | 'cover_letter' | 'certificate' | 'license' | 'degree' | 'other';
  title: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt: string;
  isDefault?: boolean;
  verifiedOnChain?: boolean;
  txHash?: string;
  description?: string;
}

export interface CommunityJoinRequest {
  userId: string;
  userName?: string;
  userAvatar?: string;
  userTitle?: string;
  userHandle?: string;
  requestedAt: string;
  note?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  iconType: 'announcement' | 'solana' | 'security' | 'rust' | 'design' | 'custom';
  iconBgColor?: string;
  iconColor?: string;
  memberCount: number;
  isOfficial?: boolean;
  isPinned?: boolean;
  category: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  creatorId?: string;
  adminIds?: string[];
  memberIds?: string[];
  isLocked?: boolean;
  pendingJoinRequests?: CommunityJoinRequest[];
}

export interface CommunityMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  senderTitle?: string;
  senderBadge?: 'link' | 'admin' | 'verified';
  isVerified: boolean;
  text: string;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
  isPinned?: boolean;
  read?: boolean;
}

export type PostType = 'general' | 'job_announcement' | 'portfolio_showcase';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorHandle: string;
  isVerified: boolean;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorTitle?: string;
  authorWallet?: string;
  type: PostType;
  content: string;
  hashtags: string[];
  mediaUrl?: string;
  mediaUrls?: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  comments: PostComment[];
  jobDetails?: {
    jobId?: string;
    budgetSol: number;
    skills: string[];
  };
  profile?: {
    full_name?: string;
    avatar_url?: string;
    solana_address?: string;
  } | null;
}

export type JobType = 'REMOTE' | 'HYBRID' | 'ON-SITE';
export type ContractType = 'CONTRACT' | 'FULL-TIME' | 'PART-TIME' | 'MILESTONE-BASED';

export interface Job {
  id: string;
  title: string;
  posterId: string;
  posterName: string;
  posterAvatar: string;
  posterCompany: string;
  posterVerified: boolean;
  posterEmail?: string;
  submissionDestination?: string;
  jobType: JobType;
  contractType: ContractType;
  payRangeSol: string;
  budgetSol: number;
  skills: string[];
  chains: string[];
  description: string;
  requirements: string[];
  postedAt: string;
  applicantsCount: number;
  isSaved?: boolean;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
  location?: string;
  duration?: string;
  category?: 'bounties' | 'contract' | 'remote' | 'full-time' | string;
  tag?: string;
  rateDisplay?: string;
}

export type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'hired' | 'rejected' | 'paid';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  portfolioUrl?: string;
  submissionDestination?: string;
  coverLetter: string;
  proposedRateSol: number;
  attachedDocuments?: UserCredentialDocument[];
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export type PaymentCurrency = 'SOL' | 'USDC' | 'USDT';

export interface DirectPayment {
  id: string;
  jobId?: string;
  jobTitle: string;
  clientName: string;
  clientId: string;
  talentName: string;
  talentId: string;
  amount: number;
  amountSol?: number;
  currency: PaymentCurrency;
  status: 'CONFIRMED' | 'PENDING' | 'RELEASED';
  createdAt: string;
  recipientAddress: string;
  txHash: string;
  notes?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'PAYMENT_SENT' | 'PAYMENT_RECEIVED' | 'TIP_SENT' | 'TIP_RECEIVED' | 'TRANSFER' | 'FEE';
  amount: number;
  amountSol?: number;
  currency?: PaymentCurrency;
  counterpartyName: string;
  counterpartyAddress: string;
  txHash: string;
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
}

export interface NotificationItem {
  id: string;
  type: 'message' | 'job_status' | 'payment' | 'match' | 'like' | 'comment';
  title: string;
  message: string;
  amountTag?: string;
  createdAt: string;
  isRead: boolean;
  linkTab?: string;
  targetId?: string;
}

export interface Review {
  id: string;
  jobId: string;
  jobTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedOnChain: boolean;
}
