import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import { UserCredentialDocument } from '../../types';
import { supabase } from '../../constants/Supabase';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Edit3,
  Camera,
  Plus,
  Star,
  ExternalLink,
  MapPin,
  Calendar,
  X,
  Heart,
  Repeat2,
  MessageSquare,
  Share2,
  Briefcase,
  Award,
  Check,
  Globe,
  Bookmark,
  FileText,
  Upload,
  Trash2,
  FileCheck,
  DownloadCloud,
  RefreshCw,
  Eye,
  FolderUp,
  FileCode
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;
const TouchableOpacityKey = TouchableOpacity as any;

const COVER_PRESETS = [
  {
    id: 'art_desk',
    name: 'Art Studio Notebook & Pastels',
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'solana_dark',
    name: 'Crypto 3D Abstract',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'workspace_wood',
    name: 'Modern Workspace Desk',
    url: 'https://images.unsplash.com/photo-1507842229451-79b1be88688e?w=1200&auto=format&fit=crop&q=80'
  }
];

export const ProfileTab: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    reviews,
    posts,
    jobs,
    toggleSaveJob,
    setActiveTab: setActiveTabApp,
    toggleLikePost,
    toggleRepost,
    setIsCreatePostModalOpen,
    showToast,
    setIsBookmarkedJobsModalOpen,
    addUserDocument,
    updateUserDocument,
    deleteUserDocument,
    toggleDefaultDocument,
    isDark
  } = useApp();

  const isEmployer = currentUser.role === 'client';
  const [activeTab, setActiveTab] = useState<'portfolio' | 'posts' | 'credentials' | 'reviews' | 'overview' | 'gigs' | 'bookmarks'>(
    currentUser.role === 'client' ? 'overview' : 'portfolio'
  );

  // Cover image state
  const [coverUrl, setCoverUrl] = useState<string>(
    currentUser.coverImage || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80'
  );
  const [isEditCoverModalOpen, setIsEditCoverModalOpen] = useState(false);
  const [customCoverInput, setCustomCoverInput] = useState('');

  // Native file input refs for mobile/web device image upload
  const avatarFileInputRef = React.useRef<any>(null);
  const coverFileInputRef = React.useRef<any>(null);

  const handleAvatarFileSelect = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCurrentUser({ ...currentUser, avatar: result });
          showToast('Profile Photo Updated', 'Your profile picture has been updated from your device.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileSelect = (e: any) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCoverUrl(result);
          setCurrentUser({ ...currentUser, coverImage: result });
          setIsEditCoverModalOpen(false);
          showToast('Cover Photo Updated', 'Your cover photo has been updated from your device.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editTitle, setEditTitle] = useState(currentUser.title);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editHourlyRate, setEditHourlyRate] = useState(
    String(currentUser.hourlyRateAmount || currentUser.hourlyRateSol || (currentUser.preferredCurrency === 'USDC' || currentUser.preferredCurrency === 'USDT' ? '65' : '2.5'))
  );
  const [editCurrency, setEditCurrency] = useState<'SOL' | 'USDC' | 'USDT'>(
    currentUser.preferredCurrency || 'SOL'
  );
  const [editSkills, setEditSkills] = useState(currentUser.skills.join(', '));
  const [editLocation, setEditLocation] = useState(currentUser.location || 'San Francisco, CA');
  const [editJobTypes, setEditJobTypes] = useState<string[]>(currentUser.jobTypes || ['Remote', 'Contract', 'Full-time']);

  // Add Document Modal state
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<UserCredentialDocument['type']>('cv');
  const [newDocDesc, setNewDocDesc] = useState('');

  // Edit / Replace Document Modal state (Changed on click)
  const [editingDoc, setEditingDoc] = useState<UserCredentialDocument | null>(null);
  const [editDocTitle, setEditDocTitle] = useState('');
  const [editDocFileName, setEditDocFileName] = useState('');
  const [editDocType, setEditDocType] = useState<UserCredentialDocument['type']>('cv');
  const [editDocDesc, setEditDocDesc] = useState('');
  const [editDocIsDefault, setEditDocIsDefault] = useState(false);

  // Add Project Modal state
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('DEFI');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectImg, setNewProjectImg] = useState('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80');
  const [newProjectTags, setNewProjectTags] = useState('Rust, Anchor, Solana');

  const myPosts = posts.filter((p) => p.authorId === currentUser.id);
  const bookmarkedJobs = jobs.filter((j) => j.isSaved || (currentUser.savedJobIds || []).includes(j.id));
  const userDocs = currentUser.documents || [];

  const handleCopyWallet = () => {
    showToast('Copied Address', currentUser.walletAddress, 'success');
  };

  const handleSaveNewDocument = () => {
    if (!newDocTitle.trim()) {
      showToast('Missing Title', 'Please enter a document title.', 'warning');
      return;
    }
    addUserDocument({
      type: newDocType,
      title: newDocTitle.trim(),
      fileName: `${newDocTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: '420 KB',
      description: newDocDesc.trim() || undefined,
      isDefault: userDocs.filter((d) => d.type === newDocType).length === 0
    });
    setNewDocTitle('');
    setNewDocDesc('');
    setIsAddDocModalOpen(false);
  };

  const openEditDocModal = (doc: UserCredentialDocument) => {
    setEditingDoc(doc);
    setEditDocTitle(doc.title);
    setEditDocFileName(doc.fileName);
    setEditDocType(doc.type);
    setEditDocDesc(doc.description || '');
    setEditDocIsDefault(Boolean(doc.isDefault));
  };

  const handleSaveDocEdits = () => {
    if (!editingDoc) return;
    if (!editDocTitle.trim()) {
      showToast('Missing Title', 'Please enter a document title.', 'warning');
      return;
    }
    updateUserDocument(editingDoc.id, {
      title: editDocTitle.trim(),
      fileName: editDocFileName.trim() || `${editDocTitle.trim().replace(/\s+/g, '_')}.pdf`,
      type: editDocType,
      description: editDocDesc.trim() || undefined,
      isDefault: editDocIsDefault
    });
    setEditingDoc(null);
  };

  const toggleJobTypeSelection = (type: string) => {
    setEditJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSaveProfile = async () => {
    const skillsArr = editSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const rateNum = parseFloat(editHourlyRate) || (editCurrency === 'SOL' ? 2.5 : 65);

    const updatedUser = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      title: editTitle.trim() || currentUser.title,
      bio: editBio.trim() || currentUser.bio,
      location: editLocation.trim() || currentUser.location,
      jobTypes: editJobTypes.length > 0 ? editJobTypes : currentUser.jobTypes,
      skills: skillsArr.length > 0 ? skillsArr : currentUser.skills,
      preferredCurrency: editCurrency,
      hourlyRateAmount: rateNum,
      hourlyRateSol: editCurrency === 'SOL' ? rateNum : (rateNum / 160)
    };

    setCurrentUser(updatedUser);

    if (currentUser?.id) {
      try {
        await supabase.from('profile').update({
          full_name: updatedUser.name,
          title: updatedUser.title,
          bio: updatedUser.bio,
          location: updatedUser.location,
          skills: updatedUser.skills,
          hourly_rate: updatedUser.hourlyRateSol
        }).eq('id', currentUser.id);
      } catch (err) {
        console.warn('[ProfileTab] Supabase profile sync:', err);
      }
    }

    setIsEditModalOpen(false);
    showToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const handleSaveCover = (url: string) => {
    setCoverUrl(url);
    setIsEditCoverModalOpen(false);
    showToast('Cover Updated', 'Profile cover banner changed successfully.', 'success');
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) {
      showToast('Missing Title', 'Please enter a project title.', 'warning');
      return;
    }

    const tagsArr = newProjectTags.split(',').map((t) => t.trim()).filter(Boolean);
    const newProj = {
      id: `proj_${Date.now()}`,
      title: newProjectTitle.trim(),
      imageUrl: newProjectImg.trim() || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
      description: newProjectDesc.trim() || 'Verified Solana decentralized application delivery.',
      tags: tagsArr.length > 0 ? tagsArr : [newProjectCategory, 'Solana']
    };

    const updatedPortfolio = [newProj, ...(currentUser.portfolio || [])];
    setCurrentUser({
      ...currentUser,
      portfolio: updatedPortfolio
    });

    setIsAddProjectModalOpen(false);
    setNewProjectTitle('');
    setNewProjectDesc('');
    showToast('Project Added', `${newProj.title} is now showcased in your portfolio.`, 'success');
  };

  // Format shortened wallet for display (e.g. 0xFa...3xFa)
  const displayWalletShort = currentUser.walletAddress
    ? (currentUser.walletAddress.length > 10
        ? `${currentUser.walletAddress.slice(0, 4)}...${currentUser.walletAddress.slice(-4)}`
        : currentUser.walletAddress)
    : '0xFa...3xFa';

  const portfolioItems = currentUser.portfolio && currentUser.portfolio.length > 0
    ? currentUser.portfolio
    : [
        {
          id: 'p1',
          title: 'Drift-like DEX Perpetual Engine',
          imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
          description: 'Low latency on-chain orderbook matcher written in Rust Anchor with dynamic slippage controls.',
          tags: ['DEFI', 'Rust', 'Solana']
        },
        {
          id: 'p2',
          title: 'Solana Direct Payment SDK',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          description: 'Open-source library for instant milestone payments on Solana Mainnet with multisig fallback.',
          tags: ['PAYMENTS', 'Anchor', 'Security']
        },
        {
          id: 'p3',
          title: 'Liquid Staking Yield Aggregator',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          description: 'Automated staking optimizer rebalancing SOL across top validated staking pools.',
          tags: ['DEFI', 'Staking', 'Web3']
        },
        {
          id: 'p4',
          title: 'Anchor Program Security Scanner',
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
          description: 'Automated static analysis tool checking for reentrancy and missing PDA signer checks.',
          tags: ['SECURITY', 'Audit', 'Rust']
        }
      ];

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      
      {/* Hidden file inputs for device photo picker */}
      {typeof document !== 'undefined' && (
        <>
          <input
            type="file"
            ref={avatarFileInputRef as any}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarFileSelect}
          />
          <input
            type="file"
            ref={coverFileInputRef as any}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleCoverFileSelect}
          />
        </>
      )}

      {/* =========================================================
          TOP COVER BANNER (MATCHING SCREENSHOT)
         ========================================================= */}
      <View style={styles.bannerWrapper}>
        <Image
          source={{ uri: coverUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Top-Left: Edit Cover Button */}
        <TouchableOpacity
          onPress={() => setIsEditCoverModalOpen(true)}
          style={styles.editCoverBtn}
          activeOpacity={0.85}
        >
          <Camera size={13} color="#FFFFFF" />
          <Text style={styles.editCoverText}>Edit Cover</Text>
        </TouchableOpacity>

        {/* Top-Right: VERIFIED ACCOUNT / EMPLOYER Badge */}
        <View style={styles.verifiedAccountBadge}>
          <Text style={styles.verifiedAccountText}>
            {isEmployer ? 'VERIFIED EMPLOYER' : 'VERIFIED ACCOUNT'}
          </Text>
        </View>
      </View>

      {/* =========================================================
          PROFILE HEADER CARD & DETAILS (MATCHING SCREENSHOT)
         ========================================================= */}
      <View style={[styles.profileHeaderCard, isDark && styles.profileHeaderCardDark]}>
        
        {/* Row with Overlapping Avatar on Left & Action Buttons on Right */}
        <View style={styles.avatarAndActionsRow}>
          
          {/* Avatar with Camera Tap to change photo from device */}
          <TouchableOpacity
            onPress={() => {
              if (avatarFileInputRef.current) {
                avatarFileInputRef.current.click();
              }
            }}
            activeOpacity={0.85}
            style={styles.avatarWrapper}
            accessibilityLabel="Change profile picture"
          >
            <Image
              source={{ uri: currentUser.avatar }}
              style={[styles.avatarImg, isDark && { borderColor: '#1E293B', backgroundColor: '#0F172A' }]}
            />
            {/* Camera Overlay Badge on Avatar */}
            <View style={styles.avatarCameraBadge}>
              <Camera size={12} color="#FFFFFF" />
            </View>
            {/* Green Online Dot */}
            <View style={[styles.onlineDot, isDark && { borderColor: '#1E293B' }]} />
          </TouchableOpacity>

          {/* Right Action Buttons: Edit Profile & Copy Wallet */}
          <View style={styles.actionsRightGroup}>
            
            {/* Edit Profile Button (Solid Blue) */}
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(true)}
              style={styles.editProfileBtn}
              activeOpacity={0.85}
            >
              <Edit3 size={14} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            {/* Wallet Address Chip (Light Blue) */}
            <TouchableOpacity
              onPress={handleCopyWallet}
              style={[styles.walletChipBtn, isDark && styles.walletChipBtnDark]}
              activeOpacity={0.8}
            >
              <Copy size={13} color={isDark ? '#60A5FA' : '#2554EB'} strokeWidth={2} />
              <Text style={[styles.walletChipText, isDark && styles.walletChipTextDark]}>{displayWalletShort}</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Name, Verification Badge & Location on the same line */}
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, isDark && styles.nameTextDark]}>{currentUser.name}</Text>
          <ShieldCheck size={18} color="#2554EB" strokeWidth={2.5} />
          {currentUser.location ? (
            <View style={[styles.nameLocationBadge, isDark && styles.nameLocationBadgeDark]}>
              <MapPin size={12} color={isDark ? '#60A5FA' : '#2554EB'} />
              <Text style={[styles.nameLocationText, isDark && styles.nameLocationTextDark]}>
                {currentUser.location}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Bio Description */}
        <Text style={[styles.bioText, isDark && styles.bioTextDark]}>
          {currentUser.bio || (isEmployer ? 'Leading venture-backed Solana ecosystem initiatives. We hire verified smart contract engineers, UI architects, and protocol security auditors.' : 'Building high-performance DeFi protocols and smart contracts on Solana. 5+ years in Rust & Web3 architecture.')}
        </Text>

        {/* Open-to Job Types / Hiring Focus */}
        {currentUser.jobTypes && currentUser.jobTypes.length > 0 ? (
          <View style={styles.locationJobTypeSection}>
            <View style={styles.jobTypesBadgeRow}>
              <Text style={[styles.jobTypesLabel, isDark && styles.jobTypesLabelDark]}>
                {isEmployer ? 'Hiring for:' : 'Open to:'}
              </Text>
              {currentUser.jobTypes.map((jt, jIdx) => (
                <ViewKey key={jIdx} style={[styles.jobTypePill, isDark && styles.jobTypePillDark]}>
                  <Briefcase size={10} color={isDark ? '#4ADE80' : '#166534'} />
                  <Text style={[styles.jobTypePillText, isDark && styles.jobTypePillTextDark]}>{jt}</Text>
                </ViewKey>
              ))}
            </View>
          </View>
        ) : null}

        {/* =========================================================
            3-METRIC STATS CARDS GRID
           ========================================================= */}
        <View style={styles.statsCardsRow}>
          
          {/* 1. Total Volume / Earned */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <Text style={[styles.statCardLabel, isDark && styles.statCardLabelDark]}>{isEmployer ? 'Total Paid Out' : 'Total Earned'}</Text>
            <Text style={[styles.statCardValueDark, isDark && styles.statCardValueDarkDark]}>
              {isEmployer ? (currentUser.totalEarnedSol || 520) : (currentUser.totalEarnedSol || 380)} SOL
            </Text>
          </View>

          {/* 2. Rate / Active Gigs */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <Text style={[styles.statCardLabel, isDark && styles.statCardLabelDark]}>{isEmployer ? 'Gigs Posted' : 'Hourly Rate'}</Text>
            <Text style={styles.statCardValueBlue}>
              {isEmployer ? '8 Active' : `${currentUser.hourlyRateAmount || currentUser.hourlyRateSol || (currentUser.preferredCurrency === 'USDC' || currentUser.preferredCurrency === 'USDT' ? 65 : 2.5)} ${currentUser.preferredCurrency || 'SOL'}/hr`}
            </Text>
          </View>

          {/* 3. Followers / Following / Payment Rating */}
          <View style={[styles.statCard, isDark && styles.statCardDark]}>
            {isEmployer ? (
              <>
                <Text style={[styles.statCardLabel, isDark && styles.statCardLabelDark]}>Payment Rating</Text>
                <Text style={styles.statCardValueGreen}>100% Funded</Text>
              </>
            ) : (
              <View style={styles.socialStatsRow}>
                <View style={styles.socialStatItem}>
                  <Text style={[styles.socialStatValue, isDark && styles.socialStatValueDark]}>128</Text>
                  <Text style={[styles.socialStatLabel, isDark && styles.socialStatLabelDark]}>Followers</Text>
                </View>
                <View style={[styles.socialStatDivider, isDark && styles.socialStatDividerDark]} />
                <View style={styles.socialStatItem}>
                  <Text style={[styles.socialStatValue, isDark && styles.socialStatValueDark]}>84</Text>
                  <Text style={[styles.socialStatLabel, isDark && styles.socialStatLabelDark]}>Following</Text>
                </View>
              </View>
            )}
          </View>

        </View>

      </View>

      {/* =========================================================
          SEGMENTED TAB PILLS ROW
         ========================================================= */}
      <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
        {isEmployer ? (
          <>
            {/* Overview Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('overview')}
              style={[
                styles.tabPill,
                activeTab === 'overview' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'overview' && styles.tabPillTextActive
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            {/* Posted Gigs Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('gigs')}
              style={[
                styles.tabPill,
                activeTab === 'gigs' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'gigs' && styles.tabPillTextActive
                ]}
              >
                Posted Gigs
              </Text>
            </TouchableOpacity>

            {/* Posts Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              style={[
                styles.tabPill,
                activeTab === 'posts' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'posts' && styles.tabPillTextActive
                ]}
              >
                Updates
              </Text>
            </TouchableOpacity>

            {/* Reviews Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              style={[
                styles.tabPill,
                activeTab === 'reviews' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'reviews' && styles.tabPillTextActive
                ]}
              >
                Endorsements
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Portfolio Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('portfolio')}
              style={[
                styles.tabPill,
                activeTab === 'portfolio' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'portfolio' && styles.tabPillTextActive
                ]}
              >
                Portfolio
              </Text>
            </TouchableOpacity>

            {/* Posts Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('posts')}
              style={[
                styles.tabPill,
                activeTab === 'posts' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'posts' && styles.tabPillTextActive
                ]}
              >
                Posts
              </Text>
            </TouchableOpacity>

            {/* Credentials Pill (FREELANCER ONLY) */}
            <TouchableOpacity
              onPress={() => setActiveTab('credentials')}
              style={[
                styles.tabPill,
                activeTab === 'credentials' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'credentials' && styles.tabPillTextActive
                ]}
              >
                Credentials
              </Text>
            </TouchableOpacity>

            {/* Reviews Pill */}
            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              style={[
                styles.tabPill,
                activeTab === 'reviews' && styles.tabPillActive
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isDark && styles.tabPillTextDark,
                  activeTab === 'reviews' && styles.tabPillTextActive
                ]}
              >
                Reviews
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* =========================================================
          TAB: EMPLOYER OVERVIEW
         ========================================================= */}
      {isEmployer && activeTab === 'overview' && (
        <View style={styles.tabSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>Company & Hiring Organization</Text>
          </View>

          <View style={[styles.cardBoxWrapper, isDark && styles.cardBoxWrapperDark]}>
            <View style={styles.employerCompanyHeader}>
              <View style={[styles.employerIconBadge, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <Briefcase size={20} color="#2554EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.employerOrgName, isDark && styles.textWhite]}>
                  {currentUser.name} Organization
                </Text>
                <Text style={[styles.employerOrgSub, isDark && styles.textMutedDark]}>
                  Verified Tier-1 Solana Hiring Partner • Direct Settlement
                </Text>
              </View>
            </View>

            <View style={[styles.cardDividerLight, isDark && styles.cardDividerLightDark]} />

            <Text style={[styles.employerAboutTitle, isDark && styles.textWhite]}>About the Company</Text>
            <Text style={[styles.employerAboutDesc, isDark && styles.textMutedDark]}>
              {currentUser.bio || 'We engineer decentralized finance protocols, real-world asset tokenization rails, and smart contract payment gateways on Solana. We actively hire top talent for contract milestones and full-time Web3 roles.'}
            </Text>

            <View style={styles.employerMetaGrid}>
              <View style={[styles.employerMetaItem, isDark && styles.employerMetaItemDark]}>
                <Text style={[styles.employerMetaLabel, isDark && styles.textMutedDark]}>Headquarters</Text>
                <Text style={[styles.employerMetaVal, isDark && styles.textWhite]}>{currentUser.location || 'San Francisco, CA'}</Text>
              </View>
              <View style={[styles.employerMetaItem, isDark && styles.employerMetaItemDark]}>
                <Text style={[styles.employerMetaLabel, isDark && styles.textMutedDark]}>Payment Rails</Text>
                <Text style={[styles.employerMetaVal, isDark && styles.textWhite]}>Solana Pay / USDC / SOL</Text>
              </View>
              <View style={[styles.employerMetaItem, isDark && styles.employerMetaItemDark]}>
                <Text style={[styles.employerMetaLabel, isDark && styles.textMutedDark]}>Average Payout Time</Text>
                <Text style={[styles.employerMetaVal, isDark && styles.textWhite]}>Instant via Direct Milestone Transfer</Text>
              </View>
              <View style={[styles.employerMetaItem, isDark && styles.employerMetaItemDark]}>
                <Text style={[styles.employerMetaLabel, isDark && styles.textMutedDark]}>Verified Hirer Since</Text>
                <Text style={[styles.employerMetaVal, isDark && styles.textWhite]}>October 2024</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* =========================================================
          TAB: EMPLOYER POSTED GIGS
         ========================================================= */}
      {isEmployer && activeTab === 'gigs' && (
        <View style={styles.tabSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>
              Active Posted Gigs ({jobs.slice(0, 3).length})
            </Text>
            <TouchableOpacity
              onPress={() => setActiveTabApp('jobs')}
              style={styles.addProjectBtn}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addProjectBtnText}>Post New Gig</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewsList}>
            {jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                badge="Gigs & Bounties"
                title="No active gigs posted"
                description="Post your first contract milestone or bug bounty to recruit top Solana talent."
                actionLabel="Post New Gig"
                onAction={() => setActiveTabApp('jobs')}
              />
            ) : (
              jobs.slice(0, 3).map((job) => (
              <ViewKey key={job.id} style={[styles.savedJobCard, isDark && styles.savedJobCardDark]}>
                <View style={styles.savedJobHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.savedJobTitle, isDark && styles.savedJobTitleDark]}>{job.title}</Text>
                    <Text style={[styles.savedJobCompany, isDark && styles.textMutedDark]}>Posted by {currentUser.name} • {job.postedAt || '2 days ago'}</Text>
                  </View>
                  <View style={[styles.activeGigStatusBadge, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.2)', borderColor: '#059669' }]}>
                    <Text style={styles.activeGigStatusText}>ACTIVE</Text>
                  </View>
                </View>

                <Text style={[styles.savedJobDescription, isDark && styles.savedJobDescriptionDark]} numberOfLines={2}>
                  {job.description}
                </Text>

                <View style={styles.savedJobMetaRow}>
                  <View style={[styles.savedJobBudgetTag, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.2)', borderColor: '#059669' }]}>
                    <Text style={styles.savedJobBudgetText}>{job.budgetSol} SOL</Text>
                  </View>
                  <View style={[styles.savedJobPill, isDark && styles.savedJobPillDark]}>
                    <Text style={[styles.savedJobPillText, isDark && styles.savedJobPillTextDark]}>{job.contractType || 'Fixed Bounty'}</Text>
                  </View>
                  <View style={[styles.savedJobPill, isDark && styles.savedJobPillDark]}>
                    <Text style={[styles.savedJobPillText, isDark && styles.savedJobPillTextDark]}>4 Proposals</Text>
                  </View>
                </View>
              </ViewKey>
            ))
            )}
          </View>
        </View>
      )}

      {/* =========================================================
          TAB 1: PORTFOLIO (FEATURED WORKS + ADD PROJECT)
         ========================================================= */}
      {activeTab === 'portfolio' && (
        <View style={styles.tabSection}>
          
          {/* Header Row: Featured Works (4) & + Add Project Button */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>
              Featured Works ({portfolioItems.length})
            </Text>

            <TouchableOpacity
              onPress={() => setIsAddProjectModalOpen(true)}
              style={styles.addProjectBtn}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addProjectBtnText}>Add Project</Text>
            </TouchableOpacity>
          </View>

          {/* Portfolio Cards Grid */}
          <View style={styles.portfolioList}>
            {portfolioItems.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                badge="Showcase"
                title="No projects showcased yet"
                description="Add your first Web3 project, dApp, or smart contract audit to prove your on-chain expertise."
                actionLabel="Add Project"
                onAction={() => setIsAddProjectModalOpen(true)}
              />
            ) : (
              portfolioItems.map((item, idx) => {
              const categoryTag = (item.tags && item.tags[0]) ? item.tags[0].toUpperCase() : 'DEFI';

              return (
                <ViewKey key={item.id || idx} style={[styles.workCard, isDark && styles.workCardDark]}>
                  {/* Card Image Cover with Category Badge in top left */}
                  <View style={styles.workImageWrapper}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.workImage}
                      resizeMode="cover"
                    />
                    {/* Category Overlay Tag */}
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{categoryTag}</Text>
                    </View>
                  </View>

                  {/* Card Details */}
                  <View style={styles.workBody}>
                    <Text style={[styles.workTitle, isDark && styles.workTitleDark]}>{item.title}</Text>
                    <Text style={[styles.workDesc, isDark && styles.workDescDark]} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {/* Tag Pills */}
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.workTagsRow}>
                        {item.tags.map((tag, tIdx) => (
                          <ViewKey key={tIdx} style={[styles.workTagChip, isDark && styles.workTagChipDark]}>
                            <Text style={[styles.workTagChipText, isDark && styles.workTagChipTextDark]}>{tag}</Text>
                          </ViewKey>
                        ))}
                      </View>
                    )}
                  </View>
                </ViewKey>
              );
            })
            )}
          </View>

        </View>
      )}

      {/* =========================================================
          TAB 2: POSTS
         ========================================================= */}
      {activeTab === 'posts' && (
        <View style={styles.tabSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>
              My Published Posts ({myPosts.length > 0 ? myPosts.length : 1})
            </Text>
          </View>

          {myPosts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              badge="Community Feed"
              title="No published posts yet"
              description="Share thoughts, milestone releases, or technical insights with the builder network."
              actionLabel="Create a Post"
              onAction={() => setActiveTabApp('home')}
            />
          ) : (
            myPosts.map((post) => (
              <ViewKey key={post.id} style={[styles.postCard, isDark && styles.postCardDark]}>
                <View style={styles.postAuthorRow}>
                  <Image source={{ uri: currentUser.avatar }} style={styles.postAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.postAuthorName, isDark && styles.postAuthorNameDark]}>{currentUser.name}</Text>
                    <Text style={[styles.postAuthorHandle, isDark && styles.textMutedDark]}>{currentUser.handle}</Text>
                  </View>
                  <Text style={styles.postTime}>{post.createdAt}</Text>
                </View>
                <Text style={[styles.postContent, isDark && styles.postContentDark]}>{post.content.replace(/\*\*/g, '')}</Text>
                {post.mediaUrl && (
                  <Image source={{ uri: post.mediaUrl }} style={styles.postMedia} resizeMode="cover" />
                )}
                <View style={[styles.postActions, isDark && { borderTopColor: '#334155' }]}>
                  <TouchableOpacity onPress={() => toggleLikePost(post.id)} style={styles.postActionBtn}>
                    <Heart
                      size={14}
                      color={post.isLiked ? '#EF4444' : '#64748B'}
                      fill={post.isLiked ? '#EF4444' : 'none'}
                    />
                    <Text style={[styles.postActionText, isDark && styles.postActionTextDark, post.isLiked && { color: '#EF4444' }]}>
                      {post.likesCount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleRepost(post.id)} style={styles.postActionBtn}>
                    <Repeat2 size={14} color={post.isReposted ? (isDark ? '#F8FAFC' : '#0F172A') : '#64748B'} />
                    <Text style={[styles.postActionText, isDark && styles.postActionTextDark]}>{post.repostsCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postActionBtn}>
                    <MessageSquare size={14} color="#64748B" />
                    <Text style={[styles.postActionText, isDark && styles.postActionTextDark]}>{post.commentsCount || 0}</Text>
                  </TouchableOpacity>
                </View>
              </ViewKey>
            ))
          )}
        </View>
      )}

      {/* =========================================================
          TAB: SAVED JOBS / BOOKMARKS
         ========================================================= */}
      {activeTab === 'bookmarks' && (
        <View style={styles.tabSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>
              Saved Opportunities ({bookmarkedJobs.length})
            </Text>
            <TouchableOpacity
              onPress={() => setActiveTabApp('jobs')}
              style={styles.addProjectBtn}
              activeOpacity={0.85}
            >
              <Briefcase size={13} color="#FFFFFF" />
              <Text style={styles.addProjectBtnText}>Explore Jobs</Text>
            </TouchableOpacity>
          </View>

          {bookmarkedJobs.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              badge="Saved Opportunities"
              title="No saved jobs yet"
              description="Bookmark interesting bounties and contracts on the Jobs tab to review and apply later."
              actionLabel="Browse Opportunities"
              onAction={() => setActiveTabApp('jobs')}
            />
          ) : (
            <View style={styles.reviewsList}>
              {bookmarkedJobs.map((job) => (
                <ViewKey key={job.id} style={[styles.savedJobCard, isDark && styles.savedJobCardDark]}>
                  <View style={styles.savedJobHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.savedJobTitle, isDark && styles.savedJobTitleDark]}>{job.title}</Text>
                      <Text style={[styles.savedJobCompany, isDark && styles.textMutedDark]}>{job.posterCompany || 'SkillChain Verified Client'}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleSaveJob(job.id)}
                      style={styles.unsaveBtn}
                      activeOpacity={0.8}
                    >
                      <Bookmark size={16} color="#2554EB" fill="#2554EB" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.savedJobDescription, isDark && styles.savedJobDescriptionDark]} numberOfLines={2}>
                    {job.description}
                  </Text>

                  <View style={styles.savedJobMetaRow}>
                    <View style={[styles.savedJobBudgetTag, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.2)', borderColor: '#059669' }]}>
                      <Text style={styles.savedJobBudgetText}>{job.budgetSol} SOL</Text>
                    </View>
                    <View style={[styles.savedJobPill, isDark && styles.savedJobPillDark]}>
                      <Text style={[styles.savedJobPillText, isDark && styles.savedJobPillTextDark]}>{job.contractType || 'Fixed'}</Text>
                    </View>
                    {job.skills.slice(0, 2).map((t, tIdx) => (
                      <ViewKey key={tIdx} style={[styles.savedJobPill, isDark && styles.savedJobPillDark]}>
                        <Text style={[styles.savedJobPillText, isDark && styles.savedJobPillTextDark]}>{t}</Text>
                      </ViewKey>
                    ))}
                  </View>
                </ViewKey>
              ))}
            </View>
          )}
        </View>
      )}

      {/* =========================================================
          TAB 3: REVIEWS
         ========================================================= */}
      {activeTab === 'reviews' && (
        <View style={styles.tabSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>
              Client Reviews ({reviews.length > 0 ? reviews.length : 3})
            </Text>
            <View style={[styles.ratingBadgePill, isDark && { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B' }]}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingBadgeText}>4.98 Rating</Text>
            </View>
          </View>

          <View style={styles.reviewsList}>
            {reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                badge="Client Endorsements"
                title="No reviews received yet"
                description="Complete contract milestones with verified clients to build your verifiable on-chain reputation."
              />
            ) : (
              reviews.map((rev) => (
              <ViewKey key={rev.id} style={[styles.reviewCard, isDark && styles.reviewCardDark]}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: rev.reviewerAvatar }} style={styles.reviewerAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewerName, isDark && styles.reviewerNameDark]}>{rev.reviewerName}</Text>
                    <Text style={[styles.reviewJob, isDark && styles.textMutedDark]}>{rev.jobTitle}</Text>
                  </View>
                  <View style={styles.reviewStarRow}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.reviewStarText}>{rev.rating}.0</Text>
                  </View>
                </View>
                <Text style={[styles.reviewComment, isDark && styles.reviewCommentDark]}>"{rev.comment}"</Text>
              </ViewKey>
            ))
            )}
          </View>
        </View>
      )}

      {/* =========================================================
          TAB 3: CREDENTIALS (DOCUMENTS, CV, COVER LETTERS & CERTS)
         ========================================================= */}
      {activeTab === 'credentials' && (
        <View style={styles.tabSection}>
          {/* Header with Add Document button */}
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>User Documents & Credentials</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsAddDocModalOpen(true)}
              style={styles.addDocHeaderBtn}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addDocHeaderBtnText}>Add Document</Text>
            </TouchableOpacity>
          </View>

          {/* Stored Documents List */}
          <View style={styles.documentsContainer}>
            {userDocs.length === 0 ? (
              <EmptyState
                icon={FileText}
                badge="Verified Credentials"
                title="No documents uploaded yet"
                description="Attach your CV, cover letter, or smart contract audit certificates for 1-click job applications."
                actionLabel="Upload CV / Document"
                onAction={() => setIsAddDocModalOpen(true)}
              />
            ) : (
              userDocs.map((doc) => {
                const isPdf = doc.type === 'cv' || doc.fileName.toLowerCase().endsWith('.pdf');
                const isDocx = doc.type === 'cover_letter' || doc.fileName.toLowerCase().endsWith('.docx');
                const isCert = doc.type === 'certificate';

                const themeBg = isCert ? (isDark ? '#3E2A08' : '#FEF3C7') : isDocx ? (isDark ? '#1E293B' : '#EFF6FF') : (isDark ? '#3B1818' : '#FEE2E2');
                const themeBorder = isCert ? (isDark ? '#78350F' : '#FDE68A') : isDocx ? (isDark ? '#334155' : '#BFDBFE') : (isDark ? '#7F1D1D' : '#FECACA');
                const themeIconColor = isCert ? '#FBBF24' : isDocx ? '#60A5FA' : '#F87171';
                const themeBadgeText = isCert ? 'CERTIFICATE' : isDocx ? 'COVER LETTER' : 'CV / RESUME';
                const themeExtText = isCert ? 'PDF' : isDocx ? 'DOCX' : 'PDF';

                return (
                  <ViewKey key={doc.id} style={[styles.docItemCard, isDark && styles.docItemCardDark]}>
                    {/* Top Clickable Document Information Box */}
                    <TouchableKey
                      onPress={() => openEditDocModal(doc)}
                      activeOpacity={0.7}
                      style={styles.docClickableArea}
                    >
                      {/* Realistic Document Thumbnail Tile */}
                      <View style={[styles.docPreviewTile, { backgroundColor: themeBg, borderColor: themeBorder }]}>
                        <View style={[styles.docExtTag, { backgroundColor: themeIconColor }]}>
                          <Text style={styles.docExtTagText}>{themeExtText}</Text>
                        </View>
                        <FileText size={24} color={themeIconColor} strokeWidth={2.2} />
                        <Text style={[styles.docTileBadge, { color: themeIconColor }]}>
                          {themeBadgeText}
                        </Text>
                      </View>

                      {/* Main Info Column */}
                      <View style={styles.docDetailsCol}>
                        <View style={styles.docTitleAndBadge}>
                          <Text style={[styles.docItemTitle, isDark && styles.docItemTitleDark]} numberOfLines={1}>
                            {doc.title}
                          </Text>
                          {doc.isDefault && (
                            <View style={[styles.defaultPill, isDark && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                              <Check size={10} color={isDark ? '#6EE7B7' : '#166534'} strokeWidth={3} />
                              <Text style={[styles.defaultPillText, isDark && { color: '#6EE7B7' }]}>DEFAULT FOR JOBS</Text>
                            </View>
                          )}
                        </View>

                        {/* File Name & Technical Metadata */}
                        <Text style={[styles.docFileNameText, isDark && { color: '#60A5FA' }]} numberOfLines={1}>
                          {doc.fileName}
                        </Text>

                        <Text style={[styles.docItemMeta, isDark && styles.textMutedDark]}>
                          {doc.fileSize || '420 KB'} • Added {doc.uploadedAt || 'Recently'} • {doc.isDefault ? 'Active in 1-Click Apply' : 'Ready'}
                        </Text>
                      </View>
                    </TouchableKey>

                    {/* Bottom Action Controls Row */}
                    <View style={[styles.docActionRow, isDark && styles.docActionRowDark]}>
                      <TouchableOpacity
                        onPress={() => openEditDocModal(doc)}
                        style={[styles.changeDocBtn, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                        activeOpacity={0.8}
                      >
                        <RefreshCw size={12} color={isDark ? '#60A5FA' : '#2554EB'} strokeWidth={2.2} />
                        <Text style={[styles.changeDocBtnText, isDark && { color: '#60A5FA' }]}>Change / Replace</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => toggleDefaultDocument(doc.id)}
                        style={[
                          styles.toggleDefaultBtn,
                          isDark && styles.toggleDefaultBtnDark,
                          doc.isDefault && (isDark ? { backgroundColor: '#064E3B', borderColor: '#059669' } : styles.toggleDefaultBtnActive)
                        ]}
                        activeOpacity={0.8}
                      >
                        <Check size={12} color={doc.isDefault ? (isDark ? '#6EE7B7' : '#166534') : (isDark ? '#94A3B8' : '#475569')} strokeWidth={2.5} />
                        <Text style={[styles.toggleDefaultText, isDark && styles.textMutedDark, doc.isDefault && (isDark ? { color: '#6EE7B7' } : styles.toggleDefaultTextActive)]}>
                          {doc.isDefault ? 'Default' : 'Set Default'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => showToast('Previewing Document', doc.fileName, 'info')}
                        style={[styles.downloadDocBtn, isDark && styles.downloadDocBtnDark]}
                        activeOpacity={0.8}
                      >
                        <Eye size={12} color={isDark ? '#94A3B8' : '#475569'} />
                        <Text style={[styles.downloadDocText, isDark && styles.textMutedDark]}>Preview</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => deleteUserDocument(doc.id)}
                        style={[styles.deleteDocActionBtn, isDark && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#7F1D1D' }]}
                        activeOpacity={0.8}
                      >
                        <Trash2 size={13} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </ViewKey>
                );
              })
            )}
          </View>

          {/* On-Chain Verified Credentials Section */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <View>
              <Text style={[styles.sectionHeadingText, isDark && styles.sectionHeadingTextDark]}>On-Chain Verified Credentials</Text>
              <Text style={[styles.sectionSubHeadingText, isDark && styles.sectionSubHeadingTextDark]}>Cryptographically proven credentials on Solana</Text>
            </View>
            <View style={[styles.verifiedTxBadge, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#059669' }]}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={styles.verifiedTxText}>Mainnet Verified</Text>
            </View>
          </View>

          <View style={styles.credentialsList}>
            {(currentUser.credentials || []).map((cred) => (
              <ViewKey key={cred.id} style={[styles.credentialCard, isDark && styles.credentialCardDark]}>
                <View style={[styles.credIconBox, isDark && styles.credIconBoxDark]}>
                  <ShieldCheck size={20} color="#2554EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.credTitle, isDark && styles.credTitleDark]}>{cred.title}</Text>
                  <Text style={[styles.credIssuer, isDark && styles.textMutedDark]}>{cred.issuer} • Issued {cred.issuedDate}</Text>
                  <Text style={styles.credHash}>tx: {cred.txHash}</Text>
                </View>
              </ViewKey>
            ))}

            <ViewKey style={[styles.credentialCard, isDark && styles.credentialCardDark]}>
              <View style={[styles.credIconBox, isDark ? { backgroundColor: '#3E2A08' } : { backgroundColor: '#FEF3C7' }]}>
                <Award size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.credTitle, isDark && styles.credTitleDark]}>Solana Foundation Ecosystem Grantee</Text>
                <Text style={[styles.credIssuer, isDark && styles.textMutedDark]}>Solana Ecosystem • 2024</Text>
                <Text style={styles.credHash}>tx: 4Kx8...9Qw1</Text>
              </View>
            </ViewKey>
          </View>
        </View>
      )}

      {/* =========================================================
          MODAL 1: EDIT PROFILE
         ========================================================= */}
      <CustomModal visible={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={[styles.modalCard, styles.profileSettingsCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalHeaderIconBox, isDark && { backgroundColor: '#1E293B' }]}>
              <Edit3 size={18} color="#2554EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Edit Profile</Text>
              <Text style={[styles.modalSub, isDark && styles.modalSubDark]}>Update your publicly visible talent card</Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {/* Avatar Change Row in Modal */}
            <View style={[styles.editAvatarSection, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <Image source={{ uri: currentUser.avatar }} style={styles.editAvatarPreview} />
              <TouchableOpacity
                onPress={() => {
                  if (avatarFileInputRef.current) {
                    avatarFileInputRef.current.click();
                  }
                }}
                style={[styles.uploadAvatarBtn, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                activeOpacity={0.8}
              >
                <Camera size={14} color={isDark ? '#60A5FA' : '#2554EB'} />
                <Text style={[styles.uploadAvatarBtnText, isDark && { color: '#60A5FA' }]}>Upload Photo from Device</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Full Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Professional Title</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Preferred Payment Currency</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {(['SOL', 'USDC', 'USDT'] as const).map((curr) => {
                const isSelected = editCurrency === curr;
                return (
                  <TouchableKey
                    key={curr}
                    onPress={() => {
                      setEditCurrency(curr);
                      if (curr === 'SOL' && (editHourlyRate === '65' || editHourlyRate === '50')) {
                        setEditHourlyRate('2.5');
                      } else if ((curr === 'USDC' || curr === 'USDT') && (editHourlyRate === '2.5' || editHourlyRate === '2.0')) {
                        setEditHourlyRate('65');
                      }
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: 'center',
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#2554EB' : (isDark ? '#334155' : '#E2E8F0'),
                      backgroundColor: isSelected ? (isDark ? '#1E3A8A' : '#EFF6FF') : (isDark ? '#1E293B' : '#FFFFFF')
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: isSelected ? (isDark ? '#60A5FA' : '#2554EB') : (isDark ? '#94A3B8' : '#475569')
                      }}
                    >
                      {curr}
                    </Text>
                  </TouchableKey>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Hourly Rate ({editCurrency}/hr)</Text>
            <TextInput
              value={editHourlyRate}
              onChangeText={setEditHourlyRate}
              keyboardType="numeric"
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Bio</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              multiline
              numberOfLines={3}
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { height: 75 }]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Skills (comma separated)</Text>
            <TextInput
              value={editSkills}
              onChangeText={setEditSkills}
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
            />

            <TouchableOpacity onPress={handleSaveProfile} style={styles.modalSubmitBtn}>
              <Text style={styles.modalSubmitBtnText}>Save Profile Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </CustomModal>

      {/* =========================================================
          MODAL 2: EDIT COVER BANNER
         ========================================================= */}
      <CustomModal visible={isEditCoverModalOpen} onRequestClose={() => setIsEditCoverModalOpen(false)}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalHeaderIconBox, isDark ? { backgroundColor: '#1E293B' } : { backgroundColor: '#F1F5F9' }]}>
              <Camera size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Change Cover Banner</Text>
              <Text style={[styles.modalSub, isDark && styles.modalSubDark]}>Select preset or upload from device</Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditCoverModalOpen(false)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {/* Upload from Device button */}
            <TouchableOpacity
              onPress={() => {
                if (coverFileInputRef.current) {
                  coverFileInputRef.current.click();
                }
              }}
              style={styles.uploadCoverDeviceBtn}
              activeOpacity={0.85}
            >
              <FolderUp size={16} color="#FFFFFF" />
              <Text style={styles.uploadCoverDeviceBtnText}>Upload Cover Image from Device</Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Or Choose Preset Banner</Text>
            <View style={styles.coverPresetsList}>
              {COVER_PRESETS.map((preset) => (
                <TouchableKey
                  key={preset.id}
                  onPress={() => handleSaveCover(preset.url)}
                  style={[
                    styles.coverPresetCard,
                    isDark && { borderColor: '#334155', backgroundColor: '#1E293B' },
                    coverUrl === preset.url && (isDark ? { borderColor: '#3B82F6', backgroundColor: '#1E3A8A' } : styles.coverPresetCardActive)
                  ]}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: preset.url }} style={styles.coverPresetImg} />
                  <View style={styles.coverPresetMeta}>
                    <Text style={[styles.coverPresetName, isDark && styles.textWhite]}>{preset.name}</Text>
                    {coverUrl === preset.url && (
                      <Check size={14} color="#2554EB" strokeWidth={3} />
                    )}
                  </View>
                </TouchableKey>
              ))}
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Or Custom Image URL</Text>
            <TextInput
              value={customCoverInput}
              onChangeText={setCustomCoverInput}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#94A3B8"
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
            />

            {customCoverInput.trim() ? (
              <TouchableOpacity
                onPress={() => handleSaveCover(customCoverInput.trim())}
                style={styles.modalSubmitBtn}
              >
                <Text style={styles.modalSubmitBtnText}>Apply Custom Cover</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </View>
      </CustomModal>

      {/* =========================================================
          MODAL 3: ADD PROJECT
         ========================================================= */}
      <CustomModal visible={isAddProjectModalOpen} onRequestClose={() => setIsAddProjectModalOpen(false)}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalHeaderIconBox, isDark && { backgroundColor: '#1E293B' }]}>
              <Plus size={18} color="#2554EB" strokeWidth={3} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Add Featured Work</Text>
              <Text style={[styles.modalSub, isDark && styles.modalSubDark]}>Showcase verified deliverables to clients</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAddProjectModalOpen(false)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Project Title</Text>
          <TextInput
            value={newProjectTitle}
            onChangeText={setNewProjectTitle}
            placeholder="e.g. Drift-like DEX Perpetual Engine"
            placeholderTextColor="#94A3B8"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Category (Badge)</Text>
          <TextInput
            value={newProjectCategory}
            onChangeText={setNewProjectCategory}
            placeholder="e.g. DEFI, NFT, INFRA, SECURITY"
            placeholderTextColor="#94A3B8"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Description</Text>
          <TextInput
            value={newProjectDesc}
            onChangeText={setNewProjectDesc}
            placeholder="Key architectural feats, TVL handled, tech stack..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { height: 70 }]}
          />

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Cover Image URL</Text>
          <TextInput
            value={newProjectImg}
            onChangeText={setNewProjectImg}
            placeholder="https://..."
            placeholderTextColor="#94A3B8"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Tags (comma separated)</Text>
          <TextInput
            value={newProjectTags}
            onChangeText={setNewProjectTags}
            placeholder="Rust, Anchor, Solana"
            placeholderTextColor="#94A3B8"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <TouchableOpacity onPress={handleAddProject} style={styles.modalSubmitBtn}>
            <Text style={styles.modalSubmitBtnText}>Publish to Portfolio</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* =========================================================
          MODAL 4: ADD CREDENTIAL DOCUMENT (CV, COVER LETTER, CERT)
         ========================================================= */}
      <CustomModal visible={isAddDocModalOpen} onRequestClose={() => setIsAddDocModalOpen(false)}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalHeaderIconBox, isDark ? { backgroundColor: '#1E293B' } : { backgroundColor: '#EFF6FF' }]}>
              <Upload size={18} color="#2554EB" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Upload Credential Document</Text>
              <Text style={[styles.modalSub, isDark && styles.modalSubDark]}>Save once, auto-attach to job applications</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAddDocModalOpen(false)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Document Type</Text>
          <View style={styles.docTypeSelectorRow}>
            {(['cv', 'cover_letter', 'certificate'] as const).map((type) => (
              <TouchableKey
                key={type}
                onPress={() => setNewDocType(type)}
                style={[
                  styles.docTypeOptionBtn,
                  isDark && styles.docTypeOptionBtnDark,
                  newDocType === type && (isDark ? styles.docTypeOptionBtnActiveDark : styles.docTypeOptionBtnActive)
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.docTypeOptionText,
                  isDark && styles.docTypeOptionTextDark,
                  newDocType === type && (isDark ? styles.docTypeOptionTextActiveDark : styles.docTypeOptionTextActive)
                ]}>
                  {type === 'cv' ? '📄 CV / Resume' : type === 'cover_letter' ? '✉️ Cover Letter' : '🎓 Certificate'}
                </Text>
              </TouchableKey>
            ))}
          </View>

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Document Title</Text>
          <TextInput
            value={newDocTitle}
            onChangeText={setNewDocTitle}
            placeholder={
              newDocType === 'cv'
                ? 'e.g. Senior Solana Full-Stack CV'
                : newDocType === 'cover_letter'
                ? 'e.g. Standard Protocol Engineer Cover Letter'
                : 'e.g. Anchor Smart Contract Security Specialist'
            }
            placeholderTextColor="#94A3B8"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Description / Notes (Optional)</Text>
          <TextInput
            value={newDocDesc}
            onChangeText={setNewDocDesc}
            placeholder="e.g. Highlighted Rust, Anchor, and DeFi protocols experience..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={2}
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { height: 60 }]}
          />

          <TouchableOpacity onPress={handleSaveNewDocument} style={styles.modalSubmitBtn} activeOpacity={0.85}>
            <Text style={styles.modalSubmitBtnText}>Save Credential Document</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* =========================================================
          MODAL 5: EDIT / REPLACE CREDENTIAL DOCUMENT (CLICK TO CHANGE)
         ========================================================= */}
      <CustomModal visible={editingDoc !== null} onRequestClose={() => setEditingDoc(null)}>
        {editingDoc && (
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIconBox, isDark ? { backgroundColor: '#1E293B' } : { backgroundColor: '#EFF6FF' }]}>
                <RefreshCw size={18} color="#2554EB" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Change / Replace Document</Text>
                <Text style={[styles.modalSub, isDark && styles.modalSubDark]}>Update details or replace with a newer version</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingDoc(null)}>
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Document Type</Text>
            <View style={styles.docTypeSelectorRow}>
              {(['cv', 'cover_letter', 'certificate'] as const).map((type) => (
                <TouchableKey
                  key={type}
                  onPress={() => setEditDocType(type)}
                  style={[
                    styles.docTypeOptionBtn,
                    isDark && styles.docTypeOptionBtnDark,
                    editDocType === type && (isDark ? styles.docTypeOptionBtnActiveDark : styles.docTypeOptionBtnActive)
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.docTypeOptionText,
                    isDark && styles.docTypeOptionTextDark,
                    editDocType === type && (isDark ? styles.docTypeOptionTextActiveDark : styles.docTypeOptionTextActive)
                  ]}>
                    {type === 'cv' ? '📄 CV / Resume' : type === 'cover_letter' ? '✉️ Cover Letter' : '🎓 Certificate'}
                  </Text>
                </TouchableKey>
              ))}
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Document Title</Text>
            <TextInput
              value={editDocTitle}
              onChangeText={setEditDocTitle}
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>File Name</Text>
            <View style={styles.fileNameInputRow}>
              <TextInput
                value={editDocFileName}
                onChangeText={setEditDocFileName}
                style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => {
                  const sampleNames = [
                    'Alex_Rivera_Lead_Solana_Engineer_2026.pdf',
                    'Alex_Rivera_CV_DeFi_Architecture.pdf',
                    'Alex_Rivera_Anchor_Security_Audit_CV.pdf'
                  ];
                  const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                  setEditDocFileName(randomName);
                  showToast('New File Attached', randomName, 'success');
                }}
                style={[styles.replaceFileBtn, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                activeOpacity={0.8}
              >
                <Upload size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
                <Text style={[styles.replaceFileBtnText, isDark && { color: '#60A5FA' }]}>Upload New</Text>
              </TouchableOpacity>
            </View>

            {/* Set Default Toggle Switch */}
            <TouchableOpacity
              onPress={() => setEditDocIsDefault(!editDocIsDefault)}
              style={[styles.defaultToggleRow, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.customCheckbox, isDark && { borderColor: '#64748B', backgroundColor: '#1E293B' }, editDocIsDefault && styles.customCheckboxActive]}>
                {editDocIsDefault && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.defaultToggleTitle, isDark && styles.textWhite]}>Set as Default for Job Applications</Text>
                <Text style={[styles.defaultToggleSub, isDark && styles.textMutedDark]}>Auto-attached during one-click gig applications</Text>
              </View>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Description / Notes</Text>
            <TextInput
              value={editDocDesc}
              onChangeText={setEditDocDesc}
              placeholder="e.g. Updated with 2026 Solana anchor contracts..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { height: 60 }]}
            />

            {/* Action Buttons */}
            <View style={styles.docModalActionsRow}>
              <TouchableOpacity
                onPress={() => {
                  if (editingDoc) {
                    deleteUserDocument(editingDoc.id);
                    setEditingDoc(null);
                  }
                }}
                style={[styles.deleteDocModalBtn, isDark && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#7F1D1D' }]}
                activeOpacity={0.8}
              >
                <Trash2 size={14} color="#EF4444" />
                <Text style={styles.deleteDocModalBtnText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveDocEdits}
                style={[styles.modalSubmitBtn, { flex: 1, marginTop: 0 }]}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </CustomModal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  contentContainer: {
    paddingBottom: 40,
  },

  /* Cover Banner */
  bannerWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  editCoverBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editCoverText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedAccountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  verifiedAccountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Profile Card & Info */
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarAndActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -42,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FAF5EE',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  actionsRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  walletChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DBEAFE',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  walletChipText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Name & Bio */
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  nameTextDark: {
    color: '#F8FAFC',
  },
  nameLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginLeft: 2,
  },
  nameLocationBadgeDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  nameLocationText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#2554EB',
  },
  nameLocationTextDark: {
    color: '#60A5FA',
  },
  bioText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  bioTextDark: {
    color: '#94A3B8',
  },

  /* Location & Open to Job Types */
  locationJobTypeSection: {
    marginBottom: 12,
    gap: 6,
  },
  locationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationMetaText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  jobTypesBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  jobTypesLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  jobTypesLabelDark: {
    color: '#94A3B8',
  },
  jobTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  jobTypePillDark: {
    backgroundColor: '#064E3B',
    borderColor: '#047857',
  },
  jobTypePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  jobTypePillTextDark: {
    color: '#A7F3D0',
  },

  /* 3-Metric Stats Cards (Clean, Compact & Reduced) */
  statsCardsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
    textAlign: 'center',
  },
  statCardValueDark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statCardValueBlue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2554EB',
  },
  statCardValueGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'center',
  },
  socialStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  socialStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  socialStatValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  socialStatValueDark: {
    color: '#000000',
  },
  socialStatLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  socialStatLabelDark: {
    color: '#94A3B8',
  },
  socialStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  socialStatDividerDark: {
    backgroundColor: '#475569',
  },

  /* Segmented Pill Tabs */
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    backgroundColor: '#FAF9F5',
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#2554EB',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Tab Section & Header Row */
  tabSection: {
    paddingHorizontal: 14,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeadingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  addProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2554EB',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  addProjectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Portfolio Cards */
  portfolioList: {
    gap: 14,
  },
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  workImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 155,
    backgroundColor: '#0F172A',
  },
  workImage: {
    width: '100%',
    height: '100%',
  },
  categoryPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  workBody: {
    padding: 12,
  },
  workTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  workDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 8,
  },
  workTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  workTagChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  workTagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  /* Posts */
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  postAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  postAuthorHandle: {
    fontSize: 11,
    color: '#64748B',
  },
  postTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  postContent: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 8,
  },
  postMedia: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postActionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Reviews */
  ratingBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewJob: {
    fontSize: 11,
    color: '#64748B',
  },
  reviewStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewStarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  reviewComment: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  /* Credentials */
  addDocHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  addDocHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionSubHeadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  documentsContainer: {
    gap: 12,
    marginBottom: 8,
  },
  emptyDocsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyDocsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDocsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  uploadFirstDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginTop: 6,
  },
  uploadFirstDocBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  docItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  docClickableArea: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  docPreviewTile: {
    width: 64,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 6,
  },
  docExtTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  docExtTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  docTileBadge: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  docDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  docTitleAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 2,
  },
  docItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  defaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  defaultPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.3,
  },
  docFileNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2554EB',
    marginBottom: 2,
  },
  docItemMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  docItemDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  tapToEditHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  tapToEditText: {
    fontSize: 10.5,
    color: '#2554EB',
    fontWeight: '600',
  },
  docActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  changeDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  changeDocBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2554EB',
  },
  toggleDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleDefaultBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  toggleDefaultText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  toggleDefaultTextActive: {
    color: '#166534',
    fontWeight: '700',
  },
  downloadDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  downloadDocText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  deleteDocActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginLeft: 'auto',
  },
  verifiedTxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  verifiedTxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  credentialsList: {
    gap: 10,
  },
  credentialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  credIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  credIssuer: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  credHash: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  /* Modals */
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    width: '100%',
    maxWidth: 380,
  },
  profileSettingsCard: {
    paddingHorizontal: 26,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  modalHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 6,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSubmitBtn: {
    backgroundColor: '#2554EB',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  docTypeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  docTypeOptionBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTypeOptionBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2554EB',
  },
  docTypeOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  docTypeOptionTextActive: {
    color: '#2554EB',
    fontWeight: '700',
  },
  fileNameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  replaceFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
  },
  replaceFileBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2554EB',
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  defaultToggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  defaultToggleSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  docModalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  deleteDocModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  deleteDocModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },

  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2554EB',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadCoverDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2554EB',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  uploadCoverDeviceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  editAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editAvatarPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2554EB',
  },
  uploadAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  uploadAvatarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
  },

  /* Cover Presets */
  coverPresetsList: {
    gap: 8,
    marginBottom: 8,
  },
  coverPresetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  coverPresetCardActive: {
    borderColor: '#2554EB',
    backgroundColor: '#EFF6FF',
  },
  coverPresetImg: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
  coverPresetMeta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  coverPresetName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Saved Jobs & Bookmarks */
  emptyBookmarksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyBookmarksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyBookmarksSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  exploreJobsActionBtn: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  exploreJobsActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2554EB',
  },
  savedJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  savedJobHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  savedJobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  savedJobCompany: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  unsaveBtn: {
    padding: 4,
  },
  savedJobDescription: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  savedJobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  savedJobBudgetTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savedJobBudgetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  savedJobPill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savedJobPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },

  /* Employer Profile Specific Styles */
  cardBoxWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  cardBoxWrapperDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  employerCompanyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  employerOrgName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  employerOrgSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardDividerLight: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  cardDividerLightDark: {
    backgroundColor: '#334155',
  },
  employerAboutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  employerAboutDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  employerMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  employerMetaItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  employerMetaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  employerMetaVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  activeGigStatusBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeGigStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  textWhite: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },

  /* Dark mode overrides */
  containerDark: {
    backgroundColor: '#0B0F19',
  },
  profileHeaderCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  walletChipBtnDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  walletChipTextDark: {
    color: '#60A5FA',
  },
  statCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  statCardLabelDark: {
    color: '#94A3B8',
  },
  statCardValueDarkDark: {
    color: '#F8FAFC',
  },
  tabsContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tabPillTextDark: {
    color: '#94A3B8',
  },
  sectionHeadingTextDark: {
    color: '#F8FAFC',
  },
  sectionSubHeadingTextDark: {
    color: '#94A3B8',
  },
  savedJobCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  savedJobTitleDark: {
    color: '#F8FAFC',
  },
  savedJobDescriptionDark: {
    color: '#CBD5E1',
  },
  savedJobPillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  savedJobPillTextDark: {
    color: '#94A3B8',
  },
  workCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  workTitleDark: {
    color: '#F8FAFC',
  },
  workDescDark: {
    color: '#94A3B8',
  },
  workTagChipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  workTagChipTextDark: {
    color: '#93C5FD',
  },
  postCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  postAuthorNameDark: {
    color: '#F8FAFC',
  },
  postContentDark: {
    color: '#E2E8F0',
  },
  postActionTextDark: {
    color: '#94A3B8',
  },
  emptyBookmarksCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  emptyBookmarksTitleDark: {
    color: '#F8FAFC',
  },
  emptyBookmarksSubDark: {
    color: '#94A3B8',
  },
  reviewCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  reviewerNameDark: {
    color: '#F8FAFC',
  },
  reviewCommentDark: {
    color: '#CBD5E1',
  },
  emptyDocsBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  emptyDocsTitleDark: {
    color: '#F8FAFC',
  },
  docItemCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  docItemTitleDark: {
    color: '#F8FAFC',
  },
  docActionRowDark: {
    borderTopColor: '#334155',
  },
  toggleDefaultBtnDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  downloadDocBtnDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  credentialCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  credIconBoxDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  credTitleDark: {
    color: '#F8FAFC',
  },
  modalCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  modalTitleDark: {
    color: '#F8FAFC',
  },
  modalSubDark: {
    color: '#94A3B8',
  },
  inputLabelDark: {
    color: '#94A3B8',
  },
  modalTextInputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  docTypeOptionBtnDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  docTypeOptionBtnActiveDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  docTypeOptionTextDark: {
    color: '#94A3B8',
  },
  docTypeOptionTextActiveDark: {
    color: '#60A5FA',
  },
  employerMetaItemDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
});
