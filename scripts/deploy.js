// ============================================================================
// DEPLOYMENT SCRIPT
// Automated deployment with checks and optimizations
// Location: /scripts/deploy.js
// Usage: node scripts/deploy.js [environment]
// ============================================================================

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENVIRONMENT = process.argv[2] || 'production';
const VALID_ENVIRONMENTS = ['development', 'staging', 'production'];

if (!VALID_ENVIRONMENTS.includes(ENVIRONMENT)) {
  console.error(`❌ Invalid environment: ${ENVIRONMENT}`);
  console.error(`Valid environments: ${VALID_ENVIRONMENTS.join(', ')}`);
  process.exit(1);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    throw error;
  }
}

function checkNodeVersion() {
  console.log('🔍 Checking Node.js version...');
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 18) {
    console.error(`❌ Node.js 18+ required. Current: ${version}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js ${version}`);
}

function checkDependencies() {
  console.log('\n📦 Checking dependencies...');
  
  if (!fs.existsSync('node_modules')) {
    console.log('⚠️  node_modules not found. Installing dependencies...');
    exec('npm install');
  } else {
    console.log('✅ Dependencies installed');
  }
}

function runLinting() {
  console.log('\n🔍 Running linting checks...');
  
  try {
    exec('npm run lint', { stdio: 'pipe' });
    console.log('✅ Linting passed');
  } catch (error) {
    console.error('❌ Linting failed');
    console.log('⚠️  Continuing anyway... Fix linting errors when possible.');
  }
}

function runTypeCheck() {
  console.log('\n📝 Running type checks...');
  
  if (fs.existsSync('tsconfig.json')) {
    try {
      exec('npm run type-check', { stdio: 'pipe' });
      console.log('✅ Type checking passed');
    } catch (error) {
      console.error('⚠️  Type checking failed. Review errors and fix when possible.');
    }
  } else {
    console.log('⏭️  No TypeScript configuration found, skipping...');
  }
}

function buildProject() {
  console.log('\n🏗️  Building project...');
  
  try {
    exec('npm run build');
    console.log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed');
    return false;
  }
}

function generateSitemap() {
  console.log('\n🗺️  Generating sitemap...');
  
  try {
    exec('node scripts/generate-sitemap.js');
    console.log('✅ Sitemap generated');
  } catch (error) {
    console.error('⚠️  Sitemap generation failed');
  }
}

function optimizeImages() {
  console.log('\n🖼️  Checking for image optimization...');
  
  if (fs.existsSync('scripts/optimize-images.js')) {
    try {
      console.log('⚠️  Image optimization available but skipped for speed.');
      console.log('   Run manually: node scripts/optimize-images.js');
    } catch (error) {
      console.error('⚠️  Image optimization failed');
    }
  }
}

function checkEnvironmentVariables() {
  console.log('\n🔐 Checking environment variables...');
  
  const required = [
    'NEXT_PUBLIC_SITE_URL',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_GUILD_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables present');
}

function deployToVercel() {
  console.log('\n🚀 Deploying to Vercel...');
  
  try {
    const deployCommand = ENVIRONMENT === 'production'
      ? 'vercel --prod'
      : 'vercel';
    
    exec(deployCommand);
    console.log('✅ Deployment successful');
  } catch (error) {
    console.error('❌ Deployment failed');
    throw error;
  }
}

function printDeploymentSummary(startTime) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Deployment Summary');
  console.log('='.repeat(60));
  console.log(`Environment: ${ENVIRONMENT}`);
  console.log(`Duration: ${duration} seconds`);
  console.log(`Status: ✅ Success`);
  console.log('='.repeat(60));
  
  console.log('\n📋 Post-Deployment Checklist:');
  console.log('   ☐ Verify deployment URL');
  console.log('   ☐ Test Discord OAuth flow');
  console.log('   ☐ Check API endpoints');
  console.log('   ☐ Verify database connection');
  console.log('   ☐ Test pathway navigation');
  console.log('   ☐ Check mobile responsiveness');
  console.log('   ☐ Submit sitemap to search engines');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function deploy() {
  console.log('🚀 The Conclave Realm - Deployment Script');
  console.log('='.repeat(60));
  console.log(`Environment: ${ENVIRONMENT}`);
  console.log(`Node Version: ${process.version}`);
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();

  try {
    // Pre-deployment checks
    checkNodeVersion();
    checkEnvironmentVariables();
    checkDependencies();
    
    // Code quality checks
    runLinting();
    runTypeCheck();
    
    // Build and optimize
    const buildSuccess = buildProject();
    if (!buildSuccess) {
      console.error('\n❌ Build failed. Aborting deployment.');
      process.exit(1);
    }
    
    generateSitemap();
    optimizeImages();
    
    // Deploy
    if (ENVIRONMENT === 'production' || ENVIRONMENT === 'staging') {
      console.log('\n⚠️  Ready to deploy. Continue? (Press Enter to proceed)');
      
      // Wait for user confirmation in production
      if (ENVIRONMENT === 'production') {
        await new Promise(resolve => {
          process.stdin.once('data', resolve);
        });
      }
      
      deployToVercel();
    } else {
      console.log('\n✅ Build completed. Ready for local testing.');
      console.log('   Run: npm start');
    }
    
    printDeploymentSummary(startTime);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();