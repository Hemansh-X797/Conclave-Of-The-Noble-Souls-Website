// ============================================================================
// SERVER LORE & CODEX
// The complete history and mythos of The Conclave Realm
// /src/data/lore.js
// ============================================================================

export const REALM_LORE = {
  origin: {
    title: 'The Genesis of The Conclave',
    date: '2024-01-01',
    content: `In the digital expanse where countless voices merge into cacophony, there arose a vision—a sanctuary where excellence meets nobility, where ambition finds purpose, and where kindred spirits unite in pursuit of greatness.

Thus was born The Conclave Realm, founded upon pillars of respect, growth, and community. Not merely a gathering place, but a living realm where each member contributes to a tapestry of collective brilliance.

From its inception, The Conclave has stood as a beacon for those who seek more than idle chat—for noble souls who dare to strive, to learn, to create, and to inspire.`,
    author: 'The Founder',
    category: 'foundation'
  },
  
  philosophy: {
    title: 'The Noble Philosophy',
    content: `The Conclave is built upon three sacred pillars:

**Excellence**: We pursue mastery in all endeavors, from competitive gaming to creative expression, from productivity to informed discourse.

**Nobility**: We carry ourselves with dignity, treating all with respect, and maintaining standards that elevate the entire community.

**Unity**: We are stronger together. Our diverse pathways—Gaming, Lorebound, Productive, and News—converge in a single realm of shared purpose.

These are not mere words but the living principles that guide every interaction, every event, and every moment within our walls.`,
    author: 'The Codex',
    category: 'philosophy'
  },
  
  pathways: {
    title: 'The Four Great Pathways',
    content: `Within The Conclave exist four great pathways, each a realm unto itself yet part of the greater whole:

**The Gaming Realm** - Where warriors test their mettle in digital battlefields. Here, strategy meets skill, competition breeds excellence, and every game is a chance to forge legends.

**The Lorebound Sanctuary** - Where stories breathe and imagination runs wild. A haven for those who cherish anime, manga, and the art of storytelling. Here, discussions transcend simple fandom to become explorations of narrative craft.

**The Productivity Palace** - Where ambition crystallizes into achievement. A forge for those who seek to optimize their lives, build their skills, and manifest their dreams into reality.

**The News Nexus** - Where truth illuminates and discourse elevates. A space for the intellectually curious, where current events are not just reported but analyzed, debated, and understood.

Each pathway welcomes all who resonate with its purpose, and members may walk multiple paths as their interests guide them.`,
    author: 'The Keeper',
    category: 'structure'
  }
};

export const HISTORICAL_MILESTONES = [
  {
    id: 'founding',
    title: 'The Founding',
    date: '2024-01-01',
    description: 'The Conclave Realm was established with a vision to create a premium Discord community.',
    significance: 'Genesis of the realm',
    icon: '🏛️',
    category: 'foundation'
  },
  {
    id: 'first-hundred',
    title: 'First Hundred Nobles',
    date: '2024-02-01',
    description: 'The community reached 100 active members, marking the first major milestone.',
    significance: 'Community growth',
    icon: '💯',
    category: 'growth'
  },
  {
    id: 'pathway-system',
    title: 'Pathway System Launch',
    date: '2024-03-01',
    description: 'The four pathway system was implemented, giving structure to diverse interests.',
    significance: 'Community organization',
    icon: '🛤️',
    category: 'structure'
  },
  {
    id: 'first-tournament',
    title: 'Inaugural Tournament',
    date: '2024-04-01',
    description: 'The Gaming Realm hosted its first major tournament, establishing competitive traditions.',
    significance: 'Gaming culture establishment',
    icon: '🏆',
    category: 'events'
  }
];

export const CODEX_ENTRIES = [
  {
    id: 'noble-conduct',
    title: 'The Code of Noble Conduct',
    category: 'conduct',
    content: `1. **Respect All Souls**: Every member, regardless of rank or role, deserves dignity and courtesy.

2. **Pursue Excellence**: Strive for quality in all contributions, whether in gaming, discussion, or creative work.

3. **Foster Growth**: Help others rise. Share knowledge freely and celebrate others' achievements.

4. **Maintain Decorum**: Express disagreements with civility. Debate ideas, not people.

5. **Honor Commitments**: If you commit to an event, challenge, or task, see it through.

6. **Protect the Realm**: Report issues, help newcomers, and contribute to a positive atmosphere.

7. **Embrace Diversity**: Our pathways are many, our interests varied, yet we are one community.

These principles are not rules to be enforced, but ideals to be embodied.`,
    weight: 100
  },
  
  {
    id: 'ranking-system',
    title: 'The Path of Advancement',
    category: 'progression',
    content: `Within each pathway exists a hierarchy of mastery:

**Initiates** - Those newly joined to a pathway, learning its ways.

**Enthusiasts** - Active participants who've proven their dedication.

**Masters** - Accomplished members who exemplify pathway excellence.

**Legends** - The pinnacle of achievement, recognized across the entire realm.

Advancement comes not through time alone, but through genuine contribution, consistent activity, and embodiment of noble principles.`,
    weight: 80
  },
  
  {
    id: 'events-tradition',
    title: 'The Tradition of Gatherings',
    category: 'events',
    content: `The Conclave thrives on shared experiences:

Weekly gatherings unite pathway members in their chosen pursuits—gaming nights for warriors, watch parties for story lovers, challenges for the ambitious, and discussions for the informed.

These are not mere activities but rituals that strengthen bonds, create memories, and define our culture.

Participation is honored, hosting is celebrated, and every event contributes to the living history of our realm.`,
    weight: 70
  },
  
  {
    id: 'staff-oath',
    title: 'The Oath of Stewardship',
    category: 'staff',
    content: `Those who serve as staff bear special responsibility:

To moderate with wisdom, not just rules.
To lead by example, not just authority.
To protect the vulnerable without stifling the bold.
To enforce standards while nurturing growth.
To remain fair when passion tempts bias.
To serve the community, not personal glory.

Staff are not masters but servants of the community's collective good.`,
    weight: 90
  }
];

export const LEGENDS = [
  {
    id: 'founder-legend',
    title: 'The Founder\'s Vision',
    type: 'legend',
    content: `Long did the founder wander the digital realms, seeking a place where excellence and camaraderie merged. Finding none that matched the vision burning within, the decision was made: to build it.

Not a chaotic sprawl, but a structured sanctuary. Not a tyranny of rules, but a culture of respect. Not a single-minded community, but a realm of diverse passions united by shared values.

Thus The Conclave was born—a testament to what digital community could be when built with purpose and maintained with care.`,
    date: '2024-01-01',
    author: 'The Chronicler',
    icon: '📜'
  }
];

export const REALM_ACHIEVEMENTS = {
  community: [
    {
      id: 'first-week',
      name: 'Noble Initiate',
      description: 'Survived your first week in The Conclave',
      icon: '🌟',
      xp: 50,
      rarity: 'common'
    },
    {
      id: 'first-month',
      name: 'Established Noble',
      description: 'One month of active membership',
      icon: '📅',
      xp: 150,
      rarity: 'common'
    },
    {
      id: 'six-months',
      name: 'Veteran Noble',
      description: 'Six months of dedication to the realm',
      icon: '🎖️',
      xp: 500,
      rarity: 'uncommon'
    },
    {
      id: 'one-year',
      name: 'Cornerstone',
      description: 'One full year in The Conclave',
      icon: '💎',
      xp: 1000,
      rarity: 'rare'
    },
    {
      id: 'helpful-soul',
      name: 'Helpful Soul',
      description: 'Assisted 10 new members',
      icon: '🤝',
      xp: 200,
      rarity: 'uncommon'
    },
    {
      id: 'event-enthusiast',
      name: 'Event Enthusiast',
      description: 'Participated in 10 community events',
      icon: '🎉',
      xp: 300,
      rarity: 'uncommon'
    }
  ],
  
  gaming: [
    {
      id: 'gaming-initiate',
      name: 'Gaming Initiate',
      description: 'Joined the Gaming Realm',
      icon: '🎮',
      xp: 50,
      rarity: 'common'
    },
    {
      id: 'tournament-victor',
      name: 'Tournament Victor',
      description: 'Won a gaming tournament',
      icon: '🏆',
      xp: 500,
      rarity: 'rare'
    },
    {
      id: 'game-night-regular',
      name: 'Game Night Regular',
      description: 'Attended 5 game nights',
      icon: '🕹️',
      xp: 250,
      rarity: 'uncommon'
    },
    {
      id: 'gaming-legend',
      name: 'Gaming Legend',
      description: 'Reached legendary status in gaming',
      icon: '👑',
      xp: 2000,
      rarity: 'legendary'
    }
  ],
  
  lorebound: [
    {
      id: 'lore-seeker',
      name: 'Lore Seeker',
      description: 'Joined the Lorebound Sanctuary',
      icon: '📚',
      xp: 50,
      rarity: 'common'
    },
    {
      id: 'watch-party-fan',
      name: 'Watch Party Fan',
      description: 'Attended 5 anime watch parties',
      icon: '📺',
      xp: 250,
      rarity: 'uncommon'
    },
    {
      id: 'review-master',
      name: 'Review Master',
      description: 'Wrote 10 comprehensive reviews',
      icon: '✍️',
      xp: 400,
      rarity: 'rare'
    },
    {
      id: 'lore-keeper',
      name: 'Lore Keeper',
      description: 'Became a master of stories',
      icon: '👁️',
      xp: 2000,
      rarity: 'legendary'
    }
  ],
  
  productive: [
    {
      id: 'productivity-novice',
      name: 'Aspiring Achiever',
      description: 'Joined the Productivity Palace',
      icon: '⚡',
      xp: 50,
      rarity: 'common'
    },
    {
      id: 'challenge-complete',
      name: 'Challenge Champion',
      description: 'Completed a 30-day challenge',
      icon: '🎯',
      xp: 500,
      rarity: 'rare'
    },
    {
      id: 'goal-crusher',
      name: 'Goal Crusher',
      description: 'Achieved 10 documented goals',
      icon: '💪',
      xp: 600,
      rarity: 'rare'
    },
    {
      id: 'productivity-master',
      name: 'Productivity Master',
      description: 'Reached the pinnacle of productivity',
      icon: '👑',
      xp: 2000,
      rarity: 'legendary'
    }
  ],
  
  news: [
    {
      id: 'news-reader',
      name: 'News Reader',
      description: 'Joined the News Nexus',
      icon: '📰',
      xp: 50,
      rarity: 'common'
    },
    {
      id: 'debate-participant',
      name: 'Debate Participant',
      description: 'Participated in 5 civil debates',
      icon: '💬',
      xp: 250,
      rarity: 'uncommon'
    },
    {
      id: 'fact-checker',
      name: 'Fact Checker',
      description: 'Verified 10 news sources',
      icon: '✓',
      xp: 300,
      rarity: 'uncommon'
    },
    {
      id: 'truth-seeker',
      name: 'Truth Seeker',
      description: 'Mastered the art of informed discourse',
      icon: '💡',
      xp: 2000,
      rarity: 'legendary'
    }
  ]
};

export const REALM_QUOTES = [
  {
    id: 'excellence',
    quote: 'Excellence is not a destination, but a journey we walk together.',
    author: 'The Founder',
    category: 'philosophy'
  },
  {
    id: 'nobility',
    quote: 'True nobility is not in title or rank, but in how we treat one another.',
    author: 'The Codex',
    category: 'conduct'
  },
  {
    id: 'unity',
    quote: 'Four pathways, one realm. Diverse passions, shared purpose.',
    author: 'The Keeper',
    category: 'community'
  },
  {
    id: 'growth',
    quote: 'We rise by lifting others. We grow by sharing knowledge.',
    author: 'Council of Elders',
    category: 'values'
  },
  {
    id: 'gaming',
    quote: 'In competition we test ourselves. In victory, we remain humble.',
    author: 'Gaming Realm Proverb',
    category: 'gaming'
  },
  {
    id: 'lorebound',
    quote: 'Every story has power. Every tale teaches truth.',
    author: 'Lorebound Wisdom',
    category: 'lorebound'
  },
  {
    id: 'productive',
    quote: 'Dreams become reality through consistent, noble action.',
    author: 'Productivity Mantra',
    category: 'productive'
  },
  {
    id: 'news',
    quote: 'Truth illuminates. Understanding unites. Knowledge empowers.',
    author: 'News Nexus Motto',
    category: 'news'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get lore entry by ID
 */
export function getLoreEntry(id) {
  return REALM_LORE[id] || null;
}

/**
 * Get all codex entries
 */
export function getAllCodexEntries() {
  return CODEX_ENTRIES.sort((a, b) => b.weight - a.weight);
}

/**
 * Get codex entries by category
 */
export function getCodexByCategory(category) {
  return CODEX_ENTRIES.filter(e => e.category === category)
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Get historical milestones
 */
export function getHistoricalMilestones() {
  return HISTORICAL_MILESTONES.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Get milestones by category
 */
export function getMilestonesByCategory(category) {
  return HISTORICAL_MILESTONES.filter(m => m.category === category)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Get achievements by pathway
 */
export function getAchievementsByPathway(pathway) {
  return REALM_ACHIEVEMENTS[pathway] || [];
}

/**
 * Get all achievements
 */
export function getAllAchievements() {
  return Object.values(REALM_ACHIEVEMENTS).flat();
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity) {
  return getAllAchievements().filter(a => a.rarity === rarity);
}

/**
 * Get random quote
 */
export function getRandomQuote(category = null) {
  const quotes = category 
    ? REALM_QUOTES.filter(q => q.category === category)
    : REALM_QUOTES;
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Get quotes by category
 */
export function getQuotesByCategory(category) {
  return REALM_QUOTES.filter(q => q.category === category);
}

/**
 * Calculate total XP from achievements
 */
export function calculateAchievementXP(earnedAchievements = []) {
  let totalXP = 0;
  const allAchievements = getAllAchievements();
  
  earnedAchievements.forEach(achievementId => {
    const achievement = allAchievements.find(a => a.id === achievementId);
    if (achievement) {
      totalXP += achievement.xp;
    }
  });
  
  return totalXP;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id) {
  return getAllAchievements().find(a => a.id === id) || null;
}

/**
 * Get lore statistics
 */
export function getLoreStats() {
  return {
    totalLore: Object.keys(REALM_LORE).length,
    codexEntries: CODEX_ENTRIES.length,
    milestones: HISTORICAL_MILESTONES.length,
    achievements: getAllAchievements().length,
    quotes: REALM_QUOTES.length,
    legends: LEGENDS.length
  };
}

/**
 * Search lore content
 */
export function searchLore(query) {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  // Search realm lore
  Object.values(REALM_LORE).forEach(entry => {
    if (entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm)) {
      results.push({ type: 'lore', ...entry });
    }
  });
  
  // Search codex
  CODEX_ENTRIES.forEach(entry => {
    if (entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm)) {
      results.push({ type: 'codex', ...entry });
    }
  });
  
  // Search quotes
  REALM_QUOTES.forEach(quote => {
    if (quote.quote.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm)) {
      results.push({ type: 'quote', ...quote });
    }
  });
  
  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
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