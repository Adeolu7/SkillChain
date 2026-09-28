import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonPulse: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 6,
  style
}) => {
  return (
    <View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height: height as any,
          borderRadius
        },
        style
      ]}
      {...({ className: 'skeleton-pulse' } as any)}
    />
  );
};

export const PostCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View style={styles.postCard}>
            {/* Header row */}
            <View style={styles.headerRow}>
              <SkeletonPulse width={36} height={36} borderRadius={18} />
              <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
                <SkeletonPulse width="45%" height={12} borderRadius={4} />
                <SkeletonPulse width="30%" height={10} borderRadius={4} />
              </View>
              <SkeletonPulse width={36} height={10} borderRadius={4} />
            </View>

            {/* Body lines */}
            <View style={{ gap: 5, marginTop: 8 }}>
              <SkeletonPulse width="92%" height={11} borderRadius={4} />
              <SkeletonPulse width="68%" height={11} borderRadius={4} />
            </View>

            {/* Hashtags */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <SkeletonPulse width={60} height={18} borderRadius={10} />
              <SkeletonPulse width={50} height={18} borderRadius={10} />
            </View>

            {/* Media box */}
            <SkeletonPulse width="100%" height={155} borderRadius={12} style={{ marginTop: 8 }} />

            {/* Footer action bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 4 }}>
              <SkeletonPulse width={40} height={12} borderRadius={4} />
              <SkeletonPulse width={40} height={12} borderRadius={4} />
              <SkeletonPulse width={40} height={12} borderRadius={4} />
              <SkeletonPulse width={24} height={12} borderRadius={4} />
            </View>
          </View>
        </React.Fragment>
      ))}
    </>
  );
};

export const TalentCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <View style={styles.talentCard}>
            {/* Header */}
            <View style={styles.headerRow}>
              <SkeletonPulse width={36} height={36} borderRadius={18} />
              <View style={{ flex: 1, gap: 3, justifyContent: 'center' }}>
                <SkeletonPulse width="45%" height={12} borderRadius={4} />
                <SkeletonPulse width="65%" height={9} borderRadius={3} />
              </View>
            </View>

            {/* Metrics Pills */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <SkeletonPulse width={58} height={18} borderRadius={6} />
              <SkeletonPulse width={110} height={18} borderRadius={6} />
            </View>

            {/* Skill chips */}
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <SkeletonPulse width={48} height={18} borderRadius={6} />
              <SkeletonPulse width={54} height={18} borderRadius={6} />
              <SkeletonPulse width={44} height={18} borderRadius={6} />
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
              <SkeletonPulse width="48%" height={26} borderRadius={8} />
              <SkeletonPulse width="48%" height={26} borderRadius={8} />
            </View>
          </View>
        </React.Fragment>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  talentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
