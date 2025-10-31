// ============================================================================
// APP PROVIDER - Global Context System
// Provides auth, theme, sound, and app state to entire application
// Location: /src/contexts/AppProvider.jsx
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLuxuryTheme } from '@/hooks/useLuxuryTheme';
import { useSound } from '@/hooks/useSound';
import { useDiscord } from '@/hooks/useDiscord';
import { usePathname } from 'next/navigation';

// Create Contexts
const AppContext = createContext(undefined);

// Custom hook to use app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Main App Provider Component
export function AppProvider({ children }) {
  // Hooks
  const auth = useAuth();
  const theme = useLuxuryTheme();
  const discord = useDiscord();
  const pathname = usePathname();
  
  // Sound management with theme integration
  const sound = useSound(theme.soundsEnabled);
  
  // Detect current pathway from pathname
  useEffect(() => {
    if (pathname.includes('/pathways/gaming') || pathname.includes('/gaming')) {
      theme.setPathwayTheme('gaming');
    } else if (pathname.includes('/pathways/lorebound') || pathname.includes('/lorebound')) {
      theme.setPathwayTheme('lorebound');
    } else if (pathname.includes('/pathways/productive') || pathname.includes('/productive')) {
      theme.setPathwayTheme('productive');
    } else if (pathname.includes('/pathways/news') || pathname.includes('/news')) {
      theme.setPathwayTheme('news');
    } else {
      theme.clearPathwayTheme();
    }
  }, [pathname, theme]);

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
     window.matchMedia('(pointer: coarse)').matches);

  // Combine all context values
  const contextValue = {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    authLoading: auth.loading,
    login: auth.login,
    logout: auth.logout,
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    isInServer: auth.isInServer,
    
    // Theme
    currentPathway: theme.currentPathway,
    cursorState: theme.cursorState,
    particlesEnabled: theme.particlesEnabled,
    soundsEnabled: theme.soundsEnabled,
    animationsEnabled: theme.animationsEnabled,
    setPathwayTheme: theme.setPathwayTheme,
    clearPathwayTheme: theme.clearPathwayTheme,
    updateCursor: theme.updateCursor,
    toggleParticles: theme.toggleParticles,
    toggleSounds: theme.toggleSounds,
    toggleAnimations: theme.toggleAnimations,
    setAdminCursor: theme.setAdminCursor,
    getThemeColors: theme.getThemeColors,
    
    // Sound
    playSound: sound.playSound,
    playHover: sound.playHover,
    playClick: sound.playClick,
    playNotification: sound.playNotification,
    playSuccess: sound.playSuccess,
    playError: sound.playError,
    playAchievement: sound.playAchievement,
    
    // Discord
    serverData: discord.serverData,
    discordLoading: discord.loading,
    refreshDiscord: discord.refresh,
    
    // Utilities
    isMobile,
    pathname
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;