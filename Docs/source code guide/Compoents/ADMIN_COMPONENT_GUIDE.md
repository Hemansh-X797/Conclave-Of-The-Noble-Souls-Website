# The Conclave Realm - Admin Components Guide

**Version:** 1.0  
**Last Updated:** December 2024  
**Luxury-tier administrative system for noble server management**

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [AnalyticsDash.jsx](#analyticsdash)
4. [MemberManager.jsx](#membermanager)
5. [ContentManager.jsx](#contentmanager)
6. [EventCreator.jsx](#eventcreator)
7. [Integration Guide](#integration-guide)
8. [API Requirements](#api-requirements)
9. [Permission System](#permission-system)
10. [Best Practices](#best-practices)

---

## Overview

The Admin Components system provides a **luxury, permission-aware** administrative interface for managing The Conclave Realm Discord server. Built with:

- ✨ **Luxury Design** - Rolls-Royce inspired aesthetics
- 🔐 **Role-Based Access** - Owner/Admin/Moderator hierarchies
- 🎨 **Pathway Theming** - Gaming, Lorebound, Productive, News styling
- ⚡ **Real-Time Data** - Live stats and updates
- 📱 **Fully Responsive** - Works on all devices
- ♿ **Accessible** - WCAG compliant with reduced motion support

---

## Component Architecture

### File Structure

```py
/src/components/admin/
├── AnalyticsDash.jsx      # Dashboard & analytics
├── MemberManager.jsx       # Member oversight
├── ContentManager.jsx      # Content creation
└── EventCreator.jsx        # Event management
```

### Shared Dependencies

All components use:

- `GlassCard` system for UI elements
- `LuxuryButton` variants for actions
- `NobleInput` for forms
- `LoadingCrest` for loading states
- Permission system from `/constants/permissions.js`

---

## AnalyticsDash

### Purpose

Central analytics dashboard showing real-time server metrics, member activity, pathway stats, and moderation overview.

### Features

- 📊 **Server Overview** - Total members, online count, messages
- 🎮 **Pathway Analytics** - Activity tracking per pathway
- 🛡️ **Moderation Stats** - Bans, kicks, warnings, timeouts
- 💬 **Engagement Metrics** - Messages/hour, voice activity, events
- 👑 **Top Members** - Most active community members
- 📝 **Activity Feed** - Real-time server activity log

### Props

```jsx
<AnalyticsDash 
  user={userData}           // Current user object
  userRoles={['roleId1']}   // Array of user's role IDs
  className="custom-class"  // Optional styling
/>
```

### Permission Requirements

- `PERMISSIONS.VIEW_ANALYTICS` - View dashboard
- `PERMISSION_LEVELS.MODERATOR` - See moderation stats
- `isStaff()` - Access any admin panel

### Usage Example

```jsx
import AnalyticsDash from '@/components/admin/AnalyticsDash';

export default function AdminDashboard({ user }) {
  return (
    <div>
      <AnalyticsDash 
        user={user}
        userRoles={user.roles}
      />
    </div>
  );
}
```

### Time Range Selection

- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Last 90 Days
- All Time

### Auto-Refresh

Automatically refreshes data every **5 minutes**.

---

## MemberManager

### Purpose--

Comprehensive member oversight and moderation tools for managing server members.

### Features--

- 👥 **Member List** - Searchable, filterable member database
- 🔍 **Advanced Filtering** - By role, pathway, status, activity
- 🛡️ **Moderation Actions** - Ban, kick, timeout, warn
- 🎭 **Role Management** - Add/remove roles from members
- 📊 **Member Stats** - XP, level, messages, reputation
- 📋 **Bulk Actions** - Manage multiple members at once
- 🔒 **Permission Checks** - Can't moderate higher-ranked users

### Props-

```jsx
<MemberManager
  user={userData}
  userRoles={['roleId1']}
  className="custom-class"
/>
```

### Permission Requirements-

- `PERMISSIONS.MANAGE_MEMBERS` - Basic access
- `PERMISSIONS.BAN_MEMBERS` - Ban functionality
- `PERMISSIONS.KICK_MEMBERS` - Kick functionality
- `PERMISSIONS.TIMEOUT_MEMBERS` - Timeout functionality
- `canModerate(actorRoles, targetRoles)` - Action verification

### Moderation Actions

#### Timeout

```jsx
// Duration options:
- 1 minute
- 5 minutes
- 10 minutes
- 1 hour
- 1 day
- 1 week
```

#### Ban/Kick

- Requires reason (mandatory)
- Logs action to mod logs
- Notifies user via DM (if enabled)
- Updates Discord server roles

### Filtering Options

- **Search**: Username, discriminator, ID
- **Role Filter**: Owner, Admin, Mod, VIP, Member
- **Pathway Filter**: Gaming, Lorebound, Productive, News
- **Status Filter**: Online, Offline, Banned
- **Sort By**: Join date, username, level, messages

### Bulk Actions

Select multiple members to:

- Add/remove roles
- Send announcements
- Export data
- Mass timeout (admin only)

---

## ContentManager

### Purpose---

Create, edit, and publish rich content including announcements, articles, news, and galleries.

### Features---

- ✍️ **Rich Content Editor** - Full-featured content creation
- 📝 **Multiple Content Types** - Announcements, events, news, articles, galleries
- 🖼️ **Media Upload** - Images and videos with preview
- 🏷️ **Tag System** - Autocomplete tags for discoverability
- 📅 **Scheduling** - Publish at specific times
- 👁️ **Visibility Control** - Public, members, VIP, staff
- 🎨 **Pathway Theming** - Automatic styling per pathway
- 📊 **Content Stats** - Views, likes, comments tracking

### Props:-

```jsx
<ContentManager
  user={userData}
  userRoles={['roleId1']}
  className="custom-class"
/>
```

### Permission Requirements:-

- `PERMISSIONS.MANAGE_CONTENT` - Required for access

### Content Types

#### 📢 Announcement

Short, important server-wide messages.

#### 📅 Event

Linked to event system (use EventCreator for full features).

#### 📰 News Article

Long-form news content for News pathway.

#### 📝 Long Article

In-depth guides, tutorials, lore posts.

#### 🖼️ Gallery

Image/video collections with captions.

### Editor Features

#### Basic Information

- Title (max 100 chars)
- Subtitle (optional, max 150 chars)
- Description (max 300 chars)
- Content (markdown supported, min 50 chars)

#### Publishing Options

- **Status**: Draft, Scheduled, Published
- **Visibility**: Public, Members, VIP, Staff
- **Featured**: Star content on homepage
- **Allow Comments**: Enable/disable discussions

#### Media Management

- Upload multiple images/videos
- Drag-and-drop reordering
- Individual media removal
- Thumbnail selection
- Max 10 files per content

#### Tags

- Autocomplete suggestions
- Custom tags allowed
- Improves searchability
- Filters content by category

### Workflow

1. **Create** → Fill form → Save as draft
2. **Review** → Preview content → Make edits
3. **Publish** → Set visibility → Publish now or schedule
4. **Monitor** → Check stats → Respond to comments

---

## EventCreator

### Purpose-

Full-featured event management system for tournaments, workshops, movie nights, and community gatherings.

### Features-

- 📅 **Event Calendar** - Visual calendar view
- 🎫 **Registration System** - Capacity limits and waitlists
- ⏰ **Scheduling** - Date, time, timezone, recurring events
- 🏆 **Rewards System** - Prizes for winners and participants
- 🎯 **Event Types** - Tournament, Movie Night, Discussion, Workshop, Competition
- 📍 **Location Options** - Discord, Voice, External, Hybrid
- 🔔 **Reminders** - Automated notifications before events
- 📊 **Attendance Tracking** - Registration and attendance stats

### Props:--

```jsx
<EventCreator
  user={userData}
  userRoles={['roleId1']}
  className="custom-class"
/>
```

### Permission Requirements:--

- `PERMISSIONS.CREATE_EVENTS` - Create events
- `PERMISSIONS.MANAGE_EVENTS` - Edit/delete any event

### Event Types & Icons

| Type | Icon | Use Case |
|------|------|----------|
| Tournament | 🏆 | Gaming competitions |
| Movie Night | 🎬 | Watch parties |
| Discussion | 💬 | Community talks |
| Workshop | 🎓 | Learning sessions |
| Competition | ⚔️ | Challenges |
| Custom | ✨ | Anything else |

### Event Configuration

#### Basic Information-

- Title (required)
- Description (required)
- Event type
- Pathway theming
- Location (Discord/Voice/External/Hybrid)

#### Schedule

- Start date & time (required)
- End date & time (required)
- Timezone selection
- Recurring events option
  - Frequency: Daily, Weekly, Monthly
  - Interval: Every X days/weeks/months
  - End after: Number of occurrences

#### Registration

- Require registration toggle
- Registration deadline
- Max participants (0 = unlimited)
- Allow waitlist
- Auto-promote from waitlist

#### Visibility & Access

- Public (everyone)
- Members only
- VIP only
- Pathway-specific
- Staff only

#### Rewards & Prizes

- Enable rewards toggle
- 🥇 First place prize
- 🥈 Second place prize
- 🥉 Third place prize
- 🎖️ Participation rewards

#### Additional Details

- Event rules
- Requirements (what to bring)
- External links
- Tags for categorization

### View Modes

#### Calendar View

- Events grouped by month
- Visual timeline
- Quick date reference

#### List View

- All events in cards
- Detailed information
- Bulk actions available

### Event Status

| Status | Description |
|--------|-------------|
| Draft | Not published yet |
| Scheduled | Published but not started |
| Live | Currently happening |
| Completed | Event finished |
| Cancelled | Event cancelled |

### Discord Integration

Events automatically create Discord scheduled events when published.

---

## Integration Guide

### Step 1: Add to Routes

```jsx
// /src/app/admin/analytics/page.jsx
import AnalyticsDash from '@/components/admin/AnalyticsDash';
import { getServerSession } from 'next-auth';

export default async function AnalyticsPage() {
  const session = await getServerSession();
  
  return (
    <AnalyticsDash 
      user={session.user}
      userRoles={session.user.roles}
    />
  );
}
```

### Step 2: Navigation Integration

```jsx
// In your Navbar.jsx
const adminLinks = [
  { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { href: '/admin/members', label: 'Members', icon: '👥' },
  { href: '/admin/content', label: 'Content', icon: '✍️' },
  { href: '/admin/events', label: 'Events', icon: '📅' }
];

// Only show if user has permissions
{isStaff(userRoles) && (
  <div className="admin-section">
    {adminLinks.map(link => (
      <Link key={link.href} href={link.href}>
        {link.icon} {link.label}
      </Link>
    ))}
  </div>
)}
```

### Step 3: Layout Wrapper (Optional)

```jsx
// /src/app/admin/layout.jsx
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
```

---

## API Requirements

All components require these API endpoints:

### Analytics Dashboard

```sql
GET /api/discord/stats?timeRange={timeRange}
Response: {
  memberCount, activeMembers, newMembers, onlineCount,
  messageCount, eventCount, growth, pathways, moderation,
  engagement, recentActivity
}

GET /api/discord/members?detailed=true
Response: {
  members: [{ id, username, level, messageCount, ... }]
}
```

### Member Manager

```sql
GET /api/discord/members?detailed=true&includeRoles=true
Response: {
  members: [{ id, username, roles, status, ... }]
}

POST /api/admin/moderation
Body: { action, memberId, reason, duration, moderatorId }
Response: { success, updates }

POST /api/admin/roles
Body: { memberId, roleId, action, moderatorId }
Response: { success }

POST /api/admin/bulk-action
Body: { action, memberIds, moderatorId }
Response: { success, results }
```

### Content Manager

```sql
GET /api/admin/content?includeStats=true
Response: {
  contents: [{ id, title, type, status, views, ... }]
}

POST /api/admin/content
Body: { ...formData }
Response: { ...savedContent }

PUT /api/admin/content/:id
Body: { ...formData }
Response: { ...updatedContent }

DELETE /api/admin/content/:id
Response: { success }

POST /api/admin/upload
Body: FormData with file
Response: { url, type, name, size }
```

### Event Creator

```sql
GET /api/admin/events?includeStats=true
Response: {
  events: [{ id, title, startDate, registeredCount, ... }]
}

POST /api/admin/events
Body: { ...formData }
Response: { ...savedEvent }

PUT /api/admin/events/:id
Body: { ...formData }
Response: { ...updatedEvent }

DELETE /api/admin/events/:id
Response: { success }

POST /api/admin/events/:id/cancel
Body: { reason }
Response: { success }

POST /api/discord/create-event
Body: { eventId }
Response: { discordEventId }
```

---

## Permission System

### Role Hierarchy (High to Low)

```javascript
OWNER (100)           // Supreme authority
BOARD (90)            // Board of Directors
HEAD_ADMIN (80)       // Head Administrator
ADMIN (70)            // Administrator
HEAD_MOD (60)         // Head Moderator
MODERATOR (50)        // Moderator
VIP (40)              // VIP Members
MEMBER (10)           // Noble Soul
GUEST (0)             // Not logged in
```

### Permission Checks

```javascript
// Check single permission
hasPermission(userRoles, PERMISSIONS.VIEW_ANALYTICS)

// Check any of multiple permissions
hasAnyPermission(userRoles, [PERMISSIONS.BAN_MEMBERS, PERMISSIONS.KICK_MEMBERS])

// Check all permissions
hasAllPermissions(userRoles, [PERMISSIONS.MANAGE_CONTENT, PERMISSIONS.CREATE_EVENTS])

// Check if can moderate target
canModerate(actorRoles, targetRoles) // Actor level > Target level

// Check if staff
isStaff(userRoles)

// Get permission level
getPermissionLevel(userRoles) // Returns number 0-100
```

### Component-Specific Permissions

| Component | Required Permissions |
|-----------|---------------------|
| AnalyticsDash | `VIEW_ANALYTICS` |
| MemberManager | `MANAGE_MEMBERS`, `BAN_MEMBERS`, or `KICK_MEMBERS` |
| ContentManager | `MANAGE_CONTENT` |
| EventCreator | `CREATE_EVENTS` or `MANAGE_EVENTS` |

---

## Best Practices

### 1. Always Check Permissions

```jsx
// Before rendering admin component
if (!hasPermission(userRoles, PERMISSIONS.VIEW_ANALYTICS)) {
  return <AccessDenied />;
}
```

### 2. Handle Loading States

```jsx
// Show loading indicator
if (loading) {
  return <LoadingCrest pathway="default" size="large" />;
}
```

### 3. Provide User Feedback

```jsx
// Success
alert('Content published successfully!');

// Error
alert(`Failed to save: ${error.message}`);

// Confirmation
const confirmed = confirm('Are you sure you want to delete this?');
```

### 4. Validate Forms

```jsx
// Always validate before submission
const validateForm = () => {
  const errors = {};
  if (!formData.title.trim()) errors.title = 'Title is required';
  return Object.keys(errors).length === 0;
};
```

### 5. Use Pathway Theming

```jsx
// Components adapt to pathway
<GlassCard pathway="gaming" shimmer>
  <GamingButton>Execute</GamingButton>
</GlassCard>
```

### 6. Implement Auto-Save (Drafts)

```jsx
// Save draft every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (formData.title && formData.description) {
      handleSave(false); // Save as draft
    }
  }, 30000);
  return () => clearInterval(interval);
}, [formData]);
```

### 7. Log Admin Actions

```jsx
// Log all moderation actions
await fetch('/api/admin/log', {
  method: 'POST',
  body: JSON.stringify({
    action: 'member_ban',
    actor: user.id,
    target: member.id,
    reason: reason,
    timestamp: new Date()
  })
});
```

### 8. Use Optimistic Updates

```jsx
// Update UI immediately, then sync with server
setMembers(prev => prev.filter(m => m.id !== memberId));
await fetch(`/api/admin/members/${memberId}`, { method: 'DELETE' });
```

---

## Styling & Customization

### CSS Variables

```css
/* Available for theming */
--cns-gold: #D4AF37;
--royal-purple: #8A2BE2;
--noble-white: #FFFFFF;
--noble-black: #0A0A0A;

/* Pathway colors */
--gaming-primary: #00BFFF;
--lorebound-primary: #FF1493;
--productive-primary: #50C878;
--news-primary: #E0115F;
```

### Custom Classes

```jsx
// Add custom styling
<AnalyticsDash className="my-custom-dashboard" />
```

```css
/* Your custom styles */
.my-custom-dashboard {
  padding: 3rem;
  max-width: 1800px;
}
```

---

## Troubleshooting

### Component Not Rendering

**Check:**

1. User has required permissions
2. API endpoints are returning data
3. Environment variables are set
4. User is authenticated

### Permission Denied

**Solutions:**

- Verify user roles in session
- Check role IDs match `/constants/roles.js`
- Ensure permission checks are correct
- Test with owner account first

### Data Not Loading

**Debug:**

```jsx
console.log('Fetching from:', apiUrl);
console.log('User roles:', userRoles);
console.log('Response\
