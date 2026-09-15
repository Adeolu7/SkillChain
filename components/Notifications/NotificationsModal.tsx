import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { EmptyState } from '../Common/EmptyState';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileText,
  Briefcase,
  Award,
  ExternalLink,
  X
} from 'lucide-react-native';

interface NotificationsModalProps {
  onClose: () => void;
}

const TouchableKey = TouchableOpacity as any;

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const { notifications, markNotifAsRead, markAllNotifsAsRead, setActiveTab, isDark } = useApp();

  return (
    <CustomModal visible onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
              
          {/* Header */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={styles.headerTitleRow}>
              <Bell size={18} color={isDark ? '#60A5FA' : '#2554EB'} />
              <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Notifications</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity onPress={markAllNotifsAsRead} style={styles.readAllBtn}>
                <CheckCheck size={14} color={isDark ? '#60A5FA' : '#2554EB'} />
                <Text style={[styles.readAllText, isDark && styles.textBlueDark]}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                compact
                badge="Activity Feed"
                title="All caught up"
                description="You have no unread notifications or new on-chain gig alerts right now."
              />
            ) : (
              notifications.map((notif) => (
                <TouchableKey
                  key={notif.id}
                  onPress={() => {
                    markNotifAsRead(notif.id);
                    if (notif.linkTab) {
                      setActiveTab(notif.linkTab);
                      onClose();
                    }
                  }}
                  style={[
                    styles.notifCard,
                    isDark && styles.notifCardDark,
                    !notif.isRead && (isDark ? styles.unreadCardDark : styles.unreadCard)
                  ]}
                >
                  <View style={[styles.iconBox, isDark && styles.iconBoxDark]}>
                    {notif.type === 'payment' && <CheckCircle2 size={18} color="#10B981" />}
                    {notif.type === 'message' && <FileText size={18} color={isDark ? '#60A5FA' : '#2554EB'} />}
                    {notif.type === 'job_status' && <Briefcase size={18} color="#818CF8" />}
                    {notif.type === 'match' && <Award size={18} color="#FBBF24" />}
                    {notif.type !== 'payment' && notif.type !== 'message' && notif.type !== 'job_status' && notif.type !== 'match' && (
                      <Bell size={18} color={isDark ? '#60A5FA' : '#2554EB'} />
                    )}
                  </View>

                  <View style={styles.notifBody}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, isDark && styles.textWhite]}>{notif.title}</Text>
                      <Text style={[styles.notifTime, isDark && styles.textMutedDark]}>{notif.createdAt}</Text>
                    </View>
                    <Text style={[styles.notifMsg, isDark && styles.notifMsgDark]}>{notif.message}</Text>

                    {/* Amount Tag Link Badge */}
                    {notif.amountTag ? (
                      <View style={styles.amountBadgeRow}>
                        <Text style={[styles.amountBadgeText, isDark && styles.amountBadgeTextDark]}>{notif.amountTag}</Text>
                        <ExternalLink size={11} color={isDark ? '#60A5FA' : '#2554EB'} />
                      </View>
                    ) : null}
                  </View>

                  {!notif.isRead ? <View style={styles.unreadDot} /> : null}
                </TouchableKey>
              ))
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    padding: 16,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalContentDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    borderBottomColor: '#334155',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2554EB',
  },
  textBlueDark: {
    color: '#60A5FA',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    marginTop: 12,
  },
  listContent: {
    gap: 10,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  unreadCardDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.12)',
    borderColor: '#2554EB',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconBoxDark: {
    backgroundColor: '#1E293B',
  },
  notifBody: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  notifMsg: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 3,
    lineHeight: 16,
  },
  notifMsgDark: {
    color: '#CBD5E1',
  },
  amountBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  amountBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: "'JetBrains Mono', monospace" as any,
  },
  amountBadgeTextDark: {
    color: '#60A5FA',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2554EB',
    marginTop: 6,
  },
});
