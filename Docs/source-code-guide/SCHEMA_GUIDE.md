idx_user_achievements_user_id         -- User lookup
idx_user_achievements_achievement_id  -- Achievement lookup
idx_user_achievements_earned_at       -- Chronological sorting
```

**Usage Examples:**
```javascript
// Award achievement
const { data, error } = await supabase
  .from('user_achievements')
  .insert({
    user_id: userId,
    achievement_id: 'gaming-initiate',
    progress: 100
  });

// Using function (recommended)
const { data, error } = await supabase
  .rpc('award_achievement', {
    p_user_id: userId,
    p_achievement_id: 'tournament-winner'
  });

// Get user's achievements
const { data: achievements } = await supabase
  .from('user_achievements')
  .select(`
    *,
    achievements (
      name,
      description,
      icon,
      rarity,
      xp
    )
  `)
  .eq('user_id', userId)
  .order('earned_at', { ascending: false });

// Get showcased achievements
const { data: showcased } = await supabase
  .from('user_achievements')
  .select('*, achievements(*)')
  .eq('user_id', userId)
  .eq('showcased', true);

// Update progress
const { error } = await supabase
  .from('user_achievements')
  .update({ progress: 75 })
  .eq('user_id', userId)
  .eq('achievement_id', 'event-veteran');
```

---

## System Tables

### Table: notifications

**Purpose:** User notification and alert system

**Schema:**
```sql
CREATE TABLE notifications (
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
```

**Notification Types:**
- `info` - General information (blue)
- `success` - Success messages (green)
- `warning` - Warnings (yellow)
- `error` - Error alerts (red)
- `gaming` - Gaming pathway (cyan)
- `lorebound` - Lorebound pathway (purple)
- `productive` - Productive pathway (emerald)
- `news` - News pathway (red)

**Metadata Structure:**
```json
{
  "source": "event_system",
  "event_id": "uuid",
  "priority": "high",
  "icon": "trophy"
}
```

**Indexes:**
```sql
idx_notifications_user_id      -- User lookup
idx_notifications_read         -- Filter read/unread
idx_notifications_created_at   -- Chronological sorting
idx_notifications_expires_at   -- Expiration cleanup
idx_notifications_type         -- Type filtering
```

**Usage Examples:**
```javascript
// Create notification
const { error } = await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    title: 'Achievement Unlocked!',
    message: 'You earned Gaming Master achievement',
    type: 'success',
    action_url: '/profile/achievements',
    metadata: {
      achievement_id: 'gaming-master',
      xp_earned: 1000
    }
  });

// Get unread notifications
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('read', false)
  .order('created_at', { ascending: false });

// Mark as read
const { error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId);

// Clean expired notifications
const { data, error } = await supabase
  .rpc('cleanup_expired_notifications');
```

---

### Table: server_stats

**Purpose:** Cached Discord server statistics (singleton table)

**Schema:**
```sql
CREATE TABLE server_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
  online_count INTEGER DEFAULT 0 CHECK (online_count >= 0),
  boost_level INTEGER DEFAULT 0 CHECK (boost_level >= 0),
  boost_count INTEGER DEFAULT 0 CHECK (boost_count >= 0),
  pathway_stats JSONB DEFAULT '{"gaming":0,"lorebound":0,"productive":0,"news":0}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (id = 1)
);
```

**Singleton Pattern:** Only one row exists (id always = 1)

**Pathway Stats Structure:**
```json
{
  "gaming": 342,
  "lorebound": 567,
  "productive": 234,
  "news": 189
}
```

**Usage Examples:**
```javascript
// Get stats
const { data: stats } = await supabase
  .from('server_stats')
  .select('*')
  .eq('id', 1)
  .single();

// Update stats
const { error } = await supabase
  .from('server_stats')
  .update({
    member_count: 1247,
    online_count: 342,
    pathway_stats: {
      gaming: 450,
      lorebound: 600,
      productive: 300,
      news: 250
    }
  })
  .eq('id', 1);

// Display stats
<div>
  <p>Members: {stats.member_count}</p>
  <p>Online: {stats.online_count}</p>
  <p>Gaming: {stats.pathway_stats.gaming}</p>
</div>
```

---

### Table: moderation_logs

**Purpose:** Staff moderation action audit trail

**Schema:**
```sql
CREATE TABLE moderation_logs (
  id SERIAL PRIMARY KEY,
  moderator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('warn', 'mute', 'kick', 'ban', 'unban', 'timeout', 'note')),
  reason TEXT,
  duration INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Action Types:**
- `warn` - Warning issued
- `mute` - Text mute
- `kick` - Kicked from server
- `ban` - Banned from server
- `unban` - Ban removed
- `timeout` - Temporary timeout
- `note` - Moderator note

**Duration:** In minutes (for temporary actions)

**Metadata Structure:**
```json
{
  "message_id": "123456789",
  "channel_id": "987654321",
  "evidence": ["screenshot_url"],
  "appeal_status": "pending"
}
```

**Indexes:**
```sql
idx_moderation_logs_moderator_id    -- Moderator lookup
idx_moderation_logs_target_user_id  -- Target lookup
idx_moderation_logs_action          -- Action filtering
idx_moderation_logs_created_at      -- Chronological sorting
```

**Usage Examples:**
```javascript
// Log moderation action
const { error } = await supabase
  .from('moderation_logs')
  .insert({
    moderator_id: modId,
    target_user_id: userId,
    action: 'warn',
    reason: 'Spam in general chat',
    metadata: {
      message_id: '123456789',
      channel_id: '987654321'
    }
  });

// Get user's history
const { data: history } = await supabase
  .from('moderation_logs')
  .select('*')
  .eq('target_user_id', userId)
  .order('created_at', { ascending: false });

// Staff action report
const { data: actions } = await supabase
  .from('moderation_logs')
  .select('*')
  .eq('moderator_id', modId)
  .gte('created_at', lastWeek)
  .order('created_at', { ascending: false });
```

---

## Analytics and Logging Tables

### Table: analytics

**Purpose:** Website analytics and user behavior tracking

**Schema:**
```sql
CREATE TABLE analytics (
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
```

**Event Types:**
- `page_view` - Page visited
- `click` - Element clicked
- `form_submit` - Form submitted
- `video_play` - Video played
- `download` - File downloaded
- `search` - Search performed
- `pathway_join` - Pathway joined
- `achievement_earned` - Achievement earned

**Indexes:**
```sql
idx_analytics_user_id      -- User lookup
idx_analytics_timestamp    -- Time-based queries
idx_analytics_event_type   -- Event filtering
idx_analytics_pathway      -- Pathway analytics
```

**Usage Examples:**
```javascript
// Track page view
const { error } = await supabase
  .from('analytics')
  .insert({
    user_id: userId,
    session_id: sessionId,
    event_type: 'page_view',
    page_path: '/pathways/gaming',
    page_title: 'Gaming Realm',
    pathway: 'gaming'
  });

// Track button click
const { error } = await supabase
  .from('analytics')
  .insert({
    user_id: userId,
    event_type: 'click',
    event_category: 'navigation',
    event_action: 'pathway_select',
    event_label: 'gaming',
    pathway: 'gaming'
  });

// Get page views
const { data: views } = await supabase
  .from('analytics')
  .select('*')
  .eq('event_type', 'page_view')
  .gte('timestamp', lastWeek)
  .order('timestamp', { ascending: false });
```

---

### Table: discord_sync_log

**Purpose:** Discord synchronization audit trail

**Schema:**
```sql
CREATE TABLE discord_sync_log (
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
```

**Sync Types:**
- `members` - Member data sync
- `roles` - Role data sync
- `stats` - Statistics sync
- `events` - Event sync

**Details Structure:**
```json
{
  "total_processed": 1247,
  "new_members": 12,
  "updated_members": 45,
  "errors": 2,
  "duration_ms": 8340
}
```

**Indexes:**
```sql
idx_discord_sync_log_sync_type   -- Type filtering
idx_discord_sync_log_status      -- Status filtering
idx_discord_sync_log_started_at  -- Chronological sorting
```

**Usage Examples:**
```javascript
// Start sync
const { data: log, error } = await supabase
  .from('discord_sync_log')
  .insert({
    sync_type: 'members',
    status: 'started'
  })
  .select()
  .single();

// Complete sync
const { error } = await supabase
  .from('discord_sync_log')
  .update({
    status: 'completed',
    members_synced: 1247,
    completed_at: new Date().toISOString(),
    details: {
      total_processed: 1247,
      new_members: 12,
      updated_members: 45
    }
  })
  .eq('id', log.id);

// Get recent syncs
const { data: syncs } = await supabase
  .from('discord_sync_log')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(10);
```

---

### Table: admin_logs

**Purpose:** Administrative action audit trail

**Schema:**
```sql
CREATE TABLE admin_logs (
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
```

**Action Examples:**
- `user_update` - User data modified
- `content_publish` - Content published
- `event_create` - Event created
- `setting_change` - Setting modified
- `achievement_add` - Achievement created

**Indexes:**
```sql
idx_admin_logs_admin_id      -- Admin lookup
idx_admin_logs_target_type   -- Target filtering
idx_admin_logs_created_at    -- Chronological sorting
```

**Usage Examples:**
```javascript
// Log admin action
const { error } = await supabase
  .from('admin_logs')
  .insert({
    admin_id: adminId,
    action: 'content_publish',
    target_type: 'content',
    target_id: contentId,
    previous_value: { status: 'draft' },
    new_value: { status: 'published' },
    reason: 'Reviewed and approved',
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

// Get admin history
const { data: logs } = await supabase
  .from('admin_logs')
  .select('*')
  .eq('admin_id', adminId)
  .order('created_at', { ascending: false })
  .limit(50);
```

---

## Relationships and Foreign Keys

### Relationship Diagram

```
users (1) ----< (N) user_profiles
users (1) ----< (N) pathway_progress
users (1) ----< (N) user_achievements
users (1) ----< (N) notifications
users (1) ----< (N) content [author]
users (1) ----< (N) events [host]
users (1) ----< (N) event_registrations
users (1) ----< (N) moderation_logs [moderator]
users (1) ----< (N) moderation_logs [target]
users (1) ----< (N) analytics
users (1) ----< (N) admin_logs

achievements (1) ----< (N) user_achievements

events (1) ----< (N) event_registrations
```

### Foreign Key Constraints

**CASCADE DELETE:**
- `user_profiles.user_id` → `users.id`
- `pathway_progress.user_id` → `users.id`
- `user_achievements.user_id` → `users.id`
- `notifications.user_id` → `users.id`
- `event_registrations` → both foreign keys
- `moderation_logs.moderator_id` → `users.id`

**SET NULL:**
- `content.reviewed_by` → `users.id`
- `moderation_logs.target_user_id` → `users.id`
- `analytics.user_id` → `users.id`
- `admin_logs.admin_id` → `users.id`

**Referential Integrity:**
```sql
-- Cannot delete user if they have dependent records
-- Cascade deletes handle cleanup automatically
DELETE FROM users WHERE id = 'user_123';
-- Also deletes: profile, pathway progress, achievements, etc.

-- Set null preserves logs when user deleted
-- Moderation logs remain for audit purposes
```

---

## Indexes and Performance

### Index Strategy

**Primary Indexes:** All primary keys automatically indexed

**Foreign Key Indexes:** Created on all foreign keys
```sql
idx_user_profiles_user_id
idx_pathway_progress_user_id
idx_event_registrations_event_id
-- etc.
```

**Query Optimization Indexes:**
```sql
-- Leaderboards
idx_user_profiles_total_xp
idx_pathway_progress_xp
idx_user_profiles_level_xp (composite)

-- Filtering
idx_users_in_server
idx_content_status
idx_events_status

-- Chronological
idx_notifications_created_at
idx_analytics_timestamp
idx_moderation_logs_created_at
```

**GIN Indexes (JSONB/Array):**
```sql
idx_users_pathways      -- JSONB array search
idx_users_roles         -- TEXT array search
```

**Partial Indexes:**
```sql
-- Only index unread notifications
CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read = false;

-- Only index active events
CREATE INDEX idx_events_pathway_start 
  ON events(pathway, start_date DESC) 
  WHERE is_active = true;
```

### Query Performance Tips

**Use Indexes:**
```sql
-- Good - uses idx_users_discord_id
SELECT * FROM users WHERE discord_id = '123';

-- Bad - full table scan
SELECT * FROM users WHERE username LIKE '%john%';
```

**Limit Results:**
```sql
-- Always use LIMIT for large result sets
SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 1000;
```

**Avoid SELECT *:**
```sql
-- Better - only select needed columns
SELECT id, username, avatar FROM users WHERE in_server = true;
```

---

## Functions and Triggers

### Trigger Functions

**Auto-Update Timestamps:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ language 'plpgsql';

-- Applied to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Utility Functions

**Calculate Level from XP:**
```sql
CREATE OR REPLACE FUNCTION calculate_level_from_xp(p_xp INTEGER)
RETURNS INTEGER AS $
BEGIN
  RETURN FLOOR(SQRT(p_xp::numeric / 100)) + 1;
END;
$ LANGUAGE plpgsql;

-- Usage
SELECT calculate_level_from_xp(2500); -- Returns: 6
```

**Get Next Level XP:**
```sql
CREATE OR REPLACE FUNCTION get_next_level_xp(p_current_level INTEGER)
RETURNS INTEGER AS $
BEGIN
  RETURN (p_current_level * p_current_level) * 100;
END;
$ LANGUAGE plpgsql;

-- Usage
SELECT get_next_level_xp(5); -- Returns: 2500
```

**Award Achievement:**
```sql
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id TEXT,
  p_achievement_id TEXT
)
RETURNS BOOLEAN AS $
DECLARE
  v_xp INTEGER;
BEGIN
  -- Get achievement XP
  SELECT xp INTO v_xp FROM achievements WHERE id = p_achievement_id;
  IF v_xp IS NULL THEN RETURN false; END IF;
  
  -- Insert achievement
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, p_achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
  
  -- Update user XP
  UPDATE user_profiles 
  SET total_xp = total_xp + v_xp 
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$ LANGUAGE plpgsql;

-- Usage
SELECT award_achievement('user_123', 'gaming-master');
```

**Clean Expired Notifications:**
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$ LANGUAGE plpgsql;

-- Usage
SELECT cleanup_expired_notifications(); -- Returns: 47
```

---

## Views and Computed Data

### View: user_leaderboard

**Purpose:** Global leaderboard with rankings

```sql
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT 
  u.id,
  u.discord_id,
  u.username,
  u.avatar,
  up.display_name,
  up.total_xp,
  up.level,
  up.message_count,
  up.events_attended,
  up.tournaments_won,
  RANK() OVER (ORDER BY up.total_xp DESC) as rank,
  DENSE_RANK() OVER (ORDER BY up.level DESC) as level_rank
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.in_server = true
ORDER BY up.total_xp DESC;
```

**Usage:**
```javascript
const { data: leaderboard } = await supabase
  .from('user_leaderboard')
  .select('*')
  .limit(100);
```

---

### View: pathway_leaderboard

**Purpose:** Per-pathway rankings

```sql
CREATE OR REPLACE VIEW pathway_leaderboard AS
SELECT 
  pp.pathway_id,
  u.id as user_id,
  u.discord_id,
  u.username,
  u.avatar,
  up.display_name,
  pp.level,
  pp.xp,
  pp.total_xp,
  pp.current_rank,
  RANK() OVER (PARTITION BY pp.pathway_id ORDER BY pp.total_xp DESC) as rank
FROM pathway_progress pp
JOIN users u ON pp.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE u.in_server = true
ORDER BY pp.pathway_id, pp.total_xp DESC;
```

**Usage:**
```javascript
const { data: gamingLeaders } = await supabase
  .from('pathway_leaderboard')
  .select('*')
  .eq('pathway_id', 'gaming')
  .limit(50);
```

---

### View: active_events

**Purpose:** Currently active/upcoming events

```sql
CREATE OR REPLACE VIEW active_events AS
SELECT 
  e.*,
  CARDINALITY(e.participants) as participant_count,
  CASE 
    WHEN e.start_date > NOW() THEN 'upcoming'
    WHEN e.end_date IS NULL OR e.end_date > NOW() THEN 'ongoing'
    ELSE 'completed'
  END as computed_status
FROM events e
WHERE e.is_active = true
ORDER BY e.start_date;
```

**Usage:**
```javascript
const { data: events } = await supabase
  .from('active_events')
  .select('*')
  .eq('computed_status', 'upcoming');
```

---

### View: user_achievement_summary

**Purpose:** Achievement statistics per user

```sql
CREATE OR REPLACE VIEW user_achievement_summary AS
SELECT 
  u.id as user_id,
  u.username,
  COUNT(ua.id) as total_achievements,
  COUNT(ua.id) FILTER (WHERE a.rarity = 'common') as common_count,
  COUNT(ua.id) FILTER (WHERE a.rarity = 'uncommon') as uncommon_count,
  COUNT(ua.id) FILTER (WHERE a.rarity = 'rare') as rare_count,
  COUNT(ua.id) FILTER (WHERE a.rarity = 'epic') as epic_count,
  COUNT(ua.id) FILTER (WHERE a.rarity = 'legendary') as legendary_count,
  COUNT(ua.id) FILTER (WHERE a.rarity = 'mythic') as mythic_count
FROM users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN achievements a ON ua.achievement_id = a.id
GROUP BY u.id, u.username;
```

**Usage:**
```javascript
const { data: summary } = await supabase
  .from('user_achievement_summary')
  .select('*')
  .eq('user_id', userId)
  .single();
```

---

## Row Level Security (RLS)

### Enabled Tables

RLS is enabled on:
- `users`
- `user_profiles`
- `pathway_progress`
- `notifications`
- `content`
- `moderation_logs`

### Policy Examples

**Users - Select Own:**
```sql
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'service_role');
```

**User Profiles - Public Read:**
```sql
CREATE POLICY user_profiles_select_all ON user_profiles
  FOR SELECT
  USING (true);
```

**Notifications - Own Only:**
```sql
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

**Moderation Logs - Staff Only:**
```sql
CREATE POLICY moderation_logs_select_staff ON moderation_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### Helper Functions

**Check if Staff:**
```sql
CREATE OR REPLACE FUNCTION is_staff(user_id TEXT)
RETURNS BOOLEAN AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Check if Has Role:**
```sql
CREATE OR REPLACE FUNCTION has_role(user_id TEXT, role_id TEXT)
RETURNS BOOLEAN AS $
DECLARE
  user_roles TEXT[];
BEGIN
  SELECT roles INTO user_roles FROM users WHERE id = user_id;
  RETURN role_id = ANY(user_roles);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Data Types and Constraints

### Common Patterns

**IDs:**
- `TEXT` for user IDs (prefix + UUID)
- `UUID` for content/events (native UUID)
- `SERIAL` for junction tables

**Timestamps:**
- `TIMESTAMP` (without timezone) for consistency
- `DEFAULT NOW()` for auto-creation
- Triggers for auto-update

**Arrays:**
- `TEXT[]` for simple lists (roles, tags)
- `JSONB` for complex structures

**JSONB:**
- Preferences, metadata, settings
- Flexible but indexed with GIN

**Check Constraints:**
```sql
CHECK (total_xp >= 0)              -- No negative values
CHECK (level >= 1)                 -- Minimum level
CHECK (rating >= 1 AND rating <= 5) -- Range validation
CHECK (pathway_id IN ('gaming', 'lorebound', 'productive', 'news')) -- Enum
```

---

## Migration Strategy

### Version Control

**Migrations Folder:**
```
/database/migrations/
├── 001_initial_schema.sql
├── 001_initial_schema.down.sql
├── 002_add_indexes.sql
├── 002_add_indexes.down.sql
├── 003_add_rls_policies.sql
└── 003_add_rls_policies.down.sql
```

**Naming Convention:**
```
[NUMBER]_[description].sql      # UP migration
[NUMBER]_[description].down.sql # DOWN migration (rollback)
```

### Migration Workflow

1. **Create Migration:**
```bash
node scripts/migrate.js create add_feature
```

2. **Edit Migration Files:**
- Add SQL to .sql file
- Add rollback SQL to .down.sql file

3. **Test Locally:**
```bash
node scripts/migrate.js up
```

4. **Verify:**
```bash
node scripts/migrate.js status
```

5. **Commit to Git:**
```bash
git add database/migrations/
git commit -m "Add migration: feature"
```

6. **Deploy:**
```bash
# Apply in production
node scripts/migrate.js up
```

---

## Query Examples

### Complex Queries

**Get User with All Data:**
```javascript
const { data: user } = await supabase
  .from('users')
  .select(`
    *,
    user_profiles (*),
    pathway_progress (*),
    user_achievements (
      *,
      achievements (*)
    )
  `)
  .eq('id', userId)
  .single();
```

**Pathway Leaderboard with User Info:**
```javascript
const { data: leaderboard } = await supabase
  .from('pathway_progress')
  .select(`
    *,
    users (
      username,
      avatar,
      discord_id
    ),
    user_profiles (
      display_name
    )
  `)
  .eq('pathway_id', 'gaming')
  .order('total_xp', { ascending: false })
  .limit(100);
```

**Event with Registrations:**
```javascript
const { data: event } = await supabase
  .from('events')
  .select(`
    *,
    event_registrations (
      *,
      users (
        username,
        avatar
      )
    )
  `)
  .eq('id', eventId)
  .single();
```

**Content with Author:**
```javascript
const { data: articles } = await supabase
  .from('content')
  .select(`
    *,
    users!author_id (
      username,
      avatar
    )
  `)
  .eq('type', 'article')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(20);
```

---

## Conclusion

This schema provides a robust foundation for The Conclave Realm, combining user management, pathways, content, events, achievements, and analytics into a cohesive system.

### Key Features

✅ **Normalized Design** - Minimal redundancy  
✅ **JSONB Flexibility** - Adaptable to change  
✅ **Comprehensive Indexing** - Optimized performance  
✅ **Row Level Security** - Built-in protection  
✅ **Audit Trails** - Complete logging  
✅ **Discord Integration** - Seamless sync  

### Schema Statistics

- **Total Tables:** 15
- **Total Indexes:** 40+
- **Total Functions:** 5+
- **Total Views:** 4
- **Total Triggers:** 6
- **Foreign Keys:** 20+

### Performance Characteristics

**Expected Load:**
- 10,000+ users
- 1M+ analytics events/month
- 100+ concurrent connections
- Sub-100ms query response times

**Optimization Features:**
- Composite indexes for complex queries
- Partial indexes for filtered data
- GIN indexes for JSONB/array searches
- Materialized views for heavy computations (if needed)

### Maintenance Schedule

**Daily:**
- Clean expired notifications
- Sync Discord data

**Weekly:**
- Database backup
- Index analysis
- Query performance review

**Monthly:**
- VACUUM ANALYZE
- Storage usage review
- Audit log cleanup

---

## Advanced Patterns

### Soft Deletes

Instead of deleting records, mark as inactive:

```sql
-- Add to table
ALTER TABLE content ADD COLUMN deleted_at TIMESTAMP;

-- "Delete" record
UPDATE content SET deleted_at = NOW() WHERE id = 'content_123';

-- Query active records
SELECT * FROM content WHERE deleted_at IS NULL;

-- Create index
CREATE INDEX idx_content_active ON content(id) WHERE deleted_at IS NULL;
```

### Versioning

Track content versions:

```sql
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  changed_by TEXT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  change_reason TEXT
);

-- Get version history
SELECT * FROM content_versions 
WHERE content_id = 'content_123' 
ORDER BY version DESC;
```

### Full-Text Search

Add text search capability:

```sql
-- Add tsvector column
ALTER TABLE content ADD COLUMN search_vector tsvector;

-- Create trigger to update search vector
CREATE TRIGGER content_search_update 
BEFORE INSERT OR UPDATE ON content
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, body);

-- Create GIN index
CREATE INDEX idx_content_search ON content USING GIN(search_vector);

-- Search query
SELECT * FROM content 
WHERE search_vector @@ plainto_tsquery('gaming tips')
ORDER BY ts_rank(search_vector, plainto_tsquery('gaming tips')) DESC;
```

### Time-Series Data

Partition analytics by month:

```sql
-- Create parent table
CREATE TABLE analytics_partitioned (
  id UUID DEFAULT uuid_generate_v4(),
  user_id TEXT,
  event_type TEXT,
  timestamp TIMESTAMP NOT NULL,
  -- other columns...
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE analytics_2025_01 PARTITION OF analytics_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE analytics_2025_02 PARTITION OF analytics_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

### Caching Strategy

Use materialized views for expensive queries:

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW pathway_stats_cache AS
SELECT 
  pathway_id,
  COUNT(DISTINCT user_id) as total_members,
  AVG(level) as avg_level,
  SUM(total_xp) as total_xp,
  MAX(updated_at) as last_updated
FROM pathway_progress
GROUP BY pathway_id;

-- Create index
CREATE INDEX idx_pathway_stats_cache ON pathway_stats_cache(pathway_id);

-- Refresh periodically (cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY pathway_stats_cache;

-- Query from cache
SELECT * FROM pathway_stats_cache WHERE pathway_id = 'gaming';
```

---

## Data Migration Patterns

### Backfilling Data

When adding new columns with computed values:

```sql
-- Add new column
ALTER TABLE user_profiles ADD COLUMN activity_score INTEGER DEFAULT 0;

-- Backfill existing records
UPDATE user_profiles
SET activity_score = (
  message_count * 1 + 
  voice_minutes * 2 + 
  events_attended * 10 + 
  tournaments_won * 50
);

-- Add constraint after backfill
ALTER TABLE user_profiles 
ADD CONSTRAINT check_activity_score CHECK (activity_score >= 0);
```

### Data Transformation

Transform existing data structure:

```sql
-- Before: roles as comma-separated string
-- After: roles as TEXT array

-- Add new column
ALTER TABLE users ADD COLUMN roles_array TEXT[];

-- Transform data
UPDATE users 
SET roles_array = string_to_array(roles, ',')
WHERE roles IS NOT NULL;

-- Verify transformation
SELECT id, roles, roles_array FROM users LIMIT 10;

-- Drop old column (after verification)
ALTER TABLE users DROP COLUMN roles;

-- Rename new column
ALTER TABLE users RENAME COLUMN roles_array TO roles;
```

### Merging Duplicates

Consolidate duplicate records:

```sql
-- Find duplicates
SELECT discord_id, COUNT(*) 
FROM users 
GROUP BY discord_id 
HAVING COUNT(*) > 1;

-- Merge user data (keep oldest)
WITH duplicates AS (
  SELECT id, discord_id, 
    ROW_NUMBER() OVER (PARTITION BY discord_id ORDER BY created_at) as rn
  FROM users
)
UPDATE user_profiles
SET user_id = (
  SELECT id FROM duplicates 
  WHERE discord_id = users.discord_id AND rn = 1
)
WHERE user_id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Delete duplicate users
DELETE FROM users
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY discord_id ORDER BY created_at) as rn
    FROM users
  ) t WHERE rn > 1
);
```

---

## Security Best Practices

### SQL Injection Prevention

Always use parameterized queries:

```javascript
// ❌ BAD - Vulnerable to SQL injection
const { data } = await supabase
  .rpc('raw_query', { 
    query: `SELECT * FROM users WHERE username = '${userInput}'` 
  });

// ✅ GOOD - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('username', userInput);
```

### Sensitive Data

Encrypt sensitive columns:

```sql
-- Use pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt data
INSERT INTO users (email_encrypted) 
VALUES (pgp_sym_encrypt('user@example.com', 'encryption_key'));

-- Decrypt data
SELECT pgp_sym_decrypt(email_encrypted::bytea, 'encryption_key') 
FROM users;
```

### Audit Logging

Track all sensitive operations:

```sql
CREATE TABLE security_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Log security events
INSERT INTO security_audit (user_id, action, table_name, record_id, success)
VALUES ('user_123', 'UPDATE', 'users', 'user_456', true);
```

### Rate Limiting

Track API usage per user:

```sql
CREATE TABLE rate_limits (
  user_id TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT NOW(),
  last_request TIMESTAMP DEFAULT NOW()
);

-- Check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP;
BEGIN
  SELECT request_count, window_start INTO v_count, v_window_start
  FROM rate_limits WHERE user_id = p_user_id;
  
  -- Reset window if expired
  IF v_window_start IS NULL OR 
     v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    INSERT INTO rate_limits (user_id, request_count, window_start)
    VALUES (p_user_id, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET request_count = 1, window_start = NOW(), last_request = NOW();
    RETURN true;
  END IF;
  
  -- Check limit
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE rate_limits 
  SET request_count = request_count + 1, last_request = NOW()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$ LANGUAGE plpgsql;
```

---

## Performance Monitoring

### Query Analysis

Identify slow queries:

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT 
  mean_exec_time,
  calls,
  total_exec_time,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find most frequent queries
SELECT 
  calls,
  mean_exec_time,
  query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

### Index Usage

Check index effectiveness:

```sql
-- Find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find missing indexes (table scans)
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_tuples_per_scan
FROM pg_stat_user_tables
WHERE seq_scan > 0
  AND schemaname = 'public'
ORDER BY seq_tup_read DESC;
```

### Table Statistics

Monitor table growth:

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

---

## Backup and Recovery

### Backup Strategy

**Full Backups:**
```bash
# Using pg_dump (if you have PostgreSQL access)
pg_dump -h localhost -U postgres -d conclave_db > backup.sql

# Using Supabase backup script
node scripts/backup-db.js
```

**Point-in-Time Recovery:**
Supabase Pro plan includes automatic PITR backups.

**Backup Schedule:**
- Daily: Automated JSON backups
- Weekly: Full database dumps
- Monthly: Long-term archival

### Restore Procedures

**From JSON Backup:**
```javascript
// scripts/restore-backup.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function restore(backupDate) {
  const supabase = createClient(url, serviceKey);
  
  // Read backup files
  const users = JSON.parse(
    fs.readFileSync(`database/backups/${backupDate}_users.json`)
  );
  
  // Restore with upsert
  const { error } = await supabase
    .from('users')
    .upsert(users, { onConflict: 'discord_id' });
  
  if (error) throw error;
  console.log(`Restored ${users.length} users`);
}
```

**From SQL Dump:**
```bash
# Restore full database
psql -h localhost -U postgres -d conclave_db < backup.sql

# Restore specific table
psql -h localhost -U postgres -d conclave_db -c "COPY users FROM '/path/to/backup.csv' CSV HEADER"
```

---

## Schema Evolution

### Adding Columns

Safe column addition:

```sql
-- Add nullable column (safe)
ALTER TABLE users ADD COLUMN bio TEXT;

-- Add with default (safe)
ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false;

-- Add NOT NULL (requires backfill first)
ALTER TABLE users ADD COLUMN email TEXT;
UPDATE users SET email = 'unknown@example.com' WHERE email IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### Renaming Columns

Backwards-compatible rename:

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Copy data
UPDATE users SET display_name = username;

-- Step 3: Update application to use new column

-- Step 4: Drop old column (after deployment)
ALTER TABLE users DROP COLUMN username;
```

### Changing Column Types

Safe type changes:

```sql
-- Expanding types (safe)
ALTER TABLE users ALTER COLUMN bio TYPE TEXT; -- from VARCHAR(500)

-- Narrowing types (requires validation)
-- Check existing data first
SELECT MAX(LENGTH(bio)) FROM users;

-- Then alter if safe
ALTER TABLE users ALTER COLUMN bio TYPE VARCHAR(1000);

-- Complex transformations
ALTER TABLE users ADD COLUMN roles_new TEXT[];
UPDATE users SET roles_new = string_to_array(roles_old, ',');
ALTER TABLE users DROP COLUMN roles_old;
ALTER TABLE users RENAME COLUMN roles_new TO roles;
```

---

## Troubleshooting

### Common Issues

**Constraint Violations:**
```sql
-- Find violating records before adding constraint
SELECT * FROM user_profiles WHERE total_xp < 0;

-- Fix data
UPDATE user_profiles SET total_xp = 0 WHERE total_xp < 0;

-- Add constraint
ALTER TABLE user_profiles ADD CONSTRAINT check_xp CHECK (total_xp >= 0);
```

**Foreign Key Issues:**
```sql
-- Find orphaned records
SELECT * FROM pathway_progress 
WHERE user_id NOT IN (SELECT id FROM users);

-- Delete orphans
DELETE FROM pathway_progress 
WHERE user_id NOT IN (SELECT id FROM users);
```

**Index Bloat:**
```sql
-- Check index bloat
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild bloated index
REINDEX INDEX CONCURRENTLY idx_users_discord_id;
```

**Lock Contention:**
```sql
-- View active locks
SELECT 
  pid,
  usename,
  pg_blocking_pids(pid) as blocked_by,
  query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;

-- Kill blocking query (use carefully!)
SELECT pg_terminate_backend(pid);
```

---

## Testing Strategies

### Data Validation

Test data integrity:

```javascript
// Test user creation
describe('User Creation', () => {
  it('should create user with profile', async () => {
    const { data: user } = await supabase
      .from('users')
      .insert({ discord_id: '123', username: 'test' })
      .select()
      .single();
    
    expect(user.id).toBeDefined();
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select()
      .eq('user_id', user.id)
      .single();
    
    expect(profile).toBeDefined();
  });
});
```

### Constraint Testing

Verify constraints work:

```javascript
it('should enforce XP constraint', async () => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ total_xp: -100 })
    .eq('user_id', userId);
  
  expect(error).toBeDefined();
  expect(error.message).toContain('check_xp');
});
```

### Performance Testing

Test query performance:

```javascript
it('should query leaderboard efficiently', async () => {
  const start = Date.now();
  
  const { data } = await supabase
    .from('user_leaderboard')
    .select('*')
    .limit(100);
  
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(100); // < 100ms
  expect(data.length).toBe(100);
});
```

---

## Documentation Standards

### Table Documentation

Always document tables:

```sql
COMMENT ON TABLE users IS 'Discord user data and server membership';
COMMENT ON COLUMN users.discord_id IS 'Discord user ID (snowflake)';
COMMENT ON COLUMN users.roles IS 'Array of Discord role IDs';
```

### Function Documentation

Document all functions:

```sql
/**
 * Award achievement to user and update XP
 * @param p_user_id User identifier
 * @param p_achievement_id Achievement identifier
 * @returns Boolean success status
 */
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id TEXT,
  p_achievement_id TEXT
)
RETURNS BOOLEAN AS $
-- Implementation
$ LANGUAGE plpgsql;
```

### Change Log

Maintain schema changelog:

```markdown
## [2.0.0] - 2025-01-28
### Added
- Merged user and member tables
- Added pathway progress tracking
- Implemented achievement system
- Created analytics tables

### Changed
- Updated user_profiles with activity metrics
- Enhanced events with registration system

### Removed
- Deprecated old member_stats table
```

---

## Conclusion

This comprehensive schema documentation provides everything needed to understand, maintain, and extend The Conclave Realm's database system.

### Key Takeaways

✅ **15 tables** covering all core functionality  
✅ **40+ indexes** for optimal performance  
✅ **RLS policies** for security  
✅ **Helper functions** for common operations  
✅ **Views** for complex queries  
✅ **Migration system** for safe evolution  

### Next Steps

1. **Apply Schema:** Use migration scripts to create database
2. **Seed Data:** Populate with initial data
3. **Test Queries:** Verify performance
4. **Monitor:** Set up ongoing monitoring
5. **Maintain:** Follow backup and maintenance schedules

### Support Resources

- **Schema Location:** `/database/schema.sql`
- **Migrations:** `/database/migrations/`
- **Scripts:** `/scripts/`
- **Documentation:** `/docs/`

For questions or custom schema modifications, consult the development team.

**Version:** 2.0.0  
**Status:** Production Ready  
**Last Updated:** January 28, 2025

---

*May your queries be swift and your data forever consistent, Noble One.* 🎖️# The Conclave Realm - Database Schema Guide

## Overview

Complete documentation for The Conclave Realm's compound database schema, combining user management, pathways, content, events, analytics, and Discord integration into a unified production-ready system.

**Version:** 2.0.0  
**Last Updated:** January 28, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Tables - User System](#core-tables---user-system)
3. [Pathway System Tables](#pathway-system-tables)
4. [Content Management Tables](#content-management-tables)
5. [Event System Tables](#event-system-tables)
6. [Achievement System Tables](#achievement-system-tables)
7. [System Tables](#system-tables)
8. [Analytics and Logging Tables](#analytics-and-logging-tables)
9. [Relationships and Foreign Keys](#relationships-and-foreign-keys)
10. [Indexes and Performance](#indexes-and-performance)
11. [Functions and Triggers](#functions-and-triggers)
12. [Views and Computed Data](#views-and-computed-data)
13. [Row Level Security (RLS)](#row-level-security-rls)
14. [Data Types and Constraints](#data-types-and-constraints)
15. [Migration Strategy](#migration-strategy)
16. [Query Examples](#query-examples)

---

## Architecture Overview

### Database Structure

**Total Tables:** 15  
**Extensions:** uuid-ossp, pgcrypto  
**DBMS:** PostgreSQL (via Supabase)

### Table Categories

```
Core User System (2 tables)
├── users
└── user_profiles

Pathway System (1 table)
└── pathway_progress

Content System (1 table)
└── content

Event System (2 tables)
├── events
└── event_registrations

Achievement System (2 tables)
├── achievements
└── user_achievements

System Tables (7 tables)
├── notifications
├── server_stats
├── moderation_logs
├── analytics
├── discord_sync_log
├── admin_logs
└── migrations
```

### Schema Design Principles

**Normalization:** 3NF (Third Normal Form) for data integrity  
**Denormalization:** Strategic use of JSONB for flexibility  
**Indexing:** Comprehensive indexes for performance  
**Security:** Row Level Security on sensitive tables  
**Scalability:** Designed to handle 10,000+ users

---

## Core Tables - User System

### Table: users

**Purpose:** Main user/member records synced with Discord

**Schema:**
```sql
CREATE TABLE users (
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
```

**Column Details:**

| Column | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| id | TEXT | Primary key | Yes | Auto-generated |
| discord_id | TEXT | Discord user ID (snowflake) | Yes | - |
| username | TEXT | Discord username | Yes | - |
| discriminator | TEXT | Discord discriminator | No | '0' |
| global_name | TEXT | Discord display name | No | - |
| avatar | TEXT | Avatar hash | No | - |
| avatar_url | TEXT | Full avatar URL | No | - |
| banner | TEXT | Banner hash | No | - |
| banner_url | TEXT | Full banner URL | No | - |
| email | TEXT | User email | No | - |
| nickname | TEXT | Server nickname | No | - |
| roles | TEXT[] | Array of role IDs | No | [] |
| permissions | JSONB | Permission object | No | {} |
| in_server | BOOLEAN | Currently in Discord | No | false |
| server_booster | BOOLEAN | Nitro booster status | No | false |
| boost_since | TIMESTAMP | Boost start date | No | - |
| joined_at | TIMESTAMP | Server join date | No | NOW() |
| pathways | JSONB | Array of pathway IDs | No | [] |
| primary_pathway | TEXT | Main pathway choice | No | - |
| pathway_join_dates | JSONB | Join dates per pathway | No | {} |
| is_verified | BOOLEAN | Email verified | No | false |
| is_banned | BOOLEAN | Banned status | No | false |
| ban_reason | TEXT | Ban reason | No | - |
| created_at | TIMESTAMP | Record creation | No | NOW() |
| updated_at | TIMESTAMP | Last update | No | NOW() |
| last_seen | TIMESTAMP | Last activity | No | NOW() |

**Indexes:**
```sql
idx_users_discord_id     -- Unique lookup by Discord ID
idx_users_username       -- Search by username
idx_users_in_server      -- Filter active members
idx_users_pathways       -- GIN index for pathway search
idx_users_roles          -- GIN index for role filtering
```

**Usage Examples:**
```javascript
// Find user by Discord ID
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('discord_id', '123456789012345678')
  .single();

// Get all active members
const { data: activeUsers } = await supabase
  .from('users')
  .select('*')
  .eq('in_server', true);

// Find users in gaming pathway
const { data: gamers } = await supabase
  .from('users')
  .select('*')
  .contains('pathways', ['gaming']);
```

---

### Table: user_profiles

**Purpose:** Extended user information, stats, and preferences

**Schema:**
```sql
CREATE TABLE user_profiles (
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
  preferences JSONB DEFAULT '{
    "particlesEnabled": true,
    "soundsEnabled": true,
    "animationsEnabled": true,
    "theme": "default",
    "notifications": true,
    "public_profile": true,
    "show_activity": true,
    "allow_dms": true
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Column Details:**

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| user_id | TEXT | Foreign key to users | PRIMARY KEY, CASCADE DELETE |
| display_name | TEXT | Public display name | - |
| bio | TEXT | User biography | Max recommended: 500 chars |
| banner | TEXT | Profile banner URL | - |
| total_xp | INTEGER | Lifetime XP across all pathways | >= 0 |
| level | INTEGER | Overall user level | >= 1 |
| message_count | INTEGER | Total messages sent | >= 0 |
| voice_minutes | INTEGER | Voice chat time | >= 0 |
| activity_score | INTEGER | Activity metric | >= 0 |
| events_attended | INTEGER | Events participated in | >= 0 |
| tournaments_won | INTEGER | Tournament victories | >= 0 |
| achievements | JSONB | Achievement ID array | JSON array |
| badges | JSONB | Badge collection | JSON array |
| last_active | TIMESTAMP | Last activity timestamp | - |
| preferences | JSONB | User settings | JSON object |

**Preferences Structure:**
```json
{
  "particlesEnabled": true,
  "soundsEnabled": true,
  "animationsEnabled": true,
  "theme": "default",
  "notifications": true,
  "public_profile": true,
  "show_activity": true,
  "allow_dms": true
}
```

**Indexes:**
```sql
idx_user_profiles_level          -- Leaderboard by level
idx_user_profiles_total_xp       -- Leaderboard by XP
idx_user_profiles_last_active    -- Activity sorting
idx_user_profiles_activity_score -- Activity ranking
idx_user_profiles_level_xp       -- Composite leaderboard
```

**Usage Examples:**
```javascript
// Get user profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

// Update preferences
const { error } = await supabase
  .from('user_profiles')
  .update({
    preferences: {
      ...currentPrefs,
      theme: 'dark'
    }
  })
  .eq('user_id', userId);

// Get top 100 by XP
const { data: leaderboard } = await supabase
  .from('user_profiles')
  .select('user_id, display_name, total_xp, level')
  .order('total_xp', { ascending: false })
  .limit(100);
```

---

## Pathway System Tables

### Table: pathway_progress

**Purpose:** Track user progress in each of the four pathway realms

**Schema:**
```sql
CREATE TABLE pathway_progress (
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
```

**Pathway IDs:**
- `gaming` - Gaming Realm (tournaments, game nights)
- `lorebound` - Lorebound Realm (anime, manga, novels)
- `productive` - Productive Palace (productivity, AI tools)
- `news` - News Nexus (current events, tech news)

**Rank Progression:**
```
Initiate → Apprentice → Journeyman → Expert → Master → Grand Master
```

**XP Calculation:**
```javascript
// Level formula: level = floor(sqrt(total_xp / 100)) + 1
function calculateLevel(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

// Next level XP: (level * level) * 100
function getNextLevelXP(currentLevel) {
  return (currentLevel * currentLevel) * 100;
}

// Examples:
// Level 1: 0 XP → 100 XP (100 XP needed)
// Level 2: 100 XP → 400 XP (300 XP needed)
// Level 3: 400 XP → 900 XP (500 XP needed)
```

**Column Details:**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-incrementing primary key |
| user_id | TEXT | Foreign key to users |
| pathway_id | TEXT | gaming/lorebound/productive/news |
| level | INTEGER | Current level in pathway |
| xp | INTEGER | XP towards next level |
| total_xp | INTEGER | Lifetime XP in pathway |
| next_level_xp | INTEGER | XP required for next level |
| current_rank | TEXT | Rank title |
| tasks_completed | INTEGER | Completed tasks counter |
| events_attended | INTEGER | Pathway events attended |
| contributions | INTEGER | Contributions to pathway |
| streak_days | INTEGER | Daily activity streak |
| achievements | TEXT[] | Pathway-specific achievements |
| unlocked_content | JSONB | Unlocked features/content |
| completed_challenges | JSONB | Challenge completions |
| earned_titles | JSONB | Earned titles |
| pathway_data | JSONB | Pathway-specific metrics |
| custom_data | JSONB | Custom extension data |

**Indexes:**
```sql
idx_pathway_progress_user_id      -- User lookup
idx_pathway_progress_pathway_id   -- Pathway filtering
idx_pathway_progress_level        -- Level leaderboard per pathway
idx_pathway_progress_xp           -- XP leaderboard per pathway
idx_pathway_progress_total_xp     -- Global XP leaderboard
idx_pathway_progress_last_active  -- Activity tracking
```

**Usage Examples:**
```javascript
// Get user's progress in gaming pathway
const { data: progress } = await supabase
  .from('pathway_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('pathway_id', 'gaming')
  .single();

// Award XP
const { data, error } = await supabase
  .rpc('award_xp', {
    p_user_id: userId,
    p_pathway_id: 'gaming',
    p_xp_amount: 100
  });

// Get pathway leaderboard
const { data: leaderboard } = await supabase
  .from('pathway_progress')
  .select('user_id, level, total_xp, current_rank')
  .eq('pathway_id', 'lorebound')
  .order('total_xp', { ascending: false })
  .limit(50);

// Join pathway
const { error } = await supabase
  .from('pathway_progress')
  .insert({
    user_id: userId,
    pathway_id: 'productive'
  });
```

---

## Content Management Tables

### Table: content

**Purpose:** Unified CMS for articles, guides, news, and resources

**Schema:**
```sql
CREATE TABLE content (
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
```

**Content Types:**
- `article` - Blog posts, opinion pieces
- `guide` - How-to tutorials, documentation
- `review` - Game/anime/tool reviews
- `news` - News articles, updates
- `resource` - Links, tools, references
- `announcement` - Important announcements

**Status Workflow:**
```
draft → pending → review → approved → published
                    ↓
                 rejected
```

**Visibility Levels:**
- `public` - Everyone can view
- `members` - Discord members only
- `pathway` - Specific pathway members
- `roles` - Specific role holders

**Column Details:**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Auto-generated UUID |
| type | TEXT | Content type |
| pathway | TEXT | Associated pathway (optional) |
| title | TEXT | Content title |
| slug | TEXT | URL-friendly identifier (unique) |
| excerpt | TEXT | Short summary |
| body | TEXT | Main content (Markdown/HTML) |
| content | TEXT | Alternative content field |
| featured_image | TEXT | Main image URL |
| images | JSONB | Additional images array |
| tags | TEXT[] | Tag array for categorization |
| author_id | TEXT | Author user ID |
| author_name | TEXT | Author display name |
| author_role | TEXT | Author role/title |
| reviewed_by | TEXT | Reviewer user ID |
| review_notes | TEXT | Review feedback |
| status | TEXT | Publication status |
| visibility | TEXT | Access level |
| required_roles | JSONB | Required role IDs |
| featured | BOOLEAN | Homepage featured |
| pinned | BOOLEAN | Pinned to top |
| view_count | INTEGER | View counter |
| like_count | INTEGER | Like counter |
| comment_count | INTEGER | Comment counter |
| share_count | INTEGER | Share counter |
| meta_title | TEXT | SEO title |
| meta_description | TEXT | SEO description |
| meta_keywords | TEXT[] | SEO keywords |
| metadata | JSONB | Custom metadata |
| published_at | TIMESTAMP | Publication date |
| scheduled_for | TIMESTAMP | Scheduled publish time |
| expires_at | TIMESTAMP | Expiration date |

**Indexes:**
```sql
idx_content_type          -- Filter by content type
idx_content_pathway       -- Filter by pathway
idx_content_status        -- Filter by status
idx_content_slug          -- URL lookup
idx_content_author_id     -- Author's content
idx_content_published_at  -- Chronological sorting
```

**Usage Examples:**
```javascript
// Create article
const { data: article, error } = await supabase
  .from('content')
  .insert({
    type: 'article',
    pathway: 'gaming',
    title: 'Top 10 Gaming Tips',
    slug: 'top-10-gaming-tips',
    excerpt: 'Master these essential gaming techniques',
    body: markdownContent,
    author_id: userId,
    tags: ['gaming', 'tips', 'strategy'],
    status: 'draft'
  })
  .select()
  .single();

// Publish content
const { error } = await supabase
  .from('content')
  .update({
    status: 'published',
    published_at: new Date().toISOString()
  })
  .eq('id', contentId);

// Get published articles for pathway
const { data: articles } = await supabase
  .from('content')
  .select('*')
  .eq('type', 'article')
  .eq('pathway', 'lorebound')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(20);

// Increment view count
const { error } = await supabase
  .rpc('increment_view_count', { content_id: contentId });
```

---

## Event System Tables

### Table: events

**Purpose:** Manage community events, tournaments, and activities

**Schema:**
```sql
CREATE TABLE events (
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
```

**Event Types:**
- Tournament
- Game Night
- Watch Party
- Workshop
- Meetup
- Stream
- Contest

**Recurrence Pattern Structure:**
```json
{
  "frequency": "weekly",
  "interval": 1,
  "days": ["monday", "wednesday", "friday"],
  "end_date": "2025-12-31"
}
```

**Rewards Structure:**
```json
{
  "xp": 100,
  "badges": ["tournament-participant"],
  "roles": ["event-veteran"],
  "custom": {
    "prize": "Discord Nitro"
  }
}
```

**Indexes:**
```sql
idx_events_pathway      -- Filter by pathway
idx_events_start_date   -- Chronological sorting
idx_events_status       -- Filter by status
idx_events_active       -- Filter active events
idx_events_type         -- Filter by event type
idx_events_host_id      -- Host's events
```

**Usage Examples:**
```javascript
// Create event
const { data: event, error } = await supabase
  .from('events')
  .insert({
    title: 'Weekly Gaming Tournament',
    description: 'Compete for glory!',
    type: 'tournament',
    pathway: 'gaming',
    start_date: '2025-02-01T18:00:00Z',
    end_date: '2025-02-01T21:00:00Z',
    max_participants: 32,
    registration_required: true,
    host_id: userId,
    rewards: {
      xp: 500,
      badges: ['tournament-winner']
    }
  })
  .select()
  .single();

// Get upcoming events
const { data: events } = await supabase
  .from('events')
  .select('*')
  .eq('status', 'upcoming')
  .gte('start_date', new Date().toISOString())
  .order('start_date')
  .limit(10);

// Register for event
const { error } = await supabase
  .from('event_registrations')
  .insert({
    event_id: eventId,
    user_id: userId,
    status: 'registered'
  });
```

---

### Table: event_registrations

**Purpose:** Track event attendance and feedback

**Schema:**
```sql
CREATE TABLE event_registrations (
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
```

**Status Values:**
- `registered` - Signed up
- `attended` - Participated
- `no-show` - Registered but didn't attend
- `cancelled` - Cancelled registration

**Feedback Structure:**
```json
{
  "enjoyed": true,
  "difficulty": "medium",
  "comments": "Great event!",
  "suggestions": "More time needed"
}
```

**Indexes:**
```sql
idx_event_registrations_event_id  -- Event lookup
idx_event_registrations_user_id   -- User lookup
idx_event_registrations_status    -- Status filtering
```

**Usage Examples:**
```javascript
// Register user
const { error } = await supabase
  .from('event_registrations')
  .insert({
    event_id: eventId,
    user_id: userId
  });

// Mark attended
const { error } = await supabase
  .from('event_registrations')
  .update({
    status: 'attended',
    attended_at: new Date().toISOString()
  })
  .eq('event_id', eventId)
  .eq('user_id', userId);

// Submit feedback
const { error } = await supabase
  .from('event_registrations')
  .update({
    rating: 5,
    feedback: {
      enjoyed: true,
      comments: 'Amazing event!'
    }
  })
  .eq('event_id', eventId)
  .eq('user_id', userId);

// Get event participants
const { data: participants } = await supabase
  .from('event_registrations')
  .select('user_id, status, registered_at')
  .eq('event_id', eventId);
```

---

## Achievement System Tables

### Table: achievements

**Purpose:** Define all available achievements and badges

**Schema:**
```sql
CREATE TABLE achievements (
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
```

**Categories:**
- `milestone` - Level/XP milestones
- `special` - Unique achievements
- `seasonal` - Time-limited
- `pathway` - Pathway-specific
- `community` - Community events

**Rarity Tiers:**
```
Common (70%) → Uncommon (20%) → Rare (7%) → Epic (2%) → Legendary (0.9%) → Mythic (0.1%)
```

**Requirements Structure:**
```json
{
  "type": "xp",
  "amount": 1000,
  "pathway": "gaming",
  "conditions": {
    "level": 10,
    "events_attended": 5
  }
}
```

**Achievement IDs:**
```
gaming-initiate
first-week
tournament-winner
lorebound-master
productive-streak-30
news-contributor
grand-duke
```

**Indexes:**
```sql
idx_achievements_pathway   -- Pathway filtering
idx_achievements_rarity    -- Rarity filtering
idx_achievements_category  -- Category filtering
idx_achievements_active    -- Active achievements
```

**Usage Examples:**
```javascript
// Create achievement
const { data, error } = await supabase
  .from('achievements')
  .insert({
    id: 'gaming-master',
    name: 'Gaming Master',
    description: 'Reach level 50 in Gaming pathway',
    pathway: 'gaming',
    category: 'milestone',
    rarity: 'epic',
    xp: 1000,
    requirements: {
      type: 'level',
      pathway: 'gaming',
      amount: 50
    }
  });

// Get pathway achievements
const { data: achievements } = await supabase
  .from('achievements')
  .select('*')
  .eq('pathway', 'lorebound')
  .eq('is_active', true);

// Get rare+ achievements
const { data: rareAchievements } = await supabase
  .from('achievements')
  .select('*')
  .in('rarity', ['rare', 'epic', 'legendary', 'mythic']);
```

---

### Table: user_achievements

**Purpose:** Track which users earned which achievements

**Schema:**
```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 100 CHECK (progress >= 0 AND progress <= 100),
  showcased BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);
```

**Progress Tracking:**
```
0% = Not started
25% = Quarter complete
50% = Half complete
75% = Almost there
100% = Earned
```

**Indexes:**
```sql
idx_user_achievements_user_id         -- User lookup
idx_user_achievements_achievement