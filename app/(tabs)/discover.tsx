import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { DiscoverTab } from '@/components/Discover/DiscoverTab';
import { FreelancerProfilePage } from '@/components/Profile/FreelancerProfilePage';

export default function DiscoverScreen() {
  const {
    viewingProfile,
    closeProfile,
    setIsWalletModalOpen,
    setIsNotificationsOpen,
    setIsSettingsModalOpen,
    isDark
  } = useApp();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, isDark && styles.safeAreaDark]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Navbar
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      <View style={styles.content}>
        {viewingProfile ? (
          <FreelancerProfilePage
            profile={viewingProfile}
            onBack={closeProfile}
          />
        ) : (
          <DiscoverTab />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  safeAreaDark: {
    backgroundColor: '#090D16',
  },
  content: {
    flex: 1,
  },
});
