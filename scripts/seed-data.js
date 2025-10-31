// ============================================================================
// DATABASE SEED SCRIPT
// Populate database with sample/initial data
// Location: /scripts/seed-data.js
// Usage: node scripts/seed-data.js
// ============================================================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { getAllAchievements } = require('../src/data/lore');
const { PATHWAYS } = require('../src/data/pathways');

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// SEED DATA
// ============================================================================

async function seedAchievements() {
  console.log('\n📊 Seeding achievements...');
  
  const achievements = getAllAchievements();
  const achievementData = achievements.map(achievement => ({
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    xp: achievement.xp,
    rarity: achievement.rarity,
    pathway: achievement.pathway || null,
    requirements: {}
  }));

  const { data, error } = await supabase
    .from('achievements')
    .upsert(achievementData, { onConflict: 'id' });

  if (error) {
    console.error('❌ Failed to seed achievements:', error.message);
    return false;
  }

  console.log(`✅ Seeded ${achievementData.length} achievements`);
  return true;
}

async function seedServerStats() {
  console.log('\n📊 Initializing server stats...');

  const stats = {
    id: 1,
    member_count: 0,
    online_count: 0,
    boost_level: 0,
    boost_count: 0,
    pathway_stats: {
      gaming: 0,
      lorebound: 0,
      productive: 0,
      news: 0
    },
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('server_stats')
    .upsert(stats, { onConflict: 'id' });

  if (error) {
    console.error('❌ Failed to initialize server stats:', error.message);
    return false;
  }

  console.log('✅ Server stats initialized');
  return true;
}

async function seedSampleUser() {
  console.log('\n👤 Creating sample user...');

  const sampleUser = {
    id: 'sample_user_001',
    discord_id: '000000000000000001',
    username: 'Noble Soul',
    discriminator: '0001',
    avatar: null,
    email: 'sample@conclave.realm',
    roles: ['1397497084793458691'], // Noble Soul role
    in_server: true,
    joined_at: new Date().toISOString()
  };

  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert(sampleUser, { onConflict: 'discord_id' })
    .select()
    .single();

  if (userError) {
    console.error('❌ Failed to create sample user:', userError.message);
    return false;
  }

  // Create profile
  const sampleProfile = {
    user_id: userData.id,
    display_name: 'Noble Soul',
    bio: 'A distinguished member of The Conclave',
    total_xp: 500,
    level: 5,
    message_count: 100,
    events_attended: 3,
    tournaments_won: 0,
    preferences: {
      particlesEnabled: true,
      soundsEnabled: true,
      animationsEnabled: true
    }
  };

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(sampleProfile, { onConflict: 'user_id' });

  if (profileError) {
    console.error('❌ Failed to create sample profile:', profileError.message);
    return false;
  }

  // Create pathway progress
  const pathwayProgress = [
    {
      user_id: userData.id,
      pathway_id: 'gaming',
      level: 3,
      xp: 250,
      next_level_xp: 3000,
      current_rank: 'Casual Gamer',
      achievements: ['gaming-initiate', 'game-night-regular']
    }
  ];

  const { error: progressError } = await supabase
    .from('pathway_progress')
    .upsert(pathwayProgress, { onConflict: 'user_id,pathway_id' });

  if (progressError) {
    console.error('❌ Failed to create pathway progress:', progressError.message);
    return false;
  }

  console.log('✅ Sample user created with profile and progress');
  return true;
}

async function seedSampleEvents() {
  console.log('\n📅 Creating sample events...');

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sampleEvents = [
    {
      id: 'event_gaming_001',
      title: 'Weekly Gaming Night',
      description: 'Join us for casual gaming and community fun!',
      type: 'game_night',
      pathway: 'gaming',
      start_date: tomorrow.toISOString(),
      end_date: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      max_participants: null,
      host: 'Gaming Team',
      requirements: ['Gaming Realm role'],
      rewards: { xp: 100, badges: ['gaming-enthusiast'] },
      status: 'upcoming',
      is_active: true
    },
    {
      id: 'event_lorebound_001',
      title: 'Anime Watch Party',
      description: 'Weekly anime viewing session - vote on what we watch!',
      type: 'watch_party',
      pathway: 'lorebound',
      start_date: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(tomorrow.getTime() + 26 * 60 * 60 * 1000).toISOString(),
      max_participants: null,
      host: 'Lorebound Team',
      requirements: ['Lorebound Realm role'],
      rewards: { xp: 75, badges: ['anime-enthusiast'] },
      status: 'upcoming',
      is_active: true
    }
  ];

  const { error } = await supabase
    .from('events')
    .upsert(sampleEvents, { onConflict: 'id' });

  if (error) {
    console.error('❌ Failed to create sample events:', error.message);
    return false;
  }

  console.log(`✅ Created ${sampleEvents.length} sample events`);
  return true;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const { error: testError } = await supabase.from('achievements').select('count').limit(1);
    
    if (testError && !testError.message.includes('0 rows')) {
      throw new Error(`Connection test failed: ${testError.message}`);
    }
    console.log('✅ Connection successful');

    // Run seeding
    const achievements = await seedAchievements();
    const stats = await seedServerStats();
    const user = await seedSampleUser();
    const events = await seedSampleEvents();

    if (achievements && stats && user && events) {
      console.log('\n✅ Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log('   • Achievements seeded');
      console.log('   • Server stats initialized');
      console.log('   • Sample user created');
      console.log('   • Sample events created');
      console.log('\n🎉 Ready to start development!');
    } else {
      console.log('\n⚠️  Some seeding operations failed. Check errors above.');
    }

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();