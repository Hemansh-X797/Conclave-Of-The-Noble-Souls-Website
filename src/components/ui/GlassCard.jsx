import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/glasscard.css';

// Import button systems for integration
import LuxuryButton, { TextFlameButton, TextDimButton } from '@/ui/Luxurybutton';
import SuperButton from './SuperButton';

const GlassCard = ({
  // Core Props
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDoubleClick,
  
  // Card Type & Variant
  variant = 'default', // 'default', 'profile', 'media', 'feature', 'navigation', 'stats'
  type = 'interactive', // 'static', 'interactive', 'clickable', 'expandable'
  pathway = 'default', // 'default', 'gaming', 'lorebound', 'productive', 'news'
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'
  
  // Content Props
  title,
  subtitle,
  description,
  badge,
  image,
  imageAlt = '',
  
  // Interactive Props
  expandable = false,
  expanded = false,
  onExpand,
  draggable = false,
  onDragStart,
  onDragEnd,
  
  // State Props
  loading = false,
  error = false,
  success = false,
  disabled = false,
  selected = false,
  
  // Visual Effects
  floating = false,
  glow = false,
  glowIntense = false,
  shimmer = false,
  pulse = false,
  magnetic = false,
  tilt = false,
  parallax = false,
  
  // Layout Props
  fullWidth = false,
  fullHeight = false,
  aspectRatio, // 'square', 'landscape', 'portrait', 'golden'
  
  // Style Props
  className = '',
  style = {},
  id,
  
  // Accessibility Props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  role = 'article',
  tabIndex,
  
  // Data Props
  author,
  timestamp,
  tags = [],
  rating,
  progress,
  stats,
  
  // Button Integration
  primaryAction,
  secondaryActions = [],
  
  // Advanced Props
  'data-cursor': dataCursor = 'hover',
  'data-pathway': dataPathway,
  backgroundImage,
  overlayGradient,
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  // State Management
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [hasError, setHasError] = useState(error);
  const [isSelected, setIsSelected] = useState(selected);
  
  // Refs
  const cardRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);
  
  // Router for navigation
  const router = useRouter();
  
  // Update state based on props
  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);
  
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);
  
  useEffect(() => {
    setHasError(error);
  }, [error]);
  
  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);
  
  // Generate class names
  const generateClassName = useCallback(() => {
    let classes = ['conclave-glass-card'];
    
    // Variant classes
    if (variant !== 'default') {
      classes.push(`gc-${variant}-card`);
    }
    
    // Pathway theming
    if (pathway !== 'default') {
      classes.push(`pathway-${pathway}`);
    }
    
    // Size classes
    if (size !== 'md') {
      classes.push(`gc-size-${size}`);
    }
    
    // Aspect ratio classes
    if (aspectRatio) {
      classes.push(`gc-${aspectRatio}`);
    }
    
    // State classes
    if (isLoading) classes.push('gc-loading');
    if (hasError) classes.push('gc-error');
    if (success) classes.push('gc-success');
    if (disabled) classes.push('gc-disabled');
    if (isSelected) classes.push('gc-selected');
    if (isExpanded) classes.push('expanded');
    if (isDragging) classes.push('gc-dragging');
    
    // Type classes
    if (type === 'expandable' || expandable) classes.push('gc-expandable');
    if (draggable) classes.push('gc-draggable');
    if (type === 'clickable') classes.push('gc-clickable');
    
    // Visual effect classes
    if (floating) classes.push('gc-floating');
    if (glow) classes.push('gc-glow');
    if (glowIntense) classes.push('gc-glow-intense');
    if (shimmer) classes.push('gc-shimmer');
    if (pulse) classes.push('gc-pulse');
    if (magnetic) classes.push('gc-magnetic');
    if (tilt) classes.push('gc-tilt');
    if (parallax) classes.push('gc-parallax');
    
    // Layout classes
    if (fullWidth) classes.push('gc-full-width');
    if (fullHeight) classes.push('gc-full-height');
    
    // Debug class
    if (debug) classes.push('gc-debug');
    
    // Custom className
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [variant, pathway, size, aspectRatio, isLoading, hasError, success, disabled, 
      isSelected, isExpanded, isDragging, type, expandable, draggable, floating, 
      glow, glowIntense, shimmer, pulse, magnetic, tilt, parallax, fullWidth, 
      fullHeight, debug, className]);
  
  // Handle click events
  const handleClick = useCallback((e) => {
    if (disabled || isLoading) return;
    
    if (type === 'expandable' || expandable) {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      if (onExpand) onExpand(newExpanded);
    }
    
    if (onClick) {
      onClick(e);
    }
  }, [disabled, isLoading, type, expandable, isExpanded, onExpand, onClick]);
  
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
  
  // Handle drag events
  const handleDragStart = useCallback((e) => {
    if (!draggable || disabled) return;
    setIsDragging(true);
    if (onDragStart) onDragStart(e);
  }, [draggable, disabled, onDragStart]);
  
  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd(e);
  }, [onDragEnd]);
  
  // Generate dynamic styles
  const generateStyle = useCallback(() => {
    let dynamicStyle = { ...style };
    
    // Background image handling
    if (backgroundImage) {
      const overlay = overlayGradient || 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%)';
      dynamicStyle.backgroundImage = `${overlay}, url(${backgroundImage})`;
      dynamicStyle.backgroundSize = 'cover';
      dynamicStyle.backgroundPosition = 'center';
    }
    
    return dynamicStyle;
  }, [style, backgroundImage, overlayGradient]);
  
  // Generate data attributes
  const getDataAttributes = useCallback(() => {
    const attrs = {
      'data-cursor': dataCursor,
    };
    
    if (dataPathway || pathway !== 'default') {
      attrs['data-pathway'] = dataPathway || pathway;
    }
    
    if (variant !== 'default') {
      attrs['data-variant'] = variant;
    }
    
    if (debug) {
      attrs['data-gc-state'] = `${isHovered ? 'hovered' : 'idle'}-${isLoading ? 'loading' : 'ready'}`;
      attrs['data-gc-type'] = type;
    }
    
    return attrs;
  }, [dataCursor, dataPathway, pathway, variant, debug, isHovered, isLoading, type]);
  
  // Render card header
  const renderHeader = () => {
    if (!title && !subtitle && !badge) return null;
    
    return (
      <div className="gc-header">
        <div>
          {title && (
            <h3 className="gc-title">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="gc-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        {badge && (
          <span className="gc-badge">
            {badge}
          </span>
        )}
      </div>
    );
  };
  
  // Render card body content
  const renderBody = () => (
    <div className="gc-body">
      {description && (
        <p className="gc-description">
          {description}
        </p>
      )}
      
      {/* Stats display for profile cards */}
      {variant === 'stats' && stats && (
        <div className="gc-stats-grid">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="gc-stat-item">
              <span className="gc-stat-value">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="gc-stat-label">{key}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="gc-progress">
          <div 
            className="gc-progress-bar" 
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="gc-tags">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className={`gc-tag ${typeof tag === 'object' ? tag.type : ''}`}
            >
              {typeof tag === 'object' ? tag.label : tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Rating display */}
      {rating !== undefined && (
        <div className="gc-rating">
          {Array.from({ length: 5 }).map((_, index) => (
            <span 
              key={index} 
              className={`gc-star ${index < rating ? 'filled' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
      )}
      
      {/* Custom content area */}
      <div className="gc-content-area">
        {children}
      </div>
    </div>
  );
  
  // Render card footer
  const renderFooter = () => {
    const hasActions = primaryAction || secondaryActions.length > 0;
    const hasMeta = author || timestamp;
    
    if (!hasActions && !hasMeta) return null;
    
    return (
      <div className="gc-footer">
        {/* Action buttons */}
        {hasActions && (
          <div className="gc-button-group">
            {primaryAction && (
              <div className="gc-button-primary">
                {React.isValidElement(primaryAction) ? primaryAction : (
                  <LuxuryButton
                    variant="primary-noble"
                    size="sm"
                    onClick={primaryAction.onClick}
                    disabled={disabled || isLoading}
                    data-cursor="hover"
                  >
                    {primaryAction.label || 'Action'}
                  </LuxuryButton>
                )}
              </div>
            )}
            
            {secondaryActions.map((action, index) => (
              <div key={index} className="gc-button-secondary">
                {React.isValidElement(action) ? action : (
                  <TextDimButton
                    size="sm"
                    onClick={action.onClick}
                    disabled={disabled || isLoading}
                    data-cursor="hover"
                  >
                    {action.label}
                  </TextDimButton>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Metadata */}
        {hasMeta && (
          <div className="gc-meta">
            {author && (
              <div className="gc-author">
                {author.avatar && (
                  <Image
                    src={author.avatar}
                    alt={`${author.name} avatar`}
                    width={24}
                    height={24}
                    className="gc-author-avatar"
                  />
                )}
                <span>{author.name}</span>
              </div>
            )}
            
            {timestamp && (
              <div className="gc-timestamp">
                <span>🕒</span>
                <span>{timestamp}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render media content for media cards
  const renderMediaContent = () => {
    if (variant !== 'media' || !image) return null;
    
    return (
      <div className="gc-media-container">
        <Image
          ref={imageRef}
          src={image}
          alt={imageAlt}
          fill
          className="gc-media-image"
          style={{ objectFit: 'cover' }}
        />
        <div className="gc-media-overlay">
          <div className="gc-media-info">
            {title && <h4 className="gc-media-title">{title}</h4>}
            {description && <p className="gc-media-description">{description}</p>}
          </div>
        </div>
      </div>
    );
  };
  
  // Render profile content for profile cards
  const renderProfileContent = () => {
    if (variant !== 'profile') return null;
    
    return (
      <div className="gc-profile-content">
        {image && (
          <Image
            src={image}
            alt={imageAlt || `${title} profile`}
            width={80}
            height={80}
            className="gc-profile-avatar"
          />
        )}
        {author?.role && (
          <span className={`gc-profile-role ${author.role.toLowerCase()}`}>
            {author.role}
          </span>
        )}
      </div>
    );
  };
  
  // Render navigation content for navigation cards
  const renderNavigationContent = () => {
    if (variant !== 'navigation') return null;
    
    return (
      <div className="gc-navigation-content">
        <div className="gc-nav-icon">
          {children || '→'}
        </div>
        <div className="gc-nav-arrow">
          →
        </div>
      </div>
    );
  };
  
  // Render expand button
  const renderExpandButton = () => {
    if (!expandable && type !== 'expandable') return null;
    
    return (
      <button
        className="gc-expand-button"
        onClick={(e) => {
          e.stopPropagation();
          const newExpanded = !isExpanded;
          setIsExpanded(newExpanded);
          if (onExpand) onExpand(newExpanded);
        }}
        data-cursor="hover"
        aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
      >
        ↓
      </button>
    );
  };
  
  // Render parallax background
  const renderParallaxBackground = () => {
    if (!parallax || !backgroundImage) return null;
    
    return (
      <div
        className="gc-parallax-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  };
  
  // Render feature indicator
  const renderFeatureIndicator = () => {
    if (variant !== 'feature') return null;
    
    return <div className="gc-feature-indicator" aria-hidden="true" />;
  };
  
  // Main render method
  const CardElement = type === 'clickable' || onClick ? 'button' : 'article';
  
  return (
    <CardElement
      ref={cardRef}
      id={id}
      className={generateClassName()}
      style={generateStyle()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={onDoubleClick}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      draggable={draggable && !disabled}
      disabled={disabled}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      role={role}
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedby}
      aria-expanded={expandable ? isExpanded : undefined}
      aria-busy={isLoading}
      aria-selected={isSelected}
      {...getDataAttributes()}
      {...restProps}
    >
      {renderParallaxBackground()}
      {renderFeatureIndicator()}
      
      <div ref={contentRef} className="gc-content">
        {variant === 'media' && renderMediaContent()}
        
        {variant !== 'media' && (
          <>
            {renderHeader()}
            
            {variant === 'profile' && renderProfileContent()}
            {variant === 'navigation' && renderNavigationContent()}
            
            {renderBody()}
            {renderFooter()}
          </>
        )}
        
        {variant === 'media' && (
          <div className="gc-media-content">
            {renderHeader()}
            {renderBody()}
            {renderFooter()}
          </div>
        )}
      </div>
      
      {renderExpandButton()}
    </CardElement>
  );
};

// Pre-configured card variants for easy usage

// Profile Cards
export const ProfileCard = (props) => (
  <GlassCard
    variant="profile"
    size="sm"
    aspectRatio="portrait"
    {...props}
  />
);

export const StatsCard = (props) => (
  <GlassCard
    variant="stats"
    size="md"
    glow
    {...props}
  />
);

// Media Cards
export const MediaCard = (props) => (
  <GlassCard
    variant="media"
    size="lg"
    tilt
    {...props}
  />
);

export const GalleryCard = (props) => (
  <GlassCard
    variant="media"
    aspectRatio="square"
    shimmer
    {...props}
  />
);

// Feature Cards
export const FeatureCard = (props) => (
  <GlassCard
    variant="feature"
    size="lg"
    floating
    glow
    {...props}
  />
);

export const AnnouncementCard = (props) => (
  <GlassCard
    variant="feature"
    size="xl"
    glowIntense
    pulse
    badge="New"
    {...props}
  />
);

// Navigation Cards
export const NavigationCard = (props) => (
  <GlassCard
    variant="navigation"
    type="clickable"
    size="md"
    magnetic
    {...props}
  />
);

// Pathway-specific cards
export const GamingCard = (props) => (
  <GlassCard
    pathway="gaming"
    shimmer
    {...props}
  />
);

export const LoreboundCard = (props) => (
  <GlassCard
    pathway="lorebound"
    floating
    glow
    {...props}
  />
);

export const ProductiveCard = (props) => (
  <GlassCard
    pathway="productive"
    pulse="subtle"
    {...props}
  />
);

export const NewsCard = (props) => (
  <GlassCard
    pathway="news"
    shimmer
    pulse
    {...props}
  />
);

// Interactive Cards
export const ExpandableCard = (props) => (
  <GlassCard
    type="expandable"
    expandable
    {...props}
  />
);

export const DraggableCard = (props) => (
  <GlassCard
    draggable
    magnetic
    {...props}
  />
);

// Layout components
export const CardGrid = ({ 
  children, 
  columns = 'auto',
  gap = 'md',
  className = '',
  ...props 
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6', 
    lg: 'gap-8'
  };
  
  const gridClass = columns === 'auto' 
    ? 'gc-grid-auto' 
    : `gc-grid-${columns}`;
    
  return (
    <div 
      className={`gc-grid ${gridClass} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardMasonry = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
  ...props
}) => (
  <div 
    className={`gc-masonry ${className}`}
    style={{ columns, columnGap: gap === 'sm' ? '1rem' : gap === 'lg' ? '2rem' : '1.5rem' }}
    {...props}
  >
    {children}
  </div>
);

export const CardStack = ({
  children,
  spacing = 'md',
  centered = false,
  className = '',
  ...props
}) => {
  const spacingClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  return (
    <div 
      className={`gc-stack ${spacingClasses[spacing]} ${centered ? 'gc-stack-center' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card state management hook
export const useCardState = (initialState = {}) => {
  const [cardState, setCardState] = useState({
    loading: false,
    error: false,
    success: false,
    selected: false,
    expanded: false,
    ...initialState
  });
  
  const updateState = (newState) => {
    setCardState(prev => ({ ...prev, ...newState }));
  };
  
  const setLoading = (loading) => updateState({ loading });
  const setError = (error) => updateState({ error, success: false });
  const setSuccess = (success) => updateState({ success, error: false });
  const setSelected = (selected) => updateState({ selected });
  const setExpanded = (expanded) => updateState({ expanded });
  const reset = () => setCardState(initialState);
  
  return {
    ...cardState,
    updateState,
    setLoading,
    setError,
    setSuccess,
    setSelected,
    setExpanded,
    reset
  };
};

// Card collection management
export const useCardCollection = (initialCards = []) => {
  const [cards, setCards] = useState(initialCards);
  const [selectedCards, setSelectedCards] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('default');
  
  const addCard = (card) => {
    setCards(prev => [...prev, { ...card, id: card.id || Date.now() }]);
  };
  
  const removeCard = (cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setSelectedCards(prev => prev.filter(id => id !== cardId));
  };
  
  const updateCard = (cardId, updates) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
  };
  
  const selectCard = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };
  
  const selectAllCards = () => {
    setSelectedCards(cards.map(card => card.id));
  };
  
  const clearSelection = () => {
    setSelectedCards([]);
  };
  
  const filteredCards = useMemo(() => {
    let filtered = cards;
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(card => 
          card[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    // Apply sorting
    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'date') return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
    }
    
    return filtered;
  }, [cards, filters, sortBy]);
  
  return {
    cards: filteredCards,
    selectedCards,
    filters,
    sortBy,
    addCard,
    removeCard,
    updateCard,
    selectCard,
    selectAllCards,
    clearSelection,
    setFilters,
    setSortBy,
    totalCount: cards.length,
    selectedCount: selectedCards.length
  };
};

export default GlassCard;






