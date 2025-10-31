-- ============================================================================
-- Rollback: 002_add_indexes
-- Created: 2025-01-28
-- Description: Remove performance indexes
-- ============================================================================

-- Drop composite indexes
DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_events_pathway_start;
DROP INDEX IF EXISTS idx_user_profiles_level_xp;

-- Drop moderation logs indexes
DROP INDEX IF EXISTS idx_moderation_logs_created_at;
DROP INDEX IF EXISTS idx_moderation_logs_action;
DROP INDEX IF EXISTS idx_moderation_logs_target_user_id;
DROP INDEX IF EXISTS idx_moderation_logs_moderator_id;

-- Drop content submissions indexes
DROP INDEX IF EXISTS idx_content_submissions_created_at;
DROP INDEX IF EXISTS idx_content_submissions_type;
DROP INDEX IF EXISTS idx_content_submissions_pathway;
DROP INDEX IF EXISTS idx_content_submissions_status;
DROP INDEX IF EXISTS idx_content_submissions_user_id;

-- Drop notifications indexes
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_expires_at;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_user_id;

-- Drop user achievements indexes
DROP INDEX IF EXISTS idx_user_achievements_earned_at;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS idx_user_achievements_user_id;

-- Drop achievements indexes
DROP INDEX IF EXISTS idx_achievements_active;
DROP INDEX IF EXISTS idx_achievements_rarity;
DROP INDEX IF EXISTS idx_achievements_pathway;

-- Drop events indexes
DROP INDEX IF EXISTS idx_events_created_at;
DROP INDEX IF EXISTS idx_events_type;
DROP INDEX IF EXISTS idx_events_active;
DROP INDEX IF EXISTS idx_events_status;
DROP INDEX IF EXISTS idx_events_start_date;
DROP INDEX IF EXISTS idx_events_pathway;

-- Drop pathway progress indexes
DROP INDEX IF EXISTS idx_pathway_progress_last_active;
DROP INDEX IF EXISTS idx_pathway_progress_xp;
DROP INDEX IF EXISTS idx_pathway_progress_level;
DROP INDEX IF EXISTS idx_pathway_progress_pathway_id;
DROP INDEX IF EXISTS idx_pathway_progress_user_id;

-- Drop user profiles indexes
DROP INDEX IF EXISTS idx_user_profiles_last_active;
DROP INDEX IF EXISTS idx_user_profiles_total_xp;
DROP INDEX IF EXISTS idx_user_profiles_level;

-- Drop users indexes
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_in_server;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_discord_id;