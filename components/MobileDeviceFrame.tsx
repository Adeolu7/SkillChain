import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Smartphone, Monitor, Wifi, Battery, Signal, Zap } from 'lucide-react-native';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  activeTab: string;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children, activeTab }) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<'iphone' | 'android' | 'fullscreen'>('iphone');

  if (deviceFrameMode === 'fullscreen') {
    return (
      <View style={styles.fullscreenContainer}>
        {/* Floating Device Controls Bar */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setDeviceFrameMode('iphone')}
          >
            <Smartphone size={14} color="#00E5FF" />
            <Text style={styles.controlBtnText}>Frame View</Text>
          </TouchableOpacity>
        </View>
        <SafeAreaView style={styles.fullscreenBody}>
          {children}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerWrapper}>
      
      {/* Top Device Switcher Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <View style={styles.expoBadge}>
            <Zap size={12} color="#00E5FF" />
            <Text style={styles.expoBadgeText}>EXPO GO • REACT NATIVE</Text>
          </View>
        </View>

        <View style={styles.toolbarRight}>
          <TouchableOpacity
            onPress={() => setDeviceFrameMode('iphone')}
            style={[styles.deviceToggleBtn, deviceFrameMode === 'iphone' && styles.deviceToggleActive]}
          >
            <Smartphone size={14} color={deviceFrameMode === 'iphone' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.deviceToggleText, deviceFrameMode === 'iphone' && styles.deviceToggleTextActive]}>
              iOS iPhone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeviceFrameMode('android')}
            style={[styles.deviceToggleBtn, deviceFrameMode === 'android' && styles.deviceToggleActive]}
          >
            <Smartphone size={14} color={deviceFrameMode === 'android' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.deviceToggleText, deviceFrameMode === 'android' && styles.deviceToggleTextActive]}>
              Android
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeviceFrameMode('fullscreen')}
            style={styles.deviceToggleBtn}
          >
            <Monitor size={14} color="#94A3B8" />
            <Text style={styles.deviceToggleText}>Full Canvas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Device Bezel Container */}
      <View style={styles.deviceMockup}>
        {/* Phone Shell */}
        <View style={[styles.phoneShell, deviceFrameMode === 'iphone' ? styles.iphoneShell : styles.androidShell]}>
          
          {/* Dynamic Island / Camera Notch */}
          {deviceFrameMode === 'iphone' ? (
            <View style={styles.dynamicIsland}>
              <View style={styles.cameraLens} />
              <View style={styles.sensorDot} />
            </View>
          ) : (
            <View style={styles.androidPinchHole} />
          )}

          {/* Status Bar matching the attached image */}
          <View style={styles.statusBar}>
            <Text style={styles.statusBarTime}>08:44 AM</Text>
            <View style={styles.statusBarIcons}>
              <Signal size={13} color="#0F172A" style={{ marginRight: 5 }} />
              <Wifi size={13} color="#0F172A" style={{ marginRight: 5 }} />
              <Battery size={15} color="#0F172A" />
            </View>
          </View>

          {/* App Screen Content View */}
          <View style={styles.appScreen}>
            {children}
          </View>

          {/* iOS Bottom Home Indicator Bar */}
          {deviceFrameMode === 'iphone' && (
            <View style={styles.homeIndicatorWrapper}>
              <View style={styles.homeIndicator} />
            </View>
          )}

        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#0B0C0E',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    minHeight: '100vh' as any,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  fullscreenBody: {
    flex: 1,
  },
  floatingControls: {
    position: 'absolute' as any,
    top: 12,
    right: 16,
    zIndex: 9999,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(27, 30, 34, 0.9)',
    borderColor: '#2554EB',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  controlBtnText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  toolbar: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  expoBadgeText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1B1E22',
    borderColor: '#2D3239',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deviceToggleActive: {
    backgroundColor: '#2554EB',
    borderColor: '#3B82F6',
  },
  deviceToggleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  deviceToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deviceMockup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneShell: {
    width: 410,
    height: 850,
    maxHeight: '88vh' as any,
    backgroundColor: '#FAF9F5',
    borderRadius: 48,
    borderWidth: 10,
    borderColor: '#272B30',
    overflow: 'hidden',
    position: 'relative' as any,
    shadowColor: '#2554EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  iphoneShell: {
    borderColor: '#2A2E35',
  },
  androidShell: {
    borderColor: '#1E2228',
    borderRadius: 36,
  },
  dynamicIsland: {
    position: 'absolute' as any,
    top: 8,
    alignSelf: 'center',
    width: 110,
    height: 28,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sensorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#064E3B',
  },
  androidPinchHole: {
    position: 'absolute' as any,
    top: 10,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: '#0F172A',
    borderRadius: 7,
    zIndex: 999,
  },
  statusBar: {
    height: 44,
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F5',
    zIndex: 900,
  },
  statusBarTime: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appScreen: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  homeIndicatorWrapper: {
    height: 18,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 130,
    height: 4,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
});
