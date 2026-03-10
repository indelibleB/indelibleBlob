# indelible.Blob Operations Manual
## How We Work Together, Every Day

**Version:** 1.0  
**Adopted:** February 17, 2026  
**Purpose:** Define daily operations, communication protocols, and execution standards

---

## Part 1: Daily Operations

### Morning Standup (Each Agent)

Every morning, each agent reports in their assigned task:

**Format:**
- **Completed Yesterday:** Specific deliverables (not vague updates)
- **Today's Priorities:** 1-3 specific deliverables for today
- **Blockers:** Anything slowing progress or requiring help
- **Insights:** Customer feedback, data, learnings, or decisions needed

**Example (Good):**
```
Completed Yesterday:
- Conducted 3 customer discovery calls with photographers
- Updated financial model with CAC data from first 10 users
- Identified pivot opportunity: enterprise segment willing to pay 3x more

Today's Priorities:
- Conduct 2 more photographer interviews
- Create pitch deck for enterprise segment
- Schedule meeting with Product & Engineering Lead to discuss pivot

Blockers:
- Need access to photographer contact database
- Waiting on security audit results before proceeding with Seal integration

Insights:
- Photographers care more about proof of authenticity than privacy
- Enterprise segment has budget but long sales cycles (6-9 months)
- Current pricing model doesn't work for enterprise
```

**Example (Bad):**
```
Completed Yesterday:
- Worked on customer discovery
- Updated models
- Made progress on features

Today's Priorities:
- Continue customer discovery
- Keep working on models
- Make more progress

Blockers:
- None

Insights:
- Customers like the product
```

### Communication Channels

**Primary:** Manus task updates (daily standups)  
**Secondary:** Shared files and GitHub (documentation, decisions, code)  
**Tertiary:** Weekly syncs (structured meetings)  
**Emergency:** Immediate escalation (see escalation procedures)

### File Organization

All agents have access to shared files in the Manus project:

**Strategic Files:**
- INDELIBLE_BLOB_CONSTITUTION.md (mission, values, structure)
- INDELIBLE_BLOB_OPERATIONS_MANUAL.md (this file)
- INDELIBLE_BLOB_TECHNICAL_ARCHITECTURE.md (system design)
- INDELIBLE_BLOB_AGENT_PLAYBOOKS.md (role-specific guides)

**Working Files:**
- DECISIONS.md (all major decisions with rationale)
- ENGINEERING_SYNC_NOTES.md (weekly engineering sync notes)
- CUSTOMER_DISCOVERY_LOG.md (all customer conversations)
- FINANCIAL_MODELS.md (updated with real data)
- SECURITY_AUDIT_LOG.md (Claude Code findings)
- ARCHITECTURE.md (technical architecture decisions)

**GitHub:**
- All code and technical documentation
- Pull request reviews and CI/CD automation
- Branch protection and code review process

---

## Part 2: Weekly Syncs

### Engineering Sync (Friday 2 PM MST)

**Attendees:** All 6 sub-agents + Executive Engineer + Product & Engineering Lead (Manus)

**Duration:** 60 minutes

**Agenda:**
1. **Progress Review (15 min)** - Each sub-agent reports status, celebrate wins, identify gaps
2. **Cross-Team Dependencies (15 min)** - Identify coordination needs between domains
3. **Security & Quality (10 min)** - Claude Code findings, vulnerabilities, test coverage
4. **Strategic Decisions (15 min)** - Architectural decisions, values alignment, resource allocation
5. **Next Week Priorities (5 min)** - Each sub-agent commits to next week's deliverables

**Output:** ENGINEERING_SYNC_NOTES.md updated with decisions, blockers, and next steps

### Leadership Sync (First Friday of Month)

**Attendees:** All Manus agents + Founder

**Duration:** 90 minutes

**Agenda:**
1. **Overall Progress (20 min)** - Against Phase milestones, financial models, customer metrics
2. **Cross-Team Alignment (20 min)** - Engineering vs. customer needs, business strategy vs. roadmap, marketing vs. feedback
3. **Strategic Decisions (30 min)** - Go/no-go decisions, pivots, funding strategy, partnerships
4. **Team Health (15 min)** - Agent feedback, blockers, adjustments needed
5. **Next Month Priorities (5 min)** - Each agent commits to next month's focus

**Output:** DECISIONS.md updated, next month priorities documented

---

## Part 3: Escalation Procedures

### Immediate Escalation (Same Day)

**Escalate immediately if:**
- Security vulnerability discovered (any severity)
- Values misalignment in decision or partnership
- Customer expressing major dissatisfaction
- Significant technical blocker (>2 days)
- Potential pivot needed
- Build broken or deployment blocked

**How to escalate:**
1. Document the issue clearly
2. Flag in task update with "ESCALATION:" prefix
3. Contact Product & Engineering Lead (Manus) or Founder directly
4. Provide context, options, and recommendation
5. Wait for decision before proceeding

**Example escalation:**
```
ESCALATION: Security Vulnerability in Seal Encryption

Issue: Claude Code detected potential key leakage in Seal encryption implementation
Severity: High (could expose user data)
Discovery: During PR review of backend changes
Impact: Affects all users with Seal encryption enabled

Context:
- Vulnerability is in key derivation function
- Affects ~15% of current user base
- Could be exploited by sophisticated attacker

Options:
1. Hotfix immediately (2 hours) - Patch and redeploy
2. Rollback feature (1 hour) - Disable Seal encryption temporarily
3. Notify users (24 hours) - Warn users, provide migration path

Recommendation: Option 1 (hotfix immediately)

Requesting: Approval to proceed with hotfix
```

### Weekly Escalation Review

During weekly syncs, review all escalations from the past week:
- What was escalated?
- How was it resolved?
- What can we prevent next time?
- Any pattern issues?

---

## Part 4: Decision Documentation

### When to Document a Decision

Document decisions that:
- Affect multiple teams
- Represent a strategic choice
- Involve values alignment
- Require future reference or explanation

### Decision Template

**File:** DECISIONS.md

**Format:**
```
## Decision: [Clear Title]

**Date:** [Date]
**Decision Maker:** [Who decided]
**Status:** [Approved / Implemented / Rejected]

**Context:**
[Why this decision was needed. What was the situation?]

**Options Considered:**
1. [Option A] - Pros: ... Cons: ...
2. [Option B] - Pros: ... Cons: ...
3. [Option C] - Pros: ... Cons: ...

**Decision:**
[Which option was chosen and why]

**Rationale:**
[How does this align with our values and mission?]

**Implications:**
[What changes as a result? Who is affected?]

**Next Steps:**
[Who will implement this? By when?]
```

**Example:**
```
## Decision: Use Sui for Notarization, Solana for Identity

**Date:** February 17, 2026
**Decision Maker:** Product & Engineering Lead (Manus)
**Status:** Approved

**Context:**
We needed to choose which blockchains to use for notarization and identity. This is a foundational decision that affects all downstream development.

**Options Considered:**
1. Sui only - Simpler, but limited identity infrastructure
2. Solana only - Good identity infrastructure, but less suited for notarization
3. Sui + Solana - More complex, but leverages strengths of each

**Decision:**
Use Sui for notarization (immutable proof of capture) and Solana for identity (creator verification). This leverages the strengths of each blockchain.

**Rationale:**
- Aligns with decentralization value (using multiple chains)
- Aligns with mission (best tool for each job)
- Reduces vendor lock-in risk
- Provides redundancy

**Implications:**
- Backend/Blockchain Lead must integrate both SDKs
- Requires cross-chain verification logic
- Increases complexity but improves resilience

**Next Steps:**
- Backend/Blockchain Lead creates integration plan (by Feb 24)
- Security/Quality Lead reviews architecture (by Mar 3)
- Development begins (by Mar 10)
```

---

## Part 5: Success Metrics & Tracking

### Phase 1A Metrics (Weeks 1-8)

| Metric | Target | Tracking |
|--------|--------|----------|
| Customer conversations | 70+ | CUSTOMER_DISCOVERY_LOG.md |
| "Finding Interest" conversations | 40-56 | CUSTOMER_DISCOVERY_LOG.md |
| "Mom Test" interviews | 40-56 | CUSTOMER_DISCOVERY_LOG.md |
| Problem severity validation | 70%+ | FINANCIAL_MODELS.md |
| Willingness to pay validation | 50%+ | FINANCIAL_MODELS.md |
| Financial model updates | Weekly | FINANCIAL_MODELS.md |

### Phase 1B Metrics (Weeks 9-16)

| Metric | Target | Tracking |
|--------|--------|----------|
| Traction channel strategy | Defined | DECISIONS.md |
| Users acquired | 50+ | FINANCIAL_MODELS.md |
| CAC measured | Yes | FINANCIAL_MODELS.md |
| Churn rate measured | Yes | FINANCIAL_MODELS.md |
| NPS tracked | Yes | FINANCIAL_MODELS.md |
| Pilot agreements | 1-2 | DECISIONS.md |

### Engineering Metrics (Continuous)

| Metric | Target | Tracking |
|--------|--------|----------|
| Security vulnerabilities | 0 high-priority | SECURITY_AUDIT_LOG.md |
| Test coverage | >80% | GitHub CI/CD |
| Build success rate | 100% | GitHub CI/CD |
| Code review turnaround | <24 hours | GitHub PRs |
| Deployment frequency | Daily | GitHub |

---

## Part 6: Communication Standards

### Clarity & Specificity

**Always be specific:**
- ❌ "Made progress on customer discovery"
- ✅ "Conducted 3 customer interviews with photographers; 2 expressed strong interest in enterprise features"

- ❌ "Working on backend"
- ✅ "Implemented Sui notarization API; 80% test coverage; ready for Mobile integration"

- ❌ "There's a blocker"
- ✅ "Blocked on security audit of Seal encryption; waiting for Claude Code review (expected by Friday)"

### Honesty & Transparency

**Always be honest:**
- ❌ "Everything is on track"
- ✅ "Mobile build is behind schedule by 3 days due to TEEPIN integration complexity; we've identified the issue and have a plan to catch up"

- ❌ "We're ready to launch"
- ✅ "We have 50 users on pilot; NPS is 45 (good but not great); churn is 5% (higher than target); we need to improve onboarding before scaling"

### Frequency & Consistency

**Report consistently:**
- Daily standups: Every morning (same time if possible)
- Weekly syncs: Friday 2 PM MST (no exceptions)
- Monthly syncs: First Friday (no exceptions)

**If you can't make a sync:** Send written update in advance

---

## Part 7: Conflict Resolution

### When Agents Disagree

**Process:**
1. Both agents present their case with data and rationale
2. Leadership listens to both perspectives
3. Leadership decides based on mission, values, and evidence
4. Decision is documented in DECISIONS.md
5. Team executes unified approach

**Example:**
```
Conflict: Should we focus on photographers or journalists first?

Mobile Lead argues: Photographers are easier to reach and have higher willingness to pay
Marketplace Lead argues: Journalists have bigger impact and larger TAM

Leadership decision: Start with photographers (higher willingness to pay, faster validation), but build marketplace features that appeal to journalists (larger opportunity)

Documentation: DECISIONS.md - "Segment Focus: Photographers First, Journalists Second"

Execution: Both leads commit to this direction and coordinate on features
```

### When Agent Disagrees with Leadership Decision

**Process:**
1. Agent can present additional data or perspective
2. Leadership listens and may revise decision
3. If decision stands: Agent executes professionally
4. Decision is revisited after gathering more data (if appropriate)

**This is not about compliance—it's about alignment.** If an agent fundamentally disagrees with direction, discuss with Founder about whether the agent is the right fit for the role.

---

## Part 8: Onboarding New Agents

### Week 1: Foundation

**Day 1:**
- Read INDELIBLE_BLOB_CONSTITUTION.md
- Read INDELIBLE_BLOB_OPERATIONS_MANUAL.md
- Read INDELIBLE_BLOB_TECHNICAL_ARCHITECTURE.md
- Read INDELIBLE_BLOB_AGENT_PLAYBOOKS.md (your role section)
- Meet with Founder (30 min) - Mission, values, expectations

**Day 2-3:**
- Review INDELIBLE_BLOB_ORGANIZATIONAL_STRUCTURE.md
- Review GitHub repository and codebase
- Review DECISIONS.md (all past decisions)
- Review CUSTOMER_DISCOVERY_LOG.md (understand customers)

**Day 4-5:**
- Meet with Product & Engineering Lead (30 min) - Your role, success criteria
- Attend weekly sync (Friday 2 PM MST)
- Set first week priorities

### Week 2-4: Execution

**Ongoing:**
- Daily standups (morning)
- Weekly syncs (Friday 2 PM MST)
- Coordinate with team on dependencies
- Document decisions and learnings

**First Deliverable:** Complete first priority from onboarding plan

---

## Part 9: File Maintenance

### Who Maintains Each File?

| File | Owner | Update Frequency |
|------|-------|------------------|
| INDELIBLE_BLOB_CONSTITUTION.md | Founder | As needed (amendments) |
| INDELIBLE_BLOB_OPERATIONS_MANUAL.md | Product & Engineering Lead | Quarterly review |
| INDELIBLE_BLOB_TECHNICAL_ARCHITECTURE.md | Executive Engineer | As architecture evolves |
| INDELIBLE_BLOB_AGENT_PLAYBOOKS.md | Each agent | Quarterly review |
| DECISIONS.md | All agents | Every decision |
| ENGINEERING_SYNC_NOTES.md | Executive Engineer | Weekly |
| CUSTOMER_DISCOVERY_LOG.md | Customer Discovery Lead | Every conversation |
| FINANCIAL_MODELS.md | Business & Strategy Lead | Weekly |
| SECURITY_AUDIT_LOG.md | Security/Quality Lead | Every scan |
| ARCHITECTURE.md | Executive Engineer | As architecture changes |

### Archive Old Files

Keep current files clean by archiving old versions:
- DECISIONS_ARCHIVE_2026_Q1.md
- ENGINEERING_SYNC_NOTES_ARCHIVE_2026_Q1.md
- CUSTOMER_DISCOVERY_LOG_ARCHIVE_2026_Q1.md

Archive quarterly.

---

## Part 10: Remote Work Standards

### Asynchronous First

Assume everyone is in different time zones. Write clearly so people can understand without synchronous discussion.

**Good async communication:**
- Detailed task updates with context
- Clear decision documentation
- Specific questions with background
- Links to relevant files and decisions

**Bad async communication:**
- "Let's sync on this" (without context)
- "Need your input" (without explaining what)
- Vague status updates

### Synchronous Meetings

Use synchronous meetings only when necessary:
- Weekly syncs (structured, time-boxed)
- Escalations (urgent decisions)
- Complex discussions (multiple perspectives)
- Relationship building (occasional)

### Time Zone Coordination

**Weekly Engineering Sync:** Friday 2 PM MST (accommodates US and Europe)  
**Monthly Leadership Sync:** First Friday 10 AM MST (accommodates US and Europe)  
**Daily Standups:** Asynchronous (each agent reports on their schedule)

---

## Part 11: Tools & Systems

### Manus Project
- Task management and daily standups
- Shared file storage
- Agent coordination

### GitHub
- Code repository
- Pull request reviews
- CI/CD automation
- Issue tracking

### Shared Documents
- Constitution, Operations Manual, Technical Architecture, Agent Playbooks
- Decisions, Engineering Sync Notes, Customer Discovery Log, Financial Models
- Security Audit Log, Architecture Documentation

### Communication
- Task updates (daily)
- Weekly syncs (Friday 2 PM MST)
- Monthly syncs (First Friday 10 AM MST)
- Escalations (as needed)

---

## Part 12: Quality Standards

### Code Quality

- Test coverage >80%
- All security vulnerabilities fixed before merge
- Code review completed before merge
- CI/CD passes before merge

### Customer Discovery Quality

- "Finding Interest" conversations (no pitch, just listening)
- "Mom Test" interviews (specific questions, not leading)
- Documented insights and learnings
- Financial model updated with real data

### Documentation Quality

- Clear, specific, actionable
- Links to relevant files and decisions
- Updated regularly (not stale)
- Easy to understand for new agents

### Decision Quality

- Data-driven (not assumptions)
- Values-aligned (checked against Constitution)
- Documented with rationale
- Communicated to entire team

---

## Final Thoughts

This manual is about **enabling excellence through clarity**. When everyone understands:
- How we work together
- What success looks like
- How decisions are made
- How to escalate issues

...then we can move fast, stay aligned, and maintain quality.

**Follow these standards. They exist to serve the mission, not to create bureaucracy.**

---

**Let's execute with excellence.** 🚀
