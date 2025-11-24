// ============================================================================
// MAGNETIC BUTTON COMPONENT
// Button follows cursor with magnetic attraction (GSAP-powered)
// Location: /src/components/effects/MagneticButton.jsx
// FREE - Uses GSAP core only
// Works with NobleCursor - adds extra magnetism
// ============================================================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppProvider';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MagneticButton({
  // Content
  children,
  
  // Button props
  onClick,
  disabled = false,
  type = 'button',
  
  // Magnetic settings
  strength = 0.3,      // 0-1, pull strength
  radius = 100,        // Magnetic field radius (px)
  speed = 0.3,         // Animation speed
  ease = 'power2.out',
  
  // Behavior
  enableOnMobile = false,
  resetOnLeave = true,
  
  // Styling
  className = '',
  style = {},
  
  // Effects
  scaleOnHover = 1.05,
  rotateOnHover = 0,   // degrees
  
  // Haptic feedback
  hapticFeedback = true,
  
  // Callbacks
  onMagnetStart = null,
  onMagnetEnd = null,
  
  // Debug
  debug = false
}) {
  const buttonRef = useRef(null);
  const [gsap, setGsap] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMagnetic, setIsMagnetic] = useState(false);
  const { playClick, playHover } = useAppContext();

  // ========================================================================
  // LOAD GSAP (LAZY)
  // ========================================================================

  useEffect(() => {
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
  // MAGNETIC EFFECT
  // ========================================================================

  useEffect(() => {
    if (!gsap || !buttonRef.current || disabled || (isMobile && !enableOnMobile)) return;

    const button = buttonRef.current;
    let rect = button.getBoundingClientRect();

    const handleMouseMove = (e) => {
      // Update rect on each move (in case of scroll/resize)
      rect = button.getBoundingClientRect();

      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate distance from button center
      const distanceX = mouseX - buttonCenterX;
      const distanceY = mouseY - buttonCenterY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      // Check if within magnetic radius
      if (distance < radius) {
        setIsMagnetic(true);

        // Calculate magnetic pull (stronger when closer)
        const magneticForce = 1 - (distance / radius);
        const pullX = distanceX * strength * magneticForce;
        const pullY = distanceY * strength * magneticForce;

        // Apply magnetic transform
        gsap.to(button, {
          x: pullX,
          y: pullY,
          scale: scaleOnHover,
          rotation: rotateOnHover,
          duration: speed,
          ease: ease
        });

        // Callback
        if (onMagnetStart && !isMagnetic) {
          onMagnetStart(pullX, pullY);
        }
      } else if (isMagnetic) {
        // Outside magnetic field - reset if enabled
        if (resetOnLeave) {
          resetButton();
        }
      }
    };

    const handleMouseLeave = () => {
      if (resetOnLeave) {
        resetButton();
      }
    };

    const resetButton = () => {
      setIsMagnetic(false);

      gsap.to(button, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: speed * 0.8,
        ease: 'power2.inOut'
      });

      if (onMagnetEnd) {
        onMagnetEnd();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gsap, disabled, isMobile, enableOnMobile, strength, radius, speed, ease, scaleOnHover, rotateOnHover, resetOnLeave, isMagnetic, onMagnetStart, onMagnetEnd]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleClick = (e) => {
    if (disabled) return;

    playClick?.();

    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovering(true);
    playHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <button
        ref={buttonRef}
        type={type}
        className={`magnetic-button ${className} ${isHovering ? 'hovering' : ''} ${isMagnetic ? 'magnetic' : ''}`}
        style={{
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.3s ease',
          opacity: disabled ? 0.5 : 1,
          willChange: 'transform',
          ...style
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        data-cursor="hover"
      >
        {children}

        {/* Magnetic Field Indicator (Debug Mode) */}
        {debug && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: radius * 2,
              height: radius * 2,
              border: '2px dashed rgba(255, 215, 0, 0.3)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: -1
            }}
            aria-hidden="true"
          />
        )}

        {/* Debug Info */}
        {debug && (
          <div
            style={{
              position: 'absolute',
              top: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 100
            }}
          >
            {isMagnetic ? '🧲 Magnetic' : '⚪ Idle'}
          </div>
        )}
      </button>

      {/* Global Styles */}
      <style jsx>{`
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .magnetic-button {
            transform: none !important;
            transition: none !important;
          }
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .magnetic-button {
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
 * Strong Magnetic - High pull strength
 */
export function StrongMagneticButton({ children, ...props }) {
  return (
    <MagneticButton
      strength={0.5}
      radius={150}
      scaleOnHover={1.1}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

/**
 * Subtle Magnetic - Gentle pull
 */
export function SubtleMagneticButton({ children, ...props }) {
  return (
    <MagneticButton
      strength={0.15}
      radius={80}
      scaleOnHover={1.02}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

/**
 * Gaming Magnetic Button
 */
export function GamingMagneticButton({ children, ...props }) {
  return (
    <MagneticButton
      strength={0.4}
      radius={120}
      scaleOnHover={1.08}
      rotateOnHover={2}
      speed={0.25}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

/**
 * Lorebound Magnetic Button
 */
export function LoreboundMagneticButton({ children, ...props }) {
  return (
    <MagneticButton
      strength={0.25}
      radius={100}
      scaleOnHover={1.05}
      speed={0.4}
      ease="power3.out"
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

/**
 * Productive Magnetic Button
 */
export function ProductiveMagneticButton({ children, ...props }) {
  return (
    <MagneticButton
      strength={0.3}
      radius={90}
      scaleOnHover={1.04}
      speed={0.35}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

/**
 * News Magnetic Button
 */
export function NewsMagneticButton({ children, ...props }) {
  return (
    <MagneticButton
      strength={0.35}
      radius={110}
      scaleOnHover={1.06}
      rotateOnHover={1}
      speed={0.2}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Basic Usage:
 * 
 * <MagneticButton onClick={() => console.log('Clicked!')}>
 *   Hover Over Me
 * </MagneticButton>
 * 
 * With Existing Button Component:
 * 
 * <MagneticButton>
 *   <LuxuryButton variant="gaming">
 *     Magnetic Gaming Button
 *   </LuxuryButton>
 * </MagneticButton>
 * 
 * Custom Settings:
 * 
 * <MagneticButton
 *   strength={0.5}
 *   radius={150}
 *   scaleOnHover={1.1}
 *   rotateOnHover={5}
 * >
 *   <button className="custom-btn">Click Me</button>
 * </MagneticButton>
 */