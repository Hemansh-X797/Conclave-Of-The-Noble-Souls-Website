# API Routes Setup Guide

## 📁 File Structure

Create these files in your project:

```txt
/src/app/api/
├── contact/
│   └── route.js        ✅ Already created
├── applications/
│   └── route.js        ✅ Just created
├── appeals/
│   └── route.js        ✅ Just created
├── complaints/
│   └── route.js        ✅ Just created
└── submissions/
    └── route.js        ✅ Just created
```

---

## 🔧 Environment Variables Setup

Add these to your `.env.local`:

```env
# Email Configuration (from ContactForm setup)
EMAIL_USER=kundansmishra@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Discord Webhooks - Create separate webhooks for each form type
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... # Contact form
DISCORD_WEBHOOK_APPLICATIONS=https://discord.com/api/webhooks/... # Staff applications
DISCORD_WEBHOOK_APPEALS=https://discord.com/api/webhooks/... # Appeals
DISCORD_WEBHOOK_COMPLAINTS=https://discord.com/api/webhooks/... # Complaints
DISCORD_WEBHOOK_SUBMISSIONS=https://discord.com/api/webhooks/... # Content submissions

# Optional: Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Optional: File Storage
# For AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=conclave-uploads

# For Supabase Storage (recommended)
# Uses same SUPABASE keys above
```

---

## 🎯 Discord Webhook Setup (5 minutes)

### Create Webhooks for Each Form:-

1. **Applications Webhook:**
   - Channel: `#staff-applications` or `#admin-logs`
   - Name: "Conclave Applications"
   - Copy URL → `DISCORD_WEBHOOK_APPLICATIONS`

2. **Appeals Webhook:**
   - Channel: `#appeals` or `#moderation`
   - Name: "Conclave Appeals"
   - Copy URL → `DISCORD_WEBHOOK_APPEALS`

3. **Complaints Webhook:**
   - Channel: `#reports` or `#moderation`
   - Name: "Conclave Reports"
   - Copy URL → `DISCORD_WEBHOOK_COMPLAINTS`

4. **Submissions Webhook:**
   - Channel: `#content-review` or `#submissions`
   - Name: "Conclave Submissions"
   - Copy URL → `DISCORD_WEBHOOK_SUBMISSIONS`

---

## 📊 API Endpoints Reference

### 1. POST /api/applications - **Staff Application Submissions**

**Request Body:**

```json
{
  "fullName": "string",
  "discordUsername": "string",
  "email": "string",
  "desiredRole": "moderator|admin|event-organizer|content-creator",
  "experienceYears": "string",
  "relevantSkills": ["skill1", "skill2"],
  "availableHoursPerWeek": "string",
  "availableDays": ["Monday", "Tuesday"],
  "whyJoin": "string",
  "strengths": "string",
  "handleConflict": "string",
  "agreeToTerms": true,
  "agreeToNDA": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "timestamp": "2025-10-09T...",
    "desiredRole": "moderator",
    "fullName": "John Doe"
  }
}
```

---

### 2. POST /api/appeals - **Ban/Mute/Warn Appeals**

**Request:** FormData (multipart/form-data)

- Text fields: `discordUsername`, `email`, `appealType`, `whatHappened`, etc.
- Files: `evidence_0`, `evidence_1`, ... (up to 5)

**Response:**

```json
{
  "success": true,
  "message": "Appeal submitted successfully",
  "data": {
    "timestamp": "2025-10-09T...",
    "appealType": "ban",
    "evidenceCount": 3
  }
}
```

---

### 3. POST /api/complaints - **Member Reports**

**Request:** FormData (multipart/form-data)

- Text fields: `reportedUsername`, `violationType`, `description`, etc.
- Files: `evidence_0`, `evidence_1`, ... (up to 5)

**Response:**

```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "timestamp": "2025-10-09T...",
    "violationType": "harassment",
    "urgency": "high",
    "evidenceCount": 2
  }
}
```

---

### 4. POST /api/submissions - **Content Submissions**

**Request:** FormData (multipart/form-data)

- Text fields: `submitterName`, `contentType`, `title`, `description`, etc.
- Files: `file_0`, `file_1`, ... (up to 10)
- Tags: JSON string array

**Response:**

```json
{
  "success": true,
  "message": "Submission received successfully",
  "data": {
    "timestamp": "2025-10-09T...",
    "contentType": "article",
    "title": "My Article",
    "fileCount": 3
  }
}
```

---

## 🗄️ Database Schema (Optional but Recommended)

### Create these tables in Supabase:-

```sql
-- Applications Table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  discord_id TEXT,
  email TEXT NOT NULL,
  age INTEGER,
  timezone TEXT,
  desired_role TEXT NOT NULL,
  secondary_role TEXT,
  experience_years TEXT,
  previous_staff_exp BOOLEAN DEFAULT FALSE,
  previous_servers TEXT,
  relevant_skills TEXT[],
  available_hours_per_week TEXT,
  available_days TEXT[],
  why_join TEXT,
  strengths TEXT,
  handle_conflict TEXT,
  portfolio_link TEXT,
  referred_by TEXT,
  pathway TEXT DEFAULT 'default',
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  decision TEXT,
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- Appeals Table
CREATE TABLE appeals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_username TEXT NOT NULL,
  discord_id TEXT,
  email TEXT NOT NULL,
  appeal_type TEXT NOT NULL,
  punishment_date DATE,
  moderator_name TEXT,
  reason TEXT,
  what_happened TEXT NOT NULL,
  why_unfair TEXT NOT NULL,
  what_changed TEXT NOT NULL,
  will_follow BOOLEAN DEFAULT TRUE,
  additional_info TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  decision TEXT,
  decision_reason TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- Complaints Table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_username TEXT,
  reporter_email TEXT NOT NULL,
  reported_username TEXT NOT NULL,
  reported_user_id TEXT,
  violation_type TEXT NOT NULL,
  location TEXT,
  incident_date DATE,
  description TEXT NOT NULL,
  witnesses TEXT,
  previous_incidents BOOLEAN DEFAULT FALSE,
  urgency TEXT DEFAULT 'normal',
  anonymous BOOLEAN DEFAULT FALSE,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  action_taken TEXT,
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_name TEXT NOT NULL,
  submitter_discord TEXT,
  submitter_email TEXT NOT NULL,
  content_type TEXT NOT NULL,
  pathway TEXT DEFAULT 'default',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_body TEXT,
  tags TEXT[],
  external_link TEXT,
  allow_comments BOOLEAN DEFAULT TRUE,
  allow_sharing BOOLEAN DEFAULT TRUE,
  attribution TEXT,
  license TEXT DEFAULT 'cc-by',
  file_urls TEXT[],
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  published_at TIMESTAMP,
  rejection_reason TEXT,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted ON applications(submitted_at DESC);
CREATE INDEX idx_appeals_status ON appeals(status);
CREATE INDEX idx_appeals_submitted ON appeals(submitted_at DESC);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_urgency ON complaints(urgency);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted ON submissions(submitted_at DESC);
```

---

## 🔒 Implementing Database Storage

Uncomment the database secions in each route file:

### Example for Applications:-

```javascript
// In /api/applications/route.js

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const { data, error } = await supabase.from('applications').insert({
  full_name: fullName,
  discord_username: discordUsername,
  discord_id: discordId,
  email,
  age: parseInt(age),
  timezone,
  desired_role: desiredRole,
  secondary_role: secondaryRole,
  experience_years: experienceYears,
  previous_staff_exp: previousStaffExp,
  previous_servers: previousServers,
  relevant_skills: relevantSkills,
  available_hours_per_week: availableHoursPerWeek,
  available_days: availableDays,
  why_join: whyJoin,
  strengths,
  handle_conflict: handleConflict,
  portfolio_link: portfolioLink,
  referred_by: referredBy,
  pathway,
  status: 'pending',
  submitted_at: timestamp
});

if (error) throw error;
```

---

## 📎 File Upload Implementation

### Option 1: Supabase Storage (Recommended)

```javascript
// Install: npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Upload files
const fileUrls = [];
for (const file of evidenceFiles) {
  const fileName = `appeals/${timestamp}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file);
  
  if (!error) {
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);
    fileUrls.push(publicUrl);
  }
}
```

### Option 2: AWS S3

```javascript
// Install: npm install @aws-sdk/client-s3

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

for (const file of evidenceFiles) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `appeals/${timestamp}-${file.name}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type
  }));
  
  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  fileUrls.push(fileUrl);
}
```

---

## 📧 Email Notifications

Add to each route (using Nodemailer from ContactForm setup):

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send confirmation to user
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: data.email,
  subject: 'Application Received - The Conclave',
  html: `
    <h2>Thank you for your application!</h2>
    <p>We've received your application for the <strong>${data.desiredRole}</strong> position.</p>
    <p>Our team will review it within 3-5 business days.</p>
    <p>Application ID: ${timestamp}</p>
  `
});

// Send notification to admin
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'kundansmishra@gmail.com',
  subject: `New Application - ${data.desiredRole}`,
  html: `
    <h2>New Staff Application</h2>
    <p><strong>Name:</strong> ${data.fullName}</p>
    <p><strong>Role:</strong> ${data.desiredRole}</p>
    <p><strong>Email:</strong> ${data.email}</p>
  `
});
```

---

## 🔐 Security Enhancements

### 1. Rate Limiting

```bash
npm install rate-limiter-flexible
```

```javascript
// Add to each route
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 3, // 3 submissions
  duration: 3600, // per hour
});

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await rateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  
  // ... rest of code
}
```

### 2. Input Sanitization

```bash
npm install validator
```

```javascript
import validator from 'validator';

// Sanitize inputs
const sanitizedData = {
  email: validator.isEmail(email) ? validator.normalizeEmail(email) : null,
  title: validator.escape(title),
  description: validator.escape(description)
};
```

### 3. File Type Validation

```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const maxSize = 10 * 1024 * 1024; // 10MB

for (const file of files) {
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Invalid file type' },
      { status: 400 }
    );
  }
  
  if (file.size > maxSize) {
    return NextResponse.json(
      { success: false, message: 'File too large' },
      { status: 400 }
    );
  }
}
```

---

## 🧪 Testing API Routes

### Using cURL:-

```bash
# Test Applications
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "discordUsername": "test#0000",
    "email": "test@example.com",
    "desiredRole": "moderator",
    "experienceYears": "beginner",
    "relevantSkills": ["moderation"],
    "availableHoursPerWeek": "10-15",
    "availableDays": ["Monday", "Tuesday"],
    "whyJoin": "I want to help the community grow and maintain a positive environment for all members.",
    "strengths": "Good communication and patience",
    "handleConflict": "I would listen to both sides and make a fair decision",
    "agreeToTerms": true,
    "agreeToNDA": true,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
  }'
```

### Using Postman:-

1. Import collection from `/postman_collection.json` (create this)
2. Set environment variables
3. Test each endpoint

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All webhooks created in Discord
- [ ] Environment variables set in Vercel/hosting
- [ ] Database tables created
- [ ] File storage configured (Supabase/S3)
- [ ] Email service tested
- [ ] Rate limiting implemented
- [ ] Input validation working
- [ ] Error handling tested
- [ ] All routes return proper status codes
- [ ] Tested with real form submissions
- [ ] Monitoring/logging setup (optional)

---

## 📊 Monitoring & Logs

### View logs in Vercel:-

```bash
vercel logs
```

### Add custom logging:-

```javascript
// In each route
console.log('[Applications] New submission:', {
  timestamp,
  role: desiredRole,
  email: email.substring(0, 3) + '***' // Partially hide for privacy
});
```

---

## 🎯 Next Steps

1. **Create webhooks** in Discord (5 min)
2. **Add environment variables** to `.env.local`
3. **Test locally** with `npm run dev`
4. **Set up database** (optional but recommended)
5. **Configure file storage** (for appeals/complaints/submissions)
6. **Deploy to Vercel** and test in production
7. **Monitor logs** for any issues

---
