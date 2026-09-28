import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import {
  Search,
  Wallet,
  Bell,
  Bookmark,
  Settings,
  Sun,
  Moon
} from 'lucide-react-native';

interface NavbarProps {
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWallet,
  onOpenNotifications,
  onOpenSettings
}) => {
  const {
    activeTab,
    setActiveTab,
    unreadNotifsCount,
    setIsNotificationsOpen,
    setIsSearchModalOpen,
    setIsWalletModalOpen,
    setIsBookmarkedJobsModalOpen,
    activeCommunityId,
    viewingProfile,
    isDark,
    toggleDarkMode
  } = useApp();

  // Hide the global Navbar in chat, community group chats, or when viewing a profile to avoid double headers
  if (activeCommunityId || viewingProfile || activeTab === 'chat') {
    return null;
  }

  return (
    <View style={[styles.headerBar, isDark && styles.headerBarDark]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        
        {/* Brand / Screen Title */}
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
          style={styles.logoTouch}
        >
          {activeTab === 'discover' ? (
            <Text style={[styles.brandText, isDark && styles.brandTextDark]}>Discover talent</Text>
          ) : activeTab === 'jobs' ? (
            <Text style={[styles.brandText, isDark && styles.brandTextDark]}>Gigs Marketplace</Text>
          ) : (
            <Text style={[styles.brandText, isDark && styles.brandTextDark]}>SkillChain</Text>
          )}
        </TouchableOpacity>

        {/* Right Header Action Icons */}
        {activeTab === 'profile' ? (
          <View style={styles.rightActions}>
            {/* 1. Wallet Icon */}
            <TouchableOpacity
              onPress={() => setIsWalletModalOpen(true)}
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              activeOpacity={0.7}
            >
              <Wallet size={17} color={isDark ? '#E2E8F0' : '#1E293B'} />
            </TouchableOpacity>

            {/* 2. Bookmark Icon */}
            <TouchableOpacity
              onPress={() => setIsBookmarkedJobsModalOpen(true)}
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              activeOpacity={0.7}
            >
              <Bookmark size={18} color={isDark ? '#F8FAFC' : '#1E293B'} strokeWidth={2} />
            </TouchableOpacity>

            {/* 3. Settings Icon */}
            <TouchableOpacity
              onPress={onOpenSettings}
              style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
              activeOpacity={0.7}
            >
              <Settings size={18} color={isDark ? '#F8FAFC' : '#1E293B'} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ) : (
          activeTab !== 'chat' && (
            <View style={styles.rightActions}>
              {/* 1. Search Icon */}
              <TouchableOpacity
                onPress={() => setIsSearchModalOpen(true)}
                style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
                activeOpacity={0.7}
              >
                <Search size={17} color={isDark ? '#E2E8F0' : '#1E293B'} />
              </TouchableOpacity>

              {/* 2. Wallet Icon */}
              <TouchableOpacity
                onPress={() => setIsWalletModalOpen(true)}
                style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
                activeOpacity={0.7}
              >
                <Wallet size={17} color={isDark ? '#E2E8F0' : '#1E293B'} />
              </TouchableOpacity>

              {/* 3. Bell Notification Icon */}
              <TouchableOpacity
                onPress={() => setIsNotificationsOpen(true)}
                style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
                activeOpacity={0.7}
              >
                <Bell size={18} color={isDark ? '#E2E8F0' : '#1E293B'} />
                {unreadNotifsCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>
                      {unreadNotifsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )
        )}

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerBarDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  logoTouch: {
    paddingVertical: 2,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    fontFamily: 'Plus Jakarta Sans',
  },
  brandTextDark: {
    color: '#F8FAFC',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnDark: {
    backgroundColor: 'transparent',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 15,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3.5,
    zIndex: 2,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
    textAlign: 'center',
    lineHeight: 11,
  },
});
