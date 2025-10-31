import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// =============================================================================
// THE CONCLAVE REALM - ADVANCED MIDDLEWARE SYSTEM
// Enterprise-grade security, performance & user experience optimization
// Version: 1.0 | Rolls-Royce Inspired Digital Security
// =============================================================================

// Security & Performance Constants
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'conclave-fallback-secret');
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100;
const ADMIN_RATE_LIMIT = 500; // Higher limit for admins
const API_RATE_LIMIT = 1000; // Separate limit for API routes

// Role Hierarchy (from highest to lowest authority)
const ROLE_HIERARCHY = {
  owner: 0,
  admin: 1,
  mod: 2,
  noble: 3,
  member: 4,
  guest: 5
};

// Protected Route Configurations
const ROUTE_PROTECTIONS = {
  // Supreme Authority Routes
  '/throne-room': { minRole: 'owner', strictAuth: true, auditLog: true },
  
  // Administrative Routes  
  '/sanctum': { minRole: 'admin', strictAuth: true, auditLog: true },
  
  // Moderator Routes
  '/court/moderate': { minRole: 'mod', strictAuth: true, auditLog: false },
  
  // Member-Only Routes
  '/chambers': { minRole: 'member', strictAuth: false, auditLog: false },
  '/hall-of-nobles': { minRole: 'noble', strictAuth: false, auditLog: false },
  
  // Gateway Routes (special handling)
  '/gateway': { publicAccess: true, rateLimit: 'strict' },
  
  // API Routes
  '/api/admin': { minRole: 'admin', strictAuth: true, auditLog: true },
  '/api/auth': { publicAccess: true, rateLimit: 'api' },
  '/api/discord': { minRole: 'member', strictAuth: false }
};

// Rate Limiting Store (in production, use Redis)
const rateLimitStore = new Map();
const adminActionLog = new Map();

// Device Detection Patterns
const MOBILE_PATTERNS = [
  /Android/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i
];

const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /facebook/i, /twitter/i
];

// Performance & Security Headers
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), location=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSP()
};

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
};

// =============================================================================
// AUTHENTICATION & AUTHORIZATION SYSTEM
// =============================================================================

async function validateToken(token) {
  try {
    if (!token) return null;
    
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check token expiry with grace period
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now - 300) { // 5 minute grace period
      return null;
    }
    
    // Validate required claims
    if (!payload.userId || !payload.discordId || !payload.role) {
      return null;
    }
    
    // Return validated user data
    return {
      userId: payload.userId,
      discordId: payload.discordId,
      username: payload.username,
      avatar: payload.avatar,
      role: payload.role,
      permissions: payload.permissions || [],
      lastActive: payload.lastActive || now,
      sessionId: payload.sessionId
    };
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}

function hasRequiredRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] ?? ROLE_HIERARCHY.guest;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? ROLE_HIERARCHY.guest;
  return userLevel <= requiredLevel;
}

async function checkRouteAccess(pathname, user) {
  // Find matching route protection
  const protection = Object.entries(ROUTE_PROTECTIONS).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];
  
  if (!protection) return { allowed: true };
  
  // Public access routes
  if (protection.publicAccess) {
    return { allowed: true, protection };
  }
  
  // Check authentication requirement
  if (protection.strictAuth && !user) {
    return { allowed: false, reason: 'authentication_required', protection };
  }
  
  // Check role requirement
  if (protection.minRole && !hasRequiredRole(user?.role, protection.minRole)) {
    return { 
      allowed: false, 
      reason: 'insufficient_permissions',
      required: protection.minRole,
      current: user?.role,
      protection 
    };
  }
  
  return { allowed: true, protection };
}

// =============================================================================
// RATE LIMITING SYSTEM
// =============================================================================

function getRateLimitKey(ip, userId, route) {
  return `${ip}-${userId || 'anonymous'}-${route}`;
}

function checkRateLimit(request, user, protection) {
  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;
  
  // Determine rate limit based on user role and route
  let limit = MAX_REQUESTS_PER_WINDOW;
  let window = RATE_LIMIT_WINDOW;
  
  if (protection?.rateLimit === 'strict') {
    limit = 20;
    window = 5 * 60 * 1000; // 5 minutes
  } else if (protection?.rateLimit === 'api') {
    limit = API_RATE_LIMIT;
  } else if (user && hasRequiredRole(user.role, 'admin')) {
    limit = ADMIN_RATE_LIMIT;
  }
  
  const key = getRateLimitKey(ip, user?.userId, pathname);
  const now = Date.now();
  const windowStart = now - window;
  
  // Get or create rate limit data
  let limitData = rateLimitStore.get(key) || { requests: [], firstRequest: now };
  
  // Clean old requests
  limitData.requests = limitData.requests.filter(time => time > windowStart);
  
  // Check if limit exceeded
  if (limitData.requests.length >= limit) {
    const remainingTime = Math.ceil((limitData.requests[0] + window - now) / 1000);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetTime: remainingTime,
      retryAfter: remainingTime
    };
  }
  
  // Add current request
  limitData.requests.push(now);
  rateLimitStore.set(key, limitData);
  
  return {
    allowed: true,
    limit,
    remaining: limit - limitData.requests.length,
    resetTime: Math.ceil(window / 1000)
  };
}

// =============================================================================
// SECURITY & PERFORMANCE UTILITIES
// =============================================================================

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const connectingIP = request.headers.get('cf-connecting-ip');
  
  return connectingIP || realIP || forwarded?.split(',')[0] || 'unknown';
}

function detectDevice(userAgent) {
  const isMobile = MOBILE_PATTERNS.some(pattern => pattern.test(userAgent));
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  
  return {
    isMobile,
    isBot,
    isDesktop: !isMobile && !isBot,
    userAgent: userAgent?.substring(0, 200) // Truncate for security
  };
}

function generateCSP() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' https:",
    "connect-src 'self' https://api.discord.com wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
}

async function logAdminAction(user, action, request) {
  const logEntry = {
    userId: user.userId,
    username: user.username,
    role: user.role,
    action,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
    pathname: request.nextUrl.pathname,
    method: request.method
  };
  
  // Store in memory (in production, use proper logging service)
  const userLogs = adminActionLog.get(user.userId) || [];
  userLogs.push(logEntry);
  
  // Keep only last 100 actions per user
  if (userLogs.length > 100) {
    userLogs.shift();
  }
  
  adminActionLog.set(user.userId, userLogs);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Admin Action:', logEntry);
  }
}

// =============================================================================
// MAIN MIDDLEWARE FUNCTION
// =============================================================================

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const deviceInfo = detectDevice(userAgent);
  
  // Performance: Skip middleware for static assets
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/Assets/') ||
      pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|css|js)$/)) {
    
    const response = NextResponse.next();
    
    // Add cache headers for static assets
    if (pathname.startsWith('/Assets/') || pathname.match(/\.(woff|woff2|ttf)$/)) {
      Object.entries(CACHE_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  }
  
  // Get authentication token
  const token = request.cookies.get('conclave-auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Validate user authentication
  const user = await validateToken(token);
  
  // Check route access permissions
  const accessCheck = await checkRouteAccess(pathname, user);
  
  if (!accessCheck.allowed) {
    // Handle authentication failures
    if (accessCheck.reason === 'authentication_required') {
      const loginUrl = new URL('/gateway', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }
    
    // Handle permission failures
    if (accessCheck.reason === 'insufficient_permissions') {
      const errorUrl = new URL('/gateway', request.url);
      errorUrl.searchParams.set('error', 'insufficient_permissions');
      errorUrl.searchParams.set('required', accessCheck.required);
      return NextResponse.redirect(errorUrl);
    }
  }
  
  // Check rate limiting
  const rateLimitResult = checkRateLimit(request, user, accessCheck.protection);
  
  if (!rateLimitResult.allowed) {
    const response = new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retryAfter.toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + rateLimitResult.retryAfter * 1000).toString()
        }
      }
    );
    
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  // Log admin actions if required
  if (accessCheck.protection?.auditLog && user) {
    await logAdminAction(user, `ACCESS_${pathname}`, request);
  }
  
  // Create enhanced request with user context
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add rate limiting headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', (Date.now() + rateLimitResult.resetTime * 1000).toString());
  
  // Add user context headers for client-side usage
  if (user) {
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-User-ID', user.userId);
    response.headers.set('X-User-Authenticated', 'true');
  }
  
  // Add device detection headers
  response.headers.set('X-Device-Mobile', deviceInfo.isMobile.toString());
  response.headers.set('X-Device-Bot', deviceInfo.isBot.toString());
  
  // Add performance hints
  if (deviceInfo.isMobile) {
    response.headers.set('X-Performance-Mode', 'mobile');
  }
  
  // Handle bot traffic
  if (deviceInfo.isBot) {
    response.headers.set('X-Robots-Tag', 'index, follow, max-snippet:-1, max-image-preview:large');
  }
  
  // Add pathway detection for client-side theming
  const pathway = detectPathwayFromUrl(pathname);
  if (pathway !== 'default') {
    response.headers.set('X-Current-Pathway', pathway);
  }
  
  return response;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function detectPathwayFromUrl(pathname) {
  if (pathname.includes('/gaming')) return 'gaming';
  if (pathname.includes('/lorebound')) return 'lorebound';
  if (pathname.includes('/productive')) return 'productive';
  if (pathname.includes('/news')) return 'news';
  return 'default';
}

// Clean up rate limit store periodically (prevent memory leaks)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const cutoff = now - (RATE_LIMIT_WINDOW * 2);
    
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.firstRequest < cutoff) {
        rateLimitStore.delete(key);
      }
    }
    
    // Clean admin logs older than 24 hours
    const logCutoff = now - (24 * 60 * 60 * 1000);
    for (const [userId, logs] of adminActionLog.entries()) {
      const filteredLogs = logs.filter(log => new Date(log.timestamp).getTime() > logCutoff);
      if (filteredLogs.length === 0) {
        adminActionLog.delete(userId);
      } else {
        adminActionLog.set(userId, filteredLogs);
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
}

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|Assets/).*)',
  ],
};