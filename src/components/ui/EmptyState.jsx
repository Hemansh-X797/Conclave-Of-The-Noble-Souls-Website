// ============================================================================
// EMPTY STATE COMPONENT
// Reusable empty state for when no data exists
// Location: /src/components/ui/EmptyState.jsx
// ============================================================================

'use client';

import { NobleButton } from '@/components/ui/LuxuryButton';

/**
 * EmptyState Component
 * Beautiful empty states for various scenarios
 * - No tournaments, no books, no content, etc.
 * - Consistent luxury design
 * - Optional action button
 * - Icon support
 * 
 * @component
 * @example
 * <EmptyState
 *   icon="🏆"
 *   title="No Active Tournaments"
 *   message="Check back soon for upcoming tournaments!"
 *   action={{ label: "Join Discord", onClick: handleClick }}
 * />
 */
const EmptyState = ({
  icon = '📭',
  title = 'No Content Available',
  message = 'There is no content to display at this time.',
  action = null, // { label: string, onClick: function, href: string }
  variant = 'default', // 'default' | 'gaming' | 'lorebound' | 'productive' | 'news'
  size = 'medium', // 'small' | 'medium' | 'large'
  className = ''
}) => {
  // ==========================================================================
  // VARIANT COLORS
  // ==========================================================================
  const variantColors = {
    default: 'var(--cns-gold)',
    gaming: 'var(--gaming-cyan)',
    lorebound: 'var(--lorebound-purple)',
    productive: 'var(--productive-emerald)',
    news: 'var(--news-red)'
  };

  const iconColor = variantColors[variant] || variantColors.default;

  // ==========================================================================
  // SIZE CLASSES
  // ==========================================================================
  const sizeClasses = {
    small: 'empty-state-small',
    medium: 'empty-state-medium',
    large: 'empty-state-large'
  };

  // ==========================================================================
  // RENDER ACTION BUTTON
  // ==========================================================================
  const renderAction = () => {
    if (!action) {
return null;
}

    if (action.href) {
      return (
        <a 
          href={action.href}
          className={`empty-state-action ${variant}`}
        >
          {action.label}
        </a>
      );
    }

    return (
      <NobleButton
        onClick={action.onClick}
        size={size === 'large' ? 'large' : 'medium'}
        className={`empty-state-action ${variant}`}
      >
        {action.label}
      </NobleButton>
    );
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div 
      className={`empty-state ${sizeClasses[size]} ${variant}-variant ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="empty-state-content">
        {/* Icon */}
        <div 
          className="empty-state-icon"
          style={{ color: iconColor }}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Title */}
        <h3 className="empty-state-title">{title}</h3>

        {/* Message */}
        <p className="empty-state-message">{message}</p>

        {/* Action Button */}
        {action && (
          <div className="empty-state-action-wrapper">
            {renderAction()}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="empty-state-decoration" aria-hidden="true">
        <div className="decoration-circle circle-1" />
        <div className="decoration-circle circle-2" />
        <div className="decoration-circle circle-3" />
      </div>

      {/* ====================================================================
          COMPONENT STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           EMPTY STATE CONTAINER
           ================================================================ */
        
        .empty-state {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          overflow: hidden;
        }

        /* Size Variants */
        .empty-state-small {
          padding: 2rem 1.5rem;
          min-height: 200px;
        }

        .empty-state-medium {
          padding: 4rem 2rem;
          min-height: 300px;
        }

        .empty-state-large {
          padding: 6rem 3rem;
          min-height: 400px;
        }

        /* ================================================================
           CONTENT
           ================================================================ */
        
        .empty-state-content {
          position: relative;
          z-index: 2;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        /* ================================================================
           ICON
           ================================================================ */
        
        .empty-state-icon {
          font-size: 5rem;
          line-height: 1;
          opacity: 0.8;
          animation: floatIcon 3s ease-in-out infinite;
        }

        .empty-state-small .empty-state-icon {
          font-size: 3rem;
        }

        .empty-state-large .empty-state-icon {
          font-size: 6rem;
        }

        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* ================================================================
           TITLE
           ================================================================ */
        
        .empty-state-title {
          font-family: var(--font-josefin);
          font-size: 1.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          line-height: 1.3;
        }

        .empty-state-small .empty-state-title {
          font-size: 1.25rem;
        }

        .empty-state-large .empty-state-title {
          font-size: 2.25rem;
        }

        /* ================================================================
           MESSAGE
           ================================================================ */
        
        .empty-state-message {
          font-family: var(--font-josefin);
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          line-height: 1.6;
          max-width: 400px;
        }

        .empty-state-small .empty-state-message {
          font-size: 0.875rem;
        }

        .empty-state-large .empty-state-message {
          font-size: 1.125rem;
        }

        /* ================================================================
           ACTION WRAPPER
           ================================================================ */
        
        .empty-state-action-wrapper {
          margin-top: 1rem;
        }

        /* ================================================================
           DECORATIVE CIRCLES
           ================================================================ */
        
        .empty-state-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, var(--cns-gold) 0%, transparent 70%);
          opacity: 0.05;
          animation: pulseCircle 4s ease-in-out infinite;
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          top: -150px;
          left: -150px;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 200px;
          height: 200px;
          bottom: -100px;
          right: -100px;
          animation-delay: 1.5s;
        }

        .circle-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          right: -75px;
          animation-delay: 3s;
        }

        @keyframes pulseCircle {
          0%, 100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.08;
          }
        }

        /* ================================================================
           VARIANT-SPECIFIC STYLING
           ================================================================ */
        
        .gaming-variant {
          border-color: rgba(0, 191, 255, 0.2);
        }

        .gaming-variant .decoration-circle {
          background: radial-gradient(circle, var(--gaming-cyan) 0%, transparent 70%);
        }

        .lorebound-variant {
          border-color: rgba(255, 20, 147, 0.2);
        }

        .lorebound-variant .decoration-circle {
          background: radial-gradient(circle, var(--lorebound-purple) 0%, transparent 70%);
        }

        .productive-variant {
          border-color: rgba(80, 200, 120, 0.2);
        }

        .productive-variant .decoration-circle {
          background: radial-gradient(circle, var(--productive-emerald) 0%, transparent 70%);
        }

        .news-variant {
          border-color: rgba(224, 17, 95, 0.2);
        }

        .news-variant .decoration-circle {
          background: radial-gradient(circle, var(--news-red) 0%, transparent 70%);
        }

        /* ================================================================
           RESPONSIVE DESIGN
           ================================================================ */
        
        @media (max-width: 768px) {
          .empty-state {
            padding: 3rem 1.5rem;
          }

          .empty-state-large {
            padding: 4rem 2rem;
            min-height: 300px;
          }

          .empty-state-content {
            gap: 1.25rem;
          }

          .empty-state-icon {
            font-size: 4rem;
          }

          .empty-state-title {
            font-size: 1.5rem;
          }

          .empty-state-message {
            font-size: 0.9375rem;
          }
        }

        @media (max-width: 480px) {
          .empty-state {
            padding: 2rem 1rem;
          }

          .empty-state-icon {
            font-size: 3rem;
          }

          .empty-state-title {
            font-size: 1.25rem;
          }

          .empty-state-message {
            font-size: 0.875rem;
          }

          .decoration-circle {
            display: none;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .empty-state-icon,
          .decoration-circle {
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .empty-state {
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid rgba(255, 255, 255, 0.5);
          }

          .empty-state-title,
          .empty-state-message {
            color: white;
          }
        }

        /* ================================================================
           PRINT STYLES
           ================================================================ */
        
        @media print {
          .empty-state {
            background: none;
            border: 1px solid black;
          }

          .empty-state-icon {
            color: black !important;
          }

          .decoration-circle {
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

export default EmptyState;