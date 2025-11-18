// ============================================================================
// PATHWAY BACKGROUND COMPONENT
// Very subtle ambient effects for pathway theming
// Location: /src/components/pathways/PathwayBackground.jsx
// ============================================================================

'use client';

import { useEffect, useRef, useMemo } from 'react';
import { PATHWAY_LAYOUT_CONFIG } from '@/config/pathwayLayout.config';

/**
 * PathwayBackground Component
 * Provides subtle pathway-themed background effects
 * - Very subtle color tint (5% opacity maximum)
 * - Ambient glow at edges
 * - NO particles (video backgrounds are primary)
 * - Designed to work WITH hero videos, not compete
 * 
 * @component
 * @example
 * <PathwayBackground 
 *   pathway="gaming" 
 *   intensity="very-subtle"
 * />
 */
const PathwayBackground = ({
  pathway = 'default',
  intensity = 'very-subtle',
  ambientGlow = true,
  className = ''
}) => {
  // ==========================================================================
  // REFS
  // ==========================================================================
  const backgroundRef = useRef(null);
  const glowRef = useRef(null);

  // ==========================================================================
  // PATHWAY COLORS & GRADIENTS
  // ==========================================================================
  const pathwayTheme = useMemo(() => {
    const themes = {
      gaming: {
        color: 'rgba(0, 191, 255, 0.05)', // Cyan, 5% opacity
        glowColor: 'rgba(0, 191, 255, 0.15)',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.08) 0%, transparent 70%)'
      },
      lorebound: {
        color: 'rgba(255, 20, 147, 0.05)', // Deep Pink/Purple, 5% opacity
        glowColor: 'rgba(255, 20, 147, 0.15)',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(255, 20, 147, 0.08) 0%, transparent 70%)'
      },
      productive: {
        color: 'rgba(80, 200, 120, 0.05)', // Emerald, 5% opacity
        glowColor: 'rgba(80, 200, 120, 0.15)',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(80, 200, 120, 0.08) 0%, transparent 70%)'
      },
      news: {
        color: 'rgba(224, 17, 95, 0.05)', // Red, 5% opacity
        glowColor: 'rgba(224, 17, 95, 0.15)',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(224, 17, 95, 0.08) 0%, transparent 70%)'
      },
      default: {
        color: 'rgba(255, 215, 0, 0.03)', // Gold, 3% opacity
        glowColor: 'rgba(255, 215, 0, 0.1)',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 70%)'
      }
    };

    return themes[pathway] || themes.default;
  }, [pathway]);

  // ==========================================================================
  // INTENSITY MULTIPLIER
  // ==========================================================================
  const intensityMultiplier = useMemo(() => {
    const multipliers = {
      'very-subtle': 1.0,    // Use config opacity as-is (5%)
      'subtle': 1.5,          // 7.5%
      'moderate': 2.0,        // 10%
      'intense': 3.0          // 15%
    };
    return multipliers[intensity] || 1.0;
  }, [intensity]);

  // ==========================================================================
  // SMOOTH TRANSITION ON PATHWAY CHANGE
  // ==========================================================================
  useEffect(() => {
    if (!backgroundRef.current) return;

    // Smooth fade transition when pathway changes
    backgroundRef.current.style.opacity = '0';
    
    const timer = setTimeout(() => {
      if (backgroundRef.current) {
        backgroundRef.current.style.opacity = '1';
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathway]);

  // ==========================================================================
  // CHECK CONFIG
  // ==========================================================================
  if (!PATHWAY_LAYOUT_CONFIG.backgroundEffects.enabled) {
    return null;
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div 
      className={`pathway-background ${pathway}-background ${className}`}
      ref={backgroundRef}
      aria-hidden="true"
    >
      {/* Main Color Tint Layer */}
      <div 
        className="pathway-tint"
        style={{
          background: pathwayTheme.color,
          opacity: intensityMultiplier
        }}
      />

      {/* Ambient Glow at Edges */}
      {ambientGlow && PATHWAY_LAYOUT_CONFIG.backgroundEffects.ambientGlow.enabled && (
        <>
          {/* Top-Left Glow */}
          <div
            ref={glowRef}
            className="pathway-glow glow-top-left"
            style={{
              background: pathwayTheme.gradient
            }}
          />

          {/* Top-Right Glow */}
          <div
            className="pathway-glow glow-top-right"
            style={{
              background: pathwayTheme.gradient
            }}
          />

          {/* Bottom-Left Glow */}
          <div
            className="pathway-glow glow-bottom-left"
            style={{
              background: pathwayTheme.gradient
            }}
          />

          {/* Bottom-Right Glow */}
          <div
            className="pathway-glow glow-bottom-right"
            style={{
              background: pathwayTheme.gradient
            }}
          />

          {/* Center Subtle Gradient */}
          <div
            className="pathway-glow glow-center"
            style={{
              background: `radial-gradient(ellipse at center, ${pathwayTheme.glowColor} 0%, transparent 60%)`
            }}
          />
        </>
      )}

      {/* Subtle Vignette */}
      <div className="pathway-vignette" />

      {/* ====================================================================
          COMPONENT STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           PATHWAY BACKGROUND CONTAINER
           ================================================================ */
        
        .pathway-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          pointer-events: none;
          transition: opacity 0.8s ease;
        }

        /* ================================================================
           COLOR TINT LAYER
           ================================================================ */
        
        .pathway-tint {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: background 1.2s ease, opacity 1.2s ease;
        }

        /* ================================================================
           AMBIENT GLOW EFFECTS
           ================================================================ */
        
        .pathway-glow {
          position: absolute;
          pointer-events: none;
          filter: blur(80px);
          transition: background 1.5s ease;
          opacity: 0.6;
        }

        /* Corner Glows */
        .glow-top-left {
          top: -200px;
          left: -200px;
          width: 600px;
          height: 600px;
        }

        .glow-top-right {
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
        }

        .glow-bottom-left {
          bottom: -200px;
          left: -200px;
          width: 600px;
          height: 600px;
        }

        .glow-bottom-right {
          bottom: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
        }

        /* Center Glow */
        .glow-center {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 1200px;
          height: 800px;
          opacity: 0.3;
        }

        /* ================================================================
           SUBTLE VIGNETTE
           ================================================================ */
        
        .pathway-vignette {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.1) 80%,
            rgba(0, 0, 0, 0.2) 100%
          );
          pointer-events: none;
        }

        /* ================================================================
           PATHWAY-SPECIFIC ADJUSTMENTS
           ================================================================ */
        
        /* Gaming - Cooler tones */
        .gaming-background .pathway-glow {
          filter: blur(100px);
        }

        /* Lorebound - Mystical feel */
        .lorebound-background .pathway-glow {
          filter: blur(120px);
          opacity: 0.5;
        }

        /* Productive - Sharper, focused */
        .productive-background .pathway-glow {
          filter: blur(60px);
          opacity: 0.7;
        }

        /* News - Dynamic feel */
        .news-background .pathway-glow {
          filter: blur(80px);
          opacity: 0.65;
        }

        /* ================================================================
           RESPONSIVE ADJUSTMENTS
           ================================================================ */
        
        @media (max-width: 1024px) {
          .pathway-glow {
            filter: blur(60px);
            opacity: 0.5;
          }

          .glow-center {
            width: 800px;
            height: 600px;
          }
        }

        @media (max-width: 768px) {
          /* Even more subtle on mobile for performance */
          .pathway-tint {
            opacity: 0.7;
          }

          .pathway-glow {
            display: none; /* Hide glows on mobile, keep just tint */
          }

          .glow-center {
            display: block; /* Keep center glow */
            width: 600px;
            height: 400px;
            filter: blur(40px);
          }
        }

        @media (max-width: 480px) {
          .pathway-tint {
            opacity: 0.5; /* Even more subtle on small screens */
          }

          .glow-center {
            width: 400px;
            height: 300px;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .pathway-background,
          .pathway-tint,
          .pathway-glow {
            transition: none !important;
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .pathway-background {
            opacity: 0.3; /* Even more subtle for high contrast mode */
          }
        }

        /* ================================================================
           PRINT STYLES
           ================================================================ */
        
        @media print {
          .pathway-background {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default PathwayBackground;