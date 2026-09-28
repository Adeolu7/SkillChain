import React, { useState, useRef, useEffect } from 'react';
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
import { SwipeableMessage } from '../Chat/SwipeableMessage';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import { CommunityGroup, CommunityMessage, UserProfile } from '../../types';
import {
  ChevronLeft,
  UserPlus,
  MoreVertical,
  Paperclip,
  Send,
  Heart,
  Pin,
  Reply,
  Edit2,
  Trash2,
  CheckCheck,
  Zap,
  Shield,
  Code,
  Palette,
  Globe,
  X,
  Crown,
  Link as LinkIcon,
  Check,
  Search,
  Lock,
  Unlock,
  Users,
  Info,
  ShieldAlert,
  UserCheck,
  UserX,
  LogOut,
  Sparkles,
  Volume2,
  Copy,
  Clock
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;

interface CommunityChatPageProps {
  community: CommunityGroup;
  onBack: () => void;
}

export const CommunityChatPage: React.FC<CommunityChatPageProps> = ({
  community,
  onBack
}) => {
  const {
    currentUser,
    profiles,
    communities,
    communityMessages,
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
    approveJoinRequest,
    rejectJoinRequest,
    leaveCommunity,
    viewProfileById,
    showToast,
    isDark
  } = useApp();

  // Retrieve the latest reactive version of this community group from AppContext
  const currentGroup = communities.find((c) => c.id === community.id) || community;

  // Determine user permissions
  const isCreator = currentGroup.creatorId === currentUser.id;
  const isAdmin = isCreator || (currentGroup.adminIds || []).includes(currentUser.id);
  const isMember = (currentGroup.memberIds || []).includes(currentUser.id) || isCreator;
  const isLocked = !!currentGroup.isLocked;

  // States
  const [inputText, setInputText] = useState('');
  const [editingMsg, setEditingMsg] = useState<CommunityMessage | null>(null);
  const [editInputText, setEditInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isChannelDetailsModalOpen, setIsChannelDetailsModalOpen] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<CommunityMessage | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [channelModalTab, setChannelModalTab] = useState<'members' | 'requests' | 'settings'>('members');

  // Edit details inside modal
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState(currentGroup.name);
  const [editDesc, setEditDesc] = useState(currentGroup.description);
  const [editIconType, setEditIconType] = useState<CommunityGroup['iconType']>(currentGroup.iconType);

  const scrollViewRef = useRef<ScrollView>(null);
  const messagesList = communityMessages[currentGroup.id] || [];

  // Pinned messages in this group
  const pinnedMessages = messagesList.filter((m) => m.isPinned);
  const latestPinnedMessage = pinnedMessages[pinnedMessages.length - 1];

  useEffect(() => {
    // Auto scroll to bottom when messages update
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messagesList.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (isLocked && !isAdmin) {
      showToast('Group Locked', 'Only group admins can post in this channel.', 'warning');
      return;
    }

    const finalMsg = replyingTo
      ? `↩️ Replying to @${replyingTo.senderName}: "${replyingTo.text.slice(0, 40)}..."\n${inputText.trim()}`
      : inputText.trim();

    sendCommunityMessage(currentGroup.id, finalMsg);
    setInputText('');
    setReplyingTo(null);
  };

  const handleSaveEdit = () => {
    if (!editingMsg || !editInputText.trim()) return;
    editCommunityMessage(currentGroup.id, editingMsg.id, editInputText.trim());
    setEditingMsg(null);
    setEditInputText('');
  };

  const handleSaveGroupDetails = () => {
    if (!editName.trim()) {
      showToast('Name Required', 'Please enter a group name.', 'warning');
      return;
    }
    updateCommunityDetails(currentGroup.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      iconType: editIconType
    });
    setIsEditingDetails(false);
  };

  const handleAddMember = (profile: UserProfile) => {
    addCommunityMember(currentGroup.id, profile.id);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === currentGroup.creatorId) {
      showToast('Cannot Remove Creator', 'The creator of the group cannot be removed.', 'warning');
      return;
    }
    removeCommunityMember(currentGroup.id, memberId);
  };

  const handleToggleAdmin = (memberId: string) => {
    if (memberId === currentGroup.creatorId) {
      showToast('Creator Role', 'The creator is always the primary administrator.', 'info');
      return;
    }
    toggleCommunityAdmin(currentGroup.id, memberId);
  };

  const handleLeaveGroup = () => {
    setIsChannelDetailsModalOpen(false);
    leaveCommunity(currentGroup.id);
    onBack();
  };

  const renderGroupIcon = (type = currentGroup.iconType, size = 18) => {
    switch (type) {
      case 'announcement':
        return <Volume2 size={size} color="#2554EB" />;
      case 'solana':
        return <Zap size={size} color="#EA580C" fill="#EA580C" />;
      case 'security':
        return <Shield size={size} color="#2554EB" />;
      case 'rust':
        return <Code size={size} color="#E11D48" />;
      case 'design':
        return <Palette size={size} color="#059669" />;
      default:
        return <Globe size={size} color="#2554EB" />;
    }
  };

  // Group Members Profiles
  const memberIds = currentGroup.memberIds || ['user_me'];
  const groupMembers = memberIds.map((id) => {
    if (id === currentUser.id) return currentUser;
    const found = profiles.find((p) => p.id === id);
    if (found) return found;
    return {
      id,
      name: id.replace('user_', '').replace('_', ' ').toUpperCase(),
      handle: `@${id}`,
      title: 'Verified Member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isVerified: true
    } as UserProfile;
  });

  const filteredGroupMembers = groupMembers.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.handle.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q)
    );
  });

  // Filtered available profiles to invite (excluding existing members)
  const availableInviteProfiles = profiles.filter((p) => {
    if (memberIds.includes(p.id)) return false;
    if (p.id === currentUser.id) return false;
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q)
    );
  });

  const pendingRequests = currentGroup.pendingJoinRequests || [];

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#0B0F19' }]}>
      
      {/* =========================================================
          TOP HEADER BAR (Clicking opens Channel Details Modal)
         ========================================================= */}
      <View style={[styles.headerBar, isDark && { backgroundColor: '#0F172A', borderBottomColor: '#334155' }]}>
        
        {/* Left: Back Button */}
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, isDark && { backgroundColor: '#1E293B' }]}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
        </TouchableOpacity>

        {/* Group Icon & Title (Tap to open Channel Info Modal) */}
        <TouchableOpacity
          onPress={() => {
            setIsEditingDetails(false);
            setEditName(currentGroup.name);
            setEditDesc(currentGroup.description);
            setEditIconType(currentGroup.iconType);
            setIsChannelDetailsModalOpen(true);
          }}
          style={styles.headerTitleTouchable}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.groupIconBox,
              isDark ? { backgroundColor: '#1E293B' } : { backgroundColor: currentGroup.iconBgColor || '#EFF6FF' }
            ]}
          >
            {renderGroupIcon()}
          </View>

          <View style={styles.headerTitleCol}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.groupTitleText, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                {currentGroup.name}
              </Text>
              {isLocked && (
                <View style={[styles.headerLockedBadge, isDark && { backgroundColor: '#78350F' }]}>
                  <Lock size={11} color="#FDE68A" />
                </View>
              )}
            </View>
            <View style={styles.statusSubRow}>
              <Text style={[styles.memberCountSub, isDark && { color: '#94A3B8' }]}>
                {currentGroup.memberCount || memberIds.length} members
              </Text>
              <Text style={[styles.dotSub, isDark && { color: '#64748B' }]}> • </Text>
              <View style={styles.activeDot} />
              <Text style={styles.activeSubText}>Active</Text>
              {isAdmin && (
                <>
                  <Text style={[styles.dotSub, isDark && { color: '#64748B' }]}> • </Text>
                  <Text style={[styles.adminRoleTag, isDark && { color: '#FBBF24' }]}>Admin</Text>
                </>
              )}
              {isAdmin && pendingRequests.length > 0 && (
                <View style={[styles.pendingBadgeHeader, isDark && { backgroundColor: '#78350F' }]}>
                  <Text style={[styles.pendingBadgeHeaderText, isDark && { color: '#FDE68A' }]}>{pendingRequests.length} pending</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Right: + Add Person Icon Button */}
        <TouchableOpacity
          onPress={() => setIsAddPersonModalOpen(true)}
          style={[styles.addPersonBtn, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
          activeOpacity={0.85}
          accessibilityLabel="Add Person"
        >
          <UserPlus size={16} color={isDark ? '#60A5FA' : '#2554EB'} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Right: More Options Button */}
        <TouchableOpacity
          onPress={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
          style={[styles.optionsBtn, isDark && { backgroundColor: '#1E293B' }]}
          activeOpacity={0.8}
        >
          <MoreVertical size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>

      </View>

      {/* Popover Options Menu */}
      {isOptionsMenuOpen && (
        <>
          <TouchableOpacity
            style={styles.popoverOverlay}
            activeOpacity={1}
            onPress={() => setIsOptionsMenuOpen(false)}
          />
          <View style={[styles.popoverMenu, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setIsOptionsMenuOpen(false);
                setIsChannelDetailsModalOpen(true);
              }}
            >
              <Info size={15} color={isDark ? '#60A5FA' : '#2554EB'} />
              <Text style={[styles.popoverItemText, isDark && { color: '#FFFFFF' }]}>Channel Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setIsOptionsMenuOpen(false);
                setIsAddPersonModalOpen(true);
              }}
            >
              <UserPlus size={15} color={isDark ? '#60A5FA' : '#2554EB'} />
              <Text style={[styles.popoverItemText, isDark && { color: '#FFFFFF' }]}>Invite Members</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  setIsOptionsMenuOpen(false);
                  toggleCommunityLock(currentGroup.id);
                }}
              >
                {isLocked ? <Unlock size={15} color="#10B981" /> : <Lock size={15} color="#FBBF24" />}
                <Text style={[styles.popoverItemText, isDark && { color: '#FFFFFF' }]}>
                  {isLocked ? 'Unlock Group' : 'Lock Group (Admins only)'}
                </Text>
              </TouchableOpacity>
            )}

            {isAdmin && pendingRequests.length > 0 && (
              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  setIsOptionsMenuOpen(false);
                  setChannelModalTab('requests');
                  setIsChannelDetailsModalOpen(true);
                }}
              >
                <UserCheck size={15} color="#FBBF24" />
                <Text style={[styles.popoverItemText, { color: isDark ? '#FBBF24' : '#D97706', fontWeight: '700' }]}>
                  Join Requests ({pendingRequests.length})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setIsOptionsMenuOpen(false);
                showToast('Link Copied', `Copied link to #${currentGroup.name}`, 'success');
              }}
            >
              <LinkIcon size={15} color={isDark ? '#60A5FA' : '#2554EB'} />
              <Text style={[styles.popoverItemText, isDark && { color: '#FFFFFF' }]}>Share Channel</Text>
            </TouchableOpacity>

            {!isCreator && (
              <TouchableOpacity
                style={[styles.popoverItem, { borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => {
                  setIsOptionsMenuOpen(false);
                  handleLeaveGroup();
                }}
              >
                <LogOut size={15} color="#EF4444" />
                <Text style={[styles.popoverItemText, { color: '#EF4444' }]}>Leave Channel</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* =========================================================
          PINNED MESSAGE TOP BANNER
         ========================================================= */}
      {latestPinnedMessage && (
        <View style={[styles.pinnedBanner, isDark && { backgroundColor: '#1E3A8A', borderBottomColor: '#1D4ED8' }]}>
          <Pin size={14} color={isDark ? '#93C5FD' : '#2554EB'} fill={isDark ? '#93C5FD' : '#2554EB'} />
          <View style={styles.pinnedBannerContent}>
            <Text style={[styles.pinnedBannerAuthor, isDark && { color: '#93C5FD' }]}>
              Pinned message by {latestPinnedMessage.senderName}
            </Text>
            <Text style={[styles.pinnedBannerSnippet, isDark && { color: '#E2E8F0' }]} numberOfLines={1}>
              {latestPinnedMessage.text}
            </Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => toggleCommunityMessagePin(currentGroup.id, latestPinnedMessage.id)}
              style={styles.pinnedBannerUnpinBtn}
            >
              <X size={14} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Locked Group Alert Ribbon */}
      {isLocked && (
        <View style={styles.lockedRibbon}>
          <Lock size={12} color="#92400E" />
          <Text style={styles.lockedRibbonText}>
            This group is locked. Only administrators can send messages.
          </Text>
        </View>
      )}

      {/* =========================================================
          CHAT STREAM AREA (Swipe to reply, Long Press to Pin/Action)
         ========================================================= */}
      <ScrollView
        ref={scrollViewRef}
        style={[styles.messagesScrollView, isDark && { backgroundColor: '#0B0F19' }]}
        contentContainerStyle={styles.messagesScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messagesList.length === 0 && (
          <EmptyState
            icon={Globe}
            compact
            badge={`#${currentGroup.name}`}
            title="No messages yet"
            description="Be the first to say hello and start discussing Web3 projects in this community channel!"
          />
        )}
        {messagesList.map((msg) => {
          const isMyMsg = msg.senderId === currentUser.id;
          const isMsgSenderAdmin = (currentGroup.adminIds || []).includes(msg.senderId) || currentGroup.creatorId === msg.senderId;

          // Message component
          return (
            <SwipeableMessage
              key={msg.id}
              onReply={() => setReplyingTo(msg)}
              onLongPress={() => setSelectedMessageForAction(msg)}
              isMyMessage={isMyMsg}
            >
              {isMyMsg ? (
                // Current User's Message (Right aligned)
                <View style={styles.myMessageRow}>
                  
                  {/* Header row above bubble */}
                  <View style={styles.myMessageHeaderRow}>
                    <TouchableOpacity
                      onPress={() => viewProfileById(msg.senderId)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.mySenderName, isDark && { color: '#FFFFFF' }]}>{msg.senderName}</Text>
                    </TouchableOpacity>

                    {/* Admin Badge */}
                    {isMsgSenderAdmin && (
                      <View style={[styles.adminBadge, isDark && { backgroundColor: '#78350F' }]}>
                        <Crown size={10} color="#FDE68A" fill="#FDE68A" />
                        <Text style={[styles.adminBadgeText, isDark && { color: '#FDE68A' }]}>Admin</Text>
                      </View>
                    )}

                    <Text style={[styles.senderRoleMeta, isDark && { color: '#94A3B8' }]}>
                      • {msg.senderTitle || 'Full-Stack Web3 Engineer'} {msg.createdAt}
                    </Text>

                    <TouchableOpacity
                      onPress={() => viewProfileById(msg.senderId)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: msg.senderAvatar }} style={styles.myAvatar} />
                    </TouchableOpacity>
                  </View>

                  {/* Bubble */}
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onLongPress={() => setSelectedMessageForAction(msg)}
                    style={[
                      styles.myBubble,
                      msg.isPinned && styles.bubblePinnedHighlight
                    ]}
                  >
                    {msg.isPinned && (
                      <View style={styles.bubblePinTagRight}>
                        <Pin size={11} color="#FFFFFF" fill="#FFFFFF" />
                        <Text style={styles.bubblePinTagText}>PINNED</Text>
                      </View>
                    )}
                    <Text style={styles.myBubbleText}>{msg.text}</Text>
                  </TouchableOpacity>

                  {/* Actions Row Below Bubble */}
                  <View style={styles.myActionsRow}>
                    <CheckCheck size={15} color="#2554EB" />

                    {/* Like Reaction */}
                    <TouchableOpacity
                      onPress={() => toggleCommunityMessageLike(currentGroup.id, msg.id)}
                      style={[
                        styles.reactionPill,
                        isDark && { backgroundColor: '#371B20' },
                        msg.isLiked && styles.reactionPillActive
                      ]}
                      activeOpacity={0.8}
                    >
                      <Heart
                        size={12}
                        color={msg.isLiked ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B')}
                        fill={msg.isLiked ? '#EF4444' : 'none'}
                      />
                      <Text
                        style={[
                          styles.reactionCountText,
                          msg.isLiked && styles.reactionCountTextActive
                        ]}
                      >
                        {msg.likesCount || 1}
                      </Text>
                    </TouchableOpacity>

                    {/* Pin button (Admin or Sender) */}
                    <TouchableOpacity
                      onPress={() => toggleCommunityMessagePin(currentGroup.id, msg.id)}
                      style={styles.iconActionBtn}
                    >
                      <Pin
                        size={14}
                        color={msg.isPinned ? '#2554EB' : (isDark ? '#64748B' : '#94A3B8')}
                        fill={msg.isPinned ? '#2554EB' : 'none'}
                      />
                    </TouchableOpacity>

                    {/* Reply */}
                    <TouchableOpacity
                      onPress={() => setReplyingTo(msg)}
                      style={styles.iconActionBtn}
                    >
                      <Reply size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>

                    {/* Edit */}
                    <TouchableOpacity
                      onPress={() => {
                        setEditingMsg(msg);
                        setEditInputText(msg.text);
                      }}
                      style={styles.iconActionBtn}
                    >
                      <Edit2 size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity
                      onPress={() => deleteCommunityMessage(currentGroup.id, msg.id)}
                      style={styles.iconActionBtn}
                    >
                      <Trash2 size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>

                </View>
              ) : (
                // Other Member's Message (Left aligned)
                <View style={styles.otherMessageRow}>
                  
                  {/* Left Avatar */}
                  <TouchableOpacity
                    onPress={() => viewProfileById(msg.senderId)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: msg.senderAvatar }} style={styles.otherAvatar} />
                  </TouchableOpacity>

                  {/* Message Content Column */}
                  <View style={styles.otherContentCol}>
                    
                    {/* Header Row */}
                    <View style={styles.otherHeaderRow}>
                      <TouchableOpacity
                        onPress={() => viewProfileById(msg.senderId)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.otherSenderName, isDark && { color: '#FFFFFF' }]}>{msg.senderName}</Text>
                      </TouchableOpacity>

                      {isMsgSenderAdmin ? (
                        <View style={[styles.adminBadge, isDark && { backgroundColor: '#78350F' }]}>
                          <Crown size={10} color="#FDE68A" fill="#FDE68A" />
                          <Text style={[styles.adminBadgeText, isDark && { color: '#FDE68A' }]}>Admin</Text>
                        </View>
                      ) : (
                        <View style={[styles.greenLinkBadge, isDark && { backgroundColor: '#064E3B' }]}>
                          <LinkIcon size={10} color="#34D399" />
                        </View>
                      )}

                      <Text style={[styles.otherRoleMeta, isDark && { color: '#94A3B8' }]}>
                        • {msg.senderTitle || 'Lead Engineer'} {msg.createdAt}
                      </Text>
                    </View>

                    {/* Light Bubble */}
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onLongPress={() => setSelectedMessageForAction(msg)}
                      style={[
                        styles.otherBubble,
                        isDark && { backgroundColor: '#1E293B' },
                        msg.isPinned && styles.bubblePinnedHighlightOther
                      ]}
                    >
                      {msg.isPinned && (
                        <View style={styles.bubblePinTagLeft}>
                          <Pin size={11} color="#2554EB" fill="#2554EB" />
                          <Text style={styles.bubblePinTagLeftText}>PINNED</Text>
                        </View>
                      )}
                      <Text style={[styles.otherBubbleText, isDark && { color: '#F1F5F9' }]}>{msg.text}</Text>
                    </TouchableOpacity>

                    {/* Actions Row Below Bubble */}
                    <View style={styles.otherActionsRow}>
                      <TouchableOpacity
                        onPress={() => toggleCommunityMessageLike(currentGroup.id, msg.id)}
                        style={[
                          styles.reactionPill,
                          isDark && { backgroundColor: '#371B20' },
                          msg.isLiked && styles.reactionPillActive
                        ]}
                        activeOpacity={0.8}
                      >
                        <Heart
                          size={12}
                          color={msg.isLiked ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B')}
                          fill={msg.isLiked ? '#EF4444' : 'none'}
                        />
                        <Text
                          style={[
                            styles.reactionCountText,
                            msg.isLiked && styles.reactionCountTextActive
                          ]}
                        >
                          {msg.likesCount || 2}
                        </Text>
                      </TouchableOpacity>

                      {/* Pin button */}
                      <TouchableOpacity
                        onPress={() => toggleCommunityMessagePin(currentGroup.id, msg.id)}
                        style={styles.iconActionBtn}
                      >
                        <Pin
                          size={14}
                          color={msg.isPinned ? '#2554EB' : (isDark ? '#64748B' : '#94A3B8')}
                          fill={msg.isPinned ? '#2554EB' : 'none'}
                        />
                      </TouchableOpacity>

                      {/* Reply */}
                      <TouchableOpacity
                        onPress={() => setReplyingTo(msg)}
                        style={styles.iconActionBtn}
                      >
                        <Reply size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                      </TouchableOpacity>

                      {/* Delete (Admins can delete inappropriate messages) */}
                      {isAdmin && (
                        <TouchableOpacity
                          onPress={() => deleteCommunityMessage(currentGroup.id, msg.id)}
                          style={styles.iconActionBtn}
                        >
                          <Trash2 size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        </TouchableOpacity>
                      )}
                    </View>

                  </View>

                </View>
              )}
            </SwipeableMessage>
          );
        })}
      </ScrollView>

      {/* Replying Banner */}
      {replyingTo && (
        <View style={[styles.replyingBanner, isDark && { backgroundColor: '#1E293B', borderTopColor: '#334155' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.replyingToTitle, isDark && { color: '#60A5FA' }]}>Replying to {replyingTo.senderName}</Text>
            <Text style={[styles.replyingToText, isDark && { color: '#CBD5E1' }]} numberOfLines={1}>{replyingTo.text}</Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <X size={16} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
        </View>
      )}

      {/* =========================================================
          BOTTOM CHAT INPUT BAR
         ========================================================= */}
      <View style={[styles.bottomInputBar, isDark && { backgroundColor: '#0F172A', borderTopColor: '#334155' }]}>
        {isLocked && !isAdmin ? (
          // Disabled input for locked groups
          <View style={[styles.lockedInputPlaceholder, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Lock size={15} color="#94A3B8" />
            <Text style={[styles.lockedInputPlaceholderText, isDark && { color: '#94A3B8' }]}>
              Only administrators can send messages in this group.
            </Text>
          </View>
        ) : (
          <>
            {/* Paperclip Button */}
            <TouchableOpacity
              onPress={() => showToast('Attachment', 'Attach Solana transaction link, code snippet, or image', 'info')}
              style={[styles.attachmentBtn, isDark && { backgroundColor: '#1E293B' }]}
              activeOpacity={0.8}
            >
              <Paperclip size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            {/* Input Text Box */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={isLocked ? 'Message channel as Admin...' : 'Type a message...'}
              placeholderTextColor="#64748B"
              style={[styles.chatTextInput, isDark && { backgroundColor: '#1E293B', borderColor: '#334155', color: '#FFFFFF' }]}
              onSubmitEditing={handleSend}
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendBtn,
                inputText.trim().length > 0 && styles.sendBtnActive
              ]}
              activeOpacity={0.85}
              disabled={!inputText.trim()}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* =========================================================
          CHANNEL DETAILS & ADMIN MANAGEMENT MODAL
         ========================================================= */}
      <CustomModal
        visible={isChannelDetailsModalOpen}
        onRequestClose={() => {
          setIsChannelDetailsModalOpen(false);
          setIsEditingDetails(false);
        }}
      >
        <View style={styles.channelModalCard}>
          
          {/* Modal Header */}
          <View style={styles.channelModalHeader}>
            <View style={styles.channelModalHeaderTitleRow}>
              <View
                style={[
                  styles.channelModalIconSquare,
                  { backgroundColor: currentGroup.iconBgColor || '#EFF6FF' }
                ]}
              >
                {renderGroupIcon(isEditingDetails ? editIconType : currentGroup.iconType, 22)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelModalTitle}>{currentGroup.name}</Text>
                <Text style={styles.channelModalSub}>{currentGroup.category} • {memberIds.length} members</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setIsChannelDetailsModalOpen(false);
                setIsEditingDetails(false);
              }}
              style={styles.closeModalBtn}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Navigation Sub-Tabs */}
          <View style={styles.channelModalTabsRow}>
            <TouchableOpacity
              onPress={() => setChannelModalTab('members')}
              style={[
                styles.channelModalTabBtn,
                channelModalTab === 'members' && styles.channelModalTabBtnActive
              ]}
            >
              <Users size={14} color={channelModalTab === 'members' ? '#2554EB' : '#64748B'} />
              <Text
                style={[
                  styles.channelModalTabBtnText,
                  channelModalTab === 'members' && styles.channelModalTabBtnTextActive
                ]}
              >
                Members ({memberIds.length})
              </Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                onPress={() => setChannelModalTab('requests')}
                style={[
                  styles.channelModalTabBtn,
                  channelModalTab === 'requests' && styles.channelModalTabBtnActive
                ]}
              >
                <UserCheck size={14} color={channelModalTab === 'requests' ? '#2554EB' : '#64748B'} />
                <Text
                  style={[
                    styles.channelModalTabBtnText,
                    channelModalTab === 'requests' && styles.channelModalTabBtnTextActive
                  ]}
                >
                  Join Requests
                </Text>
                {pendingRequests.length > 0 && (
                  <View style={styles.tabRequestsCountBadge}>
                    <Text style={styles.tabRequestsCountBadgeText}>{pendingRequests.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setChannelModalTab('settings')}
              style={[
                styles.channelModalTabBtn,
                channelModalTab === 'settings' && styles.channelModalTabBtnActive
              ]}
            >
              <Info size={14} color={channelModalTab === 'settings' ? '#2554EB' : '#64748B'} />
              <Text
                style={[
                  styles.channelModalTabBtnText,
                  channelModalTab === 'settings' && styles.channelModalTabBtnTextActive
                ]}
              >
                About & Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: MEMBERS LIST */}
          {channelModalTab === 'members' && (
            <View style={styles.channelModalTabContent}>
              
              {/* Action row: Search & + Add Member */}
              <View style={styles.membersTopActionsRow}>
                <View style={styles.memberSearchRowMini}>
                  <Search size={13} color="#94A3B8" />
                  <TextInput
                    value={memberSearch}
                    onChangeText={setMemberSearch}
                    placeholder="Search members..."
                    placeholderTextColor="#94A3B8"
                    style={styles.memberSearchInputMini}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => setIsAddPersonModalOpen(true)}
                  style={styles.addMemberActionBtn}
                  activeOpacity={0.8}
                >
                  <UserPlus size={13} color="#FFFFFF" />
                  <Text style={styles.addMemberActionBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Members Scrollable List */}
              <ScrollView style={styles.channelMembersScrollView} showsVerticalScrollIndicator={false}>
                {filteredGroupMembers.map((member) => {
                  const isMemberAdmin = (currentGroup.adminIds || []).includes(member.id) || currentGroup.creatorId === member.id;
                  const isMemberCreator = member.id === currentGroup.creatorId;
                  const isMe = member.id === currentUser.id;

                  return (
                    <ViewKey key={member.id} style={styles.memberCardRow}>
                      <TouchableOpacity
                        onPress={() => {
                          setIsChannelDetailsModalOpen(false);
                          viewProfileById(member.id);
                        }}
                        style={styles.memberAvatarTouch}
                      >
                        <Image source={{ uri: member.avatar }} style={styles.memberAvatarImg} />
                      </TouchableOpacity>

                      <View style={styles.memberInfoCol}>
                        <View style={styles.memberNameRow}>
                          <TouchableOpacity
                            onPress={() => {
                              setIsChannelDetailsModalOpen(false);
                              viewProfileById(member.id);
                            }}
                          >
                            <Text style={styles.memberNameText}>
                              {member.name} {isMe ? '(You)' : ''}
                            </Text>
                          </TouchableOpacity>

                          {isMemberCreator ? (
                            <View style={styles.creatorBadge}>
                              <Crown size={10} color="#D97706" fill="#D97706" />
                              <Text style={styles.creatorBadgeText}>Creator / Admin</Text>
                            </View>
                          ) : isMemberAdmin ? (
                            <View style={styles.adminMiniBadge}>
                              <Shield size={10} color="#2554EB" />
                              <Text style={styles.adminMiniBadgeText}>Admin</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.memberTitleSub} numberOfLines={1}>{member.title}</Text>
                      </View>

                      {/* Admin Member Management Actions */}
                      {isAdmin && !isMe && !isMemberCreator && (
                        <View style={styles.adminMemberActionsRow}>
                          {/* Toggle Admin */}
                          <TouchableOpacity
                            onPress={() => handleToggleAdmin(member.id)}
                            style={[
                              styles.roleToggleBtn,
                              isMemberAdmin && styles.roleToggleBtnActive
                            ]}
                          >
                            <Crown size={12} color={isMemberAdmin ? '#D97706' : '#64748B'} />
                          </TouchableOpacity>

                          {/* Remove Member */}
                          <TouchableOpacity
                            onPress={() => handleRemoveMember(member.id, member.name)}
                            style={styles.removeMemberBtn}
                          >
                            <UserX size={13} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </ViewKey>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* TAB 2: JOIN REQUESTS (ADMIN ONLY) */}
          {channelModalTab === 'requests' && isAdmin && (
            <View style={styles.channelModalTabContent}>
              <View style={styles.joinRequestsHeaderBanner}>
                <Clock size={15} color="#2554EB" />
                <Text style={styles.joinRequestsHeaderBannerText}>
                  Freelancers must be approved by an Admin before accessing this channel.
                </Text>
              </View>

              {pendingRequests.length === 0 ? (
                <EmptyState
                  icon={UserCheck}
                  compact
                  badge="Admin Review"
                  title="No Pending Requests"
                  description={`When freelancers request to join #${currentGroup.name}, their applications will appear here for your review.`}
                />
              ) : (
                <ScrollView style={styles.channelMembersScrollView} showsVerticalScrollIndicator={false}>
                  {pendingRequests.map((req) => (
                    <ViewKey key={req.userId} style={styles.requestCard}>
                      <View style={styles.requestCardTop}>
                        <TouchableOpacity
                          onPress={() => {
                            setIsChannelDetailsModalOpen(false);
                            viewProfileById(req.userId);
                          }}
                        >
                          <Image
                            source={{ uri: req.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' }}
                            style={styles.requestAvatar}
                          />
                        </TouchableOpacity>

                        <View style={styles.requestMeta}>
                          <Text style={styles.requestUserName}>{req.userName || req.userId}</Text>
                          <Text style={styles.requestUserTitle}>{req.userTitle || 'Solana Freelancer'}</Text>
                          <Text style={styles.requestTime}>{req.requestedAt}</Text>
                        </View>
                      </View>

                      {req.note && (
                        <View style={styles.requestNoteBox}>
                          <Text style={styles.requestNoteText}>"{req.note}"</Text>
                        </View>
                      )}

                      <View style={styles.requestActionsRow}>
                        <TouchableOpacity
                          onPress={() => approveJoinRequest(currentGroup.id, req.userId)}
                          style={styles.approveBtn}
                          activeOpacity={0.8}
                        >
                          <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.approveBtnText}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => rejectJoinRequest(currentGroup.id, req.userId)}
                          style={styles.rejectBtn}
                          activeOpacity={0.8}
                        >
                          <X size={14} color="#64748B" strokeWidth={2} />
                          <Text style={styles.rejectBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    </ViewKey>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 3: ABOUT & ADMIN SETTINGS */}
          {channelModalTab === 'settings' && (
            <ScrollView style={styles.channelModalTabContent} showsVerticalScrollIndicator={false}>
              
              {/* Edit Details Mode */}
              {isEditingDetails && isAdmin ? (
                <View style={styles.editDetailsForm}>
                  <Text style={styles.sectionLabel}>Group Name</Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.settingsTextInput}
                    placeholder="Enter group name..."
                  />

                  <Text style={styles.sectionLabel}>Description</Text>
                  <TextInput
                    value={editDesc}
                    onChangeText={setEditDesc}
                    multiline
                    numberOfLines={3}
                    style={[styles.settingsTextInput, { minHeight: 70 }]}
                    placeholder="Group channel topic & description..."
                  />

                  <Text style={styles.sectionLabel}>Group Icon Badge</Text>
                  <View style={styles.iconSelectorRow}>
                    {(['solana', 'security', 'rust', 'design', 'announcement', 'custom'] as CommunityGroup['iconType'][]).map((type) => (
                      <TouchableKey
                        key={type}
                        onPress={() => setEditIconType(type)}
                        style={[
                          styles.iconChoiceBox,
                          editIconType === type && styles.iconChoiceBoxActive
                        ]}
                      >
                        {renderGroupIcon(type, 18)}
                        <Text style={styles.iconChoiceLabel}>{type}</Text>
                      </TouchableKey>
                    ))}
                  </View>

                  <View style={styles.editButtonsRow}>
                    <TouchableOpacity
                      onPress={handleSaveGroupDetails}
                      style={styles.saveDetailsBtn}
                    >
                      <Check size={15} color="#FFFFFF" />
                      <Text style={styles.saveDetailsBtnText}>Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setIsEditingDetails(false)}
                      style={styles.cancelEditBtn}
                    >
                      <Text style={styles.cancelEditBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.aboutDetailsBox}>
                  
                  {/* Group Description */}
                  <View style={styles.aboutFieldCard}>
                    <Text style={styles.fieldLabel}>Channel Description</Text>
                    <Text style={styles.fieldValText}>{currentGroup.description}</Text>
                  </View>

                  {/* Creator Info */}
                  <View style={styles.aboutFieldCard}>
                    <Text style={styles.fieldLabel}>Creator & Head Admin</Text>
                    <Text style={styles.fieldValText}>
                      {currentGroup.creatorId === currentUser.id ? 'You (Creator)' : 'Community Leader'}
                    </Text>
                  </View>

                  {/* Admin Controls Section */}
                  {isAdmin && (
                    <View style={styles.adminControlsSection}>
                      <Text style={styles.adminControlsHeading}>Admin Controls</Text>

                      {/* Edit Details Button */}
                      <TouchableOpacity
                        onPress={() => setIsEditingDetails(true)}
                        style={styles.adminControlBtn}
                        activeOpacity={0.8}
                      >
                        <Edit2 size={15} color="#2554EB" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.adminControlBtnTitle}>Edit Group Info & Icon</Text>
                          <Text style={styles.adminControlBtnSub}>Change name, description, badge style</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Lock / Unlock Toggle */}
                      <TouchableOpacity
                        onPress={() => toggleCommunityLock(currentGroup.id)}
                        style={[
                          styles.adminControlBtn,
                          isLocked ? styles.adminControlBtnLocked : styles.adminControlBtnUnlocked
                        ]}
                        activeOpacity={0.8}
                      >
                        {isLocked ? <Lock size={16} color="#D97706" /> : <Unlock size={16} color="#10B981" />}
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.adminControlBtnTitle, isLocked && { color: '#B45309' }]}>
                            {isLocked ? 'Group is Locked (Admins Only)' : 'Group is Open (All Members)'}
                          </Text>
                          <Text style={styles.adminControlBtnSub}>
                            {isLocked
                              ? 'Tap to unlock: regular members will be able to post messages'
                              : 'Tap to lock: only group admins will be able to post messages'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Leave Group Action */}
                  {!isCreator && (
                    <TouchableOpacity
                      onPress={handleLeaveGroup}
                      style={styles.leaveGroupMainBtn}
                      activeOpacity={0.8}
                    >
                      <LogOut size={15} color="#EF4444" />
                      <Text style={styles.leaveGroupMainBtnText}>Leave Community Group</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}

        </View>
      </CustomModal>

      {/* =========================================================
          MESSAGE QUICK ACTIONS MODAL (ON LONG PRESS)
         ========================================================= */}
      <CustomModal
        visible={!!selectedMessageForAction}
        onRequestClose={() => setSelectedMessageForAction(null)}
      >
        {selectedMessageForAction && (
          <View style={styles.actionSheetCard}>
            
            {/* Header with snippet */}
            <View style={styles.actionSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionSheetSender}>{selectedMessageForAction.senderName}</Text>
                <Text style={styles.actionSheetSnippet} numberOfLines={2}>
                  "{selectedMessageForAction.text}"
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMessageForAction(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Actions List */}
            <View style={styles.actionSheetButtonsList}>
              
              {/* Pin / Unpin */}
              <TouchableOpacity
                onPress={() => {
                  toggleCommunityMessagePin(currentGroup.id, selectedMessageForAction.id);
                  setSelectedMessageForAction(null);
                }}
                style={styles.actionSheetBtn}
              >
                <Pin
                  size={17}
                  color={selectedMessageForAction.isPinned ? '#2554EB' : '#0F172A'}
                  fill={selectedMessageForAction.isPinned ? '#2554EB' : 'none'}
                />
                <Text style={styles.actionSheetBtnText}>
                  {selectedMessageForAction.isPinned ? 'Unpin from Channel' : 'Pin Message to Channel'}
                </Text>
              </TouchableOpacity>

              {/* Reply */}
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(selectedMessageForAction);
                  setSelectedMessageForAction(null);
                }}
                style={styles.actionSheetBtn}
              >
                <Reply size={17} color="#0F172A" />
                <Text style={styles.actionSheetBtnText}>Reply to Message</Text>
              </TouchableOpacity>

              {/* Like / React */}
              <TouchableOpacity
                onPress={() => {
                  toggleCommunityMessageLike(currentGroup.id, selectedMessageForAction.id);
                  setSelectedMessageForAction(null);
                }}
                style={styles.actionSheetBtn}
              >
                <Heart
                  size={17}
                  color={selectedMessageForAction.isLiked ? '#EF4444' : '#0F172A'}
                  fill={selectedMessageForAction.isLiked ? '#EF4444' : 'none'}
                />
                <Text style={styles.actionSheetBtnText}>
                  {selectedMessageForAction.isLiked ? 'Unlike Message' : 'Like Message'}
                </Text>
              </TouchableOpacity>

              {/* Copy */}
              <TouchableOpacity
                onPress={() => {
                  try {
                    navigator.clipboard?.writeText(selectedMessageForAction.text);
                  } catch (e) {}
                  showToast('Copied', 'Message text copied to clipboard', 'info');
                  setSelectedMessageForAction(null);
                }}
                style={styles.actionSheetBtn}
              >
                <Copy size={17} color="#0F172A" />
                <Text style={styles.actionSheetBtnText}>Copy Text</Text>
              </TouchableOpacity>

              {/* Edit (Sender only) */}
              {selectedMessageForAction.senderId === currentUser.id && (
                <TouchableOpacity
                  onPress={() => {
                    setEditingMsg(selectedMessageForAction);
                    setEditInputText(selectedMessageForAction.text);
                    setSelectedMessageForAction(null);
                  }}
                  style={styles.actionSheetBtn}
                >
                  <Edit2 size={17} color="#0F172A" />
                  <Text style={styles.actionSheetBtnText}>Edit Message</Text>
                </TouchableOpacity>
              )}

              {/* Delete (Sender or Admin) */}
              {(selectedMessageForAction.senderId === currentUser.id || isAdmin) && (
                <TouchableOpacity
                  onPress={() => {
                    deleteCommunityMessage(currentGroup.id, selectedMessageForAction.id);
                    setSelectedMessageForAction(null);
                  }}
                  style={[styles.actionSheetBtn, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}
                >
                  <Trash2 size={17} color="#EF4444" />
                  <Text style={[styles.actionSheetBtnText, { color: '#EF4444' }]}>
                    Delete Message {isAdmin && selectedMessageForAction.senderId !== currentUser.id ? '(as Admin)' : ''}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        )}
      </CustomModal>

      {/* =========================================================
          EDIT MESSAGE MODAL
         ========================================================= */}
      <CustomModal visible={!!editingMsg} onRequestClose={() => setEditingMsg(null)}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Message</Text>
            <TouchableOpacity onPress={() => setEditingMsg(null)}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TextInput
            value={editInputText}
            onChangeText={setEditInputText}
            placeholder="Edit message..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={styles.modalTextInput}
            autoFocus
          />

          <TouchableOpacity onPress={handleSaveEdit} style={styles.modalSaveBtn}>
            <Text style={styles.modalSaveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* =========================================================
          ADD MEMBER TO COMMUNITY MODAL
         ========================================================= */}
      <CustomModal
        visible={isAddPersonModalOpen}
        onRequestClose={() => setIsAddPersonModalOpen(false)}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIconBox}>
              <UserPlus size={18} color="#2554EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Add Members</Text>
              <Text style={styles.modalSub}>Add verified Solana talent to #{currentGroup.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAddPersonModalOpen(false)}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.memberSearchRow}>
            <Search size={14} color="#94A3B8" />
            <TextInput
              value={memberSearch}
              onChangeText={setMemberSearch}
              placeholder="Search talent by name or skill..."
              placeholderTextColor="#94A3B8"
              style={styles.memberSearchInput}
            />
          </View>

          {/* Profiles List */}
          <ScrollView style={styles.inviteListScrollView} showsVerticalScrollIndicator={false}>
            {availableInviteProfiles.length === 0 ? (
              <View style={styles.noInviteProfilesBox}>
                <Text style={styles.noInviteProfilesText}>
                  {memberSearch.trim() ? 'No matching talent found' : 'All available talents are already in this group!'}
                </Text>
              </View>
            ) : (
              availableInviteProfiles.map((p) => (
                <ViewKey key={p.id} style={styles.inviteRow}>
                  <Image source={{ uri: p.avatar }} style={styles.inviteAvatar} />
                  <View style={styles.inviteMeta}>
                    <Text style={styles.inviteName}>{p.name}</Text>
                    <Text style={styles.inviteRole} numberOfLines={1}>{p.title}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAddMember(p)}
                    style={styles.inviteBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.inviteBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </ViewKey>
              ))
            )}
          </ScrollView>
        </View>
      </CustomModal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' as any,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerLockedBadge: {
    backgroundColor: '#FEF3C7',
    padding: 3,
    borderRadius: 6,
  },
  statusSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    flexWrap: 'wrap',
  },
  memberCountSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  dotSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  activeSubText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  adminRoleTag: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
  },
  pendingBadgeHeader: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  pendingBadgeHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  addPersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  optionsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  popoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  popoverMenu: {
    position: 'absolute',
    top: 55,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 6,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 51,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  popoverItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    gap: 10,
  },
  pinnedBannerContent: {
    flex: 1,
  },
  pinnedBannerAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },
  pinnedBannerSnippet: {
    fontSize: 12,
    color: '#334155',
  },
  pinnedBannerUnpinBtn: {
    padding: 4,
  },
  lockedRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  lockedRibbonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  messagesScrollView: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  messagesScrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 18,
  },
  otherMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '90%',
  },
  otherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
  },
  otherContentCol: {
    flex: 1,
  },
  otherHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  otherSenderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  greenLinkBadge: {
    backgroundColor: '#D1FAE5',
    padding: 3,
    borderRadius: 5,
  },
  otherRoleMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  otherBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubblePinnedHighlightOther: {
    borderLeftWidth: 3,
    borderLeftColor: '#2554EB',
    backgroundColor: '#EFF6FF',
  },
  bubblePinTagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  bubblePinTagLeftText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2554EB',
  },
  otherBubbleText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
  },
  otherActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  reactionPillActive: {
    backgroundColor: '#FEE2E2',
  },
  reactionCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  reactionCountTextActive: {
    color: '#EF4444',
  },
  iconActionBtn: {
    padding: 3,
  },
  myMessageRow: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  myMessageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  mySenderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  senderRoleMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  myAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
  },
  myBubble: {
    backgroundColor: '#2554EB',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubblePinnedHighlight: {
    borderRightWidth: 3,
    borderRightColor: '#F59E0B',
  },
  bubblePinTagRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  bubblePinTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  myBubbleText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  myActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
    justifyContent: 'flex-end',
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  replyingToTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },
  replyingToText: {
    fontSize: 12,
    color: '#475569',
  },
  bottomInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  lockedInputPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  lockedInputPlaceholderText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  attachmentBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#2554EB',
  },

  /* Channel Details Modal */
  channelModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
  },
  channelModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  channelModalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  channelModalIconSquare: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  channelModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelModalTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  channelModalTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  channelModalTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  channelModalTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  channelModalTabBtnTextActive: {
    color: '#2554EB',
    fontWeight: '800',
  },
  tabRequestsCountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabRequestsCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  channelModalTabContent: {
    maxHeight: 380,
  },
  membersTopActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  memberSearchRowMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  memberSearchInputMini: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  addMemberActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2554EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addMemberActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  channelMembersScrollView: {
    maxHeight: 320,
  },
  memberCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberAvatarTouch: {
    marginRight: 10,
  },
  memberAvatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  memberNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  creatorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  adminMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminMiniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2554EB',
  },
  memberTitleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  adminMemberActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleToggleBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  roleToggleBtnActive: {
    backgroundColor: '#FEF3C7',
  },
  removeMemberBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },

  /* Join Requests */
  joinRequestsHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  joinRequestsHeaderBannerText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
    flex: 1,
  },
  noRequestsBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  noRequestsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  noRequestsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  requestCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  requestCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  requestMeta: {
    flex: 1,
  },
  requestUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  requestUserTitle: {
    fontSize: 11,
    color: '#64748B',
  },
  requestTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  requestNoteBox: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#2554EB',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  requestNoteText: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
  },
  requestActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 10,
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 10,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  /* About & Admin Settings */
  aboutDetailsBox: {
    gap: 12,
  },
  aboutFieldCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
  },
  adminControlsSection: {
    marginTop: 4,
    gap: 8,
  },
  adminControlsHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminControlBtnLocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  adminControlBtnUnlocked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  adminControlBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  adminControlBtnSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  leaveGroupMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 8,
  },
  leaveGroupMainBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  editDetailsForm: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingsTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  iconSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  iconChoiceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  iconChoiceBoxActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2554EB',
  },
  iconChoiceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  saveDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveDetailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelEditBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelEditBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Action Sheet (Long-Press) */
  actionSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 380,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  actionSheetSender: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionSheetSnippet: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionSheetButtonsList: {
    gap: 2,
  },
  actionSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  actionSheetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Modals */
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 380,
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
  memberSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  memberSearchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  inviteListScrollView: {
    maxHeight: 260,
  },
  noInviteProfilesBox: {
    padding: 24,
    alignItems: 'center',
  },
  noInviteProfilesText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inviteAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  inviteMeta: {
    flex: 1,
  },
  inviteName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  inviteRole: {
    fontSize: 11,
    color: '#64748B',
  },
  inviteBtn: {
    backgroundColor: '#2554EB',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  inviteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  modalSaveBtn: {
    backgroundColor: '#2554EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
