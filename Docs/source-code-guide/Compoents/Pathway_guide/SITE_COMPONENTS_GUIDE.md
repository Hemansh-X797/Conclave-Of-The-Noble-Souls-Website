# 🌐 SITE COMPONENTS GUIDE
## External Site Discovery System Manual for The Conclave Realm

**Last Updated:** November 23, 2024  
**Components:** 2 Site System Components  
**Quality Level:** LEGENDARY 🎖️

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [ExternalSiteCard](#externalsitecard)
4. [SiteGrid](#sitegrid)
5. [Integration Examples](#integration-examples)
6. [Data Formats](#data-formats)
7. [Customization](#customization)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

### **What Is This System?**

A complete external website discovery and management system featuring:
- Beautiful site display cards with ratings
- Advanced filtering and search
- Category-based organization
- Multiple view modes (grid/list)
- Visit tracking and analytics

### **File Locations**

```
/src/components/pathways/sites/
├── ExternalSiteCard.jsx    (450 lines)
└── SiteGrid.jsx            (600 lines)
```

### **Dependencies**

```json
{
  "lucide-react": "^0.312.0"
}
```

**Note:** These components use **zero external dependencies** beyond Lucide React for icons. Everything else is built from scratch.

---

## 🏗️ COMPONENT ARCHITECTURE

### **Component Hierarchy**

```
SiteGrid (Main Container)
├── SearchBar (search input)
├── StatCards (total, showing)
├── CategoryFilter (collapsible)
├── SortDropdown (name, rating, popularity)
├── ViewModeSwitcher (grid/list)
└── ExternalSiteCard[] (individual sites)
    ├── Site Logo/Icon
    ├── Rating Stars
    ├── Feature Tags
    ├── Status Badge
    └── Visit Button
```

### **Data Flow**

```
User → Search/Filter → SiteGrid
     ↓
SiteGrid → Filter Sites → ExternalSiteCard[]
     ↓
User Clicks Visit → Opens in New Tab
     ↓
Track Visit → LocalStorage → Analytics
```

---

## 🎴 EXTERNALSITECARD

### **Purpose**
Display individual external website with rating, features, and visit button.

### **Import**

```javascript
import ExternalSiteCard from '@/components/pathways/sites/ExternalSiteCard';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `site` | Object | Yes | - | Site object with details |
| `onVisit` | Function | No | - | Callback when site is visited |
| `variant` | String | No | `'default'` | Card variant |
| `pathway` | String | No | `'lorebound'` | Pathway for theming |

### **Variants**

**1. Default Variant** - Full card with all details
```jsx
<ExternalSiteCard
  site={siteData}
  variant="default"
  pathway="lorebound"
/>
```

**2. Compact Variant** - Minimal inline display
```jsx
<ExternalSiteCard
  site={siteData}
  variant="compact"
  pathway="lorebound"
/>
```

**3. Detailed Variant** - Extended info with extra stats
```jsx
<ExternalSiteCard
  site={siteData}
  variant="detailed"
  pathway="lorebound"
/>
```

### **Usage Examples**

#### **Basic Usage**
```jsx
import ExternalSiteCard from '@/components/pathways/sites/ExternalSiteCard';

function SiteDisplay() {
  const site = {
    name: 'HiAnime',
    url: 'https://hianime.to',
    logo: '/Assets/Images/sites/hianime_logo.png',
    category: 'Anime Streaming',
    description: 'Premium anime streaming with HD quality',
    rating: 9.5,
    status: 'Active',
    features: ['HD Quality', 'No Ads', 'Fast Servers'],
    lastChecked: '2024-11-20',
    speed: 'Fast',
    popularity: 'Very High'
  };

  const handleVisit = (visitedSite) => {
    console.log('User visited:', visitedSite.name);
    // Track in analytics
    trackSiteVisit(visitedSite);
  };

  return (
    <ExternalSiteCard
      site={site}
      onVisit={handleVisit}
      variant="default"
      pathway="lorebound"
    />
  );
}
```

#### **Grid Layout with Multiple Cards**
```jsx
function SiteGallery({ sites }) {
  return (
    <div className="sites-gallery">
      {sites.map((site, index) => (
        <ExternalSiteCard
          key={site.url}
          site={site}
          variant="default"
          pathway="lorebound"
        />
      ))}
    </div>
  );
}
```

#### **Compact List View**
```jsx
function CompactSiteList({ sites }) {
  return (
    <div className="sites-list">
      {sites.map((site) => (
        <ExternalSiteCard
          key={site.url}
          site={site}
          variant="compact"
          pathway="lorebound"
        />
      ))}
    </div>
  );
}
```

### **Features**

**Visual Elements:**
- Site logo with fallback (Globe icon if missing)
- Star rating system (5 stars, visual display)
- Category badge with color coding
- Status indicator (Active/Maintenance)
- Feature tags with checkmarks
- Visit button with external link icon

**Interactive Features:**
- Hover effects (transform, glow)
- Click to visit (opens in new tab)
- Sound feedback (playClick, playHover)
- Loading state for images
- Error handling for missing images

**Additional Info (Detailed Variant):**
- Last checked date
- Speed indicator
- Popularity metric

### **Star Rating System**

The component automatically renders stars based on the rating:

```javascript
// Rating: 4.5
// Renders: ★★★★☆ (4 full stars + 1 half star)

// Full star: rating >= 1
// Half star: rating % 1 >= 0.5
// Empty star: remaining stars up to 5
```

**Example ratings:**
- 5.0 → ★★★★★
- 4.5 → ★★★★☆
- 3.7 → ★★★☆☆
- 2.0 → ★★☆☆☆

### **Status Colors**

```javascript
Active: Green (#50C878)
Maintenance: Orange (#FF8C00)
```

### **Security Features**

All external links open with:
```javascript
window.open(url, '_blank', 'noopener,noreferrer');
```

This prevents:
- Tab nabbing attacks
- Access to window.opener
- Referrer leaking

---

## 🗂️ SITEGRID

### **Purpose**
Display and filter collection of external websites with advanced controls.

### **Import**

```javascript
import SiteGrid from '@/components/pathways/sites/SiteGrid';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sites` | Array | Yes | `[]` | Array of site objects |
| `categories` | Array | No | `[]` | Available categories |
| `defaultCategory` | String | No | `'all'` | Default category |
| `onSiteVisit` | Function | No | - | Visit callback |
| `pathway` | String | No | `'lorebound'` | Pathway theming |

### **Usage Examples**

#### **Basic Implementation**
```jsx
import SiteGrid from '@/components/pathways/sites/SiteGrid';
import sitesData from '@/data/sites.json';

function SitesPage() {
  return (
    <SiteGrid
      sites={sitesData.lorebound}
      categories={['anime', 'manga', 'novels', 'tools']}
      defaultCategory="all"
      pathway="lorebound"
    />
  );
}
```

#### **With Visit Tracking**
```jsx
function TrackedSitesPage() {
  const handleSiteVisit = (site) => {
    // Track in analytics
    fetch('/api/analytics/site-visit', {
      method: 'POST',
      body: JSON.stringify({
        siteName: site.name,
        siteUrl: site.url,
        category: site.category,
        timestamp: Date.now()
      })
    });

    // Update local stats
    const visits = JSON.parse(localStorage.getItem('site-visits') || '{}');
    visits[site.url] = (visits[site.url] || 0) + 1;
    localStorage.setItem('site-visits', JSON.stringify(visits));
  };

  return (
    <SiteGrid
      sites={sites}
      categories={categories}
      onSiteVisit={handleSiteVisit}
      pathway="lorebound"
    />
  );
}
```

#### **Multiple Category Pages**
```jsx
function AnimeSitesPage() {
  return (
    <SiteGrid
      sites={sitesData.anime}
      categories={['streaming', 'download', 'discussion']}
      defaultCategory="streaming"
      pathway="lorebound"
    />
  );
}

function MangaSitesPage() {
  return (
    <SiteGrid
      sites={sitesData.manga}
      categories={['online-reading', 'download', 'scanlation']}
      defaultCategory="online-reading"
      pathway="lorebound"
    />
  );
}
```

### **Features**

**Search System:**
- Real-time filtering
- Searches: name, description, category, features
- Keyboard shortcut: `Ctrl+K`
- Clear button

**Category Filter:**
- Dynamic category buttons
- "All Sites" option
- Visual active state
- Collapsible panel
- Filter badge shows active filters

**Sort Options:**
- By Name (alphabetical A-Z)
- By Rating (high to low)
- By Popularity
- Toggle ascending/descending
- Persistent preferences

**View Modes:**
- Grid view (3+ columns, responsive)
- List view (compact cards, single column)
- Toggle with icons
- Saved in LocalStorage

**Stats Display:**
- Total sites count
- Currently showing count
- Updates in real-time

**Empty States:**
- No sites available
- No search results
- Helpful messaging
- Action buttons

### **Keyboard Shortcuts**

```
Ctrl+K    Focus search input
Escape    Close filters/dropdowns
```

### **LocalStorage Keys**

```javascript
'site-grid-view'      // Saved view mode (grid/list)
'site-grid-sort'      // Saved sort option
'site-grid-order'     // Saved sort order (asc/desc)
'site-visits'         // Visit tracking per site
```

### **Visit Tracking Format**

```javascript
{
  "https://hianime.to": 15,
  "https://mangadex.org": 8,
  "https://novelupdates.com": 23
}
```

---

## 🔗 INTEGRATION EXAMPLES

### **Complete Sites Page**

```jsx
import { useState, useEffect } from 'react';
import SiteGrid from '@/components/pathways/sites/SiteGrid';
import sitesData from '@/data/sites.json';

function CompleteSitesPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    loadSites();
    loadAnalytics();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      // Load from JSON or API
      const data = sitesData.lorebound;
      setSites(data);
    } catch (error) {
      console.error('Failed to load sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = () => {
    const visits = localStorage.getItem('site-visits');
    if (visits) setAnalytics(JSON.parse(visits));
  };

  const handleSiteVisit = (site) => {
    // Update analytics
    const updated = { ...analytics };
    updated[site.url] = (updated[site.url] || 0) + 1;
    setAnalytics(updated);
    localStorage.setItem('site-visits', JSON.stringify(updated));

    // Optional: Send to backend
    fetch('/api/sites/track', {
      method: 'POST',
      body: JSON.stringify({ siteUrl: site.url })
    });
  };

  if (loading) return <LoadingCrest message="Loading sites..." />;

  return (
    <div className="sites-page">
      <header className="page-header">
        <h1>External Resources</h1>
        <p>Curated collection of the best anime, manga, and novel sites</p>
      </header>

      <SiteGrid
        sites={sites}
        categories={['anime', 'manga', 'novels', 'tools']}
        defaultCategory="all"
        onSiteVisit={handleSiteVisit}
        pathway="lorebound"
      />

      <footer className="page-footer">
        <p>Total visits: {Object.values(analytics).reduce((a, b) => a + b, 0)}</p>
      </footer>
    </div>
  );
}
```

### **Tabbed Interface**

```jsx
function TabbedSitesPage() {
  const [activeTab, setActiveTab] = useState('anime');

  const tabs = {
    anime: sitesData.anime,
    manga: sitesData.manga,
    novels: sitesData.novels,
    tools: sitesData.tools
  };

  return (
    <div>
      <div className="tabs">
        {Object.keys(tabs).map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <SiteGrid
        sites={tabs[activeTab]}
        categories={getCategoriesForTab(activeTab)}
        pathway="lorebound"
      />
    </div>
  );
}
```

### **Featured Sites Section**

```jsx
function FeaturedSites() {
  const featuredSites = sites
    .filter(s => s.rating >= 9.0)
    .slice(0, 6);

  return (
    <section className="featured-sites">
      <h2>Top Rated Sites</h2>
      <div className="featured-grid">
        {featuredSites.map(site => (
          <ExternalSiteCard
            key={site.url}
            site={site}
            variant="detailed"
            pathway="lorebound"
          />
        ))}
      </div>
    </section>
  );
}
```

---

## 📋 DATA FORMATS

### **Site Object Structure**

```javascript
{
  // Required fields
  name: 'HiAnime',
  url: 'https://hianime.to',
  
  // Optional but recommended
  logo: '/Assets/Images/sites/hianime_logo.png',
  category: 'Anime Streaming',
  description: 'Premium anime streaming with HD quality and fast servers',
  rating: 9.5,  // 0-10 scale
  
  // Optional display fields
  status: 'Active',  // 'Active' or 'Maintenance'
  features: [
    'HD Quality',
    'No Ads',
    'Fast Servers',
    'Multiple Subtitles',
    'Download Support'
  ],
  
  // Optional metadata (for detailed variant)
  lastChecked: '2024-11-20',  // ISO date string
  speed: 'Fast',              // 'Slow', 'Medium', 'Fast', 'Very Fast'
  popularity: 'Very High'     // 'Low', 'Medium', 'High', 'Very High'
}
```

### **Full Example - Anime Site**

```json
{
  "name": "HiAnime",
  "url": "https://hianime.to",
  "logo": "/Assets/Images/sites/hianime_logo.png",
  "category": "Anime Streaming",
  "description": "Premium anime streaming platform with extensive library, HD quality streams, and no advertisements. Features multiple subtitle options and fast loading speeds.",
  "rating": 9.5,
  "status": "Active",
  "features": [
    "HD Quality",
    "No Ads",
    "Fast Servers",
    "Multiple Subtitles",
    "Download Support",
    "Mobile Friendly"
  ],
  "lastChecked": "2024-11-20",
  "speed": "Very Fast",
  "popularity": "Very High"
}
```

### **Full Example - Manga Site**

```json
{
  "name": "MangaDex",
  "url": "https://mangadex.org",
  "logo": "/Assets/Images/sites/mangadex_logo.png",
  "category": "Manga Reading",
  "description": "Largest online manga reading platform with official scanlation groups and multi-language support.",
  "rating": 9.2,
  "status": "Active",
  "features": [
    "Multiple Languages",
    "Official Scanlations",
    "No Ads",
    "Advanced Search",
    "Reading Lists"
  ],
  "lastChecked": "2024-11-19",
  "speed": "Fast",
  "popularity": "Very High"
}
```

### **Full Example - Novel Site**

```json
{
  "name": "Novel Updates",
  "url": "https://www.novelupdates.com",
  "logo": "/Assets/Images/sites/novelupdates_logo.png",
  "category": "Light Novels",
  "description": "Comprehensive database and reader for translated light novels, web novels, and original English novels.",
  "rating": 8.8,
  "status": "Active",
  "features": [
    "Large Database",
    "Translation Updates",
    "Reading Lists",
    "Forums",
    "Recommendations"
  ],
  "lastChecked": "2024-11-18",
  "speed": "Medium",
  "popularity": "High"
}
```

### **Data File Structure** (`/src/data/sites.json`)

```json
{
  "anime": [
    { /* anime site 1 */ },
    { /* anime site 2 */ }
  ],
  "manga": [
    { /* manga site 1 */ },
    { /* manga site 2 */ }
  ],
  "novels": [
    { /* novel site 1 */ },
    { /* novel site 2 */ }
  ],
  "tools": [
    { /* tool site 1 */ },
    { /* tool site 2 */ }
  ]
}
```

---

## 🎨 CUSTOMIZATION

### **Adding Custom Categories**

```jsx
// In your sites page
const customCategories = [
  'streaming',
  'download',
  'discussion',
  'news',
  'database'
];

<SiteGrid
  sites={sites}
  categories={customCategories}
  defaultCategory="streaming"
/>
```

### **Custom Status Types**

```javascript
// Extend ExternalSiteCard with custom statuses
const customStatuses = {
  'Active': { color: '#50C878', icon: <Check /> },
  'Maintenance': { color: '#FF8C00', icon: <AlertCircle /> },
  'Beta': { color: '#00BFFF', icon: <Zap /> },
  'Deprecated': { color: '#E0115F', icon: <X /> }
};
```

### **Custom Rating Display**

```javascript
// Override star rating with custom display
const renderCustomRating = (rating) => {
  if (rating >= 9.0) return '🏆 Excellent';
  if (rating >= 8.0) return '⭐ Great';
  if (rating >= 7.0) return '👍 Good';
  return '👌 Okay';
};
```

### **Custom Feature Icons**

```javascript
const featureIcons = {
  'HD Quality': '🎬',
  'No Ads': '🚫',
  'Fast Servers': '⚡',
  'Mobile Friendly': '📱',
  'Download Support': '💾'
};
```

---

## 📚 BEST PRACTICES

### **Performance**

**1. Lazy Load Logos**
```jsx
<img
  src={site.logo}
  alt={site.name}
  loading="lazy"
  onError={handleImageError}
/>
```

**2. Memoize Filtered Sites**
```javascript
const filteredSites = useMemo(() => {
  return sites.filter(/* filtering logic */);
}, [sites, searchQuery, category]);
```

**3. Debounce Search**
```javascript
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

### **SEO & Accessibility**

**1. Semantic HTML**
```jsx
<nav aria-label="Site categories">
  <button aria-pressed={selected}>Category</button>
</nav>
```

**2. Image Alt Text**
```jsx
<img
  src={logo}
  alt={`${siteName} logo`}
  role="img"
/>
```

**3. External Link Indicators**
```jsx
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`Visit ${name} (opens in new tab)`}
>
```

### **Data Management**

**1. Validate Site Data**
```javascript
const validateSite = (site) => {
  if (!site.name || !site.url) {
    console.error('Invalid site data:', site);
    return false;
  }
  return true;
};
```

**2. Handle Missing Images**
```javascript
const [imageError, setImageError] = useState(false);

{imageError ? (
  <Globe size={32} />
) : (
  <img
    src={site.logo}
    onError={() => setImageError(true)}
  />
)}
```

**3. Cache Site Data**
```javascript
// Cache for 1 hour
const CACHE_KEY = 'sites-cache';
const CACHE_DURATION = 3600000;

const loadSites = async () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const fresh = await fetchSites();
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: fresh,
    timestamp: Date.now()
  }));
  return fresh;
};
```

### **Analytics**

**1. Track Popular Sites**
```javascript
const getMostVisitedSites = () => {
  const visits = JSON.parse(localStorage.getItem('site-visits') || '{}');
  return Object.entries(visits)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
};
```

**2. Track Category Preferences**
```javascript
const trackCategoryView = (category) => {
  const views = JSON.parse(localStorage.getItem('category-views') || '{}');
  views[category] = (views[category] || 0) + 1;
  localStorage.setItem('category-views', JSON.stringify(views));
};
```

**3. Export Analytics**
```javascript
const exportAnalytics = () => {
  const data = {
    visits: localStorage.getItem('site-visits'),
    categoryViews: localStorage.getItem('category-views'),
    timestamp: Date.now()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site-analytics.json';
  a.click();
};
```

---

## 🔧 TROUBLESHOOTING

### **Images Not Loading**

**Problem:** Site logos not displaying  
**Solution:**
1. Check image path is correct
2. Verify image exists in `/public/Assets/Images/sites/`
3. Check browser console for 404 errors
4. Ensure fallback Globe icon appears

```javascript
// Debug image loading
<img
  src={site.logo}
  onLoad={() => console.log('Image loaded:', site.name)}
  onError={(e) => console.error('Image failed:', site.name, e)}
/>
```

### **Sites Not Filtering**

**Problem:** Category filter not working  
**Solution:**
1. Check category names match exactly (case-sensitive)
2. Verify `site.category` field exists
3. Check filter logic in useMemo
4. Console.log filtered results

```javascript
// Debug filtering
console.log('Selected category:', selectedCategory);
console.log('Sites with category:', sites.filter(s => s.category === selectedCategory));
```

### **Search Not Working**

**Problem:** Search returns no results  
**Solution:**
1. Check searchQuery state is updating
2. Verify search logic includes all fields
3. Test with lowercase conversion
4. Check for special characters

```javascript
// Debug search
console.log('Search query:', searchQuery);
console.log('Filtered results:', filteredSites.length);
```

### **LocalStorage Issues**

**Problem:** Preferences not persisting  
**Solution:**
1. Check browser allows LocalStorage
2. Verify key names are correct
3. Test JSON parse/stringify
4. Check for quota exceeded errors

```javascript
// Debug LocalStorage
try {
  localStorage.setItem('test', 'value');
  console.log('LocalStorage working');
} catch (e) {
  console.error('LocalStorage blocked:', e);
}
```

---

## ✅ CHECKLIST

Before deploying:

- [ ] All site data validated
- [ ] Images uploaded to correct folder
- [ ] Fallback icons working
- [ ] Categories defined correctly
- [ ] Search functionality tested
- [ ] Filters working properly
- [ ] Sort options functional
- [ ] View modes switching correctly
- [ ] Mobile responsive
- [ ] External links open in new tabs
- [ ] Security attributes present (noopener, noreferrer)
- [ ] Analytics tracking implemented
- [ ] LocalStorage functioning
- [ ] Empty states handled
- [ ] Loading states present
- [ ] Error handling implemented
- [ ] Accessibility tested

---

## 🚀 ADVANCED FEATURES

### **Site Health Monitoring**

```javascript
const checkSiteStatus = async (url) => {
  try {
    const response = await fetch(`/api/check-site?url=${url}`);
    return response.ok ? 'Active' : 'Down';
  } catch {
    return 'Unknown';
  }
};
```

### **Auto-Update Site Data**

```javascript
const updateSiteData = async () => {
  const sites = await fetch('/api/sites/latest').then(r => r.json());
  localStorage.setItem('sites-cache', JSON.stringify(sites));
  setSites(sites);
};

// Update every hour
useEffect(() => {
  const interval = setInterval(updateSiteData, 3600000);
  return () => clearInterval(interval);
}, []);
```

### **User Site Suggestions**

```javascript
const submitSiteSuggestion = async (siteData) => {
  await fetch('/api/sites/suggest', {
    method: 'POST',
    body: JSON.stringify(siteData)
  });
  notify.success('Thank you for your suggestion!');
};
```

---

**END OF SITE COMPONENTS GUIDE**

**Related Guide:** [← E-Book Components Guide](./EBOOK_COMPONENTS_GUIDE.md)