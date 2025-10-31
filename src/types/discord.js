// ============================================================================
// DISCORD TYPE DEFINITIONS
// Type structures and validators for Discord-related data
// /src/types/discord.js
// ============================================================================

/**
 * @typedef {Object} DiscordUser
 * @property {string} id - Discord user ID
 * @property {string} username - Username
 * @property {string} discriminator - Discriminator (e.g., "0001")
 * @property {string|null} global_name - Global display name
 * @property {string|null} avatar - Avatar hash
 * @property {boolean} bot - Whether user is a bot
 * @property {boolean} system - Whether user is a system user
 * @property {string|null} banner - Banner hash
 * @property {number|null} accent_color - Accent color
 * @property {string|null} email - Email (from OAuth)
 * @property {boolean} verified - Email verified
 * @property {number} public_flags - Public flags
 */

/**
 * @typedef {Object} DiscordGuild
 * @property {string} id - Guild ID
 * @property {string} name - Guild name
 * @property {string|null} icon - Icon hash
 * @property {string|null} splash - Splash hash
 * @property {string|null} banner - Banner hash
 * @property {string} owner_id - Owner user ID
 * @property {boolean} owner - Whether current user is owner
 * @property {string} permissions - Permission bitfield
 * @property {number} approximate_member_count - Approximate member count
 * @property {number} approximate_presence_count - Approximate online count
 * @property {number} premium_tier - Boost level (0-3)
 * @property {number} premium_subscription_count - Number of boosts
 */

/**
 * @typedef {Object} DiscordMember
 * @property {DiscordUser} user - User object
 * @property {string|null} nick - Nickname
 * @property {string|null} avatar - Guild-specific avatar hash
 * @property {string[]} roles - Array of role IDs
 * @property {string} joined_at - ISO timestamp
 * @property {string|null} premium_since - Boost start date (ISO)
 * @property {boolean} deaf - Whether deafened
 * @property {boolean} mute - Whether muted
 * @property {number} flags - Member flags
 * @property {boolean} pending - Whether pending verification
 * @property {string|null} communication_disabled_until - Timeout end (ISO)
 */

/**
 * @typedef {Object} DiscordRole
 * @property {string} id - Role ID
 * @property {string} name - Role name
 * @property {number} color - Color integer
 * @property {boolean} hoist - Whether displayed separately
 * @property {string|null} icon - Icon hash
 * @property {string|null} unicode_emoji - Unicode emoji
 * @property {number} position - Position in hierarchy
 * @property {string} permissions - Permission bitfield
 * @property {boolean} managed - Whether managed by integration
 * @property {boolean} mentionable - Whether mentionable
 */

/**
 * @typedef {Object} DiscordChannel
 * @property {string} id - Channel ID
 * @property {number} type - Channel type (0=text, 2=voice, etc.)
 * @property {string|null} guild_id - Guild ID
 * @property {number} position - Position in list
 * @property {string} name - Channel name
 * @property {string|null} topic - Channel topic
 * @property {boolean} nsfw - Whether NSFW
 * @property {string|null} last_message_id - Last message ID
 * @property {number|null} rate_limit_per_user - Slowmode seconds
 * @property {string|null} parent_id - Category ID
 */

/**
 * @typedef {Object} DiscordOAuthTokens
 * @property {string} access_token - Access token
 * @property {string} token_type - Token type (usually "Bearer")
 * @property {number} expires_in - Seconds until expiration
 * @property {string} refresh_token - Refresh token
 * @property {string} scope - Granted scopes
 */

/**
 * @typedef {Object} DiscordServerStats
 * @property {number} memberCount - Total members
 * @property {number} onlineCount - Online members
 * @property {number} boostLevel - Server boost level
 * @property {number} boostCount - Number of boosts
 * @property {PathwayStats} pathwayStats - Members per pathway
 */

/**
 * @typedef {Object} PathwayStats
 * @property {number} gaming - Gaming pathway members
 * @property {number} lorebound - Lorebound pathway members
 * @property {number} productive - Productive pathway members
 * @property {number} news - News pathway members
 */

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validate Discord user object
 * @param {DiscordUser} user - User to validate
 * @returns {boolean}
 */
export function isValidDiscordUser(user) {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.discriminator === 'string'
  );
}

/**
 * Validate Discord guild object
 * @param {DiscordGuild} guild - Guild to validate
 * @returns {boolean}
 */
export function isValidDiscordGuild(guild) {
  return (
    guild &&
    typeof guild.id === 'string' &&
    typeof guild.name === 'string'
  );
}

/**
 * Validate Discord member object
 * @param {DiscordMember} member - Member to validate
 * @returns {boolean}
 */
export function isValidDiscordMember(member) {
  return (
    member &&
    isValidDiscordUser(member.user) &&
    Array.isArray(member.roles) &&
    typeof member.joined_at === 'string'
  );
}

/**
 * Validate Discord role object
 * @param {DiscordRole} role - Role to validate
 * @returns {boolean}
 */
export function isValidDiscordRole(role) {
  return (
    role &&
    typeof role.id === 'string' &&
    typeof role.name === 'string' &&
    typeof role.position === 'number'
  );
}

/**
 * Validate OAuth tokens
 * @param {DiscordOAuthTokens} tokens - Tokens to validate
 * @returns {boolean}
 */
export function isValidOAuthTokens(tokens) {
  return (
    tokens &&
    typeof tokens.access_token === 'string' &&
    typeof tokens.refresh_token === 'string' &&
    typeof tokens.expires_in === 'number'
  );
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Get Discord user avatar URL
 * @param {DiscordUser} user - Discord user
 * @param {number} size - Avatar size (default: 128)
 * @returns {string}
 */
export function getDiscordAvatarURL(user, size = 128) {
  if (user.avatar) {
    const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=${size}`;
  }
  
  // Default avatar based on discriminator
  const defaultNum = parseInt(user.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${defaultNum}.png`;
}

/**
 * Get Discord guild icon URL
 * @param {DiscordGuild} guild - Discord guild
 * @param {number} size - Icon size (default: 128)
 * @returns {string|null}
 */
export function getDiscordGuildIconURL(guild, size = 128) {
  if (!guild.icon) return null;
  
  const format = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}?size=${size}`;
}

/**
 * Get Discord role color as hex
 * @param {DiscordRole} role - Discord role
 * @returns {string} Hex color (e.g., "#D4AF37")
 */
export function getDiscordRoleColor(role) {
  if (role.color === 0) return '#99AAB5'; // Default role color
  return `#${role.color.toString(16).padStart(6, '0')}`;
}

/**
 * Format Discord timestamp
 * @param {string} timestamp - ISO timestamp
 * @param {string} format - 'relative', 'date', 'datetime', 'time'
 * @returns {string}
 */
export function formatDiscordTimestamp(timestamp, format = 'relative') {
  const date = new Date(timestamp);
  const now = new Date();
  
  if (format === 'relative') {
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
  if (format === 'date') {
    return date.toLocaleDateString();
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString();
  }
  
  return date.toLocaleString();
}

/**
 * Check if user has specific role
 * @param {DiscordMember} member - Discord member
 * @param {string} roleId - Role ID to check
 * @returns {boolean}
 */
export function memberHasRole(member, roleId) {
  return member.roles.includes(roleId);
}

/**
 * Check if user has any of the specified roles
 * @param {DiscordMember} member - Discord member
 * @param {string[]} roleIds - Role IDs to check
 * @returns {boolean}
 */
export function memberHasAnyRole(member, roleIds) {
  return roleIds.some(roleId => member.roles.includes(roleId));
}

/**
 * Check if user has all specified roles
 * @param {DiscordMember} member - Discord member
 * @param {string[]} roleIds - Role IDs to check
 * @returns {boolean}
 */
export function memberHasAllRoles(member, roleIds) {
  return roleIds.every(roleId => member.roles.includes(roleId));
}

/**
 * Get highest role from member
 * @param {DiscordMember} member - Discord member
 * @param {DiscordRole[]} guildRoles - All guild roles
 * @returns {DiscordRole|null}
 */
export function getMemberHighestRole(member, guildRoles) {
  const memberRoles = guildRoles.filter(role => member.roles.includes(role.id));
  
  if (memberRoles.length === 0) return null;
  
  return memberRoles.reduce((highest, role) => 
    role.position > highest.position ? role : highest
  );
}

/**
 * Check if member is timed out
 * @param {DiscordMember} member - Discord member
 * @returns {boolean}
 */
export function isMemberTimedOut(member) {
  if (!member.communication_disabled_until) return false;
  
  const timeoutEnd = new Date(member.communication_disabled_until);
  return timeoutEnd > new Date();
}

/**
 * Get member display name
 * @param {DiscordMember} member - Discord member
 * @returns {string}
 */
export function getMemberDisplayName(member) {
  return member.nick || member.user.global_name || member.user.username;
}

/**
 * Calculate OAuth token expiration timestamp
 * @param {DiscordOAuthTokens} tokens - OAuth tokens
 * @returns {number} Expiration timestamp (ms)
 */
export function calculateTokenExpiration(tokens) {
  return Date.now() + (tokens.expires_in * 1000);
}

/**
 * Check if OAuth tokens are expired
 * @param {number} expirationTimestamp - Expiration timestamp (ms)
 * @returns {boolean}
 */
export function areTokensExpired(expirationTimestamp) {
  return Date.now() >= expirationTimestamp;
}

/**
 * Parse Discord permissions bitfield
 * @param {string} permissionBits - Permission bitfield string
 * @returns {string[]} Array of permission names
 */
export function parsePermissions(permissionBits) {
  const permissions = [];
  const bits = BigInt(permissionBits);
  
  const PERMISSIONS = {
    CREATE_INSTANT_INVITE: 1n << 0n,
    KICK_MEMBERS: 1n << 1n,
    BAN_MEMBERS: 1n << 2n,
    ADMINISTRATOR: 1n << 3n,
    MANAGE_CHANNELS: 1n << 4n,
    MANAGE_GUILD: 1n << 5n,
    ADD_REACTIONS: 1n << 6n,
    VIEW_AUDIT_LOG: 1n << 7n,
    MANAGE_MESSAGES: 1n << 13n,
    MANAGE_ROLES: 1n << 28n,
  };
  
  for (const [name, bit] of Object.entries(PERMISSIONS)) {
    if ((bits & bit) === bit) {
      permissions.push(name);
    }
  }
  
  return permissions;
}

/**
 * Get server boost tier name
 * @param {number} tier - Boost tier (0-3)
 * @returns {string}
 */
export function getBoostTierName(tier) {
  const tiers = {
    0: 'No Boost',
    1: 'Level 1',
    2: 'Level 2',
    3: 'Level 3'
  };
  
  return tiers[tier] || 'Unknown';
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isValidDiscordUser,
  isValidDiscordGuild,
  isValidDiscordMember,
  isValidDiscordRole,
  isValidOAuthTokens,
  getDiscordAvatarURL,
  getDiscordGuildIconURL,
  getDiscordRoleColor,
  formatDiscordTimestamp,
  memberHasRole,
  memberHasAnyRole,
  memberHasAllRoles,
  getMemberHighestRole,
  isMemberTimedOut,
  getMemberDisplayName,
  calculateTokenExpiration,
  areTokensExpired,
  parsePermissions,
  getBoostTierName
};