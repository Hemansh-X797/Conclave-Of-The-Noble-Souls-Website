// ============================================================================
// AUTHENTICATION HOOK
// Manages user authentication state and Discord OAuth
// /src/hooks/useAuth.js
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'conclave_auth';
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const authData = JSON.parse(stored);
          
          // Validate token
          const response = await fetch('/api/auth/validate', {
            headers: {
              'Authorization': `Bearer ${authData.accessToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto-refresh token
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const authData = JSON.parse(stored);
          
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken: authData.refreshToken })
          });
          
          if (response.ok) {
            const newAuth = await response.json();
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuth));
          }
        }
      } catch (err) {
        console.error('Token refresh error:', err);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Login with Discord
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/discord/url');
      const { url } = await response.json();
      
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = useCallback(async (code) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/discord/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const authData = await response.json();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      setUser(authData.user);
      setIsAuthenticated(true);
      
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return;
      
      const authData = JSON.parse(stored);
      
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${authData.accessToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('User refresh error:', err);
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((roleId) => {
    if (!user?.roles) return false;
    return user.roles.includes(roleId);
  }, [user]);

  // Check if user has any of specified roles
  const hasAnyRole = useCallback((roleIds) => {
    if (!user?.roles) return false;
    return roleIds.some(roleId => user.roles.includes(roleId));
  }, [user]);

  // Check if user is in server
  const isInServer = useCallback(() => {
    return user?.inServer === true;
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    handleCallback,
    refreshUser,
    hasRole,
    hasAnyRole,
    isInServer
  };
}

export default useAuth;