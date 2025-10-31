import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TextFlameButton, TextDimButton, GamingButton, LoreboundButton, ProductiveButton, NewsButton } from './LuxuryButton';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PATHWAY HERO COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium cinematic hero component for pathway landing pages.
 * Features full-screen immersive experiences with pathway-specific theming.
 * 
 * Features:
 * - Full viewport or configurable height variants
 * - Video/image backgrounds with fallbacks
 * - Pathway-specific visual effects (glitch, float, grid, ticker)
 * - Animated stats display (members, posts, events, activity)
 * - Dual CTA buttons with pathway styling
 * - Scroll indicator with animation
 * - Breadcrumb navigation support
 * - Particle systems per pathway
 * - Staggered entrance animations
 * - Mobile responsive with adaptive effects
 * - NobleCursor integration
 * - Uses existing pathways.css theming
 * 
 * @component
 * @example
 * @version 1.0
 * <PathwayHero
 *   pathway="gaming"
 *   title="Gaming Realm"
 *   subtitle="Where legends compete and champions rise"
 *   memberCount={1250}
 *   postCount={5420}
 *   eventCount={89}
 *   activityLevel="high"
 *   primaryButton={{ text: "Explore Realm", href: "/pathways/gaming/explore" }}
 *   secondaryButton={{ text: "Join Channel", href: "discord-link" }}
 * />
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAY_CONFIG = {
  gaming: {
    realmClass: 'gaming-realm',
    titleClass: 'gaming-title gaming-text-glow',
    effectClass: 'gaming-energy-pulse gaming-scanlines',
    buttonComponent: GamingButton,
    icon: '🎮',
    tagline: 'Where Legends Compete',
  },
  lorebound: {
    realmClass: 'lorebound-realm',
    titleClass: 'lorebound-title lorebound-text-mystical',
    effectClass: 'lorebound-float lorebound-particles',
    buttonComponent: LoreboundButton,
    icon: '📚',
    tagline: 'Where Stories Come Alive',
  },
  productive: {
    realmClass: 'productive-realm',
    titleClass: 'productive-title',
    effectClass: 'productive-grid',
    buttonComponent: ProductiveButton,
    icon: '⚡',
    tagline: 'Where Excellence Thrives',
  },
  news: {
    realmClass: 'news-realm',
    titleClass: 'news-title',
    effectClass: 'news-flash',
    buttonComponent: NewsButton,
    icon: '📰',
    tagline: 'Where Truth Emerges',
  },
};

const ACTIVITY_LEVELS = {
  high: { label: 'Very Active', color: '#4caf50', pulse: true },
  medium: { label: 'Active', color: '#ff9800', pulse: false },
  low: { label: 'Growing', color: '#2196f3', pulse: false },
};

const HEIGHT_VARIANTS = {
  full: '100vh',
  medium: '70vh',
  compact: '50vh',
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PathwayHero = ({
  // Core Configuration
  pathway = 'gaming',
  title,
  subtitle,
  description,
  
  // Visual Assets
  backgroundVideo,
  backgroundImage,
  icon,
  
  // Stats Display
  memberCount = 0,
  postCount = 0,
  eventCount = 0,
  activityLevel = 'medium',
  
  // Call-to-Action Buttons
  primaryButton = { text: 'Explore', href: '#' },
  secondaryButton = { text: 'Learn More', href: '#' },
  
  // Display Options
  height = 'full',
  showParticles = true,
  showScrollIndicator = true,
  showBreadcrumb = false,
  showStats = true,
  
  // Behavior
  autoPlayVideo = true,
  parallax = true,
  animated = true,
  
  // Breadcrumb
  breadcrumbItems = [],
  
  // Callbacks
  onPrimaryClick,
  onSecondaryClick,
  
  // Advanced
  customClass = '',
  style = {},
  debug = false,
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const pathwayConfig = useMemo(() => {
    return PATHWAY_CONFIG[pathway] || PATHWAY_CONFIG.gaming;
  }, [pathway]);

  const displayTitle = useMemo(() => {
    return title || `${pathway.charAt(0).toUpperCase() + pathway.slice(1)} Realm`;
  }, [title, pathway]);

  const displaySubtitle = useMemo(() => {
    return subtitle || pathwayConfig.tagline;
  }, [subtitle, pathwayConfig]);

  const activityConfig = useMemo(() => {
    return ACTIVITY_LEVELS[activityLevel] || ACTIVITY_LEVELS.medium;
  }, [activityLevel]);

  const heightValue = useMemo(() => {
    return HEIGHT_VARIANTS[height] || HEIGHT_VARIANTS.full;
  }, [height]);

  const ButtonComponent = pathwayConfig.buttonComponent;

  const containerClasses = useMemo(() => {
    const base = 'pathway-hero';
    const pathwayClass = `pathway-${pathway}`;
    const realmClass = pathwayConfig.realmClass;
    const effectClass = pathwayConfig.effectClass;
    const heightClass = `pathway-hero--${height}`;
    const visibleClass = isVisible ? 'is-visible' : '';
    
    return [
      base,
      pathwayClass,
      realmClass,
      effectClass,
      heightClass,
      visibleClass,
      customClass
    ].filter(Boolean).join(' ');
  }, [pathway, pathwayConfig, height, isVisible, customClass]);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  
  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll tracking for parallax
  useEffect(() => {
    if (!parallax) return;
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  // Mouse tracking for parallax
  useEffect(() => {
    if (!parallax) return;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 20,
        y: (clientY / innerHeight - 0.5) * 20,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [parallax]);

  // Video load handler
  useEffect(() => {
    if (videoRef.current && backgroundVideo) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });
    }
  }, [backgroundVideo]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const handlePrimaryClick = useCallback((e) => {
    if (onPrimaryClick) {
      e.preventDefault();
      onPrimaryClick();
    }
  }, [onPrimaryClick]);

  const handleSecondaryClick = useCallback((e) => {
    if (onSecondaryClick) {
      e.preventDefault();
      onSecondaryClick();
    }
  }, [onSecondaryClick]);

  const handleScrollClick = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderBackground = () => {
    const parallaxStyle = parallax ? {
      transform: `translate3d(${mousePosition.x}px, ${scrollY * 0.5 + mousePosition.y}px, 0) scale(1.1)`,
    } : {};

    return (
      <div className="pathway-hero__background" style={parallaxStyle}>
        {/* Video Background */}
        {backgroundVideo && (
          <video
            ref={videoRef}
            className="pathway-hero__video"
            src={backgroundVideo}
            autoPlay={autoPlayVideo}
            loop
            muted
            playsInline
            style={{ opacity: isVideoLoaded ? 1 : 0 }}
          />
        )}
        
        {/* Image Background */}
        {backgroundImage && (!backgroundVideo || !isVideoLoaded) && (
          <Image
            src={backgroundImage}
            alt={displayTitle}
            fill
            priority
            className="pathway-hero__image"
            style={{ objectFit: 'cover' }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="pathway-hero__overlay" />
      </div>
    );
  };

  const renderParticles = () => {
    if (!showParticles || !animated) return null;

    return (
      <div className="pathway-hero__particles" aria-hidden="true">
        {[...Array(pathway === 'gaming' ? 30 : pathway === 'lorebound' ? 20 : 15)].map((_, i) => (
          <div
            key={i}
            className={`pathway-hero__particle pathway-hero__particle--${pathway}`}
            style={{
              '--delay': `${i * 0.15}s`,
              '--duration': `${4 + Math.random() * 3}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--size': `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderBreadcrumb = () => {
    if (!showBreadcrumb || breadcrumbItems.length === 0) return null;

    return (
      <nav className="pathway-hero__breadcrumb" aria-label="Breadcrumb" data-cursor="default">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="pathway-hero__breadcrumb-separator">/</span>}
            {item.href ? (
              <Link href={item.href} className="pathway-hero__breadcrumb-link" data-cursor="hover">
                {item.label}
              </Link>
            ) : (
              <span className="pathway-hero__breadcrumb-current">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const renderIcon = () => {
    const displayIcon = icon || pathwayConfig.icon;
    
    return (
      <div className="pathway-hero__icon" data-cursor="default">
        <span className="pathway-hero__icon-inner">{displayIcon}</span>
      </div>
    );
  };

  const renderTitle = () => {
    return (
      <div className="pathway-hero__header">
        <h1 className={`pathway-hero__title ${pathwayConfig.titleClass}`} data-cursor="default">
          {displayTitle}
        </h1>
        {displaySubtitle && (
          <p className="pathway-hero__subtitle" data-cursor="default">
            {displaySubtitle}
          </p>
        )}
        {description && (
          <p className="pathway-hero__description" data-cursor="default">
            {description}
          </p>
        )}
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats) return null;

    const stats = [
      { label: 'Members', value: memberCount, icon: '👥' },
      { label: 'Posts', value: postCount, icon: '💬' },
      { label: 'Events', value: eventCount, icon: '📅' },
    ];

    return (
      <div className="pathway-hero__stats" data-cursor="default">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="pathway-hero__stat"
            style={{ '--delay': `${0.6 + index * 0.1}s` }}
          >
            <span className="pathway-hero__stat-icon">{stat.icon}</span>
            <div className="pathway-hero__stat-content">
              <span className="pathway-hero__stat-value">{formatNumber(stat.value)}</span>
              <span className="pathway-hero__stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
        
        {/* Activity Badge */}
        <div
          className={`pathway-hero__stat pathway-hero__stat--activity ${activityConfig.pulse ? 'pulse' : ''}`}
          style={{
            '--delay': '0.9s',
            '--activity-color': activityConfig.color,
          }}
        >
          <span className="pathway-hero__stat-icon">🔥</span>
          <div className="pathway-hero__stat-content">
            <span className="pathway-hero__stat-value">{activityConfig.label}</span>
            <span className="pathway-hero__stat-label">Activity</span>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    return (
      <div className="pathway-hero__actions">
        {primaryButton && (
          <ButtonComponent
            onClick={handlePrimaryClick}
            className="pathway-hero__button pathway-hero__button--primary"
            style={{ '--delay': '1s' }}
            data-cursor="hover"
          >
            {primaryButton.href && !onPrimaryClick ? (
              <Link href={primaryButton.href}>{primaryButton.text}</Link>
            ) : (
              primaryButton.text
            )}
          </ButtonComponent>
        )}
        
        {secondaryButton && (
          <TextDimButton
            onClick={handleSecondaryClick}
            className="pathway-hero__button pathway-hero__button--secondary"
            style={{ '--delay': '1.1s' }}
            data-cursor="hover"
          >
            {secondaryButton.href && !onSecondaryClick ? (
              <Link href={secondaryButton.href}>{secondaryButton.text}</Link>
            ) : (
              secondaryButton.text
            )}
          </TextDimButton>
        )}
      </div>
    );
  };

  const renderScrollIndicator = () => {
    if (!showScrollIndicator) return null;

    return (
      <button
        className="pathway-hero__scroll-indicator"
        onClick={handleScrollClick}
        aria-label="Scroll to content"
        data-cursor="hover"
      >
        <svg
          className="pathway-hero__scroll-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
        <span className="pathway-hero__scroll-text">Scroll to explore</span>
      </button>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  return (
    <section
      ref={heroRef}
      className={containerClasses}
      style={{
        ...style,
        height: heightValue,
      }}
      data-pathway={pathway}
      data-cursor="default"
      {...restProps}
    >
      {/* Background Layer */}
      {renderBackground()}
      
      {/* Particles */}
      {renderParticles()}
      
      {/* Content Container */}
      <div className="pathway-hero__container">
        {/* Breadcrumb */}
        {renderBreadcrumb()}
        
        {/* Icon */}
        {renderIcon()}
        
        {/* Title & Subtitle */}
        {renderTitle()}
        
        {/* Stats */}
        {renderStats()}
        
        {/* Action Buttons */}
        {renderActions()}
      </div>
      
      {/* Scroll Indicator */}
      {renderScrollIndicator()}
      
      {/* Debug Info */}
      {debug && (
        <div className="pathway-hero__debug">
          <pre>{JSON.stringify({
            pathway,
            height,
            isVisible,
            isVideoLoaded,
            showParticles,
            memberCount,
            activityLevel,
          }, null, 2)}</pre>
        </div>
      )}
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

export const GamingHero = (props) => (
  <PathwayHero pathway="gaming" {...props} />
);

export const LoreboundHero = (props) => (
  <PathwayHero pathway="lorebound" {...props} />
);

export const ProductiveHero = (props) => (
  <PathwayHero pathway="productive" {...props} />
);

export const NewsHero = (props) => (
  <PathwayHero pathway="news" {...props} />
);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   PATHWAY HERO - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-hero {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Josefin Sans', sans-serif;
}

/* Background Layer */
.pathway-hero__background {
  position: absolute;
  inset: -10%;
  z-index: 0;
  transition: transform 0.3s ease-out;
}

.pathway-hero__video,
.pathway-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 1s ease-in-out;
}

.pathway-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
}

/* Content Container */
.pathway-hero__container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  padding: 0 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Breadcrumb */
.pathway-hero__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  animation: fadeSlideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.pathway-hero__breadcrumb-link {
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
}

.pathway-hero__breadcrumb-link:hover {
  color: #FFD700;
}

.pathway-hero__breadcrumb-separator {
  color: rgba(255, 255, 255, 0.4);
}

.pathway-hero__breadcrumb-current {
  color: #FFD700;
  font-weight: 600;
}

/* Icon */
.pathway-hero__icon {
  font-size: 4rem;
  animation: fadeScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.pathway-hero__icon-inner {
  display: inline-block;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
  animation: float 6s ease-in-out infinite;
}

/* Header */
.pathway-hero__header {
  animation: fadeSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

.pathway-hero__title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.1;
}

.pathway-hero__subtitle {
  font-size: clamp(1.2rem, 3vw, 2rem);
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.pathway-hero__description {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Stats */
.pathway-hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  animation: fadeSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
}

.pathway-hero__stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: fadeScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) var(--delay, 0s) both;
}

.pathway-hero__stat:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.pathway-hero__stat-icon {
  font-size: 2rem;
}

.pathway-hero__stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.pathway-hero__stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFD700;
  line-height: 1;
}

.pathway-hero__stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.pathway-hero__stat--activity.pulse .pathway-hero__stat-value {
  color: var(--activity-color, #4caf50);
  animation: activityPulse 2s ease-in-out infinite;
}

/* Actions */
.pathway-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  animation: fadeSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
}

.pathway-hero__button {
  animation: fadeScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) var(--delay, 0s) both;
}

/* Scroll Indicator */
.pathway-hero__scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
  animation: fadeSlideUp 1s cubic-bezier(0.4, 0, 0.2, 1) 1.2s both;
}

.pathway-hero__scroll-indicator:hover {
  color: #FFD700;
  transform: translateX(-50%) translateY(4px);
}

.pathway-hero__scroll-icon {
  animation: bounce 2s ease-in-out infinite;
}

.pathway-hero__scroll-text {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Particles */
.pathway-hero__particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.pathway-hero__particle {
  position: absolute;
  width: var(--size, 4px);
  height: var(--size, 4px);
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat var(--duration, 4s) var(--delay, 0s) infinite;
  left: var(--x, 50%);
  top: var(--y, 50%);
}

.pathway-hero__particle--gaming {
  background: #00bfff;
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.8);
}

.pathway-hero__particle--lorebound {
  background: #6a0dad;
  box-shadow: 0 0 10px rgba(106, 13, 173, 0.8);
}

.pathway-hero__particle--productive {
  background: #c0c0c0;
  box-shadow: 0 0 10px rgba(192, 192, 192, 0.6);
}

.pathway-hero__particle--news {
  background: #e5e4e2;
  box-shadow: 0 0 10px rgba(229, 228, 226, 0.8);
}

/* Debug */
.pathway-hero__debug {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
  max-width: 300px;
  z-index: 100;
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(2deg);
  }
  66% {
    transform: translateY(-5px) rotate(-2deg);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx, 30px), var(--dy, -80px));
  }
}

@keyframes activityPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .pathway-hero__container {
    padding: 0 1.5rem;
    gap: 1.5rem;
  }

  .pathway-hero__icon {
    font-size: 3rem;
  }

  .pathway-hero__stats {
    gap: 1rem;
  }

  .pathway-hero__stat {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .pathway-hero__stat-icon {
    font-size: 1.5rem;
  }

  .pathway-hero__stat-value {
    font-size: 1.2rem;
  }

  .pathway-hero__stat-label {
    font-size: 0.75rem;
  }

  .pathway-hero__actions {
    width: 100%;
    flex-direction: column;
  }

  .pathway-hero__button {
    width: 100%;
  }

  .pathway-hero__scroll-indicator {
    bottom: 1rem;
  }

  /* Reduce particles on mobile */
  .pathway-hero__particle:nth-child(n+16) {
    display: none;
  }
}

@media (max-width: 480px) {
  .pathway-hero__container {
    padding: 0 1rem;
    gap: 1rem;
  }

  .pathway-hero__title {
    font-size: 2rem;
  }

  .pathway-hero__subtitle {
    font-size: 1rem;
  }

  .pathway-hero__description {
    font-size: 0.9rem;
  }

  .pathway-hero__stats {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .pathway-hero__stat {
    width: 100%;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   HEIGHT VARIANTS
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-hero--compact {
  min-height: 50vh;
}

.pathway-hero--medium {
  min-height: 70vh;
}

.pathway-hero--full {
  min-height: 100vh;
}

/* ═══════════════════════════════════════════════════════════════════════
   VISIBILITY STATE
   ═══════════════════════════════════════════════════════════════════════ */

.pathway-hero:not(.is-visible) .pathway-hero__icon,
.pathway-hero:not(.is-visible) .pathway-hero__header,
.pathway-hero:not(.is-visible) .pathway-hero__stats,
.pathway-hero:not(.is-visible) .pathway-hero__actions,
.pathway-hero:not(.is-visible) .pathway-hero__scroll-indicator {
  opacity: 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .pathway-hero__icon-inner,
  .pathway-hero__scroll-icon,
  .pathway-hero__particle {
    animation: none;
  }

  .pathway-hero__stat--activity.pulse .pathway-hero__stat-value {
    animation: none;
  }

  .pathway-hero__background {
    transition: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'pathway-hero-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default PathwayHero;