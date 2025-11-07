// ============================================================================
// HOMEPAGE - The Conclave Realm - ULTIMATE ROLLS-ROYCE LUXURY EXPERIENCE
// Better than Rolls-Royce - Maximum elegance, smooth scrolling, cinematic
// Location: /src/app/page.jsx
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Context & Hooks
import { useAppContext } from '@/contexts/AppProvider';
import { useAuth } from '@/hooks/useAuth';
import { useDiscord } from '@/hooks/useDiscord';
import { usePathways } from '@/hooks/usePathways';
import { useSound } from '@/hooks/useSound';

// UI Components
import { NobleButton, TextFlameButton } from '@/components/ui/LuxuryButton';
import LoadingCrest from '@/components/ui/LoadingCrest';
import { StatsCard, ProfileCard, FeatureCard } from '@/components/ui/GlassCard';

// SuperButtons - THE STAR OF THE SHOW
import SuperButton, {
  GamingPortal,
  LoreboundPortal,
  ProductivePortal,
  NewsPortal,
  SuperButtonGroup,
  EventShowcase,
  AchievementShowcase,
  DiscordJoinButton,
  CommunityStats
} from '@/components/ui/SuperButton';

// Content Components
import EventCard from '@/components/content/EventCard';
import MemberSpotlight from '@/components/content/MemberSpotlight';
import ArticleCard from '@/components/content/ArticleCard';

// Interactive Components
import { DiscordLiveStats } from '@/components/interactive/LiveStats';
import { notify } from '@/components/interactive/NotificationCenter';

// Data & Constants
import { getAllPathways, getFeaturedPathways } from '@/data/pathways';
import { getUpcomingEvents } from '@/data/events';
import { getRandomQuote, getAllAchievements } from '@/data/lore';
import { getActiveStaffMembers, getStaffHierarchy } from '@/data/staff';
import { formatDate, formatNumber, getRelativeTime, debounce } from '@/lib/utils';

// Icons (Lucide React)
import { 
  ChevronDown, 
  Sparkles, 
  Crown, 
  Users, 
  Calendar, 
  Award,
  Shield,
  Zap,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// HOMEPAGE COMPONENT
// ============================================================================
export default function HomePage() {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    serverData, 
    soundsEnabled, 
    animationsEnabled,
    isMobile,
    playHover,
    playClick
  } = useAppContext();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [pathways, setPathways] = useState([]);
  const [events, setEvents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [quote, setQuote] = useState(null);

  // Refs for video backgrounds
  const hero1VideoRef = useRef(null);
  const hero2VideoRef = useRef(null);
  const bgVideoRef = useRef(null);

  // Refs for scroll sections
  const hero1Ref = useRef(null);
  const hero2Ref = useRef(null);
  const pathwaysRef = useRef(null);
  const statsRef = useRef(null);
  const featuredRef = useRef(null);
  const ctaRef = useRef(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load pathways
        const allPathways = getAllPathways();
        setPathways(allPathways);

        // Load events
        const upcomingEvents = getUpcomingEvents();
        setEvents(upcomingEvents.slice(0, 3));

        // Load staff
        const activeStaff = getActiveStaffMembers();
        setStaff(activeStaff.slice(0, 6));

        // Load quote
        const randomQuote = getRandomQuote();
        setQuote(randomQuote);

        // Process server stats
        if (serverData) {
          setStats({
            totalMembers: serverData.memberCount || 2547,
            onlineMembers: serverData.onlineCount || 342,
            totalEvents: serverData.eventCount || 50,
            pathwaysCount: 4,
            achievementsCount: getAllAchievements().length || 156,
            serverAge: calculateServerAge(serverData.createdAt),
            boostersCount: serverData.boosterCount || 28,
            staffCount: activeStaff.length
          });
        }

        setIsLoading(false);

        // Welcome notification
        if (!isAuthenticated && !sessionStorage.getItem('welcomed')) {
          setTimeout(() => {
            notify.success('Welcome to The Conclave Realm', {
              title: 'Noble Greetings',
              duration: 5000
            });
            sessionStorage.setItem('welcomed', 'true');
          }, 1500);
        }
      } catch (error) {
        console.error('Data loading error:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [serverData, isAuthenticated]);

  // ============================================================================
  // SCROLL EFFECTS (ROLLS-ROYCE SMOOTH SCROLLING)
  // ============================================================================
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.pageYOffset);

      // Parallax effect on videos
      const hero1 = hero1Ref.current;
      const hero2 = hero2Ref.current;

      if (hero1) {
        const hero1Top = hero1.getBoundingClientRect().top;
        hero1.style.transform = `translateY(${hero1Top * 0.5}px)`;
        hero1.style.opacity = Math.max(0, 1 - (Math.abs(hero1Top) / window.innerHeight));
      }

      if (hero2) {
        const hero2Top = hero2.getBoundingClientRect().top;
        hero2.style.transform = `translateY(${hero2Top * 0.3}px)`;
        hero2.style.opacity = Math.max(0, 1 - (Math.abs(hero2Top) / window.innerHeight));
      }
    };

    const debouncedScroll = debounce(handleScroll, 10);
    window.addEventListener('scroll', debouncedScroll, { passive: true });

    return () => window.removeEventListener('scroll', debouncedScroll);
  }, []);

  // ============================================================================
  // INTERSECTION OBSERVER (SCROLL REVEALS)
  // ============================================================================
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          setVisibleSections(prev => new Set(prev).add(entry.target.id));

          // Play video when section is visible
          const video = entry.target.querySelector('video');
          if (video) {
            video.play().catch(err => console.log('Video autoplay blocked:', err));
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = [
      hero1Ref.current,
      hero2Ref.current,
      pathwaysRef.current,
      statsRef.current,
      featuredRef.current,
      ctaRef.current
    ].filter(Boolean);

    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const calculateServerAge = (createdAt) => {
    if (!createdAt) return 'Since 2024';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      playClick();
    }
  };

  const handlePathwayClick = (pathwayId) => {
    playClick();
    router.push(`/pathways/${pathwayId}`);
  };

  const handleJoinClick = () => {
    playClick();
    router.push('/gateway');
  };

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================
  if (isLoading) {
    return <LoadingCrest message="Entering The Conclave..." progress={75} />;
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="homepage-container">
      {/* ================================================================
          SECTION 1: HERO SECTION 1 - MAIN ENTRANCE
          Background: hero_video1.mp4
          ================================================================ */}
      <section 
        ref={hero1Ref}
        id="hero-1"
        className="hero-section hero-section-1 scroll-reveal"
      >
        {/* Video Background */}
        <div className="hero-video-container">
          <video
            ref={hero1VideoRef}
            className="hero-video parallax-bg"
            autoPlay
            loop
            muted
            playsInline
            poster="/Assets/Images/hero-poster.jpg"
          >
            <source src="/Assets/Videos/hero_video1.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          {/* Logo */}
          <div className="hero-logo-container animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Image
              src="/Assets/svg/CNS_logo1.svg"
              alt="The Conclave Logo"
              width={200}
              height={200}
              priority
              className="hero-logo"
            />
          </div>

          {/* Main Title */}
          <h1 
            className="text-h1 text-gradient-divine hero-title animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            THE CONCLAVE
          </h1>

          {/* Tagline */}
          <p 
            className="text-h3 text-glow-soft hero-tagline animate-fade-in"
            style={{ animationDelay: '1.2s' }}
          >
            A Realm of Distinguished Souls
          </p>

          {/* CTA Button */}
          <div 
            className="hero-cta animate-fade-in"
            style={{ animationDelay: '1.6s' }}
          >
            <NobleButton
              size="large"
              onClick={handleJoinClick}
              onMouseEnter={playHover}
              className="hero-main-cta"
            >
              Join The Conclave
            </NobleButton>
          </div>

          {/* Scroll Indicator */}
          <div 
            className="scroll-indicator animate-fade-in"
            style={{ animationDelay: '2s' }}
            onClick={() => scrollToSection(hero2Ref)}
          >
            <span className="scroll-text text-caption">Scroll to Explore</span>
            <ChevronDown className="scroll-icon" />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2: HERO SECTION 2 - PATHWAYS INTRODUCTION
          Background: hero_video2.mp4
          ================================================================ */}
      <section 
        ref={hero2Ref}
        id="hero-2"
        className="hero-section hero-section-2 scroll-reveal"
      >
        {/* Video Background */}
        <div className="hero-video-container">
          <video
            ref={hero2VideoRef}
            className="hero-video parallax-bg"
            loop
            muted
            playsInline
          >
            <source src="/Assets/Videos/hero_video2.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay hero-video-overlay-light" />
        </div>

        {/* Hero 2 Content */}
        <div className="hero-content">
          <h1 className="text-display text-gradient-divine">
            Experience Excellence
            <br />
            Across Four Noble Pathways
          </h1>

          <p className="text-h3 text-body-large" style={{ marginTop: '2rem' }}>
            Gaming · Lorebound · Productive · News
          </p>

          <div className="hero-description text-body" style={{ marginTop: '3rem', maxWidth: '800px' }}>
            Discover your calling in our meticulously crafted realms. Each pathway offers 
            unique experiences, exclusive content, and a thriving community of like-minded 
            noble souls pursuing excellence.
          </div>

          {/* Continue Indicator */}
          <div 
            className="scroll-indicator"
            onClick={() => scrollToSection(pathwaysRef)}
            style={{ marginTop: '4rem' }}
          >
            <span className="scroll-text text-caption">Continue Journey</span>
            <ChevronDown className="scroll-icon" />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3: PATHWAY PORTALS - CHOOSE YOUR PATH
          Background: backgroundblack.mp4
          ================================================================ */}
      <section 
        ref={pathwaysRef}
        id="pathways"
        className="pathways-section scroll-reveal"
      >
        {/* Background Video */}
        <div className="bg-video-container">
          <video
            ref={bgVideoRef}
            className="bg-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/Assets/Videos/backgroundblack.mp4" type="video/mp4" />
          </video>
          <div className="bg-video-overlay" />
        </div>

        {/* Section Content */}
        <div className="section-content">
          {/* Section Header */}
          <div className="section-header text-center">
            <h2 className="text-h1 text-gradient-divine">
              Choose Your Path to Greatness
            </h2>
            <p className="text-h4 text-glow-soft" style={{ marginTop: '1rem' }}>
              Each realm offers unique opportunities for growth and excellence
            </p>
          </div>

          {/* Pathway Portals Grid */}
          <SuperButtonGroup 
            layout="grid" 
            columns={2} 
            spacing="lg"
            className="pathways-grid"
          >
            {/* Gaming Portal */}
            <GamingPortal
              onClick={() => handlePathwayClick('gaming')}
              onMouseEnter={playHover}
              backgroundImage="/Assets/Images/Pathways/PathwayButtons/pexels-pixabay-159393.jpg"
              magnetic={!isMobile}
              size="xl"
              title="Gaming Realm"
              subtitle="Digital Battlefield"
              description="Compete in epic tournaments, dominate leaderboards, and join elite gaming guilds. Experience the thrill of competitive gaming with fellow champions."
              actionText="Enter Realm"
              icon={<Zap />}
            />

            {/* Lorebound Portal */}
            <LoreboundPortal
              onClick={() => handlePathwayClick('lorebound')}
              onMouseEnter={playHover}
              backgroundImage="/Assets/Images/Pathways/PathwayButtons/Otaku_button.jpg"
              magnetic={!isMobile}
              size="xl"
              title="Lorebound Sanctuary"
              subtitle="Mystical Realm of Stories"
              description="Immerse yourself in anime, manga, manhwa, and light novels. Discuss your favorite series, discover hidden gems, and connect with fellow otakus."
              actionText="Enter Sanctuary"
              icon={<Sparkles />}
            />

            {/* Productive Portal */}
            <ProductivePortal
              onClick={() => handlePathwayClick('productive')}
              onMouseEnter={playHover}
              backgroundImage="/Assets/Images/Pathways/PathwayButtons/Productive_button.jpg"
              magnetic={!isMobile}
              size="xl"
              title="Productive Palace"
              subtitle="Efficiency & Excellence"
              description="Master productivity, develop valuable skills, and achieve your goals. Join challenges, share resources, and grow with ambitious individuals."
              actionText="Boost Productivity"
              icon={<TrendingUp />}
            />

            {/* News Portal */}
            <NewsPortal
              onClick={() => handlePathwayClick('news')}
              onMouseEnter={playHover}
              backgroundImage="/Assets/Images/Pathways/PathwayButtons/news_button.PNG"
              magnetic={!isMobile}
              size="xl"
              title="News Nexus"
              subtitle="Breaking Updates"
              description="Stay informed with breaking news, tech updates, scientific discoveries, and in-depth analysis. Engage in thoughtful discussions about current events."
              actionText="Read News"
              icon={<Star />}
            />
          </SuperButtonGroup>
        </div>
      </section>

      {/* ================================================================
          SECTION 4: REALM'S STRENGTH - COMMUNITY STATS
          Background: backgroundblack.mp4 (continues)
          ================================================================ */}
      <section 
        ref={statsRef}
        id="stats"
        className="stats-section scroll-reveal"
      >
        <div className="section-content">
          {/* Section Header */}
          <div className="section-header text-center">
            <Crown className="section-icon" />
            <h2 className="text-h1 text-gradient-divine">
              The Realm's Strength
            </h2>
            <p className="text-h4 text-glow-soft" style={{ marginTop: '1rem' }}>
              A thriving community of distinguished souls
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {/* Total Members */}
            <StatsCard
              icon={<Users className="stat-icon" />}
              value={formatNumber(stats.totalMembers)}
              label="Noble Souls"
              subtitle="Active Members"
              animated={visibleSections.has('stats')}
              pathway="default"
            />

            {/* Online Members */}
            <StatsCard
              icon={<Zap className="stat-icon stat-icon-pulse" />}
              value={formatNumber(stats.onlineMembers)}
              label="Online Now"
              subtitle="Active This Hour"
              animated={visibleSections.has('stats')}
              pathway="gaming"
            />

            {/* Total Events */}
            <StatsCard
              icon={<Calendar className="stat-icon" />}
              value={`${stats.totalEvents}+`}
              label="Events This Year"
              subtitle="Tournaments & Gatherings"
              animated={visibleSections.has('stats')}
              pathway="productive"
            />

            {/* Pathways */}
            <StatsCard
              icon={<Sparkles className="stat-icon" />}
              value={stats.pathwaysCount}
              label="Noble Pathways"
              subtitle="Realms to Explore"
              animated={visibleSections.has('stats')}
              pathway="lorebound"
            />

            {/* Achievements */}
            <StatsCard
              icon={<Award className="stat-icon" />}
              value={formatNumber(stats.achievementsCount)}
              label="Achievements"
              subtitle="Badges to Unlock"
              animated={visibleSections.has('stats')}
              pathway="default"
            />

            {/* Server Age */}
            <StatsCard
              icon={<Crown className="stat-icon" />}
              value={stats.serverAge}
              label="Established"
              subtitle="Legacy of Excellence"
              animated={visibleSections.has('stats')}
              pathway="news"
            />

            {/* Boosters */}
            <StatsCard
              icon={<Star className="stat-icon" />}
              value={formatNumber(stats.boostersCount)}
              label="Server Boosters"
              subtitle="Legendary Supporters"
              animated={visibleSections.has('stats')}
              pathway="default"
            />

            {/* Staff */}
            <StatsCard
              icon={<Shield className="stat-icon" />}
              value={formatNumber(stats.staffCount)}
              label="Staff Members"
              subtitle="Guardians of The Realm"
              animated={visibleSections.has('stats')}
              pathway="productive"
            />
          </div>

          {/* Discord Widget */}
          {serverData && (
            <div className="discord-widget-container" style={{ marginTop: '4rem' }}>
              <DiscordJoinButton
                memberCount={stats.totalMembers}
                onClick={handleJoinClick}
                onMouseEnter={playHover}
                size="lg"
              />
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          SECTION 5: FEATURED CONTENT - WHAT'S HAPPENING
          Background: backgroundblack.mp4 (continues)
          ================================================================ */}
      <section 
        ref={featuredRef}
        id="featured"
        className="featured-section scroll-reveal"
      >
        <div className="section-content">
          {/* Section Header */}
          <div className="section-header text-center">
            <h2 className="text-h1 text-gradient-divine">
              What's Happening in The Conclave
            </h2>
            <p className="text-h4 text-glow-soft" style={{ marginTop: '1rem' }}>
              Stay connected with our vibrant community
            </p>
          </div>

          {/* Featured Content Grid */}
          <div className="featured-grid">
            {/* Upcoming Events */}
            <div className="featured-column">
              <h3 className="text-h3 text-gradient-gaming featured-column-title">
                Upcoming Events
              </h3>
              <div className="featured-cards">
                {events.length > 0 ? (
                  events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      compact={true}
                      showRegister={isAuthenticated}
                      onMouseEnter={playHover}
                    />
                  ))
                ) : (
                  <FeatureCard
                    title="Epic Tournament"
                    subtitle="This Weekend"
                    description="Join our monthly gaming tournament for glory and exclusive rewards!"
                    icon={<Award />}
                    pathway="gaming"
                  />
                )}
              </div>
            </div>

            {/* Featured Members */}
            <div className="featured-column">
              <h3 className="text-h3 text-gradient-lorebound featured-column-title">
                Featured Noble Souls
              </h3>
              <div className="featured-cards">
                {staff.slice(0, 3).map((member, index) => (
                  <ProfileCard
                    key={index}
                    user={member}
                    compact={true}
                    showBadge={true}
                    onMouseEnter={playHover}
                  />
                ))}
              </div>
            </div>

            {/* Community Highlights */}
            <div className="featured-column">
              <h3 className="text-h3 text-gradient-productive featured-column-title">
                Community Highlights
              </h3>
              <div className="featured-cards">
                <FeatureCard
                  title="New Achievements"
                  subtitle="Recently Added"
                  description="15 new badges and achievements are now available to unlock!"
                  icon={<Award />}
                  pathway="productive"
                  onMouseEnter={playHover}
                />
                <FeatureCard
                  title="Pathway Updates"
                  subtitle="This Month"
                  description="Check out the latest additions to all four pathways!"
                  icon={<Sparkles />}
                  pathway="lorebound"
                  onMouseEnter={playHover}
                />
              </div>
            </div>
          </div>

          {/* Quote Section */}
          {quote && (
            <div className="quote-container" style={{ marginTop: '4rem' }}>
              <blockquote className="quote-divine">
                {quote.text}
                {quote.author && (
                  <footer className="text-caption" style={{ marginTop: '1rem' }}>
                    — {quote.author}
                  </footer>
                )}
              </blockquote>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          SECTION 6: FINAL CTA - JOIN THE NOBILITY
          Background: backgroundblack.mp4 with gradient overlay
          ================================================================ */}
      <section 
        ref={ctaRef}
        id="cta"
        className="cta-section scroll-reveal"
      >
        <div className="cta-overlay" />
        
        <div className="section-content">
          <div className="cta-content">
            {/* Crown Icon */}
            <Crown className="cta-icon" />

            {/* Main CTA */}
            <h2 className="text-display text-gradient-divine cta-title">
              Ready to Join The Nobility?
            </h2>

            <p className="text-h3 text-glow-soft cta-subtitle">
              Become part of an elite community today
            </p>

            {/* CTA Buttons */}
            <div className="cta-buttons">
              <NobleButton
                size="large"
                onClick={handleJoinClick}
                onMouseEnter={playHover}
                className="cta-primary"
              >
                Join The Conclave
                <ArrowRight className="button-icon" />
              </NobleButton>

              <TextFlameButton
                size="large"
                onClick={() => {
                  playClick();
                  router.push('/archives');
                }}
                onMouseEnter={playHover}
              >
                Learn More
              </TextFlameButton>
            </div>

            {/* Additional Info */}
            <div className="cta-info text-body-small" style={{ marginTop: '3rem' }}>
              <p className="text-glow-soft">
                Free to join · Instant access · No obligations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          GLOBAL STYLES FOR HOMEPAGE
          ================================================================ */}
      <style jsx global>{`
        /* ============================================
           HOMEPAGE GLOBAL STYLES
           ============================================ */
        
        .homepage-container {
          width: 100%;
          overflow-x: hidden;
          background: var(--bg-primary);
        }

        /* ============================================
           HERO SECTIONS
           ============================================ */
        
        .hero-section {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.3s ease;
        }

        .hero-video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .hero-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
          transition: transform 0.1s linear;
        }

        .hero-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.6) 0%,
            rgba(10, 10, 15, 0.4) 50%,
            rgba(10, 10, 15, 0.8) 100%
          );
          z-index: 1;
        }

        .hero-video-overlay-light {
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.5) 0%,
            rgba(10, 10, 15, 0.3) 50%,
            rgba(10, 10, 15, 0.7) 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-logo-container {
          margin-bottom: 2rem;
        }

        .hero-logo {
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.6));
          animation: logoFloat 6s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .hero-title {
          font-size: clamp(4rem, 10vw, 8rem);
          margin-bottom: 1.5rem;
          letter-spacing: 0.15em;
          font-family: var(--font-josefin);
        }

        .hero-tagline {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          margin-bottom: 3rem;
          opacity: 0.95;
        }

        .hero-cta {
          margin-bottom: 4rem;
        }

        .hero-main-cta {
          padding: 1.5rem 4rem;
          font-size: 1.25rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .scroll-indicator {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .scroll-indicator:hover {
          opacity: 1;
          transform: translateY(5px);
        }

        .scroll-text {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .scroll-icon {
          width: 32px;
          height: 32px;
          animation: scrollBounce 2s ease-in-out infinite;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        .hero-description {
          margin: 0 auto;
          text-align: center;
          opacity: 0.9;
          line-height: 1.8;
        }

        /* ============================================
           BACKGROUND VIDEO SECTIONS
           ============================================ */
        
        .pathways-section,
        .stats-section,
        .featured-section,
        .cta-section {
          position: relative;
          width: 100%;
          min-height: 100vh;
          padding: 8rem 0;
          overflow: hidden;
        }

        .bg-video-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .bg-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
        }

        .bg-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 15, 0.85);
          backdrop-filter: blur(2px);
        }

        .section-content {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* ============================================
           SECTION HEADERS
           ============================================ */
        
        .section-header {
          margin-bottom: 4rem;
        }

        .section-header.text-center {
          text-align: center;
        }

        .section-icon {
          width: 64px;
          height: 64px;
          color: var(--cns-gold);
          margin: 0 auto 1.5rem;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
          animation: iconPulse 3s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.9)); }
        }

        /* ============================================
           PATHWAYS SECTION
           ============================================ */
        
        .pathways-section {
          padding: 10rem 0;
        }

        .pathways-grid {
          margin-top: 4rem;
        }

        /* ============================================
           STATS SECTION
           ============================================ */
        
        .stats-section {
          padding: 8rem 0;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.9) 0%,
            rgba(10, 10, 15, 0.95) 100%
          );
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
        }

        .stat-icon-pulse {
          animation: iconPulse 2s ease-in-out infinite;
        }

        .discord-widget-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* ============================================
           FEATURED SECTION
           ============================================ */
        
        .featured-section {
          padding: 8rem 0;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
          margin-top: 4rem;
        }

        .featured-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .featured-column-title {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 215, 0, 0.2);
        }

        .featured-cards {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .quote-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* ============================================
           CTA SECTION
           ============================================ */
        
        .cta-section {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8rem 0;
        }

        .cta-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(255, 215, 0, 0.1) 0%,
            rgba(10, 10, 15, 0.95) 50%,
            rgba(153, 102, 204, 0.1) 100%
          );
          z-index: 1;
        }

        .cta-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .cta-icon {
          width: 80px;
          height: 80px;
          color: var(--cns-gold);
          margin: 0 auto 2rem;
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
          animation: crownFloat 4s ease-in-out infinite;
        }

        @keyframes crownFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .cta-title {
          font-size: clamp(3rem, 8vw, 6rem);
          margin-bottom: 1.5rem;
        }

        .cta-subtitle {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          margin-bottom: 3rem;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
        }

        .cta-primary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 3.5rem;
        }

        .button-icon {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
        }

        .cta-primary:hover .button-icon {
          transform: translateX(5px);
        }

        .cta-info {
          opacity: 0.7;
          text-align: center;
        }

        /* ============================================
           SCROLL REVEAL ANIMATIONS
           ============================================ */
        
        .scroll-reveal {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ============================================
           FADE IN ANIMATIONS
           ============================================ */
        
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ============================================
           RESPONSIVE DESIGN
           ============================================ */
        
        @media (max-width: 1200px) {
          .section-content {
            padding: 0 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
          }

          .featured-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            height: 100svh;
          }

          .hero-content {
            padding: 1rem;
          }

          .hero-title {
            font-size: clamp(2.5rem, 8vw, 4rem);
            letter-spacing: 0.1em;
          }

          .hero-tagline {
            font-size: clamp(1.25rem, 4vw, 1.75rem);
          }

          .hero-main-cta {
            padding: 1rem 2rem;
            font-size: 1rem;
          }

          .section-header h2 {
            font-size: clamp(2rem, 6vw, 3rem);
          }

          .pathways-section,
          .stats-section,
          .featured-section,
          .cta-section {
            padding: 4rem 0;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .featured-grid {
            gap: 1.5rem;
          }

          .cta-title {
            font-size: clamp(2rem, 6vw, 3rem);
          }

          .cta-subtitle {
            font-size: clamp(1.25rem, 4vw, 1.75rem);
          }

          .cta-buttons {
            flex-direction: column;
            gap: 1rem;
          }

          .cta-primary {
            padding: 1rem 2rem;
            width: 100%;
            max-width: 300px;
          }

          /* Mobile: Use static images instead of videos */
          .mobile-device .hero-video,
          .mobile-device .bg-video {
            display: none;
          }

          .mobile-device .hero-video-container,
          .mobile-device .bg-video-container {
            background: linear-gradient(
              135deg,
              rgba(10, 10, 15, 0.95) 0%,
              rgba(26, 26, 31, 0.9) 50%,
              rgba(10, 10, 15, 0.95) 100%
            );
          }
        }

        @media (max-width: 480px) {
          .hero-logo-container img {
            width: 120px;
            height: 120px;
          }

          .section-icon {
            width: 48px;
            height: 48px;
          }

          .cta-icon {
            width: 60px;
            height: 60px;
          }

          .scroll-indicator {
            display: none;
          }
        }

        /* ============================================
           ACCESSIBILITY
           ============================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .hero-logo,
          .scroll-icon,
          .section-icon,
          .cta-icon,
          .stat-icon-pulse {
            animation: none !important;
          }

          .scroll-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .animate-fade-in {
            opacity: 1;
            animation: none;
          }

          .parallax-bg {
            transform: none !important;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .hero-video-overlay,
          .bg-video-overlay,
          .cta-overlay {
            background: rgba(0, 0, 0, 0.9);
          }

          .text-gradient-divine,
          .text-gradient-gaming,
          .text-gradient-lorebound,
          .text-gradient-productive,
          .text-gradient-news {
            -webkit-text-fill-color: currentColor;
            background: none;
          }
        }

        /* ============================================
           PRINT STYLES
           ============================================ */
        
        @media print {
          .hero-video-container,
          .bg-video-container,
          .scroll-indicator,
          .cta-buttons {
            display: none;
          }

          .hero-section,
          .pathways-section,
          .stats-section,
          .featured-section,
          .cta-section {
            height: auto;
            min-height: auto;
            page-break-inside: avoid;
          }
        }

        /* ============================================
           LOADING STATES
           ============================================ */
        
        .loading-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* ============================================
           HOVER EFFECTS
           ============================================ */
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        /* ============================================
           FOCUS STATES
           ============================================ */
        
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--cns-gold);
          outline-offset: 4px;
          border-radius: 4px;
        }

        /* ============================================
           SELECTION STYLING
           ============================================ */
        
        ::selection {
          background: rgba(255, 215, 0, 0.3);
          color: var(--noble-white);
        }

        ::-moz-selection {
          background: rgba(255, 215, 0, 0.3);
          color: var(--noble-white);
        }

        /* ============================================
           SMOOTH SCROLLING OPTIMIZATION
           ============================================ */
        
        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }

        /* ============================================
           GPU ACCELERATION
           ============================================ */
        
        .hero-video,
        .bg-video,
        .parallax-bg,
        .scroll-reveal {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* ============================================
           PERFORMANCE OPTIMIZATION
           ============================================ */
        
        .hero-section,
        .pathways-section,
        .stats-section,
        .featured-section,
        .cta-section {
          contain: layout style paint;
        }

        /* ============================================
           DARK MODE SPECIFIC
           ============================================ */
        
        [data-theme="dark"] .hero-video-overlay {
          background: linear-gradient(
            to bottom,
            rgba(5, 5, 10, 0.7) 0%,
            rgba(5, 5, 10, 0.5) 50%,
            rgba(5, 5, 10, 0.9) 100%
          );
        }

        [data-theme="dark"] .bg-video-overlay {
          background: rgba(5, 5, 10, 0.9);
        }

        /* ============================================
           LIGHT MODE SPECIFIC (IF IMPLEMENTED)
           ============================================ */
        
        [data-theme="light"] .hero-video-overlay {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.9) 100%
          );
        }

        [data-theme="light"] .bg-video-overlay {
          background: rgba(255, 255, 255, 0.95);
        }

        [data-theme="light"] .text-gradient-divine {
          background: linear-gradient(135deg, #b8860b, #daa520, #ffd700);
          background-clip: text;
          -webkit-background-clip: text;
        }
      `}</style>
    </div>
  );
}