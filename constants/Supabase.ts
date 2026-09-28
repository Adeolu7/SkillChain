import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

class MemoryStorage {
  private store: { [key: string]: string } = {};

  async getItem(key: string): Promise<string | null> {
    return this.store[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.store[key];
  }
}

const getSafeStorage = () => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return new MemoryStorage();
    }
    return {
      getItem: async (key: string) => {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {}
      },
      removeItem: async (key: string) => {
        try {
          window.localStorage.removeItem(key);
        } catch {}
      },
    };
  }
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch {
    return new MemoryStorage();
  }
};

const supabaseUrl = 'https://vxcsynseoynjadkxoqib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Y3N5bnNlb3luamFka3hvcWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDExODQsImV4cCI6MjA5NDkxNzE4NH0.nchA42AMreFLbK-Kl6wWZC2y1VSSNUS0KvDpHeKNPnU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
