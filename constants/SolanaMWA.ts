import { Platform } from 'react-native';

export type MWACallback<T> = (wallet: any) => Promise<T>;

/**
 * Safely invokes Solana Mobile Wallet Adapter transact() if available in native runtime.
 * Falls back gracefully with a user-friendly error message if running in Expo Go, web, or iOS.
 */
export async function safeTransact<T>(callback: MWACallback<T>): Promise<T> {
  if (Platform.OS !== 'android') {
    throw new Error('Solana Mobile Wallet Adapter is only supported on Android native devices.');
  }

  try {
    // Dynamic import to avoid top-level TurboModule evaluation crash in Expo Go / Web
    const mwa = require('@solana-mobile/mobile-wallet-adapter-protocol');
    if (mwa && typeof mwa.transact === 'function') {
      return await mwa.transact(callback);
    }
  } catch (err: any) {
    console.warn('[SolanaMWA] Native Mobile Wallet Adapter is not linked in this runtime:', err?.message);
    throw new Error(
      'External Solana Mobile Wallet Adapter requires a native build (npx expo run:android). Please use your embedded Privy wallet in Expo Go.'
    );
  }

  throw new Error('Solana Mobile Wallet Adapter could not be loaded.');
}
