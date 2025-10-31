import React, { useState, useEffect, useRef } from 'react';
import '@/styles/buttons.css';

const LuxuryButton = ({
  // Core Props
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  disabled = false,
  loading = false,
  type = 'button',
  
  // Styling Props
  variant = 'text-flame', // 'text-flame', 'text-dim', 'text-subtle', 'primary-noble', 'primary-productive', 'secondary-noble', 'secondary-glass'
  pathway = 'default', // 'default', 'gaming', 'lorebound', 'productive', 'news'
  admin = null, // null, 'owner', 'admin', 'mod'
  size = 'md', // 'sm', 'md', 'lg'
  
  // Interactive Effects
  animated = null, // null, 'pulse', 'glow', 'float', 'wiggle', 'shake'
  clickEffect = 'ripple', // 'ripple', 'flash', 'bounce', null
  fullWidth = false,
  icon = null,
  iconPosition = 'left', // 'left', 'right', 'only'
  
  // Advanced Props
  className = '',
  style = {},
  id,
  'data-cursor': dataCursor = 'hover',
  'aria-label': ariaLabel,
  tabIndex,
  
  // Custom Props
  glowIntensity = 'normal', // 'subtle', 'normal', 'intense'
  noHover = false,
  forceUppercase = false,
  forceNormal = false,
  noShadow = false,
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  // State Management
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [rippleEffect, setRippleEffect] = useState(null);
  
  // Refs
  const buttonRef = useRef(null);
  const rippleTimeoutRef = useRef(null);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);
  
  // Cleanup ripple timeout
  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);
  
  // Generate class names based on props
  const generateClassName = () => {
    let classes = ['conclave-btn'];
    
    // Add cursor integration
    classes.push('cursor-hover-target');
    
    // Base variant classes
    if (admin) {
      classes.push(`btn-admin-${admin}`);
    } else if (pathway !== 'default' && (variant.includes('primary') || variant.includes('secondary'))) {
      // Pathway-specific buttons
      switch (pathway) {
        case 'gaming':
          if (variant.includes('primary')) classes.push('btn-gaming-primary');
          else if (variant.includes('secondary')) classes.push('btn-gaming-secondary');
          else if (variant === 'accent') classes.push('btn-gaming-accent');
          break;
        case 'lorebound':
          if (variant.includes('primary')) classes.push('btn-lorebound-primary');
          else if (variant.includes('secondary')) classes.push('btn-lorebound-secondary');
          else if (variant === 'mystical') classes.push('btn-lorebound-mystical');
          break;
        case 'news':
          if (variant.includes('primary')) classes.push('btn-news-primary');
          else if (variant.includes('secondary')) classes.push('btn-news-secondary');
          break;
        case 'productive':
          if (variant.includes('primary')) classes.push('btn-primary-productive');
          break;
        default:
          classes.push(`btn-${variant}`);
      }
    } else {
      // Standard variant classes
      classes.push(`btn-${variant}`);
    }
    
    // Size classes
    if (size !== 'md') {
      classes.push(`btn-${size}`);
    }
    
    // Animation classes
    if (animated) {
      classes.push(`btn-animated-${animated}`);
    }
    
    // Click effect classes
    if (clickEffect) {
      classes.push(`btn-click-${clickEffect}`);
    }
    
    // State classes
    if (isLoading) classes.push('btn-loading');
    if (disabled) classes.push('disabled');
    
    // Modifier classes
    if (fullWidth) classes.push('btn-full-width');
    if (noHover) classes.push('btn-no-hover');
    if (noShadow) classes.push('btn-no-shadow');
    if (forceUppercase) classes.push('btn-force-caps');
    if (forceNormal) classes.push('btn-force-normal');
    if (debug) classes.push('btn-debug');
    
    // Icon classes
    if (icon && iconPosition === 'left') classes.push('btn-icon-left');
    if (icon && iconPosition === 'right') classes.push('btn-icon-right');
    if (icon && iconPosition === 'only') classes.push('btn-icon-only');
    
    // Custom className
    if (className) classes.push(className);
    
    return classes.join(' ');
  };
  
  // Handle click with ripple effect
  const handleClick = (e) => {
    if (disabled || isLoading) return;
    
    // Create ripple effect
    if (clickEffect === 'ripple' && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      setRippleEffect({ x, y, size });
      
      // Clear ripple after animation
      rippleTimeoutRef.current = setTimeout(() => {
        setRippleEffect(null);
      }, 600);
    }
    
    // Call onClick prop
    if (onClick) {
      onClick(e);
    }
  };
  
  // Handle mouse events with state management
  const handleMouseEnter = (e) => {
    if (disabled || isLoading) return;
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  };
  
  const handleMouseLeave = (e) => {
    setIsHovered(false);
    setIsPressed(false);
    if (onMouseLeave) onMouseLeave(e);
  };
  
  const handleMouseDown = (e) => {
    if (disabled || isLoading) return;
    setIsPressed(true);
    if (onMouseDown) onMouseDown(e);
  };
  
  const handleMouseUp = (e) => {
    setIsPressed(false);
    if (onMouseUp) onMouseUp(e);
  };
  
  // Handle keyboard events for accessibility
  const handleKeyDown = (e) => {
    if (disabled || isLoading) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPressed(true);
      handleClick(e);
    }
  };
  
  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false);
    }
  };
  
  // Render icon
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return <span className="conclave-btn-icon" aria-hidden="true">{icon}</span>;
    }
    
    return <span className="conclave-btn-icon" aria-hidden="true">{icon}</span>;
  };
  
  // Generate dynamic styles
  const generateStyle = () => {
    let dynamicStyle = { ...style };
    
    // Apply glow intensity
    if (glowIntensity === 'subtle' && isHovered) {
      dynamicStyle.filter = `${dynamicStyle.filter || ''} brightness(1.1)`;
    } else if (glowIntensity === 'intense' && isHovered) {
      dynamicStyle.filter = `${dynamicStyle.filter || ''} brightness(1.3) saturate(1.2)`;
    }
    
    return dynamicStyle;
  };
  
  // Component element type
  const Element = type === 'link' ? 'a' : 'button';
  
  // Determine pathway-specific data attributes for cursor integration
  const getDataAttributes = () => {
    const attrs = {
      'data-cursor': dataCursor,
    };
    
    if (pathway !== 'default') {
      attrs['data-pathway'] = pathway;
    }
    
    if (admin) {
      attrs['data-admin-level'] = admin;
    }
    
    if (debug) {
      attrs['data-button-state'] = `${isHovered ? 'hovered' : 'idle'}-${isPressed ? 'pressed' : 'released'}-${isLoading ? 'loading' : 'ready'}`;
      attrs['data-button-variant'] = variant;
      attrs['data-button-pathway'] = pathway;
    }
    
    return attrs;
  };
  
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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...getDataAttributes()}
      {...restProps}
    >
      {/* Icon - Left Position */}
      {icon && iconPosition === 'left' && renderIcon()}
      
      {/* Icon Only - No Text */}
      {icon && iconPosition === 'only' && renderIcon()}
      
      {/* Button Text Content */}
      {iconPosition !== 'only' && (
        <span className="conclave-btn-text">
          {children}
        </span>
      )}
      
      {/* Icon - Right Position */}
      {icon && iconPosition === 'right' && renderIcon()}
      
      {/* Ripple Effect */}
      {rippleEffect && (
        <span
          className="conclave-btn-ripple-effect"
          style={{
            position: 'absolute',
            width: `${rippleEffect.size}px`,
            height: `${rippleEffect.size}px`,
            top: `${rippleEffect.y}px`,
            left: `${rippleEffect.x}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: 'rippleExpand 0.6s ease-out',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
    </Element>
  );
};

// Pre-configured button variants for easy usage
export const NobleButton = (props) => (
  <LuxuryButton variant="primary-noble" {...props} />
);

export const TextFlameButton = (props) => (
  <LuxuryButton variant="text-flame" {...props} />
);

export const TextDimButton = (props) => (
  <LuxuryButton variant="text-dim" {...props} />
);

export const GamingButton = (props) => (
  <LuxuryButton variant="primary" pathway="gaming" {...props} />
);

export const LoreboundButton = (props) => (
  <LuxuryButton variant="primary" pathway="lorebound" {...props} />
);

export const NewsButton = (props) => (
  <LuxuryButton variant="primary" pathway="news" {...props} />
);

export const ProductiveButton = (props) => (
  <LuxuryButton variant="primary-productive" pathway="productive" {...props} />
);

export const OwnerButton = (props) => (
  <LuxuryButton admin="owner" {...props} />
);

export const AdminButton = (props) => (
  <LuxuryButton admin="admin" {...props} />
);

export const ModButton = (props) => (
  <LuxuryButton admin="mod" {...props} />
);

// Advanced composed button variants
export const AnimatedGamingButton = (props) => (
  <LuxuryButton 
    variant="primary" 
    pathway="gaming" 
    animated="glow" 
    clickEffect="flash"
    {...props} 
  />
);

export const MysticalLoreboundButton = (props) => (
  <LuxuryButton 
    variant="mystical" 
    pathway="lorebound" 
    animated="float" 
    glowIntensity="intense"
    {...props} 
  />
);

export const NewsFlashButton = (props) => (
  <LuxuryButton 
    variant="primary" 
    pathway="news" 
    animated="pulse" 
    clickEffect="bounce"
    {...props} 
  />
);

export const ElegantSecondaryButton = (props) => (
  <LuxuryButton 
    variant="secondary-glass" 
    animated="float"
    {...props} 
  />
);

// Utility hook for button state management
export const useButtonState = (initialState = {}) => {
  const [buttonState, setButtonState] = useState({
    loading: false,
    disabled: false,
    variant: 'text-flame',
    pathway: 'default',
    ...initialState
  });
  
  const updateState = (newState) => {
    setButtonState(prev => ({ ...prev, ...newState }));
  };
  
  const setLoading = (loading) => updateState({ loading });
  const setDisabled = (disabled) => updateState({ disabled });
  const setVariant = (variant) => updateState({ variant });
  const setPathway = (pathway) => updateState({ pathway });
  
  return {
    ...buttonState,
    updateState,
    setLoading,
    setDisabled,
    setVariant,
    setPathway
  };
};

// Button group component for managing related buttons
export const ButtonGroup = ({ 
  children, 
  spacing = 'md',
  direction = 'row',
  align = 'start',
  className = '',
  ...props 
}) => {
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col'
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  return (
    <div 
      className={`flex ${directionClasses[direction]} ${alignClasses[align]} ${spacingClasses[spacing]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Icon registry for consistent icon usage
export const ButtonIcons = {
  // Admin Icons
  crown: '♔',
  castle: '♖', 
  bishop: '♗',
  
  // General Icons
  star: '✦',
  diamond: '◆',
  lightning: '⚡',
  sparkle: '✨',
  arrow: '→',
  plus: '+',
  minus: '−',
  close: '×',
  check: '✓',
  
  // Gaming Icons
  power: '⚡',
  target: '⊕',
  shield: '🛡',
  
  // Lorebound Icons
  mystical: '✦',
  magic: '✧',
  crystal: '◇',
  
  // News Icons
  flash: '⚡',
  broadcast: '📡',
  alert: '⚠',
};

// CSS-in-JS styles for dynamic ripple animation
const rippleStyles = `
  @keyframes rippleExpand {
    0% {
      transform: scale(0);
      opacity: 0.6;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
`;

// Inject ripple styles if not already present
if (typeof window !== 'undefined' && !document.getElementById('conclave-button-ripple-styles')) {
  const style = document.createElement('style');
  style.id = 'conclave-button-ripple-styles';
  style.textContent = rippleStyles;
  document.head.appendChild(style);
}

export default LuxuryButton;






