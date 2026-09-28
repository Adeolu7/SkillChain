import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Shield, Sparkles, Cpu, Zap, Lock } from 'lucide-react-native';

interface SplashScreenProps {
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

// 8 Orbital & Constellation Nodes for the SkillChain Matrix
const CONSTELLATION_NODES = [
  { id: 0, x: -75, y: -75, color: '#00F0FF', delay: 200, label: 'AUTH' },
  { id: 1, x: 0, y: -105, color: '#8B5CF6', delay: 350, label: 'SOL' },
  { id: 2, x: 75, y: -75, color: '#00F0FF', delay: 500, label: 'ZK' },
  { id: 3, x: 105, y: 0, color: '#EC4899', delay: 650, label: 'GIGS' },
  { id: 4, x: 75, y: 75, color: '#00F0FF', delay: 800, label: 'ESCROW' },
  { id: 5, x: 0, y: 105, color: '#10B981', delay: 950, label: 'CRED' },
  { id: 6, x: -75, y: 75, color: '#00F0FF', delay: 1100, label: 'DAO' },
  { id: 7, x: -105, y: 0, color: '#8B5CF6', delay: 1250, label: 'ID' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Shared Animation Values
  const masterOpacity = useSharedValue(1);
  const coreScale = useSharedValue(0.4);
  const coreRotation = useSharedValue(0);
  const orbitRotation1 = useSharedValue(0);
  const orbitRotation2 = useSharedValue(0);
  const auraPulse = useSharedValue(0.6);
  const shockwave = useSharedValue(0);
  const titleTranslateY = useSharedValue(25);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    // 1. Core Shield Pop & Float
    coreScale.value = withSpring(1, { damping: 10, stiffness: 80 });

    // 2. Orbital Gyroscope Rotations (Dual-direction)
    orbitRotation1.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
    orbitRotation2.value = withRepeat(
      withTiming(-360, { duration: 16000, easing: Easing.linear }),
      -1,
      false
    );

    // 3. Continuous Reactor Breathing & Shockwave
    auraPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.75, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    shockwave.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );

    // 4. Staggered Typography Reveal
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 700 }));
    titleTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // 5. Progress Bar
    progress.value = withTiming(1, { duration: 2400, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });

    // 6. Auto-exit timer
    const exitTimer = setTimeout(() => {
      handleExit();
    }, 2700);

    return () => clearTimeout(exitTimer);
  }, []);

  const handleExit = () => {
    masterOpacity.value = withTiming(
      0,
      { duration: 400, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }
    );
  };

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: masterOpacity.value,
  }));

  const coreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));

  const orbit1AnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation1.value}deg` }],
  }));

  const orbit2AnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation2.value}deg` }],
  }));

  const auraAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraPulse.value }],
    opacity: interpolate(auraPulse.value, [0.75, 1.15], [0.4, 0.85]),
  }));

  const shockwaveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(shockwave.value, [0, 1], [0.8, 1.9]) }],
    opacity: interpolate(shockwave.value, [0, 0.7, 1], [0.8, 0.3, 0], Extrapolation.CLAMP),
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#040711" />

      {/* Cyberpunk Nebula Ambient Light Fields */}
      <View style={styles.nebulaCyan} />
      <View style={styles.nebulaPurple} />
      <View style={styles.gridOverlay} />

      {/* Main Visual Center Stage */}
      <View style={styles.stage}>
        {/* Shockwave Energy Ring */}
        <Animated.View style={[styles.shockwaveRing, shockwaveAnimStyle]} />

        {/* Reactor Core Glow Field */}
        <Animated.View style={[styles.reactorAura, auraAnimStyle]} />

        {/* Outer Laser Orbit Ring 1 */}
        <Animated.View style={[styles.orbitRingOuter, orbit1AnimStyle]}>
          <View style={[styles.orbitParticle, { top: -4, left: '50%', backgroundColor: '#00F0FF' }]} />
          <View style={[styles.orbitParticle, { bottom: -4, left: '50%', backgroundColor: '#EC4899' }]} />
        </Animated.View>

        {/* Inner Laser Orbit Ring 2 */}
        <Animated.View style={[styles.orbitRingInner, orbit2AnimStyle]}>
          <View style={[styles.orbitParticle, { left: -4, top: '50%', backgroundColor: '#8B5CF6' }]} />
          <View style={[styles.orbitParticle, { right: -4, top: '50%', backgroundColor: '#10B981' }]} />
        </Animated.View>

        {/* Constellation Circuit Nodes */}
        <View style={styles.constellationContainer}>
          {CONSTELLATION_NODES.map((node) => (
            <ConstellationNode key={node.id} node={node} />
          ))}
        </View>

        {/* Central Futuristic Crystal Shield */}
        <Animated.View style={[styles.coreShieldWrapper, coreAnimStyle]}>
          <View style={styles.coreShieldBacking}>
            <View style={styles.shieldInnerBevel}>
              <View style={styles.shieldGlowIcon}>
                <Shield size={36} color="#00F0FF" strokeWidth={2.4} />
                <View style={styles.miniSparkle}>
                  <Zap size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Luminous Brand Typography */}
        <Animated.View style={[styles.brandWrapper, titleAnimStyle]}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTextPrimary}>SKILL</Text>
            <Text style={styles.brandTextAccent}>CHAIN</Text>
          </View>
          <View style={styles.brandUnderlineGlow} />
        </Animated.View>

        {/* Verified Protocol Tagline Badge */}
        <Animated.View style={[styles.badgeWrapper, subtitleAnimStyle]}>
          <View style={styles.protocolBadge}>
            <Cpu size={12} color="#00F0FF" />
            <Text style={styles.badgeText}>DECENTRALIZED TALENT PROTOCOL</Text>
            <Sparkles size={12} color="#EC4899" />
          </View>
        </Animated.View>
      </View>

      {/* Bottom Progress & Skip Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressAnimStyle]} />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleExit}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>ENTER APP  →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Sub-component for individual matrix nodes
const ConstellationNode: React.FC<{ node: typeof CONSTELLATION_NODES[0] }> = ({ node }) => {
  const nodeScale = useSharedValue(0);
  const nodeGlow = useSharedValue(0.3);

  useEffect(() => {
    nodeScale.value = withDelay(
      node.delay,
      withSpring(1, { damping: 10, stiffness: 140 })
    );
    nodeGlow.value = withDelay(
      node.delay + 300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.4, { duration: 800 })
        ),
        -1,
        true
      )
    );
  }, [node]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: node.x },
      { translateY: node.y },
      { scale: nodeScale.value },
    ],
    opacity: nodeGlow.value,
  }));

  return (
    <Animated.View
      style={[
        styles.matrixNode,
        {
          backgroundColor: node.color,
          shadowColor: node.color,
        },
        style,
      ]}
    >
      <View style={styles.matrixNodeCenter} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999999,
    backgroundColor: '#040711',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 55,
  },
  nebulaCyan: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  nebulaPurple: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: (width * 1.3) / 2,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.015)',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  shockwaveRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: '#00F0FF',
  },
  reactorAura: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 240, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  orbitRingOuter: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 240, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitRingInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  constellationContainer: {
    position: 'absolute',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixNode: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  matrixNodeCenter: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  coreShieldWrapper: {
    width: 86,
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 16,
  },
  coreShieldBacking: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: '#090E1F',
    borderWidth: 2,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shieldInnerBevel: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#0D152F',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldGlowIcon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSparkle: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    padding: 1,
  },
  brandWrapper: {
    marginTop: 34,
    alignItems: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextPrimary: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTextAccent: {
    color: '#00F0FF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandUnderlineGlow: {
    marginTop: 6,
    width: 60,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  badgeWrapper: {
    marginTop: 14,
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(9, 14, 31, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.28)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 24,
  },
  badgeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  bottomBar: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  progressTrack: {
    width: 150,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
    borderRadius: 2,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  skipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});
