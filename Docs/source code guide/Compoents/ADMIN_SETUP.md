# Admin Components - Quick Setup Guide

**Get your admin panel running in 5 steps!**

---

## 📦 Step 1: File Placement

Copy all admin components to their correct locations:

```bash
# Admin Components
src/components/admin/
├── AnalyticsDash.jsx      ✅ Created
├── MemberManager.jsx       ✅ Created
├── ContentManager.jsx      ✅ Created
└── EventCreator.jsx        ✅ Created

# API Routes (create these)
src/app/api/
├── discord/
│   ├── stats/route.js
│   ├── members/route.js
│   └── create-event/route.js
└── admin/
    ├── moderation/route.js
    ├── roles/route.js
    ├── content/route.js
    ├── content/[id]/route.js
    ├── events/route.js
    ├── events/[id]/route.js
    └── upload/route.js
```

---

## 🗄️ Step 2: Database Setup (Supabase)

Run these SQL commands in Supabase SQL Editor:

```sql
-- Member Stats Table
CREATE TABLE member_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  content TEXT NOT NULL,
  pathway VARCHAR(50) DEFAULT 'default',
  status VARCHAR(50) DEFAULT 'draft',
  visibility VARCHAR(50) DEFAULT 'public',
  featured BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  tags TEXT[],
  media JSONB,
  thumbnail TEXT,
  author VARCHAR(255) NOT NULL,
  publish_date TIMESTAMP,
  expiry_date TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  pathway VARCHAR(50) DEFAULT 'default',
  event_type VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  location_details TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  recurring BOOLEAN DEFAULT false,
  recurrence JSONB,
  max_participants INTEGER DEFAULT 0,
  requires_registration BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP,
  allow_waitlist BOOLEAN DEFAULT true,
  visibility VARCHAR(50) DEFAULT 'public',
  pathway_restrictions TEXT[],
  role_restrictions TEXT[],
  has_rewards BOOLEAN DEFAULT false,
  rewards JSONB,
  send_reminders BOOLEAN DEFAULT true,
  reminder_times TEXT[],
  banner TEXT,
  thumbnail TEXT,
  color VARCHAR(7) DEFAULT '#D4AF37',
  tags TEXT[],
  hosts TEXT[],
  rules TEXT,
  requirements TEXT,
  prizes TEXT,
  external_link TEXT,
  discord_event_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  registered_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Moderation Logs Table
CREATE TABLE mod_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  moderator_id VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  duration INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Warnings Table
CREATE TABLE warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  moderator_id VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role Logs Table
CREATE TABLE role_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  role_id VARCHAR(255) NOT NULL,
  action VARCHAR(10) NOT NULL,
  moderator_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Admin Logs Table (for security audit)
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  actor_id VARCHAR(255) NOT NULL,
  target_id VARCHAR(255),
  reason TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45)
);

-- Create indexes for better performance
CREATE INDEX idx_member_stats_user_id ON member_stats(user_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_pathway ON content(pathway);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_mod_logs_timestamp ON mod_logs(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE member_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mod_logs ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-media', 'content-media', true);
```

---

## 🛣️ Step 3: Create Admin Routes

### Create admin pages

```jsx
// /src/app/admin/analytics/page.jsx
import AnalyticsDash from '@/components/admin/AnalyticsDash';
import { getServerSession } from 'next-auth';

export default async function AnalyticsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <AnalyticsDash 
      user={session.user}
      userRoles={session.user.roles}
    />
  );
}
```

```jsx
// /src/app/admin/members/page.jsx
import MemberManager from '@/components/admin/MemberManager';
import { getServerSession } from 'next-auth';

export default async function MembersPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <MemberManager 
      user={session.user}
      userRoles={session.user.roles}
    />
  );
}
```

```jsx
// /src/app/admin/content/page.jsx
import ContentManager from '@/components/admin/ContentManager';
import { getServerSession } from 'next-auth';

export default async function ContentPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <ContentManager 
      user={session.user}
      userRoles={session.user.roles}
    />
  );
}
```

```jsx
// /src/app/admin/events/page.jsx
import EventCreator from '@/components/admin/EventCreator';
import { getServerSession } from 'next-auth';

export default async function EventsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return (
    <EventCreator 
      user={session.user}
      userRoles={session.user.roles}
    />
  );
}
```

---

## 🔗 Step 4: Add Navigation Links

Update your Navbar.jsx:

```jsx
// In your Navbar.jsx
import { isStaff } from '@/constants/permissions';

const Navbar = ({ user, userRoles }) => {
  const showAdminPanel = isStaff(userRoles);
  
  return (
    <nav>
      {/* Your existing nav items */}
      
      {showAdminPanel && (
        <div className="admin-menu">
          <Link href="/admin/analytics">📊 Analytics</Link>
          <Link href="/admin/members">👥 Members</Link>
          <Link href="/admin/content">✍️ Content</Link>
          <Link href="/admin/events">📅 Events</Link>
        </div>
      )}
    </nav>
  );
};
```

---

## ⚙️ Step 5: Environment Variables

Ensure these are set in `.env.local`:

```bash
# Discord
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=1368124846760001546

# Webhooks
DISCORD_WEBHOOK_GENERAL=your_webhook_url
DISCORD_WEBHOOK_ADMIN=your_webhook_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] All 4 admin components render without errors
- [ ] Permission system works (test with different roles)
- [ ] API routes return correct data
- [ ] Database tables created successfully
- [ ] File uploads work (test image/video)
- [ ] Discord integration working
- [ ] Webhooks sending notifications
- [ ] Mobile responsive (test on phone)
- [ ] Loading states display correctly
- [ ] Error handling works (test network failures)

---

## 🧪 Quick Test

### Test Analytics Dashboard

```bash
# 1. Login as Owner/Admin
# 2. Navigate to /admin/analytics
# 3. Should see:
#    - Server overview stats
#    - Pathway analytics
#    - Member activity
#    - Charts and graphs
```

### Test Member Manager

```bash
# 1. Navigate to /admin/members
# 2. Test filters (role, pathway, status)
# 3. Try moderation action (timeout a test account)
# 4. Verify Discord action executed
# 5. Check webhook sent to admin channel
```

### Test Content Manager

```bash
# 1. Navigate to /admin/content
# 2. Click "Create New Content"
# 3. Fill form with test data
# 4. Upload image
# 5. Save as draft
# 6. Edit and publish
# 7. Verify webhook sent to general channel
```

### Test Event Creator

```bash
# 1. Navigate to /admin/events
# 2. Click "Create New Event"
# 3. Fill all required fields
# 4. Set date/time in future
# 5. Publish event
# 6. Verify Discord scheduled event created
# 7. Check calendar view shows event
```

---

## 🚨 Troubleshooting

### Components not rendering?

```bash
# Check browser console for errors
# Verify imports are correct
# Make sure all UI components exist:
- GlassCard
- LuxuryButton
- NobleInput
- LoadingCrest
```

### "Unauthorized" errors?

```bash
# Verify user is logged in
# Check user.roles array has correct role IDs
# Test permission system:
import { hasPermission, PERMISSIONS } from '@/constants/permissions';
console.log(hasPermission(user.roles, PERMISSIONS.VIEW_ANALYTICS));
```

### Data not loading?

```bash
# Check API routes return 200 status
# Verify Discord bot token is valid
# Test Discord API manually:
curl -H "Authorization: Bot YOUR_BOT_TOKEN" \
  https://discord.com/api/v10/guilds/YOUR_GUILD_ID

# Check Supabase connection:
# Go to Supabase dashboard → Table Editor
# Verify tables exist and have data
```

### Database errors?

```bash
# Check Supabase logs
# Verify RLS policies
# Test direct query:
const { data, error } = await supabase
  .from('content')
  .select('*');
console.log(data, error);
```

### Styles not applying?

```bash
# Verify CSS imports in layout.jsx:
import '@/styles/design_system.css';
import '@/styles/typography.css';
import '@/styles/luxury.css';
import '@/styles/animations.css';

# Clear browser cache
# Check tailwind.config.js includes admin paths
```

---

## 🎨 Customization

### Change Color Scheme

Edit `/src/styles/design_system.css`:

```css
:root {
  --cns-gold: #YOUR_COLOR;
  --royal-purple: #YOUR_COLOR;
  /* etc... */
}
```

### Add Custom Pathway

1. Add to pathway filter options
2. Define colors in design system
3. Add to `getPathwayButton()` function
4. Create corresponding button component

### Add New Permission

```javascript
// In /constants/permissions.js

// 1. Add to PERMISSIONS object
export const PERMISSIONS = {
  // ... existing permissions
  YOUR_NEW_PERMISSION: 'your_new_permission',
};

// 2. Add to role mappings
export const ROLE_PERMISSIONS = {
  'ROLE_ID': [
    // ... existing permissions
    PERMISSIONS.YOUR_NEW_PERMISSION
  ]
};

// 3. Use in component
if (hasPermission(userRoles, PERMISSIONS.YOUR_NEW_PERMISSION)) {
  // Render protected UI
}
```

### Add New Content Type

In `ContentManager.jsx`:

```jsx
// Add to type select options
<option value="your-type">🎨 Your Type</option>

// Add custom fields for this type
{formData.type === 'your-type' && (
  <NobleInput
    label="Custom Field"
    value={formData.customField}
    onChange={(e) => handleInputChange('customField', e.target.value)}
  />
)}
```

---

## 📊 Performance Optimization

### Enable Caching

```javascript
// In API routes
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

### Lazy Load Components

```jsx
import dynamic from 'next/dynamic';

const AnalyticsDash = dynamic(() => 
  import('@/components/admin/AnalyticsDash'), 
  { 
    loading: () => <LoadingCrest size="large" />,
    ssr: false 
  }
);
```

### Paginate Large Lists

Already implemented in components with:

- 20 items per page default
- Previous/Next navigation
- Page number display

### Optimize Images

```jsx
// Use Next.js Image with optimization
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Description"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
/>
```

---

## 🔐 Security Best Practices

### 1. Always Verify Permissions Server-Side

```javascript
// ❌ BAD - Only client-side check
if (!hasPermission(userRoles, PERMISSIONS.BAN_MEMBERS)) {
  return <div>Unauthorized</div>;
}

// ✅ GOOD - Server-side verification
export async function POST(request) {
  const session = await getServerSession();
  if (!hasPermission(session.user.roles, PERMISSIONS.BAN_MEMBERS)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  // Proceed with action
}
```

### 2. Sanitize User Input

```javascript
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});
```

### 3. Rate Limit API Endpoints

```javascript
// Use middleware or Upstash Rate Limit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request) {
  const { success } = await ratelimit.limit(request.ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // Continue
}
```

### 4. Log All Admin Actions

```javascript
// Every admin action should be logged
await supabase.from('admin_logs').insert({
  action: 'member_ban',
  actor_id: session.user.id,
  target_id: memberId,
  reason,
  timestamp: new Date().toISOString(),
  ip_address: request.headers.get('x-forwarded-for')
});
```

### 5. Use Environment Variables

```javascript
// ❌ Never hardcode secrets
const apiKey = 'sk_live_12345';

// ✅ Use environment variables
const apiKey = process.env.STRIPE_SECRET_KEY;
```

---

## 📈 Monitoring & Analytics

### Set Up Error Tracking (Sentry)

```javascript
// Install: npm install @sentry/nextjs

// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Add Custom Analytics Events

```javascript
// Track admin actions
const trackAdminAction = (action, details) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'admin',
      ...details
    });
  }
};

// Usage
trackAdminAction('member_ban', {
  member_id: memberId,
  reason: reason
});
```

### Monitor API Performance

```javascript
// Add timing to API routes
export async function GET(request) {
  const start = Date.now();
  
  try {
    // Your logic
    const data = await fetchData();
    
    const duration = Date.now() - start;
    console.log(`API took ${duration}ms`);
    
    return NextResponse.json(data);
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`API failed after ${duration}ms:`, error);
    throw error;
  }
}
```

---

## 🚀 Deployment

### Vercel Deployment

```bash
# 1. Push to GitHub
git add .
git commit -m "Add admin components"
git push origin main

# 2. Connect to Vercel
# - Import project from GitHub
# - Add environment variables
# - Deploy

# 3. Add production webhook URLs
DISCORD_WEBHOOK_ADMIN=https://discord.com/api/webhooks/...
```

### Environment Variables in Production

Go to Vercel Dashboard → Settings → Environment Variables:

```env
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
DISCORD_WEBHOOK_GENERAL=...
DISCORD_WEBHOOK_ADMIN=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=... (generate new one!)
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Post-Deployment Checklist

- [ ] Test all admin functions in production
- [ ] Verify webhooks work
- [ ] Check Discord API calls succeed
- [ ] Test file uploads
- [ ] Monitor error logs for 24 hours
- [ ] Set up automated backups
- [ ] Configure alerts for critical errors

---

## 📚 Additional Resources

### Documentation Links

- [Next.js App Router](https://nextjs.org/docs/app)
- [Discord API](https://discord.com/developers/docs/intro)
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth.js](https://next-auth.js.org/)

### Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint

# Format code
npm run format

# Database migrations
npm run migrate

# Generate types (if using TypeScript)
npm run generate-types
```

### Useful Scripts to Add

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed-data.js",
    "db:backup": "node scripts/backup-db.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## 🎓 Learning Path

### Recommended Order to Learn Components

1. **Start with AnalyticsDash** - Simplest, read-only
2. **Move to MemberManager** - Introduces moderation
3. **Then ContentManager** - More complex forms
4. **Finally EventCreator** - Most feature-rich

### Key Concepts to Understand

- **Permission System**: Role hierarchy and checks
- **State Management**: React hooks for data
- **API Integration**: Fetching and updating data
- **Form Validation**: Ensuring data quality
- **Error Handling**: Graceful failure recovery

---

## 💡 Pro Tips

### 1. Use React DevTools

Install React DevTools browser extension to debug component state.

### 2. Test with Multiple Roles

Create test accounts with different roles to verify permissions work correctly.

### 3. Mock Data During Development

Create mock data to develop UI without hitting real APIs:

```javascript
const MOCK_MEMBERS = [
  { id: '1', username: 'TestUser1', level: 5, ... },
  { id: '2', username: 'TestUser2', level: 10, ... },
];
```

### 4. Use Console Logs Strategically

Add logs at key points:

```javascript
console.log('Fetching members...');
const members = await fetchMembers();
console.log('Fetched', members.length, 'members');
```

### 5. Keep Components Updated

Regularly update dependencies:

```bash
npm outdated
npm update
```

---

## 🆘 Getting Help

### Common Issues & Solutions

**Issue**: Components show blank screen
**Solution**: Check browser console, verify all imports exist

**Issue**: "Permission denied" on all actions
**Solution**: Verify user.roles array in session, check role IDs match

**Issue**: API returns 500 errors
**Solution**: Check Vercel logs, verify environment variables, test Discord API separately

**Issue**: Styles not loading
**Solution**: Verify CSS imports in layout.jsx, clear cache, rebuild

**Issue**: Database queries failing
**Solution**: Check Supabase connection, verify table names, check RLS policies

### Need More Help?

- 📧 Email: <kundansmishra@gmail.com>
- 💬 Discord: Join [The Conclave](https://discord.gg/pbTnTxqS38)
- 📖 Docs: Check `/docs` folder
- 🐛 Issues: Open GitHub issue

---

## ✨ You're Ready

Your admin panel is now set up and ready to use!

**Remember:**

- Test thoroughly before production
- Always verify permissions server-side
- Log all admin actions
- Monitor errors and performance
- Keep dependencies updated

**Happy administrating! 🏰👑**  

---

*Created with 💎 for The Conclave of Noble Souls*  
*Last Updated: December 2024*
