import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LoadingCrest from './LoadingCrest';
import { TextFlameButton, TextDimButton } from './LuxuryButton';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isStaff,
  isVIP,
  getPermissionLevel,
  PERMISSIONS,
  PERMISSION_LEVELS
} from '@/constants/permissions.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH GUARD COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium route protection and role-based access control component.
 * Protects routes and enforces permission requirements with elegant UX.
 * 
 * Features:
 * - Session validation (30-day sessions)
 * - Role-based access control using permissions.js
 * - Permission checking (any, all, specific)
 * - Staff/VIP verification
 * - Permission level requirements
 * - Elegant loading states
 * - Beautiful error messages
 * - Automatic redirects
 * - Session refresh
 * - Debug mode
 * 
 * @component
 * @example
 * @version 1.0
 * // Protect route for authenticated users
 * <AuthGuard>
 *   <DashboardContent />
 * </AuthGuard>
 * 
 * // Require specific permission
 * <AuthGuard requirePermission={PERMISSIONS.ACCESS_DASHBOARD}>
 *   <MemberDashboard />
 * </AuthGuard>
 * 
 * // Require staff access
 * <AuthGuard requireStaff>
 *   <ModeratorPanel />
 * </AuthGuard>
 * 
 * // Require minimum permission level
 * <AuthGuard requireLevel={PERMISSION_LEVELS.MODERATOR}>
 *   <ModerationTools />
 * </AuthGuard>
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const AUTH_CONFIG = {
  sessionKey: 'conclave_session',
  sessionDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
  refreshThreshold: 7 * 24 * 60 * 60 * 1000, // Refresh if < 7 days left
};

const PROTECTED_ROUTES = {
  '/chambers': {
    requireAuth: true,
    requirePermission: PERMISSIONS.ACCESS_DASHBOARD,
  },
  '/sanctum': {
    requireAuth: true,
    requireStaff: true,
    requireLevel: PERMISSION_LEVELS.MODERATOR,
  },
  '/throne-room': {
    requireAuth: true,
    requireLevel: PERMISSION_LEVELS.ADMIN,
  },
};

const ERROR_TYPES = {
  NO_SESSION: 'no_session',
  SESSION_EXPIRED: 'session_expired',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  NOT_STAFF: 'not_staff',
  NOT_VIP: 'not_vip',
  LEVEL_TOO_LOW: 'level_too_low',
  NOT_MEMBER: 'not_member',
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.NO_SESSION]: {
    title: 'Authentication Required',
    message: 'You must be logged in to access this area of The Conclave.',
    action: 'Sign in with Discord',
  },
  [ERROR_TYPES.SESSION_EXPIRED]: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again to continue.',
    action: 'Sign in Again',
  },
  [ERROR_TYPES.INSUFFICIENT_PERMISSIONS]: {
    title: 'Insufficient Permissions',
    message: 'You do not have the required permissions to access this area.',
    action: 'Return to Dashboard',
  },
  [ERROR_TYPES.NOT_STAFF]: {
    title: 'Staff Access Required',
    message: 'This area is restricted to staff members only.',
    action: 'Return to Dashboard',
  },
  [ERROR_TYPES.NOT_VIP]: {
    title: 'VIP Access Required',
    message: 'This feature is exclusive to VIP members and Server Boosters.',
    action: 'Learn About VIP',
  },
  [ERROR_TYPES.LEVEL_TOO_LOW]: {
    title: 'Higher Rank Required',
    message: 'Your permission level is insufficient for this area.',
    action: 'Return to Dashboard',
  },
  [ERROR_TYPES.NOT_MEMBER]: {
    title: 'Server Member Required',
    message: 'You must be a member of The Conclave Discord server.',
    action: 'Join Server',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get session from localStorage
 */
const getSession = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(AUTH_CONFIG.sessionKey);
    if (!sessionData) return null;
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
};

/**
 * Validate session expiry
 */
const isSessionValid = (session) => {
  if (!session || !session.expiresAt) return false;
  
  const expiresAt = new Date(session.expiresAt);
  return expiresAt > new Date();
};

/**
 * Check if session needs refresh
 */
const needsRefresh = (session) => {
  if (!session || !session.expiresAt) return false;
  
  const expiresAt = new Date(session.expiresAt);
  const now = new Date();
  const timeLeft = expiresAt - now;
  
  return timeLeft < AUTH_CONFIG.refreshThreshold;
};

/**
 * Check route protection requirements
 */
const getRouteRequirements = (pathname) => {
  // Check exact matches
  if (PROTECTED_ROUTES[pathname]) {
    return PROTECTED_ROUTES[pathname];
  }
  
  // Check prefix matches
  for (const [route, requirements] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return requirements;
    }
  }
  
  return null;
};

/**
 * Validate user access
 */
const validateAccess = (session, requirements) => {
  if (!session) return ERROR_TYPES.NO_SESSION;
  if (!isSessionValid(session)) return ERROR_TYPES.SESSION_EXPIRED;
  
  const userRoles = session.roles || [];
  
  // Check member status
  if (requirements.requireMember && !session.isMember) {
    return ERROR_TYPES.NOT_MEMBER;
  }
  
  // Check staff requirement
  if (requirements.requireStaff && !isStaff(userRoles)) {
    return ERROR_TYPES.NOT_STAFF;
  }
  
  // Check VIP requirement
  if (requirements.requireVIP && !isVIP(userRoles)) {
    return ERROR_TYPES.NOT_VIP;
  }
  
  // Check permission level
  if (requirements.requireLevel) {
    const userLevel = getPermissionLevel(userRoles);
    if (userLevel < requirements.requireLevel) {
      return ERROR_TYPES.LEVEL_TOO_LOW;
    }
  }
  
  // Check specific permission
  if (requirements.requirePermission) {
    if (!hasPermission(userRoles, requirements.requirePermission)) {
      return ERROR_TYPES.INSUFFICIENT_PERMISSIONS;
    }
  }
  
  // Check any permissions
  if (requirements.requireAnyPermission) {
    if (!hasAnyPermission(userRoles, requirements.requireAnyPermission)) {
      return ERROR_TYPES.INSUFFICIENT_PERMISSIONS;
    }
  }
  
  // Check all permissions
  if (requirements.requireAllPermissions) {
    if (!hasAllPermissions(userRoles, requirements.requireAllPermissions)) {
      return ERROR_TYPES.INSUFFICIENT_PERMISSIONS;
    }
  }
  
  return null; // Access granted
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const AuthGuard = ({
  // Children to protect
  children,
  
  // Access Requirements
  requireAuth = true,
  requireMember = false,
  requireStaff = false,
  requireVIP = false,
  requireLevel,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  
  // Behavior
  redirectTo = '/gateway',
  fallback,
  onAccessDenied,
  onSessionExpired,
  onAccessGranted,
  
  // Loading
  loadingComponent,
  loadingMessage = 'Verifying your credentials...',
  
  // Error Display
  showError = true,
  errorComponent,
  
  // Advanced
  autoRefresh = true,
  checkInterval = 60000, // Check every minute
  debug = false,
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const router = useRouter();
  const pathname = usePathname();
  
  const [isChecking, setIsChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const requirements = useMemo(() => {
    // Use route-specific requirements if available
    const routeReqs = getRouteRequirements(pathname);
    if (routeReqs) return routeReqs;
    
    // Use component prop requirements
    return {
      requireAuth,
      requireMember,
      requireStaff,
      requireVIP,
      requireLevel,
      requirePermission,
      requireAnyPermission,
      requireAllPermissions,
    };
  }, [
    pathname,
    requireAuth,
    requireMember,
    requireStaff,
    requireVIP,
    requireLevel,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
  ]);

  const errorInfo = useMemo(() => {
    if (!error) return null;
    return ERROR_MESSAGES[error] || ERROR_MESSAGES[ERROR_TYPES.INSUFFICIENT_PERMISSIONS];
  }, [error]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const checkAccess = useCallback(() => {
    setCheckCount(prev => prev + 1);
    
    const currentSession = getSession();
    setSession(currentSession);
    
    if (debug) {
      console.log('🔒 AuthGuard: Checking access', {
        pathname,
        requirements,
        session: currentSession ? 'present' : 'absent',
      });
    }
    
    // If no auth required, grant access
    if (!requirements.requireAuth) {
      setIsChecking(false);
      return;
    }
    
    // Validate access
    const validationError = validateAccess(currentSession, requirements);
    
    if (validationError) {
      setError(validationError);
      setIsChecking(false);
      
      // Call error callbacks
      if (validationError === ERROR_TYPES.SESSION_EXPIRED && onSessionExpired) {
        onSessionExpired();
      } else if (onAccessDenied) {
        onAccessDenied(validationError);
      }
      
      if (debug) {
        console.log('❌ AuthGuard: Access denied', validationError);
      }
      
      return;
    }
    
    // Access granted
    setError(null);
    setIsChecking(false);
    
    if (onAccessGranted) {
      onAccessGranted(currentSession);
    }
    
    if (debug) {
      console.log('✅ AuthGuard: Access granted');
    }
    
    // Check if session needs refresh
    if (autoRefresh && needsRefresh(currentSession)) {
      refreshSession();
    }
  }, [
    pathname,
    requirements,
    autoRefresh,
    debug,
    onAccessDenied,
    onSessionExpired,
    onAccessGranted,
  ]);

  const refreshSession = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      if (debug) {
        console.log('🔄 AuthGuard: Refreshing session');
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.session) {
          localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(data.session));
          setSession(data.session);
          
          if (debug) {
            console.log('✅ AuthGuard: Session refreshed');
          }
        }
      }
    } catch (err) {
      console.error('Session refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, debug]);

  const handleRedirect = useCallback(() => {
    if (error === ERROR_TYPES.NO_SESSION || error === ERROR_TYPES.SESSION_EXPIRED) {
      router.push(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
    } else {
      router.push('/chambers/dashboard');
    }
  }, [error, redirectTo, pathname, router]);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  
  // Initial access check
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Periodic access check
  useEffect(() => {
    if (!checkInterval || checkInterval <= 0) return;
    
    const interval = setInterval(() => {
      checkAccess();
    }, checkInterval);
    
    return () => clearInterval(interval);
  }, [checkInterval, checkAccess]);

  // Listen for storage changes (logout in other tabs)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e) => {
      if (e.key === AUTH_CONFIG.sessionKey) {
        checkAccess();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAccess]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderLoading = () => {
    if (loadingComponent) return loadingComponent;
    
    return (
      <div className="auth-guard auth-guard--loading" data-cursor="default">
        <div className="auth-guard__loading-content">
          <LoadingCrest size={80} />
          <p className="auth-guard__loading-message">{loadingMessage}</p>
          {debug && (
            <p className="auth-guard__loading-debug">
              Check #{checkCount} • {pathname}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (errorComponent) return errorComponent;
    
    if (!showError) {
      // Silent redirect
      handleRedirect();
      return renderLoading();
    }
    
    return (
      <div className="auth-guard auth-guard--error" data-cursor="default">
        <div className="auth-guard__error-content">
          {/* Icon */}
          <div className="auth-guard__error-icon">
            {error === ERROR_TYPES.NO_SESSION || error === ERROR_TYPES.SESSION_EXPIRED ? (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            ) : (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          
          {/* Title */}
          <h2 className="auth-guard__error-title">
            {errorInfo.title}
          </h2>
          
          {/* Message */}
          <p className="auth-guard__error-message">
            {errorInfo.message}
          </p>
          
          {/* Session info for debugging */}
          {debug && session && (
            <div className="auth-guard__error-debug">
              <details>
                <summary>Session Information</summary>
                <pre>{JSON.stringify({
                  username: session.username,
                  roles: session.roles?.length || 0,
                  isMember: session.isMember,
                  expiresAt: session.expiresAt,
                  requirements,
                }, null, 2)}</pre>
              </details>
            </div>
          )}
          
          {/* Actions */}
          <div className="auth-guard__error-actions">
            <TextFlameButton onClick={handleRedirect}>
              {errorInfo.action}
            </TextFlameButton>
            {pathname !== '/' && (
              <TextDimButton onClick={() => router.push('/')}>
                Return Home
              </TextDimButton>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  // Loading state
  if (isChecking) {
    return renderLoading();
  }
  
  // Error state (access denied)
  if (error) {
    if (fallback) return fallback;
    return renderError();
  }
  
  // Success - render children
  return (
    <>
      {children}
      
      {/* Session refresh indicator */}
      {isRefreshing && (
        <div className="auth-guard__refresh-indicator" data-cursor="default">
          <LoadingCrest size={24} />
          <span>Refreshing session...</span>
        </div>
      )}
      
      {/* Debug panel */}
      {debug && (
        <div className="auth-guard__debug">
          <details>
            <summary>AuthGuard Debug</summary>
            <pre>{JSON.stringify({
              pathname,
              checkCount,
              isChecking,
              hasError: !!error,
              hasSession: !!session,
              isRefreshing,
              requirements,
              userRoles: session?.roles || [],
              userLevel: session?.roles ? getPermissionLevel(session.roles) : 0,
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HIGHER-ORDER COMPONENT VERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * HOC version of AuthGuard for wrapping pages
 */
export const withAuthGuard = (Component, guardProps = {}) => {
  const GuardedComponent = (props) => (
    <AuthGuard {...guardProps}>
      <Component {...props} />
    </AuthGuard>
  );
  
  GuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name || 'Component'})`;
  
  return GuardedComponent;
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET GUARDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Require authentication only
 */
export const AuthRequired = ({ children, ...props }) => (
  <AuthGuard requireAuth {...props}>
    {children}
  </AuthGuard>
);

/**
 * Require member status
 */
export const MemberOnly = ({ children, ...props }) => (
  <AuthGuard requireAuth requireMember {...props}>
    {children}
  </AuthGuard>
);

/**
 * Require staff access
 */
export const StaffOnly = ({ children, ...props }) => (
  <AuthGuard requireAuth requireStaff {...props}>
    {children}
  </AuthGuard>
);

/**
 * Require VIP access
 */
export const VIPOnly = ({ children, ...props }) => (
  <AuthGuard requireAuth requireVIP {...props}>
    {children}
  </AuthGuard>
);

/**
 * Require moderator level
 */
export const ModeratorOnly = ({ children, ...props }) => (
  <AuthGuard 
    requireAuth 
    requireLevel={PERMISSION_LEVELS.MODERATOR}
    {...props}
  >
    {children}
  </AuthGuard>
);

/**
 * Require admin level
 */
export const AdminOnly = ({ children, ...props }) => (
  <AuthGuard 
    requireAuth 
    requireLevel={PERMISSION_LEVELS.ADMIN}
    {...props}
  >
    {children}
  </AuthGuard>
);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   AUTH GUARD - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.auth-guard {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Josefin Sans', sans-serif;
  background: linear-gradient(135deg, #000000, #1a1a2e);
  position: relative;
  overflow: hidden;
}

.auth-guard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.05), transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.05), transparent 50%);
  animation: pulse 8s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════════════ */

.auth-guard--loading .auth-guard__loading-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.auth-guard__loading-message {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  animation: fadeInOut 2s ease-in-out infinite;
}

.auth-guard__loading-debug {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 8px 0 0 0;
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════════════════════ */

.auth-guard--error .auth-guard__error-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(255, 215, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-align: center;
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-guard__error-icon {
  color: #FFD700;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.auth-guard__error-icon svg {
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
}

.auth-guard__error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #FFD700;
  margin: 0 0 16px 0;
  font-family: 'Cinzel Decorative', serif;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.auth-guard__error-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.auth-guard__error-debug {
  margin: 24px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: left;
}

.auth-guard__error-debug summary {
  cursor: pointer;
  color: #FFD700;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.auth-guard__error-debug pre {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.auth-guard__error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

/* ═══════════════════════════════════════════════════════════════════════
   REFRESH INDICATOR
   ═══════════════════════════════════════════════════════════════════════ */

.auth-guard__refresh-indicator {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  animation: slideInRight 0.3s ease;
}

/* ═══════════════════════════════════════════════════════════════════════
   DEBUG PANEL
   ═══════════════════════════════════════════════════════════════════════ */

.auth-guard__debug {
  position: fixed;
  bottom: 24px;
  left: 24px;
  max-width: 400px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  font-size: 0.8rem;
}

.auth-guard__debug summary {
  cursor: pointer;
  color: #FFD700;
  margin-bottom: 8px;
}

.auth-guard__debug pre {
  color: rgba(255, 255, 255, 0.8);
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .auth-guard--error .auth-guard__error-content {
    padding: 40px 24px;
    margin: 20px;
  }
  
  .auth-guard__error-title {
    font-size: 1.75rem;
  }
  
  .auth-guard__error-message {
    font-size: 1rem;
  }
  
  .auth-guard__refresh-indicator,
  .auth-guard__debug {
    bottom: 16px;
    left: 16px;
    right: 16px;
    max-width: calc(100% - 32px);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'auth-guard-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default AuthGuard;