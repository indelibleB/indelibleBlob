# Git & Agent Integration Workflow

This document outlines how the **Hybrid Agent Team** collaborates using GitHub as the Source of Truth.

## 1. The Ecosystem using GitHub
*   **Manus (Product Lead):** Defines tasks and monitors high-level progress via Project Boards (if configured) or by reading `docs/protocols`.
*   **Antigravity (Engineering):** The "Engine Room". We write code, run builds, and push feature branches.
*   **Claude Code (Security/QA):** Acts as the Gatekeeper. It scans PRs and code before extensive merges.

## 2. Workflow Actions

### A. Starting a Task
1.  **Manus** defines the objective in `task.md` or a project issue.
2.  **Antigravity** pulls the latest `main`.
3.  **Antigravity** creates a feature branch: `feature/mobile-auth-fix`.

### B. Development Loop (in Antigravity)
1.  Write code.
2.  Run tests/builds locally.
3.  Commit changes with conventional commits (e.g., `fix: resolve crash in shim.js`).

### C. The Handoff (Pull Request)
1.  **Antigravity** pushes the branch to GitHub.
2.  **Antigravity** opens a PR using the `.github/pull_request_template.md`.
3.  **Action:** Tag **Claude Code** (if integrated via Actions) or run `claude "/review"` locally and paste the output.

### D. Security Scan (Claude Code)
*   **Claude Code** analyzes the diff for:
    *   Security vulnerabilities (keys in code, unsafe exec).
    *   Logic errors.
*   If issues found -> Reject PR -> Antigravity fixes.
*   If clean -> Approve.

### E. Merge
*   **Manus (Product Lead)** gives final approval for strategic alignment.
*   Code is merged to `main`.

## 3. Environment Sync
*   **Binaries:** `tools/sui` binaries are **ignored** (see `.gitignore`).
*   **Setup:** New agents/machines run `tools/download-sui-binaries.sh` to fetch them.
