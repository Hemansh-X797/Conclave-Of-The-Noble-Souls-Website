// ============================================================================
// IMAGE REVEAL HOVER COMPONENT
// GSAP-powered swing/transform animations on hover
// Location: /src/components/effects/ImageRevealHover.jsx
// FREE - Uses GSAP core (free version)
// Works beautifully with NobleCursor
// ============================================================================

'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppProvider';

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

const ANIMATION_PRESETS = {
  swing: {
    hover: { rotation: 5, scale: 1.05, y: -10, duration: 0.4, ease: 'power2.out' },
    leave: { rotation: 0, scale: 1, y: 0, duration: 0.3, ease: 'power2.inOut' }
  },
  lift: {
    hover: { y: -20, scale: 1.08, duration: 0.4, ease: 'power3.out' },
    leave: { y: 0, scale: 1, duration: 0.3, ease: 'power2.inOut' }
  },
  tilt: {
    hover: { rotation: 3, scale: 1.1, duration: 0.5, ease: 'power2.out' },
    leave: { rotation: 0, scale: 1, duration: 0.4, ease: 'power2.inOut' }
  },
  zoom: {
    hover: { scale: 1.15, duration: 0.4, ease: 'power2.out' },
    leave: { scale: 1, duration: 0.3, ease: 'power2.inOut' }
  },
  slide: {
    hover: { x: 10, scale: 1.05, duration: 0.4, ease: 'power2.out' },
    leave: { x: 0, scale: 1, duration: 0.3, ease: 'power2.inOut' }
  },
  bounce: {
    hover: { y: -15, scale: 1.1, duration: 0.5, ease: 'elastic.out(1, 0.3)' },
    leave: { y: 0, scale: 1, duration: 0.4, ease: 'power2.inOut' }
  },
  rotate: {
    hover: { rotation: 360, scale: 1.1, duration: 0.6, ease: 'power2.out' },
    leave: { rotation: 0, scale: 1, duration: 0.4, ease: 'power2.inOut' }
  },
  flip: {
    hover: { rotationY: 180, scale: 1.05, duration: 0.6, ease: 'power2.inOut' },
    leave: { rotationY: 0, scale: 1, duration: 0.6, ease: 'power2.inOut' }
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImageRevealHover({
  // Image props
  src,
  alt = '',
  width = 400,
  height = 300,
  objectFit = 'cover',
  priority = false,
  
  // Animation settings
  preset = 'swing',
  customAnimation = null,
  followCursor = false,
  followStrength = 0.1,
  
  // Container styling
  className = '',
  style = {},
  containerStyle = {},
  
  // Overlay
  overlayContent = null,
  showOverlay = false,
  overlayOnHover = true,
  
  // Behavior
  enableOnMobile = true,
  onClick = null,
  href = null,
  
  // Advanced
  transformOrigin = 'center',
  glowEffect = false,
  glowColor = 'rgba(255, 215, 0, 0.3)',
  
  // Callbacks
  onHoverStart = null,
  onHoverEnd = null,
  
  // Debug
  debug = false
}) {
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gsap, setGsap] = useState(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const centerPos = useRef({ x: 0, y: 0 });
  const { playHover } = useAppContext();

  // ========================================================================
  // LOAD GSAP (LAZY)
  // ========================================================================

  useEffect(() => {
    // Dynamically import GSAP (code splitting)
    import('gsap').then((module) => {
      setGsap(module.default);
    }).catch((err) => {
      console.error('Failed to load GSAP:', err);
    });
  }, []);

  // ========================================================================
  // MOBILE DETECTION
  // ========================================================================

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ========================================================================
  // HOVER HANDLERS
  // ========================================================================

  const handleMouseEnter = (e) => {
    if (!gsap || (isMobile && !enableOnMobile)) {
return;
}

    setIsHovering(true);
    playHover?.();

    const animation = customAnimation || ANIMATION_PRESETS[preset];
    
    if (animation && animation.hover && imageRef.current) {
      gsap.to(imageRef.current, {
        ...animation.hover,
        transformOrigin
      });
    }

    if (onHoverStart) {
      onHoverStart(e);
    }
  };

  const handleMouseLeave = (e) => {
    if (!gsap || (isMobile && !enableOnMobile)) {
return;
}

    setIsHovering(false);

    const animation = customAnimation || ANIMATION_PRESETS[preset];
    
    if (animation && animation.leave && imageRef.current) {
      gsap.to(imageRef.current, {
        ...animation.leave,
        transformOrigin
      });
    }

    if (onHoverEnd) {
      onHoverEnd(e);
    }
  };

  // ========================================================================
  // CURSOR FOLLOW (OPTIONAL)
  // ========================================================================

  const handleMouseMove = (e) => {
    if (!followCursor || !gsap || !isHovering) {
return;
}
    if (!containerRef.current || !imageRef.current) {
return;
}

    const rect = containerRef.current.getBoundingClientRect();
    centerPos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    mousePos.current = {
      x: e.clientX,
      y: e.clientY
    };

    const deltaX = (mousePos.current.x - centerPos.current.x) * followStrength;
    const deltaY = (mousePos.current.y - centerPos.current.y) * followStrength;

    gsap.to(imageRef.current, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  // ========================================================================
  // CLICK HANDLER
  // ========================================================================

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  const imageElement = (
    <div
      ref={containerRef}
      className={`image-reveal-container ${className} ${isHovering ? 'hovering' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: onClick || href ? 'pointer' : 'default',
        ...containerStyle
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={followCursor ? handleMouseMove : undefined}
      onClick={onClick ? handleClick : undefined}
      data-cursor="hover"
    >
      {/* Main Image */}
      <div
        ref={imageRef}
        className="image-reveal-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          ...style
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            objectFit,
            width: '100%',
            height: '100%'
          }}
          priority={priority}
        />
      </div>

      {/* Glow Effect */}
      {glowEffect && (
        <div
          className="image-glow-effect"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            boxShadow: isHovering ? `0 0 30px ${glowColor}, inset 0 0 30px ${glowColor}` : 'none',
            transition: 'box-shadow 0.4s ease',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />
      )}

      {/* Overlay Content */}
      {overlayContent && (showOverlay || (overlayOnHover && isHovering)) && (
        <div
          className="image-overlay-content"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            opacity: isHovering ? 1 : (showOverlay ? 1 : 0),
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 3,
            padding: '1rem'
          }}
        >
          {overlayContent}
        </div>
      )}

      {/* Debug Overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '10px',
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          <div>Preset: {preset}</div>
          <div>Hovering: {isHovering ? 'Yes' : 'No'}</div>
          <div>GSAP: {gsap ? 'Loaded' : 'Loading...'}</div>
        </div>
      )}
    </div>
  );

  // Wrap with link if href provided
  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {imageElement}
      </a>
    );
  }

  return imageElement;
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

export function SwingImage(props) {
  return <ImageRevealHover {...props} preset="swing" />;
}

export function LiftImage(props) {
  return <ImageRevealHover {...props} preset="lift" />;
}

export function TiltImage(props) {
  return <ImageRevealHover {...props} preset="tilt" />;
}

export function ZoomImage(props) {
  return <ImageRevealHover {...props} preset="zoom" />;
}

export function BounceImage(props) {
  return <ImageRevealHover {...props} preset="bounce" />;
}

export function FlipImage(props) {
  return <ImageRevealHover {...props} preset="flip" />;
}

// ============================================================================
// PATHWAY-THEMED COMPONENTS
// ============================================================================

export function GamingRevealImage(props) {
  return (
    <ImageRevealHover
      {...props}
      preset="tilt"
      glowEffect={true}
      glowColor="rgba(0, 191, 255, 0.4)"
      followCursor={true}
      followStrength={0.15}
    />
  );
}

export function LoreboundRevealImage(props) {
  return (
    <ImageRevealHover
      {...props}
      preset="swing"
      glowEffect={true}
      glowColor="rgba(106, 13, 173, 0.4)"
      followCursor={true}
      followStrength={0.08}
    />
  );
}

export function ProductiveRevealImage(props) {
  return (
    <ImageRevealHover
      {...props}
      preset="lift"
      glowEffect={true}
      glowColor="rgba(80, 200, 120, 0.4)"
      followCursor={false}
    />
  );
}

export function NewsRevealImage(props) {
  return (
    <ImageRevealHover
      {...props}
      preset="zoom"
      glowEffect={true}
      glowColor="rgba(224, 17, 95, 0.4)"
      followCursor={true}
      followStrength={0.2}
    />
  );
}

// ============================================================================
// UTILITY: Create Custom Animation
// ============================================================================

export function createCustomAnimation(hoverConfig, leaveConfig) {
  return {
    hover: hoverConfig,
    leave: leaveConfig
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ANIMATION_PRESETS
};