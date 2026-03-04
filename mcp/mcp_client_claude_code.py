#!/usr/bin/env python3
"""
MCP Client for Claude Code

This client enables Claude Code to:
1. Get scanning rules and configurations
2. Retrieve shared resources (standards, decisions, guides)
3. Report security findings and vulnerabilities
4. Escalate critical security issues
5. Get task assignments and PR reviews

Claude Code's role: Security & Quality Advisor
- Scans all PRs for security issues
- Audits code quality
- Reviews architectural decisions
- Ensures Seal encryption integration
- Maintains security standards

Usage:
    python mcp_client_claude_code.py get-config
    python mcp_client_claude_code.py get-resources --type "standard"
    python mcp_client_claude_code.py report-findings --pr "123" --severity "high"
    python mcp_client_claude_code.py escalate --severity "critical" --title "SQL Injection vulnerability"
"""

import json
import argparse
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# Import the MCP server
sys.path.insert(0, '/home/ubuntu')
from mcp_server import MCPServer


class ClaudeCodeMCPClient:
    """MCP Client for Claude Code"""

    def __init__(self, agent_name: str = "claude-code"):
        self.agent_name = agent_name
        self.server = MCPServer()
        self.local_state_file = Path.home() / ".claude_code_mcp_state.json"
        self.local_state = self._load_local_state()

    def _load_local_state(self) -> Dict[str, Any]:
        """Load local state about current scanning work"""
        if self.local_state_file.exists():
            with open(self.local_state_file, 'r') as f:
                return json.load(f)
        return {
            "agent": self.agent_name,
            "role": "Security & Quality Advisor",
            "current_task": None,
            "last_scan": None,
            "findings_reported": [],
            "escalations_filed": []
        }

    def _save_local_state(self) -> None:
        """Save local state"""
        with open(self.local_state_file, 'w') as f:
            json.dump(self.local_state, f, indent=2)

    def get_config(self) -> None:
        """Get Claude Code configuration and scanning rules"""
        print("⚙️  Retrieving Claude Code configuration...")
        print("\n📋 Claude Code Configuration:")
        print("=" * 60)

        config = {
            "agent": self.agent_name,
            "role": "Security & Quality Advisor",
            "version": "1.0.0",
            "scanning_rules": {
                "critical": {
                    "sql_injection": "Check for SQL injection vulnerabilities",
                    "xss": "Check for cross-site scripting vulnerabilities",
                    "authentication": "Verify authentication mechanisms",
                    "authorization": "Verify authorization checks",
                    "cryptography": "Verify cryptographic implementations",
                    "secrets": "Scan for exposed secrets/API keys",
                    "seal_encryption": "Verify Seal encryption integration"
                },
                "high": {
                    "input_validation": "Check input validation",
                    "error_handling": "Check error handling",
                    "logging": "Check secure logging",
                    "dependencies": "Check dependency vulnerabilities",
                    "access_control": "Check access control",
                    "data_protection": "Check data protection measures"
                },
                "medium": {
                    "code_quality": "Check code quality standards",
                    "test_coverage": "Check test coverage (>80%)",
                    "documentation": "Check security documentation",
                    "performance": "Check performance issues",
                    "best_practices": "Check against best practices"
                }
            },
            "pr_review_checklist": [
                "Security: No vulnerabilities",
                "Quality: Code quality standards met",
                "Tests: Coverage > 80%",
                "Documentation: Changes documented",
                "Seal: Encryption integration correct",
                "Dependencies: No vulnerable dependencies",
                "Secrets: No secrets exposed",
                "Architecture: Follows design patterns"
            ],
            "escalation_triggers": [
                "SQL injection vulnerability",
                "XSS vulnerability",
                "Authentication bypass",
                "Authorization bypass",
                "Cryptographic weakness",
                "Exposed secrets",
                "Critical dependency vulnerability",
                "Seal encryption misconfiguration"
            ]
        }

        for section, content in config.items():
            if section in ["agent", "role", "version"]:
                print(f"{section.upper()}: {content}")
            elif isinstance(content, dict):
                print(f"\n{section.upper()}:")
                for key, value in content.items():
                    if isinstance(value, dict):
                        print(f"  {key}:")
                        for subkey, subvalue in value.items():
                            print(f"    - {subkey}: {subvalue}")
                    else:
                        print(f"  - {key}: {value}")
            elif isinstance(content, list):
                print(f"\n{section.upper()}:")
                for item in content:
                    print(f"  - {item}")

        print("\n" + "=" * 60)

    def get_resources(self, resource_type: Optional[str] = None) -> None:
        """Retrieve shared resources from Manus"""
        print(f"📚 Retrieving shared resources...")

        result = self.server.handle_tool_call("get_shared_resources", {
            "agent_name": self.agent_name,
            "resource_type": resource_type
        })

        if result.get("total", 0) == 0:
            print("✅ No resources available yet")
            print("\nShared resources will include:")
            print("  - CONSTITUTION.md (mission and values)")
            print("  - OPERATIONS.md (how we work)")
            print("  - TECHNICAL_ARCHITECTURE.md (system design)")
            print("  - AGENT_PLAYBOOKS.md (role definitions)")
            print("  - SECURITY_STANDARDS.md (security requirements)")
            print("  - GIT_WORKFLOW.md (development process)")
            return

        print(f"\n✅ Found {result['total']} resource(s):\n")

        for resource in result.get("resources", []):
            print(f"📄 {resource['name']}")
            print(f"   Type: {resource['type']}")
            print(f"   Version: {resource['version']}")
            print(f"   Updated: {resource['last_updated']}")
            if 'path' in resource:
                print(f"   Path: {resource['path']}")
            print()

    def report_findings(self, pr_number: str, severity: str, findings: List[str],
                       remediation: Optional[str] = None) -> None:
        """Report security findings from PR review"""
        print(f"🔍 Reporting findings for PR #{pr_number}...")

        summary = f"PR #{pr_number}: {severity.upper()} - {len(findings)} finding(s)"

        result = self.server.handle_tool_call("report_status", {
            "agent_name": self.agent_name,
            "step_number": f"PR-REVIEW-{pr_number}",
            "status": "in_progress",
            "progress_percentage": 100,
            "summary": summary,
            "findings": {
                "pr_number": pr_number,
                "severity": severity,
                "findings": findings,
                "remediation": remediation or "See findings for details",
                "timestamp": datetime.now().isoformat()
            }
        })

        if result.get("success"):
            print(f"✅ Findings reported for PR #{pr_number}")
            print(f"   Severity: {severity.upper()}")
            print(f"   Findings: {len(findings)}")
            if remediation:
                print(f"   Remediation: {remediation}")
            self.local_state["findings_reported"].append({
                "pr": pr_number,
                "severity": severity,
                "count": len(findings),
                "reported_at": datetime.now().isoformat()
            })
            self._save_local_state()
        else:
            print(f"❌ Error: {result.get('message')}")

    def escalate_vulnerability(self, severity: str, title: str, description: str,
                              cve: Optional[str] = None,
                              remediation: Optional[str] = None,
                              affected_code: Optional[str] = None) -> None:
        """Escalate a security vulnerability"""
        print(f"🚨 Escalating {severity.upper()} vulnerability: {title}")

        impact = f"CVE: {cve}\n" if cve else ""
        impact += f"Affected code: {affected_code}" if affected_code else ""

        result = self.server.handle_tool_call("escalate_issue", {
            "agent_name": self.agent_name,
            "severity": severity,
            "issue_title": title,
            "description": description,
            "impact": impact or "Security vulnerability detected",
            "recommendation": remediation or "Immediate review and remediation required",
            "timestamp": datetime.now().isoformat()
        })

        if result.get("success"):
            print(f"✅ {result['message']}")
            print(f"   Escalation ID: {result['escalation_id']}")
            self.local_state["escalations_filed"].append({
                "id": result['escalation_id'],
                "severity": severity,
                "title": title,
                "filed_at": datetime.now().isoformat()
            })
            self._save_local_state()
        else:
            print(f"❌ Error: {result.get('message')}")

    def get_status(self) -> None:
        """Get current status from Manus"""
        print(f"📊 Checking Claude Code status with Manus...")

        result = self.server.handle_tool_call("get_agent_status", {
            "agent_name": self.agent_name
        })

        status = result.get("status", {})
        print(f"\n✅ Claude Code Status:")
        print(f"   Agent: {status.get('name', 'Claude Code')}")
        print(f"   Role: Security & Quality Advisor")
        print(f"   Status: {status.get('status', 'ready')}")
        print(f"   Current Task: {status.get('current_step', 'None')}")
        print(f"   Last Update: {status.get('last_status_update', 'Never')}")
        print()

        print(f"📈 Local Statistics:")
        print(f"   Findings Reported: {len(self.local_state['findings_reported'])}")
        print(f"   Escalations Filed: {len(self.local_state['escalations_filed'])}")
        print()

    def show_help(self) -> None:
        """Show help message"""
        help_text = """
🔐 Claude Code MCP Client - Commands

CONFIGURATION & RESOURCES:
  get-config                    Get Claude Code configuration and scanning rules
  get-resources                 Get shared resources from Manus
    --type TYPE                 Resource type (document, configuration, standard, guide)

FINDINGS & REPORTS:
  report-findings               Report security findings from PR review
    --pr PR_NUMBER              Pull request number
    --severity LEVEL            Severity (low, medium, high, critical)
    --findings ITEM1,ITEM2      Comma-separated list of findings
    --remediation TEXT          Remediation steps

ESCALATION:
  escalate                      Escalate a security vulnerability
    --severity LEVEL            Severity (low, medium, high, critical)
    --title TITLE               Vulnerability title
    --description DESC          Detailed description
    --cve CVE_ID                CVE identifier (optional)
    --remediation TEXT          Remediation steps
    --affected-code CODE        Affected code location

STATUS:
  get-status                    Get current status from Manus
  help                          Show this help message

EXAMPLES:
  python mcp_client_claude_code.py get-config
  python mcp_client_claude_code.py get-resources --type "standard"
  python mcp_client_claude_code.py report-findings --pr "123" --severity "high" \\
    --findings "Missing input validation,Weak encryption" \\
    --remediation "Add input validation and use AES-256"
  python mcp_client_claude_code.py escalate --severity "critical" \\
    --title "SQL Injection in user_query" \\
    --description "User input not sanitized in database query" \\
    --cve "CVE-2024-XXXXX" \\
    --remediation "Use parameterized queries"
"""
        print(help_text)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Claude Code MCP Client for security and quality coordination",
        add_help=False
    )

    parser.add_argument("command", nargs="?", default="help",
                       help="Command to execute")
    parser.add_argument("--type", help="Resource type")
    parser.add_argument("--pr", help="Pull request number")
    parser.add_argument("--severity", help="Issue severity")
    parser.add_argument("--findings", help="Comma-separated findings")
    parser.add_argument("--remediation", help="Remediation steps")
    parser.add_argument("--title", help="Issue title")
    parser.add_argument("--description", help="Issue description")
    parser.add_argument("--cve", help="CVE identifier")
    parser.add_argument("--affected-code", help="Affected code location")

    args = parser.parse_args()

    client = ClaudeCodeMCPClient()

    if args.command == "get-config":
        client.get_config()

    elif args.command == "get-resources":
        client.get_resources(args.type)

    elif args.command == "report-findings":
        if not args.pr or not args.severity or not args.findings:
            print("❌ Error: --pr, --severity, and --findings are required")
            sys.exit(1)
        findings = [f.strip() for f in args.findings.split(",")]
        client.report_findings(args.pr, args.severity, findings, args.remediation)

    elif args.command == "escalate":
        if not args.severity or not args.title or not args.description:
            print("❌ Error: --severity, --title, and --description are required")
            sys.exit(1)
        client.escalate_vulnerability(
            args.severity, args.title, args.description,
            args.cve, args.remediation, args.affected_code
        )

    elif args.command == "get-status":
        client.get_status()

    elif args.command == "help":
        client.show_help()

    else:
        print(f"❌ Unknown command: {args.command}")
        client.show_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
