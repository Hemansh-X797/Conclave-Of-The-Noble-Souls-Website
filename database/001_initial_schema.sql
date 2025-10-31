-- ============================================================================
-- Migration: 001_initial_schema
-- Created: 2025-01-28
-- Description: Initial compound database schema for The Conclave Realm
-- Version: 2.0.0 - Merged System
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT ('user_' || gen_random_uuid()::text),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  discriminator TEXT DEFAULT '0',
  global_name TEXT,
  avatar TEXT,
  avatar_url TEXT,
  banner TEXT,
  banner_url TEXT,
  email TEXT,
  nickname TEXT,
  roles TEXT[] DEFAULT '{}',
  permissions JSONB DEFAULT '{}'::jsonb,
  in_server BOOLEAN DEFAULT false,
  server_booster BOOLEAN DEFAULT false,
  boost_since TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  pathways JSONB DEFAULT '[]'::jsonb,
  primary_pathway TEXT CHECK (primary_pathway IN ('gaming', 'lorebound', 'productive', 'news') OR primary_pathway IS NULL),
  pathway_join_dates JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  banner TEXT,
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  message_count INTEGER DEFAULT 0 CHECK (message_count >= 0),
  voice_minutes INTEGER DEFAULT 0 CHECK (voice_minutes >= 0),
  activity_score INTEGER DEFAULT 0 CHECK (activity_score >= 0),
  events_attended INTEGER DEFAULT 0 CHECK (events_attended >= 0),
  tournaments_won INTEGER DEFAULT 0 CHECK (tournaments_won >= 0),
  achievements JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  last_active TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{"particlesEnabled":true,"soundsEnabled":true,"animationsEnabled":true,"theme":"default","notifications":true,"public_profile":true,"show_activity":true,"allow_dms":true}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PATHWAY PROGRESS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS pathway_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pathway_id TEXT NOT NULL CHECK (pathway_id IN ('gaming', 'lorebound', 'productive', 'news')),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  next_level_xp INTEGER DEFAULT 1000 CHECK (next_level_xp > 0),
  current_rank TEXT DEFAULT 'Initiate',
  tasks_completed INTEGER DEFAULT 0 CHECK (tasks_completed >= 0),
  events_attended INTEGER DEFAULT 0 CHECK (events_attended >= 0),
  contributions INTEGER DEFAULT 0 CHECK (contributions >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  achievements TEXT[] DEFAULT '{}',
  unlocked_content JSONB DEFAULT '[]'::jsonb,
  completed_challenges JSONB DEFAULT '[]'::jsonb,
  earned_titles JSONB DEFAULT '[]'::jsonb,
  pathway_data JSONB DEFAULT '{}'::jsonb,
  custom_data JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, pathway_id)
);

-- ============================================================================
-- CONTENT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('article', 'guide', 'review', 'news', 'resource', 'announcement')),
  pathway TEXT CHECK (pathway IN ('gaming', 'lorebound', 'productive', 'news') OR pathway IS NULL),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  content TEXT,
  featured_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  author_id TEXT REFERENCES users(id),
  author_name TEXT,
  author_role TEXT,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'review', 'approved', 'published', 'rejected', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'members', 'pathway', 'roles')),
  required_roles JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
  comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
  share_count INTEGER DEFAULT 0 CHECK (share_count >= 0),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  discord_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  pathway TEXT CHECK (pathway IN ('gaming', 'lorebound', 'productive', 'news') OR pathway IS NULL),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  timezone TEXT DEFAULT 'UTC',
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  location_type TEXT DEFAULT 'discord' CHECK (location_type IN ('discord', 'online', 'hybrid')),
  voice_channel_id TEXT,
  stream_url TEXT,
  meeting_link TEXT,
  max_participants INTEGER CHECK (max_participants > 0 OR max_participants IS NULL),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  participants TEXT[] DEFAULT '{}',
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP,
  host TEXT,
  host_id UUID REFERENCES users(id),
  co_hosts JSONB DEFAULT '[]'::jsonb,
  requirements TEXT[] DEFAULT '{}',
  required_roles JSONB DEFAULT '[]'::jsonb,
  required_pathway TEXT,
  min_level INTEGER DEFAULT 0,
  banner_image TEXT,
  thumbnail TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  rewards JSONB DEFAULT '{"xp":0,"badges":[]}'::jsonb,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  cancelled_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (end_date IS NULL OR end_date > start_date)
);

-- ============================================================================
-- EVENT REGISTRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no-show', 'cancelled')),
  registered_at TIMESTAMP DEFAULT NOW(),
  attended_at TIMESTAMP,
  feedback JSONB,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(event_id, user_id)
);

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pathway TEXT CHECK (pathway IN ('gaming', 'lorebound', 'productive', 'news') OR pathway IS NULL),
  category TEXT CHECK (category IN ('milestone', 'special', 'seasonal', 'pathway', 'community')),
  icon TEXT,
  icon_url TEXT,
  badge_url TEXT,
  color TEXT,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
  requirements JSONB DEFAULT '{}'::jsonb,
  points INTEGER DEFAULT 10 CHECK (points >= 0),
  hidden BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_earned INTEGER DEFAULT 0 CHECK (total_earned >= 0),
  first_earned_by TEXT REFERENCES users(id),
  first_earned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 100 CHECK (progress >= 0 AND progress <= 100),
  showcased BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'gaming', 'lorebound', 'productive', 'news')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- ============================================================================
-- SERVER STATS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS server_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
  online_count INTEGER DEFAULT 0 CHECK (online_count >= 0),
  boost_level INTEGER DEFAULT 0 CHECK (boost_level >= 0),
  boost_count INTEGER DEFAULT 0 CHECK (boost_count >= 0),
  pathway_stats JSONB DEFAULT '{"gaming":0,"lorebound":0,"productive":0,"news":0}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (id = 1)
);

-- ============================================================================
-- MODERATION LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS moderation_logs (
  id SERIAL PRIMARY KEY,
  moderator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('warn', 'mute', 'kick', 'ban', 'unban', 'timeout', 'note')),
  reason TEXT,
  duration INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_value NUMERIC,
  page_path TEXT,
  page_title TEXT,
  referrer TEXT,
  pathway TEXT,
  user_agent TEXT,
  ip_address INET,
  country CHAR(2),
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- DISCORD SYNC LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS discord_sync_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('members', 'roles', 'stats', 'events')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  members_synced INTEGER DEFAULT 0,
  roles_synced INTEGER DEFAULT 0,
  events_synced INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- ADMIN LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN ('user', 'content', 'event', 'setting', 'achievement')),
  target_id TEXT,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pathway_progress_updated_at BEFORE UPDATE ON pathway_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_server_stats_updated_at BEFORE UPDATE ON server_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

INSERT INTO server_stats (id, member_count, online_count, boost_level, boost_count)
VALUES (1, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;