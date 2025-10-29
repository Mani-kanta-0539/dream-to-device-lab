// Simple in-memory cache for AI responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const cache = new Cache();

// Helper to generate cache keys
export const generateCacheKey = (...parts: (string | number | boolean)[]): string => {
  return parts.join(':');
};
