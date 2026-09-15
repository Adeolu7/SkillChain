import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import {
  Bookmark,
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  ExternalLink,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react-native';

const ViewKey = View as any;
const TouchableOpacityKey = TouchableOpacity as any;

export const BookmarkedJobsModal: React.FC = () => {
  const {
    isBookmarkedJobsModalOpen,
    setIsBookmarkedJobsModalOpen,
    jobs,
    currentUser,
    toggleSaveJob,
    applyForJob,
    isDark
  } = useApp();

  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null);

  if (!isBookmarkedJobsModalOpen) return null;

  const savedJobIds = currentUser.savedJobIds || [];
  const bookmarkedJobs = jobs.filter((j) => j.isSaved || savedJobIds.includes(j.id));

  return (
    <CustomModal
      isOpen={isBookmarkedJobsModalOpen}
      onClose={() => setIsBookmarkedJobsModalOpen(false)}
      title="Bookmarked Jobs & Gigs"
      maxWidth={480}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {bookmarkedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, isDark && styles.emptyIconBoxDark]}>
              <Bookmark size={28} color="#94A3B8" />
            </View>
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
              No Bookmarked Jobs Yet
            </Text>
            <Text style={[styles.emptySubtitle, isDark && styles.subtextDark]}>
              Explore Web3 and Solana gigs in the Jobs tab and bookmark projects you want to apply for later.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            <Text style={[styles.countHeader, isDark && styles.subtextDark]}>
              You have {bookmarkedJobs.length} saved {bookmarkedJobs.length === 1 ? 'gig' : 'gigs'}
            </Text>

            <View style={styles.jobsList}>
              {bookmarkedJobs.map((job) => (
                <ViewKey key={job.id} style={[styles.jobCard, isDark && styles.jobCardDark]}>
                  {/* Job Header */}
                  <View style={styles.jobHeader}>
                    <View style={styles.companyLogoBox}>
                      {job.posterAvatar ? (
                        <Image source={{ uri: job.posterAvatar }} style={styles.logoImg} />
                      ) : (
                        <Briefcase size={18} color="#2554EB" />
                      )}
                    </View>

                    <View style={styles.jobHeaderInfo}>
                      <Text style={[styles.jobTitle, isDark && styles.textDark]} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Text style={styles.companyName}>
                        {job.posterCompany || job.posterName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleSaveJob(job.id)}
                      style={styles.unbookmarkBtn}
                      activeOpacity={0.7}
                    >
                      <Bookmark size={16} color="#2554EB" fill="#2554EB" />
                    </TouchableOpacity>
                  </View>

                  {/* Budget & Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.budgetBadge}>
                      <Text style={styles.budgetText}>
                        {job.budgetSol ? `${job.budgetSol} SOL` : 'Budget not specified'}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <MapPin size={12} color="#64748B" />
                      <Text style={styles.metaItemText}>{job.location || 'Remote'}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Clock size={12} color="#64748B" />
                      <Text style={styles.metaItemText}>{job.postedAt || 'Recently'}</Text>
                    </View>
                  </View>

                  {/* Description Snippet */}
                  <Text style={[styles.jobDesc, isDark && styles.subtextDark]} numberOfLines={2}>
                    {job.description}
                  </Text>

                  {/* Skills / Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <View style={styles.tagsRow}>
                      {job.skills.slice(0, 3).map((tag, idx) => (
                        <ViewKey key={idx} style={[styles.tagPill, isDark && styles.tagPillDark]}>
                          <Text style={[styles.tagText, isDark && styles.tagTextDark]}>{tag}</Text>
                        </ViewKey>
                      ))}
                      {job.skills.length > 3 && (
                        <Text style={styles.moreTagsText}>+{job.skills.length - 3} more</Text>
                      )}
                    </View>
                  )}

                  {/* Action Row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => {
                        applyForJob(job.id, 'Applied using saved profile credentials.', job.budgetSol || 2.0);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.applyBtnText}>Quick Apply with CV</Text>
                      <ArrowRight size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </ViewKey>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    maxHeight: 520,
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIconBoxDark: {
    backgroundColor: '#1E293B',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  textDark: {
    color: '#F8FAFC',
  },
  subtextDark: {
    color: '#94A3B8',
  },
  scrollList: {
    maxHeight: 450,
  },
  countHeader: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  jobCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  jobHeaderInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  companyName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  unbookmarkBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  budgetBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  budgetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 11,
    color: '#64748B',
  },
  jobDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  tagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  tagTextDark: {
    color: '#CBD5E1',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  applyBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
