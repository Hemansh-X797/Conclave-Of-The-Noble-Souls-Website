-- ============================================================================
-- Rollback: 001_initial_schema
-- Created: 2025-01-28
-- Description: Rollback initial database schema
-- ============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS update_server_stats_updated_at ON server_stats;
DROP TRIGGER IF EXISTS update_content_submissions_updated_at ON content_submissions;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_pathway_progress_updated_at ON pathway_progress;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS content_submissions CASCADE;
DROP TABLE IF EXISTS server_stats CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS pathway_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Note: Extensions are NOT dropped as they may be used by other schemas