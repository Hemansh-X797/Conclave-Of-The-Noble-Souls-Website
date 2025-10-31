# Folder Structure for Extras

/.github
├── workflows/
│   ├── deploy.yml               # Auto-deploy on push to main or tags
│   ├── lint-and-test.yml        # Linting, ESLint, Prettier, and unit tests
│   ├── cspell-check.yml         # Spellchecking using cspell
│   ├── security-scan.yml        # Audit for npm package vulnerabilities
│   └── issue-labeler.yml        # Auto-label issues with keywords
│
├── ISSUE_TEMPLATE/
│   ├── bug_report.md            # Template for reporting bugs
│   ├── feature_request.md       # Template for requesting new features
│   └── general_question.md      # Template for community questions
│
├── PULL_REQUEST_TEMPLATE.md     # Standard structure for PRs
├── CONTRIBUTING.md              # How to contribute (branching, PRs, code style)
├── CODE_OF_CONDUCT.md           # Community standards (based on Contributor Covenant)
├── SECURITY.md                  # How to report vulnerabilities
├── FUNDING.yml                  # Optional: GitHub Sponsors / Ko-fi / Buy Me a Coffee
└── SUPPORT.md                   # How to get support or join Discord community

/.storybook
├── main.js               # Core configuration for Storybook (addons, paths, etc.)
├── preview.js            # Global decorators, parameters (themes, backgrounds)
├── manager.js            # (Optional) Customizes the Storybook UI itself
├── tsconfig.json         # (If using TS)
├── stories/              # Optional starter stories
│   └── Welcome.stories.jsx

/.vercel
├── project.json      # Links this repo to your Vercel project
├── output/           # Build output for custom builds (optional)
└── .gitignore        # Usually ignored from source control
