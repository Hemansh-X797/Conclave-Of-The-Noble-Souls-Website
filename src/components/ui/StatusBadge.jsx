// ============================================================================
// STATUS BADGE COMPONENT
// Visual status indicators for various states
// Location: /src/components/ui/StatusBadge.jsx
// ============================================================================

'use client';

/**
 * StatusBadge Component
 * Displays status indicators with appropriate styling
 * - Tournament status (upcoming, ongoing, completed)
 * - Challenge status (active, upcoming, completed)
 * - Content status (published, draft, pending)
 * - Site status (active, down, maintenance)
 * 
 * @component
 * @example
 * <StatusBadge 
 *   status="active"
 *   variant="success"
 *   pulse={true}
 * />
 */
const StatusBadge = ({
  status = 'active',
  variant = 'default', // 'default' | 'success' | 'warning' | 'error' | 'info'
  size = 'medium', // 'small' | 'medium' | 'large'
  pulse = false,
  dot = true,
  icon = null,
  className = ''
}) => {
  // ==========================================================================
  // VARIANT COLORS
  // ==========================================================================
  const variantStyles = {
    default: {
      bg: 'rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(255, 255, 255, 0.2)',
      dotColor: '#FFFFFF'
    },
    success: {
      bg: 'rgba(80, 200, 120, 0.15)',
      color: '#50C878',
      border: 'rgba(80, 200, 120, 0.3)',
      dotColor: '#50C878'
    },
    warning: {
      bg: 'rgba(255, 165, 0, 0.15)',
      color: '#FFA500',
      border: 'rgba(255, 165, 0, 0.3)',
      dotColor: '#FFA500'
    },
    error: {
      bg: 'rgba(224, 17, 95, 0.15)',
      color: '#E0115F',
      border: 'rgba(224, 17, 95, 0.3)',
      dotColor: '#E0115F'
    },
    info: {
      bg: 'rgba(0, 191, 255, 0.15)',
      color: '#00BFFF',
      border: 'rgba(0, 191, 255, 0.3)',
      dotColor: '#00BFFF'
    }
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  // ==========================================================================
  // STATUS TEXT FORMATTING
  // ==========================================================================
  const formatStatus = (text) => {
    return text
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ==========================================================================
  // AUTO-DETECT VARIANT FROM STATUS
  // ==========================================================================
  const getVariantFromStatus = (status) => {
    const statusLower = status.toLowerCase();
    
    // Success states
    if (['active', 'ongoing', 'published', 'completed', 'success', 'live', 'online'].includes(statusLower)) {
      return 'success';
    }
    
    // Warning states
    if (['upcoming', 'pending', 'draft', 'review', 'scheduled', 'maintenance'].includes(statusLower)) {
      return 'warning';
    }
    
    // Error states
    if (['cancelled', 'failed', 'error', 'offline', 'down', 'expired'].includes(statusLower)) {
      return 'error';
    }
    
    // Info states
    if (['info', 'new', 'beta', 'test'].includes(statusLower)) {
      return 'info';
    }
    
    return 'default';
  };

  // Use auto-detected variant if not explicitly set
  const effectiveVariant = variant === 'default' ? getVariantFromStatus(status) : variant;
  const style = variantStyles[effectiveVariant];

  // ==========================================================================
  // SIZE CLASSES
  // ==========================================================================
  const sizeStyles = {
    small: {
      padding: '0.25rem 0.625rem',
      fontSize: '0.75rem',
      dotSize: '6px'
    },
    medium: {
      padding: '0.375rem 0.875rem',
      fontSize: '0.8125rem',
      dotSize: '8px'
    },
    large: {
      padding: '0.5rem 1.125rem',
      fontSize: '0.875rem',
      dotSize: '10px'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <span 
      className={`status-badge ${size}-size ${effectiveVariant}-variant ${pulse ? 'pulse-active' : ''} ${className}`}
      role="status"
      aria-label={`Status: ${formatStatus(status)}`}
    >
      {/* Status Dot */}
      {dot && (
        <span 
          className="status-dot"
          aria-hidden="true"
        />
      )}

      {/* Optional Icon */}
      {icon && (
        <span className="status-icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Status Text */}
      <span className="status-text">
        {formatStatus(status)}
      </span>

      {/* ====================================================================
          COMPONENT STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           STATUS BADGE CONTAINER
           ================================================================ */
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: ${currentSize.padding};
          background: ${style.bg};
          color: ${style.color};
          border: 1px solid ${style.border};
          border-radius: 16px;
          font-family: var(--font-josefin);
          font-size: ${currentSize.fontSize};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .status-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px ${style.border};
        }

        /* ================================================================
           STATUS DOT
           ================================================================ */
        
        .status-dot {
          width: ${currentSize.dotSize};
          height: ${currentSize.dotSize};
          border-radius: 50%;
          background: ${style.dotColor};
          box-shadow: 0 0 8px ${style.dotColor};
          flex-shrink: 0;
        }

        /* Pulse Animation */
        .pulse-active .status-dot {
          animation: pulseDot 2s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }

        /* ================================================================
           STATUS ICON
           ================================================================ */
        
        .status-icon {
          font-size: 1em;
          line-height: 1;
          display: flex;
          align-items: center;
        }

        /* ================================================================
           STATUS TEXT
           ================================================================ */
        
        .status-text {
          line-height: 1;
        }

        /* ================================================================
           SIZE VARIANTS
           ================================================================ */
        
        .small-size {
          gap: 0.375rem;
        }

        .large-size {
          gap: 0.625rem;
        }

        /* ================================================================
           VARIANT-SPECIFIC ANIMATIONS
           ================================================================ */
        
        /* Success - Gentle glow */
        .success-variant {
          box-shadow: 0 0 10px rgba(80, 200, 120, 0.1);
        }

        .success-variant:hover {
          box-shadow: 0 0 15px rgba(80, 200, 120, 0.2);
        }

        /* Warning - Subtle pulse */
        .warning-variant.pulse-active {
          animation: warningPulse 3s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255, 165, 0, 0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 165, 0, 0.3);
          }
        }

        /* Error - Urgent feel */
        .error-variant {
          box-shadow: 0 0 10px rgba(224, 17, 95, 0.15);
        }

        /* Info - Cool glow */
        .info-variant {
          box-shadow: 0 0 10px rgba(0, 191, 255, 0.1);
        }

        /* ================================================================
           RESPONSIVE DESIGN
           ================================================================ */
        
        @media (max-width: 768px) {
          .status-badge {
            padding: 0.3125rem 0.75rem;
            font-size: 0.75rem;
            gap: 0.4rem;
          }

          .status-dot {
            width: 6px;
            height: 6px;
          }
        }

        @media (max-width: 480px) {
          .status-badge {
            padding: 0.25rem 0.625rem;
            font-size: 0.6875rem;
            gap: 0.35rem;
          }

          .status-dot {
            width: 5px;
            height: 5px;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .status-badge,
          .status-dot {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .status-badge {
            border-width: 2px;
            font-weight: 700;
          }

          .success-variant {
            background: rgba(80, 200, 120, 0.3);
            color: #50C878;
          }

          .warning-variant {
            background: rgba(255, 165, 0, 0.3);
            color: #FFA500;
          }

          .error-variant {
            background: rgba(224, 17, 95, 0.3);
            color: #E0115F;
          }

          .info-variant {
            background: rgba(0, 191, 255, 0.3);
            color: #00BFFF;
          }
        }

        /* ================================================================
           PRINT STYLES
           ================================================================ */
        
        @media print {
          .status-badge {
            background: white;
            color: black;
            border: 1px solid black;
          }

          .status-dot {
            background: black;
            box-shadow: none;
          }
        }

        /* ================================================================
           DARK MODE ADJUSTMENTS
           ================================================================ */
        
        [data-theme="light"] .status-badge {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }

        [data-theme="light"] .success-variant {
          color: #2E8B57;
        }

        [data-theme="light"] .warning-variant {
          color: #FF8C00;
        }

        [data-theme="light"] .error-variant {
          color: #DC143C;
        }

        [data-theme="light"] .info-variant {
          color: #1E90FF;
        }
      `}</style>
    </span>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default StatusBadge;