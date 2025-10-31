// ============================================================================
// SOUND HOOK
// Manages audio feedback system with memoization
// /src/hooks/useSound.js
// ============================================================================

import { useCallback, useRef, useEffect } from 'react';

const SOUND_FILES = {
  hover: '/Audio/hover.mp3',
  click: '/Audio/click.mp3',
  notification: '/Audio/notification.mp3',
  success: '/Audio/success.mp3',
  error: '/Audio/error.mp3',
  achievement: '/Audio/achievement.mp3'
};

const audioCache = new Map();

export function useSound(soundsEnabled = true) {
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Preload sound
  const preloadSound = useCallback((soundName) => {
    if (!soundsEnabled || !SOUND_FILES[soundName]) return;

    if (!audioCache.has(soundName)) {
      const audio = new Audio(SOUND_FILES[soundName]);
      audio.preload = 'auto';
      audioCache.set(soundName, audio);
    }
  }, [soundsEnabled]);

  // Play sound
  const playSound = useCallback((soundName, volume = 0.3) => {
    if (!soundsEnabled || !SOUND_FILES[soundName]) return;

    try {
      let audio = audioCache.get(soundName);
      
      if (!audio) {
        audio = new Audio(SOUND_FILES[soundName]);
        audioCache.set(soundName, audio);
      }

      audio.volume = volume;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Audio play failed:', err);
        });
      }
    } catch (err) {
      console.warn('Sound playback error:', err);
    }
  }, [soundsEnabled]);

  // Hover sound
  const playHover = useCallback(() => {
    playSound('hover', 0.2);
  }, [playSound]);

  // Click sound
  const playClick = useCallback(() => {
    playSound('click', 0.3);
  }, [playSound]);

  // Notification sound
  const playNotification = useCallback(() => {
    playSound('notification', 0.4);
  }, [playSound]);

  // Success sound
  const playSuccess = useCallback(() => {
    playSound('success', 0.5);
  }, [playSound]);

  // Error sound
  const playError = useCallback(() => {
    playSound('error', 0.4);
  }, [playSound]);

  // Achievement sound
  const playAchievement = useCallback(() => {
    playSound('achievement', 0.6);
  }, [playSound]);

  // Preload all sounds on mount
  useEffect(() => {
    if (soundsEnabled) {
      Object.keys(SOUND_FILES).forEach(preloadSound);
    }
  }, [soundsEnabled, preloadSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      audioCache.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioCache.clear();
    };
  }, []);

  return {
    playSound,
    playHover,
    playClick,
    playNotification,
    playSuccess,
    playError,
    playAchievement,
    preloadSound
  };
}

export default useSound;