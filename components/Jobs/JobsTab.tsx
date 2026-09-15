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
import { Job, JobType, ContractType, UserCredentialDocument } from '../../types';
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  Plus,
  X,
  Search,
  Zap,
  Lock,
  MapPin,
  Clock,
  Eye,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Mail,
  FileText,
  Award,
  Paperclip
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;

export const JobsTab: React.FC = () => {
  const {
    jobs,
    addJob,
    toggleSaveJob,
    applications,
    applyForJob,
    currentUser,
    viewProfileById,
    searchQuery: globalSearchQuery,
    isDark
  } = useApp();

  // Local search and filter states
  const [localSearch, setLocalSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Bounties' | 'Contract' | 'Remote' | 'Full-time'>('All');

  // Job detail modal
  const [activeJobDetail, setActiveJobDetail] = useState<Job | null>(null);

  // Apply modal
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantPortfolio, setApplicantPortfolio] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState<number>(45);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [attachedDocs, setAttachedDocs] = useState<UserCredentialDocument[]>([]);

  // Post a Job modal
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postSubmissionDestination, setPostSubmissionDestination] = useState('');
  const [postCategory, setPostCategory] = useState<'contract' | 'bounties' | 'remote' | 'full-time'>('contract');
  const [postTag, setPostTag] = useState('Contractor');
  const [postRateDisplay, setPostRateDisplay] = useState('$50 - $85/hour ($5,600 total)');
  const [postLocation, setPostLocation] = useState('Remote (Worldwide)');
  const [postDuration, setPostDuration] = useState('2 - 3 weeks');
  const [postSkills, setPostSkills] = useState('Rust, Anchor, TypeScript');
  const [postDescription, setPostDescription] = useState('');

  const filterPills: Array<'All' | 'Bounties' | 'Contract' | 'Remote' | 'Full-time'> = [
    'All',
    'Bounties',
    'Contract',
    'Remote',
    'Full-time'
  ];

  // Initialize applicant fields when opening apply modal
  const handleOpenApply = (job: Job) => {
    setActiveJobDetail(null);
    setApplyJob(job);
    setApplicantName(currentUser.name || '');
    setApplicantEmail(currentUser.email || (currentUser.handle ? `${currentUser.handle.replace('@', '')}@soldev.net` : ''));
    setApplicantPhone('+1 (555) 019-2834');
    setApplicantPortfolio(currentUser.portfolio?.[0]?.link || `https://github.com/${currentUser.handle.replace('@', '')}`);
    setProposedRate(job.budgetSol || 45);

    // Auto-populate cover note from profile or default Web3 specialist summary
    const defaultCoverDoc = (currentUser.documents || []).find((d) => d.type === 'cover_letter');
    setCoverLetter(
      defaultCoverDoc?.description ||
      currentUser.bio ||
      'Experienced Solana Rust & Anchor engineer applying for this milestone with verified on-chain credentials.'
    );

    // Automatically load all user credentials and documents (CV, Certificates, Cover Letter) from profile
    const profileDocs: UserCredentialDocument[] = currentUser.documents && currentUser.documents.length > 0
      ? [...currentUser.documents]
      : [
          {
            id: 'doc_auto_cv',
            type: 'cv',
            title: `${currentUser.name} - Technical Resume & Track Record.pdf`,
            fileName: 'Resume_Solana_2026.pdf',
            fileSize: '420 KB',
            uploadedAt: 'Verified Profile',
            isDefault: true,
            description: 'Primary CV with verified Rust & Anchor contract history.'
          },
          {
            id: 'doc_auto_cert',
            type: 'certificate',
            title: 'Solana Anchor Certified Smart Contract Developer.pdf',
            fileName: 'Anchor_Developer_Cert.pdf',
            fileSize: '610 KB',
            uploadedAt: 'Verified Profile',
            description: 'Solana Foundation Accredited Developer Program'
          },
          {
            id: 'doc_auto_cl',
            type: 'cover_letter',
            title: 'Standard Web3 Engineer Cover Letter.pdf',
            fileName: 'CoverLetter_Verified.pdf',
            fileSize: '280 KB',
            uploadedAt: 'Verified Profile',
            description: 'Milestone delivery framework and availability'
          }
        ];

    setAttachedDocs(profileDocs);
  };

  // Filter jobs based on search and category
  const filteredJobs = jobs.filter((job) => {
    // Category filtering
    if (activeCategory !== 'All') {
      const catLower = activeCategory.toLowerCase();
      const jobCategory = job.category?.toLowerCase() || '';
      const jobType = job.jobType?.toLowerCase() || '';
      const contractType = job.contractType?.toLowerCase() || '';
      const tag = job.tag?.toLowerCase() || '';

      if (catLower === 'bounties') {
        if (!jobCategory.includes('bount') && !tag.includes('bount') && !contractType.includes('milestone')) {
          return false;
        }
      } else if (catLower === 'contract') {
        if (!jobCategory.includes('contract') && !tag.includes('contract') && !contractType.includes('contract')) {
          return false;
        }
      } else if (catLower === 'remote') {
        if (!jobType.includes('remote') && !(job.location?.toLowerCase().includes('remote'))) {
          return false;
        }
      } else if (catLower === 'full-time') {
        if (!jobCategory.includes('full') && !tag.includes('full') && !contractType.includes('full')) {
          return false;
        }
      }
    }

    // Search query filtering
    const q = (localSearch || globalSearchQuery).trim().toLowerCase();
    if (q) {
      const titleMatch = job.title.toLowerCase().includes(q);
      const companyMatch = job.posterCompany.toLowerCase().includes(q);
      const descMatch = job.description.toLowerCase().includes(q);
      const skillMatch = job.skills.some((s) => s.toLowerCase().includes(q));
      return titleMatch || companyMatch || descMatch || skillMatch;
    }

    return true;
  });

  const handleApplySubmit = () => {
    if (!applyJob || !applicantName.trim() || !applicantEmail.trim()) return;

    applyForJob(
      applyJob.id,
      coverLetter.trim() || 'Experienced Solana Rust & Anchor engineer applying for this position.',
      proposedRate,
      {
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        applicantPhone: applicantPhone.trim(),
        portfolioUrl: applicantPortfolio.trim(),
        attachedDocuments: attachedDocs
      }
    );
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setApplyJob(null);
      setCoverLetter('');
    }, 1400);
  };

  const handleCreateJobSubmit = () => {
    if (!postTitle.trim() || !postDescription.trim()) return;

    const skillsArr = postSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const destination = postSubmissionDestination.trim() || `${currentUser.handle.replace('@', '')}@jobs.solana.org`;

    addJob({
      title: postTitle,
      posterEmail: destination,
      submissionDestination: destination,
      jobType: 'REMOTE',
      contractType: postCategory === 'bounties' ? 'MILESTONE-BASED' : postCategory === 'full-time' ? 'FULL-TIME' : 'CONTRACT',
      category: postCategory,
      tag: postTag,
      rateDisplay: postRateDisplay,
      location: postLocation,
      duration: postDuration,
      payRangeSol: '35 - 55 SOL',
      budgetSol: 45,
      skills: skillsArr.length > 0 ? skillsArr : ['Rust', 'Anchor', 'TypeScript'],
      chains: ['Solana'],
      description: postDescription,
      requirements: ['Proven Web3 track record', 'Demonstrated production deliverables'],
      isSaved: false
    });

    setIsPostJobOpen(false);
    setPostTitle('');
    setPostDescription('');
    setPostSkills('');
    setPostSubmissionDestination('');
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      
      {/* 1. Search Bar and Post Button Row */}
      <View style={styles.searchAndPostRow}>
        <View style={[styles.searchBarWrapper, isDark && styles.searchBarWrapperDark]}>
          <Search size={15} color={isDark ? '#64748B' : '#94A3B8'} style={styles.searchIcon} />
          <TextInput
            value={localSearch}
            onChangeText={setLocalSearch}
            placeholder="Search gigs, skills, companies..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            style={[styles.searchInput, isDark && styles.searchInputDark]}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity onPress={() => setLocalSearch('')} style={styles.clearSearchBtn}>
              <X size={14} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setIsPostJobOpen(true)}
          style={styles.postBtn}
          activeOpacity={0.85}
        >
          <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Filter Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {filterPills.map((pill) => {
          const isActive = activeCategory === pill;
          return (
            <TouchableKey
              key={pill}
              onPress={() => setActiveCategory(pill)}
              style={[
                styles.filterPill,
                isActive
                  ? styles.filterPillActive
                  : isDark
                  ? styles.filterPillInactiveDark
                  : styles.filterPillInactive
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isActive
                    ? styles.filterPillTextActive
                    : isDark
                    ? styles.filterPillTextInactiveDark
                    : styles.filterPillTextInactive
                ]}
              >
                {pill}
              </Text>
            </TouchableKey>
          );
        })}
      </ScrollView>

      {/* 4. Jobs List */}
      <View style={styles.jobsList}>
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            badge="Web3 Opportunities"
            title="No opportunities found"
            description={
              localSearch.trim() || globalSearchQuery.trim()
                ? `No contracts or bounties match "${localSearch || globalSearchQuery}".`
                : `No opportunities available in "${activeCategory}" category right now.`
            }
            actionLabel={currentUser.role === 'client' ? "Post a New Job" : "View All Categories"}
            onAction={() => {
              if (currentUser.role === 'client') {
                setIsPostJobOpen(true);
              } else {
                setActiveCategory('All');
                setLocalSearch('');
              }
            }}
            secondaryActionLabel={localSearch || globalSearchQuery ? "Clear Search" : undefined}
            onSecondaryAction={() => {
              setLocalSearch('');
            }}
          />
        ) : (
          filteredJobs.map((job) => {
            return (
              <ViewKey key={job.id} style={[styles.jobCard, isDark && styles.jobCardDark]}>
                
                {/* Top Row: Avatar with verified check, Title & Company, Bookmark */}
                <View style={styles.cardHeaderRow}>
                  <TouchableOpacity
                    onPress={() => viewProfileById(job.posterCompany)}
                    style={styles.avatarWrapper}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: job.posterAvatar }}
                      style={styles.companyAvatar}
                    />
                    <View style={[styles.verifiedCheckBadge, isDark && { backgroundColor: '#1E293B' }]}>
                      <CheckCircle2 size={12} color="#2554EB" fill={isDark ? '#0F172A' : '#FFFFFF'} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.titleInfoGroup}>
                    <Text style={[styles.jobTitleText, isDark && styles.textWhite]} numberOfLines={2}>
                      {job.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => viewProfileById(job.posterCompany)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.postedByText, isDark && styles.textMutedDark]}>
                        Posted by{' '}
                        <Text style={styles.companyNameHighlight}>
                          {job.posterCompany}
                        </Text>
                        {' • '}{job.postedAt}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleSaveJob(job.id)}
                    style={styles.bookmarkBtn}
                    activeOpacity={0.7}
                  >
                    <Bookmark
                      size={17}
                      color="#2554EB"
                      fill={job.isSaved ? '#2554EB' : 'none'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Badges Row: Contractor tag + Rate / Budget tag */}
                <View style={styles.badgesRow}>
                  <View style={[styles.contractorBadge, isDark && styles.contractorBadgeDark]}>
                    <Text style={[styles.contractorBadgeText, isDark && styles.contractorBadgeTextDark]}>
                      {job.tag || (job.contractType === 'MILESTONE-BASED' ? 'Bounty' : job.contractType === 'FULL-TIME' ? 'Full-time' : 'Contractor')}
                    </Text>
                  </View>

                  <View style={[styles.rateBadge, isDark && styles.rateBadgeDark]}>
                    <Zap size={11} color="#10B981" fill="#10B981" />
                    <Lock size={11} color="#10B981" />
                    <Text style={[styles.rateBadgeText, isDark && styles.rateBadgeTextDark]}>
                      {job.rateDisplay || `${job.payRangeSol} (${(job.budgetSol * 140).toLocaleString()} total)`}
                    </Text>
                  </View>
                </View>

                {/* Location & Duration Row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={11} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text style={[styles.metaText, isDark && styles.textMutedDark]}>
                      {job.location || 'Remote (Worldwide)'}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Clock size={11} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text style={[styles.metaText, isDark && styles.textMutedDark]}>
                      {job.duration || '2 - 3 weeks'}
                    </Text>
                  </View>
                </View>

                {/* Job Description (Exact specifications applied) */}
                <Text
                  style={[styles.jobDescriptionSpec, isDark && styles.jobDescriptionSpecDark]}
                  numberOfLines={2}
                >
                  {job.description}
                </Text>

                {/* Skill Pills */}
                <View style={styles.skillsRow}>
                  {job.skills.map((skill, sIdx) => (
                    <ViewKey key={sIdx} style={[styles.skillPill, isDark && styles.skillPillDark]}>
                      <Text style={[styles.skillPillText, isDark && styles.skillPillTextDark]}>{skill}</Text>
                    </ViewKey>
                  ))}
                </View>

                {/* Card Footer: View Full Details & Apply Now */}
                <View style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
                  <TouchableOpacity
                    onPress={() => setActiveJobDetail(job)}
                    style={[styles.viewDetailsBtn, isDark && styles.viewDetailsBtnDark]}
                    activeOpacity={0.7}
                  >
                    <Eye size={13} color={isDark ? '#94A3B8' : '#64748B'} />
                    <Text style={[styles.viewDetailsText, isDark && styles.viewDetailsTextDark]}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenApply(job)}
                    style={styles.applyNowBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.applyNowText}>Apply Now</Text>
                    <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

              </ViewKey>
            );
          })
        )}
      </View>

      {/* View Full Details Modal */}
      <CustomModal
        visible={!!activeJobDetail}
        onRequestClose={() => setActiveJobDetail(null)}
      >
        {activeJobDetail && (
          <View style={[styles.modalBody, isDark && styles.modalBodyDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <View style={styles.modalHeaderTitleGroup}>
                <Text style={[styles.modalMainTitle, isDark && styles.textWhite]}>{activeJobDetail.title}</Text>
                <Text style={[styles.modalCompanySub, isDark && styles.textMutedDark]}>
                  {activeJobDetail.posterCompany} • {activeJobDetail.location || 'Remote'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveJobDetail(null)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {/* Highlights */}
              <View style={[styles.modalHighlightRow, isDark && styles.modalHighlightRowDark]}>
                <View style={styles.modalHighlightItem}>
                  <Text style={[styles.modalHighlightLabel, isDark && styles.textMutedDark]}>Compensation</Text>
                  <Text style={[styles.modalHighlightVal, isDark && styles.textWhite]}>{activeJobDetail.rateDisplay || activeJobDetail.payRangeSol}</Text>
                </View>
                <View style={styles.modalHighlightItem}>
                  <Text style={[styles.modalHighlightLabel, isDark && styles.textMutedDark]}>Duration</Text>
                  <Text style={[styles.modalHighlightVal, isDark && styles.textWhite]}>{activeJobDetail.duration || '2 - 3 weeks'}</Text>
                </View>
                <View style={styles.modalHighlightItem}>
                  <Text style={[styles.modalHighlightLabel, isDark && styles.textMutedDark]}>Payment Security</Text>
                  <Text style={[styles.modalHighlightVal, { color: '#10B981' }]}>Direct Settlement</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={[styles.sectionHeader, isDark && styles.textWhite]}>Role Overview</Text>
              <Text style={[styles.modalDescriptionText, isDark && styles.modalDescriptionTextDark]}>
                {activeJobDetail.description}
              </Text>

              {/* Requirements */}
              <Text style={[styles.sectionHeader, isDark && styles.textWhite]}>Key Deliverables & Skills</Text>
              <View style={styles.skillsRow}>
                {activeJobDetail.skills.map((s, i) => (
                  <ViewKey key={i} style={[styles.skillPill, isDark && styles.skillPillDark]}>
                    <Text style={[styles.skillPillText, isDark && styles.skillPillTextDark]}>{s}</Text>
                  </ViewKey>
                ))}
              </View>

              {activeJobDetail.requirements && (
                <View style={styles.requirementsList}>
                  {activeJobDetail.requirements.map((req, rIdx) => (
                    <ViewKey key={rIdx} style={styles.requirementItem}>
                      <CheckCircle2 size={14} color="#2554EB" style={{ marginTop: 2 }} />
                      <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>{req}</Text>
                    </ViewKey>
                  ))}
                </View>
              )}

              {/* Verified Smart Contract Banner */}
              <View style={[styles.escrowBanner, isDark && styles.escrowBannerDark]}>
                <ShieldCheck size={20} color="#2554EB" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.escrowBannerTitle, isDark && { color: '#93C5FD' }]}>Verified Smart Contract Settlement</Text>
                  <Text style={[styles.escrowBannerSub, isDark && { color: '#60A5FA' }]}>
                    Client funds are secured for direct milestone releases upon deliverable sign-off.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooterActions, isDark && styles.modalFooterActionsDark]}>
              <TouchableOpacity
                onPress={() => handleOpenApply(activeJobDetail)}
                style={styles.modalPrimaryActionBtn}
              >
                <Text style={styles.modalPrimaryActionText}>Apply for this Opportunity</Text>
                <ArrowRight size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </CustomModal>

      {/* Apply Proposal Modal (Full Input Form) */}
      <CustomModal visible={!!applyJob} onRequestClose={() => setApplyJob(null)}>
        {applyJob && (
          <View style={[styles.modalBody, isDark && styles.modalBodyDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <View style={styles.modalHeaderTitleGroup}>
                <Text style={[styles.modalMainTitle, isDark && styles.textWhite]}>Submit Job Application</Text>
                <Text style={[styles.modalCompanySub, isDark && styles.textMutedDark]}>{applyJob.title} • {applyJob.posterCompany}</Text>
              </View>
              <TouchableOpacity onPress={() => setApplyJob(null)} style={styles.modalCloseBtn}>
                <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {appliedSuccess ? (
              <View style={styles.successStateWrapper}>
                <Sparkles size={36} color="#10B981" />
                <Text style={[styles.successTitle, isDark && styles.textWhite]}>Application Dispatched!</Text>
                <Text style={[styles.successSub, isDark && styles.textMutedDark]}>
                  Your contact details, credentials, and proposed rate were submitted directly.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                {/* Candidate Contact Info */}
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Full Name *</Text>
                <TextInput
                  value={applicantName}
                  onChangeText={setApplicantName}
                  placeholder="e.g. Alex Vance"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Email Address *</Text>
                    <TextInput
                      value={applicantEmail}
                      onChangeText={setApplicantEmail}
                      placeholder="alex@soldev.io"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      keyboardType="email-address"
                      style={[styles.modalInput, isDark && styles.modalInputDark]}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Phone Number</Text>
                    <TextInput
                      value={applicantPhone}
                      onChangeText={setApplicantPhone}
                      placeholder="+1 (555) 019-2834"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      keyboardType="phone-pad"
                      style={[styles.modalInput, isDark && styles.modalInputDark]}
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Portfolio / GitHub / Resume Link</Text>
                <TextInput
                  value={applicantPortfolio}
                  onChangeText={setApplicantPortfolio}
                  placeholder="https://github.com/yourhandle or portfolio link"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                />

                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Proposed Milestone Budget (SOL)</Text>
                <TextInput
                  value={proposedRate.toString()}
                  onChangeText={(v) => setProposedRate(Number(v) || 0)}
                  keyboardType="numeric"
                  placeholder="45"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                />

                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Cover Note & Experience Summary</Text>
                <TextInput
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder="Describe your relevant Rust/Anchor programs, deliverable milestones, and availability..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  multiline
                  numberOfLines={3}
                  style={[styles.modalInput, isDark && styles.modalInputDark, { height: 75, textAlignVertical: 'top' }]}
                />

                {/* Auto-Attached Profile Documents: CV, Certificates & Cover Letter */}
                <View style={[styles.attachedDocsSection, isDark && styles.attachedDocsSectionDark]}>
                  <View style={styles.attachedDocsHeader}>
                    <View style={styles.attachedDocsHeaderLeft}>
                      <Paperclip size={14} color="#2554EB" />
                      <Text style={[styles.attachedDocsHeading, isDark && styles.textWhite]}>
                        Profile Documents Auto-Attached ({attachedDocs.length})
                      </Text>
                    </View>
                    <View style={styles.autoAttachedBadge}>
                      <CheckCircle2 size={11} color="#059669" />
                      <Text style={styles.autoAttachedBadgeText}>From Your Profile</Text>
                    </View>
                  </View>

                  <Text style={[styles.attachedDocsSubtext, isDark && styles.textMutedDark]}>
                    Your verified CV, certifications, and credentials are automatically bundled with this application.
                  </Text>

                  <View style={styles.attachedDocsList}>
                    {attachedDocs.map((doc) => {
                      const isCv = doc.type === 'cv';
                      const isCert = doc.type === 'certificate';
                      const typeLabel = isCv ? 'CV / Resume' : isCert ? 'Certificate' : 'Cover Letter';
                      return (
                        <ViewKey key={doc.id} style={[styles.attachedDocItem, isDark && styles.attachedDocItemDark]}>
                          <View style={[styles.attachedDocIconBox, isCv ? styles.iconBoxBlue : isCert ? styles.iconBoxGreen : styles.iconBoxPurple]}>
                            {isCv ? (
                              <FileText size={15} color="#2554EB" />
                            ) : isCert ? (
                              <Award size={15} color="#059669" />
                            ) : (
                              <Paperclip size={15} color="#7C3AED" />
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.attachedDocTitle, isDark && styles.textWhite]} numberOfLines={1}>
                              {doc.title}
                            </Text>
                            <View style={styles.attachedDocMetaRow}>
                              <Text style={styles.attachedDocTypeTag}>{typeLabel}</Text>
                              <Text style={[styles.attachedDocFileSize, isDark && styles.textMutedDark]}>• {doc.fileSize || '380 KB'}</Text>
                              <Text style={styles.attachedDocVerifiedTag}>• Verified</Text>
                            </View>
                          </View>
                          <CheckCircle2 size={16} color="#059669" />
                        </ViewKey>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleApplySubmit}
                  style={[styles.modalPrimaryActionBtn, { marginTop: 14 }]}
                  activeOpacity={0.85}
                >
                  <Send size={15} color="#FFFFFF" />
                  <Text style={styles.modalPrimaryActionText}>Submit Application</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        )}
      </CustomModal>

      {/* Post a Job Modal */}
      <CustomModal visible={isPostJobOpen} onRequestClose={() => setIsPostJobOpen(false)}>
        <View style={[styles.modalBody, isDark && styles.modalBodyDark]}>
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <View style={styles.modalHeaderTitleGroup}>
              <Text style={[styles.modalMainTitle, isDark && styles.textWhite]}>Post a Job Opportunity</Text>
              <Text style={[styles.modalCompanySub, isDark && styles.textMutedDark]}>Reach verified Web3 developers and talent worldwide</Text>
            </View>
            <TouchableOpacity onPress={() => setIsPostJobOpen(false)} style={styles.modalCloseBtn}>
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Job Title *</Text>
            <TextInput
              value={postTitle}
              onChangeText={setPostTitle}
              placeholder="e.g. Solana Staking Vault Anchor Program"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.modalInput, isDark && styles.modalInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Application Submission Email / URL *</Text>
            <TextInput
              value={postSubmissionDestination}
              onChangeText={setPostSubmissionDestination}
              placeholder="e.g. jobs@drift.trade or hiring@yourdao.org"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.modalInput, isDark && styles.modalInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Category</Text>
            <View style={styles.postCategoryRow}>
              {(['contract', 'bounties', 'remote', 'full-time'] as const).map((cat) => (
                <TouchableKey
                  key={cat}
                  onPress={() => {
                    setPostCategory(cat);
                    setPostTag(cat === 'bounties' ? 'Bounty' : cat === 'full-time' ? 'Full-time' : 'Contractor');
                  }}
                  style={[
                    styles.postCatPill,
                    isDark && styles.postCatPillDark,
                    postCategory === cat && styles.postCatPillActive
                  ]}
                >
                  <Text style={[
                    styles.postCatPillText,
                    isDark && styles.postCatPillTextDark,
                    postCategory === cat && styles.postCatPillTextActive
                  ]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableKey>
              ))}
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Pay Rate / Display Range</Text>
            <TextInput
              value={postRateDisplay}
              onChangeText={setPostRateDisplay}
              placeholder="$50 - $85/hour ($5,600 total)"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.modalInput, isDark && styles.modalInputDark]}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Location</Text>
                <TextInput
                  value={postLocation}
                  onChangeText={setPostLocation}
                  placeholder="Remote (Worldwide)"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Duration</Text>
                <TextInput
                  value={postDuration}
                  onChangeText={setPostDuration}
                  placeholder="2 - 3 weeks"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Required Skills (comma-separated)</Text>
            <TextInput
              value={postSkills}
              onChangeText={setPostSkills}
              placeholder="Rust, Anchor, TypeScript, Bankrun"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.modalInput, isDark && styles.modalInputDark]}
            />

            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Job Description</Text>
            <TextInput
              value={postDescription}
              onChangeText={setPostDescription}
              placeholder="Detail the deliverable, tech stack, and milestone specs..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              multiline
              numberOfLines={4}
              style={[styles.modalInput, isDark && styles.modalInputDark, { height: 90, textAlignVertical: 'top' }]}
            />

            <TouchableOpacity
              onPress={handleCreateJobSubmit}
              style={[styles.modalPrimaryActionBtn, { marginTop: 16 }]}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={styles.modalPrimaryActionText}>Publish Job Opportunity</Text>
            </TouchableOpacity>
          </ScrollView>
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
  containerDark: {
    backgroundColor: '#0B0F17',
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 8,
  },

  // 1. Search Bar and Post Button Row
  searchAndPostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 36,
  },
  searchBarWrapperDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#2554EB',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
  },
  postBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    color: '#0F172A',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  searchInputDark: {
    color: '#F8FAFC',
  },
  clearSearchBtn: {
    padding: 3,
  },

  // 3. Filter Category Pills
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 0,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  filterPillInactiveDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  filterPillText: {
    fontSize: 11,
    fontFamily: 'Plus Jakarta Sans',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: '#475569',
    fontWeight: '500',
  },
  filterPillTextInactiveDark: {
    color: '#94A3B8',
    fontWeight: '500',
  },

  // 4. Jobs List & Cards
  jobsList: {
    gap: 8,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    fontFamily: 'Plus Jakarta Sans',
  },
  emptyStateDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
    fontFamily: 'Plus Jakarta Sans',
  },

  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  jobCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  companyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  titleInfoGroup: {
    flex: 1,
  },
  jobTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  postedByText: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
    marginTop: 1,
  },
  companyNameHighlight: {
    color: '#2554EB',
    fontWeight: '700',
  },
  bookmarkBtn: {
    padding: 3,
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  contractorBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  contractorBadgeDark: {
    backgroundColor: '#3B2D14',
    borderColor: '#78350F',
  },
  contractorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    fontFamily: 'Plus Jakarta Sans',
  },
  contractorBadgeTextDark: {
    color: '#FDE68A',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rateBadgeDark: {
    backgroundColor: '#064E3B',
    borderColor: '#047857',
  },
  rateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    fontFamily: 'Plus Jakarta Sans',
  },
  rateBadgeTextDark: {
    color: '#6EE7B7',
  },

  // Location & Duration Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },

  jobDescriptionSpec: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
    color: '#141414',
    marginBottom: 2,
  },
  jobDescriptionSpecDark: {
    color: '#E2E8F0',
  },

  // Skill Pills
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillPillDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1D4ED8',
  },
  skillPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  skillPillTextDark: {
    color: '#BFDBFE',
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 3,
  },
  cardFooterDark: {
    borderTopColor: '#334155',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewDetailsBtnDark: {
    opacity: 0.9,
  },
  viewDetailsText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  viewDetailsTextDark: {
    color: '#94A3B8',
  },
  applyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2554EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  applyNowText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans',
  },

  // Destination Pill
  destinationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  destinationPillDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E40AF',
  },
  destinationPillText: {
    fontSize: 11,
    color: '#1E40AF',
    fontFamily: 'Plus Jakarta Sans',
    flex: 1,
  },

  // Modals styling
  modalBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    maxHeight: '95%',
    width: '100%',
  },
  modalBodyDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderDark: {
    borderBottomColor: '#334155',
  },
  modalHeaderTitleGroup: {
    flex: 1,
    paddingRight: 10,
  },
  modalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalCompanySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Plus Jakarta Sans',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    maxHeight: 420,
  },
  modalHighlightRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  modalHighlightRowDark: {
    backgroundColor: '#1E293B',
  },
  modalHighlightItem: {
    alignItems: 'center',
  },
  modalHighlightLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalHighlightVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    fontFamily: 'Plus Jakarta Sans',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Plus Jakarta Sans',
  },
  modalDescriptionText: {
    fontSize: 12,
    lineHeight: 19.5,
    color: '#141414',
    fontFamily: 'Plus Jakarta Sans',
    marginBottom: 10,
  },
  modalDescriptionTextDark: {
    color: '#CBD5E1',
  },
  requirementsList: {
    marginTop: 10,
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
    fontFamily: 'Plus Jakarta Sans',
  },
  requirementTextDark: {
    color: '#CBD5E1',
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  escrowBannerDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E40AF',
  },
  escrowBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    fontFamily: 'Plus Jakarta Sans',
  },
  escrowBannerSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
    fontFamily: 'Plus Jakarta Sans',
  },
  modalFooterActions: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalFooterActionsDark: {
    borderTopColor: '#334155',
  },
  modalPrimaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2554EB',
    borderRadius: 20,
    paddingVertical: 12,
  },
  modalPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 4,
    fontFamily: 'Plus Jakarta Sans',
  },
  inputLabelDark: {
    color: '#CBD5E1',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalInputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  postCategoryRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  postCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  postCatPillDark: {
    backgroundColor: '#1E293B',
  },
  postCatPillActive: {
    backgroundColor: '#2554EB',
  },
  postCatPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'Plus Jakarta Sans',
  },
  postCatPillTextDark: {
    color: '#94A3B8',
  },
  postCatPillTextActive: {
    color: '#FFFFFF',
  },
  successStateWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Plus Jakarta Sans',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  attachedDocsSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  attachedDocsSectionDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  attachedDocsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachedDocsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachedDocsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  autoAttachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoAttachedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    fontFamily: 'Plus Jakarta Sans',
  },
  attachedDocsSubtext: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    fontFamily: 'Plus Jakarta Sans',
  },
  attachedDocsList: {
    gap: 6,
    marginTop: 2,
  },
  attachedDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attachedDocItemDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  attachedDocIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxBlue: {
    backgroundColor: '#EFF6FF',
  },
  iconBoxGreen: {
    backgroundColor: '#ECFDF5',
  },
  iconBoxPurple: {
    backgroundColor: '#F5F3FF',
  },
  attachedDocTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  attachedDocMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  attachedDocTypeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
  attachedDocFileSize: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Plus Jakarta Sans',
  },
  attachedDocVerifiedTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'Plus Jakarta Sans',
  },
});
