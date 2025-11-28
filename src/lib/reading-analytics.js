// ============================================================================
// THE CONCLAVE REALM - READING ANALYTICS ENGINE
// Location: /src/lib/reading-analytics.js
// ============================================================================
// Purpose: Calculate reading statistics and predictions
// Features: Speed tracking, time estimation, progress analytics, insights
// Dependencies: None (pure JavaScript with date-fns for formatting)
// Author: The Conclave Development Team
// Created: 2024-11-26
// Version: 1.0.0
// ============================================================================

/**
 * @fileoverview
 * Comprehensive reading analytics and statistics engine
 * 
 * Features:
 * - Reading speed calculations (pages/hour, words/minute)
 * - Time remaining predictions
 * - Reading mood detection
 * - Session analytics
 * - Streak calculations
 * - Achievement tracking
 * - Personalized insights
 * - Comparative statistics
 * 
 * @example
 * import { calculateReadingSpeed, getReadingMood } from '@/lib/reading-analytics';
 * 
 * const speed = calculateReadingSpeed(50, 60); // 50 pages in 60 minutes
 * const mood = getReadingMood(speed);
 * console.log(`Reading at ${speed.pagesPerHour} p/h - ${mood.label}`);
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const ANALYTICS_CONFIG = {
  // Reading speed benchmarks (pages per hour)
  SPEED_BENCHMARKS: {
    SLOW: 20,
    NORMAL: 40,
    FAST: 60,
    VERY_FAST: 80,
  },

  // Words per page average
  AVG_WORDS_PER_PAGE: 250,

  // Reading moods
  MOODS: {
    DEEP_FOCUS: {
      minSpeed: 0,
      maxSpeed: 20,
      label: 'Deep Focus',
      color: '#6A0DAD', // Violet
      icon: '🧘',
      description: 'Taking your time to absorb every detail',
    },
    NORMAL_PACE: {
      minSpeed: 20,
      maxSpeed: 40,
      label: 'Normal Pace',
      color: '#50C878', // Green
      icon: '📖',
      description: 'Comfortable reading pace',
    },
    FAST_READER: {
      minSpeed: 40,
      maxSpeed: 60,
      label: 'Fast Reader',
      color: '#00BFFF', // Blue
      icon: '⚡',
      description: 'Moving through pages quickly',
    },
    SPEED_READING: {
      minSpeed: 60,
      maxSpeed: Infinity,
      label: 'Speed Reading',
      color: '#FF1744', // Red
      icon: '🚀',
      description: 'Racing through at lightning speed',
    },
  },

  // Achievement thresholds
  ACHIEVEMENTS: {
    BOOKS_COMPLETED: [1, 5, 10, 25, 50, 100],
    READING_STREAKS: [3, 7, 14, 30, 60, 100],
    TOTAL_PAGES: [1000, 5000, 10000, 25000, 50000, 100000],
    READING_TIME_HOURS: [10, 50, 100, 250, 500, 1000],
  },

  // Session tracking
  SESSION_TIMEOUT: 1800000, // 30 minutes (milliseconds)
  MIN_SESSION_DURATION: 60, // 1 minute (seconds)
};

// ============================================================================
// READING SPEED CALCULATIONS
// ============================================================================

/**
 * Calculate reading speed from pages and time
 * @param {number} pagesRead - Number of pages read
 * @param {number} timeMinutes - Time spent in minutes
 * @returns {object} Reading speed metrics
 * 
 * @example
 * const speed = calculateReadingSpeed(50, 60);
 * // { pagesPerHour: 50, pagesPerMinute: 0.83, wordsPerMinute: 208.33 }
 */
export const calculateReadingSpeed = (pagesRead, timeMinutes) => {
  if (timeMinutes <= 0) {
    return {
      pagesPerHour: 0,
      pagesPerMinute: 0,
      wordsPerMinute: 0,
    };
  }

  const pagesPerMinute = pagesRead / timeMinutes;
  const pagesPerHour = pagesPerMinute * 60;
  const wordsPerMinute = pagesPerMinute * ANALYTICS_CONFIG.AVG_WORDS_PER_PAGE;

  return {
    pagesPerHour: Math.round(pagesPerHour * 100) / 100,
    pagesPerMinute: Math.round(pagesPerMinute * 100) / 100,
    wordsPerMinute: Math.round(wordsPerMinute * 100) / 100,
  };
};

/**
 * Calculate average reading speed from multiple sessions
 * @param {Array} sessions - Reading sessions with pages and duration
 * @returns {object} Average reading speed
 * 
 * @example
 * const avgSpeed = calculateAverageSpeed([
 *   { pagesRead: 50, duration: 60 },
 *   { pagesRead: 30, duration: 45 }
 * ]);
 */
export const calculateAverageSpeed = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return calculateReadingSpeed(0, 0);
  }

  const totalPages = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  return calculateReadingSpeed(totalPages, totalTime);
};

// ============================================================================
// READING MOOD DETECTION
// ============================================================================

/**
 * Get reading mood based on speed
 * @param {object|number} speed - Speed object or pages per hour
 * @returns {object} Reading mood
 * 
 * @example
 * const mood = getReadingMood(35);
 * // { label: 'Normal Pace', color: '#50C878', icon: '📖', ... }
 */
export const getReadingMood = (speed) => {
  const pagesPerHour = typeof speed === 'number' ? speed : speed.pagesPerHour;

  for (const [key, mood] of Object.entries(ANALYTICS_CONFIG.MOODS)) {
    if (pagesPerHour >= mood.minSpeed && pagesPerHour < mood.maxSpeed) {
      return { ...mood, key };
    }
  }

  return ANALYTICS_CONFIG.MOODS.NORMAL_PACE;
};

// ============================================================================
// TIME ESTIMATION
// ============================================================================

/**
 * Estimate time remaining to finish book
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {number} readingSpeed - Pages per hour
 * @returns {object} Time estimation
 * 
 * @example
 * const estimate = estimateTimeRemaining(50, 500, 40);
 * // { minutes: 675, hours: 11.25, formatted: '11h 15m' }
 */
export const estimateTimeRemaining = (currentPage, totalPages, readingSpeed) => {
  const pagesRemaining = totalPages - currentPage;
  
  if (pagesRemaining <= 0 || readingSpeed <= 0) {
    return {
      minutes: 0,
      hours: 0,
      formatted: '0m',
      pagesRemaining: 0,
    };
  }

  const hoursRemaining = pagesRemaining / readingSpeed;
  const minutesRemaining = hoursRemaining * 60;

  return {
    minutes: Math.round(minutesRemaining),
    hours: Math.round(hoursRemaining * 100) / 100,
    formatted: formatDuration(minutesRemaining),
    pagesRemaining: pagesRemaining,
  };
};

/**
 * Estimate completion date
 * @param {number} pagesRemaining - Pages left to read
 * @param {number} averagePagesPerDay - Average daily reading
 * @returns {object} Completion date estimate
 * 
 * @example
 * const completion = estimateCompletionDate(450, 50);
 * // { days: 9, date: Date, formatted: 'Dec 5, 2024' }
 */
export const estimateCompletionDate = (pagesRemaining, averagePagesPerDay) => {
  if (pagesRemaining <= 0 || averagePagesPerDay <= 0) {
    return {
      days: 0,
      date: new Date(),
      formatted: 'Today',
    };
  }

  const daysRemaining = Math.ceil(pagesRemaining / averagePagesPerDay);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysRemaining);

  return {
    days: daysRemaining,
    date: completionDate,
    formatted: formatDate(completionDate),
  };
};

// ============================================================================
// SESSION ANALYTICS
// ============================================================================

/**
 * Analyze reading session
 * @param {object} session - Reading session data
 * @returns {object} Session analytics
 * 
 * @example
 * const analytics = analyzeSession({
 *   startPage: 0,
 *   endPage: 50,
 *   startTime: Date.now() - 3600000,
 *   endTime: Date.now()
 * });
 */
export const analyzeSession = (session) => {
  const {
    startPage = 0,
    endPage = 0,
    startTime,
    endTime = Date.now(),
  } = session;

  const pagesRead = endPage - startPage;
  const durationMs = endTime - startTime;
  const durationMinutes = durationMs / 60000;
  const durationHours = durationMinutes / 60;

  const speed = calculateReadingSpeed(pagesRead, durationMinutes);
  const mood = getReadingMood(speed);

  return {
    pagesRead,
    duration: {
      milliseconds: durationMs,
      seconds: Math.round(durationMs / 1000),
      minutes: Math.round(durationMinutes),
      hours: Math.round(durationHours * 100) / 100,
      formatted: formatDuration(durationMinutes),
    },
    speed,
    mood,
    isValidSession: durationMinutes >= ANALYTICS_CONFIG.MIN_SESSION_DURATION / 60,
  };
};

/**
 * Aggregate multiple sessions
 * @param {Array} sessions - Array of session data
 * @returns {object} Aggregated analytics
 */
export const aggregateSessions = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalPages: 0,
      totalTime: { minutes: 0, hours: 0, formatted: '0m' },
      averageSpeed: calculateReadingSpeed(0, 0),
      averageSessionLength: 0,
    };
  }

  const totalPages = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
  const totalMinutes = sessions.reduce((sum, s) => {
    const duration = s.duration?.minutes || 0;
    return sum + duration;
  }, 0);

  const averageSpeed = calculateReadingSpeed(totalPages, totalMinutes);
  const averageSessionLength = totalMinutes / sessions.length;

  return {
    totalSessions: sessions.length,
    totalPages,
    totalTime: {
      minutes: Math.round(totalMinutes),
      hours: Math.round((totalMinutes / 60) * 100) / 100,
      formatted: formatDuration(totalMinutes),
    },
    averageSpeed,
    averageSessionLength: Math.round(averageSessionLength),
    sessions: sessions.map(s => analyzeSession(s)),
  };
};

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Calculate reading streak from session dates
 * @param {Array} dates - Array of reading dates (Date objects or strings)
 * @returns {object} Streak information
 * 
 * @example
 * const streak = calculateStreak(['2024-11-20', '2024-11-21', '2024-11-22']);
 * // { current: 3, longest: 3, lastDate: '2024-11-22' }
 */
export const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastDate: null,
      broken: false,
    };
  }

  // Convert to Date objects and sort
  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b - a); // Newest first

  // Check if streak is broken (more than 1 day since last read)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastRead = new Date(sortedDates[0]);
  lastRead.setHours(0, 0, 0, 0);
  const daysSinceLastRead = Math.floor((today - lastRead) / 86400000);
  const broken = daysSinceLastRead > 1;

  // Calculate current streak
  let current = 0;
  let longest = 0;
  let streak = 0;
  let prevDate = null;

  for (const date of sortedDates) {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    if (prevDate === null) {
      streak = 1;
    } else {
      const dayDiff = Math.floor((prevDate - currentDate) / 86400000);
      
      if (dayDiff === 1) {
        // Consecutive day
        streak++;
      } else {
        // Streak broken
        if (current === 0) {
          current = streak;
        }
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }

    prevDate = currentDate;
  }

  // Final streak calculation
  if (current === 0) {
    current = broken ? 0 : streak;
  }
  longest = Math.max(longest, streak);

  return {
    current,
    longest,
    lastDate: sortedDates[0],
    broken,
    daysSinceLastRead,
    totalReadingDays: sortedDates.length,
  };
};

// ============================================================================
// PROGRESS ANALYTICS
// ============================================================================

/**
 * Analyze reading progress for a book
 * @param {object} progress - Progress data
 * @returns {object} Progress analytics
 * 
 * @example
 * const analytics = analyzeProgress({
 *   currentPage: 250,
 *   totalPages: 500,
 *   timeSpent: 300,
 *   startedAt: '2024-11-20'
 * });
 */
export const analyzeProgress = (progress) => {
  const {
    currentPage = 0,
    totalPages = 0,
    timeSpent = 0,
    startedAt,
    sessions = [],
  } = progress;

  const percentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  const pagesRemaining = totalPages - currentPage;
  const speed = calculateReadingSpeed(currentPage, timeSpent);
  const mood = getReadingMood(speed);
  const estimate = estimateTimeRemaining(currentPage, totalPages, speed.pagesPerHour);

  // Calculate days reading
  let daysReading = 0;
  if (startedAt) {
    const start = new Date(startedAt);
    const now = new Date();
    daysReading = Math.floor((now - start) / 86400000);
  }

  return {
    percentage: Math.round(percentage * 100) / 100,
    pagesRead: currentPage,
    pagesRemaining,
    totalPages,
    timeSpent: {
      minutes: timeSpent,
      hours: Math.round((timeSpent / 60) * 100) / 100,
      formatted: formatDuration(timeSpent),
    },
    speed,
    mood,
    estimate,
    daysReading,
    averagePagesPerDay: daysReading > 0 ? Math.round(currentPage / daysReading) : 0,
    sessionCount: sessions.length,
  };
};

// ============================================================================
// ACHIEVEMENT TRACKING
// ============================================================================

/**
 * Check which achievements user has unlocked
 * @param {object} stats - User statistics
 * @returns {Array} Unlocked achievements
 * 
 * @example
 * const achievements = checkAchievements({
 *   booksCompleted: 15,
 *   currentStreak: 10,
 *   totalPages: 8000
 * });
 */
export const checkAchievements = (stats) => {
  const {
    booksCompleted = 0,
    currentStreak = 0,
    totalPages = 0,
    totalReadingTime = 0,
  } = stats;

  const unlocked = [];

  // Books completed achievements
  ANALYTICS_CONFIG.ACHIEVEMENTS.BOOKS_COMPLETED.forEach(threshold => {
    if (booksCompleted >= threshold) {
      unlocked.push({
        type: 'books_completed',
        threshold,
        achieved: true,
        progress: booksCompleted,
      });
    }
  });

  // Reading streak achievements
  ANALYTICS_CONFIG.ACHIEVEMENTS.READING_STREAKS.forEach(threshold => {
    if (currentStreak >= threshold) {
      unlocked.push({
        type: 'reading_streak',
        threshold,
        achieved: true,
        progress: currentStreak,
      });
    }
  });

  // Total pages achievements
  ANALYTICS_CONFIG.ACHIEVEMENTS.TOTAL_PAGES.forEach(threshold => {
    if (totalPages >= threshold) {
      unlocked.push({
        type: 'total_pages',
        threshold,
        achieved: true,
        progress: totalPages,
      });
    }
  });

  // Reading time achievements
  const totalHours = totalReadingTime / 60;
  ANALYTICS_CONFIG.ACHIEVEMENTS.READING_TIME_HOURS.forEach(threshold => {
    if (totalHours >= threshold) {
      unlocked.push({
        type: 'reading_time',
        threshold,
        achieved: true,
        progress: totalHours,
      });
    }
  });

  return unlocked;
};

/**
 * Get next achievement for user
 * @param {object} stats - User statistics
 * @returns {object} Next achievement to unlock
 */
export const getNextAchievement = (stats) => {
  const {
    booksCompleted = 0,
    currentStreak = 0,
    totalPages = 0,
    totalReadingTime = 0,
  } = stats;

  const next = [];

  // Find next books achievement
  const nextBooks = ANALYTICS_CONFIG.ACHIEVEMENTS.BOOKS_COMPLETED.find(
    t => t > booksCompleted
  );
  if (nextBooks) {
    next.push({
      type: 'books_completed',
      threshold: nextBooks,
      current: booksCompleted,
      remaining: nextBooks - booksCompleted,
      progress: (booksCompleted / nextBooks) * 100,
    });
  }

  // Find next streak achievement
  const nextStreak = ANALYTICS_CONFIG.ACHIEVEMENTS.READING_STREAKS.find(
    t => t > currentStreak
  );
  if (nextStreak) {
    next.push({
      type: 'reading_streak',
      threshold: nextStreak,
      current: currentStreak,
      remaining: nextStreak - currentStreak,
      progress: (currentStreak / nextStreak) * 100,
    });
  }

  // Sort by closest to completion
  next.sort((a, b) => b.progress - a.progress);

  return next[0] || null;
};

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

/**
 * Generate personalized reading insights
 * @param {object} data - User reading data
 * @returns {Array} Array of insights
 * 
 * @example
 * const insights = generateInsights(userData);
 * // [{ type: 'speed', message: 'You read 25% faster than average!', ... }]
 */
export const generateInsights = (data) => {
  const insights = [];
  const {
    averageSpeed,
    currentStreak,
    booksCompleted,
    totalPages,
    recentSessions = [],
  } = data;

  // Speed insight
  if (averageSpeed?.pagesPerHour) {
    const benchmark = ANALYTICS_CONFIG.SPEED_BENCHMARKS.NORMAL;
    const diff = ((averageSpeed.pagesPerHour - benchmark) / benchmark) * 100;
    
    if (Math.abs(diff) > 10) {
      insights.push({
        type: 'speed',
        message: diff > 0 
          ? `You read ${Math.abs(Math.round(diff))}% faster than average!`
          : `Take your time - deep reading builds understanding`,
        positive: diff > 0,
        icon: diff > 0 ? '⚡' : '🧘',
      });
    }
  }

  // Streak insight
  if (currentStreak >= 7) {
    insights.push({
      type: 'streak',
      message: `${currentStreak} day reading streak! Keep it up!`,
      positive: true,
      icon: '🔥',
    });
  }

  // Consistency insight
  if (recentSessions.length >= 5) {
    const avgSessionLength = recentSessions.reduce((sum, s) => sum + (s.duration?.minutes || 0), 0) / recentSessions.length;
    
    if (avgSessionLength >= 30) {
      insights.push({
        type: 'consistency',
        message: 'Your reading sessions are consistently long - great focus!',
        positive: true,
        icon: '🎯',
      });
    }
  }

  // Milestone insight
  if (totalPages > 0 && totalPages % 1000 < 100) {
    insights.push({
      type: 'milestone',
      message: `You've read ${Math.floor(totalPages / 1000)}K+ pages!`,
      positive: true,
      icon: '🏆',
    });
  }

  return insights;
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 * 
 * @example
 * formatDuration(125); // "2h 5m"
 */
export const formatDuration = (minutes) => {
  if (minutes < 1) return '<1m';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 * 
 * @example
 * formatDate(new Date()); // "Nov 26, 2024"
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  calculateReadingSpeed,
  calculateAverageSpeed,
  getReadingMood,
  estimateTimeRemaining,
  estimateCompletionDate,
  analyzeSession,
  aggregateSessions,
  calculateStreak,
  analyzeProgress,
  checkAchievements,
  getNextAchievement,
  generateInsights,
  formatDuration,
  formatDate,
  ANALYTICS_CONFIG,
};

export {
  ANALYTICS_CONFIG,
};