import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  RefreshControl
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import { UserProfile, CommunityGroup, PaymentCurrency } from '../../types';
import { TalentCardSkeleton } from '../SkeletonLoader';
import { CommunityChatPage } from './CommunityChatPage';
import {
  Search,
  SlidersHorizontal,
  Users,
  Globe,
  ShieldCheck,
  Star,
  MessageSquare,
  Briefcase,
  Plus,
  Zap,
  Shield,
  Code,
  Palette,
  Volume2,
  X,
  Send,
  Check,
  ChevronRight,
  Lock,
  Unlock,
  Clock,
  UserPlus,
  Crown,
  Sparkles
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;

export const DiscoverTab: React.FC = () => {
  // Global Context
  const {
    currentUser,
    profiles,
    searchQuery,
    setSearchQuery,
    createConversationWith,
    sendDirectPayment,
    createEscrowMilestone,
    setActiveTab,
    communities,
    communityMessages,
    sendCommunityMessage,
    addCommunityGroup,
    requestToJoinCommunity,
    cancelJoinRequest,
    viewProfileById,
    activeCommunityId,
    setActiveCommunityId,
    showToast,
    isDark
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'professionals' | 'communities'>('professionals');
  const [communitySubFilter, setCommunitySubFilter] = useState<'joined' | 'explore'>('joined');
  const [localSearch, setLocalSearch] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Talent Directory Refreshed', 'Loaded latest verified builder profiles & communities.', 'info');
    }, 600);
  }, [showToast]);

  // Filters
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Direct Hire & Payment proposal modal
  const [hireProfile, setHireProfile] = useState<UserProfile | null>(null);
  const [hireJobTitle, setHireJobTitle] = useState('');
  const [hireAmount, setHireAmount] = useState<string>('');
  const [hireCurrency, setHireCurrency] = useState<PaymentCurrency>('SOL');
  const [hireNotes, setHireNotes] = useState('');

  // Community Group Modal state
  const [activeGroupChat, setActiveGroupChat] = useState<CommunityGroup | null>(null);
  const [groupMessageText, setGroupMessageText] = useState('');

  // Request to Join Modal state
  const [requestingGroup, setRequestingGroup] = useState<CommunityGroup | null>(null);
  const [joinRequestNote, setJoinRequestNote] = useState('');

  // Create New Group Modal
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Solana Ecosystem');
  const [newGroupIconType, setNewGroupIconType] = useState<CommunityGroup['iconType']>('solana');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const allSkills = Array.from(new Set(profiles.flatMap((p) => p.skills)));

  // Combine global and local search
  const effectiveQuery = (localSearch || searchQuery).toLowerCase().trim();

  // Filtered Professionals
  const filteredProfiles = profiles.filter((p) => {
    if (verifiedOnly && !p.isVerified) return false;
    if (selectedSkill && !p.skills.includes(selectedSkill)) return false;

    if (effectiveQuery) {
      const nameMatch = p.name.toLowerCase().includes(effectiveQuery);
      const titleMatch = p.title.toLowerCase().includes(effectiveQuery);
      const skillMatch = p.skills.some((s) => s.toLowerCase().includes(effectiveQuery));
      return nameMatch || titleMatch || skillMatch;
    }
    return true;
  });

  // Filtered Communities
  const filteredCommunities = communities.filter((c) => {
    if (selectedCategory && c.category !== selectedCategory) return false;

    if (effectiveQuery) {
      const nameMatch = c.name.toLowerCase().includes(effectiveQuery);
      const descMatch = c.description.toLowerCase().includes(effectiveQuery);
      const catMatch = c.category.toLowerCase().includes(effectiveQuery);
      return nameMatch || descMatch || catMatch;
    }
    return true;
  });

  const handleCreateHireOffer = () => {
    if (!hireProfile) return;
    if (!hireJobTitle.trim()) {
      showToast('Missing Title', 'Please enter a project or milestone title.', 'warning');
      return;
    }
    const numAmount = parseFloat(hireAmount);
    if (!numAmount || numAmount <= 0) {
      showToast('Invalid Amount', `Please enter a valid ${hireCurrency} payment amount.`, 'warning');
      return;
    }

    const success = sendDirectPayment(hireJobTitle.trim(), hireProfile.id, numAmount, hireCurrency, hireNotes.trim());
    if (success) {
      setHireProfile(null);
      setHireJobTitle('');
      setHireAmount('');
      setHireNotes('');
      setActiveTab('wallet');
    }
  };

  const handleSendCommunityChat = () => {
    if (!activeGroupChat || !groupMessageText.trim()) return;
    sendCommunityMessage(activeGroupChat.id, groupMessageText.trim());
    setGroupMessageText('');
  };

  const handleCreateNewGroup = () => {
    if (!newGroupName.trim() || !newGroupDesc.trim()) {
      showToast('Missing Fields', 'Please enter a group name and description.', 'warning');
      return;
    }

    const newGroupId = addCommunityGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      category: newGroupCategory,
      iconType: newGroupIconType
    });

    const created = communities.find((c) => c.id === newGroupId) || {
      id: newGroupId,
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      category: newGroupCategory,
      iconType: newGroupIconType,
      memberCount: 1,
      isOfficial: false,
      isPinned: false
    };

    setIsCreateGroupOpen(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setActiveGroupChat(created as CommunityGroup);
    setActiveCommunityId(newGroupId);
  };

  const renderCommunityIcon = (type: CommunityGroup['iconType']) => {
    switch (type) {
      case 'announcement':
        return <Volume2 size={16} color="#2554EB" />;
      case 'solana':
        return <Zap size={16} color="#D97706" />;
      case 'security':
        return <Shield size={16} color="#2563EB" />;
      case 'rust':
        return <Code size={16} color="#DB2777" />;
      case 'design':
        return <Palette size={16} color="#059669" />;
      default:
        return <Globe size={16} color="#4F46E5" />;
    }
  };

  const renderStars = (rating: number) => {
    const starCount = Math.round(rating);
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={11}
            color="#F59E0B"
            fill={i <= starCount ? '#F59E0B' : 'transparent'}
          />
        ))}
        <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const currentCommunity = activeGroupChat || (activeCommunityId ? communities.find((c) => c.id === activeCommunityId) : null);

  if (currentCommunity) {
    return (
      <CommunityChatPage
        community={currentCommunity}
        onBack={() => {
          setActiveGroupChat(null);
          setActiveCommunityId(null);
        }}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && { backgroundColor: '#0B0F19' }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2554EB"
          colors={['#2554EB']}
        />
      }
    >
      {/* Top Search & Filter Card with 2 Segmented Tabs */}
      <View style={[styles.searchCard, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        
        {/* Search Input and Filter Button Row */}
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
            <Search size={15} color={isDark ? '#64748B' : '#94A3B8'} />
            <TextInput
              value={localSearch}
              onChangeText={(text) => {
                setLocalSearch(text);
                setSearchQuery(text);
              }}
              placeholder="Search skills, talents or communities..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
            />
            {localSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X size={14} color={isDark ? '#94A3B8' : '#94A3B8'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button - Just the filter icon without text */}
          <TouchableOpacity
            onPress={() => setIsFilterModalOpen(true)}
            style={[
              styles.filterBtn,
              isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
              (verifiedOnly || selectedSkill !== null || selectedCategory !== null) && (isDark ? { backgroundColor: '#1E3A8A', borderColor: '#3B82F6' } : styles.filterBtnActive)
            ]}
            activeOpacity={0.8}
          >
            <SlidersHorizontal
              size={15}
              color={verifiedOnly || selectedSkill || selectedCategory ? '#2554EB' : (isDark ? '#94A3B8' : '#475569')}
            />
          </TouchableOpacity>
        </View>

        {/* 2 Segmented Tabs: Professionals vs Communities */}
        <View style={[styles.tabSwitcherContainer, isDark && { backgroundColor: '#0F172A' }]}>
          <TouchableOpacity
            onPress={() => setActiveSubTab('professionals')}
            style={[
              styles.switcherTab,
              activeSubTab === 'professionals' && (isDark ? { backgroundColor: '#1E293B' } : styles.switcherTabActive)
            ]}
            activeOpacity={0.85}
          >
            <Users
              size={13}
              color={activeSubTab === 'professionals' ? (isDark ? '#60A5FA' : '#2554EB') : '#64748B'}
            />
            <Text
              style={[
                styles.switcherTabText,
                isDark && { color: '#94A3B8' },
                activeSubTab === 'professionals' && (isDark ? { color: '#FFFFFF', fontWeight: '800' } : styles.switcherTabTextActive)
              ]}
            >
              Professionals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSubTab('communities')}
            style={[
              styles.switcherTab,
              activeSubTab === 'communities' && (isDark ? { backgroundColor: '#1E293B' } : styles.switcherTabActive)
            ]}
            activeOpacity={0.85}
          >
            <Globe
              size={13}
              color={activeSubTab === 'communities' ? (isDark ? '#60A5FA' : '#2554EB') : '#64748B'}
            />
            <Text
              style={[
                styles.switcherTabText,
                isDark && { color: '#94A3B8' },
                activeSubTab === 'communities' && (isDark ? { color: '#FFFFFF', fontWeight: '800' } : styles.switcherTabTextActive)
              ]}
            >
              Communities
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* =========================================================
          SUB-TAB 1: PROFESSIONALS (FREELANCERS)
         ========================================================= */}
      {activeSubTab === 'professionals' && (
        <View style={styles.tabSection}>
          
          {/* Status Chip / Header Indicator */}
          <View style={styles.statusRow}>
            <View style={[styles.openForHireChip, isDark && { backgroundColor: '#064E3B', borderColor: '#047857' }]}>
              <View style={styles.greenOnlineDot} />
              <Text style={[styles.openForHireText, isDark && { color: '#A7F3D0' }]}>Open for Hire & Gigs</Text>
            </View>

            {selectedSkill && (
              <TouchableOpacity
                onPress={() => setSelectedSkill(null)}
                style={[styles.activeSkillTag, isDark && { backgroundColor: '#1E3A8A', borderColor: '#3B82F6' }]}
              >
                <Text style={[styles.activeSkillTagText, isDark && { color: '#93C5FD' }]}>Skill: {selectedSkill}</Text>
                <X size={10} color={isDark ? '#93C5FD' : '#2554EB'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Freelancer Talent Cards List */}
          {isLoading ? (
            <TalentCardSkeleton count={3} />
          ) : filteredProfiles.length === 0 ? (
            <EmptyState
              icon={Search}
              badge="Discover Talent"
              title="No professionals found"
              description="No Web3 talent match your search query or selected skill filter."
              actionLabel={verifiedOnly || selectedSkill ? "Reset All Filters" : undefined}
              onAction={() => {
                setVerifiedOnly(false);
                setSelectedSkill(null);
                setLocalSearch('');
                setSearchQuery('');
              }}
            />
          ) : (
            filteredProfiles.map((profile) => (
              <ViewKey key={profile.id} style={[styles.talentCard, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                
                {/* Top Profile Header Row */}
                <TouchableOpacity
                  onPress={() => viewProfileById(profile.id)}
                  style={styles.cardHeaderRow}
                  activeOpacity={0.8}
                >
                  {/* Avatar with Online Dot */}
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: profile.avatar }} style={styles.talentAvatar} />
                    {profile.isOnline && <View style={styles.avatarOnlineDot} />}
                  </View>

                  {/* Name and Rating */}
                  <View style={styles.headerInfoCol}>
                    <View style={styles.nameAndRatingRow}>
                      <View style={styles.nameVerifiedRow}>
                        <Text style={[styles.talentNameText, isDark && { color: '#FFFFFF' }]}>{profile.name}</Text>
                        {profile.isVerified && (
                          <ShieldCheck size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
                        )}
                      </View>
                      {/* Star Rating on the Right */}
                      {renderStars(profile.rating)}
                    </View>

                    {/* Role / Subtitle */}
                    <Text style={[styles.talentRoleText, isDark && { color: '#94A3B8' }]} numberOfLines={1}>
                      {profile.title}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Status & Metrics Pills Row */}
                <View style={styles.metricsPillsRow}>
                  <View style={[styles.availablePill, isDark && { backgroundColor: '#064E3B' }]}>
                    <View style={styles.availableDot} />
                    <Text style={[styles.availablePillText, isDark && { color: '#A7F3D0' }]}>Available</Text>
                  </View>

                  <View style={[styles.completedPill, isDark && { backgroundColor: '#1E3A8A' }]}>
                    <ShieldCheck size={11} color={isDark ? '#93C5FD' : '#1E40AF'} />
                    <Text style={[styles.completedPillText, isDark && { color: '#93C5FD' }]}>
                      {profile.completedJobsCount} jobs completed
                    </Text>
                  </View>
                </View>

                {/* Skills Row */}
                <View style={styles.skillsRow}>
                  {profile.skills.slice(0, 3).map((skill, idx) => (
                    <ViewKey key={idx} style={[styles.skillPill, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1 }]}>
                      <Text style={[styles.skillPillText, isDark && { color: '#93C5FD' }]}>{skill}</Text>
                    </ViewKey>
                  ))}
                  {profile.skills.length > 3 && (
                    <ViewKey style={[styles.moreSkillPill, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', borderWidth: 1 }]}>
                      <Text style={[styles.moreSkillPillText, isDark && { color: '#94A3B8' }]}>
                        +{profile.skills.length - 3}
                      </Text>
                    </ViewKey>
                  )}
                </View>

                {/* Bottom Action Buttons: Message & Hire / Offer */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    onPress={() => createConversationWith(profile.id)}
                    style={styles.messageBtn}
                    activeOpacity={0.8}
                  >
                    <MessageSquare size={13} color="#FFFFFF" />
                    <Text style={styles.messageBtnText}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setHireProfile(profile);
                      setHireJobTitle(`Milestone Contract with ${profile.name}`);
                    }}
                    style={[styles.hireBtn, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
                    activeOpacity={0.8}
                  >
                    <Briefcase size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
                    <Text style={[styles.hireBtnText, isDark && { color: '#60A5FA' }]}>Hire / Offer</Text>
                  </TouchableOpacity>
                </View>

              </ViewKey>
            ))
          )}

        </View>
      )}

      {/* =========================================================
          SUB-TAB 2: COMMUNITIES (GROUP CHATS)
         ========================================================= */}
      {activeSubTab === 'communities' && (
        <View style={styles.tabSection}>
          
          {/* Community Action Banner */}
          <View style={[styles.communityBannerCard, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.communityBannerLeft}>
              <View style={styles.communityBannerHeaderRow}>
                <Globe size={15} color={isDark ? '#60A5FA' : '#2554EB'} />
                <Text style={[styles.communityBannerTitle, isDark && { color: '#FFFFFF' }]}>Community Group Channels</Text>
              </View>
              <Text style={[styles.communityBannerSub, isDark && { color: '#94A3B8' }]}>
                Verified group chats, dev guilds, and ecosystem channels
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsCreateGroupOpen(true)}
              style={styles.newGroupBtn}
              activeOpacity={0.85}
            >
              <Plus size={13} color="#FFFFFF" />
              <Text style={styles.newGroupBtnText}>New Group</Text>
            </TouchableOpacity>
          </View>

          {/* Sub-Segmented Filter: Joined Channels vs Explore & Request to Join */}
          {(() => {
            const isUserInGroup = (c: CommunityGroup) =>
              (c.memberIds || []).includes(currentUser.id) || c.creatorId === currentUser.id;

            const joinedCommunities = filteredCommunities.filter((c) => isUserInGroup(c));
            const exploreCommunities = filteredCommunities.filter((c) => !isUserInGroup(c));

            return (
              <>
                <View style={[styles.communityFilterSegments, isDark && { backgroundColor: '#0F172A' }]}>
                  <TouchableOpacity
                    onPress={() => setCommunitySubFilter('joined')}
                    style={[
                      styles.communitySegmentBtn,
                      communitySubFilter === 'joined' && (isDark ? { backgroundColor: '#1E293B' } : styles.communitySegmentBtnActive)
                    ]}
                    activeOpacity={0.8}
                  >
                    <Users size={13} color={communitySubFilter === 'joined' ? (isDark ? '#60A5FA' : '#2554EB') : '#64748B'} />
                    <Text
                      style={[
                        styles.communitySegmentBtnText,
                        isDark && { color: '#94A3B8' },
                        communitySubFilter === 'joined' && (isDark ? { color: '#FFFFFF', fontWeight: '800' } : styles.communitySegmentBtnTextActive)
                      ]}
                    >
                      My Groups ({joinedCommunities.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCommunitySubFilter('explore')}
                    style={[
                      styles.communitySegmentBtn,
                      communitySubFilter === 'explore' && (isDark ? { backgroundColor: '#1E293B' } : styles.communitySegmentBtnActive)
                    ]}
                    activeOpacity={0.8}
                  >
                    <Globe size={13} color={communitySubFilter === 'explore' ? (isDark ? '#60A5FA' : '#2554EB') : '#64748B'} />
                    <Text
                      style={[
                        styles.communitySegmentBtnText,
                        isDark && { color: '#94A3B8' },
                        communitySubFilter === 'explore' && (isDark ? { color: '#FFFFFF', fontWeight: '800' } : styles.communitySegmentBtnTextActive)
                      ]}
                    >
                      Explore & Join ({exploreCommunities.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* TAB CONTENT: JOINED COMMUNITIES */}
                {communitySubFilter === 'joined' && (
                  isLoading ? (
                    <TalentCardSkeleton count={3} />
                  ) : joinedCommunities.length === 0 ? (
                    <EmptyState
                      icon={Globe}
                      badge="My Groups"
                      title="You haven't joined any groups yet"
                      description="Explore available Solana channels to request access or create your own group chat!"
                      actionLabel="Explore Groups"
                      onAction={() => setCommunitySubFilter('explore')}
                      secondaryActionLabel="Create Group"
                      onSecondaryAction={() => setIsCreateGroupOpen(true)}
                    />
                  ) : (
                    joinedCommunities.map((community) => {
                      const isGroupAdmin = community.creatorId === currentUser.id || (community.adminIds || []).includes(currentUser.id);
                      const pendingCount = (community.pendingJoinRequests || []).length;

                      return (
                        <TouchableKey
                          key={community.id}
                          onPress={() => {
                            setActiveGroupChat(community);
                            setActiveCommunityId(community.id);
                          }}
                          style={[styles.communityCard, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                          activeOpacity={0.75}
                        >
                          <View style={styles.communityCardTop}>
                            
                            {/* Left Circle Icon */}
                            <View
                              style={[
                                styles.communityIconCircle,
                                isDark ? { backgroundColor: '#0F172A' } : { backgroundColor: community.iconBgColor || '#EFF6FF' }
                              ]}
                            >
                              {renderCommunityIcon(community.iconType)}
                            </View>

                            {/* Middle Content */}
                            <View style={styles.communityContentCol}>
                              <View style={styles.communityTitleRow}>
                                <Text style={[styles.communityTitleText, isDark && { color: '#FFFFFF' }]}>{community.name}</Text>
                                {community.isOfficial && (
                                  <ShieldCheck size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
                                )}
                                {isGroupAdmin && (
                                  <View style={[styles.adminJoinedBadge, isDark && { backgroundColor: '#78350F' }]}>
                                    <Crown size={10} color="#FBBF24" fill="#FBBF24" />
                                    <Text style={[styles.adminJoinedBadgeText, isDark && { color: '#FDE68A' }]}>Admin</Text>
                                  </View>
                                )}
                                {community.isLocked && (
                                  <View style={[styles.lockedJoinedBadge, isDark && { backgroundColor: '#78350F' }]}>
                                    <Lock size={10} color="#FBBF24" />
                                  </View>
                                )}
                              </View>

                              {/* Badges Row */}
                              <View style={styles.communityBadgesRow}>
                                {community.isPinned ? (
                                  <View style={[styles.pinnedBadge, isDark && { backgroundColor: '#1E3A8A' }]}>
                                    <Text style={[styles.pinnedBadgeText, isDark && { color: '#93C5FD' }]}>📌 Pinned</Text>
                                  </View>
                                ) : (
                                  <View style={[styles.memberCountPill, isDark && { backgroundColor: '#0F172A' }]}>
                                    <Users size={11} color={isDark ? '#60A5FA' : '#2554EB'} />
                                    <Text style={[styles.memberCountText, isDark && { color: '#93C5FD' }]}>
                                      {community.memberCount || (community.memberIds || []).length} members
                                    </Text>
                                  </View>
                                )}

                                {isGroupAdmin && pendingCount > 0 && (
                                  <View style={[styles.pendingAlertPill, isDark && { backgroundColor: '#78350F' }]}>
                                    <Clock size={10} color="#FDE68A" />
                                    <Text style={[styles.pendingAlertPillText, isDark && { color: '#FDE68A' }]}>
                                      {pendingCount} join request{pendingCount > 1 ? 's' : ''}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Description */}
                              <Text style={[styles.communityDescText, isDark && { color: '#CBD5E1' }]} numberOfLines={2}>
                                {community.description}
                              </Text>
                            </View>

                            {/* Right Arrow Indicator */}
                            <ChevronRight size={15} color={isDark ? '#64748B' : '#CBD5E1'} />
                          </View>

                          {/* Last active message preview if available */}
                          {community.lastMessage && (
                            <View style={[styles.communityLastMsgBar, isDark && { backgroundColor: '#0F172A' }]}>
                              <Text style={[styles.communityLastMsgText, isDark && { color: '#94A3B8' }]} numberOfLines={1}>
                                💬 {community.lastMessage}
                              </Text>
                              {community.lastMessageTime && (
                                <Text style={[styles.communityLastMsgTime, isDark && { color: '#64748B' }]}>
                                  {community.lastMessageTime}
                                </Text>
                              )}
                            </View>
                          )}

                        </TouchableKey>
                      );
                    })
                  )
                )}

                {/* TAB CONTENT: EXPLORE & REQUEST TO JOIN */}
                {communitySubFilter === 'explore' && (
                  isLoading ? (
                    <TalentCardSkeleton count={3} />
                  ) : exploreCommunities.length === 0 ? (
                    <EmptyState
                      icon={Globe}
                      badge="Explore Channels"
                      title="No additional communities found"
                      description="You are already a member of all public channels or none match your search criteria."
                      actionLabel="Create Group"
                      onAction={() => setIsCreateGroupOpen(true)}
                      secondaryActionLabel="View My Groups"
                      onSecondaryAction={() => setCommunitySubFilter('joined')}
                    />
                  ) : (
                    exploreCommunities.map((community) => {
                      const hasRequested = (community.pendingJoinRequests || []).some(
                        (r) => r.userId === currentUser.id
                      );

                      return (
                        <ViewKey key={community.id} style={[styles.exploreCommunityCard, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                          <View style={styles.communityCardTop}>
                            
                            {/* Left Circle Icon */}
                            <View
                              style={[
                                styles.communityIconCircle,
                                isDark ? { backgroundColor: '#0F172A' } : { backgroundColor: community.iconBgColor || '#EFF6FF' }
                              ]}
                            >
                              {renderCommunityIcon(community.iconType)}
                            </View>

                            {/* Middle Content */}
                            <View style={styles.communityContentCol}>
                              <View style={styles.communityTitleRow}>
                                <Text style={[styles.communityTitleText, isDark && { color: '#FFFFFF' }]}>{community.name}</Text>
                                {community.isOfficial && (
                                  <ShieldCheck size={13} color={isDark ? '#60A5FA' : '#2554EB'} />
                                )}
                                {community.isLocked && (
                                  <View style={[styles.lockedJoinedBadge, isDark && { backgroundColor: '#78350F' }]}>
                                    <Lock size={10} color="#FDE68A" />
                                  </View>
                                )}
                              </View>

                              {/* Badges Row */}
                              <View style={styles.communityBadgesRow}>
                                <View style={[styles.memberCountPill, isDark && { backgroundColor: '#0F172A' }]}>
                                  <Users size={11} color={isDark ? '#60A5FA' : '#2554EB'} />
                                  <Text style={[styles.memberCountText, isDark && { color: '#93C5FD' }]}>
                                    {community.memberCount || (community.memberIds || []).length} members
                                  </Text>
                                </View>
                                <View style={[styles.categoryPill, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                                  <Text style={[styles.categoryPillText, isDark && { color: '#94A3B8' }]}>{community.category}</Text>
                                </View>
                              </View>

                              {/* Description */}
                              <Text style={[styles.communityDescText, isDark && { color: '#CBD5E1' }]} numberOfLines={2}>
                                {community.description}
                              </Text>
                            </View>
                          </View>

                          {/* Bottom Action Footer for Non-Members */}
                          <View style={[styles.exploreCardFooter, isDark && { borderTopColor: '#334155' }]}>
                            <View style={styles.exploreCardPrivacyNote}>
                              <Lock size={12} color={isDark ? '#94A3B8' : '#64748B'} />
                              <Text style={[styles.exploreCardPrivacyText, isDark && { color: '#94A3B8' }]}>
                                Admin approval required to view & chat
                              </Text>
                            </View>

                            {hasRequested ? (
                              <TouchableOpacity
                                onPress={() => cancelJoinRequest(community.id)}
                                style={[styles.requestedPendingBtn, isDark && { backgroundColor: '#78350F', borderColor: '#92400E' }]}
                                activeOpacity={0.8}
                              >
                                <Clock size={12} color="#FDE68A" />
                                <Text style={[styles.requestedPendingBtnText, isDark && { color: '#FDE68A' }]}>Requested ⏳</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  setRequestingGroup(community);
                                  setJoinRequestNote('');
                                }}
                                style={styles.requestToJoinBtn}
                                activeOpacity={0.85}
                              >
                                <UserPlus size={13} color="#FFFFFF" />
                                <Text style={styles.requestToJoinBtnText}>Request to Join</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </ViewKey>
                      );
                    })
                  )
                )}
              </>
            );
          })()}

        </View>
      )}

      {/* =========================================================
          REQUEST TO JOIN COMMUNITY MODAL
         ========================================================= */}
      <CustomModal
        visible={!!requestingGroup}
        onRequestClose={() => setRequestingGroup(null)}
      >
        {requestingGroup && (
          <View style={[styles.modalContent, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.requestModalHeaderIcon, isDark && { backgroundColor: '#1E3A8A' }]}>
                <Lock size={18} color={isDark ? '#93C5FD' : '#2554EB'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>Request to Join #{requestingGroup.name}</Text>
                <Text style={[styles.modalSub, isDark && { color: '#94A3B8' }]}>{requestingGroup.category} Community</Text>
              </View>
              <TouchableOpacity onPress={() => setRequestingGroup(null)}>
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.requestModalNotice, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <Text style={[styles.requestModalNoticeText, isDark && { color: '#94A3B8' }]}>
                Only approved members can access and message in this channel. Your request will be sent directly to the group Admin.
              </Text>
            </View>

            <Text style={[styles.fieldLabelModal, isDark && { color: '#CBD5E1' }]}>Introduce Yourself or State Your Goal (Optional)</Text>
            <TextInput
              value={joinRequestNote}
              onChangeText={setJoinRequestNote}
              placeholder="e.g., I'm a Solana Rust developer looking to collaborate on DeFi projects..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              multiline
              numberOfLines={3}
              style={[styles.requestModalTextInput, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFFFFF' }]}
            />

            <TouchableOpacity
              onPress={() => {
                requestToJoinCommunity(requestingGroup.id, joinRequestNote.trim() || undefined);
                setRequestingGroup(null);
                setJoinRequestNote('');
              }}
              style={styles.submitJoinRequestBtn}
              activeOpacity={0.85}
            >
              <Send size={15} color="#FFFFFF" />
              <Text style={styles.submitJoinRequestBtnText}>Submit Join Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </CustomModal>

      {/* =========================================================
          FILTER MODAL (Aligned to top for optimal reach)
         ========================================================= */}
      <CustomModal
        visible={isFilterModalOpen}
        alignTop
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={[styles.modalContent, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>Filter Discover</Text>
            <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Verified Toggle */}
          <Text style={[styles.modalSectionLabel, isDark && { color: '#CBD5E1' }]}>Verification</Text>
          <TouchableOpacity
            onPress={() => setVerifiedOnly(!verifiedOnly)}
            style={[
              styles.filterCheckboxRow,
              isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
              verifiedOnly && (isDark ? { backgroundColor: '#1E3A8A', borderColor: '#3B82F6' } : styles.filterCheckboxRowActive)
            ]}
            activeOpacity={0.8}
          >
            <View style={[styles.checkboxBox, verifiedOnly && styles.checkboxBoxActive]}>
              {verifiedOnly && <Check size={14} color="#FFFFFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.filterCheckboxTitle, isDark && { color: '#FFFFFF' }]}>Verified On-Chain Only</Text>
              <Text style={[styles.filterCheckboxSub, isDark && { color: '#94A3B8' }]}>
                Show only talent with cryptographic Solana badge credentials
              </Text>
            </View>
          </TouchableOpacity>

          {/* Skill Filter Chips */}
          <Text style={[styles.modalSectionLabel, isDark && { color: '#CBD5E1' }]}>Filter by Skill</Text>
          <View style={styles.skillsWrapContainer}>
            <TouchableOpacity
              onPress={() => setSelectedSkill(null)}
              style={[
                styles.modalSkillChip,
                isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
                selectedSkill === null && styles.modalSkillChipActive
              ]}
            >
              <Text
                style={[
                  styles.modalSkillChipText,
                  isDark && { color: '#94A3B8' },
                  selectedSkill === null && styles.modalSkillChipTextActive
                ]}
              >
                All Skills
              </Text>
            </TouchableOpacity>
            {allSkills.map((skill) => (
              <TouchableKey
                key={skill}
                onPress={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                style={[
                  styles.modalSkillChip,
                  isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  selectedSkill === skill && styles.modalSkillChipActive
                ]}
              >
                <Text
                  style={[
                    styles.modalSkillChipText,
                    isDark && { color: '#94A3B8' },
                    selectedSkill === skill && styles.modalSkillChipTextActive
                  ]}
                >
                  {skill}
                </Text>
              </TouchableKey>
            ))}
          </View>

          {/* Modal Action Buttons */}
          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              onPress={() => {
                setVerifiedOnly(false);
                setSelectedSkill(null);
                setSelectedCategory(null);
                setIsFilterModalOpen(false);
              }}
              style={[styles.modalResetBtn, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
            >
              <Text style={[styles.modalResetBtnText, isDark && { color: '#94A3B8' }]}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsFilterModalOpen(false)}
              style={styles.modalApplyBtn}
            >
              <Text style={styles.modalApplyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>



      {/* =========================================================
          CREATE NEW COMMUNITY GROUP MODAL
         ========================================================= */}
      <CustomModal
        visible={isCreateGroupOpen}
        onRequestClose={() => setIsCreateGroupOpen(false)}
      >
        <View style={[styles.modalContent, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>Create Community Group</Text>
            <TouchableOpacity onPress={() => setIsCreateGroupOpen(false)}>
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Group Name</Text>
          <TextInput
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="e.g., Solana DeFi Researchers, ZK Developers"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            style={[styles.modalInput, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFFFFF' }]}
          />

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Description</Text>
          <TextInput
            value={newGroupDesc}
            onChangeText={setNewGroupDesc}
            placeholder="What is the goal and focus of this group chat?"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            multiline
            numberOfLines={3}
            style={[styles.modalInput, { height: 70 }, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFFFFF' }]}
          />

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Category</Text>
          <View style={styles.categoryPillsRow}>
            {['Solana Ecosystem', 'Security & Audits', 'Rust & Anchor', 'Design & UX', 'DeFi & Alpha'].map((cat) => (
              <TouchableKey
                key={cat}
                onPress={() => setNewGroupCategory(cat)}
                style={[
                  styles.categoryPill,
                  isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  newGroupCategory === cat && styles.categoryPillActive
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isDark && { color: '#94A3B8' },
                    newGroupCategory === cat && styles.categoryPillTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableKey>
            ))}
          </View>

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Channel Icon Theme</Text>
          <View style={styles.iconThemeRow}>
            {(['solana', 'security', 'rust', 'design', 'announcement'] as CommunityGroup['iconType'][]).map((type) => (
              <TouchableKey
                key={type}
                onPress={() => setNewGroupIconType(type)}
                style={[
                  styles.iconThemeBtn,
                  isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  newGroupIconType === type && styles.iconThemeBtnActive
                ]}
              >
                {renderCommunityIcon(type)}
              </TouchableKey>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleCreateNewGroup}
            style={styles.modalPrimaryBtn}
          >
            <Text style={styles.modalPrimaryBtnText}>Launch Group Chat</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* =========================================================
          DIRECT HIRE & PAYMENT OFFER MODAL (SOL, USDC, USDT)
         ========================================================= */}
      <CustomModal
        visible={!!hireProfile}
        alignTop
        onRequestClose={() => setHireProfile(null)}
      >
        <View style={[styles.modalContent, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>Hire {hireProfile?.name}</Text>
              <Text style={[styles.modalSub, isDark && { color: '#94A3B8' }]}>Direct blockchain payment transfer</Text>
            </View>
            <TouchableOpacity onPress={() => setHireProfile(null)}>
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Payment Currency</Text>
          <View style={styles.currencySelectorRow}>
            {(['SOL', 'USDC', 'USDT'] as PaymentCurrency[]).map((cur) => (
              <TouchableKey
                key={cur}
                onPress={() => setHireCurrency(cur)}
                style={[
                  styles.currencyOption,
                  isDark && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  hireCurrency === cur && styles.currencyOptionActive
                ]}
              >
                <Text
                  style={[
                    styles.currencyOptionText,
                    isDark && { color: '#94A3B8' },
                    hireCurrency === cur && styles.currencyOptionTextActive
                  ]}
                >
                  {cur}
                </Text>
              </TouchableKey>
            ))}
          </View>

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Project / Milestone Title</Text>
          <TextInput
            value={hireJobTitle}
            onChangeText={setHireJobTitle}
            placeholder="e.g., Solana Anchor Program Development"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            style={[styles.modalInput, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFFFFF' }]}
          />

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Payment Amount ({hireCurrency}) *</Text>
          <TextInput
            value={hireAmount}
            onChangeText={setHireAmount}
            placeholder={hireCurrency === 'SOL' ? 'e.g. 15' : 'e.g. 2500'}
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            keyboardType="numeric"
            style={[styles.modalInput, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFFFFF' }]}
          />

          <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Deliverable Requirements / Notes (Optional)</Text>
          <TextInput
            value={hireNotes}
            onChangeText={setHireNotes}
            placeholder="Specify deliverables or repository link..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            multiline
            numberOfLines={3}
            style={[styles.modalInput, { height: 70 }, isDark && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFFFFF' }]}
          />

          <TouchableOpacity
            onPress={handleCreateHireOffer}
            style={styles.modalPrimaryBtn}
          >
            <Text style={styles.modalPrimaryBtnText}>
              {hireAmount ? `Pay & Hire (${hireAmount} ${hireCurrency})` : 'Submit Hire Offer'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 8,
  },
  
  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    fontFamily: 'Plus Jakarta Sans',
  },

  // Search and Switcher Card
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 35,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  filterBtn: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  // 2 Segmented Tabs Switcher
  tabSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 5,
    borderRadius: 6,
  },
  switcherTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  switcherTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  switcherTabTextActive: {
    color: '#2554EB',
    fontWeight: '700',
  },

  // Tab Section
  tabSection: {
    gap: 8,
  },

  // Open for Hire Status Pill
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
    marginBottom: 1,
  },
  openForHireChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  greenOnlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  openForHireText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    fontFamily: 'Plus Jakarta Sans',
  },
  activeSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeSkillTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Talent Card
  talentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  talentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerInfoCol: {
    flex: 1,
    gap: 1,
  },
  nameAndRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  talentNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  talentRoleText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
    lineHeight: 14,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 2,
    fontFamily: 'Plus Jakarta Sans',
  },

  // Metrics Pills Row
  metricsPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  availablePillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#166534',
    fontFamily: 'Plus Jakarta Sans',
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Skills Row
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  moreSkillPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  moreSkillPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 1,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#2554EB',
    paddingVertical: 6,
    borderRadius: 8,
  },
  messageBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
    lineHeight: 14,
  },
  hireBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    borderRadius: 8,
  },
  hireBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
    lineHeight: 14,
  },

  // Communities Banner
  communityBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  communityBannerLeft: {
    flex: 1,
    gap: 2,
  },
  communityBannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  communityBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  communityBannerSub: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
    fontFamily: 'Plus Jakarta Sans',
  },
  newGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2554EB',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newGroupBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Community Card
  communityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  communityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  communityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityContentCol: {
    flex: 1,
    gap: 2,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  communityTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  pinnedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  pinnedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: 'Plus Jakarta Sans',
  },
  memberCountPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  memberCountText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  communityDescText: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
    fontFamily: 'Plus Jakarta Sans',
  },
  communityLastMsgBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  communityLastMsgText: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
    fontFamily: 'Plus Jakarta Sans',
  },
  communityLastMsgTime: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginLeft: 6,
    fontFamily: 'Plus Jakarta Sans',
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 15,
    fontFamily: 'Plus Jakarta Sans',
  },
  resetFilterBtn: {
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetFilterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  createGroupEmptyBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createGroupEmptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Modals Styling
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    fontFamily: 'Plus Jakarta Sans',
  },
  filterCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  filterCheckboxRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  filterCheckboxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  filterCheckboxSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  skillsWrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalSkillChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalSkillChipActive: {
    backgroundColor: '#2554EB',
  },
  modalSkillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalSkillChipTextActive: {
    color: '#FFFFFF',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalResetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  modalResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalApplyBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    backgroundColor: '#2554EB',
    borderRadius: 12,
  },
  modalApplyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    fontFamily: 'Plus Jakarta Sans',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryPillActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2554EB',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Plus Jakarta Sans',
  },
  categoryPillTextActive: {
    color: '#2554EB',
    fontWeight: '700',
  },
  iconThemeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconThemeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconThemeBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2554EB',
  },
  modalPrimaryBtn: {
    backgroundColor: '#2554EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Group Chat Modal
  chatModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    width: '100%',
    maxWidth: 420,
    height: 490,
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  // Community Sub-Filter Segments
  communityFilterSegments: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  communitySegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  communitySegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  communitySegmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  communitySegmentBtnTextActive: {
    color: '#2554EB',
    fontWeight: '800',
  },
  adminJoinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminJoinedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    fontFamily: 'Plus Jakarta Sans',
  },
  lockedJoinedBadge: {
    backgroundColor: '#FEF3C7',
    padding: 3,
    borderRadius: 5,
  },
  communityBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pendingAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  pendingAlertPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: 'Plus Jakarta Sans',
  },
  exploreGroupsEmptyBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreGroupsEmptyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Explore Non-Member Community Card
  exploreCommunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  exploreCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  exploreCardPrivacyNote: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  exploreCardPrivacyText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  requestToJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2554EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  requestToJoinBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },
  requestedPendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  requestedPendingBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Request Join Modal
  requestModalHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  requestModalNotice: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2554EB',
  },
  requestModalNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
    fontFamily: 'Plus Jakarta Sans',
  },
  fieldLabelModal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    marginTop: 4,
  },
  requestModalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    minHeight: 65,
  },
  submitJoinRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  submitJoinRequestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatHeaderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  chatHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  closeChatBtn: {
    padding: 4,
  },
  chatDescBox: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatDescText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
    fontFamily: 'Plus Jakarta Sans',
  },
  chatMessagesScrollView: {
    flex: 1,
    padding: 12,
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyMessagesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Plus Jakarta Sans',
  },
  emptyMessagesSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Plus Jakarta Sans',
  },
  communityMessageCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  messageBubbleCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  messageSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  messageSenderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  senderRoleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  senderRoleBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  messageTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 'auto',
    fontFamily: 'Plus Jakarta Sans',
  },
  messageTextContent: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 17,
    fontFamily: 'Plus Jakarta Sans',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  sendChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendChatBtnActive: {
    backgroundColor: '#2554EB',
  },
  currencySelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2554EB',
  },
  currencyOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  currencyOptionTextActive: {
    color: '#2554EB',
  },
});
