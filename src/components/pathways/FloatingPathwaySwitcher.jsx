// ============================================================================
// FLOATING PATHWAY SWITCHER COMPONENT
// Quick pathway navigation - Desktop floating, Mobile bottom bar
// Location: /src/components/pathways/FloatingPathwaySwitcher.jsx
// ============================================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAllPathways } from '@/data/pathways';
import { PATHWAY_LAYOUT_CONFIG } from '@/config/pathwayLayout.config';

/**
 * FloatingPathwaySwitcher Component
 * Quick pathway navigation
 * - Desktop: Floating button bottom-right, expands to menu
 * - Mobile: Bottom navigation bar with pathway icons
 * - Always visible except on /pathways overview
 * 
 * @component
 * @example
 * <FloatingPathwaySwitcher 
 *   current="gaming"
 *   isMobile={false}
 * />
 */
const FloatingPathwaySwitcher = ({
  current = null,
  isMobile = false,
  onPathwayChange,
  className = ''
}) => {
  // ==========================================================================
  // STATE
  // ==========================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [pathways, setPathways] = useState([]);

  // ==========================================================================
  // HOOKS
  // ==========================================================================
  const router = useRouter();
  const pathname = usePathname();

  // ==========================================================================
  // LOAD PATHWAYS
  // ==========================================================================
  useEffect(() => {
    const allPathways = getAllPathways();
    setPathways(allPathways);
  }, []);

  // ==========================================================================
  // CHECK IF SHOULD DISPLAY
  // ==========================================================================
  
  // Don't show on pathways overview page
  if (PATHWAY_LAYOUT_CONFIG.pathwaySwitcher.hideOn.includes(pathname)) {
    return null;
  }

  // Don't show if disabled
  if (!PATHWAY_LAYOUT_CONFIG.pathwaySwitcher.enabled) {
    return null;
  }

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handlePathwayClick = useCallback((pathwayId) => {
    if (onPathwayChange) {
      onPathwayChange(pathwayId);
    }
    setIsOpen(false);
    router.push(`/pathways/${pathwayId}`);
  }, [onPathwayChange, router]);

  const handleAllPathways = useCallback(() => {
    setIsOpen(false);
    router.push('/pathways');
  }, [router]);

  // ==========================================================================
  // CLOSE ON ROUTE CHANGE
  // ==========================================================================
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ==========================================================================
  // CLOSE ON ESCAPE KEY
  // ==========================================================================
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // ==========================================================================
  // MOBILE BOTTOM BAR RENDER
  // ==========================================================================
  if (isMobile) {
    return (
      <nav 
        className={`pathway-mobile-nav ${className}`}
        aria-label="Pathway quick navigation"
      >
        <div className="mobile-nav-container">
          {pathways.map((pathway) => (
            <Link
              key={pathway.id}
              href={`/pathways/${pathway.id}`}
              className={`mobile-nav-item ${pathway.id} ${current === pathway.id ? 'active' : ''}`}
              onClick={() => onPathwayChange && onPathwayChange(pathway.id)}
              aria-label={`Go to ${pathway.name}`}
              aria-current={current === pathway.id ? 'page' : undefined}
            >
              <span className="mobile-nav-icon" style={{ color: pathway.color }}>
                {pathway.icon}
              </span>
              <span className="mobile-nav-label">{pathway.name.split(' ')[0]}</span>
              {current === pathway.id && (
                <span className="mobile-nav-indicator" aria-hidden="true" />
              )}
            </Link>
          ))}

          {/* All Pathways Button */}
          <button
            onClick={handleAllPathways}
            className="mobile-nav-item all-pathways"
            aria-label="View all pathways"
          >
            <span className="mobile-nav-icon">🛤️</span>
            <span className="mobile-nav-label">All</span>
          </button>
        </div>

        {/* ================================================================
            MOBILE NAV STYLES
            ================================================================ */}
        <style jsx>{`
          .pathway-mobile-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(10, 10, 15, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
            padding-bottom: env(safe-area-inset-bottom, 0);
          }

          .mobile-nav-container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0.75rem 0.5rem;
            max-width: 600px;
            margin: 0 auto;
          }

          .mobile-nav-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.6);
            transition: transform 0.2s ease, color 0.2s ease;
            cursor: pointer;
            background: none;
            border: none;
            font-family: var(--font-josefin);
            min-width: 60px;
          }

          .mobile-nav-item:active {
            transform: scale(0.95);
          }

          .mobile-nav-item.active {
            color: rgba(255, 255, 255, 0.95);
          }

          .mobile-nav-icon {
            font-size: 1.5rem;
            line-height: 1;
            transition: transform 0.3s ease, filter 0.3s ease;
          }

          .mobile-nav-item.active .mobile-nav-icon {
            transform: scale(1.15);
            filter: drop-shadow(0 0 8px currentColor);
          }

          .mobile-nav-label {
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .mobile-nav-indicator {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background: var(--cns-gold);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--cns-gold);
          }

          /* All Pathways Button */
          .all-pathways {
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            padding-left: 1rem;
          }

          @media (min-width: 769px) {
            .pathway-mobile-nav {
              display: none;
            }
          }
        `}</style>
      </nav>
    );
  }

  // ==========================================================================
  // DESKTOP FLOATING BUTTON RENDER
  // ==========================================================================
  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="pathway-switcher-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Button */}
      <div className={`pathway-switcher-desktop ${className}`}>
        <button
          className={`switcher-toggle ${isOpen ? 'open' : ''}`}
          onClick={handleToggle}
          aria-label="Switch pathway"
          aria-expanded={isOpen}
        >
          <span className="toggle-icon" aria-hidden="true">
            {isOpen ? '✕' : '🛤️'}
          </span>
        </button>

        {/* Expanded Menu */}
        {isOpen && (
          <div className="switcher-menu" role="menu">
            <div className="menu-header">
              <h3 className="menu-title">Switch Pathway</h3>
            </div>

            <div className="menu-items">
              {pathways.map((pathway) => (
                <button
                  key={pathway.id}
                  className={`menu-item ${pathway.id} ${current === pathway.id ? 'current' : ''}`}
                  onClick={() => handlePathwayClick(pathway.id)}
                  role="menuitem"
                  aria-current={current === pathway.id ? 'page' : undefined}
                >
                  <span 
                    className="menu-item-icon" 
                    style={{ color: pathway.color }}
                    aria-hidden="true"
                  >
                    {pathway.icon}
                  </span>
                  <div className="menu-item-text">
                    <span className="menu-item-name">{pathway.name}</span>
                    <span className="menu-item-subtitle">{pathway.tagline}</span>
                  </div>
                  {current === pathway.id && (
                    <span className="menu-item-badge" aria-label="Currently viewing">
                      Current
                    </span>
                  )}
                </button>
              ))}

              {/* Separator */}
              <div className="menu-separator" />

              {/* All Pathways Link */}
              <button
                className="menu-item all-pathways-btn"
                onClick={handleAllPathways}
                role="menuitem"
              >
                <span className="menu-item-icon" aria-hidden="true">🗺️</span>
                <div className="menu-item-text">
                  <span className="menu-item-name">All Pathways</span>
                  <span className="menu-item-subtitle">View overview</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          DESKTOP STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           BACKDROP
           ================================================================ */
        
        .pathway-switcher-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ================================================================
           FLOATING CONTAINER
           ================================================================ */
        
        .pathway-switcher-desktop {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        /* ================================================================
           TOGGLE BUTTON
           ================================================================ */
        
        .switcher-toggle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cns-gold), #FFA500);
          border: none;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .switcher-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(212, 175, 55, 0.6);
        }

        .switcher-toggle:active {
          transform: scale(1.05);
        }

        .switcher-toggle.open {
          background: linear-gradient(135deg, #E0115F, #DC143C);
          box-shadow: 0 4px 20px rgba(224, 17, 95, 0.4);
        }

        .toggle-icon {
          font-size: 1.75rem;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        .switcher-toggle.open .toggle-icon {
          transform: rotate(90deg);
        }

        /* ================================================================
           EXPANDED MENU
           ================================================================ */
        
        .switcher-menu {
          position: absolute;
          bottom: calc(100% + 1rem);
          right: 0;
          width: 320px;
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          animation: menuSlideUp 0.3s ease;
          overflow: hidden;
        }

        @keyframes menuSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ================================================================
           MENU HEADER
           ================================================================ */
        
        .menu-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .menu-title {
          font-family: var(--font-josefin);
          font-size: 1rem;
          font-weight: 700;
          color: var(--cns-gold);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ================================================================
           MENU ITEMS
           ================================================================ */
        
        .menu-items {
          padding: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: none;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
          width: 100%;
          text-align: left;
          color: rgba(255, 255, 255, 0.9);
          position: relative;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(-4px);
        }

        .menu-item.current {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .menu-item-icon {
          font-size: 2rem;
          line-height: 1;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .menu-item:hover .menu-item-icon {
          transform: scale(1.1);
        }

        .menu-item-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .menu-item-name {
          font-family: var(--font-josefin);
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .menu-item-subtitle {
          font-family: var(--font-josefin);
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.2;
        }

        .menu-item-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.25rem 0.625rem;
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ================================================================
           SEPARATOR
           ================================================================ */
        
        .menu-separator {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.5rem 0;
        }

        /* ================================================================
           ALL PATHWAYS BUTTON
           ================================================================ */
        
        .all-pathways-btn {
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .all-pathways-btn:hover {
          background: rgba(255, 215, 0, 0.05);
          border-color: rgba(255, 215, 0, 0.4);
        }

        /* ================================================================
           SCROLLBAR
           ================================================================ */
        
        .menu-items::-webkit-scrollbar {
          width: 6px;
        }

        .menu-items::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .menu-items::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 3px;
        }

        .menu-items::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }

        /* ================================================================
           RESPONSIVE
           ================================================================ */
        
        @media (max-width: 768px) {
          .pathway-switcher-desktop {
            display: none;
          }
        }

        @media (max-width: 1024px) {
          .switcher-menu {
            width: 280px;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .switcher-toggle,
          .switcher-menu,
          .menu-item,
          .toggle-icon {
            transition: none !important;
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .switcher-menu {
            background: rgba(0, 0, 0, 0.98);
            border: 2px solid rgba(255, 255, 255, 0.5);
          }

          .menu-item {
            color: white;
          }
        }
      `}</style>
    </>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default FloatingPathwaySwitcher;