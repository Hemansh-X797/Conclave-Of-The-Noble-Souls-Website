// ============================================================================
// SITEMAP GENERATION SCRIPT
// Generate sitemap.xml for SEO
// Location: /scripts/generate-sitemap.js
// Usage: node scripts/generate-sitemap.js
// ============================================================================

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { getAllPathways } = require('../src/data/pathways');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// ============================================================================
// ROUTES CONFIGURATION
// ============================================================================

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/gateway', priority: 0.9, changefreq: 'weekly' },
  { path: '/court', priority: 0.8, changefreq: 'weekly' },
  { path: '/archives', priority: 0.7, changefreq: 'monthly' },
  { path: '/hall-of-nobles', priority: 0.7, changefreq: 'weekly' },
  { path: '/art-gallery', priority: 0.6, changefreq: 'weekly' },
];

const PATHWAY_SUBROUTES = {
  gaming: [
    '/tournaments',
    '/leaderboards',
    '/bot-help',
    '/game-news'
  ],
  lorebound: [
    '/library',
    '/reviews',
    '/collections',
    '/sites'
  ],
  productive: [
    '/resources',
    '/challenges',
    '/showcase'
  ],
  news: [
    '/breaking',
    '/science',
    '/tech',
    '/local',
    '/analysis',
    '/discussions'
  ]
};

// ============================================================================
// SITEMAP GENERATION
// ============================================================================

function generateSitemapXML() {
  const pathways = getAllPathways();
  const routes = [];

  // Add static routes
  routes.push(...STATIC_ROUTES);

  // Add pathway routes
  pathways.forEach(pathway => {
    // Main pathway page
    routes.push({
      path: `/pathways/${pathway.id}`,
      priority: 0.9,
      changefreq: 'weekly'
    });

    // Pathway subroutes
    if (PATHWAY_SUBROUTES[pathway.id]) {
      PATHWAY_SUBROUTES[pathway.id].forEach(subroute => {
        routes.push({
          path: `/pathways/${pathway.id}${subroute}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
    }
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${routes.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

function generateRobotsTxt() {
  return `# The Conclave Realm - robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /chambers/
Disallow: /sanctum/
Disallow: /throne-room/
Disallow: /_next/
Disallow: /static/

# Crawl-delay
Crawl-delay: 10

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function generateSitemap() {
  console.log('🗺️  Sitemap Generation Script\n');
  console.log(`🌐 Site URL: ${SITE_URL}`);
  console.log(`📁 Output path: ${OUTPUT_PATH}\n`);

  try {
    // Generate sitemap XML
    console.log('📝 Generating sitemap.xml...');
    const sitemapXML = generateSitemapXML();
    fs.writeFileSync(OUTPUT_PATH, sitemapXML, 'utf8');
    console.log(`✅ Sitemap created: ${OUTPUT_PATH}`);

    // Count URLs
    const urlCount = (sitemapXML.match(/<url>/g) || []).length;
    console.log(`📊 Total URLs: ${urlCount}`);

    // Generate robots.txt
    console.log('\n📝 Generating robots.txt...');
    const robotsTxt = generateRobotsTxt();
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
    console.log(`✅ Robots.txt created: ${robotsPath}`);

    console.log('\n✅ Sitemap generation completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Submit sitemap to Google Search Console');
    console.log('   2. Submit sitemap to Bing Webmaster Tools');
    console.log(`   3. Verify robots.txt at: ${SITE_URL}/robots.txt`);

  } catch (error) {
    console.error('\n❌ Sitemap generation failed:', error.message);
    process.exit(1);
  }
}

generateSitemap();