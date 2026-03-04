# MCP Coordination System

This directory contains all agent-to-agent communication for the indelible.Blob project using GitHub as the coordination hub.

## Architecture

**Agents:**
- **Manus** - Strategic orchestrator (posts instructions, monitors progress)
- **Antigravity** - Development execution (receives instructions, reports status)
- **Claude Code** - Security & quality advisor (receives tasks, reports findings)

**Communication Flow:**
```
Manus → GitHub (.mcp/instructions/) → Antigravity
Antigravity → GitHub (.mcp/status/) → Manus
Claude Code → GitHub (.mcp/status/) → Manus
Manus → GitHub (.mcp/decisions/) → All agents
```

## Directory Structure

### `/instructions/`
Contains pending instructions for agents.

**File Format:** `INSTR_{ID}_{target_agent}_{step}.json`

Example: `INSTR_001_antigravity_step6.json`

**Schema:**
```json
{
  "id": "INSTR_001",
  "target_agent": "antigravity",
  "step_number": "Step 6",
  "title": "Claude Code Integration",
  "instructions": "Full markdown instructions here...",
  "priority": "high",
  "timeline_hours": 4,
  "dependencies": ["Step 5.5"],
  "posted_at": "2026-02-20T12:00:00Z",
  "status": "pending"
}
```

### `/status/`
Contains agent status updates.

**File Format:** `{agent_name}_status.json`

Example: `antigravity_status.json`

**Schema:**
```json
{
  "agent": "antigravity",
  "current_step": "Step 6",
  "status": "in_progress",
  "progress_percentage": 50,
  "summary": "Claude Code installed, configuring security rules",
  "blockers": [],
  "last_update": "2026-02-20T12:30:00Z",
  "next_update_expected": "2026-02-20T13:00:00Z"
}
```

### `/decisions/`
Contains logged decisions with rationale.

**File Format:** `DECISION_{ID}_{title}.md`

Example: `DECISION_001_github_based_mcp.md`

**Schema:**
```markdown
# Decision: {Title}

**Date:** 2026-02-20  
**Decision Maker:** Manus  
**Status:** Approved  

## Context
[Explain the situation that required a decision]

## Options Considered
1. [Option A with pros/cons]
2. [Option B with pros/cons]
3. [Option C with pros/cons]

## Decision
[Which option was chosen and why]

## Rationale
[Detailed explanation of the reasoning]

## Implications
[What this decision means for the project]

## Reversibility
[Can this decision be reversed? How?]
```

## Workflow

### Manus Posts an Instruction

1. Create file: `.mcp/instructions/INSTR_{ID}_{agent}_{step}.json`
2. Fill in all required fields
3. Commit: `git add .mcp/instructions/ && git commit -m "Post instruction: {title}"`
4. Push: `git push origin master`

### Antigravity Receives and Executes

1. Pull latest: `git pull origin master`
2. Read: `.mcp/instructions/INSTR_*.json`
3. Execute the instruction
4. Create status file: `.mcp/status/antigravity_status.json`
5. Commit: `git add .mcp/status/ && git commit -m "Status update: {step} - {progress}%"`
6. Push: `git push origin master`

### Manus Monitors Progress

1. Pull latest: `git pull origin master`
2. Read: `.mcp/status/{agent}_status.json`
3. Assess progress, provide support, or post next instruction
4. Repeat

## Important Rules

✅ **DO:**
- Use JSON for structured data (instructions, status)
- Use Markdown for decisions and documentation
- Always include timestamps (ISO 8601 format)
- Always include agent name in files
- Commit with clear, descriptive messages
- Pull before reading, push after writing

❌ **DON'T:**
- Put coordination files outside `.mcp/` directory
- Use unclear file names
- Skip timestamps
- Forget to commit and push
- Mix agents in single status file
- Create files manually without structure

## Status Codes

- `pending` - Waiting to be picked up
- `received` - Agent acknowledged receipt
- `in_progress` - Agent is actively working
- `blocked` - Agent hit a blocker
- `complete` - Agent finished successfully
- `failed` - Agent encountered an error

## Example Workflow

**Day 1, 10:00 AM:**
```
Manus creates: .mcp/instructions/INSTR_001_antigravity_step6.json
Commit: "Post instruction: Step 6 - Claude Code Integration"
```

**Day 1, 10:15 AM:**
```
Antigravity pulls latest
Reads: INSTR_001_antigravity_step6.json
Begins executing Step 6
```

**Day 1, 11:00 AM:**
```
Antigravity creates: .mcp/status/antigravity_status.json
Status: in_progress, progress: 25%
Commit: "Status update: Step 6 - 25% complete"
```

**Day 1, 12:00 PM:**
```
Manus pulls latest
Reads: antigravity_status.json
Sees: 25% progress, no blockers
Satisfied with progress
```

**Day 1, 2:00 PM:**
```
Antigravity updates: .mcp/status/antigravity_status.json
Status: in_progress, progress: 75%
Commit: "Status update: Step 6 - 75% complete"
```

**Day 1, 4:00 PM:**
```
Antigravity updates: .mcp/status/antigravity_status.json
Status: complete, progress: 100%
Commit: "Status update: Step 6 - COMPLETE"
```

**Day 1, 4:15 PM:**
```
Manus pulls latest
Reads: antigravity_status.json
Sees: Step 6 complete
Creates: INSTR_002_antigravity_step7.json
Commit: "Post instruction: Step 7 - Initial Checkpoint"
```

## See Also

- `../docs/CONSTITUTION.md` - Mission and values
- `../docs/OPERATIONS.md` - How we work
- `../CLAUDE.md` - Claude Code role definition
- `../mcp/` - Local MCP server (for reference)
