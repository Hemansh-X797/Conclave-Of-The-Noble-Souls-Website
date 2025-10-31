// ============================================================================
// DATABASE BACKUP SCRIPT
// Backup Supabase database to JSON files
// Location: /scripts/backup-db.js
// Usage: node scripts/backup-db.js
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
const BACKUP_DIR = path.join(__dirname, '../database/backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tables to backup
const TABLES = [
  'users',
  'user_profiles',
  'pathway_progress',
  'events',
  'achievements',
  'user_achievements',
  'notifications',
  'server_stats'
];

// ============================================================================
// BACKUP FUNCTIONS
// ============================================================================

async function backupTable(tableName) {
  console.log(`\n📦 Backing up table: ${tableName}`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`   ✅ Fetched ${data.length} rows`);
    return data;
    
  } catch (error) {
    console.error(`   ❌ Failed to backup ${tableName}:`, error.message);
    return null;
  }
}

function saveBackup(tableName, data) {
  const backupPath = path.join(BACKUP_DIR, `${TIMESTAMP}_${tableName}.json`);
  
  try {
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   💾 Saved to: ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to save backup:`, error.message);
    return false;
  }
}

function createBackupManifest(backups) {
  const manifest = {
    timestamp: new Date().toISOString(),
    date: TIMESTAMP,
    tables: backups.map(b => ({
      name: b.tableName,
      rows: b.rowCount,
      file: `${TIMESTAMP}_${b.tableName}.json`
    })),
    total_rows: backups.reduce((sum, b) => sum + b.rowCount, 0)
  };
  
  const manifestPath = path.join(BACKUP_DIR, `${TIMESTAMP}_manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n📋 Manifest created: ${manifestPath}`);
  
  return manifest;
}

function cleanOldBackups(keepDays = 30) {
  console.log(`\n🧹 Cleaning backups older than ${keepDays} days...`);
  
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    
    let deleted = 0;
    
    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    });
    
    if (deleted > 0) {
      console.log(`✅ Deleted ${deleted} old backup files`);
    } else {
      console.log(`✅ No old backups to delete`);
    }
    
  } catch (error) {
    console.error('⚠️  Failed to clean old backups:', error.message);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function backupDatabase() {
  console.log('💾 Database Backup Script\n');
  console.log(`📅 Backup date: ${TIMESTAMP}`);
  console.log(`📁 Backup directory: ${BACKUP_DIR}\n`);

  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✅ Created backup directory\n');
  }

  const startTime = Date.now();
  const backups = [];

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const { error: testError } = await supabase.from('users').select('count').limit(1);
    if (testError && !testError.message.includes('0 rows')) {
      throw new Error(`Connection failed: ${testError.message}`);
    }
    console.log('✅ Connection successful');

    // Backup each table
    for (const tableName of TABLES) {
      const data = await backupTable(tableName);
      
      if (data !== null) {
        const saved = saveBackup(tableName, data);
        
        if (saved) {
          backups.push({
            tableName,
            rowCount: data.length,
            success: true
          });
        }
      }
    }

    // Create manifest
    const manifest = createBackupManifest(backups);

    // Clean old backups
    cleanOldBackups(30);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Backup Summary');
    console.log('='.repeat(60));
    console.log(`✅ Tables backed up: ${backups.length}/${TABLES.length}`);
    console.log(`✅ Total rows: ${manifest.total_rows}`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📁 Location: ${BACKUP_DIR}`);
    console.log('='.repeat(60));

    console.log('\n✅ Backup completed successfully!');

  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    process.exit(1);
  }
}

backupDatabase();