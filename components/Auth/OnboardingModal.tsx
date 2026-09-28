import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { UserCredentialDocument } from '../../types';
import {
  User,
  Camera,
  Image as ImageIcon,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Briefcase,
  DollarSign,
  MapPin,
  Award,
  Check,
  ShieldCheck,
  Wallet,
  Zap,
  RefreshCw,
  X,
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
];

const COVER_PRESETS = [
  {
    id: 'c1',
    name: 'Modern Studio Desk',
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'c2',
    name: 'Solana Web3 Neon',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'c3',
    name: 'Minimalist Workspace',
    url: 'https://images.unsplash.com/photo-1507842229451-79b1be88688e?w=1200&auto=format&fit=crop&q=80'
  }
];

const POPULAR_SKILLS = [
  'Rust',
  'Anchor Framework',
  'Solana Web3.js',
  'TypeScript',
  'Smart Contract Audit',
  'UI/UX Design',
  'React / React Native',
  'DeFi Architecture',
  'Security Audit',
  'Frontend Web3'
];

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    currentUser,
    completeOnboarding,
    isDark
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'talent' | 'client'>((currentUser?.role as any) || 'talent');
  const [name, setName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState(currentUser?.title || 'Senior Web3 Specialist');
  const [bio, setBio] = useState(currentUser?.bio || 'Solana & Web3 Developer building decentralized protocols.');
  const [location, setLocation] = useState(currentUser?.location || 'Remote (Global)');
  const [paymentCurrency, setPaymentCurrency] = useState<'SOL' | 'USDC' | 'USDT'>(
    currentUser?.preferredCurrency || 'SOL'
  );
  const [hourlyRate, setHourlyRate] = useState(
    String(currentUser?.hourlyRateAmount || currentUser?.hourlyRateSol || 2.5)
  );
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || AVATAR_PRESETS[0]);
  const [selectedCover, setSelectedCover] = useState(currentUser?.coverImage || COVER_PRESETS[0].url);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser?.skills && currentUser.skills.length > 0
      ? currentUser.skills
      : ['Rust', 'Anchor Framework', 'Solana Web3.js']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [walletAddress, setWalletAddress] = useState(currentUser?.walletAddress || '7Xw9...4Kp9mN2q8Xv1');

  // Initial uploaded documents
  const [documents, setDocuments] = useState<UserCredentialDocument[]>([
    {
      id: 'doc_init_cv',
      type: 'cv',
      title: `${currentUser?.name || 'Developer'} - Resume & Experience.pdf`,
      fileName: 'Resume_Web3_2026.pdf',
      fileSize: '340 KB',
      uploadedAt: 'Just now',
      isDefault: true,
      description: 'Primary CV used automatically when applying for Web3 gigs.'
    }
  ]);

  // Document add modal within onboarding
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<UserCredentialDocument['type']>('cv');
  const [newDocDesc, setNewDocDesc] = useState('');

  useEffect(() => {
    if (isOnboardingModalOpen) {
      setStep(1);
      setRole((currentUser?.role as any) || 'talent');
      setName(currentUser?.name || '');
      setTitle(currentUser?.title || 'Senior Web3 Specialist');
      setBio(currentUser?.bio || 'Solana & Web3 Developer building decentralized protocols.');
      setLocation(currentUser?.location || 'Remote (Global)');
      setPaymentCurrency(currentUser?.preferredCurrency || 'SOL');
      setHourlyRate(String(currentUser?.hourlyRateAmount || currentUser?.hourlyRateSol || 2.5));
      setSelectedAvatar(currentUser?.avatar || AVATAR_PRESETS[0]);
      setSelectedCover(currentUser?.coverImage || COVER_PRESETS[0].url);
      setWalletAddress(currentUser?.walletAddress || '7Xw9...4Kp9mN2q8Xv1');
      if (currentUser?.skills && currentUser.skills.length > 0) {
        setSelectedSkills(currentUser.skills);
      }
    }
  }, [isOnboardingModalOpen, currentUser]);

  if (!isOnboardingModalOpen) return null;

  const handleGenerateWallet = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let middle = '';
    for (let i = 0; i < 16; i++) {
      middle += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newAddress = `7Xw9${middle}4Kp9`;
    setWalletAddress(newAddress);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    const clean = customSkillInput.trim();
    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills((prev) => [...prev, clean]);
      setCustomSkillInput('');
    }
  };

  const handleAddNewDocument = () => {
    if (!newDocTitle.trim()) return;
    const newDoc: UserCredentialDocument = {
      id: `doc_${Date.now()}`,
      type: newDocType,
      title: newDocTitle.trim(),
      fileName: `${newDocTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: '450 KB',
      uploadedAt: 'Just now',
      isDefault: documents.filter((d) => d.type === newDocType).length === 0,
      description: newDocDesc.trim() || undefined
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setNewDocTitle('');
    setNewDocDesc('');
    setIsAddingDoc(false);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleFinish = () => {
    const rateNum = parseFloat(hourlyRate) || (paymentCurrency === 'SOL' ? 2.5 : 65);
    completeOnboarding({
      role: role,
      name: name.trim() || currentUser?.name || 'Web3 Builder',
      title: title.trim() || (role === 'client' ? 'Hiring Lead & Founder' : 'Senior Web3 Specialist'),
      bio: bio.trim() || currentUser?.bio || 'Building next-generation Solana apps.',
      location: location.trim() || currentUser?.location || 'Remote (Global)',
      walletAddress: walletAddress.trim() || '7Xw9...4Kp9mN2q8Xv1',
      preferredCurrency: role === 'client' ? undefined : paymentCurrency,
      hourlyRateAmount: role === 'client' ? undefined : rateNum,
      hourlyRateSol: role === 'client' ? undefined : (paymentCurrency === 'SOL' ? rateNum : rateNum / 180),
      avatar: selectedAvatar,
      coverImage: selectedCover,
      skills: selectedSkills,
      documents: role === 'client' ? [] : documents
    });
  };

  return (
    <Modal
      visible={isOnboardingModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setIsOnboardingModalOpen(false)}
    >
      <View style={[styles.rootContainer, isDark ? styles.rootContainerDark : styles.rootContainerLight]}>
        <SafeAreaView style={[styles.modalScreen, isDark ? styles.modalScreenDark : styles.modalScreenLight]}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#090D16' : '#FFFFFF'} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Header Bar */}
            <View style={[styles.header, isDark && styles.headerDark]}>
              <View style={styles.headerTitleRow}>
                {step > 1 ? (
                  <TouchableOpacity
                    onPress={() => setStep((s) => (s - 1) as any)}
                    style={[styles.backBtn, isDark && styles.backBtnDark]}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.badgePill, isDark && styles.badgePillDark]}>
                    <Sparkles size={12} color="#2554EB" />
                    <Text style={styles.badgePillText}>SkillChain Setup</Text>
                  </View>
                )}
                <Text style={[styles.headerMainTitle, isDark && styles.textWhite]}>
                  {step === 1 ? 'Role & Identity' : step === 2 ? 'Skills & Pricing' : 'Credentials & Wallet'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsOnboardingModalOpen(false)}
                style={[styles.closeIconBtn, isDark && styles.closeIconBtnDark]}
                activeOpacity={0.7}
              >
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Stepper Progress Bar */}
            <View style={[styles.stepperContainer, isDark && styles.stepperContainerDark]}>
              <View style={styles.stepperRow}>
                {[
                  { num: 1, label: 'Identity' },
                  { num: 2, label: 'Skills & Rate' },
                  { num: 3, label: 'Wallet & Docs' },
                ].map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <View style={styles.stepperItem}>
                      <View style={[
                        styles.stepCircle,
                        isDark && styles.stepCircleDark,
                        step >= s.num && styles.stepCircleActive,
                        step === s.num && styles.stepCircleCurrent
                      ]}>
                        {step > s.num ? (
                          <Check size={13} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Text style={[styles.stepNum, isDark && styles.stepNumDark, step >= s.num && styles.stepNumActive]}>
                            {s.num}
                          </Text>
                        )}
                      </View>
                      <Text style={[
                        styles.stepLabelText,
                        isDark && styles.stepLabelDark,
                        step >= s.num && styles.stepLabelTextActive
                      ]}>
                        {s.label}
                      </Text>
                    </View>
                    {idx < 2 && (
                      <View style={[
                        styles.stepperDivider,
                        isDark && styles.stepperDividerDark,
                        step > s.num && styles.stepperDividerActive
                      ]} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Content Scroll View */}
            <ScrollView
              style={[styles.scrollBody, isDark && styles.scrollBodyDark]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.innerWrapper}>
                {/* STEP 1: Basic Info & Role */}
                {step === 1 && (
                  <View style={styles.stepContent}>
                    <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
                      Select Your Primary Role
                    </Text>
                    <Text style={[styles.sectionSub, isDark && styles.subtextDark]}>
                      Customize your SkillChain profile for offering services or posting bounties.
                    </Text>

                    {/* Role Switcher Cards */}
                    <View style={styles.roleGrid}>
                      <TouchableOpacity
                        onPress={() => {
                          setRole('talent');
                          if (title === 'Hiring Lead & Founder') setTitle('Senior Web3 Specialist');
                        }}
                        style={[
                          styles.roleCard,
                          role === 'talent' && styles.roleCardActive,
                          isDark && styles.roleCardDark,
                          isDark && role === 'talent' && styles.roleCardDarkActive
                        ]}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.roleIconBadge, role === 'talent' && styles.roleIconBadgeActive]}>
                          <Award size={20} color={role === 'talent' ? '#FFFFFF' : '#2554EB'} />
                        </View>
                        <Text style={[styles.roleTitle, isDark && styles.textWhite, role === 'talent' && styles.roleTitleActive]}>
                          Freelancer / Talent
                        </Text>
                        <Text style={[styles.roleDesc, isDark && styles.subtextDark]}>
                          Apply for verified gigs, build on-chain reputation, and receive instant SOL payments.
                        </Text>
                        {role === 'talent' && (
                          <View style={styles.selectedCheck}>
                            <CheckCircle2 size={16} color="#2554EB" />
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setRole('client');
                          if (title === 'Senior Web3 Specialist') setTitle('Hiring Lead & Founder');
                        }}
                        style={[
                          styles.roleCard,
                          role === 'client' && styles.roleCardActive,
                          isDark && styles.roleCardDark,
                          isDark && role === 'client' && styles.roleCardDarkActive
                        ]}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.roleIconBadge, role === 'client' && styles.roleIconBadgeActive]}>
                          <Briefcase size={20} color={role === 'client' ? '#FFFFFF' : '#2554EB'} />
                        </View>
                        <Text style={[styles.roleTitle, isDark && styles.textWhite, role === 'client' && styles.roleTitleActive]}>
                          Employer / Client
                        </Text>
                        <Text style={[styles.roleDesc, isDark && styles.subtextDark]}>
                          Post bounties, hire vetted smart contract engineers, and protect milestones in escrow.
                        </Text>
                        {role === 'client' && (
                          <View style={styles.selectedCheck}>
                            <CheckCircle2 size={16} color="#2554EB" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Avatar Selection Row */}
                    <View style={[styles.cardSection, isDark && styles.cardSectionDark]}>
                      <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>Profile Avatar</Text>
                      <View style={styles.avatarRow}>
                        <Image source={{ uri: selectedAvatar }} style={styles.mainAvatarPreview} />
                        <View style={styles.avatarPresetsList}>
                          <Text style={[styles.miniNote, isDark && styles.subtextDark]}>Choose a Web3 avatar preset:</Text>
                          <View style={styles.presetCircles}>
                            {AVATAR_PRESETS.map((preset, idx) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => setSelectedAvatar(preset)}
                                style={[
                                  styles.presetCircleWrapper,
                                  selectedAvatar === preset && styles.presetCircleActive
                                ]}
                                activeOpacity={0.8}
                              >
                                <Image source={{ uri: preset }} style={styles.presetThumb} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Inputs */}
                    <View style={styles.inputBlock}>
                      <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>
                        {role === 'client' ? 'Organization / Company Name *' : 'Display Full Name *'}
                      </Text>
                      <TextInput
                        style={[styles.textInput, isDark && styles.textInputDark]}
                        placeholder={role === 'client' ? 'e.g. Solana Anchor Labs' : 'e.g. Alex Rivera'}
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={name}
                        onChangeText={setName}
                      />
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>
                        {role === 'client' ? 'Your Position in Organization *' : 'Professional Title *'}
                      </Text>
                      <TextInput
                        style={[styles.textInput, isDark && styles.textInputDark]}
                        placeholder={role === 'client' ? 'e.g. Head of Talent & Engineering' : 'e.g. Senior Solana Smart Contract Engineer'}
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={title}
                        onChangeText={setTitle}
                      />
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>
                        {role === 'client' ? 'Company Mission & Overview' : 'Bio / Professional Summary'}
                      </Text>
                      <TextInput
                        style={[styles.textInput, styles.textArea, isDark && styles.textInputDark]}
                        placeholder="Tell clients or talent about your experience, past protocols, and achievements..."
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>Location / Timezone</Text>
                      <TextInput
                        style={[styles.textInput, isDark && styles.textInputDark]}
                        placeholder="e.g. Remote (UTC+1) / San Francisco, CA"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={location}
                        onChangeText={setLocation}
                      />
                    </View>
                  </View>
                )}

                {/* STEP 2: Skills & Rate */}
                {step === 2 && (
                  <View style={styles.stepContent}>
                    <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
                      {role === 'client' ? 'Technologies You Hire For' : 'Verified Skills & Expertise'}
                    </Text>
                    <Text style={[styles.sectionSub, isDark && styles.subtextDark]}>
                      Select your core competencies to get matched with the right opportunities.
                    </Text>

                    {/* Popular Skill Tags */}
                    <View style={styles.skillChipsGrid}>
                      {POPULAR_SKILLS.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <TouchableOpacity
                            key={skill}
                            onPress={() => toggleSkill(skill)}
                            style={[
                              styles.skillChip,
                              isSelected && styles.skillChipActive,
                              isDark && styles.skillChipDark,
                              isDark && isSelected && styles.skillChipDarkActive
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.skillChipText,
                              isSelected && styles.skillChipTextActive,
                              isDark && styles.skillChipTextDark,
                              isDark && isSelected && styles.skillChipTextDarkActive
                            ]}>
                              {skill}
                            </Text>
                            {isSelected && <Check size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Custom Skill Adder */}
                    <View style={styles.customSkillRow}>
                      <TextInput
                        style={[styles.textInput, { flex: 1 }, isDark && styles.textInputDark]}
                        placeholder="Add custom skill (e.g. Pyth Network)"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        value={customSkillInput}
                        onChangeText={setCustomSkillInput}
                        onSubmitEditing={handleAddCustomSkill}
                      />
                      <TouchableOpacity onPress={handleAddCustomSkill} style={styles.addSkillBtn}>
                        <Plus size={16} color="#FFFFFF" />
                        <Text style={styles.addSkillBtnText}>Add</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Hourly Rate & Currency (Talent Only) */}
                    {role === 'talent' && (
                      <View style={[styles.cardSection, isDark && styles.cardSectionDark]}>
                        <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>Base Hourly Rate</Text>
                        <View style={styles.rateInputRow}>
                          <View style={[styles.rateCurrencyPicker, isDark && styles.rateCurrencyPickerDark]}>
                            {(['SOL', 'USDC', 'USDT'] as const).map((curr) => (
                              <TouchableOpacity
                                key={curr}
                                onPress={() => setPaymentCurrency(curr)}
                                style={[
                                  styles.currencyBtn,
                                  isDark && styles.currencyBtnDark,
                                  paymentCurrency === curr && styles.currencyBtnActive
                                ]}
                              >
                                <Text style={[
                                  styles.currencyBtnText,
                                  isDark && styles.currencyBtnTextDark,
                                  paymentCurrency === curr && styles.currencyBtnTextActive
                                ]}>
                                  {curr}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <View style={[styles.rateInputWrapper, isDark && styles.rateInputWrapperDark]}>
                            <Text style={[styles.rateSymbol, isDark && styles.textWhite]}>
                              {paymentCurrency === 'SOL' ? '◎' : '$'}
                            </Text>
                            <TextInput
                              style={[styles.rateNumberInput, isDark && styles.textWhite]}
                              placeholder="2.5"
                              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                              value={hourlyRate}
                              onChangeText={setHourlyRate}
                              keyboardType="numeric"
                            />
                            <Text style={[styles.rateUnitText, isDark && styles.subtextDark]}>/ hour</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* STEP 3: Credentials & Solana Wallet */}
                {step === 3 && (
                  <View style={styles.stepContent}>
                    <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
                      Solana Wallet & Documents
                    </Text>
                    <Text style={[styles.sectionSub, isDark && styles.subtextDark]}>
                      Connect your Solana address to receive instant escrow releases and bounty rewards.
                    </Text>

                    {/* Wallet Card */}
                    <View style={[styles.walletCard, isDark && styles.walletCardDark]}>
                      <View style={styles.walletCardHeader}>
                        <View style={[styles.walletIconCircle, isDark && styles.walletIconCircleDark]}>
                          <Wallet size={18} color="#2554EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.walletCardTitle, isDark && styles.textWhite]}>
                            Solana Settlement Address
                          </Text>
                          <Text style={[styles.walletCardSub, isDark && styles.subtextDark]}>
                            Used for P2P contracts and automated bounty deposits
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.walletInputRow, isDark && styles.walletInputRowDark]}>
                        <Text style={[styles.walletAddressText, isDark && styles.textWhite]} numberOfLines={1}>
                          {walletAddress}
                        </Text>
                        <TouchableOpacity onPress={handleGenerateWallet} style={styles.refreshWalletBtn}>
                          <RefreshCw size={13} color="#2554EB" />
                          <Text style={styles.refreshWalletText}>Generate New</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Documents / CV Section (Talent only) */}
                    {role === 'talent' && (
                      <View style={styles.docsSection}>
                        <View style={styles.docsSectionHeader}>
                          <Text style={[styles.fieldLabel, isDark && styles.labelDark]}>
                            Credentials & Attachments ({documents.length})
                          </Text>
                          <TouchableOpacity onPress={() => setIsAddingDoc(true)} style={styles.addDocBtn}>
                            <Plus size={14} color="#2554EB" />
                            <Text style={styles.addDocBtnText}>Add Document</Text>
                          </TouchableOpacity>
                        </View>

                        {documents.map((doc) => (
                          <View key={doc.id} style={[styles.docItem, isDark && styles.docItemDark]}>
                            <View style={[styles.docIconBox, isDark && styles.docIconBoxDark]}>
                              <FileText size={18} color="#2554EB" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.docTitle, isDark && styles.textWhite]} numberOfLines={1}>
                                {doc.title}
                              </Text>
                              <Text style={[styles.docMeta, isDark && styles.subtextDark]}>
                                {doc.fileSize} • {doc.uploadedAt}
                              </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteDoc(doc.id)} style={styles.deleteDocBtn}>
                              <Trash2 size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        ))}

                        {/* Add Document Inline Form */}
                        {isAddingDoc && (
                          <View style={[styles.addDocForm, isDark && styles.addDocFormDark]}>
                            <Text style={[styles.addDocFormTitle, isDark && styles.textWhite]}>
                              Add Verified Document / Certificate
                            </Text>
                            <TextInput
                              style={[styles.textInput, isDark && styles.textInputDark]}
                              placeholder="Document Title (e.g. Anchor Security Audit Cert)"
                              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                              value={newDocTitle}
                              onChangeText={setNewDocTitle}
                            />
                            <View style={styles.addDocFormBtns}>
                              <TouchableOpacity onPress={() => setIsAddingDoc(false)} style={styles.cancelFormBtn}>
                                <Text style={styles.cancelFormBtnText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={handleAddNewDocument} style={styles.saveFormBtn}>
                                <Text style={styles.saveFormBtnText}>Attach File</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer Action Button */}
            <View style={[styles.footer, isDark && styles.footerDark]}>
              <View style={styles.footerInner}>
                {step < 3 ? (
                  <TouchableOpacity
                    onPress={() => setStep((s) => (s + 1) as any)}
                    style={styles.nextBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextBtnText}>Continue to Next Step</Text>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleFinish}
                    style={styles.finishBtn}
                    activeOpacity={0.85}
                  >
                    <Sparkles size={18} color="#FFFFFF" />
                    <Text style={styles.finishBtnText}>Launch My SkillChain Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  rootContainerLight: {
    backgroundColor: '#FAF9F5',
  },
  rootContainerDark: {
    backgroundColor: '#090D16',
  },
  modalScreen: {
    flex: 1,
  },
  modalScreenLight: {
    backgroundColor: '#FAF9F5',
  },
  modalScreenDark: {
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  backBtnDark: {
    backgroundColor: '#1E293B',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.2)',
  },
  badgePillText: {
    color: '#2554EB',
    fontSize: 11,
    fontWeight: '700',
  },
  headerMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  closeIconBtnDark: {
    backgroundColor: '#1E293B',
  },
  stepperContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepperContainerDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  stepperItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepCircleDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  stepCircleActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  stepCircleCurrent: {
    backgroundColor: '#2554EB',
    borderWidth: 3,
    borderColor: '#BFDBFE',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepNumDark: {
    color: '#94A3B8',
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelTextActive: {
    color: '#2554EB',
    fontWeight: '700',
  },
  stepLabelDark: {
    color: '#64748B',
  },
  stepperDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepperDividerDark: {
    backgroundColor: '#1E293B',
  },
  stepperDividerActive: {
    backgroundColor: '#2554EB',
  },
  scrollBody: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  scrollBodyDark: {
    backgroundColor: '#090D16',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  innerWrapper: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  stepContent: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sectionSub: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  roleCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: '#2554EB',
    backgroundColor: '#EFF6FF',
  },
  roleCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  roleCardDarkActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#1E293B',
  },
  roleIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleIconBadgeActive: {
    backgroundColor: '#2554EB',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleTitleActive: {
    color: '#2554EB',
  },
  roleDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  selectedCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  cardSectionDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  mainAvatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#2554EB',
  },
  avatarPresetsList: {
    flex: 1,
  },
  miniNote: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  presetCircles: {
    flexDirection: 'row',
    gap: 8,
  },
  presetCircleWrapper: {
    borderRadius: 16,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetCircleActive: {
    borderColor: '#2554EB',
  },
  presetThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  inputBlock: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  labelDark: {
    color: '#E2E8F0',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  textInputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    color: '#F8FAFC',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  skillChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  skillChipActive: {
    backgroundColor: '#2554EB',
    borderColor: '#2554EB',
  },
  skillChipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  skillChipDarkActive: {
    backgroundColor: '#2554EB',
    borderColor: '#60A5FA',
  },
  skillChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  skillChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  skillChipTextDark: {
    color: '#94A3B8',
  },
  skillChipTextDarkActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customSkillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2554EB',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addSkillBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rateInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rateCurrencyPicker: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rateCurrencyPickerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  currencyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
  },
  currencyBtnDark: {
  },
  currencyBtnActive: {
    backgroundColor: '#2554EB',
  },
  currencyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  currencyBtnTextDark: {
    color: '#94A3B8',
  },
  currencyBtnTextActive: {
    color: '#FFFFFF',
  },
  rateInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  rateInputWrapperDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  rateSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2554EB',
    marginRight: 6,
  },
  rateNumberInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 10,
  },
  rateUnitText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  walletCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  walletCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconCircleDark: {
    backgroundColor: '#1E293B',
  },
  walletCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  walletCardSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  walletInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  walletInputRowDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  walletAddressText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#334155',
    marginRight: 8,
  },
  refreshWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refreshWalletText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
  },
  docsSection: {
    marginTop: 4,
  },
  docsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addDocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2554EB',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  docItemDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconBoxDark: {
    backgroundColor: '#1E293B',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  deleteDocBtn: {
    padding: 6,
  },
  addDocForm: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 8,
    gap: 10,
  },
  addDocFormDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  addDocFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  addDocFormBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelFormBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelFormBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  saveFormBtn: {
    backgroundColor: '#2554EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveFormBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  footerInner: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2554EB',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2554EB',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  textWhite: {
    color: '#F8FAFC',
  },
  subtextDark: {
    color: '#94A3B8',
  },
});

