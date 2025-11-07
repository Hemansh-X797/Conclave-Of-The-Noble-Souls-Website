# The Conclave Realm - Scripts Guide

## Overview

Complete documentation for all automation scripts in The Conclave Realm project. These production-ready scripts handle database migrations, Discord synchronization, backups, deployment, and maintenance operations.

**Version:** 2.0.0  
**Last Updated:** January 28, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Scripts Overview](#scripts-overview)
2. [Environment Setup](#environment-setup)
3. [Migration Script (migrate.js)](#migration-script-migratejs)
4. [Database Setup Script (setup-db.js)](#database-setup-script-setup-dbjs)
5. [Data Seeding Script (seed-data.js)](#data-seeding-script-seed-datajs)
6. [Backup Script (backup-db.js)](#backup-script-backup-dbjs)
7. [Discord Sync Script (sync-discord-roles.js)](#discord-sync-script-sync-discord-rolesjs)
8. [Deployment Script (deploy.js)](#deployment-script-deployjs)
9. [Sitemap Generator (generate-sitemap.js)](#sitemap-generator-generate-sitemapjs)
10. [Image Optimizer (optimize-images.js)](#image-optimizer-optimize-imagesjs)
11. [Automation Workflows](#automation-workflows)
12. [Troubleshooting Scripts](#troubleshooting-scripts)

---

## Scripts Overview

### Available Scripts

```
/scripts
├── migrate.js              # Database migration management
├── setup-db.js            # Initial database setup
├── seed-data.js           # Populate with sample data
├── backup-db.js           # Automated database backup
├── sync-discord-roles.js  # Sync Discord server data
├── deploy.js              # Automated deployment
├── generate-sitemap.js    # SEO sitemap generation
└── optimize-images.js     # Image compression
```

### Quick Command Reference

```bash
# Migration Management
node scripts/migrate.js status
node scripts/migrate.js up
node scripts/migrate.js down
node scripts/migrate.js create <name>

# Database Operations
node scripts/setup-db.js
node scripts/seed-data.js
node scripts/backup-db.js

# Discord Integration
node scripts/sync-discord-roles.js

# Deployment & Optimization
node scripts/deploy.js [environment]
node scripts/generate-sitemap.js
node scripts/optimize-images.js
```

---

## Environment Setup

### Required Dependencies

```bash
# Install all required packages
npm install @supabase/supabase-js dotenv sharp
```

### Environment Variables

Create `.env.local` with:

```env
# Supabase (REQUIRED for all database scripts)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Discord (REQUIRED for sync-discord-roles.js)
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=1368124846760001546

# Site Configuration (REQUIRED for deploy.js)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=The Conclave Realm

# Optional
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_DB_PASSWORD=your_db_password
```

### Verify Setup

```bash
# Check Node version
node --version  # Should be v18.0.0+

# Check if .env.local exists
ls -la .env.local

# Test environment loading
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

---

## Migration Script (migrate.js)

### Purpose

Manages database schema migrations with version control, allowing you to apply, rollback, and track database changes systematically.

### Commands

```bash
# Check migration status
node scripts/migrate.js status

# Apply all pending migrations
node scripts/migrate.js up

# Rollback last migration
node scripts/migrate.js down

# Create new migration
node scripts/migrate.js create <migration_name>
```

### Detailed Usage

#### Command: status

**Description:** Shows current migration state

**Usage:**
```bash
node scripts/migrate.js status
```

**Output:**
```
📊 Migration Status
═══════════════════════════════════════════
Applied Migrations:
   1. ✅ 001_initial_schema.sql (1247ms)
      Applied: 1/28/2025, 10:30:15 AM
   2. ✅ 002_add_indexes.sql (892ms)
      Applied: 1/28/2025, 10:30:17 AM

Pending Migrations:
   1. ⏳ 003_add_rls_policies.sql

═══════════════════════════════════════════
Summary:
   Total migrations: 3
   Applied: 2
   Pending: 1
═══════════════════════════════════════════
```

#### Command: up

**Description:** Applies all pending migrations sequentially

**Usage:**
```bash
node scripts/migrate.js up
```

**Process:**
1. Checks for pending migrations
2. Validates migration files exist
3. Executes SQL statements
4. Records success in migrations table
5. Stops on first failure

**Output:**
```
🚀 Running migrations UP

📋 Found 1 pending migration(s)

🔄 Applying migration: 003_add_rls_policies.sql
   📝 Executing SQL...
   ✅ Applied successfully (456ms)

═══════════════════════════════════════════
Migration Summary:
   ✅ Successful: 1
   ❌ Failed: 0
═══════════════════════════════════════════

✅ All migrations applied successfully!
```

**Error Handling:**
```
❌ Failed to apply migration: syntax error at or near "CREATE"
   ⚠️  Migration failed. Stopping execution.

═══════════════════════════════════════════
Migration Summary:
   ✅ Successful: 2
   ❌ Failed: 1
═══════════════════════════════════════════
```

#### Command: down

**Description:** Rolls back the last applied migration

**Usage:**
```bash
node scripts/migrate.js down
```

**Process:**
1. Gets last applied migration
2. Prompts for confirmation
3. Executes .down.sql file
4. Removes from migrations table

**Output:**
```
🔄 Rolling back last migration

⚠️  ROLLBACK CONFIRMATION
═══════════════════════════════════════════
Migration to rollback: 003_add_rls_policies.sql
Applied at: 1/28/2025, 10:30:18 AM
═══════════════════════════════════════════

This will rollback the last applied migration.
Press Enter to continue or Ctrl+C to cancel...

🔄 Rolling back migration: 003_add_rls_policies.sql
   📝 Executing rollback SQL...
   ✅ Rolled back successfully

✅ Rollback completed successfully!
```

#### Command: create

**Description:** Creates new migration file pair (up and down)

**Usage:**
```bash
node scripts/migrate.js create add_user_badges
```

**Process:**
1. Generates sequential number (004, 005, etc.)
2. Creates [number]_[name].sql
3. Creates [number]_[name].down.sql
4. Adds templates to both files

**Output:**
```
📝 Creating new migration

✅ Migration files created:
   UP:   004_add_user_badges.sql
   DOWN: 004_add_user_badges.down.sql

📝 Next steps:
   1. Edit the migration files in: /database/migrations
   2. Add your SQL statements
   3. Run: node scripts/migrate.js up
```

**Generated Files:**

`004_add_user_badges.sql`:
```sql
-- ============================================================================
-- Migration: add_user_badges
-- Created: 2025-01-28T12:00:00.000Z
-- Description: [Add description here]
-- ============================================================================

-- Add your UP migration SQL here

```

`004_add_user_badges.down.sql`:
```sql
-- ============================================================================
-- Rollback: add_user_badges
-- Created: 2025-01-28T12:00:00.000Z
-- Description: Rollback for add_user_badges
-- ============================================================================

-- Add your DOWN migration SQL here (to undo the UP migration)

```

### Migration Best Practices

**DO:**
- ✅ Test migrations locally first
- ✅ Write corresponding .down.sql for rollbacks
- ✅ Use transactions for data modifications
- ✅ Add indexes after creating tables
- ✅ Document purpose in migration header

**DON'T:**
- ❌ Delete migration files once applied
- ❌ Edit applied migrations
- ❌ Skip version numbers
- ❌ Forget to commit migrations to git
- ❌ Apply untested migrations to production

### Error Recovery

**If migration fails:**
```bash
# 1. Review error message
node scripts/migrate.js up

# 2. Check migration file syntax
cat database/migrations/004_problem.sql

# 3. Fix SQL in migration file
nano database/migrations/004_problem.sql

# 4. If partially applied, rollback first
node scripts/migrate.js down

# 5. Try again
node scripts/migrate.js up
```

**If migration table corrupted:**
```sql
-- Manually check migrations table
SELECT * FROM migrations ORDER BY applied_at DESC;

-- Remove problematic entry if needed
DELETE FROM migrations WHERE name = '004_problem.sql';
```

---

## Database Setup Script (setup-db.js)

### Purpose

Initial database setup and schema creation. Displays SQL for manual execution in Supabase SQL Editor.

### Usage

```bash
node scripts/setup-db.js
```

### Process

1. **Tests Connection** - Verifies Supabase credentials
2. **Displays Schema** - Shows complete SQL to execute
3. **Provides Instructions** - Steps for Supabase SQL Editor

### Output

```
🚀 Starting database setup...

📍 Supabase URL: https://your-project.supabase.co
🔑 Using service role key

🔌 Testing connection...
✅ Connection successful

📊 Creating database schema...
⚠️  Note: You may need to run this SQL manually in Supabase SQL Editor:
-----------------------------------------------------------
[COMPLETE SCHEMA SQL DISPLAYED HERE]
-----------------------------------------------------------

✅ Database setup instructions provided

🎉 Setup complete!

📝 Next steps:
   1. Copy the SQL above
   2. Open Supabase SQL Editor
   3. Paste and run the SQL
   4. Run: node scripts/seed-data.js
```

### Manual Execution Steps

1. **Open Supabase Dashboard**
   - Navigate to your project
   - Click "SQL Editor" in sidebar

2. **Create New Query**
   - Click "New Query"
   - Name it "Initial Schema"

3. **Copy Schema SQL**
   - Copy output from setup-db.js
   - Or use database/schema.sql

4. **Execute**
   - Paste SQL into editor
   - Click "Run" button
   - Wait for completion

5. **Verify**
   - Check "Table Editor" sidebar
   - Should see 15 tables created

### Troubleshooting

**Connection Failed:**
```
❌ Connection test failed: invalid credentials
```
**Fix:** Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

**Table Already Exists:**
```
Error: relation "users" already exists
```
**Fix:** Tables already created, skip to migration script

---

## Data Seeding Script (seed-data.js)

### Purpose

Populates database with initial sample data for development and testing.

### Usage

```bash
node scripts/seed-data.js
```

### What Gets Seeded

**Achievements** - Achievement definitions
```javascript
gaming-initiate, first-week, tournament-winner, etc.
```

**Server Stats** - Initial statistics record
```javascript
{
  member_count: 0,
  online_count: 0,
  pathway_stats: { gaming: 0, lorebound: 0, productive: 0, news: 0 }
}
```

**Sample User** - Test user with profile
```javascript
{
  discord_id: '000000000000000001',
  username: 'Noble Soul',
  roles: ['1397497084793458691']
}
```

**Sample Events** - Upcoming events
```javascript
[
  { title: 'Weekly Gaming Night', pathway: 'gaming' },
  { title: 'Anime Watch Party', pathway: 'lorebound' }
]
```

### Output

```
🌱 Starting database seeding...

🔌 Testing connection...
✅ Connection successful

📊 Seeding achievements...
✅ Seeded 50 achievements

📊 Initializing server stats...
✅ Server stats initialized

👤 Creating sample user...
✅ Sample user created with profile and progress

📅 Creating sample events...
✅ Created 2 sample events

✅ Database seeding completed successfully!

📊 Summary:
   • Achievements seeded
   • Server stats initialized
   • Sample user created
   • Sample events created

🎉 Ready to start development!
```

### Customizing Seed Data

Edit `/scripts/seed-data.js`:

```javascript
// Add custom achievements
const customAchievements = [
  {
    id: 'custom-achievement',
    name: 'Custom Achievement',
    description: 'Your custom achievement',
    pathway: 'gaming',
    xp: 100,
    rarity: 'rare'
  }
];

// Add custom events
const customEvents = [
  {
    title: 'Monthly Tournament',
    type: 'tournament',
    pathway: 'gaming',
    start_date: tomorrow.toISOString()
  }
];
```

### Resetting Seed Data

```bash
# Clear existing data
# Run in Supabase SQL Editor:
TRUNCATE TABLE user_achievements, achievements, events CASCADE;

# Re-seed
node scripts/seed-data.js
```

---

## Backup Script (backup-db.js)

### Purpose

Creates JSON backups of all database tables for disaster recovery.

### Usage

```bash
node scripts/backup-db.js
```

### Process

1. **Creates Backup Directory** - `/database/backups/`
2. **Fetches All Table Data** - Exports to JSON
3. **Saves Individual Files** - One file per table
4. **Creates Manifest** - Metadata about backup
5. **Cleans Old Backups** - Removes backups older than 30 days

### Output

```
💾 Database Backup Script

📅 Backup date: 2025-01-28
📁 Backup directory: /database/backups

🔌 Testing database connection...
✅ Connection successful

📦 Backing up table: users
   ✅ Fetched 1247 rows
   💾 Saved to: 2025-01-28_users.json

📦 Backing up table: user_profiles
   ✅ Fetched 1247 rows
   💾 Saved to: 2025-01-28_user_profiles.json

[... continues for all tables ...]

📋 Manifest created: 2025-01-28_manifest.json

🧹 Cleaning backups older than 30 days...
✅ Deleted 3 old backup files

═══════════════════════════════════════════
📊 Backup Summary
═══════════════════════════════════════════
✅ Tables backed up: 15/15
✅ Total rows: 12,847
⏱️  Duration: 3.42 seconds
📁 Location: /database/backups
═══════════════════════════════════════════

✅ Backup completed successfully!
```

### Backup Files Structure

```
/database/backups/
├── 2025-01-28_users.json
├── 2025-01-28_user_profiles.json
├── 2025-01-28_pathway_progress.json
├── 2025-01-28_events.json
├── 2025-01-28_achievements.json
├── 2025-01-28_user_achievements.json
├── 2025-01-28_notifications.json
├── 2025-01-28_server_stats.json
└── 2025-01-28_manifest.json
```

### Manifest File Format

```json
{
  "timestamp": "2025-01-28T10:30:00.000Z",
  "date": "2025-01-28",
  "tables": [
    {
      "name": "users",
      "rows": 1247,
      "file": "2025-01-28_users.json"
    },
    {
      "name": "user_profiles",
      "rows": 1247,
      "file": "2025-01-28_user_profiles.json"
    }
  ],
  "total_rows": 12847
}
```

### Restoring from Backup

Create `/scripts/restore-backup.js`:

```javascript
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function restore(date) {
  const supabase = createClient(url, key);
  const manifest = JSON.parse(
    fs.readFileSync(`database/backups/${date}_manifest.json`)
  );
  
  for (const table of manifest.tables) {
    const data = JSON.parse(
      fs.readFileSync(`database/backups/${table.file}`)
    );
    
    await supabase
      .from(table.name)
      .upsert(data, { onConflict: 'id' });
    
    console.log(`✅ Restored ${table.name}`);
  }
}

restore('2025-01-28');
```

### Automated Backup Schedule

**Using cron (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/project && node scripts/backup-db.js
```

**Using Task Scheduler (Windows):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start program
5. Program: `node`
6. Arguments: `scripts/backup-db.js`
7. Start in: Project directory

---

## Discord Sync Script (sync-discord-roles.js)

### Purpose

Synchronizes Discord server member data and roles with the database.

### Usage

```bash
node scripts/sync-discord-roles.js
```

### What Gets Synced

**Member Data:**
- Discord ID
- Username
- Discriminator
- Avatar URL
- Roles array
- Join date

**Server Statistics:**
- Total member count
- Pathway member counts
- Boost level (if available)

### Output

```
🔄 Discord Role Sync Script

🏰 Guild ID: 1368124846760001546
🔑 Using bot token: MTM2OD...

🔌 Testing database connection...
✅ Database connection successful

📥 Fetching guild members from Discord...
   Fetched 100 members so far...
   Fetched 200 members so far...
   Fetched 300 members so far...
✅ Fetched 342 total members

📥 Fetching guild roles from Discord...
✅ Fetched 47 roles

💾 Syncing members to database...
   ✅ Synced user: NobleKnight#0001
   ✅ Synced user: LoreMaster#0002
   [... continues ...]
✅ Synced 342 members

📊 Updating server statistics...
✅ Server stats updated
   Total members: 342
   Gaming: 89
   Lorebound: 124
   Productive: 67
   News: 62

═══════════════════════════════════════════
📊 Sync Summary
═══════════════════════════════════════════
✅ Total members fetched: 342
✅ Members synced: 342
❌ Errors: 0
⏱️  Time taken: 8.34 seconds
═══════════════════════════════════════════

✅ Discord sync completed successfully!
```

### Bot Token Setup

1. **Create Discord Bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create New Application
   - Go to "Bot" section
   - Click "Reset Token" and copy

2. **Enable Intents:**
   - Server Members Intent (Required)
   - Presence Intent (Optional)
   - Message Content Intent (Optional)

3. **Invite Bot:**
   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=8
   ```

4. **Add to .env.local:**
   ```env
   DISCORD_BOT_TOKEN=your_bot_token
   DISCORD_GUILD_ID=1368124846760001546
   ```

### Sync Schedule

**Manual Sync:**
```bash
node scripts/sync-discord-roles.js
```

**Automated Sync (Hourly):**
```bash
# Cron job
0 * * * * cd /path/to/project && node scripts/sync-discord-roles.js
```

**Webhook Trigger:**
Use Discord webhooks to trigger sync on member join/leave.

### Troubleshooting

**Missing Permissions:**
```
❌ Discord API error: 403 Missing Permissions
```
**Fix:** Ensure bot has "Server Members" intent enabled

**Invalid Token:**
```
❌ Discord API error: 401 Unauthorized
```
**Fix:** Regenerate bot token in Discord Developer Portal

**Rate Limited:**
```
❌ Discord API error: 429 Too Many Requests
```
**Fix:** Script handles rate limits automatically, wait and retry

---

## Deployment Script (deploy.js)

### Purpose

Automated deployment with pre-flight checks, build validation, and Vercel deployment.

### Usage

```bash
# Deploy to production
node scripts/deploy.js production

# Deploy to staging
node scripts/deploy.js staging

# Build only (no deploy)
node scripts/deploy.js development
```

### Process

1. **Environment Validation** - Checks Node version and env vars
2. **Dependency Check** - Verifies node_modules
3. **Code Quality** - Runs linting and type checks
4. **Build Project** - Next.js production build
5. **Generate Sitemap** - SEO sitemap creation
6. **Deploy to Vercel** - Automated deployment
7. **Post-Deploy Summary** - Checklist and URLs

### Output

```
🚀 The Conclave Realm - Deployment Script
═══════════════════════════════════════════
Environment: production
Node Version: v18.17.0
═══════════════════════════════════════════

🔍 Checking Node.js version...
✅ Node.js v18.17.0

🔐 Checking environment variables...
✅ All required environment variables present

📦 Checking dependencies...
✅ Dependencies installed

🔍 Running linting checks...
✅ Linting passed

📝 Running type checks...
✅ Type checking passed

🏗️  Building project...
   Creating an optimized production build...
   ✓ Compiled successfully
   ✓ Collecting page data
   ✓ Generating static pages (15/15)
   ✓ Finalizing page optimization
✅ Build completed successfully

🗺️  Generating sitemap...
✅ Sitemap generated

🖼️  Checking for image optimization...
⚠️  Image optimization available but skipped for speed.
   Run manually: node scripts/optimize-images.js

⚠️  Ready to deploy. Continue? (Press Enter to proceed)

🚀 Deploying to Vercel...
   Vercel CLI 28.4.8
   Deploying to production...
   https://conclave-realm.vercel.app
✅ Deployment successful

═══════════════════════════════════════════
🎉 Deployment Summary
═══════════════════════════════════════════
Environment: production
Duration: 142.78 seconds
Status: ✅ Success
═══════════════════════════════════════════

📋 Post-Deployment Checklist:
   ☐ Verify deployment URL
   ☐ Test Discord OAuth flow
   ☐ Check API endpoints
   ☐ Verify database connection
   ☐ Test pathway navigation
   ☐ Check mobile responsiveness
   ☐ Submit sitemap to search engines
```

### Pre-Deployment Checklist

Before running deploy:
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Discord bot configured
- [ ] Vercel account linked

### Deployment Environments

**Development** (local build only):
```bash
node scripts/deploy.js development
```
- Runs build
- No deployment
- For testing build process

**Staging** (preview deployment):
```bash
node scripts/deploy.js staging
```
- Runs all checks
- Deploys to Vercel preview URL
- For testing before production

**Production** (live deployment):
```bash
node scripts/deploy.js production
```
- Full validation
- Requires confirmation
- Deploys to production URL
- Updates DNS

### Vercel Integration

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Configure: `vercel env pull`

**Manual Deployment:**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

## Sitemap Generator (generate-sitemap.js)

### Purpose

Generates SEO-optimized sitemap.xml and robots.txt for search engines.

### Usage

```bash
node scripts/generate-sitemap.js
```

### Process

1. **Collects Routes** - Static and dynamic pages
2. **Generates XML** - W3C compliant sitemap
3. **Creates robots.txt** - Crawler instructions
4. **Saves to Public** - `/public/sitemap.xml`

### Output

```
🗺️  Sitemap Generation Script

🌐 Site URL: https://conclave-realm.vercel.app
📁 Output path: /public/sitemap.xml

📝 Generating sitemap.xml...
✅ Sitemap created: /public/sitemap.xml
📊 Total URLs: 27

📝 Generating robots.txt...
✅ Robots.txt created: /public/robots.txt

✅ Sitemap generation completed successfully!

📋 Next steps:
   1. Submit sitemap to Google Search Console
   2. Submit sitemap to Bing Webmaster Tools
   3. Verify robots.txt at: https://conclave-realm.vercel.app/robots.txt
```

### Generated Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://conclave-realm.vercel.app/</loc>
    <lastmod>2025-01-28T10:30:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://conclave-realm.vercel.app/pathways/gaming</loc>
    <lastmod>2025-01-28T10:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

### Generated Robots.txt

```txt
# The Conclave Realm - robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /chambers/
Disallow: /sanctum/
Disallow: /throne-room/
Disallow: /_next/
Disallow: /static/

Crawl-delay: 10

Sitemap: https://conclave-realm.vercel.app/sitemap.xml
```

### Submitting to Search Engines

**Google Search Console:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property (your domain)
3. Navigate to Sitemaps
4. Enter: `https://yoursite.com/sitemap.xml`
5. Click Submit

**Bing Webmaster Tools:**
1. Go to [Bing Webmaster](https://www.bing.com/webmasters)
2. Add your site
3. Navigate to Sitemaps
4. Submit sitemap URL

### Customizing Sitemap

Edit `/scripts/generate-sitemap.js`:

```javascript
// Add custom routes
const CUSTOM_ROUTES = [
  { path: '/custom-page', priority: 0.8, changefreq: 'monthly' }
];

// Exclude routes
const EXCLUDED_ROUTES = [
  '/admin',
  '/private'
];
```

---

## Image Optimizer (optimize-images.js)

### Purpose

Compresses and optimizes images for web performance using Sharp library.

### Usage

```bash
node scripts/optimize-images.js
```

### Prerequisites

```bash
# Install Sharp (optional dependency)
npm install --save-dev sharp
```

### Process

1. **Scans Images** - Finds all images in `/public/Assets/Images/`
2. **Optimizes Each** - Compresses based on format
3. **Creates WebP** - Modern format versions
4. **Generates Thumbnails** - Multiple sizes
5. **Saves Optimized** - To `/public/Assets/Images/optimized/`

### Output

```
🖼️  Image Optimization Script

📁 Input directory: /public/Assets/Images
📁 Output directory: /public/Assets/Images/optimized
📋 Supported formats: .jpg, .jpeg, .png, .webp

🔍 Scanning for images...
✅ Found 47 images

📸 Processing: nobility/crown.png
   Original size: 2.3 MB
   ✅ PNG optimized: 847 KB (63.17% smaller)
   ✅ WebP created: 412 KB (82.09% smaller)
   ✅ Thumbnail created: 150x150
   ✅ Thumbnail created: 300x300
   ✅ Thumbnail created: 600x600

[... continues for all images ...]

═══════════════════════════════════════════
📊 Optimization Summary
═══════════════════════════════════════════
✅ Successfully optimized: 47 images
❌ Failed: 0 images
⏱️  Time taken: 23.45 seconds
📁 Output saved to: /public/Assets/Images/optimized
═══════════════════════════════════════════
```

### Configuration

Edit `/scripts/optimize-images.js`:

```javascript
const CONFIG = {
  quality: {
    jpg: 85,      // JPEG quality (0-100)
    png: 90,      // PNG quality (0-100)
    webp: 85      // WebP quality (0-100)
  },
  maxWidth: 1920,   // Max width in pixels
  maxHeight: 1080,  // Max height in pixels
  createWebP: true, // Generate WebP versions
  createThumbnails: true,
  thumbnailSizes: [150, 300, 600] // Thumbnail sizes
};
```

### Using Optimized Images

**In React Components:**
```jsx
// Use optimized version
<img src="/Assets/Images/optimized/crown.webp" alt="Crown" />

// With fallback
<picture>
  <source srcSet="/Assets/Images/optimized/crown.webp" type="image/webp" />
  <img src="/Assets/Images/optimized/crown.jpg" alt="Crown" />
</picture>

// Responsive thumbnails
<img 
  src="/Assets/Images/optimized/crown_thumb_300.jpg" 
  srcSet="
    /Assets/Images/optimized/crown_thumb_150.jpg 150w,
    /Assets/Images/optimized/crown_thumb_300.jpg 300w,
    /Assets/Images/optimized/crown_thumb_600.jpg 600w
  "
  sizes="(max-width: 600px) 150px, (max-width: 1200px) 300px, 600px"
  alt="Crown"
/>
```

---

## Automation Workflows

### Daily Automation

**Morning Routine (6:00 AM):**
```bash
#!/bin/bash
# daily-morning.sh

echo "🌅 Daily Morning Automation"

# Sync Discord data
node scripts/sync-discord-roles.js

# Backup database
node scripts/backup-db.js

# Check migration status
node scripts/migrate.js status

echo "✅ Morning routine complete"
```

**Cron Setup:**
```bash
0 6 * * * /path/to/project/daily-morning.sh
```

### Weekly Automation

**Sunday Maintenance (2:00 AM):**
```bash
#!/bin/bash
# weekly-maintenance.sh

echo "🔧 Weekly Maintenance"

# Full database backup
node scripts/backup-db.js

# Optimize images
node scripts/optimize-images.js

# Generate fresh sitemap
node scripts/generate-sitemap.js

# Clean old backups (90+ days)
find database/backups -name "*.json" -mtime +90 -delete

echo "✅ Weekly maintenance complete"
```

**Cron Setup:**
```bash
0 2 * * 0 /path/to/project/weekly-maintenance.sh
```

### Pre-Deployment Automation

**Before Every Deploy:**
```bash
#!/bin/bash
# pre-deploy.sh

echo "🚀 Pre-Deployment Checks"

# Check migration status
echo "📊 Checking migrations..."
node scripts/migrate.js status

# Backup current state
echo "💾 Creating backup..."
node scripts/backup-db.js

# Run tests (if you have them)
echo "🧪 Running tests..."
npm test

# Lint code
echo "🔍 Linting code..."
npm run lint

# Build project
echo "🏗️  Building project..."
npm run build

echo "✅ Pre-deployment checks complete"
echo "Ready to deploy!"
```

**Usage:**
```bash
./pre-deploy.sh && node scripts/deploy.js production
```

### GitHub Actions Workflow

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: node scripts/migrate.js up
      
      - name: Generate sitemap
        run: node scripts/generate-sitemap.js
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --token=$VERCEL_TOKEN
```

---

## Troubleshooting Scripts

### Common Script Errors

#### Error: Module Not Found

**Symptom:**
```
Error: Cannot find module '@supabase/supabase-js'
```

**Solution:**
```bash
# Install missing dependencies
npm install @supabase/supabase-js dotenv

# Or install all
npm install
```

#### Error: Environment Variable Missing

**Symptom:**
```
❌ Missing Supabase credentials
Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**Solution:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are set
cat .env.local | grep SUPABASE

# Add missing variables
echo "NEXT_PUBLIC_SUPABASE_URL=your_url" >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=your_key" >> .env.local
```

#### Error: Permission Denied

**Symptom:**
```
Error: EACCES: permission denied, mkdir 'database/backups'
```

**Solution:**
```bash
# Fix permissions
chmod -R 755 database/

# Or create directory manually
mkdir -p database/backups
chmod 755 database/backups
```

#### Error: Connection Timeout

**Symptom:**
```
❌ Connection test failed: timeout of 10000ms exceeded
```

**Solution:**
```bash
# Check internet connection
ping supabase.com

# Verify Supabase URL is correct
echo $NEXT_PUBLIC_SUPABASE_URL

# Check firewall isn't blocking
curl -I https://your-project.supabase.co

# Try increasing timeout in script
# Edit script and change timeout value
```

### Script Debugging

**Enable Verbose Logging:**
```javascript
// Add to top of any script
process.env.DEBUG = 'true';
console.log('Debug mode enabled');
```

**Test Individual Functions:**
```javascript
// In script file
async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  
  console.log('Data:', data);
  console.log('Error:', error);
}

// Run specific test
testConnection().catch(console.error);
```

**Check Script Execution:**
```bash
# Run with verbose Node output
node --trace-warnings scripts/migrate.js status

# Check process output
node scripts/migrate.js status 2>&1 | tee migrate.log
```

### Performance Issues

**Slow Database Operations:**
```javascript
// Add timing to operations
const start = Date.now();
const { data, error } = await supabase.from('users').select('*');
console.log(`Query took ${Date.now() - start}ms`);
```

**Memory Issues:**
```bash
# Increase Node memory limit
node --max-old-space-size=4096 scripts/backup-db.js
```

**Connection Pool Exhaustion:**
```javascript
// Close connections properly
await supabase.removeAllChannels();
process.exit(0);
```

---

## Script Maintenance

### Updating Scripts

**Version Control:**
```bash
# Always commit script changes
git add scripts/
git commit -m "Update migration script with error handling"
git push origin main
```

**Testing Changes:**
```bash
# Create test script
cp scripts/migrate.js scripts/migrate.test.js

# Test modifications
node scripts/migrate.test.js status

# If working, replace original
mv scripts/migrate.test.js scripts/migrate.js
```

### Script Dependencies

**Check Outdated Packages:**
```bash
npm outdated
```

**Update Dependencies:**
```bash
# Update specific package
npm update @supabase/supabase-js

# Update all
npm update

# Check for security issues
npm audit
npm audit fix
```

### Script Documentation

**Add Comments:**
```javascript
/**
 * Migrates database schema to latest version
 * @param {string} direction - 'up' or 'down'
 * @returns {Promise<boolean>} Success status
 */
async function migrate(direction) {
  // Implementation
}
```

**Keep Changelog:**
```markdown
# Script Changelog

## [2.0.0] - 2025-01-28
### Added
- Rollback support for migrations
- Automatic backup before destructive operations
- Progress indicators

### Fixed
- Connection timeout handling
- Transaction rollback on errors
```

---

## Security Best Practices

### Environment Variables

**Never Commit:**
```bash
# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
```

**Use Example File:**
```bash
# Create .env.example
cp .env.local .env.example

# Remove sensitive values
sed -i 's/=.*/=your_value_here/g' .env.example

# Commit example
git add .env.example
git commit -m "Add environment example"
```

### Service Keys

**Rotate Regularly:**
```bash
# Generate new service key in Supabase
# Update .env.local
# Test scripts
# Revoke old key
```

**Limit Permissions:**
- Use service role only when necessary
- Consider read-only keys for queries
- Use anon key for public operations

### Script Access

**Restrict Execution:**
```bash
# Make scripts executable only by owner
chmod 700 scripts/*.js

# Or specific scripts
chmod 700 scripts/deploy.js
chmod 700 scripts/backup-db.js
```

**Audit Logging:**
```javascript
// Add to critical scripts
const logAction = (action, user, details) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    user: process.env.USER,
    details
  }));
};
```

---

## Performance Tips

### Optimization Strategies

**Batch Operations:**
```javascript
// Bad - Multiple queries
for (const user of users) {
  await supabase.from('users').update({ active: true }).eq('id', user.id);
}

// Good - Single batch update
const updates = users.map(u => ({ id: u.id, active: true }));
await supabase.from('users').upsert(updates);
```

**Connection Pooling:**
```javascript
// Reuse Supabase client
const supabase = createClient(url, key);

// Don't create new client in loops
// Bad
for (const item of items) {
  const supabase = createClient(url, key);
  await supabase.from('table').insert(item);
}
```

**Parallel Execution:**
```javascript
// Run independent operations in parallel
const [users, events, achievements] = await Promise.all([
  supabase.from('users').select('*'),
  supabase.from('events').select('*'),
  supabase.from('achievements').select('*')
]);
```

### Resource Management

**Memory Usage:**
```javascript
// Process large datasets in chunks
async function processLargeTable() {
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data } = await supabase
      .from('large_table')
      .select('*')
      .range(offset, offset + limit - 1);
    
    if (!data || data.length === 0) break;
    
    await processChunk(data);
    offset += limit;
  }
}
```

**Connection Cleanup:**
```javascript
// Always cleanup
process.on('exit', () => {
  supabase.removeAllChannels();
});

process.on('SIGINT', () => {
  supabase.removeAllChannels();
  process.exit(0);
});
```

---

## Advanced Script Patterns

### Error Recovery

**Retry Logic:**
```javascript
async function retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Usage
await retryOperation(async () => {
  return await supabase.from('users').select('*');
});
```

**Graceful Degradation:**
```javascript
async function backupWithFallback() {
  try {
    await backupToSupabase();
  } catch (primaryError) {
    console.warn('Primary backup failed, using local fallback');
    try {
      await backupToLocal();
    } catch (fallbackError) {
      console.error('All backup methods failed');
      throw fallbackError;
    }
  }
}
```

### Progress Tracking

**Progress Bar:**
```javascript
const cliProgress = require('cli-progress');

async function processWithProgress(items) {
  const bar = new cliProgress.SingleBar({});
  bar.start(items.length, 0);
  
  for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
    bar.update(i + 1);
  }
  
  bar.stop();
}
```

### Validation

**Input Validation:**
```javascript
function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DISCORD_BOT_TOKEN'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
```

---

## Conclusion

This comprehensive guide covers all automation scripts for The Conclave Realm. Each script is production-ready with error handling, logging, and recovery mechanisms.

### Quick Reference Summary

```bash
# Database
node scripts/setup-db.js              # Initial setup
node scripts/migrate.js status        # Check migrations
node scripts/migrate.js up            # Apply migrations
node scripts/seed-data.js             # Add sample data
node scripts/backup-db.js             # Backup database

# Discord
node scripts/sync-discord-roles.js    # Sync members/roles

# Deployment
node scripts/deploy.js production     # Deploy to prod
node scripts/generate-sitemap.js      # Create sitemap
node scripts/optimize-images.js       # Optimize images
```

### Support Resources

- **Scripts Location:** `/scripts/`
- **Documentation:** `/docs/`
- **Environment:** `.env.local`
- **Logs:** Check console output

For additional assistance or custom script development, consult the development team.

**Version:** 2.0.0  
**Status:** Production Ready  
**Last Updated:** January 28, 2025

---

*May your scripts execute flawlessly, Noble One.* 🎖️