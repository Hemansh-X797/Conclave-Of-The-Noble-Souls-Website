# Project Folder Structure

```py
/Conclave
├── /.github
│   ├── /workflows
│   │   ├── ci.yml                  # Continuous integration
│   │   ├── deploy.yml              # Deployment automation
│   │   └── code-quality.yml        # Linting & formatting checks
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md           # Template for reporting bugs
│   │   ├── feature_request.md      # Template for requesting new features
│   │   └── general_question.md     # Template for community questions
│   │
│   ├── PULL_REQUEST_TEMPLATE.md    # Standard structure for PRs
│   ├── SECURITY.md                 # How to report vulnerabilities
│   ├── FUNDING.yml                 # Optional: GitHub Sponsors / Ko-fi / Buy Me a Coffee
│   ├── CODEOWNERS
│   └── SUPPORT.md                  # How to get support or join Discord community
│
│
├── /.vercel
│   └── project.json               # Vercel project configuration
│
├── /.config
│   ├── jest.config.js             # Jest testing configuration
│   └── vitest.config.js           # Vitest configuration
│
├── /public
│   ├── /Assets
│   │   ├── /Images
│   │   │   ├── /nobility          # Crests, crowns, elegant borders
│   │   │   ├── /Pathways
│   │   │   │   ├── /gaming        # Gaming realm imagery
│   │   │   │   ├── /lorebound     # Anime/manga aesthetic assets
│   │   │   │   ├── /productive    # Professional, clean imagery
│   │   │   │   └── /news          # Modern, dynamic assets
│   │   │   ├── /gallery           # Member showcases, events
│   │   │   └── /luxury            # backgrounds
│   │   ├── /Videos
│   │   │   ├── hero-loop.mp4      # Cinematic entrance video
│   │   │   └── /pathway-intros    # Each path gets intro video
│   │   ├── /fonts
│   │   │   ├── playfair-display   # Luxury serif (like RR uses)
│   │   │   ├── inter              # Clean sans-serif
│   │   │   ├── Josefin_sans       # Default font
│   │   │   ├── Ring Of Kerry      # Lorebound heading font
│   │   │   ├── Orbitron           # Gaming-pathway font
│   │   │   └── Cinzel_Decorative  # News-Pathway font
│   │   │
│   │   └── /cursors
│   │       ├── default.png        # Custom noble cursor
│   │       └── hover.png          # Interaction cursor
│   ├── /Audio
│   │   ├── hover.mp3              # Subtle UI sounds
│   │   └── notification.mp3       # Elegant chimes
│   └── /favicon
│       └── favicon.ico
│
├── /src
│   ├── /app                       # Next.js 14 App Router
│   │   ├── layout.jsx             # Root layout with noble theming
│   │   ├── page.jsx               # Homepage - The Great Hall
│   │   ├── /pathways              # 🌟 NEW: Dedicated pathway sections
│   │   │   ├── layout.jsx         # Pathway-specific layouts
│   │   │   ├── /gaming
│   │   │   │   ├── page.jsx       # Gaming Realm entrance
│   │   │   │   ├── /tournaments   # Gaming events
│   │   │   │   ├── /leaderboards  # Gaming achievements
│   │   │   │   ├── /bot-help      # guide to bots and their commands
│   │   │   │   └── /game-news     # News about Gaming
│   │   │   ├── /lorebound
│   │   │   │   ├── page.jsx       # Otaku Sanctuary
│   │   │   │   ├── /library       # Manga/anime discussions
│   │   │   │   ├── /reviews       # Member reviews
│   │   │   │   ├── /collections   # Recommendation lists
│   │   │   │   └── /sites         # Anime/comic/novels site
│   │   │   ├── /productive
│   │   │   │   ├── page.jsx       # Productivity Palace
│   │   │   │   ├── /resources     # Tools and guides
│   │   │   │   ├── /challenges    # Productivity challenges
│   │   │   │   └── /showcase      # Member achievements
│   │   │   └── /news
│   │   │       ├── page.jsx       # News Nexus
│   │   │       ├── /breaking      # Real-time updates
│   │   │       ├── /science       # Science news
│   │   │       ├── /tech          # Technology And AI News
│   │   │       ├── /local         # News of one's local area
│   │   │       ├── /analysis      # Deep dives
│   │   │       └── /discussions   # News debates
│   │   ├── /hall-of-nobles        # Premium member showcase
│   │   ├── /court                 # Staff hierarchy & applications
│   │   ├── /archives              # Server lore & history
│   │   ├── /chambers              # Private member areas
│   │   │   ├── /dashboard         # Member hub after Discord auth
│   │   │   ├── /preferences       # Customize experience
│   │   │   └── /achievements      # Personal progress
│   │   ├── /art-gallery           # Various art
│   │   ├── /sanctum               # 🔒 Moderator Portal
│   │   ├── /throne-room           # 🔒 Admin Portal
│   │   ├── /gateway               # Join/application process
│   │   └── /api
│   │       ├── /auth
│   │       │   └── /discord       # Discord OAuth
│   │       ├── /discord           # Server stats, member verification
│   │       ├── /admin             # Admin operations
│   │       └── /webhooks          # Discord bot integrations
│   │ 
│   ├── /middleware
│   │   ├── auth.js                # Authentication middleware
│   │   ├── rateLimit.js           # API rate limiting
│   │   ├── roleCheck.js           # Role-based access control
│   │   └── logger.js              # Request logging
│   │
│   ├── /constants
│   │   ├── roles.js               # Discord role definitions
│   │   ├── permissions.js         # Permission levels
│   │   ├── pathways.js            # Pathway constants
│   │   ├── colors.js              # Design system colors
│   │   └── config.js              # App-wide configuration
│   │
│   ├── /types
│   │   ├── user.js                # User type definitions
│   │   ├── pathway.js             # Pathway type definitions
│   │   ├── event.js               # Event type definitions
│   │   └── discord.js             # Discord-related types
│   │
│   ├── /components
│   │   ├── /ui                    # Luxury UI primitives
│   │   │   ├── NobleCursor.jsx    # Custom cursor component
│   │   │   ├── SuperButton.jsx    # big card style buttons
│   │   │   ├── LuxuryButton.jsx   # Rolls-Royce style buttons
│   │   │   ├── GlassCard.jsx      # Glassmorphism cards
│   │   │   ├── NobleInput.jsx     # Elegant form inputs
│   │   │   └── LoadingCrest.jsx   # Branded loading animation
│   │   ├── /layout
│   │   │   ├── Navbar.jsx         # Floating glass navigation
│   │   │   ├── Footer.jsx         # Elegant footer with links
│   │   │   ├── Sidebar.jsx        # Collapsible luxury sidebar
│   │   │   ├── Searchbar.jsx      # Luxury minimalistic searchbar
│   │   │   └── PathwayNav.jsx     # Pathway-specific navigation
│   │   ├── /auth
│   │   │   ├── DiscordLogin.jsx   # Elegant Discord auth
│   │   │   ├── AuthGuard.jsx      # Route protection
│   │   │   └── MemberVerify.jsx   # Server membership check
│   │   ├── /pathways
│   │   │   ├── PathwayHero.jsx    # Cinematic pathway intros
│   │   │   ├── PathwayCard.jsx    # Elegant pathway preview
│   │   │   ├── PathProgress.jsx   # Member progress in paths
│   │   │   └── PathRecommend.jsx  # Suggested content
│   │   ├── /content
│   │   │   ├── EventCard.jsx      # Luxury event displays
│   │   │   ├── MemberSpotlight.jsx# Featured member cards
│   │   │   ├── ArticleCard.jsx    # Blog post previews
│   │   │   ├── GalleryGrid.jsx    # Media gallery component
│   │   │   └── AnnouncementBanner.jsx
│   │   ├── /forms
│   │   │   ├── ContactForm.jsx    # Elegant contact form
│   │   │   ├── AppealForm.jsx     # Unban/unwarn/unmute appeals
│   │   │   ├── ApplicationForm.jsx# Staff applications
│   │   │   ├── SubmissionForm.jsx # Content submissions
│   │   │   └── ComplaintForm.jsx  # Member reports
│   │   ├── /interactive
│   │   │   ├── QuizEngine.jsx     # Role assignment quizzes
│   │   │   ├── BadgeSystem.jsx    # Achievement displays
│   │   │   ├── MusicPlayer.jsx    # Ambient noble music
│   │   │   ├── LiveStats.jsx      # Real-time Discord stats
│   │   │   └── NotificationCenter.jsx
│   │   └── /admin
│   │       ├── ContentManager.jsx # Admin content editing
│   │       ├── MemberManager.jsx  # Member oversight
│   │       ├── EventCreator.jsx   # Event management
│   │       └── AnalyticsDash.jsx  # Site analytics
│   │ 
│   ├── /lib
│   │   ├── supabase.js            # Database connection
│   │   ├── discord.js             # Discord API integration
│   │   ├── auth.js                # Authentication logic
│   │   ├── analytics.js           # Custom analytics
│   │   └── utils.js               # Helper functions
│   │ 
│   ├── /hooks
│   │   ├── useAuth.js             # Authentication state
│   │   ├── useDiscord.js          # Discord data fetching
│   │   ├── usePathways.js         # Pathway progress tracking
│   │   ├── useLuxuryTheme.js      # Theme management
│   │   └── useSound.js            # Audio feedback system
│   │ 
│   ├── /styles
│   │   ├── globals.css            # Base styles + custom properties
│   │   ├── content.css            # styles for content components
│   │   ├── luxury.css             # Rolls-Royce inspired styles + UI components
│   │   ├── pathways.css           # Pathway-specific styling
│   │   ├── superbuttons.css       # interactive image embedded big buttons
│   │   ├── design_system.css      # Colours/designs
│   │   ├── typography.css         # Typography
│   │   ├── buttons.css            # Luxury button styles
│   │   ├── animations.css         # Custom keyframes & transitions
│   │   ├── interactive.css        # Interactive component styles
│   │   ├── inputs.css             # Input field styles
│   │   ├── glasscards.css         # Glass card styles
│   │   ├── navbar.css             # Navigation styles
│   │   └── cursors.css            # Custom cursor styles
│   │ 
│   └── /data
│       ├── pathways.js            # Pathway configurations
│       ├── staff.js               # Staff hierarchy
│       ├── events.js              # Event templates
│       └── lore.js                # Server lore & codex
│ 
├── /context
│   ├── AppProvider.jsx            # Provides app state to entire application 
│   └── index.jsx                  # Index file for exporting
│
├── /scripts
│   ├── setup-db.js                # Initialize database
│   ├── seed-data.js               # Populate with sample data
│   ├── migrate.js                 # Run database migrations
│   ├── generate-sitemap.js        # Generate sitemap.xml
│   ├── optimize-images.js         # Compress and optimize images
│   ├── backup-db.js               # Database backup utility
│   ├── sync-discord-roles.js      # Sync roles from Discord
│   └── deploy.js                  # Custom deployment script
│
├── /database
│   ├── /migrations                # Database schema evolution
│   ├── /seeds                     # Sample data for development
│   ├── /functions                 # Supabase stored procedures
│   └── schema.sql                 # Database structure
│ 
├── /blueprint
│   ├── FOLDER_STRUCTURE.md        # This folder structure
│   ├── DATABASE_SCHEMA.md         # Database design
│   ├── API_ENDPOINTS.md           # API documentation
│   ├── COMPONENT_HIERARCHY.md     # Component relationships
│   ├── USER_FLOWS.md              # User journey maps
│   └── DESIGN_TOKENS.md           # Design system tokens
│
├── /docs                          # Development documentation
│   ├── LUXURY_DESIGN_GUIDE.md     # Visual standards
│   ├── PATHWAY_SYSTEM.md          # How pathways work
│   ├── DEPLOYMENT.md              # Going live guide
│   ├── COMPONENTS.md              # Components guide
│   ├── README.md                  # Guide to using
│   └── ARCHITECTURE.md            # Architecture and Folder structure
│
├── package.json
├── jsconfig.json
├── tsconfig.json
├── vercel.json
├── manifest.json
├── next.config.js                 # Next.js optimization
├── tailwind.config.js             # Custom luxury theme
├── postcss.config.js              # post-config file
├── supabase.config.js             # Database configuration
├── prettier.config.js
├── .prettierignore
├── cspell.config.js
├── .eslintrc.js
├── .all-contributorsrc
├── .eslintignore
├── .gitignore                     # gitignore file
├── .env.example
├── .env.production
├── .env.webhooks
├── .env.development
├── .env
├── .nvmrc
├── .stylelintrc.js 
├── .vercelignore
├── verel.json
└── .env.local                     # Environment secrets
```

```python
NOTE: "The public, Docs and app/api folder structure is complex, and hence is not completely shown in this folder, to acess the full public structutre, refer to:"
```

- [[ASSETS_STRUCTURE]] - Complete public structure file
- [[DOCS_INDEX]] - Index file
