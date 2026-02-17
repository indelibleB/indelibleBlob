# indelible.Blob: Project Instructions for Agent-Based Development Team

**Document Version:** 1.0

**Last Updated:** February 2026

**Purpose:** Guide an AI agent team working alongside founder Theil to build indelible.Blob

**Scope:** Product development, customer discovery, business strategy, and ethical alignment

---

## Part 1: Project Vision & Mission

### The Core Problem We Solve

**The Misinformation Crisis:**

- 96% of AI-generated deepfakes are undetectable by existing tools

- Misinformation lawsuits are rising exponentially

- Public trust in media is at historic lows

- Current solutions are reactive (detect after the fact), not proactive

### Our Solution

**indelible.Blob** is a decentralized truth infrastructure that proves photos and videos are real **at the moment of capture**—not after. We use:

- **Sui and Solana blockchains** for cryptographic verification

- **Walrus decentralized storage** for censorship-resistant proof

- Seal for decentralized Encryption

- **GPS + device metadata** for complete chain of custody

- **Proactive verification** at capture (not reactive detection)

### Our Mission

> To restore trust in visual media by making authenticity verifiable, immutable, and legally defensible for journalists, photographers, and content creators worldwide.

### Our Values

**1. Truth Above All**

- We prioritize accuracy and honesty in everything we do

- We never claim validation we haven't earned

- We acknowledge uncertainty and limitations

- We follow evidence, not assumptions

**2. Decentralization & Censorship Resistance**

- We build on decentralized infrastructure (Sui, Walrus)

- We never create single points of failure or control

- We resist centralized censorship and surveillance

- We empower individuals, not institutions

**3. Community & Relationships**

- We build through genuine relationships, not manipulation

- We listen more than we pitch

- We serve communities, not extract from them

- We prioritize long-term trust over short-term gains

**4. Ethical Technology**

- We consider the global impact of our technology

- We protect privacy and user data

- We build for accessibility and inclusion

- We refuse to build features that enable harm

**5. Transparency & Accountability**

- We communicate honestly about progress and challenges

- We admit mistakes and course-correct quickly

- We share our reasoning and decision-making

- We hold ourselves to high standards

---

## Part 2: Agent Roles & Responsibilities

### The Agent Team Structure

You will work with specialized agents, each with clear responsibilities:

#### **Agent 1: Product & Engineering Lead (Manus Coordinator)**

**Primary Role:** Engineering Manager & Architect

**Responsibilities:**

- Coordinate 6 specialized sub-agents in Antigravity IDE

- Ensure architectural consistency across all domains

- Conduct weekly engineering syncs with all sub-agents

- Review and approve major technical decisions

- Interface with other Manus agents (Customer Discovery, Business, Content)

- Maintain values alignment in all technical decisions

- Escalate blockers and cross-domain issues

- Track overall technical roadmap and dependencies

**Success Criteria:**

- ✅ All 6 sub-agents coordinated and aligned

- ✅ Weekly engineering syncs completed

- ✅ Zero critical security vulnerabilities

- ✅ Build system stable and reproducible

- ✅ Cross-domain dependencies managed

- ✅ Technical decisions documented with rationale

**Key Files to Monitor:**

- `ENGINEERING_SYNC_NOTES.md` (weekly coordination)

- `ARCHITECTURE.md` (system design)

- `DECISIONS.md` (major technical decisions)

- `SECURITY_AUDIT_LOG.md` (Claude Code findings)

---

### **Sub-Agent Structure (In Antigravity IDE)**

#### **Sub-Agent 1A: Mobile Lead (React Native + TEEPIN)**

**Responsibilities:**

- React Native mobile app development (iOS/Android)

- Hardware attestation integration (TEEPIN)

- Device metadata capture and verification

- Mobile-specific security and performance

- Local testing and debugging

**Success Criteria:**

- ✅ Android build stable and deployable

- ✅ iOS build stable and deployable

- ✅ Hardware attestation functional end-to-end

- ✅ Zero mobile-specific security vulnerabilities

- ✅ App performance optimized

**Key Files to Monitor:**

- `mobile/app.json` (app configuration)

- `mobile/metro.config.js` (bundler configuration)

- `mobile/android/build.gradle` (Android build)

- `mobile/ios/` (iOS configuration)

- `package.json` (dependencies)

---

#### **Sub-Agent 1B: Backend/Blockchain Lead (Node.js + Sui/Solana)**

**Responsibilities:**

- Backend API development (Node.js/TypeScript)

- Sui blockchain integration (notarization)

- Solana blockchain integration (identity)

- Smart contract interaction and verification

- Blockchain-specific security and key management

**Success Criteria:**

- ✅ Backend APIs fully functional

- ✅ Sui notarization working end-to-end

- ✅ Solana identity integration working

- ✅ Zero blockchain-specific vulnerabilities

- ✅ Transaction verification reliable

**Key Files to Monitor:**

- `backend/` (API code)

- `blockchain/sui/` (Sui integration)

- `blockchain/solana/` (Solana integration)

- `shared/contracts/` (smart contracts)

---

#### **Sub-Agent 1C: Storage/Infrastructure Lead (Walrus + Deployment)**

**Responsibilities:**

- Walrus decentralized storage integration

- Media blob storage and retrieval

- Infrastructure deployment and scaling

- Database schema and migrations

- Disaster recovery and backup

**Success Criteria:**

- ✅ Walrus storage fully integrated

- ✅ Media blobs stored immutably

- ✅ Retrieval reliable and fast

- ✅ Infrastructure scalable

- ✅ Zero data loss incidents

**Key Files to Monitor:**

- `storage/walrus/` (Walrus integration)

- `infrastructure/` (deployment config)

- `database/` (schema and migrations)

---

#### **Sub-Agent 1D: Security/Quality Lead (Claude Code + Auditing)**

**Responsibilities:**

- Continuous security scanning (Claude Code)

- Cryptographic code auditing

- Vulnerability assessment and remediation

- Security best practices enforcement

- Automated code review and testing

**Success Criteria:**

- ✅ All security scans passing

- ✅ Zero high-priority vulnerabilities

- ✅ Crypto code audited and approved

- ✅ Test coverage >80%

- ✅ Code review process automated

**Key Files to Monitor:**

- `SECURITY_AUDIT_LOG.md` (findings)

- `tests/` (test coverage)

- `SECURITY_STANDARDS.md` (guidelines)

---

#### **Sub-Agent 1E: Website Lead (React/Next.js + Manus)**

**Responsibilities:**

- Marketing website development (React/Next.js)

- Landing page optimization and conversion

- Customer onboarding flow

- Documentation and help center

- SEO and performance optimization

**Success Criteria:**

- ✅ Website deployed and live

- ✅ Landing page optimized for conversion

- ✅ Onboarding flow smooth and intuitive

- ✅ Help center comprehensive

- ✅ Mobile responsive

**Key Files to Monitor:**

- `web/` (website code)

- `web/pages/` (landing pages)

- `web/docs/` (documentation)

---

#### **Sub-Agent 1F: Marketplace Lead (Verification + Longitudinal Tracking)**

**Responsibilities:**

- Marketplace platform development

- Source imagery verification system

- Longitudinal tracking of media authenticity

- Creator reputation and credibility scoring

- Marketplace monetization and payments

**Success Criteria:**

- ✅ Marketplace platform functional

- ✅ Source verification working end-to-end

- ✅ Longitudinal tracking accurate

- ✅ Creator reputation system fair and transparent

- ✅ Payment processing secure

**Key Files to Monitor:**

- `marketplace/` (marketplace code)

- `verification/` (verification logic)

- `tracking/` (longitudinal tracking)

- `reputation/` (scoring system)

---

### **Coordination Between Sub-Agents**

**Weekly Engineering Sync (Product/Engineering Lead chairs):**

1. Mobile Lead reports status and blockers
2. Backend/Blockchain Lead reports status and blockers
3. Storage/Infrastructure Lead reports status and blockers
4. Security/Quality Lead reports security findings
5. Website Lead reports progress and issues
6. Marketplace Lead reports platform status
7. Cross-domain dependencies identified and resolved
8. Next week priorities aligned

**Daily Standup (Async in Manus):**

- Each sub-agent reports to Product/Engineering Lead
- Product/Engineering Lead synthesizes for other Manus agents

**GitHub Integration:**

- Each sub-agent has domain-specific branches
- Claude Code scans all code before merge
- Automated tests run per domain
- Product/Engineering Lead approves cross-domain merges

---

#### **Agent 2: Customer Discovery & Validation Lead**

**Responsibilities:**

- Manage customer discovery process across all 8 segments

- Conduct "Finding Interest" conversations (10 per segment)

- Conduct "Mom Test" interviews (5-7 per segment)

- Track all customer interactions and insights

- Update financial models based on validation data

- Identify pivots or course corrections needed

**Success Criteria:**

- ✅ 70+ customer conversations completed (8 weeks)

- ✅ 40-56 "Finding Interest" conversations documented

- ✅ 40-56 "Mom Test" interviews completed

- ✅ Problem severity validated (70%+ confirm urgency)

- ✅ Willingness to pay validated (50%+ would pay)

- ✅ Financial models updated with real data

**Key Files to Monitor:**

- `JOURNALISM_CONTACT_TRACKER.csv` (contact database)

- `SESSION1_UPS_MODEL.md` (value proposition)

- `SESSION1_FINDING_INTEREST.md` (conversation guide)

- `SESSION2_MOM_TEST_INTERVIEWS.md` (interview guide)

- `FINANCIAL_MODEL_36_MONTHS.md` (projections)

---

#### **Agent 3: Business & Strategy Lead**

**Responsibilities:**

- Develop go-to-market strategy (Session 3: Traction Channels)

- Create pitch decks and investor materials

- Manage fundraising timeline and strategy

- Develop business model refinements

- Track KPIs and business metrics

- Coordinate with customer discovery for market insights

**Success Criteria:**

- ✅ Traction channel strategy defined (Session 3)

- ✅ Pitch deck created (investor + lender versions)

- ✅ Executive summary finalized

- ✅ Fundraising timeline established

- ✅ KPI dashboard created and tracked

- ✅ Business model validated through customer discovery

**Key Files to Monitor:**

- `PITCH_SCRIPT_INVESTORS.md` (investor pitch)

- `PITCH_SCRIPT_BANKS_LENDERS.md` (lender pitch)

- `EXECUTIVE_SUMMARY_INDELIBLE_BLOB.md` (one-pager)

- `FINANCIAL_MODEL_36_MONTHS.md` (financial projections)

- `USER_SEGMENT_ANALYSIS.md` (market opportunity)

---

#### **Agent 4: Content & Communications Lead**

**Responsibilities:**

- Create marketing content and messaging

- Manage brand voice and positioning

- Develop educational content about deepfakes and verification

- Create customer discovery email templates

- Manage communication with customers and partners

- Document learnings and insights

**Success Criteria:**

- ✅ Brand messaging consistent across all materials

- ✅ Customer discovery emails have 25-30% response rate

- ✅ Educational content published and shared

- ✅ All customer interactions documented

- ✅ Learnings synthesized into insights

- ✅ Communication templates created for scale

**Key Files to Monitor:**

- `CUSTOMER_DISCOVERY_EMAIL_TEMPLATES.md` (outreach)

- `BRAND_POSITIONING_STRATEGY.md` (positioning and messaging)

- `CUSTOMER_TARGETING_STRATEGY.md` (segment targeting and outreach)

- Marketing content (to be created in Manus/Antigravity)

---

### Founder Role (You)

**Your Responsibilities:**

- Set strategic direction and make final decisions

- Conduct high-priority customer conversations

- Maintain alignment with project values

- Approve major pivots or changes

- Build relationships with key partners and investors

- Ensure team stays focused on mission

**Your Focus Areas:**

- Customer discovery (especially early conversations)

- Strategic partnerships (news organizations, blockchain projects)

- Fundraising conversations

- Product vision and direction

- Values alignment and ethical decisions

---

## Part 3: Communication Protocols

### Daily Standup Format

**Each agent reports:**

1. **What was completed yesterday** (specific deliverables)

1. **What will be completed today** (specific deliverables)

1. **Blockers or risks** (anything slowing progress)

1. **Key insights or learnings** (from customer conversations, code, market data)

**Format:** Concise, factual, action-oriented (5 minutes per agent)

### Weekly Sync Meetings

**Agenda:**

1. **Progress review** (against success criteria)

1. **Cross-team dependencies** (what's blocking other teams)

1. **Customer insights** (learnings from discovery)

1. **Strategic adjustments** (if needed based on data)

1. **Next week priorities** (clear focus areas)

**Attendees:** Founder + all agents**Duration:** 60 minutes**Frequency:** Weekly (same day/time)

### Decision-Making Framework

**For routine decisions (Agent autonomy):**

- ✅ Agent decides and executes

- ✅ Report in standup

- ✅ Document decision rationale

**For strategic decisions (Founder approval needed):**

- ⚠️ Agent proposes with data/rationale

- ⚠️ Founder reviews and approves/rejects

- ⚠️ Document decision and reasoning

**For values-related decisions (Founder + team discussion):**

- 🛑 Discuss as team

- 🛑 Ensure alignment with project values

- 🛑 Document decision and values rationale

**Examples of values-related decisions:**

- Should we use a centralized service vs. decentralized?

- Should we collect more user data than necessary?

- Should we partner with an organization misaligned with our values?

- Should we pivot away from our core mission for revenue?

### Conflict Resolution

**If agents disagree:**

1. Both present their case with data/reasoning

1. Founder listens and decides

1. Decision is documented with rationale

1. Team executes unified approach

**If agent disagrees with founder decision:**

1. Agent can present additional data/perspective

1. Founder makes final decision

1. Agent executes decision professionally

1. Decision is revisited after gathering more data (if appropriate)

---

## Part 4: Development Standards

### Technical Standards

**Code Quality:**

- ✅ All code must be tested (vitest for unit tests)

- ✅ All code must be documented

- ✅ All code must follow project style guide

- ✅ No high-priority security vulnerabilities

- ✅ Build must be reproducible and stable

**Dependency Management:**

- ✅ Lock all dependency versions

- ✅ Audit for vulnerabilities regularly

- ✅ Update dependencies thoughtfully (not reactively)

- ✅ Document why specific versions are used

**Git & Version Control:**

- ✅ Meaningful commit messages

- ✅ One feature per branch

- ✅ Code review before merge

- ✅ Stable main branch (always deployable)

**Documentation:**

- ✅ README files for all major components

- ✅ Architecture diagrams for complex systems

- ✅ Troubleshooting guides for common issues

- ✅ Decision documents for major technical choices

### Business Standards

**Customer Discovery:**

- ✅ All conversations documented (date, name, company, key insights)

- ✅ Conversation notes follow Mom Test principles (past behavior, not hypothetical)

- ✅ No leading questions or pitching in discovery phase

- ✅ Follow-up actions tracked

- ✅ Learnings synthesized weekly

**Financial Tracking:**

- ✅ All assumptions documented (CAC, LTV, churn, conversion)

- ✅ Models updated with real data as it comes in

- ✅ Variance analysis (actual vs. projected)

- ✅ Monthly financial reviews

**Market Research:**

- ✅ All claims backed by sources

- ✅ No simulated or projected data presented as real

- ✅ Uncertainty acknowledged

- ✅ Data refreshed regularly

### Ethical Standards

**Privacy & Data:**

- ✅ Collect only necessary data

- ✅ Transparent about data usage

- ✅ Secure storage and transmission

- ✅ User can delete their data

- ✅ No selling user data to third parties

**Decentralization:**

- ✅ Use decentralized infrastructure (Sui, Walrus)

- ✅ Avoid single points of control

- ✅ Resist pressure to centralize for convenience

- ✅ Educate users about decentralization benefits

**Inclusivity & Accessibility:**

- ✅ App works on low-end devices

- ✅ Supports multiple languages (roadmap)

- ✅ Accessible to people with disabilities

- ✅ Affordable pricing for global users

**Transparency:**

- ✅ Be honest about limitations

- ✅ Share decision-making rationale

- ✅ Admit mistakes and course-correct

- ✅ Communicate openly with customers

---

## Part 5: Success Metrics & Milestones

### Phase 1A: Foundation (Weeks 1-8)

**Goal:** Validate product-market fit with journalism segment

**Metrics:**

- ✅ 70+ customer conversations completed

- ✅ 40-56 "Finding Interest" conversations

- ✅ 40-56 "Mom Test" interviews

- ✅ 70%+ problem severity validated

- ✅ 50%+ willingness to pay validated

- ✅ Financial models updated with real data

**Deliverables:**

- Customer discovery report with findings

- Updated financial projections

- Pivot or proceed decision

---

### Phase 1B: Go-to-Market (Weeks 9-16)

**Goal:** Launch customer acquisition and build traction

**Metrics:**

- ✅ Traction channel strategy defined

- ✅ First 50+ users acquired

- ✅ CAC measured and tracked

- ✅ Churn rate measured

- ✅ NPS (Net Promoter Score) tracked

- ✅ 1-2 pilot agreements signed

**Deliverables:**

- Marketing campaign launched

- User acquisition playbook

- Pilot program results

---

### Phase 1C: Expansion (Weeks 17-24)

**Goal:** Expand to insurance and legal segments

**Metrics:**

- ✅ 200+ users across segments

- ✅ 3-5 pilot agreements signed

- ✅ Revenue from pilots ($5k-$20k)

- ✅ CAC optimized

- ✅ Churn stable or declining

**Deliverables:**

- Multi-segment go-to-market strategy

- Pilot program results and case studies

- Fundraising deck (if raising)

---

### Phase 2: Scale (Months 7-12)

**Goal:** Raise funding and scale to creative industries

**Metrics:**

- ✅ $50k-$100k MRR

- ✅ 500-1,000 paid users

- ✅ 3-5 enterprise pilots

- ✅ $500k-$1M funding raised

- ✅ Team expanded (engineers, sales, marketing)

**Deliverables:**

- Funding closed

- Team hired

- Creative industries roadmap

---

### Phase 3: Profitability (Months 13-36)

**Goal:** Achieve profitability and expand globally

**Metrics:**

- ✅ $1M+ MRR

- ✅ 5,000+ paid users

- ✅ Profitability achieved (Month 14-16)

- ✅ International expansion (2+ countries)

- ✅ 8 segments actively served

**Deliverables:**

- Profitable business

- Global presence

- Marketplace launched

---

## Part 6: File Organization & Naming Conventions

### Directory Structure

```
indelible-blob/
├── mobile/                          # React Native app
│   ├── app.json                     # App configuration
│   ├── metro.config.js              # Metro bundler config
│   ├── package.json                 # Dependencies
│   └── android/                     # Android-specific code
├── web/                             # Web version
├── shared/                          # Shared code
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md              # System design
│   ├── TROUBLESHOOTING.md           # Common issues
│   └── DECISIONS.md                 # Major decisions
└── business/                        # Business materials
    ├── customer_discovery/          # Customer research
    ├── financial_models/            # Financial projections
    ├── pitch_decks/                 # Investor materials
    └── marketing/                   # Marketing content
```

### File Naming Conventions

**Customer Discovery Files:**

- `SEGMENT_NAME_CONTACTS_VERIFIED.md` (contact list)

- `SEGMENT_NAME_UPS_MODEL.md` (value proposition)

- `SEGMENT_NAME_FINDING_INTEREST.md` (conversation guide)

- `SEGMENT_NAME_MOM_TEST_INTERVIEWS.md` (interview guide)

**Financial Files:**

- `FINANCIAL_MODEL_36_MONTHS.md` (main model)

- `FINANCIAL_MODEL_SEGMENT_NAME.md` (segment-specific)

- `FINANCIAL_ASSUMPTIONS.md` (key assumptions)

**Pitch Materials:**

- `PITCH_SCRIPT_INVESTORS.md` (investor pitch)

- `PITCH_SCRIPT_BANKS_LENDERS.md` (lender pitch)

- `EXECUTIVE_SUMMARY_INDELIBLE_BLOB.md` (one-pager)

**Technical Files:**

- `ARCHITECTURE.md` (system design)

- `TROUBLESHOOTING.md` (common issues)

- `DECISIONS.md` (major technical decisions)

---

## Part 7: Values Alignment Checklist

### Before Making Any Major Decision, Ask:

**1. Does this align with our mission?**

- ✅ Are we helping restore trust in visual media?

- ✅ Are we serving journalists and creators?

- ✅ Are we solving the misinformation crisis?

**2. Does this maintain decentralization?**

- ✅ Are we using decentralized infrastructure?

- ✅ Are we avoiding single points of control?

- ✅ Are we resisting pressure to centralize?

**3. Does this prioritize community?**

- ✅ Are we building genuine relationships?

- ✅ Are we listening to customers?

- ✅ Are we serving communities, not extracting?

**4. Does this maintain ethical standards?**

- ✅ Are we protecting user privacy?

- ✅ Are we being transparent?

- ✅ Are we building for accessibility?

**5. Does this maintain honesty?**

- ✅ Are we claiming only what we've validated?

- ✅ Are we acknowledging limitations?

- ✅ Are we following evidence?

**If the answer to any question is "no," discuss with the team before proceeding.**

---

## Part 8: Key Contacts & Resources

### Blockchain Partners

- **Sui Foundation** - Blockchain infrastructure

- **Walrus Protocol** - Decentralized storage

- **Solana Ecosystem** - Mobile integration

### Customer Segments

- **Journalism:** 100+ verified contacts (MeidasTouch, BBC, Guardian, Democracy Now, etc.)

- **Insurance:** Contact list to be developed

- **Creative Industries:** Contact list to be developed

- **Legal:** Contact list to be developed

- **Scientific Research:** Contact list to be developed

- **Photographers:** Contact list to be developed

- **Activists:** Contact list to be developed

- **AEC Professionals:** Contact list to be developed

### Tools & Services (Internal Ecosystem)

- **Manus** - Project orchestration, agent coordination, task management

- **Antigravity IDE** - Development environment, code editing, local debugging

- **Claude Code** - Security scanning, code review, architecture analysis

- **GitHub** - Code repository, version control, CI/CD

- **Custom Internal Tools** - Lead generation, customer tracking, analytics (to be built on Manus/Antigravity)

---

## Part 9: Escalation & Support

### When to Escalate to Founder

**Immediate escalation needed:**

- 🛑 Security vulnerability discovered

- 🛑 Values misalignment in decision

- 🛑 Customer expressing major dissatisfaction

- 🛑 Significant technical blocker (>2 days)

- 🛑 Potential pivot needed

**Weekly escalation review:**

- ⚠️ Progress against success criteria

- ⚠️ Resource constraints

- ⚠️ Strategic adjustments needed

- ⚠️ Customer insights requiring decision

### Support Resources

**For technical issues:**

- Check `TROUBLESHOOTING.md` first

- Review `DECISIONS.md` for context

- Escalate if blocked >2 days

**For customer discovery issues:**

- Review `SESSION1_FINDING_INTEREST.md` and `SESSION2_MOM_TEST_INTERVIEWS.md`

- Check `CUSTOMER_DISCOVERY_EMAIL_TEMPLATES.md`

- Escalate if getting <15% response rate

**For business/strategy issues:**

- Review `FINANCIAL_MODEL_36_MONTHS.md`

- Check `USER_SEGMENT_ANALYSIS.md`

- Escalate if metrics diverge >20% from projections

---

## Part 10: Continuous Learning & Improvement

### Weekly Retrospectives

**Every Friday:**

1. What went well? (celebrate wins)

1. What could be better? (identify improvements)

1. What did we learn? (document insights)

1. What will we change? (action items for next week)

### Monthly Reviews

**Every month:**

1. Progress against success criteria

1. Customer insights and learnings

1. Financial performance vs. projections

1. Team health and satisfaction

1. Adjustments to strategy or tactics

### Quarterly Planning

**Every quarter:**

1. Review progress toward phase goals

1. Adjust priorities based on learnings

1. Plan next quarter's focus areas

1. Celebrate milestones and wins

---

## Part 11: Onboarding New Agents

### When Adding a New Agent:

1. **Share this document** - Ensure understanding of vision, values, and structure

1. **Assign specific responsibility** - Clear ownership of one domain

1. **Provide context** - Share all relevant files and background

1. **Define success criteria** - What does success look like for this agent?

1. **Establish communication** - How will they sync with team?

1. **Set first milestone** - What's the first deliverable?

### Knowledge Transfer Checklist

- ✅ Project vision and mission understood

- ✅ Values alignment confirmed

- ✅ Role and responsibilities clear

- ✅ Success criteria defined

- ✅ Key files and resources shared

- ✅ Communication protocols understood

- ✅ First week priorities set

---

## Part 12: Final Thoughts

### Why This Structure Matters

**Without clear structure:**

- Agents work in silos

- Decisions conflict

- Values get compromised

- Progress stalls

**With clear structure:**

- Agents coordinate effectively

- Decisions align with values

- Progress accelerates

- Team stays focused on mission

### The Founder's Role

You are not a manager—you are a **steward of the mission**. Your job is to:

1. Keep the team aligned with values

1. Make strategic decisions

1. Build key relationships

1. Ensure progress toward vision

1. Course-correct when needed

### The Agent Team's Role

Agents are not replacements—they are **force multipliers**. They:

1. Execute with excellence

1. Bring expertise to their domain

1. Escalate decisions appropriately

1. Document learnings

1. Maintain standards

### Together

Founder + Agent Team = **Exponential progress on a mission that matters**

---

## Appendix: Quick Reference

### Success Criteria Summary

| Phase | Timeline | Key Metrics | Status |
| --- | --- | --- | --- |
| Phase 1A | Weeks 1-8 | 70+ conversations, 70% problem validation | In Progress |
| Phase 1B | Weeks 9-16 | 50+ users, 1-2 pilots | Not Started |
| Phase 1C | Weeks 17-24 | 200+ users, 3-5 pilots, revenue | Not Started |
| Phase 2 | Months 7-12 | $50k-$100k MRR, funding raised | Not Started |
| Phase 3 | Months 13-36 | $1M+ MRR, profitability, global | Not Started |

### Key Files by Agent

**Product & Engineering Lead (Manus):**

- `ENGINEERING_SYNC_NOTES.md` (weekly coordination)

- `ARCHITECTURE.md` (system design)

- `DECISIONS.md` (major technical decisions)

- `SECURITY_AUDIT_LOG.md` (Claude Code findings)

**Mobile Lead (Antigravity):**

- `mobile/app.json`, `metro.config.js`, `build.gradle`

- `mobile/ios/` (iOS configuration)

- `INDELIBLE_BLOB_BUILD_ANALYSIS.md`

**Backend/Blockchain Lead (Antigravity):**

- `backend/` (API code)

- `blockchain/sui/` (Sui integration)

- `blockchain/solana/` (Solana integration)

**Storage/Infrastructure Lead (Antigravity):**

- `storage/walrus/` (Walrus integration)

- `infrastructure/` (deployment config)

- `database/` (schema and migrations)

**Security/Quality Lead (Antigravity + Claude Code):**

- `SECURITY_AUDIT_LOG.md` (findings)

- `tests/` (test coverage)

- `SECURITY_STANDARDS.md` (guidelines)

**Website Lead (Antigravity):**

- `web/` (website code)

- `web/pages/` (landing pages)

- `web/docs/` (documentation)

**Marketplace Lead (Antigravity):**

- `marketplace/` (marketplace code)

- `verification/` (verification logic)

- `tracking/` (longitudinal tracking)

- `reputation/` (scoring system)

**Customer Discovery:**

- `JOURNALISM_CONTACT_TRACKER.csv`

- `SESSION1_UPS_MODEL.md`, `SESSION1_FINDING_INTEREST.md`

- `SESSION2_MOM_TEST_INTERVIEWS.md`

- `FINANCIAL_MODEL_36_MONTHS.md`

**Business & Strategy:**

- `PITCH_SCRIPT_INVESTORS.md`, `PITCH_SCRIPT_BANKS_LENDERS.md`

- `EXECUTIVE_SUMMARY_INDELIBLE_BLOB.md`

- `FINANCIAL_MODEL_36_MONTHS.md`

- `USER_SEGMENT_ANALYSIS.md`

**Content & Communications:**

- `CUSTOMER_DISCOVERY_EMAIL_TEMPLATES.md`

- `BRAND_POSITIONING_STRATEGY.md`

- `CUSTOMER_TARGETING_STRATEGY.md`

---

**This document is a living guide. Update it as you learn and grow. The structure should serve the mission, not constrain it.**

**Let's build something that matters.** 🚀

