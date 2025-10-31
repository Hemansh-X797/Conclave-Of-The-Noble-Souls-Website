// ============================================================================
// AUTHENTICATION MIDDLEWARE
// For use in API routes
// /src/middleware/auth.js
// ============================================================================

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

/**
 * Middleware to check authentication
 * Attaches user info to request object
 * Usage: await authMiddleware(request);
 */
export async function authMiddleware(request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Attach user info to request for use in route handler
    request.user = {
      id: token.sub,
      username: token.username || token.name,
      email: token.email,
      roles: token.roles || [],
      image: token.picture
    };

    return null; // Continue to next middleware/handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Check if user is authenticated (returns boolean)
 */
export async function isAuthenticated(request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    return !!token;
  } catch {
    return false;
  }
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) return null;

    return {
      id: token.sub,
      username: token.username || token.name,
      email: token.email,
      roles: token.roles || [],
      image: token.picture
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(request) {
  const result = await authMiddleware(request);
  if (result) throw new Error('Authentication required');
  return request.user;
}

export default authMiddleware;