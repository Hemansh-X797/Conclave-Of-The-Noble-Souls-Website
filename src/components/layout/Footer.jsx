import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Import styles
import '@/styles/navigation.css';
import '@/styles/design_system.css';
import '@/styles/typography.css';

/**
 * Footer Component
 * Divine luxury footer for The Conclave
 * 
 * @component
 * @example
 * <Footer 
 *   onNewsletterSubmit={(email) => console.log(email)}
 * />
 */
const Footer = ({
  // Configuration
  showNewsletter = true,
  showBackToTop = true,
  showSocial = true,
  
  // Callbacks
  onNewsletterSubmit,
  onSocialClick,
  onLinkClick,
  
  // Custom content
  customLogo = '/Assets/Images/CNS_logo1.png',
  customDescription = 'The Conclave of Noble Souls - A sanctuary where nobility meets community. Join us in our journey through gaming, lore, productivity, and knowledge.',
  customSocialLinks = null,
  
  // Additional props
  className = '',
  ...restProps
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [currentYear] = useState(new Date().getFullYear());
  const [isVisible, setIsVisible] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle, loading, success, error
  const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const footerRef = useRef(null);
  const observerRef = useRef(null);
  
  // ============================================================================
  // FOOTER DATA
  // ============================================================================
  
  const pathwaysLinks = useMemo(() => [
    { name: 'Gaming Realm', href: '/pathways/gaming', icon: '🎮' },
    { name: 'Lorebound Sanctum', href: '/pathways/lorebound', icon: '📚' },
    { name: 'Productive Nexus', href: '/pathways/productive', icon: '⚡' },
    { name: 'News Nexus', href: '/pathways/news', icon: '📰' }
  ], []);
  
  const communityLinks = useMemo(() => [
    { name: 'Hall of Nobles', href: '/hall-of-nobles', icon: '👑' },
    { name: 'Court', href: '/court', icon: '⚖️' },
    { name: 'Archives', href: '/archives', icon: '📜' },
    { name: 'Art Gallery', href: '/art-gallery', icon: '🎨' },
    { name: 'Gateway', href: '/gateway', icon: '🚪' },
    { name: 'Member Chambers', href: '/chambers/dashboard', icon: '🏛️' }
  ], []);
  
  const resourcesLinks = useMemo(() => [
    { name: 'Bot Commands', href: '/pathways/gaming/bot-help', icon: '🤖' },
    { name: 'Server Rules', href: '/archives/rules', icon: '📋' },
    { name: 'FAQ', href: '/archives/faq', icon: '❓' },
    { name: 'Staff Applications', href: '/court/applications', icon: '📝' },
    { name: 'Support', href: '/court/support', icon: '💬' },
    { name: 'Partnerships', href: '/court/partnerships', icon: '🤝' }
  ], []);
  
  const legalLinks = useMemo(() => [
    { name: 'Privacy Policy', href: '/legal/privacy', icon: '🔒' },
    { name: 'Terms of Service', href: '/legal/terms', icon: '📄' },
    { name: 'Code of Conduct', href: '/legal/conduct', icon: '⚖️' },
    { name: 'Appeals', href: '/court/appeals', icon: '⚖️' }
  ], []);
  
  const socialLinks = useMemo(() => customSocialLinks || [
    {
      name: 'Discord',
      href: 'https://discord.gg/your-invite',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
        </svg>
      ),
      ariaLabel: 'Join our Discord community'
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/your-handle',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      ariaLabel: 'Follow us on Twitter'
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/your-channel',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      ariaLabel: 'Subscribe to our YouTube channel'
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/your-profile',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      ariaLabel: 'Follow us on Instagram'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/your-org',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      ariaLabel: 'View our GitHub organization'
    }
  ], [customSocialLinks]);
  
  // ============================================================================
  // INTERSECTION OBSERVER FOR REVEAL ANIMATION
  // ============================================================================
  
  useEffect(() => {
    if (!footerRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(footerRef.current);
    
    return () => observerRef.current?.disconnect();
  }, []);
  
  // ============================================================================
  // BACK TO TOP BUTTON VISIBILITY
  // ============================================================================
  
  useEffect(() => {
    if (!showBackToTop) return;
    
    const handleScroll = () => {
      setShowBackToTopBtn(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showBackToTop]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterStatus('error');
      return;
    }
    
    setNewsletterStatus('loading');
    
    try {
      if (onNewsletterSubmit) {
        await onNewsletterSubmit(newsletterEmail);
      }
      setNewsletterStatus('success');
      setNewsletterEmail('');
      
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  }, [newsletterEmail, onNewsletterSubmit]);
  
  const handleSocialClick = useCallback((platform, url) => {
    if (onSocialClick) {
      onSocialClick(platform, url);
    }
  }, [onSocialClick]);
  
  const handleLinkClick = useCallback((href) => {
    if (onLinkClick) {
      onLinkClick(href);
    }
  }, [onLinkClick]);
  
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderBrand = () => (
    <div className="footer-brand">
      <Link href="/" className="footer-logo" aria-label="CNS Home">
        <Image
          src={customLogo}
          alt="CNS Logo"
          width={48}
          height={48}
          className="footer-logo-icon"
          loading="lazy"
        />
        <div className="footer-logo-text">CNS</div>
      </Link>
      
      <p className="footer-description">{customDescription}</p>
      
      {showSocial && renderSocial()}
      {showNewsletter && renderNewsletter()}
    </div>
  );
  
v
  const renderNewsletter = () => (
    <div className="footer-newsletter">
      <h4 className="footer-newsletter-title">Noble Newsletter</h4>
      <p className="footer-newsletter-text">
        Receive divine updates and exclusive content
      </p>
      <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
        <input
          type="email"
          placeholder="your@email.com"
          className={`footer-newsletter-input ${newsletterStatus === 'error' ? 'error' : ''}`}
          value={newsletterEmail}
          onChange={(e) => setNewsletterEmail(e.target.value)}
          aria-label="Email address for newsletter"
          disabled={newsletterStatus === 'loading'}
          required
        />
        <button
          type="submit"
          className="footer-newsletter-btn"
          aria-label="Subscribe to newsletter"
          disabled={newsletterStatus === 'loading'}
        >
          {newsletterStatus === 'loading' ? (
            <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="32" strokeDashoffset="0">
                <animate attributeName="stroke-dashoffset" values="0;-32" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : newsletterStatus === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </form>
      {newsletterStatus === 'success' && (
        <p className="footer-newsletter-message success">Successfully subscribed!</p>
      )}
      {newsletterStatus === 'error' && (
        <p className="footer-newsletter-message error">Please enter a valid email</p>
      )}
    </div>
  );
  
  const renderLinkColumn = (title, links) => (
    <div className="footer-links">
      <h3 className="footer-links-title">{title}</h3>
      <ul className="footer-links-list" role="list">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="footer-link"
              onClick={() => handleLinkClick(link.href)}
            >
              <span className="footer-link-icon" aria-hidden="true">{link.icon}</span>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
  
  const renderBottom = () => (
    <div className="footer-bottom">
      <div className="footer-copyright">
        <p>
          © {currentYear}{' '}
          <Link href="/" className="footer-copyright-link">
            Conclave of Noble Souls
          </Link>
          . All rights reserved.
        </p>
        <p className="footer-tagline">
          Crafted with divine precision and noble intent.
        </p>
      </div>
      
      <nav className="footer-legal" aria-label="Legal links">
        <Link href="/legal/privacy" className="footer-legal-link">Privacy</Link>
        <Link href="/legal/terms" className="footer-legal-link">Terms</Link>
        <Link href="/legal/conduct" className="footer-legal-link">Conduct</Link>
        <Link href="/sitemap.xml" className="footer-legal-link">Sitemap</Link>
      </nav>
    </div>
  );
  
  const renderBackToTop = () => {
    if (!showBackToTop || !showBackToTopBtn) return null;
    
    return (
      <button
        className="footer-back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <footer
      ref={footerRef}
      className={`footer-divine ${isVisible ? 'reveal' : ''} ${className}`}
      role="contentinfo"
      {...restProps}
    >
      <div className="footer-container">
        <div className="footer-grid">
          {renderBrand()}
          {renderLinkColumn('Pathways', pathwaysLinks)}
          {renderLinkColumn('Community', communityLinks)}
          {renderLinkColumn('Resources', resourcesLinks)}
          {renderLinkColumn('Legal', legalLinks)}
        </div>
        
        {renderBottom()}
      </div>
      
      {renderBackToTop()}
    </footer>
  );
};

export default Footer;