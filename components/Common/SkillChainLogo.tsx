import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SkillChainLogoProps {
  size?: number;
  style?: any;
}

export const SkillChainLogo: React.FC<SkillChainLogoProps> = ({ size = 64, style }) => (
  <View style={[styles.container, { width: size, height: size }, style]}>
    <Text style={[styles.mark, { fontSize: size * 0.5 }]}>S</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3DE8F0',
    backgroundColor: '#0D0D1C',
  },
  mark: {
    color: '#E63DE0',
    fontWeight: '800',
  },
});