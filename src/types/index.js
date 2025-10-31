// ============================================================================
// TYPES INDEX
// Central export hub for all type definitions
// /src/types/index.js
// ============================================================================

// User types
export * from './user';
export { default as userTypes } from './user';

// Pathway types
export * from './pathway';
export { default as pathwayTypes } from './pathway';

// Event types
export * from './event';
export { default as eventTypes } from './event';

// Discord types
export * from './discord';
export { default as discordTypes } from './discord';

// Combined exports for convenience
export default {
  user: require('./user').default,
  pathway: require('./pathway').default,
  event: require('./event').default,
  discord: require('./discord').default
};