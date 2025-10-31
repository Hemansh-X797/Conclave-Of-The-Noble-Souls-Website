// ============================================================================
// PATHWAYS HOOK
// Manages pathway data and user pathway progress
// /src/hooks/usePathways.js
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import {
  getAllPathways,
  getPathwayById,
  getPathwayByRoleId,
  canJoinPathway
} from '@/data';

/**
 * usePathways - Manages pathway data and user access
 * NOTE: Join/leave functionality requires API implementation
 * Currently returns static data based on user roles
 */
export function usePathways(userRoles = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all available pathways
  const allPathways = useMemo(() => getAllPathways(), []);

  // Get user's current pathways based on roles
  const userPathways = useMemo(() => {
    return userRoles
      .map(roleId => getPathwayByRoleId(roleId))
      .filter(Boolean);
  }, [userRoles]);

  // Get available pathways user can join
  const availablePathways = useMemo(() => {
    return allPathways.filter(pathway => 
      canJoinPathway(pathway.id, userRoles)
    );
  }, [allPathways, userRoles]);

  // Check if user has specific pathway
  const hasPathway = useCallback((pathwayId) => {
    return userPathways.some(p => p.id === pathwayId);
  }, [userPathways]);

  // Get pathway by ID
  const getPathway = useCallback((pathwayId) => {
    return getPathwayById(pathwayId);
  }, []);

  return {
    allPathways,
    userPathways,
    availablePathways,
    hasPathway,
    getPathway,
    loading,
    error
  };
}

/**
 * usePathwayProgress - Track user progress in a pathway
 * NOTE: This is client-side only until API is implemented
 * For production, connect to /api/pathways/:id/progress/:userId
 */
export function usePathwayProgress(pathwayId, userId) {
  const [progress, setProgress] = useState({
    pathwayId,
    userId,
    level: 1,
    xp: 0,
    nextLevelXP: 1000,
    achievements: [],
    joinedAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local progress update (will be replaced with API call)
  const updateProgress = useCallback((progressData) => {
    setProgress(prev => ({
      ...prev,
      ...progressData
    }));
  }, []);

  // Add XP
  const addXP = useCallback((amount) => {
    setProgress(prev => {
      const newXP = prev.xp + amount;
      let newLevel = prev.level;
      let nextLevelXP = prev.nextLevelXP;

      // Level up logic
      if (newXP >= nextLevelXP) {
        newLevel += 1;
        nextLevelXP = newLevel * 1000; // Simple scaling
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        nextLevelXP
      };
    });
  }, []);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId) => {
    setProgress(prev => {
      if (prev.achievements.includes(achievementId)) {
        return prev;
      }

      return {
        ...prev,
        achievements: [...prev.achievements, achievementId]
      };
    });
  }, []);

  return {
    progress,
    updateProgress,
    addXP,
    unlockAchievement,
    loading,
    error
  };
}

export default usePathways;