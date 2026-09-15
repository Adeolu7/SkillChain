import React from 'react';
import { Tabs } from 'expo-router';
import { NavigationTabs } from '@/components/NavigationTabs';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => <NavigationTabs />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="jobs" options={{ title: 'Jobs' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
