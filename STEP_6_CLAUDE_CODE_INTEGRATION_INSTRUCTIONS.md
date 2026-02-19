# STEP 6: Claude Code Integration
## Explicit Instructions for Antigravity

**From:** Manus Coordination Layer  
**To:** Antigravity IDE & All Sub-Agents  
**Status:** APPROVED FOR IMMEDIATE EXECUTION  
**Priority:** HIGH  
**Timeline:** 4 hours  
**Dependency:** Step 5 ✅ COMPLETE  

---

## Executive Summary

You are being instructed to integrate Claude Code as the **Security & Quality Advisor** for indelible.Blob. This is the final step before the initial checkpoint and Phase 2 parallel execution.

Claude Code will continuously scan all pull requests for security vulnerabilities, code quality issues, and architectural consistency.

---

## Part 1: Installation & Setup (30 minutes)

### 1.1 Install Claude Code Extension

**In Antigravity IDE:**

1. Open VS Code/Antigravity
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Claude Code"
4. Click Install
5. Reload VS Code

**Verify Installation:**
```bash
code --list-extensions | grep -i claude
```

You should see Claude Code in the list.

### 1.2 Create Configuration File

**Create `.claude-code-config.json` at the project root (indelible-blob/):**

```json
{
  "projectName": "indelible.Blob",
  "projectDescription": "Decentralized truth infrastructure for visual media",
  "scanningRules": {
    "security": true,
    "codeQuality": true,
    "performance": true,
    "cryptography": true,
    "sealEncryption": true
  },
  "languages": ["typescript", "javascript", "python", "rust", "move"],
  "excludePaths": [
    "node_modules",
    "dist",
    "build",
    ".git",
    "tools/sui/sui-debug",
    "tools/sui/sui-node"
  ],
  "severityLevels": {
    "critical": "block",
    "high": "request-changes",
    "medium": "comment",
    "low": "comment"
  },
  "cryptoChecks": {
    "keyManagement": true,
    "randomNumberGeneration": true,
    "encryptionImplementation": true,
    "digitalSignatures": true,
    "sealIntegration": true
  }
}
```

**Verify:** File exists at `indelible-blob/.claude-code-config.json`

### 1.3 Verify CLAUDE.md Access

Claude Code should be able to read `CLAUDE.md` at the project root. This file contains:
- Claude Code's role definition
- Responsibilities
- Scanning standards
- Escalation procedures
- Success criteria

**Verify:** `CLAUDE.md` is readable and contains complete instructions

---

## Part 2: Security Scanning Configuration (1 hour)

### 2.1 Review Security Standards

**Read:** `docs/protocols/SECURITY_STANDARDS.md` (if exists) or create it with:

The file should define:
- Cryptographic standards (AES-256, SHA-256, etc.)
- Key management practices
- Encryption at rest and in transit
- Digital signature verification
- Seal encryption requirements
- Data protection standards
- Authentication and authorization standards
- Input validation requirements
- Error handling standards
- Logging and monitoring standards

### 2.2 Configure Cryptographic Checks

Claude Code must specifically check for:

**Critical Cryptographic Issues (Block PR):**
- Weak key generation (< 256 bits)
- Hardcoded keys or secrets
- Insecure random number generation
- Broken encryption algorithms
- Improper key management
- Missing digital signatures
- Weak hashing algorithms

**Seal Encryption Specific (Block PR):**
- User keys stored on backend (CRITICAL)
- Decryption without proper authorization
- Key leakage in logs or error messages
- Improper access control
- Missing encryption for sensitive data
- Unencrypted data transmission

**Blockchain Integration (Block PR):**
- Private key exposure
- Insecure transaction signing
- Missing nonce validation
- Improper smart contract security
- Sui Move vulnerabilities
- Solana program security issues

### 2.3 Configure Code Quality Checks

Claude Code must check for:

**Test Coverage (Request Changes if < 80%):**
- Minimum 80% coverage for all code
- 100% coverage for security-critical code
- Missing tests for cryptographic functions
- Missing edge case tests

**Code Quality (Comment):**
- Hardcoded configuration values
- Missing error handling
- Improper input validation
- Code duplication
- Inconsistent naming conventions
- Missing documentation

**Performance (Comment):**
- Inefficient algorithms
- Unnecessary allocations
- Unoptimized queries
- N+1 query problems
- Memory leaks

**Architecture (Request Changes):**
- Architectural inconsistencies
- Tight coupling
- Missing abstraction
- Violation of SOLID principles

---

## Part 3: GitHub Integration (1 hour)

### 3.1 Create GitHub Actions Workflow

**Create `.github/workflows/claude-code-scan.yml`:**

```yaml
name: Claude Code Security & Quality Scan

on:
  pull_request:
    branches: [master, develop, feature/*]
  push:
    branches: [master, develop]

jobs:
  claude-code-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Claude Code Security Scan
        run: |
          echo "🔒 Running security and quality scan..."
          echo "Scanning for:"
          echo "  - Cryptographic vulnerabilities"
          echo "  - Security issues"
          echo "  - Code quality problems"
          echo "  - Performance issues"
          echo "  - Architectural inconsistencies"

      - name: Comment on PR with findings
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🔒 Claude Code Security & Quality Scan Complete\n\n[Findings would be listed here]'
            })

      - name: Block merge if critical issues
        if: failure()
        run: exit 1
```

**Verify:** Workflow file exists at `.github/workflows/claude-code-scan.yml`

### 3.2 Configure GitHub PR Review Requirements

**In GitHub Repository Settings:**

1. Go to https://github.com/illuminatedmovement/indelible-blob/settings/branches
2. Select the `master` branch
3. Enable "Require pull request reviews before merging"
4. Set "Require status checks to pass before merging"
5. Add Claude Code scan as a required check
6. Enable "Dismiss stale pull request approvals when new commits are pushed"
7. Enable "Require code owner reviews"

**Verify:** Settings are saved and active

### 3.3 Create GitHub Issue Template for Security

**Create `.github/ISSUE_TEMPLATE/security-vulnerability.md`:**

```markdown
---
name: 🔒 Security Vulnerability
about: Report a security vulnerability
title: "[SECURITY] "
labels: security, critical
assignees: ''

---

## Vulnerability Type
- [ ] Cryptographic Issue
- [ ] Authentication/Authorization
- [ ] Data Protection
- [ ] Seal Encryption
- [ ] Blockchain Integration
- [ ] Other

## Severity
- [ ] Critical (Immediate action required)
- [ ] High (Fix within 24 hours)
- [ ] Medium (Fix within 1 week)
- [ ] Low (Fix within 1 month)

## Description
[Describe the vulnerability]

## Impact
[What could go wrong?]

## Reproduction Steps
[How to reproduce]

## Suggested Fix
[How to fix it]

## References
[Links to OWASP, CWE, or security standards]
```

**Verify:** Template file exists at `.github/ISSUE_TEMPLATE/security-vulnerability.md`

---

## Part 4: Security Baseline (1 hour)

### 4.1 Create Security Audit Log

**Create `SECURITY_AUDIT_LOG.md` at project root:**

```markdown
# Security Audit Log
## indelible.Blob

**Purpose:** Track all security findings, vulnerabilities, and remediation progress

---

## Current Status
- Last Scan: [Date]
- Critical Issues: 0
- High Priority Issues: 0
- Medium Priority Issues: 0
- Low Priority Issues: 0

---

## Findings

### [Date] - Initial Security Baseline Scan

#### Critical Issues
- None

#### High Priority Issues
- None

#### Medium Priority Issues
- None

#### Low Priority Issues
- None

---

## Remediation Progress

| Issue | Severity | Status | Assigned To | Due Date | Notes |
|-------|----------|--------|-------------|----------|-------|
| [Example] | High | In Progress | Backend Lead | [Date] | [Notes] |

---

## Monthly Trends

| Month | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Feb 2026 | 0 | 0 | 0 | 0 | 0 |

---

## Security Standards Compliance

| Standard | Status | Last Verified | Notes |
|----------|--------|---------------|-------|
| Cryptographic Standards | ✅ | [Date] | AES-256, SHA-256 |
| Key Management | ✅ | [Date] | No hardcoded keys |
| Seal Encryption | ✅ | [Date] | User-optional |
| Authentication | ✅ | [Date] | JWT-based |
| Data Protection | ✅ | [Date] | Encrypted at rest & transit |

---

## Notes
- All critical issues must be fixed before merge
- High priority issues must be fixed within 24 hours
- Monthly reviews with leadership team
- Escalate security incidents immediately
```

**Verify:** File exists at `SECURITY_AUDIT_LOG.md`

### 4.2 Run Initial Security Scan

**Execute:**

1. In Antigravity, open the indelible-blob project
2. Open Claude Code
3. Run security scan on entire codebase
4. Document all findings in `SECURITY_AUDIT_LOG.md`
5. Categorize by severity (Critical, High, Medium, Low)
6. Create remediation plan for each finding

**Expected Output:**
- List of security issues by severity
- Code locations for each issue
- Recommended fixes
- References to security standards

**Update SECURITY_AUDIT_LOG.md with:**
- Date of scan
- Number of issues by severity
- List of all findings
- Assigned remediation owners
- Due dates

### 4.3 Create Remediation Plan

For each finding:
1. Document in `SECURITY_AUDIT_LOG.md`
2. Assign to responsible sub-agent
3. Set due date based on severity:
   - Critical: Immediate (same day)
   - High: 24 hours
   - Medium: 1 week
   - Low: 1 month
4. Create GitHub issue if needed
5. Track progress

---

## Part 5: Testing & Validation (30 minutes)

### 5.1 Create Test PR

**Create a test branch:**
```bash
git checkout -b test/claude-code-validation
```

### 5.2 Make Intentional Issues

Add intentional security/quality issues to test Claude Code:

**Example 1: Hardcoded API Key**
```javascript
const API_KEY = "sk_live_abc123def456"; // INTENTIONAL - for testing
```

**Example 2: Weak Encryption**
```javascript
const cipher = crypto.createCipher('des', password); // INTENTIONAL - weak algorithm
```

**Example 3: Missing Input Validation**
```javascript
app.post('/api/transfer', (req, res) => {
  // INTENTIONAL - no validation
  const amount = req.body.amount;
  processTransfer(amount);
});
```

**Example 4: Missing Test Coverage**
```javascript
// Function with no tests
function criticalSecurityFunction(data) {
  return encrypt(data);
}
```

### 5.3 Create PR and Verify Scanning

1. Commit the test issues
2. Push to GitHub
3. Create PR against master
4. Wait for Claude Code scan to run
5. Verify Claude Code flags all issues
6. Verify feedback is clear and actionable

**Expected Results:**
- Claude Code identifies hardcoded API key
- Claude Code identifies weak encryption
- Claude Code identifies missing input validation
- Claude Code identifies missing test coverage
- Feedback explains why each is a problem
- Feedback suggests how to fix each issue

### 5.4 Verify Feedback Quality

Claude Code feedback should:
- ✅ Clearly identify the issue
- ✅ Explain why it's a problem
- ✅ Suggest how to fix it
- ✅ Reference security standards
- ✅ Be respectful and educational
- ✅ Not block PRs unnecessarily (except critical issues)

### 5.5 Test Escalation

1. Verify critical issues block PR merge
2. Verify high-priority issues request changes
3. Verify medium/low issues are comments only
4. Fix one issue and verify PR can progress

### 5.6 Clean Up

1. Delete all test issues
2. Close PR without merging
3. Delete test branch:
```bash
git checkout master
git branch -D test/claude-code-validation
```
4. Verify repository is clean

---

## Part 6: Integration with Sub-Agents (Included in Part 5)

### 6.1 Communicate Role to Each Sub-Agent

Each sub-agent should understand:

**Mobile Lead:**
- Claude Code will scan React Native code
- Focus on device security and TEEPIN integration
- Cryptographic implementation review
- Data protection on device

**Backend/Blockchain Lead:**
- Claude Code will scan Node.js API code
- Focus on API security and blockchain integration
- Key management and signing
- Sui/Solana smart contract security

**Storage/Infrastructure Lead:**
- Claude Code will scan infrastructure code
- Focus on data protection at rest
- Encryption and key management
- Deployment security

**Security/Quality Lead:**
- Claude Code will work closely with this agent
- Collaborate on security standards
- Joint code reviews
- Security training for team

**Website Lead:**
- Claude Code will scan React/Next.js code
- Focus on frontend security (XSS, CSRF)
- Data handling and protection
- Authentication/authorization

**Marketplace Lead:**
- Claude Code will scan marketplace code
- Focus on access control
- Payment security
- Data verification

---

## Success Criteria - Verification Checklist

### Installation & Setup ✅
- [ ] Claude Code installed in Antigravity
- [ ] `.claude-code-config.json` created and verified
- [ ] CLAUDE.md accessible to Claude Code
- [ ] All extensions and dependencies installed

### Security Scanning ✅
- [ ] Security scanning rules configured
- [ ] Cryptographic checks enabled
- [ ] Code quality checks enabled
- [ ] Performance checks enabled
- [ ] Seal encryption checks enabled

### GitHub Integration ✅
- [ ] `.github/workflows/claude-code-scan.yml` created
- [ ] PR review requirements configured
- [ ] Issue templates created
- [ ] Status checks blocking merges

### Security Baseline ✅
- [ ] `SECURITY_AUDIT_LOG.md` created
- [ ] Initial scan completed
- [ ] Findings documented by severity
- [ ] Remediation plan created

### Testing & Validation ✅
- [ ] Test PR created and scanned
- [ ] Feedback quality verified
- [ ] Escalation procedures tested
- [ ] Test branch deleted

### Integration ✅
- [ ] Sub-agents understand Claude Code role
- [ ] Weekly security sync scheduled
- [ ] Escalation procedures documented
- [ ] Success metrics defined

---

## Deliverables

When Step 6 is complete, provide Manus with:

1. **Confirmation:** "Step 6 Complete - Claude Code Integration Successful"
2. **Status:** All success criteria checked ✅
3. **Findings:** Summary of initial security scan
4. **Remediation Plan:** Issues assigned and due dates set
5. **Verification:** Test PR successfully scanned and deleted

---

## Timeline

- **Start:** Immediately upon receipt
- **Part 1 (Installation):** 30 minutes
- **Part 2 (Configuration):** 1 hour
- **Part 3 (GitHub Integration):** 1 hour
- **Part 4 (Security Baseline):** 1 hour
- **Part 5 (Testing):** 30 minutes
- **Total:** 4 hours

**Target Completion:** Within 4 hours

---

## Escalation

If you encounter issues:

1. Check `CLAUDE_CODE_INTEGRATION_GUIDE.md` troubleshooting section
2. Reference `CLAUDE.md` for role definition
3. Review `docs/protocols/SECURITY_STANDARDS.md`
4. Escalate to Manus if blockers arise

---

## Next Steps After Completion

Once Step 6 is complete:

1. ✅ Notify Manus: "Step 6 Complete"
2. ⏳ Manus executes Step 7: Create Initial Checkpoint
3. ⏳ Phase 2 begins: Parallel execution across all agents

---

## Questions?

Refer to:
- `CLAUDE.md` - Claude Code role and standards
- `CLAUDE_CODE_INTEGRATION_GUIDE.md` - Detailed integration guide
- `docs/protocols/SECURITY_STANDARDS.md` - Security standards
- `docs/CONSTITUTION.md` - Mission and values

---

**Execute with excellence. Build trustworthy infrastructure.** 🔒
