# indelible.Blob Repository Structure
## Proposed Organization for Founding Documents & Code

---

## Proposed Directory Structure

```
indelible-blob/
│
├── README.md                                    # Project overview and quick start
│
├── docs/
│   │
│   ├── CONSTITUTION.md                          # Core founding document
│   ├── OPERATIONS_MANUAL.md                     # How we work together
│   ├── TECHNICAL_ARCHITECTURE.md                # System design and tech stack
│   ├── AGENT_PLAYBOOKS.md                       # Role-specific guides
│   ├── ORGANIZATIONAL_STRUCTURE.md              # Visual hierarchy and flows
│   ├── FOUNDING_DOCUMENTS_INDEX.md              # Master index
│   │
│   ├── protocols/
│   │   ├── GIT_WORKFLOW.md                      # Git branching and PR process
│   │   ├── ENGINEERING_AGENTS.md                # Engineering agent definitions
│   │   ├── COMMUNICATION_PROTOCOLS.md           # Daily/weekly sync formats
│   │   └── SECURITY_STANDARDS.md                # Security practices and standards
│   │
│   ├── decisions/
│   │   ├── DECISIONS.md                         # All major decisions with rationale
│   │   └── ARCHITECTURE_DECISIONS.md            # Technical architecture decisions
│   │
│   └── guides/
│       ├── ONBOARDING.md                        # New agent onboarding guide
│       ├── DEVELOPMENT_SETUP.md                 # Local development environment
│       └── DEPLOYMENT.md                        # Deployment procedures
│
├── src/
│   │
│   ├── mobile/                                  # React Native iOS/Android
│   │   ├── README.md
│   │   ├── package.json
│   │   └── [mobile source code]
│   │
│   ├── backend/                                 # Node.js backend API
│   │   ├── README.md
│   │   ├── package.json
│   │   └── [backend source code]
│   │
│   ├── website/                                 # React/Next.js marketing website
│   │   ├── README.md
│   │   ├── package.json
│   │   └── [website source code]
│   │
│   ├── marketplace/                             # Marketplace platform
│   │   ├── README.md
│   │   ├── package.json
│   │   └── [marketplace source code]
│   │
│   └── shared/                                  # Shared utilities and libraries
│       ├── README.md
│       ├── package.json
│       └── [shared code]
│
├── tools/
│   │
│   ├── sui/
│   │   ├── contracts/                           # Sui smart contracts
│   │   ├── download-sui-binaries.sh             # Setup script
│   │   └── README.md
│   │
│   ├── solana/
│   │   ├── programs/                            # Solana programs
│   │   └── README.md
│   │
│   ├── walrus/
│   │   ├── integration/                         # Walrus storage integration
│   │   └── README.md
│   │
│   ├── seal/
│   │   ├── integration/                         # Seal encryption integration
│   │   └── README.md
│   │
│   └── scripts/
│       ├── setup.sh                             # Initial setup
│       ├── dev.sh                               # Development environment
│       ├── test.sh                              # Run all tests
│       ├── build.sh                             # Build all services
│       └── deploy.sh                            # Deploy to production
│
├── tests/
│   ├── unit/                                    # Unit tests
│   ├── integration/                             # Integration tests
│   ├── e2e/                                     # End-to-end tests
│   └── security/                                # Security tests
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                               # CI/CD pipeline
│   │   ├── security-scan.yml                    # Security scanning
│   │   └── deploy.yml                           # Deployment workflow
│   │
│   ├── pull_request_template.md                 # PR template
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── config/
│   ├── .env.example                             # Environment variables template
│   ├── database/
│   │   ├── schema.sql                           # Database schema
│   │   └── migrations/                          # Database migrations
│   │
│   └── docker/
│       ├── Dockerfile.api
│       ├── Dockerfile.mobile
│       ├── docker-compose.yml
│       └── docker-compose.prod.yml
│
├── logs/                                        # (gitignored) Application logs
├── node_modules/                                # (gitignored) Dependencies
├── .env                                         # (gitignored) Local environment
├── .env.staging                                 # (gitignored) Staging environment
├── .env.production                              # (gitignored) Production environment
│
├── .gitignore                                   # Git ignore rules
├── package.json                                 # Root package.json
├── package-lock.json                            # Dependency lock file
├── tsconfig.json                                # TypeScript configuration
├── eslint.config.js                             # ESLint configuration
├── prettier.config.js                           # Prettier configuration
│
└── LICENSE                                      # MIT or similar

```

---

## Directory Organization Rationale

### `/docs` - Founding Documents & Protocols
All documentation that guides the organization lives here, organized logically:

- **Root level:** Core founding documents (Constitution, Operations Manual, etc.)
- **`/protocols`:** Operational procedures (git workflow, communication, security)
- **`/decisions`:** Decision logs and architectural decisions
- **`/guides`:** How-to guides for common tasks

This is where agents go to understand **who we are**, **how we work**, and **what we're building**.

### `/src` - Application Code
Code organized by domain/service:

- **`/mobile`:** React Native app (iOS/Android)
- **`/backend`:** Node.js API server
- **`/website`:** Marketing website
- **`/marketplace`:** Marketplace platform
- **`/shared`:** Shared utilities and libraries

Each domain has its own README and package.json for clarity.

### `/tools` - Blockchain & Infrastructure Integration
Integration code for external systems:

- **`/sui`:** Sui blockchain integration
- **`/solana`:** Solana blockchain integration
- **`/walrus`:** Walrus storage integration
- **`/seal`:** Seal encryption integration
- **`/scripts`:** Utility scripts for setup, testing, building, deploying

### `/tests` - Test Suites
All tests organized by type:

- **`/unit`:** Unit tests for individual components
- **`/integration`:** Integration tests for systems
- **`/e2e`:** End-to-end tests for user flows
- **`/security`:** Security-specific tests

### `/.github` - GitHub Configuration
GitHub-specific configuration:

- **`/workflows`:** CI/CD pipelines
- **`/ISSUE_TEMPLATE`:** Issue templates
- **`pull_request_template.md`:** PR template

### `/config` - Configuration Files
Configuration for databases, Docker, environment variables:

- **`/database`:** Schema and migrations
- **`/docker`:** Docker configurations

### Root Level Files
Essential files at the root:

- **`README.md`:** Project overview, quick start, links to docs
- **`.gitignore`:** Files to ignore in git
- **`package.json`:** Root dependencies
- **`tsconfig.json`:** TypeScript configuration
- **`eslint.config.js`:** Linting rules
- **`prettier.config.js`:** Code formatting rules

---

## Key Improvements Over Current Structure

### ✅ Clear Separation of Concerns
- Documentation is separate from code
- Protocols are organized logically
- Each domain has clear ownership

### ✅ Easy Navigation
- Agents can quickly find what they need
- Clear hierarchy and organization
- Consistent naming conventions

### ✅ Scalability
- Easy to add new services/domains
- Easy to add new protocols or guides
- Structure supports growth

### ✅ Professional & Polished
- Looks like a serious, well-organized project
- Reflects the quality of your founding documents
- Inspires confidence in investors and partners

### ✅ Supports All Agent Roles
- Manus agents find business/strategy docs easily
- Engineering agents find technical docs easily
- Everyone can find operational procedures
- Clear decision trail in `/decisions`

---

## How Agents Will Use This Structure

### Manus Agents
```
docs/
├── CONSTITUTION.md                    ← Read first
├── OPERATIONS_MANUAL.md               ← Read second
├── AGENT_PLAYBOOKS.md                 ← Your role
├── ORGANIZATIONAL_STRUCTURE.md        ← Understand the system
├── decisions/DECISIONS.md             ← Review decisions
└── guides/ONBOARDING.md               ← If new agent
```

### Antigravity Sub-Agents
```
docs/
├── CONSTITUTION.md                    ← Read first
├── TECHNICAL_ARCHITECTURE.md          ← Read second
├── AGENT_PLAYBOOKS.md                 ← Your role
├── protocols/GIT_WORKFLOW.md          ← How to contribute
├── protocols/ENGINEERING_AGENTS.md    ← Agent definitions
├── decisions/ARCHITECTURE_DECISIONS.md ← Technical decisions
└── guides/DEVELOPMENT_SETUP.md        ← Set up environment

src/[your-domain]/                     ← Your code
tools/[your-tools]/                    ← Your tools
tests/                                 ← Your tests
```

### Executive Engineer
```
docs/
├── CONSTITUTION.md
├── OPERATIONS_MANUAL.md
├── TECHNICAL_ARCHITECTURE.md
├── AGENT_PLAYBOOKS.md
├── ORGANIZATIONAL_STRUCTURE.md
├── protocols/                         ← All protocols
├── decisions/                         ← All decisions
└── guides/

src/                                   ← Oversee all code
tools/                                 ← Oversee all tools
tests/                                 ← Oversee all tests
```

---

## GitHub Integration

Once pushed to GitHub, this structure enables:

1. **Clear Documentation** - Agents can find what they need quickly
2. **Proper Code Organization** - Each domain has clear ownership
3. **CI/CD Automation** - Workflows in `.github/workflows/`
4. **Security Scanning** - Claude Code scans all PRs
5. **Deployment Automation** - Scripts in `/tools/scripts/`
6. **Issue Tracking** - Templates in `.github/ISSUE_TEMPLATE/`

---

## Next Steps

1. **Approve this structure** - Does it make sense?
2. **Create the directories** - Set up the folder structure
3. **Move/organize files** - Put founding documents in `/docs`
4. **Delete old files** - Remove the 8 consolidated documents
5. **Update README.md** - Create comprehensive project overview
6. **Push to GitHub** - Commit and push to origin/master
7. **Verify** - Check that all agents can navigate and find what they need

---

## Questions for You

1. Does this structure make sense?
2. Should we rename the founding documents (shorter names in `/docs`)?
3. Any additions or changes you'd like?
4. Ready to implement?

