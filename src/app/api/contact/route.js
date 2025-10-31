// /src/app/api/contact/route.js
// API route to handle contact form submissions
// Sends to email (kundansmishra@gmail.com) and Discord webhook

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      subject,
      message,
      discordUsername,
      urgency,
      timestamp,
      pathway,
      targetEmail,
      targetDiscord
    } = body;
    
    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Prepare email content
    const emailContent = `
New Contact Form Submission - The Conclave

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM: ${name}
EMAIL: ${email}
${discordUsername ? `DISCORD: ${discordUsername}` : ''}
URGENCY: ${urgency.toUpperCase()}
PATHWAY: ${pathway || 'default'}
TIMESTAMP: ${new Date(timestamp).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBJECT: ${subject || 'No subject'}

MESSAGE:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply to: ${email}
    `.trim();
    
    // Send email using your preferred service
    // Option 1: Nodemailer (recommended)
    // Option 2: SendGrid
    // Option 3: Resend
    // Option 4: AWS SES
    
    // Example with Nodemailer:
    
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: `[Conclave Contact] ${subject || 'New Message'} - ${urgency.toUpperCase()}`,
      text: emailContent,
      replyTo: email
    });
    
    
    // Send to Discord webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (discordWebhookUrl) {
      const urgencyColors = {
        low: 0x95A5A6,      // Gray
        normal: 0x3498DB,   // Blue
        high: 0xF39C12,     // Orange
        urgent: 0xE74C3C    // Red
      };
      
      const pathwayEmojis = {
        gaming: '🎮',
        lorebound: '📚',
        productive: '⚙️',
        news: '📰',
        default: '✉️'
      };
      
      const discordEmbed = {
        embeds: [{
          title: '📬 New Contact Form Submission',
          description: `**${name}** has sent a message`,
          color: urgencyColors[urgency] || urgencyColors.normal,
          fields: [
            {
              name: '👤 Contact Information',
              value: `**Email:** ${email}\n${discordUsername ? `**Discord:** ${discordUsername}` : ''}`,
              inline: false
            },
            {
              name: '📋 Subject',
              value: subject || 'No subject provided',
              inline: false
            },
            {
              name: '💬 Message',
              value: message.length > 1000 ? message.substring(0, 1000) + '...' : message,
              inline: false
            },
            {
              name: '⚡ Urgency',
              value: urgency.toUpperCase(),
              inline: true
            },
            {
              name: `${pathwayEmojis[pathway] || pathwayEmojis.default} Pathway`,
              value: pathway || 'Default',
              inline: true
            }
          ],
          footer: {
            text: `The Conclave Contact System • ${new Date(timestamp).toLocaleString()}`
          },
          timestamp: timestamp
        }],
        content: urgency === 'urgent' ? `@everyone **URGENT MESSAGE** from ${name}` : null
      };
      
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordEmbed),
      });
    }
    
    // Optional: Send DM to specific Discord user (darkpower797)
    // This requires Discord Bot setup with your bot token
    // See: https://discord.js.org/#/docs/main/stable/general/welcome
    
    /*
    const { Client, GatewayIntentBits } = require('discord.js');
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });
    
    await client.login(process.env.DISCORD_BOT_TOKEN);
    
    const user = await client.users.fetch('YOUR_USER_ID'); // Get your Discord user ID
    await user.send({
      embeds: [discordEmbed.embeds[0]]
    });
    
    await client.destroy();
    */
    
    // Optional: Store in database
    /*
    const { createClient } = require('@supabase/supabase-js');
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
      timestamp,
      status: 'pending'
    });
    */
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        timestamp,
        name,
        urgency
      }
    });
    
  } catch (error) {
    console.error('Contact form API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for testing)
export async function GET() {
  return NextResponse.json({
    message: 'The Conclave Contact API',
    methods: ['POST'],
    version: '1.0'
  });
}