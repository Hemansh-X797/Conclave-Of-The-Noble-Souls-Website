import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// Import styles
import '@/styles/navigation.css';
import '@/styles/design_system.css';
import '@/styles/typography.css';

/**
 * Navbar Component
 * Divine luxury navigation bar for The Conclave
 * 
 * @component
 * @example
 * <Navbar 
 *   user={userData} 
 *   onAuthClick={() => router.push('/gateway')}
 * />
 */
const Navbar = ({
  // User props
  user = null,
  isAuthenticated = false,
  
  // Behavior props
  hideOnScroll = true,
  showProgressBar = true,
  transparentOnTop = false,
  
  // Callbacks
  onAuthClick,
  onUserClick,
  onPathwayChange,
  
  // Custom configuration
  customLogo = '/Assets/Images/CNS_logo1.png',
  customBrandText = 'CNS',
  customBrandSubtitle = 'Conclave of Noble Souls',
  
  // Additional props
  className = '',
  ...restProps
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathwaysOpen, setPathwaysOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPathway, setHoveredPathway] = useState(null);
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);
  const megaMenuTimer = useRef(null);
  const navRef = useRef(null);
  
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const pathname = usePathname();
  
  // ============================================================================
  // PATHWAY DETECTION
  // ============================================================================
  
  const currentPathway = useMemo(() => {
    if (pathname.includes('/gaming')) return 'gaming';
    if (pathname.includes('/lorebound')) return 'lorebound';
    if (pathname.includes('/productive')) return 'productive';
    if (pathname.includes('/news')) return 'news';
    return 'default';
  }, [pathname]);
  
  // ============================================================================
  // NAVIGATION DATA
  // ============================================================================
  
  const pathways = useMemo(() => [
    {
      id: 'gaming',
      name: 'Gaming Realm',
      subtitle: 'Where Legends are Forged',
      description: 'Tournaments, leaderboards, bot commands, and epic gaming adventures await in our digital colosseum.',
      icon: '🎮',
      href: '/pathways/gaming',
      color: '#00bfff',
      features: ['Tournaments', 'Leaderboards', 'Bot Help', 'Game News']
    },
    {
      id: 'lorebound',
      name: 'Lorebound Sanctum',
      subtitle: 'Gateway to Mystical Worlds',
      description: 'Dive into anime, manga, novels, and mystical storytelling. Your sanctuary for all things otaku.',
      icon: '📚',
      href: '/pathways/lorebound',
      color: '#ff1493',
      features: ['Library', 'Reviews', 'Collections', 'Sites']
    },
    {
      id: 'productive',
      name: 'Productive Nexus',
      subtitle: 'Master Your Craft',
      description: 'Tools, resources, challenges, and productivity strategies to elevate your efficiency to noble heights.',
      icon: '⚡',
      href: '/pathways/productive',
      color: '#50c878',
      features: ['Resources', 'Challenges', 'Showcase', 'Tools']
    },
    {
      id: 'news',
      name: 'News Nexus',
      subtitle: 'Truth Unveiled',
      description: 'Breaking news, tech updates, science discoveries, and global insights delivered with divine clarity.',
      icon: '📰',
      href: '/pathways/news',
      color: '#e0115f',
      features: ['Breaking', 'Science', 'Tech', 'Local']
    }
  ], []);
  
  const navLinks = useMemo(() => [
    { name: 'Home', href: '/', icon: '🏰', description: 'The Great Hall' },
    { name: 'Hall of Nobles', href: '/hall-of-nobles', icon: '👑', description: 'Premium Members', badge: 'VIP' },
    { name: 'Court', href: '/court', icon: '⚖️', description: 'Staff & Applications' },
    { name: 'Archives', href: '/archives', icon: '📜', description: 'Server History & Lore' },
    { name: 'Art Gallery', href: '/art-gallery', icon: '🎨', description: 'Creative Masterpieces' },
    { name: 'Gateway', href: '/gateway', icon: '🚪', description: 'Join the Conclave' }
  ], []);
  
  // ============================================================================
  // SCROLL HANDLING
  // ============================================================================
  
  const handleScroll = useCallback(() => {
    if (!scrollTicking.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;
        
        setScrollProgress(Math.min(progress, 100));
        setScrolled(currentScrollY > 50);
        
        if (hideOnScroll && currentScrollY > 200) {
          if (currentScrollY > lastScrollY.current) {
            setHidden(true);
            setPathwaysOpen(false);
          } else if (currentScrollY < lastScrollY.current - 10) {
            setHidden(false);
          }
        }
        
        lastScrollY.current = currentScrollY;
        scrollTicking.current = false;
      });
      scrollTicking.current = true;
    }
  }, [hideOnScroll]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // ============================================================================
  // ROUTE CHANGE HANDLING
  // ============================================================================
  
  useEffect(() => {
    setMobileOpen(false);
    setPathwaysOpen(false);
  }, [pathname]);
  
  // ============================================================================
  // BODY SCROLL LOCK
  // ============================================================================
  
  useEffect(() => {
    if (mobileOpen) {
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
  }, [mobileOpen]);
  
  // ============================================================================
  // KEYBOARD HANDLING
  // ============================================================================
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setPathwaysOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // ============================================================================
  // MEGA MENU HANDLERS
  // ============================================================================
  
  const handlePathwaysEnter = useCallback(() => {
    clearTimeout(megaMenuTimer.current);
    setPathwaysOpen(true);
  }, []);
  
  const handlePathwaysLeave = useCallback(() => {
    megaMenuTimer.current = setTimeout(() => {
      setPathwaysOpen(false);
      setHoveredPathway(null);
    }, 200);
  }, []);
  
  // ============================================================================
  // ACTIVE STATE CHECKING
  // ============================================================================
  
  const isActive = useCallback((href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);
  
  const isPathwayActive = useMemo(() => {
    return pathname.startsWith('/pathways');
  }, [pathname]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleMobileToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);
  
  const handlePathwayClick = useCallback((pathwayId) => {
    if (onPathwayChange) {
      onPathwayChange(pathwayId);
    }
  }, [onPathwayChange]);
  
  const handleAuthAction = useCallback((e) => {
    if (onAuthClick) {
      e.preventDefault();
      onAuthClick();
    }
  }, [onAuthClick]);
  
  const handleUserAction = useCallback((e) => {
    if (onUserClick) {
      e.preventDefault();
      onUserClick();
    }
  }, [onUserClick]);
  
  // ============================================================================
  // CLASS NAMES
  // ============================================================================
  
  const navbarClasses = useMemo(() => {
    const classes = ['navbar-divine'];
    if (currentPathway !== 'default') classes.push(`pathway-${currentPathway}`);
    if (scrolled) classes.push('scrolled');
    if (hidden) classes.push('hidden');
    if (transparentOnTop && !scrolled) classes.push('nav-transparent');
    if (mobileOpen) classes.push('mobile-open');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [currentPathway, scrolled, hidden, transparentOnTop, mobileOpen, className]);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderProgressBar = () => {
    if (!showProgressBar) return null;
    return (
      <div
        className="navbar-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
    );
  };
  
  const renderLogo = () => (
    <Link href="/" className="navbar-logo" aria-label="CNS Home">
      <Image
        src={customLogo}
        alt="Conclave of Noble Souls"
        width={48}
        height={48}
        className="navbar-logo-icon"
        priority
      />
      <div>
        <div className="navbar-logo-text">{customBrandText}</div>
        <div className="navbar-logo-subtitle">{customBrandSubtitle}</div>
      </div>
    </Link>
  );
  
  const renderDesktopNav = () => (
    <ul className="navbar-nav" role="menubar">
      <li className="navbar-nav-item" role="none">
        <Link
          href="/"
          className={`navbar-nav-link ${isActive('/') ? 'active' : ''}`}
          role="menuitem"
          aria-current={isActive('/') ? 'page' : undefined}
        >
          <span className="navbar-nav-icon" aria-hidden="true">🏰</span>
          <span>Home</span>
        </Link>
      </li>
      
      <li
        className={`navbar-nav-item navbar-pathways-trigger ${pathwaysOpen ? 'active' : ''} ${isPathwayActive ? 'pathway-active' : ''}`}
        role="none"
        onMouseEnter={handlePathwaysEnter}
        onMouseLeave={handlePathwaysLeave}
      >
        <button
          className="navbar-nav-link"
          aria-expanded={pathwaysOpen}
          aria-haspopup="true"
          onClick={() => setPathwaysOpen(!pathwaysOpen)}
        >
          <span className="navbar-nav-icon" aria-hidden="true">🌟</span>
          <span>Pathways</span>
          <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="navbar-mega-menu" role="menu">
          <div className="navbar-mega-grid">
            {pathways.map((pathway) => (
              <Link
                key={pathway.id}
                href={pathway.href}
                className={`navbar-pathway-card ${pathway.id}`}
                role="menuitem"
                onMouseEnter={() => setHoveredPathway(pathway.id)}
                onClick={() => handlePathwayClick(pathway.id)}
              >
                <div className="navbar-pathway-header">
                  <div className="navbar-pathway-icon" aria-hidden="true">{pathway.icon}</div>
                  <div>
                    <h3 className="navbar-pathway-title">{pathway.name}</h3>
                    <p className="navbar-pathway-subtitle">{pathway.subtitle}</p>
                  </div>
                </div>
                <p className="navbar-pathway-description">{pathway.description}</p>
                <div className="navbar-pathway-features">
                  {pathway.features.map((feature, idx) => (
                    <span key={idx} className="navbar-pathway-feature">{feature}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          <div className="navbar-mega-footer">
            <p className="navbar-mega-footer-text">
              Choose your path and embark on your noble journey
            </p>
          </div>
        </div>
      </li>
      
      {navLinks.slice(1, 4).map((link) => (
        <li key={link.href} className="navbar-nav-item" role="none">
          <Link
            href={link.href}
            className={`navbar-nav-link ${isActive(link.href) ? 'active' : ''}`}
            role="menuitem"
            aria-current={isActive(link.href) ? 'page' : undefined}
          >
            <span className="navbar-nav-icon" aria-hidden="true">{link.icon}</span>
            <span>{link.name}</span>
            {link.badge && <span className="nav-badge">{link.badge}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
  
  const renderUserSection = () => {
    if (isAuthenticated && user) {
      return (
        <Link
          href="/chambers/dashboard"
          className="navbar-user-profile"
          onClick={handleUserAction}
          aria-label={`${user.name} profile`}
        >
          <Image
            src={user.avatar || '/Assets/Images/default-avatar.png'}
            alt={user.name}
            width={36}
            height={36}
            className="navbar-user-avatar"
          />
          <div className="navbar-user-info hide-mobile">
            <p className="navbar-user-name">{user.name}</p>
            <p className={`navbar-user-role ${user.role?.toLowerCase() || 'member'}`}>
              {user.role || 'Member'}
            </p>
          </div>
        </Link>
      );
    }
    
    return (
      <Link
        href="/gateway"
        className="navbar-discord-btn"
        onClick={handleAuthAction}
        aria-label="Join Discord Server"
      >
        <svg className="navbar-discord-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
        </svg>
        <span className="navbar-discord-text">Join Discord</span>
      </Link>
    );
  };
  
  const renderMobileToggle = () => (
    <button
      className={`navbar-mobile-toggle ${mobileOpen ? 'active' : ''}`}
      onClick={handleMobileToggle}
      aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={mobileOpen}
    >
      <span className="navbar-mobile-toggle-bar" aria-hidden="true"></span>
      <span className="navbar-mobile-toggle-bar" aria-hidden="true"></span>
      <span className="navbar-mobile-toggle-bar" aria-hidden="true"></span>
    </button>
  );
  
  const renderMobileMenu = () => (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      
      <aside
        className={`sidebar-divine ${mobileOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">Navigation</h2>
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Main Menu</h3>
            <ul className="sidebar-nav" role="menu">
              {navLinks.map((link) => (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    className={`sidebar-nav-link ${isActive(link.href) ? 'active' : ''}`}
                    role="menuitem"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="sidebar-nav-icon" aria-hidden="true">{link.icon}</span>
                    <div className="sidebar-nav-text">
                      <span className="sidebar-nav-name">{link.name}</span>
                      <span className="sidebar-nav-desc">{link.description}</span>
                    </div>
                    {link.badge && <span className="nav-badge">{link.badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Noble Pathways</h3>
            <div className="sidebar-pathway-grid">
              {pathways.map((pathway) => (
                <Link
                  key={pathway.id}
                  href={pathway.href}
                  className={`sidebar-pathway-card ${pathway.id} ${isActive(pathway.href) ? 'active' : ''}`}
                  onClick={() => {
                    setMobileOpen(false);
                    handlePathwayClick(pathway.id);
                  }}
                >
                  <div className="sidebar-pathway-icon-small" style={{ color: pathway.color }} aria-hidden="true">
                    {pathway.icon}
                  </div>
                  <div className="sidebar-pathway-info">
                    <div className="sidebar-pathway-name">{pathway.name}</div>
                    <div className="sidebar-pathway-subtitle">{pathway.subtitle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Quick Actions</h3>
            <div className="sidebar-quick-actions">
              <Link
                href="/gateway"
                className="sidebar-action-btn primary"
                onClick={() => setMobileOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
                Join Discord
              </Link>
              <Link
                href="/chambers/dashboard"
                className="sidebar-action-btn secondary"
                onClick={() => setMobileOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Member Area
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to Content
      </a>
      
      <nav
        ref={navRef}
        className={navbarClasses}
        role="navigation"
        aria-label="Main navigation"
        {...restProps}
      >
        {renderProgressBar()}
        
        <div className="navbar-container">
          {renderLogo()}
          {renderDesktopNav()}
          
          <div className="navbar-actions">
            {renderUserSection()}
            {renderMobileToggle()}
          </div>
        </div>
      </nav>
      
      {renderMobileMenu()}
    </>
  );
};

export default Navbar;