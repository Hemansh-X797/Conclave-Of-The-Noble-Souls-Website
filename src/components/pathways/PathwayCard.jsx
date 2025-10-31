import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TextFlameButton, GamingButton, LoreboundButton, ProductiveButton, NewsButton } from './LuxuryButton';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PATHWAY CARD COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Elegant preview cards for pathway navigation and discovery.
 * Glassmorphism design with pathway-specific theming and interactions.
 * 
 * Features:
 * - Multiple size variants (small, medium, large, full)
 * - Pathway-specific theming and colors
 * - Activity indicators (live, active, quiet, growing)
 * - Stats display (members, posts, events)
 * - Hover effects (lift, glow, reveal)
 * - Click navigation
 * - Badge support (new, featured, hot)
 * - Image/icon support
 * - Premium animations
 * - Mobile responsive
 * 
 * @component
 * @example
 * @version 1.0
 * 
 * <PathwayCard
 *   pathway="gaming"
 *   title="Gaming Realm"
 *   description="Where legends compete"
 *   memberCount={1250}
 *   activityLevel="high"
 *   href="/pathways/gaming"
 * />
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAY_CONFIG = {
  gaming: {
    name: 'Gaming Realm',
    icon: '🎮',
    color: '#00bfff',
    gradient: 'linear-gradient(135deg, #00bfff 0%, #8a2be2 100%)',
    tagline: 'Where Legends Compete',
    buttonComponent: GamingButton,
  },
  lorebound: {
    name: 'Lorebound Sanctum',
    icon: '📚',
    color: '#6a0dad',
    gradient: 'linear-gradient(135deg, #6a0dad 0%, #9932cc 100%)',
    tagline: 'Where Stories Live',
    buttonComponent: LoreboundButton,
  },
  productive: {
    name: 'Productive Nexus',
    icon: '⚡',
    color: '#c0c0c0',
    gradient: 'linear-gradient(135deg, #c0c0c0 0%, #95a5a6 100%)',
    tagline: 'Where Excellence Thrives',
    buttonComponent: ProductiveButton,
  },
  news: {
    name: 'News Nexus',
    icon: '📰',
    color: '#e5e4e2',
    gradient: 'linear-gradient(135deg, #e5e4e2 0%, #bdc3c7 100%)',
    tagline: 'Where Truth Emerges',
    buttonComponent: NewsButton,
  },
};

const ACTIVITY_LEVELS = {
  live: { label: 'Live Now', color: '#ff4444', pulse: true, icon: '🔴' },
  high: { label: 'Very Active', color: '#4caf50', pulse: true, icon: '🔥' },
  medium: { label: 'Active', color: '#ff9800', pulse: false, icon: '💬' },
  quiet: { label: 'Quiet', color: '#2196f3', pulse: false, icon: '💤' },
  growing: { label: 'Growing', color: '#9c27b0', pulse: false, icon: '🌱' },
};

const SIZE_VARIANTS = {
  small: 'pathway-card--small',
  medium: 'pathway-card--medium',
  large: 'pathway-card--large',
  full: 'pathway-card--full',
};

const BADGE_TYPES = {
  new: { label: 'New', color: '#4caf50', icon: '✨' },
  hot: { label: 'Hot', color: '#ff4444', icon: '🔥' },
  featured: { label: 'Featured', color: '#ffd700', icon: '⭐' },
  updated: { label: 'Updated', color: '#2196f3', icon: '🆕' },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || '0';
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PathwayCard = ({
  // Core Configuration
  pathway = 'gaming',
  title,
  description,
  tagline,
  
  // Visual Assets
  image,
  icon,
  
  // Stats
  memberCount = 0,
  postCount = 0,
  eventCount = 0,
  activityLevel = 'medium',
  
  // Badges
  badge,
  customBadge,
  
  // Navigation
  href,
  onClick,
  
  // Display Options
  size = 'medium',
  showStats = true,
  showActivity = true,
  showButton = true,
  buttonText = 'Enter Realm',
  
  // Effects
  animated = true,
  hoverable = true,
  glow = true,
  
  // Styling
  className = '',
  style = {},
  
  // Advanced
  featured = false,
  disabled = false,
  debug = false,
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const [isHovered, setIsHovered] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const pathwayConfig = useMemo(() => {
    return PATHWAY_CONFIG[pathway] || PATHWAY_CONFIG.gaming;
  }, [pathway]);

  const activityConfig = useMemo(() => {
    return ACTIVITY_LEVELS[activityLevel] || ACTIVITY_LEVELS.medium;
  }, [activityLevel]);

  const badgeConfig = useMemo(() => {
    if (customBadge) return customBadge;
    if (badge && BADGE_TYPES[badge]) return BADGE_TYPES[badge];
    return null;
  }, [badge, customBadge]);

  const displayTitle = useMemo(() => {
    return title || pathwayConfig.name;
  }, [title, pathwayConfig]);

  const displayDescription = useMemo(() => {
    return description || pathwayConfig.tagline;
  }, [description, pathwayConfig]);

  const displayIcon = useMemo(() => {
    return icon || pathwayConfig.icon;
  }, [icon, pathwayConfig]);

  const ButtonComponent = pathwayConfig.buttonComponent;

  const containerClasses = useMemo(() => {
    const base = 'pathway-card';
    const pathwayClass = `pathway-card--${pathway}`;
    const sizeClass = SIZE_VARIANTS[size];
    const hoverClass = isHovered ? 'is-hovered' : '';
    const featuredClass = featured ? 'is-featured' : '';
    const disabledClass = disabled ? 'is-disabled' : '';
    const animatedClass = animated ? 'is-animated' : '';
    const glowClass = glow ? 'has-glow' : '';
    
    return [
      base,
      pathwayClass,
      sizeClass,
      hoverClass,
      featuredClass,
      disabledClass,
      animatedClass,
      glowClass,
      className
    ].filter(Boolean).join(' ');
  }, [pathway, size, isHovered, featured, disabled, animated, glow, className]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const handleClick = useCallback((e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  }, [disabled, onClick]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled && hoverable) {
      setIsHovered(true);
    }
  }, [disabled, hoverable]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderBadge = () => {
    if (!badgeConfig) return null;

    return (
      <div 
        className="pathway-card__badge"
        style={{ '--badge-color': badgeConfig.color }}
        data-cursor="default"
      >
        {badgeConfig.icon && <span className="pathway-card__badge-icon">{badgeConfig.icon}</span>}
        <span className="pathway-card__badge-text">{badgeConfig.label}</span>
      </div>
    );
  };

  const renderImage = () => {
    if (!image) return null;

    return (
      <div className="pathway-card__image-container">
        <Image
          src={image}
          alt={displayTitle}
          fill
          className="pathway-card__image"
          style={{ objectFit: 'cover' }}
        />
        <div className="pathway-card__image-overlay" />
      </div>
    );
  };

  const renderIcon = () => {
    return (
      <div className="pathway-card__icon" data-cursor="default">
        <span className="pathway-card__icon-inner">{displayIcon}</span>
      </div>
    );
  };

  const renderActivity = () => {
    if (!showActivity) return null;

    return (
      <div 
        className={`pathway-card__activity ${activityConfig.pulse ? 'pulse' : ''}`}
        style={{ '--activity-color': activityConfig.color }}
        data-cursor="default"
      >
        <span className="pathway-card__activity-icon">{activityConfig.icon}</span>
        <span className="pathway-card__activity-label">{activityConfig.label}</span>
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats) return null;

    const stats = [
      { label: 'Members', value: memberCount, icon: '👥', show: memberCount > 0 },
      { label: 'Posts', value: postCount, icon: '💬', show: postCount > 0 },
      { label: 'Events', value: eventCount, icon: '📅', show: eventCount > 0 },
    ].filter(stat => stat.show);

    if (stats.length === 0) return null;

    return (
      <div className="pathway-card__stats" data-cursor="default">
        {stats.map((stat) => (
          <div key={stat.label} className="pathway-card__stat">
            <span className="pathway-card__stat-icon">{stat.icon}</span>
            <span className="pathway-card__stat-value">{formatNumber(stat.value)}</span>
            <span className="pathway-card__stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderButton = () => {
    if (!showButton) return null;

    return (
      <div className="pathway-card__button-container">
        <ButtonComponent
          size="sm"
          className="pathway-card__button"
          disabled={disabled}
          data-cursor="hover"
        >
          {buttonText}
        </ButtonComponent>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="pathway-card__content">
        {/* Badge */}
        {renderBadge()}
        
        {/* Image (if provided) */}
        {renderImage()}
        
        {/* Icon */}
        {renderIcon()}
        
        {/* Title & Description */}
        <div className="pathway-card__text">
          <h3 className="pathway-card__title" data-cursor="default">
            {displayTitle}
          </h3>
          <p className="pathway-card__description" data-cursor="default">
            {displayDescription}
          </p>
          {tagline && (
            <p className="pathway-card__tagline" data-cursor="default">
              {tagline}
            </p>
          )}
        </div>
        
        {/* Activity */}
        {renderActivity()}
        
        {/* Stats */}
        {renderStats()}
        
        {/* Button */}
        {renderButton()}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  const cardProps = {
    className: containerClasses,
    style: {
      ...style,
      '--pathway-color': pathwayConfig.color,
      '--pathway-gradient': pathwayConfig.gradient,
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    'data-pathway': pathway,
    'data-cursor': disabled ? 'not-allowed' : hoverable ? 'hover' : 'default',
    ...restProps,
  };

  // Wrap in Link if href provided
  if (href && !disabled) {
    return (
      <Link href={href} onClick={handleClick} className="pathway-card__link">
        <article {...cardProps}>
          {renderContent()}
          
          {/* Debug */}
          {debug && (
            <div className="pathway-card__debug">
              <pre>{JSON.stringify({
                pathway,
                size,
                activityLevel,
                isHovered,
                featured,
                disabled,
              }, null, 2)}</pre>
            </div>
          )}
        </article>
      </Link>
    );
  }

  // Regular card without link
  return (
    <article {...cardProps} onClick={handleClick}>
      {renderContent()}
      
      {/* Debug */}
      {debug && (
        <div className="pathway-card__debug">
          <pre>{JSON.stringify({
            pathway,
            size,
            activityLevel,
            isHovered,
            featured,
            disabled,
          }, null, 2)}</pre>
        </div>
      )}
    </article>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

export const GamingCard = (props) => (
  <PathwayCard pathway="gaming" {...props} />
);

export const LoreboundCard = (props) => (
  <PathwayCard pathway="lorebound" {...props} />
);

export const ProductiveCard = (props) => (
  <PathwayCard pathway="productive" {...props} />
);

export const NewsCard = (props) => (
  <PathwayCard pathway="news" {...props} />
);

// ═══════════════════════════════════════════════════════════════════════════
// GRID COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PathwayCardGrid = ({ children, columns = 'auto', gap = '2rem', className = '', ...props }) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: columns === 'auto' 
      ? 'repeat(auto-fit, minmax(300px, 1fr))'
      : `repeat(${columns}, 1fr)`,
    gap,
  };

  return (
    <div className={`pathway-card-grid ${className}`} style={gridStyle} {...props}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   PATHWAY CARD - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-card__link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.pathway-card {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Josefin Sans', sans-serif;
}

.pathway-card.is-animated {
  animation: fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.pathway-card__content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

/* Hover Effects */
.pathway-card.is-hovered:not(.is-disabled) {
  transform: translateY(-12px);
  border-color: var(--pathway-color);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px var(--pathway-color);
}

.pathway-card.has-glow.is-hovered:not(.is-disabled)::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--pathway-gradient);
  border-radius: inherit;
  opacity: 0.3;
  z-index: 0;
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Featured Card */
.pathway-card.is-featured {
  border-color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.pathway-card.is-featured::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 60px 60px 0;
  border-color: transparent #ffd700 transparent transparent;
  z-index: 3;
}

/* Disabled State */
.pathway-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

/* Badge */
.pathway-card__badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--badge-color, #ffd700);
  color: #000;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 20px;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pathway-card__badge-icon {
  font-size: 1rem;
}

/* Image */
.pathway-card__image-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.pathway-card__image {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pathway-card.is-hovered .pathway-card__image {
  transform: scale(1.1);
}

.pathway-card__image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
}

/* Icon */
.pathway-card__icon {
  font-size: 3rem;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pathway-card.is-hovered .pathway-card__icon {
  transform: scale(1.1) rotate(5deg);
}

.pathway-card__icon-inner {
  display: inline-block;
  filter: drop-shadow(0 0 20px var(--pathway-color));
}

/* Text */
.pathway-card__text {
  flex: 1;
}

.pathway-card__title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: var(--pathway-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.pathway-card.is-hovered .pathway-card__title {
  text-shadow: 0 0 20px var(--pathway-color);
}

.pathway-card__description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.6;
}

.pathway-card__tagline {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 0 0;
  font-style: italic;
}

/* Activity */
.pathway-card__activity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
  width: fit-content;
}

.pathway-card__activity.pulse {
  animation: activityPulse 2s ease-in-out infinite;
}

.pathway-card__activity-icon {
  font-size: 1.2rem;
}

.pathway-card__activity-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--activity-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Stats */
.pathway-card__stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pathway-card__stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pathway-card__stat-icon {
  font-size: 1.2rem;
}

.pathway-card__stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--pathway-color);
}

.pathway-card__stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Button */
.pathway-card__button-container {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pathway-card__button {
  width: 100%;
}

/* Debug */
.pathway-card__debug {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
  max-width: 200px;
  z-index: 100;
}

/* ═══════════════════════════════════════════════════════════════════════
   SIZE VARIANTS
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-card--small {
  min-height: 250px;
}

.pathway-card--small .pathway-card__content {
  padding: 1.5rem;
  gap: 1rem;
}

.pathway-card--small .pathway-card__icon {
  font-size: 2rem;
}

.pathway-card--small .pathway-card__title {
  font-size: 1.2rem;
}

.pathway-card--small .pathway-card__description {
  font-size: 0.9rem;
}

.pathway-card--medium {
  min-height: 350px;
}

.pathway-card--large {
  min-height: 450px;
}

.pathway-card--large .pathway-card__content {
  padding: 2.5rem;
  gap: 2rem;
}

.pathway-card--large .pathway-card__icon {
  font-size: 4rem;
}

.pathway-card--full {
  min-height: 100%;
  height: 100%;
}

/* ═══════════════════════════════════════════════════════════════════════
   PATHWAY-SPECIFIC STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-card--gaming {
  background: rgba(0, 77, 102, 0.3);
  border-color: rgba(0, 191, 255, 0.2);
}

.pathway-card--gaming.is-hovered {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 191, 255, 0.4);
}

.pathway-card--lorebound {
  background: rgba(75, 0, 130, 0.3);
  border-color: rgba(106, 13, 173, 0.2);
}

.pathway-card--lorebound.is-hovered {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(106, 13, 173, 0.4);
}

.pathway-card--productive {
  background: rgba(127, 140, 141, 0.2);
  border-color: rgba(192, 192, 192, 0.2);
}

.pathway-card--productive.is-hovered {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(192, 192, 192, 0.3);
}

.pathway-card--news {
  background: rgba(149, 165, 166, 0.15);
  border-color: rgba(229, 228, 226, 0.2);
  border-left: 4px solid var(--pathway-color);
}

.pathway-card--news.is-hovered {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), -5px 0 30px rgba(229, 228, 226, 0.3);
  transform: translateX(8px) translateY(-8px);
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes activityPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 var(--activity-color);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 8px transparent;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .pathway-card__content {
    padding: 1.5rem;
    gap: 1rem;
  }

  .pathway-card__icon {
    font-size: 2.5rem;
  }

  .pathway-card__title {
    font-size: 1.5rem;
  }

  .pathway-card__stats {
    gap: 1rem;
  }

  .pathway-card--large .pathway-card__content {
    padding: 2rem;
  }

  .pathway-card--large .pathway-card__icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .pathway-card__content {
    padding: 1rem;
    gap: 0.75rem;
  }

  .pathway-card__icon {
    font-size: 2rem;
  }

  .pathway-card__title {
    font-size: 1.25rem;
  }

  .pathway-card__description {
    font-size: 0.9rem;
  }

  .pathway-card__stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pathway-card__stat {
    width: 100%;
  }

  .pathway-card__badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.8rem;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   GRID STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-card-grid {
  width: 100%;
}

@media (max-width: 768px) {
  .pathway-card-grid {
    grid-template-columns: 1fr !important;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .pathway-card,
  .pathway-card__icon,
  .pathway-card__image {
    transition: none;
    animation: none;
  }

  .pathway-card__activity.pulse {
    animation: none;
  }

  .pathway-card.has-glow.is-hovered:not(.is-disabled)::before {
    animation: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'pathway-card-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default PathwayCard;