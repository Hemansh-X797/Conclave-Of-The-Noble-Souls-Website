# Contact Form Setup Guide

## 📋 Overview

The ContactForm component sends messages to:

- **Email:** "<kundansmishra@gmail.com>"
- **Discord:** darkpower797 (via webhook)

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install nodemailer
# OR if using other services:
npm install @sendgrid/mail
npm install resend
```

### 2. Create Discord Webhook

1. Go to your Discord server
2. Navigate to: Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Name it "Conclave Contact"
5. Select channel for notifications
6. Copy the webhook URL

### 3. Environment Variables

Create/update `.env.local`:

```env
# Discord Webhook (REQUIRED)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# Email Configuration (Choose ONE method)

# Option 1: Gmail with App Password (EASIEST)
EMAIL_USER=kundansmishra@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Option 2: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Option 3: Resend
RESEND_API_KEY=your_resend_api_key

# Optional: Discord Bot (for DMs)
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_USER_ID=your_discord_user_id

# Optional: Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

---

## 📧 Email Setup Options

### Option 1: Gmail (Recommended for Personal Use)

**Step 1:** Enable 2-Factor Authentication on Gmail
**Step 2:** Generate App Password

- Go to: <https://myaccount.google.com/apppasswords>
- Select "Mail" and "Other (Custom name)"
- Name it "Conclave Contact"
- Copy the 16-character password

**Step 3:** Update `/api/contact/route.js`:

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'kundansmishra@gmail.com',
  subject: `[Conclave Contact] ${subject || 'New Message'}`,
  text: emailContent,
  html: `<pre>${emailContent}</pre>`,
  replyTo: email
});
```

### Option 2: SendGrid (Better for Production)

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'kundansmishra@gmail.com',
  from: 'noreply@yourconclavedomain.com', // Must be verified in SendGrid
  subject: `[Conclave Contact] ${subject || 'New Message'}`,
  text: emailContent,
  html: `<pre>${emailContent}</pre>`,
  replyTo: email
});
```

### Option 3: Resend (Modern Alternative)

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourconclavedomain.com',
  to: 'kundansmishra@gmail.com',
  subject: `[Conclave Contact] ${subject || 'New Message'}`,
  text: emailContent,
  replyTo: email
});
```

---

## 🤖 Discord DM Setup (Optional)

To receive DMs directly on Discord:

### Step 1: Create Discord Bot

1. Go to: <https://discord.com/developers/applications>
2. Click "New Application"
3. Name it "Conclave Contact Bot"
4. Go to "Bot" tab → Click "Add Bot"
5. Enable "Message Content Intent"
6. Copy the bot token

### Step 2: Get Your Discord User ID

1. Enable Developer Mode in Discord (Settings → Advanced)
2. Right-click your username → "Copy ID"

### Step 3: Invite Bot to Server

Create invite URL with these permissions:

```txt
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=2048&scope=bot
```

### Step 4: Add to API Route

```javascript
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
});

await client.login(process.env.DISCORD_BOT_TOKEN);

const user = await client.users.fetch(process.env.DISCORD_USER_ID);
await user.send({
  embeds: [{
    title: '📬 New Contact Message',
    description: `From: ${name} (${email})`,
    fields: [
      { name: 'Subject', value: subject || 'No subject' },
      { name: 'Message', value: message.substring(0, 1000) }
    ],
    color: 0xFFD700,
    timestamp: new Date()
  }]
});

await client.destroy();
```

---

## 💾 Database Storage (Optional)

Store submissions in Supabase:

### Create Table:-

```sql
create table contact_submissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  discord_username text,
  subject text,
  message text not null,
  urgency text default 'normal',
  pathway text default 'default',
  status text default 'pending',
  created_at timestamp with time zone default now(),
  replied_at timestamp with time zone
);
```

### Add to API Route:-

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

await supabase.from('contact_submissions').insert({
  name,
  email,
  discord_username: discordUsername,
  subject,
  message,
  urgency,
  pathway,
  status: 'pending'
});
```

---

## 🎨 Usage Example

```jsx
import ContactForm from '@/components/forms/ContactForm';

// Basic usage
<ContactForm />

// With pathway theming
<ContactForm pathway="gaming" />

// With callbacks
<ContactForm
  onSuccess={(data) => {
    console.log('Message sent!', data);
    // Redirect or show custom success message
  }}
  onError={(error) => {
    console.error('Failed:', error);
    // Show custom error handling
  }}
/>

// Custom configuration
<ContactForm
  title="Get in Touch"
  subtitle="We'd love to hear from you"
  requireSubject={false}
  maxMessageLength={5000}
  showHeader={true}
/>
```

---

## 🧪 Testing

### Test the API Route:-

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message",
    "urgency": "normal",
    "pathway": "gaming",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
  }'
```

### Expected Response:-

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "timestamp": "2025-10-08T...",
    "name": "Test User",
    "urgency": "normal"
  }
}
```

---

## 🔒 Security Considerations

1. **Rate Limiting:** Add rate limiting to prevent spam
2. **CAPTCHA:** Consider adding reCAPTCHA for public forms
3. **Input Sanitization:** Already handled in validation
4. **CORS:** Configure properly for production
5. **Environment Variables:** Never commit `.env.local` to Git

### Add Rate Limiting:-

```javascript
// Install: npm install rate-limiter-flexible
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 3, // 3 requests
  duration: 60, // per 60 seconds
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
  
  // ... rest of the code
}
```

---

## 📝 Troubleshooting

### Email not sending:-

- Check Gmail App Password is correct
- Verify 2FA is enabled on Gmail
- Check spam/junk folder
- Review API route logs

### Discord webhook not working:-

- Verify webhook URL is correct
- Check webhook channel permissions
- Test webhook directly with curl

### Form submission fails:-

- Check browser console for errors
- Verify API route exists at `/api/contact/route.js`
- Check server logs for detailed errors

---

## ✅ Checklist

- [ ] Discord webhook created and URL added to `.env.local`
- [ ] Email service configured (Gmail/SendGrid/Resend)
- [ ] Environment variables set correctly
- [ ] API route file created at `/api/contact/route.js`
- [ ] Tested form submission locally
- [ ] Received test email successfully
- [ ] Received Discord notification successfully
- [ ] (Optional) Database table created
- [ ] (Optional) Discord bot configured for DMs
- [ ] Rate limiting implemented
- [ ] Ready for production deployment

---
