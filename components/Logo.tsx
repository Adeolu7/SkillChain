import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  isDarkTheme?: boolean;
}

export const SkillChainLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  isDarkTheme = false,
}) => {
  const iconSize = typeof size === 'number' ? size : ({ sm: 26, md: 32, lg: 44, xl: 60 }[size] || 32);
  const fontSize = typeof size === 'number' ? Math.max(16, Math.round(size * 0.78)) : ({ sm: 20, md: 25, lg: 30, xl: 38 }[size] || 25);

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }]}>
        <Text style={[styles.iconText, { fontSize: iconSize * 0.55 }]}>S</Text>
      </View>
      {showText && (
        <View style={styles.textRow}>
          <Text style={[styles.brandText, { fontSize, color: isDarkTheme ? '#FFFFFF' : '#0F172A' }]}>Skill</Text>
          <Text style={[styles.brandText, styles.chainText, { fontSize }]}>Chain</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { backgroundColor: '#0D0D1C', borderWidth: 2, borderColor: '#3DE8F0', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#E63DE0', fontWeight: '800' },
  textRow: { flexDirection: 'row', alignItems: 'center' },
  brandText: { fontWeight: '800' },
  chainText: { color: '#2563EB' },
});
