// ============================================================================
// PATHWAYS OVERVIEW - THE GRAND GATEWAY
// The Conclave Realm - Choose Your Path
// Location: /src/app/pathways/page.jsx
// ============================================================================

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppProvider';

// ============================================================================
// EXISTING UI COMPONENTS (REUSING EVERYTHING)
// ============================================================================
import { 
  NobleButton, 
  GamingButton,
  LoreboundButton,
  ProductiveButton,
  NewsButton,
  TextFlameButton
} from '@/components/ui/LuxuryButton';

import {
  GamingPortal,
  LoreboundPortal,
  ProductivePortal,
  NewsPortal,
  SuperButtonGroup
} from '@/components/ui/SuperButton';

import {
  GlassCard,
  StatsCard,
  FeatureCard,
  ProfileCard
} from '@/components/ui/GlassCard';

import LoadingCrest from '@/components/ui/LoadingCrest';
import PathwayCard from '@/components/pathways/PathwayCard';
import PathwayHero from '@/components/pathways/PathwayHero';

// ============================================================================
// EXISTING DATA & UTILITIES
// ============================================================================
import { 
  getAllPathways, 
  getPathwayById,
  getPathwayColor,
  getPathwayGradient,
  getPathwayIcon
} from '@/data/pathways';

import { notify } from '@/components/interactive/NotificationCenter';

// ============================================================================
// METADATA FOR SEO
// ============================================================================
export const metadata = {
  title: 'Pathways | Choose Your Noble Journey',
  description: 'Explore four legendary pathways: Gaming Realm, Lorebound Sanctuary, Productivity Palace, and News Nexus. Find your destiny among noble souls.',
  keywords: ['pathways', 'gaming', 'anime', 'productivity', 'news', 'community'],
  openGraph: {
    title: 'Choose Your Path | The Conclave',
    description: 'Four realms of excellence await. Which path will you choose?',
    type: 'website'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PathwaysOverviewPage() {
  // ==========================================================================
  // STATE & REFS
  // ==========================================================================
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    currentPathway,
    particlesEnabled,
    soundsEnabled,
    animationsEnabled,
    isMobile,
    playClick,
    playHover,
    serverData
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [pathways, setPathways] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activePathways: 4,
    eventsThisMonth: 0,
    achievementsUnlocked: 0
  });
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [hoveredPortal, setHoveredPortal] = useState(null);

  const heroVideoRef = useRef(null);
  const statsObserverRef = useRef(null);
  const testimonialsRef = useRef(null);

  // ==========================================================================
  // LOAD DATA ON MOUNT
  // ==========================================================================
  useEffect(() => {
    loadPathwayData();
  }, []);

  async function loadPathwayData() {
    try {
      setLoading(true);

      // Get all pathway configurations
      const allPathways = getAllPathways();
      setPathways(allPathways);

      // Calculate stats (will be dynamic when connected to Supabase)
      const totalMembers = allPathways.reduce((sum, p) => sum + (p.stats?.memberCount || 0), 0);
      const eventsCount = allPathways.reduce((sum, p) => sum + (p.stats?.eventsHosted || 0), 0);

      setStats({
        totalMembers: serverData?.memberCount || totalMembers || 247,
        activePathways: allPathways.filter(p => p.isActive).length,
        eventsThisMonth: eventsCount || 18,
        achievementsUnlocked: 1247
      });

      setLoading(false);

      // Welcome notification
      setTimeout(() => {
        if (!sessionStorage.getItem('pathways-visited')) {
          notify.success('Welcome to the Pathways Gateway!', {
            title: 'Choose Your Journey',
            duration: 4000
          });
          sessionStorage.setItem('pathways-visited', 'true');
        }
      }, 500);

    } catch (error) {
      console.error('Failed to load pathway data:', error);
      setLoading(false);
      notify.error('Failed to load pathways');
    }
  }

  // ==========================================================================
  // SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================================================
  useEffect(() => {
    if (!animationsEnabled) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 100);
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [animationsEnabled, loading]);

  // ==========================================================================
  // ANIMATED COUNTERS FOR STATS
  // ==========================================================================
  useEffect(() => {
    if (!animationsEnabled) return;

    const statElements = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
      threshold: 0.5
    };

    statsObserverRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, observerOptions);

    statElements.forEach(el => {
      statsObserverRef.current.observe(el);
    });

    return () => {
      if (statsObserverRef.current) {
        statsObserverRef.current.disconnect();
      }
    };
  }, [animationsEnabled, stats]);

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  // ==========================================================================
  // PARALLAX EFFECT ON VIDEO
  // ==========================================================================
  useEffect(() => {
    if (!animationsEnabled || isMobile) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.pathways-hero');
      
      if (hero && heroVideoRef.current) {
        const heroHeight = hero.offsetHeight;
        if (scrolled <= heroHeight) {
          heroVideoRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animationsEnabled, isMobile]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handlePathwaySelect = useCallback((pathwayId) => {
    if (soundsEnabled) playClick();
    
    const pathway = getPathwayById(pathwayId);
    setSelectedPathway(pathway);
    
    // Navigate to pathway main page
    setTimeout(() => {
      router.push(`/pathways/${pathwayId}`);
    }, 300);
  }, [router, playClick, soundsEnabled]);

  const handlePortalHover = useCallback((pathwayId) => {
    if (soundsEnabled) playHover();
    setHoveredPortal(pathwayId);
  }, [playHover, soundsEnabled]);

  const handleScrollToPortals = useCallback(() => {
    if (soundsEnabled) playClick();
    
    const portalsSection = document.getElementById('pathway-portals');
    if (portalsSection) {
      portalsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playClick, soundsEnabled]);

  const handleJoinDiscord = useCallback(() => {
    if (soundsEnabled) playClick();
    window.open(process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg/pbTnTxqS38', '_blank');
  }, [playClick, soundsEnabled]);

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  if (loading) {
    return <LoadingCrest message="Loading pathways..." />;
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="pathways-overview-page">
      {/* ====================================================================
          SECTION 1: HERO - THE GRAND ENTRANCE
          ==================================================================== */}
      <section className="pathways-hero">
        {/* Video Background */}
        <div className="hero-video-container">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            className="hero-video parallax-slow"
            poster="/Assets/Images/pathways-hero-poster.jpg"
          >
            <source src="/Assets/Videos/hero_video1.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        {/* Hero Content */}
        <div className="hero-content container">
          <div className="hero-text-wrapper scroll-reveal">
            {/* Decorative Line */}
            <div className="hero-line" />

            {/* Main Title */}
            <h1 className="text-display text-gradient-divine text-glow-intense animate-fade-in">
              Choose Your Path
            </h1>

            {/* Subtitle */}
            <p className="text-h3 text-shadow-luxury animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Four Realms of Excellence Await
            </p>

            {/* Description */}
            <p className="text-body hero-description animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Join a legendary community of <span className="text-gradient-divine">{stats.totalMembers.toLocaleString()}+ noble souls</span> across four extraordinary pathways. 
              Whether you seek competitive glory, creative storytelling, personal growth, or informed discourse—your destiny awaits.
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <NobleButton 
                size="large" 
                onClick={handleScrollToPortals}
                className="hero-cta-primary"
              >
                Explore Pathways
              </NobleButton>
              
              <TextFlameButton
                size="large"
                onClick={handleJoinDiscord}
                className="hero-cta-secondary"
              >
                Join Discord
              </TextFlameButton>
            </div>

            {/* Stats Preview */}
            <div className="hero-stats animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="hero-stat">
                <span className="stat-number-small text-gradient-gaming">{stats.activePathways}</span>
                <span className="stat-label">Active Pathways</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number-small text-gradient-divine">{stats.eventsThisMonth}+</span>
                <span className="stat-label">Events This Month</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number-small text-gradient-productive">{(stats.achievementsUnlocked / 1000).toFixed(1)}K+</span>
                <span className="stat-label">Achievements Unlocked</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator animate-bounce">
            <div className="scroll-icon">
              <span>↓</span>
            </div>
            <p className="text-small">Scroll to Explore</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: PATHWAY PORTALS - THE FOUR REALMS
          ==================================================================== */}
      <section id="pathway-portals" className="pathway-portals-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              Enter Your Realm
            </h2>
            <p className="text-h4 section-subtitle">
              Four distinct pathways, each with its own culture, challenges, and community
            </p>
          </div>

          {/* Portals Grid */}
          <div className="portals-grid">
            {/* Gaming Realm Portal */}
            <div 
              className="portal-wrapper scroll-reveal"
              onMouseEnter={() => handlePortalHover('gaming')}
              onMouseLeave={() => setHoveredPortal(null)}
            >
              <GamingPortal
                title="Gaming Realm"
                subtitle="Where Warriors Test Their Mettle"
                description="Compete in epic tournaments, climb leaderboards, and forge your legend in digital battlefields"
                imageUrl="/Assets/Images/Pathways/PathwayButtons/pexels-pixabay-159393.jpg"
                stats={{
                  members: pathways.find(p => p.id === 'gaming')?.stats?.memberCount || 89,
                  active: 'High'
                }}
                onClick={() => handlePathwaySelect('gaming')}
                className={hoveredPortal === 'gaming' ? 'portal-active' : ''}
              />
              
              {/* Portal Info Overlay */}
              {hoveredPortal === 'gaming' && !isMobile && (
                <div className="portal-info-overlay animate-fade-in">
                  <div className="portal-features">
                    <h4 className="text-h4 text-gradient-gaming">Key Features:</h4>
                    <ul>
                      <li>🏆 Competitive Tournaments</li>
                      <li>📊 Live Leaderboards</li>
                      <li>🎮 Multi-Game Support</li>
                      <li>🤖 Gaming Bot Integration</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Lorebound Sanctuary Portal */}
            <div 
              className="portal-wrapper scroll-reveal"
              style={{ animationDelay: '0.1s' }}
              onMouseEnter={() => handlePortalHover('lorebound')}
              onMouseLeave={() => setHoveredPortal(null)}
            >
              <LoreboundPortal
                title="Lorebound Sanctuary"
                subtitle="Where Stories Come Alive"
                description="Dive into anime, manga, and storytelling. Share reviews, discover hidden gems, and connect with fellow otaku"
                imageUrl="/Assets/Images/Pathways/PathwayButtons/Otaku_button.jpg"
                stats={{
                  members: pathways.find(p => p.id === 'lorebound')?.stats?.memberCount || 134,
                  active: 'Very High'
                }}
                onClick={() => handlePathwaySelect('lorebound')}
                className={hoveredPortal === 'lorebound' ? 'portal-active' : ''}
              />
              
              {hoveredPortal === 'lorebound' && !isMobile && (
                <div className="portal-info-overlay animate-fade-in">
                  <div className="portal-features">
                    <h4 className="text-h4 text-gradient-lorebound">Key Features:</h4>
                    <ul>
                      <li>📚 Extensive E-Book Library</li>
                      <li>⭐ Community Reviews</li>
                      <li>📺 Watch Party Events</li>
                      <li>🎨 Fan Creation Showcase</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Productivity Palace Portal */}
            <div 
              className="portal-wrapper scroll-reveal"
              style={{ animationDelay: '0.2s' }}
              onMouseEnter={() => handlePortalHover('productive')}
              onMouseLeave={() => setHoveredPortal(null)}
            >
              <ProductivePortal
                title="Productivity Palace"
                subtitle="Where Excellence is Forged"
                description="Build skills, crush goals, and optimize your life. Join challenges, share achievements, find accountability partners"
                imageUrl="/Assets/Images/Pathways/PathwayButtons/Productive_button.jpg"
                stats={{
                  members: pathways.find(p => p.id === 'productive')?.stats?.memberCount || 76,
                  active: 'High'
                }}
                onClick={() => handlePathwaySelect('productive')}
                className={hoveredPortal === 'productive' ? 'portal-active' : ''}
              />
              
              {hoveredPortal === 'productive' && !isMobile && (
                <div className="portal-info-overlay animate-fade-in">
                  <div className="portal-features">
                    <h4 className="text-h4 text-gradient-productive">Key Features:</h4>
                    <ul>
                      <li>🎯 Goal Tracking System</li>
                      <li>📚 Resource Library</li>
                      <li>🏆 30-Day Challenges</li>
                      <li>🤝 Accountability Partners</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* News Nexus Portal */}
            <div 
              className="portal-wrapper scroll-reveal"
              style={{ animationDelay: '0.3s' }}
              onMouseEnter={() => handlePortalHover('news')}
              onMouseLeave={() => setHoveredPortal(null)}
            >
              <NewsPortal
                title="News Nexus"
                subtitle="Where Truth Illuminates"
                description="Stay informed with breaking news, deep analysis, and civil discussions. Cut through noise, focus on what matters"
                imageUrl="/Assets/Images/Pathways/PathwayButtons/news_button.PNG"
                stats={{
                  members: pathways.find(p => p.id === 'news')?.stats?.memberCount || 52,
                  active: 'Medium'
                }}
                onClick={() => handlePathwaySelect('news')}
                className={hoveredPortal === 'news' ? 'portal-active' : ''}
              />
              
              {hoveredPortal === 'news' && !isMobile && (
                <div className="portal-info-overlay animate-fade-in">
                  <div className="portal-features">
                    <h4 className="text-h4 text-gradient-news">Key Features:</h4>
                    <ul>
                      <li>⚡ Real-Time Updates</li>
                      <li>🔍 Expert Analysis</li>
                      <li>✓ Fact Checking</li>
                      <li>💬 Civil Discourse</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Portal Selection Note */}
          <div className="portal-note scroll-reveal">
            <p className="text-body text-glow-soft">
              <span className="text-gradient-divine">✨ Join Multiple Pathways</span> - There are no restrictions. 
              Explore all realms and discover where you truly belong.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: WHY JOIN PATHWAYS
          ==================================================================== */}
      <section className="why-pathways-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              Why Join Pathways?
            </h2>
            <p className="text-h4 section-subtitle">
              More than just channels—a structured journey to excellence
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="benefits-grid">
            {/* Benefit 1 */}
            <FeatureCard
              className="benefit-card scroll-reveal"
              title="Connect with Like-Minded Souls"
              description="Find your tribe among thousands of members who share your passions. Form lasting friendships, collaborate on projects, and grow together."
              icon="🤝"
              pathway="default"
            />

            {/* Benefit 2 */}
            <FeatureCard
              className="benefit-card scroll-reveal"
              style={{ animationDelay: '0.1s' }}
              title="Track Your Progress"
              description="Watch yourself evolve with our achievement system. Unlock badges, climb ranks, and celebrate milestones as you engage with your pathway community."
              icon="📈"
              pathway="gaming"
            />

            {/* Benefit 3 */}
            <FeatureCard
              className="benefit-card scroll-reveal"
              style={{ animationDelay: '0.2s' }}
              title="Access Exclusive Content"
              description="Each pathway offers curated resources, exclusive events, and premium content. From e-book libraries to tournament access—membership has privileges."
              icon="🎁"
              pathway="lorebound"
            />

            {/* Benefit 4 */}
            <FeatureCard
              className="benefit-card scroll-reveal"
              style={{ animationDelay: '0.3s' }}
              title="Participate in Events"
              description="Join pathway-specific events, challenges, and competitions. From gaming tournaments to reading clubs, there's always something happening."
              icon="🎯"
              pathway="productive"
            />
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: PATHWAY COMPARISON TABLE
          ==================================================================== */}
      <section className="pathway-comparison-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              Compare Pathways
            </h2>
            <p className="text-h4 section-subtitle">
              Find the perfect fit for your interests
            </p>
          </div>

          {/* Comparison Table */}
          <div className="comparison-table-wrapper scroll-reveal">
            <div className="comparison-table">
              {/* Table Header */}
              <div className="comparison-header">
                <div className="comparison-cell comparison-label"></div>
                <div className="comparison-cell">
                  <div className="pathway-icon gaming">🎮</div>
                  <h4 className="text-h4 text-gradient-gaming">Gaming</h4>
                </div>
                <div className="comparison-cell">
                  <div className="pathway-icon lorebound">📚</div>
                  <h4 className="text-h4 text-gradient-lorebound">Lorebound</h4>
                </div>
                <div className="comparison-cell">
                  <div className="pathway-icon productive">⚡</div>
                  <h4 className="text-h4 text-gradient-productive">Productive</h4>
                </div>
                <div className="comparison-cell">
                  <div className="pathway-icon news">📰</div>
                  <h4 className="text-h4 text-gradient-news">News</h4>
                </div>
              </div>

              {/* Focus Area Row */}
              <div className="comparison-row">
                <div className="comparison-cell comparison-label">
                  <strong>Primary Focus</strong>
                </div>
                <div className="comparison-cell">Competitive Gaming</div>
                <div className="comparison-cell">Anime & Storytelling</div>
                <div className="comparison-cell">Self-Improvement</div>
                <div className="comparison-cell">Current Events</div>
              </div>

              {/* Activity Level Row */}
              <div className="comparison-row">
                <div className="comparison-cell comparison-label">
                  <strong>Activity Level</strong>
                </div>
                <div className="comparison-cell">
                  <span className="activity-badge high">High</span>
                </div>
                <div className="comparison-cell">
                  <span className="activity-badge very-high">Very High</span>
                </div>
                <div className="comparison-cell">
                  <span className="activity-badge high">High</span>
                </div>
                <div className="comparison-cell">
                  <span className="activity-badge medium">Medium</span>
                </div>
              </div>

              {/* Events Row */}
              <div className="comparison-row">
                <div className="comparison-cell comparison-label">
                  <strong>Events</strong>
                </div>
                <div className="comparison-cell">Tournaments, Game Nights</div>
                <div className="comparison-cell">Watch Parties, Reading Clubs</div>
                <div className="comparison-cell">Challenges, Workshops</div>
                <div className="comparison-cell">Debates, Q&A Sessions</div>
              </div>

              {/* Resources Row */}
              <div className="comparison-row">
                <div className="comparison-cell comparison-label">
                  <strong>Resources</strong>
                </div>
                <div className="comparison-cell">Guides, Bot Commands</div>
                <div className="comparison-cell">E-Books, Reviews, Sites</div>
                <div className="comparison-cell">Tools, Books, Guides</div>
                <div className="comparison-cell">Articles, Analysis</div>
              </div>

              {/* Community Row */}
              <div className="comparison-row">
                <div className="comparison-cell comparison-label">
                  <strong>Community Vibe</strong>
                </div>
                <div className="comparison-cell">Competitive, Strategic</div>
                <div className="comparison-cell">Creative, Passionate</div>
                <div className="comparison-cell">Motivated, Supportive</div>
                <div className="comparison-cell">Informed, Analytical</div>
              </div>

              {/* Best For Row */}
              <div className="comparison-row">
                <div className="comparison-cell comparison-label">
                  <strong>Best For</strong>
                </div>
                <div className="comparison-cell">Gamers seeking competition</div>
                <div className="comparison-cell">Anime/manga enthusiasts</div>
                <div className="comparison-cell">Goal-oriented individuals</div>
                <div className="comparison-cell">News junkies</div>
              </div>
            </div>
          </div>

          {/* Mobile Note */}
          <div className="mobile-comparison-note scroll-reveal">
            <p className="text-small">
              💡 <strong>Tip:</strong> Scroll horizontally to see all pathways on mobile
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 5: STATISTICS SHOWCASE
          ==================================================================== */}
      <section className="statistics-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              By The Numbers
            </h2>
            <p className="text-h4 section-subtitle">
              A thriving community of excellence
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {/* Stat 1 - Total Members */}
            <StatsCard className="scroll-reveal">
              <div className="stat-icon">👥</div>
              <div className="stat-number text-gradient-divine" data-target={stats.totalMembers}>
                0
              </div>
              <div className="stat-label">Noble Souls</div>
              <div className="stat-description">
                Across all pathways
              </div>
            </StatsCard>

            {/* Stat 2 - Active Pathways */}
            <StatsCard className="scroll-reveal" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon">🛤️</div>
              <div className="stat-number text-gradient-gaming" data-target={stats.activePathways}>
                0
              </div>
              <div className="stat-label">Active Pathways</div>
              <div className="stat-description">
                Choose your adventure
              </div>
            </StatsCard>

            {/* Stat 3 - Events This Month */}
            <StatsCard className="scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon">🎉</div>
              <div className="stat-number text-gradient-lorebound" data-target={stats.eventsThisMonth}>
                0
              </div>
              <div className="stat-label">Events This Month</div>
              <div className="stat-description">
                Always something happening
              </div>
            </StatsCard>

            {/* Stat 4 - Achievements */}
            <StatsCard className="scroll-reveal" style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon">🏆</div>
              <div className="stat-number text-gradient-productive" data-target={stats.achievementsUnlocked}>
                0
              </div>
              <div className="stat-label">Achievements Unlocked</div>
              <div className="stat-description">
                And counting...
              </div>
            </StatsCard>
          </div>

          {/* Additional Stats Row */}
          <div className="additional-stats scroll-reveal">
            <div className="additional-stat">
              <span className="stat-value text-gradient-gaming">24/7</span>
              <span className="stat-text">Active Community</span>
            </div>
            <div className="stat-divider" />
            <div className="additional-stat">
              <span className="stat-value text-gradient-lorebound">100+</span>
              <span className="stat-text">Resources Available</span>
            </div>
            <div className="stat-divider" />
            <div className="additional-stat">
              <span className="stat-value text-gradient-productive">4.9★</span>
              <span className="stat-text">Member Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="additional-stat">
              <span className="stat-value text-gradient-news">0%</span>
              <span className="stat-text">Toxicity Tolerance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6: FEATURED HIGHLIGHTS (TEASERS FROM EACH PATHWAY)
          ==================================================================== */}
      <section className="featured-highlights-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              What's Happening Now
            </h2>
            <p className="text-h4 section-subtitle">
              A glimpse into each realm's latest activities
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="highlights-grid">
            {/* Gaming Highlight */}
            <div className="highlight-card gaming-realm scroll-reveal">
              <div className="highlight-header">
                <div className="highlight-icon">🎮</div>
                <h3 className="text-h3 text-gradient-gaming">Gaming Realm</h3>
              </div>
              
              <div className="highlight-content">
                <h4 className="text-h4">Latest Tournament Champion</h4>
                <p className="text-body">
                  <strong className="text-gradient-gaming">@ShadowStriker</strong> dominated the recent Valorant Championship, 
                  securing a perfect 15-0 record and claiming the title of Gaming Realm Champion!
                </p>
                
                <div className="highlight-meta">
                  <span className="meta-item">🏆 1st Place</span>
                  <span className="meta-item">💰 $500 Prize Pool</span>
                  <span className="meta-item">⏰ 2 days ago</span>
                </div>
              </div>

              <div className="highlight-footer">
                <GamingButton 
                  size="small" 
                  onClick={() => handlePathwaySelect('gaming')}
                >
                  View Leaderboards →
                </GamingButton>
              </div>
            </div>

            {/* Lorebound Highlight */}
            <div className="highlight-card lorebound-realm scroll-reveal" style={{ animationDelay: '0.1s' }}>
              <div className="highlight-header">
                <div className="highlight-icon">📚</div>
                <h3 className="text-h3 text-gradient-lorebound">Lorebound Sanctuary</h3>
              </div>
              
              <div className="highlight-content">
                <h4 className="text-h4">Top Rated Novel This Month</h4>
                <p className="text-body">
                  <strong className="text-gradient-lorebound">Reverend Insanity</strong> takes the crown with a stellar 10/10 rating! 
                  Members praise its ruthless protagonist and intricate world-building. Now available in our library.
                </p>
                
                <div className="highlight-meta">
                  <span className="meta-item">⭐ 10/10 Rating</span>
                  <span className="meta-item">📖 500+ Chapters</span>
                  <span className="meta-item">🔥 Trending</span>
                </div>
              </div>

              <div className="highlight-footer">
                <LoreboundButton 
                  size="small" 
                  onClick={() => router.push('/pathways/lorebound/library')}
                >
                  Browse Library →
                </LoreboundButton>
              </div>
            </div>

            {/* Productive Highlight */}
            <div className="highlight-card productive-realm scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="highlight-header">
                <div className="highlight-icon">⚡</div>
                <h3 className="text-h3 text-gradient-productive">Productivity Palace</h3>
              </div>
              
              <div className="highlight-content">
                <h4 className="text-h4">Challenge of the Week</h4>
                <p className="text-body">
                  <strong className="text-gradient-productive">30-Day Reading Challenge</strong> kicks off Monday! 
                  Read 30 minutes daily, track your progress, and earn exclusive badges. 42 members already joined!
                </p>
                
                <div className="highlight-meta">
                  <span className="meta-item">🎯 30 Days</span>
                  <span className="meta-item">👥 42 Participants</span>
                  <span className="meta-item">🏅 Badge Reward</span>
                </div>
              </div>

              <div className="highlight-footer">
                <ProductiveButton 
                  size="small" 
                  onClick={() => router.push('/pathways/productive/challenges')}
                >
                  Join Challenge →
                </ProductiveButton>
              </div>
            </div>

            {/* News Highlight */}
            <div className="highlight-card news-realm scroll-reveal" style={{ animationDelay: '0.3s' }}>
              <div className="highlight-header">
                <div className="highlight-icon">📰</div>
                <h3 className="text-h3 text-gradient-news">News Nexus</h3>
              </div>
              
              <div className="highlight-content">
                <h4 className="text-h4">Breaking: Major AI Breakthrough</h4>
                <p className="text-body">
                  <strong className="text-gradient-news">OpenAI announces GPT-5</strong> with unprecedented reasoning capabilities. 
                  Community discussion erupts with 200+ messages analyzing implications for the tech industry.
                </p>
                
                <div className="highlight-meta">
                  <span className="meta-item">⚡ Just Now</span>
                  <span className="meta-item">💬 200+ Comments</span>
                  <span className="meta-item">🔥 Trending #1</span>
                </div>
              </div>

              <div className="highlight-footer">
                <NewsButton 
                  size="small" 
                  onClick={() => router.push('/pathways/news/breaking')}
                >
                  Read Analysis →
                </NewsButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 7: HOW IT WORKS
          ==================================================================== */}
      <section className="how-it-works-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              How It Works
            </h2>
            <p className="text-h4 section-subtitle">
              Your journey to excellence in four simple steps
            </p>
          </div>

          {/* Steps Container */}
          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-card scroll-reveal">
              <div className="step-number">
                <span className="number-circle text-gradient-gaming">01</span>
              </div>
              
              <div className="step-content">
                <h3 className="text-h3 text-gradient-gaming">Choose Your Pathway</h3>
                <p className="text-body">
                  Explore the four pathways and discover where your interests align. 
                  Gaming for competition, Lorebound for storytelling, Productive for growth, News for current events.
                </p>
                
                <div className="step-icon">🛤️</div>
              </div>

              <div className="step-connector" />
            </div>

            {/* Step 2 */}
            <div className="step-card scroll-reveal" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">
                <span className="number-circle text-gradient-lorebound">02</span>
              </div>
              
              <div className="step-content">
                <h3 className="text-h3 text-gradient-lorebound">Join Instantly</h3>
                <p className="text-body">
                  No applications, no waiting periods, no restrictions. 
                  Click "Join Pathway" and you're in! Join multiple pathways—there's no limit to your exploration.
                </p>
                
                <div className="step-icon">⚡</div>
              </div>

              <div className="step-connector" />
            </div>

            {/* Step 3 */}
            <div className="step-card scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">
                <span className="number-circle text-gradient-productive">03</span>
              </div>
              
              <div className="step-content">
                <h3 className="text-h3 text-gradient-productive">Access Exclusive Content</h3>
                <p className="text-body">
                  Unlock pathway-specific channels, resources, events, and more. 
                  E-book libraries, tournament access, challenge systems—it's all waiting for you.
                </p>
                
                <div className="step-icon">🔓</div>
              </div>

              <div className="step-connector" />
            </div>

            {/* Step 4 */}
            <div className="step-card scroll-reveal" style={{ animationDelay: '0.3s' }}>
              <div className="step-number">
                <span className="number-circle text-gradient-news">04</span>
              </div>
              
              <div className="step-content">
                <h3 className="text-h3 text-gradient-news">Engage & Grow</h3>
                <p className="text-body">
                  Participate in events, complete challenges, earn achievements, and climb ranks. 
                  Connect with like-minded souls and watch yourself evolve into a noble legend.
                </p>
                
                <div className="step-icon">🚀</div>
              </div>
            </div>
          </div>

          {/* CTA After Steps */}
          <div className="steps-cta scroll-reveal">
            <p className="text-h4 text-gradient-divine">
              Ready to begin your journey?
            </p>
            <NobleButton 
              size="large" 
              onClick={handleScrollToPortals}
            >
              Choose Your Path
            </NobleButton>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8: COMMUNITY TESTIMONIALS
          ==================================================================== */}
      <section className="testimonials-section" ref={testimonialsRef}>
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              Voices of the Noble
            </h2>
            <p className="text-h4 section-subtitle">
              Hear from members who found their home in The Conclave
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="testimonials-grid">
            {/* Testimonial 1 - Gaming */}
            <div className="testimonial-card scroll-reveal">
              <div className="testimonial-quote">
                <span className="quote-icon">"</span>
                <p className="text-body">
                  The Gaming Realm completely transformed my competitive gaming experience. 
                  I went from casual player to tournament champion in just 3 months. 
                  The community support and structured events are unmatched!
                </p>
                <span className="quote-icon closing">"</span>
              </div>

              <div className="testimonial-author">
                <div className="author-avatar gaming-border">
                  <span className="avatar-placeholder">🎮</span>
                </div>
                <div className="author-info">
                  <h4 className="text-h4">ShadowStriker</h4>
                  <p className="text-small text-gradient-gaming">Gaming Realm Champion</p>
                  <div className="author-badges">
                    <span className="badge badge-gaming">🏆 Tournament Winner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Lorebound */}
            <div className="testimonial-card scroll-reveal" style={{ animationDelay: '0.1s' }}>
              <div className="testimonial-quote">
                <span className="quote-icon">"</span>
                <p className="text-body">
                  As an anime enthusiast, finding Lorebound Sanctuary felt like coming home. 
                  The e-book library is incredible, watch parties are amazing, and I've discovered 
                  so many hidden gems through member recommendations!
                </p>
                <span className="quote-icon closing">"</span>
              </div>

              <div className="testimonial-author">
                <div className="author-avatar lorebound-border">
                  <span className="avatar-placeholder">📚</span>
                </div>
                <div className="author-info">
                  <h4 className="text-h4">MysticReader</h4>
                  <p className="text-small text-gradient-lorebound">Lore Keeper</p>
                  <div className="author-badges">
                    <span className="badge badge-lorebound">📖 1000+ Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 - Productive */}
            <div className="testimonial-card scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="testimonial-quote">
                <span className="quote-icon">"</span>
                <p className="text-body">
                  Productivity Palace changed my life. The 30-day challenges pushed me to build 
                  habits I'd been putting off for years. My accountability partner keeps me motivated, 
                  and I've achieved goals I never thought possible!
                </p>
                <span className="quote-icon closing">"</span>
              </div>

              <div className="testimonial-author">
                <div className="author-avatar productive-border">
                  <span className="avatar-placeholder">⚡</span>
                </div>
                <div className="author-info">
                  <h4 className="text-h4">GoalCrusher</h4>
                  <p className="text-small text-gradient-productive">Master of Productivity</p>
                  <div className="author-badges">
                    <span className="badge badge-productive">🎯 50+ Goals Achieved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 4 - News */}
            <div className="testimonial-card scroll-reveal" style={{ animationDelay: '0.3s' }}>
              <div className="testimonial-quote">
                <span className="quote-icon">"</span>
                <p className="text-body">
                  News Nexus is where I stay informed without the toxicity. Civil discussions, 
                  fact-checked information, and diverse perspectives make it the best place 
                  to understand what's really happening in the world.
                </p>
                <span className="quote-icon closing">"</span>
              </div>

              <div className="testimonial-author">
                <div className="author-avatar news-border">
                  <span className="avatar-placeholder">📰</span>
                </div>
                <div className="author-info">
                  <h4 className="text-h4">TruthSeeker</h4>
                  <p className="text-small text-gradient-news">News Analyst</p>
                  <div className="author-badges">
                    <span className="badge badge-news">💡 500+ Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Stats */}
          <div className="testimonial-stats scroll-reveal">
            <div className="testimonial-stat">
              <span className="stat-number-large text-gradient-divine">98%</span>
              <span className="stat-label">Member Satisfaction</span>
            </div>
            <div className="stat-divider" />
            <div className="testimonial-stat">
              <span className="stat-number-large text-gradient-gaming">4.9★</span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="testimonial-stat">
              <span className="stat-number-large text-gradient-lorebound">200+</span>
              <span className="stat-label">5-Star Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 9: PATHWAY FEATURES DEEP DIVE
          ==================================================================== */}
      <section className="features-deep-dive-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              What Each Pathway Offers
            </h2>
            <p className="text-h4 section-subtitle">
              Dive deeper into the unique features of each realm
            </p>
          </div>

          {/* Features Accordion */}
          <div className="features-accordion">
            {/* Gaming Features */}
            <div className="feature-section gaming-realm scroll-reveal">
              <div className="feature-section-header">
                <div className="feature-icon">🎮</div>
                <h3 className="text-h2 text-gradient-gaming">Gaming Realm Features</h3>
              </div>
              
              <div className="feature-grid">
                <FeatureCard
                  icon="🏆"
                  title="Tournaments & Competitions"
                  description="Participate in organized tournaments across multiple games. Weekly events, seasonal championships, and casual game nights."
                  pathway="gaming"
                />
                <FeatureCard
                  icon="📊"
                  title="Live Leaderboards"
                  description="Track your ranking in real-time. Compete for top positions and earn exclusive badges for your achievements."
                  pathway="gaming"
                />
                <FeatureCard
                  icon="🤖"
                  title="Gaming Bot Integration"
                  description="Custom bots for stats tracking, match scheduling, and automated tournament brackets. Full command documentation available."
                  pathway="gaming"
                />
                <FeatureCard
                  icon="🎮"
                  title="Multi-Game Support"
                  description="From FPS to MOBA, strategy to casual—all game genres welcome. Active communities for LoL, Valorant, CS:GO, and more."
                  pathway="gaming"
                />
              </div>
            </div>

            {/* Lorebound Features */}
            <div className="feature-section lorebound-realm scroll-reveal">
              <div className="feature-section-header">
                <div className="feature-icon">📚</div>
                <h3 className="text-h2 text-gradient-lorebound">Lorebound Sanctuary Features</h3>
              </div>
              
              <div className="feature-grid">
                <FeatureCard
                  icon="📖"
                  title="Extensive E-Book Library"
                  description="Access our growing collection of light novels, manga, and web novels. Read online or download for offline reading."
                  pathway="lorebound"
                />
                <FeatureCard
                  icon="⭐"
                  title="Community Reviews & Ratings"
                  description="Share your thoughts, read member reviews, and discover your next favorite series through curated recommendations."
                  pathway="lorebound"
                />
                <FeatureCard
                  icon="📺"
                  title="Watch Party Events"
                  description="Join synchronized anime viewing sessions with fellow otaku. Discuss episodes in real-time and make new friends."
                  pathway="lorebound"
                />
                <FeatureCard
                  icon="🌐"
                  title="Curated Site Collections"
                  description="Verified streaming sites, manga readers, and novel platforms. We've tested them all so you don't have to."
                  pathway="lorebound"
                />
              </div>
            </div>

            {/* Productive Features */}
            <div className="feature-section productive-realm scroll-reveal">
              <div className="feature-section-header">
                <div className="feature-icon">⚡</div>
                <h3 className="text-h2 text-gradient-productive">Productivity Palace Features</h3>
              </div>
              
              <div className="feature-grid">
                <FeatureCard
                  icon="🎯"
                  title="Goal Tracking System"
                  description="Set personal goals, track progress, and celebrate milestones. Visual progress bars keep you motivated."
                  pathway="productive"
                />
                <FeatureCard
                  icon="📚"
                  title="Resource Library"
                  description="Self-help books, productivity tools, and curated guides. From 48 Laws of Power to Zero to One—we've got you covered."
                  pathway="productive"
                />
                <FeatureCard
                  icon="🏆"
                  title="30-Day Challenges"
                  description="Join structured challenges to build lasting habits. Reading, coding, fitness—new challenges every month."
                  pathway="productive"
                />
                <FeatureCard
                  icon="🤝"
                  title="Accountability Partners"
                  description="Find partners who share your goals. Check in daily, share progress, and push each other to excellence."
                  pathway="productive"
                />
              </div>
            </div>

            {/* News Features */}
            <div className="feature-section news-realm scroll-reveal">
              <div className="feature-section-header">
                <div className="feature-icon">📰</div>
                <h3 className="text-h2 text-gradient-news">News Nexus Features</h3>
              </div>
              
              <div className="feature-grid">
                <FeatureCard
                  icon="⚡"
                  title="Real-Time Breaking News"
                  description="Stay updated with major world events as they happen. No delays, no fluff—just what matters."
                  pathway="news"
                />
                <FeatureCard
                  icon="🔍"
                  title="Expert Analysis"
                  description="Deep dives into complex topics by knowledgeable members. Understand the why behind the what."
                  pathway="news"
                />
                <FeatureCard
                  icon="✓"
                  title="Fact Checking"
                  description="Source verification and fact-checking culture. We value truth over sensationalism."
                  pathway="news"
                />
                <FeatureCard
                  icon="💬"
                  title="Civil Discussion Forums"
                  description="Engage in respectful debates on current events. Diverse perspectives, zero toxicity tolerance."
                  pathway="news"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 10: FREQUENTLY ASKED QUESTIONS
          ==================================================================== */}
      <section className="faq-section">
        <div className="container">
          {/* Section Header */}
          <div className="section-header scroll-reveal">
            <h2 className="text-h1 text-gradient-divine text-glow-soft">
              Common Questions
            </h2>
            <p className="text-h4 section-subtitle">
              Everything you need to know about pathways
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="faq-grid">
            {/* FAQ 1 */}
            <div className="faq-card scroll-reveal">
              <div className="faq-question">
                <h4 className="text-h4">Can I join multiple pathways?</h4>
              </div>
              <div className="faq-answer">
                <p className="text-body">
                  Absolutely! There are zero restrictions. Join all four if you'd like—explore Gaming, 
                  dive into Lorebound, master Productivity, and stay informed with News. Your journey, your choice.
                </p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="faq-card scroll-reveal" style={{ animationDelay: '0.1s' }}>
              <div className="faq-question">
                <h4 className="text-h4">Is there a cost to join pathways?</h4>
              </div>
              <div className="faq-answer">
                <p className="text-body">
                  Nope! All pathways are completely free. No subscriptions, no hidden fees. 
                  Access to e-books, events, resources—it's all included with your Discord membership.
                </p>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="faq-card scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="faq-question">
                <h4 className="text-h4">How do I leave a pathway?</h4>
              </div>
              <div className="faq-answer">
                <p className="text-body">
                  Just as easy as joining! Visit the pathway page and click "Leave Pathway." 
                  You can rejoin anytime—no questions asked, no penalties.
                </p>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="faq-card scroll-reveal" style={{ animationDelay: '0.3s' }}>
              <div className="faq-question">
                <h4 className="text-h4">What are pathway achievements?</h4>
              </div>
              <div className="faq-answer">
                <p className="text-body">
                  Badges and ranks earned through participation. Complete challenges, attend events, 
                  contribute to discussions—each action counts toward your progression in the pathway.
                </p>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="faq-card scroll-reveal" style={{ animationDelay: '0.4s' }}>
              <div className="faq-question">
                <h4 className="text-h4">Can I suggest content for pathways?</h4>
              </div>
              <div className="faq-answer">
                <p className="text-body">
                  Yes! We love member contributions. Suggest e-books, tournament ideas, challenges, 
                  news sources—staff reviews all submissions and adds quality content regularly.
                </p>
              </div>
            </div>

            {/* FAQ 6 */}
            <div className="faq-card scroll-reveal" style={{ animationDelay: '0.5s' }}>
              <div className="faq-question">
                <h4 className="text-h4">Are there exclusive pathway events?</h4>
              </div>
              <div className="faq-answer">
                <p className="text-body">
                  Definitely! Each pathway hosts exclusive events—gaming tournaments, lorebound watch parties, 
                  productive challenges, and news debates. Check your pathway page for the calendar.
                </p>
              </div>
            </div>
          </div>

          {/* Still Have Questions CTA */}
          <div className="faq-cta scroll-reveal">
            <p className="text-h4">Still have questions?</p>
            <NobleButton 
              size="medium" 
              onClick={handleJoinDiscord}
            >
              Ask in Discord
            </NobleButton>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 11: FINAL CALL TO ACTION
          ==================================================================== */}
      <section className="final-cta-section">
        {/* Background Video */}
        <div className="cta-video-container">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="cta-video"
          >
            <source src="/Assets/Videos/hero_video2.mp4" type="video/mp4" />
          </video>
          <div className="cta-video-overlay" />
        </div>

        <div className="container">
          <div className="cta-content scroll-reveal">
            {/* Decorative Elements */}
            <div className="cta-decoration top" />
            
            {/* Main CTA Text */}
            <h2 className="text-display text-gradient-divine text-glow-intense">
              Your Journey Begins Now
            </h2>
            
            <p className="text-h3 cta-subtitle">
              Join <span className="text-gradient-gaming">{stats.totalMembers.toLocaleString()}+ noble souls</span> who've found their path
            </p>

            <p className="text-h4 cta-description">
              Four pathways. Infinite possibilities. One extraordinary community.
            </p>

            {/* Dual CTA Buttons */}
            <div className="cta-buttons">
              <NobleButton 
                size="xlarge" 
                onClick={handleScrollToPortals}
                className="cta-primary-button"
              >
                <span className="button-text">Choose Your Pathway</span>
                <span className="button-icon">→</span>
              </NobleButton>

              <TextFlameButton
                size="xlarge"
                onClick={handleJoinDiscord}
                className="cta-secondary-button"
              >
                <span className="button-text">Join Discord</span>
                <span className="button-icon">↗</span>
              </TextFlameButton>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span className="trust-text">No Applications Required</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span className="trust-text">Join Instantly</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span className="trust-text">100% Free</span>
              </div>
            </div>

            {/* Bottom Decoration */}
            <div className="cta-decoration bottom" />
          </div>
        </div>
      </section>

      {/* ====================================================================
          GLOBAL STYLES FOR THIS PAGE
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           PATHWAYS OVERVIEW PAGE STYLES
           ================================================================ */
        
        .pathways-overview-page {
          position: relative;
          min-height: 100vh;
        }

        /* ================================================================
           SECTION 1: HERO STYLES
           ================================================================ */
        
        .pathways-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.7) 0%,
            rgba(10, 10, 15, 0.85) 50%,
            rgba(10, 10, 15, 0.95) 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 2rem;
        }

        .hero-text-wrapper {
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-line {
          width: 100px;
          height: 3px;
          background: var(--cns-gold);
          margin: 0 auto 2rem;
          box-shadow: 0 0 20px var(--cns-gold);
        }

        .hero-description {
          margin: 2rem auto;
          max-width: 700px;
          line-height: 1.8;
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 3rem 0;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          justify-content: center;
          align-items: center;
          margin-top: 4rem;
          flex-wrap: wrap;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-number-small {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-josefin);
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .hero-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 3;
        }

        .scroll-icon {
          width: 30px;
          height: 50px;
          border: 2px solid var(--cns-gold);
          border-radius: 20px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .scroll-icon span {
          font-size: 1.5rem;
          animation: scrollBounce 2s infinite;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }

        /* ================================================================
           SECTION 2: PATHWAY PORTALS STYLES
           ================================================================ */
        
        .pathway-portals-section {
          padding: 8rem 0;
          position: relative;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.95) 0%,
            rgba(10, 10, 15, 1) 50%,
            rgba(10, 10, 15, 0.95) 100%
          );
        }

        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-subtitle {
          margin-top: 1rem;
          opacity: 0.8;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .portals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .portal-wrapper {
          position: relative;
          transition: transform 0.3s ease;
        }

        .portal-wrapper:hover {
          transform: translateY(-10px);
        }

        .portal-info-overlay {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(10, 10, 15, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
          z-index: 10;
        }

        .portal-features ul {
          list-style: none;
          padding: 0;
          margin-top: 1rem;
        }

        .portal-features li {
          padding: 0.5rem 0;
          opacity: 0.9;
        }

        .portal-note {
          text-align: center;
          margin-top: 3rem;
          padding: 2rem;
          background: rgba(255, 215, 0, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        /* ================================================================
           SECTION 3: WHY PATHWAYS STYLES
           ================================================================ */
        
        .why-pathways-section {
          padding: 8rem 0;
          position: relative;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .benefit-card {
          transition: transform 0.3s ease;
        }

        .benefit-card:hover {
          transform: translateY(-5px);
        }

        /* ================================================================
           SECTION 4: COMPARISON TABLE STYLES
           ================================================================ */
        
        .pathway-comparison-section {
          padding: 8rem 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .comparison-table-wrapper {
          overflow-x: auto;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          padding: 2rem;
        }

        .comparison-table {
          min-width: 800px;
          width: 100%;
        }

        .comparison-header,
        .comparison-row {
          display: grid;
          grid-template-columns: 200px repeat(4, 1fr);
          gap: 1rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-header {
          border-bottom: 2px solid var(--cns-gold);
        }

        .comparison-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1rem;
        }

        .comparison-label {
          align-items: flex-start;
          text-align: left;
          font-weight: 600;
        }

        .pathway-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .activity-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .activity-badge.very-high {
          background: rgba(255, 20, 147, 0.2);
          color: #FF1493;
          border: 1px solid #FF1493;
        }

        .activity-badge.high {
          background: rgba(0, 191, 255, 0.2);
          color: #00BFFF;
          border: 1px solid #00BFFF;
        }

        .activity-badge.medium {
          background: rgba(224, 17, 95, 0.2);
          color: #E0115F;
          border: 1px solid #E0115F;
        }

        .mobile-comparison-note {
          text-align: center;
          margin-top: 2rem;
          opacity: 0.7;
        }

        /* ================================================================
           SECTION 5: STATISTICS STYLES
           ================================================================ */
        
        .statistics-section {
          padding: 8rem 0;
          position: relative;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .stat-number {
          font-size: 3.5rem;
          font-weight: 700;
          font-family: var(--font-josefin);
          margin: 1rem 0;
        }

        .stat-description {
          font-size: 0.875rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        .additional-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          padding: 3rem;
          background: rgba(255, 215, 0, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 215, 0, 0.2);
          flex-wrap: wrap;
        }

        .additional-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-text {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .stat-divider {
          width: 1px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
        }

        /* ================================================================
           SECTION 6: FEATURED HIGHLIGHTS STYLES
           ================================================================ */
        
        .featured-highlights-section {
          padding: 8rem 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .highlight-card {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .highlight-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .highlight-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .highlight-icon {
          font-size: 2rem;
        }

        .highlight-content {
          margin-bottom: 2rem;
        }

        .highlight-content h4 {
          margin: 1rem 0;
        }

        .highlight-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .meta-item {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .highlight-footer {
          margin-top: 1.5rem;
        }

        /* ================================================================
           SECTION 7: HOW IT WORKS STYLES
           ================================================================ */
        
        .how-it-works-section {
          padding: 8rem 0;
          position: relative;
        }

        .steps-container {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .step-card {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
          position: relative;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .number-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          border: 3px solid;
          background: rgba(255, 255, 255, 0.02);
        }

        .step-content {
          padding: 1rem 0;
        }

        .step-content h3 {
          margin-bottom: 1rem;
        }

        .step-icon {
          font-size: 3rem;
          margin-top: 1rem;
        }

        .step-connector {
          position: absolute;
          left: 50px;
          top: 80px;
          width: 2px;
          height: calc(100% + 2rem);
          background: linear-gradient(
            to bottom,
            rgba(255, 215, 0, 0.5),
            rgba(255, 215, 0, 0.1)
          );
        }

        .step-card:last-child .step-connector {
          display: none;
        }

        .steps-cta {
          text-align: center;
          margin-top: 4rem;
          padding: 3rem;
          background: rgba(255, 215, 0, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .steps-cta p {
          margin-bottom: 2rem;
        }

        /* ================================================================
           SECTION 8: TESTIMONIALS STYLES
           ================================================================ */
        
        .testimonials-section {
          padding: 8rem 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
        }

        .testimonial-quote {
          position: relative;
          margin-bottom: 2rem;
        }

        .quote-icon {
          font-size: 4rem;
          color: var(--cns-gold);
          opacity: 0.3;
          line-height: 1;
        }

        .quote-icon.closing {
          float: right;
          margin-top: -2rem;
        }

        .testimonial-author {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .author-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          border: 3px solid;
        }

        .author-avatar.gaming-border {
          border-color: var(--gaming-cyan);
          background: rgba(0, 191, 255, 0.1);
        }

        .author-avatar.lorebound-border {
          border-color: var(--lorebound-purple);
          background: rgba(255, 20, 147, 0.1);
        }

        .author-avatar.productive-border {
          border-color: var(--productive-emerald);
          background: rgba(80, 200, 120, 0.1);
        }

        .author-avatar.news-border {
          border-color: var(--news-red);
          background: rgba(224, 17, 95, 0.1);
        }

        .author-info {
          flex: 1;
        }

        .author-info h4 {
          margin-bottom: 0.25rem;
        }

        .author-badges {
          margin-top: 0.5rem;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-gaming {
          background: rgba(0, 191, 255, 0.2);
          color: var(--gaming-cyan);
        }

        .badge-lorebound {
          background: rgba(255, 20, 147, 0.2);
          color: var(--lorebound-purple);
        }

        .badge-productive {
          background: rgba(80, 200, 120, 0.2);
          color: var(--productive-emerald);
        }

        .badge-news {
          background: rgba(224, 17, 95, 0.2);
          color: var(--news-red);
        }

        .testimonial-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          padding: 3rem;
          background: rgba(255, 215, 0, 0.05);
          border-radius: 16px;
          flex-wrap: wrap;
        }

        .testimonial-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-number-large {
          font-size: 3rem;
          font-weight: 700;
        }

        /* ================================================================
           SECTION 9: FEATURES DEEP DIVE STYLES
           ================================================================ */
        
        .features-deep-dive-section {
          padding: 8rem 0;
        }

        .features-accordion {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .feature-section {
          padding: 3rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature-section-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-icon {
          font-size: 3rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        /* ================================================================
           SECTION 10: FAQ STYLES
           ================================================================ */
        
        .faq-section {
          padding: 8rem 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .faq-card {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .faq-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 215, 0, 0.5);
        }

        .faq-question {
          margin-bottom: 1rem;
        }

        .faq-question h4 {
          color: var(--cns-gold);
        }

        .faq-answer {
          opacity: 0.9;
        }

        .faq-cta {
          text-align: center;
          margin-top: 4rem;
          padding: 3rem;
          background: rgba(255, 215, 0, 0.05);
          border-radius: 16px;
        }

        .faq-cta p {
          margin-bottom: 2rem;
        }

        /* ================================================================
           SECTION 11: FINAL CTA STYLES
           ================================================================ */
        
        .final-cta-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .cta-video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .cta-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cta-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.8),
            rgba(10, 10, 15, 0.9)
          );
        }

        .cta-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 4rem 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .cta-decoration {
          width: 100px;
          height: 3px;
          background: var(--cns-gold);
          margin: 0 auto;
          box-shadow: 0 0 20px var(--cns-gold);
        }

        .cta-decoration.top {
          margin-bottom: 3rem;
        }

        .cta-decoration.bottom {
          margin-top: 3rem;
        }

        .cta-subtitle {
          margin: 2rem 0;
        }

        .cta-description {
          margin: 2rem auto;
          opacity: 0.9;
          max-width: 600px;
        }

        .cta-buttons {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 3rem 0;
        }

        .cta-primary-button,
        .cta-secondary-button {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .button-icon {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .cta-primary-button:hover .button-icon {
          transform: translateX(5px);
        }

        .cta-secondary-button:hover .button-icon {
          transform: translate(3px, -3px);
        }

        .trust-indicators {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .trust-icon {
          color: var(--cns-gold);
          font-weight: 700;
        }

        .trust-text {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .trust-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
        }

        /* ================================================================
           SCROLL REVEAL ANIMATION
           ================================================================ */
        
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ================================================================
           RESPONSIVE DESIGN
           ================================================================ */
        
        @media (max-width: 1024px) {
          .portals-grid {
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          }

          .comparison-table {
            min-width: 700px;
          }
        }

        @media (max-width: 768px) {
          .pathways-hero,
          .final-cta-section {
            min-height: 80vh;
          }

          .hero-content {
            padding: 1rem;
          }

          .text-display {
            font-size: 3rem !important;
          }

          .text-h1 {
            font-size: 2.5rem !important;
          }

          .text-h2 {
            font-size: 2rem !important;
          }

          .text-h3 {
            font-size: 1.5rem !important;
          }

          .hero-buttons,
          .cta-buttons {
            flex-direction: column;
            gap: 1rem;
          }

          .hero-stats {
            gap: 1rem;
          }

          .portals-grid {
            grid-template-columns: 1fr;
          }

          .portal-info-overlay {
            display: none;
          }

          .benefits-grid,
          .stats-grid,
          .highlights-grid,
          .testimonials-grid,
          .feature-grid,
          .faq-grid {
            grid-template-columns: 1fr;
          }

          .comparison-table {
            min-width: 600px;
          }

          .step-card {
            grid-template-columns: 60px 1fr;
            gap: 1rem;
          }

          .number-circle {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }

          .step-connector {
            left: 30px;
          }

          .additional-stats,
          .testimonial-stats,
          .trust-indicators {
            gap: 1.5rem;
          }

          .stat-divider,
          .trust-divider {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .text-display {
            font-size: 2.5rem !important;
          }

          .text-h1 {
            font-size: 2rem !important;
          }

          .stat-number {
            font-size: 2.5rem;
          }

          .stat-number-large {
            font-size: 2rem;
          }

          .pathway-portals-section,
          .why-pathways-section,
          .pathway-comparison-section,
          .statistics-section,
          .featured-highlights-section,
          .how-it-works-section,
          .testimonials-section,
          .features-deep-dive-section,
          .faq-section {
            padding: 4rem 0;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .scroll-reveal,
          .portal-wrapper,
          .benefit-card,
          .highlight-card,
          .testimonial-card,
          .faq-card,
          .step-card {
            animation: none !important;
            transition: none !important;
          }

          .scroll-icon span {
            animation: none !important;
          }

          .hero-video,
          .cta-video {
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .hero-video-overlay,
          .cta-video-overlay {
            background: rgba(0, 0, 0, 0.9);
          }

          .portal-note,
          .steps-cta,
          .testimonial-stats,
          .additional-stats,
          .faq-cta {
            border-width: 2px;
          }
        }
      `}</style>
    </div>
  );
}