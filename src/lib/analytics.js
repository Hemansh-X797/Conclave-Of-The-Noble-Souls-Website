// ============================================================================
// ANALYTICS SYSTEM - TRACK EVERYTHING
// Production-grade analytics for The Conclave Realm
// /src/lib/analytics.js
// ============================================================================

import { supabase } from './supabase';
import { getGuild, getGuildMembers } from './discord';

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

/**
 * Track page view
 */
export async function trackPageView(data) {
  const pageData = {
    path: data.path,
    title: data.title,
    referrer: data.referrer || null,
    user_id: data.userId || 'anonymous',
    session_id: data.sessionId,
    timestamp: new Date().toISOString(),
    user_agent: data.userAgent,
    device_type: getDeviceType(data.userAgent),
    viewport_width: data.viewportWidth,
    viewport_height: data.viewportHeight
  };

  try {
    await supabase.from('page_views').insert(pageData);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }

  // Also send to Vercel Analytics if enabled
  if (typeof window !== 'undefined' && window.va) {
    window.va('pageview', { path: data.path });
  }
}

/**
 * Track time spent on page
 */
export async function trackTimeOnPage(path, userId, duration) {
  try {
    await supabase.from('time_on_page').insert({
      path,
      user_id: userId || 'anonymous',
      duration_seconds: Math.floor(duration / 1000),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track time on page:', error);
  }
}

// ============================================================================
// USER ACTION TRACKING
// ============================================================================

/**
 * Track user action/event
 */
export async function trackEvent(eventName, properties = {}) {
  const eventData = {
    event_name: eventName,
    user_id: properties.userId || 'anonymous',
    properties: JSON.stringify(properties),
    timestamp: new Date().toISOString(),
    session_id: properties.sessionId,
    page_path: properties.pagePath
  };

  try {
    await supabase.from('events').insert(eventData);
  } catch (error) {
    console.error('Failed to track event:', error);
  }

  // Send to Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', eventName, properties);
  }
}

/**
 * Track button click
 */
export function trackClick(buttonName, properties = {}) {
  return trackEvent('button_click', {
    button_name: buttonName,
    ...properties
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName, properties = {}) {
  return trackEvent('form_submit', {
    form_name: formName,
    ...properties
  });
}

/**
 * Track link click
 */
export function trackLinkClick(url, properties = {}) {
  return trackEvent('link_click', {
    url,
    ...properties
  });
}

/**
 * Track scroll depth
 */
export function trackScroll(depth, properties = {}) {
  return trackEvent('scroll_depth', {
    depth_percentage: depth,
    ...properties
  });
}

/**
 * Track search
 */
export function trackSearch(query, results, properties = {}) {
  return trackEvent('search', {
    query,
    results_count: results,
    ...properties
  });
}

// ============================================================================
// DISCORD EVENT TRACKING
// ============================================================================

/**
 * Track member join
 */
export async function trackMemberJoin(userId, username) {
  try {
    await supabase.from('member_events').insert({
      event_type: 'join',
      user_id: userId,
      username,
      timestamp: new Date().toISOString()
    });

    await trackEvent('member_join', { userId, username });
  } catch (error) {
    console.error('Failed to track member join:', error);
  }
}

/**
 * Track member leave
 */
export async function trackMemberLeave(userId, username) {
  try {
    await supabase.from('member_events').insert({
      event_type: 'leave',
      user_id: userId,
      username,
      timestamp: new Date().toISOString()
    });

    await trackEvent('member_leave', { userId, username });
  } catch (error) {
    console.error('Failed to track member leave:', error);
  }
}

/**
 * Track message sent
 */
export async function trackMessage(userId, channelId, messageLength) {
  try {
    await supabase.from('message_events').insert({
      user_id: userId,
      channel_id: channelId,
      message_length: messageLength,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track message:', error);
  }
}

/**
 * Track voice activity
 */
export async function trackVoiceActivity(userId, channelId, duration) {
  try {
    await supabase.from('voice_events').insert({
      user_id: userId,
      channel_id: channelId,
      duration_seconds: duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track voice activity:', error);
  }
}

/**
 * Track reaction added
 */
export async function trackReaction(userId, messageId, emoji) {
  try {
    await supabase.from('reaction_events').insert({
      user_id: userId,
      message_id: messageId,
      emoji,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track reaction:', error);
  }
}

// ============================================================================
// ADMIN ACTION TRACKING
// ============================================================================

/**
 * Track moderation action
 */
export async function trackModerationAction(action, moderatorId, targetId, reason) {
  try {
    await supabase.from('moderation_analytics').insert({
      action_type: action,
      moderator_id: moderatorId,
      target_id: targetId,
      reason,
      timestamp: new Date().toISOString()
    });

    await trackEvent('moderation_action', {
      action,
      moderatorId,
      targetId
    });
  } catch (error) {
    console.error('Failed to track moderation action:', error);
  }
}

/**
 * Track content creation
 */
export async function trackContentCreation(contentType, authorId, contentId) {
  try {
    await supabase.from('content_analytics').insert({
      event_type: 'create',
      content_type: contentType,
      author_id: authorId,
      content_id: contentId,
      timestamp: new Date().toISOString()
    });

    await trackEvent('content_create', {
      contentType,
      authorId,
      contentId
    });
  } catch (error) {
    console.error('Failed to track content creation:', error);
  }
}

/**
 * Track content view
 */
export async function trackContentView(contentId, contentType, userId) {
  try {
    await supabase.from('content_views').insert({
      content_id: contentId,
      content_type: contentType,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track content view:', error);
  }
}

/**
 * Track content interaction (like, comment, share)
 */
export async function trackContentInteraction(contentId, interactionType, userId) {
  try {
    await supabase.from('content_interactions').insert({
      content_id: contentId,
      interaction_type: interactionType, // 'like', 'comment', 'share'
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    await trackEvent('content_interaction', {
      contentId,
      interactionType,
      userId
    });
  } catch (error) {
    console.error('Failed to track content interaction:', error);
  }
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track event registration
 */
export async function trackEventRegistration(eventId, userId) {
  try {
    await supabase.from('event_analytics').insert({
      event_type: 'registration',
      event_id: eventId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    await trackEvent('event_register', { eventId, userId });
  } catch (error) {
    console.error('Failed to track event registration:', error);
  }
}

/**
 * Track event attendance
 */
export async function trackEventAttendance(eventId, userId) {
  try {
    await supabase.from('event_analytics').insert({
      event_type: 'attendance',
      event_id: eventId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    await trackEvent('event_attend', { eventId, userId });
  } catch (error) {
    console.error('Failed to track event attendance:', error);
  }
}

/**
 * Track event cancellation
 */
export async function trackEventCancellation(eventId, userId) {
  try {
    await supabase.from('event_analytics').insert({
      event_type: 'cancellation',
      event_id: eventId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    await trackEvent('event_cancel', { eventId, userId });
  } catch (error) {
    console.error('Failed to track event cancellation:', error);
  }
}

// ============================================================================
// PATHWAY TRACKING
// ============================================================================

/**
 * Track pathway join
 */
export async function trackPathwayJoin(pathway, userId) {
  try {
    await supabase.from('pathway_analytics').insert({
      event_type: 'join',
      pathway,
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    await trackEvent('pathway_join', { pathway, userId });
  } catch (error) {
    console.error('Failed to track pathway join:', error);
  }
}

/**
 * Track pathway activity
 */
export async function trackPathwayActivity(pathway, activityType, userId) {
  try {
    await supabase.from('pathway_activity').insert({
      pathway,
      activity_type: activityType,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track pathway activity:', error);
  }
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

/**
 * Track page load time
 */
export function trackPerformance(metrics) {
  const performanceData = {
    page_path: metrics.pagePath,
    dns_time: metrics.dnsTime,
    tcp_time: metrics.tcpTime,
    ttfb: metrics.ttfb, // Time to First Byte
    fcp: metrics.fcp, // First Contentful Paint
    lcp: metrics.lcp, // Largest Contentful Paint
    cls: metrics.cls, // Cumulative Layout Shift
    fid: metrics.fid, // First Input Delay
    load_time: metrics.loadTime,
    timestamp: new Date().toISOString()
  };

  try {
    supabase.from('performance_metrics').insert(performanceData);
  } catch (error) {
    console.error('Failed to track performance:', error);
  }

  // Send to Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('performance', metrics);
  }
}

/**
 * Track API response time
 */
export async function trackApiPerformance(endpoint, method, duration, statusCode) {
  try {
    await supabase.from('api_performance').insert({
      endpoint,
      method,
      duration_ms: duration,
      status_code: statusCode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track API performance:', error);
  }
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track JavaScript error
 */
export async function trackError(error, context = {}) {
  const errorData = {
    error_message: error.message,
    error_stack: error.stack,
    error_name: error.name,
    context: JSON.stringify(context),
    user_id: context.userId || 'anonymous',
    page_path: context.pagePath,
    timestamp: new Date().toISOString()
  };

  try {
    await supabase.from('error_logs').insert(errorData);
  } catch (err) {
    console.error('Failed to track error:', err);
  }

  // Send to error tracking service (Sentry, etc.)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
}

/**
 * Track 404 errors
 */
export async function track404(path, referrer) {
  try {
    await supabase.from('not_found_logs').insert({
      path,
      referrer,
      timestamp: new Date().toISOString()
    });

    await trackEvent('404_error', { path, referrer });
  } catch (error) {
    console.error('Failed to track 404:', error);
  }
}

// ============================================================================
// CONVERSION TRACKING
// ============================================================================

/**
 * Track user conversion (join Discord, verify, etc.)
 */
export async function trackConversion(conversionType, userId, value = null) {
  try {
    await supabase.from('conversions').insert({
      conversion_type: conversionType,
      user_id: userId,
      value,
      timestamp: new Date().toISOString()
    });

    await trackEvent('conversion', {
      conversionType,
      userId,
      value
    });
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
}

// ============================================================================
// AGGREGATED ANALYTICS
// ============================================================================

/**
 * Get server statistics
 */
export async function getServerStats(timeRange = '7d') {
  try {
    const guild = await getGuild(true);
    const members = await getGuildMembers();

    // Get time range
    const now = new Date();
    const since = getTimeRangeSince(timeRange);

    // Query analytics data
    const [
      pageViews,
      events,
      messages,
      voiceActivity,
      contentViews
    ] = await Promise.all([
      getPageViewsCount(since),
      getEventsCount(since),
      getMessagesCount(since),
      getVoiceActivitySum(since),
      getContentViewsCount(since)
    ]);

    return {
      guild: {
        totalMembers: guild.approximate_member_count || members.length,
        onlineMembers: guild.approximate_presence_count || 0
      },
      activity: {
        pageViews,
        events,
        messages,
        voiceMinutes: Math.floor(voiceActivity / 60),
        contentViews
      },
      growth: await getGrowthStats(since),
      topContent: await getTopContent(since),
      topMembers: await getTopMembers(since)
    };
  } catch (error) {
    console.error('Failed to get server stats:', error);
    throw error;
  }
}

/**
 * Get pathway statistics
 */
export async function getPathwayStats(pathway, timeRange = '7d') {
  const since = getTimeRangeSince(timeRange);

  try {
    const { data, error } = await supabase
      .from('pathway_analytics')
      .select('*')
      .eq('pathway', pathway)
      .gte('timestamp', since.toISOString());

    if (error) throw error;

    return {
      totalActivity: data.length,
      joins: data.filter(d => d.event_type === 'join').length,
      uniqueUsers: [...new Set(data.map(d => d.user_id))].length,
      activityByType: groupBy(data, 'activity_type')
    };
  } catch (error) {
    console.error('Failed to get pathway stats:', error);
    return null;
  }
}

/**
 * Get member engagement score
 */
export async function getMemberEngagement(userId, timeRange = '30d') {
  const since = getTimeRangeSince(timeRange);

  try {
    const [messages, voice, events, reactions] = await Promise.all([
      getMemberMessagesCount(userId, since),
      getMemberVoiceTime(userId, since),
      getMemberEventsAttended(userId, since),
      getMemberReactionsCount(userId, since)
    ]);

    const score = calculateEngagementScore({
      messages,
      voiceMinutes: Math.floor(voice / 60),
      eventsAttended: events,
      reactions
    });

    return {
      score,
      breakdown: {
        messages,
        voiceMinutes: Math.floor(voice / 60),
        eventsAttended: events,
        reactions
      }
    };
  } catch (error) {
    console.error('Failed to get member engagement:', error);
    return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTimeRangeSince(timeRange) {
  const now = new Date();
  const ranges = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    'all': Number.MAX_SAFE_INTEGER
  };
  
  return new Date(now - (ranges[timeRange] || ranges['7d']));
}

function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {});
}

function calculateEngagementScore(metrics) {
  // Weight different activities
  const weights = {
    messages: 1,
    voiceMinutes: 2,
    eventsAttended: 5,
    reactions: 0.5
  };

  return (
    metrics.messages * weights.messages +
    metrics.voiceMinutes * weights.voiceMinutes +
    metrics.eventsAttended * weights.eventsAttended +
    metrics.reactions * weights.reactions
  );
}

// Database query helpers
async function getPageViewsCount(since) {
  const { count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', since.toISOString());
  return count || 0;
}

async function getEventsCount(since) {
  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', since.toISOString());
  return count || 0;
}

async function getMessagesCount(since) {
  const { count } = await supabase
    .from('message_events')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', since.toISOString());
  return count || 0;
}

async function getVoiceActivitySum(since) {
  const { data } = await supabase
    .from('voice_events')
    .select('duration_seconds')
    .gte('timestamp', since.toISOString());
  return data?.reduce((sum, item) => sum + item.duration_seconds, 0) || 0;
}

async function getContentViewsCount(since) {
  const { count } = await supabase
    .from('content_views')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', since.toISOString());
  return count || 0;
}

async function getGrowthStats(since) {
  const { data } = await supabase
    .from('member_events')
    .select('event_type, timestamp')
    .gte('timestamp', since.toISOString())
    .order('timestamp', { ascending: true });

  return data || [];
}

async function getTopContent(since) {
  const { data } = await supabase
    .from('content_views')
    .select('content_id, content_type')
    .gte('timestamp', since.toISOString());

  // Group by content_id and count
  const counts = {};
  data?.forEach(item => {
    counts[item.content_id] = (counts[item.content_id] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id, views]) => ({ contentId: id, views }));
}

async function getTopMembers(since) {
  const { data } = await supabase
    .from('message_events')
    .select('user_id')
    .gte('timestamp', since.toISOString());

  const counts = {};
  data?.forEach(item => {
    counts[item.user_id] = (counts[item.user_id] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId, messageCount]) => ({ userId, messageCount }));
}

async function getMemberMessagesCount(userId, since) {
  const { count } = await supabase
    .from('message_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('timestamp', since.toISOString());
  return count || 0;
}

async function getMemberVoiceTime(userId, since) {
  const { data } = await supabase
    .from('voice_events')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('timestamp', since.toISOString());
  return data?.reduce((sum, item) => sum + item.duration_seconds, 0) || 0;
}

async function getMemberEventsAttended(userId, since) {
  const { count } = await supabase
    .from('event_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'attendance')
    .gte('timestamp', since.toISOString());
  return count || 0;
}

async function getMemberReactionsCount(userId, since) {
  const { count } = await supabase
    .from('reaction_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('timestamp', since.toISOString());
  return count || 0;
}

// ============================================================================
// BROWSER-SIDE INITIALIZATION
// ============================================================================

/**
 * Initialize client-side analytics
 */
export function initAnalytics(userId) {
  if (typeof window === 'undefined') return;

  // Track page views
  trackPageView({
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    userId,
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });

  // Track time on page
  let startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const duration = Date.now() - startTime;
    trackTimeOnPage(window.location.pathname, userId, duration);
  });

  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercentage = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollPercentage > maxScroll) {
      maxScroll = scrollPercentage;
      if (scrollPercentage % 25 === 0) {
        trackScroll(scrollPercentage, { userId });
      }
    }
  });

  // Track performance
  if (window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const metrics = {
          pagePath: window.location.pathname,
          dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcpTime: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          loadTime: perfData.loadEventEnd - perfData.navigationStart
        };
        trackPerformance(metrics);
      }, 0);
    });
  }

  // Track errors
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      userId,
      pagePath: window.location.pathname
    });
  });
}

function getSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Page tracking
  trackPageView,
  trackTimeOnPage,
  
  // Event tracking
  trackEvent,
  trackClick,
  trackFormSubmit,
  trackLinkClick,
  trackScroll,
  trackSearch,
  
  // Discord tracking
  trackMemberJoin,
  trackMemberLeave,
  trackMessage,
  trackVoiceActivity,
  trackReaction,
  
  // Admin tracking
  trackModerationAction,
  trackContentCreation,
  trackContentView,
  trackContentInteraction,
  
  // Event tracking
  trackEventRegistration,
  trackEventAttendance,
  trackEventCancellation,
  
  // Pathway tracking
  trackPathwayJoin,
  trackPathwayActivity,
  
  // Performance tracking
  trackPerformance,
  trackApiPerformance,
  
  // Error tracking
  trackError,
  track404,
  
  // Conversion tracking
  trackConversion,
  
  // Aggregated analytics
  getServerStats,
  getPathwayStats,
  getMemberEngagement,
  
  // Initialization
  initAnalytics
};