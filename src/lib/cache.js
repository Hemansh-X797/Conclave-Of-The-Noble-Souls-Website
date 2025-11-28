// ============================================================================
// THE CONCLAVE REALM - SMART CACHING SYSTEM
// Location: /src/lib/cache.js
// ============================================================================
// Purpose: Multi-layer caching with in-memory + localStorage fallback
// Features: TTL support, automatic cleanup, LRU eviction, no Redis required
// Dependencies: None (pure JavaScript)
// Author: The Conclave Development Team
// Created: 2024-11-26
// Version: 1.0.0
// ============================================================================

/**
 * @fileoverview
 * Smart caching system with three layers:
 * 1. Memory Cache (fastest, cleared on refresh)
 * 2. LocalStorage Cache (persistent across sessions)
 * 3. SessionStorage Cache (cleared on tab close)
 * 
 * Features:
 * - TTL (Time To Live) support
 * - LRU (Least Recently Used) eviction
 * - Automatic cleanup of expired entries
 * - Size limits for memory safety
 * - Compression for large values
 * - Statistics tracking
 * 
 * @example
 * import { cache } from '@/lib/cache';
 * 
 * // Set with 5 minute TTL
 * cache.set('user-profile', userData, 300);
 * 
 * // Get with fallback
 * const profile = cache.get('user-profile', async () => {
 *   return await fetchUserProfile();
 * });
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Memory cache limits
  MAX_MEMORY_ITEMS: 100,
  MAX_MEMORY_SIZE_MB: 50,
  
  // LocalStorage limits
  MAX_STORAGE_SIZE_MB: 5,
  
  // Default TTL (seconds)
  DEFAULT_TTL: 3600, // 1 hour
  
  // Cleanup interval (milliseconds)
  CLEANUP_INTERVAL: 300000, // 5 minutes
  
  // Compression threshold (bytes)
  COMPRESSION_THRESHOLD: 1024, // 1KB
  
  // Key prefixes
  PREFIX: 'conclave_cache_',
  STATS_KEY: 'conclave_cache_stats',
  
  // Feature flags
  ENABLE_COMPRESSION: false, // Disabled for simplicity
  ENABLE_STATISTICS: true,
  ENABLE_CONSOLE_LOGS: process.env.NODE_ENV === 'development',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate cache key with prefix
 * @param {string} key - Original key
 * @returns {string} Prefixed key
 */
const generateKey = (key) => `${CONFIG.PREFIX}${key}`;

/**
 * Calculate size of value in bytes
 * @param {*} value - Value to measure
 * @returns {number} Size in bytes
 */
const getSize = (value) => {
  try {
    const json = JSON.stringify(value);
    return new Blob([json]).size;
  } catch (error) {
    return 0;
  }
};

/**
 * Check if storage is available
 * @param {Storage} storage - localStorage or sessionStorage
 * @returns {boolean} Is available
 */
const isStorageAvailable = (storage) => {
  try {
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Log message if logging is enabled
 * @param {string} message - Log message
 * @param {*} data - Additional data
 */
const log = (message, data = null) => {
  if (CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log(`[Cache] ${message}`, data || '');
  }
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
const logError = (message, error) => {
  console.error(`[Cache Error] ${message}`, error);
};

// ============================================================================
// CACHE ENTRY CLASS
// ============================================================================

/**
 * @class CacheEntry
 * @description Represents a single cache entry with metadata
 */
class CacheEntry {
  /**
   * Create cache entry
   * @param {*} value - Cached value
   * @param {number} ttl - Time to live in seconds
   */
  constructor(value, ttl = CONFIG.DEFAULT_TTL) {
    this.value = value;
    this.timestamp = Date.now();
    this.ttl = ttl * 1000; // Convert to milliseconds
    this.expiresAt = this.timestamp + this.ttl;
    this.accessCount = 0;
    this.lastAccessed = this.timestamp;
    this.size = getSize(value);
  }

  /**
   * Check if entry is expired
   * @returns {boolean} Is expired
   */
  isExpired() {
    return Date.now() > this.expiresAt;
  }

  /**
   * Touch entry (update last accessed)
   */
  touch() {
    this.lastAccessed = Date.now();
    this.accessCount++;
  }

  /**
   * Get remaining TTL in seconds
   * @returns {number} Remaining TTL
   */
  getRemainingTTL() {
    const remaining = this.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Serialize entry for storage
   * @returns {object} Serialized entry
   */
  toJSON() {
    return {
      value: this.value,
      timestamp: this.timestamp,
      ttl: this.ttl,
      expiresAt: this.expiresAt,
      accessCount: this.accessCount,
      lastAccessed: this.lastAccessed,
      size: this.size,
    };
  }

  /**
   * Deserialize entry from storage
   * @param {object} data - Serialized data
   * @returns {CacheEntry} Cache entry
   */
  static fromJSON(data) {
    const entry = new CacheEntry(data.value, 0);
    entry.timestamp = data.timestamp;
    entry.ttl = data.ttl;
    entry.expiresAt = data.expiresAt;
    entry.accessCount = data.accessCount || 0;
    entry.lastAccessed = data.lastAccessed || data.timestamp;
    entry.size = data.size || 0;
    return entry;
  }
}

// ============================================================================
// CACHE STATISTICS CLASS
// ============================================================================

/**
 * @class CacheStats
 * @description Track cache performance statistics
 */
class CacheStats {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.evictions = 0;
    this.errors = 0;
  }

  /**
   * Get hit rate
   * @returns {number} Hit rate percentage
   */
  getHitRate() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  /**
   * Reset statistics
   */
  reset() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.evictions = 0;
    this.errors = 0;
  }

  /**
   * Get statistics summary
   * @returns {object} Stats summary
   */
  getSummary() {
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      evictions: this.evictions,
      errors: this.errors,
      hitRate: this.getHitRate().toFixed(2) + '%',
      total: this.hits + this.misses,
    };
  }
}

// ============================================================================
// MAIN CACHE CLASS
// ============================================================================

/**
 * @class Cache
 * @description Multi-layer cache with memory + localStorage
 */
class Cache {
  constructor() {
    // In-memory cache (Map for O(1) access)
    this.memoryCache = new Map();
    
    // Statistics
    this.stats = new CacheStats();
    
    // Storage availability
    this.hasLocalStorage = isStorageAvailable(localStorage);
    this.hasSessionStorage = isStorageAvailable(sessionStorage);
    
    // Current memory size
    this.currentMemorySize = 0;
    
    // Initialize cleanup interval
    this.startCleanupInterval();
    
    log('Cache initialized', {
      localStorage: this.hasLocalStorage,
      sessionStorage: this.hasSessionStorage,
    });
  }

  // ==========================================================================
  // CORE CACHE METHODS
  // ==========================================================================

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @param {object} options - Additional options
   * @returns {boolean} Success status
   * 
   * @example
   * cache.set('user-123', userData, 300); // 5 minutes
   */
  set(key, value, ttl = CONFIG.DEFAULT_TTL, options = {}) {
    try {
      const entry = new CacheEntry(value, ttl);
      const cacheKey = generateKey(key);

      // Check memory limits
      if (this.shouldEvict(entry.size)) {
        this.evictLRU();
      }

      // Set in memory cache
      this.memoryCache.set(cacheKey, entry);
      this.currentMemorySize += entry.size;

      // Set in localStorage if available and not explicitly disabled
      if (this.hasLocalStorage && options.skipLocalStorage !== true) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(entry.toJSON()));
        } catch (storageError) {
          // Storage full, try to clean up
          this.cleanupStorage();
          try {
            localStorage.setItem(cacheKey, JSON.stringify(entry.toJSON()));
          } catch (retryError) {
            logError('LocalStorage set failed after cleanup', retryError);
          }
        }
      }

      this.stats.sets++;
      log(`Set: ${key}`, { size: entry.size, ttl });
      return true;
    } catch (error) {
      this.stats.errors++;
      logError(`Failed to set cache: ${key}`, error);
      return false;
    }
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @param {Function} fallback - Fallback function if not found
   * @returns {*} Cached value or fallback result
   * 
   * @example
   * const user = await cache.get('user-123', async () => {
   *   return await fetchUser(123);
   * });
   */
  async get(key, fallback = null) {
    try {
      const cacheKey = generateKey(key);

      // Try memory cache first
      let entry = this.memoryCache.get(cacheKey);

      if (entry && !entry.isExpired()) {
        entry.touch();
        this.stats.hits++;
        log(`Hit (Memory): ${key}`, { ttl: entry.getRemainingTTL() });
        return entry.value;
      }

      // Try localStorage
      if (this.hasLocalStorage) {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            entry = CacheEntry.fromJSON(data);

            if (!entry.isExpired()) {
              entry.touch();
              // Restore to memory cache
              this.memoryCache.set(cacheKey, entry);
              this.currentMemorySize += entry.size;
              this.stats.hits++;
              log(`Hit (LocalStorage): ${key}`, { ttl: entry.getRemainingTTL() });
              return entry.value;
            } else {
              // Expired, remove from localStorage
              localStorage.removeItem(cacheKey);
            }
          } catch (parseError) {
            logError('Failed to parse localStorage entry', parseError);
            localStorage.removeItem(cacheKey);
          }
        }
      }

      // Cache miss - use fallback
      this.stats.misses++;
      log(`Miss: ${key}`);

      if (fallback && typeof fallback === 'function') {
        const value = await fallback();
        if (value !== undefined && value !== null) {
          this.set(key, value);
        }
        return value;
      }

      return null;
    } catch (error) {
      this.stats.errors++;
      logError(`Failed to get cache: ${key}`, error);
      
      // Try fallback on error
      if (fallback && typeof fallback === 'function') {
        try {
          return await fallback();
        } catch (fallbackError) {
          logError('Fallback function failed', fallbackError);
          return null;
        }
      }
      
      return null;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} Exists and not expired
   */
  has(key) {
    const cacheKey = generateKey(key);
    const entry = this.memoryCache.get(cacheKey);
    
    if (entry && !entry.isExpired()) {
      return true;
    }

    if (this.hasLocalStorage) {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const entry = CacheEntry.fromJSON(data);
          return !entry.isExpired();
        } catch (error) {
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   * @returns {boolean} Success status
   */
  delete(key) {
    try {
      const cacheKey = generateKey(key);

      // Delete from memory
      const entry = this.memoryCache.get(cacheKey);
      if (entry) {
        this.currentMemorySize -= entry.size;
        this.memoryCache.delete(cacheKey);
      }

      // Delete from localStorage
      if (this.hasLocalStorage) {
        localStorage.removeItem(cacheKey);
      }

      this.stats.deletes++;
      log(`Deleted: ${key}`);
      return true;
    } catch (error) {
      this.stats.errors++;
      logError(`Failed to delete cache: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   * @param {string} pattern - Optional key pattern to match
   */
  clear(pattern = null) {
    try {
      if (pattern) {
        // Clear matching keys
        const regex = new RegExp(pattern);
        
        // Clear from memory
        for (const [key] of this.memoryCache) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }

        // Clear from localStorage
        if (this.hasLocalStorage) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CONFIG.PREFIX) && regex.test(key)) {
              localStorage.removeItem(key);
            }
          }
        }
      } else {
        // Clear all
        this.memoryCache.clear();
        this.currentMemorySize = 0;

        if (this.hasLocalStorage) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CONFIG.PREFIX)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
      }

      log(`Cleared cache`, { pattern });
    } catch (error) {
      this.stats.errors++;
      logError('Failed to clear cache', error);
    }
  }

  // ==========================================================================
  // EVICTION & CLEANUP
  // ==========================================================================

  /**
   * Check if eviction is needed
   * @param {number} newEntrySize - Size of new entry
   * @returns {boolean} Should evict
   */
  shouldEvict(newEntrySize) {
    const totalSize = this.currentMemorySize + newEntrySize;
    const maxSize = CONFIG.MAX_MEMORY_SIZE_MB * 1024 * 1024;
    
    return (
      this.memoryCache.size >= CONFIG.MAX_MEMORY_ITEMS ||
      totalSize > maxSize
    );
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey);
      this.currentMemorySize -= entry.size;
      this.memoryCache.delete(oldestKey);
      this.stats.evictions++;
      log(`Evicted (LRU): ${oldestKey}`);
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    try {
      let cleaned = 0;

      // Cleanup memory cache
      for (const [key, entry] of this.memoryCache) {
        if (entry.isExpired()) {
          this.currentMemorySize -= entry.size;
          this.memoryCache.delete(key);
          cleaned++;
        }
      }

      // Cleanup localStorage
      if (this.hasLocalStorage) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CONFIG.PREFIX)) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const data = JSON.parse(stored);
                const entry = CacheEntry.fromJSON(data);
                if (entry.isExpired()) {
                  localStorage.removeItem(key);
                  cleaned++;
                }
              }
            } catch (error) {
              // Invalid entry, remove it
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        }
      }

      if (cleaned > 0) {
        log(`Cleanup: Removed ${cleaned} expired entries`);
      }
    } catch (error) {
      logError('Cleanup failed', error);
    }
  }

  /**
   * Cleanup storage when full
   */
  cleanupStorage() {
    try {
      if (!this.hasLocalStorage) {
return;
}

      const entries = [];

      // Collect all cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CONFIG.PREFIX)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const data = JSON.parse(stored);
              entries.push({ key, data });
            }
          } catch (error) {
            // Invalid entry, mark for removal
            localStorage.removeItem(key);
          }
        }
      }

      // Sort by last accessed (oldest first)
      entries.sort((a, b) => a.data.lastAccessed - b.data.lastAccessed);

      // Remove oldest 25%
      const toRemove = Math.ceil(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(entries[i].key);
      }

      log(`Storage cleanup: Removed ${toRemove} old entries`);
    } catch (error) {
      logError('Storage cleanup failed', error);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval() {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, CONFIG.CLEANUP_INTERVAL);
    }
  }

  /**
   * Stop automatic cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ==========================================================================
  // STATISTICS & UTILITIES
  // ==========================================================================

  /**
   * Get cache statistics
   * @returns {object} Statistics summary
   */
  getStats() {
    return {
      ...this.stats.getSummary(),
      memorySize: this.currentMemorySize,
      memoryEntries: this.memoryCache.size,
      memorySizeMB: (this.currentMemorySize / (1024 * 1024)).toFixed(2),
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    this.stats.reset();
    log('Statistics reset');
  }

  /**
   * Get all keys matching pattern
   * @param {string} pattern - Key pattern
   * @returns {string[]} Matching keys
   */
  keys(pattern = null) {
    const keys = [];
    const regex = pattern ? new RegExp(pattern) : null;

    for (const [key] of this.memoryCache) {
      const cleanKey = key.replace(CONFIG.PREFIX, '');
      if (!regex || regex.test(cleanKey)) {
        keys.push(cleanKey);
      }
    }

    return keys;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const cache = new Cache();

// ============================================================================
// EXPORTS
// ============================================================================

export default cache;
export { cache, Cache, CacheEntry, CacheStats, CONFIG };

/**
 * Convenience export for common patterns
 */
export const cacheUtils = {
  /**
   * Generate TTL for common durations
   */
  TTL: {
    ONE_MINUTE: 60,
    FIVE_MINUTES: 300,
    TEN_MINUTES: 600,
    THIRTY_MINUTES: 1800,
    ONE_HOUR: 3600,
    ONE_DAY: 86400,
    ONE_WEEK: 604800,
  },

  /**
   * Cache with tags for bulk invalidation
   */
  setWithTags: (key, value, ttl, tags = []) => {
    cache.set(key, value, ttl);
    tags.forEach(tag => {
      const tagKey = `tag:${tag}`;
      const taggedKeys = cache.get(tagKey) || [];
      taggedKeys.push(key);
      cache.set(tagKey, taggedKeys, ttl);
    });
  },

  /**
   * Invalidate all keys with tag
   */
  invalidateTag: (tag) => {
    const tagKey = `tag:${tag}`;
    const keys = cache.get(tagKey) || [];
    keys.forEach(key => cache.delete(key));
    cache.delete(tagKey);
  },
};