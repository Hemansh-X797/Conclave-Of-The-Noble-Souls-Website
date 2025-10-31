import React, { useState, useEffect, useRef, useCallback } from 'react';
import '@/styles/superbuttons.css';

const SuperButton = ({
  // Core Props
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled = false,
  loading = false,
  type = 'button',
  
  // SuperButton Specific Props
  variant = 'portal', // 'portal', 'feature', 'interactive', 'compact', 'hero'
  pathway = 'default', // 'default', 'gaming', 'lorebound', 'productive', 'news'
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'hero'
  
  // Content Props
  title,
  subtitle,
  description,
  actionText = 'Enter',
  icon,
  
  // Image Props
  backgroundImage,
  imageAlt = '',
  
  // Interactive Props
  memberCount,
  stats,
  galleryImages = [],
  
  // Advanced Props
  className = '',
  style = {},
  id,
  'data-cursor': dataCursor = 'hover',
  'data-pathway': dataPathway,
  'aria-label': ariaLabel,
  
  // Modifiers
  fullWidth = false,
  centered = false,
  noShadow = false,
  noHover = false,
  magnetic = false,
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  // State Management
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationId, setAnimationId] = useState(null);
  
  // Refs
  const buttonRef = useRef(null);
  const slideTimeoutRef = useRef(null);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);
  
  // Gallery slideshow management
  useEffect(() => {
    if (variant === 'interactive' && galleryImages.length > 1) {
      const slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % galleryImages.length);
      }, 3000);
      
      return () => clearInterval(slideInterval);
    }
  }, [variant, galleryImages.length]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);
  
  // Generate class names based on props
  const generateClassName = useCallback(() => {
    let classes = ['conclave-superbutton'];
    
    // Variant-specific classes
    switch (variant) {
      case 'portal':
        classes.push(`sb-portal-${pathway}`);
        break;
      case 'feature':
        classes.push('sb-feature-showcase');
        if (pathway === 'event') classes.push('sb-feature-event');
        else if (pathway === 'achievement') classes.push('sb-feature-achievement');
        else if (pathway === 'gallery') classes.push('sb-feature-gallery');
        break;
      case 'interactive':
        if (memberCount !== undefined) classes.push('sb-interactive-discord');
        else if (stats) classes.push('sb-interactive-stats');
        else if (galleryImages.length > 0) classes.push('sb-interactive-gallery');
        break;
      case 'compact':
        classes.push('sb-compact');
        break;
      case 'hero':
        classes.push('sb-hero');
        break;
      default:
        classes.push('sb-feature-showcase');
    }
    
    // Size classes
    if (size !== 'md') {
      classes.push(`sb-${size}`);
    }
    
    // State classes
    if (isLoading) classes.push('sb-loading');
    if (disabled) classes.push('disabled');
    
    // Modifier classes
    if (fullWidth) classes.push('sb-full-width');
    if (centered) classes.push('sb-centered');
    if (noShadow) classes.push('sb-no-shadow');
    if (noHover) classes.push('sb-no-hover');
    if (magnetic) classes.push('sb-magnetic');
    if (debug) classes.push('sb-debug');
    
    // Custom className
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [variant, pathway, size, isLoading, disabled, fullWidth, centered, noShadow, noHover, magnetic, debug, className]);
  
  // Handle click events
  const handleClick = useCallback((e) => {
    if (disabled || isLoading) return;
    
    if (onClick) {
      onClick(e);
    }
  }, [disabled, isLoading, onClick]);
  
  // Handle mouse events
  const handleMouseEnter = useCallback((e) => {
    if (disabled || isLoading) return;
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  }, [disabled, isLoading, onMouseEnter]);
  
  const handleMouseLeave = useCallback((e) => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave(e);
  }, [onMouseLeave]);
  
  // Generate data attributes for cursor integration
  const getDataAttributes = useCallback(() => {
    const attrs = {
      'data-cursor': dataCursor,
    };
    
    if (dataPathway || pathway !== 'default') {
      attrs['data-pathway'] = dataPathway || pathway;
    }
    
    if (debug) {
      attrs['data-sb-variant'] = variant;
      attrs['data-sb-pathway'] = pathway;
      attrs['data-sb-state'] = `${isHovered ? 'hovered' : 'idle'}-${isLoading ? 'loading' : 'ready'}`;
    }
    
    return attrs;
  }, [dataCursor, dataPathway, pathway, debug, variant, isHovered, isLoading]);
  
  // Generate dynamic styles
  const generateStyle = useCallback(() => {
    let dynamicStyle = { ...style };
    
    // Apply background image if provided
    if (backgroundImage && variant !== 'interactive') {
      dynamicStyle.backgroundImage = `${
        pathway !== 'default' 
          ? `var(--sb-overlay-${pathway}), ` 
          : 'var(--sb-overlay-dark), '
      }url(${backgroundImage})`;
      dynamicStyle.backgroundSize = 'cover';
      dynamicStyle.backgroundPosition = 'center';
    }
    
    return dynamicStyle;
  }, [style, backgroundImage, variant, pathway]);
  
  // Render portal content
  const renderPortalContent = () => (
    <div className="sb-content">
      <div className="sb-header">
        <div>
          {title && <h3 className="sb-title">{title}</h3>}
          {subtitle && <p className="sb-subtitle">{subtitle}</p>}
        </div>
      </div>
      {description && <p className="sb-description">{description}</p>}
      <div className="sb-footer">
        <span className="sb-action-text">{actionText}</span>
        {icon && <span className="sb-icon">{icon}</span>}
      </div>
    </div>
  );
  
  // Render feature content
  const renderFeatureContent = () => (
    <div className="sb-content">
      <div className="sb-header">
        {title && <h4 className="sb-title">{title}</h4>}
        {subtitle && <p className="sb-subtitle">{subtitle}</p>}
      </div>
      {description && <p className="sb-description">{description}</p>}
      <div className="sb-footer">
        <span className="sb-action-text">{actionText}</span>
        {icon && <span className="sb-icon">{icon}</span>}
      </div>
    </div>
  );
  
  // Render Discord interactive content
  const renderDiscordContent = () => (
    <>
      <div className="sb-discord-icon" aria-hidden="true" />
      <div className="sb-content">
        <div className="sb-header">
          {title && <h4 className="sb-title">{title}</h4>}
          {subtitle && <p className="sb-subtitle">{subtitle}</p>}
        </div>
        {description && <p className="sb-description">{description}</p>}
      </div>
      {memberCount !== undefined && (
        <div className="sb-member-count">
          <span className="sb-member-count-number">{memberCount.toLocaleString()}</span>
          <span className="sb-member-count-label">Members</span>
        </div>
      )}
    </>
  );
  
  // Render stats interactive content
  const renderStatsContent = () => (
    <>
      <div className="sb-content">
        {title && <h4 className="sb-title">{title}</h4>}
        {subtitle && <p className="sb-subtitle">{subtitle}</p>}
      </div>
      <div className="sb-stats-grid">
        {stats && Object.entries(stats).map(([key, value], index) => (
          <div key={key} className="sb-stat-item">
            <span className="sb-stat-number">{typeof value === 'number' ? value.toLocaleString() : value}</span>
            <span className="sb-stat-label">{key}</span>
          </div>
        ))}
      </div>
    </>
  );
  
  // Render gallery interactive content
  const renderGalleryContent = () => (
    <>
      <div className="sb-gallery-carousel">
        {galleryImages.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className="sb-gallery-slide"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%), url(${image})`
            }}
          />
        ))}
      </div>
      <div className="sb-content">
        <div className="sb-header">
          {title && <h4 className="sb-title">{title}</h4>}
          {subtitle && <p className="sb-subtitle">{subtitle}</p>}
        </div>
        {description && <p className="sb-description">{description}</p>}
      </div>
      <div className="sb-gallery-counter">
        <span className="sb-gallery-counter-text">
          {currentSlide + 1}/{Math.min(galleryImages.length, 4)} Images
        </span>
      </div>
    </>
  );
  
  // Render compact content
  const renderCompactContent = () => (
    <>
      <div className="sb-compact-content">
        {title && <h5 className="sb-compact-title">{title}</h5>}
        {subtitle && <p className="sb-compact-subtitle">{subtitle}</p>}
      </div>
      {icon && <span className="sb-compact-icon">{icon}</span>}
    </>
  );
  
  // Render hero content
  const renderHeroContent = () => (
    <div className="sb-content">
      {title && <h1 className="sb-title">{title}</h1>}
      {subtitle && <p className="sb-subtitle">{subtitle}</p>}
      {description && <p className="sb-description">{description}</p>}
      <div className="sb-action-text">{actionText}</div>
    </div>
  );
  
  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'portal':
        return renderPortalContent();
      case 'feature':
        return renderFeatureContent();
      case 'interactive':
        if (memberCount !== undefined) return renderDiscordContent();
        if (stats) return renderStatsContent();
        if (galleryImages.length > 0) return renderGalleryContent();
        return renderFeatureContent();
      case 'compact':
        return renderCompactContent();
      case 'hero':
        return renderHeroContent();
      default:
        return children || renderFeatureContent();
    }
  };
  
  // Component element type
  const Element = type === 'link' ? 'a' : 'button';
  
  return (
    <Element
      ref={buttonRef}
      id={id}
      type={Element === 'button' ? type : undefined}
      className={generateClassName()}
      style={generateStyle()}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel || title}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...getDataAttributes()}
      {...restProps}
    >
      {renderContent()}
    </Element>
  );
};

// Pre-configured SuperButton variants for easy usage

// Portal Buttons
export const GamingPortal = (props) => (
  <SuperButton
    variant="portal"
    pathway="gaming"
    title="Gaming Realm"
    subtitle="Enter the Digital Battlefield"
    description="Compete in tournaments, join guilds, and dominate leaderboards"
    actionText="Launch Game"
    icon="⚡"
    {...props}
  />
);

export const LoreboundPortal = (props) => (
  <SuperButton
    variant="portal"
    pathway="lorebound"
    title="Lorebound Sanctuary"
    subtitle="Mystical Realm of Stories"
    description="Discover anime, manga, and endless tales of wonder"
    actionText="Enter Sanctuary"
    icon="✦"
    {...props}
  />
);

export const ProductivePortal = (props) => (
  <SuperButton
    variant="portal"
    pathway="productive"
    title="Productive Palace"
    subtitle="Efficiency & Excellence"
    description="Optimize your workflow and achieve your goals"
    actionText="Boost Productivity"
    icon="→"
    {...props}
  />
);

export const NewsPortal = (props) => (
  <SuperButton
    variant="portal"
    pathway="news"
    title="News Nexus"
    subtitle="Breaking Updates"
    description="Stay informed with the latest developments"
    actionText="Read News"
    icon="⚡"
    {...props}
  />
);

// Feature Showcase Buttons
export const EventShowcase = (props) => (
  <SuperButton
    variant="feature"
    pathway="event"
    title="Conclave Tournament"
    subtitle="Epic Gaming Event"
    description="Join the ultimate competition for glory and prizes"
    actionText="Register Now"
    icon="🏆"
    {...props}
  />
);

export const AchievementShowcase = (props) => (
  <SuperButton
    variant="feature"
    pathway="achievement"
    title="Hall of Fame"
    subtitle="Legendary Members"
    description="Celebrate our community's greatest achievements"
    actionText="View Achievements"
    {...props}
  />
);

export const GalleryShowcase = (props) => (
  <SuperButton
    variant="feature"
    pathway="gallery"
    title="Community Gallery"
    subtitle="Member Creations"
    description="Explore amazing art, screenshots, and content"
    actionText="Browse Gallery"
    icon="🎨"
    {...props}
  />
);

// Interactive Elements
export const DiscordJoinButton = (props) => (
  <SuperButton
    variant="interactive"
    title="Join Our Discord"
    subtitle="Connect with the community"
    description="Chat, play games, and make friends"
    memberCount={1247} // This would be dynamic in real app
    actionText="Join Server"
    {...props}
  />
);

export const CommunityStats = (props) => (
  <SuperButton
    variant="interactive"
    title="Community Stats"
    subtitle="Live Statistics"
    stats={{
      'Members': 1247,
      'Online': 342,
      'Events': 28,
      'Posts': 15642
    }}
    {...props}
  />
);

export const ImageGallery = (props) => (
  <SuperButton
    variant="interactive"
    title="Image Gallery"
    subtitle="Latest uploads"
    galleryImages={[
      'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
    ]}
    actionText="View All"
    {...props}
  />
);

// Compact Buttons
export const CompactAction = (props) => (
  <SuperButton
    variant="compact"
    title="Quick Action"
    subtitle="Fast access"
    icon="→"
    {...props}
  />
);

// Hero Button
export const HeroWelcome = (props) => (
  <SuperButton
    variant="hero"
    size="hero"
    title="Welcome to The Conclave"
    subtitle="A realm where nobility meets digital excellence"
    description="Join our exclusive community of gamers, creators, and visionaries"
    actionText="Begin Your Journey"
    {...props}
  />
);

// Advanced composed SuperButtons
export const MagneticGamingPortal = (props) => (
  <SuperButton
    variant="portal"
    pathway="gaming"
    magnetic={true}
    title="Gaming Realm"
    subtitle="Enter the Digital Battlefield"
    description="Compete in tournaments and dominate leaderboards"
    actionText="Launch Game"
    icon="⚡"
    {...props}
  />
);

export const MysticalLoreboundPortal = (props) => (
  <SuperButton
    variant="portal"
    pathway="lorebound"
    magnetic={true}
    title="Lorebound Sanctuary"
    subtitle="Mystical Realm of Stories"
    description="Discover endless tales of wonder and magic"
    actionText="Enter Sanctuary"
    icon="✦"
    {...props}
  />
);

// Utility hook for SuperButton state management
export const useSuperButtonState = (initialState = {}) => {
  const [superButtonState, setSuperButtonState] = useState({
    loading: false,
    disabled: false,
    variant: 'portal',
    pathway: 'default',
    memberCount: 0,
    stats: {},
    galleryImages: [],
    ...initialState
  });
  
  const updateState = (newState) => {
    setSuperButtonState(prev => ({ ...prev, ...newState }));
  };
  
  const setLoading = (loading) => updateState({ loading });
  const setDisabled = (disabled) => updateState({ disabled });
  const setVariant = (variant) => updateState({ variant });
  const setPathway = (pathway) => updateState({ pathway });
  const setMemberCount = (memberCount) => updateState({ memberCount });
  const setStats = (stats) => updateState({ stats });
  const setGalleryImages = (galleryImages) => updateState({ galleryImages });
  
  return {
    ...superButtonState,
    updateState,
    setLoading,
    setDisabled,
    setVariant,
    setPathway,
    setMemberCount,
    setStats,
    setGalleryImages
  };
};

// SuperButton group component for managing layouts
export const SuperButtonGroup = ({ 
  children, 
  layout = 'grid', // 'grid', 'flex', 'masonry'
  spacing = 'md',
  columns = 'auto',
  align = 'start',
  className = '',
  ...props 
}) => {
  const spacingClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };
  
  const layoutClasses = {
    grid: columns === 'auto' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : `grid grid-cols-${columns}`,
    flex: 'flex flex-wrap',
    masonry: 'columns-1 md:columns-2 lg:columns-3 break-inside-avoid'
  };
  
  const alignClasses = {
    start: 'items-start justify-start',
    center: 'items-center justify-center',
    end: 'items-end justify-end',
  };
  
  return (
    <div 
      className={`${layoutClasses[layout]} ${spacingClasses[spacing]} ${alignClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// SuperButton icon registry for consistent usage
export const SuperButtonIcons = {
  // Portal Icons
  gaming: '⚡',
  lorebound: '✦',
  productive: '→',
  news: '📡',
  
  // Action Icons
  enter: '→',
  launch: '🚀',
  explore: '🔍',
  join: '➕',
  view: '👁',
  download: '⬇',
  upload: '⬆',
  share: '📤',
  
  // Status Icons
  online: '🟢',
  offline: '🔴',
  loading: '⏳',
  success: '✓',
  error: '✗',
  warning: '⚠',
  
  // Social Icons
  discord: '💬',
  community: '👥',
  event: '🎉',
  trophy: '🏆',
  star: '⭐',
  crown: '👑',
  
  // Media Icons
  image: '🖼',
  video: '🎬',
  music: '🎵',
  gallery: '🎨',
};

// SuperButton presets for common use cases
export const SuperButtonPresets = {
  // Navigation Portals
  createGamingPortal: (customProps = {}) => ({
    variant: 'portal',
    pathway: 'gaming',
    title: 'Gaming Realm',
    subtitle: 'Enter the Digital Battlefield',
    description: 'Compete in tournaments, join guilds, and dominate leaderboards',
    actionText: 'Launch Game',
    icon: SuperButtonIcons.gaming,
    magnetic: true,
    ...customProps
  }),
  
  createLoreboundPortal: (customProps = {}) => ({
    variant: 'portal',
    pathway: 'lorebound',
    title: 'Lorebound Sanctuary',
    subtitle: 'Mystical Realm of Stories',
    description: 'Discover anime, manga, and endless tales of wonder',
    actionText: 'Enter Sanctuary',
    icon: SuperButtonIcons.lorebound,
    magnetic: true,
    ...customProps
  }),
  
  // Interactive Elements
  createDiscordButton: (memberCount = 1000, customProps = {}) => ({
    variant: 'interactive',
    title: 'Join Our Discord',
    subtitle: 'Connect with the community',
    memberCount,
    actionText: 'Join Server',
    ...customProps
  }),
  
  createStatsButton: (stats = {}, customProps = {}) => ({
    variant: 'interactive',
    title: 'Community Stats',
    subtitle: 'Live Statistics',
    stats: {
      'Members': 1247,
      'Online': 342,
      'Events': 28,
      'Posts': 15642,
      ...stats
    },
    ...customProps
  }),
  
  // Feature Showcases
  createEventButton: (customProps = {}) => ({
    variant: 'feature',
    pathway: 'event',
    title: 'Special Event',
    subtitle: 'Limited Time',
    description: 'Don\'t miss this exclusive opportunity',
    actionText: 'Join Event',
    icon: SuperButtonIcons.event,
    ...customProps
  })
};

export default SuperButton;