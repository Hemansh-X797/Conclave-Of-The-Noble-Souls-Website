# 🔐 The Conclave Realm - Authentication System Guide

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Components Built](#️-components-built)
3. [Setup Instructions](#️-setup-instructions)
4. [Usage Examples](#-usage-examples)
5. [API Routes](#️-api-routes)
6. [File Structure](#-file-structure)
7. [Environment Variables](#-environment-variables)
8. [Testing Checklist](#-testing-checklist)
9. [Troubleshooting](#-troubleshooting)
10. [Next Steps](#-next-steps)

---

## 🎯 Overview

This authentication system provides **premium Discord OAuth 2.0** integration with:

- ✅ **DiscordLogin.jsx** (~950 lines) - Multiple login variants
- ✅ **AuthGuard.jsx** (~750 lines) - Route protection with roles
- ✅ **MemberVerify.jsx** (~850 lines) - Server membership verification
- ✅ **API Routes** (3 files) - OAuth callback, verification, auto-invite
**Total: ~3,000 lines of production-ready code**

---

## 🏗️ Components Built

### 1. **DiscordLogin.jsx**

**Location:** `src/components/auth/DiscordLogin.jsx`

**Variants:**

- `hero` - Large, prominent for homepage (with logo, particles, features)
- `navbar` - Compact for navigation bar
- `card` - Medium-sized for pages
- `minimal` - Simple button only

**Features:**

- Discord OAuth 2.0 integration
- Loading states with LoadingCrest
- Error handling with retry
- Session management (30 days)
- Pathway theming support
- Premium animations
- User avatar display after login

**Usage:**

```jsx
// Homepage hero
import { DiscordLoginHero } from '@/components/auth/DiscordLogin';
<DiscordLoginHero />

// Navbar button
import { DiscordLoginNavbar } from '@/components/auth/DiscordLogin';
<DiscordLoginNavbar />

// Custom
import DiscordLogin from '@/components/auth/DiscordLogin';
<DiscordLogin 
  variant="card"
  pathway="gaming"
  onSuccess={(session) => console.log('Logged in!', session)}
/>
```

---

### 2. **AuthGuard.jsx**

**Location:** `src/components/auth/AuthGuard.jsx`

**Purpose:** Protects routes and checks permissions

**Features:**

- Session validation (30-day sessions)
- Role-based access control
- Permission checking (using permissions.js)
- Staff/VIP verification
- Permission level requirements
- Elegant loading states
- Auto-redirect on denial
- Session refresh

**Usage:**

```jsx
import AuthGuard, { 
  StaffOnly, 
  AdminOnly, 
  MemberOnly 
} from '@/components/auth/AuthGuard';

// Protect entire page
export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

// Require staff access
<StaffOnly>
  <ModeratorPanel />
</StaffOnly>

// Require admin access
<AdminOnly>
  <AdminPanel />
</AdminOnly>

// Require specific permission
<AuthGuard requirePermission={PERMISSIONS.MANAGE_EVENTS}>
  <EventManager />
</AuthGuard>

// Require permission level
<AuthGuard requireLevel={PERMISSION_LEVELS.MODERATOR}>
  <ModerationTools />
</AuthGuard>
```

---

### 3. **MemberVerify.jsx**

**Location:** `src/components/auth/MemberVerify.jsx`

**Purpose:** Verify Discord server membership with auto-invite

**Features:**

- Real-time membership verification
- Auto-invite non-members to server
- Beautiful status displays
- Retry mechanism
- Cache management (5 min cache)
- Multiple display modes

**Modes:**

- `full` - Complete UI with status
- `inline` - Compact inline display
- `badge` - Badge only
- `silent` - No UI, verification only

**Usage:**

```jsx
import MemberVerify, { 
  MemberBadge, 
  MemberOnly 
} from '@/components/auth/MemberVerify';

// Full verification UI
<MemberVerify autoInvite>
  <MemberContent />
</MemberVerify>

// Badge only
<MemberBadge />

// Member-only content
<MemberOnly>
  <ExclusiveFeature />
</MemberOnly>

// Form integration
<MemberVerify 
  mode="inline" 
  showBadge
  onVerified={(user) => console.log('Verified:', user)}
/>
```

---

## 🛠️ Setup Instructions

### Step 1: Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application (or use existing `1424333322615521282`)
3. Go to **OAuth2** section
4. Add redirect URL: `http://localhost:3000/api/auth/discord/callback`
5. Copy **Client ID** and **Client Secret**
6. Go to **Bot** section
7. Copy **Bot Token**
8. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Presence Intent (optional)

### Step 2: Environment Variables

Add to `.env.local`:

```env
# Discord OAuth
DISCORD_CLIENT_ID=1424333322615521282
DISCORD_CLIENT_SECRET=your_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Discord Server
DISCORD_GUILD_ID=1368124846760001546
DISCORD_INVITE_LINK=https://discord.gg/pbTnTxqS38

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token_here
```

**Public variables** (add to `.env`):

```env
NEXT_PUBLIC_DISCORD_CLIENT_ID=1424333322615521282
NEXT_PUBLIC_DISCORD_GUILD_ID=1368124846760001546
NEXT_PUBLIC_DISCORD_INVITE_LINK=https://discord.gg/pbTnTxqS38
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
```

### Step 3: File Structure

Create these files:

```py
/src
├── components/
│   └── auth/
│       ├── DiscordLogin.jsx ✅
│       ├── AuthGuard.jsx ✅
│       └── MemberVerify.jsx ✅
├── app/
│   └── api/
│       ├── auth/
│       │   └── discord/
│       │       └── callback/
│       │           └── route.js ✅
│       └── discord/
│           ├── verify-membership/
│           │   └── route.js ✅
│           └── auto-invite/
│               └── route.js ✅
└── constants/
    └── permissions.js ✅ (already exists)
```

### Step 4: Update Imports

Make sure you have these components:

- `src/components/ui/LuxuryButton.jsx` (with named exports)
- `src/components/ui/LoadingCrest.jsx`
- `src/constants/permissions.js`

---

## 💡 Usage Examples

### Example 1: Homepage with Hero Login

```jsx
// src/app/page.jsx
import { DiscordLoginHero } from '@/components/auth/DiscordLogin';

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>Welcome to The Conclave Realm</h1>
        <DiscordLoginHero />
      </section>
    </main>
  );
}
```

### Example 2: Protected Dashboard Page

```jsx
// src/app/chambers/dashboard/page.jsx
import AuthGuard from '@/components/auth/AuthGuard';
import MemberVerify from '@/components/auth/MemberVerify';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <MemberVerify autoInvite>
        <div className="dashboard">
          <h1>Member Dashboard</h1>
          <p>Welcome, noble soul!</p>
        </div>
      </MemberVerify>
    </AuthGuard>
  );
}
```

### Example 3: Moderator Portal

```jsx
// src/app/sanctum/page.jsx
import { StaffOnly } from '@/components/auth/AuthGuard';

export default function ModeratorPortal() {
  return (
    <StaffOnly>
      <div className="moderator-portal">
        <h1>Moderator Sanctum</h1>
        <ModTools />
      </div>
    </StaffOnly>
  );
}
```

### Example 4: Admin Portal

```jsx
// src/app/throne-room/page.jsx
import { AdminOnly } from '@/components/auth/AuthGuard';

export default function AdminPortal() {
  return (
    <AdminOnly>
      <div className="admin-portal">
        <h1>Throne Room</h1>
        <AdminPanel />
      </div>
    </AdminOnly>
  );
}
```

### Example 5: Form with Member Verification

```jsx
// src/components/forms/EventRegistration.jsx
import MemberVerify from '@/components/auth/MemberVerify';

export default function EventRegistration() {
  return (
    <div>
      <MemberVerify mode="inline" showBadge />
      
      <form>
        <h2>Event Registration</h2>
        {/* form fields */}
      </form>
    </div>
  );
}
```

### Example 6: Navbar with Login Button

```jsx
// src/components/layout/Navbar.jsx
import { DiscordLoginNavbar } from '@/components/auth/DiscordLogin';

export default function Navbar() {
  return (
    <nav>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/pathways">Pathways</Link>
      </div>
      
      <DiscordLoginNavbar />
    </nav>
  );
}
```

---

## 🛣️ API Routes

### 1. OAuth Callback

**File:** `src/app/api/auth/discord/callback/route.js`

**Endpoint:** `GET /api/auth/discord/callback`

**What it does:**

1. Receives OAuth code from Discord
2. Exchanges code for access token
3. Fetches user data
4. Checks guild membership
5. Auto-invites if not member
6. Creates 30-day session
7. Redirects based on role

**Redirects to:**

- `/throne-room` - Owner, Board, Admins
- `/sanctum` - Moderators
- `/chambers/dashboard` - Members

### 2. Membership Verification

**File:** `src/app/api/discord/verify-membership/route.js`

**Endpoint:** `POST /api/discord/verify-membership`

**Body:**

```json
{
  "userId": "discord_user_id",
  "guildId": "optional_guild_id"
}
```

**Response:**

```json
{
  "isMember": true,
  "roles": ["role_id_1", "role_id_2"],
  "joinedAt": "2024-01-01T00:00:00.000Z",
  "nick": "Nickname"
}
```

### 3. Auto-Invite

**File:** `src/app/api/discord/auto-invite/route.js`

**Endpoint:** `POST /api/discord/auto-invite`

**Body:**

```json
{
  "userId": "discord_user_id",
  "guildId": "optional_guild_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully added to server"
}
```

---

## 📁 File Structure

```py
/src/components/auth/
├── DiscordLogin.jsx          # Login component (950 lines)
├── AuthGuard.jsx             # Route protection (750 lines)
└── MemberVerify.jsx          # Membership verification (850 lines)

/src/app/api/
├── auth/
│   └── discord/
│       └── callback/
│           └── route.js      # OAuth callback (500 lines)
└── discord/
    ├── verify-membership/
    │   └── route.js          # Verification API (100 lines)
    └── auto-invite/
        └── route.js          # Auto-invite API (100 lines)

/src/constants/
└── permissions.js            # Already exists
```

---

## 🔑 Environment Variables

### Required Variables:-

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_CLIENT_ID` | OAuth Client ID | `1424333322615521282` |
| `DISCORD_CLIENT_SECRET` | OAuth Client Secret | Get from Discord Dev Portal |
| `DISCORD_REDIRECT_URI` | OAuth Redirect URL | `http://localhost:3000/api/auth/discord/callback` |
| `DISCORD_GUILD_ID` | Your Discord Server ID | `1368124846760001546` |
| `DISCORD_BOT_TOKEN` | Bot Token for auto-invite | Get from Discord Dev Portal |
| `DISCORD_INVITE_LINK` | Server Invite Link | `https://discord.gg/pbTnTxqS38` |

### Public Variables (for client-side):-

Add `NEXT_PUBLIC_` prefix:

- `NEXT_PUBLIC_DISCORD_CLIENT_ID`
- `NEXT_PUBLIC_DISCORD_GUILD_ID`
- `NEXT_PUBLIC_DISCORD_INVITE_LINK`
- `NEXT_PUBLIC_DISCORD_REDIRECT_URI`

---

## ✅ Testing Checklist

### Before Testing:-

- [ ] Environment variables set in `.env.local`
- [ ] Public variables set with `NEXT_PUBLIC_` prefix
- [ ] Discord OAuth redirect URL added in Developer Portal
- [ ] Bot has necessary permissions in Discord server
- [ ] All files created in correct locations

### Test Login Flow:-

1. [ ] Click login button
2. [ ] Redirects to Discord OAuth
3. [ ] Authorize application
4. [ ] Redirects back to your site
5. [ ] Session created (check localStorage `conclave_session`)
6. [ ] User redirected based on role

### Test AuthGuard:-

1. [ ] Access protected route without login → redirects to `/gateway`
2. [ ] Login and access protected route → shows content
3. [ ] Access moderator route as member → shows error
4. [ ] Access admin route as moderator → shows error

### Test MemberVerify:-

1. [ ] Login with non-member account
2. [ ] Auto-invite triggers
3. [ ] Check Discord server for new member
4. [ ] Verification status updates

### Test Session:-

1. [ ] Login
2. [ ] Refresh page → session persists
3. [ ] Close browser and reopen → session persists (30 days)
4. [ ] Check session expiry date

---

## 🐛 Troubleshooting

### Issue: "Token exchange failed"

**Cause:** Invalid client secret or redirect URI mismatch
**Fix:**

- Verify `DISCORD_CLIENT_SECRET` in `.env.local`
- Ensure redirect URI matches exactly in Discord Developer Portal

### Issue: "Bot token not configured"

**Cause:** Missing or invalid bot token
**Fix:**

- Add `DISCORD_BOT_TOKEN` to `.env.local`
- Ensure bot is in your Discord server

### Issue: "Auto-invite failed"

**Cause:** Bot doesn't have "Create Invite" permission or user didn't grant `guilds.join` scope
**Fix:**

- Check bot permissions in Discord server
- Ensure OAuth URL includes `guilds.join` scope

### Issue: Components not rendering

**Cause:** Missing dependencies
**Fix:**

- Verify `LuxuryButton.jsx` exists with named exports: `TextFlameButton`, `TextDimButton`, `NobleButton`
- Verify `LoadingCrest.jsx` exists
- Check imports match file locations

### Issue: "Cannot read properties of undefined"

**Cause:** Session structure mismatch
**Fix:**

- Clear localStorage `conclave_session`
- Login again to create new session

### Issue: Infinite loading state

**Cause:** API route error
**Fix:**

- Check browser console for errors
- Check Next.js terminal for API errors
- Verify all environment variables are set

---

## 🚀 Next Steps

### Immediate:-

1. **Get Discord Client Secret** from Developer Portal
2. **Get Discord Bot Token** from Developer Portal
3. **Test login flow** with your Discord account
4. **Test auto-invite** with a non-member account

### Short-term:-

1. Create **login page** at `/gateway` with hero login
2. Update **navbar** with login button
3. Protect **chambers**, **sanctum**, **throne-room** routes
4. Add **member verification** to forms

### Long-term:-

1. Add **session refresh** mechanism (API route exists, integrate it)
2. Add **logout functionality**
3. Create **user profile dropdown** in navbar
4. Add **role badges** throughout site
5. Implement **permission-based UI hiding** (hide buttons user can't use)

---

## 📝 Notes

- **Session Duration:** 30 days (configurable in API route)
- **Cache Duration:** 5 minutes for membership checks (configurable)
- **Auto-Invite:** Enabled by default (can be disabled per component)
- **Permission Levels:** Defined in `permissions.js`
- **Debug Mode:** Add `debug` prop to any component to see debug info

---

## 🎉 You're Done

You now have a **premium authentication system** with:

- ✅ Discord OAuth 2.0
- ✅ Auto-invite non-members
- ✅ Role-based access control
- ✅ 30-day sessions
- ✅ Beautiful UI with animations
- ✅ Comprehensive error handling
- ✅ Production-ready code

**Total Code:** ~3,000 lines of premium, luxury-grade authentication!

**Need help?** Check the debug panels in each component or enable `debug={true}` prop.

---

*Built for The Conclave Realm with the highest standards of quality and elegance.* 🎖️
