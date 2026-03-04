
# indelible.Blob Agent Communication Protocols
> **How We Work Together: The Operating System for a Hybrid Team**

**Version:** 2.0 (Restructured)
**Adopted:** March 4, 2026

---

## Part 1: The Philosophy

**Clarity, Brevity, and Asynchronous-First.** Our goal is to maximize high-quality, focused "deep work" time and minimize time spent in meetings or waiting for replies. We achieve this through structured, written communication.

## Part 2: The Cadence

### Daily Stand-ups (Asynchronous)

-   **When:** Every morning, upon starting work.
-   **Where:** In each agent's primary task tracking document (e.g., `docs/agents/tasks/001A-MOBILE_LEAD.md`).
-   **Format:**
    -   `## YYYY-MM-DD`
    -   **Completed Yesterday:** Specific, linked deliverables.
    -   **Today's Priorities:** 1-3 specific, outcome-oriented tasks.
    -   **Blockers:** Any dependencies or risks, with `@` mentions for the relevant agent.
    -   **Insights:** Key learnings, questions, or observations.

### Weekly Syncs (Asynchronous First)

-   **Engineering Sync:** Every Friday, a summary of the week's progress, blockers, and decisions is appended to `docs/coordination/WEEK_OF_YYYY-MM-DD.md`. A synchronous meeting is only scheduled if there are contentious issues that cannot be resolved in writing.
-   **Leadership Sync:** The first Friday of each month, a strategic update is appended to the same weekly coordination file, covering progress against phase milestones and any required strategic decisions.

## Part 3: The Protocols

### Git & Version Control

-   **Main Branch:** `master` is the single source of truth. It must always be stable and deployable.
-   **Feature Branches:** All work is done on feature branches (e.g., `feature/mobile-auth`, `fix/skr-balance-check`).
-   **Pull Requests (PRs):** All code must be reviewed and approved via a PR before merging to `master`. PRs must include a clear description of the change and link to the relevant task.
-   **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `docs:`, `chore:`).

### Documentation

-   **Single Source of Truth:** All canonical documentation lives in the `/docs` directory.
-   **`SPRINT_STATUS.md`:** This is the **single most important file** for sprint-level coordination. It is updated daily and is the first file any agent should read to get current.
-   **Decision Log:** All significant architectural and product decisions are recorded in `docs/architecture/DECISIONS.md`.
-   **Protocols:** All agent workflows and communication standards are recorded in this document.

### Escalation Path

1.  **Agent-to-Agent:** First, attempt to resolve the issue directly with the relevant agent via a clear, written `@` mention in a task or PR.
2.  **To Lead Agent:** If unresolved, escalate to the relevant Lead Agent (e.g., Agent 1 for engineering issues) with a link to the prior discussion.
3.  **To Founder:** The Lead Agent escalates to the Founder only for strategic decisions, constitutional questions, or resource conflicts that cannot be resolved at the agent level.

**Immediate Escalation:** For critical security vulnerabilities or complete system outages, notify the Founder and all relevant agents immediately via the most direct channel available.

---

> These protocols are designed to enable speed and autonomy while maintaining alignment. They are living documents and will be updated as we learn and grow.
