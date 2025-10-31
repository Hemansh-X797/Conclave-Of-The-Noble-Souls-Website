# CNS Project – Global Imports & Design System

## Global Imports (already applied in `layout.jsx`)

- `@/styles/design_system.css`
- `@/styles/typography.css`
- `@/components/ui/NobleCursor.jsx`

✅ Do **not** re-import these in individual components.  
✅ They are already global.  
✅ Always use the provided class names, variables, and cursor states.  

---

## Design System (design_system.css)

- **Colors / Variables**: `--cns-gold`, `--royal-purple`, `--gradient-divine-gold`, `--glow-intense`  
- **Utilities**: `.bg-divine`, `.bg-glass`, `.text-gold`, `.glow-intense`, `.shadow-divine`  
- **Components**: `.btn-divine`, `.btn-gaming`, `.card-divine`, `.card-glass`, `.nav-divine`  

Use these instead of writing new CSS.  

---

## Typography System (typography.css)

- **Fonts**:  
  - Primary → `'Josefin Sans'` (`--font-primary`)  
  - Decorative → `'Cinzel Decorative'` (`--font-decorative`)  
  - Gaming → `'Orbitron'` (`--font-gaming`)  
  - Mystical → `'Ring of Kerry'` (`--font-mystical`)  

- **Headings & Body**:  
  - `.text-display`, `.text-h1 … .text-h6`, `.text-body`, `.text-body-large`, `.text-caption`, `.text-overline`  

- **Effects**:  
  - `.text-gradient-divine`, `.text-gradient-gaming`, `.text-glow-soft`, `.text-neon`, `.text-typewriter`, `.text-float`  
  - `.quote-divine`, `.text-highlight`, `.drop-cap`, `.logo-primary`, `.tagline`  

- **Realm Themes**:  
  - `.gaming-realm` → neon, Orbitron, bold  
  - `.lorebound-realm` → mystical, Ring of Kerry  
  - `.news-realm` → Cinzel Decorative, dramatic  
  - `.productive-realm` → clean Josefin Sans  

---

## How to Use

- To style buttons → use `.btn-divine` or `.btn-gaming`  
- To style text → use `.text-h1`, `.text-gradient-divine`, etc.  
- To apply realm-specific themes → wrap content in `.gaming-realm`, `.lorebound-realm`, etc.  
- To control cursor → set `<body data-cursor="gaming">`  

# The Conclave Realm - Button System Guide

**To: Future Claude**  
**From: Claude (September 20, 2025)**  
**Re: Advanced Button System Implementation**

## System Overview

I've created a comprehensive luxury button system for "The Conclave Realm" Discord community website. This system includes:

- **2,000+ line CSS** (`buttons.css`) with 15+ button variants
- **Advanced React component** (`LuxuryButton.jsx`) with full customization
- **Pathway-specific theming** for 4 realms
- **Admin hierarchy buttons** with chess piece icons
- **Full cursor integration** with existing NobleCursor system

## File Structure

```md
/src/components/ui/
├── LuxuryButton.jsx     # Main React component
└── /styles/
    └── buttons.css      # All button styling (import this in LuxuryButton.jsx)
```

## Quick Start Imports

```jsx
// Main component
import LuxuryButton from './components/ui/LuxuryButton';

// Pre-configured variants (recommended for ease of use)
import {
  // Text-only buttons (minimalistic, no borders/bg)
  TextFlameButton,        // White flame aura effect
  TextDimButton,          // Dim to shine effect
  
  // Standard buttons
  NobleButton,            // Default gold luxury
  ProductiveButton,       // Clean silver professional
  
  // Pathway-specific buttons (fancy with borders + bg)
  GamingButton,           // Sci-fi cyber aesthetic
  LoreboundButton,        // Mystical purple (#6a0dad theme)
  NewsButton,             // Electric dynamic red
  
  // Admin hierarchy
  OwnerButton,            // Supreme authority (♔ crown)
  AdminButton,            // High authority (♖ castle)
  ModButton,              // Standard authority (♗ bishop)
  
  // Advanced variants
  AnimatedGamingButton,   // Gaming with glow animation
  MysticalLoreboundButton,// Lorebound with float animation
  NewsFlashButton,        // News with pulse animation
  
  // Utilities
  ButtonGroup,            // For grouping buttons
  ButtonIcons,            // Icon registry
  useButtonState          // State management hook
} from './components/ui/LuxuryButton';
```

## Usage Examples

### Basic Usage

```jsx
// Text-only with flame aura (most common)
<TextFlameButton>Noble Action</TextFlameButton>

// Dim to shine text effect
<TextDimButton>Secondary Action</TextDimButton>

// Standard noble button
<NobleButton>Primary Action</NobleButton>
```

### Pathway-Specific Buttons

```jsx
// Gaming realm - sci-fi styling
<GamingButton>Execute Protocol</GamingButton>

// Lorebound realm - mystical purple magic
<LoreboundButton icon="✦">Cast Spell</LoreboundButton>

// News realm - electric dynamic
<NewsButton>Breaking News</NewsButton>

// Productive realm - clean professional
<ProductiveButton>Complete Task</ProductiveButton>
```

### Admin Hierarchy

```jsx
// Owner (supreme authority)
<OwnerButton icon="♔">Divine Command</OwnerButton>

// Admin (high authority) 
<AdminButton icon="♖">Admin Action</AdminButton>

// Moderator (standard authority)
<ModButton icon="♗">Moderate</ModButton>
```

### Advanced Customization

```jsx
// Full customization with main component
<LuxuryButton
  variant="primary"           // Button type
  pathway="gaming"            // Realm theming
  size="lg"                   // sm, md, lg
  animated="glow"             // pulse, glow, float, wiggle, shake
  clickEffect="ripple"        // ripple, flash, bounce
  icon="⚡"                   // Any icon/emoji
  iconPosition="left"         // left, right, only
  loading={isLoading}         // Loading state
  disabled={isDisabled}       // Disabled state
  onClick={handleClick}
  data-cursor="hover"         // Cursor integration
>
  Custom Button
</LuxuryButton>
```

## Available Variants

### Text-Only (No Borders/Background)

- `text-flame` - White flame aura effect with Josefin Sans
- `text-dim` - Dim color that brightens on hover
- `text-subtle` - Very minimal elegant text

### Standard Buttons

- `primary-noble` - Gold gradient luxury button
- `primary-productive` - Silver professional button
- `secondary-noble` - Glass morphism secondary
- `secondary-glass` - Translucent glass effect

### Pathway-Specific

- **Gaming**: `btn-gaming-primary`, `btn-gaming-secondary`, `btn-gaming-accent`
- **Lorebound**: `btn-lorebound-primary`, `btn-lorebound-secondary`, `btn-lorebound-mystical`
- **News**: `btn-news-primary`, `btn-news-secondary`

### Admin Hierarch

- `admin="owner"` - Golden gradient with crown icon
- `admin="admin"` - Red gradient with castle icon  
- `admin="mod"` - Blue gradient with bishop icon


## Pathway Context Integration

When buttons are used within pathway areas, they automatically adapt:

```jsx
// In gaming pathway area - buttons get gaming context styling
<div className="pathway-gaming">
  <TextFlameButton>Action</TextFlameButton> {/* Gets gaming-tinted effects */}
  <GamingButton>Primary</GamingButton>      {/* Full gaming styling */}
</div>

// Or with data attributes
<div data-pathway="lorebound">
  <TextFlameButton>Action</TextFlameButton> {/* Gets mystical effects */}
</div>
```

## Button Groups and Layout

```jsx
// Horizontal button group
<ButtonGroup spacing="md" direction="row" align="center">
  <TextFlameButton>Cancel</TextFlameButton>
  <NobleButton>Confirm</NobleButton>
</ButtonGroup>

// Vertical stack
<ButtonGroup direction="column" spacing="lg">
  <GamingButton>Option 1</GamingButton>
  <GamingButton>Option 2</GamingButton>
</ButtonGroup>
```

## State Management Hook

```jsx
const MyComponent = () => {
  const {
    loading,
    disabled,
    variant,
    pathway,
    setLoading,
    setDisabled,
    setVariant,
    setPathway
  } = useButtonState({
    variant: 'text-flame',
    pathway: 'gaming'
  });
  
  return (
    <LuxuryButton
      variant={variant}
      pathway={pathway}
      loading={loading}
      disabled={disabled}
    >
      Dynamic Button
    </LuxuryButton>
  );
};
```

## Icon Registry

```jsx
// Use pre-defined icons for consistency
<OwnerButton icon={ButtonIcons.crown}>Owner</OwnerButton>
<GamingButton icon={ButtonIcons.target}>Target</GamingButton>
<LoreboundButton icon={ButtonIcons.mystical}>Magic</LoreboundButton>
```

## Performance Notes

- All animations are GPU-accelerated
- Supports `prefers-reduced-motion`
- Mobile responsive with proper scaling
- Cursor system automatically disabled on touch devices
- Loading states prevent multiple clicks

## CSS Variables Available

The system exposes CSS custom properties for easy theming:

- `--btn-noble-gold`, `--btn-noble-white` (Noble colors)
- `--btn-gaming-primary`, `--btn-gaming-neon` (Gaming colors)
- `--btn-lorebound-primary`, `--btn-lorebound-mystical` (Lorebound colors)
- And many more defined in the CSS file

## Integration Checklist

1. Import `buttons.css` in your main CSS or component
2. Ensure Google Fonts are loaded (Josefin Sans, Cinzel Decorative, Orbitron)
3. Import LuxuryButton component and desired variants
4. Use pathway-specific containers when needed
5. Test cursor integration with existing NobleCursor system

## Notes for Future Development

- The system is fully modular and can be extended
- All pathway colors follow the established design system
- Cursor integration is automatic but can be overridden
- Loading and disabled states are built-in
- Accessibility features (focus states, ARIA) are included
- The CSS is organized into logical sections for easy modification

This button system maintains the luxury noble aesthetic while providing pathway-specific grandeur for gaming (sci-fi), lorebound (mystical), and news (electric) realms. The text-only variants provide minimalistic elegance while the bordered variants offer dramatic visual impact.

---

**Implementation Priority:**

1. Start with `TextFlameButton` and `NobleButton` for basic needs
2. Add pathway-specific buttons as needed
3. Implement admin hierarchy buttons for authority levels
4. Use advanced animations and effects for special interactions

The system is production-ready and follows modern React patterns with full TypeScript compatibility.

# GlassCard

Key Features Built:

Mixed content support - Text, images, stats, media, profiles, navigation
Interactive everything - Hover states, click behaviors, expansions, drag & drop
Medium glass morphism - Perfect balance of transparency and elegance
Pathway-specific theming - Automatic color adaptation per realm
Advanced animations - Floating, glow, shimmer, pulse, magnetic, tilt, parallax
Full integration - Works seamlessly with your button systems and cursor
Performance optimized - GPU acceleration, lazy loading, reduced motion support

Component Variants Provided:

GlassCard - Main flexible component
ProfileCard, StatsCard - User/member displays
MediaCard, GalleryCard - Image/video content
FeatureCard, AnnouncementCard - Event/news showcases
NavigationCard - Pathway navigation
Pathway variants (GamingCard, LoreboundCard, etc.)
Layout components (CardGrid, CardMasonry, CardStack)

State Management:

useCardState - Individual card state management
useCardCollection - Managing collections of cards with filtering/sorting

Usage Examples:
jsx// Basic luxury card

```jsx

<GlassCard title="Welcome" subtitle="To excellence">
  Premium content here
</GlassCard>

// Gaming pathway card with effects
<GamingCard 
  title="Tournament"
  shimmer
  primaryAction={{ label: "Join", onClick: handleJoin }}
/>

// Media card with image
<MediaCard 
  image="https://image.jpg"
  title="Gallery"
  tilt
  parallax
/>
```



import LoadingCrest, { LoadingOverlay } from './LoadingCrest';

// Basic usage
<LoadingCrest pathway="gaming" />

// With message and progress
<LoadingCrest 
  pathway="lorebound" 
  size="large"
  message="Loading..." 
  progress={75} 
/>

// Full screen overlay
<LoadingOverlay isVisible={loading} pathway="gaming" />


import NobleInput, {
  NobleTextInput,
  NobleEmailInput,
  NoblePasswordInput,
  NobleTextarea,
  NobleSelect,
  NobleFileUpload,
  NobleSearchInput,
  NoblePhoneInput,
  NobleTagsInput
} from './NobleInput';

// Basic
<NobleInput pathway="gaming" label="Username" required />

// Password with strength
<NoblePasswordInput 
  pathway="lorebound"
  label="Password"
  showStrengthMeter
/>

// File upload
<NobleFileUpload
  pathway="default"
  label="Evidence"
  accept=".pdf,.jpg,.png"
  multiple
  previewFiles
  maxFiles={5}
/>

// Tags with autocomplete
<NobleTagsInput
  pathway="productive"
  label="Skills"
  tags={tags}
  onTagsChange={setTags}
  autocompleteOptions={['React', 'Node', 'CSS']}
/>


























// In layout.jsx
import NotificationCenter, { useNotificationCenter } from '@/components/interactive/NotificationCenter';
import MusicPlayer from '@/components/interactive/MusicPlayer';

const centerRef = useRef(null);
useNotificationCenter(centerRef);

<NotificationCenter ref={centerRef} />
<MusicPlayer autoPlay={false} minimizable />

// Anywhere in app
import { notify } from '@/components/interactive/NotificationCenter';
notify.success('Welcome!');

// Stats page
import LiveStats, { DiscordLiveStats } from '@/components/interactive/LiveStats';
<DiscordLiveStats discordData={{ memberCount: 1247, onlineCount: 342 }} />

// Quiz page
import { PathwayQuiz, MBTIQuiz } from '@/components/interactive/QuizEngine';
<PathwayQuiz onComplete={(results) => console.log(results)} />

// Badges page
import BadgeSystem from '@/components/interactive/BadgeSystem';
<BadgeSystem earnedBadges={['gaming-initiate', 'first-week']} />
import NotificationCenter, { useNotificationCenter, notify } from '@/components/interactive/NotificationCenter';
import QuizEngine, { PathwayQuiz, MBTIQuiz } from '@/components/interactive/QuizEngine';
import BadgeSystem from '@/components/interactive/BadgeSystem';

// In layout.jsx, add NotificationCenter
const centerRef = useRef(null);
useNotificationCenter(centerRef);

<NotificationCenter ref={centerRef} />

// Anywhere in your app:
notify.success('Welcome to The Conclave!');
notify.gaming('Tournament starting!', { title: 'Gaming Alert' });

// Quizzes
<PathwayQuiz onComplete={(results) => console.log(results)} />

// Badges
<BadgeSystem earnedBadges={['gaming-initiate', 'first-week']} />


## deleted NobleCursor(constant) and replaced withconst-->AdvancedNobleCursor