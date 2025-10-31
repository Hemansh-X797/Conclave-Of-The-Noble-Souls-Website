// ============================================================================
// LUXURY THEME HOOK
// Manages theme state, pathway theming, and cursor context
// /src/hooks/useLuxuryTheme.js
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getPathwayColor, getPathwayGradient } from '@/data';

const THEME_STORAGE_KEY = 'conclave_theme';

export function useLuxuryTheme() {
  const [currentPathway, setCurrentPathway] = useState(null);
  const [cursorState, setCursorState] = useState('default');
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Load theme preferences from storage
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        setParticlesEnabled(prefs.particlesEnabled ?? true);
        setSoundsEnabled(prefs.soundsEnabled ?? true);
        setAnimationsEnabled(prefs.animationsEnabled ?? true);
      } catch (err) {
        console.error('Theme load error:', err);
      }
    }
  }, []);

  // Save theme preferences
  const savePreferences = useCallback((prefs) => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(prefs));
  }, []);

  // Set pathway theme context
  const setPathwayTheme = useCallback((pathwayId) => {
    setCurrentPathway(pathwayId);
    
    if (pathwayId) {
      document.body.setAttribute('data-pathway', pathwayId);
      
      // Apply pathway colors to CSS variables
      const color = getPathwayColor(pathwayId);
      const gradient = getPathwayGradient(pathwayId);
      
      document.documentElement.style.setProperty('--current-pathway-color', color);
      document.documentElement.style.setProperty('--current-pathway-gradient', gradient);
    } else {
      document.body.removeAttribute('data-pathway');
    }
  }, []);

  // Clear pathway theme
  const clearPathwayTheme = useCallback(() => {
    setCurrentPathway(null);
    document.body.removeAttribute('data-pathway');
  }, []);

  // Set cursor state
  const updateCursor = useCallback((state) => {
    setCursorState(state);
    document.body.setAttribute('data-cursor', state);
  }, []);

  // Toggle particles
  const toggleParticles = useCallback(() => {
    const newState = !particlesEnabled;
    setParticlesEnabled(newState);
    savePreferences({ particlesEnabled: newState, soundsEnabled, animationsEnabled });
  }, [particlesEnabled, soundsEnabled, animationsEnabled, savePreferences]);

  // Toggle sounds
  const toggleSounds = useCallback(() => {
    const newState = !soundsEnabled;
    setSoundsEnabled(newState);
    savePreferences({ particlesEnabled, soundsEnabled: newState, animationsEnabled });
  }, [particlesEnabled, soundsEnabled, animationsEnabled, savePreferences]);

  // Toggle animations
  const toggleAnimations = useCallback(() => {
    const newState = !animationsEnabled;
    setAnimationsEnabled(newState);
    
    if (newState) {
      document.body.classList.remove('reduce-motion');
    } else {
      document.body.classList.add('reduce-motion');
    }
    
    savePreferences({ particlesEnabled, soundsEnabled, animationsEnabled: newState });
  }, [particlesEnabled, soundsEnabled, animationsEnabled, savePreferences]);

  // Apply admin cursor for staff members
  const setAdminCursor = useCallback((level) => {
    document.body.setAttribute('data-admin-level', level);
  }, []);

  // Get current theme colors
  const getThemeColors = useCallback(() => {
    if (!currentPathway) {
      return {
        primary: '#D4AF37',
        secondary: '#8A2BE2'
      };
    }

    return {
      primary: getPathwayColor(currentPathway),
      gradient: getPathwayGradient(currentPathway)
    };
  }, [currentPathway]);

  return {
    currentPathway,
    cursorState,
    particlesEnabled,
    soundsEnabled,
    animationsEnabled,
    setPathwayTheme,
    clearPathwayTheme,
    updateCursor,
    toggleParticles,
    toggleSounds,
    toggleAnimations,
    setAdminCursor,
    getThemeColors
  };
}

export default useLuxuryTheme;