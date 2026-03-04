#!/usr/bin/env python3
"""
MCP Client for Antigravity IDE

This client enables Antigravity to:
1. Get pending instructions from Manus
2. Report status updates to Manus
3. Retrieve shared resources (documents, standards, configs)
4. Escalate issues to Manus
5. Mark instructions as received

Usage:
    python mcp_client_antigravity.py get-instructions
    python mcp_client_antigravity.py report-status --step "Step 6" --status "in_progress" --progress 50
    python mcp_client_antigravity.py get-resources --type "document"
    python mcp_client_antigravity.py escalate --severity "high" --title "Build broken"
"""

import json
import argparse
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# Import the MCP server (assumes it's in the same directory or Python path)
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from mcp_server_enhanced import EnhancedMCPServer
except ImportError:
    # Fallback to mcp_server if enhanced is not available
    try:
        from mcp_server import MCPServer as EnhancedMCPServer
    except ImportError:
        print("❌ Error: Could not import mcp_server_enhanced or mcp_server")
        sys.exit(1)


class AntigravityMCPClient:
    """MCP Client for Antigravity"""

    def __init__(self, agent_name: str = "antigravity"):
        self.agent_name = agent_name
        self.server = EnhancedMCPServer()
        self.local_state_file = Path.home() / ".antigravity_mcp_state.json"
        self.local_state = self._load_local_state()

    def _load_local_state(self) -> Dict[str, Any]:
        """Load local state about current work"""
        if self.local_state_file.exists():
            with open(self.local_state_file, 'r') as f:
                return json.load(f)
        return {
            "agent": self.agent_name,
            "current_step": None,
            "last_status_update": None,
            "instructions_received": []
        }

    def _save_local_state(self) -> None:
        """Save local state"""
        with open(self.local_state_file, 'w') as f:
            json.dump(self.local_state, f, indent=2)

    def get_instructions(self) -> None:
        """Get pending instructions from Manus"""
        print("📋 Fetching pending instructions from Manus...")

        result = self.server.handle_tool_call("get_pending_instructions", {
            "agent_name": self.agent_name
        })

        if result.get("pending_count", 0) == 0:
            print("✅ No pending instructions")
            return

        print(f"\n✅ Found {result['pending_count']} pending instruction(s):\n")

        for instr in result.get("instructions", []):
            print(f"📌 {instr['step_number']}: {instr['title']}")
            print(f"   Priority: {instr['priority']}")
            print(f"   Timeline: {instr.get('timeline_hours', 'N/A')} hours")
            if instr.get('dependencies'):
                print(f"   Dependencies: {', '.join(instr['dependencies'])}")
            print(f"   ID: {instr['id']}")
            print()

        # Mark first instruction as received
        if result.get("instructions"):
            first_instr = result["instructions"][0]
            self.mark_instruction_received(
                first_instr["step_number"],
                first_instr["id"]
            )

    def mark_instruction_received(self, step_number: str, instruction_id: str) -> None:
        """Mark an instruction as received"""
        print(f"✅ Marking {step_number} as received...")

        result = self.server.handle_tool_call("mark_instruction_received", {
            "step_number": step_number,
            "agent_name": self.agent_name,
            "timestamp": datetime.now().isoformat()
        })

        if result.get("success"):
            print(f"✅ {result['message']}")
            self.local_state["current_step"] = step_number
            self.local_state["instructions_received"].append({
                "step": step_number,
                "id": instruction_id,
                "received_at": datetime.now().isoformat()
            })
            self._save_local_state()
        else:
            print(f"❌ Error: {result.get('message')}")

    def report_status(self, step_number: str, status: str, progress: int = 0,
                     summary: Optional[str] = None, blockers: Optional[List[str]] = None) -> None:
        """Report status to Manus"""
        print(f"📊 Reporting status for {step_number}...")

        result = self.server.handle_tool_call("report_status", {
            "agent_name": self.agent_name,
            "step_number": step_number,
            "status": status,
            "progress_percentage": progress,
            "summary": summary or f"{status.replace('_', ' ').title()}",
            "blockers": blockers or []
        })

        if result.get("success"):
            print(f"✅ {result['message']}")
            self.local_state["last_status_update"] = datetime.now().isoformat()
            self._save_local_state()
        else:
            print(f"❌ Error: {result.get('message')}")

    def get_resources(self, resource_type: Optional[str] = None) -> None:
        """Retrieve shared resources from Manus"""
        print(f"📚 Retrieving shared resources...")

        result = self.server.handle_tool_call("get_shared_resources", {
            "agent_name": self.agent_name,
            "resource_type": resource_type
        })

        if result.get("total", 0) == 0:
            print("✅ No resources available")
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

    def escalate_issue(self, severity: str, title: str, description: str,
                      impact: Optional[str] = None,
                      recommendation: Optional[str] = None) -> None:
        """Escalate an issue to Manus"""
        print(f"🚨 Escalating {severity} issue: {title}")

        result = self.server.handle_tool_call("escalate_issue", {
            "agent_name": self.agent_name,
            "severity": severity,
            "issue_title": title,
            "description": description,
            "impact": impact or "Unknown",
            "recommendation": recommendation or "Awaiting guidance",
            "timestamp": datetime.now().isoformat()
        })

        if result.get("success"):
            print(f"✅ {result['message']}")
            print(f"   Escalation ID: {result['escalation_id']}")
        else:
            print(f"❌ Error: {result.get('message')}")

    def get_status(self) -> None:
        """Get current status from Manus"""
        print(f"📊 Checking status with Manus...")

        result = self.server.handle_tool_call("get_agent_status", {
            "agent_name": self.agent_name
        })

        status = result.get("status", {})
        print(f"\n✅ Current Status:")
        print(f"   Agent: {status.get('name', 'Unknown')}")
        print(f"   Current Step: {status.get('current_step', 'None')}")
        print(f"   Status: {status.get('status', 'Unknown')}")
        print(f"   Progress: {status.get('progress_percentage', 0)}%")
        print(f"   Summary: {status.get('summary', 'N/A')}")
        if status.get('blockers'):
            print(f"   Blockers: {', '.join(status['blockers'])}")
        print()

    def show_help(self) -> None:
        """Show help message"""
        help_text = """
🦅 Antigravity MCP Client - Commands

INSTRUCTION MANAGEMENT:
  get-instructions              Get pending instructions from Manus
  mark-received STEP_ID         Mark an instruction as received

STATUS REPORTING:
  report-status                 Report current status to Manus
    --step STEP_NUM             Step number (e.g., "Step 6")
    --status STATUS             Status (in_progress, blocked, complete, failed)
    --progress PERCENT          Progress percentage (0-100)
    --summary TEXT              Brief summary of progress
    --blockers ITEM1,ITEM2      Comma-separated list of blockers

RESOURCE MANAGEMENT:
  get-resources                 Get shared resources from Manus
    --type TYPE                 Resource type (document, configuration, standard, guide)

ESCALATION:
  escalate                      Escalate an issue to Manus
    --severity LEVEL            Severity (low, medium, high, critical)
    --title TITLE               Issue title
    --description DESC          Issue description
    --impact IMPACT             Impact description
    --recommendation REC        Recommended action

STATUS:
  get-status                    Get current status from Manus
  help                          Show this help message

EXAMPLES:
  python mcp_client_antigravity.py get-instructions
  python mcp_client_antigravity.py report-status --step "Step 6" --status "in_progress" --progress 50
  python mcp_client_antigravity.py get-resources --type "document"
  python mcp_client_antigravity.py escalate --severity "high" --title "Build broken" --description "Metro bundler failing"
"""
        print(help_text)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Antigravity MCP Client for communicating with Manus",
        add_help=False
    )

    parser.add_argument("command", nargs="?", default="help",
                       help="Command to execute")
    parser.add_argument("--step", help="Step number")
    parser.add_argument("--status", help="Status (in_progress, blocked, complete, failed)")
    parser.add_argument("--progress", type=int, default=0, help="Progress percentage")
    parser.add_argument("--summary", help="Status summary")
    parser.add_argument("--blockers", help="Comma-separated blockers")
    parser.add_argument("--type", help="Resource type")
    parser.add_argument("--severity", help="Issue severity")
    parser.add_argument("--title", help="Issue title")
    parser.add_argument("--description", help="Issue description")
    parser.add_argument("--impact", help="Issue impact")
    parser.add_argument("--recommendation", help="Recommended action")

    args = parser.parse_args()

    client = AntigravityMCPClient()

    if args.command == "get-instructions":
        client.get_instructions()

    elif args.command == "report-status":
        if not args.step or not args.status:
            print("❌ Error: --step and --status are required")
            sys.exit(1)
        blockers = args.blockers.split(",") if args.blockers else None
        client.report_status(args.step, args.status, args.progress, args.summary, blockers)

    elif args.command == "get-resources":
        client.get_resources(args.type)

    elif args.command == "escalate":
        if not args.severity or not args.title or not args.description:
            print("❌ Error: --severity, --title, and --description are required")
            sys.exit(1)
        client.escalate_issue(args.severity, args.title, args.description,
                            args.impact, args.recommendation)

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
