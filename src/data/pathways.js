// ============================================================================
// PATHWAY CONFIGURATIONS
// Complete pathway data for The Conclave Realm
// /src/data/pathways.js
// ============================================================================

export const PATHWAYS = {
  gaming: {
    id: 'gaming',
    name: 'Gaming Realm',
    fullName: 'The Gaming Realm',
    tagline: 'Where Warriors Test Their Mettle',
    icon: '🎮',
    emoji: '🎮',
    color: '#00BFFF',
    gradient: 'linear-gradient(135deg, #00BFFF 0%, #8A2BE2 100%)',
    
    // Discord Integration
    roleId: '1395703399760265226',
    categoryId: null, // Add your category ID
    
    // Description
    description: 'Enter the Gaming Realm, where competitive spirits clash in digital battlefields. From strategic tournaments to casual game nights, this is where legends are born.',
    shortDescription: 'Competitive gaming, tournaments, and epic adventures',
    
    // Channels
    channels: [
      { name: 'gaming-chat', id: null, description: 'General gaming discussions' },
      { name: 'tournaments', id: null, description: 'Competitive tournament organization' },
      { name: 'leaderboards', id: null, description: 'Rankings and achievements' },
      { name: 'game-news', id: null, description: 'Latest gaming industry news' },
      { name: 'bot-help', id: null, description: 'Gaming bot commands and help' }
    ],
    
    // Features
    features: [
      {
        title: 'Tournaments',
        description: 'Compete in organized tournaments across multiple games',
        icon: '🏆'
      },
      {
        title: 'Leaderboards',
        description: 'Track your progress and compete for top rankings',
        icon: '📊'
      },
      {
        title: 'Game Nights',
        description: 'Weekly community game sessions',
        icon: '🎲'
      },
      {
        title: 'Bot Integration',
        description: 'Custom gaming bots for stats and automation',
        icon: '🤖'
      }
    ],
    
    // Popular Games
    games: [
      'League of Legends',
      'Valorant',
      'CS:GO',
      'Dota 2',
      'Overwatch',
      'Minecraft',
      'Among Us',
      'Fall Guys'
    ],
    
    // Roles & Ranks
    ranks: [
      { name: 'Gaming Initiate', xpRequired: 0, icon: '🎮' },
      { name: 'Casual Gamer', xpRequired: 1000, icon: '🕹️' },
      { name: 'Competitive Player', xpRequired: 5000, icon: '⚔️' },
      { name: 'Tournament Champion', xpRequired: 10000, icon: '🏆' },
      { name: 'Gaming Legend', xpRequired: 25000, icon: '👑' }
    ],
    
    // Events
    events: [
      'Weekly Tournaments',
      'Game Nights',
      'Speedrun Challenges',
      'LAN Party Simulations'
    ],
    
    // Resources
    resources: [
      { title: 'Game Guides', url: '/pathways/gaming/guides' },
      { title: 'Tournament Rules', url: '/pathways/gaming/tournaments' },
      { title: 'Bot Commands', url: '/pathways/gaming/bot-help' }
    ],
    
    // Stats
    stats: {
      memberCount: 0,
      activeMembers: 0,
      eventsHosted: 0,
      tournamentsCompleted: 0
    },
    
    // Media
    image: '/Assets/Images/Pathways/gaming/hero.jpg',
    thumbnail: '/Assets/Images/Pathways/gaming/thumbnail.jpg',
    banner: '/Assets/Images/Pathways/gaming/banner.jpg',
    
    // Meta
    createdAt: '2024-01-01',
    isActive: true,
    featured: true,
    order: 1
  },
  
  lorebound: {
    id: 'lorebound',
    name: 'Lorebound Realm',
    fullName: 'The Lorebound Sanctuary',
    tagline: 'Where Stories Come Alive',
    icon: '📚',
    emoji: '📚',
    color: '#FF1493',
    gradient: 'linear-gradient(135deg, #FF1493 0%, #9932CC 100%)',
    
    // Discord Integration
    roleId: '1397498835919442033',
    categoryId: null,
    
    // Description
    description: 'Welcome to the Lorebound Sanctuary, where anime, manga, and storytelling converge. Dive deep into tales of wonder, share your favorite series, and connect with fellow otaku.',
    shortDescription: 'Anime, manga, and storytelling sanctuary',
    
    // Channels
    channels: [
      { name: 'anime-chat', id: null, description: 'Discuss your favorite anime' },
      { name: 'manga-library', id: null, description: 'Manga recommendations and reviews' },
      { name: 'reviews', id: null, description: 'Member reviews and critiques' },
      { name: 'collections', id: null, description: 'Curated recommendation lists' },
      { name: 'sites', id: null, description: 'Anime/manga streaming sites' }
    ],
    
    // Features
    features: [
      {
        title: 'Manga Library',
        description: 'Comprehensive manga database and recommendations',
        icon: '📖'
      },
      {
        title: 'Anime Reviews',
        description: 'Community-driven reviews and ratings',
        icon: '⭐'
      },
      {
        title: 'Watch Parties',
        description: 'Group anime viewing sessions',
        icon: '📺'
      },
      {
        title: 'Fan Creations',
        description: 'Share fanart, fanfics, and AMVs',
        icon: '🎨'
      }
    ],
    
    // Categories
    categories: [
      'Shonen',
      'Seinen',
      'Shojo',
      'Isekai',
      'Slice of Life',
      'Mecha',
      'Psychological',
      'Romance'
    ],
    
    // Roles & Ranks
    ranks: [
      { name: 'Lore Seeker', xpRequired: 0, icon: '📚' },
      { name: 'Story Enthusiast', xpRequired: 1000, icon: '📖' },
      { name: 'Anime Connoisseur', xpRequired: 5000, icon: '🎭' },
      { name: 'Manga Master', xpRequired: 10000, icon: '📜' },
      { name: 'Lore Keeper', xpRequired: 25000, icon: '👁️' }
    ],
    
    // Events
    events: [
      'Anime Watch Parties',
      'Manga Reading Clubs',
      'Character Discussions',
      'Seasonal Reviews'
    ],
    
    // Resources
    resources: [
      { title: 'Anime Database', url: '/pathways/lorebound/library' },
      { title: 'Review Archive', url: '/pathways/lorebound/reviews' },
      { title: 'Streaming Sites', url: '/pathways/lorebound/sites' }
    ],
    
    // Stats
    stats: {
      memberCount: 0,
      activeMembers: 0,
      reviewsPosted: 0,
      watchPartiesHosted: 0
    },
    
    // Media
    image: '/Assets/Images/Pathways/lorebound/hero.jpg',
    thumbnail: '/Assets/Images/Pathways/lorebound/thumbnail.jpg',
    banner: '/Assets/Images/Pathways/lorebound/banner.jpg',
    
    // Meta
    createdAt: '2024-01-01',
    isActive: true,
    featured: true,
    order: 2
  },
  
  productive: {
    id: 'productive',
    name: 'Productive Realm',
    fullName: 'The Productivity Palace',
    tagline: 'Where Excellence is Forged',
    icon: '⚡',
    emoji: '⚡',
    color: '#50C878',
    gradient: 'linear-gradient(135deg, #50C878 0%, #2E8B57 100%)',
    
    // Discord Integration
    roleId: '1409444816189788171',
    categoryId: null,
    
    // Description
    description: 'Step into the Productivity Palace, where ambition meets action. Whether you\'re building skills, crushing goals, or optimizing your life, this is your home for growth.',
    shortDescription: 'Growth, productivity, and self-improvement',
    
    // Channels
    channels: [
      { name: 'productivity-chat', id: null, description: 'General productivity discussions' },
      { name: 'resources', id: null, description: 'Tools, guides, and resources' },
      { name: 'challenges', id: null, description: 'Productivity challenges' },
      { name: 'showcase', id: null, description: 'Share your achievements' },
      { name: 'accountability', id: null, description: 'Accountability partners' }
    ],
    
    // Features
    features: [
      {
        title: 'Goal Tracking',
        description: 'Set and track your personal and professional goals',
        icon: '🎯'
      },
      {
        title: 'Resource Library',
        description: 'Curated tools and guides for productivity',
        icon: '📚'
      },
      {
        title: 'Challenges',
        description: 'Regular productivity challenges and competitions',
        icon: '🏆'
      },
      {
        title: 'Accountability',
        description: 'Find partners to keep you on track',
        icon: '🤝'
      }
    ],
    
    // Focus Areas
    focusAreas: [
      'Time Management',
      'Skill Development',
      'Career Growth',
      'Study Techniques',
      'Fitness & Health',
      'Financial Literacy',
      'Creative Projects',
      'Entrepreneurship'
    ],
    
    // Roles & Ranks
    ranks: [
      { name: 'Aspiring Achiever', xpRequired: 0, icon: '⚡' },
      { name: 'Goal Setter', xpRequired: 1000, icon: '🎯' },
      { name: 'Productive Member', xpRequired: 5000, icon: '📈' },
      { name: 'Excellence Exemplar', xpRequired: 10000, icon: '💎' },
      { name: 'Master of Productivity', xpRequired: 25000, icon: '👑' }
    ],
    
    // Events
    events: [
      '30-Day Challenges',
      'Skill Workshops',
      'Goal Setting Sessions',
      'Achievement Showcases'
    ],
    
    // Resources
    resources: [
      { title: 'Productivity Tools', url: '/pathways/productive/resources' },
      { title: 'Challenge Archive', url: '/pathways/productive/challenges' },
      { title: 'Success Stories', url: '/pathways/productive/showcase' }
    ],
    
    // Stats
    stats: {
      memberCount: 0,
      activeMembers: 0,
      challengesCompleted: 0,
      goalsAchieved: 0
    },
    
    // Media
    image: '/Assets/Images/Pathways/productive/hero.jpg',
    thumbnail: '/Assets/Images/Pathways/productive/thumbnail.jpg',
    banner: '/Assets/Images/Pathways/productive/banner.jpg',
    
    // Meta
    createdAt: '2024-01-01',
    isActive: true,
    featured: true,
    order: 3
  },
  
  news: {
    id: 'news',
    name: 'News Nexus',
    fullName: 'The News Nexus',
    tagline: 'Where Truth Illuminates',
    icon: '📰',
    emoji: '📰',
    color: '#E0115F',
    gradient: 'linear-gradient(135deg, #E0115F 0%, #DC143C 100%)',
    
    // Discord Integration
    roleId: '1395703930587189321',
    categoryId: null,
    
    // Description
    description: 'Enter the News Nexus, your gateway to staying informed. From breaking news to deep analysis, we cut through the noise to deliver what matters most.',
    shortDescription: 'Stay informed with breaking news and analysis',
    
    // Channels
    channels: [
      { name: 'breaking-news', id: null, description: 'Real-time news updates' },
      { name: 'tech-news', id: null, description: 'Technology and AI developments' },
      { name: 'science-news', id: null, description: 'Scientific discoveries' },
      { name: 'local-news', id: null, description: 'Regional news coverage' },
      { name: 'analysis', id: null, description: 'In-depth news analysis' },
      { name: 'discussions', id: null, description: 'News debates and discussions' }
    ],
    
    // Features
    features: [
      {
        title: 'Breaking News',
        description: 'Real-time updates on major world events',
        icon: '⚡'
      },
      {
        title: 'Deep Analysis',
        description: 'Expert analysis and commentary',
        icon: '🔍'
      },
      {
        title: 'Fact Checking',
        description: 'Verified information and source validation',
        icon: '✓'
      },
      {
        title: 'Discussion Forums',
        description: 'Engage in civil, informed debates',
        icon: '💬'
      }
    ],
    
    // Categories
    categories: [
      'World News',
      'Technology',
      'Science',
      'Politics',
      'Business',
      'Environment',
      'Health',
      'Culture'
    ],
    
    // Roles & Ranks
    ranks: [
      { name: 'News Reader', xpRequired: 0, icon: '📰' },
      { name: 'Informed Citizen', xpRequired: 1000, icon: '📖' },
      { name: 'Critical Thinker', xpRequired: 5000, icon: '🧠' },
      { name: 'News Analyst', xpRequired: 10000, icon: '🔍' },
      { name: 'Truth Seeker', xpRequired: 25000, icon: '💡' }
    ],
    
    // Events
    events: [
      'Weekly News Roundup',
      'Expert Q&A Sessions',
      'Debate Nights',
      'News Analysis Workshops'
    ],
    
    // Resources
    resources: [
      { title: 'News Archive', url: '/pathways/news/breaking' },
      { title: 'Analysis Library', url: '/pathways/news/analysis' },
      { title: 'Discussion Guidelines', url: '/pathways/news/discussions' }
    ],
    
    // Stats
    stats: {
      memberCount: 0,
      activeMembers: 0,
      articlesShared: 0,
      discussionsHeld: 0
    },
    
    // Media
    image: '/Assets/Images/Pathways/news/hero.jpg',
    thumbnail: '/Assets/Images/Pathways/news/thumbnail.jpg',
    banner: '/Assets/Images/Pathways/news/banner.jpg',
    
    // Meta
    createdAt: '2024-01-01',
    isActive: true,
    featured: true,
    order: 4
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get pathway by ID
 */
export function getPathwayById(id) {
  return PATHWAYS[id] || null;
}

/**
 * Get all pathways as array
 */
export function getAllPathways() {
  return Object.values(PATHWAYS).sort((a, b) => a.order - b.order);
}

/**
 * Get pathway by role ID
 */
export function getPathwayByRoleId(roleId) {
  return Object.values(PATHWAYS).find(p => p.roleId === roleId) || null;
}

/**
 * Get active pathways
 */
export function getActivePathways() {
  return Object.values(PATHWAYS)
    .filter(p => p.isActive)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get featured pathways
 */
export function getFeaturedPathways() {
  return Object.values(PATHWAYS)
    .filter(p => p.featured && p.isActive)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get pathway color
 */
export function getPathwayColor(pathwayId) {
  const pathway = getPathwayById(pathwayId);
  return pathway?.color || '#D4AF37';
}

/**
 * Get pathway gradient
 */
export function getPathwayGradient(pathwayId) {
  const pathway = getPathwayById(pathwayId);
  return pathway?.gradient || 'linear-gradient(135deg, #D4AF37 0%, #8A2BE2 100%)';
}

/**
 * Get pathway icon
 */
export function getPathwayIcon(pathwayId) {
  const pathway = getPathwayById(pathwayId);
  return pathway?.icon || '✨';
}

/**
 * Check if user can join pathway
 */
export function canJoinPathway(pathwayId, userRoles = []) {
  const pathway = getPathwayById(pathwayId);
  if (!pathway || !pathway.isActive) return false;
  
  // Check if user already has this pathway role
  return !userRoles.includes(pathway.roleId);
}

/**
 * Get pathway statistics summary
 */
export function getPathwayStats(pathwayId) {
  const pathway = getPathwayById(pathwayId);
  return pathway?.stats || {
    memberCount: 0,
    activeMembers: 0
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
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
};