import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "@resilience/cache:";
const CACHE_TTL = 15 * 60 * 1000; // 15 minutos

interface CachePayload<T> {
  timestamp: number;
  data: T;
}

export async function getCachedValue<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as CachePayload<T>;
    if (Date.now() - payload.timestamp > CACHE_TTL) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return payload.data;
  } catch (error) {
    console.warn("cache:get:error", error);
    return null;
  }
}

export async function setCachedValue<T>(key: string, data: T): Promise<void> {
  const payload: CachePayload<T> = {
    timestamp: Date.now(),
    data,
  };

  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (error) {
    console.warn("cache:set:error", error);
  }
}

export async function clearCachedValue(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn("cache:clear:error", error);
  }
}
