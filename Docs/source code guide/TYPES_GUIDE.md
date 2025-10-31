# The Conclave Realm - Type System Guide

**Version:** 1.0.0  
**Last Updated:** October 19, 2025  
**Location:** `/src/types/`

---

## 📋 Overview

The `/src/types` folder contains TypeScript-style JSDoc type definitions and utility functions for all data structures. These provide:

- **Type safety** through JSDoc annotations
- **IntelliSense** support in VS Code
- **Runtime validators** for data validation
- **Transformers** for data manipulation

---

## 📁 Type Files

| File | Purpose | Key Types |
|------|---------|-----------|
| `user.js` | User and profile data | User, UserProfile, UserSession, StaffMember |
| `pathway.js` | Pathway and progress data | Pathway, PathwayProgress, PathwayRank |
| `event.js` | Event and scheduling data | Event, EventSchedule, EventType |
| `discord.js` | Discord API data | DiscordUser, DiscordGuild, DiscordMember |

---

## 🔷 User Types (`user.js`)

### Core Types

#### User
```javascript
/**
 * @typedef {Object} User
 * @property {string} id - Discord user ID
 * @property {string} username - Discord username
 * @property {string} discriminator - Discord discriminator
 * @property {string} avatar - Avatar URL
 * @property {string[]} roles - Role IDs
 * @property {boolean} inServer - In Discord server
 * @property {UserProfile} profile - Extended profile
 */
```

### Usage Example

```javascript
import { isValidUser, getUserDisplayName, transformDiscordUser } from '@/types/user';

// Validate user data
if (isValidUser(userData)) {
  const displayName = getUserDisplayName(userData);
  console.log(`Welcome, ${displayName}!`);
}

// Transform Discord API response
const discordResponse = await fetchDiscordUser();
const user = transformDiscordUser(
  discordResponse,
  ['1397497084793458691'], // roles
  true // inServer
);
```

### Available Functions

```javascript
isValidUser(user) // Validate user structure
isValidSession(session) // Validate session structure
isSessionExpired(session) // Check if session expired
transformDiscordUser(discordUser, roles, inServer) // Transform Discord data
getUserDisplayName(user) // Get display name
getUserAvatar(user, size) // Get avatar URL with size
calculateUserTotalLevel(profile) // Calculate total level
```

---

## 🛤️ Pathway Types (`pathway.js`)

### Core Types

#### Pathway
```javascript
/**
 * @typedef {Object} Pathway
 * @property {string} id - 'gaming', 'lorebound', 'productive', 'news'
 * @property {string} name - Display name
 * @property {string} color - Primary color hex
 * @property {string} gradient - CSS gradient
 * @property {string} roleId - Discord role ID
 * @property {PathwayRank[]} ranks - Progression ranks
 */
```

#### PathwayProgress
```javascript
/**
 * @typedef {Object} PathwayProgress
 * @property {string} userId - User ID
 * @property {string} pathwayId - Pathway ID
 * @property {number} level - Current level
 * @property {number} xp - Current XP
 * @property {string[]} achievements - Achievement IDs
 */
```

### Usage Example

```javascript
import {
  isValidPathway,
  initializePathwayProgress,
  addXPToProgress,
  calculateProgressPercentage
} from '@/types/pathway';

// Initialize progress for new member
const progress = initializePathwayProgress('user123', 'gaming');

// Add XP (e.g., from completing activity)
const updatedProgress = addXPToProgress(progress, 150);

// Calculate progress bar percentage
const percentage = calculateProgressPercentage(updatedProgress);
console.log(`Progress: ${percentage}%`);
```

### Available Functions

```javascript
isValidPathway(pathway) // Validate pathway
isValidPathwayProgress(progress) // Validate progress
isValidPathwayId(pathwayId) // Check valid ID
getNextRank(progress, ranks) // Get next rank
getCurrentRank(progress, ranks) // Get current rank
calculateProgressPercentage(progress) // Progress %
calculateXPForLevel(level) // XP for level
calculateLevelFromXP(xp) // Level from XP
initializePathwayProgress(userId, pathwayId) // New progress
addXPToProgress(progress, xp) // Add XP
getPathwayThemeClass(pathwayId) // CSS class
```

---

## 📅 Event Types (`event.js`)

### Core Types

#### Event
```javascript
/**
 * @typedef {Object} Event
 * @property {string} id - Unique ID
 * @property {string} title - Event title
 * @property {EventType} type - Event type
 * @property {EventSchedule} schedule - Scheduling info
 * @property {number|null} maxParticipants - Max participants
 * @property {EventRewards} rewards - Event rewards
 */
```

#### EventSchedule
```javascript
/**
 * @typedef {Object} EventSchedule
 * @property {string} frequency - 'once', 'daily', 'weekly', 'monthly'
 * @property {number|null} dayOfWeek - 0-6 (Sunday=0)
 * @property {string|null} time - HH:MM format
 * @property {number} duration - Minutes
 * @property {string} timezone - 'UTC', etc.
 */
```

### Usage Example

```javascript
import {
  calculateNextOccurrence,
  formatEventDateTime,
  canUserJoinEvent,
  getEventStatus
} from '@/types/event';

// Calculate next event occurrence
const nextDate = calculateNextOccurrence(event);
console.log(`Next event: ${formatEventDateTime(event)}`);

// Check if user can join
const { canJoin, reason } = canUserJoinEvent(event, userRoles);
if (!canJoin) {
  console.log(`Cannot join: ${reason}`);
}

// Get current status
const status = getEventStatus(event);
console.log(`Event is ${status}`);
```

### Available Functions

```javascript
isValidEvent(event) // Validate event
isValidEventSchedule(schedule) // Validate schedule
calculateNextOccurrence(event, fromDate) // Next date
formatEventDateTime(event) // Format date/time
formatEventDuration(minutes) // Format duration
canUserJoinEvent(event, userRoles) // Can join?
getEventStatus(event) // Get status
createEventFromTemplate(template, data) // Create event
getUpcomingEvents(events) // Next 7 days
getEventsByPathway(events, pathwayId) // Filter by pathway
```

---

## 💬 Discord Types (`discord.js`)

### Core Types

#### DiscordUser
```javascript
/**
 * @typedef {Object} DiscordUser
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} discriminator - Discriminator
 * @property {string|null} avatar - Avatar hash
 * @property {string|null} email - Email
 */
```

#### DiscordMember
```javascript
/**
 * @typedef {Object} DiscordMember
 * @property {DiscordUser} user - User object
 * @property {string|null} nick - Nickname
 * @property {string[]} roles - Role IDs
 * @property {string} joined_at - Join date
 */
```

### Usage Example

```javascript
import {
  getDiscordAvatarURL,
  getMemberDisplayName,
  memberHasRole,
  formatDiscordTimestamp
} from '@/types/discord';

// Get avatar URL
const avatarURL = getDiscordAvatarURL(discordUser, 256);

// Get display name (nick > global_name > username)
const displayName = getMemberDisplayName(member);

// Check role
if (memberHasRole(member, '1395703399760265226')) {
  console.log('User has Gaming realm role!');
}

// Format timestamp
const joinedText = formatDiscordTimestamp(member.joined_at, 'relative');
console.log(`Joined ${joinedText}`);
```

### Available Functions

```javascript
isValidDiscordUser(user) // Validate user
isValidDiscordMember(member) // Validate member
getDiscordAvatarURL(user, size) // Avatar URL
getDiscordGuildIconURL(guild, size) // Guild icon
getDiscordRoleColor(role) // Role color hex
formatDiscordTimestamp(timestamp, format) // Format time
memberHasRole(member, roleId) // Has role?
memberHasAnyRole(member, roleIds) // Has any?
memberHasAllRoles(member, roleIds) // Has all?
getMemberHighestRole(member, roles) // Highest role
getMemberDisplayName(member) // Display name
isMemberTimedOut(member) // Is timed out?
```

---

## 🎯 Common Usage Patterns

### Pattern 1: Validate API Response

```javascript
import { isValidDiscordUser } from '@/types/discord';
import { transformDiscordUser } from '@/types/user';

async function fetchAndValidateUser(userId) {
  const response = await fetch(`/api/discord/user/${userId}`);
  const data = await response.json();
  
  if (!isValidDiscordUser(data)) {
    throw new Error('Invalid user data');
  }
  
  return transformDiscordUser(data, data.roles, true);
}
```

### Pattern 2: Progress Tracking

```javascript
import {
  initializePathwayProgress,
  addXPToProgress,
  getCurrentRank
} from '@/types/pathway';
import { getAchievementsByPathway } from '@/data';

function handleActivityComplete(userId, pathwayId, xpReward) {
  // Get or initialize progress
  let progress = getProgress(userId, pathwayId) || 
    initializePathwayProgress(userId, pathwayId);
  
  // Add XP
  progress = addXPToProgress(progress, xpReward);
  
  // Check rank
  const ranks = getPathwayById(pathwayId).ranks;
  const currentRank = getCurrentRank(progress, ranks);
  
  console.log(`New rank: ${currentRank.name}`);
  
  return progress;
}
```

### Pattern 3: Event Management

```javascript
import {
  getUpcomingEvents,
  canUserJoinEvent,
  getEventStatus
} from '@/types/event';
import { getRecurringEventsByPathway } from '@/data';

function displayPathwayEvents(pathwayId, userRoles) {
  const events = getRecurringEventsByPathway(pathwayId);
  const upcoming = getUpcomingEvents(events);
  
  return upcoming.map(event => {
    const status = getEventStatus(event);
    const { canJoin, reason } = canUserJoinEvent(event, userRoles);
    
    return {
      ...event,
      status,
      canJoin,
      joinError: reason
    };
  });
}
```

### Pattern 4: User Dashboard Data

```javascript
import { getUserDisplayName, calculateUserTotalLevel } from '@/types/user';
import { getPathwayByRoleId } from '@/data';

function buildUserDashboard(user) {
  // Get display info
  const displayName = getUserDisplayName(user);
  const totalLevel = calculateUserTotalLevel(user.profile);
  
  // Get pathways
  const pathways = user.roles
    .map(roleId => getPathwayByRoleId(roleId))
    .filter(Boolean);
  
  // Get progress
  const progressData = pathways.map(pathway => ({
    pathway,
    progress: user.profile.pathwayProgress[pathway.id]
  }));
  
  return {
    displayName,
    totalLevel,
    pathways,
    progressData,
    achievements: user.profile.achievements
  };
}
```

---

## 🔒 Type Safety Best Practices

### 1. Always Validate External Data

```javascript
// ✅ Good - Validate before using
const userData = await fetchUser();
if (isValidUser(userData)) {
  processUser(userData);
} else {
  console.error('Invalid user data');
}

// ❌ Bad - Assume data is valid
const userData = await fetchUser();
processUser(userData); // May crash
```

### 2. Use Transformers for API Data

```javascript
// ✅ Good - Transform Discord API response
const discordUser = await fetchDiscordAPI();
const appUser = transformDiscordUser(discordUser, roles, true);

// ❌ Bad - Use raw API data directly
const discordUser = await fetchDiscordAPI();
saveUser(discordUser); // May have wrong structure
```

### 3. Handle Null/Undefined

```javascript
// ✅ Good - Check existence
const displayName = user?.profile?.displayName || 'Unknown';

// ❌ Bad - Assume exists
const displayName = user.profile.displayName; // May crash
```

### 4. Use Type-Specific Functions

```javascript
// ✅ Good - Use provided function
const percentage = calculateProgressPercentage(progress);

// ❌ Bad - Manual calculation
const percentage = (progress.xp / progress.nextLevelXP) * 100;
```

---

## 📦 Import Examples

### Import Specific Functions

```javascript
import { isValidUser, getUserDisplayName } from '@/types/user';
import { calculateProgressPercentage } from '@/types/pathway';
import { formatEventDateTime } from '@/types/event';
```

### Import All from Module

```javascript
import * as UserTypes from '@/types/user';
import * as PathwayTypes from '@/types/pathway';

const valid = UserTypes.isValidUser(user);
const progress = PathwayTypes.initializePathwayProgress(userId, pathwayId);
```

### Import Default Object

```javascript
import types from '@/types';

const valid = types.user.isValidUser(user);
const progress = types.pathway.initializePathwayProgress(userId, pathwayId);
```

---

## 🧪 Testing with Types

### Validate Test Data

```javascript
import { isValidUser, isValidPathway } from '@/types';

describe('User Tests', () => {
  it('should have valid user structure', () => {
    const mockUser = {
      id: '123',
      username: 'TestUser',
      discriminator: '0001',
      avatar: 'avatar.png',
      roles: ['role1'],
      inServer: true,
      profile: {
        displayName: 'Test',
        // ... rest of profile
      }
    };
    
    expect(isValidUser(mockUser)).toBe(true);
  });
});
```

### Generate Mock Data

```javascript
import { initializePathwayProgress, transformDiscordUser } from '@/types';

function createMockUser(overrides = {}) {
  const baseDiscordUser = {
    id: '123456789',
    username: 'MockUser',
    discriminator: '0001',
    avatar: 'avatar_hash',
    email: 'mock@example.com'
  };
  
  return transformDiscordUser(
    { ...baseDiscordUser, ...overrides },
    ['1397497084793458691'],
    true
  );
}

function createMockProgress(userId = '123', pathwayId = 'gaming') {
  return initializePathwayProgress(userId, pathwayId);
}
```

---

## 🔄 Integration with Data Layer

Types work seamlessly with the data layer:

```javascript
import { getAllPathways, getPathwayById } from '@/data';
import { isValidPathway, getPathwayThemeClass } from '@/types/pathway';

// Data returns pathway objects that match types
const pathways = getAllPathways();
pathways.forEach(pathway => {
  if (isValidPathway(pathway)) {
    const themeClass = getPathwayThemeClass(pathway.id);
    console.log(`${pathway.name}: ${themeClass}`);
  }
});
```

---

## 📝 JSDoc Usage in VS Code

### Enable IntelliSense

The JSDoc annotations provide full IntelliSense:

```javascript
import { User } from '@/types/user';

/**
 * Process user data
 * @param {User} user - The user object
 * @returns {string} Display name
 */
function processUser(user) {
  // VS Code shows autocomplete for user properties
  return user.profile.displayName;
}
```

### Type Checking

Enable type checking in JS files:

```javascript
// @ts-check
import { isValidUser } from '@/types/user';

function handleUser(user) {
  if (!isValidUser(user)) {
    throw new Error('Invalid user');
  }
  
  // TypeScript now knows user is valid
  console.log(user.username);
}
```

---

## 🛠️ Utility Functions Summary

### User Utilities
- `isValidUser()` - Validate structure
- `transformDiscordUser()` - Convert Discord data
- `getUserDisplayName()` - Get display name
- `getUserAvatar()` - Get avatar URL
- `calculateUserTotalLevel()` - Calculate level

### Pathway Utilities
- `isValidPathway()` - Validate pathway
- `initializePathwayProgress()` - Create progress
- `addXPToProgress()` - Add XP
- `calculateProgressPercentage()` - Progress %
- `getCurrentRank()` - Get current rank
- `getNextRank()` - Get next rank

### Event Utilities
- `calculateNextOccurrence()` - Next event date
- `formatEventDateTime()` - Format date
- `canUserJoinEvent()` - Check eligibility
- `getEventStatus()` - Get status
- `getUpcomingEvents()` - Next 7 days

### Discord Utilities
- `getDiscordAvatarURL()` - Avatar URL
- `getMemberDisplayName()` - Display name
- `memberHasRole()` - Check role
- `formatDiscordTimestamp()` - Format time
- `isMemberTimedOut()` - Timeout check

---

## 🎓 Advanced Patterns

### Composing Type Functions

```javascript
import { transformDiscordUser } from '@/types/user';
import { getDiscordAvatarURL } from '@/types/discord';
import { initializePathwayProgress } from '@/types/pathway';

async function createNewUser(discordData, initialPathway) {
  // Transform Discord data to app user
  const user = transformDiscordUser(discordData, [], true);
  
  // Get high-quality avatar
  user.avatar = getDiscordAvatarURL(discordData, 512);
  
  // Initialize pathway progress
  if (initialPathway) {
    user.profile.pathwayProgress[initialPathway] = 
      initializePathwayProgress(user.id, initialPathway);
  }
  
  return user;
}
```

### Building Complex Validators

```javascript
import { isValidUser } from '@/types/user';
import { isValidPathwayProgress } from '@/types/pathway';
import { memberHasRole } from '@/types/discord';

function validateUserForFeature(user, requiredRoleId) {
  // Check basic structure
  if (!isValidUser(user)) {
    return { valid: false, error: 'Invalid user structure' };
  }
  
  // Check server membership
  if (!user.inServer) {
    return { valid: false, error: 'User not in server' };
  }
  
  // Check required role
  if (!user.roles.includes(requiredRoleId)) {
    return { valid: false, error: 'Missing required role' };
  }
  
  // Check pathway progress exists
  const pathwayId = 'gaming';
  const progress = user.profile.pathwayProgress[pathwayId];
  if (!progress || !isValidPathwayProgress(progress)) {
    return { valid: false, error: 'Invalid pathway progress' };
  }
  
  return { valid: true, error: null };
}
```

---

## 📚 Related Documentation

- [DATA_GUIDE.md](/docs/DATA_GUIDE.md) - Data layer documentation
- [HOOKS_GUIDE.md](/docs/HOOKS_GUIDE.md) - React hooks documentation
- [API_ENDPOINTS.md](/blueprint/API_ENDPOINTS.md) - API documentation

---

## ✅ Summary

The type system provides:

✅ **4 complete type modules** (user, pathway, event, discord)  
✅ **50+ utility functions** for data manipulation  
✅ **Full JSDoc annotations** for IntelliSense  
✅ **Runtime validators** for data safety  
✅ **Transformers** for API data  
✅ **Zero placeholders** - production ready  

**Import from `@/types` and use immediately!**