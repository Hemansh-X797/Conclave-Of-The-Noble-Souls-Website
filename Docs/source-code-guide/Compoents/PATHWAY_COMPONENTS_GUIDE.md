# 🎯 The Conclave Realm - Pathway Components Guide

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Components Built](#️-components-built)
3. [File Structure](#-file-structure)
4. [Setup Instructions](#️-setup-instructions)
5. [Component Documentation](#-component-documentation)
6. [Usage Examples](#-usage-examples)
7. [Integration with Existing Systems](#-integration-with-existing-systems)
8. [Pathway Page Templates](#-pathway-page-templates)
9. [Data Structure Requirements](#-data-structure-requirements)
10. [Troubleshooting](#-troubleshooting)
11. [Next Steps](#-next-steps)

---

## 🎯 Overview

The Pathway Components system provides **premium, interactive components** for The Conclave Realm's four pathways: **Gaming, Lorebound, Productive, and News**.

### ✅ What You Got:-

**4 Core Components (~3,040 lines total):**

- ✅ **PathwayHero.jsx** (~870 lines) - Cinematic hero sections
- ✅ **PathwayCard.jsx** (~770 lines) - Preview cards with interactions
- ✅ **PathProgress.jsx** (~720 lines) - Progress tracking system
- ✅ **PathRecommend.jsx** (~680 lines) - Smart recommendations

**Features:**

- ✨ Pathway-specific theming (uses your pathways.css)
- ✨ Premium animations (60fps GPU-accelerated)
- ✨ NobleCursor integration (automatic)
- ✨ LuxuryButton integration (all variants)
- ✨ Mobile responsive
- ✨ Loading states
- ✨ Debug modes
- ✨ Reduced motion support

---

## 🏗️ Components Built

### 1. **PathwayHero.jsx** - Cinematic Introduction

**Purpose:** Full-screen hero section for pathway landing pages

**Key Features:**

- Full viewport height (with medium/compact variants)
- Video/image backgrounds with parallax effects
- Pathway-specific visual effects:
  - **Gaming:** Glitch effects, scan lines, energy pulses
  - **Lorebound:** Floating particles, mystical glow
  - **Productive:** Grid overlay, clean lines
  - **News:** Ticker effects, breaking badges
- Animated stats display
- Dual CTA buttons
- Scroll indicator
- Breadcrumb navigation

**Variants:**

- `PathwayHero` - Main flexible component
- `GamingHero` - Gaming preset
- `LoreboundHero` - Lorebound preset
- `ProductiveHero` - Productive preset
- `NewsHero` - News preset

---

### 2. **PathwayCard.jsx** - Preview Cards

**Purpose:** Elegant cards for pathway navigation and discovery

**Key Features:**

- Multiple sizes (small, medium, large, full)
- Activity indicators (live, high, medium, quiet, growing)
- Stats display (members, posts, events)
- Badge system (new, hot, featured, updated)
- Hover effects (lift, glow, reveal)
- Image/icon support
- Click navigation

**Variants:**

- `PathwayCard` - Main component
- `GamingCard` - Gaming preset
- `LoreboundCard` - Lorebound preset
- `ProductiveCard` - Productive preset
- `NewsCard` - News preset
- `PathwayCardGrid` - Grid layout helper

---

### 3. **PathProgress.jsx** - Progress Tracking

**Purpose:** Display member progress and achievements

**Key Features:**

- Animated progress bars with XP tracking
- Level/rank system with pathway-specific titles
- Achievement badges display (up to 6 visible)
- Activity streak tracker with fire animation
- Leaderboard position display
- Next milestone preview
- Stats dashboard
- Level-up celebration effects

**Variants:**

- `PathProgress` - Main component
- `GamingProgress` - Gaming preset
- `LoreboundProgress` - Lorebound preset
- `ProductiveProgress` - Productive preset
- `NewsProgress` - News preset
- `CompactProgress` - Minimal variant

---

### 4. **PathRecommend.jsx** - Smart Recommendations

**Purpose:** Content recommendation engine

**Key Features:**

- Multiple content types (posts, events, resources, discussions, media)
- Filter system by content type
- Reason badges (trending, popular, new, personalized)
- Save/dismiss functionality
- Time ago formatting
- Loading skeleton states
- Empty state handling
- Grid/list/compact layouts

**Variants:**

- `PathRecommend` - Main component
- `GamingRecommend` - Gaming preset
- `LoreboundRecommend` - Lorebound preset
- `ProductiveRecommend` - Productive preset
- `NewsRecommend` - News preset
- `CompactRecommend` - Minimal variant

---

## 📁 File Structure

Create these files in your project:

```py
/src/components/pathway/
├── PathwayHero.jsx      # Cinematic hero component
├── PathwayCard.jsx      # Preview card component
├── PathProgress.jsx     # Progress tracking component
└── PathRecommend.jsx    # Recommendation component

/src/app/pathways/
├── layout.jsx           # Pathway-specific layout
├── /gaming/
│   ├── page.jsx         # Gaming landing page
│   ├── /tournaments/
│   ├── /leaderboards/
│   ├── /bot-help/
│   └── /game-news/
├── /lorebound/
│   ├── page.jsx         # Lorebound landing page
│   ├── /library/
│   ├── /reviews/
│   ├── /collections/
│   └── /sites/
├── /productive/
│   ├── page.jsx         # Productive landing page
│   ├── /resources/
│   ├── /challenges/
│   └── /showcase/
└── /news/
    ├── page.jsx         # News landing page
    ├── /breaking/
    ├── /science/
    ├── /tech/
    └── /analysis/
```

---

## 🛠️ Setup Instructions

### Step 1:- Create Component Files

Copy all 4 components to `/src/components/pathway/`:

- `PathwayHero.jsx`
- `PathwayCard.jsx`
- `PathProgress.jsx`
- `PathRecommend.jsx`

### Step 2:- Verify Dependencies

Ensure these exist:

- ✅ `/src/components/ui/LuxuryButton.jsx` (with named exports)
- ✅ `/src/components/ui/LoadingCrest.jsx`
- ✅ `/src/styles/pathways.css` (already exists)
- ✅ Next.js Image and Link components

### Step 3:- Create Pathway Folder Structure

```bash
mkdir -p src/app/pathways/gaming
mkdir -p src/app/pathways/lorebound
mkdir -p src/app/pathways/productive
mkdir -p src/app/pathways/news
```

### Step 4:- Test Import

```jsx
// Test in any page
import { GamingHero } from '@/components/pathway/PathwayHero';
import { GamingCard } from '@/components/pathway/PathwayCard';

export default function TestPage() {
  return (
    <>
      <GamingHero
        title="Test Gaming Realm"
        memberCount={1000}
        postCount={5000}
      />
      <GamingCard title="Test Card" />
    </>
  );
}
```

---

## 📖 Component Documentation

### **PathwayHero.jsx**

#### Props:-

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pathway` | string | `'gaming'` | Pathway theme: gaming, lorebound, productive, news |
| `title` | string | Auto | Hero title (auto-generates if not provided) |
| `subtitle` | string | Auto | Subtitle/tagline |
| `description` | string | - | Additional description text |
| `backgroundVideo` | string | - | Video URL for background |
| `backgroundImage` | string | - | Image URL for background fallback |
| `icon` | string | Auto | Emoji icon (auto per pathway) |
| `memberCount` | number | `0` | Number of members to display |
| `postCount` | number | `0` | Number of posts to display |
| `eventCount` | number | `0` | Number of events to display |
| `activityLevel` | string | `'medium'` | Activity: high, medium, low |
| `primaryButton` | object | Required | `{ text: string, href: string }` |
| `secondaryButton` | object | - | `{ text: string, href: string }` |
| `height` | string | `'full'` | Height: full, medium, compact |
| `showParticles` | boolean | `true` | Show floating particles |
| `showScrollIndicator` | boolean | `true` | Show scroll arrow |
| `showBreadcrumb` | boolean | `false` | Show breadcrumb navigation |
| `showStats` | boolean | `true` | Show stats badges |
| `autoPlayVideo` | boolean | `true` | Auto-play background video |
| `parallax` | boolean | `true` | Enable parallax effects |
| `animated` | boolean | `true` | Enable animations |
| `breadcrumbItems` | array | `[]` | Array of breadcrumb objects |
| `onPrimaryClick` | function | - | Primary button callback |
| `onSecondaryClick` | function | - | Secondary button callback |
| `debug` | boolean | `false` | Show debug info |

#### Example:-

```jsx
<PathwayHero
  pathway="gaming"
  title="Gaming Realm"
  subtitle="Where Legends Compete and Champions Rise"
  description="Join 1,250+ gamers in competitive tournaments, casual gaming sessions, and epic community events."
  
  // Background
  backgroundVideo="/videos/gaming-bg.mp4"
  backgroundImage="/images/gaming-hero.jpg"
  
  // Stats
  memberCount={1250}
  postCount={5420}
  eventCount={89}
  activityLevel="high"
  
  // Buttons
  primaryButton={{
    text: "Explore Gaming Realm",
    href: "/pathways/gaming/explore"
  }}
  secondaryButton={{
    text: "Join Discord Channel",
    href: "https://discord.gg/gaming-channel"
  }}
  
  // Options
  height="full"
  showParticles={true}
  showScrollIndicator={true}
  parallax={true}
/>
```

---

### **PathwayCard.jsx**

#### Props:--

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pathway` | string | `'gaming'` | Pathway theme |
| `title` | string | Auto | Card title |
| `description` | string | Auto | Card description |
| `tagline` | string | - | Additional tagline |
| `image` | string | - | Card image URL |
| `icon` | string | Auto | Card icon/emoji |
| `memberCount` | number | `0` | Number of members |
| `postCount` | number | `0` | Number of posts |
| `eventCount` | number | `0` | Number of events |
| `activityLevel` | string | `'medium'` | Activity level |
| `badge` | string | - | Badge type: new, hot, featured, updated |
| `customBadge` | object | - | Custom badge: `{ label, color, icon }` |
| `href` | string | - | Link destination |
| `onClick` | function | - | Click handler |
| `size` | string | `'medium'` | Size: small, medium, large, full |
| `showStats` | boolean | `true` | Show stats |
| `showActivity` | boolean | `true` | Show activity indicator |
| `showButton` | boolean | `true` | Show action button |
| `buttonText` | string | `'Enter Realm'` | Button text |
| `animated` | boolean | `true` | Enable animations |
| `hoverable` | boolean | `true` | Enable hover effects |
| `glow` | boolean | `true` | Enable glow effects |
| `featured` | boolean | `false` | Featured card styling |
| `disabled` | boolean | `false` | Disabled state |
| `debug` | boolean | `false` | Debug mode |

#### Examples:-

```jsx
// Basic
<PathwayCard
  pathway="gaming"
  title="Gaming Tournaments"
  description="Compete in weekly tournaments across multiple games"
  memberCount={342}
  activityLevel="high"
  href="/pathways/gaming/tournaments"
/>

// With badge
<PathwayCard
  pathway="lorebound"
  title="Anime Reviews"
  description="Community-driven anime and manga reviews"
  badge="hot"
  image="/images/anime-review.jpg"
  href="/pathways/lorebound/reviews"
/>

// Grid layout
<PathwayCardGrid columns={3} gap="2rem">
  <GamingCard title="Tournaments" href="/gaming/tournaments" />
  <GamingCard title="Leaderboards" href="/gaming/leaderboards" />
  <GamingCard title="Bot Help" href="/gaming/bot-help" />
</PathwayCardGrid>
```

---

### **PathProgress.jsx**

#### Props:-->

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pathway` | string | `'gaming'` | Pathway theme |
| `level` | number | `1` | Current level |
| `currentXP` | number | `0` | Current XP amount |
| `requiredXP` | number | `100` | XP needed for next level |
| `streak` | number | `0` | Activity streak in days |
| `achievements` | array | `[]` | Array of achievement IDs |
| `rank` | number | `0` | Leaderboard position |
| `totalMembers` | number | `0` | Total members for percentile |
| `contributions` | number | `0` | Number of contributions |
| `showLevel` | boolean | `true` | Show level section |
| `showStreak` | boolean | `true` | Show streak |
| `showAchievements` | boolean | `true` | Show achievements |
| `showRank` | boolean | `true` | Show leaderboard rank |
| `showMilestone` | boolean | `true` | Show next milestone |
| `showStats` | boolean | `true` | Show stats row |
| `compact` | boolean | `false` | Compact mode |
| `animated` | boolean | `true` | Enable animations |
| `celebrateLevelUp` | boolean | `false` | Trigger celebration |
| `onViewAchievements` | function | - | View achievements callback |
| `onViewLeaderboard` | function | - | View leaderboard callback |
| `debug` | boolean | `false` | Debug mode |

#### Achievement IDs Available:-

```javascript
'gaming-initiate'      // 🎮 Gaming Initiate
'tournament-winner'    // 🏆 Tournament Winner
'first-week'          // ⏰ First Week
'active-member'       // 🔥 Active Member
'helpful-soul'        // 💝 Helpful Soul
'lorebound-reader'    // 📖 Avid Reader
'productive-streak'   // ⚡ Productive Streak
'news-contributor'    // 📝 News Contributor
```

#### Example:--

```jsx
<PathProgress
  pathway="gaming"
  
  // Level & XP
  level={12}
  currentXP={750}
  requiredXP={1000}
  
  // Activity
  streak={7}
  contributions={145}
  
  // Achievements
  achievements={[
    'gaming-initiate',
    'tournament-winner',
    'first-week',
    'active-member'
  ]}
  
  // Rank
  rank={42}
  totalMembers={1250}
  
  // Callbacks
  onViewAchievements={(achievements) => {
    console.log('View achievements:-', achievements);
  }}
  onViewLeaderboard={() => {
    console.log('View leaderboard');
  }}
/>

// Compact version for sidebar
<CompactProgress
  pathway="gaming"
  level={12}
  currentXP={750}
  requiredXP={1000}
  streak={7}
/>
```

---

### **PathRecommend.jsx**

#### Props/:-

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pathway` | string | `'gaming'` | Pathway theme |
| `recommendations` | array | `[]` | Array of recommendation objects |
| `maxItems` | number | `6` | Maximum items to display |
| `showFilters` | boolean | `true` | Show content type filters |
| `showReasons` | boolean | `true` | Show recommendation reasons |
| `showActions` | boolean | `true` | Show save/dismiss buttons |
| `layout` | string | `'grid'` | Layout: grid, list, compact |
| `onDismiss` | function | - | Dismiss callback `(id) => {}` |
| `onSave` | function | - | Save callback `(id) => {}` |
| `onView` | function | - | View callback `(recommendation) => {}` |
| `isLoading` | boolean | `false` | Loading state |
| `debug` | boolean | `false` | Debug mode |

#### Recommendation Object Structure:-

```typescript
{
  id: string;                    // Unique ID
  type: 'post' | 'event' | 'resource' | 'discussion' | 'media';
  title: string;                 // Title
  description?: string;          // Description
  reason: 'trending' | 'popular' | 'new' | 'similar' | 'recommended' | 'for-you';
  image?: string;                // Image URL
  author?: string;               // Author name
  date?: string | Date;          // Post date
  engagement?: number;           // Response count
  href?: string;                 // Link destination
}
```

#### example:-

```jsx
const recommendations = [
  {
    id: '1',
    type: 'post',
    title: 'New Tournament Announcement',
    description: 'Join our monthly Valorant tournament with $500 prize pool',
    reason: 'trending',
    image: '/images/tournament.jpg',
    author: 'AdminUser',
    date: new Date('2025-10-10'),
    engagement: 45,
    href: '/pathways/gaming/tournaments/valorant-oct'
  },
  {
    id: '2',
    type: 'event',
    title: 'Game Night: Among Us',
    description: 'Community game night this Friday at 8 PM EST',
    reason: 'recommended',
    author: 'ModUser',
    date: new Date('2025-10-12'),
    engagement: 23,
    href: '/events/game-night-among-us'
  }
];

<PathRecommend
  pathway="gaming"
  recommendations={recommendations}
  maxItems={6}
  layout="grid"
  
  onDismiss={(id) => {
    console.log('Dismissed:', id);
    // Save to user preferences
  }}
  
  onSave={(id) => {
    console.log('Saved:', id);
    // Add to saved items
  }}
  
  onView={(recommendation) => {
    console.log('Viewed:', recommendation);
    // Track analytics
  }}
/>
```

---

## 💡 Usage Examples

### Example 1: Gaming Pathway Landing Page

```jsx
// /src/app/pathways/gaming/page.jsx
import { GamingHero } from '@/components/pathway/PathwayHero';
import { PathwayCardGrid, GamingCard } from '@/components/pathway/PathwayCard';
import { GamingProgress } from '@/components/pathway/PathProgress';
import { GamingRecommend } from '@/components/pathway/PathRecommend';

export default async function GamingPathway() {
  // Fetch data
  const stats = await getGamingStats();
  const userProgress = await getUserProgress('gaming');
  const recommendations = await getRecommendations('gaming');

  return (
    <div className="gaming-realm">
      {/* Hero Section */}
      <GamingHero
        title="Gaming Realm"
        subtitle="Where Legends Compete"
        memberCount={stats.memberCount}
        postCount={stats.postCount}
        eventCount={stats.eventCount}
        activityLevel="high"
        primaryButton={{
          text: "Explore Gaming",
          href: "/pathways/gaming/explore"
        }}
        secondaryButton={{
          text: "Join Tournament",
          href: "/pathways/gaming/tournaments"
        }}
        backgroundVideo="/videos/gaming-hero.mp4"
      />

      {/* Quick Navigation Cards */}
      <section className="container py-12">
        <h2 className="text-h2 mb-8">Explore Gaming</h2>
        <PathwayCardGrid columns={3}>
          <GamingCard
            title="Tournaments"
            description="Compete in weekly tournaments"
            memberCount={342}
            activityLevel="high"
            badge="hot"
            href="/pathways/gaming/tournaments"
          />
          <GamingCard
            title="Leaderboards"
            description="Track your rankings"
            memberCount={1250}
            href="/pathways/gaming/leaderboards"
          />
          <GamingCard
            title="Bot Commands"
            description="Learn bot commands"
            href="/pathways/gaming/bot-help"
          />
        </PathwayCardGrid>
      </section>

      {/* User Progress */}
      <section className="container py-12">
        <GamingProgress
          level={userProgress.level}
          currentXP={userProgress.currentXP}
          requiredXP={userProgress.requiredXP}
          streak={userProgress.streak}
          achievements={userProgress.achievements}
          rank={userProgress.rank}
          totalMembers={stats.memberCount}
        />
      </section>

      {/* Recommendations */}
      <section className="container py-12">
        <GamingRecommend
          recommendations={recommendations}
          onDismiss={handleDismiss}
          onSave={handleSave}
        />
      </section>
    </div>
  );
}
```

### Example 2: Dashboard with Multiple Pathways

```jsx
// /src/app/chambers/dashboard/page.jsx
import { CompactProgress } from '@/components/pathway/PathProgress';
import { PathwayCardGrid } from '@/components/pathway/PathwayCard';
import { CompactRecommend } from '@/components/pathway/PathRecommend';

export default async function Dashboard() {
  const userPathways = await getUserPathways();

  return (
    <div className="dashboard">
      <h1>Welcome back, {user.username}!</h1>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 gap-4">
        {userPathways.map(pathway => (
          <CompactProgress
            key={pathway.type}
            pathway={pathway.type}
            level={pathway.level}
            currentXP={pathway.currentXP}
            requiredXP={pathway.requiredXP}
            streak={pathway.streak}
          />
        ))}
      </div>

      {/* Quick Access */}
      <PathwayCardGrid columns={4}>
        <GamingCard title="Gaming" href="/pathways/gaming" size="small" />
        <LoreboundCard title="Lorebound" href="/pathways/lorebound" size="small" />
        <ProductiveCard title="Productive" href="/pathways/productive" size="small" />
        <NewsCard title="News" href="/pathways/news" size="small" />
      </PathwayCardGrid>

      {/* Recommendations */}
      <CompactRecommend
        pathway="gaming"
        recommendations={recommendations}
        maxItems={3}
      />
    </div>
  );
}
```

### Example 3: Pathway Selector Page

```jsx
// /src/app/pathways/page.jsx
import { PathwayCardGrid } from '@/components/pathway/PathwayCard';

export default function PathwaysPage() {
  return (
    <div className="pathways-selector">
      <h1 className="text-display text-center">Choose Your Path</h1>
      <p className="text-center text-body-large">
        Select a pathway to begin your journey
      </p>

      <PathwayCardGrid columns={2}>
        <PathwayCard
          pathway="gaming"
          size="large"
          memberCount={1250}
          activityLevel="high"
          href="/pathways/gaming"
        />
        <PathwayCard
          pathway="lorebound"
          size="large"
          memberCount={890}
          activityLevel="medium"
          href="/pathways/lorebound"
        />
        <PathwayCard
          pathway="productive"
          size="large"
          memberCount={645}
          activityLevel="medium"
          href="/pathways/productive"
        />
        <PathwayCard
          pathway="news"
          size="large"
          memberCount={512}
          activityLevel="high"
          badge="new"
          href="/pathways/news"
        />
      </PathwayCardGrid>
    </div>
  );
}
```

---

## 🔗 Integration with Existing Systems

### Works Automatically With:-

✅ **NobleCursor** - All components have `data-cursor` attributes
✅ **LuxuryButton** - Uses your button variants (TextFlameButton, GamingButton, etc.)
✅ **pathways.css** - Uses all pathway theming classes
✅ **design_system.css** - Uses color variables and design tokens
✅ **typography.css** - Font system (Josefin Sans, Orbitron, Ring of Kerry)

### CSS Classes Used:-

```css
/* From pathways.css */
.gaming-realm
.lorebound-realm
.productive-realm
.news-realm
.gaming-text-glow
.lorebound-text-mystical
.productive-grid
.news-flash

/* Cursor integration */
data-cursor="hover"
data-cursor="default"
data-pathway="gaming"
```

### Button Integration:-

```jsx
import {
  TextFlameButton,
  TextDimButton,
  GamingButton,
  LoreboundButton,
  ProductiveButton,
  NewsButton
} from '@/components/ui/LuxuryButton';

// PathwayHero uses pathway-specific buttons
<GamingHero /> // Uses GamingButton
<LoreboundHero /> // Uses LoreboundButton

// PathwayCard uses pathway-specific buttons
<GamingCard /> // Uses GamingButton

// You can override
<PathwayHero
  pathway="gaming"
  buttonComponent={CustomButton}
/>
```

---

## 📄 Pathway Page Templates

### Template 1: Full Pathway Landing Page

```jsx
export default function PathwayTemplate() {
  return (
    <>
      {/* 1. Hero Section - Full viewport */}
      <PathwayHero {...heroProps} />

      {/* 2. Navigation Cards */}
      <section className="container py-16">
        <h2>Explore {pathwayName}</h2>
        <PathwayCardGrid columns={3}>
          {/* Sub-section cards */}
        </PathwayCardGrid>
      </section>

      {/* 3. User Progress */}
      <section className="container py-16">
        <PathProgress {...progressProps} />
      </section>

      {/* 4. Featured Content */}
      <section className="container py-16">
        {/* Custom content section */}
      </section>

      {/* 5. Recommendations */}
      <section className="container py-16">
        <PathRecommend {...recommendProps} />
      </section>
    </>
  );
}
```

### Template 2: Compact Pathway Page

```jsx
export default function CompactPathway() {
  return (
    <>
      {/* Compact Hero */}
      <PathwayHero height="compact" {...props} />

      {/* Quick Links */}
      <PathwayCardGrid columns={4}>
        {/* Smaller cards */}
      </PathwayCardGrid>

      {/* Compact Progress */}
      <CompactProgress {...props} />
    </>
  );
}
```

---

## 📊 Data Structure Requirements

### Gaming Stats Object:-

```typescript
{
  memberCount: number;
  postCount: number;
  eventCount: number;
  activityLevel: 'high' | 'medium' | 'low';
  activeGames: string[];
  tournaments: {
    upcoming: number;
    active: number;
  };
}
```

### User Progress Object:-

```typescript
{
  pathway: 'gaming' | 'lorebound' | 'productive' | 'news';
  level: number;
  currentXP: number;
  requiredXP: number;
  streak: number;
  achievements: string[];
  rank: number;
  contributions: number;
}
```

### Recommendation Object (already documented above)

---

## 🐛 Troubleshooting

### Issue: Components not rendering

**Fix:**

```bash
# Check imports
import { GamingHero } from '@/components/pathway/PathwayHero';

# Not this:
import GamingHero from '@/components/pathway/PathwayHero';
```

### Issue: Styles not applying

**Fix:**

- Ensure `pathways.css` is imported in your layout
- Check that pathway classes are applied to parent containers
- Use browser DevTools to verify CSS is loaded

### Issue: Buttons not working

**Fix:**

- Verify LuxuryButton.jsx exports are named exports:

  ```jsx
  export const TextFlameButton = ...
  export const GamingButton = ...
  ```

### Issue: Images not loading

**Fix:**

```jsx
// Use Next.js Image component correctly
import Image from 'next/image';

<PathwayHero
  backgroundImage="/images/gaming-hero.jpg" // ✅ Correct
  backgroundImage="images/gaming-hero.jpg"  // ❌ Wrong (no leading slash)
/>
```

### Issue: Animations not smooth

**Fix:**

- Check if `prefers-reduced-motion` is enabled
- Verify GPU acceleration is working
- Use `animated={false}` prop if needed

---

## 🚀 Next Steps

### Immediate (You Can Do Now):-

1. **Create Pathway Pages:**
   - Copy template above
   - Add pathway-specific content
   - Connect to your database/API

2. **Add Data Fetching:**

   ```jsx
   // Add to page.jsx
   async function getGamingStats() {
     // Fetch from Supabase/API
   }
   ```

3. **Test Each Pathway:**
   - Visit `/pathways/gaming`
   - Visit `/pathways/lorebound`
   - Visit `/pathways/productive`
   - Visit `/pathways/news`

### Short-term (After Testing):-

1. **Add Sub-Pages:**
   - Tournaments page
   - Leaderboards page
   - Resources page
   - etc.

2. **Connect User Data:**
   - Fetch user progress from database
   - Track achievements
   - Update XP/levels

3. **Add Recommendation Logic:**
   - Algorithm to suggest content
   - User preference tracking
   - Engagement metrics

### Long-term (Polish):-

1. **Enhanced Features:**
   - Real
