#!/usr/bin/env bash
# Reinstall skills + MCP servers into Claude Code (user scope).
set -euo pipefail
cd "$(dirname "$0")"
python3 -I build.py ~/.claude/skills
claude mcp get filesystem >/dev/null 2>&1 || \
  claude mcp add -s user filesystem -- npx -y @modelcontextprotocol/server-filesystem@2026.8.31 "${FS_ROOT:-$HOME}"
# GitHub MCP (official remote server) - only when a token is provided:
if [ -n "${GITHUB_PAT:-}" ]; then
  claude mcp get github >/dev/null 2>&1 || claude mcp add -s user --transport http github \
    https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer ${GITHUB_PAT}"
fi
claude mcp list
