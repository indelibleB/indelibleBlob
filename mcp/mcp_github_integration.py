#!/usr/bin/env python3
"""
GitHub Integration for MCP Server

Provides values-aligned persistence by:
1. Storing all coordination data in GitHub
2. Maintaining full audit trail
3. Enabling decentralized access
4. Ensuring transparency and auditability

All data is stored in /mcp-data/ directory in the repository.
Every change is committed with a clear message.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from github import Github, GithubException


class GitHubMCPIntegration:
    """Handles GitHub persistence for MCP coordination data"""

    def __init__(self, repo_path: str = "illuminatedmovement/indelible-blob",
                 github_token: Optional[str] = None,
                 local_cache_dir: Optional[Path] = None):
        """
        Initialize GitHub integration

        Args:
            repo_path: GitHub repository path (owner/repo)
            github_token: GitHub personal access token (or use GITHUB_TOKEN env var)
            local_cache_dir: Local directory for caching data
        """
        self.repo_path = repo_path
        self.github_token = github_token or os.getenv("GITHUB_TOKEN")
        self.local_cache_dir = local_cache_dir or Path.home() / ".mcp-data-cache"
        self.local_cache_dir.mkdir(parents=True, exist_ok=True)

        # Initialize GitHub connection
        self.gh = Github(self.github_token) if self.github_token else None
        self.repo = None

        if self.gh:
            try:
                self.repo = self.gh.get_repo(repo_path)
                print(f"✅ Connected to GitHub: {repo_path}")
            except GithubException as e:
                print(f"⚠️  Could not connect to GitHub: {e}")
                print("   Falling back to local cache only")

    def _get_local_cache_path(self, filename: str) -> Path:
        """Get local cache path for a file"""
        return self.local_cache_dir / filename

    def _get_github_path(self, filename: str) -> str:
        """Get GitHub path for a file"""
        return f"mcp-data/{filename}"

    def load_data(self, filename: str) -> Dict[str, Any]:
        """
        Load data from GitHub (or local cache if offline)

        Values alignment:
        - Tries GitHub first (decentralized source of truth)
        - Falls back to local cache (resilience)
        - Maintains transparency (all data is readable)
        """
        # Try GitHub first
        if self.repo:
            try:
                github_path = self._get_github_path(filename)
                file_content = self.repo.get_contents(github_path)
                data = json.loads(file_content.decoded_content)

                # Update local cache
                local_path = self._get_local_cache_path(filename)
                with open(local_path, 'w') as f:
                    json.dump(data, f, indent=2)

                return data
            except GithubException:
                pass

        # Fall back to local cache
        local_path = self._get_local_cache_path(filename)
        if local_path.exists():
            with open(local_path, 'r') as f:
                return json.load(f)

        # Return empty structure if nothing exists
        return {}

    def save_data(self, filename: str, data: Dict[str, Any],
                  commit_message: str = "Update MCP coordination data") -> bool:
        """
        Save data to GitHub (and local cache)

        Values alignment:
        - Commits to GitHub with clear message (transparency)
        - Maintains full history (auditability)
        - Includes timestamp (traceability)
        - Falls back gracefully if offline
        """
        # Always save to local cache
        local_path = self._get_local_cache_path(filename)
        with open(local_path, 'w') as f:
            json.dump(data, f, indent=2)

        # Try to commit to GitHub
        if not self.repo:
            print(f"⚠️  Offline mode: Saved to local cache only ({filename})")
            return False

        try:
            github_path = self._get_github_path(filename)
            content_json = json.dumps(data, indent=2)

            # Check if file exists
            try:
                existing_file = self.repo.get_contents(github_path)
                # Update existing file
                self.repo.update_file(
                    path=github_path,
                    message=f"{commit_message} - {datetime.now().isoformat()}",
                    content=content_json,
                    sha=existing_file.sha
                )
            except GithubException:
                # Create new file
                self.repo.create_file(
                    path=github_path,
                    message=f"{commit_message} - {datetime.now().isoformat()}",
                    content=content_json
                )

            print(f"✅ Saved to GitHub: {github_path}")
            return True

        except GithubException as e:
            print(f"⚠️  Could not save to GitHub: {e}")
            print(f"   Saved to local cache: {local_path}")
            return False

    def get_audit_log(self) -> list:
        """Get full audit log of all changes from GitHub"""
        if not self.repo:
            return []

        try:
            commits = self.repo.get_commits(path="mcp-data/")
            audit_log = []

            for commit in commits:
                audit_log.append({
                    "timestamp": commit.commit.author.date.isoformat(),
                    "author": commit.commit.author.name,
                    "message": commit.commit.message,
                    "sha": commit.sha[:8]
                })

            return audit_log
        except GithubException:
            return []

    def sync_from_github(self) -> bool:
        """Sync all MCP data from GitHub to local cache"""
        if not self.repo:
            print("⚠️  Not connected to GitHub")
            return False

        try:
            # List all files in mcp-data directory
            contents = self.repo.get_contents("mcp-data/")

            for item in contents:
                if item.type == "file" and item.name.endswith(".json"):
                    data = json.loads(item.decoded_content)
                    local_path = self._get_local_cache_path(item.name)
                    with open(local_path, 'w') as f:
                        json.dump(data, f, indent=2)
                    print(f"✅ Synced: {item.name}")

            return True
        except GithubException as e:
            print(f"❌ Sync failed: {e}")
            return False

    def create_backup(self, backup_name: Optional[str] = None) -> bool:
        """Create a backup of all MCP data"""
        if not self.repo:
            print("⚠️  Not connected to GitHub")
            return False

        backup_name = backup_name or f"backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        try:
            # Get all files from mcp-data
            contents = self.repo.get_contents("mcp-data/")
            backup_dir = f"mcp-backups/{backup_name}"

            for item in contents:
                if item.type == "file":
                    # Copy to backup directory
                    self.repo.create_file(
                        path=f"{backup_dir}/{item.name}",
                        message=f"Backup: {backup_name}",
                        content=item.decoded_content
                    )

            print(f"✅ Backup created: {backup_name}")
            return True
        except GithubException as e:
            print(f"❌ Backup failed: {e}")
            return False

    def get_status(self) -> Dict[str, Any]:
        """Get status of GitHub integration"""
        status = {
            "connected": self.repo is not None,
            "repository": self.repo_path if self.repo else "Not connected",
            "local_cache_dir": str(self.local_cache_dir),
            "cache_files": len(list(self.local_cache_dir.glob("*.json")))
        }

        if self.repo:
            try:
                status["github_status"] = "✅ Connected"
                status["last_commit"] = self.repo.get_commits()[0].commit.author.date.isoformat()
            except:
                status["github_status"] = "⚠️  Connected but unable to fetch commits"

        return status
