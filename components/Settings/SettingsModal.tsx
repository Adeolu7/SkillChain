import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  TextInput
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import { usePrivy } from '@privy-io/expo';
import { useRouter } from 'expo-router';
import {
  Settings,
  User,
  HelpCircle,
  FileText,
  AlertTriangle,
  Sun,
  Moon,
  Bell,
  Shield,
  Eye,
  Wallet,
  Sparkles,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  Send,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  X
} from 'lucide-react-native';

interface SettingsModalProps {
  onClose: () => void;
}

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    themeMode,
    setThemeMode,
    isDark,
    currentUser,
    setCurrentUser,
    triggerSplashScreen,
    showToast,
    logout,
    setIsAuthModalOpen,
    setIsOnboardingModalOpen
  } = useApp();
  const { logout: privyLogout, user } = usePrivy();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'account' | 'support' | 'legal' | 'report'>('account');

  // Toggle States
  const isDarkMode = isDark || themeMode === 'dark';
  const [notifJobs, setNotifJobs] = useState(true);
  const [notifDMs, setNotifDMs] = useState(true);
  const [notifSettlements, setNotifSettlements] = useState(true);
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(true);
  const [privacyShowWallet, setPrivacyShowWallet] = useState(true);

  // Support Tab FAQ expansion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Report Tab Form State
  const [reportCategory, setReportCategory] = useState('Impersonation or Scam');
  const [reportTarget, setReportTarget] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const handleToggleDarkMode = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setThemeMode(nextTheme);
    showToast(nextTheme === 'dark' ? 'Dark Mode Activated' : 'Light Mode Activated', undefined, 'info');
  };

  const handleSubmitReport = () => {
    if (!reportDescription.trim()) {
      showToast('Error', 'Please enter a description for your report.', 'error');
      return;
    }
    showToast('Report Submitted', 'Our decentralized audit guild is reviewing your ticket.', 'success');
    setReportTarget('');
    setReportDescription('');
    setActiveTab('account');
  };

  return (
    <CustomModal visible onRequestClose={onClose} maxWidth={600}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
          {/* Header */}
          <View style={[styles.header, isDarkMode && styles.headerDark]}>
            <View style={styles.headerTitleRow}>
              <Settings size={18} color="#2554EB" />
              <Text style={[styles.headerTitle, isDarkMode && styles.textWhite]}>Settings & Preferences</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Top 4 Segmented Tabs */}
          <View style={[styles.tabBar, isDarkMode && styles.tabBarDark]}>
            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'support', label: 'Support', icon: HelpCircle },
              { id: 'legal', label: 'Legal', icon: FileText },
              { id: 'report', label: 'Report', icon: AlertTriangle }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <TouchableKey
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  style={[
                    styles.tabItem,
                    isDarkMode && styles.tabItemDark,
                    isActive && (isDarkMode ? styles.tabItemActiveDark : styles.tabItemActive)
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon size={14} color={isActive ? '#2554EB' : (isDarkMode ? '#94A3B8' : '#64748B')} />
                  <Text style={[
                    styles.tabLabel,
                    isDarkMode && styles.tabLabelDarkText,
                    isActive && (isDarkMode ? styles.tabLabelActiveDarkText : styles.tabLabelActive)
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableKey>
              );
            })}
          </View>

          <ScrollView style={styles.scrollSection} showsVerticalScrollIndicator={false}>
            {/* 1. ACCOUNT TAB */}
            {activeTab === 'account' && (
              <>
                {/* Section: ACCOUNT & APPEARANCE */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>ACCOUNT & APPEARANCE</Text>
                  
                  {/* Dark Mode Card */}
                  <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                    <View style={styles.cardRowBetween}>
                      <View style={styles.cardLeftGroup}>
                        <View style={[styles.blueIconBox, isDarkMode && styles.blueIconBoxDark]}>
                          {isDarkMode ? (
                            <Moon size={18} color="#60A5FA" />
                          ) : (
                            <Sun size={18} color="#2554EB" />
                          )}
                        </View>
                        <View>
                          <Text style={[styles.cardItemTitle, isDarkMode && styles.textWhite]}>Dark Mode 🌙</Text>
                          <Text style={[styles.cardItemSub, isDarkMode && styles.textMutedDark]}>
                            {isDarkMode ? 'Dark theme active across all app views' : 'Light theme active across all app views'}
                          </Text>
                        </View>
                      </View>

                      {/* Animated Toggle Switch */}
                      <TouchableOpacity
                        onPress={handleToggleDarkMode}
                        style={[styles.toggleTrack, isDarkMode && styles.toggleTrackActive]}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.toggleThumb, isDarkMode && styles.toggleThumbActive]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Section: NOTIFICATION PREFERENCES */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>NOTIFICATION PREFERENCES</Text>
                  
                  <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                    {/* Item 1 */}
                    <TouchableOpacity
                      onPress={() => {
                        setNotifJobs(!notifJobs);
                        showToast(notifJobs ? 'Job alerts muted' : 'Job alerts enabled', undefined, 'info');
                      }}
                      style={styles.cardRowClickable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardLeftRow}>
                        <Bell size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>Job & Bounty Alerts</Text>
                      </View>
                      <View style={[styles.checkboxBox, notifJobs && styles.checkboxBoxChecked]}>
                        {notifJobs && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>

                    <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                    {/* Item 2 */}
                    <TouchableOpacity
                      onPress={() => {
                        setNotifDMs(!notifDMs);
                        showToast(notifDMs ? 'Direct message alerts muted' : 'Direct message alerts enabled', undefined, 'info');
                      }}
                      style={styles.cardRowClickable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardLeftRow}>
                        <MessageSquare size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>Direct Messages & Mentions</Text>
                      </View>
                      <View style={[styles.checkboxBox, notifDMs && styles.checkboxBoxChecked]}>
                        {notifDMs && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>

                    <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                    {/* Item 3 */}
                    <TouchableOpacity
                      onPress={() => {
                        setNotifSettlements(!notifSettlements);
                        showToast(notifSettlements ? 'Direct release notifications muted' : 'Direct release notifications enabled', undefined, 'info');
                      }}
                      style={styles.cardRowClickable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardLeftRow}>
                        <Shield size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>Solana Direct Releases & Settlements</Text>
                      </View>
                      <View style={[styles.checkboxBox, notifSettlements && styles.checkboxBoxChecked]}>
                        {notifSettlements && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section: PRIVACY & IDENTITY */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>PRIVACY & IDENTITY</Text>
                  
                  <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                    {/* Item 1 */}
                    <TouchableOpacity
                      onPress={() => {
                        setPrivacyPublicProfile(!privacyPublicProfile);
                        showToast(privacyPublicProfile ? 'Profile set to private' : 'Profile is now public', undefined, 'info');
                      }}
                      style={styles.cardRowClickable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardLeftRow}>
                        <Eye size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>Public Talent Profile</Text>
                      </View>
                      <View style={[styles.checkboxBox, privacyPublicProfile && styles.checkboxBoxChecked]}>
                        {privacyPublicProfile && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>

                    <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                    {/* Item 2 */}
                    <TouchableOpacity
                      onPress={() => {
                        setPrivacyShowWallet(!privacyShowWallet);
                        showToast(privacyShowWallet ? 'Wallet address hidden' : 'Wallet address visible', undefined, 'info');
                      }}
                      style={styles.cardRowClickable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardLeftRow}>
                        <Wallet size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>Display Wallet Address Publicly</Text>
                      </View>
                      <View style={[styles.checkboxBox, privacyShowWallet && styles.checkboxBoxChecked]}>
                        {privacyShowWallet && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section: ACCOUNT & APP EXPERIENCE */}
                <View style={styles.section}>
                  <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>ACCOUNT & APP EXPERIENCE</Text>
                  
                  <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                    {/* Active User Card */}
                    <View style={styles.activeUserRow}>
                      <Image source={{ uri: currentUser.avatar }} style={styles.activeUserAvatar} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={[styles.activeUserName, isDarkMode && styles.textWhite]}>{currentUser.name}</Text>
                          <CheckCircle2 size={13} color="#2554EB" />
                        </View>
                        <Text style={[styles.activeUserEmail, isDarkMode && styles.textMutedDark]}>{currentUser.email || currentUser.handle}</Text>
                      </View>
                    </View>

                    <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                    {/* Log Out */}
                    <TouchableOpacity
                      onPress={async () => {
                        onClose();
                        try {
                          if (user && privyLogout) {
                            await privyLogout();
                          }
                        } catch (err) {
                          console.warn('[SettingsModal] Privy logout notice:', err);
                        }
                        logout();
                        try {
                          router.replace('/(auth)/login' as any);
                        } catch {}
                      }}
                      style={styles.actionRowBtn}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionRowLeft}>
                        <LogOut size={16} color="#EF4444" />
                        <Text style={[styles.actionRowText, { color: '#EF4444' }]}>Log Out / Switch User</Text>
                      </View>
                      <ChevronRight size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* 2. SUPPORT TAB (Refined with Telegram & X 24/7 Channels) */}
            {activeTab === 'support' && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>24/7 SUPPORT & OFFICIAL CHANNELS</Text>
                
                <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                  {/* Telegram Channel */}
                  <TouchableOpacity
                    onPress={() => {
                      if (typeof window !== 'undefined') {
                        window.open('https://t.me/SkillChainSupport', '_blank');
                      }
                      showToast('Opening Telegram Support', 'Direct link to @SkillChainSupport', 'info');
                    }}
                    style={styles.cardRowClickable}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardLeftRow}>
                      <View style={[styles.channelIconBox, { backgroundColor: '#229ED9' }]}>
                        <Send size={15} color="#FFFFFF" />
                      </View>
                      <View>
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>Telegram 24/7 Support</Text>
                        <Text style={[styles.cardItemSub, isDarkMode && styles.textMutedDark]}>@SkillChainSupport • Live Milestone & Technical Help</Text>
                      </View>
                    </View>
                    <ExternalLink size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>

                  <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                  {/* X (Twitter) Channel */}
                  <TouchableOpacity
                    onPress={() => {
                      if (typeof window !== 'undefined') {
                        window.open('https://x.com/SkillChainApp', '_blank');
                      }
                      showToast('Opening X (Twitter)', 'Direct link to @SkillChainApp', 'info');
                    }}
                    style={styles.cardRowClickable}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardLeftRow}>
                      <View style={[styles.channelIconBox, { backgroundColor: '#0F172A' }]}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>𝕏</Text>
                      </View>
                      <View>
                        <Text style={[styles.cardRowText, isDarkMode && styles.textWhite]}>X (Twitter) 24/7 Support</Text>
                        <Text style={[styles.cardItemSub, isDarkMode && styles.textMutedDark]}>@SkillChainApp • Direct Messages & Bounty Escalations</Text>
                      </View>
                    </View>
                    <ExternalLink size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                </View>

                {/* FAQ Accordion */}
                <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark, { marginTop: 16 }]}>FREQUENTLY ASKED QUESTIONS</Text>
                <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                  {[
                    {
                      q: 'How does on-chain Solana milestone settlement protect payments?',
                      a: 'When an employer hires talent or funds a gig, client SOL or USDC is reserved on-chain for direct milestone release. The freelancer begins work with 100% certainty that funds are allocated. Once deliverables are reviewed and accepted, funds are transferred directly to the builder with zero platform commission.'
                    },
                    {
                      q: 'How do job applications and applicant submissions work?',
                      a: 'When applying for an opportunity, your name, contact email, phone number, portfolio/GitHub link, and proposed milestone quote are securely delivered directly to the job poster’s designated recipient address or hiring inbox.'
                    },
                    {
                      q: 'What is the Credentials repository on my profile?',
                      a: 'The Credentials tab stores your verified documents, certifications, proof of code audits, resumes, and soulbound credentials. You can upload and organize multiple PDF/document records and designate a primary CV for 1-click job submissions.'
                    },
                    {
                      q: 'How do I reach 24/7 customer support?',
                      a: 'Our dedicated support team is active 24/7 across our official Telegram (@SkillChainSupport) and X/Twitter (@SkillChainApp) channels for immediate escalation of milestone verifications, dispute arbitration, or wallet questions.'
                    },
                    {
                      q: 'Are there platform fees on direct payments and tips?',
                      a: 'SkillChain charges 0% commission on direct peer-to-peer developer payments, tips, and milestone settlements. You only pay standard Solana sub-penny network gas fees.'
                    },
                    {
                      q: 'Can I delete text-only posts and thoughts on the feed?',
                      a: 'Yes, you can edit or delete any post you have authored, including text-only reflections, image carousels, or bounty announcements, directly via the post’s top-right options menu.'
                    }
                  ].map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <ViewKey key={idx}>
                        <TouchableOpacity
                          onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                          style={styles.faqHeaderBtn}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.faqQuestionText, isDarkMode && styles.textWhite]}>{faq.q}</Text>
                          {isExpanded ? (
                            <ChevronDown size={16} color="#2554EB" />
                          ) : (
                            <ChevronRight size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                          )}
                        </TouchableOpacity>
                        {isExpanded && (
                          <View style={[styles.faqAnswerBox, isDarkMode && styles.faqAnswerBoxDark]}>
                            <Text style={[styles.faqAnswerText, isDarkMode && styles.textMutedDark]}>{faq.a}</Text>
                          </View>
                        )}
                        {idx < 5 && <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />}
                      </ViewKey>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 3. LEGAL TAB */}
            {activeTab === 'legal' && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>DECENTRALIZED PROTOCOL & LEGAL AGREEMENT</Text>
                
                <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                  <View style={styles.legalItemBox}>
                    <Text style={[styles.legalHeading, isDarkMode && styles.textWhite]}>1. Non-Custodial Smart Contract Architecture</Text>
                    <Text style={[styles.legalParagraph, isDarkMode && styles.textMutedDark]}>
                      SkillChain is a decentralized, non-custodial interface. Smart contract direct settlements, tips, and token transfers are executed trustlessly via Solana Anchor programs. The protocol does not hold private keys, custodial funds, or unilateral seizure authority.
                    </Text>
                  </View>

                  <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                  <View style={styles.legalItemBox}>
                    <Text style={[styles.legalHeading, isDarkMode && styles.textWhite]}>2. Intellectual Property & Work Deliverables</Text>
                    <Text style={[styles.legalParagraph, isDarkMode && styles.textMutedDark]}>
                      Unless explicitly stipulated in a custom agreement between employer and builder, all right, title, and interest in deliverables, source code, and design assets automatically transfer to the client upon full milestone settlement.
                    </Text>
                  </View>

                  <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                  <View style={styles.legalItemBox}>
                    <Text style={[styles.legalHeading, isDarkMode && styles.textWhite]}>3. Milestone Settlement & On-Chain Finality</Text>
                    <Text style={[styles.legalParagraph, isDarkMode && styles.textMutedDark]}>
                      All payouts executed via direct payments, tip streams, and milestone smart contracts are irreversible once confirmed on the Solana Mainnet Beta blockchain. Users are responsible for verifying recipient addresses and destination parameters prior to signing.
                    </Text>
                  </View>

                  <View style={[styles.cardDivider, isDarkMode && styles.cardDividerDark]} />

                  <View style={styles.legalItemBox}>
                    <Text style={[styles.legalHeading, isDarkMode && styles.textWhite]}>4. Privacy & Verifiable Credential Standards</Text>
                    <Text style={[styles.legalParagraph, isDarkMode && styles.textMutedDark]}>
                      User credentials, document links, and profile identity records respect end-to-end user sovereignty. State compression and cryptographic hashes ensure talent ratings cannot be tampered with while preventing unauthorized personal surveillance.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 4. REPORT TAB */}
            {activeTab === 'report' && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderLabel, isDarkMode && styles.sectionHeaderLabelDark]}>REPORT ISSUE OR SCAM</Text>
                
                <View style={[styles.cardBox, isDarkMode && styles.cardBoxDark]}>
                  <View style={[styles.reportIntroBox, isDarkMode && styles.reportIntroBoxDark]}>
                    <ShieldAlert size={20} color="#EF4444" />
                    <Text style={[styles.reportIntroText, isDarkMode && { color: '#FCA5A5' }]}>
                      Protect the Solana developer community. Reports are reviewed by decentralized security auditors.
                    </Text>
                  </View>

                  <Text style={[styles.inputLabelText, isDarkMode && styles.textWhite]}>Issue Category</Text>
                  <View style={styles.categoryPickerRow}>
                    {['Impersonation or Scam', 'Milestone Breach', 'Malicious Code', 'Bug'].map((cat) => {
                      const isSelected = reportCategory === cat;
                      return (
                        <TouchableKey
                          key={cat}
                          onPress={() => setReportCategory(cat)}
                          style={[
                            styles.catBtn,
                            isDarkMode && styles.catBtnDark,
                            isSelected && styles.catBtnActive
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.catBtnText,
                            isDarkMode && styles.textMutedDark,
                            isSelected && styles.catBtnTextActive
                          ]}>
                            {cat}
                          </Text>
                        </TouchableKey>
                      );
                    })}
                  </View>

                  <Text style={[styles.inputLabelText, isDarkMode && styles.textWhite]}>Target Username, Wallet, or Post ID</Text>
                  <TextInput
                    value={reportTarget}
                    onChangeText={setReportTarget}
                    placeholder="e.g. @suspicious_user or 7Xw9...4Kp9"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    style={[styles.textInputField, isDarkMode && styles.textInputFieldDark]}
                  />

                  <Text style={[styles.inputLabelText, isDarkMode && styles.textWhite]}>Detailed Description & Evidence</Text>
                  <TextInput
                    value={reportDescription}
                    onChangeText={setReportDescription}
                    placeholder="Describe what occurred, including transaction hashes or code snippets..."
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    multiline
                    numberOfLines={3}
                    style={[styles.textInputField, isDarkMode && styles.textInputFieldDark, { height: 75, textAlignVertical: 'top' }]}
                  />

                  <TouchableOpacity
                    onPress={handleSubmitReport}
                    style={styles.submitReportBtn}
                    activeOpacity={0.85}
                  >
                    <Send size={14} color="#FFFFFF" />
                    <Text style={styles.submitReportBtnText}>Submit Security Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    width: '100%',
    maxHeight: '90%',
  },
  modalContentDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
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
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  
  // Segmented Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginTop: 12,
    gap: 2,
  },
  tabBarDark: {
    backgroundColor: '#1E293B',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 9,
  },
  tabItemDark: {
    backgroundColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabItemActiveDark: {
    backgroundColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelDarkText: {
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#2554EB',
    fontWeight: '700',
  },
  tabLabelActiveDarkText: {
    color: '#60A5FA',
    fontWeight: '700',
  },

  scrollSection: {
    marginTop: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionHeaderLabelDark: {
    color: '#94A3B8',
  },
  
  // Common Card Box
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  cardBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  cardDividerDark: {
    backgroundColor: '#334155',
  },
  cardRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  blueIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueIconBoxDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.2)',
  },
  cardItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Toggle Switch
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: '#2554EB',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },

  // Checkbox items
  cardRowClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cardLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardRowText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },

  // Support Channels
  channelIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Supabase Sync styles
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillOffline: {
    backgroundColor: '#FEF3C7',
  },
  statusPillOfflineDark: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusPillSynced: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusPillTextOffline: {
    color: '#D97706',
  },
  statusPillTextOfflineDark: {
    color: '#FBBF24',
  },
  statusPillTextSynced: {
    color: '#16A34A',
  },
  syncStatusCaption: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 10,
  },
  syncBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  syncPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2554EB',
    paddingVertical: 8,
    borderRadius: 10,
  },
  syncPrimaryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copySqlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 10,
  },
  copySqlBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  copySqlBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2554EB',
  },

  // Active User & Persona switcher
  activeUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  activeUserAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  activeUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeUserEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  switchPersonaTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 6,
  },
  personaGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  personaPillBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  personaPillBtnDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  personaPillBtnActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  personaPillName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  personaPillNameActive: {
    color: '#FFFFFF',
  },
  personaPillRole: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  personaPillRoleActive: {
    color: '#BFDBFE',
  },

  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRowText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },

  // FAQs
  faqHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswerBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  faqAnswerBoxDark: {
    backgroundColor: '#0F172A',
  },
  faqAnswerText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#475569',
  },

  // Legal
  legalItemBox: {
    paddingVertical: 6,
  },
  legalHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  legalParagraph: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#64748B',
  },

  // Report
  reportIntroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  reportIntroBoxDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  reportIntroText: {
    fontSize: 11,
    color: '#991B1B',
    flex: 1,
    lineHeight: 15,
  },
  inputLabelText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    marginTop: 8,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  catBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  catBtnDark: {
    backgroundColor: '#0F172A',
  },
  catBtnActive: {
    backgroundColor: '#2554EB',
  },
  catBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  textInputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0F172A',
  },
  textInputFieldDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#FFFFFF',
  },
  submitReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  submitReportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Dark Mode text helpers
  textWhite: {
    color: '#FFFFFF',
  },
  textMutedDark: {
    color: '#94A3B8',
  }
});
