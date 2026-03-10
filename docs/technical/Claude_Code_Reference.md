# Claude Code Reference

**Official Documentation Source:** [https://code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview)

## 1. Overview
Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools. It is available in your terminal, IDE, desktop app, and browser.

## 2. Installation & Setup
### Recommended Install (Native)
```bash
npm install -g @anthropic-ai/claude-code
```
*Note: The official docs also mention `curl` and `brew` methods, but `npm` is most aligned with our project structure.*

### Authentication
Run the following command to start the interactive setup:
```bash
claude
```
Follow the on-screen prompts to authenticate with your Anthropic Console account.

## 3. What You Can Do
### Automate Routine Work
```bash
claude "write tests for the auth module, run them, and fix any failures"
```

### Build Features & Fix Bugs
Claude Code can iterate on bugs by running tests and analyzing failures.

### Create Commits
```bash
claude "commit my changes with a descriptive message"
```

### CLI Automation (Pipe & Script)
```bash
# Monitor logs and get alerted
tail -f app.log | claude -p "Slack me if you see any anomalies"

# Bulk operations across files
git diff main --name-only | claude -p "review these changed files for security issues"
```

## 4. Key Commands
| Command | Description |
| :--- | :--- |
| `claude` | Start an interactive session. |
| `claude "instruction"` | Run a single-shot instruction. |
| `claude -p "prompt"` | Print mode (non-interactive output). |
| `/search [query]` | Search codebase for files/content. |
| `/edit [file]` | Open a file for editing. |
| `/run [cmd]` | Execute a shell command. |
| `/bug` | Trace and fix a bug (Agentic capability). |
| `/review` | Review pending changes. |
| `/compact` | Compact conversation history. |

## 5. Integrations & Everywhere Access
- **Terminal:** The primary interface.
- **VS Code:** Install the extension for IDE integration.
- **JetBrains:** Plugin available.
- **Desktop App:** Hand off terminal sessions to Desktop with `/desktop`.
- **Teleport:** Transfer sessions from web/iOS to terminal with `/teleport`.
