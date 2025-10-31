// ============================================================================
// HOOKS INDEX
// Central export hub for all React hooks
// /src/hooks/index.js
// ============================================================================

export { useAuth } from './useAuth';
export { useDiscord, useDiscordMember } from './useDiscord';
export { usePathways, usePathwayProgress } from './usePathways';
export { useLuxuryTheme } from './useLuxuryTheme';
export { useSound } from './useSound';

// Re-export all hooks as default object for convenience
import { useAuth } from './useAuth';
import { useDiscord, useDiscordMember } from './useDiscord';
import { usePathways, usePathwayProgress } from './usePathways';
import { useLuxuryTheme } from './useLuxuryTheme';
import { useSound } from './useSound';

export default {
  useAuth,
  useDiscord,
  useDiscordMember,
  usePathways,
  usePathwayProgress,
  useLuxuryTheme,
  useSound
};