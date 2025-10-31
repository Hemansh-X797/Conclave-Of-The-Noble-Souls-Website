// ============================================================================
// SUPABASE DATABASE CLIENT
// Production-grade database connection and operations
// /src/lib/supabase.js
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Public Supabase client for browser usage
 * Uses anon key with Row Level Security
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'conclave-realm-web'
    }
  }
});

/**
 * Admin Supabase client for server-side operations
 * Bypasses Row Level Security - USE WITH CAUTION
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// ============================================================================
// AUTHENTICATION OPERATIONS
// ============================================================================

/**
 * Get current authenticated user
 */
export async function getSupabaseUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting Supabase user:', error);
    return null;
  }
}

/**
 * Sign in with Discord OAuth
 */
export async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      scopes: 'identify email guilds'
    }
  });

  if (error) {
    console.error('Discord sign in error:', error);
    throw error;
  }

  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ============================================================================
// MEMBER STATS OPERATIONS
// ============================================================================

/**
 * Get member statistics by user ID
 */
export async function getMemberStats(userId) {
  const { data, error } = await supabase
    .from('member_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching member stats:', error);
    throw error;
  }

  return data;
}

/**
 * Update or create member statistics
 */
export async function upsertMemberStats(userId, stats) {
  const { data, error } = await supabase
    .from('member_stats')
    .upsert({
      user_id: userId,
      ...stats,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating member stats:', error);
    throw error;
  }

  return data;
}

/**
 * Increment member XP
 */
export async function incrementMemberXP(userId, xpAmount) {
  const stats = await getMemberStats(userId);
  const currentXP = stats?.xp || 0;
  const currentLevel = stats?.level || 1;
  
  const newXP = currentXP + xpAmount;
  const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level

  return upsertMemberStats(userId, {
    xp: newXP,
    level: newLevel
  });
}

// ============================================================================
// CONTENT OPERATIONS
// ============================================================================

/**
 * Get all content with optional filters
 */
export async function getContent(filters = {}) {
  let query = supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.pathway) {
    query = query.eq('pathway', filters.pathway);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching content:', error);
    throw error;
  }

  return data;
}

/**
 * Get single content item by ID
 */
export async function getContentById(id) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching content:', error);
    throw error;
  }

  return data;
}

/**
 * Create new content
 */
export async function createContent(content) {
  const { data, error } = await supabase
    .from('content')
    .insert({
      ...content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating content:', error);
    throw error;
  }

  return data;
}

/**
 * Update existing content
 */
export async function updateContent(id, updates) {
  const { data, error } = await supabase
    .from('content')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating content:', error);
    throw error;
  }

  return data;
}

/**
 * Delete content
 */
export async function deleteContent(id) {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content:', error);
    throw error;
  }

  return true;
}

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

/**
 * Get all events with optional filters
 */
export async function getEvents(filters = {}) {
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (filters.pathway) {
    query = query.eq('pathway', filters.pathway);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.upcoming) {
    query = query.gte('start_date', new Date().toISOString());
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data;
}

/**
 * Get single event by ID
 */
export async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    throw error;
  }

  return data;
}

/**
 * Create new event
 */
export async function createEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
}

/**
 * Update existing event
 */
export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from('events')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
}

/**
 * Delete event
 */
export async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }

  return true;
}

// ============================================================================
// MODERATION LOGS
// ============================================================================

/**
 * Create moderation log entry
 */
export async function createModLog(logData) {
  const { error } = await supabase
    .from('mod_logs')
    .insert({
      ...logData,
      timestamp: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating mod log:', error);
    throw error;
  }

  return true;
}

/**
 * Get moderation logs with filters
 */
export async function getModLogs(filters = {}) {
  let query = supabase
    .from('mod_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(filters.limit || 100);

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.moderatorId) {
    query = query.eq('moderator_id', filters.moderatorId);
  }

  if (filters.action) {
    query = query.eq('action', filters.action);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching mod logs:', error);
    throw error;
  }

  return data;
}

// ============================================================================
// ADMIN LOGS
// ============================================================================

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(actionData) {
  const { error } = await supabase
    .from('admin_logs')
    .insert({
      ...actionData,
      timestamp: new Date().toISOString()
    });

  if (error) {
    console.error('Error logging admin action:', error);
  }

  return true;
}

// ============================================================================
// FILE STORAGE OPERATIONS
// ============================================================================

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    path: data.path,
    publicUrl
  };
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }

  return true;
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to content changes
 */
export function subscribeToContent(callback) {
  return supabase
    .channel('content-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'content'
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to event changes
 */
export function subscribeToEvents(callback) {
  return supabase
    .channel('event-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events'
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to specific user's member stats
 */
export function subscribeToMemberStats(userId, callback) {
  return supabase
    .channel(`member-stats-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'member_stats',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Supabase is connected
 */
export async function checkConnection() {
  try {
    const { error } = await supabase.from('member_stats').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
  try {
    const isConnected = await checkConnection();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default supabase;