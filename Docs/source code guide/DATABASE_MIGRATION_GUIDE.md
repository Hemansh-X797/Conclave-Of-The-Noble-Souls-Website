# The Conclave Realm - Database Migration System Guide

## Overview

This guide provides complete instructions for setting up, managing, and maintaining The Conclave Realm's production-ready database system using our custom migration framework.

**Version:** 2.0.0  
**Last Updated:** January 28, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Prerequisites](#prerequisites)
3. [Initial Setup Process](#initial-setup-process)
4. [Migration Management](#migration-management)
5. [Database Schema Details](#database-schema-details)
6. [Security Implementation](#security-implementation)
7. [Performance Optimization](#performance-optimization)
8. [Maintenance Operations](#maintenance-operations)
9. [Troubleshooting Common Issues](#troubleshooting-common-issues)
10. [Advanced Usage Patterns](#advanced-usage-patterns)
11. [API Integration Examples](#api-integration-examples)
12. [Backup and Recovery](#backup-and-recovery)

---

## System Architecture

### Component Overview

```
/database
  ├── /migrations          # Version-controlled SQL migrations
  │   ├── 001_initial_schema.sql
  │   ├── 001_initial_schema.down.sql
  │   ├── 002_add_indexes.sql
  │   ├── 002_add_indexes.down.sql
  │   ├── 003_add_rls_policies.sql
  │   └── 003_add_rls_policies.down.sql
  ├── schema.sql           # Complete schema reference
  └── /backups             # Automated backups

/scripts
  ├── migrate.js           # Migration runner
  ├── setup-db.js          # Initial setup
  ├── seed-data.js         # Sample data seeder
  ├── backup-db.js         # Backup utility
  └── sync-discord-roles.js # Discord sync
```

### Database Tables Structure

**Core Tables (5):**
- `users` - Discord member data
- `user_profiles` - Extended profiles
- `pathway_progress` - Pathway tracking
- `achievements` - Achievement definitions
- `user_achievements` - User-achievement mapping

**Content Tables (3):**
- `content` - CMS for articles/guides
- `events` - Event management
- `event_registrations` - Attendance tracking

**System Tables (7):**
- `notifications` - User alerts
- `server_stats` - Cached statistics
- `moderation_logs` - Staff actions
- `analytics` - Website analytics
- `discord_sync_log` - Sync tracking
- `admin_logs` - Audit trail
- `migrations` - Migration tracking

---

## Prerequisites

### Required Software

```bash
# Node.js 18+ (check version)
node --version  # Should be v18.0.0 or higher

# npm (comes with Node.js)
npm --version

# Git (for version control)
git --version
```

### Required Environment Variables

Create or update `.env.local` with:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Discord Configuration (REQUIRED for sync)
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=1368124846760001546

# Optional but Recommended
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_DB_PASSWORD=your_postgres_password
```

### Supabase Access Requirements

1. **Supabase Project** - Create at [supabase.com](https://supabase.com)
2. **Service Role Key** - Found in Project Settings → API
3. **SQL Editor Access** - Available in Supabase dashboard

---

## Initial Setup Process

### Step 1: Verify Environment

```bash
# Navigate to project root
cd /path/to/Conclave

# Check if .env.local exists
ls -la .env.local

# Verify Node.js installation
node --version
```

### Step 2: Install Dependencies

```bash
# Install required packages
npm install @supabase/supabase-js dotenv
```

### Step 3: Create Migrations Directory

```bash
# Create migrations folder
mkdir -p database/migrations

# Create backups folder
mkdir -p database/backups
```

### Step 4: Run Initial Setup

```bash
# Run setup script
node scripts/setup-db.js
```

**What This Does:**
- Tests database connection
- Displays SQL schema to run manually
- Provides instructions for Supabase SQL Editor

### Step 5: Execute Schema in Supabase

1. **Open Supabase Dashboard** → Your Project
2. **Navigate to** SQL Editor
3. **Copy** the complete schema from `database/schema.sql`
4. **Paste** into SQL Editor
5. **Click** "Run" button
6. **Wait** for success confirmation

### Step 6: Verify Tables Created

```bash
# Run migration status
node scripts/migrate.js status
```

Expected output:
```
📊 Migration Status
════════════════════════════════════════════════
Applied Migrations:
   No migrations applied yet
Pending Migrations:
   1. ⏳ 001_initial_schema.sql
   2. ⏳ 002_add_indexes.sql
   3. ⏳ 003_add_rls_policies.sql
════════════════════════════════════════════════
```

### Step 7: Apply Migrations

```bash
# Apply all pending migrations
node scripts/migrate.js up
```

Expected output:
```
🚀 Running migrations UP
📋 Found 3 pending migration(s)

🔄 Applying migration: 001_initial_schema.sql
   📝 Executing SQL...
   ✅ Applied successfully (1247ms)

🔄 Applying migration: 002_add_indexes.sql
   📝 Executing SQL...
   ✅ Applied successfully (892ms)

🔄 Applying migration: 003_add_rls_policies.sql
   📝 Executing SQL...
   ✅ Applied successfully (456ms)

════════════════════════════════════════════════
Migration Summary:
   ✅ Successful: 3
   ❌ Failed: 0
════════════════════════════════════════════════

✅ All migrations applied successfully!
```

### Step 8: Seed Initial Data

```bash
# Populate database with sample data
node scripts/seed-data.js
```

This creates:
- Achievement definitions
- Server stats record
- Sample user and profile
- Sample events

### Step 9: Verify Setup Complete

```bash
# Check migration status again
node scripts/migrate.js status
```

Should show all migrations as applied.

---

## Migration Management

### Understanding Migration Files

**Migration Naming Convention:**
```
[NUMBER]_[description].sql      # UP migration
[NUMBER]_[description].down.sql # DOWN migration (rollback)
```

**Example:**
```
001_initial_schema.sql          # Creates tables
001_initial_schema.down.sql     # Drops tables
```

### Creating New Migrations

```bash
# Create new migration
node scripts/migrate.js create add_user_preferences
```

**Output:**
```
📝 Creating new migration

✅ Migration files created:
   UP:   004_add_user_preferences.sql
   DOWN: 004_add_user_preferences.down.sql

📝 Next steps:
   1. Edit the migration files in: /database/migrations
   2. Add your SQL statements
   3. Run: node scripts/migrate.js up
```

### Editing Migration Files

**UP Migration Template:**
```sql
-- ============================================================================
-- Migration: add_user_preferences
-- Created: 2025-01-28T12:00:00.000Z
-- Description: Add user preferences column
-- ============================================================================

-- Add your UP migration SQL here
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_users_preferences ON users USING GIN(preferences);
```

**DOWN Migration Template:**
```sql
-- ============================================================================
-- Rollback: add_user_preferences
-- Created: 2025-01-28T12:00:00.000Z
-- Description: Rollback for add_user_preferences
-- ============================================================================

-- Add your DOWN migration SQL here (to undo the UP migration)
DROP INDEX IF EXISTS idx_users_preferences;

ALTER TABLE users DROP COLUMN IF EXISTS preferences;
```

### Applying Migrations

```bash
# Apply all pending migrations
node scripts/migrate.js up

# Check what will be applied first
node scripts/migrate.js status
```

### Rolling Back Migrations

```bash
# Rollback the last applied migration
node scripts/migrate.js down
```

**Warning:** This will prompt for confirmation:
```
⚠️  ROLLBACK CONFIRMATION
════════════════════════════════════════════════
Migration to rollback: 003_add_rls_policies.sql
Applied at: 1/28/2025, 12:34:56 PM
════════════════════════════════════════════════

This will rollback the last applied migration.
Press Enter to continue or Ctrl+C to cancel...
```

### Checking Migration Status

```bash
# View current migration state
node scripts/migrate.js status
```

**Output Details:**
- **Applied Migrations** - Already executed
- **Pending Migrations** - Waiting to be applied
- **Total Count** - All migrations in folder

---

## Database Schema Details

### Core User System

**Users Table** - Main user records
```sql
Key Columns:
- id (TEXT) - Primary key
- discord_id (TEXT) - Unique Discord ID
- username (TEXT) - Discord username
- roles (TEXT[]) - Array of role IDs
- pathways (JSONB) - Pathway memberships
- in_server (BOOLEAN) - Active member status
```

**User Profiles Table** - Extended information
```sql
Key Columns:
- user_id (TEXT) - Foreign key to users
- total_xp (INTEGER) - Lifetime XP
- level (INTEGER) - User level
- message_count (INTEGER) - Messages sent
- achievements (JSONB) - Achievement list
- preferences (JSONB) - User settings
```

### Pathway System

**Pathway Progress Table** - Per-pathway tracking
```sql
Key Columns:
- user_id (TEXT) - Foreign key to users
- pathway_id (TEXT) - gaming/lorebound/productive/news
- level (INTEGER) - Pathway level
- xp (INTEGER) - Current XP
- total_xp (INTEGER) - Lifetime pathway XP
- achievements (TEXT[]) - Pathway achievements
```

**Pathway IDs:**
- `gaming` - Gaming Realm
- `lorebound` - Lorebound Realm (Anime/Manga)
- `productive` - Productive Palace
- `news` - News Nexus

### Achievement System

**Achievements Table** - Achievement definitions
```sql
Key Columns:
- id (TEXT) - Unique identifier
- name (TEXT) - Display name
- pathway (TEXT) - Pathway association
- rarity (TEXT) - common/uncommon/rare/epic/legendary/mythic
- xp (INTEGER) - XP reward
- requirements (JSONB) - Unlock conditions
```

**User Achievements Table** - User-achievement mapping
```sql
Key Columns:
- user_id (TEXT) - Foreign key to users
- achievement_id (TEXT) - Foreign key to achievements
- earned_at (TIMESTAMP) - When earned
- showcased (BOOLEAN) - Display on profile
```

### Content Management

**Content Table** - Articles, guides, resources
```sql
Key Columns:
- id (UUID) - Primary key
- type (TEXT) - article/guide/review/news/resource
- pathway (TEXT) - Associated pathway
- title (TEXT) - Content title
- body (TEXT) - Main content
- status (TEXT) - draft/pending/published
- author_id (TEXT) - Foreign key to users
```

### Event System

**Events Table** - Community events
```sql
Key Columns:
- id (UUID) - Primary key
- title (TEXT) - Event name
- start_date (TIMESTAMP) - Start time
- pathway (TEXT) - Associated pathway
- max_participants (INTEGER) - Capacity
- host_id (UUID) - Event host
- rewards (JSONB) - Event rewards
```

**Event Registrations Table** - Attendance tracking
```sql
Key Columns:
- event_id (UUID) - Foreign key to events
- user_id (TEXT) - Foreign key to users
- status (TEXT) - registered/attended/no-show
- rating (INTEGER) - 1-5 star rating
```

### System Tables

**Notifications Table** - User notifications
```sql
Key Columns:
- user_id (TEXT) - Foreign key to users
- title (TEXT) - Notification title
- type (TEXT) - info/success/warning/error/pathway
- read (BOOLEAN) - Read status
- expires_at (TIMESTAMP) - Auto-delete time
```

**Server Stats Table** - Cached statistics
```sql
Key Columns:
- id (INTEGER) - Always 1 (singleton)
- member_count (INTEGER) - Total members
- pathway_stats (JSONB) - Per-pathway counts
```

**Moderation Logs Table** - Staff actions
```sql
Key Columns:
- moderator_id (TEXT) - Staff member
- target_user_id (TEXT) - Target user
- action (TEXT) - warn/mute/kick/ban
- reason (TEXT) - Action reason
```

---

## Security Implementation

### Row Level Security (RLS)

**Enabled Tables:**
- `users`
- `user_profiles`
- `pathway_progress`
- `notifications`
- `content`
- `moderation_logs`

### Policy Examples

**Users Can Read Own Data:**
```sql
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid()::text = id);
```

**Everyone Can View Public Profiles:**
```sql
CREATE POLICY user_profiles_select_all ON user_profiles
  FOR SELECT
  USING (true);
```

**Staff-Only Access:**
```sql
CREATE POLICY moderation_logs_select_staff ON moderation_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### Helper Functions

**Check if User is Staff:**
```sql
SELECT is_staff('user_123');
-- Returns: true/false
```

**Check if User Has Role:**
```sql
SELECT has_role('user_123', '1369566988128751750');
-- Returns: true/false
```

### Role-Based Access Control

**Staff Role IDs:**
```javascript
Owner: '1369566988128751750'
Board: '1369197369161154560'
Head Admin: '1396459118025375784'
Admin: '1370702703616856074'
Head Mod: '1409148504026120293'
Moderator: '1408079849377107989'
```

---

## Performance Optimization

### Installed Indexes

**Total Indexes:** 40+

**User Indexes:**
```sql
idx_users_discord_id     # Unique Discord ID lookup
idx_users_username       # Username search
idx_users_in_server      # Active member filtering
idx_users_pathways       # GIN index for pathway search
idx_users_roles          # GIN index for role search
```

**Pathway Indexes:**
```sql
idx_pathway_progress_user_id     # User lookup
idx_pathway_progress_pathway_id  # Pathway filtering
idx_pathway_progress_level       # Level sorting
idx_pathway_progress_xp          # XP leaderboard
idx_pathway_progress_total_xp    # Global leaderboard
```

**Content Indexes:**
```sql
idx_content_type         # Content type filtering
idx_content_pathway      # Pathway filtering
idx_content_status       # Status filtering
idx_content_slug         # URL lookup
idx_content_published_at # Chronological sorting
```

**Composite Indexes:**
```sql
idx_user_profiles_level_xp    # Level + XP sorting
idx_events_pathway_start      # Pathway + date filtering
idx_notifications_user_unread # Unread notifications
```

### Query Optimization Tips

**Use Indexes:**
```javascript
// Good - Uses index
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('discord_id', discordId);

// Bad - Full table scan
const { data } = await supabase
  .from('users')
  .select('*')
  .ilike('username', '%john%');
```

**Limit Results:**
```javascript
// Always use .limit() for large tables
const { data } = await supabase
  .from('pathway_progress')
  .select('*')
  .order('xp', { ascending: false })
  .limit(100);
```

**Use Views for Complex Queries:**
```javascript
// Pre-computed leaderboard view
const { data } = await supabase
  .from('user_leaderboard')
  .select('*')
  .limit(50);
```

---

## Maintenance Operations

### Daily Operations

**1. Check System Health**
```bash
node scripts/migrate.js status
```

**2. Review Sync Logs**
```javascript
const { data } = await supabase
  .from('discord_sync_log')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(10);
```

### Weekly Operations

**1. Backup Database**
```bash
node scripts/backup-db.js
```

**2. Clean Expired Notifications**
```sql
SELECT cleanup_expired_notifications();
```

**3. Sync Discord Data**
```bash
node scripts/sync-discord-roles.js
```

### Monthly Operations

**1. Review Storage Usage**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**2. Analyze Query Performance**
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 20;
```

**3. Vacuum Database**
```sql
VACUUM ANALYZE;
```

---

## Troubleshooting Common Issues

### Issue: Migration Failed

**Symptoms:**
```
❌ Failed to apply migration: syntax error at or near "CREATE"
```

**Solutions:**
1. Check SQL syntax in migration file
2. Ensure dependencies exist (tables, columns)
3. Check for duplicate object names
4. Review error message in detail

**Fix Steps:**
```bash
# 1. Review migration file
cat database/migrations/004_problematic.sql

# 2. Test SQL in Supabase SQL Editor first
# 3. Fix syntax errors
# 4. Try migration again
node scripts/migrate.js up
```

### Issue: Connection Failed

**Symptoms:**
```
❌ Connection test failed: invalid credentials
```

**Solutions:**
1. Verify `.env.local` has correct values
2. Check Supabase project is active
3. Confirm service role key is correct
4. Test connection manually

**Fix Steps:**
```bash
# 1. Check environment variables
cat .env.local | grep SUPABASE

# 2. Verify Supabase URL format
# Should be: https://[project-id].supabase.co

# 3. Get fresh keys from Supabase dashboard
# Settings → API → Service Role Key

# 4. Update .env.local and retry
node scripts/migrate.js status
```

### Issue: Migration Already Applied

**Symptoms:**
```
⚠️  Migration 001_initial_schema.sql already applied
```

**Solutions:**
- This is normal if migration ran before
- Check `node scripts/migrate.js status`
- Skip to next pending migration

### Issue: Rollback Failed

**Symptoms:**
```
❌ Failed to rollback migration: table does not exist
```

**Solutions:**
1. Check .down.sql file exists
2. Verify SQL in rollback file
3. May need manual cleanup

**Fix Steps:**
```bash
# 1. Review down migration
cat database/migrations/004_problem.down.sql

# 2. Manually execute SQL in Supabase if needed
# 3. Remove from migrations table
DELETE FROM migrations WHERE name = '004_problem.sql';

# 4. Verify status
node scripts/migrate.js status
```

---

## Advanced Usage Patterns

### Custom Migration with Data Transform

```sql
-- 005_update_user_xp.sql
BEGIN;

-- Update all user XP based on pathway progress
UPDATE user_profiles up
SET total_xp = (
  SELECT COALESCE(SUM(xp), 0)
  FROM pathway_progress pp
  WHERE pp.user_id = up.user_id
);

-- Recalculate levels
UPDATE user_profiles
SET level = calculate_level_from_xp(total_xp);

COMMIT;
```

### Migration with Conditional Logic

```sql
-- 006_add_column_if_not_exists.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
END $$;
```

### Migration with Data Validation

```sql
-- 007_validate_and_update.sql
-- Validate before updating
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM users
  WHERE email IS NOT NULL AND email NOT LIKE '%@%';
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Found % invalid emails', invalid_count;
  END IF;
  
  -- Safe to proceed
  UPDATE users SET email = LOWER(email);
END $$;
```

---

## API Integration Examples

### Creating a User

```javascript
// /src/lib/database.js
import { supabase } from './supabase';

export async function createUser(discordUser) {
  // Insert user
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      discord_id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email,
      in_server: true
    })
    .select()
    .single();
  
  if (userError) throw userError;
  
  // Create profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: user.id,
      display_name: discordUser.username
    });
  
  if (profileError) throw profileError;
  
  return user;
}
```

### Awarding Achievement

```javascript
export async function awardAchievement(userId, achievementId) {
  // Use database function
  const { data, error } = await supabase
    .rpc('award_achievement', {
      p_user_id: userId,
      p_achievement_id: achievementId
    });
  
  if (error) throw error;
  
  // Create notification
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Achievement Unlocked!',
      type: 'success',
      message: `You earned the "${achievementId}" achievement!`
    });
  
  return data;
}
```

### Fetching Leaderboard

```javascript
export async function getPathwayLeaderboard(pathwayId, limit = 100) {
  const { data, error } = await supabase
    .from('pathway_leaderboard')
    .select('*')
    .eq('pathway_id', pathwayId)
    .limit(limit);
  
  if (error) throw error;
  return data;
}
```

### Recording Analytics Event

```javascript
export async function trackEvent(userId, eventType, metadata) {
  const { error } = await supabase
    .from('analytics')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_category: metadata.category,
      event_action: metadata.action,
      event_label: metadata.label,
      pathway: metadata.pathway,
      metadata: metadata.extra
    });
  
  if (error) console.error('Analytics error:', error);
}
```

---

## Backup and Recovery

### Automated Backup

```bash
# Run backup script
node scripts/backup-db.js
```

**What Gets Backed Up:**
- All table data as JSON
- Metadata manifest
- Timestamp for versioning

**Backup Location:**
```
/database/backups/
  ├── 2025-01-28_users.json
  ├── 2025-01-28_user_profiles.json
  ├── 2025-01-28_pathway_progress.json
  ├── 2025-01-28_events.json
  └── 2025-01-28_manifest.json
```

### Manual Backup via Supabase

1. Open Supabase Dashboard
2. Navigate to Database → Backups
3. Click "Create Backup"
4. Wait for completion
5. Download if needed

### Restore from Backup

**From JSON Backup:**
```javascript
// scripts/restore-from-backup.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function restore() {
  const backupDate = '2025-01-28';
  const users = JSON.parse(
    fs.readFileSync(`database/backups/${backupDate}_users.json`)
  );
  
  const { error } = await supabase
    .from('users')
    .upsert(users, { onConflict: 'discord_id' });
  
  if (error) throw error;
  console.log('Restore complete');
}
```

**From Supabase Backup:**
1. Open Supabase Dashboard
2. Database → Backups
3. Select backup date
4. Click "Restore"
5. Confirm restoration

---

## Deployment Checklist

### Pre-Deployment

- [ ] All migrations tested locally
- [ ] Backup created
- [ ] Environment variables verified
- [ ] RLS policies reviewed
- [ ] Performance indexes in place

### Deployment Steps

```bash
# 1. Backup production
node scripts/backup-db.js

# 2. Check migration status
node scripts/migrate.js status

# 3. Apply migrations
node scripts/migrate.js up

# 4. Verify tables
node scripts/migrate.js status

# 5. Seed if needed
node scripts/seed-data.js

# 6. Sync Discord
node scripts/sync-discord-roles.js

# 7. Test API endpoints
curl https://yoursite.com/api/health
```

### Post-Deployment

- [ ] Verify all tables exist
- [ ] Test user authentication
- [ ] Check leaderboard queries
- [ ] Monitor error logs
- [ ] Validate Discord sync

---

## Support and Resources

### Quick Reference Commands

```bash
# Migration Management
node scripts/migrate.js status   # Check status
node scripts/migrate.js up       # Apply migrations
node scripts/migrate.js down     # Rollback last
node scripts/migrate.js create   # New migration

# Data Management
node scripts/seed-data.js        # Seed database
node scripts/backup-db.js        # Backup data
node scripts/sync-discord-roles.js  # Sync Discord

# Database Setup
node scripts/setup-db.js         # Initial setup
```

### File Locations

```
Configuration:    .env.local
Schema:           database/schema.sql
Migrations:       database/migrations/
Backups:          database/backups/
Scripts:          scripts/
```

### Important URLs

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Discord Developer Portal:** https://discord.com/developers/applications
- **Project Repository:** [Your GitHub URL]

---

## Conclusion

This migration system provides enterprise-grade database management for The Conclave Realm. All scripts are production-ready with comprehensive error handling, rollback support, and detailed logging.

**Key Features:**
- ✅ Zero-downtime migrations
- ✅ Automatic rollback on failure
- ✅ Complete audit trail
- ✅ RLS security policies
- ✅ Performance optimized
- ✅ Discord integration
- ✅ Backup automation

For additional support or custom migrations, consult the technical documentation or reach out to the development team.

**Version:** 2.0.0  
**Status:** Production Ready  
**Last Updated:** January 28, 2025

---

*May your migrations be swift and your data eternally secure, Noble One.* 🎖️