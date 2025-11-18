// ============================================================================
// BREADCRUMBS COMPONENT
// Minimal navigation path indicator for subpages
// Location: /src/components/pathways/Breadcrumbs.jsx
// ============================================================================

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PATHWAY_LAYOUT_CONFIG } from '@/config/pathwayLayout.config';

/**
 * Breadcrumbs Component
 * Shows navigation path in minimal, elegant style
 * - Top-right on desktop, top-left on mobile
 * - Only shows on subpages (not main pathway pages)
 * - Clickable links to navigate back
 * 
 * @component
 * @example
 * <Breadcrumbs 
 *   items={['Home', 'Pathways', 'Gaming', 'Tournaments']}
 *   minimal={true}
 * />
 */
const Breadcrumbs = ({
  items = null, // Auto-generate if not provided
  separator = '›',
  showHome = true,
  minimal = true,
  className = ''
}) => {
  // ==========================================================================
  // HOOKS
  // ==========================================================================
  const pathname = usePathname();

  // ==========================================================================
  // AUTO-GENERATE BREADCRUMB ITEMS FROM PATHNAME
  // ==========================================================================
  const breadcrumbItems = useMemo(() => {
    if (items) return items;

    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Build breadcrumb array
    const crumbs = [];
    
    // Always start with home if enabled
    if (showHome) {
      crumbs.push({
        label: 'Home',
        href: '/',
        icon: '🏠'
      });
    }

    // Build path progressively
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format label (capitalize, replace hyphens)
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Add icons for known segments
      let icon = null;
      if (segment === 'pathways') {
        icon = '🛤️';
        label = 'Pathways';
      } else if (segment === 'gaming') {
        icon = '🎮';
        label = 'Gaming Realm';
      } else if (segment === 'lorebound') {
        icon = '📚';
        label = 'Lorebound Sanctum';
      } else if (segment === 'productive') {
        icon = '⚡';
        label = 'Productive Nexus';
      } else if (segment === 'news') {
        icon = '📰';
        label = 'News Nexus';
      } else if (segment === 'tournaments') {
        icon = '🏆';
      } else if (segment === 'leaderboards') {
        icon = '📊';
      } else if (segment === 'library') {
        icon = '📖';
      } else if (segment === 'resources') {
        icon = '🔧';
      } else if (segment === 'challenges') {
        icon = '🎯';
      }

      crumbs.push({
        label,
        href: currentPath,
        icon,
        isLast: index === segments.length - 1
      });
    });

    return crumbs;
  }, [items, pathname, showHome]);

  // ==========================================================================
  // CHECK IF SHOULD DISPLAY
  // ==========================================================================
  
  // Don't show on homepage
  if (pathname === '/') return null;

  // Don't show on main pathway pages (only subpages)
  const isMainPathwayPage = pathname.match(/^\/pathways\/(gaming|lorebound|productive|news)$/);
  if (isMainPathwayPage && !PATHWAY_LAYOUT_CONFIG.breadcrumbs.showOnMainPages) {
    return null;
  }

  // Don't show if disabled in config
  if (!PATHWAY_LAYOUT_CONFIG.breadcrumbs.enabled) {
    return null;
  }

  // Must have at least 2 items
  if (breadcrumbItems.length < 2) return null;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <nav 
      className={`breadcrumbs-container ${minimal ? 'minimal' : ''} ${className}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="breadcrumbs-list" role="list">
        {breadcrumbItems.map((crumb, index) => (
          <li 
            key={crumb.href || index}
            className="breadcrumb-item"
            role="listitem"
          >
            {crumb.isLast ? (
              // Last item - not clickable
              <span 
                className="breadcrumb-current"
                aria-current="page"
              >
                {crumb.icon && (
                  <span className="breadcrumb-icon" aria-hidden="true">
                    {crumb.icon}
                  </span>
                )}
                <span className="breadcrumb-label">{crumb.label}</span>
              </span>
            ) : (
              // Clickable link
              <>
                <Link 
                  href={crumb.href}
                  className="breadcrumb-link"
                >
                  {crumb.icon && (
                    <span className="breadcrumb-icon" aria-hidden="true">
                      {crumb.icon}
                    </span>
                  )}
                  <span className="breadcrumb-label">{crumb.label}</span>
                </Link>
                
                {/* Separator */}
                <span 
                  className="breadcrumb-separator" 
                  aria-hidden="true"
                >
                  {separator}
                </span>
              </>
            )}
          </li>
        ))}
      </ol>

      {/* ====================================================================
          COMPONENT STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           BREADCRUMBS CONTAINER
           ================================================================ */
        
        .breadcrumbs-container {
          position: fixed;
          top: calc(var(--navbar-height, 80px) + 1rem);
          right: 2rem;
          z-index: 100;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem 1.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .breadcrumbs-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        /* Minimal Style */
        .breadcrumbs-container.minimal {
          background: rgba(10, 10, 15, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        /* ================================================================
           BREADCRUMBS LIST
           ================================================================ */
        
        .breadcrumbs-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
          font-family: var(--font-josefin);
          font-size: 0.875rem;
          line-height: 1;
        }

        /* ================================================================
           BREADCRUMB ITEMS
           ================================================================ */
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* ================================================================
           BREADCRUMB LINKS
           ================================================================ */
        
        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }

        .breadcrumb-link:hover {
          color: var(--cns-gold);
          transform: translateX(-2px);
        }

        .breadcrumb-link:focus {
          outline: 2px solid var(--cns-gold);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* ================================================================
           CURRENT PAGE (LAST ITEM)
           ================================================================ */
        
        .breadcrumb-current {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--cns-gold);
          font-weight: 600;
          white-space: nowrap;
        }

        /* ================================================================
           ICONS
           ================================================================ */
        
        .breadcrumb-icon {
          font-size: 0.875rem;
          line-height: 1;
          display: inline-block;
        }

        /* ================================================================
           SEPARATOR
           ================================================================ */
        
        .breadcrumb-separator {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.875rem;
          user-select: none;
        }

        /* ================================================================
           RESPONSIVE DESIGN
           ================================================================ */
        
        @media (max-width: 1024px) {
          .breadcrumbs-container {
            right: 1.5rem;
            padding: 0.625rem 1rem;
          }

          .breadcrumbs-list {
            font-size: 0.8125rem;
            gap: 0.4rem;
          }
        }

        @media (max-width: 768px) {
          /* Move to top-left on mobile as per config */
          .breadcrumbs-container {
            top: calc(var(--navbar-height, 60px) + 0.75rem);
            right: auto;
            left: 1rem;
            padding: 0.5rem 0.875rem;
          }

          .breadcrumbs-list {
            font-size: 0.75rem;
            gap: 0.35rem;
          }

          .breadcrumb-icon {
            font-size: 0.75rem;
          }

          /* Hide middle items on very small screens, keep first and last */
          .breadcrumb-item:not(:first-child):not(:last-child) {
            display: none;
          }

          /* Add ellipsis between first and last */
          .breadcrumb-item:first-child::after {
            content: '...';
            color: rgba(255, 255, 255, 0.4);
            margin-left: 0.5rem;
          }

          .breadcrumb-item:last-child {
            margin-left: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .breadcrumbs-container {
            left: 0.75rem;
            padding: 0.4rem 0.75rem;
          }

          .breadcrumbs-list {
            font-size: 0.7rem;
          }

          /* Hide labels on very small screens, keep only icons */
          .breadcrumb-label {
            display: none;
          }

          .breadcrumb-item:first-child::after {
            content: '›';
            margin-left: 0.25rem;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .breadcrumbs-container,
          .breadcrumb-link {
            transition: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .breadcrumbs-container {
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid rgba(255, 255, 255, 0.5);
          }

          .breadcrumb-link {
            color: rgba(255, 255, 255, 0.9);
          }

          .breadcrumb-current {
            color: #FFD700;
          }
        }

        /* ================================================================
           PRINT STYLES
           ================================================================ */
        
        @media print {
          .breadcrumbs-container {
            position: static;
            background: none;
            border: none;
            box-shadow: none;
            padding: 0;
          }

          .breadcrumbs-list {
            color: black;
          }

          .breadcrumb-link {
            color: black;
          }

          .breadcrumb-icon {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Breadcrumbs;