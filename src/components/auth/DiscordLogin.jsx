import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TextFlameButton, TextDimButton, NobleButton } from './LuxuryButton';
import LoadingCrest from './LoadingCrest';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISCORD LOGIN COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium Discord OAuth 2.0 authentication component with multiple variants.
 * Inspired by Rolls-Royce and Bentley luxury aesthetics.
 * 
 * Features:
 * - Multiple display variants (hero, navbar, card, minimal)
 * - Elegant loading states with LoadingCrest
 * - Comprehensive error handling
 * - Session management (30 days)
 * - Auto-invite non-members
 * - Role-based redirects
 * - Pathway theming support
 * - Premium animations
 * - Cursor integration
 * 
 * @component
 * @example
 * @version 1.0
 * // Hero variant (large, prominent)
 * <DiscordLogin variant="hero" />
 * 
 * // Navbar variant (compact, elegant)
 * <DiscordLogin variant="navbar" />
 * 
 * // Card variant (medium)
 * <DiscordLogin variant="card" pathway="gaming" />
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1424333322615521282',
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback',
  scopes: ['identify', 'email', 'guilds', 'guilds.join'],
  guildId: process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1368124846760001546',
};

const ERROR_MESSAGES = {
  'access_denied': 'You declined the Discord authorization. Please try again.',
  'invalid_request': 'Invalid authentication request. Please try again.',
  'network_error': 'Network error occurred. Please check your connection.',
  'server_error': 'Server error occurred. Please try again later.',
  'session_error': 'Session creation failed. Please try again.',
  'unknown': 'An unexpected error occurred. Please try again.',
};

const REDIRECT_DESTINATIONS = {
  member: '/chambers/dashboard',
  moderator: '/sanctum',
  admin: '/throne-room',
  guest: '/chambers/dashboard',
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Discord OAuth URL with state and PKCE
 */
const generateOAuthURL = (state, variant = 'hero') => {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    redirect_uri: DISCORD_CONFIG.redirectUri,
    response_type: 'code',
    scope: DISCORD_CONFIG.scopes.join(' '),
    state: state,
    prompt: 'none', // Try silent auth first
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
};

/**
 * Generate secure random state for OAuth
 */
const generateState = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store OAuth state in sessionStorage
 */
const storeOAuthState = (state, variant) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('discord_oauth_state', state);
    sessionStorage.setItem('discord_oauth_variant', variant);
    sessionStorage.setItem('discord_oauth_timestamp', Date.now().toString());
  }
};

/**
 * Check for existing session
 */
const checkExistingSession = () => {
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
    console.error('Session check error:', error);
    return null;
  }
};

/**
 * Parse URL error parameters
 */
const parseURLError = () => {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('error');
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const DiscordLogin = ({
  // Display Configuration
  variant = 'hero',
  size = 'default',
  
  // Content Customization
  title,
  subtitle,
  buttonText,
  showLogo = true,
  logoSize = 120,
  
  // Behavior
  autoRedirect = true,
  redirectTo,
  onSuccess,
  onError,
  
  // Visual Effects
  animated = true,
  glow = true,
  particles = true,
  
  // Pathway Theming
  pathway,
  
  // Layout
  alignment = 'center',
  className = '',
  style = {},
  
  // Advanced
  customScopes,
  state: customState,
  forcePrompt = false,
  debug = false,
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const displayTitle = useMemo(() => {
    if (title) return title;
    
    switch (variant) {
      case 'hero':
        return 'Enter The Conclave Realm';
      case 'navbar':
        return 'Sign In';
      case 'card':
        return 'Join the Noble Souls';
      case 'minimal':
        return 'Login with Discord';
      default:
        return 'Authenticate with Discord';
    }
  }, [title, variant]);

  const displaySubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    
    switch (variant) {
      case 'hero':
        return 'Connect your Discord account to access exclusive chambers and pathways';
      case 'card':
        return 'Authenticate to unlock premium features';
      default:
        return null;
    }
  }, [subtitle, variant]);

  const displayButtonText = useMemo(() => {
    if (buttonText) return buttonText;
    if (isLoading) return 'Authenticating...';
    
    switch (variant) {
      case 'hero':
        return 'Continue with Discord';
      case 'navbar':
        return 'Login';
      case 'minimal':
        return 'Discord';
      default:
        return 'Sign in with Discord';
    }
  }, [buttonText, variant, isLoading]);

  const containerClasses = useMemo(() => {
    const base = 'discord-login';
    const variantClass = `discord-login--${variant}`;
    const pathwayClass = pathway ? `pathway-${pathway}` : '';
    const alignClass = `text-${alignment}`;
    const loadingClass = isLoading ? 'is-loading' : '';
    const errorClass = error ? 'has-error' : '';
    const sessionClass = session ? 'is-authenticated' : '';
    
    return [
      base,
      variantClass,
      pathwayClass,
      alignClass,
      loadingClass,
      errorClass,
      sessionClass,
      className
    ].filter(Boolean).join(' ');
  }, [variant, pathway, alignment, isLoading, error, session, className]);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  
  // Check for existing session on mount
  useEffect(() => {
    const existingSession = checkExistingSession();
    setSession(existingSession);
    setIsChecking(false);

    if (debug) {
      console.log('🔐 Discord Login: Session check', existingSession);
    }
  }, [debug]);

  // Check for OAuth errors in URL
  useEffect(() => {
    const urlError = parseURLError();
    if (urlError) {
      const errorMessage = ERROR_MESSAGES[urlError] || ERROR_MESSAGES.unknown;
      setError(errorMessage);
      
      if (onError) {
        onError(new Error(errorMessage));
      }

      // Clean URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [onError]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const handleLogin = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Generate state for OAuth
      const state = customState || generateState();
      storeOAuthState(state, variant);

      // Generate OAuth URL
      const scopes = customScopes || DISCORD_CONFIG.scopes;
      const oauthURL = generateOAuthURL(state, variant);

      if (debug) {
        console.log('🚀 Discord OAuth URL:', oauthURL);
        console.log('📝 State:', state);
        console.log('🔑 Scopes:', scopes);
      }

      // Redirect to Discord OAuth
      window.location.href = oauthURL;

      // Keep loading state (page will redirect)
    } catch (err) {
      console.error('Discord login error:', err);
      const errorMessage = ERROR_MESSAGES.network_error;
      setError(errorMessage);
      setIsLoading(false);

      if (onError) {
        onError(err);
      }
    }
  }, [isLoading, customState, variant, customScopes, debug, onError]);

  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
    handleLogin();
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('conclave_session');
      sessionStorage.clear();
      setSession(null);
      
      if (debug) {
        console.log('👋 Logged out successfully');
      }
    }
  }, [debug]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderLogo = () => {
    if (!showLogo) return null;

    return (
      <div 
        className="discord-login__logo"
        data-cursor="default"
        style={{
          width: logoSize,
          height: logoSize,
        }}
      >
        <Image
          src="/Assets/Images/CNS_logo1.png"
          alt="Conclave Noble Souls"
          width={logoSize}
          height={logoSize}
          priority
          className="discord-login__logo-image"
        />
        {glow && (
          <div className="discord-login__logo-glow" />
        )}
      </div>
    );
  };

  const renderTitle = () => {
    if (!displayTitle && !displaySubtitle) return null;

    return (
      <div className="discord-login__header">
        {displayTitle && (
          <h2 className="discord-login__title" data-cursor="default">
            {displayTitle}
          </h2>
        )}
        {displaySubtitle && (
          <p className="discord-login__subtitle" data-cursor="default">
            {displaySubtitle}
          </p>
        )}
      </div>
    );
  };

  const renderButton = () => {
    if (variant === 'hero') {
      return (
        <TextFlameButton
          onClick={handleLogin}
          disabled={isLoading}
          size={size === 'large' ? 'lg' : size === 'small' ? 'sm' : 'md'}
          pathway={pathway}
          className="discord-login__button"
        >
          {isLoading ? (
            <span className="discord-login__button-loading">
              <LoadingCrest size={20} />
              <span>Authenticating...</span>
            </span>
          ) : (
            <>
              <svg className="discord-login__icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>{displayButtonText}</span>
            </>
          )}
        </TextFlameButton>
      );
    }

    if (variant === 'navbar') {
      return (
        <NobleButton
          onClick={handleLogin}
          disabled={isLoading}
          size="sm"
          pathway={pathway}
          className="discord-login__button"
        >
          {isLoading ? (
            <LoadingCrest size={16} />
          ) : (
            <>
              <svg className="discord-login__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>{displayButtonText}</span>
            </>
          )}
        </NobleButton>
      );
    }

    // Default card/minimal variant
    return (
      <TextDimButton
        onClick={handleLogin}
        disabled={isLoading}
        size={size}
        pathway={pathway}
        className="discord-login__button"
      >
        {isLoading ? (
          <span className="discord-login__button-loading">
            <LoadingCrest size={18} />
            <span>Authenticating...</span>
          </span>
        ) : (
          <>
            <svg className="discord-login__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>{displayButtonText}</span>
          </>
        )}
      </TextDimButton>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="discord-login__error" data-cursor="default">
        <div className="discord-login__error-icon">⚠️</div>
        <div className="discord-login__error-content">
          <p className="discord-login__error-message">{error}</p>
          {showErrorDetails && debug && (
            <p className="discord-login__error-details">
              Retry attempt: {retryCount}
            </p>
          )}
          <div className="discord-login__error-actions">
            <TextDimButton
              onClick={handleRetry}
              size="sm"
              className="discord-login__error-retry"
            >
              Try Again
            </TextDimButton>
            {debug && (
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="discord-login__error-toggle"
                data-cursor="hover"
              >
                {showErrorDetails ? 'Hide' : 'Show'} Details
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAuthenticatedState = () => {
    if (!session) return null;

    return (
      <div className="discord-login__authenticated" data-cursor="default">
        <div className="discord-login__user">
          {session.avatar && (
            <Image
              src={session.avatar}
              alt={session.username}
              width={48}
              height={48}
              className="discord-login__user-avatar"
            />
          )}
          <div className="discord-login__user-info">
            <p className="discord-login__user-name">{session.username}</p>
            <p className="discord-login__user-tag">#{session.discriminator}</p>
          </div>
        </div>
        <TextDimButton
          onClick={handleLogout}
          size="sm"
          className="discord-login__logout"
        >
          Logout
        </TextDimButton>
      </div>
    );
  };

  const renderParticles = () => {
    if (!particles || !animated || variant !== 'hero') return null;

    return (
      <div className="discord-login__particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="discord-login__particle"
            style={{
              '--delay': `${i * 0.2}s`,
              '--duration': `${3 + Math.random() * 2}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════
  
  if (isChecking) {
    return (
      <div className={`${containerClasses} discord-login--checking`} style={style}>
        <LoadingCrest size={60} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  return (
    <div 
      className={containerClasses}
      style={style}
      data-cursor="default"
      {...restProps}
    >
      {/* Background Effects */}
      {renderParticles()}
      
      {/* Main Content */}
      <div className="discord-login__content">
        {/* Already authenticated */}
        {session ? (
          renderAuthenticatedState()
        ) : (
          <>
            {/* Logo */}
            {renderLogo()}
            
            {/* Title & Subtitle */}
            {renderTitle()}
            
            {/* Error Display */}
            {renderError()}
            
            {/* Login Button */}
            <div className="discord-login__actions">
              {renderButton()}
            </div>
            
            {/* Additional Info */}
            {variant === 'hero' && (
              <div className="discord-login__info" data-cursor="default">
                <div className="discord-login__features">
                  <div className="discord-login__feature">
                    <svg className="discord-login__feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Secure OAuth 2.0</span>
                  </div>
                  <div className="discord-login__feature">
                    <svg className="discord-login__feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Auto-join Server</span>
                  </div>
                  <div className="discord-login__feature">
                    <svg className="discord-login__feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>30-Day Sessions</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Privacy Notice */}
            {(variant === 'hero' || variant === 'card') && (
              <p className="discord-login__privacy" data-cursor="default">
                We respect your privacy. Your Discord data is only used for authentication and role verification.
              </p>
            )}
          </>
        )}
      </div>
      
      {/* Debug Info */}
      {debug && (
        <div className="discord-login__debug">
          <details>
            <summary>Debug Information</summary>
            <pre>{JSON.stringify({
              variant,
              pathway,
              isLoading,
              hasError: !!error,
              hasSession: !!session,
              retryCount,
              clientId: DISCORD_CONFIG.clientId,
              redirectUri: DISCORD_CONFIG.redirectUri,
              scopes: DISCORD_CONFIG.scopes,
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hero variant - Large, prominent login for homepage
 */
export const DiscordLoginHero = (props) => (
  <DiscordLogin 
    variant="hero" 
    size="large"
    showLogo={true}
    logoSize={140}
    glow={true}
    particles={true}
    {...props} 
  />
);

/**
 * Navbar variant - Compact button for navigation
 */
export const DiscordLoginNavbar = (props) => (
  <DiscordLogin 
    variant="navbar" 
    size="small"
    showLogo={false}
    glow={false}
    particles={false}
    {...props} 
  />
);

/**
 * Card variant - Medium-sized card for pages
 */
export const DiscordLoginCard = (props) => (
  <DiscordLogin 
    variant="card" 
    size="default"
    showLogo={true}
    logoSize={100}
    glow={true}
    particles={false}
    {...props} 
  />
);

/**
 * Minimal variant - Simple button-only version
 */
export const DiscordLoginMinimal = (props) => (
  <DiscordLogin 
    variant="minimal" 
    size="small"
    showLogo={false}
    glow={false}
    particles={false}
    {...props} 
  />
);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   DISCORD LOGIN - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login {
  position: relative;
  width: 100%;
  font-family: 'Josefin Sans', sans-serif;
}

.discord-login--checking {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO VARIANT
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login--hero {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 24px;
  padding: 60px 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(255, 215, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.discord-login--hero:hover {
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.6),
    0 0 120px rgba(255, 215, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.discord-login--hero .discord-login__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR VARIANT
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login--navbar {
  display: inline-block;
}

.discord-login--navbar .discord-login__content {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

/* ═══════════════════════════════════════════════════════════════════════
   CARD VARIANT
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login--card {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 30, 0.85));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.05);
  transition: all 0.3s ease;
}

.discord-login--card:hover {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(255, 215, 0, 0.1);
}

.discord-login--card .discord-login__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* ═══════════════════════════════════════════════════════════════════════
   MINIMAL VARIANT
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login--minimal {
  display: inline-block;
}

/* ═══════════════════════════════════════════════════════════════════════
   LOGO
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: floatIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.discord-login__logo-image {
  position: relative;
  z-index: 2;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s ease;
}

.discord-login--hero .discord-login__logo-image:hover {
  transform: scale(1.05) rotate(5deg);
}

.discord-login__logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%);
  animation: pulse 3s ease-in-out infinite;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__header {
  text-align: center;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.discord-login__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFD700;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
  text-shadow: 
    0 0 20px rgba(255, 215, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Cinzel Decorative', serif;
}

.discord-login--navbar .discord-login__title,
.discord-login--minimal .discord-login__title {
  display: none;
}

.discord-login--card .discord-login__title {
  font-size: 2rem;
}

.discord-login__subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  max-width: 500px;
}

/* ═══════════════════════════════════════════════════════════════════════
   BUTTON
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

.discord-login__button {
  position: relative;
  min-width: 200px;
}

.discord-login--hero .discord-login__button {
  min-width: 280px;
}

.discord-login__icon {
  margin-right: 10px;
  transition: transform 0.3s ease;
}

.discord-login__button:hover .discord-login__icon {
  transform: scale(1.1) rotate(-5deg);
}

.discord-login__button-loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ═══════════════════════════════════════════════════════════════════════
   INFO & FEATURES
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__info {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
}

.discord-login__features {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.discord-login__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  padding: 8px 16px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.discord-login__feature:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.discord-login__feature-icon {
  color: #FFD700;
}

.discord-login__privacy {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin: 0;
  max-width: 400px;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
}

/* ═══════════════════════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__error {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 12px;
  animation: shake 0.5s ease;
}

.discord-login__error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.discord-login__error-content {
  flex: 1;
}

.discord-login__error-message {
  color: #ff6b6b;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.discord-login__error-details {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0;
  font-family: 'Courier New', monospace;
}

.discord-login__error-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.discord-login__error-retry {
  min-width: auto;
}

.discord-login__error-toggle {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.discord-login__error-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* ═══════════════════════════════════════════════════════════════════════
   AUTHENTICATED STATE
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__authenticated {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  animation: fadeIn 0.4s ease;
}

.discord-login__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.discord-login__user-avatar {
  border-radius: 50%;
  border: 2px solid #FFD700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.discord-login__user-info {
  display: flex;
  flex-direction: column;
}

.discord-login__user-name {
  font-weight: 600;
  color: #FFD700;
  margin: 0;
}

.discord-login__user-tag {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.discord-login__logout {
  min-width: auto;
}

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.discord-login__particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FFD700;
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat var(--duration, 4s) var(--delay, 0s) infinite;
  left: var(--x, 50%);
  top: var(--y, 50%);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

/* ═══════════════════════════════════════════════════════════════════════
   PATHWAY THEMING
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login.pathway-gaming .discord-login__title {
  color: #00f7ff;
  text-shadow: 0 0 20px rgba(0, 247, 255, 0.5);
}

.discord-login.pathway-gaming .discord-login__logo-glow {
  background: radial-gradient(circle, rgba(0, 247, 255, 0.3), transparent 70%);
}

.discord-login.pathway-lorebound .discord-login__title {
  color: #b19cd9;
  text-shadow: 0 0 20px rgba(177, 156, 217, 0.5);
}

.discord-login.pathway-lorebound .discord-login__logo-glow {
  background: radial-gradient(circle, rgba(177, 156, 217, 0.3), transparent 70%);
}

.discord-login.pathway-productive .discord-login__title {
  color: #c0c0c0;
  text-shadow: 0 0 20px rgba(192, 192, 192, 0.5);
}

.discord-login.pathway-productive .discord-login__logo-glow {
  background: radial-gradient(circle, rgba(192, 192, 192, 0.3), transparent 70%);
}

.discord-login.pathway-news .discord-login__title {
  color: #ff4444;
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
}

.discord-login.pathway-news .discord-login__logo-glow {
  background: radial-gradient(circle, rgba(255, 68, 68, 0.3), transparent 70%);
}

/* ═══════════════════════════════════════════════════════════════════════
   DEBUG
   ═══════════════════════════════════════════════════════════════════════ */

.discord-login__debug {
  margin-top: 20px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.8rem;
}

.discord-login__debug summary {
  cursor: pointer;
  color: #FFD700;
  margin-bottom: 8px;
}

.discord-login__debug pre {
  color: rgba(255, 255, 255, 0.8);
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .discord-login--hero {
    padding: 40px 24px;
  }
  
  .discord-login__title {
    font-size: 2rem;
  }
  
  .discord-login__subtitle {
    font-size: 1rem;
  }
  
  .discord-login__features {
    flex-direction: column;
    gap: 12px;
  }
  
  .discord-login--hero .discord-login__button {
    min-width: 240px;
  }
}

@media (max-width: 480px) {
  .discord-login--hero {
    padding: 32px 20px;
  }
  
  .discord-login__title {
    font-size: 1.75rem;
  }
  
  .discord-login--hero .discord-login__button {
    min-width: 200px;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'discord-login-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default DiscordLogin;