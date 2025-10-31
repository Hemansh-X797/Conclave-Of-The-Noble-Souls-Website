// ============================================================================
// NEXT.JS MIDDLEWARE
// /src/middleware.js
// ============================================================================

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Paths that require authentication
const protectedPaths = [
  '/admin',
  '/chambers',
  '/sanctum',
  '/throne-room'
];

// Paths that require staff access
const staffPaths = [
  '/admin',
  '/sanctum',
  '/throne-room'
];

// Paths that are public
const publicPaths = [
  '/',
  '/pathways',
  '/gateway',
  '/archives',
  '/hall-of-nobles',
  '/api/auth'
];

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 100 // requests per window
};

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `ratelimit:${ip}`;
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now - entry.resetAt > RATE_LIMIT.windowMs) {
    entry = {
      count: 1,
      resetAt: now
    };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  if (entry.count >= RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt + RATE_LIMIT.windowMs
    };
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: RATE_LIMIT.maxRequests - entry.count
  };
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.resetAt > RATE_LIMIT.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get client IP address
 */
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

/**
 * Check if path matches pattern
 */
function pathMatches(pathname, patterns) {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

/**
 * Check if user is staff
 */
function isStaff(roles) {
  const staffRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074', // Admin
    '1409148504026120293', // Head Mod
    '1408079849377107989'  // Moderator
  ];
  
  return roles?.some(role => staffRoleIds.includes(role));
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes we don't want to protect
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/Assets') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth/') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }
  
  // ============================================================================
  // RATE LIMITING
  // ============================================================================
  
  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = checkRateLimit(ip);
  
  if (!allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetAt.toString()
      }
    });
  }
  
  // ============================================================================
  // AUTHENTICATION CHECK
  // ============================================================================
  
  // Get token from session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Check if path requires authentication
  const requiresAuth = pathMatches(pathname, protectedPaths);
  const requiresStaff = pathMatches(pathname, staffPaths);
  
  // Redirect to login if authentication required but not authenticated
  if (requiresAuth && !token) {
    const loginUrl = new URL('/api/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check staff access
  if (requiresStaff && token) {
    if (!isStaff(token.roles)) {
      // Redirect non-staff to dashboard
      return NextResponse.redirect(new URL('/chambers/dashboard', request.url));
    }
  }
  
  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================
  
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self' https://discord.com https://*.supabase.co",
    "frame-src 'self' https://discord.com"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  
  // Add user info to headers if authenticated
  if (token) {
    response.headers.set('X-User-Id', token.sub);
    response.headers.set('X-User-Roles', JSON.stringify(token.roles || []));
  }
  
  return response;
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|Assets|Audio).*)',
  ]
};