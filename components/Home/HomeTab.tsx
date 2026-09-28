import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { ShareModal } from '../Common/ShareModal';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import { Post, PostType, UserProfile } from '../../types';
import { generateInfinitePostsBatch } from '../../data/infinitePostsData';
import {
  Heart,
  MessageCircle,
  MessageSquare,
  CornerUpLeft,
  Repeat2,
  Share2,
  MoreHorizontal,
  Check,
  CheckCircle2,
  ImageIcon,
  Send,
  X,
  Sparkles,
  DollarSign,
  RefreshCw,
  User,
  Link,
  Bookmark,
  Edit3,
  Flag,
  UserX,
  UserPlus,
  Briefcase,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Wallet,
  Copy,
  Coins,
  ArrowUpRight
} from 'lucide-react-native';

import { PostCardSkeleton, SkeletonPulse } from '../SkeletonLoader';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;
const TouchableOpacityKey = TouchableOpacity as any;
const TextKey = Text as any;

export const resolvePostAuthor = (
  post: Post,
  profiles: UserProfile[],
  currentUser: UserProfile
): UserProfile => {
  if (post.authorId === currentUser.id) {
    return currentUser;
  }
  const matched = profiles.find((p) => p.id === post.authorId);
  if (matched) {
    return matched;
  }
  if (post.profile || post.authorName) {
    const name = post.profile?.full_name || post.authorName || 'Web3 Builder';
    const handle =
      post.authorHandle ||
      `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const avatar =
      post.profile?.avatar_url ||
      post.authorAvatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
    const walletAddress =
      post.profile?.solana_address ||
      post.authorWallet ||
      '7Xw9...4Kp9';
    return {
      id: post.authorId,
      name,
      handle,
      email: `${handle.replace('@', '')}@skillchain.io`,
      avatar,
      title: post.authorTitle || 'Senior Solana Specialist',
      bio: 'Web3 Builder on Solana',
      isVerified: true,
      walletAddress,
      hourlyRateSol: 2.5,
      rating: 5.0,
      reviewCount: 4,
      skills: ['Solana', 'Rust', 'Anchor'],
      chains: ['Solana'],
      role: 'talent',
      isOnline: true,
      location: 'Global (Remote)',
      jobTypes: ['Remote', 'Contract'],
      completedJobsCount: 3,
      totalEarnedSol: 25,
      joinedDate: '2026',
      portfolio: [],
      experience: [],
      credentials: [],
      isOnboarded: true,
      documents: []
    };
  }
  return profiles[0] || currentUser;
};

const FeedSkeletonLoader: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Top Composer Skeleton */}
      <View style={styles.composerCard}>
        <View style={styles.composerRow}>
          <SkeletonPulse width={34} height={34} borderRadius={17} />
          <SkeletonPulse width="100%" height={34} borderRadius={16} style={{ flex: 1 }} />
          <SkeletonPulse width={34} height={34} borderRadius={10} />
        </View>
      </View>

      {/* Post Card Skeleton */}
      <PostCardSkeleton count={2} />
    </View>
  );
};

export const HomeTab: React.FC = () => {
  const {
    currentUser,
    profiles,
    posts,
    addPost,
    appendPosts,
    toggleLikePost,
    addCommentPost,
    toggleLikeComment,
    toggleRepost,
    editPost,
    sendTipSol,
    searchQuery,
    setSearchQuery,
    showToast,
    setIsCreatePostModalOpen,
    viewProfileById,
    setActiveTab,
    solBalance,
    skrBalance,
    walletAddress,
    setIsWalletModalOpen,
    isDark
  } = useApp();

  // Skeleton Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Infinite Scroll State
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const isFetchingRef = useRef(false);
  const sentinelRef = useRef<any>(null);

  const loadMorePosts = useCallback(() => {
    if (isFetchingRef.current || !hasMorePosts || searchQuery.trim()) return;
    isFetchingRef.current = true;
    setIsFetchingMore(true);

    setTimeout(() => {
      const nextBatch = generateInfinitePostsBatch(pageIndex, 3);
      appendPosts(nextBatch);
      setPageIndex((prev) => {
        const next = prev + 1;
        if (next >= 8) {
          setHasMorePosts(false);
        }
        return next;
      });
      setIsFetchingMore(false);
      isFetchingRef.current = false;
    }, 700);
  }, [hasMorePosts, pageIndex, searchQuery, appendPosts]);

  // DOM IntersectionObserver for auto trigger
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting && !isFetchingRef.current && hasMorePosts && !searchQuery.trim()) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [loadMorePosts, hasMorePosts, searchQuery]);

  const handleScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement && contentOffset && contentSize) {
      const paddingToBottom = 300;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        loadMorePosts();
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    showToast('Updating Feed', 'Fetching the latest Web3 posts...', 'info');
    setTimeout(() => {
      setRefreshing(false);
      showToast('Feed Updated', 'Your feed is up to date.', 'success');
    }, 1200);
  }, [showToast]);

  const triggerReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 650);
  };

  // Composer Modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerType, setComposerType] = useState<PostType>('general');
  const [composerTags, setComposerTags] = useState('');
  const [composerMediaUrl, setComposerMediaUrl] = useState('');

  // Edit Post Modal state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContentText, setEditContentText] = useState('');

  // Comment Modal state
  const [selectedPostComments, setSelectedPostComments] = useState<Post | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Tip Modal state
  const [tipPostAuthor, setTipPostAuthor] = useState<{ name: string; handle: string; address: string; postId: string } | null>(null);
  const [tipAmountSol, setTipAmountSol] = useState<number>(0.5);

  const handleCreatePost = () => {
    if (!composerText.trim()) return;

    const tagsArray = composerTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    addPost(composerText, composerType, tagsArray, composerMediaUrl || undefined);

    setComposerText('');
    setComposerTags('');
    setComposerMediaUrl('');
    setComposerType('general');
    setIsComposerOpen(false);
  };

  const handleSendTip = () => {
    if (!tipPostAuthor) return;
    const success = sendTipSol(tipPostAuthor.name, tipPostAuthor.address, tipAmountSol);
    if (success) {
      setTipPostAuthor(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const author = resolvePostAuthor(post, profiles, currentUser);
      const contentMatch = post.content.toLowerCase().includes(q);
      const tagMatch = post.hashtags.some((t) => t.toLowerCase().includes(q));
      const authorNameMatch = author ? author.name.toLowerCase().includes(q) : false;
      const authorHandleMatch = author ? author.handle.toLowerCase().includes(q) : false;
      const authorTitleMatch = author ? author.title.toLowerCase().includes(q) : false;
      return contentMatch || tagMatch || authorNameMatch || authorHandleMatch || authorTitleMatch;
    }
    return true;
  });

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#2554EB"
          colors={['#2554EB']}
        />
      }
    >
      {isLoading ? (
        <FeedSkeletonLoader />
      ) : (
        <>
          {/* Top Composer Card */}
          <View style={[styles.composerCard, isDark && styles.composerCardDark]}>
            <View style={styles.composerRow}>
              
              {/* Alex Rivera Avatar Circle with Blue Verified Checkmark Badge */}
              <TouchableOpacity
                onPress={() => setIsCreatePostModalOpen(true)}
                style={styles.apAvatarWrapper}
                activeOpacity={0.8}
              >
                <Image source={{ uri: currentUser.avatar }} style={styles.composerAvatar} />
                <View style={[styles.apBadge, isDark && styles.apBadgeDark]}>
                  <Check size={8} color="#FFFFFF" strokeWidth={3} />
                </View>
              </TouchableOpacity>

              {/* Share a thought Input Field */}
              <TouchableOpacity
                onPress={() => setIsCreatePostModalOpen(true)}
                style={[styles.composerInputBtn, isDark && styles.composerInputBtnDark]}
                activeOpacity={0.8}
              >
                <Text style={[styles.composerPlaceholder, isDark && styles.composerPlaceholderDark]}>Share a thought...</Text>
              </TouchableOpacity>

              {/* Image Upload Button */}
              <TouchableOpacity
                onPress={() => setIsCreatePostModalOpen(true)}
                style={[styles.imageUploadBtn, isDark && styles.imageUploadBtnDark]}
                activeOpacity={0.8}
              >
                <ImageIcon size={18} color={isDark ? '#60A5FA' : '#2554EB'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Feed Posts List */}
          <View style={styles.postsList}>
            {filteredPosts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                badge="Feed Stream"
                title={searchQuery.trim() ? "No matching updates" : "No posts in your feed yet"}
                description={
                  searchQuery.trim()
                    ? `No builder updates or hashtags matching "${searchQuery}".`
                    : "Be the first to share an update, showcase on-chain work, or connect with Web3 peers!"
                }
                actionLabel="Share a Thought"
                onAction={() => setIsComposerOpen(true)}
                secondaryActionLabel={searchQuery.trim() ? "Clear Filter" : "Explore Talent"}
                onSecondaryAction={() => {
                  if (searchQuery.trim()) {
                    setSearchQuery('');
                  } else {
                    setActiveTab('discover');
                  }
                }}
              />
            ) : (
              <>
                {filteredPosts.map((post) => {
                  const author = resolvePostAuthor(post, profiles, currentUser);
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => toggleLikePost(post.id)}
                      onComment={() => setSelectedPostComments(post)}
                      onRepost={() => toggleRepost(post.id)}
                      onTip={() => {
                        setTipPostAuthor({
                          name: author.name,
                          handle: author.handle,
                          address: author.walletAddress || '3M2a...p89B',
                          postId: post.id
                        });
                        setTipAmountSol(0.1);
                      }}
                      onEditPost={(p) => {
                        setEditingPost(p);
                        setEditContentText(p.content);
                      }}
                    />
                  );
                })}

                {/* Infinite Scroll Bottom Loading State */}
                {isFetchingMore && (
                  <View style={[styles.infiniteLoaderContainer, isDark && styles.infiniteLoaderContainerDark]}>
                    <ActivityIndicator size="small" color={isDark ? "#60A5FA" : "#2554EB"} />
                    <Text style={[styles.infiniteLoaderText, isDark && styles.infiniteLoaderTextDark]}>
                      Fetching more builder updates...
                    </Text>
                  </View>
                )}

                {/* DOM Sentinel for triggering next batch */}
                {hasMorePosts && !searchQuery.trim() && (
                  <View
                    ref={sentinelRef}
                    style={styles.sentinelView}
                  />
                )}

                {/* End of Feed Banner */}
                {!hasMorePosts && !searchQuery.trim() && (
                  <View style={[styles.endOfFeedCard, isDark && styles.endOfFeedCardDark]}>
                    <View style={[styles.endOfFeedIconCircle, isDark && styles.endOfFeedIconCircleDark]}>
                      <CheckCircle2 size={24} color={isDark ? "#60A5FA" : "#2554EB"} />
                    </View>
                    <Text style={[styles.endOfFeedTitle, isDark && styles.endOfFeedTitleDark]}>You're all caught up!</Text>
                    <Text style={[styles.endOfFeedSub, isDark && styles.endOfFeedSubDark]}>
                      You've reached the end of your feed. Connect with more builders and freelancers to unlock fresh updates and opportunities.
                    </Text>
                    <TouchableOpacity
                      style={styles.discoverMoreBtn}
                      onPress={() => setActiveTab('discover')}
                    >
                      <UserPlus size={15} color="#FFFFFF" />
                      <Text style={styles.discoverMoreBtnText}>Connect with More Talent</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </>
      )}

      {/* Create Post Modal */}
      <CustomModal visible={isComposerOpen} onRequestClose={() => setIsComposerOpen(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share a Thought</Text>
            <TouchableOpacity onPress={() => setIsComposerOpen(false)}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TextInput
            value={composerText}
            onChangeText={setComposerText}
            placeholder="What are you working on or auditing on Solana?..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            style={styles.modalTextArea}
            autoFocus
          />

          <Text style={styles.inputLabel}>Hashtags (comma separated)</Text>
          <TextInput
            value={composerTags}
            onChangeText={setComposerTags}
            placeholder="SecurityAudit, Solana, Anchor, CodeReview"
            placeholderTextColor="#94A3B8"
            style={styles.modalInput}
          />

          <Text style={styles.inputLabel}>Image URL (Optional)</Text>
          <TextInput
            value={composerMediaUrl}
            onChangeText={setComposerMediaUrl}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor="#94A3B8"
            style={styles.modalInput}
          />

          <TouchableOpacity onPress={handleCreatePost} style={styles.publishBtn}>
            <Send size={14} color="#FFFFFF" />
            <Text style={styles.publishBtnText}>Publish Thought</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Edit Post Modal */}
      <CustomModal visible={!!editingPost} onRequestClose={() => setEditingPost(null)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TouchableOpacity onPress={() => setEditingPost(null)}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TextInput
            value={editContentText}
            onChangeText={setEditContentText}
            placeholder="Update your post content..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            style={styles.modalTextArea}
            autoFocus
          />

          <TouchableOpacity
            onPress={() => {
              if (editingPost && editContentText.trim()) {
                editPost(editingPost.id, editContentText.trim().replace(/\*\*/g, ''));
                setEditingPost(null);
              }
            }}
            style={styles.publishBtn}
          >
            <Send size={14} color="#FFFFFF" />
            <Text style={styles.publishBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Comments Modal */}
      {(() => {
        const currentPost = selectedPostComments
          ? posts.find((p) => p.id === selectedPostComments.id) || selectedPostComments
          : null;
        const commentList = currentPost?.comments || [];
        const authorProfile = currentPost ? resolvePostAuthor(currentPost, profiles, currentUser) : null;
        
        return (
          <CustomModal
            visible={!!selectedPostComments}
            alignTop
            onRequestClose={() => setSelectedPostComments(null)}
          >
            <View style={[styles.commentModalCard, isDark && styles.commentModalCardDark]}>
              {/* Modal Header */}
              <View style={[styles.commentModalHeader, isDark && { borderBottomColor: '#334155' }]}>
                <View style={styles.commentModalTitleGroup}>
                  <View style={[styles.commentHeaderIconBox, isDark && { backgroundColor: '#1E293B' }]}>
                    <MessageSquare size={18} color="#2554EB" />
                  </View>
                  <Text style={[styles.commentModalTitle, isDark && { color: '#FFFFFF' }]}>
                    Comments ({commentList.length})
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedPostComments(null)}
                  style={[styles.commentCloseBtn, isDark && { backgroundColor: '#1E293B' }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              </View>

              {/* Post Reference Snippet */}
              {currentPost && (
                <View style={[styles.commentPostSnippet, isDark && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Image
                      source={{ uri: authorProfile?.avatar || currentUser.avatar }}
                      style={styles.commentSnippetAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.commentSnippetAuthor, isDark && { color: '#FFFFFF' }]}>
                        {authorProfile?.name || 'Elena Rostova'}
                      </Text>
                      <Text style={[styles.commentSnippetTime, isDark && { color: '#94A3B8' }]}>
                        {currentPost.createdAt || '2 hours ago'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.commentSnippetText, isDark && { color: '#CBD5E1' }]} numberOfLines={2}>
                    {currentPost.content.replace(/\*\*/g, '')}
                  </Text>
                  <View style={styles.commentSnippetTagsRow}>
                    {['#SecurityAudit', '#Solana', '#Anchor', '#CodeReview'].map((tag) => (
                      <TextKey key={tag} style={styles.commentSnippetTagText}>
                        {tag}
                      </TextKey>
                    ))}
                  </View>
                </View>
              )}

              {/* Comments Scrollable Stream */}
              <ScrollView
                style={styles.commentScrollView}
                contentContainerStyle={styles.commentScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {commentList.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    compact
                    title="No comments yet"
                    description="Be the first to share your perspective or ask a question!"
                  />
                ) : (
                  commentList.map((c, index) => {
                    const isThreadReply = index === 1 || (c as any).isReply;
                    return (
                      <ViewKey
                        key={c.id}
                        style={[
                          styles.commentCardItem,
                          isDark && styles.commentCardItemDark,
                          isThreadReply && styles.commentCardItemReply
                        ]}
                      >
                        <View style={styles.commentItemHeader}>
                          <View style={styles.commentItemAuthorRow}>
                            <Image
                              source={{ uri: c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' }}
                              style={styles.commentItemAvatar}
                            />
                            <View style={{ marginLeft: 8 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={[styles.commentItemAuthorName, isDark && { color: '#FFFFFF' }]}>{c.authorName}</Text>
                                {c.isVerified && (
                                  <ShieldCheck size={12} color="#2554EB" />
                                )}
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={[styles.commentItemHandle, isDark && { color: '#64748B' }]}>@{c.authorName.toLowerCase().replace(/\s+/g, '')}</Text>
                                <Text style={styles.commentItemDot}>•</Text>
                                <Text style={styles.commentItemTime}>{c.createdAt || '1h ago'}</Text>
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <MoreHorizontal size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                          </TouchableOpacity>
                        </View>
                        
                        <Text style={[styles.commentItemText, isDark && { color: '#E2E8F0' }]}>{c.content}</Text>
                        
                        <View style={styles.commentItemFooter}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                            <TouchableOpacity
                              onPress={() => {
                                if (currentPost) {
                                  toggleLikeComment(currentPost.id, c.id);
                                }
                              }}
                              style={styles.commentLikeBtn}
                              activeOpacity={0.7}
                            >
                              <Heart
                                size={13}
                                color={c.isLiked ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B')}
                                fill={c.isLiked ? '#EF4444' : 'none'}
                              />
                              <Text style={[styles.commentLikeCount, c.isLiked && { color: '#EF4444' }, isDark && !c.isLiked && { color: '#94A3B8' }]}>
                                {c.likes || (index === 0 ? 4 : 2)}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                setNewCommentText(`@${c.authorName.toLowerCase().replace(/\s+/g, '')} `);
                              }}
                              style={styles.commentReplyBtn}
                              activeOpacity={0.7}
                            >
                              <CornerUpLeft size={12} color={isDark ? '#94A3B8' : '#64748B'} />
                              <Text style={[styles.commentReplyText, isDark && { color: '#94A3B8' }]}>Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </ViewKey>
                    );
                  })
                )}
              </ScrollView>

              {/* Input Bar */}
              <View style={[styles.commentInputBox, isDark && { backgroundColor: '#1E293B', borderTopColor: '#334155' }]}>
                <Image source={{ uri: currentUser.avatar }} style={styles.commentUserAvatar} />
                <TextInput
                  value={newCommentText}
                  onChangeText={setNewCommentText}
                  placeholder="Write a comment..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[
                    styles.commentTextInputField,
                    isDark && { backgroundColor: '#0F172A', color: '#FFFFFF', borderColor: '#2554EB' }
                  ]}
                  multiline={false}
                  onSubmitEditing={() => {
                    if (selectedPostComments && newCommentText.trim()) {
                      addCommentPost(selectedPostComments.id, newCommentText);
                      setNewCommentText('');
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (selectedPostComments && newCommentText.trim()) {
                      addCommentPost(selectedPostComments.id, newCommentText);
                      setNewCommentText('');
                      showToast('Comment Posted', 'Your reply is now visible on this post.', 'success');
                    }
                  }}
                  style={[
                    styles.commentSendBtn,
                    !newCommentText.trim() && styles.commentSendBtnDisabled
                  ]}
                  disabled={!newCommentText.trim()}
                >
                  <Send size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </CustomModal>
        );
      })()}

      {/* Tip Modal */}
      <CustomModal visible={!!tipPostAuthor} onRequestClose={() => setTipPostAuthor(null)}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.tipModalContent}>
            {/* Header */}
            <View style={styles.tipModalHeader}>
              <View style={styles.tipHeaderTitleGroup}>
                <View style={styles.tipGreenIconBox}>
                  <Coins size={18} color="#059669" />
                </View>
                <View>
                  <Text style={styles.tipModalTitle}>Send Tip</Text>
                  <Text style={styles.tipModalSubtitle}>Direct On-Chain Solana Settlement</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setTipPostAuthor(null)}
                style={styles.tipCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Recipient Info Card */}
            <View style={styles.tipRecipientCard}>
              <View style={styles.tipRecipientMeta}>
                <Text style={styles.tipRecipientBadge}>POST AUTHOR</Text>
                <Text style={styles.tipRecipientName}>{tipPostAuthor?.name}</Text>
                <Text style={styles.tipRecipientHandle}>{tipPostAuthor?.handle}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (tipPostAuthor?.address && typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(tipPostAuthor.address);
                  }
                  showToast('Address Copied', tipPostAuthor?.address || '', 'success');
                }}
                style={styles.tipWalletPill}
                activeOpacity={0.75}
              >
                <Text style={styles.tipWalletPillText}>
                  {tipPostAuthor?.address ? `${tipPostAuthor.address.slice(0, 4)}...${tipPostAuthor.address.slice(-4)}` : '3M2a...p89B'}
                </Text>
                <Copy size={11} color="#2554EB" />
              </TouchableOpacity>
            </View>

            {/* Preset Amount Grid */}
            <View style={styles.tipAmountSection}>
              <Text style={styles.tipSectionLabel}>SELECT TIP AMOUNT</Text>
              <View style={styles.tipAmountsRow}>
                {[0.05, 0.1, 0.5, 1.0].map((amt) => (
                  <TouchableKey
                    key={amt}
                    onPress={() => setTipAmountSol(amt)}
                    style={[styles.tipAmtBtn, tipAmountSol === amt && styles.tipAmtBtnActive]}
                  >
                    <Text style={[styles.tipAmtText, tipAmountSol === amt && styles.tipAmtTextActive]}>
                      {amt} SOL
                    </Text>
                  </TouchableKey>
                ))}
              </View>
            </View>

            {/* Available Balance */}
            <View style={styles.tipSummaryRow}>
              <Text style={styles.tipBalanceText}>
                Available Balance: {solBalance.toFixed(2)} SOL
              </Text>
            </View>

            {/* Confirm Tip Button */}
            <TouchableOpacity onPress={handleSendTip} style={styles.confirmTipBtn} activeOpacity={0.85}>
              <Coins size={16} color="#FFFFFF" />
              <Text style={styles.confirmTipBtnText}>Confirm & Send {tipAmountSol} SOL Tip</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </CustomModal>

    </ScrollView>
  );
};

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
  onTip: () => void;
  onEditPost: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onRepost,
  onTip,
  onEditPost
}) => {
  const { profiles, currentUser, deletePost, toggleBookmarkPost, addCommentPost, viewProfileById, showToast, setActiveTab, setSearchQuery, isDark } = useApp();
  const author = resolvePostAuthor(post, profiles, currentUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReadMoreExpanded, setIsReadMoreExpanded] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [inlineCommentText, setInlineCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isMyPost = post.authorId === currentUser.id;

  // Media carousel state
  const mediaList: string[] = post.mediaUrls && post.mediaUrls.length > 0
    ? post.mediaUrls
    : (post.mediaUrl ? [post.mediaUrl] : []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const sharePostText = `${author.name} on SkillChain: "${post.content.slice(0, 100)}..."`;
  const webOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://skillchain.app';
  const sharePostUrl = `${webOrigin}/#post_${post.id}`;

  const handleShareTo = (platform: 'whatsapp' | 'gmail' | 'telegram' | 'twitter' | 'copy') => {
    if (platform === 'copy') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`${sharePostText}\n${sharePostUrl}`);
      }
      showToast('Link Copied', 'Post link copied to clipboard!', 'success');
      setIsShareModalOpen(false);
      return;
    }
    let shareLink = '';
    if (platform === 'whatsapp') {
      shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${sharePostText} ${sharePostUrl}`)}`;
    } else if (platform === 'gmail') {
      shareLink = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(`SkillChain Post by ${author.name}`)}&body=${encodeURIComponent(`${sharePostText}\n\nRead more on SkillChain:\n${sharePostUrl}`)}`;
    } else if (platform === 'telegram') {
      shareLink = `https://t.me/share/url?url=${encodeURIComponent(sharePostUrl)}&text=${encodeURIComponent(sharePostText)}`;
    } else if (platform === 'twitter') {
      shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${sharePostText}\n\n#SkillChain #Solana`)}&url=${encodeURIComponent(sharePostUrl)}`;
    }
    if (typeof window !== 'undefined' && shareLink) {
      window.open(shareLink, '_blank');
    }
    setIsShareModalOpen(false);
  };

  const renderFormattedBody = (content: string) => {
    const clean = content.replace(/\*\*/g, '');
    const tokens = clean.split(/(#[a-zA-Z0-9_]+)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('#')) {
        const cleanTag = token.replace(/^#+/, '');
        return (
          <TextKey
            key={idx}
            style={[styles.hashtagInBody, isDark && styles.hashtagInBodyDark]}
            onPress={() => {
              setSearchQuery(cleanTag);
              showToast('Filter Applied', `Filtering feed by #${cleanTag}`, 'info');
            }}
          >
            {token}
          </TextKey>
        );
      }
      return (
        <TextKey
          key={idx}
          style={isDark ? { color: '#FFFFFF' } : { color: '#1E293B' }}
        >
          {token}
        </TextKey>
      );
    });
  };

  return (
    <View style={[styles.postCard, isDark && styles.postCardDark]}>
      
      {/* Popover Menu Overlay */}
      {isMenuOpen && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
            style={styles.popoverOverlay}
          />
          <View style={[styles.popoverMenu, isDark && styles.popoverMenuDark]}>
            {/* 1. Share profile link */}
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setIsMenuOpen(false);
                setIsShareModalOpen(true);
              }}
            >
              <User size={15} color="#2554EB" />
              <Text style={[styles.popoverItemText, isDark && styles.popoverItemTextDark]}>Share profile link</Text>
            </TouchableOpacity>

            {/* 2. Copy post link */}
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setIsMenuOpen(false);
                showToast('Link Copied', 'Post link copied to clipboard!', 'success');
              }}
            >
              <Link size={15} color="#2554EB" />
              <Text style={[styles.popoverItemText, isDark && styles.popoverItemTextDark]}>Copy post link</Text>
            </TouchableOpacity>

            {/* 3. Bookmark post */}
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setIsMenuOpen(false);
                toggleBookmarkPost(post.id);
              }}
            >
              <Bookmark size={15} color={post.isBookmarked ? '#EAB308' : '#2554EB'} />
              <Text style={[styles.popoverItemText, isDark && styles.popoverItemTextDark]}>
                {post.isBookmarked ? 'Bookmarked' : 'Bookmark post'}
              </Text>
            </TouchableOpacity>

            {/* Edit & Delete OPTIONS (Available for author's posts and text posts) */}
            {isMyPost && (
              <>
                <TouchableOpacity
                  style={styles.popoverItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    onEditPost(post);
                  }}
                >
                  <Edit3 size={15} color="#2554EB" />
                  <Text style={[styles.popoverItemText, isDark && styles.popoverItemTextDark]}>Edit post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.popoverItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    deletePost(post.id);
                  }}
                >
                  <Trash2 size={15} color="#EF4444" />
                  <Text style={[styles.popoverItemText, { color: '#EF4444' }]}>Delete post</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Divider */}
            <View style={[styles.popoverDivider, isDark && styles.popoverDividerDark]} />

            {/* Delete / Report options */}
            {!isMyPost ? (
              <>
                <TouchableOpacity
                  style={styles.popoverItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    showToast('Post Reported', 'Thank you. Our team will review this post.', 'info');
                  }}
                >
                  <Flag size={15} color="#EF4444" />
                  <Text style={[styles.popoverItemText, { color: '#EF4444' }]}>Report post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.popoverItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    showToast('User Reported', `Report against ${author.name} submitted for review.`, 'info');
                  }}
                >
                  <UserX size={15} color="#EF4444" />
                  <Text style={[styles.popoverItemText, { color: '#EF4444' }]}>
                    Report user ({author.name})
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </>
      )}

      {/* 1. Header Row */}
      <View style={styles.postHeaderRow}>
        
        {/* User Avatar with Shield Verification Badge */}
        <TouchableOpacity
          onPress={() => viewProfileById(author.id)}
          style={styles.avatarContainer}
          activeOpacity={0.8}
        >
          <Image source={{ uri: author.avatar }} style={styles.postAvatar} />
          <View style={[styles.shieldBadge, isDark && styles.shieldBadgeDark]}>
            <ShieldCheck size={10} color={isDark ? "#60A5FA" : "#2554EB"} strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {/* User Name & Handle on first line, Title on second line */}
        <TouchableOpacity
          onPress={() => viewProfileById(author.id)}
          style={styles.authorMetaContainer}
          activeOpacity={0.8}
        >
          <View style={styles.authorLine1}>
            <Text style={[styles.authorName, isDark && styles.authorNameDark]}>{author.name}</Text>
            <Text style={[styles.authorHandle, isDark && styles.authorHandleDark]}>{author.handle}</Text>
          </View>
          {author.title ? (
            <Text style={[styles.authorTitle, isDark && styles.authorTitleDark]} numberOfLines={1}>{author.title}</Text>
          ) : null}
        </TouchableOpacity>

        {/* Post Timestamp & More Options */}
        <View style={styles.rightMetaContainer}>
          <Text style={[styles.postTimeText, isDark && styles.postTimeTextDark]}>{post.createdAt}</Text>
          <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} style={styles.moreBtn}>
            <MoreHorizontal size={18} color={isDark ? "#94A3B8" : "#94A3B8"} />
          </TouchableOpacity>
        </View>

      </View>

      {/* 2. Post Body Text - Cleaned of ** asterisks with Read More toggle and Blue Hashtags */}
      {(() => {
        const cleanContent = post.content.replace(/\*\*/g, '');
        const isLongText = cleanContent.length > 220;
        if (!isLongText) {
          return <Text style={[styles.postBodyText, isDark && styles.postBodyTextDark]}>{renderFormattedBody(cleanContent)}</Text>;
        }
        return (
          <Text style={[styles.postBodyText, isDark && styles.postBodyTextDark]}>
            {isReadMoreExpanded ? renderFormattedBody(cleanContent) : renderFormattedBody(`${cleanContent.slice(0, 220).trim()}... `)}
            <Text
              style={[styles.readMoreText, isDark && styles.readMoreTextDark]}
              onPress={() => setIsReadMoreExpanded(!isReadMoreExpanded)}
            >
              {isReadMoreExpanded ? ' Show less' : ' Read more'}
            </Text>
          </Text>
        );
      })()}

      {/* Optional Job Card Snippet */}
      {post.jobDetails && (
        <TouchableOpacity
          style={[styles.postJobCard, isDark && styles.postJobCardDark]}
          onPress={() => setActiveTab('jobs')}
          activeOpacity={0.8}
        >
          <View style={styles.postJobCardHeader}>
            <View style={[styles.postJobBudgetBadge, isDark && styles.postJobBudgetBadgeDark]}>
              <Text style={[styles.postJobBudgetText, isDark && styles.postJobBudgetTextDark]}>{post.jobDetails.budgetSol} SOL Direct</Text>
            </View>
            <Text style={[styles.postJobCardAction, isDark && styles.postJobCardActionDark]}>View in Jobs →</Text>
          </View>
          <View style={styles.postJobSkillsRow}>
            {post.jobDetails.skills.map((skill, sIdx) => (
              <ViewKey key={sIdx} style={[styles.postJobSkillPill, isDark && styles.postJobSkillPillDark]}>
                <Text style={[styles.postJobSkillText, isDark && styles.postJobSkillTextDark]}>{skill}</Text>
              </ViewKey>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* 3. Hashtags Pills Row */}
      {post.hashtags && post.hashtags.length > 0 ? (
        <View style={styles.hashtagsRow}>
          {Array.from(new Set(post.hashtags.map((t) => t.replace(/^#+/, '').trim()).filter(Boolean))).map((tag, idx) => (
            <TouchableOpacityKey
              key={idx}
              style={[styles.hashtagPill, isDark && styles.hashtagPillDark]}
              onPress={() => {
                setSearchQuery(tag);
                showToast('Filter Applied', `Filtering feed by #${tag}`, 'info');
              }}
              activeOpacity={0.75}
            >
              <Text style={[styles.hashtagText, isDark && styles.hashtagTextDark]}>#{tag}</Text>
            </TouchableOpacityKey>
          ))}
        </View>
      ) : null}

      {/* 4. Post Media Images Carousel with Small Dots */}
      {mediaList.length > 0 ? (
        <View
          style={styles.mediaContainer}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) setContainerWidth(w);
          }}
        >
          {mediaList.length === 1 ? (
            <Image source={{ uri: mediaList[0] }} style={styles.postMediaImage} resizeMode="cover" />
          ) : (
            <View style={styles.carouselWrapper}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={(e) => {
                  const w = e.nativeEvent.layoutMeasurement.width;
                  if (w > 0) {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / w);
                    if (idx !== activeImageIndex && idx >= 0 && idx < mediaList.length) {
                      setActiveImageIndex(idx);
                    }
                  }
                }}
                style={styles.carouselScrollView}
              >
                {mediaList.map((imgUri, imgIdx) => (
                  <ViewKey
                    key={imgIdx}
                    style={[
                      styles.carouselSlide,
                      containerWidth > 0 ? { width: containerWidth } : { width: 340 }
                    ]}
                  >
                    <Image source={{ uri: imgUri }} style={styles.postMediaImage} resizeMode="cover" />
                  </ViewKey>
                ))}
              </ScrollView>

              {/* Image Counter Badge Top Right */}
              {mediaList.length > 1 && (
                <View style={styles.imageCounterBadge}>
                  <Text style={styles.imageCounterBadgeText}>
                    {activeImageIndex + 1}/{mediaList.length}
                  </Text>
                </View>
              )}

              {/* Small Pagination Dots without dark container box */}
              <View style={styles.paginationDotsContainer}>
                {mediaList.map((_, dotIdx) => (
                  <TouchableKey
                    key={dotIdx}
                    style={[
                      styles.paginationDot,
                      dotIdx === activeImageIndex && styles.paginationDotActive
                    ]}
                    onPress={() => {
                      setActiveImageIndex(dotIdx);
                      if (scrollRef.current && containerWidth > 0) {
                        scrollRef.current.scrollTo({ x: dotIdx * containerWidth, animated: true });
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      ) : null}

      {/* 5. Footer Interaction Bar */}
      <View style={styles.footerRow}>
        
        {/* Likes */}
        <TouchableOpacity onPress={onLike} style={styles.footerActionBtn}>
          <Heart size={16} color={post.isLiked ? "#EF4444" : (isDark ? "#94A3B8" : "#64748B")} fill={post.isLiked ? "#EF4444" : "none"} />
          <Text style={[styles.footerActionCount, isDark && styles.footerActionCountDark, { color: post.isLiked ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B') }]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        {/* Reposts */}
        <TouchableOpacity onPress={onRepost} style={styles.footerActionBtn}>
          <Repeat2 size={16} color={post.isReposted ? (isDark ? "#60A5FA" : "#0F172A") : (isDark ? "#94A3B8" : "#64748B")} />
          <Text style={[styles.footerActionCount, isDark && styles.footerActionCountDark, { color: post.isReposted ? (isDark ? '#60A5FA' : '#0F172A') : (isDark ? '#94A3B8' : '#64748B') }]}>
            {post.repostsCount}
          </Text>
        </TouchableOpacity>

        {/* Comments - Opens dedicated comments modal */}
        <TouchableOpacity
          onPress={onComment}
          style={styles.footerActionBtn}
          activeOpacity={0.75}
        >
          <MessageCircle size={16} color={isDark ? "#94A3B8" : "#64748B"} />
          <Text style={[styles.footerActionCount, isDark && styles.footerActionCountDark]}>
            {post.commentsCount || (post.comments ? post.comments.length : 0)}
          </Text>
        </TouchableOpacity>

        {/* Share - Opens multi-platform share sheet */}
        <TouchableOpacity
          onPress={() => setIsShareModalOpen(true)}
          style={styles.footerActionBtn}
          activeOpacity={0.75}
        >
          <Share2 size={16} color={isDark ? "#94A3B8" : "#64748B"} />
        </TouchableOpacity>

      </View>

      {/* Unified Multi-Platform Share Sheet Modal */}
      <ShareModal
        visible={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Post"
        shareText={sharePostText}
        shareUrl={sharePostUrl}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  containerDark: {
    backgroundColor: '#0B0F19',
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
  },
  
  // Skeleton Styles
  skeletonContainer: {
    gap: 10,
  },
  skeletonCircle: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
  },
  skeletonRect: {
    backgroundColor: '#E2E8F0',
  },
  skeletonBar: {
    backgroundColor: '#E2E8F0',
  },

  // Feed Live Wallet Card
  feedWalletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  feedWalletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  feedWalletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  feedWalletGreenPulse: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  feedWalletInfo: {
    flex: 1,
  },
  feedWalletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedWalletAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  feedWalletUsd: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  feedWalletAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  feedWalletAddressText: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  feedCopyBtn: {
    padding: 2,
  },
  feedWalletDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 2,
  },
  feedWalletSkrBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2554EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  feedManageWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  feedManageWalletText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },

  // Composer Card
  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  composerCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apAvatarWrapper: {
    position: 'relative',
  },
  composerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  apAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2554EB',
  },
  apBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2554EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  apBadgeDark: {
    borderColor: '#0F172A',
  },
  composerInputBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  composerInputBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  composerPlaceholder: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
  },
  composerPlaceholderDark: {
    color: '#94A3B8',
  },
  imageUploadBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },

  // Posts
  postsList: {
    gap: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    position: 'relative',
  },
  postCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  postBodyText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13.5,
    lineHeight: 21,
    color: '#1E293B',
    fontWeight: '400',
    marginTop: 8,
  },
  postBodyTextDark: {
    color: '#FFFFFF',
  },
  hashtagInBody: {
    color: '#2554EB',
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  hashtagInBodyDark: {
    color: '#60A5FA',
  },
  readMoreText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '700',
    color: '#2554EB',
  },
  readMoreTextDark: {
    color: '#60A5FA',
  },
  popoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
  },
  popoverMenu: {
    position: 'absolute',
    top: 34,
    right: 12,
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  popoverMenuDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  popoverItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  popoverItemTextDark: {
    color: '#F1F5F9',
  },
  popoverDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  popoverDividerDark: {
    backgroundColor: '#334155',
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  shieldBadgeDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  authorMetaContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  authorLine1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  authorNameDark: {
    color: '#FFFFFF',
  },
  authorHandle: {
    fontSize: 12.5,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  authorHandleDark: {
    color: '#94A3B8',
  },
  authorDot: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Plus Jakarta Sans',
  },
  authorTitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
    marginTop: 1,
    lineHeight: 16,
  },
  authorTitleDark: {
    color: '#CBD5E1',
  },
  rightMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  postTimeText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
    lineHeight: 16,
  },
  postTimeTextDark: {
    color: '#94A3B8',
  },
  moreBtn: {
    padding: 2,
  },
  postTypeBadgeJob: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  postTypeBadgeJobText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2554EB',
  },
  postTypeBadgePortfolio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  postTypeBadgePortfolioText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  postJobCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  postJobCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  postJobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postJobBudgetBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  postJobBudgetBadgeDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  postJobBudgetText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#166534',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  postJobBudgetTextDark: {
    color: '#34D399',
  },
  postJobCardAction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },
  postJobCardActionDark: {
    color: '#60A5FA',
  },
  postJobSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  postJobSkillPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  postJobSkillPillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  postJobSkillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#334155',
  },
  postJobSkillTextDark: {
    color: '#E2E8F0',
  },
  emptyFeedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyFeedCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  emptyFeedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyFeedTitleDark: {
    color: '#FFFFFF',
  },
  emptyFeedSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyFeedSubDark: {
    color: '#94A3B8',
  },
  infiniteLoaderContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  infiniteLoaderContainerDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  infiniteLoaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2554EB',
  },
  infiniteLoaderTextDark: {
    color: '#60A5FA',
  },
  sentinelView: {
    height: 20,
    width: '100%',
    backgroundColor: 'transparent',
  },
  endOfFeedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  endOfFeedCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  endOfFeedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  endOfFeedIconCircleDark: {
    backgroundColor: '#1E293B',
  },
  endOfFeedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  endOfFeedTitleDark: {
    color: '#FFFFFF',
  },
  endOfFeedSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 320,
  },
  endOfFeedSubDark: {
    color: '#94A3B8',
  },
  discoverMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 14,
  },
  discoverMoreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  hashtagPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  hashtagPillDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.18)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  hashtagText: {
    color: '#2554EB',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Plus Jakarta Sans',
    lineHeight: 16,
  },
  hashtagTextDark: {
    color: '#93C5FD',
  },
  mediaContainer: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  postMediaImage: {
    width: '100%',
    height: 190,
    borderRadius: 14,
  },
  carouselWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselScrollView: {
    width: '100%',
  },
  carouselSlide: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  imageCounterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },
  carouselNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  carouselNavBtnLeft: {
    left: 8,
  },
  carouselNavBtnRight: {
    right: 8,
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  paginationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  paginationDotActive: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 2,
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerActionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  footerActionCountDark: {
    color: '#94A3B8',
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '82%',
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  modalContentCenter: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 'auto',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  closeAbsolute: {
    position: 'absolute' as any,
    top: 16,
    right: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalTextArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    height: 90,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Comment Modal Card styles
  commentModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    maxWidth: 440,
    maxHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 18,
  },
  commentModalCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  commentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  commentModalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  commentCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  commentPostSnippet: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 14,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentSnippetAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  commentSnippetAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  commentSnippetTime: {
    fontSize: 11,
    fontWeight: '400',
    color: '#94A3B8',
    marginTop: 1,
  },
  commentSnippetText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
  },
  commentSnippetTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  commentSnippetTagText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2554EB',
  },
  commentScrollView: {
    flex: 1,
    maxHeight: 300,
  },
  commentScrollContent: {
    padding: 14,
    gap: 10,
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyCommentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyCommentsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  emptyCommentsSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    textAlign: 'center',
    maxWidth: 240,
  },
  commentCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  commentCardItemDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  commentCardItemReply: {
    marginLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  commentItemAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentItemAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentItemAuthorName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  commentItemHandle: {
    fontSize: 11,
    color: '#64748B',
  },
  commentItemDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  commentItemTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  commentItemText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  commentItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
    marginTop: 2,
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  commentLikeCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  commentReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  commentReplyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  longPressHint: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  commentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  commentUserAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  commentTextInputField: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#2554EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
    height: 40,
  },
  commentSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2554EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  commentsList: {
    maxHeight: 200,
    marginVertical: 10,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    paddingVertical: 20,
  },
  commentItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  commentBody: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
  },
  replyBtn: {
    backgroundColor: '#2554EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  replyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Enhanced Tip Modal
  tipModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  tipModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipGreenIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tipModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  tipModalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  tipCloseBtn: {
    padding: 4,
  },
  tipRecipientCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipRecipientMeta: {
    flex: 1,
  },
  tipRecipientBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2554EB',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tipRecipientName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  tipRecipientHandle: {
    fontSize: 11,
    color: '#64748B',
  },
  tipWalletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tipWalletPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2554EB',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  tipAmountSection: {
    marginBottom: 12,
  },
  tipSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tipAmountsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipAmtBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  tipAmtBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  tipAmtText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  tipAmtTextActive: {
    color: '#FFFFFF',
  },
  tipSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  tipEstimatedUsd: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  tipBalanceText: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  confirmTipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  confirmTipBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  inlineCommentsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 10,
  },
  inlineCommentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  inlineCommentsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  inlineCommentsCloseBtn: {
    padding: 2,
  },
  inlineCommentsScrollView: {
    maxHeight: 220,
  },
  inlineCommentsScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  inlineEmptyCommentsBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  inlineEmptyCommentsText: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  inlineCommentItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  inlineCommentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginTop: 1,
  },
  inlineCommentBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineCommentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineCommentAuthorName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  inlineCommentTimeText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  inlineCommentTextContent: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
    lineHeight: 16,
  },
  inlineCommentComposerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inlineComposerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  inlineComposerInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    color: '#0F172A',
  },
  inlineComposerSendBtn: {
    backgroundColor: '#2554EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineComposerSendBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },

  // Share Sheet Modal
  shareModalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 380,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  shareModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  shareModalSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  sharePlatformsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  shareOptionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  shareIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOptionName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  shareCopyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingVertical: 10,
  },
  shareCopyLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2554EB',
  },
});
