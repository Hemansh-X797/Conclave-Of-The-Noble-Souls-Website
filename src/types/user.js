// ============================================================================
// USER TYPE DEFINITIONS
// Type structures and validators for user data
// /src/types/user.js
// ============================================================================

/**
 * @typedef {Object} User
 * @property {string} id - Discord user ID
 * @property {string} username - Discord username
 * @property {string} discriminator - Discord discriminator (e.g., "0001")
 * @property {string} avatar - Avatar URL or hash
 * @property {string} email - User email (from OAuth)
 * @property {string[]} roles - Array of Discord role IDs
 * @property {boolean} inServer - Whether user is in the Discord server
 * @property {string} joinedAt - ISO timestamp of server join date
 * @property {UserProfile} profile - Extended user profile data
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} displayName - Custom display name
 * @property {string} bio - User biography
 * @property {string} banner - Profile banner URL
 * @property {string[]} pathways - Array of pathway IDs user has joined
 * @property {UserStats} stats - User statistics
 * @property {UserPreferences} preferences - User preferences
 * @property {string[]} achievements - Array of earned achievement IDs
 * @property {Object.<string, UserPathwayProgress>} pathwayProgress - Progress per pathway
 */

/**
 * @typedef {Object} UserStats
 * @property {number} totalXP - Total experience points across all pathways
 * @property {number} level - Overall user level
 * @property {number} messageCount - Total messages sent
 * @property {number} eventsAttended - Number of events attended
 * @property {number} tournamentsWon - Number of tournaments won
 * @property {string} joinedAt - ISO timestamp of when user joined
 * @property {string} lastActive - ISO timestamp of last activity
 */

/**
 * @typedef {Object} UserPreferences
 * @property {boolean} particlesEnabled - Enable particle effects
 * @property {boolean} soundsEnabled - Enable sound effects
 * @property {boolean} animationsEnabled - Enable animations
 * @property {boolean} emailNotifications - Enable email notifications
 * @property {boolean} discordNotifications - Enable Discord notifications
 * @property {string} theme - Theme preference ('auto', 'dark', 'light')
 * @property {string} language - Preferred language ('en', etc.)
 */

/**
 * @typedef {Object} UserPathwayProgress
 * @property {string} pathwayId - Pathway identifier
 * @property {number} level - Current level in pathway
 * @property {number} xp - Current XP in pathway
 * @property {number} nextLevelXP - XP required for next level
 * @property {string[]} achievements - Pathway-specific achievements
 * @property {string} joinedAt - ISO timestamp of pathway join date
 * @property {string} lastActive - ISO timestamp of last activity in pathway
 */

/**
 * @typedef {Object} UserSession
 * @property {string} accessToken - OAuth access token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {User} user - User data
 */

/**
 * @typedef {Object} StaffMember
 * @property {string} id - Unique identifier
 * @property {string} discordId - Discord user ID
 * @property {string} username - Discord username
 * @property {string} displayName - Display name
 * @property {string} position - Staff position ID (owner, admin, moderator, etc.)
 * @property {string} joinDate - ISO timestamp of staff join date
 * @property {string} avatar - Avatar URL
 * @property {string} bio - Staff member biography
 * @property {string[]} specialties - Areas of expertise
 * @property {string[]} achievements - Staff achievements
 * @property {Object.<string, string>} socials - Social media links
 * @property {string} status - Status ('active', 'inactive', 'leave')
 * @property {boolean} featured - Whether to feature on staff page
 */

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validate user object structure
 * @param {User} user - User object to validate
 * @returns {boolean}
 */
export function isValidUser(user) {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.inServer === 'boolean' &&
    Array.isArray(user.roles)
  );
}

/**
 * Validate user session
 * @param {UserSession} session - Session to validate
 * @returns {boolean}
 */
export function isValidSession(session) {
  return (
    session &&
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.expiresAt === 'number' &&
    isValidUser(session.user)
  );
}

/**
 * Check if session is expired
 * @param {UserSession} session - Session to check
 * @returns {boolean}
 */
export function isSessionExpired(session) {
  return Date.now() >= session.expiresAt;
}

/**
 * Validate staff member structure
 * @param {StaffMember} member - Staff member to validate
 * @returns {boolean}
 */
export function isValidStaffMember(member) {
  return (
    member &&
    typeof member.discordId === 'string' &&
    typeof member.position === 'string' &&
    typeof member.status === 'string'
  );
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Transform Discord user to app user
 * @param {Object} discordUser - Raw Discord user data
 * @param {string[]} roles - User's role IDs
 * @param {boolean} inServer - Whether user is in server
 * @returns {User}
 */
export function transformDiscordUser(discordUser, roles = [], inServer = false) {
  return {
    id: discordUser.id,
    username: discordUser.username,
    discriminator: discordUser.discriminator || '0',
    avatar: discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || '0') % 5}.png`,
    email: discordUser.email || null,
    roles,
    inServer,
    joinedAt: new Date().toISOString(),
    profile: {
      displayName: discordUser.global_name || discordUser.username,
      bio: '',
      banner: discordUser.banner || null,
      pathways: [],
      stats: {
        totalXP: 0,
        level: 1,
        messageCount: 0,
        eventsAttended: 0,
        tournamentsWon: 0,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      preferences: {
        particlesEnabled: true,
        soundsEnabled: true,
        animationsEnabled: true,
        emailNotifications: true,
        discordNotifications: true,
        theme: 'auto',
        language: 'en'
      },
      achievements: [],
      pathwayProgress: {}
    }
  };
}

/**
 * Get user display name
 * @param {User} user - User object
 * @returns {string}
 */
export function getUserDisplayName(user) {
  return user.profile?.displayName || user.username;
}

/**
 * Get user avatar URL
 * @param {User} user - User object
 * @param {number} size - Avatar size (default: 128)
 * @returns {string}
 */
export function getUserAvatar(user, size = 128) {
  return user.avatar.replace('.png', `.png?size=${size}`);
}

/**
 * Calculate user total level from all pathways
 * @param {UserProfile} profile - User profile
 * @returns {number}
 */
export function calculateUserTotalLevel(profile) {
  if (!profile.pathwayProgress) return 1;
  
  const pathwayLevels = Object.values(profile.pathwayProgress).reduce(
    (total, progress) => total + (progress.level || 1),
    0
  );
  
  return Math.floor(pathwayLevels / 4) || 1; // Average across pathways
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isValidUser,
  isValidSession,
  isSessionExpired,
  isValidStaffMember,
  transformDiscordUser,
  getUserDisplayName,
  getUserAvatar,
  calculateUserTotalLevel
};