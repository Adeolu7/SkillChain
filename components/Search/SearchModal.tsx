import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import { Search, X } from 'lucide-react-native';

interface SearchModalProps {
  onClose: () => void;
}

const TouchableKey = TouchableOpacity as any;

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const { searchQuery, setSearchQuery, setActiveTab, isDark } = useApp();

  const popularSkills = [
    'Rust',
    'Anchor',
    'Solana CLI',
    'ZK Proofs',
    'Security Audit',
    'React Native'
  ];

  const handleSelectSkill = (skill: string) => {
    setSearchQuery(skill);
    setActiveTab('home');
    onClose();
  };

  return (
    <CustomModal visible alignTop onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
              
          {/* Header */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={styles.headerTitleRow}>
              <Search size={18} color={isDark ? '#60A5FA' : '#2554EB'} />
              <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Search Posts & Feed</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Blue Border Search Box */}
          <View style={[styles.searchBoxWrapper, isDark && styles.searchBoxWrapperDark]}>
            <Search size={16} color={isDark ? '#94A3B8' : '#64748B'} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
              }}
              placeholder="Search posts by keywords, tags (#SecurityAudit, #Rust), or authors..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={14} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Popular Skills Section */}
          <View style={styles.skillsSection}>
            <Text style={[styles.skillsLabel, isDark && styles.textMutedDark]}>POPULAR SKILLS</Text>
            <View style={styles.skillsRow}>
              {popularSkills.map((skill) => (
                <TouchableKey
                  key={skill}
                  onPress={() => handleSelectSkill(skill)}
                  style={[styles.skillPill, isDark && styles.skillPillDark]}
                >
                  <Text style={[styles.skillText, isDark && styles.skillTextDark]}>{skill}</Text>
                </TouchableKey>
              ))}
            </View>
          </View>

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
  closeBtn: {
    padding: 4,
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2554EB',
    paddingHorizontal: 12,
    height: 44,
    marginTop: 14,
  },
  searchBoxWrapperDark: {
    backgroundColor: '#0F172A',
    borderColor: '#3B82F6',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  searchInputDark: {
    color: '#F8FAFC',
  },
  clearBtn: {
    padding: 4,
  },
  skillsSection: {
    marginTop: 16,
  },
  skillsLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  skillPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  skillPillDark: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2554EB',
  },
  skillTextDark: {
    color: '#60A5FA',
  },
});
