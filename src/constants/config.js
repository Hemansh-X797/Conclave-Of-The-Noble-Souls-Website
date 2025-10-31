/**
 * Application Configuration for Conclave of the Noble Souls
 * Central configuration for server, API, features, and integrations
 */

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

export const SERVER_CONFIG = {
  // Discord Server
  GUILD_ID: '1368124846760001546',
  GUILD_NAME: 'Conclave of the Noble Souls',
  OWNER_ID: '928968748520587305',
  INVITE_LINK: 'https://discord.gg/pbTnTxqS38',
  
  // Server Stats Channels
  SYSTEM_CHANNEL_ID: '1368870898031001641', // arrival-hall
  GATEWAY_CHANNEL_ID: '1368569858694053969', // gateway
  RULES_CHANNEL_ID: '1368124846760001549', // rules-and-edicts
  
  // Special Channels
  MOD_CHANNEL_ID: '1368872886240149596', // mod-council
  ADMIN_CHANNEL_ID: '1368873117887369226', // infra-scrolls',
  ANNOUNCEMENT_CHANNEL_ID: '1368571101978034256', // announcements
  
  // Created Date
  CREATED_AT: '2025-05-03T07:19:41.998Z'
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Discord OAuth
  DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  DISCORD_REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    STRICT_ROUTES: {
      '/api/auth/*': 10,
      '/api/admin/*': 50
    }
  },
  
  // Request Timeouts
  TIMEOUT: {
    DEFAULT: 30000, // 30 seconds
    LONG: 60000,    // 1 minute
    SHORT: 10000    // 10 seconds
  }
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  // Core Features
  AUTHENTICATION: true,
  PATHWAYS: true,
  MEMBER_DASHBOARD: true,
  
  // Community Features
  FORUMS: false, // Coming soon
  EVENTS: true,
  TOURNAMENTS: true,
  LEADERBOARDS: true,
  
  // Content Features
  NEWS_FEED: true,
  BLOG: false, // Coming soon
  ART_GALLERY: true,
  RESOURCES: true,
  
  // Advanced Features
  ANALYTICS: true,
  WEBHOOKS: true,
  API_ACCESS: false, // Coming soon
  NOTIFICATIONS: true,
  
  // Experimental
  AI_CHAT: false,
  VOICE_CHAT: false,
  LIVE_STREAMING: false
};

// ============================================================================
// CONTACT & SOCIAL
// ============================================================================

export const CONTACT_INFO = {
  EMAIL: 'kundansmishra@gmail.com',
  DISCORD_INVITE: 'https://discord.gg/pbTnTxqS38',
  
  SOCIAL_LINKS: {
    TWITTER: 'https://twitter.com/your-handle',
    YOUTUBE: 'https://youtube.com/your-channel',
    INSTAGRAM: 'https://instagram.com/your-profile',
    GITHUB: 'https://github.com/your-org'
  }
};

// ============================================================================
// PAGINATION & LIMITS
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  LIMITS: {
    SEARCH_RESULTS: 50,
    LEADERBOARD: 100,
    RECENT_ACTIVITY: 25,
    NEWS_ARTICLES: 20,
    TOURNAMENTS: 30
  }
};

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword'],
    VIDEOS: ['video/mp4', 'video/webm']
  },
  
  UPLOAD_PATHS: {
    AVATARS: '/uploads/avatars',
    GALLERY: '/uploads/gallery',
    ATTACHMENTS: '/uploads/attachments',
    TEMP: '/uploads/temp'
  }
};

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
  // Cache TTL (Time To Live) in seconds
  TTL: {
    USER_DATA: 300,        // 5 minutes
    SERVER_STATS: 60,      // 1 minute
    LEADERBOARD: 600,      // 10 minutes
    NEWS: 1800,            // 30 minutes
    STATIC_CONTENT: 86400  // 24 hours
  },
  
  // Enable/Disable cache
  ENABLED: process.env.NODE_ENV === 'production',
  
  // Cache keys prefix
  PREFIX: 'cns_'
};

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

export const SESSION_CONFIG = {
  // Session duration
  MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Cookie settings
  COOKIE_NAME: 'cns_session',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  },
  
  // Refresh threshold (refresh if less than 7 days remaining)
  REFRESH_THRESHOLD: 7 * 24 * 60 * 60 * 1000
};

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export const ANALYTICS_CONFIG = {
  // Google Analytics
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  
  // Custom Events
  TRACK_EVENTS: true,
  TRACK_PAGE_VIEWS: true,
  TRACK_USER_ACTIONS: true,
  
  // Privacy
  ANONYMIZE_IP: true,
  RESPECT_DNT: true // Respect Do Not Track
};

// ============================================================================
// SEO CONFIGURATION
// ============================================================================

export const SEO_CONFIG = {
  SITE_NAME: 'Conclave of Noble Souls',
  SITE_DESCRIPTION: 'A sanctuary where nobility meets community. Join us in our journey through gaming, lore, productivity, and knowledge.',
  SITE_URL: 'https://conclaveofnoblesouls.com',
  
  DEFAULT_IMAGE: '/Assets/Images/CNS_logo1.png',
  
  TWITTER_HANDLE: '@CNS_Official',
  
  KEYWORDS: [
    'discord community',
    'gaming',
    'anime',
    'productivity',
    'news',
    'noble souls',
    'conclave'
  ]
};

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Notification types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  // Display duration (ms)
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000
  },
  
  // Max simultaneous notifications
  MAX_STACK: 5,
  
  // Position
  POSITION: 'top-right'
};

// ============================================================================
// SEARCH CONFIGURATION
// ============================================================================

export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_MS: 300,
  MAX_RESULTS: 50,
  
  SEARCHABLE_CONTENT: [
    'pages',
    'pathways',
    'news',
    'resources',
    'members',
    'events'
  ],
  
  // Search weights
  WEIGHTS: {
    TITLE: 3,
    DESCRIPTION: 2,
    CONTENT: 1,
    TAGS: 2
  }
};

// ============================================================================
// DATETIME CONFIGURATION
// ============================================================================

export const DATETIME_CONFIG = {
  DEFAULT_TIMEZONE: 'UTC',
  DATE_FORMAT: 'MMM DD, YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'MMM DD, YYYY HH:mm',
  
  RELATIVE_TIME_THRESHOLDS: {
    SECONDS: 60,
    MINUTES: 60,
    HOURS: 24,
    DAYS: 30,
    MONTHS: 12
  }
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 32,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    ERROR: 'Username must be 3-32 characters and contain only letters, numbers, hyphens, and underscores'
  },
  
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR: 'Please enter a valid email address'
  },
  
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
    ERROR: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
  },
  
  BIO: {
    MAX_LENGTH: 500,
    ERROR: 'Bio cannot exceed 500 characters'
  }
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'You must be logged in to access this resource',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  ROLE_REQUIRED: 'This action requires a specific role',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT: 'Request timed out. Please try again',
  
  // Validation
  INVALID_INPUT: 'Invalid input provided',
  REQUIRED_FIELD: 'This field is required',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred',
  NOT_FOUND: 'Resource not found'
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  SAVE_SUCCESS: 'Changes saved successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  CREATE_SUCCESS: 'Created successfully',
  UPDATE_SUCCESS: 'Updated successfully'
};

// ============================================================================
// DEVELOPMENT CONFIG
// ============================================================================

export const DEV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Debug flags
  DEBUG_API: process.env.DEBUG_API === 'true',
  DEBUG_AUTH: process.env.DEBUG_AUTH === 'true',
  DEBUG_CACHE: process.env.DEBUG_CACHE === 'true',
  
  // Mock data
  USE_MOCK_DATA: process.env.USE_MOCK_DATA === 'true'
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SERVER_CONFIG,
  API_CONFIG,
  FEATURES,
  CONTACT_INFO,
  PAGINATION,
  UPLOAD_CONFIG,
  CACHE_CONFIG,
  SESSION_CONFIG,
  ANALYTICS_CONFIG,
  SEO_CONFIG,
  NOTIFICATION_CONFIG,
  SEARCH_CONFIG,
  DATETIME_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEV_CONFIG
};