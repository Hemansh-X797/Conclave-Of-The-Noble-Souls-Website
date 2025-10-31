// ============================================================================
// DISCORD DATA HOOK
// Fetches and manages Discord server data
// /src/hooks/useDiscord.js
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

export function useDiscord() {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch server statistics
  const fetchServerStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = cache.get('serverStats');
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setServerData(cached.data);
        setLoading(false);
        return cached.data;
      }

      const response = await fetch('/api/discord/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch server stats');
      }

      const data = await response.json();
      
      // Update cache
      cache.set('serverStats', {
        data,
        timestamp: Date.now()
      });

      setServerData(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Discord stats error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchServerStats();
  }, [fetchServerStats]);

  // Verify user is in server
  const verifyMembership = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/discord/verify/${userId}`);
      if (!response.ok) {
        return false;
      }

      const { inServer } = await response.json();
      return inServer;
    } catch (err) {
      console.error('Membership verification error:', err);
      return false;
    }
  }, []);

  // Get user roles
  const getUserRoles = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/discord/roles/${userId}`);
      if (!response.ok) {
        return [];
      }

      const { roles } = await response.json();
      return roles;
    } catch (err) {
      console.error('Get roles error:', err);
      return [];
    }
  }, []);

  // Refresh server data
  const refresh = useCallback(() => {
    cache.delete('serverStats');
    return fetchServerStats();
  }, [fetchServerStats]);

  return {
    serverData,
    loading,
    error,
    refresh,
    verifyMembership,
    getUserRoles
  };
}

export function useDiscordMember(userId) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/discord/member/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch member data');
        }

        const data = await response.json();
        setMember(data);
      } catch (err) {
        setError(err.message);
        console.error('Member fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [userId]);

  return { member, loading, error };
}

export default useDiscord;