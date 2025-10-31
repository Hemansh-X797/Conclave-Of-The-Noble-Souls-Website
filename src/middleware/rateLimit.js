// ============================================================================
// FILE 2: /src/middleware/rateLimit.js
// ============================================================================

import { NextResponse } from 'next/server';

const rateLimitStore = new Map();

export function rateLimitMiddleware(options = {}) {
  const {
    windowMs = 60000,
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = options;

  return async function(request) {
    const ip = getClientIp(request);
    const now = Date.now();
    const key = `ratelimit:${ip}`;
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || now - entry.resetAt > windowMs) {
      entry = {
        count: 1,
        resetAt: now
      };
      rateLimitStore.set(key, entry);
      return null;
    }
    
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt + windowMs - now) / 1000);
      
      return NextResponse.json(
        { error: message },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (entry.resetAt + windowMs).toString()
          }
        }
      );
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    return null;
  };
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

export function cleanupRateLimits() {
  const now = Date.now();
  const maxAge = 300000;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.resetAt > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 300000);
}

export function clearRateLimit(ip) {
  const key = `ratelimit:${ip}`;
  rateLimitStore.delete(key);
}

export function getRateLimitInfo(ip) {
  const key = `ratelimit:${ip}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      count: 0,
      resetAt: null
    };
  }
  
  return entry;
}

export const strictRateLimit = rateLimitMiddleware({
  windowMs: 300000,
  maxRequests: 5,
  message: 'Too many attempts, please try again in 5 minutes'
});

export const standardRateLimit = rateLimitMiddleware({
  windowMs: 60000,
  maxRequests: 100,
  message: 'Too many requests, please slow down'
});

export const lenientRateLimit = rateLimitMiddleware({
  windowMs: 60000,
  maxRequests: 200,
  message: 'Too many requests'
});

export default rateLimitMiddleware;
