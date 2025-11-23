# PATHWAY LAYOUT SPECIFICATIONS
**Date:** November 17, 2024
**Decided By:** Noble One
**Status:** APPROVED - Build according to these specs

## Requirements Summary

### 1. Breadcrumbs
- **Location:** Top-right corner
- **Display:** Subpages only (NOT main pathway pages)
- **Style:** Minimal, small font (0.875rem)
- **Mobile:** Top-left, even smaller (0.75rem)

### 2. Pathway Switcher
- **Desktop:** Floating button bottom-right, expands to menu
- **Mobile:** Bottom nav bar (iOS-style) with 5 icons
- **Features:** Always visible, current pathway highlighted

### 3. Background Effects
- **Intensity:** Very subtle (5% color tint maximum)
- **NO particles** (video backgrounds are primary)
- **Just:** Gentle color tint + edge ambient glow

### 4. Join Button
- **Location:** Inside hero section (part of PathwayHero)
- **Display:** Main pathway pages only, if not joined
- **Style:** Large, prominent, fades after joining

### 5. Stats Display
- **Main pathway pages:** Minimal stats in hero (members, active now)
- **Subpages:** No stats
- **Full stats:** Dedicated `/pathways/stats` page (future)

### 6. Typography
- **Ring of Kerry:** ONLY Lorebound h1/h2 headings
- **Body text:** Always Josefin Sans
- **Gaming:** Orbitron for all headings
- **Others:** Josefin Sans for headings

### 7. Mobile Optimization
- Bottom nav bar with pathway icons
- Luxury design but performance-optimized
- Haptic feedback where supported

## Components to Build
1. PathwayBackground.jsx
2. Breadcrumbs.jsx
3. FloatingJoinButton.jsx
4. FloatingPathwaySwitcher.jsx
5. layout.jsx (after above 4 are done)

## Integration Notes
- Works with existing Navbar.jsx (no conflicts)
- Supports hero video backgrounds
- All components use existing UI primitives
- Zero placeholders, production-ready code