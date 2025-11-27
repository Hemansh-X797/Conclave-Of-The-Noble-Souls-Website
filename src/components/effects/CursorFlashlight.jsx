// ============================================================================
// CURSOR FLASHLIGHT COMPONENT
// Two-layer background with cursor reveal effect (mask-based)
// Location: /src/components/effects/CursorFlashlight.jsx
// FREE - No external dependencies beyond React
// ZERO CONFLICT with NobleCursor - pure CSS mask technique
// ============================================================================

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CursorFlashlight({
  // Layer 1 (visible background)
  backgroundLayer1 = '/Assets/Images/backgrounds/main_bg.jpg',
  backgroundLayer1Style = {},
  
  // Layer 2 (revealed background)
  backgroundLayer2 = '/Assets/Images/backgrounds/flashlight_reveal_bg.jpg',
  backgroundLayer2Style = {},
  
  // Flashlight settings
  spotlightRadius = 150, // pixels
  spotlightBlur = 50,    // pixels (fade distance)
  followSpeed = 0.15,    // 0-1, smoothness of follow
  
  // Behavior
  enableOnMobile = false,
  autoHide = false,      // Hide when cursor leaves
  initialPosition = { x: '50%', y: '50%' },
  
  // Styling
  className = '',
  style = {},
  
  // Advanced
  blendMode = 'normal',  // CSS blend mode for layer 2
  zIndex = 0,
  
  // Callbacks
  onReveal = null,       // (x, y) => {} when mask moves
  
  // Debug
  debug = false
}) {
  const containerRef = useRef(null);
  const layer2Ref = useRef(null);
  const [isActive, setIsActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);

  // ========================================================================
  // MOBILE DETECTION
  // ========================================================================

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
      
      if (mobile && !enableOnMobile) {
        setIsActive(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [enableOnMobile]);

  // ========================================================================
  // MOUSE TRACKING (NO CONFLICT WITH NOBLECURSOR)
  // ========================================================================

  const updateMaskPosition = useCallback(() => {
    if (!layer2Ref.current || !isActive) {
return;
}

    // Smooth lerp towards target position
    currentPos.current.x += (mousePos.current.x - currentPos.current.x) * followSpeed;
    currentPos.current.y += (mousePos.current.y - currentPos.current.y) * followSpeed;

    // Apply CSS mask (this doesn't interfere with NobleCursor)
    const maskImage = `radial-gradient(
      circle ${spotlightRadius}px at ${currentPos.current.x}px ${currentPos.current.y}px,
      black ${spotlightRadius - spotlightBlur}px,
      transparent ${spotlightRadius}px
    )`;

    layer2Ref.current.style.maskImage = maskImage;
    layer2Ref.current.style.webkitMaskImage = maskImage;

    // Callback
    if (onReveal) {
      onReveal(currentPos.current.x, currentPos.current.y);
    }

    animationFrameId.current = requestAnimationFrame(updateMaskPosition);
  }, [followSpeed, spotlightRadius, spotlightBlur, isActive, onReveal]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  useEffect(() => {
    if (!isActive || isMobile) {
return;
}

    const handleMouseMove = (e) => {
      if (!containerRef.current) {
return;
}

      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseEnter = () => {
      if (autoHide) {
        setIsActive(true);
      }
    };

    const handleMouseLeave = () => {
      if (autoHide) {
        setIsActive(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      // Start animation loop
      animationFrameId.current = requestAnimationFrame(updateMaskPosition);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, isMobile, autoHide, updateMaskPosition]);

  // ========================================================================
  // INITIAL POSITION SETUP
  // ========================================================================

  useEffect(() => {
    if (!containerRef.current || !layer2Ref.current) {
return;
}

    const rect = containerRef.current.getBoundingClientRect();
    
    // Parse initial position
    let initX = rect.width / 2;
    let initY = rect.height / 2;

    if (typeof initialPosition.x === 'string' && initialPosition.x.includes('%')) {
      initX = rect.width * (parseFloat(initialPosition.x) / 100);
    } else if (typeof initialPosition.x === 'number') {
      initX = initialPosition.x;
    }

    if (typeof initialPosition.y === 'string' && initialPosition.y.includes('%')) {
      initY = rect.height * (parseFloat(initialPosition.y) / 100);
    } else if (typeof initialPosition.y === 'number') {
      initY = initialPosition.y;
    }

    mousePos.current = { x: initX, y: initY };
    currentPos.current = { x: initX, y: initY };

    // Apply initial mask
    const maskImage = `radial-gradient(
      circle ${spotlightRadius}px at ${initX}px ${initY}px,
      black ${spotlightRadius - spotlightBlur}px,
      transparent ${spotlightRadius}px
    )`;

    layer2Ref.current.style.maskImage = maskImage;
    layer2Ref.current.style.webkitMaskImage = maskImage;
  }, [initialPosition, spotlightRadius, spotlightBlur]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <div
        ref={containerRef}
        className={`cursor-flashlight-container ${className}`}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style
        }}
        aria-hidden="true"
      >
        {/* Layer 1: Always Visible Background */}
        <div
          className="flashlight-layer-1"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${backgroundLayer1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: zIndex,
            ...backgroundLayer1Style
          }}
        />

        {/* Layer 2: Revealed by Cursor Mask */}
        <div
          ref={layer2Ref}
          className="flashlight-layer-2"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${backgroundLayer2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: blendMode,
            zIndex: zIndex + 1,
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.5s ease',
            ...backgroundLayer2Style
          }}
        />

        {/* Debug Overlay */}
        {debug && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              fontFamily: 'monospace',
              fontSize: '12px',
              zIndex: zIndex + 100,
              pointerEvents: 'none'
            }}
          >
            <div>Mouse: {Math.round(mousePos.current.x)}, {Math.round(mousePos.current.y)}</div>
            <div>Current: {Math.round(currentPos.current.x)}, {Math.round(currentPos.current.y)}</div>
            <div>Active: {isActive ? 'Yes' : 'No'}</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Radius: {spotlightRadius}px</div>
          </div>
        )}
      </div>

      {/* Inline Styles for Accessibility */}
      <style jsx>{`
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .flashlight-layer-2 {
            mask-image: none !important;
            -webkit-mask-image: none !important;
            opacity: 0.5 !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .cursor-flashlight-container {
            outline: 2px solid rgba(255, 215, 0, 0.5);
          }
        }
      `}</style>
    </>
  );
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Hero Flashlight - Large spotlight for hero sections
 */
export function HeroFlashlight(props) {
  return (
    <CursorFlashlight
      spotlightRadius={250}
      spotlightBlur={100}
      followSpeed={0.1}
      {...props}
    />
  );
}

/**
 * Compact Flashlight - Smaller spotlight for cards/sections
 */
export function CompactFlashlight(props) {
  return (
    <CursorFlashlight
      spotlightRadius={120}
      spotlightBlur={40}
      followSpeed={0.2}
      {...props}
    />
  );
}

/**
 * Pathway-Themed Flashlights
 */
export function GamingFlashlight(props) {
  return (
    <CursorFlashlight
      spotlightRadius={180}
      spotlightBlur={60}
      blendMode="screen"
      {...props}
    />
  );
}

export function LoreboundFlashlight(props) {
  return (
    <CursorFlashlight
      spotlightRadius={200}
      spotlightBlur={80}
      blendMode="overlay"
      followSpeed={0.08}
      {...props}
    />
  );
}

export function ProductiveFlashlight(props) {
  return (
    <CursorFlashlight
      spotlightRadius={160}
      spotlightBlur={50}
      blendMode="normal"
      followSpeed={0.15}
      {...props}
    />
  );
}

export function NewsFlashlight(props) {
  return (
    <CursorFlashlight
      spotlightRadius={140}
      spotlightBlur={45}
      blendMode="hard-light"
      followSpeed={0.2}
      {...props}
    />
  );
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Basic Usage:
 * 
 * <CursorFlashlight
 *   backgroundLayer1="/images/hero-dark.jpg"
 *   backgroundLayer2="/images/hero-bright.jpg"
 *   spotlightRadius={200}
 *   spotlightBlur={60}
 * />
 * 
 * Hero Section:
 * 
 * <section style={{ height: '100vh' }}>
 *   <HeroFlashlight
 *     backgroundLayer1="/images/lorebound-dark.jpg"
 *     backgroundLayer2="/images/lorebound-mystical.jpg"
 *   />
 *   <div style={{ position: 'relative', zIndex: 10 }}>
 *     <h1>Your Content Here</h1>
 *   </div>
 * </section>
 */