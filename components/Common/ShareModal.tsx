import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { CustomModal } from '../CustomModal';
import { useApp } from '../../context/AppContext';
import {
  X,
  Share2,
  Send,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Globe,
  ExternalLink
} from 'lucide-react-native';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  shareText: string;
  shareUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  title,
  shareText,
  shareUrl
}) => {
  const { showToast, isDark } = useApp();
  const [copied, setCopied] = React.useState(false);

  const fullShareText = `${shareText}\n${shareUrl}`;

  // Try native share first if available
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title,
          text: shareText,
          url: shareUrl
        });
        showToast('Shared successfully!', undefined, 'success');
        onClose();
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.log('Native share failed or cancelled');
        }
      }
    }
    return false;
  };

  const handleShareTo = (platform: 'native' | 'whatsapp' | 'sms' | 'twitter' | 'telegram' | 'linkedin' | 'email' | 'copy') => {
    if (platform === 'native') {
      handleNativeShare();
      return;
    }

    if (platform === 'copy') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(fullShareText);
      }
      setCopied(true);
      showToast('Link Copied to Clipboard!', undefined, 'success');
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedFull = encodeURIComponent(fullShareText);

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedFull}`;
        break;
      case 'sms':
        url = `sms:?body=${encodedFull}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedFull}`;
        break;
    }

    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank');
      showToast('Opening Share App...', undefined, 'info');
      onClose();
    }
  };

  return (
    <CustomModal visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
        <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                <Share2 size={16} color="#2554EB" />
              </View>
              <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                {title || 'Share'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Share Preview Text */}
          <View style={[styles.previewBox, isDark && styles.previewBoxDark]}>
            <Text style={[styles.previewText, isDark && styles.previewTextDark]} numberOfLines={2}>
              "{shareText.replace(/\*\*/g, '').slice(0, 100)}..."
            </Text>
          </View>

          {/* Social Platforms Grid */}
          <View style={styles.platformsGrid}>
            {/* WhatsApp */}
            <TouchableOpacity
              onPress={() => handleShareTo('whatsapp')}
              style={[styles.platformCard, isDark && styles.platformCardDark]}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Send size={18} color="#16A34A" />
              </View>
              <Text style={[styles.platformLabel, isDark && styles.platformLabelDark]}>WhatsApp</Text>
            </TouchableOpacity>

            {/* Messages / SMS */}
            <TouchableOpacity
              onPress={() => handleShareTo('sms')}
              style={[styles.platformCard, isDark && styles.platformCardDark]}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#E0E7FF' }]}>
                <MessageCircle size={18} color="#4F46E5" />
              </View>
              <Text style={[styles.platformLabel, isDark && styles.platformLabelDark]}>Messages</Text>
            </TouchableOpacity>

            {/* X / Twitter */}
            <TouchableOpacity
              onPress={() => handleShareTo('twitter')}
              style={[styles.platformCard, isDark && styles.platformCardDark]}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>𝕏</Text>
              </View>
              <Text style={[styles.platformLabel, isDark && styles.platformLabelDark]}>X (Twitter)</Text>
            </TouchableOpacity>

            {/* Telegram */}
            <TouchableOpacity
              onPress={() => handleShareTo('telegram')}
              style={[styles.platformCard, isDark && styles.platformCardDark]}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Send size={18} color="#0284C7" />
              </View>
              <Text style={[styles.platformLabel, isDark && styles.platformLabelDark]}>Telegram</Text>
            </TouchableOpacity>

            {/* Email / Gmail */}
            <TouchableOpacity
              onPress={() => handleShareTo('email')}
              style={[styles.platformCard, isDark && styles.platformCardDark]}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Mail size={18} color="#EA4335" />
              </View>
              <Text style={[styles.platformLabel, isDark && styles.platformLabelDark]}>Email</Text>
            </TouchableOpacity>

            {/* LinkedIn */}
            <TouchableOpacity
              onPress={() => handleShareTo('linkedin')}
              style={[styles.platformCard, isDark && styles.platformCardDark]}
              activeOpacity={0.8}
            >
              <View style={[styles.platformIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Globe size={18} color="#0A66C2" />
              </View>
              <Text style={[styles.platformLabel, isDark && styles.platformLabelDark]}>LinkedIn</Text>
            </TouchableOpacity>
          </View>

          {/* Copy Link Action Button */}
          <TouchableOpacity
            onPress={() => handleShareTo('copy')}
            style={[styles.copyBtn, copied && styles.copyBtnSuccess, isDark && styles.copyBtnDark]}
            activeOpacity={0.85}
          >
            {copied ? <Check size={16} color="#16A34A" /> : <Copy size={16} color="#2554EB" />}
            <Text style={[styles.copyBtnText, copied && { color: '#16A34A' }]}>
              {copied ? 'Copied to Clipboard!' : 'Copy Direct Link'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleDark: {
    backgroundColor: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
  },
  headerTitleDark: {
    color: '#F8FAFC',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewBoxDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  previewText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  previewTextDark: {
    color: '#94A3B8',
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  platformCard: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  platformCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  platformIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'Plus Jakarta Sans',
  },
  platformLabelDark: {
    color: '#CBD5E1',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  copyBtnSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2554EB',
    fontFamily: 'Plus Jakarta Sans',
  },
});
