// ============================================================================
// STAFF HIERARCHY & TEAM DATA
// Complete staff structure for The Conclave Realm
// /src/data/staff.js
// ============================================================================

export const STAFF_TIERS = {
  DIVINE: {
    id: 'divine',
    name: 'Divine Tier',
    tier: 1,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    icon: '♔',
    description: 'Supreme leadership and server ownership'
  },
  CELESTIAL: {
    id: 'celestial',
    name: 'Celestial Tier',
    tier: 2,
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
    icon: '♖',
    description: 'High-level administration and strategic oversight'
  },
  ROYAL: {
    id: 'royal',
    name: 'Royal Tier',
    tier: 3,
    color: '#3498DB',
    gradient: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
    icon: '♗',
    description: 'Active moderation and community management'
  }
};

export const STAFF_POSITIONS = {
  owner: {
    id: 'owner',
    title: 'Server Owner',
    shortTitle: 'Owner',
    tier: 'divine',
    roleId: '1369566988128751750',
    icon: '♔',
    color: '#FFD700',
    level: 100,
    permissions: ['*'],
    responsibilities: [
      'Ultimate server authority',
      'Strategic vision and direction',
      'Final decision making',
      'Community culture shaping'
    ],
    description: 'The sovereign ruler of The Conclave Realm, holding ultimate authority over all server matters.'
  },
  
  board: {
    id: 'board',
    title: 'Board of Directors',
    shortTitle: 'Board',
    tier: 'divine',
    roleId: '1369197369161154560',
    icon: '♔',
    color: '#FFD700',
    level: 90,
    permissions: ['manage_server', 'manage_channels', 'manage_roles', 'view_audit_log'],
    responsibilities: [
      'Strategic planning',
      'Policy development',
      'Major decisions oversight',
      'Long-term vision'
    ],
    description: 'Elite council providing strategic guidance and governance for the realm.'
  },
  
  headAdmin: {
    id: 'headAdmin',
    title: 'Head Administrator',
    shortTitle: 'Head Admin',
    tier: 'celestial',
    roleId: '1396459118025375784',
    icon: '♖',
    color: '#E74C3C',
    level: 80,
    permissions: ['manage_channels', 'manage_roles', 'ban_members', 'manage_events'],
    responsibilities: [
      'Administrative team leadership',
      'Policy enforcement',
      'Server structure management',
      'Event coordination'
    ],
    description: 'Senior administrative authority overseeing all administrative operations.'
  },
  
  admin: {
    id: 'admin',
    title: 'Administrator',
    shortTitle: 'Admin',
    tier: 'celestial',
    roleId: '1370702703616856074',
    icon: '♖',
    color: '#E74C3C',
    level: 70,
    permissions: ['ban_members', 'kick_members', 'manage_messages', 'manage_channels'],
    responsibilities: [
      'Server administration',
      'Member management',
      'Policy enforcement',
      'Issue resolution'
    ],
    description: 'High-level administrators ensuring smooth server operations.'
  },
  
  headMod: {
    id: 'headMod',
    title: 'Head Moderator',
    shortTitle: 'Head Mod',
    tier: 'royal',
    roleId: '1409148504026120293',
    icon: '♗',
    color: '#3498DB',
    level: 60,
    permissions: ['ban_members', 'timeout_members', 'manage_messages'],
    responsibilities: [
      'Moderation team leadership',
      'Training new moderators',
      'Conflict resolution',
      'Community safety'
    ],
    description: 'Lead moderator coordinating the moderation team.'
  },
  
  moderator: {
    id: 'moderator',
    title: 'Moderator',
    shortTitle: 'Mod',
    tier: 'royal',
    roleId: '1408079849377107989',
    icon: '♗',
    color: '#3498DB',
    level: 50,
    permissions: ['kick_members', 'timeout_members', 'manage_messages'],
    responsibilities: [
      'Active moderation',
      'Rule enforcement',
      'Member support',
      'Chat monitoring'
    ],
    description: 'Frontline moderators maintaining community standards.'
  }
};

export const STAFF_MEMBERS = [
  {
    id: 'hemansh',
    discordId: '774972275738918933',
    username: 'darkpower797',
    displayName: 'Darkpower797',
    position: 'owner',
    joinDate: '2024-01-01',
    avatar: '/Assets/Images/staff/hemansh.jpg',
    bio: 'Founder and visionary of The Conclave Realm. Building a community where excellence meets nobility.',
    specialties: ['Leadership', 'Community Building', 'Strategic Planning'],
    achievements: [
      'Founded The Conclave Realm',
      'Built thriving multi-pathway community',
      'Established unique server culture'
    ],
    socials: {
      discord: 'Darkpower797',
      github: "Hemansh-X797",
      twitter: null,
      website: null
    },
    status: 'active',
    featured: true
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get staff position by ID
 */
export function getStaffPosition(positionId) {
  return STAFF_POSITIONS[positionId] || null;
}

/**
 * Get staff position by role ID
 */
export function getStaffPositionByRole(roleId) {
  return Object.values(STAFF_POSITIONS).find(p => p.roleId === roleId) || null;
}

/**
 * Get all staff positions
 */
export function getAllStaffPositions() {
  return Object.values(STAFF_POSITIONS).sort((a, b) => b.level - a.level);
}

/**
 * Get staff positions by tier
 */
export function getStaffByTier(tierId) {
  return Object.values(STAFF_POSITIONS)
    .filter(p => p.tier === tierId)
    .sort((a, b) => b.level - a.level);
}

/**
 * Get staff member by Discord ID
 */
export function getStaffMemberById(discordId) {
  return STAFF_MEMBERS.find(m => m.discordId === discordId) || null;
}

/**
 * Get all active staff members
 */
export function getActiveStaffMembers() {
  return STAFF_MEMBERS.filter(m => m.status === 'active');
}

/**
 * Get featured staff members
 */
export function getFeaturedStaff() {
  return STAFF_MEMBERS.filter(m => m.featured && m.status === 'active');
}

/**
 * Check if user is staff
 */
export function isStaffMember(discordId) {
  return STAFF_MEMBERS.some(m => m.discordId === discordId && m.status === 'active');
}

/**
 * Get staff hierarchy (organized by tier)
 */
export function getStaffHierarchy() {
  return Object.values(STAFF_TIERS).map(tier => ({
    ...tier,
    positions: getStaffByTier(tier.id),
    members: STAFF_MEMBERS.filter(m => {
      const position = getStaffPosition(m.position);
      return position && position.tier === tier.id && m.status === 'active';
    })
  }));
}

/**
 * Get staff statistics
 */
export function getStaffStats() {
  const active = STAFF_MEMBERS.filter(m => m.status === 'active');
  
  return {
    total: active.length,
    byTier: {
      divine: active.filter(m => STAFF_POSITIONS[m.position]?.tier === 'divine').length,
      celestial: active.filter(m => STAFF_POSITIONS[m.position]?.tier === 'celestial').length,
      royal: active.filter(m => STAFF_POSITIONS[m.position]?.tier === 'royal').length
    },
    byPosition: Object.keys(STAFF_POSITIONS).reduce((acc, key) => {
      acc[key] = active.filter(m => m.position === key).length;
      return acc;
    }, {})
  };
}

// ============================================================================
// APPLICATION REQUIREMENTS
// ============================================================================

export const APPLICATION_REQUIREMENTS = {
  moderator: {
    minAge: 16,
    minServerTime: 30, // days
    minMessages: 500,
    minActivity: 70, // percentage
    requirements: [
      'Active member for at least 30 days',
      'Minimum 500 messages in server',
      'No warnings or bans',
      'Mature and responsible behavior',
      'Good understanding of server rules',
      'Available at least 10 hours per week'
    ]
  },
  
  admin: {
    minAge: 18,
    minModTime: 90, // days as moderator
    minMessages: 2000,
    minActivity: 80,
    requirements: [
      'Served as moderator for at least 90 days',
      'Excellent moderation track record',
      'Strong leadership skills',
      'Deep understanding of server culture',
      'Available at least 15 hours per week',
      'Experience with Discord administration'
    ]
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
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
};