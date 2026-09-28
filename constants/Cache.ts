import AsyncStorage from '@react-native-async-storage/async-storage';

export const Cache = {
  /**
   * Gets cached data. If none exists, returns null.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`sc_cache_${key}`);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (e) {
      console.error(`[Cache] Error reading key ${key}:`, e);
    }
    return null;
  },

  /**
   * Saves data to the cache.
   */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`sc_cache_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`[Cache] Error writing key ${key}:`, e);
    }
  },

  /**
   * Fetches data with SWR (Stale-While-Revalidate) pattern.
   * 1. Returns cached data immediately if available.
   * 2. Runs the fetch function in the background.
   * 3. Compares backend data with cached data.
   * 4. If backend data is different, calls onUpdate callback and updates cache.
   * 5. Calls onComplete to signify loading is finished.
   */
  async fetchWithSWR<T>(
    key: string,
    fetchFn: () => Promise<T>,
    onUpdate: (data: T) => void,
    onComplete?: () => void
  ): Promise<void> {
    // 1. Get cached data immediately
    const cachedData = await this.get<T>(key);
    if (cachedData !== null) {
      onUpdate(cachedData);
    }

    // 2. Fetch fresh data in the background
    try {
      const freshData = await fetchFn();
      
      // Compare fresh data with cached data
      const cachedString = cachedData !== null ? JSON.stringify(cachedData) : null;
      const freshString = JSON.stringify(freshData);

      if (cachedString !== freshString) {
        // Data has changed! Update cache and call onUpdate
        await this.set(key, freshData);
        onUpdate(freshData);
      }
    } catch (e) {
      console.error(`[Cache] Background fetch failed for ${key}:`, e);
    } finally {
      if (onComplete) {
        onComplete();
      }
    }
  }
};
