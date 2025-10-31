// ============================================================================
// DISCORD ROLE SYNC SCRIPT
// Sync Discord roles and member data to database
// Location: /scripts/sync-discord-roles.js
// Usage: node scripts/sync-discord-roles.js
// ============================================================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// ============================================================================
// DISCORD API FUNCTIONS
// ============================================================================

async function fetchGuildMembers() {
  console.log('📥 Fetching guild members from Discord...');
  
  let allMembers = [];
  let after = null;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = new URL(`${DISCORD_API_BASE}/guilds/${DISCORD_GUILD_ID}/members`);
      url.searchParams.append('limit', '1000');
      if (after) url.searchParams.append('after', after);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
      }

      const members = await response.json();
      allMembers = allMembers.concat(members);

      if (members.length < 1000) {
        hasMore = false;
      } else {
        after = members[members.length - 1].user.id;
      }

      console.log(`   Fetched ${allMembers.length} members so far...`);
    }

    console.log(`✅ Fetched ${allMembers.length} total members`);
    return allMembers;

  } catch (error) {
    console.error('❌ Failed to fetch members:', error.message);
    throw error;
  }
}

async function fetchGuildRoles() {
  console.log('\n📥 Fetching guild roles from Discord...');

  try {
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const roles = await response.json();
    console.log(`✅ Fetched ${roles.length} roles`);
    return roles;

  } catch (error) {
    console.error('❌ Failed to fetch roles:', error.message);
    throw error;
  }
}

// ============================================================================
// DATABASE SYNC FUNCTIONS
// ============================================================================

async function syncMembersToDatabase(members) {
  console.log('\n💾 Syncing members to database...');

  let synced = 0;
  let errors = 0;

  for (const member of members) {
    try {
      const userData = {
        id: `discord_${member.user.id}`,
        discord_id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator || '0',
        avatar: member.user.avatar,
        roles: member.roles || [],
        in_server: true,
        joined_at: member.joined_at,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'discord_id' });

      if (error) {
        console.error(`   ❌ Failed to sync ${member.user.username}:`, error.message);
        errors++;
      } else {
        synced++;
      }

    } catch (error) {
      console.error(`   ❌ Error syncing member:`, error.message);
      errors++;
    }
  }

  console.log(`✅ Synced ${synced} members`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors occurred`);
  }

  return { synced, errors };
}

async function updateServerStats(members, roles) {
  console.log('\n📊 Updating server statistics...');

  try {
    // Count members by pathway
    const pathwayRoles = {
      gaming: '1395703399760265226',
      lorebound: '1397498835919442033',
      productive: '1409444816189788171',
      news: '1395703930587189321'
    };

    const pathwayStats = {};
    for (const [pathway, roleId] of Object.entries(pathwayRoles)) {
      const count = members.filter(m => m.roles.includes(roleId)).length;
      pathwayStats[pathway] = count;
    }

    // Count online members (approximate - not available from members endpoint)
    const stats = {
      id: 1,
      member_count: members.length,
      online_count: 0, // Would need presence intent
      boost_level: 0, // Would need guild endpoint
      boost_count: 0,
      pathway_stats: pathwayStats,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('server_stats')
      .upsert(stats, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    console.log('✅ Server stats updated');
    console.log(`   Total members: ${members.length}`);
    console.log(`   Gaming: ${pathwayStats.gaming}`);
    console.log(`   Lorebound: ${pathwayStats.lorebound}`);
    console.log(`   Productive: ${pathwayStats.productive}`);
    console.log(`   News: ${pathwayStats.news}`);

  } catch (error) {
    console.error('❌ Failed to update stats:', error.message);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function syncDiscordData() {
  console.log('🔄 Discord Role Sync Script\n');
  console.log(`🏰 Guild ID: ${DISCORD_GUILD_ID}`);
  console.log(`🔑 Using bot token: ${DISCORD_BOT_TOKEN.substring(0, 20)}...`);

  const startTime = Date.now();

  try {
    // Test database connection
    console.log('\n🔌 Testing database connection...');
    const { error: testError } = await supabase.from('users').select('count').limit(1);
    if (testError && !testError.message.includes('0 rows')) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    console.log('✅ Database connection successful');

    // Fetch Discord data
    const members = await fetchGuildMembers();
    const roles = await fetchGuildRoles();

    // Sync to database
    const { synced, errors } = await syncMembersToDatabase(members);
    await updateServerStats(members, roles);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary');
    console.log('='.repeat(60));
    console.log(`✅ Total members fetched: ${members.length}`);
    console.log(`✅ Members synced: ${synced}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log('='.repeat(60));

    console.log('\n✅ Discord sync completed successfully!');

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncDiscordData();