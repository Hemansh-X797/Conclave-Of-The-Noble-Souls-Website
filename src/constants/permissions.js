/**
 * constants/permissions.js
 * Permission System for Conclave of the Noble Souls
 * Role-based access control and permission definitions
 */

// ============================================================================
// PERMISSION LEVELS
// ============================================================================

export const PERMISSION_LEVELS = {
  OWNER: 100,
  BOARD: 90,
  HEAD_ADMIN: 80,
  ADMIN: 70,
  HEAD_MOD: 60,
  MODERATOR: 50,
  VIP: 40,
  MEMBER: 10,
  GUEST: 0
};

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export const PERMISSIONS = {
  // Server Management
  MANAGE_SERVER: 'manage_server',
  MANAGE_CHANNELS: 'manage_channels',
  MANAGE_ROLES: 'manage_roles',
  VIEW_AUDIT_LOG: 'view_audit_log',
  MANAGE_WEBHOOKS: 'manage_webhooks',
  MANAGE_EMOJIS: 'manage_emojis',
  
  // Moderation
  BAN_MEMBERS: 'ban_members',
  KICK_MEMBERS: 'kick_members',
  TIMEOUT_MEMBERS: 'timeout_members',
  MANAGE_MESSAGES: 'manage_messages',
  MANAGE_NICKNAMES: 'manage_nicknames',
  VIEW_MOD_LOGS: 'view_mod_logs',
  CREATE_WARNINGS: 'create_warnings',
  
  // Content
  SEND_MESSAGES: 'send_messages',
  EMBED_LINKS: 'embed_links',
  ATTACH_FILES: 'attach_files',
  ADD_REACTIONS: 'add_reactions',
  USE_EXTERNAL_EMOJIS: 'use_external_emojis',
  MENTION_EVERYONE: 'mention_everyone',
  
  // Voice
  CONNECT: 'connect',
  SPEAK: 'speak',
  MUTE_MEMBERS: 'mute_members',
  DEAFEN_MEMBERS: 'deafen_members',
  MOVE_MEMBERS: 'move_members',
  
  // Special Features
  CREATE_EVENTS: 'create_events',
  MANAGE_EVENTS: 'manage_events',
  CREATE_POLLS: 'create_polls',
  USE_SLASH_COMMANDS: 'use_slash_commands',
  
  // Website Permissions
  ACCESS_DASHBOARD: 'access_dashboard',
  EDIT_PROFILE: 'edit_profile',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_CONTENT: 'manage_content',
  ACCESS_API: 'access_api',
  
  // Pathway Permissions
  ACCESS_GAMING: 'access_gaming',
  ACCESS_LOREBOUND: 'access_lorebound',
  ACCESS_PRODUCTIVE: 'access_productive',
  ACCESS_NEWS: 'access_news',
  
  // Premium Features
  CUSTOM_COLOR: 'custom_color',
  PRIORITY_SUPPORT: 'priority_support',
  EXCLUSIVE_CHANNELS: 'exclusive_channels',
  EARLY_ACCESS: 'early_access'
};

// ============================================================================
// ROLE PERMISSION MAPPINGS
// ============================================================================

export const ROLE_PERMISSIONS = {
  // Staff Permissions
  '1369566988128751750': ['*'], // Owner - All permissions
  
  '1369197369161154560': [ // Board of Directors
    PERMISSIONS.MANAGE_SERVER,
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_AUDIT_LOG,
    PERMISSIONS.BAN_MEMBERS,
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_CONTENT
  ],
  
  '1396459118025375784': [ // Head Administrator
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.BAN_MEMBERS,
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_MOD_LOGS
  ],
  
  '1370702703616856074': [ // Administrator
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.BAN_MEMBERS,
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.TIMEOUT_MEMBERS,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.CREATE_WARNINGS,
    PERMISSIONS.VIEW_MOD_LOGS
  ],
  
  '1409148504026120293': [ // Head Mod
    PERMISSIONS.BAN_MEMBERS,
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.TIMEOUT_MEMBERS,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.CREATE_WARNINGS,
    PERMISSIONS.VIEW_MOD_LOGS
  ],
  
  '1408079849377107989': [ // Moderator
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.TIMEOUT_MEMBERS,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.CREATE_WARNINGS
  ],
  
  // VIP Permissions
  '1404790723751968883': [ // VIP (Server Boosters)
    PERMISSIONS.CUSTOM_COLOR,
    PERMISSIONS.PRIORITY_SUPPORT,
    PERMISSIONS.EXCLUSIVE_CHANNELS,
    PERMISSIONS.EARLY_ACCESS,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.USE_EXTERNAL_EMOJIS
  ],
  
  // Pathway Permissions
  '1395703399760265226': [PERMISSIONS.ACCESS_GAMING], // Gaming
  '1397498835919442033': [PERMISSIONS.ACCESS_LOREBOUND], // Lorebound
  '1409444816189788171': [PERMISSIONS.ACCESS_PRODUCTIVE], // Productive
  '1395703930587189321': [PERMISSIONS.ACCESS_NEWS], // News
  
  // Base Member Permissions
  '1397497084793458691': [ // Noble Soul
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.ADD_REACTIONS,
    PERMISSIONS.CONNECT,
    PERMISSIONS.SPEAK,
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.EDIT_PROFILE
  ]
};

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Check if user has specific permission
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userRoles, permission) => {
  if (!userRoles || userRoles.length === 0) return false;
  
  for (const roleId of userRoles) {
    const rolePerms = ROLE_PERMISSIONS[roleId];
    if (!rolePerms) continue;
    
    // Check for wildcard (all permissions)
    if (rolePerms.includes('*')) return true;
    
    // Check for specific permission
    if (rolePerms.includes(permission)) return true;
  }
  
  return false;
};

/**
 * Check if user has ANY of the specified permissions
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (userRoles, permissions) => {
  return permissions.some(perm => hasPermission(userRoles, perm));
};

/**
 * Check if user has ALL of the specified permissions
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (userRoles, permissions) => {
  return permissions.every(perm => hasPermission(userRoles, perm));
};

/**
 * Get all permissions for user
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {Array<string>}
 */
export const getUserPermissions = (userRoles) => {
  if (!userRoles || userRoles.length === 0) return [];
  
  const permissions = new Set();
  
  for (const roleId of userRoles) {
    const rolePerms = ROLE_PERMISSIONS[roleId];
    if (!rolePerms) continue;
    
    // If wildcard, return all permissions
    if (rolePerms.includes('*')) {
      return Object.values(PERMISSIONS);
    }
    
    rolePerms.forEach(perm => permissions.add(perm));
  }
  
  return Array.from(permissions);
};

/**
 * Get user's permission level
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {number}
 */
export const getPermissionLevel = (userRoles) => {
  const roleLevelMap = {
    '1369566988128751750': PERMISSION_LEVELS.OWNER,
    '1369197369161154560': PERMISSION_LEVELS.BOARD,
    '1396459118025375784': PERMISSION_LEVELS.HEAD_ADMIN,
    '1370702703616856074': PERMISSION_LEVELS.ADMIN,
    '1409148504026120293': PERMISSION_LEVELS.HEAD_MOD,
    '1408079849377107989': PERMISSION_LEVELS.MODERATOR,
    '1404790723751968883': PERMISSION_LEVELS.VIP,
    '1397497084793458691': PERMISSION_LEVELS.MEMBER
  };
  
  let highestLevel = PERMISSION_LEVELS.GUEST;
  
  for (const roleId of userRoles) {
    const level = roleLevelMap[roleId];
    if (level && level > highestLevel) {
      highestLevel = level;
    }
  }
  
  return highestLevel;
};

/**
 * Check if user can perform action on target
 * @param {Array<string>} actorRoles - Actor's role IDs
 * @param {Array<string>} targetRoles - Target's role IDs
 * @returns {boolean}
 */
export const canModerate = (actorRoles, targetRoles) => {
  const actorLevel = getPermissionLevel(actorRoles);
  const targetLevel = getPermissionLevel(targetRoles);
  
  // Can only moderate users with lower permission level
  return actorLevel > targetLevel;
};

/**
 * Check if user is staff
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {boolean}
 */
export const isStaff = (userRoles) => {
  const staffRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074', // Admin
    '1409148504026120293', // Head Mod
    '1408079849377107989'  // Moderator
  ];
  
  return userRoles.some(roleId => staffRoleIds.includes(roleId));
};

/**
 * Check if user is VIP
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {boolean}
 */
export const isVIP = (userRoles) => {
  return userRoles.includes('1404790723751968883');
};

/**
 * Get accessible pathways for user
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {Array<string>}
 */
export const getAccessiblePathways = (userRoles) => {
  const pathways = [];
  
  if (hasPermission(userRoles, PERMISSIONS.ACCESS_GAMING)) {
    pathways.push('gaming');
  }
  if (hasPermission(userRoles, PERMISSIONS.ACCESS_LOREBOUND)) {
    pathways.push('lorebound');
  }
  if (hasPermission(userRoles, PERMISSIONS.ACCESS_PRODUCTIVE)) {
    pathways.push('productive');
  }
  if (hasPermission(userRoles, PERMISSIONS.ACCESS_NEWS)) {
    pathways.push('news');
  }
  
  return pathways;
};

// ============================================================================
// PERMISSION GUARDS
// ============================================================================

/**
 * Permission guard for routes/actions
 * @param {Array<string>} userRoles - User's role IDs
 * @param {string|Array<string>} requiredPermissions - Required permission(s)
 * @param {boolean} requireAll - If true, requires all permissions; if false, requires any
 * @returns {Object} {allowed: boolean, message: string}
 */
export const checkAccess = (userRoles, requiredPermissions, requireAll = false) => {
  const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  const hasAccess = requireAll
    ? hasAllPermissions(userRoles, perms)
    : hasAnyPermission(userRoles, perms);
  
  return {
    allowed: hasAccess,
    message: hasAccess
      ? 'Access granted'
      : `Missing required permission${perms.length > 1 ? 's' : ''}: ${perms.join(', ')}`
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  PERMISSION_LEVELS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  getPermissionLevel,
  canModerate,
  isStaff,
  isVIP,
  getAccessiblePathways,
  checkAccess
};