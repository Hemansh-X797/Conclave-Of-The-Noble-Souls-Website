// ============================================================================
// THE CONCLAVE REALM - HEAT-FOLLOWING BUTTON
// Location: /src/components/pathways/productive/HeatFollowButton.tsx
// ============================================================================
// Purpose: Button with circular heat effect that follows cursor
// Visual: White button with orange glow following mouse position
// ============================================================================

'use client';

import React, { useRef, useState, MouseEvent, TouchEvent } from 'react';

/**
 * @interface HeatFollowButtonProps
 * @description Props for HeatFollowButton component
 */
interface HeatFollowButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Full width */
  fullWidth?: boolean;
  /** Heat color */
  heatColor?: string;
  /** Heat intensity (0-1) */
  heatIntensity?: number;
  /** Custom className */
  className?: string;
}

/**
 * @component HeatFollowButton
 * @description Button with heat effect that follows cursor position
 * Heat is circular with diameter equal to button width
 */
export default function HeatFollowButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  heatColor = '#FF8C00', // Dark orange
  heatIntensity = 0.8,
  className = ''
}: HeatFollowButtonProps) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [heatPosition, setHeatPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to button (0-100%)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setHeatPosition({ x, y });
  };
  
  const handleTouchMove = (e: TouchEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled || e.touches.length === 0) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Calculate touch position relative to button (0-100%)
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setHeatPosition({ x, y });
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setHeatPosition({ x: 50, y: 50 }); // Reset to center
  };
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };
  
  // ============================================================================
  // STYLES
  // ============================================================================
  
  const sizeStyles = {
    small: {
      padding: '0.5rem 1.5rem',
      fontSize: '0.875rem',
      borderRadius: '8px'
    },
    medium: {
      padding: '0.75rem 2rem',
      fontSize: '1rem',
      borderRadius: '12px'
    },
    large: {
      padding: '1rem 3rem',
      fontSize: '1.25rem',
      borderRadius: '16px'
    }
  };
  
  const variantStyles = {
    primary: {
      background: 'white',
      color: '#0A0A0F',
      border: 'none'
    },
    secondary: {
      background: 'transparent',
      color: 'white',
      border: '2px solid white'
    }
  };
  
  const currentSizeStyle = sizeStyles[size];
  const currentVariantStyle = variantStyles[variant];
  
  // Convert hex to RGB for gradient
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 255, g: 140, b: 0 };
  };
  
  const rgb = hexToRgb(heatColor);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`heat-follow-button ${className}`}
      style={{
        position: 'relative',
        ...currentSizeStyle,
        ...currentVariantStyle,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-josefin)',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.3s',
        opacity: disabled ? 0.5 : 1,
        // @ts-ignore - CSS custom properties
        '--heat-x': `${heatPosition.x}%`,
        '--heat-y': `${heatPosition.y}%`,
        '--heat-r': rgb.r,
        '--heat-g': rgb.g,
        '--heat-b': rgb.b,
        '--heat-intensity': heatIntensity
      }}
    >
      {/* Heat effect layer */}
      <span
        className="heat-effect"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(
            circle at var(--heat-x) var(--heat-y),
            rgba(var(--heat-r), var(--heat-g), var(--heat-b), var(--heat-intensity)) 0%,
            rgba(var(--heat-r), var(--heat-g), var(--heat-b), ${heatIntensity * 0.5}) 20%,
            rgba(var(--heat-r), var(--heat-g), var(--heat-b), ${heatIntensity * 0.2}) 40%,
            transparent 60%
          )`,
          mixBlendMode: variant === 'primary' ? 'multiply' : 'screen'
        }}
      />
      
      {/* Button content */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {children}
      </span>
      
      {/* Styles */}
      <style jsx>{`
        .heat-follow-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(var(--heat-r), var(--heat-g), var(--heat-b), 0.4);
        }
        
        .heat-follow-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .heat-follow-button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </button>
  );
}