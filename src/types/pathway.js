// ============================================================================
// PATHWAY TYPE DEFINITIONS
// Type structures and validators for pathway data
// /src/types/pathway.js
// ============================================================================

/**
 * @typedef {Object} Pathway
 * @property {string} id - Unique pathway identifier ('gaming', 'lorebound', etc.)
 * @property {string} name - Short pathway name
 * @property {string} fullName - Full pathway name
 * @property {string} tagline - Pathway tagline
 * @property {string} icon - Emoji icon
 * @property {string} emoji - Emoji (same as icon)
 * @property {string} color - Primary color hex code
 * @property {string} gradient - CSS gradient string
 * @property {string} roleId - Discord role ID for pathway
 * @property {string|null} categoryId - Discord category ID
 * @property {string} description - Full description
 * @property {string} shortDescription - Brief description
 * @property {PathwayChannel[]} channels - Discord channels for pathway
 * @property {PathwayFeature[]} features - Key features
 * @property {string[]} games - Games (for gaming pathway)
 * @property {string[]} categories - Categories (for lorebound pathway)
 * @property {string[]} focusAreas - Focus areas (for productive pathway)
 * @property {PathwayRank[]} ranks - Progression ranks
 * @property {string[]} events - Regular events
 * @property {PathwayResource[]} resources - Learning resources
 * @property {PathwayStats} stats - Pathway statistics
 * @property {string} image - Hero image URL
 * @property {string} thumbnail - Thumbnail image URL
 * @property {string} banner - Banner image URL
 * @property {string} createdAt - ISO timestamp
 * @property {boolean} isActive - Whether pathway is active
 * @property {boolean} featured - Whether pathway is featured
 * @property {number} order - Display order
 */

/**
 * @typedef {Object} PathwayChannel
 * @property {string} name - Channel name
 * @property {string|null} id - Discord channel ID
 * @property {string} description - Channel description
 */

/**
 * @typedef {Object} PathwayFeature
 * @property {string} title - Feature title
 * @property {string} description - Feature description
 * @property {string} icon - Feature icon/emoji
 */

/**
 * @typedef {Object} PathwayRank
 * @property {string} name - Rank name
 * @property {number} xpRequired - XP required for rank
 * @property {string} icon - Rank icon/emoji
 */

/**
 * @typedef {Object} PathwayResource
 * @property {string} title - Resource title
 * @property {string} url - Resource URL
 */

/**
 * @typedef {Object} PathwayStats
 * @property {number} memberCount - Total members in pathway
 * @property {number} activeMembers - Active members (last 7 days)
 * @property {number} eventsHosted - Events hosted
 * @property {number} tournamentsCompleted - Tournaments completed (gaming)
 * @property {number} reviewsPosted - Reviews posted (lorebound)
 * @property {number} watchPartiesHosted - Watch parties (lorebound)
 * @property {number} challengesCompleted - Challenges completed (productive)
 * @property {number} goalsAchieved - Goals achieved (productive)
 * @property {number} articlesShared - Articles shared (news)
 * @property {number} discussionsHeld - Discussions held (news)
 */

/**
 * @typedef {Object} PathwayProgress
 * @property {string} userId - User ID
 * @property {string} pathwayId - Pathway ID
 * @property {number} level - Current level
 * @property {number} xp - Current XP
 * @property {number} nextLevelXP - XP needed for next level
 * @property {string} currentRank - Current rank name
 * @property {string[]} achievements - Unlocked achievement IDs
 * @property {string} joinedAt - ISO timestamp
 * @property {string} lastActive - ISO timestamp
 * @property {Object.<string, any>} customData - Pathway-specific data
 */

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validate pathway object structure
 * @param {Pathway} pathway - Pathway to validate
 * @returns {boolean}
 */
export function isValidPathway(pathway) {
  return (
    pathway &&
    typeof pathway.id === 'string' &&
    typeof pathway.name === 'string' &&
    typeof pathway.roleId === 'string' &&
    typeof pathway.color === 'string' &&
    typeof pathway.isActive === 'boolean'
  );
}

/**
 * Validate pathway progress structure
 * @param {PathwayProgress} progress - Progress to validate
 * @returns {boolean}
 */
export function isValidPathwayProgress(progress) {
  return (
    progress &&
    typeof progress.userId === 'string' &&
    typeof progress.pathwayId === 'string' &&
    typeof progress.level === 'number' &&
    typeof progress.xp === 'number' &&
    Array.isArray(progress.achievements)
  );
}

/**
 * Check if pathway ID is valid
 * @param {string} pathwayId - Pathway ID to check
 * @returns {boolean}
 */
export function isValidPathwayId(pathwayId) {
  const validIds = ['gaming', 'lorebound', 'productive', 'news'];
  return validIds.includes(pathwayId);
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Get next rank for pathway progress
 * @param {PathwayProgress} progress - Current progress
 * @param {PathwayRank[]} ranks - Available ranks
 * @returns {PathwayRank|null}
 */
export function getNextRank(progress, ranks) {
  const sortedRanks = [...ranks].sort((a, b) => a.xpRequired - b.xpRequired);
  return sortedRanks.find(rank => rank.xpRequired > progress.xp) || null;
}

/**
 * Get current rank for pathway progress
 * @param {PathwayProgress} progress - Current progress
 * @param {PathwayRank[]} ranks - Available ranks
 * @returns {PathwayRank}
 */
export function getCurrentRank(progress, ranks) {
  const sortedRanks = [...ranks].sort((a, b) => b.xpRequired - a.xpRequired);
  return sortedRanks.find(rank => rank.xpRequired <= progress.xp) || ranks[0];
}

/**
 * Calculate progress percentage to next level
 * @param {PathwayProgress} progress - Current progress
 * @returns {number} Percentage (0-100)
 */
export function calculateProgressPercentage(progress) {
  const currentLevelXP = (progress.level - 1) * 1000;
  const xpInCurrentLevel = progress.xp - currentLevelXP;
  const xpNeeded = progress.nextLevelXP - currentLevelXP;
  
  return Math.min(Math.round((xpInCurrentLevel / xpNeeded) * 100), 100);
}

/**
 * Calculate XP needed for specific level
 * @param {number} level - Target level
 * @returns {number} Total XP needed
 */
export function calculateXPForLevel(level) {
  // Simple linear progression: 1000 XP per level
  return level * 1000;
}

/**
 * Calculate level from total XP
 * @param {number} xp - Total XP
 * @returns {number} Level
 */
export function calculateLevelFromXP(xp) {
  return Math.floor(xp / 1000) + 1;
}

/**
 * Initialize pathway progress for user
 * @param {string} userId - User ID
 * @param {string} pathwayId - Pathway ID
 * @returns {PathwayProgress}
 */
export function initializePathwayProgress(userId, pathwayId) {
  return {
    userId,
    pathwayId,
    level: 1,
    xp: 0,
    nextLevelXP: 1000,
    currentRank: 'Initiate',
    achievements: [],
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    customData: {}
  };
}

/**
 * Add XP to pathway progress
 * @param {PathwayProgress} progress - Current progress
 * @param {number} xpAmount - XP to add
 * @returns {PathwayProgress} Updated progress
 */
export function addXPToProgress(progress, xpAmount) {
  const newXP = progress.xp + xpAmount;
  const newLevel = calculateLevelFromXP(newXP);
  const nextLevelXP = calculateXPForLevel(newLevel);
  
  return {
    ...progress,
    xp: newXP,
    level: newLevel,
    nextLevelXP,
    lastActive: new Date().toISOString()
  };
}

/**
 * Get pathway theme CSS class
 * @param {string} pathwayId - Pathway ID
 * @returns {string} CSS class name
 */
export function getPathwayThemeClass(pathwayId) {
  return `${pathwayId}-realm`;
}

/**
 * Get pathway color scheme
 * @param {Pathway} pathway - Pathway object
 * @returns {Object} Color scheme
 */
export function getPathwayColorScheme(pathway) {
  return {
    primary: pathway.color,
    gradient: pathway.gradient,
    icon: pathway.icon
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isValidPathway,
  isValidPathwayProgress,
  isValidPathwayId,
  getNextRank,
  getCurrentRank,
  calculateProgressPercentage,
  calculateXPForLevel,
  calculateLevelFromXP,
  initializePathwayProgress,
  addXPToProgress,
  getPathwayThemeClass,
  getPathwayColorScheme
};