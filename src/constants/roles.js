/**
 * Discord Role Definitions for Conclave of the Noble Souls
 * Server ID: 1368124846760001546
 * 
 * Role hierarchy and permissions mapping
 */

// ============================================================================
// STAFF ROLES
// ============================================================================

export const STAFF_ROLES = {
  OWNER: {
    id: '1369566988128751750',
    name: 'Owner',
    level: 100,
    color: '#FFD700',
    permissions: ['*']
  },
  BOARD_OF_DIRECTORS: {
    id: '1369197369161154560',
    name: 'Board Of Directors',
    level: 90,
    color: '#E5E4E2',
    permissions: ['manage_server', 'manage_roles', 'manage_channels', 'ban_members', 'kick_members']
  },
  HEAD_ADMINISTRATOR: {
    id: '1396459118025375784',
    name: 'Head Administrator',
    level: 80,
    color: '#9966CC',
    permissions: ['manage_server', 'manage_roles', 'manage_channels', 'ban_members', 'kick_members']
  },
  ADMINISTRATOR: {
    id: '1370702703616856074',
    name: 'Administrator',
    level: 70,
    color: '#E0115F',
    permissions: ['manage_channels', 'ban_members', 'kick_members', 'manage_messages']
  },
  HEAD_MOD: {
    id: '1409148504026120293',
    name: 'Head Mod',
    level: 60,
    color: '#00BFFF',
    permissions: ['ban_members', 'kick_members', 'manage_messages', 'timeout_members']
  },
  MODERATOR: {
    id: '1408079849377107989',
    name: 'Moderator',
    level: 50,
    color: '#50C878',
    permissions: ['kick_members', 'manage_messages', 'timeout_members']
  }
};

// ============================================================================
// MEMBER HIERARCHY ROLES
// ============================================================================

export const HIERARCHY_ROLES = {
  GRAND_DUKE: {
    id: '1397812242258595973',
    name: '🦅 Grand Duke',
    level: 9,
    color: '#FFD700',
    requiredLevel: 90
  },
  DUKE: {
    id: '1395673790431629404',
    name: '🦁 Duke',
    level: 8,
    color: '#E5E4E2',
    requiredLevel: 80
  },
  MARGRAVE: {
    id: '1395673117069676655',
    name: '🎖️Margrave',
    level: 7,
    color: '#9966CC',
    requiredLevel: 70
  },
  COUNT: {
    id: '1395672911888646144',
    name: '👑Count',
    level: 6,
    color: '#FF1493',
    requiredLevel: 60
  },
  VISCOUNT: {
    id: '1395672806007640106',
    name: '🏵️Viscount',
    level: 5,
    color: '#00BFFF',
    requiredLevel: 50
  },
  BARON: {
    id: '1395672615653216378',
    name: '🛡️ Baron',
    level: 4,
    color: '#50C878',
    requiredLevel: 40
  },
  KNIGHT: {
    id: '1395677440503709756',
    name: '⚔️Knight',
    level: 3,
    color: '#E0115F',
    requiredLevel: 30
  },
  CITIZEN: {
    id: '1395677298149298299',
    name: '🟢Citizen',
    level: 2,
    color: '#C0C0C0',
    requiredLevel: 10
  },
  NOBLE_SOUL: {
    id: '1397497084793458691',
    name: 'Noble Soul⚜️',
    level: 1,
    color: '#FFFFFF',
    requiredLevel: 0
  }
};

// ============================================================================
// SPECIAL ROLES
// ============================================================================

export const SPECIAL_ROLES = {
  VIP: {
    id: '1404790723751968883',
    name: 'VIP(Server Boosters)',
    color: '#FF73FA',
    benefits: ['exclusive_channels', 'priority_support', 'custom_color']
  },
  SHADOW_MONARCH: {
    id: '1397180089887625237',
    name: 'Shadow Monarch🦇',
    color: '#36013F',
    special: true
  },
  DEMON_KING: {
    id: '1408815365990912270',
    name: 'Demon King Of Salvation',
    color: '#8B0000',
    special: true
  },
  SOVEREIGN_TEMPEST: {
    id: '1408736936717193247',
    name: 'Sovereign Tempest',
    color: '#4169E1',
    special: true
  },
  OLD_MAN: {
    id: '1395321774018658375',
    name: 'Old Man',
    color: '#808080',
    special: true
  }
};

// ============================================================================
// PATHWAY ROLES
// ============================================================================

export const PATHWAY_ROLES = {
  GAMING: {
    id: '1395703399760265226',
    name: '🎮Gaming',
    pathway: 'gaming',
    color: '#00BFFF',
    channels: ['gaming-chat', 'pokemon', 'casino', 'epic-rpg']
  },
  LOREBOUND: {
    id: '1397498835919442033',
    name: 'Lorebound🌙',
    pathway: 'lorebound',
    color: '#FF1493',
    channels: ['novels', 'loreseekers-chat', 'lorebound-updates']
  },
  PRODUCTIVE: {
    id: '1409444816189788171',
    name: '💼Productive',
    pathway: 'productive',
    color: '#50C878',
    channels: ['current-projects', 'digital-products', 'ai-tools']
  },
  NEWS: {
    id: '1395703930587189321',
    name: '📰 News',
    pathway: 'news',
    color: '#E0115F',
    channels: ['news', 'trading-news', 'tech-and-science', 'gaming-news']
  }
};

// ============================================================================
// DEMOGRAPHIC ROLES
// ============================================================================

export const DEMOGRAPHIC_ROLES = {
  MALE: {
    id: '1397136409575297114',
    name: 'Male ♂️',
    type: 'gender'
  },
  FEMALE: {
    id: '1397136605482844191',
    name: 'Female ♀️',
    type: 'gender'
  },
  NSFW: {
    id: '1397496936893780009',
    name: 'NSFW 🔞',
    type: 'content',
    ageGated: true
  },
  ECHOBOUND: {
    id: '1409444446873063536',
    name: '🎙️ Echobound (Want To Talk)',
    type: 'communication'
  }
};

// ============================================================================
// COLOR ROLES
// ============================================================================

export const COLOR_ROLES = {
  BLACK: { id: '1398182563545219154', name: 'Black', color: '#000000' },
  PURPLE: { id: '1397124645622251612', name: 'Purple', color: '#9966CC' },
  BLUE: { id: '1397124173586763872', name: 'Blue', color: '#00BFFF' },
  GREEN: { id: '1397124060672036864', name: 'Green', color: '#50C878' },
  RED: { id: '1397124545734905946', name: 'Red', color: '#E0115F' },
  PINK: { id: '1397124330290417694', name: 'Pink', color: '#FF69B4' },
  ORANGE: { id: '1397124242000183366', name: 'Orange', color: '#FFA500' }
};

// ============================================================================
// BOT ROLES (Reference - not assignable)
// ============================================================================

export const BOT_ROLES = {
  MEE6: '1370710710207910014',
  DYNO: '1370710022694244466',
  CARL_BOT: '1369204560542826551',
  POKETWO: '1370713711945191499',
  DANK_MEMER: '1375395013051158561',
  OWO: '1379345448652771328',
  MUDAE: '1379698194920902732',
  TATSU: '1379718263579344928',
  EPIC_RPG: '1396082458285445225'
};

// ============================================================================
// ROLE UTILITIES
// ============================================================================

/**
 * Get role by ID
 * @param {string} roleId - Discord role ID
 * @returns {Object|null} Role object or null
 */
export const getRoleById = (roleId) => {
  const allRoles = {
    ...STAFF_ROLES,
    ...HIERARCHY_ROLES,
    ...SPECIAL_ROLES,
    ...PATHWAY_ROLES,
    ...DEMOGRAPHIC_ROLES,
    ...COLOR_ROLES
  };
  
  return Object.values(allRoles).find(role => role.id === roleId) || null;
};

/**
 * Get role by name
 * @param {string} roleName - Role name
 * @returns {Object|null} Role object or null
 */
export const getRoleByName = (roleName) => {
  const allRoles = {
    ...STAFF_ROLES,
    ...HIERARCHY_ROLES,
    ...SPECIAL_ROLES,
    ...PATHWAY_ROLES,
    ...DEMOGRAPHIC_ROLES,
    ...COLOR_ROLES
  };
  
  return Object.values(allRoles).find(
    role => role.name.toLowerCase() === roleName.toLowerCase()
  ) || null;
};

/**
 * Check if user has staff role
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {boolean}
 */
export const hasStaffRole = (userRoles) => {
  const staffRoleIds = Object.values(STAFF_ROLES).map(role => role.id);
  return userRoles.some(roleId => staffRoleIds.includes(roleId));
};

/**
 * Get user's highest hierarchy level
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {number}
 */
export const getHighestHierarchyLevel = (userRoles) => {
  const hierarchyRoleIds = Object.values(HIERARCHY_ROLES).map(role => role.id);
  const userHierarchyRoles = userRoles.filter(roleId => 
    hierarchyRoleIds.includes(roleId)
  );
  
  if (userHierarchyRoles.length === 0) return 0;
  
  const levels = userHierarchyRoles.map(roleId => {
    const role = Object.values(HIERARCHY_ROLES).find(r => r.id === roleId);
    return role ? role.level : 0;
  });
  
  return Math.max(...levels);
};

/**
 * Get user's pathway roles
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @returns {Array<Object>}
 */
export const getUserPathways = (userRoles) => {
  return Object.values(PATHWAY_ROLES).filter(role => 
    userRoles.includes(role.id)
  );
};

/**
 * Check if user has permission
 * @param {Array<string>} userRoles - Array of user's role IDs
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userRoles, permission) => {
  const staffRoles = Object.values(STAFF_ROLES).filter(role =>
    userRoles.includes(role.id)
  );
  
  return staffRoles.some(role => 
    role.permissions.includes('*') || role.permissions.includes(permission)
  );
};

/**
 * Get role color
 * @param {string} roleId - Discord role ID
 * @returns {string} Hex color code
 */
export const getRoleColor = (roleId) => {
  const role = getRoleById(roleId);
  return role?.color || '#FFFFFF';
};

/**
 * Check if role is assignable by user
 * @param {Array<string>} assignerRoles - Role IDs of person assigning
 * @param {string} targetRoleId - Role ID to be assigned
 * @returns {boolean}
 */
export const canAssignRole = (assignerRoles, targetRoleId) => {
  // Staff can assign most roles
  if (hasStaffRole(assignerRoles)) return true;
  
  // Check if it's a self-assignable role (pathways, colors, demographics)
  const selfAssignable = [
    ...Object.values(PATHWAY_ROLES),
    ...Object.values(COLOR_ROLES),
    ...Object.values(DEMOGRAPHIC_ROLES)
  ];
  
  return selfAssignable.some(role => role.id === targetRoleId);
};

// ============================================================================
// ROLE GROUPS FOR UI
// ============================================================================

export const ROLE_GROUPS = {
  staff: {
    name: 'Staff Team',
    roles: STAFF_ROLES,
    icon: '⚖️',
    color: '#FFD700'
  },
  hierarchy: {
    name: 'Noble Hierarchy',
    roles: HIERARCHY_ROLES,
    icon: '👑',
    color: '#E5E4E2'
  },
  pathways: {
    name: 'Pathways',
    roles: PATHWAY_ROLES,
    icon: '🌟',
    color: '#00BFFF',
    selfAssignable: true
  },
  colors: {
    name: 'Color Roles',
    roles: COLOR_ROLES,
    icon: '🎨',
    selfAssignable: true
  },
  special: {
    name: 'Special Roles',
    roles: SPECIAL_ROLES,
    icon: '✨',
    color: '#9966CC'
  }
};

export default {
  STAFF_ROLES,
  HIERARCHY_ROLES,
  SPECIAL_ROLES,
  PATHWAY_ROLES,
  DEMOGRAPHIC_ROLES,
  COLOR_ROLES,
  BOT_ROLES,
  ROLE_GROUPS,
  getRoleById,
  getRoleByName,
  hasStaffRole,
  getHighestHierarchyLevel,
  getUserPathways,
  hasPermission,
  getRoleColor,
  canAssignRole
};