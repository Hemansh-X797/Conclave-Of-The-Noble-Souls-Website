# API Routes structure

```bash
/src
 └── /app
     └── /api
         ├── /admin
         │   ├── /content
         │   │   ├── /[id]                    # Dynamic route for content ID
         │   │   │   └── route.js             # Route for a specific content ID
         │   │   └── route.js                 # Route for content
         │   ├── /events
         │   │   └── route.js                 # Events related routes
         │   ├── /moderation
         │   │   └── route.js                 # Moderation related routes
         │   ├── /roles
         │   │   └── route.js                 # Roles related routes
         │   └── /upload
         │       └── route.js                 # Upload related routes
         ├── /appeals
         │   └── route.js                     # Appeals related routes
         ├── /applications
         │   └── route.js                     # Applications related routes
         ├── /auth
         │   ├── /discord
         │   │   ├── /callback
         │   │   │   └── route.js             # Discord callback
         │   │   ├── /url
         │   │   │   └── route.js             # Discord URL generation
         │   │   ├── nextauth.ts              # NextAuth setup
         │   │   └── route.js                 # Discord auth routes
         │   ├── /logout
         │   │   └── route.js                 # Logout route
         │   ├── /refresh
         │   │   └── route.js                 # Refresh token route
         │   ├── /user
         │   │   └── route.js                 # User authentication routes
         │   └── /validate
         │       └── route.js                 # Validate user session
         ├── /complaints
         │   └── route.js                     # Complaints related routes
         ├── /contact
         │   └── route.js                     # Contact related routes
         ├── /discord
         │   ├── /auto-invite
         │   │   └── route.js                 # Auto-invite related routes
         │   ├── /callback
         │   │   └── route.js                 # Callback routes
         │   ├── /create-event
         │   │   └── route.js                 # Create event route
         │   ├── /members
         │   │   └── route.js                 # Members related routes
         │   ├── /stats
         │   │   └── route.js                 # Stats related routes
         │   └── /verify-membership
         │       └── route.js                 # Verify membership
         ├── /pathways
         │   ├── /[pathwayId]
         │   │   ├── /progress
         │   │   │   ├── /[userId]            # Progress for a specific user
         │   │   │   └── route.js             # General progress route
         │   │   └── route.js                 # Specific pathway route
         │   ├── /join
         │   │   └── route.js                 # Join pathway
         │   ├── /leave
         │   │   └── route.js                 # Leave pathway
         │   └── /progress
         │       └── route.js                 # Global progress route
         ├── /submissions
         │   └── route.js                     # Submissions related routes
         └── /webhooks
             ├── /appeals
             │   └── route.js                 # Webhook for appeals
             ├── /applications
             │   └── route.js                 # Webhook for applications
             ├── /complaints
             │   └── route.js                 # Webhook for complaints
             ├── /contact
             │   └── route.js                 # Webhook for contact
             ├── /discord
             │   └── route.js                 # Webhook for discord
             └── /submissions
                 └── route.js                 # Webhook for submissions
```
