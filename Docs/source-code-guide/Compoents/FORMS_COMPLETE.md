# The Conclave Forms System - Complete ✅

## 📋 What's Been Created

### 1. **forms.css** (800+ lines)

Premium dark noble styling for all forms with:

- Glass morphism effects
- Custom inputs, selects, textareas
- Checkbox/radio components
- File upload with drag-and-drop
- Tag input system
- Loading states & animations
- Validation styling
- Fully responsive
- Accessibility features

### 2. **ContactForm.jsx** ✅

- Basic contact form
- Sends to: `kundansmishra@gmail.com` & Discord webhook
- Fields: Name, Email, Discord, Subject, Message, Urgency
- Real-time validation
- Character counting

### 3. **ApplicationForm.jsx** ✅

- Multi-step staff application (4 steps)
- Roles: Moderator, Admin, Event Organizer, Content Creator
- Step indicator with progress bar
- Skills selection
- Availability scheduler
- Detailed questions
- Portfolio upload
- NDA agreement

### 4. **AppealForm.jsx** ✅

- Unban/Unmute/Warning appeals
- Appeal type cards (Ban, Mute, Warn)
- Evidence file upload (max 5 files)
- Detailed incident description
- 50+ character minimums
- Drag & drop support

### 5. **ComplaintForm.jsx** ✅

- Member reporting system
- 9 violation types (harassment, spam, NSFW, hate speech, etc.)
- Anonymous reporting option
- Evidence screenshots
- Witness information
- Urgency levels

### 6. **SubmissionForm.jsx** ✅

- Content submission system
- Types: Article, Artwork, Event, Resource, Guide
- Rich text content area
- Tag system (up to 10 tags)
- File attachments (max 10 files, 20MB each)
- Licensing options (CC BY, CC0, etc.)
- External links

---

## 🚀 Usage Examples

```jsx
import ContactForm from '@/components/forms/ContactForm';
import ApplicationForm from '@/components/forms/ApplicationForm';
import AppealForm from '@/components/forms/AppealForm';
import ComplaintForm from '@/components/forms/ComplaintForm';
import SubmissionForm from '@/components/forms/SubmissionForm';

// Basic usage
<ContactForm />

// With pathway theming
<ContactForm pathway="gaming" />

// With callbacks
<ApplicationForm
  onSuccess={(data) => {
    console.log('Application submitted:', data);
    router.push('/thank-you');
  }}
  onError={(error) => {
    console.error('Submission failed:', error);
  }}
/>

// Custom configuration
<AppealForm
  appealTypes={['ban', 'mute']}
  maxEvidenceFiles={3}
/>

<ComplaintForm
  showHeader={false}
  maxEvidenceFiles={10}
/>

<SubmissionForm
  allowedTypes={['article', 'guide']}
  pathway="gaming"
/>
```

---

## 📂 File Structure

```md
/src/
├── components/
│   └── forms/
│       ├── ContactForm.jsx
│       ├── ApplicationForm.jsx
│       ├── AppealForm.jsx
│       ├── ComplaintForm.jsx
│       └── SubmissionForm.jsx
│
├── styles/
│   └── forms.css
│
└── app/
    └── api/
        ├── contact/
        │   └── route.js
        ├── applications/
        │   └── route.js
        ├── appeals/
        │   └── route.js
        ├── complaints/
        │   └── route.js
        └── submissions/
            └── route.js
```

---

## 🔧 API Routes Needed

Create these API routes for each form:

### `/api/contact/route.js` (Already created ✅)

- Sends email via Nodemailer
- Posts to Discord webhook
- Returns success/error

### `/api/applications/route.js`

```javascript
export async function POST(request) {
  const formData = await request.json();
  
  // Save to database
  // Send email notification
  // Post to Discord admin channel
  
  return NextResponse.json({ success: true });
}
```

### `/api/appeals/route.js`

```javascript
export async function POST(request) {
  const formData = await request.formData();
  
  // Handle file uploads
  // Save to database with status: 'pending'
  // Notify moderation team
  
  return NextResponse.json({ success: true });
}
```

### `/api/complaints/route.js`

```javascript
export async function POST(request) {
  const formData = await request.formData();
  
  // Handle evidence files
  // Save to database
  // Create Discord ticket/thread
  // High urgency = @moderators ping
  
  return NextResponse.json({ success: true });
}
```

### `/api/submissions/route.js`

```javascript
export async function POST(request) {
  const formData = await request.formData();
  
  // Upload files to storage (Supabase Storage, AWS S3, etc.)
  // Save to database with status: 'pending_review'
  // Notify content review team
  
  return NextResponse.json({ success: true });
}
```

---

## 🎨 Styling Integration

All forms automatically use `forms.css`. Make sure to import it globally:

```javascript
// In layout.jsx or _app.js
import '@/styles/forms.css';
```

Forms integrate with your existing components:

- ✅ `TextFlameButton` for submit buttons
- ✅ `TextDimButton` for cancel/reset buttons
- ✅ Noble cursor system (`data-cursor="hover"`)
- ✅ Pathway theming (gaming, lorebound, productive, news)

---

## 🗄️ Database Schema Suggestions

### Applications Table

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  email TEXT NOT NULL,
  desired_role TEXT NOT NULL,
  experience_years TEXT,
  relevant_skills TEXT[],
  why_join TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

### Appeals Table

```sql
CREATE TABLE appeals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_username TEXT NOT NULL,
  email TEXT NOT NULL,
  appeal_type TEXT NOT NULL,
  punishment_date DATE,
  reason TEXT,
  what_happened TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  decision TEXT,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

### Complaints Table

```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_username TEXT,
  reported_username TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  anonymous BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

### Submissions Table

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_body TEXT,
  tags TEXT[],
  pathway TEXT DEFAULT 'default',
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  published_at TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Features Included

**All Forms:**

- ✨ Real-time validation
- 🎨 Noble luxury styling
- 📱 Fully responsive
- ♿ Accessibility compliant
- 🔄 Loading states
- ✅ Success/error alerts
- 🎯 Character counting
- 🖱️ Cursor integration
- 🎨 Pathway theming

**File Uploads:**

- 📎 Drag & drop
- 🖼️ Image preview
- 📄 Multiple file types
- 🗑️ Remove files
- ⚖️ Size validation

**ApplicationForm Only:**

- 📊 Multi-step wizard
- 📈 Progress indicator
- 🎯 Role selection cards
- 📅 Availability scheduler
- ✅ Skills multi-select

**SubmissionForm Only:**

- 🏷️ Tag system
- 📝 Rich content area
- ⚖️ Licensing options
- 🔗 External links

---

## 🎯 What's Next?

1. **Create API routes** for each form
2. **Set up email service** (Nodemailer/SendGrid)
3. **Configure Discord webhooks** for each form type
4. **Create database tables** for storing submissions
5. **Test all forms** thoroughly
6. **Add rate limiting** to prevent spam
7. **Consider adding reCAPTCHA** for public forms

---

## 🔐 Security Recommendations

1. **Rate Limiting:**

   ```bash
   npm install rate-limiter-flexible
   ```

2. **Input Sanitization:**

   ```bash
   npm install dompurify
   ```

3. **File Upload Security:**
   - Validate file types server-side
   - Scan for malware
   - Limit file sizes
   - Store in secure location

4. **CAPTCHA (optional):**

   ```bash
   npm install @hcaptcha/react-hcaptcha
   ```

---

## 📊 Completion Status

| Component | Lines | Status |
|-----------|-------|--------|
| forms.css | 800+ | ✅ Complete |
| ContactForm.jsx | 400+ | ✅ Complete |
| ApplicationForm.jsx | 900+ | ✅ Complete |
| AppealForm.jsx | 600+ | ✅ Complete |
| ComplaintForm.jsx | 500+ | ✅ Complete |
| SubmissionForm.jsx | 500+ | ✅ Complete |

**Total Lines:** ~3,700+ lines of premium form code! 🎉

---
