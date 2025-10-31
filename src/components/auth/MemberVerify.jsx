export default MemberVerify;import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import LoadingCrest from './LoadingCrest';
import { TextFlameButton, TextDimButton } from './LuxuryButton';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEMBER VERIFY COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium Discord server membership verification component with auto-invite.
 * Verifies user is a member of The Conclave Discord server and handles
 * non-members gracefully with automatic server invitation.
 * 
 * Features:
 * - Real-time membership verification
 * - Automatic Discord server invite for non-members
 * - Beautiful verification status displays
 * - Retry mechanism with exponential backoff
 * - Loading states with LoadingCrest
 * - Error handling and recovery
 * - Cache management
 * - Integration with forms
 * - Debug mode
 * 
 * @component
 * @example
 * @version 1.0
 * // Basic usage
 * <MemberVerify>
 *   <RestrictedContent />
 * </MemberVerify>
 * 
 * // With custom behavior
 * <MemberVerify
 *   autoInvite
 *   onVerified={(user) => console.log('Verified:', user)}
 *   onNonMember={(user) => console.log('Not a member:', user)}
 * >
 *   <MemberOnlyFeatures />
 * </MemberVerify>
 * 
 * // As form integration
 * <MemberVerify
 *   mode="inline"
 *   showBadge
 *   requireVerification
 * />
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════


const VERIFICATION_STATUS = {
  CHECKING: 'checking',
  VERIFIED: 'verified',
  NOT_MEMBER: 'not_member',
  ERROR: 'error',
  NO_SESSION: 'no_session',
  INVITING: 'inviting',
  INVITED: 'invited',
};

const STATUS_MESSAGES = {
  [VERIFICATION_STATUS.CHECKING]: {
    title: 'Verifying Membership',
    message: 'Checking your Discord server membership...',
    icon: '🔍',
  },
  [VERIFICATION_STATUS.VERIFIED]: {
    title: 'Verified Member',
    message: 'You are a member of The Conclave Discord server.',
    icon: '✓',
  },
  [VERIFICATION_STATUS.NOT_MEMBER]: {
    title: 'Join The Conclave',
    message: 'You are not yet a member of our Discord server.',
    icon: '📧',
  },
  [VERIFICATION_STATUS.ERROR]: {
    title: 'Verification Failed',
    message: 'Unable to verify your membership. Please try again.',
    icon: '⚠️',
  },
  [VERIFICATION_STATUS.NO_SESSION]: {
    title: 'Authentication Required',
    message: 'Please sign in with Discord to verify membership.',
    icon: '🔒',
  },
  [VERIFICATION_STATUS.INVITING]: {
    title: 'Joining Server',
    message: 'Adding you to The Conclave Discord server...',
    icon: '⏳',
  },
  [VERIFICATION_STATUS.INVITED]: {
    title: 'Successfully Joined',
    message: 'You have been added to The Conclave Discord server!',
    icon: '🎉',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get cached membership status
 */
const getCachedStatus = (userId) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheData = localStorage.getItem(VERIFY_CONFIG.cacheKey);
    if (!cacheData) return null;
    
    const cache = JSON.parse(cacheData);
    const userCache = cache[userId];
    
    if (!userCache) return null;
    
    const cacheAge = Date.now() - userCache.timestamp;
    if (cacheAge > VERIFY_CONFIG.cacheDuration) {
      return null; // Cache expired
    }
    
    return userCache.isMember;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};

/**
 * Set cached membership status
 */
const setCachedStatus = (userId, isMember) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = localStorage.getItem(VERIFY_CONFIG.cacheKey) || '{}';
    const cache = JSON.parse(cacheData);
    
    cache[userId] = {
      isMember,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(VERIFY_CONFIG.cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.error('Cache storage error:', error);
  }
};

/**
 * Clear membership cache
 */
const clearCache = (userId = null) => {
  if (typeof window === 'undefined') return;
  
  if (userId) {
    try {
      const cacheData = localStorage.getItem(VERIFY_CONFIG.cacheKey) || '{}';
      const cache = JSON.parse(cacheData);
      delete cache[userId];
      localStorage.setItem(VERIFY_CONFIG.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  } else {
    localStorage.removeItem(VERIFY_CONFIG.cacheKey);
  }
};

/**
 * Get session from localStorage
 */
const getSession = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem('conclave_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    const expiresAt = new Date(session.expiresAt);
    
    if (expiresAt > new Date()) {
      return session;
    } else {
      localStorage.removeItem('conclave_session');
      return null;
    }
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
};

/**
 * Calculate retry delay with exponential backoff
 */
const getRetryDelay = (attempt) => {
  return VERIFY_CONFIG.retryDelay * Math.pow(2, attempt);
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const MemberVerify = ({
  // Children to render when verified
  children,
  
  // Behavior
  autoInvite = true,
  requireVerification = false,
  blockOnNonMember = false,
  
  // Display Mode
  mode = 'full', // 'full', 'inline', 'badge', 'silent'
  showBadge = false,
  
  // Callbacks
  onVerified,
  onNonMember,
  onInvited,
  onError,
  
  // Customization
  verifiedContent,
  nonMemberContent,
  errorContent,
  loadingContent,
  
  // Cache
  useCache = true,
  
  // Advanced
  retryAttempts = VERIFY_CONFIG.retryAttempts,
  checkInterval = 0, // Auto-recheck interval (0 = disabled)
  debug = false,
  
  // Styling
  className = '',
  style = {},
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const [status, setStatus] = useState(VERIFICATION_STATUS.CHECKING);
  const [session, setSession] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const statusInfo = useMemo(() => {
    return STATUS_MESSAGES[status] || STATUS_MESSAGES[VERIFICATION_STATUS.ERROR];
  }, [status]);

  const containerClasses = useMemo(() => {
    const base = 'member-verify';
    const modeClass = `member-verify--${mode}`;
    const statusClass = `member-verify--${status}`;
    
    return [base, modeClass, statusClass, className].filter(Boolean).join(' ');
  }, [mode, status, className]);

  const canRetry = useMemo(() => {
    return retryCount < retryAttempts && status === VERIFICATION_STATUS.ERROR;
  }, [retryCount, retryAttempts, status]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const verifyMembership = useCallback(async () => {
    setCheckCount(prev => prev + 1);
    
    // Get session
    const currentSession = getSession();
    setSession(currentSession);
    
    if (!currentSession) {
      setStatus(VERIFICATION_STATUS.NO_SESSION);
      return;
    }
    
    // Check cache first
    if (useCache) {
      const cached = getCachedStatus(currentSession.userId);
      if (cached !== null) {
        if (debug) {
          console.log('✅ MemberVerify: Using cached status', cached);
        }
        
        setStatus(cached ? VERIFICATION_STATUS.VERIFIED : VERIFICATION_STATUS.NOT_MEMBER);
        
        if (cached && onVerified) {
          onVerified(currentSession);
        } else if (!cached && onNonMember) {
          onNonMember(currentSession);
        }
        
        return;
      }
    }
    
    setStatus(VERIFICATION_STATUS.CHECKING);
    setError(null);
    
    if (debug) {
      console.log('🔍 MemberVerify: Checking membership', {
        userId: currentSession.userId,
        username: currentSession.username,
        checkCount,
      });
    }
    
    try {
      const response = await fetch('/api/discord/verify-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentSession.userId,
          guildId: VERIFY_CONFIG.guildId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMembershipData(data);
      
      if (data.isMember) {
        // User is a member
        setStatus(VERIFICATION_STATUS.VERIFIED);
        setCachedStatus(currentSession.userId, true);
        
        if (onVerified) {
          onVerified(currentSession);
        }
        
        if (debug) {
          console.log('✅ MemberVerify: User is a member');
        }
      } else {
        // User is not a member
        setStatus(VERIFICATION_STATUS.NOT_MEMBER);
        setCachedStatus(currentSession.userId, false);
        
        if (onNonMember) {
          onNonMember(currentSession);
        }
        
        if (debug) {
          console.log('❌ MemberVerify: User is not a member');
        }
        
        // Auto-invite if enabled
        if (autoInvite) {
          setTimeout(() => {
            handleAutoInvite(currentSession);
          }, 1000);
        }
      }
      
      // Reset retry count on success
      setRetryCount(0);
      
    } catch (err) {
      console.error('Membership verification error:', err);
      setError(err.message);
      setStatus(VERIFICATION_STATUS.ERROR);
      
      if (onError) {
        onError(err);
      }
      
      // Attempt retry
      if (retryCount < retryAttempts) {
        setIsRetrying(true);
        const delay = getRetryDelay(retryCount);
        
        if (debug) {
          console.log(`⏳ MemberVerify: Retrying in ${delay}ms (attempt ${retryCount + 1}/${retryAttempts})`);
        }
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setIsRetrying(false);
          verifyMembership();
        }, delay);
      }
    }
  }, [
    useCache,
    autoInvite,
    retryCount,
    retryAttempts,
    checkCount,
    debug,
    onVerified,
    onNonMember,
    onError,
  ]);

  const handleAutoInvite = useCallback(async (userSession) => {
    if (!autoInvite || status === VERIFICATION_STATUS.INVITING) return;
    
    setStatus(VERIFICATION_STATUS.INVITING);
    
    if (debug) {
      console.log('📧 MemberVerify: Auto-inviting user to server');
    }
    
    try {
      const response = await fetch('/api/discord/auto-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userSession.userId,
          guildId: VERIFY_CONFIG.guildId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Auto-invite failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(VERIFICATION_STATUS.INVITED);
        clearCache(userSession.userId); // Clear cache to force recheck
        
        // Update session to reflect membership
        const updatedSession = { ...userSession, isMember: true };
        localStorage.setItem('conclave_session', JSON.stringify(updatedSession));
        setSession(updatedSession);
        
        if (onInvited) {
          onInvited(updatedSession);
        }
        
        if (debug) {
          console.log('✅ MemberVerify: User successfully auto-invited');
        }
        
        // Recheck membership after invite
        setTimeout(() => {
          verifyMembership();
        }, 2000);
      }
    } catch (err) {
      console.error('Auto-invite error:', err);
      setStatus(VERIFICATION_STATUS.NOT_MEMBER);
      setError(err.message);
    }
  }, [autoInvite, status, debug, onInvited, verifyMembership]);

  const handleManualInvite = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(VERIFY_CONFIG.inviteLink, '_blank');
      
      if (debug) {
        console.log('🔗 MemberVerify: Manual invite link opened');
      }
      
      // Recheck after a delay
      setTimeout(() => {
        clearCache(session?.userId);
        verifyMembership();
      }, 5000);
    }
  }, [session, debug, verifyMembership]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    clearCache(session?.userId);
    verifyMembership();
  }, [session, verifyMembership]);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  
  // Initial verification
  useEffect(() => {
    verifyMembership();
  }, [verifyMembership]);

  // Periodic recheck
  useEffect(() => {
    if (!checkInterval || checkInterval <= 0) return;
    
    const interval = setInterval(() => {
      clearCache(session?.userId);
      verifyMembership();
    }, checkInterval);
    
    return () => clearInterval(interval);
  }, [checkInterval, session, verifyMembership]);

  // Listen for storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e) => {
      if (e.key === 'conclave_session') {
        verifyMembership();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [verifyMembership]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderBadge = () => {
    if (!showBadge && mode !== 'badge') return null;
    
    return (
      <div className="member-verify__badge" data-cursor="default">
        <span className="member-verify__badge-icon">{statusInfo.icon}</span>
        <span className="member-verify__badge-text">
          {status === VERIFICATION_STATUS.VERIFIED ? 'Verified Member' : 'Verification...'}
        </span>
      </div>
    );
  };

  const renderLoading = () => {
    if (loadingContent) return loadingContent;
    
    return (
      <div className="member-verify__loading" data-cursor="default">
        <LoadingCrest size={60} />
        <p className="member-verify__loading-message">{statusInfo.message}</p>
        {debug && (
          <p className="member-verify__loading-debug">
            Check #{checkCount} • Retry {retryCount}/{retryAttempts}
          </p>
        )}
      </div>
    );
  };

  const renderVerified = () => {
    if (verifiedContent) return verifiedContent;
    
    return (
      <div className="member-verify__verified" data-cursor="default">
        <div className="member-verify__verified-icon">{statusInfo.icon}</div>
        <div className="member-verify__verified-content">
          <h3 className="member-verify__verified-title">{statusInfo.title}</h3>
          <p className="member-verify__verified-message">{statusInfo.message}</p>
          {session && (
            <div className="member-verify__verified-info">
              <span className="member-verify__verified-user">
                {session.username}#{session.discriminator}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNonMember = () => {
    if (nonMemberContent) return nonMemberContent;
    
    return (
      <div className="member-verify__non-member" data-cursor="default">
        <div className="member-verify__non-member-icon">{statusInfo.icon}</div>
        <div className="member-verify__non-member-content">
          <h3 className="member-verify__non-member-title">{statusInfo.title}</h3>
          <p className="member-verify__non-member-message">{statusInfo.message}</p>
          
          {autoInvite ? (
            <p className="member-verify__non-member-hint">
              We're adding you to the server automatically...
            </p>
          ) : (
            <div className="member-verify__non-member-actions">
              <TextFlameButton onClick={handleManualInvite}>
                Join Discord Server
              </TextFlameButton>
              <TextDimButton onClick={handleRetry} size="sm">
                I'm Already a Member
              </TextDimButton>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (errorContent) return errorContent;
    
    return (
      <div className="member-verify__error" data-cursor="default">
        <div className="member-verify__error-icon">{statusInfo.icon}</div>
        <div className="member-verify__error-content">
          <h3 className="member-verify__error-title">{statusInfo.title}</h3>
          <p className="member-verify__error-message">{statusInfo.message}</p>
          
          {error && debug && (
            <p className="member-verify__error-details">{error}</p>
          )}
          
          <div className="member-verify__error-actions">
            {canRetry && !isRetrying && (
              <TextFlameButton onClick={handleRetry}>
                Retry Verification
              </TextFlameButton>
            )}
            {isRetrying && (
              <div className="member-verify__error-retrying">
                <LoadingCrest size={20} />
                <span>Retrying... ({retryCount}/{retryAttempts})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNoSession = () => {
    return (
      <div className="member-verify__no-session" data-cursor="default">
        <div className="member-verify__no-session-icon">{statusInfo.icon}</div>
        <div className="member-verify__no-session-content">
          <h3 className="member-verify__no-session-title">{statusInfo.title}</h3>
          <p className="member-verify__no-session-message">{statusInfo.message}</p>
          <div className="member-verify__no-session-actions">
            <Link href="/gateway">
              <TextFlameButton>Sign In with Discord</TextFlameButton>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderInviting = () => {
    return (
      <div className="member-verify__inviting" data-cursor="default">
        <LoadingCrest size={60} />
        <p className="member-verify__inviting-message">{statusInfo.message}</p>
      </div>
    );
  };

  const renderInvited = () => {
    return (
      <div className="member-verify__invited" data-cursor="default">
        <div className="member-verify__invited-icon">{statusInfo.icon}</div>
        <div className="member-verify__invited-content">
          <h3 className="member-verify__invited-title">{statusInfo.title}</h3>
          <p className="member-verify__invited-message">{statusInfo.message}</p>
          <p className="member-verify__invited-hint">
            Checking your new membership status...
          </p>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  // Silent mode - no UI, just verification
  if (mode === 'silent') {
    if (status === VERIFICATION_STATUS.VERIFIED || !requireVerification) {
      return <>{children}</>;
    }
    return null;
  }

  // Badge mode - show badge only
  if (mode === 'badge') {
    return renderBadge();
  }

  // Inline mode - compact status display
  if (mode === 'inline') {
    return (
      <div className={containerClasses} style={style} {...restProps}>
        {renderBadge()}
        {status === VERIFICATION_STATUS.CHECKING && renderLoading()}
        {status === VERIFICATION_STATUS.ERROR && renderError()}
      </div>
    );
  }

  // Full mode - complete UI
  return (
    <div className={containerClasses} style={style} {...restProps}>
      {/* Status Display */}
      {status === VERIFICATION_STATUS.CHECKING && renderLoading()}
      {status === VERIFICATION_STATUS.VERIFIED && (
        <>
          {renderVerified()}
          {children}
        </>
      )}
      {status === VERIFICATION_STATUS.NOT_MEMBER && (
        <>
          {renderNonMember()}
          {!blockOnNonMember && children}
        </>
      )}
      {status === VERIFICATION_STATUS.ERROR && renderError()}
      {status === VERIFICATION_STATUS.NO_SESSION && renderNoSession()}
      {status === VERIFICATION_STATUS.INVITING && renderInviting()}
      {status === VERIFICATION_STATUS.INVITED && renderInvited()}
      
      {/* Debug Panel */}
      {debug && (
        <div className="member-verify__debug">
          <details>
            <summary>MemberVerify Debug</summary>
            <pre>{JSON.stringify({
              status,
              checkCount,
              retryCount,
              hasSession: !!session,
              userId: session?.userId,
              username: session?.username,
              isMember: membershipData?.isMember,
              autoInvite,
              useCache,
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple badge display
 */
export const MemberBadge = (props) => (
  <MemberVerify mode="badge" {...props} />
);

/**
 * Inline verification status
 */
export const InlineVerify = (props) => (
  <MemberVerify mode="inline" showBadge {...props} />
);

/**
 * Silent verification (no UI)
 */
export const SilentVerify = (props) => (
  <MemberVerify mode="silent" {...props} />
);

/**
 * Member-only content wrapper
 */
export const MemberOnly = ({ children, ...props }) => (
  <MemberVerify 
    requireVerification 
    blockOnNonMember
    autoInvite
    {...props}
  >
    {children}
  </MemberVerify>
);

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { clearCache as clearMembershipCache };
export { VERIFICATION_STATUS };

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   MEMBER VERIFY - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify {
  width: 100%;
  font-family: 'Josefin Sans', sans-serif;
}

.member-verify--full {
  padding: 40px 24px;
}

.member-verify--inline {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

/* ═══════════════════════════════════════════════════════════════════════
   BADGE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.member-verify--verified .member-verify__badge {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.member-verify__badge-icon {
  font-size: 1.1rem;
}

.member-verify__badge-text {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  text-align: center;
}

.member-verify__loading-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  animation: fadeInOut 2s ease-in-out infinite;
}

.member-verify__loading-debug {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 8px 0 0 0;
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   VERIFIED STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__verified {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
  animation: slideInUp 0.5s ease;
}

.member-verify__verified-icon {
  font-size: 3rem;
  color: #4CAF50;
  flex-shrink: 0;
}

.member-verify__verified-content {
  flex: 1;
}

.member-verify__verified-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4CAF50;
  margin: 0 0 8px 0;
}

.member-verify__verified-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
}

.member-verify__verified-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-verify__verified-user {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   NON-MEMBER STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__non-member {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05));
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
  animation: slideInUp 0.5s ease;
}

.member-verify__non-member-icon {
  font-size: 3rem;
  color: #FF9800;
  flex-shrink: 0;
}

.member-verify__non-member-content {
  flex: 1;
}

.member-verify__non-member-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF9800;
  margin: 0 0 8px 0;
}

.member-verify__non-member-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
}

.member-verify__non-member-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-style: italic;
}

.member-verify__non-member-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

/* ═══════════════════════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__error {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05));
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 16px;
  animation: shake 0.5s ease;
}

.member-verify__error-icon {
  font-size: 3rem;
  color: #F44336;
  flex-shrink: 0;
}

.member-verify__error-content {
  flex: 1;
}

.member-verify__error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #F44336;
  margin: 0 0 8px 0;
}

.member-verify__error-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
}

.member-verify__error-details {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.member-verify__error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.member-verify__error-retrying {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* ═══════════════════════════════════════════════════════════════════════
   NO SESSION STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__no-session {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
  animation: slideInUp 0.5s ease;
}

.member-verify__no-session-icon {
  font-size: 3rem;
  color: #FFD700;
  flex-shrink: 0;
}

.member-verify__no-session-content {
  flex: 1;
}

.member-verify__no-session-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFD700;
  margin: 0 0 8px 0;
}

.member-verify__no-session-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
}

.member-verify__no-session-actions {
  display: flex;
  gap: 12px;
}

/* ═══════════════════════════════════════════════════════════════════════
   INVITING STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__inviting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  text-align: center;
}

.member-verify__inviting-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  animation: fadeInOut 2s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════════════════
   INVITED STATE
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__invited {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05));
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 16px;
  animation: slideInUp 0.5s ease, pulse 2s ease-in-out infinite;
}

.member-verify__invited-icon {
  font-size: 3rem;
  color: #4CAF50;
  flex-shrink: 0;
  animation: bounce 1s ease infinite;
}

.member-verify__invited-content {
  flex: 1;
}

.member-verify__invited-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4CAF50;
  margin: 0 0 8px 0;
}

.member-verify__invited-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
}

.member-verify__invited-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-style: italic;
}

/* ═══════════════════════════════════════════════════════════════════════
   DEBUG PANEL
   ═══════════════════════════════════════════════════════════════════════ */

.member-verify__debug {
  margin-top: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.85rem;
}

.member-verify__debug summary {
  cursor: pointer;
  color: #FFD700;
  margin-bottom: 8px;
}

.member-verify__debug pre {
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .member-verify__verified,
  .member-verify__non-member,
  .member-verify__error,
  .member-verify__no-session,
  .member-verify__invited {
    flex-direction: column;
    text-align: center;
  }
  
  .member-verify__verified-icon,
  .member-verify__non-member-icon,
  .member-verify__error-icon,
  .member-verify__no-session-icon,
  .member-verify__invited-icon {
    font-size: 2.5rem;
  }
  
  .member-verify__verified-title,
  .member-verify__non-member-title,
  .member-verify__error-title,
  .member-verify__no-session-title,
  .member-verify__invited-title {
    font-size: 1.3rem;
  }
  
  .member-verify__non-member-actions,
  .member-verify__error-actions,
  .member-verify__no-session-actions {
    width: 100%;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .member-verify--full {
    padding: 24px 16px;
  }
  
  .member-verify__verified,
  .member-verify__non-member,
  .member-verify__error,
  .member-verify__no-session,
  .member-verify__invited {
    padding: 20px;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'member-verify-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

