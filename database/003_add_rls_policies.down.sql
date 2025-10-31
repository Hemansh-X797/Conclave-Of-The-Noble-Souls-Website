-- ============================================================================
-- Rollback: 003_add_rls_policies
-- Created: 2025-01-28
-- Description: Remove Row Level Security policies
-- ============================================================================

-- Drop helper functions
DROP FUNCTION IF EXISTS has_role(TEXT, TEXT);
DROP FUNCTION IF EXISTS is_staff(TEXT);

-- Drop policies - Moderation Logs
DROP POLICY IF EXISTS moderation_logs_insert_staff ON moderation_logs;
DROP POLICY IF EXISTS moderation_logs_select_staff ON moderation_logs;

-- Drop policies - Content Submissions
DROP POLICY IF EXISTS content_submissions_update_staff ON content_submissions;
DROP POLICY IF EXISTS content_submissions_update_own ON content_submissions;
DROP POLICY IF EXISTS content_submissions_insert_own ON content_submissions;
DROP POLICY IF EXISTS content_submissions_select_all ON content_submissions;

-- Drop policies - Notifications
DROP POLICY IF EXISTS notifications_insert_service ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
DROP POLICY IF EXISTS notifications_select_own ON notifications;

-- Drop policies - Pathway Progress
DROP POLICY IF EXISTS pathway_progress_insert_own ON pathway_progress;
DROP POLICY IF EXISTS pathway_progress_update_own ON pathway_progress;
DROP POLICY IF EXISTS pathway_progress_select_all ON pathway_progress;

-- Drop policies - User Profiles
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_select_all ON user_profiles;

-- Drop policies - Users
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_select_own ON users;

-- Disable RLS on tables
ALTER TABLE moderation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;