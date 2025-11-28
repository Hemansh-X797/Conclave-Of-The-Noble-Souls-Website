// ============================================================================
// THE CONCLAVE REALM - RATE LIMITING SYSTEM
// Location: /src/lib/rate-limit.js
// ============================================================================
// Purpose: In-memory rate limiting for API protection
// Features: Token bucket algorithm, per-user limits, automatic cleanup
// Dependencies: None (pure JavaScript)
// Author: The Conclave Development Team
// Created: 2024-11-26
// Version: 1.0.0
// ============================================================================

/**
 * @fileoverview
 * Rate limiting system using token bucket algorithm
 * 
 * Features:
 * - Token bucket algorithm for smooth rate limiting
 * - Per-user and per-IP tracking
 * - Multiple limit tiers (global, endpoint-specific, user-specific)
 * - Automatic token regeneration
 * - Memory-efficient with automatic cleanup
 * - Detailed error responses
 * 
 * @example
 * import { rateLimit, checkRateLimit } from '@/lib/rate-limit';
 * 
 * // In API route
 * const result = await checkRateLimit(req, 'ebooks:download');
 * if (!result.allowed) {
 *   return res.status(429).json({ error: result.message });
 * }
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const RATE_LIMITS = {
  // Global limits (requests per window)
  GLOBAL: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  },

  // E-Book specific limits
  EBOOKS: {
    LIST: {
      requests: 50,
      windowMs: 60000, // 1 minute
    },
    SEARCH: {
      requests: 30,
      windowMs: 60000, // 1 minute
    },
    DOWNLOAD: {
      requests: parseInt(process.env.EBOOK_DOWNLOAD_RATE_LIMIT) || 10,
      windowMs: parseInt(process.env.EBOOK_DOWNLOAD_WINDOW_MS) || 3600000, // 1 hour
    },
    PROGRESS_UPDATE: {
      requests: 100,
      windowMs: 60000, // 1 minute
    },
  },

  // Authentication limits
  AUTH: {
    LOGIN: {
      requests: 5,
      windowMs: 900000, // 15 minutes
    },
    REGISTER: {
      requests: 3,
      windowMs: 3600000, // 1 hour
    },
  },

  // API general limits
  API: {
    READ: {
      requests: 100,
      windowMs: 60000, // 1 minute
    },
    WRITE: {
      requests: 50,
      windowMs: 60000, // 1 minute
    },
  },
};

// Cleanup interval
const CLEANUP_INTERVAL = 600000; // 10 minutes

// ============================================================================
// TOKEN BUCKET CLASS
// ============================================================================

/**
 * @class TokenBucket
 * @description Implements token bucket algorithm for rate limiting
 */
class TokenBucket {
  /**
   * Create token bucket
   * @param {number} capacity - Maximum tokens
   * @param {number} refillRate - Tokens per second
   */
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed
   */
  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Try to consume tokens
   * @param {number} tokens - Number of tokens to consume
   * @returns {boolean} Success status
   */
  consume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * Get time until bucket is full (in seconds)
   * @returns {number} Time in seconds
   */
  getTimeUntilFull() {
    this.refill();
    const tokensNeeded = this.capacity - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate);
  }

  /**
   * Get time until next token (in seconds)
   * @param {number} tokensNeeded - Tokens needed
   * @returns {number} Time in seconds
   */
  getTimeUntilAvailable(tokensNeeded = 1) {
    this.refill();
    const deficit = tokensNeeded - this.tokens;
    
    if (deficit <= 0) return 0;
    
    return Math.ceil(deficit / this.refillRate);
  }

  /**
   * Reset bucket to full capacity
   */
  reset() {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Get current state
   * @returns {object} Bucket state
   */
  getState() {
    this.refill();
    return {
      tokens: Math.floor(this.tokens),
      capacity: this.capacity,
      percentage: (this.tokens / this.capacity) * 100,
    };
  }
}

// ============================================================================
// RATE LIMITER CLASS
// ============================================================================

/**
 * @class RateLimiter
 * @description Manages rate limits for different identifiers
 */
class RateLimiter {
  constructor() {
    // Storage for buckets: Map<identifier, TokenBucket>
    this.buckets = new Map();
    
    // Storage for hit counts: Map<identifier, Array<timestamp>>
    this.hits = new Map();
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      uniqueIdentifiers: 0,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get or create token bucket for identifier
   * @param {string} identifier - Unique identifier (user ID, IP, etc.)
   * @param {object} limit - Limit configuration
   * @returns {TokenBucket} Token bucket
   */
  getBucket(identifier, limit) {
    const key = `${identifier}:${limit.requests}:${limit.windowMs}`;
    
    if (!this.buckets.has(key)) {
      const refillRate = limit.requests / (limit.windowMs / 1000);
      const bucket = new TokenBucket(limit.requests, refillRate);
      this.buckets.set(key, bucket);
      this.stats.uniqueIdentifiers = this.buckets.size;
    }

    return this.buckets.get(key);
  }

  /**
   * Check if request is allowed (token bucket method)
   * @param {string} identifier - Unique identifier
   * @param {object} limit - Limit configuration
   * @returns {object} Result with allowed status and metadata
   */
  checkTokenBucket(identifier, limit) {
    const bucket = this.getBucket(identifier, limit);
    const allowed = bucket.consume(1);

    this.stats.totalRequests++;
    if (!allowed) {
      this.stats.blockedRequests++;
    }

    return {
      allowed,
      remaining: Math.floor(bucket.tokens),
      limit: bucket.capacity,
      resetIn: allowed ? null : bucket.getTimeUntilAvailable(1),
      state: bucket.getState(),
    };
  }

  /**
   * Check if request is allowed (sliding window method)
   * @param {string} identifier - Unique identifier
   * @param {object} limit - Limit configuration
   * @returns {object} Result with allowed status and metadata
   */
  checkSlidingWindow(identifier, limit) {
    const key = `${identifier}:${limit.requests}:${limit.windowMs}`;
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    // Get or create hit array
    if (!this.hits.has(key)) {
      this.hits.set(key, []);
    }

    const hits = this.hits.get(key);

    // Remove old hits outside window
    const validHits = hits.filter(timestamp => timestamp > windowStart);
    this.hits.set(key, validHits);

    // Check if request is allowed
    const allowed = validHits.length < limit.requests;

    this.stats.totalRequests++;
    if (!allowed) {
      this.stats.blockedRequests++;
    }

    if (allowed) {
      validHits.push(now);
    }

    // Calculate reset time
    const resetIn = validHits.length > 0 
      ? Math.ceil((validHits[0] + limit.windowMs - now) / 1000)
      : 0;

    return {
      allowed,
      remaining: Math.max(0, limit.requests - validHits.length),
      limit: limit.requests,
      resetIn: allowed ? null : resetIn,
      windowMs: limit.windowMs,
    };
  }

  /**
   * Check rate limit (combines both methods)
   * @param {string} identifier - Unique identifier
   * @param {object} limit - Limit configuration
   * @param {string} method - 'token' or 'sliding' (default: 'token')
   * @returns {object} Rate limit result
   */
  check(identifier, limit, method = 'token') {
    if (method === 'sliding') {
      return this.checkSlidingWindow(identifier, limit);
    }
    return this.checkTokenBucket(identifier, limit);
  }

  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Unique identifier
   */
  reset(identifier) {
    // Remove all buckets for this identifier
    for (const [key, bucket] of this.buckets) {
      if (key.startsWith(identifier)) {
        this.buckets.delete(key);
      }
    }

    // Remove all hit records
    for (const [key] of this.hits) {
      if (key.startsWith(identifier)) {
        this.hits.delete(key);
      }
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    // Cleanup hits (sliding window)
    for (const [key, hits] of this.hits) {
      // Extract windowMs from key
      const parts = key.split(':');
      const windowMs = parseInt(parts[2]);
      const windowStart = now - windowMs;

      const validHits = hits.filter(timestamp => timestamp > windowStart);
      
      if (validHits.length === 0) {
        this.hits.delete(key);
        cleaned++;
      } else {
        this.hits.set(key, validHits);
      }
    }

    // Cleanup buckets (remove empty ones)
    for (const [key, bucket] of this.buckets) {
      bucket.refill();
      if (bucket.tokens === bucket.capacity) {
        // Bucket is full and unused, can be removed
        const timeSinceRefill = now - bucket.lastRefill;
        if (timeSinceRefill > 300000) { // 5 minutes
          this.buckets.delete(key);
          cleaned++;
        }
      }
    }

    this.stats.uniqueIdentifiers = this.buckets.size;

    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[RateLimit] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Start automatic cleanup
   */
  startCleanup() {
    if (typeof window === 'undefined' && !this.cleanupTimer) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, CLEANUP_INTERVAL);
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Get statistics
   * @returns {object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      blockRate: this.stats.totalRequests > 0 
        ? ((this.stats.blockedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      activeBuckets: this.buckets.size,
      activeWindows: this.hits.size,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const rateLimiter = new RateLimiter();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get identifier from request
 * @param {Request} req - Request object
 * @returns {string} Identifier (user ID or IP)
 */
export const getIdentifier = (req) => {
  // Try to get user ID from auth
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // Fallback to IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';
  
  return `ip:${ip}`;
};

/**
 * Get limit configuration by endpoint
 * @param {string} endpoint - Endpoint identifier
 * @returns {object} Limit configuration
 */
export const getLimit = (endpoint) => {
  const [category, action] = endpoint.split(':');

  switch (category) {
    case 'ebooks':
      return RATE_LIMITS.EBOOKS[action.toUpperCase()] || RATE_LIMITS.EBOOKS.LIST;
    case 'auth':
      return RATE_LIMITS.AUTH[action.toUpperCase()] || RATE_LIMITS.AUTH.LOGIN;
    case 'api':
      return RATE_LIMITS.API[action.toUpperCase()] || RATE_LIMITS.API.READ;
    default:
      return RATE_LIMITS.GLOBAL;
  }
};

/**
 * Check rate limit for request
 * @param {Request} req - Request object
 * @param {string} endpoint - Endpoint identifier (e.g., 'ebooks:download')
 * @param {object} options - Additional options
 * @returns {object} Rate limit result with message
 * 
 * @example
 * const result = await checkRateLimit(req, 'ebooks:download');
 * if (!result.allowed) {
 *   return res.status(429).json({ error: result.message });
 * }
 */
export const checkRateLimit = (req, endpoint, options = {}) => {
  const identifier = options.identifier || getIdentifier(req);
  const limit = options.limit || getLimit(endpoint);
  const method = options.method || 'token';

  const result = rateLimiter.check(identifier, limit, method);

  // Add helpful message
  if (!result.allowed) {
    const resetMinutes = Math.ceil(result.resetIn / 60);
    result.message = `Rate limit exceeded. Please try again in ${resetMinutes} minute${resetMinutes !== 1 ? 's' : ''}.`;
    result.retryAfter = result.resetIn;
  }

  return result;
};

/**
 * Rate limit middleware for Next.js API routes
 * @param {string} endpoint - Endpoint identifier
 * @param {object} options - Additional options
 * @returns {Function} Middleware function
 * 
 * @example
 * export default rateLimitMiddleware('ebooks:download')(handler);
 */
export const rateLimitMiddleware = (endpoint, options = {}) => {
  return (handler) => async (req, res) => {
    const result = checkRateLimit(req, endpoint, options);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    if (result.resetIn) {
      res.setHeader('X-RateLimit-Reset', Date.now() + result.resetIn * 1000);
      res.setHeader('Retry-After', result.resetIn);
    }

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: result.message,
        retryAfter: result.resetIn,
        limit: result.limit,
        remaining: result.remaining,
      });
    }

    return handler(req, res);
  };
};

/**
 * Reset rate limit for identifier
 * @param {string} identifier - Identifier to reset
 */
export const resetRateLimit = (identifier) => {
  rateLimiter.reset(identifier);
};

/**
 * Get rate limiter statistics
 * @returns {object} Statistics
 */
export const getRateLimitStats = () => {
  return rateLimiter.getStats();
};

// ============================================================================
// EXPORTS
// ============================================================================

export default rateLimiter;
export { 
  rateLimiter, 
  RateLimiter, 
  TokenBucket,
  RATE_LIMITS,
};

/**
 * Convenience exports for common endpoints
 */
export const rateLimiters = {
  ebooksDownload: (req, options) => checkRateLimit(req, 'ebooks:download', options),
  ebooksList: (req, options) => checkRateLimit(req, 'ebooks:list', options),
  ebooksSearch: (req, options) => checkRateLimit(req, 'ebooks:search', options),
  progressUpdate: (req, options) => checkRateLimit(req, 'ebooks:progress_update', options),
  authLogin: (req, options) => checkRateLimit(req, 'auth:login', options),
  authRegister: (req, options) => checkRateLimit(req, 'auth:register', options),
  apiRead: (req, options) => checkRateLimit(req, 'api:read', options),
  apiWrite: (req, options) => checkRateLimit(req, 'api:write', options),
};