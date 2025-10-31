-- ============================================================================
-- Migration: 003_add_rls_policies
-- Created: 2025-01-28
-- Description: Enable Row Level Security and add policies
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can read their own data, service role can read all
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Everyone can read all public profiles
CREATE POLICY user_profiles_select_all ON user_profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can create their own profile
CREATE POLICY user_profiles_insert_own ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- PATHWAY PROGRESS POLICIES
-- ============================================================================

-- Everyone can view all pathway progress (for leaderboards)
CREATE POLICY pathway_progress_select_all ON pathway_progress
  FOR SELECT
  USING (true);

-- Users can update their own progress
CREATE POLICY pathway_progress_update_own ON pathway_progress
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can insert their own progress
CREATE POLICY pathway_progress_insert_own ON pathway_progress
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Service role can insert notifications
CREATE POLICY notifications_insert_service ON notifications
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- CONTENT SUBMISSIONS POLICIES
-- ============================================================================

-- Everyone can view approved/published submissions
CREATE POLICY content_submissions_select_all ON content_submissions
  FOR SELECT
  USING (true);

-- Users can create their own submissions
CREATE POLICY content_submissions_insert_own ON content_submissions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own pending submissions
CREATE POLICY content_submissions_update_own ON content_submissions
  FOR UPDATE
  USING (auth.uid()::text = user_id AND status = 'pending')
  WITH CHECK (auth.uid()::text = user_id);

-- Service role (staff) can update any submission
CREATE POLICY content_submissions_update_staff ON content_submissions
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- MODERATION LOGS POLICIES
-- ============================================================================

-- Only service role (staff) can view moderation logs
CREATE POLICY moderation_logs_select_staff ON moderation_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Only service role can insert moderation logs
CREATE POLICY moderation_logs_insert_staff ON moderation_logs
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_roles TEXT[];
  staff_role_ids TEXT[] := ARRAY[
    '1369566988128751750', -- Owner
    '1369197369161154560', -- Board
    '1396459118025375784', -- Head Admin
    '1370702703616856074', -- Admin
    '1409148504026120293', -- Head Mod
    '1408079849377107989'  -- Moderator
  ];
BEGIN
  SELECT roles INTO user_roles FROM users WHERE id = user_id;
  RETURN user_roles && staff_role_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_id TEXT, role_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_roles TEXT[];
BEGIN
  SELECT roles INTO user_roles FROM users WHERE id = user_id;
  RETURN role_id = ANY(user_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;