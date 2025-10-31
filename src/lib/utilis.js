// ============================================================================
// UTILITY FUNCTIONS
// Production-grade helper functions
// /src/lib/utils.js
// ============================================================================

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate string to specified length
 */
export function truncate(str, length = 100, suffix = '...') {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function camelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

/**
 * Sanitize string for URL/slug
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Format number to compact form (1K, 1M, etc.)
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
}

/**
 * Clamp number between min and max
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate percentage
 */
export function percentage(value, total) {
  if (!total) return 0;
  return ((value / total) * 100).toFixed(1);
}

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Format date to readable string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
  if (!date) return '';
  
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  if (!date) return '';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Get time until date
 */
export function timeUntil(date) {
  if (!date) return '';
  
  const seconds = Math.floor((new Date(date) - new Date()) / 1000);
  
  if (seconds < 0) return 'started';
  
  const intervals = {
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return `in ${interval} ${unit}${interval === 1 ? '' : 's'}`;
    }
  }
  
  return 'starting soon';
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Shuffle array randomly
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get unique values from array
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

/**
 * Chunk array into smaller arrays
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get random item from array
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from object
 */
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Omit specific keys from object
 */
export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Discord user ID format
 */
export function isValidDiscordId(id) {
  return /^\d{17,19}$/.test(id);
}

/**
 * Validate hex color
 */
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Add opacity to hex color
 */
export function addOpacity(hex, opacity) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if file is image
 */
export function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename).toLowerCase());
}

/**
 * Check if file is video
 */
export function isVideoFile(filename) {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  return videoExtensions.includes(getFileExtension(filename).toLowerCase());
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Sleep/delay for specified milliseconds
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2
  } = options;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay * Math.pow(backoff, i));
    }
  }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// BROWSER UTILITIES
// ============================================================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download data as file
 */
export function downloadFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Check if code is running in browser
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================================
// MISC UTILITIES
// ============================================================================

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Parse JSON safely
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Create URL with query parameters
 */
export function createUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/**
 * Get query parameters from URL
 */
export function getQueryParams(url) {
  const params = {};
  const searchParams = new URL(url).searchParams;
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Merge class names (useful for Tailwind)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // String
  truncate,
  capitalize,
  kebabCase,
  camelCase,
  slugify,
  randomString,
  
  // Number
  formatNumber,
  formatCompactNumber,
  clamp,
  randomInt,
  percentage,
  
  // Date/Time
  formatDate,
  formatDateTime,
  timeAgo,
  isPast,
  isFuture,
  timeUntil,
  
  // Array
  shuffle,
  unique,
  groupBy,
  chunk,
  randomItem,
  
  // Object
  deepClone,
  isEmpty,
  pick,
  omit,
  
  // Validation
  isValidEmail,
  isValidUrl,
  isValidDiscordId,
  isValidHexColor,
  
  // Color
  hexToRgb,
  rgbToHex,
  addOpacity,
  
  // File
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  
  // Async
  sleep,
  retry,
  debounce,
  throttle,
  
  // Browser
  copyToClipboard,
  downloadFile,
  isBrowser,
  prefersReducedMotion,
  
  // Misc
  generateUUID,
  safeJsonParse,
  createUrl,
  getQueryParams,
  cn
};