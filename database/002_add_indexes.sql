-- ============================================================================
-- Migration: 002_add_indexes
-- Created: 2025-01-28
-- Description: Add indexes for performance optimization
-- ============================================================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_in_server ON users(in_server);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON user_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active DESC);

-- Pathway Progress Indexes
CREATE INDEX IF NOT EXISTS idx_pathway_progress_user_id ON pathway_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_pathway_progress_pathway_id ON pathway_progress(pathway_id);
CREATE INDEX IF NOT EXISTS idx_pathway_progress_level ON pathway_progress(pathway_id, level DESC);
CREATE INDEX IF NOT EXISTS idx_pathway_progress_xp ON pathway_progress(pathway_id, xp DESC);
CREATE INDEX IF NOT EXISTS idx_pathway_progress_last_active ON pathway_progress(last_active DESC);

-- Events Indexes
CREATE INDEX IF NOT EXISTS idx_events_pathway ON events(pathway);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_pathway ON achievements(pathway);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active);

-- User Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Content Submissions Indexes
CREATE INDEX IF NOT EXISTS idx_content_submissions_user_id ON content_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_status ON content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_content_submissions_pathway ON content_submissions(pathway);
CREATE INDEX IF NOT EXISTS idx_content_submissions_type ON content_submissions(type);
CREATE INDEX IF NOT EXISTS idx_content_submissions_created_at ON content_submissions(created_at DESC);

-- Moderation Logs Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator_id ON moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target_user_id ON moderation_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);

-- Composite Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_level_xp ON user_profiles(level DESC, total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_events_pathway_start ON events(pathway, start_date DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read = false;