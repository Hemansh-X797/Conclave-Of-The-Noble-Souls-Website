import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TextFlameButton } from './LuxuryButton';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PATH PROGRESS COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium progress tracking for pathway engagement and achievements.
 * Displays member progress, streaks, levels, and milestones with animations.
 * 
 * Features:
 * - Progress bars with smooth animations
 * - Level/rank display with pathway theming
 * - Achievement badges earned
 * - Activity streak tracking
 * - Contribution stats
 * - Next milestone preview
 * - Leaderboard position indicator
 * - Visual rewards and celebrations
 * - Pathway-specific theming
 * - Mobile responsive
 * 
 * @component
 * @example
 * @version 1.0
 * <PathProgress
 *   pathway="gaming"
 *   level={12}
 *   currentXP={750}
 *   requiredXP={1000}
 *   streak={7}
 *   achievements={['gaming-initiate', 'tournament-winner']}
 *   rank={42}
 *   totalMembers={1250}
 * />
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAY_CONFIG = {
  gaming: {
    name: 'Gaming Realm',
    color: '#00bfff',
    gradient: 'linear-gradient(135deg, #00bfff 0%, #8a2be2 100%)',
    icon: '🎮',
    levelTitle: 'Gamer Level',
    ranks: ['Noob', 'Player', 'Pro', 'Elite', 'Legend', 'God'],
  },
  lorebound: {
    name: 'Lorebound Sanctum',
    color: '#6a0dad',
    gradient: 'linear-gradient(135deg, #6a0dad 0%, #9932cc 100%)',
    icon: '📚',
    levelTitle: 'Sage Level',
    ranks: ['Novice', 'Reader', 'Scholar', 'Sage', 'Master', 'Archon'],
  },
  productive: {
    name: 'Productive Nexus',
    color: '#c0c0c0',
    gradient: 'linear-gradient(135deg, #c0c0c0 0%, #95a5a6 100%)',
    icon: '⚡',
    levelTitle: 'Builder Level',
    ranks: ['Starter', 'Maker', 'Builder', 'Expert', 'Master', 'Titan'],
  },
  news: {
    name: 'News Nexus',
    color: '#e5e4e2',
    gradient: 'linear-gradient(135deg, #e5e4e2 0%, #bdc3c7 100%)',
    icon: '📰',
    levelTitle: 'Reporter Level',
    ranks: ['Observer', 'Reporter', 'Journalist', 'Editor', 'Publisher', 'Oracle'],
  },
};

const ACHIEVEMENT_LIBRARY = {
  'gaming-initiate': { icon: '🎮', name: 'Gaming Initiate', color: '#00bfff' },
  'tournament-winner': { icon: '🏆', name: 'Tournament Winner', color: '#ffd700' },
  'first-week': { icon: '⏰', name: 'First Week', color: '#4caf50' },
  'active-member': { icon: '🔥', name: 'Active Member', color: '#ff6b6b' },
  'helpful-soul': { icon: '💝', name: 'Helpful Soul', color: '#ff69b4' },
  'lorebound-reader': { icon: '📖', name: 'Avid Reader', color: '#6a0dad' },
  'productive-streak': { icon: '⚡', name: 'Productive Streak', color: '#c0c0c0' },
  'news-contributor': { icon: '📝', name: 'News Contributor', color: '#e5e4e2' },
};

const MILESTONES = [
  { level: 5, reward: 'Special Badge', icon: '🎖️' },
  { level: 10, reward: 'Custom Role', icon: '👑' },
  { level: 25, reward: 'VIP Access', icon: '⭐' },
  { level: 50, reward: 'Legend Status', icon: '🔱' },
  { level: 100, reward: 'Eternal Glory', icon: '✨' },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const calculateProgressPercent = (current, required) => {
  return Math.min((current / required) * 100, 100);
};

const getRankTitle = (level, ranks) => {
  const index = Math.min(Math.floor(level / 20), ranks.length - 1);
  return ranks[index];
};

const getNextMilestone = (currentLevel) => {
  return MILESTONES.find(m => m.level > currentLevel) || MILESTONES[MILESTONES.length - 1];
};

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || '0';
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PathProgress = ({
  // Core Data
  pathway = 'gaming',
  level = 1,
  currentXP = 0,
  requiredXP = 100,
  
  // Stats
  streak = 0,
  achievements = [],
  rank = 0,
  totalMembers = 0,
  contributions = 0,
  
  // Display Options
  showLevel = true,
  showStreak = true,
  showAchievements = true,
  showRank = true,
  showMilestone = true,
  showStats = true,
  compact = false,
  
  // Behavior
  animated = true,
  celebrateLevelUp = false,
  
  // Callbacks
  onViewAchievements,
  onViewLeaderboard,
  
  // Styling
  className = '',
  style = {},
  
  // Advanced
  debug = false,
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const [displayXP, setDisplayXP] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const pathwayConfig = useMemo(() => {
    return PATHWAY_CONFIG[pathway] || PATHWAY_CONFIG.gaming;
  }, [pathway]);

  const progressPercent = useMemo(() => {
    return calculateProgressPercent(displayXP, requiredXP);
  }, [displayXP, requiredXP]);

  const rankTitle = useMemo(() => {
    return getRankTitle(level, pathwayConfig.ranks);
  }, [level, pathwayConfig]);

  const nextMilestone = useMemo(() => {
    return getNextMilestone(level);
  }, [level]);

  const earnedAchievements = useMemo(() => {
    return achievements
      .map(id => ACHIEVEMENT_LIBRARY[id])
      .filter(Boolean);
  }, [achievements]);

  const rankPercentile = useMemo(() => {
    if (!rank || !totalMembers) return 0;
    return Math.round((1 - rank / totalMembers) * 100);
  }, [rank, totalMembers]);

  const containerClasses = useMemo(() => {
    const base = 'path-progress';
    const pathwayClass = `path-progress--${pathway}`;
    const compactClass = compact ? 'path-progress--compact' : '';
    const celebrateClass = isCelebrating ? 'is-celebrating' : '';
    
    return [base, pathwayClass, compactClass, celebrateClass, className]
      .filter(Boolean)
      .join(' ');
  }, [pathway, compact, isCelebrating, className]);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  
  // Animate XP counter
  useEffect(() => {
    if (!animated) {
      setDisplayXP(currentXP);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepValue = currentXP / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayXP(Math.min(stepValue * currentStep, currentXP));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentXP, animated]);

  // Celebration effect
  useEffect(() => {
    if (celebrateLevelUp) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [celebrateLevelUp]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const handleViewAchievements = useCallback(() => {
    if (onViewAchievements) {
      onViewAchievements(earnedAchievements);
    }
  }, [onViewAchievements, earnedAchievements]);

  const handleViewLeaderboard = useCallback(() => {
    if (onViewLeaderboard) {
      onViewLeaderboard();
    }
  }, [onViewLeaderboard]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderLevel = () => {
    if (!showLevel) return null;

    return (
      <div className="path-progress__level-section" data-cursor="default">
        <div className="path-progress__level-header">
          <span className="path-progress__level-icon">{pathwayConfig.icon}</span>
          <div className="path-progress__level-info">
            <span className="path-progress__level-title">{pathwayConfig.levelTitle}</span>
            <div className="path-progress__level-display">
              <span className="path-progress__level-number">{level}</span>
              <span className="path-progress__level-rank">{rankTitle}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="path-progress__bar-container">
          <div className="path-progress__bar-background">
            <div 
              className="path-progress__bar-fill"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="path-progress__bar-shimmer" />
            </div>
          </div>
          <div className="path-progress__bar-labels">
            <span className="path-progress__bar-current">
              {formatNumber(Math.floor(displayXP))} XP
            </span>
            <span className="path-progress__bar-required">
              {formatNumber(requiredXP)} XP
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderStreak = () => {
    if (!showStreak || streak === 0) return null;

    return (
      <div className="path-progress__streak" data-cursor="default">
        <div className="path-progress__streak-icon">🔥</div>
        <div className="path-progress__streak-info">
          <span className="path-progress__streak-count">{streak}</span>
          <span className="path-progress__streak-label">Day Streak</span>
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!showAchievements || earnedAchievements.length === 0) return null;

    return (
      <div className="path-progress__achievements" data-cursor="default">
        <div className="path-progress__achievements-header">
          <h4 className="path-progress__achievements-title">
            Achievements ({earnedAchievements.length})
          </h4>
          {onViewAchievements && (
            <button
              className="path-progress__achievements-view"
              onClick={handleViewAchievements}
              data-cursor="hover"
            >
              View All →
            </button>
          )}
        </div>
        <div className="path-progress__achievements-grid">
          {earnedAchievements.slice(0, compact ? 3 : 6).map((achievement, index) => (
            <div
              key={index}
              className="path-progress__achievement"
              style={{ '--achievement-color': achievement.color }}
              title={achievement.name}
            >
              <span className="path-progress__achievement-icon">{achievement.icon}</span>
            </div>
          ))}
          {earnedAchievements.length > (compact ? 3 : 6) && (
            <div className="path-progress__achievement path-progress__achievement--more">
              +{earnedAchievements.length - (compact ? 3 : 6)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRank = () => {
    if (!showRank || !rank || !totalMembers) return null;

    return (
      <div className="path-progress__rank" data-cursor="default">
        <div className="path-progress__rank-position">
          <span className="path-progress__rank-number">#{rank}</span>
          <span className="path-progress__rank-label">Leaderboard</span>
        </div>
        <div className="path-progress__rank-percentile">
          <span className="path-progress__rank-percent">Top {rankPercentile}%</span>
          <span className="path-progress__rank-total">of {formatNumber(totalMembers)}</span>
        </div>
        {onViewLeaderboard && (
          <TextFlameButton
            size="sm"
            onClick={handleViewLeaderboard}
            className="path-progress__rank-button"
          >
            View Leaderboard
          </TextFlameButton>
        )}
      </div>
    );
  };

  const renderMilestone = () => {
    if (!showMilestone || !nextMilestone) return null;

    const levelsRemaining = nextMilestone.level - level;

    return (
      <div className="path-progress__milestone" data-cursor="default">
        <div className="path-progress__milestone-icon">{nextMilestone.icon}</div>
        <div className="path-progress__milestone-info">
          <span className="path-progress__milestone-title">Next Milestone</span>
          <span className="path-progress__milestone-reward">{nextMilestone.reward}</span>
          <span className="path-progress__milestone-levels">
            {levelsRemaining} level{levelsRemaining !== 1 ? 's' : ''} away
          </span>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats) return null;

    return (
      <div className="path-progress__stats" data-cursor="default">
        <div className="path-progress__stat">
          <span className="path-progress__stat-value">{formatNumber(contributions)}</span>
          <span className="path-progress__stat-label">Contributions</span>
        </div>
        <div className="path-progress__stat">
          <span className="path-progress__stat-value">{earnedAchievements.length}</span>
          <span className="path-progress__stat-label">Badges</span>
        </div>
        <div className="path-progress__stat">
          <span className="path-progress__stat-value">{level}</span>
          <span className="path-progress__stat-label">Level</span>
        </div>
      </div>
    );
  };

  const renderCelebration = () => {
    if (!isCelebrating) return null;

    return (
      <div className="path-progress__celebration" aria-hidden="true">
        <div className="path-progress__celebration-text">Level Up!</div>
        <div className="path-progress__celebration-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="path-progress__celebration-particle"
              style={{
                '--angle': `${(360 / 20) * i}deg`,
                '--delay': `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  return (
    <div
      className={containerClasses}
      style={{
        ...style,
        '--pathway-color': pathwayConfig.color,
        '--pathway-gradient': pathwayConfig.gradient,
      }}
      data-pathway={pathway}
      {...restProps}
    >
      {/* Level & Progress */}
      {renderLevel()}

      {/* Streak */}
      {renderStreak()}

      {/* Achievements */}
      {renderAchievements()}

      {/* Rank */}
      {renderRank()}

      {/* Next Milestone */}
      {renderMilestone()}

      {/* Stats */}
      {renderStats()}

      {/* Celebration Effect */}
      {renderCelebration()}

      {/* Debug */}
      {debug && (
        <div className="path-progress__debug">
          <pre>{JSON.stringify({
            pathway,
            level,
            currentXP,
            requiredXP,
            progressPercent: progressPercent.toFixed(2),
            streak,
            achievements: earnedAchievements.length,
            rank,
            rankPercentile,
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

export const GamingProgress = (props) => (
  <PathProgress pathway="gaming" {...props} />
);

export const LoreboundProgress = (props) => (
  <PathProgress pathway="lorebound" {...props} />
);

export const ProductiveProgress = (props) => (
  <PathProgress pathway="productive" {...props} />
);

export const NewsProgress = (props) => (
  <PathProgress pathway="news" {...props} />
);

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VARIANT
// ═══════════════════════════════════════════════════════════════════════════

export const CompactProgress = (props) => (
  <PathProgress
    compact
    showAchievements={false}
    showMilestone={false}
    showRank={false}
    {...props}
  />
);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   PATH PROGRESS - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.path-progress {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Josefin Sans', sans-serif;
  overflow: hidden;
}

/* Level Section */
.path-progress__level-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-progress__level-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.path-progress__level-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px var(--pathway-color));
  animation: float 3s ease-in-out infinite;
}

.path-progress__level-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.path-progress__level-title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.path-progress__level-display {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.path-progress__level-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--pathway-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.path-progress__level-rank {
  font-size: 1.2rem;
  color: var(--pathway-color);
  font-weight: 600;
}

/* Progress Bar */
.path-progress__bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.path-progress__bar-background {
  position: relative;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
}

.path-progress__bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--pathway-gradient);
  border-radius: inherit;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.path-progress__bar-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

.path-progress__bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.path-progress__bar-current {
  color: var(--pathway-color);
  font-weight: 600;
}

.path-progress__bar-required {
  color: rgba(255, 255, 255, 0.5);
}

/* Streak */
.path-progress__streak {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  animation: pulseStreak 2s ease-in-out infinite;
}

.path-progress__streak-icon {
  font-size: 2rem;
  animation: flicker 1.5s ease-in-out infinite;
}

.path-progress__streak-info {
  display: flex;
  flex-direction: column;
}

.path-progress__streak-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}

.path-progress__streak-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Achievements */
.path-progress__achievements {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-progress__achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.path-progress__achievements-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.path-progress__achievements-view {
  background: none;
  border: none;
  color: var(--pathway-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-progress__achievements-view:hover {
  transform: translateX(4px);
}

.path-progress__achievements-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.path-progress__achievement {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--achievement-color, var(--pathway-color));
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.path-progress__achievement:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 0 20px var(--achievement-color);
}

.path-progress__achievement-icon {
  font-size: 2rem;
}

.path-progress__achievement--more {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.3);
}

/* Rank */
.path-progress__rank {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
}

.path-progress__rank-position {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.path-progress__rank-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
}

.path-progress__rank-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.path-progress__rank-percentile {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.path-progress__rank-percent {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--pathway-color);
}

.path-progress__rank-total {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.path-progress__rank-button {
  margin-top: 0.5rem;
}

/* Milestone */
.path-progress__milestone {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--pathway-color);
  border-radius: 12px;
}

.path-progress__milestone-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px var(--pathway-color));
}

.path-progress__milestone-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.path-progress__milestone-title {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.path-progress__milestone-reward {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--pathway-color);
}

.path-progress__milestone-levels {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Stats */
.path-progress__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.path-progress__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.path-progress__stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--pathway-color);
}

.path-progress__stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Celebration */
.path-progress__celebration {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  animation: fadeIn 0.3s ease;
  pointer-events: none;
}

.path-progress__celebration-text {
  font-size: 3rem;
  font-weight: 700;
  color: var(--pathway-color);
  text-shadow: 0 0 30px var(--pathway-color);
  animation: celebrationBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.path-progress__celebration-particles {
  position: absolute;
  inset: 0;
}

.path-progress__celebration-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--pathway-color);
  border-radius: 50%;
  animation: particleBurst 1s var(--delay, 0s) ease-out forwards;
  transform-origin: center;
  transform: rotate(var(--angle, 0deg));
}

/* Debug */
.path-progress__debug {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPACT VARIANT
   ═══════════════════════════════════════════════════════════════════════ */

.path-progress--compact {
  padding: 1.5rem;
  gap: 1rem;
}

.path-progress--compact .path-progress__level-icon {
  font-size: 2rem;
}

.path-progress--compact .path-progress__level-number {
  font-size: 2rem;
}

.path-progress--compact .path-progress__level-rank {
  font-size: 1rem;
}

/* ═══════════════════════════════════════════════════════════════════════
   PATHWAY-SPECIFIC STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.path-progress--gaming {
  border-color: rgba(0, 191, 255, 0.2);
}

.path-progress--lorebound {
  border-color: rgba(106, 13, 173, 0.2);
}

.path-progress--productive {
  border-color: rgba(192, 192, 192, 0.2);
}

.path-progress--news {
  border-color: rgba(229, 228, 226, 0.2);
  border-left: 4px solid var(--pathway-color);
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes pulseStreak {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 107, 107, 0);
  }
}

@keyframes flicker {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes celebrationBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes particleBurst {
  0% {
    transform: rotate(var(--angle, 0deg)) translateX(0);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle, 0deg)) translateX(150px);
    opacity: 0;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .path-progress {
    padding: 1.5rem;
    gap: 1rem;
  }

  .path-progress__level-icon {
    font-size: 2.5rem;
  }

  .path-progress__level-number {
    font-size: 2rem;
  }

  .path-progress__level-rank {
    font-size: 1rem;
  }

  .path-progress__streak {
    padding: 0.75rem;
  }

  .path-progress__achievements-grid {
    gap: 0.5rem;
  }

  .path-progress__achievement {
    width: 50px;
    height: 50px;
  }

  .path-progress__achievement-icon {
    font-size: 1.5rem;
  }

  .path-progress__stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .path-progress__celebration-text {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .path-progress {
    padding: 1rem;
  }

  .path-progress__level-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .path-progress__stats {
    grid-template-columns: 1fr;
  }

  .path-progress__rank {
    padding: 1rem;
  }

  .path-progress__milestone {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .path-progress__level-icon,
  .path-progress__bar-shimmer,
  .path-progress__streak,
  .path-progress__streak-icon,
  .path-progress__achievement,
  .path-progress__celebration-text,
  .path-progress__celebration-particle {
    animation: none;
  }

  .path-progress__bar-fill {
    transition: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'path-progress-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default PathProgress;
