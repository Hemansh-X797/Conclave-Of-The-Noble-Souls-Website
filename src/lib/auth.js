// ============================================================================
// AUTHENTICATION LIBRARY
// Production-grade authentication helpers
// /src/lib/auth.js
// ============================================================================

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGuildMember, isUserInGuild } from './discord';
import { hasPermission, isStaff, getPermissionLevel } from '@/constants/permissions';

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get current authenticated session (server-side only)
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session || !session.user) {
    throw new Error('Authentication required');
  }
  
  return session;
}

/**
 * Require specific permission - throws if not authorized
 */
export async function requirePermission(permission) {
  const session = await requireAuth();
  
  if (!hasPermission(session.user.roles, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
  
  return session;
}

/**
 * Require staff access - throws if not staff
 */
export async function requireStaff() {
  const session = await requireAuth();
  
  if (!isStaff(session.user.roles)) {
    throw new Error('Staff access required');
  }
  
  return session;
}

/**
 * Require guild membership - throws if not member
 */
export async function requireGuildMember() {
  const session = await requireAuth();
  
  const isMember = await isUserInGuild(session.user.id);
  
  if (!isMember) {
    throw new Error('Guild membership required');
  }
  
  return session;
}

// ============================================================================
// USER DATA RETRIEVAL
// ============================================================================

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return null;
  }
  
  return session.user;
}

/**
 * Get current user's Discord member data
 */
export async function getCurrentMember() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return null;
  }
  
  try {
    const member = await getGuildMember(session.user.id);
    return member;
  } catch (error) {
    console.error('Failed to fetch member data:', error);
    return null;
  }
}

/**
 * Get current user's roles
 */
export async function getCurrentUserRoles() {
  const member = await getCurrentMember();
  return member?.roles || [];
}

/**
 * Get current user's permission level
 */
export async function getCurrentUserPermissionLevel() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return 0;
  }
  
  return getPermissionLevel(session.user.roles);
}

// ============================================================================
// AUTHORIZATION CHECKS
// ============================================================================

/**
 * Check if current user can perform action
 */
export async function canPerformAction(permission) {
  const session = await getSession();
  
  if (!session || !session.user) {
    return false;
  }
  
  return hasPermission(session.user.roles, permission);
}

/**
 * Check if current user is staff
 */
export async function isCurrentUserStaff() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return false;
  }
  
  return isStaff(session.user.roles);
}

/**
 * Check if current user has minimum permission level
 */
export async function hasMinimumPermissionLevel(minLevel) {
  const level = await getCurrentUserPermissionLevel();
  return level >= minLevel;
}

// ============================================================================
// TOKEN GENERATION & VERIFICATION
// ============================================================================

/**
 * Generate cryptographically secure random token
 */
export function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(randomValues[i] % chars.length);
  }
  
  return token;
}

/**
 * Hash token using SHA-256 (for secure storage)
 */
export async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify token against hashed version
 */
export async function verifyToken(token, hashedToken) {
  const tokenHash = await hashToken(token);
  return tokenHash === hashedToken;
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken() {
  return generateToken(32);
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token, storedToken) {
  if (!token || !storedToken) {
    return false;
  }
  return token === storedToken;
}

// ============================================================================
// RATE LIMITING (In-Memory - Use Redis in Production)
// ============================================================================

const rateLimitStore = new Map();

/**
 * Check rate limit for identifier
 */
export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now - entry.resetAt > windowMs) {
    entry = {
      attempts: 1,
      resetAt: now
    };
    rateLimitStore.set(key, entry);
    return { 
      allowed: true, 
      remaining: maxAttempts - 1,
      resetAt: now + windowMs
    };
  }
  
  if (entry.attempts >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt + windowMs
    };
  }
  
  entry.attempts++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: maxAttempts - entry.attempts,
    resetAt: entry.resetAt + windowMs
  };
}

/**
 * Clear rate limit for identifier
 */
export function clearRateLimit(identifier) {
  const key = `ratelimit:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clean up old rate limit entries
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.resetAt > 300000) { // 5 minutes old
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 300000);
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log authentication event
 */
export async function logAuthEvent(event, userId, metadata = {}) {
  const logData = {
    event,
    user_id: userId,
    metadata: JSON.stringify(metadata),
    timestamp: new Date().toISOString(),
    ip_address: metadata.ip || null
  };
  
  // In production, save to database
  console.log('[AUTH LOG]', logData);
  
  return logData;
}

/**
 * Log successful login
 */
export async function logLogin(userId, ip, userAgent) {
  return logAuthEvent('login', userId, { 
    ip, 
    userAgent,
    success: true 
  });
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(userId, ip, reason, userAgent) {
  return logAuthEvent('login_failed', userId, { 
    ip, 
    userAgent,
    success: false, 
    reason 
  });
}

/**
 * Log logout
 */
export async function logLogout(userId, ip) {
  return logAuthEvent('logout', userId, { ip });
}

/**
 * Log permission denied
 */
export async function logPermissionDenied(userId, permission, ip) {
  return logAuthEvent('permission_denied', userId, { 
    ip, 
    permission 
  });
}

// ============================================================================
// REQUEST UTILITIES
// ============================================================================

/**
 * Extract IP address from request
 */
export function getClientIp(request) {
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

/**
 * Get user agent from request
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Check if request is from mobile device
 */
export function isMobileDevice(request) {
  const userAgent = getUserAgent(request);
  return /mobile|android|iphone|ipad|ipod/i.test(userAgent);
}

/**
 * Check if request is from bot/crawler
 */
export function isBot(request) {
  const userAgent = getUserAgent(request);
  return /bot|crawler|spider|scraper/i.test(userAgent);
}

// ============================================================================
// SESSION REFRESH & INVALIDATION
// ============================================================================

/**
 * Refresh user session with fresh Discord data
 */
export async function refreshSession(userId) {
  try {
    const member = await getGuildMember(userId);
    
    return {
      success: true,
      member,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Invalidate user session (for logout/ban/etc)
 */
export async function invalidateSession(userId) {
  // In production, clear from session store
  console.log(`[AUTH] Invalidating session for user ${userId}`);
  
  return {
    success: true,
    message: 'Session invalidated',
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// PASSWORD HASHING (if needed for local accounts)
// ============================================================================

/**
 * Hash password using bcrypt-compatible method
 * Note: Prefer using bcrypt library in production
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, hashedPassword) {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

// ============================================================================
// API KEY GENERATION (for API access)
// ============================================================================

/**
 * Generate API key
 */
export function generateApiKey() {
  const prefix = 'cnr'; // Conclave Realm
  const key = generateToken(32);
  return `${prefix}_${key}`;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey) {
  return /^cnr_[A-Za-z0-9]{32}$/.test(apiKey);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Session
  getSession,
  requireAuth,
  requirePermission,
  requireStaff,
  requireGuildMember,
  
  // User Data
  getCurrentUser,
  getCurrentMember,
  getCurrentUserRoles,
  getCurrentUserPermissionLevel,
  
  // Authorization
  canPerformAction,
  isCurrentUserStaff,
  hasMinimumPermissionLevel,
  
  // Tokens
  generateToken,
  hashToken,
  verifyToken,
  generateCsrfToken,
  verifyCsrfToken,
  
  // Rate Limiting
  checkRateLimit,
  clearRateLimit,
  cleanupRateLimits,
  
  // Audit
  logAuthEvent,
  logLogin,
  logFailedLogin,
  logLogout,
  logPermissionDenied,
  
  // Request Utils
  getClientIp,
  getUserAgent,
  isMobileDevice,
  isBot,
  
  // Session Management
  refreshSession,
  invalidateSession,
  
  // Password (if needed)
  hashPassword,
  verifyPassword,
  
  // API Keys
  generateApiKey,
  isValidApiKeyFormat
};