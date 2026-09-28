import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  ScrollView
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import {
  X,
  Image as ImageIcon,
  Send,
  Hash,
  Paperclip,
  Check,
  Plus
} from 'lucide-react-native';

interface CreatePostModalProps {
  onClose: () => void;
}

const ViewKey = View as any;
const TouchableKey = TouchableOpacity as any;

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1000&auto=format&fit=crop&q=80'
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { addPost, currentUser, showToast, isDark } = useApp();
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const hashtagSuggestions = [
    'Solana',
    'Rust',
    'Web3',
    'Anchor',
    'DeFi'
  ];

  const handleToggleHashtag = (rawTag: string) => {
    const cleanTag = rawTag.replace(/^#+/, '').trim();
    if (selectedTags.includes(cleanTag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== cleanTag));
    } else {
      setSelectedTags((prev) => [...prev, cleanTag]);
    }
  };

  const handleAddPhoto = (url: string) => {
    if (selectedImages.length >= 10) {
      showToast('Limit Reached', 'You can upload a maximum of 10 pictures per post.', 'warning');
      return;
    }
    setSelectedImages((prev) => [...prev, url]);
    showToast('Photo Added', `Added picture (${selectedImages.length + 1}/10)`, 'success');
  };

  const handleDeviceUpload = () => {
    if (selectedImages.length >= 10) {
      showToast('Limit Reached', 'You can upload a maximum of 10 pictures per post.', 'warning');
      return;
    }
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e: any) => {
        const files = Array.from(e.target.files || []) as File[];
        if (!files.length) return;
        let count = 0;
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              setSelectedImages((prev) => {
                if (prev.length >= 10) return prev;
                return [...prev, dataUrl];
              });
              count++;
            }
          };
          reader.readAsDataURL(file);
        });
        showToast('Device Files Attached', `Added picture(s) from device`, 'success');
      };
      input.click();
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!postContent.trim() && selectedImages.length === 0) {
      showToast('Empty Post', 'Please write something or attach a picture to share.', 'warning');
      return;
    }

    // Extract typed hashtags from content
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const typedTags = (postContent.match(hashtagRegex) || []).map((t) => t.replace(/^#+/, '').trim());
    
    // Combine and deduplicate
    const combinedTags = Array.from(
      new Set([...selectedTags, ...typedTags].filter(Boolean))
    );

    // Clean trailing hashtags from the body text so they don't appear twice (both as raw typed text and as pills below)
    let cleanedContent = postContent.trim();
    
    // Remove trailing hashtag block at the end of the post text
    cleanedContent = cleanedContent.replace(/(\s*(#[a-zA-Z0-9_]+)\s*)+$/, '').trim();
    if (!cleanedContent && postContent.trim()) {
      // If the entire post was only hashtags, keep the original text
      cleanedContent = postContent.trim();
    }

    addPost(cleanedContent, 'general', combinedTags, selectedImages);
    showToast('Post Published', 'Your thought has been shared to the feed.', 'success');
    onClose();
  };

  return (
    <CustomModal visible onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
              
              {/* Header */}
              <View style={[styles.header, isDark && styles.headerDark]}>
                <View style={styles.headerUserRow}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: currentUser.avatar }} style={styles.headerAvatar} />
                    <View style={[styles.shieldBadge, isDark && styles.shieldBadgeDark]}>
                      <Check size={7} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Create Post</Text>
                    <Text style={[styles.headerSub, isDark && styles.headerSubDark]}>Max 10 pictures per post</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                </TouchableOpacity>
              </View>

              {/* Text Input with Blue Border */}
              <View style={[styles.inputCard, isDark && styles.inputCardDark]}>
                <TextInput
                  value={postContent}
                  onChangeText={setPostContent}
                  placeholder="What are you building on Solana today? Tip: Add #hashtags for maximum visibility..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  style={[styles.textArea, isDark && styles.textAreaDark]}
                  autoFocus
                />
              </View>

              {/* Selected Images Thumbnails (up to 10 pictures) */}
              {selectedImages.length > 0 && (
                <View style={styles.imageSection}>
                  <Text style={[styles.imageSectionTitle, isDark && styles.imageSectionTitleDark]}>Attached Pictures ({selectedImages.length}/10):</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailsRow}>
                    {selectedImages.map((imgUrl, idx) => (
                      <ViewKey key={idx} style={[styles.thumbnailWrapper, isDark && styles.thumbnailWrapperDark]}>
                        <Image source={{ uri: imgUrl }} style={styles.thumbnailImage} resizeMode="cover" />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => handleRemovePhoto(idx)}
                        >
                          <X size={12} color="#FFFFFF" strokeWidth={3} />
                        </TouchableOpacity>
                        <View style={styles.imageIndexBadge}>
                          <Text style={styles.imageIndexText}>{idx + 1}</Text>
                        </View>
                      </ViewKey>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Image Quick Picker Palette */}
              {showImagePicker && (
                <View style={[styles.pickerBox, isDark && styles.pickerBoxDark]}>
                  <View style={styles.pickerHeader}>
                    <Text style={[styles.pickerTitle, isDark && styles.pickerTitleDark]}>Tap photo or select from device ({selectedImages.length}/10):</Text>
                    <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                      <X size={14} color={isDark ? "#94A3B8" : "#64748B"} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
                    {/* Device Upload Item */}
                    <TouchableOpacity
                      style={[styles.deviceUploadItem, isDark && styles.deviceUploadItemDark]}
                      onPress={handleDeviceUpload}
                      disabled={selectedImages.length >= 10}
                    >
                      <Plus size={18} color={isDark ? "#60A5FA" : "#2554EB"} strokeWidth={2.5} />
                      <Text style={[styles.deviceUploadText, isDark && styles.deviceUploadTextDark]}>Device</Text>
                    </TouchableOpacity>

                    {SAMPLE_PHOTOS.map((sampleUrl, sIdx) => {
                      const isAlreadyAdded = selectedImages.includes(sampleUrl);
                      return (
                        <TouchableKey
                          key={sIdx}
                          style={[styles.sampleItem, isAlreadyAdded && styles.sampleItemDisabled]}
                          disabled={isAlreadyAdded || selectedImages.length >= 10}
                          onPress={() => handleAddPhoto(sampleUrl)}
                        >
                          <Image source={{ uri: sampleUrl }} style={styles.sampleImg} />
                          {isAlreadyAdded ? (
                            <View style={styles.addedOverlay}>
                              <Text style={styles.addedText}>Added</Text>
                            </View>
                          ) : (
                            <View style={styles.addOverlay}>
                              <Plus size={14} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </TouchableKey>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Hashtag Recommendation Box (Toggle tags cleanly) */}
              <View style={[styles.hashtagBanner, isDark && styles.hashtagBannerDark]}>
                <View style={styles.bannerHeader}>
                  <Hash size={13} color={isDark ? "#FCD34D" : "#92400E"} />
                  <Text style={[styles.bannerTitle, isDark && styles.bannerTitleDark]}>Select Hashtags for Feed Discovery</Text>
                </View>
                <View style={styles.hashtagRow}>
                  {hashtagSuggestions.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <TouchableKey
                        key={tag}
                        onPress={() => handleToggleHashtag(tag)}
                        style={[styles.tagPill, isDark && styles.tagPillDark, isSelected && (isDark ? styles.tagPillActiveDark : styles.tagPillActive)]}
                      >
                        <Text style={[styles.tagPillText, isDark && styles.tagPillTextDark, isSelected && (isDark ? styles.tagPillTextActiveDark : styles.tagPillTextActive)]}>
                          #{tag} {isSelected ? '✓' : ''}
                        </Text>
                      </TouchableKey>
                    );
                  })}
                </View>
              </View>

              {/* Footer Row */}
              <View style={styles.footerRow}>
                <View style={styles.footerLeft}>
                  <TouchableOpacity
                    style={[styles.photosBtn, isDark && styles.photosBtnDark, selectedImages.length > 0 && (isDark ? styles.photosBtnActiveDark : styles.photosBtnActive)]}
                    onPress={handleDeviceUpload}
                  >
                    <Paperclip size={15} color={selectedImages.length > 0 ? (isDark ? '#93C5FD' : '#1D4ED8') : (isDark ? '#60A5FA' : '#2554EB')} />
                    <Text style={[styles.photosBtnText, isDark && styles.photosBtnTextDark, selectedImages.length > 0 && (isDark ? styles.photosBtnTextActiveDark : styles.photosBtnTextActive)]}>
                      ({selectedImages.length}/10)
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerRight}>
                  <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, isDark && styles.cancelBtnDark]}>
                    <Text style={[styles.cancelBtnText, isDark && styles.cancelBtnTextDark]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handlePublish} style={styles.postBtn}>
                    <Send size={13} color="#FFFFFF" />
                    <Text style={styles.postBtnText}>Post</Text>
                  </TouchableOpacity>
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
    maxWidth: 440,
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
  headerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#2554EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  shieldBadgeDark: {
    borderColor: '#0F172A',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  headerSubDark: {
    color: '#94A3B8',
  },
  closeBtn: {
    padding: 4,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2554EB',
    padding: 12,
    marginTop: 14,
  },
  inputCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  textArea: {
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none' as any,
  },
  textAreaDark: {
    color: '#FFFFFF',
  },
  hashtagBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 8,
    marginTop: 10,
  },
  hashtagBannerDark: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bannerTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  bannerTitleDark: {
    color: '#FCD34D',
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  tagPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagPillDark: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tagPillActive: {
    backgroundColor: '#92400E',
    borderColor: '#92400E',
  },
  tagPillActiveDark: {
    backgroundColor: '#B45309',
    borderColor: '#F59E0B',
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  tagPillTextDark: {
    color: '#FDE68A',
  },
  tagPillTextActive: {
    color: '#FFFFFF',
  },
  tagPillTextActiveDark: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },
  photosBtnDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.2)',
  },
  photosBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#2554EB',
  },
  photosBtnTextDark: {
    color: '#60A5FA',
  },
  photosBtnActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#2554EB',
  },
  photosBtnActiveDark: {
    backgroundColor: 'rgba(37, 84, 235, 0.35)',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  photosBtnTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  photosBtnTextActiveDark: {
    color: '#93C5FD',
    fontWeight: '700',
  },
  imageSection: {
    marginTop: 12,
  },
  imageSectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  imageSectionTitleDark: {
    color: '#94A3B8',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  thumbnailWrapperDark: {
    borderColor: '#334155',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndexBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  imageIndexText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  pickerTitleDark: {
    color: '#E2E8F0',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  deviceUploadItem: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2554EB',
    borderStyle: 'dashed',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceUploadItemDark: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(37, 84, 235, 0.15)',
  },
  deviceUploadText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2554EB',
    marginTop: 2,
  },
  deviceUploadTextDark: {
    color: '#60A5FA',
  },
  sampleItem: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sampleItemDisabled: {
    opacity: 0.5,
  },
  sampleImg: {
    width: '100%',
    height: '100%',
  },
  addOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 84, 235, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  cancelBtnDark: {
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  cancelBtnTextDark: {
    color: '#94A3B8',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#818CF8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
