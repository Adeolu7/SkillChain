import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import {
  Home,
  Compass,
  Briefcase,
  MessageSquare
} from 'lucide-react-native';

const ViewKey = View as any;

export const NavigationTabs: React.FC = () => {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    conversations,
    currentUser,
    isDark,
    closeProfile,
    viewingProfile,
    activeCommunityId
  } = useApp();

  // Hide tab bar when viewing full screen modals/pages
  if (viewingProfile || activeCommunityId) {
    return null;
  }

  const totalUnreadChat = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const tabs = [
    { id: 'home', route: '/(tabs)', label: 'Home', icon: Home },
    { id: 'discover', route: '/(tabs)/discover', label: 'Discover', icon: Compass },
    { id: 'jobs', route: '/(tabs)/jobs', label: 'Jobs', icon: Briefcase },
    { id: 'chat', route: '/(tabs)/chat', label: 'Chat', icon: MessageSquare, badge: totalUnreadChat },
    { id: 'profile', route: '/(tabs)/profile', label: 'Profile', isProfileCircle: true }
  ];

  const handleTabPress = (tab: typeof tabs[0]) => {
    closeProfile();
    setActiveTab(tab.id);
    router.navigate(tab.route as any);
  };

  return (
    <View style={[styles.tabBarContainer, isDark && styles.tabBarContainerDark]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const activeColor = isDark ? '#38BDF8' : '#2554EB';
        const inactiveColor = isDark ? '#94A3B8' : '#64748B';

        return (
          <ViewKey key={tab.id} style={styles.tabItemWrapper}>
            <Pressable
              onPress={() => handleTabPress(tab)}
              style={styles.tabButton}
            >
              <View style={styles.iconWrapper}>
                {tab.isProfileCircle ? (
                  <View style={[styles.profileCircleIcon, isActive && (isDark ? styles.profileCircleIconActiveDark : styles.profileCircleIconActive)]}>
                    <Image
                      source={{ uri: currentUser.avatar }}
                      style={styles.profileAvatarImage}
                    />
                  </View>
                ) : (
                  <>
                    {tab.icon && <tab.icon size={22} color={isActive ? activeColor : inactiveColor} />}
                    {tab.badge !== undefined && tab.badge > 0 ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{tab.badge}</Text>
                      </View>
                    ) : null}
                  </>
                )}
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? activeColor : inactiveColor }]}>
                {tab.label}
              </Text>
            </Pressable>
          </ViewKey>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    height: 64,
    flexShrink: 0,
    zIndex: 50,
  },
  tabBarContainerDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  tabItemWrapper: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    position: 'relative',
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  profileCircleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  profileCircleIconActive: {
    borderColor: '#2554EB',
    borderWidth: 2,
  },
  profileCircleIconActiveDark: {
    borderColor: '#38BDF8',
    borderWidth: 2,
  },
  profileAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 9999,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 11,
  },
});
