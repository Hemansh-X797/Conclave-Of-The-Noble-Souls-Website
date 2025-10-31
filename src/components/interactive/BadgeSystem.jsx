import React, { useState, useEffect } from 'react';
import ' @/styles/interactive.css';

const BadgeSystem = ({
  earnedBadges = [],
  showLocked = true,
  pathway = 'default',
  filter = 'all',
  onBadgeClick,
  className = '',
  ...props
}) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [displayedBadges, setDisplayedBadges] = useState([]);

  useEffect(() => {
    filterBadges();
  }, [activeFilter, earnedBadges, showLocked]);

  const filterBadges = () => {
    let badges = [...ALL_BADGES];

    if (!showLocked) {
      badges = badges.filter(badge => earnedBadges.includes(badge.id));
    }

    if (activeFilter !== 'all') {
      badges = badges.filter(badge => {
        if (activeFilter === 'pathway') {
          return badge.category === 'pathway';
        }
        if (activeFilter === 'milestone') {
          return badge.category === 'milestone';
        }
        return badge.rarity === activeFilter;
      });
    }

    setDisplayedBadges(badges);
  };

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };

  const closeModal = () => {
    setSelectedBadge(null);
  };

  const isEarned = (badgeId) => earnedBadges.includes(badgeId);

  return (
    <div className={`badge-system-container ${pathway}-realm ${className}`} {...props}>
      <div className="badge-system-header">
        <h1 className="badge-system-title">Achievements</h1>
        <p className="badge-system-subtitle">
          {earnedBadges.length} / {ALL_BADGES.length} Unlocked
        </p>
      </div>

      <div className="badge-filters">
        <button
          className={`badge-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
          data-cursor="hover"
        >
          All
        </button>
        <button
          className={`badge-filter-btn ${activeFilter === 'pathway' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pathway')}
          data-cursor="hover"
        >
          Pathway
        </button>
        <button
          className={`badge-filter-btn ${activeFilter === 'milestone' ? 'active' : ''}`}
          onClick={() => setActiveFilter('milestone')}
          data-cursor="hover"
        >
          Milestone
        </button>
        <button
          className={`badge-filter-btn ${activeFilter === 'legendary' ? 'active' : ''}`}
          onClick={() => setActiveFilter('legendary')}
          data-cursor="hover"
        >
          Legendary
        </button>
      </div>

      <div className="badge-grid">
        {displayedBadges.map((badge) => {
          const earned = isEarned(badge.id);
          return (
            <div
              key={badge.id}
              className={`badge-card ${badge.rarity} ${!earned ? 'locked' : ''}`}
              onClick={() => handleBadgeClick(badge)}
              data-cursor="hover"
            >
              {!earned && <div className="badge-lock-icon">🔒</div>}
              <div className="badge-icon-container">
                <div className="badge-icon">{badge.icon}</div>
              </div>
              <h3 className="badge-name">{badge.name}</h3>
              <div className="badge-rarity">{badge.rarity}</div>
            </div>
          );
        })}
      </div>

      {selectedBadge && (
        <>
          <div className="badge-modal-overlay" onClick={closeModal} />
          <div className="badge-detail-modal">
            <div className="badge-detail-header">
              <div className="badge-detail-icon-large">{selectedBadge.icon}</div>
              <h2 className="badge-detail-title">{selectedBadge.name}</h2>
              <div className={`badge-detail-rarity ${selectedBadge.rarity}`}>
                {selectedBadge.rarity}
              </div>
            </div>
            <p className="badge-detail-description">{selectedBadge.description}</p>
            
            {selectedBadge.requirements && (
              <div className="badge-detail-requirements">
                <h3 className="badge-detail-requirements-title">Requirements</h3>
                <ul className="badge-detail-requirements-list">
                  {selectedBadge.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="badge-detail-close"
              onClick={closeModal}
              data-cursor="hover"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// All Available Badges
const ALL_BADGES = [
  // Pathway Badges - Gaming
  {
    id: 'gaming-initiate',
    name: 'Digital Warrior',
    icon: '⚔️',
    category: 'pathway',
    pathway: 'gaming',
    rarity: 'common',
    description: 'Welcome to the Gaming Realm. Your journey as a digital warrior begins.',
    requirements: ['Join the Gaming Realm']
  },
  {
    id: 'gaming-veteran',
    name: 'Battle Veteran',
    icon: '🛡️',
    category: 'pathway',
    pathway: 'gaming',
    rarity: 'rare',
    description: 'Proven yourself in countless battles. Your skills are recognized.',
    requirements: ['Participate in 10 gaming events', 'Win 5 matches']
  },
  {
    id: 'gaming-champion',
    name: 'Grand Champion',
    icon: '🏆',
    category: 'pathway',
    pathway: 'gaming',
    rarity: 'epic',
    description: 'Champion of The Conclave gaming tournaments. Few reach this level.',
    requirements: ['Win 3 tournaments', 'Reach top 10 leaderboard']
  },
  {
    id: 'gaming-legend',
    name: 'Legendary Warlord',
    icon: '👑',
    category: 'pathway',
    pathway: 'gaming',
    rarity: 'legendary',
    description: 'A living legend in the Gaming Realm. Your name echoes through halls.',
    requirements: ['Win 10 tournaments', 'Hold #1 rank for 30 days']
  },

  // Pathway Badges - Lorebound
  {
    id: 'lore-seeker',
    name: 'Lore Seeker',
    icon: '📖',
    category: 'pathway',
    pathway: 'lorebound',
    rarity: 'common',
    description: 'Entered the mystical sanctuary. Stories await your discovery.',
    requirements: ['Join the Lorebound Sanctuary']
  },
  {
    id: 'lore-keeper',
    name: 'Lore Keeper',
    icon: '✨',
    category: 'pathway',
    pathway: 'lorebound',
    rarity: 'rare',
    description: 'Guardian of tales. Your knowledge of lore grows deep.',
    requirements: ['Share 25 recommendations', 'Write 5 reviews']
  },
  {
    id: 'lore-master',
    name: 'Lore Master',
    icon: '🔮',
    category: 'pathway',
    pathway: 'lorebound',
    rarity: 'epic',
    description: 'Master of mystical knowledge. Your wisdom guides others.',
    requirements: ['Complete 100 series', 'Create 10 discussion topics']
  },
  {
    id: 'lore-sage',
    name: 'Eternal Sage',
    icon: '✦',
    category: 'pathway',
    pathway: 'lorebound',
    rarity: 'legendary',
    description: 'Eternal keeper of infinite stories. Legends speak of your wisdom.',
    requirements: ['1000+ hours in sanctuary', 'Mentor 10 members']
  },

  // Pathway Badges - Productive
  {
    id: 'productive-apprentice',
    name: 'Apprentice',
    icon: '📝',
    category: 'pathway',
    pathway: 'productive',
    rarity: 'common',
    description: 'First steps toward excellence. Your productivity journey begins.',
    requirements: ['Join the Productive Palace']
  },
  {
    id: 'productive-achiever',
    name: 'Goal Achiever',
    icon: '✅',
    category: 'pathway',
    pathway: 'productive',
    rarity: 'rare',
    description: 'Accomplished significant goals. Your dedication shows results.',
    requirements: ['Complete 25 goals', 'Share 10 achievements']
  },
  {
    id: 'productive-master',
    name: 'Efficiency Master',
    icon: '⚡',
    category: 'pathway',
    pathway: 'productive',
    rarity: 'epic',
    description: 'Master of productivity. Others look to you for guidance.',
    requirements: ['Lead 5 workshops', 'Maintain 90-day streak']
  },
  {
    id: 'productive-titan',
    name: 'Titan of Excellence',
    icon: '👑',
    category: 'pathway',
    pathway: 'productive',
    rarity: 'legendary',
    description: 'Pinnacle of productivity. Your excellence inspires generations.',
    requirements: ['Mentor 20 members', '365-day streak']
  },

  // Pathway Badges - News
  {
    id: 'news-reader',
    name: 'News Reader',
    icon: '📰',
    category: 'pathway',
    pathway: 'news',
    rarity: 'common',
    description: 'Staying informed. Knowledge is power in the News Nexus.',
    requirements: ['Join the News Nexus']
  },
  {
    id: 'news-analyst',
    name: 'Analyst',
    icon: '🔍',
    category: 'pathway',
    pathway: 'news',
    rarity: 'rare',
    description: 'Sharp analytical mind. You see beyond headlines.',
    requirements: ['Post 50 comments', 'Share 25 articles']
  },
  {
    id: 'news-correspondent',
    name: 'Chief Correspondent',
    icon: '📡',
    category: 'pathway',
    pathway: 'news',
    rarity: 'epic',
    description: 'Trusted voice in the nexus. Your insights shape discussions.',
    requirements: ['Lead 10 discussions', 'Write 5 analysis posts']
  },
  {
    id: 'news-oracle',
    name: 'Oracle',
    icon: '◆',
    category: 'pathway',
    pathway: 'news',
    rarity: 'legendary',
    description: 'Legendary analyst. Your foresight is unmatched.',
    requirements: ['1000+ quality posts', 'Predict 10 major events']
  },

  // Milestone Badges
  {
    id: 'first-week',
    name: 'First Week',
    icon: '🌟',
    category: 'milestone',
    rarity: 'common',
    description: 'Survived your first week in The Conclave. Welcome home.',
    requirements: ['Active for 7 days']
  },
  {
    id: 'first-month',
    name: 'Monthly Noble',
    icon: '📅',
    category: 'milestone',
    rarity: 'rare',
    description: 'One month of noble service. Your commitment shows.',
    requirements: ['Active for 30 days']
  },
  {
    id: 'centurion',
    name: 'Centurion',
    icon: '💯',
    category: 'milestone',
    rarity: 'epic',
    description: 'Century of contributions. A pillar of the community.',
    requirements: ['100 posts', '100 reactions given']
  },
  {
    id: 'ancient-noble',
    name: 'Ancient Noble',
    icon: '⏳',
    category: 'milestone',
    rarity: 'legendary',
    description: 'Ancient member of The Conclave. Your legacy is eternal.',
    requirements: ['1 year membership', '1000+ contributions']
  },

  // Special Badges
  {
    id: 'founder',
    name: 'Founder',
    icon: '🏛️',
    category: 'special',
    rarity: 'mythic',
    description: 'Foundation of The Conclave. One of the original nobles.',
    requirements: ['Joined in first month']
  },
  {
    id: 'benefactor',
    name: 'Noble Benefactor',
    icon: '💎',
    category: 'special',
    rarity: 'legendary',
    description: 'Generous supporter. Your contributions fuel the realm.',
    requirements: ['Support The Conclave']
  },
  {
    id: 'community-leader',
    name: 'Community Leader',
    icon: '🎖️',
    category: 'special',
    rarity: 'epic',
    description: 'Natural leader. You bring people together.',
    requirements: ['Organize 5 community events']
  },
  {
    id: 'helper',
    name: 'Noble Helper',
    icon: '🤝',
    category: 'special',
    rarity: 'rare',
    description: 'Always ready to assist. Your kindness is valued.',
    requirements: ['Help 50 members']
  },

  // Admin Badges
  {
    id: 'duke',
    name: 'Duke',
    icon: '🎭',
    category: 'admin',
    rarity: 'epic',
    description: 'Moderator of The Conclave. Keeper of peace.',
    requirements: ['Moderator role']
  },
  {
    id: 'grand-duke',
    name: 'Grand Duke',
    icon: '♖',
    category: 'admin',
    rarity: 'legendary',
    description: 'Administrator of The Conclave. Guardian of the realm.',
    requirements: ['Administrator role']
  },
  {
    id: 'sovereign',
    name: 'Sovereign',
    icon: '♔',
    category: 'admin',
    rarity: 'mythic',
    description: 'Supreme ruler of The Conclave. The founder and leader.',
    requirements: ['Owner role']
  },

  // Event Badges
  {
    id: 'event-participant',
    name: 'Event Enthusiast',
    icon: '🎉',
    category: 'event',
    rarity: 'common',
    description: 'Participated in community events. Fun times ahead.',
    requirements: ['Join 3 events']
  },
  {
    id: 'event-organizer',
    name: 'Event Master',
    icon: '🎪',
    category: 'event',
    rarity: 'rare',
    description: 'Organized memorable events. You bring joy to the realm.',
    requirements: ['Organize 5 events']
  },
  {
    id: 'anniversary',
    name: 'Anniversary Noble',
    icon: '🎂',
    category: 'event',
    rarity: 'epic',
    description: 'Celebrated The Conclave anniversary. Part of history.',
    requirements: ['Attend anniversary event']
  },

  // Creative Badges
  {
    id: 'artist',
    name: 'Noble Artist',
    icon: '🎨',
    category: 'creative',
    rarity: 'rare',
    description: 'Creative soul. Your art enriches the community.',
    requirements: ['Share 10 artworks']
  },
  {
    id: 'writer',
    name: 'Scribe',
    icon: '✍️',
    category: 'creative',
    rarity: 'rare',
    description: 'Master of words. Your stories captivate readers.',
    requirements: ['Write 10 posts']
  },
  {
    id: 'meme-lord',
    name: 'Meme Lord',
    icon: '😂',
    category: 'creative',
    rarity: 'epic',
    description: 'Legendary memer. Laughter follows in your wake.',
    requirements: ['Create 50 memes', '500+ reactions']
  }
];

// Utility function to get badges by category
export const getBadgesByCategory = (category) => {
  return ALL_BADGES.filter(badge => badge.category === category);
};

// Utility function to get badges by rarity
export const getBadgesByRarity = (rarity) => {
  return ALL_BADGES.filter(badge => badge.rarity === rarity);
};

// Utility function to get badges by pathway
export const getBadgesByPathway = (pathway) => {
  return ALL_BADGES.filter(badge => badge.pathway === pathway);
};

export { ALL_BADGES };
export default BadgeSystem;