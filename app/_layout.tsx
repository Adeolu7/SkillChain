import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { PrivyProvider, useEmbeddedEthereumWallet, useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Image, Platform, Text, View } from "react-native";
import { supabase } from '@/constants/Supabase';
import { AppProvider, useApp } from "@/context/AppContext";
import { SplashScreen } from "@/components/Splash/SplashScreen";
import { ToastContainer } from "@/components/Toast";
import { NotificationsModal } from "@/components/Notifications/NotificationsModal";
import { SearchModal } from "@/components/Search/SearchModal";
import { CreatePostModal } from "@/components/Home/CreatePostModal";
import { PhantomWalletModal } from "@/components/Wallet/PhantomWalletModal";
import { BookmarkedJobsModal } from "@/components/Profile/BookmarkedJobsModal";
import { AuthModal } from "@/components/Auth/AuthModal";
import { OnboardingModal } from "@/components/Auth/OnboardingModal";

function AuthStateListener() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isReady, error } = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();
  const ethereumWallet = useEmbeddedEthereumWallet();
  const {
    isSplashVisible,
    setIsOnboardingModalOpen,
    isOnboarded,
    isAuthenticated,
    currentUser,
    setCurrentUser
  } = useApp();

  const hasPromptedOnboardingRef = useRef(false);

  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[AuthStateListener] Error checking profile:', error);
          return;
        }

        const emailAccount = user.linked_accounts?.find((acc: any) => acc.type === 'email' || (acc as any).email) as any;
        const emailAddress = emailAccount?.address || emailAccount?.email || (user as any)?.email || '';
        const defaultName = emailAddress ? emailAddress.split('@')[0] : 'SkillChain User';

        if (!data) {
          console.log('[AuthStateListener] New user detected. Creating initial profile...');
          const newProfile = {
            id: user.id,
            email: emailAddress,
            full_name: defaultName,
            skills: [],
            work_experience: [],
            education: [],
            certifications: [],
            solana_address: null,
            ethereum_address: null,
          };

          await supabase.from('profile').insert(newProfile);

          if (!hasPromptedOnboardingRef.current) {
            hasPromptedOnboardingRef.current = true;
            setIsOnboardingModalOpen(true);
          }
        } else {
          // Check if profile has been customized/onboarded
          const isComplete = Boolean(
            data.skills && data.skills.length > 0 &&
            data.full_name && data.full_name !== 'SkillChain User'
          );

          if (!isComplete && !isOnboarded && !hasPromptedOnboardingRef.current) {
            console.log('[AuthStateListener] Incomplete profile. Opening onboarding wizard...');
            hasPromptedOnboardingRef.current = true;
            setIsOnboardingModalOpen(true);
          }
        }
      } catch (profileErr) {
        console.error('[AuthStateListener] Profile sync exception:', profileErr);
      }
    };

    if (isReady && user) {
      syncProfile();
    }
  }, [user, isReady, isOnboarded]);

  useEffect(() => {
    // Wait until the splash screen finishes before performing navigation
    if (isSplashVisible || !isReady) return;

    const isUserLoggedIn = !!user || isAuthenticated;
    const inAuthGroup = segments[0] === "(auth)";
    const atRoot = (segments as string[]).length === 0;

    // Auto-create embedded wallets for new logged-in users
    if (user) {
      const accounts = user.linked_accounts || [];
      const hasSolana = accounts.some((a: any) => a.chain_type === 'solana' && a.wallet_client_type === 'privy');
      const hasEthereum = accounts.some((a: any) => a.chain_type === 'ethereum' && a.wallet_client_type === 'privy');

      if (!hasSolana && solanaWallet?.create) {
        solanaWallet.create().catch((e: any) => {
          if (!e?.message?.includes('already exists')) {
            console.warn('[AuthStateListener] Auto-wallet (SOL) notice:', e?.message);
          }
        });
      }

      if (!hasEthereum && ethereumWallet?.create) {
        ethereumWallet.create().catch((e: any) => {
          if (!e?.message?.includes('already exists')) {
            console.warn('[AuthStateListener] Auto-wallet (ETH) notice:', e?.message);
          }
        });
      }
    }

    if (isUserLoggedIn) {
      if (atRoot || inAuthGroup) {
        console.log('[AuthStateListener] Access verified -> Entering main app (tabs)');
        router.replace("/(tabs)");
      }

      // If new user who hasn't completed onboarding wizard
      if (!isOnboarded && !hasPromptedOnboardingRef.current) {
        hasPromptedOnboardingRef.current = true;
        setIsOnboardingModalOpen(true);
      }
    } else {
      if (!inAuthGroup) {
        console.log('[AuthStateListener] Unauthenticated -> Routing to login page');
        router.replace("/(auth)/login");
      }
    }
  }, [user, isAuthenticated, isOnboarded, isReady, isSplashVisible, segments]);

  return null;
}

import { SettingsModal } from "@/components/Settings/SettingsModal";
import { ShareModal } from "@/components/Common/ShareModal";

function GlobalModalsContainer() {
  const {
    isSplashVisible,
    setIsSplashVisible,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isShareModalOpen,
    closeShareModal,
    shareModalData,
  } = useApp();

  return (
    <>
      {isSplashVisible && (
        <SplashScreen onComplete={() => setIsSplashVisible(false)} />
      )}
      <AuthModal />
      <OnboardingModal />
      <BookmarkedJobsModal />
      {isNotificationsOpen && (
        <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
      )}
      {isSearchModalOpen && (
        <SearchModal onClose={() => setIsSearchModalOpen(false)} />
      )}
      {isCreatePostModalOpen && (
        <CreatePostModal onClose={() => setIsCreatePostModalOpen(false)} />
      )}
      {isWalletModalOpen && (
        <PhantomWalletModal onClose={() => setIsWalletModalOpen(false)} />
      )}
      {isSettingsModalOpen && (
        <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
      )}
      {isShareModalOpen && shareModalData && (
        <ShareModal
          visible={isShareModalOpen}
          onClose={closeShareModal}
          title={shareModalData.title}
          shareText={shareModalData.shareText}
          shareUrl={shareModalData.shareUrl}
        />
      )}
      <ToastContainer />
    </>
  );
}

function RootNavStack() {
  const { isDark } = useApp();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? '#0B0F19' : '#FAF9F5' },
        }}
      />
      <GlobalModalsContainer />
    </>
  );
}

export default function RootLayout() {
  const appId = process.env.EXPO_PUBLIC_PRIVY_APP_ID || process.env.APP_ID || "cmq2sufsw003m0cjxuhitaxit";
  const clientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || process.env.CLIENT_ID || "client-WY6aF74za3gZXo7hWDUnwEyy13oUfR9mkFPqFpY9mDRE8";
  const isWeb = Platform.OS === 'web';

  if (!appId || !clientId) {
    console.error('[RootLayout] Privy App ID or Client ID is MISSING from .env');
  }

  console.log('[RootLayout] Initializing with package com.skillchain.app:', { 
    appId: appId ? `${appId.substring(0, 5)}...` : 'MISSING', 
    clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
    platform: Platform.OS,
    isWeb 
  });

  if (isWeb) {
    return (
      <AppProvider>
        <RootNavStack />
      </AppProvider>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        embedded: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
      } as any}
    >
      <AppProvider>
        <AuthStateListener />
        <RootNavStack />
      </AppProvider>
    </PrivyProvider>
  );
}

