// ============================================================================
// CARD 3D TILT COMPONENT
// Mouse-based 3D rotation with perspective (pure CSS transforms)
// Location: /src/components/effects/Card3DTilt.jsx
// FREE - No external dependencies (pure CSS + React)
// Perfect harmony with NobleCursor
// ============================================================================

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppProvider';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Card3DTilt({
  // Content
  children,
  
  // Tilt settings
  tiltAngle = 15,      // Max tilt angle in degrees
  perspective = 1000,  // CSS perspective value
  scale = 1.05,        // Scale on hover
  speed = 400,         // Transition speed (ms)
  easing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
  
  // Advanced tilt
  glare = true,
  glareOpacity = 0.2,
  glareColor = 'rgba(255, 255, 255, 0.5)',
  
  // Behavior
  reset = true,        // Reset on mouse leave
  resetSpeed = 300,
  enableOnMobile = false,
  
  // Styling
  className = '',
  style = {},
  
  // Effects
  shadow = true,
  shadowIntensity = 30,
  
  // Callbacks
  onTilt = null,       // (tiltX, tiltY) => {}
  onHoverStart = null,
  onHoverEnd = null,
  
  // Debug
  debug = false
}) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { playHover } = useAppContext();

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
  // TILT CALCULATION
  // ========================================================================

  const calculateTilt = useCallback((e) => {
    if (!cardRef.current) return { tiltX: 0, tiltY: 0, percentX: 0, percentY: 0 };

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Mouse position relative to card
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate percentage from center (-1 to 1)
    const percentX = (mouseX - cardCenterX) / (rect.width / 2);
    const percentY = (mouseY - cardCenterY) / (rect.height / 2);

    // Calculate tilt angles
    const tiltX = percentY * tiltAngle;
    const tiltY = percentX * tiltAngle * -1;

    return { tiltX, tiltY, percentX, percentY };
  }, [tiltAngle]);

  // ========================================================================
  // APPLY TILT
  // ========================================================================

  const applyTilt = useCallback((tiltX, tiltY, percentX, percentY) => {
    if (!cardRef.current) return;

    // Apply 3D transform
    cardRef.current.style.transform = `
      perspective(${perspective}px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      scale3d(${scale}, ${scale}, ${scale})
    `;

    // Apply glare effect
    if (glare && glareRef.current) {
      const glareX = (percentX + 1) * 50; // 0 to 100
      const glareY = (percentY + 1) * 50; // 0 to 100

      glareRef.current.style.background = `
        radial-gradient(
          circle at ${glareX}% ${glareY}%,
          ${glareColor} 0%,
          transparent 50%
        )
      `;
      glareRef.current.style.opacity = glareOpacity;
    }

    // Apply dynamic shadow
    if (shadow) {
      const shadowX = percentX * shadowIntensity;
      const shadowY = percentY * shadowIntensity;
      const shadowBlur = shadowIntensity * 1.5;

      cardRef.current.style.boxShadow = `
        ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.3),
        0 10px 40px rgba(0, 0, 0, 0.2)
      `;
    }

    // Callback
    if (onTilt) {
      onTilt(tiltX, tiltY);
    }
  }, [perspective, scale, glare, glareRef, glareColor, glareOpacity, shadow, shadowIntensity, onTilt]);

  // ========================================================================
  // RESET TILT
  // ========================================================================

  const resetTilt = useCallback(() => {
    if (!cardRef.current) return;

    cardRef.current.style.transition = `all ${resetSpeed}ms ${easing}`;
    cardRef.current.style.transform = `
      perspective(${perspective}px)
      rotateX(0deg)
      rotateY(0deg)
      scale3d(1, 1, 1)
    `;
    cardRef.current.style.boxShadow = shadow
      ? '0 5px 15px rgba(0, 0, 0, 0.2)'
      : 'none';

    if (glare && glareRef.current) {
      glareRef.current.style.opacity = 0;
    }

    // Restore transition for smooth tilt
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = `all ${speed}ms ${easing}`;
      }
    }, resetSpeed);
  }, [perspective, speed, resetSpeed, easing, shadow, glare]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleMouseMove = useCallback((e) => {
    if (isMobile && !enableOnMobile) return;

    const { tiltX, tiltY, percentX, percentY } = calculateTilt(e);
    applyTilt(tiltX, tiltY, percentX, percentY);
  }, [isMobile, enableOnMobile, calculateTilt, applyTilt]);

  const handleMouseEnter = useCallback((e) => {
    if (isMobile && !enableOnMobile) return;

    setIsHovering(true);
    playHover?.();

    if (cardRef.current) {
      cardRef.current.style.transition = `all ${speed}ms ${easing}`;
    }

    if (onHoverStart) {
      onHoverStart(e);
    }
  }, [isMobile, enableOnMobile, speed, easing, playHover, onHoverStart]);

  const handleMouseLeave = useCallback((e) => {
    if (isMobile && !enableOnMobile) return;

    setIsHovering(false);

    if (reset) {
      resetTilt();
    }

    if (onHoverEnd) {
      onHoverEnd(e);
    }
  }, [isMobile, enableOnMobile, reset, resetTilt, onHoverEnd]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <div
        ref={cardRef}
        className={`card-3d-tilt ${className} ${isHovering ? 'tilting' : ''}`}
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: `all ${speed}ms ${easing}`,
          willChange: 'transform',
          ...style
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-cursor="hover"
      >
        {/* Card Content */}
        <div
          className="card-3d-content"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d'
          }}
        >
          {children}
        </div>

        {/* Glare Effect Layer */}
        {glare && (
          <div
            ref={glareRef}
            className="card-3d-glare"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0,
              transition: `opacity ${speed}ms ease`,
              mixBlendMode: 'overlay',
              zIndex: 1
            }}
            aria-hidden="true"
          />
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
            <div>Hovering: {isHovering ? 'Yes' : 'No'}</div>
            <div>Tilt: {tiltAngle}°</div>
            <div>Perspective: {perspective}px</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .card-3d-tilt {
            transform: none !important;
            transition: none !important;
          }

          .card-3d-glare {
            display: none !important;
          }
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .card-3d-tilt {
            transform: none !important;
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
 * Subtle Tilt - Minimal 3D effect
 */
export function SubtleTilt({ children, ...props }) {
  return (
    <Card3DTilt
      tiltAngle={8}
      scale={1.02}
      glareOpacity={0.1}
      {...props}
    >
      {children}
    </Card3DTilt>
  );
}

/**
 * Extreme Tilt - Maximum 3D effect
 */
export function ExtremeTilt({ children, ...props }) {
  return (
    <Card3DTilt
      tiltAngle={25}
      scale={1.1}
      glareOpacity={0.3}
      shadowIntensity={40}
      {...props}
    >
      {children}
    </Card3DTilt>
  );
}

/**
 * Gaming Card Tilt - Electric glow
 */
export function GamingTilt({ children, ...props }) {
  return (
    <Card3DTilt
      tiltAngle={15}
      scale={1.08}
      glareColor="rgba(0, 191, 255, 0.6)"
      glareOpacity={0.25}
      speed={350}
      {...props}
    >
      {children}
    </Card3DTilt>
  );
}

/**
 * Lorebound Card Tilt - Mystical glow
 */
export function LoreboundTilt({ children, ...props }) {
  return (
    <Card3DTilt
      tiltAngle={12}
      scale={1.05}
      glareColor="rgba(106, 13, 173, 0.6)"
      glareOpacity={0.2}
      speed={500}
      easing="cubic-bezier(0.23, 1, 0.32, 1)"
      {...props}
    >
      {children}
    </Card3DTilt>
  );
}

/**
 * Productive Card Tilt - Clean effect
 */
export function ProductiveTilt({ children, ...props }) {
  return (
    <Card3DTilt
      tiltAngle={10}
      scale={1.04}
      glareColor="rgba(80, 200, 120, 0.5)"
      glareOpacity={0.15}
      speed={400}
      {...props}
    >
      {children}
    </Card3DTilt>
  );
}

/**
 * News Card Tilt - Dynamic effect
 */
export function NewsTilt({ children, ...props }) {
  return (
    <Card3DTilt
      tiltAngle={18}
      scale={1.06}
      glareColor="rgba(224, 17, 95, 0.6)"
      glareOpacity={0.25}
      speed={300}
      {...props}
    >
      {children}
    </Card3DTilt>
  );
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Basic Usage:
 * 
 * <Card3DTilt>
 *   <GlassCard>
 *     <h3>Tiltable Card</h3>
 *     <p>Move your mouse over me!</p>
 *   </GlassCard>
 * </Card3DTilt>
 * 
 * With Custom Settings:
 * 
 * <Card3DTilt
 *   tiltAngle={20}
 *   scale={1.1}
 *   glare={true}
 *   shadow={true}
 * >
 *   <YourContent />
 * </Card3DTilt>
 */