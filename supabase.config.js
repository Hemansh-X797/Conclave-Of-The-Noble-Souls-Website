supabase.config.js
// ============================================
// THE CONCLAVE REALM - Supabase Configuration
// /lib/supabase.js
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'the-conclave-realm'
    }
  }
});

// Server-side Supabase client (for API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================
// DATABASE SCHEMA SQL
// Copy this to Supabase SQL Editor
// ============================================

/*
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table (synced with Discord)
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  discriminator VARCHAR(10),
  global_name VARCHAR(255),
  avatar_url TEXT,
  banner_url TEXT,
  email VARCHAR(255),
  joined_server_at TIMESTAMPTZ,
  joined_website_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Discord server data
  nickname VARCHAR(255),
  roles JSONB DEFAULT '[]'::jsonb,
  permissions JSONB DEFAULT '{}'::jsonb,
  server_booster BOOLEAN DEFAULT FALSE,
  boost_since TIMESTAMPTZ,
  
  -- Pathway affiliations
  pathways JSONB DEFAULT '[]'::jsonb,
  primary_pathway VARCHAR(50),
  pathway_join_dates JSONB DEFAULT '{}'::jsonb,
  
  -- Stats and activity
  activity_score INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  voice_minutes INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Preferences
  preferences JSONB DEFAULT '{
    "theme": "default",
    "notifications": true,
    "public_profile": true,
    "show_activity": true,
    "allow_dms": true
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pathway Progress Tracking
CREATE TABLE pathway_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  pathway_type VARCHAR(50) NOT NULL,
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 100,
  total_xp INTEGER DEFAULT 0,
  
  -- Progress metrics
  tasks_completed INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  contributions INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unlocked content
  unlocked_content JSONB DEFAULT '[]'::jsonb,
  completed_challenges JSONB DEFAULT '[]'::jsonb,
  earned_titles JSONB DEFAULT '[]'::jsonb,
  
  -- Pathway-specific data
  pathway_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id, pathway_type)
);

-- Content Management System
CREATE TABLE content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- article, announcement, guide, resource, event
  pathway VARCHAR(50), -- gaming, lorebound, productive, news, null for general
  
  -- Content details
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  featured_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Author information
  author_id UUID REFERENCES members(id),
  author_name VARCHAR(255),
  author_role VARCHAR(50),
  
  -- Publishing
  status VARCHAR(50) DEFAULT 'draft', -- draft, review, published, archived
  visibility VARCHAR(50) DEFAULT 'public', -- public, members, pathway, roles
  required_roles JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events System
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  discord_event_id VARCHAR(255),
  
  -- Event details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  pathway VARCHAR(50),
  type VARCHAR(50) NOT NULL, -- tournament, meetup, workshop, stream, announcement
  
  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  timezone VARCHAR(50) DEFAULT 'UTC',
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  
  -- Location
  location_type VARCHAR(50) DEFAULT 'discord', -- discord, online, hybrid
  voice_channel_id VARCHAR(255),
  stream_url TEXT,
  meeting_link TEXT,
  
  -- Participation
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMPTZ,
  
  -- Requirements
  required_roles JSONB DEFAULT '[]'::jsonb,
  required_pathway VARCHAR(50),
  min_level INTEGER DEFAULT 0,
  
  -- Organizers
  host_id UUID REFERENCES members(id),
  co_hosts JSONB DEFAULT '[]'::jsonb,
  
  -- Media
  banner_image TEXT,
  thumbnail TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status VARCHAR(50) DEFAULT 'upcoming', -- draft, upcoming, ongoing, completed, cancelled
  cancelled_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations
CREATE TABLE event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  
  status VARCHAR(50) DEFAULT 'registered', -- registered, attended, no-show, cancelled
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  feedback JSONB,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  UNIQUE(event_id, member_id)
);

-- Achievements System
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pathway VARCHAR(50),
  category VARCHAR(50), -- milestone, special, seasonal, pathway, community
  
  -- Visual
  icon_url TEXT,
  badge_url TEXT,
  color VARCHAR(7),
  rarity VARCHAR(50) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  
  -- Requirements
  requirements JSONB NOT NULL,
  points INTEGER DEFAULT 10,
  hidden BOOLEAN DEFAULT FALSE,
  
  -- Stats
  total_earned INTEGER DEFAULT 0,
  first_earned_by UUID REFERENCES members(id),
  first_earned_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Achievements
CREATE TABLE member_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 100,
  showcased BOOLEAN DEFAULT FALSE,
  
  UNIQUE(member_id, achievement_id)
);

-- Analytics & Tracking
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Event data
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(100),
  event_action VARCHAR(255),
  event_label TEXT,
  event_value NUMERIC,
  
  -- Page data
  page_path TEXT,
  page_title VARCHAR(500),
  referrer TEXT,
  
  -- User context
  pathway VARCHAR(50),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  
  -- Device info
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  screen_resolution VARCHAR(20),
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Discord Sync Log
CREATE TABLE discord_sync_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- members, roles, stats, events
  status VARCHAR(50) NOT NULL, -- started, completed, failed
  
  members_synced INTEGER DEFAULT 0,
  roles_synced INTEGER DEFAULT 0,
  events_synced INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb
);

-- Admin Logs
CREATE TABLE admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES members(id),
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(50), -- member, content, event, setting
  target_id VARCHAR(255),
  
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_members_discord_id ON members(discord_id);
CREATE INDEX idx_members_pathways ON members USING GIN(pathways);
CREATE INDEX idx_members_roles ON members USING GIN(roles);
CREATE INDEX idx_content_pathway ON content(pathway);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_pathway ON events(pathway);
CREATE INDEX idx_analytics_member_id ON analytics(member_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);

-- Row Level Security (RLS) Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public content is viewable by everyone" 
  ON content FOR SELECT 
  USING (status = 'published' AND visibility = 'public');

-- Members can view member-only content
CREATE POLICY "Members can view member content" 
  ON content FOR SELECT 
  USING (
    status = 'published' 
    AND visibility = 'members' 
    AND auth.uid() IS NOT NULL
  );

-- Members can view their own data
CREATE POLICY "Members can view own profile" 
  ON members FOR SELECT 
  USING (id = auth.uid() OR is_public_profile());

-- Members can update their own preferences
CREATE POLICY "Members can update own preferences" 
  ON members FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Function to check if profile is public
CREATE OR REPLACE FUNCTION is_public_profile()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (preferences->>'public_profile')::boolean = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_pathway_progress_updated_at BEFORE UPDATE ON pathway_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/