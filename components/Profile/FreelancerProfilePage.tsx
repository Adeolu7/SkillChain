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
import { useApp } from '../../context/AppContext';
import { UserProfile, Post } from '../../types';
import {
  ArrowLeft,
  Share2,
  UserPlus,
  UserCheck,
  MessageSquare,
  Heart,
  Star,
  Copy,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  Repeat2,
  DollarSign,
  Briefcase,
  Check
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;
const TouchableOpacityKey = TouchableOpacity as any;

interface FreelancerProfilePageProps {
  profile: UserProfile;
  onBack: () => void;
}

export const FreelancerProfilePage: React.FC<FreelancerProfilePageProps> = ({
  profile,
  onBack
}) => {
  const {
    currentUser,
    posts,
    toggleLikePost,
    toggleRepost,
    sendTipSol,
    addReview,
    createConversationWith,
    followedUserIds,
    toggleFollowUser,
    showToast,
    addCommentPost,
    setActiveTab,
    isDark
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'portfolio' | 'skills' | 'reviews'>('posts');
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0.5);
  const [customTip, setCustomTip] = useState('');

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewJobTitle, setReviewJobTitle] = useState('');

  // Comment Modal inside Profile
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const isFollowing = followedUserIds.includes(profile.id);
  const isMe = profile.id === currentUser.id;

  // Filter posts by this freelancer
  const freelancerPosts = posts.filter((p) => p.authorId === profile.id);

  // Fallback demo post if none exists in initial posts
  const displayPosts: Post[] = freelancerPosts.length > 0
    ? freelancerPosts
    : [
        {
          id: `p_showcase_${profile.id}`,
          authorId: profile.id,
          type: 'general',
          content: `Shipped a mobile-first Web3 wallet connect drawer with instant Solana signature verification and zero-latency transaction simulation. Feedback appreciated!`,
          hashtags: ['Solana', 'Web3UI', 'Figma', 'Anchor'],
          mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          likesCount: 24,
          commentsCount: 3,
          repostsCount: 5,
          isLiked: false,
          isReposted: false,
          createdAt: '5 hours ago',
          comments: [
            {
              id: 'c_1',
              authorId: 'user_elena',
              authorName: 'Elena Rostova',
              authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
              authorHandle: '@elena_rust',
              isVerified: true,
              content: 'Super clean drawer animation Devon! Does it support Ledger over Bluetooth on Mobile?',
              createdAt: '3 hours ago',
              likes: 2
            }
          ]
        }
      ];

  const handleCopyWallet = () => {
    showToast('Copied Address', profile.walletAddress || 'Solana Wallet', 'success');
  };

  const handleShare = () => {
    showToast('Profile Link Copied', `Shared ${profile.name}'s verified SkillChain profile!`, 'success');
  };

  const handleMessage = () => {
    if (isMe) {
      showToast('Self Note', 'This is your own profile.', 'info');
      return;
    }
    createConversationWith(profile.id);
  };

  const handleSendTip = () => {
    const finalAmount = customTip ? parseFloat(customTip) : tipAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      showToast('Invalid Amount', 'Please select or enter a valid SOL amount.', 'warning');
      return;
    }
    const success = sendTipSol(profile.name, profile.walletAddress, finalAmount);
    if (success) {
      setIsTipModalOpen(false);
      setCustomTip('');
    }
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      showToast('Missing Feedback', 'Please write a brief review testimonial.', 'warning');
      return;
    }
    addReview(`job_rev_${Date.now()}`, reviewJobTitle, profile.id, reviewRating, reviewComment.trim());
    setIsReviewModalOpen(false);
    setReviewComment('');
    showToast('Review Submitted', `Endorsement for ${profile.name} published on-chain.`, 'success');
  };

  const handleAddComment = () => {
    if (!activeCommentPost || !commentInput.trim()) return;
    addCommentPost(activeCommentPost.id, commentInput.trim());
    setCommentInput('');
    setActiveCommentPost(null);
  };

  // Follower count display
  const baseFollowers = 128;
  const followerCount = isFollowing ? baseFollowers + 1 : baseFollowers;

  // Banner background based on profile role
  const bannerImage = profile.portfolio && profile.portfolio[0]?.imageUrl
    ? profile.portfolio[0].imageUrl
    : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      
      {/* Scrollable Profile Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Banner with Top Navigation Overlay */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{ uri: bannerImage }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay} />

          {/* Top Nav Buttons (Back & Share) */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              onPress={onBack}
              style={[styles.navBackBtn, isDark && styles.navBackBtnDark]}
              activeOpacity={0.85}
            >
              <ArrowLeft size={16} color={isDark ? '#F8FAFC' : '#0F172A'} />
              <Text style={[styles.navBackText, isDark && styles.textWhite]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={[styles.navShareBtn, isDark && styles.navShareBtnDark]}
              activeOpacity={0.85}
            >
              <Share2 size={16} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* Top-Right Banner Badge */}
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>SKILLCHAIN MEMBER</Text>
          </View>
        </View>

        {/* Profile Card / Header Information */}
        <View style={[styles.profileInfoSection, isDark && styles.profileInfoSectionDark]}>
          
          {/* Avatar and Action Buttons Row */}
          <View style={styles.avatarActionRow}>
            {/* Avatar overlapping banner */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profile.avatar }} style={[styles.avatarImage, isDark && styles.avatarImageDark]} />
              {profile.isVerified && (
                <View style={styles.avatarVerifiedBadge}>
                  <Check size={9} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>

            {/* Action Buttons on the Right (Follow & Message) */}
            <View style={styles.actionButtonsCol}>
              <View style={styles.actionButtonsRow}>
                {/* 1. Follow / Following Button */}
                {!isMe && (
                  <TouchableOpacity
                    onPress={() => toggleFollowUser(profile.id)}
                    style={[
                      styles.followBtn,
                      isFollowing && styles.followingBtn,
                      isFollowing && isDark && styles.followingBtnDark
                    ]}
                    activeOpacity={0.85}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={14} color={isDark ? '#F8FAFC' : '#0F172A'} />
                        <Text style={[styles.followingBtnText, isDark && styles.textWhite]}>Following</Text>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} color="#FFFFFF" />
                        <Text style={styles.followBtnText}>Follow</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* 2. Message Button */}
                <TouchableOpacity
                  onPress={handleMessage}
                  style={styles.messageBtn}
                  activeOpacity={0.85}
                >
                  <MessageSquare size={14} color="#FFFFFF" />
                  <Text style={styles.messageBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* User Name & Handle */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, isDark && styles.textWhite]}>{profile.name}</Text>
              {profile.isVerified && (
                <ShieldCheck size={18} color="#2554EB" />
              )}
            </View>
            <Text style={[styles.handleText, isDark && styles.textMutedDark]}>{profile.handle}</Text>

            {/* Followers / Following Counts */}
            <View style={styles.followStatsRow}>
              <Text style={[styles.followStatsText, isDark && styles.textMutedDark]}>
                <Text style={[styles.boldStat, isDark && styles.textWhite]}>{followerCount}</Text> Followers
                <Text style={styles.dotSeparator}>  •  </Text>
                <Text style={[styles.boldStat, isDark && styles.textWhite]}>84</Text> Following
              </Text>
            </View>

            {/* Role Tag Pill */}
            <View style={styles.rolePillWrapper}>
              <View style={[styles.rolePill, isDark && styles.rolePillDark]}>
                <Text style={[styles.rolePillText, isDark && styles.rolePillTextDark]}>{profile.title}</Text>
              </View>
            </View>

            {/* Location & Open to Job Types */}
            <View style={styles.locationJobTypeSection}>
              {profile.location ? (
                <View style={styles.locationMetaRow}>
                  <MapPin size={13} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.locationMetaText, isDark && styles.textMutedDark]}>{profile.location}</Text>
                </View>
              ) : null}
              {profile.jobTypes && profile.jobTypes.length > 0 ? (
                <View style={styles.jobTypesBadgeRow}>
                  <Text style={[styles.jobTypesLabel, isDark && styles.textMutedDark]}>Open to:</Text>
                  {profile.jobTypes.map((jt, jIdx) => (
                    <ViewKey key={jIdx} style={[styles.jobTypePill, isDark && styles.jobTypePillDark]}>
                      <Briefcase size={10} color={isDark ? '#4ADE80' : '#166534'} />
                      <Text style={[styles.jobTypePillText, isDark && styles.jobTypePillTextDark]}>{jt}</Text>
                    </ViewKey>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Bio */}
            <Text style={[styles.bioText, isDark && styles.bioTextDark]}>{profile.bio}</Text>

            {/* On-Chain Wallet Row */}
            <View style={[styles.linksRow, isDark && styles.linksRowDark]}>
              {/* SOL Address Chip */}
              <TouchableOpacity
                onPress={handleCopyWallet}
                style={[styles.solAddressChip, isDark && styles.solAddressChipDark]}
                activeOpacity={0.8}
              >
                <Text style={styles.solAddressLabel}>SOL</Text>
                <Text style={[styles.solAddressValue, isDark && styles.solAddressValueDark]}>{profile.walletAddress || '9k1z.....x42L'}</Text>
                <Copy size={11} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

          </View>

          {/* 4 Segmented Tabs: Posts, Portfolio, Skills, Reviews */}
          <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
            <TouchableOpacity
              onPress={() => setActiveSubTab('posts')}
              style={[
                styles.tabItem,
                activeSubTab === 'posts' && styles.tabItemActive
              ]}
            >
              <Text
                style={[
                  styles.tabItemText,
                  isDark && styles.tabItemTextDark,
                  activeSubTab === 'posts' && styles.tabItemTextActive
                ]}
              >
                Posts ({displayPosts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveSubTab('portfolio')}
              style={[
                styles.tabItem,
                activeSubTab === 'portfolio' && styles.tabItemActive
              ]}
            >
              <Text
                style={[
                  styles.tabItemText,
                  isDark && styles.tabItemTextDark,
                  activeSubTab === 'portfolio' && styles.tabItemTextActive
                ]}
              >
                Portfolio ({profile.portfolio ? profile.portfolio.length : 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveSubTab('skills')}
              style={[
                styles.tabItem,
                activeSubTab === 'skills' && styles.tabItemActive
              ]}
            >
              <Text
                style={[
                  styles.tabItemText,
                  isDark && styles.tabItemTextDark,
                  activeSubTab === 'skills' && styles.tabItemTextActive
                ]}
              >
                Skills ({profile.skills ? profile.skills.length : 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveSubTab('reviews')}
              style={[
                styles.tabItem,
                activeSubTab === 'reviews' && styles.tabItemActive
              ]}
            >
              <Text
                style={[
                  styles.tabItemText,
                  isDark && styles.tabItemTextDark,
                  activeSubTab === 'reviews' && styles.tabItemTextActive
                ]}
              >
                Reviews ({profile.reviewCount || 31})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content Section */}
          <View style={styles.tabContentArea}>
            
            {/* 1. POSTS TAB */}
            {activeSubTab === 'posts' && (
              <View style={styles.postsList}>
                {displayPosts.map((post) => (
                  <ViewKey key={post.id} style={[styles.postCard, isDark && styles.postCardDark]}>
                    {/* Post Author Row */}
                    <View style={styles.postAuthorRow}>
                      <Image source={{ uri: profile.avatar }} style={styles.postAvatar} />
                      <View style={styles.postAuthorMeta}>
                        <View style={styles.postAuthorNameRow}>
                          <Text style={[styles.postAuthorName, isDark && styles.textWhite]}>{profile.name}</Text>
                          {profile.isVerified && (
                            <CheckCircle2 size={13} color="#2554EB" />
                          )}
                        </View>
                        <Text style={[styles.postAuthorHandle, isDark && styles.textMutedDark]}>{profile.handle}</Text>
                      </View>
                      <Text style={styles.postTimeText}>{post.createdAt}</Text>
                    </View>

                    {/* Post Content */}
                    <Text style={[styles.postContentText, isDark && styles.postContentTextDark]}>{post.content.replace(/\*\*/g, '')}</Text>

                    {/* Post Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <View style={styles.postHashtagsRow}>
                        {post.hashtags.map((tag, tIdx) => (
                          <ViewKey key={tIdx} style={[styles.hashtagPill, isDark && styles.hashtagPillDark]}>
                            <Text style={[styles.hashtagText, isDark && styles.hashtagTextDark]}>#{tag.replace(/^#/, '')}</Text>
                          </ViewKey>
                        ))}
                      </View>
                    )}

                    {/* Post Media */}
                    {post.mediaUrl && (
                      <Image
                        source={{ uri: post.mediaUrl }}
                        style={styles.postMediaImg}
                        resizeMode="cover"
                      />
                    )}

                    {/* Post Actions Row */}
                    <View style={[styles.postActionsRow, isDark && styles.postActionsRowDark]}>
                      <TouchableOpacity
                        onPress={() => toggleLikePost(post.id)}
                        style={styles.postActionBtn}
                      >
                        <Heart
                          size={15}
                          color={post.isLiked ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B')}
                          fill={post.isLiked ? '#EF4444' : 'none'}
                        />
                        <Text style={[styles.postActionCount, isDark && styles.textMutedDark, post.isLiked && { color: '#EF4444' }]}>
                          {post.likesCount}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => toggleRepost(post.id)}
                        style={styles.postActionBtn}
                      >
                        <Repeat2 size={15} color={post.isReposted ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#94A3B8' : '#64748B')} />
                        <Text style={[styles.postActionCount, isDark && styles.textMutedDark, post.isReposted && { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                          {post.repostsCount}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setActiveCommentPost(post)}
                        style={styles.postActionBtn}
                      >
                        <MessageSquare size={15} color={isDark ? '#94A3B8' : '#64748B'} />
                        <Text style={[styles.postActionCount, isDark && styles.textMutedDark]}>{post.commentsCount || 0}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleShare}
                        style={styles.postActionBtn}
                      >
                        <Share2 size={15} color={isDark ? '#94A3B8' : '#64748B'} />
                      </TouchableOpacity>
                    </View>
                  </ViewKey>
                ))}
              </View>
            )}

            {/* 2. PORTFOLIO TAB */}
            {activeSubTab === 'portfolio' && (
              <View style={styles.portfolioSection}>
                {(!profile.portfolio || profile.portfolio.length === 0) ? (
                  <View style={[styles.emptyTabCard, isDark && styles.emptyTabCardDark]}>
                    <Briefcase size={28} color="#94A3B8" />
                    <Text style={[styles.emptyTabTitle, isDark && styles.textWhite]}>No portfolio items yet</Text>
                    <Text style={[styles.emptyTabSub, isDark && styles.textMutedDark]}>
                      {profile.name} will upload verified project deliverables soon.
                    </Text>
                  </View>
                ) : (
                  profile.portfolio.map((item) => (
                    <ViewKey key={item.id} style={[styles.portfolioCard, isDark && styles.portfolioCardDark]}>
                      <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
                      <View style={styles.portfolioBody}>
                        <Text style={[styles.portfolioTitle, isDark && styles.textWhite]}>{item.title}</Text>
                        <Text style={[styles.portfolioDesc, isDark && styles.portfolioDescDark]}>{item.description}</Text>
                        <View style={styles.portfolioTagsRow}>
                          {item.tags.map((tag, idx) => (
                            <ViewKey key={idx} style={[styles.portfolioTagPill, isDark && styles.portfolioTagPillDark]}>
                              <Text style={[styles.portfolioTagText, isDark && styles.portfolioTagTextDark]}>{tag}</Text>
                            </ViewKey>
                          ))}
                        </View>
                      </View>
                    </ViewKey>
                  ))
                )}
              </View>
            )}

            {/* 3. SKILLS TAB */}
            {activeSubTab === 'skills' && (
              <View style={styles.skillsSection}>
                <View style={styles.skillsGrid}>
                  {profile.skills.map((skill, sIdx) => (
                    <ViewKey key={sIdx} style={[styles.skillItemCard, isDark && styles.skillItemCardDark]}>
                      <View style={styles.skillItemHeader}>
                        <ShieldCheck size={14} color="#2554EB" />
                        <Text style={[styles.skillItemTitle, isDark && styles.textWhite]}>{skill}</Text>
                      </View>
                      <Text style={[styles.skillItemMeta, isDark && styles.skillItemMetaDark]}>Verified on Solana Mainnet</Text>
                      <Text style={styles.skillItemHash}>tx: 8Kx9...{sIdx}4m</Text>
                    </ViewKey>
                  ))}
                </View>
              </View>
            )}

            {/* 4. REVIEWS TAB */}
            {activeSubTab === 'reviews' && (
              <View style={styles.reviewsSection}>
                {/* Rating Banner */}
                <View style={[styles.ratingBanner, isDark && styles.ratingBannerDark]}>
                  <View style={styles.ratingBigScore}>
                    <Text style={styles.ratingNumber}>★ {profile.rating.toFixed(1)}</Text>
                    <Text style={[styles.ratingCountText, isDark && styles.textMutedDark]}>{profile.reviewCount || 31} verified endorsements</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsReviewModalOpen(true)}
                    style={[styles.writeReviewBtn, isDark && styles.writeReviewBtnDark]}
                  >
                    <Text style={[styles.writeReviewBtnText, isDark && styles.writeReviewBtnTextDark]}>+ Write Review</Text>
                  </TouchableOpacity>
                </View>

                {/* Reviews List */}
                <View style={styles.reviewsList}>
                  <View style={[styles.reviewCard, isDark && styles.reviewCardDark]}>
                    <View style={styles.reviewHeaderRow}>
                      <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' }}
                        style={styles.reviewerAvatar}
                      />
                      <View style={styles.reviewerMeta}>
                        <Text style={[styles.reviewerName, isDark && styles.textWhite]}>Marcus Vance</Text>
                        <Text style={[styles.reviewerRole, isDark && styles.textMutedDark]}>Solana DeFi Vaults Lead</Text>
                      </View>
                      <Text style={styles.reviewStars}>★★★★★</Text>
                    </View>
                    <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
                      Exceptional smart contract precision. Identified subtle PDA seed vulnerabilities before our mainnet launch. Highly recommended!
                    </Text>
                  </View>

                  <View style={[styles.reviewCard, isDark && styles.reviewCardDark]}>
                    <View style={styles.reviewHeaderRow}>
                      <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' }}
                        style={styles.reviewerAvatar}
                      />
                      <View style={styles.reviewerMeta}>
                        <Text style={[styles.reviewerName, isDark && styles.textWhite]}>Elena Rostova</Text>
                        <Text style={[styles.reviewerRole, isDark && styles.textMutedDark]}>Lead Security Auditor</Text>
                      </View>
                      <Text style={styles.reviewStars}>★★★★★</Text>
                    </View>
                    <Text style={[styles.reviewText, isDark && styles.reviewTextDark]}>
                      Clean Rust architecture, thorough Anchor test suites, and rapid milestone delivery. Will definitely collaborate again.
                    </Text>
                  </View>
                </View>
              </View>
            )}

          </View>
        </View>

      </ScrollView>

      {/* =========================================================
          TIP SOL MODAL
         ========================================================= */}
      <CustomModal visible={isTipModalOpen} onRequestClose={() => setIsTipModalOpen(false)}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIconBox}>
              <Heart size={18} color="#E11D48" fill="#E11D48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDark && styles.textWhite]}>Tip {profile.name}</Text>
              <Text style={[styles.modalSubtitle, isDark && styles.textMutedDark]}>Send instant SOL on Solana Mainnet</Text>
            </View>
            <TouchableOpacity onPress={() => setIsTipModalOpen(false)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalFieldLabel, isDark && styles.textMutedDark]}>Select Tip Amount</Text>
          <View style={styles.quickTipRow}>
            {[0.1, 0.25, 0.5, 1.0, 2.0].map((amt) => (
              <TouchableKey
                key={amt}
                onPress={() => {
                  setTipAmount(amt);
                  setCustomTip('');
                }}
                style={[
                  styles.quickTipChip,
                  isDark && styles.quickTipChipDark,
                  tipAmount === amt && !customTip && styles.quickTipChipActive
                ]}
              >
                <Text
                  style={[
                    styles.quickTipText,
                    isDark && styles.textMutedDark,
                    tipAmount === amt && !customTip && styles.quickTipTextActive
                  ]}
                >
                  {amt} SOL
                </Text>
              </TouchableKey>
            ))}
          </View>

          <Text style={[styles.modalFieldLabel, isDark && styles.textMutedDark]}>Or Custom Amount (SOL)</Text>
          <TextInput
            value={customTip}
            onChangeText={setCustomTip}
            placeholder="e.g. 0.75"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <TouchableOpacity onPress={handleSendTip} style={styles.confirmTipBtn}>
            <Heart size={14} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.confirmTipBtnText}>
              Send {customTip ? `${customTip} SOL` : `${tipAmount} SOL`} Tip
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* =========================================================
          REVIEW MODAL
         ========================================================= */}
      <CustomModal visible={isReviewModalOpen} onRequestClose={() => setIsReviewModalOpen(false)}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalHeaderIconBox, { backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : '#FFF7ED' }]}>
              <Star size={18} color="#EA580C" fill="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, isDark && styles.textWhite]}>Endorse & Review {profile.name}</Text>
              <Text style={[styles.modalSubtitle, isDark && styles.textMutedDark]}>Verified on-chain client review</Text>
            </View>
            <TouchableOpacity onPress={() => setIsReviewModalOpen(false)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalFieldLabel, isDark && styles.textMutedDark]}>Star Rating</Text>
          <View style={styles.starSelectorRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableKey
                key={star}
                onPress={() => setReviewRating(star)}
                style={styles.starSelectBtn}
              >
                <Star
                  size={26}
                  color={star <= reviewRating ? '#F59E0B' : (isDark ? '#475569' : '#CBD5E1')}
                  fill={star <= reviewRating ? '#F59E0B' : 'none'}
                />
              </TouchableKey>
            ))}
          </View>

          <Text style={[styles.modalFieldLabel, isDark && styles.textMutedDark]}>Milestone Job Scope</Text>
          <TextInput
            value={reviewJobTitle}
            onChangeText={setReviewJobTitle}
            placeholder="e.g. Anchor Smart Contract Audit"
            placeholderTextColor="#94A3B8"
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark]}
          />

          <Text style={[styles.modalFieldLabel, isDark && styles.textMutedDark]}>Review Feedback</Text>
          <TextInput
            value={reviewComment}
            onChangeText={setReviewComment}
            placeholder="Write your testimonial regarding quality, timeliness, and technical skill..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { height: 75 }]}
          />

          <TouchableOpacity onPress={handleSubmitReview} style={styles.confirmReviewBtn}>
            <Text style={styles.confirmReviewBtnText}>Publish Verified Review</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* =========================================================
          POST COMMENT MODAL
         ========================================================= */}
      <CustomModal visible={!!activeCommentPost} onRequestClose={() => setActiveCommentPost(null)}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textWhite]}>Add Comment</Text>
            <TouchableOpacity onPress={() => setActiveCommentPost(null)}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="Write a response..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={[styles.modalTextInput, isDark && styles.modalTextInputDark, { height: 70 }]}
            autoFocus
          />

          <TouchableOpacity onPress={handleAddComment} style={styles.confirmReviewBtn}>
            <Send size={14} color="#FFFFFF" />
            <Text style={styles.confirmReviewBtnText}>Send Comment</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerWrapper: {
    width: '100%',
    height: 230,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  topNavRow: {
    position: 'absolute',
    top: 'calc(env(safe-area-inset-top, 0px) + 12px)' as any,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  navBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  navShareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  memberBadge: {
    position: 'absolute',
    top: 'calc(env(safe-area-inset-top, 0px) + 14px)' as any,
    right: 56,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileInfoSection: {
    paddingHorizontal: 16,
    backgroundColor: '#FAF9F5',
  },
  avatarActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -42,
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2554EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsCol: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'flex-end',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  followingBtn: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  followingBtnText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2554EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  tipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E11D48',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  tipBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  nameSection: {
    marginTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  handleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  followStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  followStatsText: {
    fontSize: 13,
    color: '#475569',
  },
  boldStat: {
    fontWeight: '700',
    color: '#0F172A',
  },
  dotSeparator: {
    color: '#94A3B8',
  },
  rolePillWrapper: {
    flexDirection: 'row',
    marginTop: 8,
  },
  rolePill: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
  },
  locationJobTypeSection: {
    marginTop: 8,
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
  jobTypePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  bioText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginTop: 8,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  solAddressChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  solAddressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2554EB',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  solAddressValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  linkChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  xIconText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#2554EB',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabItemTextActive: {
    color: '#2554EB',
    fontWeight: '700',
  },
  tabContentArea: {
    marginTop: 14,
  },
  postsList: {
    gap: 12,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  postAuthorMeta: {
    flex: 1,
  },
  postAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  postAuthorHandle: {
    fontSize: 12,
    color: '#64748B',
  },
  postTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  postContentText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
    marginBottom: 8,
  },
  postHashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  hashtagPill: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  hashtagText: {
    fontSize: 11,
    color: '#2554EB',
    fontWeight: '600',
  },
  postMediaImg: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  postActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  postActionCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  portfolioSection: {
    gap: 12,
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portfolioImage: {
    width: '100%',
    height: 150,
  },
  portfolioBody: {
    padding: 12,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  portfolioDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 8,
  },
  portfolioTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  portfolioTagPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  portfolioTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  skillsSection: {
    paddingTop: 4,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillItemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  skillItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  skillItemMeta: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 2,
  },
  skillItemHash: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  reviewsSection: {
    gap: 12,
  },
  ratingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingBigScore: {
    gap: 2,
  },
  ratingNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F59E0B',
  },
  ratingCountText: {
    fontSize: 11,
    color: '#64748B',
  },
  writeReviewBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  writeReviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
  },
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  reviewerMeta: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewerRole: {
    fontSize: 11,
    color: '#64748B',
  },
  reviewStars: {
    fontSize: 13,
    color: '#F59E0B',
  },
  reviewText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  emptyTabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTabTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  emptyTabSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
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
    marginBottom: 16,
  },
  modalHeaderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  quickTipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  quickTipChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickTipChipActive: {
    backgroundColor: '#FFE4E6',
    borderColor: '#E11D48',
  },
  quickTipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  quickTipTextActive: {
    color: '#E11D48',
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  confirmTipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  confirmTipBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  starSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  starSelectBtn: {
    padding: 4,
  },
  confirmReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  confirmReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Dark mode overrides */
  containerDark: {
    backgroundColor: '#0B0F19',
  },
  navBackBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  navShareBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  profileInfoSectionDark: {
    backgroundColor: '#0B0F19',
  },
  avatarImageDark: {
    borderColor: '#1E293B',
  },
  followingBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  rolePillDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  rolePillTextDark: {
    color: '#60A5FA',
  },
  jobTypePillDark: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  jobTypePillTextDark: {
    color: '#4ADE80',
  },
  bioTextDark: {
    color: '#CBD5E1',
  },
  linksRowDark: {
    borderBottomColor: '#334155',
  },
  solAddressChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  solAddressValueDark: {
    color: '#CBD5E1',
  },
  tabsContainerDark: {
    borderBottomColor: '#334155',
  },
  tabItemTextDark: {
    color: '#94A3B8',
  },
  postCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  postContentTextDark: {
    color: '#E2E8F0',
  },
  hashtagPillDark: {
    backgroundColor: '#0F172A',
  },
  hashtagTextDark: {
    color: '#60A5FA',
  },
  postActionsRowDark: {
    borderTopColor: '#334155',
  },
  emptyTabCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  portfolioCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  portfolioDescDark: {
    color: '#94A3B8',
  },
  portfolioTagPillDark: {
    backgroundColor: '#0F172A',
  },
  portfolioTagTextDark: {
    color: '#93C5FD',
  },
  skillItemCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  skillItemMetaDark: {
    color: '#34D399',
  },
  ratingBannerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  writeReviewBtnDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  writeReviewBtnTextDark: {
    color: '#60A5FA',
  },
  reviewCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  reviewTextDark: {
    color: '#CBD5E1',
  },
  modalCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  quickTipChipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  modalTextInputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
});
