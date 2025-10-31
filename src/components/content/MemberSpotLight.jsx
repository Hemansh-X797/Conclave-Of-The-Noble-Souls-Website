import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * MemberSpotlight Component
 * Ultra-premium member showcase with cinematic animations
 * Exceeds Rolls-Royce luxury standards with noble theming
 * 
 * @version 2.0 - The Conclave Realm
 */

const MemberSpotlight = ({
  // Core Member Data
  member = {},
  memberId,
  
  // Display Configuration
  variant = 'standard', // 'standard', 'featured', 'compact', 'hero', 'card', 'minimal'
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'hero'
  layout = 'vertical', // 'vertical', 'horizontal', 'grid'
  
  // Visual Effects
  animated = true,
  parallax = false,
  floating = false,
  glow = true,
  shimmer = false,
  tilt = false,
  magnetic = false,
  
  // Interactive Props
  clickable = true,
  expandable = false,
  hoverable = true,
  onClick,
  onHover,
  
  // Content Display
  showBio = true,
  showStats = true,
  showBadges = true,
  showPathways = true,
  showRank = true,
  showJoinDate = true,
  showActivity = true,
  
  // Customization
  className = '',
  style = {},
  pathway,
  theme = 'noble', // 'noble', 'dark', 'light', 'gaming', 'lorebound'
  
  // Advanced Features
  liveStatus = true,
  interactiveHover = true,
  audioFeedback = false,
  
  // Accessibility
  'aria-label': ariaLabel,
  tabIndex,
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  // Refs for advanced animations
  const spotlightRef = useRef(null);
  const avatarRef = useRef(null);
  const contentRef = useRef(null);
  const glowRef = useRef(null);
  const parallaxLayerRef = useRef(null);
  
  // State Management
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [statsAnimated, setStatsAnimated] = useState(false);
  
  // Animation frame tracking
  const animationFrameRef = useRef(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  
  // Default member data structure
  const defaultMember = {
    id: memberId || 'member-001',
    name: 'Noble Member',
    username: 'noble_soul',
    discriminator: '0001',
    avatar: '/assets/images/nobility/default-avatar.jpg',
    role: 'Citizen',
    rank: 'Noble Soul',
    level: 1,
    xp: 0,
    joinDate: new Date().toISOString(),
    bio: 'A distinguished member of The Conclave',
    status: 'online', // 'online', 'idle', 'dnd', 'offline'
    pathways: [],
    badges: [],
    stats: {
      messages: 0,
      voiceTime: 0,
      events: 0,
      achievements: 0
    },
    customStatus: null,
    presence: null,
    isVerified: false,
    isPremium: false,
    ...member
  };
  
  const m = defaultMember; // Shorthand
  
  // Pathway color mapping
  const pathwayColors = {
    gaming: { primary: '#00BFFF', glow: 'rgba(0, 191, 255, 0.4)' },
    lorebound: { primary: '#6a0dad', glow: 'rgba(106, 13, 173, 0.4)' },
    productive: { primary: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.4)' },
    news: { primary: '#E0115F', glow: 'rgba(224, 17, 95, 0.4)' },
    default: { primary: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)' }
  };
  
  // Rank color hierarchy
  const rankColors = {
    'Noble Soul': '#FFFFFF',
    'Citizen': '#C0C0C0',
    'Knight': '#E0115F',
    'Baron': '#50C878',
    'Viscount': '#00BFFF',
    'Count': '#FF1493',
    'Margrave': '#9966CC',
    'Duke': '#E5E4E2',
    'Grand Duke': '#FFD700'
  };
  
  // Status colors
  const statusColors = {
    online: '#2ECC71',
    idle: '#F39C12',
    dnd: '#E74C3C',
    offline: '#95A5A6'
  };
  
  // Get primary color based on pathway or rank
  const getPrimaryColor = useCallback(() => {
    if (pathway && pathwayColors[pathway]) {
      return pathwayColors[pathway].primary;
    }
    if (m.rank && rankColors[m.rank]) {
      return rankColors[m.rank];
    }
    return pathwayColors.default.primary;
  }, [pathway, m.rank]);
  
  // Mouse move tracking for tilt and parallax
  useEffect(() => {
    if (!tilt && !parallax && !magnetic) return;
    
    const handleMouseMove = (e) => {
      if (!spotlightRef.current) return;
      
      const rect = spotlightRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
      
      if (tilt) {
        const tiltX = (y - 0.5) * 20;
        const tiltY = (x - 0.5) * -20;
        tiltRef.current = { x: tiltX, y: tiltY };
      }
    };
    
    const element = spotlightRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, [tilt, parallax, magnetic]);
  
  // Animate stats on hover
  useEffect(() => {
    if (isHovered && showStats && !statsAnimated) {
      setStatsAnimated(true);
      setAnimationPhase('stats-reveal');
    }
  }, [isHovered, showStats, statsAnimated]);
  
  // Handle hover state
  const handleMouseEnter = useCallback((e) => {
    if (!hoverable) return;
    setIsHovered(true);
    setAnimationPhase('hover-enter');
    if (onHover) onHover(true, e);
  }, [hoverable, onHover]);
  
  const handleMouseLeave = useCallback((e) => {
    if (!hoverable) return;
    setIsHovered(false);
    setAnimationPhase('hover-exit');
    if (onHover) onHover(false, e);
  }, [hoverable, onHover]);
  
  // Handle click
  const handleClick = useCallback((e) => {
    if (!clickable) return;
    
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
    
    if (onClick) {
      onClick(m, e);
    }
  }, [clickable, expandable, isExpanded, onClick, m]);
  
  // Generate dynamic classes
  const generateClassNames = useCallback(() => {
    const classes = [
      'member-spotlight-container',
      `ms-${variant}`,
      `ms-${size}`,
      `ms-layout-${layout}`,
      `ms-theme-${theme}`
    ];
    
    if (animated) classes.push('ms-animated');
    if (parallax) classes.push('ms-parallax');
    if (floating) classes.push('ms-floating');
    if (glow) classes.push('ms-glow');
    if (shimmer) classes.push('ms-shimmer');
    if (tilt) classes.push('ms-tilt');
    if (magnetic) classes.push('ms-magnetic');
    if (clickable) classes.push('ms-clickable');
    if (isHovered) classes.push('ms-hovered');
    if (isExpanded) classes.push('ms-expanded');
    if (m.isPremium) classes.push('ms-premium');
    if (m.isVerified) classes.push('ms-verified');
    if (pathway) classes.push(`ms-pathway-${pathway}`);
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [variant, size, layout, theme, animated, parallax, floating, glow, shimmer, 
      tilt, magnetic, clickable, isHovered, isExpanded, m.isPremium, m.isVerified, 
      pathway, className]);
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  // Format join date
  const formatJoinDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  // Render avatar with status indicator
  const renderAvatar = () => (
    <div className="ms-avatar-container" ref={avatarRef}>
      <div className="ms-avatar-wrapper">
        {/* Rotating glow ring */}
        {glow && (
          <div 
            className="ms-avatar-glow-ring"
            style={{ 
              borderColor: getPrimaryColor(),
              boxShadow: `0 0 30px ${pathwayColors[pathway]?.glow || pathwayColors.default.glow}`
            }}
          />
        )}
        
        {/* Avatar image */}
        <div className="ms-avatar-frame">
          <Image
            src={m.avatar}
            alt={`${m.name} avatar`}
            width={200}
            height={200}
            className="ms-avatar-image"
            priority={variant === 'hero'}
          />
          
          {/* Verified badge overlay */}
          {m.isVerified && (
            <div className="ms-verified-badge" title="Verified Member">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          )}
          
          {/* Premium crown overlay */}
          {m.isPremium && (
            <div className="ms-premium-crown" title="Premium Member">
              👑
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        {liveStatus && (
          <div 
            className={`ms-status-indicator ms-status-${m.status}`}
            style={{ backgroundColor: statusColors[m.status] }}
            title={m.status.charAt(0).toUpperCase() + m.status.slice(1)}
          />
        )}
      </div>
      
      {/* Level badge */}
      {m.level && (
        <div className="ms-level-badge">
          <span className="ms-level-label">LVL</span>
          <span className="ms-level-number">{m.level}</span>
        </div>
      )}
    </div>
  );
  
  // Render member info
  const renderMemberInfo = () => (
    <div className="ms-info-section">
      {/* Name and username */}
      <div className="ms-name-container">
        <h3 className="ms-name">{m.name}</h3>
        <p className="ms-username">
          @{m.username}
          {m.discriminator && `#${m.discriminator}`}
        </p>
      </div>
      
      {/* Custom status */}
      {m.customStatus && (
        <div className="ms-custom-status">
          {m.customStatus}
        </div>
      )}
      
      {/* Rank badge */}
      {showRank && m.rank && (
        <div 
          className="ms-rank-badge"
          style={{ 
            color: rankColors[m.rank] || '#FFFFFF',
            borderColor: rankColors[m.rank] || '#FFFFFF'
          }}
        >
          <span className="ms-rank-icon">⚜</span>
          <span className="ms-rank-name">{m.rank}</span>
        </div>
      )}
      
      {/* Bio */}
      {showBio && m.bio && (
        <p className="ms-bio">{m.bio}</p>
      )}
      
      {/* Join date */}
      {showJoinDate && (
        <div className="ms-join-date">
          <span className="ms-join-icon">📅</span>
          <span>Joined {formatJoinDate(m.joinDate)}</span>
        </div>
      )}
    </div>
  );
  
  // Render pathway badges
  const renderPathwayBadges = () => {
    if (!showPathways || !m.pathways || m.pathways.length === 0) return null;
    
    const pathwayIcons = {
      gaming: '🎮',
      lorebound: '📚',
      productive: '⚙️',
      news: '📰'
    };
    
    return (
      <div className="ms-pathway-badges">
        {m.pathways.map((path, index) => (
          <div
            key={index}
            className={`ms-pathway-badge ms-pathway-${path}`}
            style={{
              backgroundColor: pathwayColors[path]?.primary + '20',
              borderColor: pathwayColors[path]?.primary,
              boxShadow: `0 0 12px ${pathwayColors[path]?.glow}`
            }}
            title={path.charAt(0).toUpperCase() + path.slice(1)}
          >
            {pathwayIcons[path] || '✦'}
          </div>
        ))}
      </div>
    );
  };
  
  // Render stats grid
  const renderStats = () => {
    if (!showStats || !m.stats) return null;
    
    const statIcons = {
      messages: '💬',
      voiceTime: '🎤',
      events: '🎉',
      achievements: '🏆'
    };
    
    const statLabels = {
      messages: 'Messages',
      voiceTime: 'Voice Hours',
      events: 'Events',
      achievements: 'Achievements'
    };
    
    return (
      <div className="ms-stats-grid">
        {Object.entries(m.stats).map(([key, value], index) => (
          <div
            key={key}
            className="ms-stat-item"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="ms-stat-icon">{statIcons[key]}</div>
            <div className="ms-stat-content">
              <span 
                className="ms-stat-value"
                style={{ color: getPrimaryColor() }}
              >
                {formatNumber(value)}
              </span>
              <span className="ms-stat-label">{statLabels[key]}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render achievement badges
  const renderBadges = () => {
    if (!showBadges || !m.badges || m.badges.length === 0) return null;
    
    return (
      <div className="ms-badges-container">
        <div className="ms-badges-header">
          <span className="ms-badges-title">Achievements</span>
          <span className="ms-badges-count">{m.badges.length}</span>
        </div>
        <div className="ms-badges-grid">
          {m.badges.map((badge, index) => (
            <div
              key={index}
              className="ms-badge-item"
              style={{
                animationDelay: `${index * 50}ms`
              }}
              title={badge.name || badge}
            >
              <div className="ms-badge-icon">
                {badge.icon || '🏅'}
              </div>
              {badge.rare && (
                <div className="ms-badge-rare-indicator" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render XP progress bar
  const renderXPBar = () => {
    if (!m.xp && m.level === undefined) return null;
    
    const xpForNextLevel = m.level * 100;
    const currentXP = m.xp % xpForNextLevel;
    const progress = (currentXP / xpForNextLevel) * 100;
    
    return (
      <div className="ms-xp-container">
        <div className="ms-xp-header">
          <span className="ms-xp-label">Experience</span>
          <span className="ms-xp-numbers">
            {formatNumber(currentXP)} / {formatNumber(xpForNextLevel)} XP
          </span>
        </div>
        <div className="ms-xp-bar-track">
          <div
            className="ms-xp-bar-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: getPrimaryColor(),
              boxShadow: `0 0 10px ${pathwayColors[pathway]?.glow || pathwayColors.default.glow}`
            }}
          />
        </div>
      </div>
    );
  };
  
  // Render activity indicators
  const renderActivity = () => {
    if (!showActivity) return null;
    
    return (
      <div className="ms-activity-section">
        {m.presence && (
          <div className="ms-presence">
            <span className="ms-presence-icon">🎵</span>
            <span className="ms-presence-text">{m.presence}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render action buttons
  const renderActions = () => (
    <div className="ms-actions">
      <button
        className="ms-action-button ms-primary"
        style={{
          backgroundColor: getPrimaryColor() + '20',
          borderColor: getPrimaryColor(),
          color: getPrimaryColor()
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Handle view profile
        }}
      >
        View Profile
      </button>
      <button
        className="ms-action-button ms-secondary"
        onClick={(e) => {
          e.stopPropagation();
          // Handle message
        }}
      >
        Message
      </button>
    </div>
  );
  
  // Render decorative elements
  const renderDecorations = () => (
    <>
      {/* Ornamental corners */}
      <div className="ms-corner ms-corner-tl" />
      <div className="ms-corner ms-corner-tr" />
      <div className="ms-corner ms-corner-bl" />
      <div className="ms-corner ms-corner-br" />
      
      {/* Shimmer effect overlay */}
      {shimmer && (
        <div className="ms-shimmer-overlay" />
      )}
      
      {/* Floating particles */}
      {floating && (
        <div className="ms-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="ms-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </>
  );
  
  // Main component render
  const renderContent = () => {
    switch (variant) {
      case 'hero':
        return (
          <>
            {renderDecorations()}
            <div className="ms-hero-layout">
              {renderAvatar()}
              <div className="ms-hero-content">
                {renderMemberInfo()}
                {renderPathwayBadges()}
                {renderXPBar()}
                {renderStats()}
                {renderBadges()}
                {renderActivity()}
                {renderActions()}
              </div>
            </div>
          </>
        );
      
      case 'featured':
        return (
          <>
            {renderDecorations()}
            <div className="ms-featured-badge">Featured</div>
            {renderAvatar()}
            {renderMemberInfo()}
            {renderPathwayBadges()}
            {renderStats()}
            {renderBadges()}
            {renderActions()}
          </>
        );
      
      case 'compact':
        return (
          <>
            {renderAvatar()}
            <div className="ms-compact-info">
              <h4 className="ms-compact-name">{m.name}</h4>
              <span className="ms-compact-rank">{m.rank}</span>
            </div>
            {renderPathwayBadges()}
          </>
        );
      
      case 'minimal':
        return (
          <>
            <div className="ms-minimal-avatar">
              <Image
                src={m.avatar}
                alt={m.name}
                width={48}
                height={48}
                className="ms-minimal-image"
              />
              {liveStatus && (
                <div 
                  className={`ms-minimal-status ms-status-${m.status}`}
                  style={{ backgroundColor: statusColors[m.status] }}
                />
              )}
            </div>
            <div className="ms-minimal-info">
              <span className="ms-minimal-name">{m.name}</span>
              <span className="ms-minimal-username">@{m.username}</span>
            </div>
          </>
        );
      
      default: // standard
        return (
          <>
            {renderDecorations()}
            {renderAvatar()}
            {renderMemberInfo()}
            {renderPathwayBadges()}
            {renderXPBar()}
            {renderStats()}
            {renderBadges()}
            {renderActivity()}
            {renderActions()}
          </>
        );
    }
  };
  
  // Container element
  const Element = clickable ? 'button' : 'div';
  
  return (
    <Element
      ref={spotlightRef}
      className={generateClassNames()}
      style={{
        ...style,
        transform: tilt && isHovered
          ? `perspective(1000px) rotateX(${tiltRef.current.x}deg) rotateY(${tiltRef.current.y}deg)`
          : undefined,
        '--ms-primary-color': getPrimaryColor(),
        '--ms-glow-color': pathwayColors[pathway]?.glow || pathwayColors.default.glow,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel || `${m.name} member spotlight`}
      tabIndex={tabIndex ?? (clickable ? 0 : -1)}
      data-member-id={m.id}
      data-cursor={clickable ? 'hover' : 'default'}
      {...restProps}
    >
      {renderContent()}
    </Element>
  );
};

// Pre-configured variants
export const FeaturedMemberSpotlight = (props) => (
  <MemberSpotlight
    variant="featured"
    size="lg"
    glow
    shimmer
    floating
    {...props}
  />
);

export const HeroMemberSpotlight = (props) => (
  <MemberSpotlight
    variant="hero"
    size="hero"
    parallax
    glow
    animated
    {...props}
  />
);

export const CompactMemberSpotlight = (props) => (
  <MemberSpotlight
    variant="compact"
    size="sm"
    showStats={false}
    showBadges={false}
    showBio={false}
    {...props}
  />
);

export const MinimalMemberSpotlight = (props) => (
  <MemberSpotlight
    variant="minimal"
    size="sm"
    showStats={false}
    showBadges={false}
    showBio={false}
    showPathways={false}
    clickable={false}
    {...props}
  />
);

// Grid layout component
export const MemberSpotlightGrid = ({ 
  members = [], 
  columns = 3,
  gap = 'md',
  variant = 'standard',
  ...props 
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  return (
    <div 
      className={`ms-grid ms-grid-${columns} ${gapClasses[gap]}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {members.map((member, index) => (
        <MemberSpotlight
          key={member.id || index}
          member={member}
          variant={variant}
          {...props}
        />
      ))}
    </div>
  );
};

// Sample data for demonstration
export const sampleMembers = [
  {
    id: 'noble-001',
    name: 'Lord Valerian',
    username: 'valerian_the_wise',
    discriminator: '0001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    role: 'Admin',
    rank: 'Grand Duke',
    level: 42,
    xp: 3850,
    joinDate: '2022-01-15',
    bio: 'Founder of The Conclave. Master strategist and keeper of ancient wisdom.',
    status: 'online',
    pathways: ['gaming', 'lorebound'],
    badges: [
      { icon: '👑', name: 'Founder', rare: true },
      { icon: '⚔️', name: 'Tournament Champion' },
      { icon: '📚', name: 'Lore Master' }
    ],
    stats: {
      messages: 15420,
      voiceTime: 2340,
      events: 156,
      achievements: 89
    },
    isVerified: true,
    isPremium: true
  }
];

export default MemberSpotlight;