import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SplashScreenProps {
  onComplete: () => void;
}

const nodes = [
  { left: '50%', top: '8%', color: '#3DE8F0' },
  { left: '68%', top: '22%', color: '#E63DE0' },
  { left: '40%', top: '36%', color: '#3DE8F0' },
  { left: '50%', top: '50%', color: '#E63DE0' },
  { left: '60%', top: '64%', color: '#3DE8F0' },
  { left: '32%', top: '78%', color: '#E63DE0' },
  { left: '50%', top: '92%', color: '#3DE8F0' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.overlay}>
      <View style={styles.network}>
        {nodes.map((node, index) => (
          <View key={index} style={[styles.node, { left: node.left as any, top: node.top as any, backgroundColor: node.color, shadowColor: node.color }]} />
        ))}
        <View style={styles.traceVertical} />
      </View>
      <Text style={styles.wordmark}>SkillChain</Text>
      <Text style={styles.subtitle}>VERIFIED WEB3 TALENT NETWORK</Text>
      <Text onPress={onComplete} style={styles.skip}>TAP TO SKIP  {'->'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: '#0A0A14', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  network: { width: 190, height: 260, position: 'relative', marginBottom: 28 },
  traceVertical: { position: 'absolute', left: '49%', top: '8%', bottom: '8%', width: 2, backgroundColor: '#22294A' },
  node: { position: 'absolute', marginLeft: -9, marginTop: -9, width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: '#FFFFFF', shadowOpacity: 0.8, shadowRadius: 10, elevation: 8 },
  wordmark: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: '#64748B', fontSize: 11, fontWeight: '600', letterSpacing: 1.2, marginTop: 10 },
  skip: { position: 'absolute', bottom: 32, color: '#64748B', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
});
