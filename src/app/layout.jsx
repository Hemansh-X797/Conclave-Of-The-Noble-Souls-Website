// ============================================================================
// ROOT LAYOUT - The Conclave Realm - ULTIMATE LUXURY EDITION
// Complete immersive experience with all components and features
// Location: /src/app/layout.jsx
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Inter, Josefin_Sans, Cinzel_Decorative, Orbitron } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// ============================================================================
// CONTEXT PROVIDERS
// ============================================================================
import { AppProvider, useAppContext } from '@/contexts/AppProvider';

// ============================================================================
// UI COMPONENTS
// ============================================================================
import AdvancedNobleCursor from '@/components/ui/NobleCursor';

import LuxuryButton, { 
  TextFlameButton, 
  NobleButton,
  GamingButton,
  LoreboundButton,
  ProductiveButton,
  NewsButton,
  OwnerButton,
  AdminButton,
  ModButton
} from '@/components/ui/LuxuryButton';

import SuperButton, {
  GamingPortal,
  LoreboundPortal,
  ProductivePortal,
  NewsPortal,
  EventShowcase,
  AchievementShowcase,
  GalleryShowcase,
  DiscordJoinButton,
  CommunityStats,
  ImageGallery,
  CompactAction,
  HeroWelcome,
  MagneticGamingPortal,
  MysticalLoreboundPortal,
  SuperButtonGroup,
  SuperButtonIcons,
  SuperButtonPresets,
  useSuperButtonState
} from '@/components/ui/SuperButton';

import GlassCard, {
  ProfileCard,
  StatsCard,
  MediaCard,
  FeatureCard,
  AnnouncementCard,
  NavigationCard,
  GamingCard,
  LoreboundCard,
  ProductiveCard,
  NewsCard
} from '@/components/ui/GlassCard';

import LoadingCrest, { LoadingOverlay } from '@/components/ui/LoadingCrest';
import NobleInput, {
  NobleTextInput,
  NobleEmailInput,
  NoblePasswordInput,
  NobleTextarea,
  NobleSelect,
  NobleFileUpload,
  NobleSearchInput
} from '@/components/ui/NobleInput';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Searchbar from '@/components/layout/Searchbar';
import PathwayNav from '@/components/layout/PathwayNav';

// ============================================================================
// AUTH COMPONENTS
// ============================================================================
import DiscordLogin from '@/components/auth/DiscordLogin';
import AuthGuard from '@/components/auth/AuthGuard';
import MemberVerify from '@/components/auth/MemberVerify';

// ============================================================================
// PATHWAY COMPONENTS
// ============================================================================
import PathwayHero from '@/components/pathways/PathwayHero';
import PathwayCard from '@/components/pathways/PathwayCard';
import PathProgress from '@/components/pathways/PathProgress';
import PathRecommend from '@/components/pathways/PathRecommend';

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================
import EventCard from '@/components/content/EventCard';
import MemberSpotlight from '@/components/content/MemberSpotlight';
import ArticleCard from '@/components/content/ArticleCard';
import GalleryGrid from '@/components/content/GalleryGrid';
import AnnouncementBanner from '@/components/content/AnnouncementBanner';

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================
import NotificationCenter, { notify, useNotificationCenter } from '@/components/interactive/NotificationCenter';
import QuizEngine, { PathwayQuiz, MBTIQuiz } from '@/components/interactive/QuizEngine';
import BadgeSystem from '@/components/interactive/BadgeSystem';
import MusicPlayer from '@/components/interactive/MusicPlayer';
import LiveStats, { DiscordLiveStats } from '@/components/interactive/LiveStats';

// ============================================================================
// HOOKS
// ============================================================================
import { useAuth } from '@/hooks/useAuth';
import { useDiscord, useDiscordMember } from '@/hooks/useDiscord';
import { usePathways, usePathwayProgress } from '@/hooks/usePathways';
import { useLuxuryTheme } from '@/hooks/useLuxuryTheme';
import { useSound } from '@/hooks/useSound';

// ============================================================================
// DATA & CONSTANTS
// ============================================================================
import { 
  getAllPathways, 
  getPathwayById, 
  getPathwayColor,
  getPathwayGradient,
  getFeaturedPathways 
} from '@/data/pathways';
import { 
  getActiveStaffMembers, 
  getStaffHierarchy,
  getFeaturedStaff 
} from '@/data/staff';
import { 
  getUpcomingEvents, 
  getActiveRecurringEvents 
} from '@/data/events';
import { 
  getRandomQuote, 
  getAllAchievements,
  getAllCodexEntries 
} from '@/data/lore';
import { PERMISSIONS, hasPermission, isStaff } from '@/constants/permissions';
import { ROLES } from '@/constants/roles';

// ============================================================================
// UTILITIES
// ============================================================================
import {
  formatDate,
  formatDateTime,
  getRelativeTime,
  truncateText,
  generateSlug,
  isValidEmail,
  formatNumber,
  debounce,
  throttle
} from '@/lib/utils';

// ============================================================================
// STYLES - ALL IMPORTS
// ============================================================================
import '@/styles/globals.css';
import '@/styles/design_system.css';
import '@/styles/typography.css';
import '@/styles/luxury.css';
import '@/styles/buttons.css';
import '@/styles/glasscards.css';
import '@/styles/inputs.css';
import '@/styles/navbar.css';
import '@/styles/superbuttons.css';
import '@/styles/pathways.css';
import '@/styles/content.css';
import '@/styles/animations.css';
import '@/styles/interactive.css';
import '@/styles/cursors.css';

// ============================================================================
// FONT CONFIGURATIONS
// ============================================================================
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
  preload: true,
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  preload: true,
});

// ============================================================================
// METADATA CONFIGURATION
// ============================================================================
export const metadata = {
  title: {
    default: 'The Conclave Of The Noble Souls',
    template: '%s | The Conclave'
  },
  description: 'A noble, multi-pathway community that connects like-minded individuals in gaming, productivity, knowledge-sharing, and intellectual growth.',
  keywords: [
    'Noble Souls',
    'luxury community',
    'gaming',
    'productivity',
    'anime',
    'manga',
    'manhua',
    'manhwa',
    'novels',
    'light novels',
    'web novels',
    'webtoons',
    'donghua',
    'self-improvement',
    'skill development',
    'personal growth',
    'education',
    'learning',
    'elite communities',
    'intellectual growth',
    'technology',
    'entrepreneurship',
    'philosophy',
    'mindfulness',
    'creative writing',
    'art',
    'digital art',
    'storytelling',
    'leadership',
    'mental wellness',
    'Discord community'
  ],
  authors: [
    { 
      name: 'Hemansh Kumar Mishra', 
      email: 'kundansmishra@gmail.com',
      url: process.env.NEXT_PUBLIC_SITE_URL 
    }
  ],
  creator: 'Hemansh Kumar Mishra',
  publisher: 'The Conclave',
  private: true,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'The Conclave Of The Noble Souls',
    title: 'The Conclave Of The Noble Souls',
    description: 'A noble, multi-pathway community fostering creativity, growth, and collaboration across various domains.',
    images: [
      {
        url: '/Assets/Images/CNS_logo1.png',
        width: 1200,
        height: 630,
        alt: 'The Conclave Logo',
        type: 'image/png'
      }
    ]
  },
    social: {
    discord: "darkpower797",  
    email: "kundansmishra@gmail.com",
    twitter: "@YourTwitterHandle",  // Your Twitter handle (optional)
  },
    schemaOrg: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Conclave Of The Noble Souls",
    url: "https://yourwebsite.com",  // Replace with your actual URL
    logo: "/assets/Images/CNS_logo1.jpg",  // Add your logo image URL (optional)
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "kundansmishra@gmail.com",
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Conclave Of The Noble Souls',
    description: 'Join The Conclave where community members from diverse backgrounds unite to share knowledge, passions, and ideas.',
    images: ['/Assets/Images/CNS_logo1.png'],
    creator: '@YourTwitterHandle',
    site: '@YourTwitterHandle'
  },
  robots: {
    index: true,
    follow: true,
    noarchive: true,
    nocache: false,
    noimageindex: false,
    nosnippet: false
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/Assets/Images/CNS_logo1.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
  applicationName: 'The Conclave',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Conclave'
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  },
  repository: {
    type: "git",
    user: "Hemansh-X797",
    url: "https://github.com/Hemansh-X797/Conclave-Of-The-Noble-Souls-Website.git"
  },

  category: 'community',
  classification: 'Community & Social',
  referrer: 'origin-when-cross-origin'
};

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFD700' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover'
};

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================
export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${inter.variable} ${josefinSans.variable} ${cinzelDecorative.variable} ${orbitron.variable}`}
    >
      <head>
        {/* DNS Prefetch & Preconnect */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//cdn.discordapp.com" />
        <link rel="dns-prefetch" href="//discord.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.discordapp.com" />
        
        {/* Preload Critical Fonts */}
        <link
          rel="preload"
          href="/Assets/fonts/Josefin_sans/JosefinSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Assets/fonts/Josefin_sans/JosefinSans-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Assets/fonts/Cinzel_Decorative/CinzelDecorative-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Assets/fonts/Cinzel_Decorative/CinzelDecorative-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Assets/fonts/Orbitron/Orbitron-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Assets/fonts/Ring_Of_Kerry/RingOfKerry.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        
        {/* Preload Critical Images */}
        <link
          rel="preload"
          href="/Assets/Images/CNS_logo1.png"
          as="image"
          type="image/png"
        />
        
        {/* Preload Critical CSS */}
        <link rel="preload" href="/styles/globals.css" as="style" />
        <link rel="preload" href="/styles/design_system.css" as="style" />
        
        {/* Prevent FOUC (Flash of Unstyled Content) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme initialization
                  var theme = localStorage.getItem('conclave_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.setProperty('--initial-color-mode', theme);
                  
                  // Pathway detection from URL
                  var path = window.location.pathname;
                  var pathway = 'default';
                  if (path.includes('/gaming')) pathway = 'gaming';
                  else if (path.includes('/lorebound')) pathway = 'lorebound';
                  else if (path.includes('/productive')) pathway = 'productive';
                  else if (path.includes('/news')) pathway = 'news';
                  document.body.setAttribute('data-pathway', pathway);
                  
                  // Performance mode detection
                  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  var performanceMode = localStorage.getItem('conclave-performance') === 'true';
                  if (prefersReducedMotion || performanceMode) {
                    document.body.classList.add('reduce-motion');
                  }
                  
                  // Mobile detection
                  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                  if (isMobile) {
                    document.body.classList.add('mobile-device');
                  }
                } catch (e) {
                  console.error('Init script error:', e);
                }
              })();
            `,
          }}
        />
        
        {/* Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'The Conclave Of The Noble Souls',
              alternateName: 'The Conclave',
              url: process.env.NEXT_PUBLIC_SITE_URL,
              logo: `${process.env.NEXT_PUBLIC_SITE_URL}/Assets/Images/CNS_logo1.png`,
              description: 'A noble, multi-pathway community fostering creativity, growth, and collaboration.',
              foundingDate: '2024',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                email: 'kundansmishra@gmail.com'
              },
              sameAs: [
                'https://discord.gg/pbTnTxqS38'
              ]
            })
          }}
        />
        
        {/* Structured Data - WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'The Conclave',
              url: process.env.NEXT_PUBLIC_SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      
      <body suppressHydrationWarning>
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
        
        {/* Noscript Fallback */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#FFD700',
            color: '#0A0A0F',
            padding: '1rem',
            textAlign: 'center',
            zIndex: 9999,
            fontFamily: 'sans-serif'
          }}>
            JavaScript is required for the full Conclave experience. Please enable JavaScript in your browser.
          </div>
        </noscript>
      </body>
    </html>
  );
}

// ============================================================================
// LAYOUT CONTENT COMPONENT (Client-Side)
// ============================================================================
function LayoutContent({ children }) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const notificationCenterRef = useRef(null);
  const musicPlayerRef = useRef(null);
  
  // ============================================================================
  // CONTEXT & HOOKS
  // ============================================================================
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    authLoading,
    currentPathway,
    particlesEnabled,
    soundsEnabled,
    animationsEnabled,
    isMobile,
    updateCursor,
    playHover,
    playClick,
    playNotification,
    serverData
  } = useAppContext();
  
  // Initialize notification center
  useNotificationCenter(notificationCenterRef);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check online status
        setIsOnline(navigator.onLine);
        
        // Load saved preferences
        const savedNotifications = localStorage.getItem('conclave-notifications');
        if (savedNotifications) {
          try {
            setNotifications(JSON.parse(savedNotifications));
          } catch (e) {
            console.error('Failed to parse saved notifications:', e);
          }
        }
        
        // Mark as initialized
        setIsInitialized(true);
        
        // Welcome notification for first-time visitors
        const hasVisited = localStorage.getItem('conclave-has-visited');
        if (!hasVisited) {
          localStorage.setItem('conclave-has-visited', 'true');
          setTimeout(() => {
            notify.success('Welcome to The Conclave Realm!', {
              title: 'Welcome Noble Soul',
              duration: 5000
            });
          }, 1000);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };
    
    initializeApp();
  }, []);
  
  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notify.success('Connection restored', { title: 'Back Online' });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      notify.error('Connection lost', { title: 'Offline' });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Page transition handling
  useEffect(() => {
    setPageTransitioning(true);
    const timer = setTimeout(() => setPageTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Ctrl/Cmd + B for sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(!showSidebar);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowSidebar(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSidebar]);
  
  // Analytics page view tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname
      });
    }
  }, [pathname]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
    playClick();
  }, [playClick]);
  
  const handleToggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    playClick();
  }, [playClick]);
  
  const handlePathwayNavigate = useCallback((pathwayId) => {
    playClick();
    router.push(`/pathways/${pathwayId}`);
  }, [router, playClick]);
  
  const handleNotificationClick = useCallback((notification) => {
    playClick();
    if (notification.action) {
      router.push(notification.action);
    }
  }, [router, playClick]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (!isInitialized || authLoading) {
    return (
      <LoadingOverlay
        isVisible={true}
        pathway={currentPathway}
        message="Initializing luxury experience..."
        progress={75}
      />
    );
  }
  
  return (
    <>
      {/* ================================================================
          CURSOR SYSTEM
          ================================================================ */}
      {!isMobile && (
        <AdvancedNobleCursor
          enableParticles={particlesEnabled && animationsEnabled}
          enableTrails={animationsEnabled}
          enableClickFeedback={true}
          performanceMode={!animationsEnabled}
          pathway={currentPathway}
          debugMode={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* ================================================================
          NOTIFICATION SYSTEM
          ================================================================ */}
      <NotificationCenter 
        ref={notificationCenterRef}
        position="top-right"
        maxNotifications={5}
        autoClose={5000}
      />

      {/* ================================================================
          MUSIC PLAYER
          ================================================================ */}
      {soundsEnabled && (
        <MusicPlayer
          ref={musicPlayerRef}
          autoPlay={false}
          minimizable={true}
          defaultVolume={0.3}
          playlist={[
            { title: 'Noble Ambiance', src: '/Audio/ambient/noble.mp3' },
            { title: 'Gaming Realm', src: '/Audio/ambient/gaming.mp3' },
            { title: 'Lorebound Sanctuary', src: '/Audio/ambient/lorebound.mp3' },
            { title: 'Productive Palace', src: '/Audio/ambient/productive.mp3' },
            { title: 'News Nexus', src: '/Audio/ambient/news.mp3' }
          ]}
        />
      )}

      {/* ================================================================
          MAIN APPLICATION STRUCTURE
          ================================================================ */}
      <div className={`conclave-app-container ${pageTransitioning ? 'page-transitioning' : ''}`}>
        
        {/* Navigation Bar */}
        <Navbar
          user={user}
          isAuthenticated={isAuthenticated}
          currentPathway={currentPathway}
          onToggleSidebar={handleToggleSidebar}
          onToggleSearch={handleToggleSearch}
          enableParticles={particlesEnabled && !isMobile}
          floating={currentPathway === 'lorebound'}
          showNotifications={true}
          notificationCount={notifications.length}
        />

        {/* Sidebar (Collapsible) */}
        {showSidebar && (
          <Sidebar
            user={user}
            currentPathway={currentPathway}
            onClose={() => setShowSidebar(false)}
            onPathwayNavigate={handlePathwayNavigate}
          />
        )}

        {/* Global Search */}
        {showSearch && (
          <Searchbar
            onClose={() => setShowSearch(false)}
            onNavigate={(path) => {
              router.push(path);
              setShowSearch(false);
            }}
          />
        )}

        {/* Announcement Banner */}
        {!isOnline && (
          <AnnouncementBanner
            type="warning"
            message="You are currently offline. Some features may be unavailable."
            dismissible={false}
          />
        )}

        {/* Main Content Area */}
        <main className="conclave-main-content">
          <div className="content-wrapper">
            <Suspense fallback={<LoadingCrest pathway={currentPathway} />}>
              {children}
            </Suspense>
          </div>
        </main>

        {/* Footer */}
        <Footer 
          currentPathway={currentPathway}
          serverStats={serverData}
        />

        {/* Live Stats Ticker - Bottom Right (Authenticated Users Only) */}
        {isAuthenticated && serverData && (
          <div className="live-stats-container">
            <DiscordLiveStats
              discordData={serverData}
              compact={true}
              refreshInterval={300000}
              animated={animationsEnabled}
            />
          </div>
        )}

        {/* Pathway Navigation (For pathway pages) */}
        {pathname.includes('/pathways/') && (
          <PathwayNav
            currentPathway={currentPathway}
            pathways={getAllPathways()}
            onPathwayChange={handlePathwayNavigate}
          />
        )}
      </div>

      {/* ================================================================
          BACKGROUND EFFECTS LAYER
          ================================================================ */}
      {animationsEnabled && !isMobile && (
        <BackgroundEffects 
          pathway={currentPathway}
          particlesEnabled={particlesEnabled}
          intensity="high"
        />
      )}

      {/* ================================================================
          AMBIENT EFFECTS
          ================================================================ */}
      <AmbientEffects 
        pathway={currentPathway}
        enabled={animationsEnabled}
      />

      {/* ================================================================
          PORTAL CONTAINERS
          ================================================================ */}
      <div id="modal-root" aria-live="polite" />
      <div id="toast-root" aria-live="assertive" />
      <div id="dropdown-root" aria-live="polite" />
      <div id="tooltip-root" aria-live="polite" />

      {/* ================================================================
          AUDIO ELEMENTS
          ================================================================ */}
      {soundsEnabled && (
        <AudioElements />
      )}

      {/* ================================================================
          ACCESSIBILITY SKIP LINKS
          ================================================================ */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ================================================================
          GLOBAL STYLES
          ================================================================ */}
      <GlobalStyles />
      
      {/* ================================================================
          PERFORMANCE MONITOR (Development Only)
          ================================================================ */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor />
      )}
    </>
  );
}

// ============================================================================
// BACKGROUND EFFECTS COMPONENT
// ============================================================================
function BackgroundEffects({ pathway, particlesEnabled, intensity = 'medium' }) {
  const particleCount = intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 15;
  const orbCount = intensity === 'high' ? 7 : intensity === 'medium' ? 5 : 3;
  
  if (!particlesEnabled) return null;

  return (
    <div className="conclave-bg-effects" aria-hidden="true">
      {/* Animated Particles */}
      <div className="bg-particles">
        {Array.from({ length: particleCount }).map((_, index) => (
          <div
            key={`particle-${index}`}
            className={`particle particle-${pathway}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 15}s`,
              width: `${1 + Math.random() * 4}px`,
              height: `${1 + Math.random() * 4}px`,
              opacity: 0.3 + Math.random() * 0.5
            }}
          />
        ))}
      </div>

      {/* Floating Orbs */}
      <div className="bg-orbs">
        {Array.from({ length: orbCount }).map((_, index) => (
          <div
            key={`orb-${index}`}
            className={`orb orb-${pathway}`}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${index * 3}s`,
              animationDuration: `${20 + index * 5}s`,
              width: `${200 + Math.random() * 200}px`,
              height: `${200 + Math.random() * 200}px`
            }}
          />
        ))}
      </div>

      {/* Gradient Mesh Background */}
      <div className={`bg-gradient-mesh bg-gradient-mesh-${pathway}`} />
      
      {/* Radial Gradient Overlays */}
      <div className="bg-radial-gradients">
        <div className={`radial-gradient radial-top-left radial-${pathway}`} />
        <div className={`radial-gradient radial-top-right radial-${pathway}`} />
        <div className={`radial-gradient radial-bottom-left radial-${pathway}`} />
        <div className={`radial-gradient radial-bottom-right radial-${pathway}`} />
      </div>
      
      {/* Scanline Effect */}
      <div className="bg-scanlines" />
      
      {/* Noise Texture */}
      <div className="bg-noise" />
    </div>
  );
}

// ============================================================================
// AMBIENT EFFECTS COMPONENT
// ============================================================================
function AmbientEffects({ pathway, enabled }) {
  if (!enabled) return null;
  
  const glowColors = {
    default: 'rgba(255, 215, 0, 0.05)',
    gaming: 'rgba(0, 191, 255, 0.05)',
    lorebound: 'rgba(106, 13, 173, 0.05)',
    productive: 'rgba(80, 200, 120, 0.05)',
    news: 'rgba(224, 17, 95, 0.05)'
  };

  return (
    <>
      {/* Main Ambient Glow */}
      <div 
        className="ambient-glow ambient-glow-primary"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColors[pathway] || glowColors.default} 0%, transparent 70%)`
        }}
        aria-hidden="true"
      />
      
      {/* Secondary Glow (Top Left) */}
      <div 
        className="ambient-glow ambient-glow-secondary"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${glowColors[pathway] || glowColors.default} 0%, transparent 50%)`,
          top: 0,
          left: 0
        }}
        aria-hidden="true"
      />
      
      {/* Tertiary Glow (Bottom Right) */}
      <div 
        className="ambient-glow ambient-glow-tertiary"
        style={{
          background: `radial-gradient(circle at 80% 80%, ${glowColors[pathway] || glowColors.default} 0%, transparent 50%)`,
          bottom: 0,
          right: 0
        }}
        aria-hidden="true"
      />
      
      {/* Vignette Effect */}
      <div 
        className="ambient-vignette"
        aria-hidden="true"
      />
    </>
  );
}

// ============================================================================
// AUDIO ELEMENTS COMPONENT
// ============================================================================
function AudioElements() {
  return (
    <div className="audio-container" style={{ display: 'none' }}>
      <audio id="hover-sound" preload="auto">
        <source src="/Audio/hover.mp3" type="audio/mpeg" />
      </audio>
      <audio id="click-sound" preload="auto">
        <source src="/Audio/click.mp3" type="audio/mpeg" />
      </audio>
      <audio id="notification-sound" preload="auto">
        <source src="/Audio/notification.mp3" type="audio/mpeg" />
      </audio>
      <audio id="success-sound" preload="auto">
        <source src="/Audio/success.mp3" type="audio/mpeg" />
      </audio>
      <audio id="error-sound" preload="auto">
        <source src="/Audio/error.mp3" type="audio/mpeg" />
      </audio>
      <audio id="achievement-sound" preload="auto">
        <source src="/Audio/achievement.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

// ============================================================================
// PERFORMANCE MONITOR COMPONENT (Dev Only)
// ============================================================================
function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
        
        if (performance.memory) {
          setMemoryUsage(Math.round(performance.memory.usedJSHeapSize / 1048576));
        }
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    const rafId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return (
    <div className="performance-monitor">
      <div className="perf-stat">
        <span className="perf-label">FPS:</span>
        <span className={`perf-value ${fps < 30 ? 'perf-warning' : ''}`}>{fps}</span>
      </div>
      {memoryUsage > 0 && (
        <div className="perf-stat">
          <span className="perf-label">Memory:</span>
          <span className="perf-value">{memoryUsage}MB</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GLOBAL STYLES COMPONENT
// ============================================================================
function GlobalStyles() {
  return (
    <style jsx global>{`
      /* ============================================
         ROOT VARIABLES & THEME
         ============================================ */
      
      :root {
        --navbar-height: 80px;
        --footer-height: 300px;
        --sidebar-width: 280px;
        --transition-speed: 0.3s;
        --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      html {
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: var(--font-primary);
        min-height: 100vh;
        position: relative;
      }

      /* ============================================
         APP CONTAINER
         ============================================ */
      
      .conclave-app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        transition: opacity var(--transition-speed) var(--transition-easing);
      }
      
      .conclave-app-container.page-transitioning {
        opacity: 0.95;
      }

      .conclave-main-content {
        flex: 1;
        padding-top: var(--navbar-height);
        position: relative;
        z-index: 2;
        min-height: calc(100vh - var(--navbar-height) - var(--footer-height));
      }

      .content-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        padding: 3rem 2rem;
        position: relative;
      }

      /* ============================================
         BACKGROUND EFFECTS
         ============================================ */
      
      .conclave-bg-effects {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }

      .bg-particles {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .particle {
        position: absolute;
        border-radius: 50%;
        animation: particleFloat 20s linear infinite;
        box-shadow: 0 0 10px currentColor;
      }

      .particle-default { 
        background: rgba(255, 215, 0, 0.4);
        color: rgba(255, 215, 0, 0.4);
      }
      .particle-gaming { 
        background: rgba(0, 191, 255, 0.4);
        color: rgba(0, 191, 255, 0.4);
      }
      .particle-lorebound { 
        background: rgba(106, 13, 173, 0.4);
        color: rgba(106, 13, 173, 0.4);
      }
      .particle-productive { 
        background: rgba(80, 200, 120, 0.4);
        color: rgba(80, 200, 120, 0.4);
      }
      .particle-news { 
        background: rgba(224, 17, 95, 0.4);
        color: rgba(224, 17, 95, 0.4);
      }

      .bg-orbs {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        animation: orbFloat 30s ease-in-out infinite;
        opacity: 0.2;
      }

      .orb-default {
        background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
      }

      .orb-gaming {
        background: radial-gradient(circle, rgba(0, 191, 255, 0.4) 0%, transparent 70%);
      }

      .orb-lorebound {
        background: radial-gradient(circle, rgba(106, 13, 173, 0.4) 0%, transparent 70%);
      }

      .orb-productive {
        background: radial-gradient(circle, rgba(80, 200, 120, 0.4) 0%, transparent 70%);
      }

      .orb-news {
        background: radial-gradient(circle, rgba(224, 17, 95, 0.4) 0%, transparent 70%);
      }

      .bg-gradient-mesh {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.03;
        background-size: 40px 40px;
        background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      }
      
      .bg-radial-gradients {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      
      .radial-gradient {
        position: absolute;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        filter: blur(100px);
        opacity: 0.08;
      }
      
      .radial-top-left {
        top: -300px;
        left: -300px;
      }
      
      .radial-top-right {
        top: -300px;
        right: -300px;
      }
      
      .radial-bottom-left {
        bottom: -300px;
        left: -300px;
      }
      
      .radial-bottom-right {
        bottom: -300px;
        right: -300px;
      }
      
      .radial-default {
        background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
      }
      
      .radial-gaming {
        background: radial-gradient(circle, rgba(0, 191, 255, 0.3) 0%, transparent 70%);
      }
      
      .radial-lorebound {
        background: radial-gradient(circle, rgba(106, 13, 173, 0.3) 0%, transparent 70%);
      }
      
      .radial-productive {
        background: radial-gradient(circle, rgba(80, 200, 120, 0.3) 0%, transparent 70%);
      }
      
      .radial-news {
        background: radial-gradient(circle, rgba(224, 17, 95, 0.3) 0%, transparent 70%);
      }
      
      .bg-scanlines {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.01) 2px,
          rgba(255, 255, 255, 0.01) 4px
        );
        pointer-events: none;
        opacity: 0.5;
      }
      
      .bg-noise {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        opacity: 0.02;
        pointer-events: none;
      }

      /* ============================================
         AMBIENT EFFECTS
         ============================================ */
      
      .ambient-glow {
        position: fixed;
        pointer-events: none;
        z-index: 0;
        transition: background 1.5s ease;
      }
      
      .ambient-glow-primary {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1000px;
        height: 1000px;
      }
      
      .ambient-glow-secondary {
        width: 600px;
        height: 600px;
      }
      
      .ambient-glow-tertiary {
        width: 600px;
        height: 600px;
      }
      
      .ambient-vignette {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
        pointer-events: none;
        z-index: 0;
      }

      /* ============================================
         LIVE STATS CONTAINER
         ============================================ */
      
      .live-stats-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 100;
        animation: slideInFromRight 0.5s ease;
      }

      /* ============================================
         SKIP LINK (Accessibility)
         ============================================ */
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--cns-gold);
        color: var(--bg-primary);
        padding: 8px 16px;
        text-decoration: none;
        font-weight: 600;
        z-index: 10000;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 0;
      }

      /* ============================================
         PERFORMANCE MONITOR (Dev)
         ============================================ */
      
      .performance-monitor {
        position: fixed;
        top: 90px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #0f0;
        padding: 10px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        min-width: 120px;
      }
      
      .perf-stat {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .perf-stat:last-child {
        margin-bottom: 0;
      }
      
      .perf-label {
        margin-right: 10px;
        color: #888;
      }
      
      .perf-value {
        font-weight: bold;
      }
      
      .perf-warning {
        color: #ff0;
      }

      /* ============================================
         ANIMATIONS
         ============================================ */
      
      @keyframes particleFloat {
        0% {
          transform: translateY(100vh) translateX(0) rotate(0deg) scale(0);
          opacity: 0;
        }
        5% {
          opacity: 0.6;
        }
        10% {
          transform: translateY(90vh) translateX(10px) rotate(45deg) scale(1);
        }
        50% {
          opacity: 0.8;
          transform: translateY(50vh) translateX(-30px) rotate(180deg) scale(1.3);
        }
        90% {
          opacity: 0.6;
          transform: translateY(10vh) translateX(40px) rotate(315deg) scale(1);
        }
        95% {
          opacity: 0.2;
        }
        100% {
          transform: translateY(-10vh) translateX(60px) rotate(360deg) scale(0);
          opacity: 0;
        }
      }

      @keyframes orbFloat {
        0%, 100% {
          transform: translate(0, 0) scale(1) rotate(0deg);
        }
        25% {
          transform: translate(40px, -40px) scale(1.15) rotate(90deg);
        }
        50% {
          transform: translate(-30px, 30px) scale(0.85) rotate(180deg);
        }
        75% {
          transform: translate(50px, 15px) scale(1.05) rotate(270deg);
        }
      }
      
      @keyframes slideInFromRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* ============================================
         RESPONSIVE DESIGN
         ============================================ */
      
      @media (max-width: 1200px) {
        .content-wrapper {
          max-width: 100%;
          padding: 2.5rem 2rem;
        }
      }

      @media (max-width: 1024px) {
        :root {
          --navbar-height: 70px;
          --footer-height: 250px;
        }
        
        .content-wrapper {
          padding: 2rem 1.5rem;
        }

        .live-stats-container {
          bottom: 1.5rem;
          right: 1.5rem;
        }
        
        .orb {
          display: none;
        }
      }

      @media (max-width: 768px) {
        :root {
          --navbar-height: 60px;
        }
        
        .conclave-main-content {
          padding-top: var(--navbar-height);
        }

        .content-wrapper {
          padding: 1.5rem 1rem;
        }

        .bg-orbs,
        .ambient-glow,
        .bg-radial-gradients {
          display: none;
        }

        .live-stats-container {
          display: none;
        }
        
        .performance-monitor {
          top: 70px;
          right: 5px;
          font-size: 10px;
          padding: 5px;
        }
      }
      
      @media (max-width: 480px) {
        .content-wrapper {
          padding: 1rem;
        }
        
        .bg-particles {
          display: none;
        }
      }

      /* ============================================
         ACCESSIBILITY
         ============================================ */
      
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        .particle,
        .orb,
        .ambient-glow {
          animation: none !important;
        }
      }
      
      body.reduce-motion *,
      body.reduce-motion *::before,
      body.reduce-motion *::after {
        animation: none !important;
        transition: none !important;
      }
      
      @media (prefers-contrast: high) {
        .conclave-bg-effects {
          opacity: 0.5;
        }
      }

      /* ============================================
         PRINT STYLES
         ============================================ */
      
      @media print {
        .conclave-bg-effects,
        .ambient-glow,
        .live-stats-container,
        .performance-monitor,
        nav,
        footer,
        .skip-link {
          display: none !important;
        }

        .conclave-main-content {
          padding-top: 0;
        }

        body {
          background: white;
          color: black;
        }
        
        .content-wrapper {
          max-width: 100%;
          padding: 0;
        }
      }
      
      /* ============================================
         DARK MODE OVERRIDES
         ============================================ */
      
      [data-theme="dark"] {
        color-scheme: dark;
      }
      
      [data-theme="light"] {
        color-scheme: light;
      }
      
      /* ============================================
         MOBILE SPECIFIC
         ============================================ */
      
      .mobile-device .conclave-bg-effects {
        display: none;
      }
      
      .mobile-device .ambient-glow {
        opacity: 0.5;
      }
    `}</style>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================
export { metadata, viewport };