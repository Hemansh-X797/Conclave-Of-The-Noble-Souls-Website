// ============================================================================
// DATABASE SETUP SCRIPT
// Initialize Supabase database with schema and initial data
// Location: /scripts/setup-db.js
// Usage: node scripts/setup-db.js
// ============================================================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  discriminator TEXT,
  avatar TEXT,
  email TEXT,
  roles TEXT[] DEFAULT '{}',
  in_server BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  banner TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  message_count INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pathway Progress Table
CREATE TABLE IF NOT EXISTS pathway_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  pathway_id TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 1000,
  current_rank TEXT DEFAULT 'Initiate',
  achievements TEXT[] DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  custom_data JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, pathway_id)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  pathway TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  max_participants INTEGER,
  participants TEXT[] DEFAULT '{}',
  host TEXT,
  requirements TEXT[] DEFAULT '{}',
  rewards JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'upcoming',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',
  pathway TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Achievements Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Server Stats Table (For caching)
CREATE TABLE IF NOT EXISTS server_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  member_count INTEGER DEFAULT 0,
  online_count INTEGER DEFAULT 0,
  boost_level INTEGER DEFAULT 0,
  boost_count INTEGER DEFAULT 0,
  pathway_stats JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_pathway_progress_user_id ON pathway_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_pathway_progress_pathway_id ON pathway_progress(pathway_id);
CREATE INDEX IF NOT EXISTS idx_events_pathway ON events(pathway);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Create Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

async function runSQL(sql, description) {
  try {
    console.log(`\n📝 ${description}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try direct execution
      console.log('⚠️  RPC not available, attempting direct execution...');
      // Note: Direct SQL execution requires proper permissions
      throw error;
    }
    
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using service role key\n`);

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    console.log('✅ Connection successful\n');

    // Create schema
    console.log('📊 Creating database schema...');
    console.log('⚠️  Note: You may need to run this SQL manually in Supabase SQL Editor:');
    console.log('-----------------------------------------------------------');
    console.log(schema);
    console.log('-----------------------------------------------------------\n');
    
    console.log('✅ Database setup instructions provided');
    console.log('\n🎉 Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Copy the SQL above');
    console.log('   2. Open Supabase SQL Editor');
    console.log('   3. Paste and run the SQL');
    console.log('   4. Run: node scripts/seed-data.js');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

setupDatabase();