import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// Import styles
import '@/styles/navigation.css';
import '@/styles/design_system.css';
import '@/styles/typography.css';

/**
 * Sidebar Component
 * Collapsible luxury sidebar navigation for The Conclave
 * 
 * @component
 * @example
 * <Sidebar 
 *   isOpen={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   position="right"
 * />
 */
const Sidebar = ({
  // Core props
  isOpen = false,
  onClose,
  
  // Configuration
  position = 'right', // 'left' or 'right'
  showStats = true,
  showQuickActions = true,
  collapsible = true,
  persistCollapsed = true,
  
  // User data
  user = null,
  isAuthenticated = false,
  
  // Callbacks
  onNavigate,
  onPathwayClick,
  onStatsClick,
  
  // Custom data
  customLogo = '/Assets/Images/CNS_logo1.png',
  customStats = null,
  
  // Additional props
  className = '',
  ...restProps
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [memberStats, setMemberStats] = useState({
    online: 0,
    total: 0,
    loading: true
  });
  const [mounted, setMounted] = useState(false);
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const sidebarRef = useRef(null);
  const statsInterval = useRef(null);
  
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const pathname = usePathname();
  
  // ============================================================================
  // NAVIGATION DATA
  // ============================================================================
  
  const pathways = useMemo(() => [
    {
      id: 'gaming',
      name: 'Gaming Realm',
      subtitle: 'Legends Forge',
      icon: '🎮',
      href: '/pathways/gaming',
      color: '#00bfff'
    },
    {
      id: 'lorebound',
      name: 'Lorebound Sanctum',
      subtitle: 'Mystical Gateway',
      icon: '📚',
      href: '/pathways/lorebound',
      color: '#ff1493'
    },
    {
      id: 'productive',
      name: 'Productive Nexus',
      subtitle: 'Master Craft',
      icon: '⚡',
      href: '/pathways/productive',
      color: '#50c878'
    },
    {
      id: 'news',
      name: 'News Nexus',
      subtitle: 'Truth Unveiled',
      icon: '📰',
      href: '/pathways/news',
      color: '#e0115f'
    }
  ], []);
  
  const mainNavigation = useMemo(() => [
    { name: 'Home', href: '/', icon: '🏰', description: 'The Great Hall' },
    { name: 'Hall of Nobles', href: '/hall-of-nobles', icon: '👑', description: 'Premium Members', badge: 'VIP' },
    { name: 'Court', href: '/court', icon: '⚖️', description: 'Staff & Applications' },
    { name: 'Archives', href: '/archives', icon: '📜', description: 'History & Lore' },
    { name: 'Art Gallery', href: '/art-gallery', icon: '🎨', description: 'Creative Works' },
    { name: 'Gateway', href: '/gateway', icon: '🚪', description: 'Join Us' }
  ], []);
  
  const quickLinks = useMemo(() => [
    {
      section: 'Member Area',
      id: 'member',
      links: [
        { name: 'Dashboard', href: '/chambers/dashboard', icon: '📊' },
        { name: 'Preferences', href: '/chambers/preferences', icon: '⚙️' },
        { name: 'Achievements', href: '/chambers/achievements', icon: '🏆' }
      ]
    },
    {
      section: 'Support',
      id: 'support',
      links: [
        { name: 'Bot Commands', href: '/pathways/gaming/bot-help', icon: '🤖' },
        { name: 'FAQ', href: '/archives/faq', icon: '❓' },
        { name: 'Support Tickets', href: '/court/support', icon: '💬' }
      ]
    }
  ], []);
  
  // ============================================================================
  // MOUNT DETECTION
  // ============================================================================
  
  useEffect(() => {
    setMounted(true);
    
    // Load collapsed state from localStorage
    if (persistCollapsed && typeof window !== 'undefined') {
      const savedState = localStorage.getItem('cns_sidebar_collapsed');
      if (savedState !== null) {
        setCollapsed(JSON.parse(savedState));
      }
    }
  }, [persistCollapsed]);
  
  // ============================================================================
  // STATS FETCHING
  // ============================================================================
  
  useEffect(() => {
    if (!showStats || !isOpen) return;
    
    const fetchStats = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/stats/members');
        // const data = await response.json();
        
        // Mock data for now
        setTimeout(() => {
          setMemberStats(customStats || {
            online: Math.floor(Math.random() * 500) + 200,
            total: 1248,
            loading: false
          });
        }, 500);
      } catch (error) {
        console.error('Failed to fetch member stats:', error);
        setMemberStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchStats();
    
    // Refresh stats every 30 seconds
    statsInterval.current = setInterval(fetchStats, 30000);
    
    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }
    };
  }, [showStats, isOpen, customStats]);
  
  // ============================================================================
  // BODY SCROLL LOCK
  // ============================================================================
  
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);
  
  // ============================================================================
  // KEYBOARD HANDLING
  // ============================================================================
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // ============================================================================
  // OUTSIDE CLICK HANDLING
  // ============================================================================
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest('.navbar-mobile-toggle')
      ) {
        onClose?.();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  const isActive = useCallback((href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);
  
  const toggleSection = useCallback((sectionId) => {
    setActiveSection(prev => prev === sectionId ? null : sectionId);
  }, []);
  
  const handleCollapse = useCallback(() => {
    const newState = !collapsed;
    setCollapsed(newState);
    
    if (persistCollapsed && typeof window !== 'undefined') {
      localStorage.setItem('cns_sidebar_collapsed', JSON.stringify(newState));
    }
  }, [collapsed, persistCollapsed]);
  
  const handleNavigate = useCallback((href) => {
    if (onNavigate) {
      onNavigate(href);
    }
    onClose?.();
  }, [onNavigate, onClose]);
  
  const handlePathwayClick = useCallback((pathwayId) => {
    if (onPathwayClick) {
      onPathwayClick(pathwayId);
    }
  }, [onPathwayClick]);
  
  // ============================================================================
  // CLASS NAMES
  // ============================================================================
  
  const sidebarClasses = useMemo(() => {
    const classes = ['sidebar-divine'];
    if (isOpen) classes.push('open');
    if (collapsed) classes.push('collapsed');
    if (position === 'left') classes.push('sidebar-left');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [isOpen, collapsed, position, className]);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderHeader = () => (
    <div className="sidebar-header">
      <div className="sidebar-header-content">
        <Image
          src={customLogo}
          alt="CNS"
          width={40}
          height={40}
          className="sidebar-logo"
        />
        {!collapsed && (
          <div>
            <h2 className="sidebar-title">Navigation</h2>
            <p className="sidebar-subtitle">Noble Pathways</p>
          </div>
        )}
      </div>
      
      <div className="sidebar-header-actions">
        {collapsible && (
          <button
            className="sidebar-collapse-btn"
            onClick={handleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
        )}
        
        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
  
  const renderStats = () => {
    if (!showStats || collapsed) return null;
    
    return (
      <div className="sidebar-stats-card" onClick={onStatsClick}>
        <div className="sidebar-stats-header">
          <span className="sidebar-stats-icon">👥</span>
          <span className="sidebar-stats-label">Community</span>
        </div>
        <div className="sidebar-stats-content">
          {memberStats.loading ? (
            <div className="sidebar-stats-loading">
              <div className="spinner-small"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">{memberStats.online}</span>
                <span className="sidebar-stat-label">Online</span>
                <span className="sidebar-stat-indicator online"></span>
              </div>
              <div className="sidebar-stat-divider"></div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-value">{memberStats.total}</span>
                <span className="sidebar-stat-label">Total</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderMainNav = () => (
    <div className="sidebar-section">
      <button
        className="sidebar-section-header"
        onClick={() => toggleSection('main')}
        aria-expanded={activeSection === 'main'}
      >
        <h3 className="sidebar-section-title">
          {collapsed ? '☰' : 'Main Navigation'}
        </h3>
        {!collapsed && (
          <svg
            className={`sidebar-section-arrow ${activeSection === 'main' ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      
      {activeSection === 'main' && (
        <ul className="sidebar-nav" role="menu">
          {mainNavigation.map((link) => (
            <li key={link.href} role="none">
              <Link
                href={link.href}
                className={`sidebar-nav-link ${isActive(link.href) ? 'active' : ''}`}
                role="menuitem"
                onClick={() => handleNavigate(link.href)}
                title={collapsed ? link.name : ''}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">{link.icon}</span>
                {!collapsed && (
                  <div className="sidebar-nav-text">
                    <span className="sidebar-nav-name">{link.name}</span>
                    <span className="sidebar-nav-desc">{link.description}</span>
                  </div>
                )}
                {link.badge && !collapsed && (
                  <span className="nav-badge">{link.badge}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
  const renderPathways = () => (
    <div className="sidebar-section">
      <button
        className="sidebar-section-header"
        onClick={() => toggleSection('pathways')}
        aria-expanded={activeSection === 'pathways'}
      >
        <h3 className="sidebar-section-title">
          {collapsed ? '🌟' : 'Noble Pathways'}
        </h3>
        {!collapsed && (
          <svg
            className={`sidebar-section-arrow ${activeSection === 'pathways' ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      
      {activeSection === 'pathways' && (
        <div className="sidebar-pathway-grid">
          {pathways.map((pathway) => (
            <Link
              key={pathway.id}
              href={pathway.href}
              className={`sidebar-pathway-card ${pathway.id} ${isActive(pathway.href) ? 'active' : ''}`}
              onClick={() => {
                handleNavigate(pathway.href);
                handlePathwayClick(pathway.id);
              }}
              title={collapsed ? pathway.name : ''}
            >
              <div
                className="sidebar-pathway-icon-small"
                style={{ color: pathway.color }}
                aria-hidden="true"
              >
                {pathway.icon}
              </div>
              {!collapsed && (
                <div className="sidebar-pathway-info">
                  <div className="sidebar-pathway-name">{pathway.name}</div>
                  <div className="sidebar-pathway-subtitle">{pathway.subtitle}</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderQuickLinks = () => {
    if (!showQuickActions || collapsed) return null;
    
    return quickLinks.map((section) => (
      <div key={section.id} className="sidebar-section">
        <button
          className="sidebar-section-header"
          onClick={() => toggleSection(section.id)}
          aria-expanded={activeSection === section.id}
        >
          <h3 className="sidebar-section-title">{section.section}</h3>
          <svg
            className={`sidebar-section-arrow ${activeSection === section.id ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {activeSection === section.id && (
          <ul className="sidebar-nav sidebar-nav-compact">
            {section.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`sidebar-nav-link ${isActive(link.href) ? 'active' : ''}`}
                  onClick={() => handleNavigate(link.href)}
                >
                  <span className="sidebar-nav-icon" aria-hidden="true">{link.icon}</span>
                  <span className="sidebar-nav-name">{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    ));
  };
  
  const renderQuickActions = () => {
    if (!showQuickActions || collapsed) return null;
    
    return (
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Quick Actions</h3>
        <div className="sidebar-quick-actions">
          <Link
            href="/gateway"
            className="sidebar-action-btn primary"
            onClick={() => handleNavigate('/gateway')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
            </svg>
            Join Discord
          </Link>
          <Link
            href="/chambers/dashboard"
            className="sidebar-action-btn secondary"
            onClick={() => handleNavigate('/chambers/dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Member Area
          </Link>
        </div>
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  if (!mounted) return null;
  
  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside
        ref={sidebarRef}
        className={sidebarClasses}
        aria-label="Navigation sidebar"
        aria-hidden={!isOpen}
        {...restProps}
      >
        {renderHeader()}
        
        <div className="sidebar-content">
          {renderStats()}
          {renderMainNav()}
          {renderPathways()}
          {renderQuickLinks()}
          {renderQuickActions()}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;