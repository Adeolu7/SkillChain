import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  badge?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  badge,
  compact = false
}) => {
  const { isDark } = useApp();

  return (
    <View style={[styles.container, compact && styles.containerCompact, isDark && styles.containerDark]}>
      {badge && (
        <View style={[styles.badge, isDark && styles.badgeDark]}>
          <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>{badge}</Text>
        </View>
      )}

      <View style={[styles.iconBox, compact && styles.iconBoxCompact, isDark && styles.iconBoxDark]}>
        <Icon size={compact ? 24 : 32} color={isDark ? '#60A5FA' : '#2554EB'} strokeWidth={1.8} />
      </View>

      <Text style={[styles.title, compact && styles.titleCompact, isDark && styles.titleDark]}>
        {title}
      </Text>

      <Text style={[styles.description, compact && styles.descriptionCompact, isDark && styles.descriptionDark]}>
        {description}
      </Text>

      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsRow}>
          {actionLabel && onAction && (
            <TouchableOpacity
              style={[styles.actionBtn, isDark && styles.actionBtnDark]}
              onPress={onAction}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <TouchableOpacity
              style={[styles.secondaryActionBtn, isDark && styles.secondaryActionBtnDark]}
              onPress={onSecondaryAction}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryActionBtnText, isDark && styles.secondaryActionBtnTextDark]}>
                {secondaryActionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    textAlign: 'center',
  },
  containerCompact: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
  },
  containerDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badgeDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2554EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextDark: {
    color: '#60A5FA',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  iconBoxCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  iconBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 14,
    marginBottom: 4,
  },
  titleDark: {
    color: '#F8FAFC',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginBottom: 4,
  },
  descriptionCompact: {
    fontSize: 12,
    maxWidth: 280,
    lineHeight: 16,
  },
  descriptionDark: {
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#2554EB',
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionBtnDark: {
    backgroundColor: '#3B82F6',
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryActionBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  secondaryActionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  secondaryActionBtnTextDark: {
    color: '#CBD5E1',
  },
});
