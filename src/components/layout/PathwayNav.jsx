import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Import styles
import '@/styles/navigation.css';
import '@/styles/design_system.css';
import '@/styles/typography.css';

/**
 * PathwayNav Component
 * Pathway-specific navigation for Gaming, Lorebound, Productive, and News realms
 * 
 * @component
 * @example
 * <PathwayNav 
 *   pathway="gaming"
 *   showBreadcrumbs
 * />
 */
const PathwayNav = ({
  // Core configuration
  pathway = 'gaming', // 'gaming' | 'lorebound' | 'productive' | 'news'
  
  // Display options
  showBreadcrumbs = true,
  showBackButton = true,
  sticky = true,
  
  // Callbacks
  onNavigate,
  onBackClick,
  
  // Custom navigation items
  customNavItems = null,
  customBreadcrumbs = null,
  
  // Additional props
  className = '',
  ...restProps
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const pathname = usePathname();
  
  // ============================================================================
  // PATHWAY CONFIGURATION
  // ============================================================================
  
  const pathwayConfig = useMemo(() => ({
    gaming: {
      name: 'Gaming Realm',
      icon: '🎮',
      color: '#00bfff',
      gradient: 'var(--gradient-gaming)',
      basePath: '/pathways/gaming',
      navItems: [
        { name: 'Overview', href: '/pathways/gaming', icon: '🏠' },
        { name: 'Tournaments', href: '/pathways/gaming/tournaments', icon: '🏆' },
        { name: 'Leaderboards', href: '/pathways/gaming/leaderboards', icon: '📊' },
        { name: 'Bot Help', href: '/pathways/gaming/bot-help', icon: '🤖' },
        { name: 'Game News', href: '/pathways/gaming/game-news', icon: '📰' }
      ]
    },
    lorebound: {
      name: 'Lorebound Sanctum',
      icon: '📚',
      color: '#ff1493',
      gradient: 'var(--gradient-lorebound)',
      basePath: '/pathways/lorebound',
      navItems: [
        { name: 'Overview', href: '/pathways/lorebound', icon: '🏠' },
        { name: 'Library', href: '/pathways/lorebound/library', icon: '📖' },
        { name: 'Reviews', href: '/pathways/lorebound/reviews', icon: '⭐' },
        { name: 'Collections', href: '/pathways/lorebound/collections', icon: '📚' },
        { name: 'Sites', href: '/pathways/lorebound/sites', icon: '🌐' }
      ]
    },
    productive: {
      name: 'Productive Nexus',
      icon: '⚡',
      color: '#50c878',
      gradient: 'var(--gradient-productive)',
      basePath: '/pathways/productive',
      navItems: [
        { name: 'Overview', href: '/pathways/productive', icon: '🏠' },
        { name: 'Resources', href: '/pathways/productive/resources', icon: '🔧' },
        { name: 'Challenges', href: '/pathways/productive/challenges', icon: '🎯' },
        { name: 'Showcase', href: '/pathways/productive/showcase', icon: '🏅' },
        { name: 'Tools', href: '/pathways/productive/tools', icon: '⚙️' }
      ]
    },
    news: {
      name: 'News Nexus',
      icon: '📰',
      color: '#e0115f',
      gradient: 'var(--gradient-news)',
      basePath: '/pathways/news',
      navItems: [
        { name: 'Overview', href: '/pathways/news', icon: '🏠' },
        { name: 'Breaking', href: '/pathways/news/breaking', icon: '🔥' },
        { name: 'Science', href: '/pathways/news/science', icon: '🔬' },
        { name: 'Tech', href: '/pathways/news/tech', icon: '💻' },
        { name: 'Local', href: '/pathways/news/local', icon: '📍' }
      ]
    }
  }), []);
  
  const config = useMemo(() => 
    pathwayConfig[pathway] || pathwayConfig.gaming
  , [pathway, pathwayConfig]);
  
  const navItems = useMemo(() => 
    customNavItems || config.navItems
  , [customNavItems, config.navItems]);
  
  // ============================================================================
  // BREADCRUMBS GENERATION
  // ============================================================================
  
  const breadcrumbs = useMemo(() => {
    if (customBreadcrumbs) return customBreadcrumbs;
    
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [
      { label: 'Home', href: '/' },
      { label: 'Pathways', href: '/pathways' }
    ];
    
    if (segments.length >= 2) {
      crumbs.push({
        label: config.name,
        href: config.basePath
      });
      
      if (segments.length > 2) {
        const subPath = segments.slice(2).join('/');
        const currentNav = navItems.find(item => item.href.includes(subPath));
        
        if (currentNav) {
          crumbs.push({
            label: currentNav.name,
            href: currentNav.href
          });
        }
      }
    }
    
    return crumbs;
  }, [pathname, config, navItems, customBreadcrumbs]);
  
  // ============================================================================
  // ACTIVE STATE
  // ============================================================================
  
  const isActive = useCallback((href) => {
    if (href === config.basePath) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }, [pathname, config.basePath]);
  
  useEffect(() => {
    const active = navItems.find(item => isActive(item.href));
    setActiveTab(active?.href || null);
  }, [pathname, navItems, isActive]);
  
  // ============================================================================
  // SCROLL HANDLING
  // ============================================================================
  
  useEffect(() => {
    if (!sticky) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleNavigate = useCallback((href) => {
    if (onNavigate) {
      onNavigate(href);
    }
  }, [onNavigate]);
  
  const handleBackClick = useCallback(() => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  }, [onBackClick]);
  
  // ============================================================================
  // CLASS NAMES
  // ============================================================================
  
  const pathwayNavClasses = useMemo(() => {
    const classes = ['pathway-nav-divine', `pathway-nav-${pathway}`];
    if (sticky) classes.push('pathway-nav-sticky');
    if (scrolled) classes.push('pathway-nav-scrolled');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [pathway, sticky, scrolled, className]);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderBackButton = () => {
    if (!showBackButton) return null;
    
    return (
      <button
        className="pathway-nav-back"
        onClick={handleBackClick}
        aria-label="Go back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>
    );
  };
  
  const renderBreadcrumbs = () => {
    if (!showBreadcrumbs || breadcrumbs.length === 0) return null;
    
    return (
      <nav className="pathway-nav-breadcrumbs" aria-label="Breadcrumb">
        <ol className="pathway-breadcrumb-list">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href || index} className="pathway-breadcrumb-item">
              {index < breadcrumbs.length - 1 ? (
                <>
                  <Link href={crumb.href} className="pathway-breadcrumb-link">
                    {crumb.label}
                  </Link>
                  <svg
                    className="pathway-breadcrumb-separator"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <span className="pathway-breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };
  
  const renderHeader = () => (
    <div className="pathway-nav-header">
      <div className="pathway-nav-title-section">
        <span className="pathway-nav-icon" aria-hidden="true">
          {config.icon}
        </span>
        <h1 className="pathway-nav-title">{config.name}</h1>
      </div>
      {renderBackButton()}
    </div>
  );
  
  const renderTabs = () => (
    <div className="pathway-nav-tabs" role="navigation" aria-label="Pathway navigation">
      <div className="pathway-nav-tabs-wrapper">
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`pathway-nav-tab ${active ? 'active' : ''}`}
              onClick={() => handleNavigate(item.href)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="pathway-nav-tab-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="pathway-nav-tab-text">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Active indicator */}
      <div
        className="pathway-nav-indicator"
        style={{
          transform: `translateX(${navItems.findIndex(item => item.href === activeTab) * 100}%)`,
          width: `${100 / navItems.length}%`
        }}
        aria-hidden="true"
      />
    </div>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={pathwayNavClasses} {...restProps}>
      <div className="pathway-nav-container">
        {renderBreadcrumbs()}
        {renderHeader()}
        {renderTabs()}
      </div>
      
      {/* Pathway gradient background */}
      <div
        className="pathway-nav-gradient"
        style={{ background: config.gradient }}
        aria-hidden="true"
      />
    </div>
  );
};

export default PathwayNav;