// ============================================================================
// DATA FOLDER INDEX
// Central export file for all data modules
// /src/data/index.js
// ============================================================================

import pathwaysData, {
  PATHWAYS,
  getPathwayById,
  getAllPathways,
  getPathwayByRoleId,
  getActivePathways,
  getFeaturedPathways,
  getPathwayColor,
  getPathwayGradient,
  getPathwayIcon,
  canJoinPathway,
  getPathwayStats
} from './pathways';

import staffData, {
  STAFF_TIERS,
  STAFF_POSITIONS,
  STAFF_MEMBERS,
  APPLICATION_REQUIREMENTS,
  getStaffPosition,
  getStaffPositionByRole,
  getAllStaffPositions,
  getStaffByTier,
  getStaffMemberById,
  getActiveStaffMembers,
  getFeaturedStaff,
  isStaffMember,
  getStaffHierarchy,
  getStaffStats
} from './staff';

import eventsData, {
  EVENT_TYPES,
  EVENT_STATUS,
  RECURRING_EVENTS,
  EVENT_TEMPLATES,
  getEventType,
  getRecurringEventsByPathway,
  getActiveRecurringEvents,
  getNextOccurrence,
  getUpcomingEvents,
  createEventFromTemplate,
  getEventsByType,
  getEventStats,
  formatEventTime,
  canJoinEvent
} from './events';

import loreData, {
  REALM_LORE,
  HISTORICAL_MILESTONES,
  CODEX_ENTRIES,
  LEGENDS,
  REALM_ACHIEVEMENTS,
  REALM_QUOTES,
  getLoreEntry,
  getAllCodexEntries,
  getCodexByCategory,
  getHistoricalMilestones,
  getMilestonesByCategory,
  getAchievementsByPathway,
  getAllAchievements,
  getAchievementsByRarity,
  getRandomQuote,
  getQuotesByCategory,
  calculateAchievementXP,
  getAchievementById,
  getLoreStats,
  searchLore
} from './lore';

// ============================================================================
// UNIFIED DATA EXPORTS
// ============================================================================

export {
  // Pathways
  pathwaysData,
  PATHWAYS,
  getPathwayById,
  getAllPathways,
  getPathwayByRoleId,
  getActivePathways,
  getFeaturedPathways,
  getPathwayColor,
  getPathwayGradient,
  getPathwayIcon,
  canJoinPathway,
  getPathwayStats,
  
  // Staff
  staffData,
  STAFF_TIERS,
  STAFF_POSITIONS,
  STAFF_MEMBERS,
  APPLICATION_REQUIREMENTS,
  getStaffPosition,
  getStaffPositionByRole,
  getAllStaffPositions,
  getStaffByTier,
  getStaffMemberById,
  getActiveStaffMembers,
  getFeaturedStaff,
  isStaffMember,
  getStaffHierarchy,
  getStaffStats,
  
  // Events
  eventsData,
  EVENT_TYPES,
  EVENT_STATUS,
  RECURRING_EVENTS,
  EVENT_TEMPLATES,
  getEventType,
  getRecurringEventsByPathway,
  getActiveRecurringEvents,
  getNextOccurrence,
  getUpcomingEvents,
  createEventFromTemplate,
  getEventsByType,
  getEventStats,
  formatEventTime,
  canJoinEvent,
  
  // Lore
  loreData,
  REALM_LORE,
  HISTORICAL_MILESTONES,
  CODEX_ENTRIES,
  LEGENDS,
  REALM_ACHIEVEMENTS,
  REALM_QUOTES,
  getLoreEntry,
  getAllCodexEntries,
  getCodexByCategory,
  getHistoricalMilestones,
  getMilestonesByCategory,
  getAchievementsByPathway,
  getAllAchievements,
  getAchievementsByRarity,
  getRandomQuote,
  getQuotesByCategory,
  calculateAchievementXP,
  getAchievementById,
  getLoreStats,
  searchLore
};

// ============================================================================
// COMBINED UTILITY FUNCTIONS
// ============================================================================

/**
 * Get complete realm data for a specific pathway
 */
export function getCompletePathwayData(pathwayId) {
  const pathway = getPathwayById(pathwayId);
  if (!pathway) return null;
  
  return {
    ...pathway,
    events: getRecurringEventsByPathway(pathwayId),
    achievements: getAchievementsByPathway(pathwayId),
    stats: getPathwayStats(pathwayId)
  };
}

/**
 * Get user's complete profile data
 */
export function getUserProfileData(userId, userRoles = [], earnedAchievements = []) {
  const accessiblePathways = userRoles
    .map(roleId => getPathwayByRoleId(roleId))
    .filter(Boolean);
  
  const staffPosition = userRoles
    .map(roleId => getStaffPositionByRole(roleId))
    .filter(Boolean)[0];
  
  const totalXP = calculateAchievementXP(earnedAchievements);
  
  return {
    pathways: accessiblePathways,
    staffPosition,
    achievements: earnedAchievements.map(id => getAchievementById(id)).filter(Boolean),
    totalXP,
    isStaff: !!staffPosition
  };
}

/**
 * Get dashboard data for user
 */
export function getDashboardData(userRoles = []) {
  return {
    pathways: getAllPathways(),
    accessiblePathways: userRoles
      .map(roleId => getPathwayByRoleId(roleId))
      .filter(Boolean),
    upcomingEvents: getUpcomingEvents(),
    featuredStaff: getFeaturedStaff(),
    realmQuote: getRandomQuote(),
    stats: {
      pathways: getAllPathways().length,
      staff: getStaffStats(),
      events: getEventStats()
    }
  };
}

/**
 * Get complete realm statistics
 */
export function getRealmStatistics() {
  return {
    pathways: {
      total: getAllPathways().length,
      active: getActivePathways().length,
      featured: getFeaturedPathways().length
    },
    staff: getStaffStats(),
    events: getEventStats(),
    lore: getLoreStats(),
    achievements: {
      total: getAllAchievements().length,
      byRarity: {
        common: getAchievementsByRarity('common').length,
        uncommon: getAchievementsByRarity('uncommon').length,
        rare: getAchievementsByRarity('rare').length,
        legendary: getAchievementsByRarity('legendary').length
      }
    }
  };
}

/**
 * Search all data
 */
export function searchAllData(query) {
  const results = {
    pathways: [],
    staff: [],
    events: [],
    lore: []
  };
  
  const searchTerm = query.toLowerCase();
  
  // Search pathways
  getAllPathways().forEach(pathway => {
    if (pathway.name.toLowerCase().includes(searchTerm) ||
        pathway.description.toLowerCase().includes(searchTerm)) {
      results.pathways.push(pathway);
    }
  });
  
  // Search staff
  getActiveStaffMembers().forEach(member => {
    if (member.username.toLowerCase().includes(searchTerm) ||
        member.displayName.toLowerCase().includes(searchTerm)) {
      results.staff.push(member);
    }
  });
  
  // Search events
  getActiveRecurringEvents().forEach(event => {
    if (event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm)) {
      results.events.push(event);
    }
  });
  
  // Search lore
  results.lore = searchLore(query);
  
  return results;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  pathways: pathwaysData,
  staff: staffData,
  events: eventsData,
  lore: loreData,
  utils: {
    getCompletePathwayData,
    getUserProfileData,
    getDashboardData,
    getRealmStatistics,
    searchAllData
  }
};